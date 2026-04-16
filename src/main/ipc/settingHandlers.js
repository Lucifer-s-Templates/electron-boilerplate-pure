import { ipcMain, nativeTheme } from 'electron'

export function registerSettingHandlers() {
  ipcMain.handle('setting:toggleThemeMode', (event, mode) => {
    nativeTheme.themeSource = mode
    return nativeTheme.shouldUseDarkColors
  })
}
