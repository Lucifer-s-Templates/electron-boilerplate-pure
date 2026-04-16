<template>
  <div class="app">
    <TitleBar />
    <div class="app-content">
      <router-view />
    </div>
  </div>
  <!-- 更新弹窗 -->
  <UpdateDialog ref="updateDialogRef" :update-info="updateInfo" @close="handleUpdateClose" />
</template>

<script setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import useSettingStore from './store/modules/setting.js'
  import useUserStore from './store/modules/user.js'
  import useUpdate from './composables/useUpdate.js'
  import TitleBar from './components/TitleBar/index.vue'
  import UpdateDialog from './components/UpdateDialog/index.vue'

  const { onShowUpdateDialog, onDownloadProgress, onUpdateDownloaded } = useUpdate()
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  const updateDialogRef = ref(null)
  const updateInfo = ref({})
  let unlistenShowDialog = null
  let unlistenProgress = null
  let unlistenDownloaded = null
  const hasUpdate = ref(false)

  settingStore.init()

  onMounted(() => {
    // 监听显示更新对话框事件
    unlistenShowDialog = onShowUpdateDialog(info => {
      console.log('显示更新对话框', info)
      hasUpdate.value = true
      updateInfo.value = info
      updateDialogRef.value?.show()
    })

    // 监听下载进度
    unlistenProgress = onDownloadProgress(progress => {
      updateDialogRef.value?.updateProgress(progress)
    })

    // 监听下载完成
    unlistenDownloaded = onUpdateDownloaded(() => {
      updateDialogRef.value?.onDownloaded()
    })

    // 打开应用时，获取用户信息
    userStore.token && userStore.getUserInfo()
  })

  onBeforeUnmount(() => {
    // 取消监听
    unlistenShowDialog?.()
    unlistenProgress?.()
    unlistenDownloaded?.()
  })

  function handleUpdateClose() {
    updateInfo.value = {}
  }
</script>

<style lang="scss">
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;

    .app-content {
      flex: 1;
      overflow: auto;
      background-color: var(--el-bg-color);
    }
  }
</style>
