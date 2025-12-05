<template>
  <div class="essay-question">
    <el-input
      :model-value="modelValue"
      @update:model-value="updateValue"
      :disabled="readonly"
      type="textarea"
      :rows="8"
      :placeholder="placeholder"
      class="essay-input"
      resize="vertical"
      maxlength="2000"
      show-word-limit
    />

    <!-- 参考答案（仅在考试结束后显示） -->
    <div v-if="showReference && question.referenceAnswer" class="reference-answer">
      <div class="reference-header">
        <el-icon><Document /></el-icon>
        <span>参考答案</span>
      </div>
      <div class="reference-content">
        {{ question.referenceAnswer }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showReference: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const placeholder = computed(() => {
  if (props.readonly) {
    return ''
  }
  return '请在此输入你的答案...（最少20字）'
})

const updateValue = (value) => {
  emit('update:modelValue', value)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/questions/EssayQuestion.vue`);
  });

</script>

<style scoped>
.essay-question {
  width: 100%;
}

.essay-input {
  width: 100%;
}

.essay-input :deep(.el-textarea__inner) {
  background-color: var(--color-bg-primary);
  border: 2px solid var(--color-border-base);
  border-radius: var(--radius-base);
  color: var(--color-text-primary);
  font-size: 16px;
  line-height: 1.6;
  padding: var(--spacing-md);
  transition: var(--transition);
  resize: vertical;
  min-height: 120px;
}

.essay-input :deep(.el-textarea__inner:hover) {
  border-color: var(--color-primary-400);
}

.essay-input :deep(.el-textarea__inner:focus) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
  outline: none;
}

.essay-input :deep(.el-textarea__inner:disabled) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-light);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.essay-input :deep(.el-input__count) {
  background-color: var(--color-bg-primary);
  color: var(--color-text-tertiary);
}

.reference-answer {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-base);
}

.reference-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--color-success);
  font-weight: 600;
}

.reference-content {
  color: var(--color-text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 14px;
}

/* 字数统计样式 */
.essay-input :deep(.el-input__count-inner) {
  background-color: transparent;
  color: var(--color-text-tertiary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .essay-input :deep(.el-textarea__inner) {
    font-size: 14px;
    padding: var(--spacing-sm);
  }

  .reference-answer {
    padding: var(--spacing-sm);
  }

  .reference-content {
    font-size: 13px;
  }
}
</style>