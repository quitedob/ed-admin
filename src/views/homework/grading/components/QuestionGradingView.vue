<template>
  <div class="question-grading-view">
    <!-- 左侧：题目列表 -->
    <div class="left-sidebar">
      <div class="sidebar-header">
        <el-input
          v-model="searchText"
          placeholder="搜索题目..."
          clearable
          size="default"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select 
          v-model="typeFilter" 
          placeholder="题型筛选" 
          clearable
          size="default"
          style="width: 100%; margin-top: 12px"
        >
          <el-option label="全部题型" value="" />
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="填空题" value="fill" />
          <el-option label="问答题" value="essay" />
          <el-option label="编程题" value="programming" />
        </el-select>
      </div>

      <div class="question-list">
        <div
          v-for="(question, index) in filteredQuestions"
          :key="question.id"
          :class="['question-item', { active: selectedQuestionIndex === index }]"
          @click="selectQuestion(index)"
        >
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <el-tag :type="getTypeTagType(question.type)" size="small">
              {{ getTypeLabel(question.type) }}
            </el-tag>
            <el-icon :class="['status-icon', getQuestionStatusClass(question)]">
              <component :is="getQuestionStatusIcon(question)" />
            </el-icon>
          </div>
          <div class="question-stats">
            <div class="stat-item">
              <el-icon><CircleCheck /></el-icon>
              <span>{{ getCorrectCount(question.id) }}/{{ submissions.length }}</span>
            </div>
            <div class="stat-item">
              <span class="correct-rate">{{ getCorrectRate(question.id) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：题目答题情况 -->
    <div class="right-content">
      <div v-if="selectedQuestion" class="question-detail">
        <!-- 题目信息卡片 -->
        <div class="question-info-card">
          <div class="card-header">
            <h3>第{{ selectedQuestionIndex + 1 }}题: {{ selectedQuestion.questionText }}</h3>
          </div>

          <div class="question-meta">
            <el-tag :type="getTypeTagType(selectedQuestion.type)" size="large">
              {{ getTypeLabel(selectedQuestion.type) }}
            </el-tag>
            <span class="meta-item">答对率: {{ getCorrectRate(selectedQuestion.id) }}%</span>
            <span class="meta-item">
              已答: {{ getCorrectCount(selectedQuestion.id) }}/{{ submissions.length }}
            </span>
            <span class="meta-item meta-secondary">满分: {{ selectedQuestion.score }}分</span>
          </div>
        </div>

        <!-- 学生答题情况列表 -->
        <div class="student-answers-card">
          <div class="card-header">
            <h4>学生答题情况</h4>
          </div>

          <div class="student-answers-list">
            <div
              v-for="submission in submissions"
              :key="submission.id"
              class="student-answer-item"
              @click="handleGradeStudent(submission)"
            >
              <div class="student-info">
                <span class="student-name">{{ submission.studentName }}</span>
                <el-icon :class="['answer-status-icon', getAnswerStatusClass(getStudentAnswer(submission))]">
                  <component :is="getAnswerStatusIcon(getStudentAnswer(submission))" />
                </el-icon>
                <span class="answer-text">
                  {{ getStudentAnswerText(submission) }}
                </span>
                <span class="answer-score">
                  {{ getStudentAnswerScore(submission) }}/{{ selectedQuestion.score }}
                </span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <el-text type="info" size="small">
              点击学生查看详细答题记录
            </el-text>
          </div>
        </div>
      </div>

      <el-empty 
        v-else 
        description="请选择一个题目查看详情"
        :image-size="150"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, CircleCheck, CircleClose, Clock, QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  homework: {
    type: Object,
    required: true
  },
  submissions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['grade-question'])

// 响应式数据
const searchText = ref('')
const typeFilter = ref('')
const selectedQuestionIndex = ref(null)

// 计算属性
const filteredQuestions = computed(() => {
  let result = props.homework?.questions || []

  if (searchText.value) {
    result = result.filter(q => q.questionText.includes(searchText.value))
  }

  if (typeFilter.value) {
    result = result.filter(q => q.type === typeFilter.value)
  }

  return result
})

const selectedQuestion = computed(() => {
  if (selectedQuestionIndex.value === null) return null
  return props.homework?.questions[selectedQuestionIndex.value]
})

// 方法
const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

const handleGradeStudent = (submission) => {
  emit('grade-question', {
    submission,
    question: selectedQuestion.value,
    questionIndex: selectedQuestionIndex.value
  })
}

const getStudentAnswer = (submission) => {
  return submission.answers?.find(a => a.questionId === selectedQuestion.value.id)
}

const getStudentAnswerText = (submission) => {
  const answer = getStudentAnswer(submission)
  if (!answer) return '未作答'
  if (Array.isArray(answer.studentAnswer)) {
    return answer.studentAnswer.join(', ')
  }
  return String(answer.studentAnswer).substring(0, 30) + '...'
}

const getStudentAnswerScore = (submission) => {
  const answer = getStudentAnswer(submission)
  return answer?.score || 0
}

const getCorrectCount = (questionId) => {
  return props.submissions.filter(s => {
    const answer = s.answers?.find(a => a.questionId === questionId)
    return answer?.isCorrect
  }).length
}

const getCorrectRate = (questionId) => {
  if (props.submissions.length === 0) return 0
  return Math.round((getCorrectCount(questionId) / props.submissions.length) * 100)
}

const getQuestionStatusIcon = (question) => {
  const rate = getCorrectRate(question.id)
  if (rate >= 80) return CircleCheck
  if (rate >= 50) return Clock
  return CircleClose
}

const getQuestionStatusClass = (question) => {
  const rate = getCorrectRate(question.id)
  if (rate >= 80) return 'status-good'
  if (rate >= 50) return 'status-medium'
  return 'status-poor'
}

const getAnswerStatusIcon = (answer) => {
  if (!answer) return QuestionFilled
  if (answer.isCorrect) return CircleCheck
  if (answer.status === 'pending') return Clock
  return CircleClose
}

const getAnswerStatusClass = (answer) => {
  if (!answer) return 'status-unknown'
  if (answer.isCorrect) return 'status-correct'
  if (answer.status === 'pending') return 'status-pending'
  return 'status-incorrect'
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答',
    programming: '编程'
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

// 初始化：选中第一个题目
if (props.homework?.questions?.length > 0) {
  selectedQuestionIndex.value = 0
}
</script>

<style lang="scss" scoped>
.question-grading-view {
  display: flex;
  height: 100%;
  background: #f5f7fa;

  .left-sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;
    }

    .question-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;

      .question-item {
        padding: 12px;
        margin-bottom: 8px;
        background: #f9fafb;
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        &.active {
          background: #ecf5ff;
          border-color: #409eff;
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .question-number {
            font-weight: 600;
            color: #303133;
          }

          .status-icon {
            margin-left: auto;
            font-size: 16px;

            &.status-good {
              color: #67c23a;
            }

            &.status-medium {
              color: #e6a23c;
            }

            &.status-poor {
              color: #f56c6c;
            }
          }
        }

        .question-stats {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #606266;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .correct-rate {
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }

  .right-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;

    .question-detail {
      max-width: 1200px;
      margin: 0 auto;
    }

    .question-info-card,
    .student-answers-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .card-header {
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e4e7ed;

        h3, h4 {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }
      }

      .question-meta {
        display: flex;
        align-items: center;
        gap: 16px;

        .meta-item {
          font-size: 14px;
          color: #606266;
        }
      }
    }

    .student-answers-list {
      .student-answer-item {
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .student-name {
            font-weight: 600;
            color: #303133;
            min-width: 80px;
          }

          .answer-status-icon {
            font-size: 16px;

            &.status-correct {
              color: #67c23a;
            }

            &.status-incorrect {
              color: #f56c6c;
            }

            &.status-pending {
              color: #e6a23c;
            }

            &.status-unknown {
              color: #909399;
            }
          }

          .answer-text {
            flex: 1;
            font-size: 14px;
            color: #606266;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .answer-score {
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }

    .card-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e4e7ed;
      text-align: center;
    }
  }
}
</style>
