<template>
  <div class="student-homework-page">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ studentInfo?.name }} - 作业记录</span>
      </div>
    </div>

    <!-- 学生信息卡片 -->
    <div class="student-info-card">
      <el-card shadow="never">
        <div class="info-content">
          <el-avatar :size="60" :src="studentInfo?.avatar">
            {{ studentInfo?.name?.charAt(0) }}
          </el-avatar>
          <div class="info-details">
            <h3>{{ studentInfo?.name }}</h3>
            <div class="meta">
              <span>学号: {{ studentInfo?.studentId }}</span>
              <el-divider direction="vertical" />
              <span>班级: {{ studentInfo?.classes?.map(c => c.name).join(', ') }}</span>
            </div>
          </div>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ homeworkStats.total }}</div>
              <div class="stat-label">总作业数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ homeworkStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ homeworkStats.avgCompletionRate }}</div>
              <div class="stat-label">平均完成度</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ homeworkStats.totalTime }}</div>
              <div class="stat-label">总学习时长</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card shadow="never">
        <div class="filter-content">
          <el-input
            v-model="searchText"
            placeholder="搜索作业名称..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="filterClass"
            placeholder="按班级筛选"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>

          <el-select
            v-model="filterCourse"
            placeholder="按课程筛选"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>

          <el-select
            v-model="filterStatus"
            placeholder="按状态筛选"
            clearable
            style="width: 150px"
          >
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
            style="width: 280px"
          />
        </div>
      </el-card>
    </div>

    <!-- 作业列表 -->
    <div class="homework-list">
      <el-card shadow="never">
        <el-table :data="filteredHomeworks" stripe v-loading="loading">
          <el-table-column prop="title" label="作业名称" min-width="200" show-overflow-tooltip />
          
          <el-table-column label="所属课程" width="150">
            <template #default="{ row }">
              <el-tag type="primary" size="small">{{ row.courseName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="所属班级" width="150">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.className }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="截止时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.dueDate) }}
            </template>
          </el-table-column>

          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">
              <span v-if="row.submitTime">{{ formatDateTime(row.submitTime) }}</span>
              <span v-else style="color: #909399">未提交</span>
            </template>
          </el-table-column>

          <!-- 作业不显示分数，只显示完成度 -->
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

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && filteredHomeworks.length === 0"
          description="暂无作业记录"
          style="margin-top: 40px"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const studentId = ref(route.params.id)
const loading = ref(false)
const searchText = ref('')
const filterClass = ref('')
const filterCourse = ref('')
const filterStatus = ref('')
const dateRange = ref([])

// 模拟数据
const studentInfo = ref({
  id: 'stu_001',
  studentId: '20240001',
  name: '张三',
  avatar: '',
  classes: [
    { id: 'class_001', name: '前端开发一班' }
  ]
})

const homeworks = ref([
  {
    id: 'hw_001',
    title: 'JavaScript基础练习',
    courseId: 'course_001',
    courseName: 'JavaScript基础',
    classId: 'class_001',
    className: '前端开发一班',
    dueDate: '2024-12-25T23:59:59Z',
    submitTime: '2024-12-20T15:30:00Z',
    completionRate: 90,        // 完成度 0-100
    finishedCount: 9,          // 已完成题目数
    totalCount: 10,            // 总题目数
    studyDuration: 45,         // 学习时长（分钟）
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
  },
  {
    id: 'hw_003',
    title: 'React Hooks练习',
    courseId: 'course_003',
    courseName: 'React基础',
    classId: 'class_001',
    className: '前端开发一班',
    dueDate: '2024-12-30T23:59:59Z',
    submitTime: null,
    completionRate: 0,
    finishedCount: 0,
    totalCount: 12,
    studyDuration: 0,
    status: 'notSubmitted'
  }
])

const classList = ref([
  { id: 'class_001', name: '前端开发一班' },
  { id: 'class_002', name: '前端开发二班' }
])

const courseList = ref([
  { id: 'course_001', name: 'JavaScript基础' },
  { id: 'course_002', name: 'Vue.js框架' },
  { id: 'course_003', name: 'React基础' }
])

// 计算属性
const filteredHomeworks = computed(() => {
  let result = [...homeworks.value]

  if (searchText.value) {
    result = result.filter(h => h.title.includes(searchText.value))
  }

  if (filterClass.value) {
    result = result.filter(h => h.className === filterClass.value)
  }

  if (filterCourse.value) {
    result = result.filter(h => h.courseName === filterCourse.value)
  }

  if (filterStatus.value) {
    result = result.filter(h => h.status === filterStatus.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(h => {
      if (!h.submitTime) return false
      const date = new Date(h.submitTime)
      return date >= start && date <= end
    })
  }

  return result
})

const homeworkStats = computed(() => {
  const total = homeworks.value.length
  const completed = homeworks.value.filter(h => h.status !== 'notSubmitted').length
  const completedHomeworks = homeworks.value.filter(h => h.status !== 'notSubmitted')
  const avgCompletionRate = completedHomeworks.length > 0
    ? Math.round(completedHomeworks.reduce((sum, h) => sum + h.completionRate, 0) / completedHomeworks.length)
    : 0
  const totalMinutes = homeworks.value.reduce((sum, h) => sum + (h.studyDuration || 0), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  return {
    total,
    completed,
    avgCompletionRate: `${avgCompletionRate}%`,
    totalTime: `${hours}h${minutes}m`
  }
})

// 方法
const handleBack = () => {
  router.back()
}

const handleViewDetail = (homework) => {
  // 跳转到作业批改页，默认进入"按学生"视图
  router.push({
    path: `/assignments/${homework.id}/grade`,
    query: {
      view: 'by-student',
      studentId: studentId.value
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

onMounted(() => {
  console.log('加载学生作业记录:', studentId.value)
})
</script>

<style lang="scss" scoped>
.student-homework-page {
  min-height: calc(100vh - 60px);
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
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.student-info-card {
  padding: 24px;

  .info-content {
    display: flex;
    gap: 24px;
    align-items: center;

    .info-details {
      flex: 1;

      h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-text-secondary);
        font-size: 14px;
      }
    }

    .stats {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--color-primary);
          display: block;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
}

.filter-section {
  padding: 0 24px 24px;

  .filter-content {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.homework-list {
  padding: 0 24px 24px;
}
</style>
