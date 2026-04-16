# electron-boilerplate-pure

一个基于 Electron + Vue 3 的桌面应用程序框架模板（纯净版）。

## 项目概述

### 技术栈

- **前端框架**: `Vue 3`
- **桌面框架**: `Electron`
- **构建工具**: `electron-vite`
- **UI 组件库**: `Element Plus`
- **状态管理**: `Pinia` + `Electron Store`（持久化）
- **HTTP 请求**: `Electron net` 模块

### 项目结构

```plaintext
electron-app/
├── build/                 # 构建资源
├── dist/                  # 构建输出
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── ipc/           # IPC 处理器
│   │   │   ├── fileHandlers.js          # 文件处理
│   │   │   ├── netRequestHandlers.js    # 网络请求
│   │   │   ├── settingHandlers.js       # 主题设置
│   │   │   └── uploadHandlers.js        # 文件上传
│   │   ├── utils/            # 工具函数
│   │   │   ├── fileType.js   # 文件类型相关
│   │   └── index.js          # 主进程入口
│   │   └── updateManager.js  # 更新管理器
│   ├── preload/           # 预加载脚本
│   │   └── index.js       # 暴露 API 到渲染进程
│   └── renderer/          # 渲染进程 (Vue 应用)
│       ├── src/
│       │   ├── api/          # API 接口定义
│       │   ├── assets/       # 资源文件
│       │   ├── components/   # 组件
│       │   ├── composables/  # 组合式函数
│       │   ├── layout/       # 布局组件
│       │   ├── router/       # 路由
│       │   ├── store/        # Pinia 状态管理
│       │   ├── utils/        # 工具函数
│       │   │   └── request/
│       │   │       ├── index.js        # 请求入口
│       │   │       └── netRequest.js   # net 模块请求
│       │   └── views/        # 页面视图
│       └── index.html
├── .env.development          # 开发环境变量
└── .env.production           # 生产环境变量
├── dev-app-update.yml        # 开发环境更新配置
├── electron-builder.yml      # 打包配置
├── electron.vite.config.mjs  # Vite 配置
└── package.json
```

## 开发

### 运行

```bash
# 安装依赖
$ yarn

# 运行项目
$ yarn dev
```

### 调试

- **F12**: 打开/关闭 DevTools
- **Ctrl+Shift+I**: 打开 DevTools
- 注意：`Electron` 的 `net` 请求无法在 DevTools Network 面板查看请求，可在控制台中查看日志

### 打包

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

### 发布流程

```bash
# 配置文件
# 开发环境 dev-app-update.yml
# 生成环境 electron-builder.yml

# ========== 第1次发布（v1.0.0）==========

# 1. 设置版本
npm version 1.0.0

# 2. 打包
yarn build:win

# 3. 上传（首次安装包）
scp dist/electron-boilerplate-pure-1.0.0-setup.exe user@server:/electron-boilerplate-pure/pure-updates/


# ========== 第2次发布（v1.0.1）==========

# 1. 升级版本
npm version 1.0.1

# 2. 打包
yarn build:win

# 3. 填写更新日志
# latest.yml 中的 releaseNotes 字段填写更新日志
# 格式：
releaseNotes: |
  修复了一些已知问题
  优化了应用性能
  提升了用户体验

# 强制更新标记（可选，默认 false）
forceUpdate: true
# 最低支持版本（可选，一般为最近的强制更新版本，低于此版本时也会强制更新）
minSupportVersion: 1.0.1

# 4. 上传到更新服务器
scp dist/latest.yml user@server:/electron-boilerplate-pure/pure-updates/
scp dist/electron-boilerplate-pure-1.0.1-setup.exe user@server:/electron-boilerplate-pure/pure-updates/

# 5. 已安装 v1.0.0 的用户下次启动时会自动检测到更新
```

## 常见问题

### 1. 中文乱码问题

**问题**: 问题描述：在 Windows 系统上，终端打印显示的中文字符出现乱码。

**解决**: 确保系统区域设置中启用了 UTF-8 支持（Windows 设置 → 区域 → 管理 → 更改系统区域设置 → 勾选"Beta: 使用 Unicode UTF-8 提供全球语言支持"）

### 2. 打包失败：文件被占用

**问题**: `EBUSY: resource busy or locked`

**解决**: 关闭开发工具，删除 `dist` 目录，重新打包

## License

2026 © Lucifer, Released under the MIT License.

[个人网站](https://superlucifer.cn) · [GitHub](https://github.com/luciferoho)
