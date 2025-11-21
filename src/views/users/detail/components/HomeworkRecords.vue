<template>
  <div class="homework-records">
    <el-card shadow="never">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="已提交" value="submitted" />
          <el-option label="未提交" value="notSubmitted" />
          <el-option label="已批改" value="graded" />
          <el-option label="已逾期" value="overdue" />
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

      <!-- 作业列表 -->
      <el-table :data="filteredRecords" style="margin-top: 20px" v-loading="loading">
        <el-table-column prop="title" label="作业名称" min-width="200" />
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column label="截止时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.dueDate) }}
          </template>
        </el-table-column>
        <el-table-column label="完成度" width="180" align="center">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px">
              <el-progress
                :percentage="row.completionRate || 0"
                :color="getProgressColor(row.completionRate)"
                style="width: 100%"
              />
              <span style="font-size: 12px; color: #909399">
                {{ row.finishedCount }}/{{ row.totalCount }}题
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学习时长" width="120" align="center">
          <template #default="{ row }">
            {{ formatLearningTime(row.studyDuration) }}
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
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && filteredRecords.length === 0" description="暂无作业记录" />
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
const filterStatus = ref('')
const dateRange = ref([])

// 模拟数据
const records = ref([
  {
    id: 'hw_001',
    title: 'JavaScript基础练习',
    courseId: 'course_001',
    courseName: 'JavaScript基础',
    classId: 'class_001',
    className: '前端开发一班',
    dueDate: '2024-12-25T23:59:59Z',
    submitTime: '2024-12-20T15:30:00Z',
    completionRate: 90,
    finishedCount: 9,
    totalCount: 10,
    studyDuration: 45,
    status: 'graded'
  },
  {
    id: 'hw_002',
    title: 'Vue组件开发练习',
    courseId: 'course_002',
    courseName: 'Vue.js框架',
    classId: 'class_001',
    className: '前端开发一班',
    dueDate: '2024-12-28T23:59:59Z',
    submitTime: '2024-12-22T10:20:00Z',
    completionRate: 75,
    finishedCount: 6,
    totalCount: 8,
    studyDuration: 30,
    status: 'graded'
  }
])

const filteredRecords = computed(() => {
  let result = [...records.value]

  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(r => {
      if (!r.submitTime) return false
      const date = new Date(r.submitTime)
      return date >= start && date <= end
    })
  }

  return result
})

const handleViewDetail = (record) => {
  router.push({
    path: `/assignments/${record.id}/grade`,
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

const formatLearningTime = (minutes) => {
  if (!minutes || minutes === 0) return '-'
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (status) => {
  const map = {
    notSubmitted: 'info',
    submitted: 'warning',
    graded: 'success',
    overdue: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    notSubmitted: '未提交',
    submitted: '待批改',
    graded: '已批改',
    overdue: '已逾期'
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.homework-records {
  .filter-bar {
    display: flex;
    gap: 12px;
  }
}
</style>
