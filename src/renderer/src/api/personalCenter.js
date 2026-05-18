import request from '@renderer/utils/request/index.js'

// 查询单位
export function queryOrgList() {
  return request({
    url: '/app/org',
    method: 'get'
  })
}

// 修改基本信息
export function updateBaseInfo(data) {
  return request({
    url: '/app/user/profile',
    method: 'put',
    data
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/app/user/password',
    method: 'put',
    data
  })
}

// 保存意见反馈
export function saveFeedback(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: '保存成功',
        data: null
      })
    }, 1000)
  })
}

// 获取软件说明
export function getSoftwareDoc() {
  return request({
    url: '/app/getSoftwareDoc',
    method: 'get'
  })
}

// 获取安装包
export function getSoftwareInstaller() {
  return request({
    url: '/app/getSoftwareInstaller',
    method: 'get'
  })
}
