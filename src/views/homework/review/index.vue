<template>
  <div class="homework-review-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">批改 > {{ homework?.title }}</span>
      </div>
      <div class="view-tabs">
        <el-radio-group v-model="viewMode" @change="handleViewModeChange">
          <el-radio-button label="student">按学生</el-radio-button>
          <el-radio-button label="question">按题目</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="main-content">
      <!-- 按学生视图 -->
      <template v-if="viewMode === 'student'">
        <div class="left-sidebar">
          <!-- 搜索和筛选 -->
          <el-input
            v-model="studentSearch"
            placeholder="搜索学生..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="studentStatusFilter" placeholder="状态" style="width: 100%; margin-top: 12px">
            <el-option label="全部" value="" />
            <el-option label="待批改" value="pending" />
            <el-option label="已批改" value="graded" />
            <el-option label="未提交" value="not_submitted" />
          </el-select>

          <div class="filter-stats">
            <span class="stat-item">待批改: <strong>{{ pendingCount }}</strong></span>
          </div>

          <!-- 学生列表 -->
          <div class="student-list">
            <div
              v-for="submission in filteredSubmissions"
              :key="submission.id"
              :class="['student-item', { active: selectedSubmissionId === submission.id }]"
              @click="selectSubmission(submission.id)"
            >
              <div class="student-header">
                <el-icon :class="['status-icon', getSubmissionStatusClass(submission)]">
                  <component :is="getSubmissionStatusIcon(submission)" />
                </el-icon>
                <span class="student-name">{{ submission.studentName }}</span>
              </div>
              <div class="student-score">
                <span class="score-text">{{ submission.score }}/{{ submission.maxScore }}</span>
                <el-progress
                  :percentage="getScorePercentage(submission)"
                  :color="getProgressColor(getScorePercentage(submission))"
                  :show-text="false"
                  style="margin-top: 4px"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：学生答题详情 -->
        <div class="right-content">
          <div v-if="selectedSubmission" class="submission-detail">
            <!-- 学生信息卡片 -->
            <div class="student-info-card">
              <h3>{{ selectedSubmission.studentName }} 的作业</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">总分</span>
                  <span class="value">{{ selectedSubmission.score }}/{{ selectedSubmission.maxScore }}</span>
                </div>
                <div class="info-item">
                  <span class="label">完成度</span>
                  <el-progress
                    :percentage="getScorePercentage(selectedSubmission)"
                    :color="getProgressColor(getScorePercentage(selectedSubmission))"
                  />
                </div>
                <div class="info-item">
                  <span class="label">提交时间</span>
                  <span class="value">{{ formatDateTime(selectedSubmission.submitTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 题目列表 -->
            <div class="question-answers-list">
              <h4>题目列表</h4>
              <div
                v-for="(answer, index) in selectedSubmission.answers"
                :key="answer.questionId"
                class="answer-item"
                @click="handleGradeQuestion(selectedSubmission, index)"
              >
                <div class="answer-header">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <el-tag :type="getTypeTagType(answer.type)" size="small">
                    {{ getTypeLabel(answer.type) }}
                  </el-tag>
                  <el-icon :class="['answer-status-icon', getAnswerStatusClass(answer)]">
                    <component :is="getAnswerStatusIcon(answer)" />
                  </el-icon>
                  <span class="answer-score">{{ answer.score }}/{{ answer.maxScore }}</span>
                </div>
                <div class="question-preview">
                  {{ getQuestionText(answer.questionId) }}
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="primary" @click="handleBatchGrade">
                批量批改
              </el-button>
            </div>
          </div>

          <el-empty v-else description="请选择一个学生查看详情" />
        </div>
      </template>

      <!-- 按题目视图 -->
      <template v-else>
        <div class="left-sidebar">
          <!-- 搜索和筛选 -->
          <el-input
            v-model="questionSearch"
            placeholder="搜索题目..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="questionTypeFilter" placeholder="题型" style="width: 100%; margin-top: 12px">
            <el-option label="全部题型" value="" />
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fill" />
            <el-option label="问答题" value="essay" />
          </el-select>

          <!-- 题目列表 -->
          <div class="question-list">
            <div
              v-for="(question, index) in homework?.questions"
              :key="question.id"
              :class="['question-item', { active: selectedQuestionIndex === index }]"
              @click="selectQuestion(index)"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <el-tag :type="getTypeTagType(question.type)" size="small">
                  {{ getTypeLabel(question.type) }}
                </el-tag>
              </div>
              <div class="question-stats">
                <span class="correct-rate">
                  答对率: {{ getQuestionCorrectRate(question.id) }}%
                </span>
                <span class="answer-count">
                  {{ getQuestionAnswerCount(question.id) }}/{{ submissions.length }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：题目答题情况 -->
        <div class="right-content">
          <div v-if="selectedQuestion" class="question-detail">
            <div class="question-info-card">
              <h3>第{{ selectedQuestionIndex + 1 }}题</h3>
              <div class="question-meta">
                <el-tag :type="getTypeTagType(selectedQuestion.type)">
                  {{ getTypeLabel(selectedQuestion.type) }}
                </el-tag>
                <span class="question-score">满分: {{ selectedQuestion.score }}分</span>
                <span class="correct-rate">
                  答对率: {{ getQuestionCorrectRate(selectedQuestion.id) }}%
                </span>
              </div>
              <div class="question-content">
                {{ selectedQuestion.questionText }}
              </div>
            </div>

            <!-- 学生答题情况列表 -->
            <div class="student-answers-list">
              <h4>学生答题情况</h4>
              <div
                v-for="submission in submissions"
                :key="submission.id"
                class="student-answer-item"
                @click="handleGradeStudentQuestion(submission, selectedQuestionIndex)"
              >
                <div class="student-info">
                  <span class="student-name">{{ submission.studentName }}</span>
                  <el-icon :class="['answer-status-icon', getAnswerStatusClass(getStudentAnswer(submission, selectedQuestion.id))]">
                    <component :is="getAnswerStatusIcon(getStudentAnswer(submission, selectedQuestion.id))" />
                  </el-icon>
                  <span class="answer-text">
                    {{ getStudentAnswerText(submission, selectedQuestion.id) }}
                  </span>
                  <span class="answer-score">
                    {{ getStudentAnswerScore(submission, selectedQuestion.id) }}/{{ selectedQuestion.score }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="请选择一个题目查看详情" />
        </div>
      </template>
    </div>

    <!-- 单题批改对话框 -->
    <QuestionGradingDialog
      v-model="gradingDialogVisible"
      :submission="currentGradingSubmission"
      :question-index="currentQuestionIndex"
      :homework="homework"
      @save="handleSaveGrade"
      @next="handleNextQuestion"
      @prev="handlePrevQuestion"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  CircleCheck,
  CircleClose,
  Clock,
  QuestionFilled
} from '@element-plus/icons-vue'
import QuestionGradingDialog from './components/QuestionGradingDialog.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const viewMode = ref('student')
const studentSearch = ref('')
const studentStatusFilter = ref('')
const questionSearch = ref('')
const questionTypeFilter = ref('')
const selectedSubmissionId = ref(null)
const selectedQuestionIndex = ref(null)
const gradingDialogVisible = ref(false)
const currentGradingSubmission = ref(null)
const currentQuestionIndex = ref(null)

const homework = ref(null)
const submissions = ref([])

// 计算属性
const selectedSubmission = computed(() => {
  return submissions.value.find(s => s.id === selectedSubmissionId.value)
})

const selectedQuestion = computed(() => {
  if (selectedQuestionIndex.value === null || !homework.value) return null
  return homework.value.questions[selectedQuestionIndex.value]
})

const filteredSubmissions = computed(() => {
  let result = submissions.value

  // 搜索过滤
  if (studentSearch.value) {
    result = result.filter(s => s.studentName.includes(studentSearch.value))
  }

  // 状态过滤
  if (studentStatusFilter.value) {
    result = result.filter(s => s.status === studentStatusFilter.value)
  }

  return result
})

const pendingCount = computed(() => {
  return submissions.value.filter(s => s.status === 'pending').length
})

// 初始化模拟数据
const initMockData = () => {
  homework.value = {
    id: 'hw_001',
    title: '第一章作业',
    totalScore: 50,
    questions: [
      {
        id: 'hwq_001',
        questionId: 'q_001',
        type: 'single',
        questionText: '软件工程的核心目标是什么?',
        options: [
          { value: 'A', text: '提高开发速度' },
          { value: 'B', text: '降低开发成本' },
          { value: 'C', text: '提高软件质量和可维护性' },
          { value: 'D', text: '增加代码量' }
        ],
        correctAnswer: 'C',
        score: 2
      },
      {
        id: 'hwq_002',
        questionId: 'q_002',
        type: 'multiple',
        questionText: '以下哪些是软件开发模型?',
        options: [
          { value: 'A', text: '瀑布模型', isCorrect: true },
          { value: 'B', text: '敏捷开发', isCorrect: true },
          { value: 'C', text: '螺旋模型', isCorrect: true },
          { value: 'D', text: '线性模型', isCorrect: false }
        ],
        score: 3
      },
      {
        id: 'hwq_003',
        questionId: 'q_003',
        type: 'fill',
        questionText: '中国的首都是_____',
        fillBlanks: [{ answers: ['北京', '北京市'] }],
        score: 2
      },
      {
        id: 'hwq_004',
        questionId: 'q_004',
        type: 'essay',
        questionText: '请简述软件工程的三要素',
        referenceAnswer: '1. 方法\n2. 工具\n3. 过程',
        score: 5
      }
    ]
  }

  submissions.value = [
    {
      id: 'sub_001',
      studentId: 'stu_001',
      studentName: '张三',
      homeworkId: 'hw_001',
      submitTime: '2024-12-20T15:30:00Z',
      score: 8,
      maxScore: 12,
      status: 'graded',
      answers: [
        {
          questionId: 'hwq_001',
          type: 'single',
          studentAnswer: 'C',
          correctAnswer: 'C',
          score: 2,
          maxScore: 2,
          isCorrect: true,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_002',
          type: 'multiple',
          studentAnswer: ['A', 'B'],
          correctAnswer: ['A', 'B', 'C'],
          score: 2,
          maxScore: 3,
          isCorrect: false,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_003',
          type: 'fill',
          studentAnswer: ['北京'],
          correctAnswer: ['北京', '北京市'],
          score: 2,
          maxScore: 2,
          isCorrect: true,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_004',
          type: 'essay',
          studentAnswer: '软件工程的三要素是方法论、开发工具和管理流程',
          correctAnswer: null,
          score: 4,
          maxScore: 5,
          isCorrect: false,
          aiScore: 4,
          aiComment: '表述基本正确，但不够精准',
          manualScore: 4,
          manualComment: '同意AI评分',
          status: 'manual_reviewed'
        }
      ]
    },
    {
      id: 'sub_002',
      studentId: 'stu_002',
      studentName: '李四',
      homeworkId: 'hw_001',
      submitTime: '2024-12-21T10:00:00Z',
      score: 0,
      maxScore: 12,
      status: 'pending',
      answers: [
        {
          questionId: 'hwq_001',
          type: 'single',
          studentAnswer: 'A',
          correctAnswer: 'C',
          score: 0,
          maxScore: 2,
          isCorrect: false,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_002',
          type: 'multiple',
          studentAnswer: ['A'],
          correctAnswer: ['A', 'B', 'C'],
          score: 1,
          maxScore: 3,
          isCorrect: false,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_003',
          type: 'fill',
          studentAnswer: ['北京市'],
          correctAnswer: ['北京', '北京市'],
          score: 2,
          maxScore: 2,
          isCorrect: true,
          status: 'auto_graded'
        },
        {
          questionId: 'hwq_004',
          type: 'essay',
          studentAnswer: '不知道',
          correctAnswer: null,
          score: 0,
          maxScore: 5,
          isCorrect: false,
          aiScore: 0,
          aiComment: '答案不完整',
          status: 'pending'
        }
      ]
    }
  ]

  // 默认选中第一个提交
  if (submissions.value.length > 0) {
    selectedSubmissionId.value = submissions.value[0].id
  }
}

// 方法
const handleBack = () => {
  router.back()
}

const handleViewModeChange = () => {
  selectedSubmissionId.value = null
  selectedQuestionIndex.value = null
}

const selectSubmission = (submissionId) => {
  selectedSubmissionId.value = submissionId
}

const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

const handleGradeQuestion = (submission, questionIndex) => {
  currentGradingSubmission.value = submission
  currentQuestionIndex.value = questionIndex
  gradingDialogVisible.value = true
}

const handleGradeStudentQuestion = (submission, questionIndex) => {
  currentGradingSubmission.value = submission
  currentQuestionIndex.value = questionIndex
  gradingDialogVisible.value = true
}

const handleBatchGrade = () => {
  ElMessage.info('批量批改功能开发中...')
}

const handleSaveGrade = (gradeData) => {
  ElMessage.success('评分保存成功')
}

const handleNextQuestion = () => {
  if (currentQuestionIndex.value < homework.value.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    ElMessage.info('已经是最后一题了')
  }
}

const handlePrevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  } else {
    ElMessage.info('已经是第一题了')
  }
}

// 辅助方法
const getSubmissionStatusIcon = (submission) => {
  if (submission.status === 'graded') return CircleCheck
  if (submission.status === 'pending') return Clock
  return CircleClose
}

const getSubmissionStatusClass = (submission) => {
  if (submission.status === 'graded') return 'status-graded'
  if (submission.status === 'pending') return 'status-pending'
  return 'status-not-submitted'
}

const getAnswerStatusIcon = (answer) => {
  if (!answer) return QuestionFilled
  if (answer.isCorrect) return CircleCheck
  if (answer.status === 'pending') return Clock
  return CircleClose
}

const getAnswerStatusClass = (answer) => {
  if (!answer) return 'status-unknown'
  if (answer.isCorrect) return 'status-correct'
  if (answer.status === 'pending') return 'status-pending'
  return 'status-incorrect'
}

const getScorePercentage = (submission) => {
  if (!submission.maxScore) return 0
  return Math.round((submission.score / submission.maxScore) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答',
    programming: '编程'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'info',
    programming: 'danger'
  }
  return map[type] || ''
}

const getQuestionText = (questionId) => {
  const question = homework.value?.questions.find(q => q.id === questionId)
  return question?.questionText || ''
}

const getQuestionCorrectRate = (questionId) => {
  const answers = submissions.value.map(s =>
    s.answers.find(a => a.questionId === questionId)
  ).filter(Boolean)

  if (answers.length === 0) return 0

  const correctCount = answers.filter(a => a.isCorrect).length
  return Math.round((correctCount / answers.length) * 100)
}

const getQuestionAnswerCount = (questionId) => {
  return submissions.value.filter(s =>
    s.answers.some(a => a.questionId === questionId)
  ).length
}

const getStudentAnswer = (submission, questionId) => {
  return submission.answers.find(a => a.questionId === questionId)
}

const getStudentAnswerText = (submission, questionId) => {
  const answer = getStudentAnswer(submission, questionId)
  if (!answer) return '未作答'
  if (Array.isArray(answer.studentAnswer)) {
    return answer.studentAnswer.join(', ')
  }
  return answer.studentAnswer
}

const getStudentAnswerScore = (submission, questionId) => {
  const answer = getStudentAnswer(submission, questionId)
  return answer?.score || 0
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.homework-review-container {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--color-border-light);

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-sidebar {
  width: 240px;
  background: var(--color-bg-secondary);
  padding: 16px;
  overflow-y: auto;

  .filter-stats {
    margin: 12px 0;
    padding: 8px;
    background: var(--color-bg-tertiary);
    border-radius: 4px;
    font-size: 13px;

    .stat-item {
      strong {
        color: var(--color-primary);
      }
    }
  }

  .student-list,
  .question-list {
    margin-top: 16px;
  }

  .student-item,
  .question-item {
    padding: 12px;
    margin-bottom: 8px;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--color-bg-tertiary);
    }

    &.active {
      background: var(--color-primary-light-9);
      border: 1px solid var(--color-primary);
    }
  }

  .student-header,
  .question-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .status-icon {
      font-size: 16px;

      &.status-graded {
        color: #67c23a;
      }

      &.status-pending {
        color: #e6a23c;
      }

      &.status-not-submitted {
        color: #909399;
      }
    }

    .student-name,
    .question-number {
      font-weight: 600;
    }
  }

  .student-score {
    .score-text {
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  .question-stats {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.right-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.student-info-card,
.question-info-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-base);

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .info-item {
      .label {
        display: block;
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 4px;
      }

      .value {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }
  }

  .question-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .question-content {
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    line-height: 1.6;
  }
}

.question-answers-list,
.student-answers-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-base);

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.answer-item,
.student-answer-item {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-primary);
  }

  .answer-header,
  .student-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    .answer-status-icon {
      font-size: 16px;

      &.status-correct {
        color: #67c23a;
      }

      &.status-incorrect {
        color: #f56c6c;
      }

      &.status-pending {
        color: #e6a23c;
      }

      &.status-unknown {
        color: #909399;
      }
    }

    .answer-score {
      margin-left: auto;
      font-weight: 600;
      color: var(--color-primary);
    }
  }

  .question-preview,
  .answer-text {
    font-size: 14px;
    color: var(--color-text-regular);
  }
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}
</style>
