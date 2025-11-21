<template>
  <div id="exam-renderer" class="exam-renderer">
    <el-card id="exam-header-card" class="exam-header-card" shadow="hover">
      <template #header>
        <div id="exam-header-content" class="header-content">
          <h2>{{ examData.basicInfo?.title }}</h2>
          <div id="exam-status" class="exam-status">
            <el-tag :type="getDifficultyType(examData.basicInfo?.difficulty)">
              {{ getDifficultyText(examData.basicInfo?.difficulty) }}
            </el-tag>
            <el-tag type="info" size="small">{{ getExamTypeLabel(examData.basicInfo?.type) }}</el-tag>
          </div>
        </div>
      </template>

      <div id="exam-meta" class="exam-meta">
        <div v-for="(item, index) in examMetaItems" :key="index" class="meta-item">
          <span class="label">{{ item.label }}：</span>
          <span>{{ item.value }}</span>
        </div>
      </div>

      <!-- 考试倒计时 -->
      <div v-if="showTimer" id="exam-timer" class="exam-timer">
        <div id="timer-display" class="timer-display">
          <el-icon><Timer /></el-icon>
          <span class="timer-text">剩余时间：{{ formatTime(remainingTime) }}</span>
        </div>
        <div id="timer-progress" class="timer-progress">
          <el-progress :percentage="timeProgress" :color="getTimerColor()" />
        </div>
      </div>

      <div id="exam-description" class="exam-description">
        {{ examData.basicInfo?.description }}
      </div>
    </el-card>

    <!-- 题目区域 -->
    <div id="questions-section" class="questions-section">
      <div id="questions-header" class="section-header">
        <h3>考试题目</h3>
        <div id="navigation-info" class="navigation-info">
          <span>当前题目：{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          <el-button-group>
            <el-button id="prev-question-btn" size="small" @click="prevQuestion" :disabled="currentQuestionIndex === 0">
              上一题
            </el-button>
            <el-button id="next-question-btn" size="small" @click="nextQuestion" :disabled="currentQuestionIndex === totalQuestions - 1">
              下一题
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 单题显示模式 -->
      <div v-if="!showAllQuestions" id="single-question" class="question-card">
        <div id="current-question-header" class="question-header">
          <span class="question-number">{{ currentQuestionIndex + 1 }}.</span>
          <el-tag :type="getQuestionTypeColor(currentQuestion.type)" size="small">
            {{ getQuestionTypeLabel(currentQuestion.type) }}
          </el-tag>
          <span class="question-score">({{ currentQuestion.score }} 分)</span>
          <el-tag v-if="currentQuestion.difficulty" :type="getDifficultyType(currentQuestion.difficulty)" size="small">
            {{ getDifficultyText(currentQuestion.difficulty) }}
          </el-tag>
        </div>

        <div id="current-question-content" class="question-content">
          <div class="question-text" v-html="currentQuestion.questionText"></div>

          <!-- 题目选项根据类型动态渲染 -->
          <component
            :is="getQuestionComponent(currentQuestion.type)"
            :question="currentQuestion"
            v-model="answers[currentQuestion.id]"
            :readonly="examSubmitted"
          />
        </div>
      </div>

      <!-- 全部题目显示模式 -->
      <div v-else id="all-questions" class="all-questions">
        <div
          v-for="(question, index) in allQuestions"
          :key="question.id"
          :id="`question-${index}`"
          class="question-card"
        >
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <el-tag :type="getQuestionTypeColor(question.type)" size="small">
              {{ getQuestionTypeLabel(question.type) }}
            </el-tag>
            <span class="question-score">({{ question.score }} 分)</span>
            <el-tag v-if="question.difficulty" :type="getDifficultyType(question.difficulty)" size="small">
              {{ getDifficultyText(question.difficulty) }}
            </el-tag>
          </div>

          <div class="question-content">
            <div class="question-text" v-html="question.questionText"></div>

            <component
              :is="getQuestionComponent(question.type)"
              :question="question"
              v-model="answers[question.id]"
              :readonly="examSubmitted"
            />
          </div>
        </div>
      </div>

      <!-- 题目导航面板 -->
      <div id="question-navigation" class="question-navigation">
        <h4>题目导航</h4>
        <div id="nav-grid" class="nav-grid">
          <div
            v-for="(question, index) in allQuestions"
            :key="question.id"
            :id="`nav-item-${index}`"
            class="nav-item"
            :class="getNavClass(question, index)"
            @click="jumpToQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div id="view-toggle" class="view-toggle">
          <el-switch
            v-model="showAllQuestions"
            active-text="显示全部题目"
            inactive-text="单题显示"
          />
        </div>
      </div>
    </div>

    <!-- 提交区域 -->
    <div v-if="!examSubmitted" id="submit-section" class="submit-section">
      <el-button
        id="submit-exam-btn"
        type="primary"
        size="large"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="!canSubmit"
      >
        提交试卷
      </el-button>
      <el-button id="save-progress-btn" size="large" @click="handleSaveProgress">
        保存进度
      </el-button>
    </div>

    <!-- 考试结果 -->
    <div v-else id="result-section" class="result-section">
      <el-card id="result-card" class="result-card">
        <template #header>
          <h3>考试结果</h3>
        </template>
        <div id="result-content" class="result-content">
          <div id="score-display" class="score-display">
            <div id="total-score" class="total-score">
              <span class="score-number">{{ examResult.totalScore }}</span>
              <span class="score-label">总分</span>
            </div>
            <div id="score-details" class="score-details">
              <div class="detail-item">
                <span class="label">正确率：</span>
                <span class="value">{{ examResult.accuracy }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">用时：</span>
                <span class="value">{{ examResult.timeUsed }}</span>
              </div>
              <div class="detail-item">
                <span class="label">结果：</span>
                <el-tag :type="examResult.passed ? 'success' : 'danger'">
                  {{ examResult.passed ? '通过' : '未通过' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Timer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SingleChoice from './questions/SingleChoice.vue'
import MultipleChoice from './questions/MultipleChoice.vue'
import FillBlank from './questions/FillBlank.vue'
import EssayQuestion from './questions/EssayQuestion.vue'

const props = defineProps({
  examData: {
    type: Object,
    required: true
  },
  showTimer: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const currentQuestionIndex = ref(0)
const answers = reactive({})
const showAllQuestions = ref(false)
const submitting = ref(false)
const examSubmitted = ref(false)
const remainingTime = ref(0)
const timerInterval = ref(null)
const examResult = reactive({
  totalScore: 0,
  accuracy: 0,
  timeUsed: '',
  passed: false
})

// 计算属性
const allQuestions = computed(() => {
  const questions = []
  props.examData.questionBanks?.forEach(bank => {
    questions.push(...bank.questions)
  })
  return questions
})

const totalQuestions = computed(() => allQuestions.value.length)

const currentQuestion = computed(() => {
  return allQuestions.value[currentQuestionIndex.value]
})

const examMetaItems = computed(() => [
  {
    label: '考试时间',
    value: `${formatDateTime(examData.schedule?.startTime)} - ${formatDateTime(examData.schedule?.endTime)}`
  },
  {
    label: '考试时长',
    value: `${examData.schedule?.duration} 分钟`
  },
  {
    label: '总分',
    value: `${examData.settings?.totalScore || 100} 分`
  },
  {
    label: '及格分',
    value: `${examData.settings?.passingScore || 60} 分`
  }
])

const resultDetails = computed(() => [
  {
    label: '正确率',
    value: `${examResult.accuracy}%`
  },
  {
    label: '用时',
    value: examResult.timeUsed
  },
  {
    label: '结果',
    value: examResult.passed ? '通过' : '未通过'
  }
])

const timeProgress = computed(() => {
  const totalTime = props.examData.schedule?.duration * 60 || 3600
  const elapsed = totalTime - remainingTime.value
  return Math.round((elapsed / totalTime) * 100)
})

const canSubmit = computed(() => {
  // 检查是否所有必答题都已作答
  return Object.keys(answers).length >= totalQuestions.value * 0.8 // 至少完成80%
})

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/ExamRenderer.vue`);
  initAnswers()
  if (props.showTimer) {
    startTimer()
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// 初始化答案
const initAnswers = () => {
  allQuestions.value.forEach(question => {
    if (question.type === 'fill') {
      answers[question.id] = new Array(question.correctAnswers?.length || 1).fill('')
    } else if (question.type === 'multiple') {
      answers[question.id] = []
    } else {
      answers[question.id] = ''
    }
  })
}

// 计时器
const startTimer = () => {
  const totalTime = props.examData.schedule?.duration * 60 || 3600
  remainingTime.value = totalTime

  timerInterval.value = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      clearInterval(timerInterval.value)
      handleSubmit() // 自动提交
    }
  }, 1000)
}

// 导航方法
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
  }
}

const jumpToQuestion = (index) => {
  currentQuestionIndex.value = index
}

// 获取题目组件
const getQuestionComponent = (type) => {
  const componentMap = {
    'single': SingleChoice,
    'multiple': MultipleChoice,
    'fill': FillBlank,
    'essay': EssayQuestion
  }
  return componentMap[type] || SingleChoice
}

// 工具方法
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const getTimerColor = () => {
  if (remainingTime.value < 300) { // 5分钟内
    return '#f56c6c'
  } else if (remainingTime.value < 900) { // 15分钟内
    return '#e6a23c'
  }
  return '#67c23a'
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

const getExamTypeLabel = (type) => {
  const labelMap = {
    'midterm': '期中考试',
    'final': '期末考试',
    'quiz': '随堂测验',
    'assignment': '作业测试'
  }
  return labelMap[type] || type
}

const getNavClass = (question, index) => {
  const classes = ['nav-item']
  if (answers[question.id]) {
    classes.push('answered')
  }
  if (index === currentQuestionIndex.value) {
    classes.push('current')
  }
  return classes
}

// 提交处理
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm('确定要提交试卷吗？提交后将无法修改。', '确认提交', {
      confirmButtonText: '确定提交',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true

    // 计算考试结果
    const result = calculateExamResult()
    Object.assign(examResult, result)

    examSubmitted.value = true
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }

    ElMessage.success('试卷提交成功！')
  } catch (error) {
    // 用户取消
  } finally {
    submitting.value = false
  }
}

const calculateExamResult = () => {
  let correctCount = 0
  let totalScore = 0

  allQuestions.value.forEach(question => {
    const userAnswer = answers[question.id]
    let isCorrect = false

    // 简化的评分逻辑
    if (question.type === 'single' && userAnswer === question.correctAnswer) {
      isCorrect = true
    } else if (question.type === 'multiple' && Array.isArray(userAnswer)) {
      const correctAnswers = question.correctAnswers || []
      isCorrect = userAnswer.length === correctAnswers.length &&
                   userAnswer.every(answer => correctAnswers.includes(answer))
    }

    if (isCorrect) {
      correctCount++
      totalScore += question.score || 0
    }
  })

  const accuracy = totalQuestions.value > 0 ? Math.round((correctCount / totalQuestions.value) * 100) : 0
  const passed = totalScore >= (props.examData.settings?.passingScore || 60)

  return {
    totalScore,
    accuracy,
    timeUsed: formatTime((props.examData.schedule?.duration * 60 || 3600) - remainingTime.value),
    passed
  }
}

const handleSaveProgress = () => {
  // 保存考试进度逻辑
  ElMessage.success('考试进度已保存')
}
</script>

<style scoped>
.exam-renderer {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
}

.exam-header-card {
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

.exam-status {
  display: flex;
  gap: var(--spacing-sm);
}

.exam-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
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

.exam-timer {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-light);
}

.timer-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.timer-text {
  font-weight: 600;
  color: var(--color-text-primary);
}

.exam-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.questions-section {
  background-color: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.section-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 600;
}

.navigation-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.question-card {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
  transition: var(--transition);
}

.question-card:hover {
  box-shadow: var(--shadow-medium);
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
  color: var(--color-text-primary);
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.all-questions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.question-navigation {
  position: sticky;
  top: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-light);
  margin-top: var(--spacing-lg);
}

.question-navigation h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-base);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
  color: var(--color-text-primary);
}

.nav-item:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.nav-item.answered {
  background-color: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.nav-item.current {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.view-toggle {
  text-align: center;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
}

.result-section {
  padding: var(--spacing-lg);
}

.result-card {
  text-align: center;
}

.result-card h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
}

.total-score {
  text-align: center;
}

.score-number {
  display: block;
  font-size: 48px;
  font-weight: bold;
  color: var(--color-primary-500);
  line-height: 1;
}

.score-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 16px;
  margin-top: var(--spacing-xs);
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.detail-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.detail-item .value {
  color: var(--color-text-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .exam-meta {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .score-display {
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .navigation-info {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}
</style>