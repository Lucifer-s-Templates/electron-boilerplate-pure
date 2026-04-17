import { createWebHashHistory, createRouter } from 'vue-router'
import Layout from '@renderer/layout/index.vue'

/* 静态页面组件 */
import Login from '@renderer/views/login/index.vue'
import Error404 from '@renderer/views/error/404.vue'
import Error401 from '@renderer/views/error/401.vue'
import Index from '@renderer/views/index/index.vue'
import PersonalCenter from '@renderer/views/personalCenter/index.vue'
import Notice from '@renderer/views/notice/index.vue'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/',
    redirect: '/index'
  },
  // {
  //   path: '/redirect',
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: '/redirect/:path(.*)',
  //       component: () => import('@/views/redirect/index.vue'),
  //     },
  //   ],
  // },
  {
    path: '/login',
    component: Login,
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: Error404,
    hidden: true
  },
  {
    path: '/401',
    component: Error401,
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: Index,
        name: 'Index',
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '',
    component: Layout,
    redirect: '/personalCenter',
    children: [
      {
        path: '/personalCenter',
        component: PersonalCenter,
        name: 'PersonalCenter',
        meta: { title: '我的', icon: 'UserFilled' }
      },
      {
        path: '/feedback',
        component: () => import('@renderer/views/personalCenter/feedback.vue'),
        name: 'Feedback',
        hidden: true,
        meta: { title: '意见反馈', icon: '', activeMenu: '/personalCenter' }
      }
    ]
  },
  {
    path: '/notice',
    component: Notice,
    name: 'Notice',
    hidden: true,
    meta: { title: '通知公告', icon: '' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
