<!-- 自定义弹窗组件 -->
<template>
  <el-dialog
    class="lucifer-dialog"
    ref="luciferDialogRef"
    v-model="visible"
    :width="width"
    :before-close="beforeClose"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :fullscreen="fullscreen"
    :show-close="false"
    draggable
    header-class="lucifer-dialog__header"
    :footer-class="footerClass"
  >
    <!-- header -->
    <template #header>
      <div class="lucifer-dialog__title">{{ title }}</div>
      <div class="lucifer-dialog__controls">
        <button v-show="!fullscreen" type="button" class="maximize" @click="fullscreen = true">
          <svg-icon icon-class="fullscreen-2" />
        </button>
        <button v-show="fullscreen" type="button" class="minimize" @click="fullscreen = false">
          <svg-icon icon-class="exit-fullscreen-2" />
        </button>
        <button
          v-if="showClose"
          type="button"
          class="close"
          @click="luciferDialogRef.handleClose()"
        >
          <svg-icon icon-class="close" />
        </button>
      </div>
    </template>

    <!-- 主体 -->
    <div class="lucifer-dialog__main" :style="{ maxHeight: maxHeight }">
      <slot :maxHeight="`calc(${maxHeight} - 32px)`"></slot>
    </div>

    <!-- footer -->
    <template #footer>
      <slot name="footer">
        <el-button v-if="showCancel" :icon="Close" @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          v-if="showConfirm"
          type="primary"
          :icon="Check"
          :loading="confirmLoading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>
<script setup>
  import { Close, Check } from '@element-plus/icons-vue'

  const props = defineProps({
    // 弹窗宽度
    width: {
      type: String,
      default: '50%'
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 显示确认按钮
    showConfirm: {
      type: Boolean,
      default: true
    },
    // 显示取消按钮
    showCancel: {
      type: Boolean,
      default: true
    },
    // 显示关闭按钮
    showClose: {
      type: Boolean,
      default: true
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      default: '确 认'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取 消'
    },
    // 是否自动关闭，设为false后，父组件需处理cancel事件，手动关闭
    autoClose: {
      type: Boolean,
      default: true
    },
    // 是否可以通过点击 modal 关闭 Dialog
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    // 是否可以通过按下 ESC 关闭 Dialog
    closeOnPressEscape: {
      type: Boolean,
      default: false
    },
    // Dialog 自身是否插入至 body 元素上。嵌套的 Dialog 必须指定该属性并赋值为 true
    appendToBody: {
      type: Boolean,
      default: true
    },
    // 关闭时销毁 Dialog 中的元素
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    // 显示footer
    showFooter: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['open', 'close', 'cancel', 'confirm', 'before-close'])
  const luciferDialogRef = ref(null)
  // 是否显示弹窗
  const visible = ref(false)
  const fullscreen = ref(false)
  // 确认按钮loading
  const confirmLoading = ref(false)

  // 主体区最大高度
  const maxHeight = computed(() => {
    const titleHeight = '42px'
    const footerHeight = props.showFooter ? '53px' : '0px'
    const topOffset = '6vh'
    const bottomOffset = '6vh'
    return `calc(100vh - ${topOffset}  - ${titleHeight} - ${footerHeight} - ${bottomOffset})`
  })

  const footerClass = computed(() => {
    let classes = 'lucifer-dialog__footer'
    if (!props.showFooter) {
      classes += ' lucifer-dialog__footer--hidden'
    }
    return classes
  })

  // 打开弹窗（供父组件调用）
  function show() {
    visible.value = true
    emit('open')
  }

  // 关闭弹窗
  function close() {
    confirmLoading.value = false
    visible.value = false
    emit('close')
  }

  // 取消
  function handleCancel() {
    props.autoClose && close()
    emit('cancel', close)
  }

  // 确认
  function handleConfirm() {
    emit('confirm', handleLoad, close)
  }

  // 关闭前的回调，会暂停 Dialog 的关闭
  function beforeClose(done) {
    emit('before-close')
    // props.autoClose && done()
    // 调自定义的close方法，给父组件抛出close事件
    props.autoClose && close()
    // 不是自动关闭时，抛出cancel事件由父组件处理
    !props.autoClose && emit('cancel', close)
  }

  // 显示/隐藏loading
  function handleLoad(loading = true) {
    confirmLoading.value = loading
  }

  defineExpose({
    show,
    handleConfirm,
    handleCancel,
    handleLoad,
    close
  })
</script>
<style lang="scss">
  .lucifer-dialog {
    --el-dialog-padding-primary: 10px !important;
    padding: 0 !important;
    border-radius: 8px;

    &__header {
      position: relative;
      padding: 10px !important;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      text-align: center;
      -webkit-user-select: none;
      -moz-user-select: none;
      user-select: none;
    }

    &__title {
      font-size: 16px;
      text-align: center;
      color: var(--el-text-color-primary);
      letter-spacing: 0.5px;
    }

    &__controls {
      display: flex;
      justify-content: flex-end;
      position: absolute;
      top: 8px;
      left: 0;
      padding-right: 8px;
      box-sizing: border-box;
      z-index: 9;
      width: 100%;

      .minimize,
      .maximize,
      .close {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        width: 28px;
        border: 0;
        background-color: transparent;
        cursor: pointer;
        outline: none;
        border-radius: 6px;
        margin-left: 5px;

        &:hover {
          background: var(--el-fill-color-darker);
        }
      }
    }

    &__main {
      overflow-y: auto;
      padding: 16px;
      box-sizing: border-box;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
      padding: 10px;
      box-sizing: border-box;
      border-top: 1px solid var(--el-border-color-extra-light);

      &--hidden {
        display: none;
      }
    }
  }
</style>
