<template>
  <div class="sidebar">
    <div class="user-info">
      <div class="avatar">
        <el-image :src="avatar" alt="" />
      </div>
      <div class="real-name">{{ realName }}</div>
    </div>
    <div class="menu-container">
      <router-link
        class="menu-item"
        :class="{ active: route.path === menu.path || route.meta.activeMenu === menu.path }"
        v-for="menu in menuList"
        :key="menu.path"
        :to="menu.path"
      >
        <el-icon v-if="menu.meta.icon" style="margin-bottom: 6px" :size="24" color="#939393">
          <component :is="menu.meta.icon" />
        </el-icon>
        <div class="menu-name">
          {{ menu.meta.title }}
        </div>
      </router-link>
    </div>
    <div class="theme">
      <ThemeSwitch />
    </div>
  </div>
</template>

<script setup>
  import useUserStore from '../../store/modules/user'
  import ThemeSwitch from './ThemeSwitch.vue'

  const route = useRoute()
  const userStore = useUserStore()

  const avatar = computed(() => userStore.avatar)
  const realName = computed(() => userStore.userInfo.realName)

  const menuList = ref([
    {
      name: 'Index',
      path: '/index',
      meta: { title: '首页', icon: 'HomeFilled' }
    },
    {
      name: 'PersonalCenter',
      path: '/personalCenter',
      meta: { title: '我的', icon: 'UserFilled' }
    }
  ])
</script>

<style lang="scss" scoped>
  .sidebar {
    width: 100%;
    height: 100%;
    background-color: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color);

    .user-info {
      width: 100%;
      height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px 8px;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        user-select: none;

        .el-image {
          transition: transform 0.3s ease;
        }

        &:hover .el-image {
          transform: scale(1.1);
        }
      }

      .real-name {
        width: 100%;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-align: center;
        margin-top: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .menu-container {
      width: 100%;
      // 菜单容器高度 = 100% - 用户信息高度 - 主题切换高度
      height: calc(100% - 90px - 65px);
      padding: 8px 8px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .menu-item {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 4px;
        text-decoration: none;
        user-select: none;
        transition: all 0.5s ease;

        &:hover {
          .el-icon,
          .menu-name {
            color: var(--el-color-primary);
          }
        }

        &:focus-visible {
          outline: none;
        }

        &.active {
          background-color: var(--el-color-primary);

          .el-icon,
          .menu-name {
            color: #fff;
          }
        }

        .menu-name {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .theme {
      width: 100%;
      height: 65px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
</style>
