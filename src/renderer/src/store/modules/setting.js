import { useElectronStore, ELECTRON_STORE_SETTING } from '@renderer/composables/useElectronStore.js'

/**
 * setting 全局状态管理 Store
 */
const useSettingStore = defineStore('setting', () => {
  const electronStore = useElectronStore()

  // 主题模式 light/dark/system
  const themeMode = ref('dark')
  const isDark = ref(false)
  let mediaQuery = null
  let systemThemeChangeHandler = null

  // 监听系统主题变化
  function watchSystemTheme() {
    // 先移除之前的监听
    unwatchSystemTheme()

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemThemeChangeHandler = async e => {
      if (themeMode.value === 'system') {
        isDark.value = e.matches
        await saveSettingToStore()
        setThemeClass()
      }
    }
    mediaQuery.addEventListener('change', systemThemeChangeHandler)
  }

  // 移除系统主题监听
  function unwatchSystemTheme() {
    if (mediaQuery && systemThemeChangeHandler) {
      mediaQuery.removeEventListener('change', systemThemeChangeHandler)
      mediaQuery = null
      systemThemeChangeHandler = null
    }
  }

  // 切换主题模式
  async function toggleThemeMode(mode) {
    themeMode.value = mode

    // 先通知主进程切换主题，等待设置完成
    const shouldUseDarkColors = await window.api.toggleThemeMode(mode)

    // 使用主进程返回的实际主题状态
    if (mode === 'system') {
      isDark.value = shouldUseDarkColors
    } else {
      isDark.value = mode === 'dark'
    }
    await saveSettingToStore()
    setThemeClass()

    // 如果是 system 模式，开始监听系统主题变化
    if (mode === 'system') {
      watchSystemTheme()
    } else {
      unwatchSystemTheme()
    }
  }

  // 设置主题类名
  function setThemeClass() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 从 electron-store 加载设置数据
  async function loadSettingFromStore() {
    try {
      const storedSetting = await electronStore.get(ELECTRON_STORE_SETTING)
      if (storedSetting) {
        themeMode.value = storedSetting.themeMode || 'light'
        isDark.value = storedSetting.isDark || false
      }
    } catch (error) {
      console.error('从 store 加载设置数据失败:', error)
    }
  }

  // 保存设置数据到 electron-store
  async function saveSettingToStore() {
    try {
      await electronStore.set(ELECTRON_STORE_SETTING, {
        themeMode: themeMode.value,
        isDark: isDark.value
      })
    } catch (error) {
      console.error('保存设置数据到 store 失败:', error)
    }
  }

  // 初始化时加载设置数据并设置主题
  async function init() {
    await loadSettingFromStore()
    // 设置主题
    await toggleThemeMode(themeMode.value)
  }

  return {
    themeMode,
    isDark,
    toggleThemeMode,
    setThemeClass,
    watchSystemTheme,
    unwatchSystemTheme,
    loadSettingFromStore,
    saveSettingToStore,
    init
  }
})

export default useSettingStore
