<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <Sidebar />
    </div>
    <div class="main-container">
      <AppMain />
    </div>
  </div>
</template>

<script setup>
  import AppMain from './components/AppMain.vue'
  import Sidebar from './components/Sidebar.vue'
</script>

<style lang="scss" scoped>
  .app-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    color: #333;
    font-size: 14px;
    border-top: 1px solid var(--el-border-color);

    .sidebar-container {
      width: 100px;
      height: 100%;
    }

    .main-container {
      flex: 1;
      height: 100%;
    }
  }
</style>
