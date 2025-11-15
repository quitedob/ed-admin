<template>
  <el-dialog
    v-model="visible"
    :title="`题目详细分析 - 第${question?.questionNumber}题`"
    width="80%"
    top="5vh"
    @close="handleClose"
  >
    <div v-if="question" class="question-detail-content">
      <!-- 题目信息 -->
      <el-card class="question-info-card" shadow="never">
        <div class="question-header">
          <div class="question-meta">
            <el-tag :type="getTypeTagType(question.type)">
              {{ getTypeLabel(question.type) }}
            </el-tag>
            <span class="question-score">满分: {{ question.score }}分</span>
          </div>
        </div>
        <div class="question-text">{{ question.questionText }}</div>
      </el-card>

      <!-- 统计指标 -->
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">正确率</div>
            <div class="metric-value" :style="{ color: getCorrectRateColor(question.correctRate) }">
              {{ question.correctRate }}%
            </div>
            <el-progress
              :percentage="question.correctRate"
              :color="getCorrectRateColor(question.correctRate)"
              :show-text="false"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">平均分</div>
            <div class="metric-value">{{ question.averageScore.toFixed(1) }}</div>
            <div class="metric-sub">满分: {{ question.score }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">难度系数</div>
            <div class="metric-value">{{ question.difficultyIndex.toFixed(2) }}</div>
            <el-tag :type="getDifficultyTagType(question.difficultyIndex)" size="small">
              {{ getDifficultyLabel(question.difficultyIndex) }}
            </el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-label">区分度</div>
            <div class="metric-value">{{ question.discrimination.toFixed(2) }}</div>
            <div class="metric-sub">{{ getDiscriminationLabel(question.discrimination) }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 答案分布（选择题） -->
      <el-card v-if="['single', 'multiple'].includes(question.type)" class="answer-distribution-card" shadow="never">
        <template #header>
          <span>答案分布</span>
        </template>
        <div class="answer-options">
          <div
            v-for="option in answerDistribution"
            :key="option.value"
            class="answer-option-item"
          >
            <div class="option-header">
              <span class="option-label">选项 {{ option.value }}</span>
              <el-tag v-if="option.isCorrect" type="success" size="small">正确答案</el-tag>
              <span class="option-count">{{ option.count }}人选择</span>
            </div>
            <el-progress
              :percentage="option.percentage"
              :color="option.isCorrect ? '#67c23a' : '#909399'"
            >
              <span>{{ option.percentage }}%</span>
            </el-progress>
          </div>
        </div>
      </el-card>

      <!-- 常见错误 -->
      <el-card class="common-errors-card" shadow="never">
        <template #header>
          <span>常见错误分析</span>
        </template>
        <div class="error-list">
          <div
            v-for="(error, index) in question.commonErrors"
            :key="index"
            class="error-item"
          >
            <el-icon color="#f56c6c"><WarningFilled /></el-icon>
            <span>{{ error }}</span>
          </div>
        </div>
      </el-card>

      <!-- 学生答题详情 -->
      <el-card class="student-answers-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>学生答题详情</span>
            <el-input
              v-model="searchText"
              placeholder="搜索学生..."
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </template>

        <el-table :data="filteredStudentAnswers" stripe max-height="400">
          <el-table-column prop="studentName" label="姓名" width="120" />
          <el-table-column label="答案" min-width="200">
            <template #default="{ row }">
              <span class="student-answer">{{ formatStudentAnswer(row.answer) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isCorrect ? 'success' : 'danger'" size="small">
                {{ row.isCorrect ? '正确' : '错误' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="得分" width="100" align="center">
            <template #default="{ row }">
              <span class="score-text">{{ row.score }}/{{ question.score }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="答题时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.submitTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 教学建议 -->
      <el-card class="teaching-suggestions-card" shadow="never">
        <template #header>
          <span>教学建议</span>
        </template>
        <div class="suggestions-content">
          <el-alert
            v-for="(suggestion, index) in teachingSuggestions"
            :key="index"
            :type="suggestion.type"
            :closable="false"
            style="margin-bottom: 12px"
          >
            <template #title>
              <div class="suggestion-title">
                <el-icon><Lightbulb /></el-icon>
                <span>{{ suggestion.title }}</span>
              </div>
            </template>
            <div>{{ suggestion.content }}</div>
          </el-alert>
        </div>
      </el-card>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出分析报告</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, WarningFilled, Lightbulb } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: null
  },
  submissions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchText = ref('')

// 模拟答案分布数据
const answerDistribution = computed(() => {
  if (!props.question || !['single', 'multiple'].includes(props.question.type)) {
    return []
  }

  // 模拟数据
  return [
    { value: 'A', count: 5, percentage: 20, isCorrect: false },
    { value: 'B', count: 3, percentage: 12, isCorrect: false },
    { value: 'C', count: 15, percentage: 60, isCorrect: true },
    { value: 'D', count: 2, percentage: 8, isCorrect: false }
  ]
})

// 模拟学生答题数据
const studentAnswers = computed(() => {
  return [
    {
      studentName: '张三',
      answer: 'C',
      isCorrect: true,
      score: 2,
      submitTime: '2024-12-20T15:30:00Z'
    },
    {
      studentName: '李四',
      answer: 'A',
      isCorrect: false,
      score: 0,
      submitTime: '2024-12-20T16:00:00Z'
    },
    {
      studentName: '王五',
      answer: 'C',
      isCorrect: true,
      score: 2,
      submitTime: '2024-12-20T14:30:00Z'
    }
  ]
})

const filteredStudentAnswers = computed(() => {
  if (!searchText.value) return studentAnswers.value
  
  return studentAnswers.value.filter(s =>
    s.studentName.includes(searchText.value)
  )
})

// 教学建议
const teachingSuggestions = computed(() => {
  if (!props.question) return []

  const suggestions = []

  // 根据正确率给建议
  if (props.question.correctRate < 50) {
    suggestions.push({
      type: 'error',
      title: '正确率偏低',
      content: '该题正确率低于50%，建议重点讲解相关知识点，并安排针对性练习。'
    })
  } else if (props.question.correctRate < 70) {
    suggestions.push({
      type: 'warning',
      title: '需要加强',
      content: '该题正确率在50-70%之间，部分学生掌握不够扎实，建议课堂上再次强调重点。'
    })
  } else {
    suggestions.push({
      type: 'success',
      title: '掌握良好',
      content: '该题正确率较高，学生对该知识点掌握较好。'
    })
  }

  // 根据区分度给建议
  if (props.question.discrimination < 0.3) {
    suggestions.push({
      type: 'info',
      title: '区分度较低',
      content: '该题区分度较低，可能题目过于简单或过于困难，建议调整题目难度。'
    })
  } else if (props.question.discrimination > 0.4) {
    suggestions.push({
      type: 'success',
      title: '区分度良好',
      content: '该题能够有效区分不同水平的学生，是一道质量较高的题目。'
    })
  }

  return suggestions
})

// 方法
const handleClose = () => {
  visible.value = false
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const formatStudentAnswer = (answer) => {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  return answer
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题',
    programming: '编程题'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'info',
    programming: 'danger'
  }
  return map[type] || ''
}

const getCorrectRateColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getDifficultyLabel = (index) => {
  if (index >= 0.8) return '简单'
  if (index >= 0.5) return '中等'
  return '困难'
}

const getDifficultyTagType = (index) => {
  if (index >= 0.8) return 'success'
  if (index >= 0.5) return 'warning'
  return 'danger'
}

const getDiscriminationLabel = (value) => {
  if (value >= 0.4) return '优秀'
  if (value >= 0.3) return '良好'
  if (value >= 0.2) return '一般'
  return '较差'
}
</script>

<style lang="scss" scoped>
.question-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-info-card {
  .question-header {
    margin-bottom: 12px;

    .question-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .question-score {
        font-weight: 600;
        color: var(--color-primary);
      }
    }
  }

  .question-text {
    font-size: 15px;
    line-height: 1.8;
    color: var(--color-text-primary);
  }
}

.metrics-row {
  .metric-card {
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--color-border-light);
    text-align: center;

    .metric-label {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .metric-sub {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }
  }
}

.answer-distribution-card {
  .answer-options {
    .answer-option-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .option-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .option-label {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .option-count {
          margin-left: auto;
          font-size: 13px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
}

.common-errors-card {
  .error-list {
    .error-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      margin-bottom: 8px;
      background: #fef0f0;
      border-radius: 6px;
      color: var(--color-text-primary);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.student-answers-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .student-answer {
    font-family: 'Courier New', monospace;
    color: var(--color-text-primary);
  }

  .score-text {
    font-weight: 600;
    color: var(--color-primary);
  }
}

.teaching-suggestions-card {
  .suggestions-content {
    .suggestion-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }
}
</style>
