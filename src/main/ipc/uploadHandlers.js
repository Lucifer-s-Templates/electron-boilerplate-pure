import { ipcMain } from 'electron'
import { readFile } from 'fs/promises'
import { net } from 'electron'
import FormData from 'form-data'

// 注册文件上传 IPC 处理器
export function registerUploadHandlers() {
  // 读取文件内容为 Buffer
  ipcMain.handle('read-file', async (_, filePath) => {
    try {
      const buffer = await readFile(filePath)
      // 转换为 Uint8Array 以便通过 IPC 传输
      const arrayBuffer = new Uint8Array(buffer).buffer
      return {
        success: true,
        data: arrayBuffer,
        size: buffer.length
      }
    } catch (error) {
      console.error('读取文件失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 读取文件为 Base64（小文件适用）
  ipcMain.handle('read-file-base64', async (_, filePath) => {
    try {
      const buffer = await readFile(filePath)
      const base64 = buffer.toString('base64')
      return {
        success: true,
        data: base64,
        size: buffer.length
      }
    } catch (error) {
      console.error('读取文件失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 读取文件分片
  ipcMain.handle('read-file-chunk', async (_, { filePath, start, end }) => {
    try {
      const buffer = await readFile(filePath)
      const chunk = buffer.slice(start, end)
      const arrayBuffer = new Uint8Array(chunk).buffer
      return {
        success: true,
        data: arrayBuffer,
        size: chunk.length
      }
    } catch (error) {
      console.error('读取文件分片失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  })

  // 上传文件（使用 Electron net 模块）
  ipcMain.handle('upload-file', async (_, { url, filePath, fileName, headers = {} }) => {
    try {
      // 读取文件
      const fileBuffer = await readFile(filePath)

      // 创建 multipart/form-data
      const form = new FormData()
      form.append('file', fileBuffer, fileName)

      // 获取 form-data 的 headers
      const formHeaders = form.getHeaders()

      return new Promise((resolve, reject) => {
        const request = net.request({
          url,
          method: 'POST',
          headers: {
            ...formHeaders,
            ...headers
          }
        })

        let responseData = ''

        request.on('response', (response) => {
          response.on('data', (chunk) => {
            responseData += chunk.toString()
          })

          response.on('end', () => {
            try {
              const data = JSON.parse(responseData)
              resolve({
                success: true,
                statusCode: response.statusCode,
                data
              })
            } catch (e) {
              resolve({
                success: true,
                statusCode: response.statusCode,
                data: responseData
              })
            }
          })
        })

        request.on('error', (error) => {
          console.error('上传文件失败:', error)
          reject({ success: false, error: error.message })
        })

        // 写入 form-data
        request.write(form.getBuffer())
        request.end()
      })
    } catch (error) {
      console.error('上传文件失败:', error)
      return { success: false, error: error.message }
    }
  })

  // 上传分片（使用 Electron net 模块）
  ipcMain.handle('upload-chunk', async (_, { url, filePath, fileName, chunkIndex, md5, headers = {} }) => {
    try {
      // 读取文件
      const fileBuffer = await readFile(filePath)

      // 创建 multipart/form-data
      const form = new FormData()
      form.append('file', fileBuffer, fileName)
      form.append('chunks', chunkIndex.toString())
      form.append('md5', md5)

      // 获取 form-data 的 headers
      const formHeaders = form.getHeaders()

      return new Promise((resolve, reject) => {
        const request = net.request({
          url,
          method: 'POST',
          headers: {
            ...formHeaders,
            ...headers
          }
        })

        let responseData = ''

        request.on('response', (response) => {
          response.on('data', (chunk) => {
            responseData += chunk.toString()
          })

          response.on('end', () => {
            try {
              const data = JSON.parse(responseData)
              resolve({
                success: true,
                statusCode: response.statusCode,
                data
              })
            } catch (e) {
              resolve({
                success: true,
                statusCode: response.statusCode,
                data: responseData
              })
            }
          })
        })

        request.on('error', (error) => {
          console.error('上传分片失败:', error)
          reject({ success: false, error: error.message })
        })

        // 写入 form-data
        request.write(form.getBuffer())
        request.end()
      })
    } catch (error) {
      console.error('上传分片失败:', error)
      return { success: false, error: error.message }
    }
  })
}
