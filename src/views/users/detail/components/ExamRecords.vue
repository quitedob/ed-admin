<template>
  <div class="exam-records">
    <el-card shadow="never">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="filterType" placeholder="类型" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="期中考试" value="midterm" />
          <el-option label="期末考试" value="final" />
          <el-option label="随堂测验" value="quiz" />
          <el-option label="模拟考试" value="mock" />
        </el-select>

        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px; margin-left: 12px">
          <el-option label="全部" value="" />
          <el-option label="已完成" value="completed" />
          <el-option label="未参加" value="notStarted" />
          <el-option label="已批改" value="graded" />
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

      <!-- 考试列表 -->
      <el-table :data="filteredRecords" style="margin-top: 20px" v-loading="loading">
        <el-table-column prop="title" label="考试名称" min-width="200" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column label="考试时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="得分" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.score !== null" class="score-display">
              {{ row.score }}/{{ row.maxScore }}
            </span>
            <span v-else style="color: #909399">未参加</span>
          </template>
        </el-table-column>
        <el-table-column label="成绩率" width="150" align="center">
          <template #default="{ row }">
            <el-progress
              v-if="row.score !== null"
              :percentage="getScorePercentage(row)"
              :color="getProgressColor(getScorePercentage(row))"
            />
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              size="small" 
              @click="handleViewDetail(row)"
              :disabled="row.status === 'notStarted'"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredRecords.length === 0" description="暂无考试记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const router = useRouter()
const loading = ref(false)
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref([])

// 模拟数据
const records = ref([
  {
    id: 'exam_001',
    title: 'JavaScript期中测试',
    type: 'midterm',
    courseId: 'course_001',
    courseName: 'JavaScript基础',
    classId: 'class_001',
    className: '前端开发一班',
    startTime: '2024-12-18T09:00:00Z',
    duration: 120,
    score: 85,
    maxScore: 100,
    status: 'graded'
  },
  {
    id: 'exam_002',
    title: 'Vue.js期末考试',
    type: 'final',
    courseId: 'course_002',
    courseName: 'Vue.js框架',
    classId: 'class_001',
    className: '前端开发一班',
    startTime: '2024-12-20T14:00:00Z',
    duration: 150,
    score: 92,
    maxScore: 100,
    status: 'graded'
  }
])

const filteredRecords = computed(() => {
  let result = [...records.value]

  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(r => {
      const date = new Date(r.startTime)
      return date >= start && date <= end
    })
  }

  return result
})

const handleViewDetail = (record) => {
  router.push({
    path: `/exams/${record.id}/grade`,
    query: {
      view: 'by-student',
      studentId: props.userId
    }
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getScorePercentage = (record) => {
  if (!record.maxScore || record.score === null) return 0
  return Math.round((record.score / record.maxScore) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getTypeTagType = (type) => {
  const map = {
    midterm: 'warning',
    final: 'danger',
    quiz: 'primary',
    mock: 'info'
  }
  return map[type] || ''
}

const getTypeLabel = (type) => {
  const map = {
    midterm: '期中考试',
    final: '期末考试',
    quiz: '随堂测验',
    mock: '模拟考试'
  }
  return map[type] || type
}

const getStatusType = (status) => {
  const map = {
    notStarted: 'info',
    completed: 'warning',
    graded: 'success'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    notStarted: '未参加',
    completed: '待批改',
    graded: '已批改'
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.exam-records {
  .filter-bar {
    display: flex;
    gap: 12px;
  }

  .score-display {
    font-weight: 600;
    color: var(--color-primary);
    font-size: 16px;
  }
}
</style>
