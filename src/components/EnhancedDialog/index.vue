<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    :show-close="false"
    :modal="modal"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    class="enhanced-dialog"
  >
    <!-- 自定义关闭按钮 -->
    <EnhancedCloseButton @click="handleClose" />

    <!-- 默认插槽 -->
    <slot />

    <!-- 底部插槽（如果有） -->
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { ElDialog } from 'element-plus'
import EnhancedCloseButton from '../EnhancedCloseButton/index.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '50%'
  },
  modal: {
    type: Boolean,
    default: true
  },
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  beforeClose: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  if (props.beforeClose) {
    props.beforeClose(handleClose)
  } else {
    dialogVisible.value = false
    emit('close')
  }
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/EnhancedDialog/index.vue`);
  });

</script>

<style scoped>
/* 确保对话框有足够的空间容纳关闭按钮 */
.enhanced-dialog {
  :deep(.el-dialog) {
    position: relative;
    overflow: visible;
  }

  :deep(.el-dialog__header) {
    padding-right: 60px; /* 为关闭按钮留出空间 */
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-base);
  }

  :deep(.el-dialog__body) {
    background-color: var(--color-bg-primary);
  }

  :deep(.el-dialog__footer) {
    background-color: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-base);
    padding: 16px 20px;
  }
}
</style>