<template>
  <div class="app-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回作业列表</el-button>
    </div>

    <!-- 作业基本信息 -->
    <div class="homework-header">
      <div class="homework-info">
        <div class="homework-title">
          <h1>{{ homeworkInfo.basicInfo?.title }}</h1>
          <div class="homework-meta">
            <el-tag :type="getTypeTagType(homeworkInfo.basicInfo?.type)">
              {{ getTypeText(homeworkInfo.basicInfo?.type) }}
            </el-tag>
            <el-tag :type="getDifficultyTagType(homeworkInfo.basicInfo?.difficulty)">
              {{ getDifficultyText(homeworkInfo.basicInfo?.difficulty) }}
            </el-tag>
          </div>
        </div>
        <div class="homework-desc">{{ homeworkInfo.basicInfo?.description }}</div>
      </div>
      <div class="homework-actions toolbar-actions">
        <el-button type="primary" @click="toHomeworkEdit">编辑作业</el-button>
        <el-button type="success" @click="toHomeworkGrade">批改作业</el-button>
      </div>
    </div>

    <!-- 元数据信息 -->
    <div class="metadata-section">
      <h3>元数据信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="作业ID">{{ homeworkInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ homeworkInfo.metadata?.version }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(homeworkInfo.metadata?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(homeworkInfo.metadata?.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ homeworkInfo.metadata?.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="所属课程">{{ getCourseName(homeworkInfo.metadata?.courseId) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 时间安排 -->
    <div class="schedule-section">
      <h3>时间安排</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="发布时间">{{ formatDate(homeworkInfo.schedule?.releaseDate) }}</el-descriptions-item>
        <el-descriptions-item label="截止时间">{{ formatDate(homeworkInfo.schedule?.dueDate) }}</el-descriptions-item>
        <el-descriptions-item label="提醒时间">{{ formatDate(homeworkInfo.schedule?.remindDate) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 作业设置 -->
    <div class="settings-section">
      <h3>作业设置</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="允许迟交">
          <el-tag :type="homeworkInfo.settings?.allowLateSubmission ? 'success' : 'danger'">
            {{ homeworkInfo.settings?.allowLateSubmission ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="迟交扣分">{{ homeworkInfo.settings?.latePenalty }}%</el-descriptions-item>
        <el-descriptions-item label="随机顺序">
          <el-tag :type="homeworkInfo.settings?.randomOrder ? 'success' : 'info'">
            {{ homeworkInfo.settings?.randomOrder ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="即时批改">
          <el-tag :type="homeworkInfo.settings?.immediateGrading ? 'success' : 'info'">
            {{ homeworkInfo.settings?.immediateGrading ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="显示答案">
          <el-tag :type="homeworkInfo.settings?.showCorrectAnswers ? 'success' : 'info'">
            {{ homeworkInfo.settings?.showCorrectAnswers ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交后可查看">
          <el-tag :type="homeworkInfo.settings?.reviewAfterSubmit ? 'success' : 'info'">
            {{ homeworkInfo.settings?.reviewAfterSubmit ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <h3>完成度统计</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="题目总数" :value="homeworkInfo.statistics?.totalQuestions || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="完成人数" :value="`${completedCount}/${totalStudents}`" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均完成度" :value="averageCompletionRate" suffix="%" />
        </el-col>
      </el-row>
    </div>

    <!-- 双视图切换 -->
    <div class="view-mode-selector">
      <el-radio-group v-model="viewMode" @change="handleViewModeChange">
        <el-radio-button label="student">按学生查看</el-radio-button>
        <el-radio-button label="question">按题目查看</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 主内容区 -->
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
            <el-option label="已提交" value="submitted" />
            <el-option label="已批改" value="graded" />
            <el-option label="未提交" value="not_submitted" />
          </el-select>

          <!-- 学生列表 -->
          <div class="student-list">
            <div
              v-for="submission in filteredStudentSubmissions"
              :key="submission.id"
              :class="['student-item', { active: selectedSubmissionId === submission.id }]"
              @click="selectSubmission(submission.id)"
            >
              <div class="student-header">
                <span class="student-name">{{ submission.studentName }}</span>
              </div>
              <div class="student-completion">
                <span class="completion-text">{{ submission.answeredCount || 0 }}/{{ submission.totalQuestions || 0 }}</span>
                <el-progress
                  :percentage="getCompletionPercentage(submission)"
                  :color="getProgressColor(getCompletionPercentage(submission))"
                  :show-text="false"
                  style="margin-top: 4px"
                />
              </div>
              <div class="student-time">{{ formatDate(submission.submitTime) }}</div>
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
                  <span class="label">完成度</span>
                  <span class="value">{{ selectedSubmission.answeredCount || 0 }}/{{ selectedSubmission.totalQuestions || 0 }}</span>
                </div>
                <div class="info-item">
                  <span class="label">完成进度</span>
                  <el-progress
                    :percentage="getCompletionPercentage(selectedSubmission)"
                    :color="getProgressColor(getCompletionPercentage(selectedSubmission))"
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
              <div class="question-items">
                <div
                  v-for="(answer, index) in selectedSubmission.answers"
                  :key="answer.questionId"
                  class="question-item"
                >
                  <div class="question-header">
                    <span class="question-number">{{ index + 1 }}.</span>
                    <span class="question-type">{{ getQuestionTypeText(answer.type) }}</span>
                    <span class="answer-status">{{ answer.isCorrect ? '✓ 正确' : '✗ 错误' }}</span>
                  </div>
                  <div class="student-answer">
                    <span class="answer-label">学生答案：</span>
                    <span class="answer-value">{{ answer.studentAnswer || '未作答' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="请选择一个学生查看详情" />
        </div>
      </template>

      <!-- 按题目视图 -->
      <template v-else>
        <div class="left-sidebar">
          <!-- 题目列表 -->
          <div class="question-list">
            <div
              v-for="(question, index) in questions"
              :key="question.id"
              :class="['question-item-sidebar', { active: selectedQuestionIndex === index }]"
              @click="selectQuestion(index)"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-type">{{ getQuestionTypeText(question.type) }}</span>
              </div>
              <div class="question-stats">
                <span class="correct-rate">答对率: {{ getQuestionCorrectRate(question.id) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：题目答题情况 -->
        <div class="right-content">
          <div v-if="selectedQuestion" class="question-detail">
            <!-- 题目信息卡片 -->
            <div class="question-info-card">
              <h3>第 {{ selectedQuestionIndex + 1 }} 题</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">题型</span>
                  <span class="value">{{ getQuestionTypeText(selectedQuestion.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">答对率</span>
                  <span class="value">{{ getQuestionCorrectRate(selectedQuestion.id) }}%</span>
                </div>
                <div class="info-item">
                  <span class="label">已答人数</span>
                  <span class="value">{{ getQuestionAnsweredCount(selectedQuestion.id) }}/{{ totalStudents }}</span>
                </div>
              </div>
            </div>

            <!-- 学生答题情况 -->
            <div class="student-answers-list">
              <h4>学生答题情况</h4>
              <div class="student-items">
                <div
                  v-for="submission in submissions"
                  :key="submission.id"
                  class="student-item-detail"
                >
                  <div class="student-header">
                    <span class="student-name">{{ submission.studentName }}</span>
                    <span :class="['answer-status', getAnswerStatusClass(getStudentAnswer(submission, selectedQuestion.id))]">
                      {{ getStudentAnswer(submission, selectedQuestion.id)?.isCorrect ? '✓ 正确' : '✗ 错误' }}
                    </span>
                  </div>
                  <div class="student-answer">
                    <span class="answer-label">答案：</span>
                    <span class="answer-value">{{ getStudentAnswer(submission, selectedQuestion.id)?.studentAnswer || '未作答' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-empty v-else description="请选择一道题目查看详情" />
        </div>
      </template>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const homeworkInfo = ref({})
const questions = ref([])
const submissions = ref([])
const courseOptions = ref([])
const viewMode = ref('student')
const selectedSubmissionId = ref(null)
const selectedQuestionIndex = ref(null)
const studentSearch = ref('')
const studentStatusFilter = ref('')

// 计算属性
const selectedSubmission = computed(() => {
  return submissions.value.find(s => s.id === selectedSubmissionId.value)
})

const selectedQuestion = computed(() => {
  if (selectedQuestionIndex.value === null) return null
  return questions.value[selectedQuestionIndex.value]
})

const filteredStudentSubmissions = computed(() => {
  let result = submissions.value

  if (studentSearch.value) {
    result = result.filter(s => s.studentName.includes(studentSearch.value))
  }

  if (studentStatusFilter.value) {
    result = result.filter(s => s.status === studentStatusFilter.value)
  }

  return result
})

const completedCount = computed(() => {
  return submissions.value.filter(s => s.status !== 'not_submitted').length
})

const totalStudents = computed(() => {
  return submissions.value.length
})

const averageCompletionRate = computed(() => {
  if (submissions.value.length === 0) return 0
  const totalCompletion = submissions.value.reduce((sum, s) => {
    return sum + ((s.answeredCount || 0) / (s.totalQuestions || 1) * 100)
  }, 0)
  return Math.round(totalCompletion / submissions.value.length)
})

// 获取作业详情
const getHomeworkDetail = () => {
  const homeworkId = route.query.id
  if (!homeworkId) {
    return
  }

  // 使用模拟数据
  import('@/utils/mockData').then(({ mockApi }) => {
    // 获取作业详情
    mockApi.getHomeworkDetail(homeworkId).then(homework => {
      homeworkInfo.value = homework || {}
      questions.value = homework.questions || []
    })
    
    // 获取课程列表
    mockApi.getCourses().then(res => {
      courseOptions.value = res.records
    })
    
    // 获取提交列表
    getSubmissions()
  })
}

// 获取提交列表
const getSubmissions = () => {
  // 模拟提交数据
  submissions.value = [
    {
      id: 'sub_001',
      studentName: '张三',
      submitTime: new Date('2024-09-05T10:30:00Z'),
      status: 'graded',
      answeredCount: 4,
      totalQuestions: 5,
      answers: [
        { questionId: 'q_001', type: 'single', studentAnswer: 'A', isCorrect: true },
        { questionId: 'q_002', type: 'multiple', studentAnswer: 'BC', isCorrect: false },
        { questionId: 'q_003', type: 'fill', studentAnswer: '答案', isCorrect: true },
        { questionId: 'q_004', type: 'essay', studentAnswer: '学生答案', isCorrect: true }
      ]
    },
    {
      id: 'sub_002',
      studentName: '李四',
      submitTime: new Date('2024-09-06T14:20:00Z'),
      status: 'graded',
      answeredCount: 5,
      totalQuestions: 5,
      answers: [
        { questionId: 'q_001', type: 'single', studentAnswer: 'A', isCorrect: true },
        { questionId: 'q_002', type: 'multiple', studentAnswer: 'ABC', isCorrect: true },
        { questionId: 'q_003', type: 'fill', studentAnswer: '答案', isCorrect: true },
        { questionId: 'q_004', type: 'essay', studentAnswer: '学生答案', isCorrect: true },
        { questionId: 'q_005', type: 'coding', studentAnswer: 'code', isCorrect: true }
      ]
    },
    {
      id: 'sub_003',
      studentName: '王五',
      submitTime: new Date('2024-09-06T16:45:00Z'),
      status: 'submitted',
      answeredCount: 2,
      totalQuestions: 5,
      answers: [
        { questionId: 'q_001', type: 'single', studentAnswer: 'B', isCorrect: false },
        { questionId: 'q_002', type: 'multiple', studentAnswer: 'B', isCorrect: false }
      ]
    }
  ]

  // 初始化选中第一个学生
  if (submissions.value.length > 0 && !selectedSubmissionId.value) {
    selectedSubmissionId.value = submissions.value[0].id
  }
}

// 返回列表
const goBack = () => {
  router.push('/homework')
}

// 编辑作业
const toHomeworkEdit = () => {
  if (!homeworkInfo.value.id) {
    return
  }
  router.push({ path: '/homework/edit', query: { id: homeworkInfo.value.id } })
}

// 批改作业
const toHomeworkGrade = () => {
  if (!homeworkInfo.value.id) {
    return
  }
  router.push({ path: '/homework/grading', query: { id: homeworkInfo.value.id } })
}

// 视图模式切换
const handleViewModeChange = () => {
  selectedSubmissionId.value = null
  selectedQuestionIndex.value = null
}

// 选择学生
const selectSubmission = (id) => {
  selectedSubmissionId.value = id
}

// 选择题目
const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

// 获取学生答案
const getStudentAnswer = (submission, questionId) => {
  return submission.answers.find(a => a.questionId === questionId)
}

// 获取题目答对率
const getQuestionCorrectRate = (questionId) => {
  const answers = submissions.value.flatMap(s => s.answers).filter(a => a.questionId === questionId)
  if (answers.length === 0) return 0
  const correctCount = answers.filter(a => a.isCorrect).length
  return Math.round((correctCount / answers.length) * 100)
}

// 获取题目已答人数
const getQuestionAnsweredCount = (questionId) => {
  return submissions.value.filter(s => s.answers.some(a => a.questionId === questionId)).length
}

// 获取完成度百分比
const getCompletionPercentage = (submission) => {
  if (!submission.totalQuestions) return 0
  return Math.round(((submission.answeredCount || 0) / submission.totalQuestions) * 100)
}

// 获取答案状态类
const getAnswerStatusClass = (answer) => {
  if (!answer) return 'status-unknown'
  return answer.isCorrect ? 'status-correct' : 'status-incorrect'
}

// 工具方法
const getCourseName = (courseId) => {
  const course = courseOptions.value.find(c => c.id === courseId)
  return course ? course.basicInfo?.title : ''
}

const getTypeText = (type) => {
  const typeMap = {
    'exercise': '练习题',
    'coding': '编程题',
    'project': '项目'
  }
  return typeMap[type] || '未知'
}

const getTypeTagType = (type) => {
  const typeMap = {
    'exercise': '',
    'coding': 'success',
    'project': 'warning'
  }
  return typeMap[type] || ''
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || '未知'
}

const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return difficultyMap[difficulty] || ''
}

const getQuestionTypeText = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '问答题',
    'coding': '编程题'
  }
  return typeMap[type] || '未知'
}

const isCorrectOption = (question, option) => {
  if (question.type === 'single') {
    return question.correctAnswer === option.value
  } else if (question.type === 'multiple') {
    return question.correctAnswers && question.correctAnswers.includes(option.value)
  }
  return false
}

const getStatusText = (status) => {
  const statusMap = {
    'submitted': '已提交',
    'graded': '已批改',
    'late': '迟交'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const statusMap = {
    'submitted': 'warning',
    'graded': 'success',
    'late': 'danger'
  }
  return statusMap[status] || ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/homework/detail/index.vue`);
  getHomeworkDetail()
})
</script>

<style lang="scss" scoped>
.back-button {
  margin-bottom: 20px;
}

.view-mode-selector {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.main-content {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 600px;
}

.left-sidebar {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.right-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.student-list,
.question-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 12px;
}

.student-item,
.question-item-sidebar {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  &.active {
    background: #ecf5ff;
    border-color: #409eff;
  }
}

.student-header,
.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.student-name,
.question-number {
  font-weight: 600;
  color: #303133;
}

.student-completion,
.question-stats {
  font-size: 12px;
  color: #606266;
}

.student-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.completion-text {
  font-size: 12px;
  color: #606266;
}

.student-info-card,
.question-info-card {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 12px;
      color: #909399;
    }

    .value {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.question-answers-list,
.student-answers-list {
  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #303133;
  }
}

.question-items,
.student-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-item,
.student-item-detail {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;

  .question-header,
  .student-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .question-number {
    font-weight: 600;
    color: #303133;
  }

  .question-type {
    font-size: 12px;
    background: #409eff;
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .answer-status {
    margin-left: auto;
    font-weight: 600;

    &.status-correct {
      color: #67c23a;
    }

    &.status-incorrect {
      color: #f56c6c;
    }
  }

  .student-answer,
  .student-answer {
    font-size: 13px;
    color: #606266;

    .answer-label {
      font-weight: 600;
      margin-right: 8px;
    }

    .answer-value {
      background: #f5f7fa;
      padding: 4px 8px;
      border-radius: 4px;
    }
  }
}

.submission-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.homework-info {
  flex: 1;
}

.homework-title h1 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 24px;
}

.homework-meta {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.homework-desc {
  color: #606266;
  line-height: 1.6;
}

.homework-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metadata-section,
.schedule-section,
.settings-section,
.stats-section {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.metadata-section h3,
.schedule-section h3,
.settings-section h3,
.stats-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.homework-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.questions-content,
.submissions-content {
  padding: 20px;
}

.question-list {
  margin-top: 20px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.question-index {
  font-weight: bold;
  color: #409eff;
}

.question-type {
  background: #409eff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.question-score {
  font-weight: bold;
  color: #f56c6c;
}

.question-difficulty {
  font-size: 14px;
}

.question-content {
  margin-bottom: 15px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 15px;
  line-height: 1.6;
}

.question-options {
  margin-left: 20px;
}

.option-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.option-value {
  font-weight: bold;
  margin-right: 10px;
}

.correct-mark {
  margin-left: 10px;
  color: #67c23a;
  font-weight: bold;
}

.question-fill {
  margin-left: 20px;
}

.fill-hint {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.fill-answers {
  margin-top: 10px;
}

.fill-answer {
  margin-bottom: 5px;
}

.fill-index {
  font-weight: bold;
  margin-right: 10px;
}

.question-essay {
  margin-left: 20px;
}

.essay-hint {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.essay-answer {
  margin-top: 10px;
}

.answer-label,
.starter-label,
.testcases-label,
.explanation-label,
.knowledge-label {
  font-weight: bold;
  margin-right: 10px;
}

.answer-content {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
}

.question-coding {
  margin-left: 20px;
}

.coding-hint {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.coding-starter {
  margin-top: 10px;
}

.coding-testcases {
  margin-top: 15px;
}

.testcase-item {
  margin-bottom: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.testcase-input,
.testcase-output {
  margin-bottom: 5px;
}

.testcase-label {
  font-weight: bold;
  margin-right: 10px;
}

.testcase-value {
  background: #f5f5f5;
  padding: 5px;
  border-radius: 4px;
  font-family: monospace;
}

.question-explanation {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e4e7ed;
}

.explanation-content {
  background: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
}

.question-knowledge {
  margin-top: 15px;
}

.knowledge-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.submission-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
</style>
