<template>
  <div class="homework-statistics-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">作业分析 > {{ homework?.title }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 总体统计卡片 -->
      <el-row :gutter="20" class="stats-cards">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">总人数</div>
              <div class="stat-value">{{ statistics.totalStudents }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">已提交</div>
              <div class="stat-value">{{ statistics.submittedCount }}</div>
              <div class="stat-rate">{{ statistics.submitRate }}%</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">平均分</div>
              <div class="stat-value">{{ statistics.averageScore }}</div>
              <div class="stat-rate">满分: {{ homework?.totalScore }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
              <el-icon><Medal /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">及格率</div>
              <div class="stat-value">{{ statistics.passRate }}%</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-section">
        <!-- 分数分布图 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>分数分布</span>
                <el-tag type="info" size="small">柱状图</el-tag>
              </div>
            </template>
            <div class="chart-container" ref="scoreDistributionChart"></div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color" style="background: #67c23a"></span>
                <span>优秀 (90-100): {{ scoreDistribution.excellent }}人</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #409eff"></span>
                <span>良好 (80-89): {{ scoreDistribution.good }}人</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #e6a23c"></span>
                <span>中等 (70-79): {{ scoreDistribution.medium }}人</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #f56c6c"></span>
                <span>及格 (60-69): {{ scoreDistribution.pass }}人</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #909399"></span>
                <span>不及格 (<60): {{ scoreDistribution.fail }}人</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 提交时间分布 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>提交时间分布</span>
                <el-tag type="info" size="small">折线图</el-tag>
              </div>
            </template>
            <div class="chart-container" ref="submitTimeChart"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 题目分析 -->
      <el-card class="question-analysis-card">
        <template #header>
          <div class="card-header">
            <span>题目分析</span>
            <el-radio-group v-model="questionSortType" size="small">
              <el-radio-button label="order">按顺序</el-radio-button>
              <el-radio-button label="difficulty">按难度</el-radio-button>
              <el-radio-button label="correctRate">按正确率</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <el-table :data="sortedQuestionStats" stripe>
          <el-table-column prop="questionNumber" label="题号" width="80" align="center" />
          <el-table-column label="题型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionText" label="题目内容" min-width="250" show-overflow-tooltip />
          <el-table-column prop="score" label="分值" width="80" align="center">
            <template #default="{ row }">
              {{ row.score }}分
            </template>
          </el-table-column>
          <el-table-column label="正确率" width="150" align="center">
            <template #default="{ row }">
              <el-progress
                :percentage="row.correctRate"
                :color="getCorrectRateColor(row.correctRate)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="averageScore" label="平均分" width="100" align="center">
            <template #default="{ row }">
              {{ row.averageScore.toFixed(1) }}/{{ row.score }}
            </template>
          </el-table-column>
          <el-table-column label="难度系数" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficultyIndex)">
                {{ getDifficultyLabel(row.difficultyIndex) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="区分度" width="100" align="center">
            <template #default="{ row }">
              {{ row.discrimination.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" size="small" @click="handleViewQuestionDetail(row)">
                  详细分析
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 学生成绩排名 -->
      <el-card class="student-ranking-card">
        <template #header>
          <div class="card-header">
            <span>学生成绩排名</span>
            <el-input
              v-model="studentSearchText"
              placeholder="搜索学生..."
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>

        <el-table :data="filteredStudentRanking" stripe max-height="400">
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ $index }">
              <el-tag v-if="$index === 0" type="danger" effect="dark">🥇</el-tag>
              <el-tag v-else-if="$index === 1" type="warning" effect="dark">🥈</el-tag>
              <el-tag v-else-if="$index === 2" type="success" effect="dark">🥉</el-tag>
              <span v-else>{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column prop="studentId" label="学号" width="150" />
          <el-table-column label="得分" width="120" align="center">
            <template #default="{ row }">
              <span class="score-text">{{ row.score }}/{{ homework?.totalScore }}</span>
            </template>
          </el-table-column>
          <el-table-column label="得分率" width="150" align="center">
            <template #default="{ row }">
              <el-progress
                :percentage="getScorePercentage(row)"
                :color="getProgressColor(getScorePercentage(row))"
              />
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.submitTime) }}
            </template>
          </el-table-column>
          <el-table-column label="用时" width="100" align="center">
            <template #default="{ row }">
              {{ row.timeSpent }}分钟
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" size="small" @click="handleViewStudentDetail(row)">
                  查看详情
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 错题分析 -->
      <el-card class="error-analysis-card">
        <template #header>
          <div class="card-header">
            <span>高频错题</span>
            <el-tag type="danger">需重点讲解</el-tag>
          </div>
        </template>

        <div class="error-questions-list">
          <div
            v-for="(question, index) in highErrorQuestions"
            :key="question.id"
            class="error-question-item"
          >
            <div class="error-rank">{{ index + 1 }}</div>
            <div class="error-content">
              <div class="error-header">
                <span class="question-number">第{{ question.questionNumber }}题</span>
                <el-tag :type="getTypeTagType(question.type)" size="small">
                  {{ getTypeLabel(question.type) }}
                </el-tag>
                <span class="error-rate">错误率: {{ question.errorRate }}%</span>
              </div>
              <div class="question-text">{{ question.questionText }}</div>
              <div class="error-stats">
                <span>错误人数: {{ question.errorCount }}人</span>
                <span>常见错误: {{ question.commonErrors.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 题目详细分析对话框 -->
    <QuestionDetailDialog
      v-model="questionDetailVisible"
      :question="selectedQuestion"
      :submissions="submissions"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Download,
  Refresh,
  User,
  DocumentChecked,
  TrendCharts,
  Medal,
  Search
} from '@element-plus/icons-vue'
import QuestionDetailDialog from './components/QuestionDetailDialog.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const homework = ref(null)
const submissions = ref([])
const questionSortType = ref('order')
const studentSearchText = ref('')
const questionDetailVisible = ref(false)
const selectedQuestion = ref(null)

// 统计数据
const statistics = ref({
  totalStudents: 30,
  submittedCount: 25,
  submitRate: 83,
  averageScore: 38.5,
  passRate: 80
})

const scoreDistribution = ref({
  excellent: 5,
  good: 8,
  medium: 7,
  pass: 3,
  fail: 2
})

const questionStats = ref([])
const studentRanking = ref([])

// 计算属性
const sortedQuestionStats = computed(() => {
  let result = [...questionStats.value]
  
  if (questionSortType.value === 'difficulty') {
    result.sort((a, b) => a.difficultyIndex - b.difficultyIndex)
  } else if (questionSortType.value === 'correctRate') {
    result.sort((a, b) => a.correctRate - b.correctRate)
  }
  
  return result
})

const filteredStudentRanking = computed(() => {
  if (!studentSearchText.value) return studentRanking.value
  
  return studentRanking.value.filter(s =>
    s.studentName.includes(studentSearchText.value) ||
    s.studentId.includes(studentSearchText.value)
  )
})

const highErrorQuestions = computed(() => {
  return questionStats.value
    .filter(q => q.errorRate > 30)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5)
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
        type: 'single',
        questionText: '软件工程的核心目标是什么?',
        score: 2
      },
      {
        id: 'hwq_002',
        type: 'multiple',
        questionText: '以下哪些是软件开发模型?',
        score: 3
      },
      {
        id: 'hwq_003',
        type: 'fill',
        questionText: '中国的首都是_____',
        score: 2
      },
      {
        id: 'hwq_004',
        type: 'essay',
        questionText: '请简述软件工程的三要素',
        score: 5
      }
    ]
  }

  questionStats.value = [
    {
      id: 'hwq_001',
      questionNumber: 1,
      type: 'single',
      questionText: '软件工程的核心目标是什么?',
      score: 2,
      correctRate: 85,
      averageScore: 1.7,
      difficultyIndex: 0.85,
      discrimination: 0.45,
      errorRate: 15,
      errorCount: 4,
      commonErrors: ['选择A', '选择B']
    },
    {
      id: 'hwq_002',
      questionNumber: 2,
      type: 'multiple',
      questionText: '以下哪些是软件开发模型?',
      score: 3,
      correctRate: 60,
      averageScore: 1.8,
      difficultyIndex: 0.60,
      discrimination: 0.52,
      errorRate: 40,
      errorCount: 10,
      commonErrors: ['漏选C', '多选D']
    },
    {
      id: 'hwq_003',
      questionNumber: 3,
      type: 'fill',
      questionText: '中国的首都是_____',
      score: 2,
      correctRate: 95,
      averageScore: 1.9,
      difficultyIndex: 0.95,
      discrimination: 0.25,
      errorRate: 5,
      errorCount: 1,
      commonErrors: ['拼写错误']
    },
    {
      id: 'hwq_004',
      questionNumber: 4,
      type: 'essay',
      questionText: '请简述软件工程的三要素',
      score: 5,
      correctRate: 70,
      averageScore: 3.5,
      difficultyIndex: 0.70,
      discrimination: 0.68,
      errorRate: 30,
      errorCount: 8,
      commonErrors: ['表述不完整', '概念混淆']
    }
  ]

  studentRanking.value = [
    {
      studentId: 'stu_001',
      studentName: '张三',
      score: 48,
      submitTime: '2024-12-20T15:30:00Z',
      timeSpent: 45,
      status: 'graded'
    },
    {
      studentId: 'stu_002',
      studentName: '李四',
      score: 45,
      submitTime: '2024-12-20T16:00:00Z',
      timeSpent: 50,
      status: 'graded'
    },
    {
      studentId: 'stu_003',
      studentName: '王五',
      score: 42,
      submitTime: '2024-12-20T14:30:00Z',
      timeSpent: 40,
      status: 'graded'
    }
  ]
}

// 方法
const handleBack = () => {
  router.back()
}

const handleExport = () => {
  ElMessage.success('报告导出功能开发中...')
}

const handleRefresh = () => {
  ElMessage.success('数据已刷新')
  initMockData()
}

const handleViewQuestionDetail = (question) => {
  selectedQuestion.value = question
  questionDetailVisible.value = true
}

const handleViewStudentDetail = (student) => {
  router.push(`/homework/review?id=${homework.value.id}&student=${student.studentId}`)
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

const getCorrectRateColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getDifficultyLabel = (index) => {
  if (index >= 0.8) return '简单'
  if (index >= 0.5) return '中等'
  return '困难'
}

const getDifficultyTagType = (index) => {
  if (index >= 0.8) return 'success'
  if (index >= 0.5) return 'warning'
  return 'danger'
}

const getScorePercentage = (student) => {
  if (!homework.value?.totalScore) return 0
  return Math.round((student.score / homework.value.totalScore) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getStatusLabel = (status) => {
  const map = {
    graded: '已批改',
    pending: '待批改',
    not_submitted: '未提交'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    graded: 'success',
    pending: 'warning',
    not_submitted: 'info'
  }
  return map[status] || ''
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
.homework-statistics-container {
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

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 统计卡片 */
.stats-cards {
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: var(--shadow-base);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .stat-rate {
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-top: 4px;
      }
    }
  }
}

/* 图表区域 */
.charts-section {
  margin-bottom: 20px;

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-lighter);

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
      }
    }
  }
}

/* 题目分析卡片 */
.question-analysis-card,
.student-ranking-card,
.error-analysis-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.score-text {
  font-weight: 600;
  color: var(--color-primary);
}

/* 错题分析 */
.error-questions-list {
  .error-question-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    margin-bottom: 12px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    border-left: 4px solid #f56c6c;

    .error-rank {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f56c6c 0%, #ff9a9e 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 18px;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;

      .error-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .question-number {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .error-rate {
          margin-left: auto;
          color: #f56c6c;
          font-weight: 600;
        }
      }

      .question-text {
        font-size: 14px;
        color: var(--color-text-regular);
        margin-bottom: 8px;
        line-height: 1.6;
      }

      .error-stats {
        display: flex;
        gap: 20px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }
  }
}
</style>
