<template>
  <div class="homework-preview-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft" text size="large">返回</el-button>
      <h1 class="page-title">作业预览</h1>
      <div class="header-actions">
        <el-tag type="warning" size="large">预览模式</el-tag>
      </div>
    </div>

    <!-- 作业基本信息 -->
    <div class="homework-info-card">
      <div class="homework-header">
        <div class="homework-title-section">
          <h2 class="homework-title">{{ homeworkInfo.title }}</h2>
          <div class="homework-meta">
            <el-tag type="info" size="large">作业</el-tag>
            <span v-if="homeworkInfo.className" class="class-info">{{ homeworkInfo.className }}</span>
            <span v-if="homeworkInfo.courseName" class="course-info">{{ homeworkInfo.courseName }}</span>
          </div>
        </div>
        <div class="time-section">
          <div class="time-item" v-if="homeworkInfo.releaseTime">
            开始时间：{{ formatDateTime(homeworkInfo.releaseTime) }}
          </div>
          <div class="time-item" v-if="homeworkInfo.dueTime">
            截止时间：{{ formatDateTime(homeworkInfo.dueTime) }}
          </div>
        </div>
      </div>
      <div class="homework-description" v-if="homeworkInfo.description">
        <p>{{ homeworkInfo.description }}</p>
      </div>
    </div>

    <!-- 作业统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ homeworkInfo.questions?.length || 0 }}</div>
          <div class="stat-label">总题数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon single">
          <el-icon><Select /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getQuestionCountByType('single') }}</div>
          <div class="stat-label">单选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon multiple">
          <el-icon><Finished /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getQuestionCountByType('multiple') }}</div>
          <div class="stat-label">多选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon other">
          <el-icon><EditPen /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getOtherQuestionCount() }}</div>
          <div class="stat-label">其他题型</div>
        </div>
      </div>
    </div>

    <!-- 题目详情 -->
    <div class="questions-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>题目列表</h3>
            <div class="filter-buttons">
              <el-button-group>
                <el-button
                  :type="questionFilter === 'all' ? 'primary' : 'default'"
                  @click="questionFilter = 'all'"
                >全部题目 ({{ homeworkInfo.questions?.length || 0 }})</el-button>
                <el-button
                  :type="questionFilter === 'single' ? 'primary' : 'default'"
                  @click="questionFilter = 'single'"
                >单选题 ({{ getQuestionCountByType('single') }})</el-button>
                <el-button
                  :type="questionFilter === 'multiple' ? 'primary' : 'default'"
                  @click="questionFilter = 'multiple'"
                >多选题 ({{ getQuestionCountByType('multiple') }})</el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <div class="questions-list">
          <div
            v-for="(question, index) in filteredQuestions"
            :key="question.id"
            class="question-item"
          >
            <div class="question-header">
              <div class="question-number">
                题目 {{ index + 1 }}
                <el-tag :type="getTypeTagType(question.type)" size="small">
                  {{ getTypeLabel(question.type) }}
                </el-tag>
                <el-tag v-if="question.difficulty" :type="getDifficultyTagType(question.difficulty)" size="small">
                  {{ getDifficultyLabel(question.difficulty) }}
                </el-tag>
              </div>
            </div>
            <div class="question-content">
              <QuestionPreviewItem :question="question" :question-number="index + 1" />
            </div>
          </div>
        </div>

        <el-empty v-if="!filteredQuestions.length" description="暂无题目" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Document, Select, Finished, EditPen } from '@element-plus/icons-vue'
import QuestionPreviewItem from './components/QuestionPreviewItem.vue'
import { useMockStore } from '@/stores/mockStore'

const route = useRoute()
const router = useRouter()
const mockStore = useMockStore()

const homeworkId = computed(() => route.params.id)
const questionFilter = ref('all')

const homeworkInfo = ref({
  title: '',
  description: '',
  className: '',
  courseName: '',
  releaseTime: null,
  dueTime: null,
  questions: []
})


const filteredQuestions = computed(() => {
  if (!homeworkInfo.value.questions) return []
  if (questionFilter.value === 'all') {
    return homeworkInfo.value.questions
  }
  return homeworkInfo.value.questions.filter(q => q.type === questionFilter.value)
})

const getQuestionCountByType = (type) => {
  if (!homeworkInfo.value.questions) return 0
  return homeworkInfo.value.questions.filter(q => q.type === type).length
}

const getOtherQuestionCount = () => {
  if (!homeworkInfo.value.questions) return 0
  return homeworkInfo.value.questions.filter(q => 
    !['single', 'multiple'].includes(q.type)
  ).length
}

const goBack = () => {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回作业列表页
    router.push('/homework/list')
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getTypeLabel = (type) => {
  const labels = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    essay: '简答题',
    oj: '编程题',
    programming: '编程题'
  }
  return labels[type] || type
}

const getTypeTagType = (type) => {
  const types = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    essay: '',
    oj: 'danger',
    programming: 'danger'
  }
  return types[type] || ''
}

const getDifficultyLabel = (difficulty) => {
  const labels = { easy: '简单', medium: '中等', hard: '困难' }
  return labels[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const types = { easy: 'success', medium: 'warning', hard: 'danger' }
  return types[difficulty] || ''
}

const loadHomeworkPreview = () => {
  const id = homeworkId.value
  
  // 先从临时存储中查找
  const tempData = sessionStorage.getItem('temp_homework_preview')
  if (tempData) {
    try {
      const parsed = JSON.parse(tempData)
      if (parsed.id === id || !id) {
        homeworkInfo.value = parsed
        return
      }
    } catch (e) {
      console.error('解析临时数据失败', e)
    }
  }
  
  // 从mockStore中查找
  if (mockStore.homeworks) {
    const homework = mockStore.homeworks.find(h => h.id === id)
    if (homework) {
      homeworkInfo.value = homework
    }
  }
}

onMounted(() => {
  loadHomeworkPreview()
})
</script>

<style lang="scss" scoped>
.homework-preview-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    flex: 1;
  }
}

.homework-info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .homework-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 16px;

    .homework-title-section {
      flex: 1;
      
      .homework-title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
      }

      .homework-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .class-info, .course-info {
          font-size: 14px;
          color: #606266;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 4px;
        }
      }
    }

    .time-section {
      text-align: right;
      
      .time-item {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;
      }
    }
  }

  .homework-description {
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
    
    p {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;

      &.total { background: linear-gradient(135deg, #409eff, #66b1ff); }
      &.single { background: linear-gradient(135deg, #67c23a, #85ce61); }
      &.multiple { background: linear-gradient(135deg, #e6a23c, #ebb563); }
      &.other { background: linear-gradient(135deg, #909399, #a6a9ad); }
    }

    .stat-content {
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 1;
      }
      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

.questions-section {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .questions-list {
    .question-item {
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      background: white;

      .question-header {
        margin-bottom: 16px;
        
        .question-number {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}
</style>
