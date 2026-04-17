<template>
  <div class="app-container home">
    <div class="home-main">
      <GlobalSearch @select="onSearchFileSelect" />
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="选择文件" prop="fileList">
          <FileUpload ref="fileUploadRef" v-model:files="form.fileList" />
        </el-form-item>
        <el-form-item label="上传目录" prop="catalogue">
          <el-radio-group v-model="form.catalogue">
            <el-radio
              v-for="catalogue in catalogueList"
              :key="catalogue.id"
              :label="catalogue.name"
              :value="catalogue.id"
              border
            />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input style="width: 100%" v-model="form.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            style="width: 100%"
            v-model="form.content"
            placeholder="请输入内容"
            type="textarea"
            :rows="8"
            :maxlength="600"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="home-bottom">
      <div class="file-count">
        当前已选择 <span class="count">{{ form.fileList.length }}</span> 个文件
      </div>
      <el-button type="primary" size="large" @click="handleSubmit"> 提交 </el-button>
    </div>
  </div>
</template>

<script setup>
  import GlobalSearch from '@renderer/components/GlobalSearch/index.vue'
  import FileUpload from '@renderer/components/FileUpload/index.vue'

  const { proxy } = getCurrentInstance()

  const fileUploadRef = ref(null)

  // 表单引用
  const formRef = ref(null)
  // 表单数据
  const form = reactive({
    title: '',
    content: '',
    fileList: [],
    catalogue: ''
  })
  // 校验规则
  const rules = {
    title: [{ required: true, message: '请输入标题', trigger: ['blur'] }],
    catalogue: [{ required: true, message: '请选择上传目录', trigger: ['change'] }],
    fileList: [{ required: true, message: '请选择文件', trigger: ['change'] }]
  }

  // 上传目录
  const catalogueList = [
    {
      id: 1,
      name: '默认目录'
    },
    {
      id: 2,
      name: '日常办公'
    },
    {
      id: 3,
      name: '个人信息'
    }
  ]

  // 选择搜索结果中的文件
  function onSearchFileSelect({ file }) {
    // 使用校验函数
    if (!fileUploadRef.value.validateFileCanAdd(file, file.name)) {
      return
    }

    // 添加到文件列表
    const fileObj = {
      name: file.name,
      type: file.type,
      path: file.path,
      size: file.size,
      uid: fileUploadRef.value.getUUID()
    }

    form.fileList.push(fileObj)
    proxy.$message.success(`已添加文件【${file.name}】`)
  }

  // 提交
  function handleSubmit() {
    // 校验表单
    formRef.value.validate(valid => {
      if (!valid) return
      console.log('handleSubmit', form)
      proxy.$message.success('校验成功，可在控制台中查看日志')
    })
  }
</script>

<style lang="scss" scoped>
  .home {
    position: relative;

    .home-main {
      height: calc(100% - 64px);
      background: var(--el-bg-color);
      overflow: auto;
      padding: 16px;
      border-radius: 16px;
      color: var(--el-text-color-regular);
      position: relative;

      .el-form-item {
        margin-bottom: 16px;
      }
    }

    .home-bottom {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 12px 16px;
      background: var(--el-bg-color);
      border-radius: 0 0 4px 4px;
      display: flex;
      justify-content: center;

      .file-count {
        position: absolute;
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
        font-size: 14px;
        color: var(--el-text-color-primary);

        .count {
          font-size: 16px;
          font-weight: bold;
          color: var(--el-color-primary);
        }
      }

      .el-button {
        width: 240px;
        border-radius: 20px;
      }
    }
  }
</style>
