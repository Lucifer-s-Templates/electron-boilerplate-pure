// 统一使用 electron 的 net 模块发送 HTTP 请求
// 优点：
// 1. 开发和生产环境行为一致
// 2. 完全绕过浏览器 CORS 限制
// 3. 更安全
// 缺点：无法在 DevTools Network 面板查看请求

import netRequest from './netRequest.js'

export default netRequest
