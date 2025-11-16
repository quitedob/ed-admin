<template>
  <div class="exam-grade-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回考试列表</el-button>
    </div>

    <!-- 考试基本信息 -->
    <div class="exam-info-card">
      <el-card>
        <template #header>
          <div class="card-header">
            <h2>{{ examInfo.title }}</h2>
            <div class="header-actions">
              <el-button type="success" @click="handleBatchGrade" :disabled="selectedStudents.length === 0">
                <el-icon><Check /></el-icon>
                批量批改
              </el-button>
              <el-button @click="handleExportGrades">
                <el-icon><Download /></el-icon>
                导出成绩
              </el-button>
              <el-button type="warning" @click="handleGradeAll">
                <el-icon><EditPen /></el-icon>
                一键批改
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="参考人数" :value="examStats.totalSubmissions" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="平均分" :value="examStats.averageScore" :precision="2" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="最高分" :value="examStats.maxScore" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="及格率" :value="examStats.passRate" suffix="%" />
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名、学号..."
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="批改状态" clearable style="width: 150px" @change="handleFilter">
        <el-option label="全部状态" value="" />
        <el-option label="未批改" value="ungraded" />
        <el-option label="已批改" value="graded" />
        <el-option label="部分批改" value="partial" />
      </el-select>

      <el-select v-model="filterScore" placeholder="成绩区间" clearable style="width: 150px" @change="handleFilter">
        <el-option label="全部成绩" value="" />
        <el-option label="优秀 (90-100)" value="excellent" />
        <el-option label="良好 (80-89)" value="good" />
        <el-option label="中等 (70-79)" value="average" />
        <el-option label="及格 (60-69)" value="pass" />
        <el-option label="不及格 (0-59)" value="fail" />
      </el-select>

      <el-button @click="resetFilters">重置筛选</el-button>
    </div>

    <!-- 学生列表 -->
    <div class="students-table">
      <el-table
        :data="filteredStudents"
        @selection-change="handleSelectionChange"
        v-loading="loading"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" />

        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="studentId" label="学号" width="150" />

        <el-table-column label="答题情况" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getCompletionTagType(scope.row)">
              {{ scope.row.answeredQuestions }}/{{ scope.row.totalQuestions }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="用时" width="100" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>

        <el-table-column label="当前得分" width="120" align="center">
          <template #default="scope">
            <span :style="{ color: getScoreColor(scope.row.currentScore, scope.row.totalScore) }">
              {{ scope.row.currentScore }}/{{ scope.row.totalScore }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="批改状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getGradingStatusTagType(scope.row.gradingStatus)">
              {{ getGradingStatusLabel(scope.row.gradingStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="提交时间" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.submitTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="scope">
            <div class="table-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleGradeStudent(scope.row)"
              >
                批改
              </el-button>
              <el-button
                link
                type="info"
                size="small"
                @click="handleViewAnswer(scope.row)"
              >
                查看答卷
              </el-button>
              <el-button
                link
                type="success"
                size="small"
                @click="handleQuickGrade(scope.row)"
                v-if="scope.row.gradingStatus !== 'graded'"
              >
                快速批改
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredStudents.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 批改对话框 -->
    <el-dialog
      v-model="batchGradeDialogVisible"
      title="批量批改"
      width="600px"
    >
      <div class="batch-grade-content">
        <el-alert
          title="批量批改说明"
          description="将对选中的学生进行自动批改客观题，主观题需要手动批改"
          type="info"
          show-icon
          :closable="false"
        />

        <div class="grade-settings">
          <h4>批改设置</h4>
          <el-form :model="batchGradeSettings" label-width="120px">
            <el-form-item label="批改模式">
              <el-radio-group v-model="batchGradeSettings.mode">
                <el-radio label="objective">仅批改客观题</el-radio>
                <el-radio label="all">批改所有题目</el-radio>
                <el-radio label="smart">智能批改</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="默认分数">
              <el-input-number
                v-model="batchGradeSettings.defaultScore"
                :min="0"
                :max="100"
                placeholder="主观题默认分数"
              />
            </el-form-item>

            <el-form-item label="严格模式">
              <el-switch
                v-model="batchGradeSettings.strictMode"
                active-text="开启"
                inactive-text="关闭"
              />
              <div class="help-text">开启后将严格扣分，关闭后将适当给分</div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="batchGradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchGrade" :loading="batchGrading">
          开始批改
        </el-button>
      </template>
    </el-dialog>

    <!-- 快速批改对话框 -->
    <el-dialog
      v-model="quickGradeDialogVisible"
      title="快速批改"
      width="800px"
    >
      <div class="quick-grade-content">
        <div class="student-info">
          <h4>{{ currentStudent?.studentName }} ({{ currentStudent?.studentId }})</h4>
          <div class="quick-stats">
            <span>答题进度: {{ currentStudent?.answeredQuestions }}/{{ currentStudent?.totalQuestions }}</span>
            <span>用时: {{ formatDuration(currentStudent?.duration) }}</span>
          </div>
        </div>

        <div class="questions-overview">
          <h4>题目概览</h4>
          <el-row :gutter="10">
            <el-col :span="8" v-for="(question, index) in currentStudent?.answers" :key="index">
              <el-card
                class="question-card"
                :class="getQuestionCardClass(question)"
                @click="focusQuestion(index)"
              >
                <div class="question-number">第{{ index + 1 }}题</div>
                <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
                <div class="question-score">{{ question.score }}分</div>
                <div class="question-status">{{ getQuestionStatusText(question.status) }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="batch-score-setting">
          <h4>统一设置分数</h4>
          <el-form :model="quickGradeSettings" inline>
            <el-form-item label="未批改题目统一给分:">
              <el-input-number
                v-model="quickGradeSettings.uniformScore"
                :min="0"
                :max="10"
                size="small"
              />
            </el-form-item>
            <el-button type="primary" size="small" @click="applyUniformScore">
              应用到所有未批改题目
            </el-button>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="quickGradeDialogVisible = false">取消</el-button>
        <el-button type="success" @click="saveQuickGrade">保存批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Download,
  Check,
  EditPen
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const filterScore = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedStudents = ref([])
const batchGradeDialogVisible = ref(false)
const quickGradeDialogVisible = ref(false)
const currentStudent = ref(null)

const batchGrading = ref(false)
const batchGradeSettings = ref({
  mode: 'objective',
  defaultScore: 5,
  strictMode: false
})

const quickGradeSettings = ref({
  uniformScore: 5
})

// 考试信息
const examInfo = ref({
  id: '',
  title: '',
  totalScore: 100,
  duration: 120
})

// 考试统计
const examStats = ref({
  totalSubmissions: 0,
  averageScore: 0,
  maxScore: 0,
  minScore: 0,
  passRate: 0
})

// 学生提交数据
const studentSubmissions = ref([])

// 计算属性
const examId = computed(() => route.params.id)

const filteredStudents = computed(() => {
  let result = studentSubmissions.value

  // 搜索筛选
  if (searchKeyword.value) {
    result = result.filter(student =>
      student.studentName.includes(searchKeyword.value) ||
      student.studentId.includes(searchKeyword.value)
    )
  }

  // 批改状态筛选
  if (filterStatus.value) {
    result = result.filter(student => student.gradingStatus === filterStatus.value)
  }

  // 成绩区间筛选
  if (filterScore.value) {
    result = result.filter(student => {
      const percentage = (student.currentScore / student.totalScore) * 100
      switch (filterScore.value) {
        case 'excellent': return percentage >= 90
        case 'good': return percentage >= 80 && percentage < 90
        case 'average': return percentage >= 70 && percentage < 80
        case 'pass': return percentage >= 60 && percentage < 70
        case 'fail': return percentage < 60
        default: return true
      }
    })
  }

  return result
})

// 方法
const initExamData = () => {
  // 模拟考试基本信息
  examInfo.value = {
    id: examId.value,
    title: 'Python程序设计期中考试',
    totalScore: 100,
    duration: 120
  }

  // 模拟考试统计
  examStats.value = {
    totalSubmissions: 85,
    averageScore: 76.5,
    maxScore: 95,
    minScore: 42,
    passRate: 78.8
  }

  // 模拟学生提交数据
  studentSubmissions.value = [
    {
      id: 'sub_001',
      studentName: '张三',
      studentId: '2021001',
      answeredQuestions: 8,
      totalQuestions: 10,
      duration: 85,
      currentScore: 75,
      totalScore: 100,
      gradingStatus: 'graded',
      submitTime: '2024-01-15T10:30:00Z',
      answers: [
        { id: 'q1', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q2', type: 'multiple', score: 15, studentScore: 12, status: 'graded' },
        { id: 'q3', type: 'fill', score: 10, studentScore: 8, status: 'graded' },
        { id: 'q4', type: 'essay', score: 25, studentScore: 20, status: 'graded' },
        { id: 'q5', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q6', type: 'fill', score: 10, studentScore: 7, status: 'graded' },
        { id: 'q7', type: 'essay', score: 20, studentScore: 8, status: 'graded' }
      ]
    },
    {
      id: 'sub_002',
      studentName: '李四',
      studentId: '2021002',
      answeredQuestions: 10,
      totalQuestions: 10,
      duration: 95,
      currentScore: 88,
      totalScore: 100,
      gradingStatus: 'graded',
      submitTime: '2024-01-15T10:45:00Z',
      answers: [
        { id: 'q1', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q2', type: 'multiple', score: 15, studentScore: 15, status: 'graded' },
        { id: 'q3', type: 'fill', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q4', type: 'essay', score: 25, studentScore: 23, status: 'graded' },
        { id: 'q5', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q6', type: 'fill', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q7', type: 'essay', score: 20, studentScore: 10, status: 'graded' }
      ]
    },
    {
      id: 'sub_003',
      studentName: '王五',
      studentId: '2021003',
      answeredQuestions: 7,
      totalQuestions: 10,
      duration: 75,
      currentScore: 0,
      totalScore: 100,
      gradingStatus: 'ungraded',
      submitTime: '2024-01-15T11:00:00Z',
      answers: [
        { id: 'q1', type: 'single', score: 10, studentScore: 0, status: 'ungraded' },
        { id: 'q2', type: 'multiple', score: 15, studentScore: 0, status: 'ungraded' },
        { id: 'q3', type: 'fill', score: 10, studentScore: 0, status: 'ungraded' },
        { id: 'q4', type: 'essay', score: 25, studentScore: 0, status: 'ungraded' },
        { id: 'q5', type: 'single', score: 10, studentScore: 0, status: 'ungraded' },
        { id: 'q6', type: 'fill', score: 10, studentScore: 0, status: 'ungraded' },
        { id: 'q7', type: 'essay', score: 20, studentScore: 0, status: 'ungraded' }
      ]
    },
    {
      id: 'sub_004',
      studentName: '赵六',
      studentId: '2021004',
      answeredQuestions: 9,
      totalQuestions: 10,
      duration: 88,
      currentScore: 65,
      totalScore: 100,
      gradingStatus: 'partial',
      submitTime: '2024-01-15T11:15:00Z',
      answers: [
        { id: 'q1', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q2', type: 'multiple', score: 15, studentScore: 12, status: 'graded' },
        { id: 'q3', type: 'fill', score: 10, studentScore: 8, status: 'graded' },
        { id: 'q4', type: 'essay', score: 25, studentScore: 0, status: 'ungraded' },
        { id: 'q5', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q6', type: 'fill', score: 10, studentScore: 0, status: 'ungraded' },
        { id: 'q7', type: 'essay', score: 20, studentScore: 25, status: 'graded' }
      ]
    },
    {
      id: 'sub_005',
      studentName: '钱七',
      studentId: '2021005',
      answeredQuestions: 10,
      totalQuestions: 10,
      duration: 105,
      currentScore: 92,
      totalScore: 100,
      gradingStatus: 'graded',
      submitTime: '2024-01-15T11:30:00Z',
      answers: [
        { id: 'q1', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q2', type: 'multiple', score: 15, studentScore: 15, status: 'graded' },
        { id: 'q3', type: 'fill', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q4', type: 'essay', score: 25, studentScore: 24, status: 'graded' },
        { id: 'q5', type: 'single', score: 10, studentScore: 10, status: 'graded' },
        { id: 'q6', type: 'fill', score: 10, studentScore: 9, status: 'graded' },
        { id: 'q7', type: 'essay', score: 20, studentScore: 14, status: 'graded' }
      ]
    }
  ]
}

const goBack = () => {
  router.push('/exam/list')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterScore.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
}

const handleGradeStudent = (student) => {
  router.push(`/exam/grade/${examId.value}/student/${student.id}`)
}

const handleViewAnswer = (student) => {
  router.push(`/exam/grade/${examId.value}/paper/${student.id}`)
}

const handleQuickGrade = (student) => {
  currentStudent.value = student
  quickGradeDialogVisible.value = true
}

const handleBatchGrade = () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请先选择要批改的学生')
    return
  }
  batchGradeDialogVisible.value = true
}

const handleGradeAll = () => {
  ElMessageBox.confirm(
    '确定要对所有提交的学生进行一键批改吗？这将自动批改客观题，主观题需要手动批改。',
    '一键批改确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      // 模拟批改过程
      studentSubmissions.value.forEach(student => {
        if (student.gradingStatus === 'ungraded' || student.gradingStatus === 'partial') {
          // 自动批改客观题
          student.answers.forEach(answer => {
            if (answer.type !== 'essay' && answer.status === 'ungraded') {
              answer.studentScore = Math.floor(Math.random() * answer.score * 0.8) + answer.score * 0.2
              answer.status = 'graded'
            }
          })

          // 更新总分
          student.currentScore = student.answers.reduce((sum, answer) => sum + answer.studentScore, 0)
          student.gradingStatus = 'graded'
        }
      })

      loading.value = false
      ElMessage.success('一键批改完成，客观题已自动批改')
    }, 2000)
  })
}

const confirmBatchGrade = () => {
  batchGrading.value = true

  setTimeout(() => {
    selectedStudents.value.forEach(student => {
      // 模拟批量批改逻辑
      student.answers.forEach(answer => {
        if (answer.status === 'ungraded') {
          if (batchGradeSettings.value.mode === 'objective' && answer.type !== 'essay') {
            // 仅批改客观题
            answer.studentScore = Math.floor(Math.random() * answer.score * 0.8) + answer.score * 0.2
            answer.status = 'graded'
          } else if (batchGradeSettings.value.mode === 'all') {
            // 批改所有题目
            answer.studentScore = batchGradeSettings.value.defaultScore
            answer.status = 'graded'
          } else if (batchGradeSettings.value.mode === 'smart') {
            // 智能批改
            if (answer.type !== 'essay') {
              answer.studentScore = Math.floor(Math.random() * answer.score * 0.9) + answer.score * 0.1
            } else {
              answer.studentScore = batchGradeSettings.value.defaultScore
            }
            answer.status = 'graded'
          }
        }
      })

      // 更新学生状态
      student.currentScore = student.answers.reduce((sum, answer) => sum + answer.studentScore, 0)
      student.gradingStatus = 'graded'
    })

    batchGrading.value = false
    batchGradeDialogVisible.value = false
    selectedStudents.value = []
    ElMessage.success(`成功批改 ${selectedStudents.value.length} 名学生的答卷`)
  }, 1500)
}

const applyUniformScore = () => {
  if (currentStudent.value) {
    currentStudent.value.answers.forEach(answer => {
      if (answer.status === 'ungraded') {
        answer.studentScore = quickGradeSettings.value.uniformScore
        answer.status = 'graded'
      }
    })

    // 更新总分
    currentStudent.value.currentScore = currentStudent.value.answers.reduce((sum, answer) => sum + answer.studentScore, 0)

    ElMessage.success('已应用统一分数')
  }
}

const saveQuickGrade = () => {
  if (currentStudent.value) {
    // 更新学生状态
    const hasUngraded = currentStudent.value.answers.some(answer => answer.status === 'ungraded')
    currentStudent.value.gradingStatus = hasUngraded ? 'partial' : 'graded'

    ElMessage.success('快速批改已保存')
    quickGradeDialogVisible.value = false
  }
}

const handleExportGrades = () => {
  ElMessage.info('导出成绩功能开发中...')
}

// 工具方法
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins}分钟`
  }
  return `${hours}小时${mins}分钟`
}

const getScoreColor = (score, totalScore) => {
  const percentage = (score / totalScore) * 100
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getCompletionTagType = (student) => {
  const percentage = (student.answeredQuestions / student.totalQuestions) * 100
  if (percentage === 100) return 'success'
  if (percentage >= 80) return 'warning'
  return 'danger'
}

const getGradingStatusLabel = (status) => {
  const map = {
    ungraded: '未批改',
    partial: '部分批改',
    graded: '已批改'
  }
  return map[status] || status
}

const getGradingStatusTagType = (status) => {
  const map = {
    ungraded: 'info',
    partial: 'warning',
    graded: 'success'
  }
  return map[status] || ''
}

const getQuestionTypeText = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答'
  }
  return map[type] || type
}

const getQuestionStatusText = (status) => {
  const map = {
    graded: '已批改',
    ungraded: '未批改'
  }
  return map[status] || status
}

const getQuestionCardClass = (question) => {
  if (question.status === 'graded') {
    return 'graded'
  }
  return 'ungraded'
}

const focusQuestion = (index) => {
  // 聚焦到特定题目
  ElMessage.info(`聚焦到第${index + 1}题`)
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/exam/grade/index.vue`)
  initExamData()
})
</script>

<style lang="scss" scoped>
.exam-grade-container {
  padding: 24px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.back-button {
  margin-bottom: 20px;
}

.exam-info-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.students-table {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  .table-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.batch-grade-content {
  .grade-settings {
    margin-top: 20px;

    h4 {
      margin-bottom: 16px;
      color: #303133;
    }

    .help-text {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.quick-grade-content {
  .student-info {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    h4 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .quick-stats {
      display: flex;
      gap: 20px;
      color: #606266;
      font-size: 14px;
    }
  }

  .questions-overview {
    margin-bottom: 20px;

    h4 {
      margin-bottom: 16px;
      color: #303133;
    }

    .question-card {
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 10px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      &.graded {
        border: 1px solid #67c23a;
        background-color: #f0f9ff;
      }

      &.ungraded {
        border: 1px solid #e4e7ed;
        background-color: #fff;
      }

      .question-number {
        font-weight: bold;
        color: #303133;
        margin-bottom: 4px;
      }

      .question-type {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .question-score {
        color: #409eff;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .question-status {
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .batch-score-setting {
    h4 {
      margin-bottom: 16px;
      color: #303133;
    }
  }
}
</style>