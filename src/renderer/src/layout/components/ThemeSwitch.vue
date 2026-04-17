<template>
  <!-- 主题切换 -->
  <div class="theme-switch" :class="{ dark: settingStore.isDark }">
    <button
      class="switch-btn"
      :class="{ active: settingStore.themeMode === 'light' }"
      @click="toggleThemeMode('light')"
    >
      <svg
        class="switch-btn__icon"
        fill="none"
        height="24"
        shape-rendering="geometricPrecision"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        width="24"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2"></path>
        <path d="M12 21v2"></path>
        <path d="M4.22 4.22l1.42 1.42"></path>
        <path d="M18.36 18.36l1.42 1.42"></path>
        <path d="M1 12h2"></path>
        <path d="M21 12h2"></path>
        <path d="M4.22 19.78l1.42-1.42"></path>
        <path d="M18.36 5.64l1.42-1.42"></path>
      </svg>
    </button>
    <button
      class="switch-btn"
      :class="{ active: settingStore.themeMode === 'system' }"
      @click="toggleThemeMode('system')"
    >
      <svg
        class="switch-btn__icon"
        fill="none"
        height="24"
        shape-rendering="geometricPrecision"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        width="24"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M8 21h8"></path>
        <path d="M12 17v4"></path>
      </svg>
    </button>
    <button
      class="switch-btn"
      :class="{ active: settingStore.themeMode === 'dark' }"
      @click="toggleThemeMode('dark')"
    >
      <svg
        class="switch-btn__icon"
        fill="none"
        height="24"
        shape-rendering="geometricPrecision"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        width="24"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
  import useSettingStore from '@renderer/store/modules/setting'

  const settingStore = useSettingStore()

  // 切换主题模式
  async function toggleThemeMode(mode) {
    if (settingStore.themeMode === mode) return

    if (mode === 'system') {
      const shouldUseDarkColors = await window.api.toggleThemeMode(mode)

      // 判断系统主题是否与当前主题一致
      if (shouldUseDarkColors === settingStore.isDark) {
        // 一致，直接切换
        await settingStore.toggleThemeMode(mode)
      } else {
        // 不一致，触发 changeDark 动画
        changeDark(shouldUseDarkColors, async () => {
          await settingStore.toggleThemeMode(mode)
        })
      }
    } else {
      // light/dark 模式，判断是否与当前主题一致
      const targetIsDark = mode === 'dark'
      if (targetIsDark === settingStore.isDark) {
        // 一致，直接切换
        await settingStore.toggleThemeMode(mode)
      } else {
        // 不一致，触发 changeDark 动画
        changeDark(targetIsDark, async () => {
          await settingStore.toggleThemeMode(mode)
        })
      }
    }
  }

  // 切换暗黑模式
  function changeDark(isDark, cb) {
    // 先启动过渡
    const transition = document.startViewTransition(() => {
      cb()
    })

    transition.ready.then(() => {
      // 获取动画方向
      const startClip = isDark ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)'
      const endClip = 'inset(0 0 0 0)'

      // 为新内容添加动画（新主题）
      const newAnimation = document.documentElement.animate(
        {
          clipPath: [startClip, endClip]
        },
        {
          duration: 1500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
          fill: 'forwards'
        }
      )

      // 让旧内容逐渐淡出（增加过渡感）
      const oldAnimation = document.documentElement.animate(
        {
          opacity: [1, 0.8]
        },
        {
          duration: 1500,
          pseudoElement: '::view-transition-old(root)',
          fill: 'forwards'
        }
      )

      return Promise.all([newAnimation.finished, oldAnimation.finished])
    })
  }
</script>

<style lang="scss" scoped>
  .theme-switch {
    display: inline-flex;
    align-items: center;
    padding: 4px;
    border-radius: 9999px;
    border: 1px solid;
    border-color: rgb(228 228 231 / 1);
    background: #faf3f3;

    .switch-btn {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: transparent;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.5s ease;
      z-index: 2;

      &.active {
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      }

      .switch-btn__icon {
        height: 14px;
        width: 14px;
        color: rgb(0 0 0 / 80%);
      }
    }

    &.dark {
      border-color: rgb(63 63 70 / 1);
      background: #131e2a;

      .switch-btn {
        &.active {
          background: #1c1c1e;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
        }

        .switch-btn__icon {
          color: rgb(255 255 255 / 80%);
        }
      }
    }
  }
</style>
<style>
  /* View Transition 配置 */
  ::view-transition-old(root) {
    animation: none;
    mix-blend-mode: normal;
    z-index: 1;
  }

  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
    z-index: 2;
  }

  /* 确保过渡平滑 */
  ::view-transition-image-pair(root) {
    isolation: isolate;
  }
</style>
