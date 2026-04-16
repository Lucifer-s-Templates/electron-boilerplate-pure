/**
 * 应用更新组合式函数
 */
export default function useUpdate() {
  /**
   * 检查更新
   * @param {Object} options - 更新检查选项
   * @param {boolean} options.silent - 是否静默检查更新，默认 true
   * @returns {Promise<{hasUpdate: boolean, info?: object, error?: string}>}
   */
  const checkForUpdates = async ({ silent = true }) => {
    return await window.api.checkForUpdates({ silent })
  }

  /**
   * 下载更新
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const downloadUpdate = async () => {
    return await window.api.downloadUpdate()
  }

  /**
   * 安装更新
   */
  const installUpdate = async () => {
    return await window.api.installUpdate()
  }

  /**
   * 跳过指定版本
   * @param {string} version - 要跳过的版本号
   */
  const skipVersion = async version => {
    return await window.api.skipVersion(version)
  }

  /**
   * 获取当前更新状态
   * @returns {Promise<{status: string, info: object, progress: number}>}
   */
  const getUpdateStatus = async () => {
    return await window.api.getUpdateStatus()
  }

  /**
   * 监听更新状态变化
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听的函数
   */
  const onUpdateStatus = callback => {
    const handler = (_, data) => callback(data)
    window.electron.ipcRenderer.on('update-status', handler)

    // 返回取消监听函数
    return () => {
      window.electron.ipcRenderer.removeListener('update-status', handler)
    }
  }

  /**
   * 监听显示更新对话框事件
   * @param {Function} callback - 回调函数，接收更新信息
   * @returns {Function} 取消监听的函数
   */
  const onShowUpdateDialog = callback => {
    const handler = (_, data) => callback(data)
    window.electron.ipcRenderer.on('show-update-dialog', handler)

    return () => {
      window.electron.ipcRenderer.removeListener('show-update-dialog', handler)
    }
  }

  /**
   * 监听下载完成事件
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听的函数
   */
  const onUpdateDownloaded = callback => {
    const handler = (_, data) => callback(data)
    window.electron.ipcRenderer.on('update-downloaded', handler)

    return () => {
      window.electron.ipcRenderer.removeListener('update-downloaded', handler)
    }
  }

  /**
   * 监听下载进度事件
   * @param {Function} callback - 回调函数，接收进度信息
   * @returns {Function} 取消监听的函数
   */
  const onDownloadProgress = callback => {
    const handler = (_, data) => {
      if (data.status === 'downloading') {
        callback(data.data)
      }
    }
    window.electron.ipcRenderer.on('update-status', handler)

    return () => {
      window.electron.ipcRenderer.removeListener('update-status', handler)
    }
  }

  return {
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    skipVersion,
    getUpdateStatus,
    onUpdateStatus,
    onShowUpdateDialog,
    onUpdateDownloaded,
    onDownloadProgress
  }
}
