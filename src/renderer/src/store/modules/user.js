import { login as sysLogin, getInfo } from '../../api/login'
import Cat1 from '../../assets/images/cat_1.svg'
import Cat2 from '../../assets/images/cat_2.svg'
import {
  useElectronStore,
  ELECTRON_STORE_TOKEN,
  ELECTRON_STORE_USER
} from '../../composables/useElectronStore.js'
import useSettingStore from './setting.js'

/**
 * user 全局状态管理 Store
 * 使用 electron-store 替代 pinia-persistedstate 进行持久化
 * 支持多用户数据隔离
 */
const useUserStore = defineStore('user', () => {
  const electronStore = useElectronStore()

  const token = ref('')
  const userInfo = ref({})
  const id = ref('')
  const name = ref('')
  // 存储头像文件名或URL，不存储完整路径
  const avatarUrl = ref('')

  const defaultAvatar = computed(() => (useSettingStore().isDark ? Cat2 : Cat1))

  // 动态获取头像地址
  const avatar = computed(() => {
    if (!avatarUrl.value) {
      return defaultAvatar.value
    }
    if (avatarUrl.value.startsWith('http') || avatarUrl.value.startsWith('data:')) {
      return avatarUrl.value
    }
    return defaultAvatar.value
  })

  // 是否使用默认头像
  const isDefaultAvatar = computed(() => avatar.value === defaultAvatar.value)

  // 登录
  function login({ mobile, password }) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await sysLogin({ mobile, password })
        console.log('账号密码登录成功', res)
        const { access_token: accessToken } = res.data
        token.value = accessToken

        // 先获取用户信息以获取用户ID
        await getUserInfo()

        // 设置当前用户（按用户ID隔离数据）
        if (id.value) {
          await electronStore.setCurrentUser(id.value)
        }

        // 保存 token 到 electron-store
        await electronStore.set(ELECTRON_STORE_TOKEN, accessToken)

        // 初始化设置
        await useSettingStore().init()

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 获取用户信息
  function getUserInfo() {
    return new Promise(async (resolve, reject) => {
      try {
        const infoRes = await getInfo()
        console.log('获取用户信息成功', infoRes)
        name.value = infoRes.data.userName
        id.value = infoRes.data.id
        userInfo.value = infoRes.data
        // 保存用户信息到 electron-store
        await saveUserToStore()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 退出系统
  function logout() {
    return new Promise(async (resolve, reject) => {
      try {
        token.value = ''
        id.value = ''
        name.value = ''
        userInfo.value = {}
        avatarUrl.value = ''

        // 清除当前用户（退出数据隔离）
        await electronStore.clearCurrentUser()

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 从 electron-store 加载用户数据
  async function loadUserFromStore() {
    try {
      // 获取当前用户ID
      const currentUserId = await electronStore.getCurrentUser()
      console.log('currentUserId', currentUserId)

      // 如果没有当前用户，不加载数据
      if (!currentUserId) {
        return
      }

      const storedToken = await electronStore.get(ELECTRON_STORE_TOKEN)
      if (storedToken) {
        token.value = storedToken
      }

      const storedUser = await electronStore.get(ELECTRON_STORE_USER)
      if (storedUser) {
        userInfo.value = storedUser.userInfo || {}
        id.value = storedUser.id || ''
        name.value = storedUser.name || ''
        avatarUrl.value = storedUser.avatarUrl || ''
      }
    } catch (error) {
      console.error('从 store 加载用户数据失败:', error)
    }
  }

  // 保存用户数据到 electron-store
  async function saveUserToStore() {
    try {
      await electronStore.set(ELECTRON_STORE_USER, {
        userInfo: { ...userInfo.value },
        id: id.value,
        name: name.value,
        avatarUrl: avatarUrl.value
      })
    } catch (error) {
      console.error('保存用户数据到 store 失败:', error)
    }
  }

  // 更新头像
  async function updateAvatar(url) {
    avatarUrl.value = url
    await saveUserToStore()
  }

  // 初始化时加载数据（在应用启动时调用）
  async function init() {
    console.log('userStore init')
    await loadUserFromStore()
  }

  return {
    token,
    userInfo,
    id,
    name,
    avatar,
    isDefaultAvatar,
    avatarUrl,
    login,
    getUserInfo,
    logout,
    updateAvatar,
    loadUserFromStore,
    saveUserToStore,
    init
  }
})

export default useUserStore
