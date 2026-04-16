<template>
  <div class="user-info-container">
    <div class="header-bg"></div>
    <div class="header-content">
      <div class="avatar" :class="{ default: userStore.isDefaultAvatar }">
        <el-image :src="userStore.avatar" alt="" />
      </div>
      <div class="info">
        <div class="name">{{ userStore.userInfo.realName }}</div>
        <div class="phone">手机号：{{ userInfo.mobile || '无' }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
  import useUserStore from '../../../store/modules/user'
  const userStore = useUserStore()

  const userInfo = computed(() => userStore.userInfo || {})
</script>
<style lang="scss" scoped>
  .user-info-container {
    width: calc(100% - 180px);
    position: relative;
    padding-bottom: 80px;

    .header-bg {
      width: 100%;
      height: 180px;
      background-color: #a0cfff;
      border-radius: 10px 10px 0 0;
    }

    .header-content {
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 200px;
      display: flex;
      align-items: center;
      background: #1891ff;
      border-radius: 10px;
      padding-left: 80px;
      box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);

      .avatar {
        height: 80px;
        width: 80px;
        border: 3px solid #f5f5f5;
        border-radius: 50%;
        margin-right: 20px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;

        &.default {
          border: none;
          background-color: #f5f5f5;

          .el-image {
            width: 80%;
            height: 80%;
          }
        }

        .el-image {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
        }

        &:hover .el-image {
          transform: scale(1.1);
        }
      }

      .info {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .name {
          font-size: 14px;
          line-height: 14px;
          color: #fff;
          font-weight: 600;
        }

        .phone {
          font-size: 14px;
          line-height: 14px;
          color: #fff;
          margin-top: 10px;
        }
      }
    }
  }
</style>
