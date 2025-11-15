<template>
  <div class="exam-list-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title-section">
        <h2>考试管理</h2>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建考试
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索考试..."
        clearable
        style="width: 200px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterType" placeholder="考试类型" clearable style="width: 150px">
        <el-option label="全部类型" value="" />
        <el-option label="测验" value="quiz" />
        <el-option label="期中考试" value="midterm" />
        <el-option label="期末考试" value="final" />
        <el-option label="编程考试" value="programming" />
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px">
        <el-option label="全部状态" value="" />
        <el-option label="未开始" value="pending" />
        <el-option label="进行中" value="ongoing" />
        <el-option label="已结束" value="ended" />
        <el-option label="草稿" value="draft" />
      </el-select>
    </div>

    <!-- 考试列表 -->
    <div class="exam-list">
      <el-row :gutter="20">
        <el-col
          v-for="exam in filteredExams"
          :key="exam.id"
          :span="8"
        >
          <el-card class="exam-card" shadow="hover">
            <div class="exam-header">
              <div class="exam-title-section">
                <h3 class="exam-title">{{ exam.title }}</h3>
                <el-tag :type="getStatusTagType(exam.status)" size="small">
                  {{ getStatusLabel(exam.status) }}
                </el-tag>
              </div>
              <el-tag :type="getTypeTagType(exam.type)">
                {{ getTypeLabel(exam.type) }}
              </el-tag>
            </div>

            <div class="exam-description">
              {{ exam.description || '暂无描述' }}
            </div>

            <div class="exam-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateTime(exam.schedule.startTime) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ exam.schedule.duration }}分钟</span>
              </div>
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>{{ getTotalQuestions(exam) }}道题</span>
              </div>
              <div class="info-item">
                <el-icon><TrophyBase /></el-icon>
                <span>{{ exam.totalScore }}分</span>
              </div>
            </div>

            <div class="exam-stats">
              <div class="stat-item">
                <span class="stat-label">参考人数</span>
                <span class="stat-value">{{ exam.participantCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已提交</span>
                <span class="stat-value">{{ exam.submittedCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均分</span>
                <span class="stat-value">{{ exam.averageScore || 0 }}</span>
              </div>
            </div>

            <div class="exam-actions">
              <el-button link type="primary" @click="handleEdit(exam)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="success" @click="handleView(exam)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button link type="info" @click="handleGrade(exam)">
                <el-icon><DocumentChecked /></el-icon>
                批改
              </el-button>
              <el-button link type="warning" @click="handleStats(exam)">
                <el-icon><DataAnalysis /></el-icon>
                统计
              </el-button>
              <el-button link type="danger" @click="handleDelete(exam)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredExams.length === 0" description="暂无考试" />
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[9, 18, 36]"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Document,
  TrophyBase,
  Edit,
  View,
  DocumentChecked,
  DataAnalysis,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(9)

const exams = ref([])

// 计算属性
const filteredExams = computed(() => {
  let result = exams.value

  if (searchText.value) {
    result = result.filter(e =>
      e.title.includes(searchText.value) ||
      e.description?.includes(searchText.value)
    )
  }

  if (filterType.value) {
    result = result.filter(e => e.type === filterType.value)
  }

  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value)
  }

  return result
})

const total = computed(() => filteredExams.value.length)

// 初始化模拟数据
const initMockData = () => {
  exams.value = [
    {
      id: 'exam_001',
      title: 'JavaScript期中考试',
      description: 'JavaScript基础知识期中测试',
      type: 'midterm',
      difficulty: 'medium',
      schedule: {
        startTime: '2024-12-15T10:00:00Z',
        endTime: '2024-12-15T11:30:00Z',
        duration: 90
      },
      questionBanks: [
        { type: 'single', selectedCount: 10 },
        { type: 'multiple', selectedCount: 5 },
        { type: 'essay', selectedCount: 2 }
      ],
      totalScore: 100,
      passingScore: 60,
      participantCount: 30,
      submittedCount: 25,
      averageScore: 75,
      status: 'ended'
    },
    {
      id: 'exam_002',
      title: 'Vue.js测验',
      description: 'Vue.js框架基础测验',
      type: 'quiz',
      difficulty: 'easy',
      schedule: {
        startTime: '2024-12-20T14:00:00Z',
        endTime: '2024-12-20T15:00:00Z',
        duration: 60
      },
      questionBanks: [
        { type: 'single', selectedCount: 15 },
        { type: 'multiple', selectedCount: 5 }
      ],
      totalScore: 50,
      passingScore: 30,
      participantCount: 30,
      submittedCount: 0,
      averageScore: 0,
      status: 'ongoing'
    },
    {
      id: 'exam_003',
      title: '算法期末考试',
      description: '数据结构与算法期末考试',
      type: 'final',
      difficulty: 'hard',
      schedule: {
        startTime: '2025-01-10T09:00:00Z',
        endTime: '2025-01-10T11:30:00Z',
        duration: 150
      },
      questionBanks: [
        { type: 'single', selectedCount: 20 },
        { type: 'programming', selectedCount: 5 }
      ],
      totalScore: 150,
      passingScore: 90,
      participantCount: 0,
      submittedCount: 0,
      averageScore: 0,
      status: 'pending'
    }
  ]
}

// 方法
const handleCreate = () => {
  router.push('/exam/create')
}

const handleEdit = (exam) => {
  router.push(`/exam/edit/${exam.id}`)
}

const handleView = (exam) => {
  router.push(`/exam/detail/${exam.id}`)
}

const handleGrade = (exam) => {
  router.push(`/exam/grade/${exam.id}`)
}

const handleStats = (exam) => {
  router.push(`/exam/statistics/${exam.id}`)
}

const handleDelete = (exam) => {
  ElMessageBox.confirm('确定要删除该考试吗？删除后无法恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const index = exams.value.findIndex(e => e.id === exam.id)
    if (index > -1) {
      exams.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const getTotalQuestions = (exam) => {
  return exam.questionBanks.reduce((sum, bank) => sum + bank.selectedCount, 0)
}

const getTypeLabel = (type) => {
  const map = {
    quiz: '测验',
    midterm: '期中',
    final: '期末',
    programming: '编程',
    other: '其他'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    quiz: 'info',
    midterm: 'warning',
    final: 'danger',
    programming: 'success'
  }
  return map[type] || ''
}

const getStatusLabel = (status) => {
  const map = {
    pending: '未开始',
    ongoing: '进行中',
    ended: '已结束',
    draft: '草稿'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'info',
    ongoing: 'success',
    ended: 'warning',
    draft: 'info'
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
.exam-list-container {
  padding: 24px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .title-section {
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.exam-list {
  margin-bottom: 20px;
}

.exam-card {
  margin-bottom: 20px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .exam-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .exam-title-section {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;

      .exam-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }
    }
  }

  .exam-description {
    color: var(--color-text-secondary);
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.6;
    min-height: 40px;
  }

  .exam-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--color-bg-secondary);
    border-radius: 8px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-text-regular);

      .el-icon {
        color: var(--color-primary);
      }
    }
  }

  .exam-stats {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    margin-bottom: 16px;
    border-top: 1px solid var(--color-border-lighter);
    border-bottom: 1px solid var(--color-border-lighter);

    .stat-item {
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-bottom: 4px;
      }

      .stat-value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-primary);
      }
    }
  }

  .exam-actions {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
