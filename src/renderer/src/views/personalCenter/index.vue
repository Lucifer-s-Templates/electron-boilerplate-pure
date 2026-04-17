<template>
  <div class="app-container personal-center">
    <div class="personal-card">
      <!-- 用户信息 -->
      <div class="left-section">
        <div class="user-profile">
          <div class="avatar-wrapper">
            <el-avatar class="user-avatar" :size="100" :src="userStore.avatar">
              <el-icon :size="40"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="nickname">{{ userInfo.realName || '昵称' }}</div>
        </div>
        <div class="user-contact">
          <div class="contact-item">
            <span class="label">手机号</span>
            <span class="value">{{ userInfo.mobile || '未绑定' }}</span>
          </div>
          <div class="contact-item">
            <span class="label">邮箱</span>
            <span class="value"> {{ userInfo.email || '未绑定' }}</span>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="right-section">
        <div class="menu-list">
          <div
            class="menu-item"
            v-for="item in moduleList"
            :key="item.key"
            @click="onModuleClick(item)"
          >
            <div class="menu-icon" :style="{ backgroundColor: item.iconBgColor }">
              <el-icon :size="20">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <span class="menu-name">{{ item.name }}</span>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section">
      <el-button type="danger" size="large" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>

    <!-- 基本信息 -->
    <BaseInfoEdit ref="baseInfoEditRef" @save-success="onBaseInfoSaveSuccess" />
    <!-- 修改密码 -->
    <PasswordEdit ref="passwordEditRef" @save-success="onPwdSaveSuccess" />
    <!-- 意见反馈 -->
    <Feedback ref="feedbackRef" />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import useUserStore from '@renderer/store/modules/user'
  import { getSystemFile } from '@renderer/api/personalCenter'
  import BaseInfoEdit from './components/BaseInfoEdit.vue'
  import PasswordEdit from './components/PasswordEdit.vue'
  import Feedback from './components/Feedback.vue'

  const router = useRouter()
  const userStore = useUserStore()
  const { proxy } = getCurrentInstance()
  const baseInfoEditRef = ref(null)
  const passwordEditRef = ref(null)
  const feedbackRef = ref(null)

  const userInfo = computed(() => userStore.userInfo || {})

  // 模块列表
  const moduleList = [
    {
      key: 'baseInfoEdit',
      name: '基本信息',
      icon: 'User',
      iconBgColor: '#409EFF',
      onClick: () => baseInfoEditRef.value.show()
    },
    {
      key: 'passwordEdit',
      name: '修改密码',
      icon: 'Edit',
      iconBgColor: '#E6A23C',
      onClick: () => passwordEditRef.value.show()
    },
    {
      key: 'feedback',
      name: '意见反馈',
      icon: 'Message',
      iconBgColor: '#0099FF',
      onClick: () => feedbackRef.value.show()
    },
    {
      key: 'softwareDescription',
      name: '软件说明',
      icon: 'Document',
      iconBgColor: '#FF7A8C',
      onClick: () => downloadSoftwareDescription()
    },
    {
      key: 'clientDownload',
      name: '客户端下载',
      icon: 'Download',
      iconBgColor: '#19BE6B',
      onClick: () => downloadClient()
    }
  ]

  // 点击功能模块
  function onModuleClick(item) {
    if (item.onClick) {
      item.onClick()
      return
    }
    proxy.$message.info('暂未开放')
  }

  // 基本信息修改成功
  async function onBaseInfoSaveSuccess() {
    proxy.$message.success('基本信息修改成功')
    const loading = proxy.$loading({
      lock: true,
      text: '正在刷新用户信息...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      await userStore.getUserInfo()
    } finally {
      loading.close()
    }
  }

  // 密码修改成功
  async function onPwdSaveSuccess() {
    proxy.$message.success('密码修改成功，请重新登录')
    handleLogout(false)
  }

  // 下载软件说明
  async function downloadSoftwareDescription() {
    const version = await window.api.getAppVersion()
    const loading = proxy.$loading({
      lock: true,
      text: '正在请求服务器，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      const res = await getSystemFile({
        // 类型 1-软件说明文档  2-客户端安装包
        fileType: 1,
        version
      })
      const { fileName } = res.data
      const fileBaseUrl = import.meta.env.VITE_APP_FILE_URL
      window.open(`${fileBaseUrl}/operation-manual/${fileName}`)
    } finally {
      loading.close()
    }
  }

  // 下载客户端
  async function downloadClient() {
    await proxy.$confirm('确定下载客户端吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const loading = proxy.$loading({
      lock: true,
      text: '正在请求服务器，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      // 不传版本号，直接下载最新版本
      const res = await getSystemFile({
        // 类型 1-软件说明文档  2-客户端安装包
        fileType: 2
      })
      const { fileName } = res.data
      const fileBaseUrl = import.meta.env.VITE_APP_FILE_URL
      window.open(`${fileBaseUrl}/${fileName}`)
    } finally {
      loading.close()
    }
  }

  // 退出系统
  async function handleLogout(showConfirm = true) {
    try {
      if (showConfirm) {
        await proxy.$confirm('确定退出系统吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      await userStore.logout()
      router.push('/login')
    } catch {}
  }
</script>

<style lang="scss" scoped>
  .personal-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: var(--el-bg-color-page);

    .personal-card {
      display: flex;
      width: 800px;
      min-height: 450px;
      background: var(--el-bg-color);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--el-box-shadow);
      overflow: hidden;
    }

    // 左侧区域
    .left-section {
      width: 340px;
      padding: 40px 50px 40px 30px;
      background: var(--el-bg-color);
      border-right: 1px solid var(--el-border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .user-profile {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30px;

        .avatar-wrapper {
          margin-bottom: 16px;

          .user-avatar {
            border: 3px solid var(--el-bg-color);
            box-shadow: var(--el-box-shadow-light);
            user-select: none;

            img {
              width: 80%;
              height: 80%;
            }

            &:hover img {
              transform: scale(1.1);
            }
          }
        }

        .nickname {
          font-size: 20px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .user-contact {
        width: 100%;

        .contact-item {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          margin-bottom: 16px;
          background: var(--el-bg-color);
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid var(--el-border-color);

          .label {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-right: 12px;
            min-width: 50px;
            user-select: none;
          }

          .value {
            flex: 1;
            font-size: 14px;
            color: var(--el-text-color-regular);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    // 右侧区域
    .right-section {
      flex: 1;
      padding: 30px;

      .menu-list {
        .menu-item {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          margin-bottom: 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: var(--el-color-primary-light-9);

            .arrow {
              color: var(--el-color-primary);
              transform: translateX(4px);
            }
          }

          .menu-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-right: 14px;
            color: #fff;
            transition: all 0.3s ease;
          }

          .menu-name {
            flex: 1;
            font-size: 15px;
            color: var(--el-text-color-primary);
            font-weight: 500;
          }

          .arrow {
            color: var(--el-text-color-secondary);
            font-size: 16px;
            transition: all 0.3s ease;
          }
        }
      }
    }

    // 退出登录按钮
    .logout-section {
      margin-top: 30px;

      .el-button {
        width: 200px;
        border-radius: 25px;
        font-size: 15px;

        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
</style>
