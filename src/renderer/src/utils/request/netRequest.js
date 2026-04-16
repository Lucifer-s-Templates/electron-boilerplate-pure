import { ElMessage } from 'element-plus'
import useUserStore from '../../store/modules/user.js'
import router from '../../router/index.js'

const baseURL = import.meta.env.VITE_APP_BASE_URL || ''
const errorCode = {
  403: '当前操作没有权限',
  404: '访问资源不存在',
  405: '后端接口连接异常',
  default: '系统未知错误，请反馈给管理员'
}

/**
 * 构建带参数的 URL
 * @param {string} url - 基础 URL
 * @param {object} params - URL 参数对象
 * @returns {string} 完整的 URL
 */
function buildUrlWithParams(url, params) {
  if (!params || Object.keys(params).length === 0) {
    return url
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  if (!queryString) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${queryString}`
}

/**
 * 使用 Electron net 模块发送 HTTP 请求
 */
async function netRequest(options) {
  const { url, method = 'GET', data, params, headers = {} } = options

  // 构建完整 URL（包含 params 参数）
  let fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
  fullUrl = buildUrlWithParams(fullUrl, params)

  // 构建请求头
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  }

  // 添加 token
  const token = useUserStore().token
  if (token && headers.isToken !== false) {
    requestHeaders['Authorization'] = 'Bearer ' + token
  }

  console.log('[接口请求]', {
    url: fullUrl,
    method,
    headers: requestHeaders,
    data,
    token
  })

  try {
    const result = await window.api.netRequest({
      url: fullUrl,
      method,
      headers: requestHeaders,
      body: data
    })

    console.log('[接口响应]', {
      statusCode: result.statusCode,
      success: result.success,
      data: result.data
    })

    if (!result.success) {
      throw new Error(result.error || '请求失败')
    }

    if (result.statusCode === 401) {
      ElMessage.error('token失效,请重新登陆!')
      useUserStore()
        .logout()
        .then(() => {
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        })
      return Promise.reject('登录已过期')
    }

    if (result.statusCode !== 200) {
      const errMsg = errorCode[result.statusCode] || `${result.statusCode} 未知错误`
      ElMessage.error(errMsg)
      return Promise.reject(new Error(errMsg))
    }

    const responseData = result.data || {}
    // 未设置状态码则默认成功状态
    const code = responseData.code || 200
    // 获取错误信息
    const msg = responseData.msg || errorCode[code] || errorCode['default']

    if (code === 200) {
      return Promise.resolve(responseData)
    } else {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
  } catch (error) {
    console.log('net request error:', error)
    ElMessage.error(error.message || '服务器异常')
    return Promise.reject(new Error(error.message || '服务器异常'))
  }
}

export default netRequest
