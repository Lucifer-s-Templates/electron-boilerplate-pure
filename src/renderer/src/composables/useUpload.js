import { useElectronStore, ELECTRON_STORE_TOKEN } from './useElectronStore.js'

const baseUrl = import.meta.env.VITE_APP_BASE_URL

// 常量定义
const MAX_FILE_COUNT = 9 // 最大上传文件数量
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 最大上传文件大小
const CHUNK_FILE_SIZE = 50 * 1024 * 1024 // 分片文件大小，超过该值时进行切片
const CHUNK_SIZE_DEFAULT = 20 * 1024 * 1024 // 默认分片大小
const CHUNK_SIZE_LARGE = 50 * 1024 * 1024 // 大文件分片大小
const CHUNK_FILE_THRESHOLD = 500 * 1024 * 1024 // 分片文件阈值，超过该值时分片大小采用 CHUNK_SIZE_LARGE

/**
 * 文件上传组合式函数
 * 统一使用 Electron 主进程进行上传，绕过 CORS 限制
 */
export default function useUpload() {
  const electronStore = useElectronStore()

  /**
   * 获取授权 Token
   */
  const getAuthToken = async () => {
    const token = await electronStore.get(ELECTRON_STORE_TOKEN)
    if (!token) {
      console.warn('未找到授权 Token')
    }
    return token
  }

  /**
   * 上传单个文件（使用 Electron 主进程）
   */
  const uploadFile = async (file, options = {}) => {
    const { onProgress, onSuccess, onError } = options

    try {
      onProgress?.(0)

      const token = await getAuthToken()
      const uploadUrl = `${baseUrl}/api/upload/${file.sendId}`
      const fileName = file.path.split(/[\\/]/).pop() || 'file'

      // 打印请求信息
      console.log('[文件上传请求]', {
        url: uploadUrl,
        method: 'POST',
        fileName: fileName,
        filePath: file.path,
        fileSize: file.size,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      // 使用主进程上传
      const result = await window.api.uploadFile({
        url: uploadUrl,
        filePath: file.path,
        fileName,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      // 打印响应信息
      console.log('[文件上传响应]', {
        statusCode: result.statusCode,
        success: result.success,
        data: result.data
      })

      if (!result.success) {
        throw new Error(result.error || '上传失败')
      }

      const response = result.data
      if (response.code === 200) {
        onProgress?.(100)
        onSuccess?.(response)
        return response
      } else {
        throw new Error(`上传失败: ${response.code} ${response.msg}`)
      }
    } catch (error) {
      console.error('上传文件失败:', error)
      onError?.(error)
      throw error
    }
  }

  /**
   * 上传分片（使用 Electron 主进程）
   */
  const uploadChunk = async (chunk, options = {}) => {
    const { onProgress, onSuccess, onError } = options

    try {
      onProgress?.(0)

      const token = await getAuthToken()
      const uploadUrl = `${baseUrl}/api/slicing/${chunk.sendId}`
      const fileName = chunk.chunkPath.split(/[\\/]/).pop() || 'chunk'

      // 打印请求信息
      console.log('[分片上传请求]', {
        url: uploadUrl,
        method: 'POST',
        fileName: fileName,
        filePath: chunk.chunkPath,
        chunkIndex: chunk.chunk,
        md5: chunk.md5,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      // 使用主进程上传
      const result = await window.api.uploadChunk({
        url: uploadUrl,
        filePath: chunk.chunkPath,
        fileName,
        chunkIndex: chunk.chunk,
        md5: chunk.md5,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      // 打印响应信息
      console.log('[分片上传响应]', {
        statusCode: result.statusCode,
        success: result.success,
        data: result.data
      })

      if (!result.success) {
        throw new Error(result.error || '分片上传失败')
      }

      const response = result.data
      if (response.code === 200) {
        onProgress?.(100)
        onSuccess?.(response)
        return response
      } else {
        throw new Error(`分片上传失败: ${response.code} ${response.msg}`)
      }
    } catch (error) {
      console.error('上传分片失败:', error)
      onError?.(error)
      throw error
    }
  }

  /**
   * 重试上传
   */
  const retryUpload = async (file, maxRetries = 3, uploadFn) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`第 ${attempt + 1} 次自动重传文件【${file.name}】`)
        file.retryCount++
        return await uploadFn()
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error
        }
      }
    }
  }

  /**
   * 计算分片大小
   */
  const calculateChunkSize = fileSize => {
    return fileSize > CHUNK_FILE_THRESHOLD ? CHUNK_SIZE_LARGE : CHUNK_SIZE_DEFAULT
  }

  return {
    MAX_FILE_COUNT,
    MAX_FILE_SIZE,
    CHUNK_FILE_SIZE,
    getAuthToken,
    uploadFile,
    uploadChunk,
    retryUpload,
    calculateChunkSize
  }
}
