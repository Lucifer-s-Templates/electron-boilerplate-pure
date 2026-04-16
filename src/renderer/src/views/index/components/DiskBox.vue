<template>
  <div class="disk-list">
    <div class="disk-item" v-for="disk in diskList" :key="disk.key" @click="onDiskClick(disk)">
      <el-image class="disk-icon" :src="disk.icon" />
      <div class="disk-name">
        {{ disk.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import DesktopIcon from '../../../assets/icons/desktop.png'
  import DownloadIcon from '../../../assets/icons/download.png'
  import VideoIcon from '../../../assets/icons/video.png'
  import DocumentIcon from '../../../assets/icons/document.png'
  import DiskIcon from '../../../assets/icons/disk.png'
  import WechatIcon from '../../../assets/icons/wechat.png'
  import QQIcon from '../../../assets/icons/qq.png'
  import OtherIcon from '../../../assets/icons/other.png'

  const props = defineProps({
    // 限制可选文件类型，默认所有文件
    // all-所有文件, image-图片文件, video-视频文件, audio-音频文件, document-文档文件, archive-压缩文件
    fileTypes: {
      type: Array,
      default: () => []
    }
  })
  const emit = defineEmits(['select'])

  const diskList = [
    { key: 'desktop', name: '我的桌面', icon: DesktopIcon },
    { key: 'downloads', name: '我的下载', icon: DownloadIcon },
    { key: 'videos', name: '我的视频', icon: VideoIcon },
    { key: 'documents', name: '我的文档', icon: DocumentIcon },
    { key: 'C', name: '我的C盘', icon: DiskIcon },
    { key: 'wechat', name: '微信', icon: WechatIcon },
    { key: 'qq', name: 'QQ', icon: QQIcon },
    { key: 'other', name: '其他', icon: OtherIcon }
  ]
  // 盘符路径映射 - 使用系统实际路径
  const diskPathMap = reactive({
    desktop: '',
    downloads: '',
    videos: '',
    documents: '',
    C: 'C:\\',
    wechat: '',
    qq: '',
    other: ''
  })

  // 获取系统路径并更新映射
  async function initSystemPaths() {
    try {
      const paths = await window.api.getSystemPaths()
      diskPathMap.desktop = paths.desktop
      diskPathMap.downloads = paths.downloads
      diskPathMap.videos = paths.videos
      diskPathMap.documents = paths.documents
      // 设置微信和QQ的默认路径
      diskPathMap.wechat = `${paths.documents}\\WeChat Files`
      diskPathMap.qq = `${paths.documents}\\Tencent Files`
    } catch (error) {
      console.error('获取系统路径失败:', error)
    }
  }

  // 初始化系统路径
  initSystemPaths()

  // 点击盘符 - 打开文件选择对话框
  async function onDiskClick(disk) {
    const defaultPath = diskPathMap[disk.key] || ''
    try {
      const result = await window.api.openFiles({ defaultPath, fileTypes: props.fileTypes })
      if (!result.canceled && result.filePaths.length > 0) {
        emit('select', { filePaths: result.filePaths })
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      proxy.$message.error('选择文件失败')
    }
  }
</script>

<style lang="scss" scoped>
  .disk-list {
    display: flex;
    flex-wrap: wrap;
    gap: 48px;

    .disk-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 4px;
      min-width: 88px;
      transition: all 0.3s ease;
      user-select: none;

      .disk-icon {
        width: 48px;
        height: 48px;
        border-radius: 4px;
      }

      .disk-name {
        font-size: 14px;
        line-height: 1;
        margin-top: 10px;
      }

      &:hover {
        box-shadow: 0 0 10px #e4e7ed;

        .disk-name {
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }
</style>
