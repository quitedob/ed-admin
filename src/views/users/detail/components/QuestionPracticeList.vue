<template>
  <div class="question-practice-list">
    <el-card shadow="never">
      <div class="records-header">
        <h3>题库记录</h3>
        <div class="header-actions">
          <el-button-group>
            <el-button
              :type="viewMode === 'overview' ? 'primary' : ''"
              @click="viewMode = 'overview'"
            >
              总览
            </el-button>
            <el-button
              :type="viewMode === 'subject' ? 'primary' : ''"
              @click="viewMode = 'subject'"
            >
              分科目
            </el-button>
            <el-button
              :type="viewMode === 'history' ? 'primary' : ''"
              @click="viewMode = 'history'"
            >
              提交历史
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 总览视图 -->
      <div v-if="viewMode === 'overview'" class="overview-view">
        <div class="stats-cards">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-value">{{ overviewStats.totalQuestions }}</div>
                  <div class="stat-label">总题数</div>
                </div>
                <el-icon class="stat-icon"><Document /></el-icon>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-value">{{ overviewStats.totalAttempts }}</div>
                  <div class="stat-label">答题次数</div>
                </div>
                <el-icon class="stat-icon"><EditPen /></el-icon>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-value">{{ overviewStats.averageAccuracy }}%</div>
                  <div class="stat-label">平均正确率</div>
                </div>
                <el-icon class="stat-icon"><TrendCharts /></el-icon>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 快速统计 -->
        <div class="quick-stats">
          <el-descriptions title="详细统计" :column="3" border>
            <el-descriptions-item label="科目数">{{ overviewStats.subjectCount }}</el-descriptions-item>
            <el-descriptions-item label="题型数">{{ overviewStats.questionTypeCount }}</el-descriptions-item>
            <el-descriptions-item label="练习天数">{{ overviewStats.practiceDays }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 分科目视图 -->
      <div v-if="viewMode === 'subject'" class="subject-view">
        <el-table :data="subjectStats" stripe>
          <el-table-column prop="subject" label="科目" width="150" />
          <el-table-column prop="questionCount" label="题目数" width="120" align="center">
            <template #default="{ row }">
              <el-text type="primary">{{ row.questionCount }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="attemptCount" label="答题次数" width="120" align="center" />
          <el-table-column label="正确率" width="150" align="center">
            <template #default="{ row }">
              <el-progress
                :percentage="row.accuracy"
                :color="getProgressColor(row.accuracy)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewSubjectDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

  
      <!-- 提交历史视图 -->
      <div v-if="viewMode === 'history'" class="history-view">
        <div class="filter-bar">
          <el-select v-model="historySubjectFilter" placeholder="按科目筛选" clearable style="width: 200px">
            <el-option
              v-for="subject in availableSubjects"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
          <el-select v-model="historyTypeFilter" placeholder="按题型筛选" clearable style="width: 200px; margin-left: 12px">
            <el-option
              v-for="type in availableQuestionTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-left: 12px"
          />
        </div>

        <el-table :data="filteredSubmissionHistory" stripe>
          <el-table-column prop="subject" label="科目" width="120" />
          <el-table-column prop="questionType" label="题型" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.questionType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionTitle" label="题目" min-width="200" show-overflow-tooltip />
          <el-table-column label="难度" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isCorrect ? 'success' : 'danger'" size="small">
                {{ row.isCorrect ? '正确' : '错误' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="timeSpent" label="用时" width="100" align="center">
            <template #default="{ row }">
              {{ formatSeconds(row.timeSpent) }}
            </template>
          </el-table-column>
          <el-table-column prop="attemptCount" label="尝试次数" width="100" align="center" />
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.submitTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewSubmissionDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalSubmissions"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && isEmpty"
        description="暂无题库记录"
        style="margin-top: 40px"
      >
        <el-button type="primary" @click="handleStartPractice">
          开始练习
        </el-button>
      </el-empty>
    </el-card>

    <!-- 详情对话框 -->
    <SubmissionDetailDialog
      v-model="detailDialogVisible"
      :submission-data="currentSubmission"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  EditPen,
  TrendCharts,
  Clock
} from '@element-plus/icons-vue'
import SubmissionDetailDialog from './SubmissionDetailDialog.vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// 响应式数据
const loading = ref(false)
const viewMode = ref('overview') // overview, subject, history
const historySubjectFilter = ref('')
const historyTypeFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const currentSubmission = ref(null)

// 模拟数据 - 提交历史
const submissionHistory = ref([
  { id: 'sub_001', subject: '数学', questionType: '选择题', questionTitle: '求函数f(x)=x²+2x+1的最小值', difficulty: 'easy', isCorrect: true, timeSpent: 120, attemptCount: 1, submitTime: '2024-12-22T10:30:00Z' },
  { id: 'sub_002', subject: '数学', questionType: '填空题', questionTitle: '已知sin(α)=0.5，求cos(α)的值', difficulty: 'medium', isCorrect: true, timeSpent: 180, attemptCount: 2, submitTime: '2024-12-22T10:35:00Z' },
  { id: 'sub_003', subject: '数学', questionType: '解答题', questionTitle: '证明勾股定理', difficulty: 'hard', isCorrect: false, timeSpent: 600, attemptCount: 1, submitTime: '2024-12-22T10:45:00Z' },
  { id: 'sub_004', subject: '语文', questionType: '选择题', questionTitle: '下列词语中加点字的读音完全正确的一项是', difficulty: 'easy', isCorrect: true, timeSpent: 90, attemptCount: 1, submitTime: '2024-12-21T14:20:00Z' },
  { id: 'sub_005', subject: '语文', questionType: '阅读理解', questionTitle: '阅读《背影》选段，回答问题', difficulty: 'medium', isCorrect: true, timeSpent: 300, attemptCount: 1, submitTime: '2024-12-21T14:30:00Z' },
  { id: 'sub_006', subject: '英语', questionType: '选择题', questionTitle: 'Choose the correct answer: He ___ to school every day.', difficulty: 'easy', isCorrect: true, timeSpent: 60, attemptCount: 1, submitTime: '2024-12-20T16:00:00Z' },
  { id: 'sub_007', subject: '英语', questionType: '完形填空', questionTitle: 'Complete the passage with proper words', difficulty: 'medium', isCorrect: false, timeSpent: 420, attemptCount: 2, submitTime: '2024-12-20T16:15:00Z' },
  { id: 'sub_008', subject: '编程', questionType: '编程题', questionTitle: '实现一个二分查找算法', difficulty: 'hard', isCorrect: true, timeSpent: 900, attemptCount: 3, submitTime: '2024-12-19T11:00:00Z' },
  { id: 'sub_009', subject: '编程', questionType: '选择题', questionTitle: '以下哪个不是Python的数据类型？', difficulty: 'easy', isCorrect: true, timeSpent: 45, attemptCount: 1, submitTime: '2024-12-19T10:30:00Z' },
  { id: 'sub_010', subject: '数学', questionType: '选择题', questionTitle: '求极限lim(x→0) sin(x)/x', difficulty: 'medium', isCorrect: true, timeSpent: 150, attemptCount: 1, submitTime: '2024-12-18T15:00:00Z' }
])

// 可用科目和题型
const availableSubjects = computed(() => {
  return [...new Set(submissionHistory.value.map(s => s.subject))]
})

const availableQuestionTypes = computed(() => {
  return [...new Set(submissionHistory.value.map(s => s.questionType))]
})

// 计算属性 - 总览统计
const overviewStats = computed(() => {
  const totalQuestions = submissionHistory.value.length
  const totalAttempts = submissionHistory.value.reduce((sum, s) => sum + s.attemptCount, 0)
  const correctCount = submissionHistory.value.filter(s => s.isCorrect).length
  const averageAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const subjectCount = availableSubjects.value.length
  const questionTypeCount = availableQuestionTypes.value.length

  const dates = submissionHistory.value.map(s => new Date(s.submitTime).toDateString())
  const practiceDays = new Set(dates).size

  return {
    totalQuestions,
    totalAttempts,
    averageAccuracy,
    subjectCount,
    questionTypeCount,
    practiceDays
  }
})

// 分科目统计
const subjectStats = computed(() => {
  const stats = {}
  
  submissionHistory.value.forEach(submission => {
    if (!stats[submission.subject]) {
      stats[submission.subject] = {
        subject: submission.subject,
        questionCount: 0,
        attemptCount: 0,
        correctCount: 0,
        totalTime: 0,
        lastPractice: null
      }
    }
    
    const stat = stats[submission.subject]
    stat.questionCount++
    stat.attemptCount += submission.attemptCount
    if (submission.isCorrect) stat.correctCount++
    stat.totalTime += submission.timeSpent
    
    const submitDate = new Date(submission.submitTime)
    if (!stat.lastPractice || submitDate > new Date(stat.lastPractice)) {
      stat.lastPractice = submission.submitTime
    }
  })
  
  return Object.values(stats).map(stat => ({
    ...stat,
    accuracy: stat.questionCount > 0 ? Math.round((stat.correctCount / stat.questionCount) * 100) : 0,
    avgTime: stat.questionCount > 0 ? Math.round(stat.totalTime / stat.questionCount) : 0
  }))
})


// 过滤后的提交历史
const filteredSubmissionHistory = computed(() => {
  let history = [...submissionHistory.value]
  
  if (historySubjectFilter.value) {
    history = history.filter(s => s.subject === historySubjectFilter.value)
  }
  
  if (historyTypeFilter.value) {
    history = history.filter(s => s.questionType === historyTypeFilter.value)
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    history = history.filter(s => {
      const date = new Date(s.submitTime)
      return date >= start && date <= end
    })
  }
  
  return history
})

const totalSubmissions = computed(() => filteredSubmissionHistory.value.length)

const isEmpty = computed(() => {
  return submissionHistory.value.length === 0
})

// 方法
const formatTime = (seconds) => {
  if (!seconds) return '0小时'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

const formatSeconds = (seconds) => {
  if (!seconds) return '0秒'
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}小时${remainingMinutes}分钟`
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 80) return '#e6a23c'
  if (percentage >= 60) return '#f56c6c'
  return '#909399'
}

const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const handleViewSubjectDetail = (subject) => {
  ElMessage.info(`查看科目详情: ${subject.subject}`)
  selectedSubject.value = subject.subject
  viewMode.value = 'type'
}

const handleViewTypesBySubject = (subject) => {
  selectedSubject.value = subject.subject
  viewMode.value = 'type'
}


const handleViewSubmissionDetail = (submission) => {
  currentSubmission.value = submission
  detailDialogVisible.value = true
}

const handleStartPractice = () => {
  ElMessage.info('跳转到题库练习页面')
}

// 监听器
watch(() => props.userId, () => {
  loadQuestionBankRecords()
})

// 生命周期
onMounted(() => {
  loadQuestionBankRecords()
})

const loadQuestionBankRecords = async () => {
  loading.value = true
  try {
    // 这里可以调用API获取题库记录
    console.log('加载学生题库记录:', props.userId)
  } catch (error) {
    ElMessage.error('加载题库记录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.question-practice-list {
  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
      color: var(--color-text-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .overview-view {
    .stats-cards {
      margin-bottom: 20px;

      .stat-card {
        position: relative;
        overflow: hidden;
        cursor: pointer;

        &:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }

        .stat-content {
          position: relative;
          z-index: 2;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--color-text-secondary);
          }
        }

        .stat-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 40px;
          color: rgba(64, 158, 255, 0.1);
        }
      }
    }

    .quick-stats {
      margin-top: 20px;
    }
  }

  .subject-view,
  .history-view {
    .filter-bar {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }

    .difficulty-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>