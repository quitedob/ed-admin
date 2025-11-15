<template>
  <div class="multiple-choice-editor">
    <div class="options-list">
      <div 
        v-for="(option, index) in localValue.options" 
        :key="index" 
        class="option-item"
        :class="{ 'is-correct': option.isCorrect }"
      >
        <el-checkbox 
          v-model="option.isCorrect"
          class="option-checkbox"
          @change="updateCorrectAnswers"
        >
          <span class="option-label">{{ option.value }}:</span>
        </el-checkbox>
        <el-input
          v-model="option.text"
          placeholder="请输入选项内容"
          class="option-input"
        />
        <el-button
          v-if="localValue.options.length > 2"
          type="danger"
          text
          @click="removeOption(index)"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
        <el-tag 
          v-if="option.isCorrect" 
          type="success" 
          size="small"
          class="correct-tag"
        >
          正确答案
        </el-tag>
      </div>
    </div>

    <el-button type="primary" plain @click="addOption" class="add-btn">
      <el-icon><Plus /></el-icon>
      添加选项
    </el-button>

    <el-divider />

    <el-form label-width="100px">
      <el-form-item label="参考答案">
        <div v-if="localValue.correctAnswers.length > 0">
          <el-tag 
            v-for="answer in localValue.correctAnswers" 
            :key="answer" 
            type="success" 
            size="large"
            style="margin-right: 8px"
          >
            {{ answer }}
          </el-tag>
        </div>
        <span v-else style="color: #909399">请选择正确答案（至少选择2个）</span>
      </el-form-item>

      <el-form-item label="题目解析">
        <el-input
          v-model="localValue.explanation"
          type="textarea"
          :rows="4"
          placeholder="请输入题目解析（可选）"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localValue.value = { ...newVal }
}, { deep: true })

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const updateCorrectAnswers = () => {
  localValue.value.correctAnswers = localValue.value.options
    .filter(opt => opt.isCorrect)
    .map(opt => opt.value)
}

const addOption = () => {
  const nextLetter = String.fromCharCode(65 + localValue.value.options.length)
  localValue.value.options.push({ value: nextLetter, text: '', isCorrect: false })
}

const removeOption = (index) => {
  localValue.value.options.splice(index, 1)
  // 重新分配字母
  localValue.value.options.forEach((opt, i) => {
    opt.value = String.fromCharCode(65 + i)
  })
  updateCorrectAnswers()
}
</script>

<style lang="scss" scoped>
.multiple-choice-editor {
  .options-list {
    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 2px solid transparent;
      transition: all 0.3s;

      &.is-correct {
        background: #f0f9ff;
        border-color: #67c23a;
      }

      &:hover {
        background: #f5f7fa;
      }

      .option-checkbox {
        flex-shrink: 0;
      }

      .option-label {
        font-weight: 600;
        margin-right: 8px;
      }

      .option-input {
        flex: 1;
      }

      .correct-tag {
        flex-shrink: 0;
      }
    }
  }

  .add-btn {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
