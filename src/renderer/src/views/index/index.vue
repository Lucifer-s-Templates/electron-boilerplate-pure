<template>
  <div class="app-container home">
    <div class="home-main">
      <GlobalSearch @select="onSearchFileSelect" />
      <div class="module-container">
        <div class="module-title">选择盘符</div>
        <DiskBox class="module-content" @select="onDiskFileSelect" />
      </div>
      <div class="module-container">
        <div class="module-title">选择文件</div>
        <div class="module-content">
          <FileUpload ref="fileUploadRef" v-model:files="form.fileList" />
          <div class="mt-16">
            <div class="mb-10 flex-row ali-center">*上传目录</div>
            <el-radio-group v-if="catalogueList.length" v-model="form.catalogue">
              <el-radio
                v-for="catalogue in catalogueList"
                :key="catalogue.id"
                :label="catalogue.name"
                :value="catalogue.id"
                border
              />
            </el-radio-group>
            <div v-if="!catalogueList.length" class="empty-toast">暂无数据</div>
          </div>
          <div class="mt-16">
            <div class="mb-10">消息标题</div>
            <el-input
              style="width: 100%"
              v-model="form.title"
              placeholder="请输入消息标题"
            ></el-input>
          </div>
          <div class="mt-16">
            <div class="mb-10">消息内容</div>
            <el-input
              style="width: 100%"
              v-model="form.content"
              placeholder="请输入消息内容"
              type="textarea"
              :rows="8"
              :maxlength="600"
              show-word-limit
            ></el-input>
          </div>
        </div>
      </div>
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
  import DiskBox from '@renderer/components/DiskBox/index.vue'
  import FileUpload from '@renderer/components/FileUpload/index.vue'

  const { proxy } = getCurrentInstance()

  const fileUploadRef = ref(null)

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

  // 点击盘符选择文件回调
  async function onDiskFileSelect({ filePaths }) {
    fileUploadRef.value.addFiles(filePaths)
  }

  // 上传目录
  const catalogueList = ref([
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
  ])

  const form = reactive({
    title: '',
    content: '',
    fileList: [],
    catalogue: ''
  })

  // 提交
  async function handleSubmit() {
    // 前置校验
    const validation = validateBeforeUpload()
    if (!validation.valid) {
      proxy.$message.warning(validation.message)
      return
    }

    proxy.$message.success('校验成功，可在控制台中查看日志')
    console.log('handleSubmit', form)
  }

  // 前置校验
  function validateBeforeUpload() {
    const { catalogue, fileList } = form

    if (!catalogue) {
      return { valid: false, type: 'noCatalogue', message: '请选择上传目录' }
    }

    if (!fileList.length) {
      return { valid: false, type: 'noContent', message: '请选择文件' }
    }

    return { valid: true }
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
      color: var(--el-text-color-regular);
      position: relative;

      .module-container {
        .module-title {
          font-size: 14px;
          color: var(--el-text-color-primary);
          line-height: 1;
          padding: 8px 16px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: var(--el-color-primary);
            border-radius: 0 4px 4px 0;
          }
        }

        .module-content {
          padding: 16px;
        }
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
