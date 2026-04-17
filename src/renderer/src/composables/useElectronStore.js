import { ref, readonly } from 'vue'

export const ELECTRON_STORE_TOKEN = 'token'
export const ELECTRON_STORE_USER = 'user'
export const ELECTRON_STORE_SETTING = 'setting'

/**
 * Electron Store 组合式函数
 * 用于在渲染进程中访问 electron-store 存储
 * 支持多用户数据隔离
 */
export function useElectronStore() {
  const isReady = ref(false)
  const data = ref({})
  const currentUserId = ref('')

  // 检查是否在 Electron 环境
  const isElectron = typeof window !== 'undefined' && window.api && window.api.store

  /**
   * 设置当前用户（登录时调用）
   * @param {string} userId - 用户ID
   */
  async function setCurrentUser(userId) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      await window.api.store.setCurrentUser(userId)
      currentUserId.value = userId
      // 加载该用户的数据
      await getAll()
      return true
    } catch (error) {
      console.error('store.setCurrentUser 失败:', error)
      return false
    }
  }

  /**
   * 清除当前用户（退出登录时调用）
   */
  async function clearCurrentUser() {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      await window.api.store.clearCurrentUser()
      currentUserId.value = ''
      data.value = {}
      return true
    } catch (error) {
      console.error('store.clearCurrentUser 失败:', error)
      return false
    }
  }

  /**
   * 获取当前用户ID
   */
  async function getCurrentUser() {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return ''
    }
    try {
      const userId = await window.api.store.getCurrentUserId()
      currentUserId.value = userId
      return userId
    } catch (error) {
      console.error('store.getCurrentUserId 失败:', error)
      return ''
    }
  }

  /**
   * 获取值
   * @param {string} key - 键名，支持点号路径如 'user.name'
   * @param {*} defaultValue - 默认值
   */
  async function get(key, defaultValue = undefined) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return defaultValue
    }
    try {
      const value = await window.api.store.get(key)
      return value !== undefined ? value : defaultValue
    } catch (error) {
      console.error('store.get 失败:', error)
      return defaultValue
    }
  }

  /**
   * 将值转换为可序列化的普通对象
   * @param {*} value - 任意值
   * @returns {*} - 可序列化的值
   */
  function toSerializable(value) {
    if (value === null || value === undefined) {
      return value
    }
    if (typeof value === 'function' || value instanceof Date || value instanceof RegExp) {
      return value
    }
    if (Array.isArray(value)) {
      return value.map(toSerializable)
    }
    if (typeof value === 'object') {
      // 处理 Proxy 对象和普通对象
      const plain = {}
      for (const key of Object.keys(value)) {
        plain[key] = toSerializable(value[key])
      }
      return plain
    }
    return value
  }

  /**
   * 设置值
   * @param {string} key - 键名
   * @param {*} value - 值
   */
  async function set(key, value) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      // 将 Proxy 对象转换为普通对象
      const serializableValue = toSerializable(value)
      await window.api.store.set(key, serializableValue)
      return true
    } catch (error) {
      console.error('store.set 失败:', error)
      return false
    }
  }

  /**
   * 删除值
   * @param {string} key - 键名
   */
  async function remove(key) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      await window.api.store.delete(key)
      return true
    } catch (error) {
      console.error('store.delete 失败:', error)
      return false
    }
  }

  /**
   * 清空当前用户的所有数据
   */
  async function clear() {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      await window.api.store.clear()
      data.value = {}
      return true
    } catch (error) {
      console.error('store.clear 失败:', error)
      return false
    }
  }

  /**
   * 获取当前用户的所有数据
   */
  async function getAll() {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return {}
    }
    try {
      const allData = await window.api.store.getAll()
      data.value = allData
      isReady.value = true
      return allData
    } catch (error) {
      console.error('store.getAll 失败:', error)
      return {}
    }
  }

  /**
   * 设置当前用户的所有数据
   * @param {object} newData - 新数据
   */
  async function setAll(newData) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      const serializableData = toSerializable(newData)
      await window.api.store.setAll(serializableData)
      data.value = serializableData
      return true
    } catch (error) {
      console.error('store.setAll 失败:', error)
      return false
    }
  }

  /**
   * 删除指定用户的数据
   * @param {string} userId - 用户ID
   */
  async function deleteUser(userId) {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return false
    }
    try {
      await window.api.store.deleteUser(userId)
      return true
    } catch (error) {
      console.error('store.deleteUser 失败:', error)
      return false
    }
  }

  /**
   * 获取所有用户ID列表
   */
  async function getAllUserIds() {
    if (!isElectron) {
      console.warn('electron-store 不可用')
      return []
    }
    try {
      return await window.api.store.getAllUserIds()
    } catch (error) {
      console.error('store.getAllUserIds 失败:', error)
      return []
    }
  }

  /**
   * 初始化加载当前用户数据
   */
  async function init() {
    const userId = await getCurrentUser()
    if (userId) {
      return await getAll()
    }
    return {}
  }

  return {
    isReady: readonly(isReady),
    data: readonly(data),
    currentUserId: readonly(currentUserId),
    setCurrentUser,
    clearCurrentUser,
    getCurrentUser,
    get,
    set,
    remove,
    clear,
    getAll,
    setAll,
    deleteUser,
    getAllUserIds,
    init,
    isElectron
  }
}

export default useElectronStore
