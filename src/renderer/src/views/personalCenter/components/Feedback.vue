<template>
  <LuciferDialog
    ref="feedbackDialogRef"
    title="意见反馈"
    width="668px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
      require-asterisk-position="right"
    >
      <el-form-item label="" prop="suggestion">
        <el-input
          v-model="form.suggestion"
          placeholder="请输入意见反馈"
          type="textarea"
          :rows="8"
          :maxlength="300"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </LuciferDialog>
</template>

<script setup name="Feedback">
  import { ref } from 'vue'
  import LuciferDialog from '@renderer/components/LuciferDialog/index.vue'
  import { saveFeedback } from '@renderer/api/personalCenter'
  import useUserStore from '@renderer/store/modules/user'
  const userStore = useUserStore()

  const { proxy } = getCurrentInstance()

  const feedbackDialogRef = ref(null)
  const formRef = ref(null)

  // 表单数据
  const form = ref({
    suggestion: ''
  })

  // 表单验证规则
  const rules = {
    suggestion: [{ required: true, message: '请输入反馈内容', trigger: 'blur' }]
  }

  // 显示对话框
  function show() {
    form.value = {
      suggestion: ''
    }
    feedbackDialogRef.value.show()
  }

  // 确认
  function handleConfirm(load, done) {
    formRef.value.validate(async valid => {
      if (!valid) return
      load(true)
      try {
        await saveFeedback({
          userId: userStore.id,
          content: form.value.suggestion.trim()
        })
        proxy.$message.success('提交成功')
        done()
      } finally {
        load(false)
      }
    })
  }

  // 取消
  function handleCancel() {
    feedbackDialogRef.value.close()
  }

  defineExpose({
    show
  })
</script>

<style scoped></style>
