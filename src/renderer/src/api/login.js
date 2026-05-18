import request from '@renderer/utils/request/index.js'

// 登录方法
export function login({ username, password }) {
  return request({
    url: '/app/login',
    method: 'post',
    data: { username, password },
    headers: {
      isToken: false
    }
  })
}

// 获取用户信息
export function getInfo() {
  return request({
    url: '/app/getInfo',
    method: 'get'
  })
}
