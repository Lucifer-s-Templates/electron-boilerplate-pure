<template>
  <div class="app-container notice-page">
    <el-splitter>
      <el-splitter-panel size="30%" :min="280">
        <div class="notice-header">
          <el-icon
            class="cursor-pointer mr-10"
            size="16"
            color="var(--el-text-color-primary)"
            @click="router.go(-1)"
          >
            <ArrowLeft />
          </el-icon>
          <div class="notice-title">
            公告
            <span v-if="total" class="total">(共{{ total }}条)</span>
          </div>
          <div class="notice-tool">
            <transition name="fade">
              <div v-if="scrollTopDistance > 800" style="line-height: 1" class="mr-10">
                <el-tooltip content="回到顶部" placement="top">
                  <el-button size="small" circle icon="Top" @click="scrollToTop"></el-button>
                </el-tooltip>
              </div>
            </transition>
            <el-tooltip content="刷新" placement="top">
              <el-button size="small" circle icon="Refresh" @click="refresh"></el-button>
            </el-tooltip>
          </div>
        </div>
        <div v-loading="loading" class="notice-list">
          <el-scrollbar ref="scrollbarRef" height="100%" @scroll="onScroll" @end-reached="loadMore">
            <div
              class="notice-item"
              v-for="item in list"
              :key="item.id"
              :class="{ 'notice-item--active': item.id === activeRow.id }"
              @click="onItemClick(item)"
            >
              <div class="notice-item__content">{{ item.title }}</div>
              <div class="notice-item__time">{{ formatDate(item.createTime) }}</div>
              <div
                class="notice-item__status"
                :style="{
                  '--dot-color': item.status === 1 ? '#67c23a' : '#909399'
                }"
              ></div>
            </div>
            <div v-if="isLast" class="no-more">加载完毕</div>
            <el-empty v-if="!list.length" description="暂无数据"></el-empty>
          </el-scrollbar>
        </div>
      </el-splitter-panel>
      <el-splitter-panel v-if="list.length" :min="300">
        <div class="notice-header">
          <div class="notice-title">详情</div>
        </div>
        <div class="pb-16 px-16">
          <el-empty v-if="!activeRow.id" description="请选择一条公告"></el-empty>
          <el-descriptions v-else border :column="1" label-width="80px">
            <el-descriptions-item label="启用状态" label-align="center">
              <el-tag size="small" :type="activeRow.status === 0 ? 'success' : 'info'">
                {{ activeRow.status === 1 ? '已启用' : '未启用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" label-align="center">
              {{ formatDate(activeRow.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="公告内容" label-align="center">
              <div class="notice-content" v-html="formatContent(activeRow.content)"></div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>
<script setup>
  import { getNoticeList } from '../../api/notice'
  import { formatDate } from '../../utils'
  const router = useRouter()

  const loading = ref(false)
  const queryParams = ref({
    pageNum: 1,
    pageSize: 20
  })
  const list = ref([])
  const total = ref(0)
  const isLast = ref(false)
  const activeRow = ref({})
  const scrollbarRef = ref(null)
  const scrollTopDistance = ref(0)

  // 查询列表
  async function getList() {
    loading.value = true
    try {
      const res = await getNoticeList({ ...queryParams.value })
      const data = res?.data?.objs || []
      list.value = [...list.value, ...data]
      total.value = res?.data?.rows || 0
      isLast.value = res?.data?.last
    } finally {
      loading.value = false
    }
  }
  getList()

  // 触底加载下一页数据
  function loadMore() {
    if (isLast.value) {
      return
    }
    queryParams.value.pageNum++
    getList()
  }

  // 刷新
  function refresh() {
    queryParams.value.pageNum = 1
    list.value = []
    total.value = 0
    isLast.value = false
    activeRow.value = {}
    getList()
  }

  // 监听滚动事件
  function onScroll({ scrollTop }) {
    scrollTopDistance.value = scrollTop
  }

  // 滚动到顶部
  function scrollToTop() {
    scrollbarRef.value?.setScrollTop(0)
  }

  // 点击列表项
  function onItemClick(item) {
    activeRow.value = item
  }

  // 处理公告内容，将 \n 转换为 <br>
  function formatContent(content) {
    if (!content) return ''
    // 先将 \n 替换为 <br>，然后处理其他 HTML
    return content.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')
  }
</script>
<style lang="scss" scoped>
  .notice-page {
    background-color: var(--el-bg-color-page);
  }

  .el-splitter {
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    background: var(--el-bg-color);
  }

  .notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;

    .notice-title {
      flex: 1;
      font-size: 16px;
      line-height: 16px;
      color: var(--el-text-color-primary);
      font-weight: 600;

      .total {
        font-size: 14px;
        line-height: 14px;
        color: var(--el-text-color-secondary);
        margin-left: 5px;
      }
    }

    &:has(.notice-tool) {
      padding: 12px 16px;
    }

    .notice-tool {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      margin-left: 16px;
    }
  }

  .notice-list {
    width: 100%;
    height: calc(100% - 48px);

    :deep(.el-scrollbar__wrap) {
      padding: 0 16px;
    }

    .notice-item {
      padding: 12px 16px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.5s;
      position: relative;

      &:hover {
        box-shadow: var(--el-box-shadow);
        transform: translateX(4px);
      }

      &--active {
        border-color: var(--el-color-primary);
        transform: translateX(4px);
      }

      &__content {
        font-size: 14px;
        line-height: 14px;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__time {
        font-size: 12px;
        line-height: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 16px;
      }

      &__status {
        position: absolute;
        top: 4px;
        right: 4px;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-left: 8px;
        background-color: var(--dot-color);
      }
    }

    .notice-item + .notice-item {
      margin-top: 16px;
    }

    .no-more {
      font-size: 12px;
      line-height: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
      padding: 16px;
    }
  }

  // 淡入淡出动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  // 公告内容样式
  .notice-content {
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
