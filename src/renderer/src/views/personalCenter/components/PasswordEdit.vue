<template>
  <LuciferDialog
    ref="passwordEditDialogRef"
    title="修改密码"
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
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          placeholder="请输入旧密码"
          type="password"
          show-password
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          placeholder="请输入新密码"
          type="password"
          show-password
          clearable
        ></el-input>
      </el-form-item>
    </el-form>
  </LuciferDialog>
</template>

<script setup name="PasswordEdit">
  import { ref } from 'vue'
  import LuciferDialog from '@renderer/components/LuciferDialog/index.vue'
  import { updatePassword } from '@renderer/api/personalCenter'
  import useUserStore from '@renderer/store/modules/user'
  const userStore = useUserStore()

  const emit = defineEmits(['save-success'])

  const userInfo = computed(() => userStore.userInfo || {})
  const passwordEditDialogRef = ref(null)
  const formRef = ref(null)

  // 表单数据
  const form = ref({
    oldPassword: '',
    newPassword: ''
  })

  // 表单验证规则
  const rules = {
    oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
  }

  // 显示对话框
  function show() {
    form.value = {
      oldPassword: '',
      newPassword: ''
    }
    passwordEditDialogRef.value.show()
  }

  // 确认
  function handleConfirm(load, done) {
    formRef.value.validate(async valid => {
      if (!valid) return
      load(true)
      try {
        await updatePassword({
          id: userInfo.value.id,
          oldPassword: form.value.oldPassword.trim(),
          newPassword: form.value.newPassword.trim()
        })
        emit('save-success')
        done()
      } finally {
        load(false)
      }
    })
  }

  // 取消
  function handleCancel() {
    passwordEditDialogRef.value.close()
  }

  defineExpose({
    show
  })
</script>

<style scoped></style>
