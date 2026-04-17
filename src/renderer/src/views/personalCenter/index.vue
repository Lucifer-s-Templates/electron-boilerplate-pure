<template>
  <div class="app-container personal-center">
    <div class="personal-main">
      <UserInfo />
      <div class="module-container">
        <div class="module-item" v-for="item in moduleList" :key="item.key">
          <div class="module-item-main" @click="onModuleClick(item)">
            <div class="module-icon" :style="{ backgroundColor: item.iconBgColor }">
              <el-icon :size="30" color="#fff">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="module-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="personal-footer">
      <el-button type="primary" size="large" @click="handleLogout">退出系统</el-button>
    </div>
    <!-- 修改基本信息 -->
    <BaseInfoEdit ref="baseInfoEditRef" @save-success="onBaseInfoSaveSuccess" />
    <!-- 修改密码 -->
    <PasswordEdit ref="passwordEditRef" @save-success="onPwdSaveSuccess" />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import useUserStore from '@renderer/store/modules/user'
  import { getSystemFile } from '@renderer/api/personalCenter'
  import UserInfo from './components/UserInfo.vue'
  import BaseInfoEdit from './components/BaseInfoEdit.vue'
  import PasswordEdit from './components/PasswordEdit.vue'

  const router = useRouter()
  const userStore = useUserStore()
  const { proxy } = getCurrentInstance()
  const baseInfoEditRef = ref(null)
  const passwordEditRef = ref(null)

  // 模块列表
  const moduleList = [
    {
      key: 'baseInfoEdit',
      name: '修改基本信息',
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
      routeName: 'Feedback'
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

  function onModuleClick(item) {
    if (item.onClick) {
      item.onClick()
      return
    }
    if (item.routeName) {
      router.push({ name: item.routeName })
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
    position: relative;

    .personal-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: calc(100% - 65px);
      overflow: auto;

      .module-container {
        --item-gap: 40px;
        --side-margin: 20px;
        width: calc(100% - var(--side-margin) * 2);
        display: flex;
        flex-wrap: wrap;
        background: var(--el-bg-color);
        border-radius: 10px;
        padding: 40px;
        gap: var(--item-gap);
        margin: 40px var(--side-margin);
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);

        .module-item {
          width: calc((100% - var(--item-gap) * 4) / 5);
          display: flex;
          align-items: center;
          justify-content: center;

          .module-item-main {
            width: fit-content;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            user-select: none;

            &:hover {
              .module-icon {
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              }

              .module-icon .el-icon {
                animation: wiggle 0.5s ease;
              }

              .module-name {
                font-weight: 600;
              }
            }

            .module-icon {
              padding: 16px;
              border-radius: 6px;
              line-height: 1;
            }

            .module-name {
              font-size: 14px;
              line-height: 14px;
              color: var(--el-text-color-primary);
              margin-top: 12px;
            }

            @keyframes wiggle {
              25% {
                transform: rotate(10deg);
              }
              75% {
                transform: rotate(-10deg);
              }
            }
          }
        }
      }
    }

    .personal-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px 16px;
      background: var(--el-bg-color);
      border-top: 1px solid var(--el-border-color);

      .el-button {
        width: 240px;
        border-radius: 20px;
      }
    }
  }
</style>
