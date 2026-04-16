import './assets/styles/main.scss'

import { createApp } from 'vue'
import store from './store'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import locale from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'

import 'virtual:svg-icons-register'
import SvgIcon from './components/SvgIcon/index.vue'

// 导入 user store 进行初始化
import useUserStore from './store/modules/user.js'

// 导入并初始化 passive 事件监听器 polyfill
import { initPassiveEventsPolyfill } from './utils/passive-events.js'
initPassiveEventsPolyfill()

async function bootstrap() {
  const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(ElementPlus, {
    locale
  })

  app.component('svg-icon', SvgIcon)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 初始化 user store（从 electron-store 加载用户数据）
  const userStore = useUserStore()
  await userStore.init()

  app.mount('#app')
}

bootstrap()
