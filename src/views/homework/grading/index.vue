<template>
  <div class="homework-grading-page">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/homework/list' }">作业管理</el-breadcrumb-item>
        <el-breadcrumb-item>批改</el-breadcrumb-item>
        <el-breadcrumb-item>{{ homework?.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="header-actions">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="student">
            <el-icon><User /></el-icon>
            按学生
          </el-radio-button>
          <el-radio-button value="question">
            <el-icon><Document /></el-icon>
            按题目
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 按学生视图 -->
      <template v-if="viewMode === 'student'">
        <StudentGradingView
          :homework="homework"
          :submissions="submissions"
          @grade-question="handleGradeQuestion"
        />
      </template>

      <!-- 按题目视图 -->
      <template v-else>
        <QuestionGradingView
          :homework="homework"
          :submissions="submissions"
          @grade-question="handleGradeQuestion"
        />
      </template>
    </div>

    <!-- 单题批改对话框 -->
    <SingleQuestionGrading
      v-model="gradingDialogVisible"
      :submission="currentSubmission"
      :question="currentQuestion"
      :question-index="currentQuestionIndex"
      :homework="homework"
      @save="handleSaveGrade"
      @next="handleNextQuestion"
      @prev="handlePrevQuestion"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StudentGradingView from './components/StudentGradingView.vue'
import QuestionGradingView from './components/QuestionGradingView.vue'
import SingleQuestionGrading from './components/SingleQuestionGrading.vue'
import { useMockStore } from '@/stores/mockStore'

const route = useRoute()
const router = useRouter()
const mockStore = useMockStore()

// 响应式数据
const viewMode = ref('student')
const gradingDialogVisible = ref(false)
const currentSubmission = ref(null)
const currentQuestion = ref(null)
const currentQuestionIndex = ref(null)

const homeworkId = ref(route.query.id || 'hw_class_001_1')
const homework = ref(null)
const submissions = ref([])

// 方法
const handleGradeQuestion = ({ submission, question, questionIndex }) => {
  currentSubmission.value = submission
  currentQuestion.value = question
  currentQuestionIndex.value = questionIndex
  gradingDialogVisible.value = true
}

const handleSaveGrade = (gradeData) => {
  // 保存评分
  console.log('保存评分:', gradeData)
  ElMessage.success('评分保存成功')
  
  // 更新提交记录
  const submissionIndex = submissions.value.findIndex(s => s.id === currentSubmission.value.id)
  if (submissionIndex > -1) {
    const answerIndex = submissions.value[submissionIndex].answers.findIndex(
      a => a.questionId === currentQuestion.value.id
    )
    if (answerIndex > -1) {
      Object.assign(submissions.value[submissionIndex].answers[answerIndex], gradeData)
    }
  }
}

const handleNextQuestion = () => {
  if (currentQuestionIndex.value < homework.value.questions.length - 1) {
    currentQuestionIndex.value++
    currentQuestion.value = homework.value.questions[currentQuestionIndex.value]
  } else {
    ElMessage.info('已经是最后一题了')
  }
}

const handlePrevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    currentQuestion.value = homework.value.questions[currentQuestionIndex.value]
  } else {
    ElMessage.info('已经是第一题了')
  }
}

// 初始化数据
const initData = () => {
  mockStore.initialize()
  
  // 从 Mock Store 获取作业数据
  const homeworkData = mockStore.homeworks.find(hw => hw.id === homeworkId.value)
  if (homeworkData) {
    homework.value = homeworkData
  }

  // 从 Mock Store 获取提交记录
  const submissionData = mockStore.submissions.filter(sub => sub.homeworkId === homeworkId.value)
  submissions.value = submissionData
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.homework-grading-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
