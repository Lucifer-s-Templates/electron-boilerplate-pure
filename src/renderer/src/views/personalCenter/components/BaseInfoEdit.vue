<template>
  <LuciferDialog
    ref="baseInfoEditDialogRef"
    title="修改基本信息"
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
      <el-form-item label="单位" prop="orgId">
        <el-select style="width: 100%" v-model="form.orgId" placeholder="请选择单位" filterable>
          <el-option v-for="item in orgList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="groupName">
        <el-input v-model="form.groupName" placeholder="请输入部门" clearable></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号" clearable></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" clearable></el-input>
      </el-form-item>
    </el-form>
  </LuciferDialog>
</template>

<script setup name="BaseInfoEdit">
  import LuciferDialog from '@renderer/components/LuciferDialog/index.vue'
  import { queryOrgList, updateBaseInfo } from '@renderer/api/personalCenter'
  import useUserStore from '@renderer/store/modules/user'
  const userStore = useUserStore()

  const { proxy } = getCurrentInstance()

  const emit = defineEmits(['save-success'])

  const userInfo = computed(() => userStore.userInfo || {})
  const baseInfoEditDialogRef = ref(null)
  const formRef = ref(null)

  const orgList = ref([])

  // 表单数据
  const form = ref({
    orgId: userInfo.value.orgId,
    groupName: userInfo.value.groupName,
    mobile: userInfo.value.mobile,
    email: userInfo.value.email
  })

  // 表单验证规则
  const rules = {
    orgId: [{ required: true, message: '请选择单位', trigger: 'change' }],
    groupName: [{ required: true, message: '请输入部门', trigger: 'blur' }],
    mobile: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!/^1[3456789]\d{9}$/.test(value)) {
            callback(new Error('请输入正确的手机号'))
          } else {
            callback()
          }
        }
      }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(value)) {
            callback(new Error('请输入正确的邮箱'))
          } else {
            callback()
          }
        }
      }
    ]
  }

  // 显示对话框
  async function show() {
    const loading = proxy.$loading({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
      await getOrgList()
      await userStore.getUserInfo()
      form.value = {
        orgId: userInfo.value.orgId,
        groupName: userInfo.value.groupName,
        mobile: userInfo.value.mobile,
        email: userInfo.value.email
      }
    } finally {
      loading.close()
    }
    baseInfoEditDialogRef.value.show()
  }

  // 获取单位列表
  async function getOrgList() {
    const res = await queryOrgList()
    orgList.value = res.data || []
  }

  // 确认
  function handleConfirm(load, done) {
    formRef.value.validate(async valid => {
      if (!valid) return
      try {
        load(true)
        await updateBaseInfo({
          userId: userInfo.value.id,
          orgId: form.value.orgId,
          groupName: form.value.groupName,
          mobile: form.value.mobile,
          email: form.value.email
        })
        emit('save-success', { ...form.value })
        done()
      } finally {
        load(false)
      }
    })
  }

  // 取消
  function handleCancel() {
    baseInfoEditDialogRef.value.close()
  }

  defineExpose({
    show
  })
</script>

<style lang="scss" scoped></style>
