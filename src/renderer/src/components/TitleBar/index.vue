<template>
  <!-- 自定义标题栏 -->
  <div class="title-bar" :class="{ 'is-mac': isMac }">
    <!-- macOS 交通灯区域占位 -->
    <div v-if="isMac" class="traffic-light-area"></div>

    <!-- 左侧 Logo 和名称 -->
    <div
      class="title-bar-left"
      :class="{ 'cursor-pointer': userStore.token != '' }"
      @click="toIndex"
    >
      <img :src="Logo" class="app-logo" alt="logo" />
      <span class="app-name">{{ appName }}</span>
    </div>

    <!-- 窗口标题 -->
    <div class="title-bar-text">{{ title }}</div>

    <!-- 右侧按钮区域 -->
    <div class="title-bar-actions">
      <div v-if="showCustomControls" class="custom-controls">
        <el-button text circle size="small" @click="toNotice" title="通知公告">
          <el-icon>
            <Bell />
          </el-icon>
        </el-button>
        <el-dropdown trigger="click" @command="handleMenuCommand">
          <el-button class="menu-btn ml-8" text circle size="small" title="菜单">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="checkForUpdates">检查更新</el-dropdown-item>
              <el-dropdown-item command="toAbout">关于</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 窗口控制按钮 (Windows/Linux) -->
      <template v-if="!isMac">
        <div class="window-controls">
          <!-- 置顶按钮 -->
          <el-button
            text
            circle
            size="small"
            :type="isAlwaysOnTop ? 'primary' : ''"
            :title="isAlwaysOnTop ? '取消置顶' : '窗口置顶'"
            :disabled="isMaximized"
            @click="toggleAlwaysOnTop"
          >
            <svg-icon icon-class="thumbtack" />
          </el-button>
          <el-button text circle size="small" title="最小化" @click="minimizeWindow">
            <el-icon><Minus /></el-icon>
          </el-button>
          <el-button
            text
            circle
            size="small"
            :title="isMaximized ? '还原' : '最大化'"
            @click="maximizeWindow"
          >
            <el-icon>
              <FullScreen v-if="!isMaximized" />
              <CopyDocument v-else />
            </el-icon>
          </el-button>
          <el-button text circle size="small" class="close-btn" title="关闭" @click="closeWindow">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
    </div>

    <!-- 关于对话框 -->
    <el-dialog v-model="aboutDialogVisible" width="320px" align-center>
      <div class="about-content">
        <img :src="Logo" class="about-logo" alt="logo" />
        <h3 class="about-title">{{ appName }}</h3>
        <p class="about-item">版本：{{ appVersion }}</p>
        <p class="about-item">系统：{{ systemType }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import useUserStore from '@renderer/store/modules/user.js'
  import Logo from '@renderer/assets/images//logo/64x64.png'

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const { proxy } = getCurrentInstance()

  const appName = import.meta.env.VITE_APP_NAME || ''
  const title = computed(() => route.meta.title || '')
  const isMac = ref(false)
  const isMaximized = ref(false)
  const isAlwaysOnTop = ref(false)

  const showCustomControls = computed(() => {
    return !['/login', '/pwdLogin'].includes(route.path)
  })

  // 关于对话框
  const aboutDialogVisible = ref(false)
  const appVersion = ref('')
  const systemType = ref('')

  onMounted(() => {
    // 检测是否为 macOS
    isMac.value = navigator.platform.toLowerCase().includes('mac')

    // 监听窗口最大化状态
    if (window.api?.onWindowMaximized) {
      window.api.onWindowMaximized(maximized => {
        isMaximized.value = maximized
      })
    }

    // 监听置顶状态变化
    if (window.api?.onAlwaysOnTopChanged) {
      window.api.onAlwaysOnTopChanged(status => {
        isAlwaysOnTop.value = status
      })
    }
  })

  // 菜单命令处理
  async function handleMenuCommand(command) {
    if (command === 'checkForUpdates') {
      checkForUpdates()
    } else if (command === 'toAbout') {
      toAbout()
    }
  }

  // 检查更新
  async function checkForUpdates() {
    const loading = proxy.$loading({
      lock: true,
      text: '正在检查更新...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      const result = await window.api.checkForUpdates({ silent: false })
      console.log('检查更新结果:', result)
      if (!result.hasUpdate && !result.error) {
        proxy.$message.success('当前已是最新版本')
      }
      // 有更新或出错时，updateManager 会自动显示对话框
    } finally {
      loading.close()
    }
  }

  // 关于对话框
  async function toAbout() {
    appVersion.value = (await window.api.getAppVersion()) || '1.0.0'
    systemType.value = getSystemType()
    aboutDialogVisible.value = true
  }

  // 获取系统类型
  function getSystemType() {
    const platform = navigator.platform?.toLowerCase() || ''
    const userAgent = navigator.userAgent?.toLowerCase() || ''

    if (platform.includes('win') || userAgent.includes('windows')) {
      return 'Windows'
    } else if (
      platform.includes('mac') ||
      userAgent.includes('macintosh') ||
      userAgent.includes('mac os x')
    ) {
      return 'macOS'
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      return 'Linux'
    }
    return 'Unknown'
  }

  // 窗口控制
  function minimizeWindow() {
    window.api.minimizeWindow()
  }

  // 最大化/还原窗口
  function maximizeWindow() {
    if (isAlwaysOnTop.value) {
      toggleAlwaysOnTop()
    }
    window.api.maximizeWindow()
  }

  function closeWindow() {
    window.api.closeWindow()
  }

  // 切换置顶状态
  function toggleAlwaysOnTop() {
    window.api.setAlwaysOnTop(!isAlwaysOnTop.value)
  }

  // 跳转首页
  function toIndex() {
    if (!userStore.token) return
    router.push('/index')
  }

  // 跳转公告页面
  function toNotice() {
    router.push('/notice')
  }
</script>

<style lang="scss" scoped>
  .title-bar {
    display: flex;
    align-items: center;
    height: 40px;
    background: var(--el-bg-color);
    -webkit-app-region: drag; // 允许拖拽窗口
    user-select: none;
    border-bottom: 1px solid var(--el-border-color);

    &.is-mac {
      height: 38px;
    }

    .traffic-light-area {
      width: 80px;
      flex-shrink: 0;
      -webkit-app-region: no-drag;
    }

    .title-bar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      -webkit-app-region: no-drag;

      .app-logo {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .app-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .title-bar-text {
      flex: 1;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      padding: 0 16px;
    }

    .title-bar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      -webkit-app-region: no-drag; // 按钮区域不可拖拽

      .custom-controls {
        display: flex;
        align-items: center;
        border-right: 1px solid var(--el-border-color-lighter);
        padding-right: 8px;
        box-sizing: border-box;

        .upload-task-btn {
          &.is-uploading {
            background: var(--el-color-primary-light-9);

            .upload-icon {
              animation: uploadFly 1.5s ease-in-out infinite;
            }
          }
        }

        .menu-btn {
          .el-icon {
            transform: rotate(90deg);
          }
        }
      }

      @keyframes uploadFly {
        0% {
          transform: translateY(6px);
          opacity: 0;
        }
        20% {
          transform: translateY(0px);
          opacity: 1;
        }
        100% {
          transform: translateY(-10px);
          opacity: 0;
        }
      }

      .window-controls {
        display: flex;
        align-items: center;

        .close-btn {
          &:hover {
            color: #fff;
            background: #ff4d4f;
          }
        }
      }

      .el-button + .el-button {
        margin-left: 8px;
      }

      .el-button:focus-visible {
        outline: none;
      }
    }
  }

  // 关于对话框样式
  .about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;

    .about-logo {
      width: 64px;
      height: 64px;
      object-fit: contain;
      margin-bottom: 16px;
    }

    .about-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
    }

    .about-item {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin: 4px 0;
    }
  }
</style>
