import { app, shell, BrowserWindow, globalShortcut, Tray, Menu, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 导入 IPC 处理器
import { registerFileHandlers } from './ipc/fileHandlers.js'
import { registerNetRequestHandlers } from './ipc/netRequestHandlers.js'
import { registerUploadHandlers } from './ipc/uploadHandlers.js'
import { registerSettingHandlers } from './ipc/settingHandlers.js'
import { registerStoreHandlers } from './ipc/storeHandlers.js'
import { getUpdateManager } from './updateManager.js'

// 设置 Windows 控制台编码为 UTF-8，解决中文乱码问题
if (process.platform === 'win32') {
  process.env.PYTHONIOENCODING = 'utf-8'
  import('child_process').then(({ exec }) => {
    exec('chcp 65001', error => {
      if (error) {
        console.error('设置 UTF-8 编码失败:', error)
      }
    })
  })
}

// 全局变量
let mainWindow = null
let tray = null

// 单实例应用：请求单实例锁
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果没有获得锁，说明已有实例在运行，退出当前实例
  app.quit()
} else {
  // 获得锁，监听第二个实例的启动事件
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，聚焦到第一个实例的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
      mainWindow.focus()
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1268,
    height: 900,
    minWidth: 900,
    minHeight: 668,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    frame: false, // 使用无边框窗口，使用自定义标题栏
    titleBarStyle: 'hidden', // macOS 隐藏标题栏
    trafficLightPosition: { x: 12, y: 12 }, // macOS 交通灯按钮位置
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

    // 注册 F12 快捷键打开/关闭 DevTools（打包后也可用）
    globalShortcut.register('F12', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools()
      } else {
        mainWindow.webContents.openDevTools()
      }
    })

    // 注册 Ctrl+Shift+I 快捷键打开 DevTools（Mac 上是 Cmd+Option+I）
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools()
      } else {
        mainWindow.webContents.openDevTools()
      }
    })

    // 窗口显示后检查更新
    setTimeout(() => {
      const updateManager = getUpdateManager()
      updateManager.checkForUpdates(true)
    }, 3000)
  })

  // 监听窗口关闭事件，改为隐藏窗口而不是退出应用
  mainWindow.on('close', event => {
    if (!app.isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 注册窗口控制 IPC 处理
  ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window-close', () => {
    mainWindow?.hide()
  })

  // 退出应用
  ipcMain.handle('quit-app', () => {
    app.isQuiting = true
    app.quit()
  })

  // 监听窗口最大化状态变化
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized', false)
  })

  // 注册置顶窗口 IPC 处理
  ipcMain.handle('window-set-always-on-top', (_, flag) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(flag)
      mainWindow.webContents.send('window-always-on-top-changed', flag)
    }
  })
}

// 创建任务栏托盘图标
function createTray() {
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示应用',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '退出',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setToolTip('electron-boilerplate-pure')
  tray.setContextMenu(contextMenu)

  // 点击托盘图标显示/隐藏窗口
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册 IPC 处理器
  registerFileHandlers(app)
  registerNetRequestHandlers()
  registerUploadHandlers()
  registerSettingHandlers()
  registerStoreHandlers()

  // 注册获取应用版本号的 IPC 处理器
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  createWindow()
  createTray()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // 注销所有全局快捷键
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
