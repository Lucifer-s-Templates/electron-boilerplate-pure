<template>
  <div class="pwd-login">
    <div class="bubbles">
      <div v-for="i in 10" :key="i" class="bubble"></div>
    </div>
    <el-form ref="loginRef" class="login-form" :model="loginForm" :rules="loginRules">
      <div class="app-name">{{ appName }}</div>
      <el-form-item prop="mobile">
        <el-input
          v-model="loginForm.mobile"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="手机号"
        >
          <template #prefix>
            <el-icon class="el-input__icon input-icon">
              <Iphone />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <el-icon class="el-input__icon input-icon">
              <Lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button
          class="login-btn"
          :loading="loading"
          size="large"
          type="primary"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import useUserStore from '@renderer/store/modules/user'
  const { proxy } = getCurrentInstance()
  const router = useRouter()

  const appName = import.meta.env.VITE_APP_NAME
  const userStore = useUserStore()

  const isDev = import.meta.env.DEV

  const loginRef = ref(null)
  const loginForm = ref({
    mobile: isDev ? '18888888888' : '',
    password: isDev ? '123456' : ''
  })

  const loginRules = {
    mobile: [{ required: true, trigger: 'blur', message: '请输入手机号' }],
    password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
  }

  const loading = ref(false)

  // 登录
  function handleLogin() {
    loginRef.value.validate(async valid => {
      if (!valid) return
      const { mobile, password } = loginForm.value
      loading.value = true
      // 调用store的登录方法
      await userStore
        .login({
          mobile,
          password
        })
        .finally(() => {
          loading.value = false
        })
      proxy.$message.success('登录成功')
      setTimeout(() => {
        router.push('/index')
      }, 1000)
    })
  }
</script>

<style lang="scss" scoped>
  @use 'sass:math';

  .pwd-login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #011e3f;
    background-image:
      linear-gradient(rgba(64, 158, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(64, 158, 255, 0.1) 1px, transparent 1px),
      linear-gradient(rgba(64, 158, 255, 0.05) 2px, transparent 2px),
      linear-gradient(90deg, rgba(64, 158, 255, 0.05) 2px, transparent 2px);
    background-size:
      40px 40px,
      40px 40px,
      200px 200px,
      200px 200px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        circle at center,
        transparent 0%,
        rgba(11, 15, 26, 0.9) 80%,
        #0b0f1a 100%
      );
      backdrop-filter: blur(2px);
      z-index: 1;
      pointer-events: none;
    }
  }

  .bubbles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .bubble {
    position: absolute;
    bottom: -100px;
    width: 40px;
    height: 40px;
    background: rgba(64, 158, 255, 0.15);
    border-radius: 50%;
    opacity: 0.5;
    animation: rise 10s infinite ease-in;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        left: math.percentage(math.div(math.random(100), 100));
        width: #{math.random(60) + 20}px;
        height: #{math.random(60) + 20}px;
        animation-duration: #{math.random(10) + 8}s;
        animation-delay: #{math.random(10)}s;
        opacity: math.div(math.random(3), 10) + 0.1;
      }
    }
  }

  @keyframes rise {
    0% {
      bottom: -100px;
      transform: translateX(0);
    }
    50% {
      transform: translateX(100px);
    }
    100% {
      bottom: 100%;
      transform: translateX(-200px);
    }
  }

  .app-name {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    text-align: center;
    text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
    margin-bottom: 30px;
    user-select: none;
  }

  .login-form {
    border-radius: 16px;
    background: rgb(0 0 0 / 15%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px 0 rgb(147 120 120 / 15%);
    width: 400px;
    padding: 25px 25px 5px 25px;
    z-index: 1;

    .el-form-item {
      margin-bottom: 30px;
    }

    :deep(.el-form-item--default .el-form-item__error) {
      padding-top: 6px;
    }

    .el-input {
      height: 40px;

      --el-input-placeholder-color: #e3e3e3;
    }

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3) inset;

      &:hover {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      }
    }

    :deep(.el-input__inner) {
      color: #fff;
    }

    .input-icon {
      font-size: 18px;
      margin-left: 0px;
      color: #cfcfcf;
    }

    .login-btn {
      background: rgba(83, 106, 235, 0.15);
      backdrop-filter: blur(20px);
      border: none;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 0 10px rgba(147, 120, 120, 0.15);
      }
    }
  }
</style>
