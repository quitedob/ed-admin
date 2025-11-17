<template>
  <div class="exam-management">
    <el-card class="box-card">
      <!-- 工具栏 -->
      <template #header>
        <div class="card-header">
          <span>考试管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建考试
            </el-button>
            <el-button @click="handleImport">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索考试名称..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterStatus"
          placeholder="筛选状态"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="未开始" value="notStarted" />
          <el-option label="进行中" value="inProgress" />
          <el-option label="已结束" value="ended" />
        </el-select>

        <el-select
          v-model="filterType"
          placeholder="筛选类型"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="期中考试" value="midterm" />
          <el-option label="期末考试" value="final" />
          <el-option label="测验" value="quiz" />
        </el-select>
      </div>

      <!-- 考试卡片列表 -->
      <div class="exam-grid">
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col
            v-for="exam in filteredExams"
            :key="exam.id"
            :span="8"
          >
            <el-card class="exam-card" shadow="hover">
              <div class="card-header-info">
                <h3>{{ exam.title }}</h3>
                <el-tag :type="getStatusType(exam.status)">
                  {{ getStatusLabel(exam.status) }}
                </el-tag>
              </div>

              <div class="card-content">
                <div class="info-item">
                  <span class="label">类型:</span>
                  <span class="value">{{ getTypeLabel(exam.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">班级:</span>
                  <span class="value">{{ exam.className }}</span>
                </div>
                <div class="info-item">
                  <span class="label">开始时间:</span>
                  <span class="value">{{ formatDate(exam.startTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">时长:</span>
                  <span class="value">{{ exam.duration }}分钟</span>
                </div>
                <div class="info-item">
                  <span class="label">总分:</span>
                  <span class="value">{{ exam.totalScore }}分</span>
                </div>
              </div>

              <div class="card-actions">
                <el-button link type="primary" size="small" @click="handleView(exam)">
                  查看
                </el-button>
                <el-button link type="primary" size="small" @click="handleEdit(exam)">
                  编辑
                </el-button>
                <el-button link type="primary" size="small" @click="handleGrade(exam)">
                  批改
                </el-button>
                <el-button link type="primary" size="small" @click="handleStatistics(exam)">
                  统计
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(exam)">
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="filteredExams.length === 0" description="暂无考试" style="margin-top: 20px" />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 36]"
        :total="filteredExams.length"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 考试编辑对话框 -->
    <ExamWizardDialog
      v-model="examWizardVisible"
      :exam="currentExam"
      :classes="classes"
      @save="handleSaveExam"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search } from '@element-plus/icons-vue'
import ExamWizardDialog from './components/ExamWizardDialog.vue'

const searchText = ref('')
const filterStatus = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const examWizardVisible = ref(false)
const currentExam = ref(null)

const classes = ref([
  { id: 'class_001', name: '一年级一班' },
  { id: 'class_002', name: '一年级二班' },
  { id: 'class_003', name: '二年级一班' }
])

const exams = ref([
  {
    id: 'exam_001',
    title: '数学期中考试',
    className: '一年级一班',
    type: 'midterm',
    status: 'ended',
    startTime: '2024-11-15 09:00',
    duration: 120,
    totalScore: 100,
    passingScore: 60,
    description: '数学期中综合测试',
    createdAt: '2024-11-01'
  },
  {
    id: 'exam_002',
    title: '英语期中考试',
    className: '一年级一班',
    type: 'midterm',
    status: 'ended',
    startTime: '2024-11-20 14:00',
    duration: 90,
    totalScore: 100,
    passingScore: 60,
    description: '英语期中综合测试',
    createdAt: '2024-11-05'
  },
  {
    id: 'exam_003',
    title: '数学期末考试',
    className: '一年级一班',
    type: 'final',
    status: 'notStarted',
    startTime: '2024-12-28 09:00',
    duration: 150,
    totalScore: 150,
    passingScore: 90,
    description: '数学期末综合测试',
    createdAt: '2024-12-10'
  }
])

const filteredExams = computed(() => {
  let result = exams.value

  if (searchText.value) {
    result = result.filter(e =>
      e.title.includes(searchText.value) ||
      e.description.includes(searchText.value)
    )
  }

  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value)
  }

  if (filterType.value) {
    result = result.filter(e => e.type === filterType.value)
  }

  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusType = (status) => {
  const map = {
    notStarted: 'info',
    inProgress: 'warning',
    ended: 'success'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    notStarted: '未开始',
    inProgress: '进行中',
    ended: '已结束'
  }
  return map[status] || status
}

const getTypeLabel = (type) => {
  const map = {
    midterm: '期中考试',
    final: '期末考试',
    quiz: '测验'
  }
  return map[type] || type
}

const handleCreate = () => {
  currentExam.value = null
  examWizardVisible.value = true
}

const handleEdit = (exam) => {
  currentExam.value = { ...exam }
  examWizardVisible.value = true
}

const handleView = (exam) => {
  ElMessage.info(`查看考试: ${exam.title}`)
}

const handleGrade = (exam) => {
  ElMessage.info(`批改考试: ${exam.title}`)
}

const handleStatistics = (exam) => {
  ElMessage.info(`查看统计: ${exam.title}`)
}

const handleDelete = (exam) => {
  ElMessageBox.confirm(
    `确定删除考试 "${exam.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = exams.value.findIndex(e => e.id === exam.id)
    if (index > -1) {
      exams.value.splice(index, 1)
    }
    ElMessage.success('考试已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSaveExam = (data) => {
  if (currentExam.value) {
    const index = exams.value.findIndex(e => e.id === currentExam.value.id)
    if (index > -1) {
      exams.value[index] = { ...exams.value[index], ...data }
    }
    ElMessage.success('考试已更新')
  } else {
    exams.value.push({
      id: `exam_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    })
    ElMessage.success('考试已创建')
  }
  examWizardVisible.value = false
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleExport = () => {
  ElMessage.success('已导出为Excel文件')
}

onMounted(() => {
  console.log('Exam management page loaded')
})
</script>

<style scoped>
.exam-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.exam-grid {
  margin-top: 20px;
}

.exam-card {
  height: 100%;
  transition: all 0.3s;
}

.exam-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.card-content {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 60px;
}

.info-item .value {
  color: var(--color-text-primary);
  flex: 1;
  text-align: right;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-lighter);
}

.card-actions .el-button {
  font-size: 12px;
  padding: 4px 8px;
}
</style>
