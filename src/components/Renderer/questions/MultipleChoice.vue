<template>
  <div class="multiple-choice">
    <el-checkbox-group
      :model-value="modelValue"
      @update:model-value="updateValue"
      :disabled="readonly"
      class="options-group"
    >
      <el-checkbox
        v-for="option in question.options"
        :key="option.id"
        :label="option.value"
        class="option-item"
      >
        <div class="option-content">
          <span class="option-label">{{ option.value }}.</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
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

const updateValue = (value) => {
  emit('update:modelValue', value)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/questions/MultipleChoice.vue`);
  });

</script>

<style scoped>
.multiple-choice {
  width: 100%;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-light);
  transition: var(--transition);
  margin-bottom: 0;
}

.option-item:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.option-item.is-checked {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-500);
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.option-label {
  color: var(--color-primary-500);
  font-weight: 600;
  min-width: 24px;
}

.option-text {
  color: var(--color-text-primary);
  line-height: 1.5;
  flex: 1;
}
</style>