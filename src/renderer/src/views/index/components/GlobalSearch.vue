<template>
  <div class="global-search">
    <div class="search-wrap">
      <el-input
        style="width: 50%"
        v-model="fileFilterText"
        placeholder="请输入文件名"
        size="large"
        :disabled="isSearching"
        @keyup.enter="handleFileSearch"
      >
        <template #append>
          <el-button :loading="isSearching" @click="handleFileSearch">搜索</el-button>
        </template>
      </el-input>
    </div>
    <!-- 搜索结果展示 -->
    <div v-if="searchResult.length > 0" class="search-result">
      <div class="search-result-header">
        <span>搜索结果 ({{ searchResult.length }})</span>
        <el-button link @click="searchResult = []">清空</el-button>
      </div>
      <div class="search-result-list">
        <div v-for="file in searchResult" :key="file.path" class="search-result-item">
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-path">{{ file.path }}</div>
            <div class="file-time">
              {{ formatDate(file.modifiedTime, 'yyyy-MM-dd HH:mm') }}
            </div>
          </div>
          <div class="file-meta">
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
            <div class="flex-row">
              <el-button type="primary" size="small" @click="previewFile(file)">预览</el-button>
              <el-button type="success" size="small" @click="selectSearchFile(file)">
                选择
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { formatFileSize, formatDate } from '../../../utils/index.js'

  const { proxy } = getCurrentInstance()
  const emit = defineEmits(['select'])

  // 文件查询
  const fileFilterText = ref('')
  const searchResult = ref([])
  const isSearching = ref(false)

  // 搜索文件
  async function handleFileSearch() {
    const keyword = fileFilterText.value.trim()
    if (!keyword) {
      proxy.$message.warning('请输入文件名')
      return
    }

    isSearching.value = true
    searchResult.value = []

    try {
      const results = await window.api.searchFiles(keyword)
      searchResult.value = results
      if (results.length === 0) {
        proxy.$message.info('未找到匹配的文件')
      } else {
        proxy.$message.success(`找到 ${results.length} 个文件`)
      }
    } catch (error) {
      console.error('搜索文件失败:', error)
      proxy.$message.error('搜索文件失败')
    } finally {
      isSearching.value = false
    }
  }

  // 预览文件
  async function previewFile(file) {
    try {
      const result = await window.api.openFile(file.path)
      if (!result.success) {
        proxy.$message.error('打开文件失败: ' + result.error)
      }
    } catch (error) {
      console.error('预览文件失败:', error)
      proxy.$message.error('预览文件失败')
    }
  }

  // 选择文件
  function selectSearchFile(file) {
    emit('select', { file })
  }
</script>

<style lang="scss" scoped>
  .global-search {
    width: 100%;

    .search-wrap {
      display: flex;
      justify-content: center;
      padding: 16px;

      :deep(.el-input-group--append > .el-input__wrapper) {
        border-radius: 20px 0 0 20px;
      }

      :deep(.el-input-group__append) {
        border-radius: 0 20px 20px 0;
        background-color: #409eff;
        box-shadow:
          0 1px 0 0 #409eff inset,
          0 -1px 0 0 #409eff inset,
          -1px 0 0 0 #409eff inset;
        padding: 0 24px;
        color: #fff;
        cursor: pointer;

        &:hover {
          background-color: #79bbff;
          box-shadow:
            0 1px 0 0 #79bbff inset,
            0 -1px 0 0 #79bbff inset,
            -1px 0 0 0 #79bbff inset;
        }
      }

      :deep(.el-button.is-loading:before) {
        top: -5px;
        left: -8px;
        bottom: -5px;
        right: -5px;
      }
    }

    // 搜索结果样式
    .search-result {
      margin: 16px;
      background: var(--el-bg-color);
      border-radius: 4px;
      border: 1px solid var(--el-border-color);
      max-height: 300px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .search-result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--el-border-color);
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .search-result-list {
        overflow-y: auto;
        flex: 1;

        .search-result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--el-border-color);
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--el-bg-color-page);
          }

          &:last-child {
            border-bottom: none;
          }

          .file-info {
            flex: 1;
            min-width: 0;
            margin-right: 16px;

            .file-name {
              font-size: 14px;
              color: var(--el-text-color-primary);
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .file-path {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-top: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .file-time {
              font-size: 11px;
              color: var(--el-text-color-secondary);
              margin-top: 2px;
            }
          }

          .file-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;

            .file-size {
              font-size: 12px;
              color: var(--el-text-color-regular);
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
</style>
