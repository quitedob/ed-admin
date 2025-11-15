<template>
  <div class="programming-editor">
    <el-form label-width="120px">
      <el-form-item label="绑定HOJ题目">
        <el-input
          v-model="localValue.hojProblemId"
          placeholder="如: CF-1001, LC-001"
          @blur="handleSearchProblem"
        >
          <template #append>
            <el-button @click="handleSearchProblem" :loading="searching">
              <el-icon><Search /></el-icon>
              搜索HOJ题库
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <template v-if="problemInfo">
        <el-divider content-position="left">题目信息(自动获取)</el-divider>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="题目名称">
            {{ problemInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item label="题目来源">
            {{ problemInfo.source }}
          </el-descriptions-item>
          <el-descriptions-item label="时间限制">
            {{ problemInfo.timeLimit }}ms
          </el-descriptions-item>
          <el-descriptions-item label="内存限制">
            {{ problemInfo.memoryLimit }}MB
          </el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-rate 
              v-model="problemInfo.difficulty" 
              disabled 
              :max="5"
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
          <el-descriptions-item label="通过率">
            <el-progress 
              :percentage="problemInfo.acceptRate" 
              :color="getAcceptRateColor(problemInfo.acceptRate)"
            />
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-divider content-position="left">本题设置</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分值">
            <el-input-number 
              v-model="localValue.score" 
              :min="1" 
              :max="100"
              style="width: 100%"
            />
            <span style="margin-left: 8px">分</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="必做">
            <el-switch 
              v-model="localValue.required"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="允许多次提交">
            <el-switch 
              v-model="localValue.multipleSubmit"
              active-text="允许"
              inactive-text="不允许"
            />
            <div style="color: #909399; font-size: 12px; margin-top: 4px">
              允许学生多次提交，取最高分
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示测试用例">
            <el-switch 
              v-model="localValue.showTestCases"
              active-text="显示"
              inactive-text="隐藏"
            />
            <div style="color: #909399; font-size: 12px; margin-top: 4px">
              是否向学生显示测试用例
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="提交次数限制">
        <el-input-number 
          v-model="localValue.submitLimit" 
          :min="0" 
          :max="100"
          :disabled="!localValue.multipleSubmit"
        />
        <span style="margin-left: 8px">次 (0表示不限制)</span>
      </el-form-item>

      <el-form-item label="语言限制">
        <el-checkbox-group v-model="localValue.allowedLanguages">
          <el-checkbox label="C++">C++</el-checkbox>
          <el-checkbox label="Java">Java</el-checkbox>
          <el-checkbox label="Python">Python</el-checkbox>
          <el-checkbox label="JavaScript">JavaScript</el-checkbox>
          <el-checkbox label="Go">Go</el-checkbox>
        </el-checkbox-group>
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
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref({
  ...props.modelValue,
  score: props.modelValue.score || 10,
  submitLimit: props.modelValue.submitLimit || 0,
  allowedLanguages: props.modelValue.allowedLanguages || ['C++', 'Java', 'Python']
})

const searching = ref(false)
const problemInfo = ref(null)

watch(() => props.modelValue, (newVal) => {
  localValue.value = {
    ...newVal,
    score: newVal.score || 10,
    submitLimit: newVal.submitLimit || 0,
    allowedLanguages: newVal.allowedLanguages || ['C++', 'Java', 'Python']
  }
}, { deep: true })

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const handleSearchProblem = async () => {
  if (!localValue.value.hojProblemId) {
    return
  }

  searching.value = true
  
  // 模拟搜索
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟返回数据
  problemInfo.value = {
    name: 'Array Sum Problem',
    source: 'Codeforces',
    timeLimit: 1000,
    memoryLimit: 256,
    difficulty: 3,
    acceptRate: 65
  }

  localValue.value.problemName = problemInfo.value.name
  localValue.value.timeLimit = problemInfo.value.timeLimit
  localValue.value.memoryLimit = problemInfo.value.memoryLimit
  
  searching.value = false
  ElMessage.success('题目信息获取成功')
}

const getAcceptRateColor = (rate) => {
  if (rate >= 70) return '#67c23a'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style lang="scss" scoped>
.programming-editor {
  :deep(.el-form-item__label) {
    font-weight: 600;
  }

  :deep(.el-descriptions) {
    margin: 16px 0;
  }
}
</style>
