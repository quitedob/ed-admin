<template>
  <div class="fill-blank">
    <div class="question-text" v-html="processedQuestionText"></div>
    <div class="blanks-container">
      <el-input
        v-for="(blank, index) in blankCount"
        :key="index"
        :model-value="modelValue[index] || ''"
        @update:model-value="updateValue(index, $event)"
        :disabled="readonly"
        :placeholder="`请填写第${index + 1}个空`"
        class="blank-input"
        size="large"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

// 计算需要填空的数量
const blankCount = computed(() => {
  return props.question.correctAnswers?.length || 1
})

// 处理题目文本，将填空标记替换为输入框占位符
const processedQuestionText = computed(() => {
  let text = props.question.questionText || ''
  // 如果题目中有类似 [____] 的标记，替换为序号
  let index = 1
  text = text.replace(/\[[_]+\]/g, () => `[填空${index++}]`)
  return text
})

// 更新答案
const updateValue = (index, value) => {
  const newValue = [...props.modelValue]
  newValue[index] = value
  emit('update:modelValue', newValue)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/questions/FillBlank.vue`);
  });

</script>

<style scoped>
.fill-blank {
  width: 100%;
}

.question-text {
  color: var(--color-text-primary);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
}

.question-text :deep(.blank-placeholder) {
  color: var(--color-primary-500);
  font-weight: 600;
  padding: 2px 8px;
  background-color: var(--color-primary-50);
  border-radius: var(--radius-small);
  margin: 0 2px;
}

.blanks-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.blank-input {
  max-width: 400px;
}

.blank-input :deep(.el-input__wrapper) {
  background-color: var(--color-bg-primary);
  border: 2px solid var(--color-border-base);
  border-radius: var(--radius-base);
  transition: var(--transition);
}

.blank-input :deep(.el-input__wrapper:hover) {
  border-color: var(--color-primary-400);
}

.blank-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.blank-input :deep(.el-input__inner) {
  font-size: 16px;
  padding: var(--spacing-md);
}

.blank-input.is-disabled :deep(.el-input__wrapper) {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-light);
}
</style>