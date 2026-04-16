<template>
  <div class="file-upload">
    <div
      class="file-upload__main"
      :class="{ 'is-dragover': isDragOver }"
      @click="handleFileSelect"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <el-icon class="file-upload__icon">
        <UploadFilled />
      </el-icon>
      <div class="file-upload__text">拖拽到此处或 <em>点击上传</em></div>
    </div>
    <div class="file-upload__tip">
      最多只能上传 {{ maxFileCount }} 个文件，每个文件大小不能超过 {{ formatFileSize(maxFileSize) }}
    </div>
    <div class="file-list">
      <div class="file-item" v-for="(item, index) in files" :key="item.uuid">
        <div class="file-item__left">
          <el-icon class="file-icon">
            <Document />
          </el-icon>
          <div class="file-name">{{ item.name }}</div>
        </div>
        <div class="file-item__right">
          <div class="file-size">{{ formatFileSize(item.size) }}</div>
          <el-icon class="del-icon" @click="handleFileDelete(index)"><Close /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { formatFileSize } from '../../../utils/index.js'
  const { proxy } = getCurrentInstance()

  const props = defineProps({
    // 限制可选文件类型，默认所有文件
    // all-所有文件, image-图片文件, video-视频文件, audio-音频文件, document-文档文件, archive-压缩文件
    fileTypes: {
      type: Array,
      default: () => []
    },
    // 限制上传文件数量，默认9个
    maxFileCount: {
      type: Number,
      default: 9
    },
    // 限制上传文件大小，默认100MB
    maxFileSize: {
      type: Number,
      default: 100 * 1024 * 1024
    }
  })

  const files = defineModel('files', {
    default: () => [],
    type: Array
  })

  // 拖拽状态
  const isDragOver = ref(false)

  // 拖拽进入
  function handleDragOver() {
    isDragOver.value = true
  }

  // 拖拽离开
  function handleDragLeave() {
    isDragOver.value = false
  }

  // 处理拖拽放下
  async function handleDrop(event) {
    isDragOver.value = false

    const dtFiles = event.dataTransfer.files
    if (!dtFiles || dtFiles.length === 0) {
      return
    }

    const filePaths = []

    // 使用 Electron 的 webUtils.getPathForFile 获取文件路径
    for (let i = 0; i < dtFiles.length; i++) {
      const file = dtFiles[i]
      try {
        // 使用 preload 暴露的 getPathForFile 方法
        const filePath = window.api.getPathForFile(file)
        if (filePath) {
          filePaths.push(filePath)
        }
      } catch (error) {
        console.error('获取拖拽文件路径失败:', error)
      }
    }

    if (filePaths.length > 0) {
      await addFiles(filePaths)
    }
  }

  // 打开选择文件对话框
  async function handleFileSelect() {
    try {
      const openRes = await window.api.openFiles({ defaultPath: '', fileTypes: props.fileTypes })
      if (!openRes.canceled && openRes.filePaths.length > 0) {
        await addFiles(openRes.filePaths)
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      proxy.$message.error('选择文件失败')
    }
  }

  // 添加文件
  async function addFiles(filePaths) {
    let addedCount = 0
    let skippedCount = 0

    for (const filePath of filePaths) {
      const fileName = filePath.split(/[\\/]/).pop()

      // 获取文件信息
      let fileSize = 0
      let fileType = ''
      try {
        const { success: getFileInfoSuccess, fileInfo } = await window.api.getFileInfo(filePath)
        if (getFileInfoSuccess) {
          fileSize = fileInfo.size
          fileType = fileInfo.type
        }
      } catch (e) {
        // 获取不到文件信息时，size 保持为 0
      }

      const fileObj = {
        name: fileName,
        type: fileType,
        path: filePath,
        size: fileSize
      }

      // 使用公共校验函数
      if (!validateFileCanAdd(fileObj, fileName)) {
        skippedCount++
        continue
      }

      // 添加到文件列表
      files.value.push({
        name: fileName,
        type: fileType,
        path: filePath,
        size: fileSize,
        uid: getUUID()
      })
      addedCount++
    }

    if (addedCount > 0) {
      proxy.$message.success(`已添加 ${addedCount} 个文件`)
    }
    if (skippedCount > 0) {
      proxy.$message.warning(`${skippedCount} 个文件因限制未添加`)
    }
  }

  // 生成随机id
  function getUUID() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // 公共校验函数：检查是否可以添加文件
  function validateFileCanAdd(file, fileName) {
    // 检查文件数量限制
    if (files.value.length >= props.maxFileCount) {
      proxy.$message.warning(`最多只能上传 ${props.maxFileCount} 个文件`)
      return false
    }

    // 检查文件大小限制
    const size = typeof file.size === 'number' ? file.size : 0
    if (size > props.maxFileSize) {
      proxy.$message.warning(
        `文件【${fileName}】大小超过 ${formatFileSize(props.maxFileSize)}，无法添加`
      )
      return false
    }

    // 检查文件是否已存在
    const path = file.path || (typeof file === 'string' ? file : '')
    if (path && files.value.some(item => item.path === path)) {
      proxy.$message.warning(`文件【${fileName}】已存在`)
      return false
    }

    return true
  }

  // 移除文件
  function handleFileDelete(index) {
    files.value.splice(index, 1)
  }

  defineExpose({
    addFiles,
    validateFileCanAdd,
    getUUID
  })
</script>
<style lang="scss" scoped>
  .file-upload {
    .file-upload__main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 10px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      user-select: none;
      position: relative;
      z-index: 2;

      &::before {
        content: '';
        width: 100%;
        height: 100%;
        border-radius: 6px;
        position: absolute;
        border: 1px dashed var(--el-border-color);
        top: 0;
        left: 0;
        z-index: -1;
      }

      &:hover::before {
        border-color: var(--el-color-primary);
      }

      &.is-dragover::before {
        border-width: 2px;
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .file-upload__icon {
        font-size: 67px;
        color: var(--el-text-color-secondary);
        margin-bottom: 16px;
      }

      .file-upload__text {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1;

        em {
          color: var(--el-color-primary);
          font-style: normal;
        }
      }
    }

    .file-upload__tip {
      font-size: 12px;
      color: var(--el-text-color-regular);
      margin-top: 7px;
    }

    .file-list {
      margin-top: 10px;

      .file-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: var(--el-text-color-regular);
        padding: 4px;
        margin-bottom: 5px;
        border-radius: 4px;
        transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);

        &__left {
          flex: 1;
          display: flex;
          align-items: center;

          .file-icon {
            font-size: 14px;
            flex-shrink: 0;
          }

          .file-name {
            flex: 1;
            margin-left: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        &__right {
          margin-left: 6px;
          flex-shrink: 0;
          width: fit-content;
          display: flex;
          align-items: center;

          .file-size {
            min-width: 54px;
            font-size: 12px;
            margin-right: 4px;
            text-align: right;
          }

          .del-icon {
            font-size: 14px;
            color: var(--el-text-color-regular);
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s ease;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }

        &:hover {
          background-color: var(--el-color-primary-light-9);

          .file-item__right .del-icon {
            opacity: 1;
          }
        }
      }
    }
  }
</style>
