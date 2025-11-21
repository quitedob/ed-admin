<template>
  <div class="question-practice-list">
    <el-card shadow="never">
      <div class="records-header">
        <h3>题库练习记录</h3>
        <div class="header-actions">
          <el-select v-model="courseFilter" placeholder="按课程筛选" clearable style="width: 200px">
            <el-option
              v-for="course in availableCourses"
              :key="course.id"
              :label="course.name"
              :value="course.id"
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
          <el-button type="primary" @click="handleViewAllPractice" style="margin-left: 12px">
            查看全部练习
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalSessions }}</div>
                <div class="stat-label">练习次数</div>
              </div>
              <el-icon class="stat-icon"><Document /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.totalQuestions }}</div>
                <div class="stat-label">总题数</div>
              </div>
              <el-icon class="stat-icon"><QuestionFilled /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ statistics.averageAccuracy }}%</div>
                <div class="stat-label">平均正确率</div>
              </div>
              <el-icon class="stat-icon"><TrendCharts /></el-icon>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ formatTime(statistics.totalTime) }}</div>
                <div class="stat-label">总练习时长</div>
              </div>
              <el-icon class="stat-icon"><Clock /></el-icon>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 练习记录列表 -->
      <el-table
        :data="filteredPracticeRecords"
        style="margin-top: 20px"
        v-loading="loading"
      >
        <el-table-column prop="questionBankName" label="题库名称" min-width="200" />
        <el-table-column prop="courseName" label="所属课程" width="150" />
        <el-table-column prop="questionCount" label="题目数量" width="120" align="center">
          <template #default="{ row }">
            <el-text type="primary">{{ row.questionCount }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="正确率" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getAccuracyType(row.correctRate)"
              size="small"
            >
              {{ row.correctRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用时" width="120" align="center">
          <template #default="{ row }">
            {{ formatPracticeTime(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="练习状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="练习时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleViewReport(row)"
            >
              练习报告
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
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredPracticeRecords.length === 0"
        description="暂无练习记录"
        style="margin-top: 40px"
      >
        <template #image>
          <el-icon size="80" color="#ddd"><DocumentRemove /></el-icon>
        </template>
        <el-button type="primary" @click="handleStartPractice">
          开始练习
        </el-button>
      </el-empty>
    </el-card>

    <!-- 练习详情对话框 -->
    <PracticeDetailDialog
      v-model="detailDialogVisible"
      :practice-record="currentRecord"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  QuestionFilled,
  TrendCharts,
  Clock,
  DocumentRemove
} from '@element-plus/icons-vue'
import PracticeDetailDialog from './PracticeDetailDialog.vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// 响应式数据
const loading = ref(false)
const courseFilter = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const currentRecord = ref(null)

// 模拟数据
const practiceRecords = ref([
  {
    id: 'practice_rec_001',
    questionBankId: 'qb_001',
    questionBankName: 'JavaScript基础题库',
    courseName: 'JavaScript基础',
    courseId: 'course_001',
    questionCount: 20,
    correctCount: 18,
    correctRate: 90,
    duration: 1200, // 秒
    status: 'completed',
    timestamp: '2024-12-20T16:30:00Z',
    score: 90,
    difficulty: 'medium'
  },
  {
    id: 'practice_rec_002',
    questionBankId: 'qb_002',
    questionBankName: 'Vue.js组件题库',
    courseName: 'Vue.js框架',
    courseId: 'course_002',
    questionCount: 15,
    correctCount: 12,
    correctRate: 80,
    duration: 900,
    status: 'completed',
    timestamp: '2024-12-18T10:15:00Z',
    score: 80,
    difficulty: 'hard'
  },
  {
    id: 'practice_rec_003',
    questionBankId: 'qb_001',
    questionBankName: 'JavaScript基础题库',
    courseName: 'JavaScript基础',
    courseId: 'course_001',
    questionCount: 25,
    correctCount: 22,
    correctRate: 88,
    duration: 1500,
    status: 'completed',
    timestamp: '2024-12-15T14:45:00Z',
    score: 88,
    difficulty: 'easy'
  },
  {
    id: 'practice_rec_004',
    questionBankId: 'qb_003',
    questionBankName: 'React Hook题库',
    courseName: 'React基础',
    courseId: 'course_003',
    questionCount: 18,
    correctCount: 15,
    correctRate: 83,
    duration: 1100,
    status: 'in_progress',
    timestamp: '2024-12-22T09:20:00Z',
    score: null,
    difficulty: 'hard'
  }
])

const availableCourses = ref([
  { id: 'course_001', name: 'JavaScript基础' },
  { id: 'course_002', name: 'Vue.js框架' },
  { id: 'course_003', name: 'React基础' }
])

// 计算属性
const filteredPracticeRecords = computed(() => {
  let records = [...practiceRecords.value]

  // 课程筛选
  if (courseFilter.value) {
    records = records.filter(r => r.courseId === courseFilter.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    records = records.filter(r => {
      const date = new Date(r.timestamp)
      return date >= start && date <= end
    })
  }

  return records
})

const totalRecords = computed(() => filteredPracticeRecords.value.length)

const statistics = computed(() => {
  const completedRecords = practiceRecords.value.filter(r => r.status === 'completed')

  return {
    totalSessions: practiceRecords.value.length,
    totalQuestions: completedRecords.reduce((sum, r) => sum + r.questionCount, 0),
    averageAccuracy: completedRecords.length > 0
      ? Math.round(completedRecords.reduce((sum, r) => sum + r.correctRate, 0) / completedRecords.length)
      : 0,
    totalTime: completedRecords.reduce((sum, r) => sum + r.duration, 0)
  }
})

// 方法
const formatPracticeTime = (seconds) => {
  if (!seconds) return '0分钟'
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes}分钟`
  }
  return `${minutes}分钟`
}

const formatTime = (seconds) => {
  if (!seconds) return '0小时'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}小时${minutes}分钟`
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getAccuracyType = (rate) => {
  if (rate >= 90) return 'success'
  if (rate >= 80) return 'warning'
  return 'danger'
}

const getStatusType = (status) => {
  const map = {
    completed: 'success',
    in_progress: 'warning',
    abandoned: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    completed: '已完成',
    in_progress: '进行中',
    abandoned: '已放弃'
  }
  return map[status] || status
}

const handleViewDetail = (record) => {
  currentRecord.value = record
  detailDialogVisible.value = true
}

const handleViewReport = (record) => {
  ElMessage.info(`查看练习报告: ${record.questionBankName}`)
}

const handleViewAllPractice = () => {
  ElMessage.info('查看全部练习记录')
}

const handleStartPractice = () => {
  ElMessage.info('跳转到题库练习页面')
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 监听器
watch(() => props.userId, () => {
  loadPracticeRecords()
})

// 生命周期
onMounted(() => {
  loadPracticeRecords()
})

const loadPracticeRecords = async () => {
  loading.value = true
  try {
    // 这里可以调用API获取练习记录
    // await fetchPracticeRecords(props.userId)
    console.log('加载学生练习记录:', props.userId)
  } catch (error) {
    ElMessage.error('加载练习记录失败')
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

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      position: relative;
      overflow: hidden;

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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>