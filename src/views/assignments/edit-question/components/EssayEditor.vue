<template>
  <div class="essay-editor">
    <el-form label-width="120px">
      <el-form-item label="参考答案">
        <el-input
          v-model="localValue.referenceAnswer"
          type="textarea"
          :rows="8"
          placeholder="请输入参考答案，用于学生参考和AI辅助评分..."
        />
      </el-form-item>

      <el-form-item label="评分标准">
        <el-input
          v-model="localValue.gradingCriteria"
          type="textarea"
          :rows="5"
          placeholder="请输入评分标准（可选），例如：&#10;1. 答案完整性 (40%)&#10;2. 逻辑清晰度 (30%)&#10;3. 语言表达 (30%)"
        />
      </el-form-item>

      <el-divider content-position="left">AI批改配置</el-divider>

      <el-form-item label="启用AI辅助评分">
        <el-switch 
          v-model="localValue.aiGrading"
          active-text="开启"
          inactive-text="关闭"
        />
        <div style="color: #909399; font-size: 12px; margin-top: 8px">
          开启后，系统将使用AI对学生答案进行初步评分，教师可以在此基础上调整
        </div>
      </el-form-item>

      <template v-if="localValue.aiGrading">
        <el-form-item label="AI评分标准">
          <el-input
            v-model="localValue.aiGradingCriteria"
            type="textarea"
            :rows="4"
            placeholder="自定义AI评分标准（可选），留空则使用默认标准"
          />
        </el-form-item>

        <el-form-item label="分数范围">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-input-number 
                v-model="localValue.scoreRange.min" 
                :min="0" 
                :max="localValue.scoreRange.max"
                style="width: 100%"
              />
              <span style="margin-left: 8px">最低分</span>
            </el-col>
            <el-col :span="12">
              <el-input-number 
                v-model="localValue.scoreRange.max" 
                :min="localValue.scoreRange.min" 
                :max="100"
                style="width: 100%"
              />
              <span style="margin-left: 8px">最高分</span>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="AI评分权重">
          <el-slider 
            v-model="localValue.aiWeight" 
            :min="0" 
            :max="100"
            :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
            show-stops
          />
          <div style="color: #909399; font-size: 12px; margin-top: 8px">
            AI评分占总分的比例，剩余部分由教师手动评分
          </div>
        </el-form-item>
      </template>

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

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref({
  ...props.modelValue,
  aiGradingCriteria: props.modelValue.aiGradingCriteria || '',
  aiWeight: props.modelValue.aiWeight || 50
})

watch(() => props.modelValue, (newVal) => {
  localValue.value = {
    ...newVal,
    aiGradingCriteria: newVal.aiGradingCriteria || '',
    aiWeight: newVal.aiWeight || 50
  }
}, { deep: true })

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })
</script>

<style lang="scss" scoped>
.essay-editor {
  :deep(.el-form-item__label) {
    font-weight: 600;
  }
}
</style>
