import { ipcMain, net } from 'electron'

// 注册 HTTP 请求 IPC 处理器
export function registerNetRequestHandlers() {
  ipcMain.handle('net-request', async (_, options) => {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', headers = {}, body } = options

      const request = net.request({
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
          device: 'app',
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
              headers: response.headers,
              data
            })
          } catch (e) {
            resolve({
              success: true,
              statusCode: response.statusCode,
              headers: response.headers,
              data: responseData
            })
          }
        })
      })

      request.on('error', (error) => {
        console.error('net request error:', error)
        reject({ success: false, error: error })
      })

      if (body) {
        // 根据 Content-Type 决定如何序列化 body
        const contentType = headers['Content-Type'] || headers['content-type'] || 'application/json'
        if (contentType.includes('application/x-www-form-urlencoded')) {
          // URL 编码格式
          const formData = new URLSearchParams()
          for (const [key, value] of Object.entries(body)) {
            formData.append(key, value)
          }
          request.write(formData.toString())
        } else {
          // 默认 JSON 格式
          request.write(JSON.stringify(body))
        }
      }

      request.end()
    })
  })
}
