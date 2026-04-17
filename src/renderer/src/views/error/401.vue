<template>
  <div class="http401-container">
    <img class="pic-401" src="@renderer/assets/images/error/401.svg" alt="401" />
    <div class="error">
      <div class="error__oops">401错误!</div>
      <div class="error__headline">您没有访问权限！</div>
      <div class="error__info">对不起，您没有访问权限，请不要进行非法操作！</div>
      <div class="error__btn-container">
        <router-link class="home-btn" to="/index"> 返回首页 </router-link>
        <button class="back-btn" @click="back">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  const route = useRoute()
  const router = useRouter()

  function back() {
    if (route.query.noGoBack) {
      router.push({ path: '/' })
    } else {
      router.go(-1)
    }
  }
</script>

<style lang="scss" scoped>
  .http401-container {
    width: 100%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    padding: 0 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    .pic-401 {
      width: 500px;
      height: 500px;
      user-select: none;
    }

    .error {
      padding: 30px;

      &__oops {
        font-size: 32px;
        font-weight: bold;
        line-height: 40px;
        color: var(--el-color-danger);
        opacity: 0;
        margin-bottom: 20px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
      }

      &__headline {
        font-size: 20px;
        line-height: 24px;
        color: var(--el-text-color-primary);
        font-weight: bold;
        opacity: 0;
        margin-bottom: 10px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.1s;
        animation-fill-mode: forwards;
      }

      &__info {
        font-size: 13px;
        line-height: 21px;
        color: var(--el-text-color-secondary);
        opacity: 0;
        margin-bottom: 30px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.2s;
        animation-fill-mode: forwards;
      }

      &__btn-container {
        display: flex;
        align-items: center;

        .home-btn {
          display: block;
          width: 110px;
          height: 36px;
          background: var(--el-color-primary);
          border-radius: 100px;
          text-align: center;
          color: #ffffff;
          opacity: 0;
          font-size: 14px;
          line-height: 36px;
          cursor: pointer;
          animation-name: slideUp;
          animation-duration: 0.5s;
          animation-delay: 0.3s;
          animation-fill-mode: forwards;
        }

        .back-btn {
          display: block;
          width: 110px;
          height: 36px;
          line-height: 36px;
          background: var(--el-color-primary);
          border: none;
          border-radius: 100px;
          text-align: center;
          font-size: 14px;
          color: #ffffff;
          text-decoration: underline;
          opacity: 0;
          cursor: pointer;
          margin-left: 20px;
          animation-name: slideUp;
          animation-duration: 0.5s;
          animation-delay: 0.3s;
          animation-fill-mode: forwards;
        }
      }

      @keyframes slideUp {
        0% {
          transform: translateY(60px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
    }
  }
</style>
