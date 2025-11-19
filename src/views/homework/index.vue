<template>
  <div class="homework-management">
    <el-card class="box-card">
      <!-- 工具栏 -->
      <template #header>
        <div class="card-header">
          <span>作业管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新建作业
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
          placeholder="筛选班级"
          clearable
          style="width: 200px; margin-left: 12px"
        >
          <el-option
            v-for="cls in classes"
            :key="cls.id"
            :label="cls.name"
            :value="cls.id"
          />
        </el-select>

        <el-select
          v-model="filterStatus"
          placeholder="筛选状态"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已截止" value="closed" />
        </el-select>
      </div>

      <!-- 作业卡片列表 -->
      <div class="homework-grid">
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col
            v-for="homework in filteredHomeworks"
            :key="homework.id"
            :span="8"
          >
            <el-card class="homework-card" shadow="hover">
              <div class="card-header-info">
                <h3>{{ homework.title }}</h3>
                <el-tag :type="getStatusType(homework.status)">
                  {{ getStatusLabel(homework.status) }}
                </el-tag>
              </div>

              <div class="card-content">
                <div class="info-item">
                  <span class="label">班级:</span>
                  <span class="value">{{ homework.className }}</span>
                </div>
                <div class="info-item">
                  <span class="label">课程:</span>
                  <span class="value">{{ homework.courseName || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">题目数:</span>
                  <span class="value">{{ homework.questionCount }}</span>
                </div>
                <div class="info-item">
                  <span class="label">截止时间:</span>
                  <span class="value">{{ formatDate(homework.dueDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">完成度:</span>
                  <el-progress
                    :percentage="homework.completionRate"
                    :show-text="false"
                  />
                </div>
              </div>

              <div class="card-actions">
                <el-button link type="primary" size="small" @click="handleView(homework)">
                  查看
                </el-button>
                <el-button link type="primary" size="small" @click="handleEdit(homework)">
                  编辑
                </el-button>
                <el-button link type="primary" size="small" @click="handleAddQuestions(homework)">
                  添加题目
                </el-button>
                <el-button link type="primary" size="small" @click="handleSubmissions(homework)">
                  答题情况
                </el-button>
                <el-button link type="primary" size="small" @click="handleCopy(homework)">
                  复制
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(homework)">
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="filteredHomeworks.length === 0" description="暂无作业" style="margin-top: 20px" />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 36]"
        :total="filteredHomeworks.length"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 作业编辑对话框 -->
    <HomeworkDialog
      v-model="homeworkDialogVisible"
      :homework="currentHomework"
      :classes="classes"
      @save="handleSaveHomework"
    />

    <!-- 答题情况对话框 -->
    <SubmissionsDialog
      v-model="submissionsDialogVisible"
      :homework="currentHomework"
    />

    <!-- 题目管理抽屉 -->
    <QuestionManagementDrawer
      v-model="questionDrawerVisible"
      :homework-id="currentHomework?.id"
      @save="handleAddQuestionsToHomework"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search } from '@element-plus/icons-vue'
import HomeworkDialog from './components/HomeworkDialog.vue'
import SubmissionsDialog from './components/SubmissionsDialog.vue'
import QuestionManagementDrawer from './components/QuestionManagementDrawer.vue'

const searchText = ref('')
const filterClass = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const homeworkDialogVisible = ref(false)
const submissionsDialogVisible = ref(false)
const questionDrawerVisible = ref(false)
const currentHomework = ref(null)

const classes = ref([
  { id: 'class_001', name: '一年级一班' },
  { id: 'class_002', name: '一年级二班' },
  { id: 'class_003', name: '二年级一班' }
])

const homeworks = ref([
  {
    id: 'hw_001',
    title: '第一章基础练习',
    className: '一年级一班',
    courseName: '数学',
    questionCount: 10,
    dueDate: '2024-12-20',
    completionRate: 85,
    status: 'published',
    description: '第一章基础知识练习',
    createdAt: '2024-12-01'
  },
  {
    id: 'hw_002',
    title: '第二章应用题',
    className: '一年级一班',
    courseName: '数学',
    questionCount: 8,
    dueDate: '2024-12-25',
    completionRate: 60,
    status: 'published',
    description: '第二章应用题练习',
    createdAt: '2024-12-05'
  },
  {
    id: 'hw_003',
    title: '英语阅读理解',
    className: '一年级二班',
    courseName: '英语',
    questionCount: 5,
    dueDate: '2024-12-22',
    completionRate: 40,
    status: 'draft',
    description: '英语阅读理解练习',
    createdAt: '2024-12-10'
  }
])

const filteredHomeworks = computed(() => {
  let result = homeworks.value

  if (searchText.value) {
    result = result.filter(h =>
      h.title.includes(searchText.value) ||
      h.description.includes(searchText.value)
    )
  }

  if (filterClass.value) {
    result = result.filter(h => h.className === filterClass.value)
  }

  if (filterStatus.value) {
    result = result.filter(h => h.status === filterStatus.value)
  }

  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusType = (status) => {
  const map = {
    draft: 'info',
    published: 'success',
    closed: 'warning'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    draft: '草稿',
    published: '已发布',
    closed: '已截止'
  }
  return map[status] || status
}

const handleCreate = () => {
  currentHomework.value = null
  homeworkDialogVisible.value = true
}

const handleEdit = (homework) => {
  currentHomework.value = { ...homework }
  homeworkDialogVisible.value = true
}

const handleView = (homework) => {
  ElMessage.info(`查看作业: ${homework.title}`)
}

const handleSubmissions = (homework) => {
  currentHomework.value = homework
  submissionsDialogVisible.value = true
}

const handleAddQuestions = (homework) => {
  currentHomework.value = homework
  questionDrawerVisible.value = true
}

const handleAddQuestionsToHomework = (questions) => {
  if (currentHomework.value && questions && questions.length > 0) {
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0)
    currentHomework.value.questionCount = (currentHomework.value.questionCount || 0) + questions.length
    ElMessage.success(`已添加 ${questions.length} 道题目，总分值 ${totalScore} 分`)
  }
  questionDrawerVisible.value = false
}

const handleCopy = (homework) => {
  const newHomework = {
    ...homework,
    id: `hw_${Date.now()}`,
    title: `${homework.title}(副本)`,
    status: 'draft'
  }
  homeworks.value.push(newHomework)
  ElMessage.success('作业已复制')
}

const handleDelete = (homework) => {
  ElMessageBox.confirm(
    `确定删除作业 "${homework.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = homeworks.value.findIndex(h => h.id === homework.id)
    if (index > -1) {
      homeworks.value.splice(index, 1)
    }
    ElMessage.success('作业已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSaveHomework = (data) => {
  if (currentHomework.value) {
    const index = homeworks.value.findIndex(h => h.id === currentHomework.value.id)
    if (index > -1) {
      homeworks.value[index] = { ...homeworks.value[index], ...data }
    }
    ElMessage.success('作业已更新')
  } else {
    homeworks.value.push({
      id: `hw_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    })
    ElMessage.success('作业已创建')
  }
  homeworkDialogVisible.value = false
}

const handleAddQuestionsToHomework = (questions) => {
  if (currentHomework.value) {
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0)
    currentHomework.value.questionCount = (currentHomework.value.questionCount || 0) + questions.length
    ElMessage.success(`已添加 ${questions.length} 道题目，总分值 ${totalScore} 分`)
  }
  questionDrawerVisible.value = false
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleExport = () => {
  ElMessage.success('已导出为Excel文件')
}

onMounted(() => {
  console.log('Homework management page loaded')
})
</script>

<style scoped>
.homework-management {
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

.homework-grid {
  margin-top: 20px;
}

.homework-card {
  height: 100%;
  transition: all 0.3s;
}

.homework-card:hover {
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
