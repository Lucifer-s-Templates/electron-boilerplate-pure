import { autoUpdater } from 'electron-updater'
import { dialog, BrowserWindow, ipcMain, app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'

// 更新状态
const UpdateStatus = {
  IDLE: 'idle',
  CHECKING: 'checking',
  AVAILABLE: 'available',
  NOT_AVAILABLE: 'not-available',
  DOWNLOADING: 'downloading',
  DOWNLOADED: 'downloaded',
  ERROR: 'error'
}

class UpdateManager {
  constructor() {
    this.status = UpdateStatus.IDLE
    this.updateInfo = null
    this.downloadProgress = 0
    this._store = null

    this.init()
  }

  init() {
    // 配置自动更新
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false

    // 开发环境下手动指定 dev-app-update.yml 配置文件路径
    if (is.dev) {
      const devUpdateConfigPath = join(process.cwd(), 'dev-app-update.yml')
      autoUpdater.updateConfigPath = devUpdateConfigPath
      autoUpdater.forceDevUpdateConfig = true
      console.log('开发环境更新配置路径:', devUpdateConfigPath)
    }

    // 绑定事件
    autoUpdater.on('checking-for-update', () => {
      this.status = UpdateStatus.CHECKING
      this.sendToRenderer('update-status', { status: 'checking' })
    })

    autoUpdater.on('update-available', (info) => {
      this.status = UpdateStatus.AVAILABLE
      this.updateInfo = info
      this.sendToRenderer('update-status', {
        status: 'available',
        data: info
      })
      // 发送消息到渲染进程显示自定义更新弹窗
      this.sendToRenderer('show-update-dialog', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      this.status = UpdateStatus.NOT_AVAILABLE
      this.sendToRenderer('update-status', {
        status: 'not-available',
        data: info
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      this.status = UpdateStatus.DOWNLOADING
      this.downloadProgress = progress.percent
      this.sendToRenderer('update-status', {
        status: 'downloading',
        data: progress
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.status = UpdateStatus.DOWNLOADED
      this.sendToRenderer('update-status', {
        status: 'downloaded',
        data: info
      })
      // 发送消息到渲染进程显示安装提示
      this.sendToRenderer('update-downloaded', info)
    })

    autoUpdater.on('error', (err) => {
      this.status = UpdateStatus.ERROR
      console.error('更新错误:', err)
      this.sendToRenderer('update-status', {
        status: 'error',
        message: err.message
      })
    })

    // 监听渲染进程消息
    ipcMain.handle('check-for-updates', (_, { silent = true }) => {
      return this.checkForUpdates(silent)
    })

    ipcMain.handle('download-update', () => {
      return this.downloadUpdate()
    })

    ipcMain.handle('install-update', () => {
      return this.installUpdate()
    })

    ipcMain.handle('skip-version', (_, version) => {
      this.skipVersion(version)
    })

    ipcMain.handle('get-update-status', () => {
      return {
        status: this.status,
        info: this.updateInfo,
        progress: this.downloadProgress
      }
    })
  }

  // 检查更新
  async checkForUpdates(silent = true) {
    try {
      // 检查是否跳过此版本
      const skippedVersion = await this.getSkippedVersion()

      const result = await autoUpdater.checkForUpdates()

      // 如果用户跳过了此版本，不显示更新提示
      if (result?.updateInfo?.version === skippedVersion) {
        console.log(`用户已跳过版本 ${skippedVersion}`)
        return { hasUpdate: false, skipped: true }
      }

      return { hasUpdate: !!result?.isUpdateAvailable, info: result?.updateInfo }
    } catch (error) {
      console.error('检查更新失败:', error)
      if (!silent) {
        dialog.showErrorBox('检查更新失败', error.message)
      }
      return { hasUpdate: false, error: error.message }
    }
  }

  // 下载更新
  async downloadUpdate() {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      console.error('下载更新失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 安装更新
  installUpdate() {
    autoUpdater.quitAndInstall(false, true)
  }

  // 跳过版本
  async skipVersion(version) {
    const store = await this.getStore()
    store.set('skippedVersion', version)
  }

  // 获取跳过的版本
  async getSkippedVersion() {
    const store = await this.getStore()
    return store.get('skippedVersion', null)
  }

  // 获取 store（延迟加载避免循环依赖）
  async getStore() {
    if (!this._store) {
      try {
        const StoreModule = await import('electron-store')
        const Store = StoreModule.default || StoreModule
        this._store = new Store({ name: 'update-config' })
      } catch (error) {
        console.error('初始化 store 失败:', error)
        // 如果配置文件损坏，返回一个内存中的模拟 store
        this._store = {
          _data: {},
          get: function(key, defaultValue) {
            return this._data[key] !== undefined ? this._data[key] : defaultValue
          },
          set: function(key, value) {
            this._data[key] = value
          }
        }
      }
    }
    return this._store
  }

  // 发送消息到渲染进程
  sendToRenderer(channel, data) {
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data)
      }
    })
  }

  // 设置更新服务器地址
  setFeedURL(url) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: url
    })
  }
}

// 单例模式
let updateManager = null

export function getUpdateManager() {
  if (!updateManager) {
    updateManager = new UpdateManager()
  }
  return updateManager
}

export { UpdateStatus }
