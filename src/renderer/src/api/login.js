import request from '../utils/request/index.js'

// 登录方法
export function login(mobile, password) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: {
          access_token: '123456'
        }
      })
    }, 1000)
  })
  // return request({
  //   url: '/app/login',
  //   method: 'post',
  //   data: { mobile, password },
  //   headers: {
  //     isToken: false
  //   }
  // })
}

// 获取用户信息
export function getInfo() {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: {
          id: 33666,
          userName: 'lucifer',
          password: '',
          realName: '林炸炸',
          orgId: 1,
          groupName: '开发部',
          mobile: '18888888888'
        }
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/user/getInfo',
  //   method: 'post'
  // })
}
