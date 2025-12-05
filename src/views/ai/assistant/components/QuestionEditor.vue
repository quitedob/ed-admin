<template>
  <div class="question-editor">
    <el-card>
      <template #header>
        <div class="editor-header">
          <span>题目编辑器</span>
          <div class="header-actions">
            <el-button type="text" @click="resetQuestion">重置</el-button>
            <el-button type="primary" @click="saveQuestion">保存</el-button>
          </div>
        </div>
      </template>

      <el-form :model="questionData" label-width="100px">
        <!-- 题目类型选择 -->
        <el-form-item label="题目类型" required>
          <el-select v-model="questionData.type" placeholder="请选择题目类型" @change="onTypeChange">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fill" />
            <el-option label="问答题" value="essay" />
          </el-select>
        </el-form-item>

        <!-- 题目内容 -->
        <el-form-item label="题目内容" required>
          <el-input
            v-model="questionData.questionText"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <!-- 分值 -->
        <el-form-item label="分值" required>
          <el-input-number
            v-model="questionData.score"
            :min="1"
            :max="50"
            placeholder="请输入分值"
          />
        </el-form-item>

        <!-- 难度等级 -->
        <el-form-item label="难度等级">
          <el-select v-model="questionData.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>

        <!-- 知识点 -->
        <el-form-item label="知识点">
          <el-select
            v-model="questionData.knowledgePoints"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入知识点"
            style="width: 100%"
          >
            <el-option
              v-for="point in knowledgePoints"
              :key="point"
              :label="point"
              :value="point"
            />
          </el-select>
        </el-form-item>

        <!-- 选择题选项 -->
        <div v-if="isChoiceQuestion">
          <div class="options-header">
            <span>选项设置</span>
            <el-button type="text" @click="addOption">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>

          <div class="options-list">
            <div
              v-for="(option, index) in questionData.options"
              :key="index"
              class="option-item"
            >
              <div class="option-label">
                <el-input
                  v-model="option.value"
                  placeholder="选项标识"
                  style="width: 80px"
                />
              </div>
              <div class="option-content">
                <el-input
                  v-model="option.text"
                  placeholder="选项内容"
                  style="flex: 1"
                />
              </div>
              <div class="option-actions">
                <el-radio
                  v-if="questionData.type === 'single'"
                  v-model="questionData.correctAnswer"
                  :label="option.value"
                >
                  正确答案
                </el-radio>
                <el-checkbox
                  v-else-if="questionData.type === 'multiple'"
                  v-model="questionData.correctAnswers"
                  :label="option.value"
                >
                  正确答案
                </el-checkbox>
                <el-button
                  type="text"
                  size="small"
                  @click="removeOption(index)"
                  :disabled="questionData.options.length <= 2"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 填空题答案 -->
        <div v-else-if="questionData.type === 'fill'">
          <el-form-item label="正确答案">
            <el-input
              v-model="fillAnswerInput"
              placeholder="输入答案后按回车添加"
              @keyup.enter="addFillAnswer"
            />
            <div class="fill-answers">
              <el-tag
                v-for="(answer, index) in questionData.correctAnswers"
                :key="index"
                closable
                @close="removeFillAnswer(index)"
                style="margin: 4px"
              >
                {{ answer }}
              </el-tag>
            </div>
          </el-form-item>
        </div>

        <!-- 问答题参考答案 -->
        <div v-else-if="questionData.type === 'essay'">
          <el-form-item label="参考答案">
            <el-input
              v-model="questionData.referenceAnswer"
              type="textarea"
              :rows="4"
              placeholder="请输入参考答案"
            />
          </el-form-item>
        </div>

        <!-- 解析说明 -->
        <el-form-item label="解析说明">
          <el-input
            v-model="questionData.explanation"
            type="textarea"
            :rows="3"
            placeholder="请输入题目解析说明"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 题目预览 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>题目预览</span>
      </template>
      <div class="question-preview">
        <div class="preview-header">
          <el-tag :type="getTypeColor(questionData.type)" size="small">
            {{ getTypeLabel(questionData.type) }}
          </el-tag>
          <span class="preview-score">{{ questionData.score }}分</span>
          <el-tag :type="getDifficultyColor(questionData.difficulty)" size="small">
            {{ getDifficultyLabel(questionData.difficulty) }}
          </el-tag>
        </div>
        <div class="preview-content">
          {{ questionData.questionText || '题目内容预览' }}
        </div>
        <div v-if="isChoiceQuestion && questionData.options.length > 0" class="preview-options">
          <div
            v-for="option in questionData.options"
            :key="option.value"
            class="preview-option"
            :class="{ 'correct-option': isCorrectOption(option) }"
          >
            {{ option.value }}. {{ option.text }}
          </div>
        </div>
        <div v-else-if="questionData.type === 'fill' && questionData.correctAnswers.length > 0" class="preview-answer">
          <span class="answer-label">正确答案: </span>
          <span class="answer-content">{{ questionData.correctAnswers.join(', ') }}</span>
        </div>
        <div v-else-if="questionData.type === 'essay' && questionData.referenceAnswer" class="preview-answer">
          <span class="answer-label">参考答案: </span>
          <span class="answer-content">{{ questionData.referenceAnswer }}</span>
        </div>
        <div v-if="questionData.explanation" class="preview-explanation">
          <span class="explanation-label">解析: </span>
          <span class="explanation-content">{{ questionData.explanation }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  knowledgePoints: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// 题目数据
const questionData = reactive({
  type: 'single',
  questionText: '',
  score: 5,
  difficulty: 'medium',
  knowledgePoints: [],
  options: [
    { id: 'opt_a', value: 'A', text: '' },
    { id: 'opt_b', value: 'B', text: '' }
  ],
  correctAnswer: '',
  correctAnswers: [],
  fillAnswers: [],
  referenceAnswer: '',
  explanation: ''
})

const fillAnswerInput = ref('')

// 计算属性
const isChoiceQuestion = computed(() => {
  return ['single', 'multiple'].includes(questionData.type)
})

// 监听数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(questionData, newVal)
  }
}, { immediate: true, deep: true })

watch(questionData, () => {
  emit('update:modelValue', { ...questionData })
}, { deep: true })

// 方法
const onTypeChange = () => {
  // 切换题型时重置相关数据
  questionData.correctAnswer = ''
  questionData.correctAnswers = []
  questionData.referenceAnswer = ''

  if (questionData.type === 'single' || questionData.type === 'multiple') {
    // 确保选择题至少有两个选项
    if (questionData.options.length < 2) {
      questionData.options = [
        { id: 'opt_a', value: 'A', text: '' },
        { id: 'opt_b', value: 'B', text: '' }
      ]
    }
  }
}

const addOption = () => {
  const newOptionIndex = questionData.options.length
  const optionValue = String.fromCharCode(65 + newOptionIndex) // A, B, C, D...

  questionData.options.push({
    id: `opt_${optionValue.toLowerCase()}`,
    value: optionValue,
    text: ''
  })
}

const removeOption = (index) => {
  if (questionData.options.length > 2) {
    questionData.options.splice(index, 1)
    // 重新编号选项
    questionData.options.forEach((option, i) => {
      const newValue = String.fromCharCode(65 + i)
      option.value = newValue
      option.id = `opt_${newValue.toLowerCase()}`
    })
  }
}

const addFillAnswer = () => {
  if (fillAnswerInput.value.trim()) {
    questionData.correctAnswers.push(fillAnswerInput.value.trim())
    fillAnswerInput.value = ''
  }
}

const removeFillAnswer = (index) => {
  questionData.correctAnswers.splice(index, 1)
}

const resetQuestion = () => {
  Object.assign(questionData, {
    type: 'single',
    questionText: '',
    score: 5,
    difficulty: 'medium',
    knowledgePoints: [],
    options: [
      { id: 'opt_a', value: 'A', text: '' },
      { id: 'opt_b', value: 'B', text: '' }
    ],
    correctAnswer: '',
    correctAnswers: [],
    referenceAnswer: '',
    explanation: ''
  })
  fillAnswerInput.value = ''
}

const saveQuestion = () => {
  // 验证必填字段
  if (!questionData.questionText.trim()) {
    ElMessage.warning('请输入题目内容')
    return
  }

  if (!questionData.score) {
    ElMessage.warning('请输入分值')
    return
  }

  // 验证选择题答案
  if (questionData.type === 'single' && !questionData.correctAnswer) {
    ElMessage.warning('请选择正确答案')
    return
  }

  if (questionData.type === 'multiple' && questionData.correctAnswers.length === 0) {
    ElMessage.warning('请选择正确答案')
    return
  }

  // 验证填空题答案
  if (questionData.type === 'fill' && questionData.correctAnswers.length === 0) {
    ElMessage.warning('请添加正确答案')
    return
  }

  emit('save', { ...questionData })
}

const isCorrectOption = (option) => {
  if (questionData.type === 'single') {
    return option.value === questionData.correctAnswer
  } else if (questionData.type === 'multiple') {
    return questionData.correctAnswers.includes(option.value)
  }
  return false
}

// 辅助函数
const getTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'danger'
  }
  return colorMap[type] || 'info'
}

const getTypeLabel = (type) => {
  const labelMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return labelMap[type] || '未知'
}

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return colorMap[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labelMap[difficulty] || '未知'
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/components/QuestionEditor.vue`);
  });

</script>

<style scoped>
.question-editor {
  width: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: #303133;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.option-label {
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.fill-answers {
  margin-top: 8px;
}

/* 预览样式 */
.question-preview {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.preview-score {
  color: #67c23a;
  font-weight: 500;
}

.preview-content {
  margin-bottom: 16px;
  line-height: 1.6;
  color: #303133;
}

.preview-options {
  margin-bottom: 16px;
}

.preview-option {
  margin-bottom: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.correct-option {
  background: #f0f9ff;
  border-color: #409eff;
  color: #409eff;
  font-weight: 500;
}

.preview-answer {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #409eff;
}

.answer-label {
  color: #409eff;
  font-weight: 500;
  margin-right: 8px;
}

.answer-content {
  color: #303133;
}

.preview-explanation {
  padding: 12px;
  background: #fef9e7;
  border-radius: 4px;
  border: 1px solid #e6a23c;
}

.explanation-label {
  color: #e6a23c;
  font-weight: 500;
  margin-right: 8px;
}

.explanation-content {
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .option-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .option-actions {
    width: 100%;
    justify-content: space-between;
  }

  .preview-header {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>