import request from '../utils/request/index.js'

// 查询单位
export function queryOrgList() {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: [
          {
            id: 1,
            name: '汤圆科技'
          },
          {
            id: 2,
            name: '炸炸科技'
          },
          {
            id: 3,
            name: '呼呼科技'
          }
        ]
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/org/list',
  //   method: 'post'
  // })
}

// 修改基本信息
export function updateBaseInfo(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: null
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/user/updateInfo',
  //   method: 'post',
  //   data
  // })
}

// 修改密码
export function updatePassword(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: null
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/user/updatePassword',
  //   method: 'post',
  //   params: data
  // })
}

// 保存意见反馈
export function saveFeedback(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: null
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/feedback/save',
  //   method: 'post',
  //   data
  // })
}

// 获取系统配置文件
export function getSystemFile(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: {
          fileName:
            data.fileType === 1 ? '系统操作手册.pdf' : 'electron-boilerplate-pure-1.0.1-setup.exe'
        }
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/getSystemFile',
  //   method: 'get',
  //   params: data
  // })
}
