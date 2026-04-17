import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 暴露 webUtils 用于获取拖拽文件的路径
  getPathForFile: file => webUtils.getPathForFile(file),
  openFiles: options => ipcRenderer.invoke('open-files', options),
  showItemInFolder: filePath => ipcRenderer.invoke('show-item-in-folder', filePath),
  getSystemPaths: () => ipcRenderer.invoke('get-system-paths'),
  searchFiles: options => ipcRenderer.invoke('search-files', options),
  openFile: filePath => ipcRenderer.invoke('open-file', filePath),
  getFileInfo: filePath => ipcRenderer.invoke('get-file-info', filePath),
  netRequest: options => ipcRenderer.invoke('net-request', options),
  createTxtFile: options => ipcRenderer.invoke('create-txt-file', options),
  calculateMD5: filePath => ipcRenderer.invoke('calculate-md5', filePath),
  createTempDir: prefix => ipcRenderer.invoke('create-temp-dir', prefix),
  cleanupTempDir: dirPath => ipcRenderer.invoke('cleanup-temp-dir', dirPath),
  showMessageBox: options => ipcRenderer.invoke('show-message-box', options),
  deleteFile: filePath => ipcRenderer.invoke('delete-file', filePath),
  toggleThemeMode: mode => ipcRenderer.invoke('setting:toggleThemeMode', mode),

  // 文件读取
  readFile: filePath => ipcRenderer.invoke('read-file', filePath),
  readFileBase64: filePath => ipcRenderer.invoke('read-file-base64', filePath),
  readFileChunk: params => ipcRenderer.invoke('read-file-chunk', params),
  splitFile: params => ipcRenderer.invoke('split-file', params),

  // 文件上传（使用主进程 net 模块，绕过 CORS）
  uploadFile: params => ipcRenderer.invoke('upload-file', params),
  uploadChunk: params => ipcRenderer.invoke('upload-chunk', params),

  // electron-store API - 支持多用户数据隔离
  store: {
    // 设置当前用户（登录时调用）
    setCurrentUser: userId => ipcRenderer.invoke('store-set-current-user', userId),
    // 清除当前用户（退出登录时调用）
    clearCurrentUser: () => ipcRenderer.invoke('store-clear-current-user'),
    // 获取当前用户ID
    getCurrentUserId: () => ipcRenderer.invoke('store-get-current-user-id'),
    // 数据操作（自动关联到当前用户）
    get: key => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: key => ipcRenderer.invoke('store-delete', key),
    clear: () => ipcRenderer.invoke('store-clear'),
    getAll: () => ipcRenderer.invoke('store-get-all'),
    setAll: data => ipcRenderer.invoke('store-set-all', data),
    // 管理功能
    deleteUser: userId => ipcRenderer.invoke('store-delete-user', userId),
    getAllUserIds: () => ipcRenderer.invoke('store-get-all-user-ids')
  },

  // 窗口控制 API
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  onWindowMaximized: callback =>
    ipcRenderer.on('window-maximized', (_, maximized) => callback(maximized)),

  // 置顶窗口 API
  setAlwaysOnTop: flag => ipcRenderer.invoke('window-set-always-on-top', flag),
  onAlwaysOnTopChanged: callback =>
    ipcRenderer.on('window-always-on-top-changed', (_, status) => callback(status)),

  // 自动更新 API
  checkForUpdates: (options = {}) => ipcRenderer.invoke('check-for-updates', options),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  skipVersion: version => ipcRenderer.invoke('skip-version', version),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateStatus: callback => ipcRenderer.on('update-status', (_, data) => callback(data)),

  // 应用信息 API
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 退出应用
  quitApp: () => ipcRenderer.invoke('quit-app')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
