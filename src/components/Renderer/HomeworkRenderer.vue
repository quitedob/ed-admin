<template>
  <div class="homework-renderer" id="homework-renderer">
    <el-card class="homework-header-card" shadow="hover" id="homework-header-card">
      <template #header>
        <div class="header-content" id="header-content">
          <h2>{{ homeworkData.basicInfo?.title }}</h2>
          <el-tag :type="getDifficultyType(homeworkData.basicInfo?.difficulty)">
            {{ getDifficultyText(homeworkData.basicInfo?.difficulty) }}
          </el-tag>
        </div>
      </template>

      <div class="homework-meta" id="homework-meta">
        <div class="meta-item" id="meta-due-date">
          <span class="label">截止时间：</span>
          <span>{{ formatDate(homeworkData.schedule?.dueDate) }}</span>
        </div>
        <div class="meta-item" id="meta-question-count">
          <span class="label">题目数量：</span>
          <span>{{ homeworkData.questions?.length || 0 }} 题</span>
        </div>
        <div class="meta-item" id="meta-total-score">
          <span class="label">总分：</span>
          <span class="score">{{ calculateTotalScore() }} 分</span>
        </div>
      </div>

      <div class="homework-description" id="homework-description">
        {{ homeworkData.basicInfo?.description }}
      </div>
    </el-card>

    <div class="questions-section" id="questions-section">
      <div
        v-for="(question, index) in homeworkData.questions"
        :key="question.id"
        class="question-card"
        :id="`question-card-${index}`"
      >
        <div class="question-header" :id="`question-header-${index}`">
          <span class="question-number">{{ index + 1 }}.</span>
          <el-tag
            :type="getQuestionTypeColor(question.type)"
            size="small"
          >
            {{ getQuestionTypeLabel(question.type) }}
          </el-tag>
          <span class="question-score">({{ question.score }} 分)</span>
          <el-tag
            v-if="question.difficulty"
            :type="getDifficultyType(question.difficulty)"
            size="small"
          >
            {{ getDifficultyText(question.difficulty) }}
          </el-tag>
        </div>

        <div class="question-content" :id="`question-content-${index}`">
          <div class="question-text" v-html="question.questionText" :id="`question-text-${index}`"></div>

          <!-- 单选题 -->
          <el-radio-group
            v-if="question.type === 'single'"
            v-model="answers[question.id]"
            class="options-group"
          >
            <el-radio
              v-for="option in question.options"
              :key="option.id"
              :label="option.value"
              class="option-item"
            >
              {{ option.value }}. {{ option.text }}
            </el-radio>
          </el-radio-group>

          <!-- 多选题 -->
          <el-checkbox-group
            v-else-if="question.type === 'multiple'"
            v-model="answers[question.id]"
            class="options-group"
          >
            <el-checkbox
              v-for="option in question.options"
              :key="option.id"
              :label="option.value"
              class="option-item"
            >
              {{ option.value }}. {{ option.text }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 填空题 -->
          <div v-else-if="question.type === 'fill'" class="fill-input">
            <el-input
              v-for="(blank, idx) in question.correctAnswers?.length || 1"
              :key="idx"
              v-model="answers[question.id][idx]"
              placeholder="请输入答案"
              class="fill-blank"
            />
          </div>

          <!-- 问答题 -->
          <el-input
            v-else-if="question.type === 'essay'"
            v-model="answers[question.id]"
            type="textarea"
            :rows="6"
            placeholder="请输入你的答案..."
            class="essay-input"
          />
        </div>

        <!-- 显示答案和解析（仅在设置允许时） -->
        <div
          v-if="showAnswers && (question.correctAnswer || question.correctAnswers)"
          class="question-answer"
        >
          <div class="answer-section">
            <span class="answer-label">正确答案：</span>
            <span class="answer-content">
              {{ formatCorrectAnswer(question) }}
            </span>
          </div>
          <div v-if="question.explanation" class="explanation-section">
            <span class="explanation-label">解析：</span>
            <span class="explanation-content">{{ question.explanation }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="submit-section" id="submit-section">
      <el-button
        type="primary"
        size="large"
        @click="handleSubmit"
        :loading="submitting"
        id="submit-homework-btn"
      >
        提交作业
      </el-button>
      <el-button
        size="large"
        @click="handleSaveDraft"
        id="save-draft-btn"
      >
        保存草稿
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  homeworkData: {
    type: Object,
    required: true
  },
  showAnswers: {
    type: Boolean,
    default: false
  }
})

const answers = reactive({})
const submitting = ref(false)

// 初始化答案对象
const initAnswers = () => {
  props.homeworkData.questions?.forEach(question => {
    if (question.type === 'fill') {
      answers[question.id] = new Array(question.correctAnswers?.length || 1).fill('')
    } else if (question.type === 'multiple') {
      answers[question.id] = []
    } else {
      answers[question.id] = ''
    }
  })
}

initAnswers()

const calculateTotalScore = () => {
  return props.homeworkData.questions?.reduce((sum, q) => sum + (q.score || 0), 0) || 0
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getQuestionTypeColor = (type) => {
  const colorMap = {
    'single': 'primary',
    'multiple': 'success',
    'fill': 'warning',
    'essay': 'danger'
  }
  return colorMap[type] || 'info'
}

const getQuestionTypeLabel = (type) => {
  const labelMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '问答题'
  }
  return labelMap[type] || type
}

const getDifficultyType = (difficulty) => {
  const typeMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const textMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return textMap[difficulty] || difficulty
}

const formatCorrectAnswer = (question) => {
  if (question.type === 'single') {
    return question.correctAnswer
  } else if (question.type === 'multiple') {
    return question.correctAnswers?.join(', ') || ''
  } else if (question.type === 'fill') {
    return question.correctAnswers?.join('、') || ''
  } else if (question.type === 'essay') {
    return question.referenceAnswer || '参考答案见解析'
  }
  return ''
}

const handleSubmit = async () => {
  // 检查是否所有题目都已作答
  const unanswered = props.homeworkData.questions?.filter(q => {
    const answer = answers[q.id]
    if (Array.isArray(answer)) {
      return answer.length === 0 || answer.every(a => !a)
    }
    return !answer
  })

  if (unanswered && unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 道题未作答`)
    return
  }

  submitting.value = true

  try {
    // 这里调用提交API
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟API调用
    ElMessage.success('作业提交成功！')
    // 可以触发事件通知父组件
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleSaveDraft = () => {
  // 保存草稿逻辑
  ElMessage.success('草稿保存成功')
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/HomeworkRenderer.vue`);
  });

</script>

<style scoped>
.homework-renderer {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
}

.homework-header-card {
  margin-bottom: var(--spacing-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
}

.homework-meta {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-item .score {
  color: var(--color-primary-500);
  font-weight: 600;
  font-size: 18px;
}

.homework-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.questions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.question-card {
  background-color: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
  transition: var(--transition);
}

.question-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.question-number {
  color: var(--color-primary-500);
  font-weight: 600;
  font-size: 18px;
}

.question-score {
  color: var(--color-success);
  font-weight: 500;
  margin-left: auto;
}

.question-content {
  margin-bottom: var(--spacing-md);
}

.question-text {
  color: var(--color-text-primary);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-light);
  transition: var(--transition);
}

.option-item:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.fill-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.fill-blank {
  max-width: 400px;
}

.essay-input {
  width: 100%;
}

.question-answer {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  border-left: 4px solid var(--color-primary-500);
}

.answer-section,
.explanation-section {
  margin-bottom: var(--spacing-sm);
}

.answer-label,
.explanation-label {
  color: var(--color-primary-500);
  font-weight: 600;
  margin-right: var(--spacing-xs);
}

.answer-content {
  color: var(--color-success);
  font-weight: 500;
}

.explanation-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
}
</style>