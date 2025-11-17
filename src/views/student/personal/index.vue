<template>
  <div class="student-personal">
    <!-- 个人信息卡片 -->
    <el-row :gutter="20" class="info-section">
      <el-col :span="24">
        <el-card class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              <el-avatar :size="80" :src="studentInfo.avatar" />
            </div>
            <div class="profile-info">
              <h2>{{ studentInfo.name }}</h2>
              <div class="info-items">
                <span>学号: {{ studentInfo.studentId }}</span>
                <span>班级: {{ studentInfo.className }}</span>
                <span>年级: {{ studentInfo.grade }}</span>
              </div>
            </div>
            <div class="profile-actions">
              <el-button @click="editProfile">编辑信息</el-button>
              <el-button @click="changePassword">修改密码</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学习统计 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :span="6">
        <el-statistic title="已完成作业" :value="stats.completedHomeworks" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="已参加考试" :value="stats.completedExams" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="平均成绩" :value="stats.avgScore" suffix="分" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="学习时长" :value="stats.learningHours" suffix="小时" />
      </el-col>
    </el-row>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="content-tabs">
      <!-- 我的作业 -->
      <el-tab-pane label="我的作业" name="homework">
        <div class="tab-content">
          <div class="content-header">
            <el-input
              v-model="searchText"
              placeholder="搜索作业..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterStatus" placeholder="筛选状态" style="width: 150px; margin-left: 12px">
              <el-option label="全部" value="" />
              <el-option label="未开始" value="notStarted" />
              <el-option label="进行中" value="inProgress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已逾期" value="overdue" />
            </el-select>
          </div>

          <el-table :data="filteredHomeworks" stripe style="width: 100%; margin-top: 16px">
            <el-table-column prop="title" label="作业名称" min-width="200" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="dueDate" label="截止时间" width="150" />
            <el-table-column label="完成度" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.completionRate"
                  :color="getProgressColor(row.completionRate)"
                  :show-text="false"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="doHomework(row)">
                  {{ row.status === 'completed' ? '查看' : '做题' }}
                </el-button>
                <el-button link type="primary" size="small" @click="viewFeedback(row)">
                  反馈
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 我的考试 -->
      <el-tab-pane label="我的考试" name="exam">
        <div class="tab-content">
          <div class="content-header">
            <el-input
              v-model="searchText"
              placeholder="搜索考试..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterStatus" placeholder="筛选状态" style="width: 150px; margin-left: 12px">
              <el-option label="全部" value="" />
              <el-option label="未开始" value="notStarted" />
              <el-option label="进行中" value="inProgress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>

          <el-table :data="filteredExams" stripe style="width: 100%; margin-top: 16px">
            <el-table-column prop="title" label="考试名称" min-width="200" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="startTime" label="开始时间" width="150" />
            <el-table-column label="成绩" width="100">
              <template #default="{ row }">
                <span v-if="row.score !== null">{{ row.score }}分</span>
                <span v-else style="color: #909399;">-</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="doExam(row)">
                  {{ row.status === 'completed' ? '查看' : '参加' }}
                </el-button>
                <el-button link type="primary" size="small" @click="viewAnalysis(row)">
                  分析
                </el-button>
              </template>
            </el-tab-pane>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 错题本 -->
      <el-tab-pane label="错题本" name="errorQuestions">
        <div class="tab-content">
          <div class="content-header">
            <el-input
              v-model="searchText"
              placeholder="搜索错题..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterKnowledge" placeholder="筛选知识点" style="width: 150px; margin-left: 12px">
              <el-option label="全部" value="" />
              <el-option v-for="kp in knowledgePoints" :key="kp.id" :label="kp.name" :value="kp.id" />
            </el-select>
          </div>

          <div class="error-questions-list">
            <div
              v-for="question in filteredErrorQuestions"
              :key="question.id"
              class="error-question-item"
            >
              <div class="question-header">
                <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
                <span class="question-title">{{ question.title }}</span>
                <el-tag type="warning" size="small">{{ question.knowledgePoint }}</el-tag>
              </div>
              <div class="question-content">
                {{ question.content }}
              </div>
              <div class="question-actions">
                <el-button link type="primary" size="small" @click="reviewQuestion(question)">
                  复习
                </el-button>
                <el-button link type="primary" size="small" @click="removeErrorQuestion(question)">
                  移除
                </el-button>
              </div>
            </div>

            <el-empty v-if="filteredErrorQuestions.length === 0" description="暂无错题" />
          </div>
        </div>
      </el-tab-pane>

      <!-- 学习分析 -->
      <el-tab-pane label="学习分析" name="analysis">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>知识点掌握情况</span>
                </template>
                <div class="chart-placeholder">
                  <p>知识点掌握度分布图</p>
                  <p style="font-size: 12px; color: #909399;">
                    (实际项目中使用 ECharts)
                  </p>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <span>成绩趋势</span>
                </template>
                <div class="chart-placeholder">
                  <p>成绩变化趋势图</p>
                  <p style="font-size: 12px; color: #909399;">
                    (实际项目中使用 ECharts)
                  </p>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card style="margin-top: 20px">
            <template #header>
              <span>学习建议</span>
            </template>
            <div class="suggestions">
              <div v-for="(suggestion, index) in learningAnalysis.suggestions" :key="index" class="suggestion-item">
                <el-icon class="suggestion-icon"><SuccessFilled /></el-icon>
                <span>{{ suggestion }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, SuccessFilled } from '@element-plus/icons-vue'

const router = useRouter()

const activeTab = ref('homework')
const searchText = ref('')
const filterStatus = ref('')
const filterKnowledge = ref('')

// 学生信息
const studentInfo = ref({
  name: '张三',
  studentId: '2024001',
  className: '一年级一班',
  grade: '一年级',
  avatar: 'https://via.placeholder.com/80'
})

// 统计数据
const stats = ref({
  completedHomeworks: 12,
  completedExams: 3,
  avgScore: 85,
  learningHours: 48
})

// 作业列表
const homeworks = ref([
  {
    id: 'hw_001',
    title: '第一章基础练习',
    courseName: '数学',
    dueDate: '2024-12-20',
    completionRate: 100,
    status: 'completed'
  },
  {
    id: 'hw_002',
    title: '第二章应用题',
    courseName: '数学',
    dueDate: '2024-12-25',
    completionRate: 60,
    status: 'inProgress'
  },
  {
    id: 'hw_003',
    title: '英语阅读理解',
    courseName: '英语',
    dueDate: '2024-12-22',
    completionRate: 0,
    status: 'notStarted'
  }
])

// 考试列表
const exams = ref([
  {
    id: 'exam_001',
    title: '数学期中考试',
    courseName: '数学',
    startTime: '2024-11-15',
    score: 92,
    status: 'completed'
  },
  {
    id: 'exam_002',
    title: '英语期中考试',
    courseName: '英语',
    startTime: '2024-11-20',
    score: 88,
    status: 'completed'
  },
  {
    id: 'exam_003',
    title: '数学期末考试',
    courseName: '数学',
    startTime: '2024-12-28',
    score: null,
    status: 'notStarted'
  }
])

// 错题列表
const errorQuestions = ref([
  {
    id: 'eq_001',
    title: '解方程：2x + 3 = 11',
    type: 'single',
    content: '这是一道一元一次方程题...',
    knowledgePoint: '一元一次方程'
  },
  {
    id: 'eq_002',
    title: '求二次函数顶点',
    type: 'multiple',
    content: '求二次函数 y = x² - 2x + 1 的顶点...',
    knowledgePoint: '二次函数'
  }
])

// 知识点
const knowledgePoints = ref([
  { id: 'kp_001', name: '一元一次方程' },
  { id: 'kp_002', name: '二次函数' },
  { id: 'kp_003', name: '几何证明' }
])

// 学习分析
const learningAnalysis = ref({
  suggestions: [
    '加强一元一次方程的练习，错误率较高',
    '二次函数掌握情况良好，继续保持',
    '建议每周增加2小时的几何证明练习'
  ]
})

// 计算属性
const filteredHomeworks = computed(() => {
  let result = homeworks.value

  if (searchText.value) {
    result = result.filter(h => h.title.includes(searchText.value))
  }

  if (filterStatus.value) {
    result = result.filter(h => h.status === filterStatus.value)
  }

  return result
})

const filteredExams = computed(() => {
  let result = exams.value

  if (searchText.value) {
    result = result.filter(e => e.title.includes(searchText.value))
  }

  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value)
  }

  return result
})

const filteredErrorQuestions = computed(() => {
  let result = errorQuestions.value

  if (searchText.value) {
    result = result.filter(q => q.title.includes(searchText.value))
  }

  if (filterKnowledge.value) {
    result = result.filter(q => q.knowledgePoint === filterKnowledge.value)
  }

  return result
})

// 方法
const getStatusType = (status) => {
  const map = {
    notStarted: 'info',
    inProgress: 'warning',
    completed: 'success',
    overdue: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    notStarted: '未开始',
    inProgress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return map[status] || status
}

const getProgressColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getQuestionTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fillBlank: '填空',
    judge: '判断',
    oj: 'OJ',
    essay: '简答'
  }
  return map[type] || type
}

const editProfile = () => {
  ElMessage.info('编辑个人信息功能开发中...')
}

const changePassword = () => {
  ElMessage.info('修改密码功能开发中...')
}

const doHomework = (homework) => {
  ElMessage.success(`正在打开作业: ${homework.title}`)
}

const viewFeedback = (homework) => {
  ElMessage.info(`查看作业反馈: ${homework.title}`)
}

const doExam = (exam) => {
  ElMessage.success(`正在打开考试: ${exam.title}`)
}

const viewAnalysis = (exam) => {
  ElMessage.info(`查看考试分析: ${exam.title}`)
}

const reviewQuestion = (question) => {
  ElMessage.info(`复习题目: ${question.title}`)
}

const removeErrorQuestion = (question) => {
  const index = errorQuestions.value.findIndex(q => q.id === question.id)
  if (index > -1) {
    errorQuestions.value.splice(index, 1)
  }
  ElMessage.success('已移除错题')
}

onMounted(() => {
  console.log('Student personal page loaded')
})
</script>

<style scoped>
.student-personal {
  padding: 20px;
  background-color: var(--color-bg-secondary);
  min-height: 100vh;
}

.info-section {
  margin-bottom: 20px;
}

.profile-card {
  box-shadow: var(--shadow-base);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.info-items {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.stats-section {
  margin-bottom: 20px;
}

.content-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-base);
}

.tab-content {
  padding: 20px;
}

.content-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.error-questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-question-item {
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border-left: 3px solid var(--color-warning);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.question-type {
  padding: 2px 8px;
  background: var(--color-primary-50);
  border-radius: 2px;
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

.question-title {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
}

.question-content {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  color: var(--color-text-tertiary);
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-success-light);
  border-radius: 4px;
  color: var(--color-success);
}

.suggestion-icon {
  flex-shrink: 0;
}
</style>
