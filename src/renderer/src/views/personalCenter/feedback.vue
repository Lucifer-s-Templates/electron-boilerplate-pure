<template>
  <div class="app-container feedback">
    <div class="feedback-main">
      <UserInfo />
      <div class="input-container">
        <div class="label-wrap">意见反馈</div>
        <el-input
          v-model="suggestion"
          placeholder="请输入意见反馈"
          type="textarea"
          :rows="8"
          :maxlength="300"
          show-word-limit
        />
      </div>
    </div>
    <div class="feedback-footer">
      <el-button type="primary" size="large" @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>

<script setup>
  import useUserStore from '../../store/modules/user'
  import { saveFeedback } from '../../api/personalCenter'
  import UserInfo from '../personalCenter/components/UserInfo.vue'
  const userStore = useUserStore()
  const { proxy } = getCurrentInstance()

  const suggestion = ref('')

  // 提交
  function handleSubmit() {
    if (!suggestion.value) {
      proxy.$message.warning('请输入意见反馈')
      return
    }

    proxy
      .$confirm('确定提交吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(async () => {
        try {
          await saveFeedback({
            userId: userStore.id,
            content: suggestion.value.trim()
          })
          proxy.$message.success('提交成功')
          suggestion.value = ''
        } catch (error) {
          proxy.$message.error(error.message)
        }
      })
  }
</script>

<style lang="scss" scoped>
  .feedback {
    position: relative;

    .feedback-main {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: calc(100% - 65px);
      overflow: auto;

      .input-container {
        --side-margin: 20px;
        width: calc(100% - var(--side-margin) * 2);
        background: var(--el-bg-color);
        border-radius: 10px;
        padding: 24px;
        margin: 40px var(--side-margin);
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);

        .label-wrap {
          font-size: 14px;
          line-height: 1;
          color: var(--el-text-color-primary);
          margin-bottom: 10px;
        }
      }
    }

    .feedback-footer {
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
