<template>
  <div class="assignment-exam-entry">
    <el-card shadow="never">
      <div class="records-header">
        <h3>作业与考试记录</h3>
        <div class="header-actions">
          <el-select v-model="typeFilter" placeholder="筛选类型" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="作业" value="homework" />
            <el-option label="考试" value="exam" />
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
      </div>

      <!-- 统计概览 -->
      <el-row :gutter="20" class="stats-overview">
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon homework">
                <el-icon><Document /></el-icon>
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ assignmentStats.completed }}/{{ assignmentStats.total }}</div>
                <div class="overview-label">作业完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon exam">
                <el-icon><Notebook /></el-icon>
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ examStats.completed }}/{{ examStats.total }}</div>
                <div class="overview-label">考试完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="overview-card">
            <div class="overview-item">
              <div class="overview-icon time">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="overview-info">
                <div class="overview-value">{{ totalLearningTime }}h</div>
                <div class="overview-label">总学习时长</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 记录列表 -->
      <el-table :data="filteredRecords" style="margin-top: 20px" v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'homework' ? 'primary' : 'warning'" size="small">
              {{ row.type === 'homework' ? '作业' : '考试' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="完成度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getCompletionPercentage(row)"
              :color="getProgressColor(getCompletionPercentage(row))"
            />
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column label="学习时长" width="120" align="center">
          <template #default="{ row }">
            {{ formatLearningTime(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'graded'"
              link
              type="success"
              size="small"
              @click="handleViewReport(row)"
            >
              查看报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredRecords.length === 0"
        description="暂无作业考试记录"
        style="margin-top: 40px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Notebook, Clock } from '@element-plus/icons-vue'

const router = useRouter()

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const loading = ref(false)
const typeFilter = ref('')
const dateRange = ref([])

// 模拟数据
const records = ref([
  {
    id: 'hw_001',
    title: 'JavaScript基础练习',
    type: 'homework',
    courseName: 'JavaScript基础',
    status: 'graded',
    completionRate: 90,
    duration: 2700, // 秒
    timestamp: '2024-12-20T10:30:00Z'
  },
  {
    id: 'exam_001',
    title: 'JavaScript期中测试',
    type: 'exam',
    courseName: 'JavaScript基础',
    status: 'graded',
    completionRate: 100,
    duration: 3600,
    timestamp: '2024-12-18T09:00:00Z'
  },
  {
    id: 'hw_002',
    title: 'Vue组件开发练习',
    type: 'homework',
    courseName: 'Vue.js框架',
    status: 'submitted',
    completionRate: 80,
    duration: 1800,
    timestamp: '2024-12-16T15:20:00Z'
  },
  {
    id: 'exam_002',
    title: '数据结构测验',
    type: 'exam',
    courseName: '数据结构与算法',
    status: 'pending',
    completionRate: 0,
    duration: 0,
    timestamp: null
  }
])

// 计算属性
const filteredRecords = computed(() => {
  let result = [...records.value]

  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(r => r.type === typeFilter.value)
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(r => {
      if (!r.timestamp) return false
      const date = new Date(r.timestamp)
      return date >= start && date <= end
    })
  }

  return result.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
    return timeB - timeA
  })
})

const assignmentStats = computed(() => {
  const homeworks = records.value.filter(r => r.type === 'homework')
  return {
    total: homeworks.length,
    completed: homeworks.filter(h => h.status !== 'pending').length
  }
})

const examStats = computed(() => {
  const exams = records.value.filter(r => r.type === 'exam')
  return {
    total: exams.length,
    completed: exams.filter(e => e.status !== 'pending').length
  }
})

const totalLearningTime = computed(() => {
  const totalMinutes = records.value.reduce((sum, r) => sum + (r.duration || 0), 0)
  const hours = Math.floor(totalMinutes / 3600)
  return hours
})

// 方法
const getStatusType = (status) => {
  const map = {
    pending: 'info',
    submitted: 'warning',
    graded: 'success'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待完成',
    submitted: '待评分',
    graded: '已评分'
  }
  return map[status] || status
}

const getCompletionPercentage = (record) => {
  if (record.status === 'pending') return 0
  return record.completionRate || 0
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '未提交'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatLearningTime = (seconds) => {
  if (!seconds || seconds === 0) return '-'
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h${remainingMinutes}m`
  }
  return `${minutes}m`
}

const handleViewDetail = (record) => {
  // 跳转到作业/考试批改页，默认进入"按学生"视图
  if (record.type === 'homework') {
    router.push({
      path: `/assignments/${record.id}/grade`,
      query: {
        view: 'by-student',
        studentId: props.userId
      }
    })
  } else {
    router.push({
      path: `/exams/${record.id}/grade`,
      query: {
        view: 'by-student',
        studentId: props.userId
      }
    })
  }
}

const handleViewReport = (record) => {
  // 查看学生的作业/考试报告
  if (record.type === 'homework') {
    router.push({
      path: `/assignments/${record.id}/report`,
      query: { studentId: props.userId }
    })
  } else {
    router.push({
      path: `/exams/${record.id}/report`,
      query: { studentId: props.userId }
    })
  }
}

onMounted(() => {
  console.log('加载作业考试记录:', props.userId)
})
</script>

<style lang="scss" scoped>
.assignment-exam-entry {
  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .stats-overview {
    margin-bottom: 20px;

    .overview-card {
      .overview-item {
        display: flex;
        align-items: center;

        .overview-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          .el-icon {
            font-size: 24px;
            color: white;
          }

          &.homework {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.exam {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.time {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
        }

        .overview-info {
          .overview-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 4px;
          }

          .overview-label {
            font-size: 14px;
            color: var(--color-text-secondary);
          }
        }
      }
    }
  }
}
</style>