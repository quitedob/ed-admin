<template>
  <div class="exam-preview-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft" text size="large">返回</el-button>
      <h1 class="page-title">考试预览</h1>
      <div class="header-actions">
        <el-tag type="warning" size="large">预览模式</el-tag>
      </div>
    </div>

    <!-- 考试基本信息 -->
    <div class="exam-info-card">
      <div class="exam-header">
        <div class="exam-title-section">
          <h2 class="exam-title">{{ examInfo.title }}</h2>
          <div class="exam-meta">
            <el-tag :type="getTypeTagType(examInfo.type)" size="large">
              {{ getTypeLabel(examInfo.type) }}
            </el-tag>
            <span v-if="examInfo.className" class="class-info">{{ examInfo.className }}</span>
          </div>
        </div>
        <div class="score-section">
          <div class="score-display">
            <span class="score-value">{{ examInfo.totalScore || 0 }}</span>
            <span class="score-label">总分</span>
          </div>
          <div class="pass-score">
            及格分：{{ examInfo.passingScore || 60 }}分
          </div>
        </div>
      </div>
      <div class="exam-description" v-if="examInfo.description">
        <p>{{ examInfo.description }}</p>
      </div>
      <div class="exam-schedule">
        <div class="schedule-item" v-if="examInfo.startTime">
          <el-icon><Calendar /></el-icon>
          <span>开始时间：{{ formatDateTime(examInfo.startTime) }}</span>
        </div>
        <div class="schedule-item" v-if="examInfo.endTime">
          <el-icon><Calendar /></el-icon>
          <span>结束时间：{{ formatDateTime(examInfo.endTime) }}</span>
        </div>
        <div class="schedule-item" v-if="examInfo.duration">
          <el-icon><Clock /></el-icon>
          <span>考试时长：{{ examInfo.duration }}分钟</span>
        </div>
      </div>
    </div>

    <!-- 考试统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ examInfo.questionBanks?.length || 0 }}</div>
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
        <div class="stat-icon score">
          <el-icon><TrophyBase /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ examInfo.totalScore || 0 }}</div>
          <div class="stat-label">总分值</div>
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
                >全部题目 ({{ examInfo.questionBanks?.length || 0 }})</el-button>
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
                <el-tag :type="getQuestionTypeTagType(question.type)" size="small">
                  {{ getQuestionTypeLabel(question.type) }}
                </el-tag>
                <span class="question-score">{{ question.score || 0 }}分</span>
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
import { ArrowLeft, Document, Select, Finished, TrophyBase, Calendar, Clock } from '@element-plus/icons-vue'
import QuestionPreviewItem from '@/views/homework/preview/components/QuestionPreviewItem.vue'
import { useMockStore } from '@/stores/mockStore'

const route = useRoute()
const router = useRouter()
const mockStore = useMockStore()

const examId = computed(() => route.params.id)
const questionFilter = ref('all')

const examInfo = ref({
  title: '',
  description: '',
  type: 'quiz',
  className: '',
  startTime: null,
  endTime: null,
  duration: 90,
  totalScore: 0,
  passingScore: 60,
  questionBanks: []
})

const filteredQuestions = computed(() => {
  if (!examInfo.value.questionBanks) return []
  if (questionFilter.value === 'all') {
    return examInfo.value.questionBanks
  }
  return examInfo.value.questionBanks.filter(q => q.type === questionFilter.value)
})

const getQuestionCountByType = (type) => {
  if (!examInfo.value.questionBanks) return 0
  return examInfo.value.questionBanks.filter(q => q.type === type).length
}

const goBack = () => {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回考试列表页
    router.push('/exam/list')
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getTypeLabel = (type) => {
  const labels = { quiz: '测验', midterm: '期中考试', final: '期末考试', programming: '编程考试' }
  return labels[type] || '考试'
}

const getTypeTagType = (type) => {
  const types = { quiz: 'info', midterm: 'warning', final: 'danger', programming: 'success' }
  return types[type] || ''
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    single: '单选题', multiple: '多选题', fill: '填空题',
    judge: '判断题', essay: '简答题', oj: '编程题', programming: '编程题'
  }
  return labels[type] || type
}

const getQuestionTypeTagType = (type) => {
  const types = {
    single: 'primary', multiple: 'success', fill: 'warning',
    judge: 'info', essay: '', oj: 'danger', programming: 'danger'
  }
  return types[type] || ''
}

const loadExamPreview = () => {
  const id = examId.value
  
  // 先从临时存储中查找
  const tempData = sessionStorage.getItem('temp_exam_preview')
  if (tempData) {
    try {
      const parsed = JSON.parse(tempData)
      if (parsed.id === id || !id) {
        examInfo.value = parsed
        return
      }
    } catch (e) {
      console.error('解析临时数据失败', e)
    }
  }
  
  // 从mockStore中查找
  if (mockStore.exams) {
    const exam = mockStore.exams.find(e => e.id === id)
    if (exam) {
      examInfo.value = exam
    }
  }
}

onMounted(() => {
  loadExamPreview()
})
</script>

<style lang="scss" scoped>
.exam-preview-page {
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

.exam-info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .exam-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 16px;

    .exam-title-section {
      flex: 1;
      
      .exam-title {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px 0;
      }

      .exam-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .class-info {
          font-size: 14px;
          color: #606266;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 4px;
        }
      }
    }

    .score-section {
      text-align: center;
      
      .score-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .score-value {
          font-size: 36px;
          font-weight: 700;
          color: #409eff;
        }
        
        .score-label {
          font-size: 14px;
          color: #909399;
        }
      }
      
      .pass-score {
        font-size: 13px;
        color: #67c23a;
        margin-top: 8px;
      }
    }
  }

  .exam-description {
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
    margin-bottom: 16px;
    
    p {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 0;
    }
  }

  .exam-schedule {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    
    .schedule-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #606266;
      
      .el-icon {
        color: #409eff;
      }
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
      &.score { background: linear-gradient(135deg, #f56c6c, #f78989); }
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
          
          .question-score {
            margin-left: auto;
            color: #f56c6c;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
