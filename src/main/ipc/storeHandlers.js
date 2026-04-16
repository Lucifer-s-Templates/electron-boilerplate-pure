import { ipcMain, safeStorage } from 'electron'
import StoreModule from 'electron-store'
import crypto from 'crypto'
const Store = StoreModule.default || StoreModule

// 存储实例
let store = null
let encryptionKey = null

// 获取或创建加密密钥
function getEncryptionKey() {
  // 如果已经有密钥，直接返回
  if (encryptionKey) {
    return encryptionKey
  }

  // 创建一个临时 store 来存储加密密钥（不使用加密）
  const keyStore = new Store({
    name: 'app-key-store'
  })

  console.log('Key store path:', keyStore.path)

  // 尝试读取已保存的密钥
  let savedKey = keyStore.get('encryption_key')

  if (savedKey) {
    console.log('使用已保存的加密密钥')
    encryptionKey = savedKey
    return encryptionKey
  }

  // 生成 256 位随机密钥
  const key = crypto.randomBytes(32).toString('hex')
  console.log('生成新加密密钥')

  // 保存密钥（electron-store 会自动处理）
  keyStore.set('encryption_key', key)
  console.log('密钥已保存')

  encryptionKey = key
  return encryptionKey
}

// 初始化 store（需要在 app.whenReady 后调用）
function initStore() {
  if (store) return store

  store = new Store({
    name: 'app-config',
    encryptionKey: getEncryptionKey(), // 启用加密
    defaults: {
      // 当前登录用户ID
      currentUserId: '',
      // 用户数据映射表
      users: {}
    }
  })

  console.log('Store path:', store.path)
  return store
}

// 获取当前用户的数据命名空间
function getCurrentUserData() {
  const s = initStore()
  const currentUserId = s.get('currentUserId')
  if (!currentUserId) {
    return null
  }
  const users = s.get('users') || {}
  return users[currentUserId] || {}
}

// 设置当前用户的数据
function setCurrentUserData(userData) {
  const s = initStore()
  const currentUserId = s.get('currentUserId')
  if (!currentUserId) {
    return false
  }
  const users = s.get('users') || {}
  users[currentUserId] = userData
  s.set('users', users)
  return true
}

// 获取或创建用户的默认数据
function getOrCreateUserData(userId) {
  const s = initStore()
  const users = s.get('users') || {}
  if (!users[userId]) {
    users[userId] = {
      token: '',
      user: {
        userInfo: {},
        id: '',
        name: '',
        avatarUrl: ''
      },
      setting: {
        themeMode: 'light',
        isDark: false
      },
      msg: [],
      history: []
    }
    s.set('users', users)
  }
  return users[userId]
}

export function registerStoreHandlers() {
  // 初始化 store（确保 safeStorage 可用）
  initStore()

  // 设置当前用户（登录时调用）
  ipcMain.handle('store-set-current-user', (_, userId) => {
    if (!userId) {
      return false
    }
    const s = initStore()
    s.set('currentUserId', userId)
    // 确保用户数据空间存在
    getOrCreateUserData(userId)
    return true
  })

  // 清除当前用户（退出登录时调用）
  ipcMain.handle('store-clear-current-user', () => {
    const s = initStore()
    s.set('currentUserId', '')
    return true
  })

  // 获取当前用户ID
  ipcMain.handle('store-get-current-user-id', () => {
    const s = initStore()
    return s.get('currentUserId')
  })

  // 获取值（从当前用户的数据空间）
  ipcMain.handle('store-get', (_, key) => {
    const userData = getCurrentUserData()
    if (!userData) {
      return undefined
    }
    return userData[key]
  })

  // 设置值（到当前用户的数据空间）
  ipcMain.handle('store-set', (_, key, value) => {
    const userData = getCurrentUserData()
    if (!userData) {
      console.warn('没有当前用户，无法设置数据', key, value)
      return false
    }
    userData[key] = value
    return setCurrentUserData(userData)
  })

  // 删除值
  ipcMain.handle('store-delete', (_, key) => {
    const userData = getCurrentUserData()
    if (!userData) {
      return false
    }
    delete userData[key]
    return setCurrentUserData(userData)
  })

  // 清空当前用户的所有数据
  ipcMain.handle('store-clear', () => {
    const s = initStore()
    const currentUserId = s.get('currentUserId')
    if (!currentUserId) {
      return false
    }
    const users = s.get('users') || {}
    users[currentUserId] = {
      token: '',
      userInfo: {},
      avatarUrl: '',
      setting: {
        themeMode: 'light',
        isDark: false
      },
      msg: []
    }
    s.set('users', users)
    return true
  })

  // 获取当前用户的所有数据
  ipcMain.handle('store-get-all', () => {
    return getCurrentUserData() || {}
  })

  // 设置当前用户的所有数据
  ipcMain.handle('store-set-all', (_, data) => {
    return setCurrentUserData(data)
  })

  // 删除用户数据（完全删除某个用户的数据）
  ipcMain.handle('store-delete-user', (_, userId) => {
    const s = initStore()
    const users = s.get('users') || {}
    delete users[userId]
    s.set('users', users)
    return true
  })

  // 获取所有用户ID列表
  ipcMain.handle('store-get-all-user-ids', () => {
    const s = initStore()
    const users = s.get('users') || {}
    return Object.keys(users)
  })
}

export { initStore, getCurrentUserData, setCurrentUserData, getOrCreateUserData }
