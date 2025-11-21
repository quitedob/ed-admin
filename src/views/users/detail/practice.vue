<template>
  <div class="student-practice-page">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ studentInfo?.name }} - 题库记录</span>
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
              <div class="stat-value">{{ practiceStats.total }}</div>
              <div class="stat-label">总练习数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ practiceStats.correctRate }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ practiceStats.totalTime }}</div>
              <div class="stat-label">总用时</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-section">
      <el-card shadow="never">
        <div class="filter-content">
          <el-input
            v-model="searchText"
            placeholder="搜索题目标题或ID..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="filterType"
            placeholder="按题型筛选"
            clearable
            style="width: 150px"
          >
            <el-option label="全部题型" value="" />
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fill" />
            <el-option label="判断题" value="judge" />
            <el-option label="编程题" value="programming" />
            <el-option label="简答题" value="essay" />
          </el-select>

          <el-select
            v-model="filterResult"
            placeholder="按结果筛选"
            clearable
            style="width: 150px"
          >
            <el-option label="全部结果" value="" />
            <el-option label="正确" value="correct" />
            <el-option label="错误" value="incorrect" />
          </el-select>

          <el-select
            v-model="filterSource"
            placeholder="按来源筛选"
            clearable
            style="width="180px"
          >
            <el-option label="全部来源" value="" />
            <el-option label="题库刷题" value="bank" />
            <el-option label="作业" value="assignment" />
            <el-option label="考试" value="exam" />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
          />

          <el-button @click="handleReset">重置</el-button>
        </div>
      </el-card>
    </div>

    <!-- 练习记录列表 -->
    <div class="practice-list">
      <el-card shadow="never">
        <el-table :data="paginatedRecords" stripe v-loading="loading">
          <el-table-column label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.submitTime) }}
            </template>
          </el-table-column>

          <el-table-column prop="questionTitle" label="题目标题" min-width="250" show-overflow-tooltip />

          <el-table-column label="题型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.correct ? 'success' : 'danger'" size="small">
                <el-icon style="vertical-align: middle">
                  <component :is="row.correct ? 'Check' : 'Close'" />
                </el-icon>
                {{ row.correct ? '正确' : '错误' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="耗时" width="100" align="center">
            <template #default="{ row }">
              {{ formatTimeSpent(row.timeSpent) }}
            </template>
          </el-table-column>

          <el-table-column label="来源" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getSourceTagType(row.source)" size="small">
                {{ getSourceLabel(row.source) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="来源名称" width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.sourceTitle">{{ row.sourceTitle }}</span>
              <span v-else style="color: #909399">-</span>
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

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredRecords.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && filteredRecords.length === 0"
          description="暂无练习记录"
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
import { ArrowLeft, Search, Check, Close } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const studentId = ref(route.params.id)
const loading = ref(false)
const searchText = ref('')
const filterType = ref('')
const filterResult = ref('')
const filterSource = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(20)

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

const practiceRecords = ref([
  {
    id: 'pr_001',
    questionId: 'q_001',
    questionTitle: 'JavaScript闭包的概念和应用',
    type: 'single',
    source: 'bank',
    sourceId: null,
    sourceTitle: null,
    submitTime: '2024-12-20T10:30:00Z',
    correct: true,
    timeSpent: 45
  },
  {
    id: 'pr_002',
    questionId: 'q_002',
    questionTitle: 'Vue3组合式API的优势',
    type: 'multiple',
    source: 'assignment',
    sourceId: 'hw_001',
    sourceTitle: 'JavaScript基础练习',
    submitTime: '2024-12-20T11:15:00Z',
    correct: true,
    timeSpent: 120
  },
  {
    id: 'pr_003',
    questionId: 'q_003',
    questionTitle: '实现一个防抖函数',
    type: 'programming',
    source: 'bank',
    sourceId: null,
    sourceTitle: null,
    submitTime: '2024-12-19T15:20:00Z',
    correct: false,
    timeSpent: 300
  },
  {
    id: 'pr_004',
    questionId: 'q_004',
    questionTitle: 'HTTP状态码的含义',
    type: 'fill',
    source: 'exam',
    sourceId: 'exam_001',
    sourceTitle: 'JavaScript期中测试',
    submitTime: '2024-12-18T09:30:00Z',
    correct: true,
    timeSpent: 60
  },
  {
    id: 'pr_005',
    questionId: 'q_005',
    questionTitle: 'Promise是异步编程的解决方案',
    type: 'judge',
    source: 'bank',
    sourceId: null,
    sourceTitle: null,
    submitTime: '2024-12-17T14:10:00Z',
    correct: true,
    timeSpent: 15
  }
])

// 计算属性
const filteredRecords = computed(() => {
  let result = [...practiceRecords.value]

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(r =>
      r.questionTitle.includes(searchText.value) ||
      r.questionId.includes(searchText.value)
    )
  }

  // 题型过滤
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }

  // 结果过滤
  if (filterResult.value) {
    const isCorrect = filterResult.value === 'correct'
    result = result.filter(r => r.correct === isCorrect)
  }

  // 来源过滤
  if (filterSource.value) {
    result = result.filter(r => r.source === filterSource.value)
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(r => {
      const date = new Date(r.submitTime)
      return date >= start && date <= end
    })
  }

  return result.sort((a, b) => {
    return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime()
  })
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
})

const practiceStats = computed(() => {
  const total = practiceRecords.value.length
  const correctCount = practiceRecords.value.filter(r => r.correct).length
  const correctRate = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const totalSeconds = practiceRecords.value.reduce((sum, r) => sum + (r.timeSpent || 0), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return {
    total,
    correctRate,
    totalTime: `${hours}h${minutes}m`
  }
})

// 方法
const handleBack = () => {
  router.back()
}

const handleReset = () => {
  searchText.value = ''
  filterType.value = ''
  filterResult.value = ''
  filterSource.value = ''
  dateRange.value = []
}

const handleViewDetail = (record) => {
  // 根据来源跳转到不同页面
  if (record.source === 'assignment' && record.sourceId) {
    router.push({
      path: `/assignments/grading/${record.sourceId}`,
      query: {
        view: 'by-student',
        studentId: studentId.value,
        questionId: record.questionId
      }
    })
  } else if (record.source === 'exam' && record.sourceId) {
    router.push({
      path: `/exam/grading/${record.sourceId}`,
      query: {
        view: 'by-student',
        studentId: studentId.value,
        questionId: record.questionId
      }
    })
  } else {
    // 题库刷题，跳转到题目详情
    ElMessage.info('查看题目详情')
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const formatTimeSpent = (seconds) => {
  if (!seconds || seconds === 0) return '-'
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

const getTypeLabel = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    programming: '编程题',
    essay: '简答题'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    programming: 'danger',
    essay: ''
  }
  return map[type] || ''
}

const getSourceLabel = (source) => {
  const map = {
    bank: '题库刷题',
    assignment: '作业',
    exam: '考试'
  }
  return map[source] || source
}

const getSourceTagType = (source) => {
  const map = {
    bank: 'info',
    assignment: 'primary',
    exam: 'warning'
  }
  return map[source] || ''
}

onMounted(() => {
  console.log('加载学生题库练习记录:', studentId.value)
  // TODO: 调用API加载数据
  // loadPracticeRecords()
})
</script>

<style lang="scss" scoped>
.student-practice-page {
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

.practice-list {
  padding: 0 24px 24px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
