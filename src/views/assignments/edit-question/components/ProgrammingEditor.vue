<template>
  <div id="programming-editor" class="programming-editor">
    <el-form id="programming-form" label-width="120px">
      <el-form-item id="hoj-problem-item" label="绑定HOJ题目">
        <el-input
          id="hoj-problem-input"
          v-model="localValue.hojProblemId"
          placeholder="如: CF-1001, LC-001"
          @blur="handleSearchProblem"
        >
          <template #append>
            <el-button id="search-hoj-btn" @click="handleSearchProblem" :loading="searching">
              <el-icon><Search /></el-icon>
              搜索HOJ题库
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <template v-if="problemInfo">
        <el-divider id="problem-info-divider" content-position="left">题目信息(自动获取)</el-divider>

        <el-descriptions id="problem-info-descriptions" :column="2" border>
          <el-descriptions-item id="problem-name-item" label="题目名称">
            {{ problemInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item id="problem-source-item" label="题目来源">
            {{ problemInfo.source }}
          </el-descriptions-item>
          <el-descriptions-item id="time-limit-item" label="时间限制">
            {{ problemInfo.timeLimit }}ms
          </el-descriptions-item>
          <el-descriptions-item id="memory-limit-item" label="内存限制">
            {{ problemInfo.memoryLimit }}MB
          </el-descriptions-item>
          <el-descriptions-item id="difficulty-item" label="难度">
            <el-rate
              id="difficulty-rate"
              v-model="problemInfo.difficulty"
              disabled
              :max="5"
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
          <el-descriptions-item id="accept-rate-item" label="通过率">
            <el-progress
              id="accept-rate-progress"
              :percentage="problemInfo.acceptRate"
              :color="getAcceptRateColor(problemInfo.acceptRate)"
            />
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-divider id="settings-divider" content-position="left">本题设置</el-divider>

      <el-row id="first-settings-row" :gutter="20">
        <el-col :span="12">
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item id="required-item" label="必做">
            <el-switch
              id="required-switch"
              v-model="localValue.required"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row id="second-settings-row" :gutter="20">
        <el-col :span="12">
          <el-form-item id="multiple-submit-item" label="允许多次提交">
            <el-switch
              id="multiple-submit-switch"
              v-model="localValue.multipleSubmit"
              active-text="允许"
              inactive-text="不允许"
            />
            <div id="multiple-submit-hint" style="color: #909399; font-size: 12px; margin-top: 4px">
              允许学生多次提交，取最高分
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item id="show-test-cases-item" label="显示测试用例">
            <el-switch
              id="show-test-cases-switch"
              v-model="localValue.showTestCases"
              active-text="显示"
              inactive-text="隐藏"
            />
            <div id="show-test-cases-hint" style="color: #909399; font-size: 12px; margin-top: 4px">
              是否向学生显示测试用例
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item id="submit-limit-item" label="提交次数限制">
        <el-input-number
          id="submit-limit-input"
          v-model="localValue.submitLimit"
          :min="0"
          :max="100"
          :disabled="!localValue.multipleSubmit"
        />
        <span id="submit-limit-unit" style="margin-left: 8px">次 (0表示不限制)</span>
      </el-form-item>

      <el-form-item id="allowed-languages-item" label="语言限制">
        <el-checkbox-group id="allowed-languages-group" v-model="localValue.allowedLanguages">
          <el-checkbox id="lang-cpp" label="C++">C++</el-checkbox>
          <el-checkbox id="lang-java" label="Java">Java</el-checkbox>
          <el-checkbox id="lang-python" label="Python">Python</el-checkbox>
          <el-checkbox id="lang-javascript" label="JavaScript">JavaScript</el-checkbox>
          <el-checkbox id="lang-go" label="Go">Go</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item id="explanation-item" label="题目解析">
        <el-input
          id="explanation-input"
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
  submitLimit: props.modelValue.submitLimit || 0,
  allowedLanguages: props.modelValue.allowedLanguages || ['C++', 'Java', 'Python']
})

const searching = ref(false)
const problemInfo = ref(null)

watch(() => props.modelValue, (newVal) => {
  localValue.value = {
    ...newVal,
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
