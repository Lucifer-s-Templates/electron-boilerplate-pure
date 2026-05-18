import request from '@renderer/utils/request/index.js'

// 通知公告列表
export function getNoticeList(data) {
  return request({
    url: '/app/notice',
    method: 'get',
    params: data
  })
}
