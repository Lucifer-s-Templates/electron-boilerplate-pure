import { ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { readdir, stat, access, writeFile, mkdtemp, rmdir, unlink, open } from 'fs/promises'
import { createReadStream } from 'fs'
import { homedir, tmpdir } from 'os'
import { createHash } from 'crypto'
import { fileTypeFilters, getFileType } from '../utils/fileType.js'
import { fileTypeGroups } from '@shared/fileTypeConfig.js'

// 注册文件相关 IPC 处理器
export function registerFileHandlers(app) {
  // 打开文件选择对话框
  ipcMain.handle('open-files', async (_, { defaultPath, fileTypes = [] }) => {
    // 构建过滤器
    let filters = []

    if (!fileTypes || fileTypes.length === 0) {
      // 默认允许所有文件
      filters = [fileTypeFilters.all]
    } else {
      // 根据传入的类型构建过滤器
      const typeList = Array.isArray(fileTypes) ? fileTypes : [fileTypes]

      for (const type of typeList) {
        if (fileTypeFilters[type]) {
          filters.push(fileTypeFilters[type])
        }
      }

      // 如果没有匹配的类型，默认允许所有文件
      if (filters.length === 0) {
        filters = [fileTypeFilters.all]
      }
    }

    const result = await dialog.showOpenDialog({
      defaultPath,
      properties: ['openFile', 'multiSelections'],
      filters
    })

    // 过滤掉快捷方式文件(.lnk)
    if (!result.canceled && result.filePaths.length > 0) {
      result.filePaths = result.filePaths.filter(filePath => {
        const ext = filePath.split('.').pop()?.toLowerCase()
        return ext !== 'lnk'
      })
    }

    return result
  })

  // 获取系统特殊路径
  ipcMain.handle('get-system-paths', () => {
    return {
      desktop: app.getPath('desktop'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
      videos: app.getPath('videos'),
      pictures: app.getPath('pictures'),
      music: app.getPath('music'),
      home: app.getPath('home'),
      temp: app.getPath('temp')
    }
  })

  // 检查盘符是否存在
  async function checkDriveExists(drive) {
    try {
      await access(drive + ':\\')
      return true
    } catch {
      return false
    }
  }

  // 获取允许的文件扩展名列表
  function getAllowedExtensions(fileTypes) {
    if (!fileTypes || fileTypes.length === 0) {
      return null // 允许所有文件
    }

    const extensions = []
    for (const type of fileTypes) {
      if (fileTypeGroups[type]) {
        extensions.push(...fileTypeGroups[type])
      }
    }
    return extensions.length > 0 ? extensions : null
  }

  // 检查文件扩展名是否匹配
  function isExtensionMatch(fileName, allowedExtensions) {
    if (!allowedExtensions) {
      return true // 未限制类型，允许所有文件
    }
    const ext = fileName.split('.').pop()?.toLowerCase()
    return allowedExtensions.includes(ext)
  }

  // 递归搜索文件
  async function searchFiles(
    dir,
    keyword,
    fileTypes,
    results = [],
    foundPaths = new Set(),
    depth = 0
  ) {
    const maxDepth = 3 // 最大递归深度
    const maxResults = 50 // 最大结果数

    if (depth > maxDepth || results.length >= maxResults) {
      return results
    }

    // 获取允许的文件扩展名列表
    const allowedExtensions = getAllowedExtensions(fileTypes)

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (results.length >= maxResults) break

        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          // 跳过隐藏文件夹和系统文件夹
          if (
            !entry.name.startsWith('.') &&
            !['node_modules', 'AppData', 'Program Files', 'Windows'].includes(entry.name)
          ) {
            await searchFiles(fullPath, keyword, fileTypes, results, foundPaths, depth + 1)
          }
        } else if (entry.isFile()) {
          // 检查文件名是否包含关键字，并且没有去重，并且文件类型匹配
          if (
            entry.name.toLowerCase().includes(keyword.toLowerCase()) &&
            !foundPaths.has(fullPath) &&
            isExtensionMatch(entry.name, allowedExtensions)
          ) {
            try {
              const fileStat = await stat(fullPath)
              const type = getFileType(fullPath)
              foundPaths.add(fullPath)
              results.push({
                name: entry.name,
                type,
                size: fileStat.size,
                path: fullPath,
                modifiedTime: fileStat.mtime
              })
            } catch (e) {
              // 忽略无法访问的文件
            }
          }
        }
      }
    } catch (e) {
      // 忽略无法访问的目录
    }

    return results
  }

  // 搜索本机文件
  ipcMain.handle('search-files', async (_, { keyword, fileTypes = [] }) => {
    if (!keyword || keyword.trim() === '') {
      return []
    }

    // 基础搜索路径
    const searchPaths = [
      app.getPath('desktop'),
      app.getPath('documents'),
      app.getPath('downloads'),
      homedir()
    ]

    // 检查CDEF盘是否存在，存在则添加
    const drives = ['C', 'D', 'E', 'F']
    for (const drive of drives) {
      if (await checkDriveExists(drive)) {
        const drivePath = `${drive}:\\`
        if (!searchPaths.includes(drivePath)) {
          searchPaths.push(drivePath)
        }
      }
    }

    const allResults = []
    const searchedDirs = new Set()
    const foundPaths = new Set() // 用于去重

    for (const searchPath of searchPaths) {
      if (searchedDirs.has(searchPath)) continue
      searchedDirs.add(searchPath)

      await searchFiles(searchPath, keyword, fileTypes, allResults, foundPaths)
      if (allResults.length >= 50) break
    }

    // 按修改时间排序，最新的在前
    allResults.sort((a, b) => b.modifiedTime - a.modifiedTime)

    return allResults.slice(0, 50)
  })

  // 打开文件（使用系统默认程序）
  ipcMain.handle('open-file', async (_, filePath) => {
    try {
      await shell.openPath(filePath)
      return { success: true }
    } catch (error) {
      console.error('打开文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 在文件资源管理器中显示文件
  ipcMain.handle('show-item-in-folder', async (_, filePath) => {
    try {
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error) {
      console.error('在文件资源管理器中显示文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取文件信息
  ipcMain.handle('get-file-info', async (_, filePath) => {
    try {
      const fileStat = await stat(filePath)
      const type = getFileType(filePath)
      return {
        success: true,
        fileInfo: {
          type,
          size: fileStat.size,
          modifiedTime: fileStat.mtime,
          isFile: fileStat.isFile(),
          isDirectory: fileStat.isDirectory()
        },
        message: '文件信息获取成功'
      }
    } catch (error) {
      console.error('文件信息获取失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 创建 TXT 文件
  ipcMain.handle('create-txt-file', async (_, { fileName, content }) => {
    try {
      // 使用系统临时目录
      const tempDir = await mkdtemp(join(tmpdir(), 'jkc-electron-'))
      const filePath = join(tempDir, `${fileName}.txt`)

      // 写入文件内容
      await writeFile(filePath, content, 'utf-8')

      // 获取文件信息
      const fileStat = await stat(filePath)

      return {
        success: true,
        fileInfo: {
          name: `${fileName}.txt`,
          type: getFileType(filePath),
          size: fileStat.size,
          path: filePath
        }
      }
    } catch (error) {
      console.error('创建 TXT 文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 计算文件的MD5值
  ipcMain.handle('calculate-md5', async (_, filePath) => {
    try {
      const md5 = await calculateMD5(filePath)
      return { success: true, md5 }
    } catch (error) {
      console.error('计算MD5失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 创建临时目录
  ipcMain.handle('create-temp-dir', async (_, prefix = 'temp') => {
    try {
      const tempDir = await mkdtemp(join(tmpdir(), `${prefix}-`))
      return { success: true, path: tempDir }
    } catch (error) {
      console.error('创建临时目录失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 清理临时目录
  ipcMain.handle('cleanup-temp-dir', async (_, dirPath) => {
    try {
      // 读取目录内容
      const files = await readdir(dirPath)

      // 删除所有文件
      for (const file of files) {
        const filePath = join(dirPath, file)
        const fileStat = await stat(filePath)
        if (fileStat.isFile()) {
          await unlink(filePath)
        }
      }

      // 删除目录
      await rmdir(dirPath)

      return { success: true }
    } catch (error) {
      console.error('清理临时目录失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 删除文件
  ipcMain.handle('delete-file', async (_, filePath) => {
    try {
      await unlink(filePath)
      return { success: true }
    } catch (error) {
      console.error('删除文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 分割文件为多个分片
  ipcMain.handle('split-file', async (_, { filePath, chunkSize, outputDir }) => {
    try {
      const fileStat = await stat(filePath)
      const fileSize = fileStat.size
      const totalChunks = Math.ceil(fileSize / chunkSize)
      const chunkPaths = []

      // 获取原文件名（不含扩展名）
      const fileName = filePath.split(/[\\/]/).pop() || 'file'
      const baseName = fileName.includes('.')
        ? fileName.substring(0, fileName.lastIndexOf('.'))
        : fileName

      // 打开原文件
      const fileHandle = await open(filePath, 'r')

      try {
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize
          const end = Math.min(start + chunkSize, fileSize)
          const chunkBuffer = Buffer.alloc(end - start)

          // 读取分片数据
          await fileHandle.read(chunkBuffer, 0, chunkBuffer.length, start)

          // 生成分片文件名
          const chunkFileName = `${baseName}_chunk_${String(i + 1).padStart(4, '0')}`
          const chunkPath = join(outputDir, chunkFileName)

          // 写入分片文件
          await writeFile(chunkPath, chunkBuffer)
          chunkPaths.push(chunkPath)
        }
      } finally {
        await fileHandle.close()
      }

      return {
        success: true,
        chunkPaths,
        totalChunks,
        chunkSize
      }
    } catch (error) {
      console.error('分割文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 显示消息对话框
  ipcMain.handle('show-message-box', async (_, options) => {
    try {
      const result = await dialog.showMessageBox(options)
      return result
    } catch (error) {
      console.error('显示消息对话框失败:', error)
      return { response: 1 }
    }
  })

  // 计算文件的MD5值
  async function calculateMD5(filePath) {
    return new Promise((resolve, reject) => {
      try {
        const hash = createHash('md5')
        const stream = createReadStream(filePath)

        stream.on('data', chunk => {
          hash.update(chunk)
        })

        stream.on('end', () => {
          const md5 = hash.digest('hex')
          resolve(md5)
        })

        stream.on('error', error => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
