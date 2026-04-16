<template>
  <el-dialog
    class="modern-update-dialog"
    v-model="visible"
    :show-close="false"
    width="520px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    align-center
    :z-index="9998"
  >
    <div class="update-container">
      <!-- 标题 -->
      <h2 class="update-title">{{ isForceUpdate ? '⚠️ 版本过低' : '检测到新版本' }}</h2>

      <!-- 强制更新提示 -->
      <div v-if="isForceUpdate" class="force-update-notice">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <span>当前版本【{{ currentVersion }}】已停止支持，请更新后继续使用</span>
      </div>

      <!-- 版本信息 -->
      <div class="version-section">
        <div class="version-number">{{ updateInfo?.version }}</div>
        <div class="version-date">{{ formatDate(updateInfo?.releaseDate) }}</div>
      </div>

      <!-- 更新日志 -->
      <div class="changelog-section">
        <ul class="changelog-list">
          <li v-for="(item, index) in changelogList" :key="index" class="changelog-item">
            <span class="changelog-icon">[↓]</span>
            <span class="changelog-text">{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- 下载进度 -->
      <div v-if="downloading" class="download-section">
        <el-progress
          :percentage="Math.round(downloadProgress)"
          :status="downloadProgress === 100 ? 'success' : ''"
          :stroke-width="6"
          :show-text="false"
        />
        <div class="download-status">
          {{
            downloadProgress === 100
              ? '下载完成，准备安装...'
              : `正在下载更新 ${Math.round(downloadProgress)}%`
          }}
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-section">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span class="error-text">{{ error }}</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="!downloading && !downloaded">
          <button v-if="!isForceUpdate" class="btn-secondary" @click="handleLater">
            等待下次更新
          </button>
          <button class="btn-primary" @click="handleUpdate">开始更新</button>
        </template>

        <template v-if="downloading">
          <button class="btn-secondary" disabled>下载中...</button>
        </template>

        <template v-if="downloaded">
          <button v-if="!isForceUpdate" class="btn-secondary" @click="handleLater">稍后重启</button>
          <button class="btn-primary" @click="handleInstall">立即重启</button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { Warning } from '@element-plus/icons-vue'
  import useUpdate from '../../composables/useUpdate.js'

  const { downloadUpdate, installUpdate } = useUpdate()

  const props = defineProps({
    updateInfo: {
      type: Object,
      default: () => ({})
    }
  })

  const emit = defineEmits(['close', 'skip'])

  const visible = ref(false)
  const downloading = ref(false)
  const downloaded = ref(false)
  const downloadProgress = ref(0)
  const error = ref('')

  // 解析更新日志
  const changelogList = computed(() => {
    const notes = props.updateInfo?.releaseNotes
    if (!notes) {
      // 如果没有提供更新日志，返回默认提示
      return ['修复了一些已知问题', '优化了应用性能', '提升了用户体验']
    }
    if (typeof notes === 'string') {
      return notes
        .split('\n')
        .filter(n => n.trim())
        .map(n => n.replace(/^[-*]\s*/, ''))
    }
    if (Array.isArray(notes)) return notes
    return []
  })

  const currentVersion = ref('')

  // 当前版本低于最低支持版本时也强制更新
  const isForceUpdate = computed(() => {
    const forceUpdate = props.updateInfo?.forceUpdate || false
    const minSupportVersion = props.updateInfo?.minSupportVersion

    // 如果已经标记为强制更新，直接返回
    if (forceUpdate) return true

    // 如果当前版本低于最低支持版本，也强制更新
    if (currentVersion.value && minSupportVersion) {
      return compareVersion(currentVersion.value, minSupportVersion) < 0
    }

    return false
  })

  // 版本号比较函数
  function compareVersion(v1, v2) {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    const maxLen = Math.max(parts1.length, parts2.length)

    for (let i = 0; i < maxLen; i++) {
      const p1 = parts1[i] || 0
      const p2 = parts2[i] || 0
      if (p1 < p2) return -1
      if (p1 > p2) return 1
    }
    return 0
  }

  // 格式化日期
  function formatDate(date) {
    if (!date) {
      // 返回当前日期作为默认值
      const now = new Date()
      return now
        .toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(/\//g, '-')
    }
    const d = new Date(date)
    return d
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
      .replace(/\//g, '-')
  }

  // 显示对话框
  async function show() {
    currentVersion.value = await window.api.getAppVersion()
    visible.value = true
    downloading.value = false
    downloaded.value = false
    downloadProgress.value = 0
    error.value = ''
  }

  // 开始更新
  async function handleUpdate() {
    downloading.value = true
    error.value = ''

    const result = await downloadUpdate()

    if (!result.success) {
      error.value = result.error || '下载失败，请稍后重试'
      downloading.value = false
    }
  }

  // 安装更新
  function handleInstall() {
    installUpdate()
  }

  // 稍后更新
  function handleLater() {
    visible.value = false
    emit('close')
  }

  // 更新下载进度
  function updateProgress(progress) {
    downloadProgress.value = progress.percent || 0
  }

  // 下载完成
  function onDownloaded() {
    downloading.value = false
    downloaded.value = true
  }

  // 下载错误
  function onError(message) {
    error.value = message
    downloading.value = false
  }

  defineExpose({
    show,
    updateProgress,
    onDownloaded,
    onError
  })
</script>

<style lang="scss" scoped>
  .modern-update-dialog {
    :deep(.el-dialog) {
      border-radius: 12px;
      background: var(--el-bg-color);
      box-shadow: var(--el-box-shadow-dark);
    }

    :deep(.el-dialog__header) {
      display: none;
    }

    :deep(.el-dialog__body) {
      padding: 32px 32px 16px;
      color: var(--el-text-color-primary);
    }

    :deep(.el-dialog__footer) {
      padding: 16px 32px 32px;
      border-top: none;
    }
  }

  .update-container {
    .update-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 24px 0;
      line-height: 1.4;
    }

    .force-update-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--el-color-danger-light-9);
      border: 1px solid var(--el-color-danger-light-5);
      border-radius: 8px;
      margin-bottom: 20px;
      color: var(--el-color-danger);
      font-size: 14px;

      .warning-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
    }

    .version-section {
      margin-bottom: 16px;

      .version-number {
        font-size: 24px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .version-date {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .changelog-section {
      background: var(--el-fill-color-light);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
      max-height: 280px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color-lighter);

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 2px;
      }

      .changelog-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .changelog-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 6px 0;
        font-size: 13px;
        line-height: 1.6;
        color: var(--el-text-color-regular);

        .changelog-icon {
          color: var(--el-color-success);
          font-size: 12px;
          font-family: monospace;
          flex-shrink: 0;
          margin-top: 1px;
          user-select: none;
        }

        .changelog-text {
          flex: 1;
        }
      }
    }

    .download-section {
      margin-bottom: 16px;

      :deep(.el-progress-bar__outer) {
        background-color: var(--el-fill-color);
        border-radius: 3px;
      }

      :deep(.el-progress-bar__inner) {
        background-color: var(--el-color-success);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .download-status {
        text-align: center;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 8px;
      }
    }

    .error-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--el-color-danger-light-9);
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid var(--el-color-danger-light-7);

      .error-icon {
        color: var(--el-color-danger);
        font-size: 16px;
      }

      .error-text {
        font-size: 13px;
        color: var(--el-color-danger);
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .btn-secondary {
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;

      &:hover:not(:disabled) {
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-light);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-color-success);
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;

      &:hover {
        color: var(--el-color-success-dark-2);
        background: var(--el-color-success-light-9);
      }
    }
  }
</style>
