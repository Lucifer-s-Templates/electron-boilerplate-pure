import request from '../utils/request/index.js'

// 通知公告列表
export function getNoticeList(data) {
  // 模拟异步请求
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: {
          last: true,
          objs: [
            {
              id: 2,
              title: '系统 1.0.1 版本正式上线啦！',
              content: '更新内容：\n1.优化页面设计\n2.修复软件bug',
              status: 1,
              createTime: 1776305367465
            },
            {
              id: 1,
              title: '系统 1.0.0 版本正式上线啦！',
              content: '更新内容：\n1.优化页面设计\n2.修复软件bug',
              status: 0,
              createTime: 1775540644523
            }
          ],
          total: 100,
          pageSize: 20,
          pageNum: 1,
          rows: 2
        }
      })
    }, 1500)
  })
  // return request({
  //   url: '/app/notice/list',
  //   method: 'post',
  //   data
  // })
}
