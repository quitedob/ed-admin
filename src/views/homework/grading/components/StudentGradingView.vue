<template>
  <div class="student-grading-view">
    <!-- 左侧：学生列表 -->
    <div class="left-sidebar">
      <div class="sidebar-header">
        <el-input
          v-model="searchText"
          placeholder="搜索学生..."
          clearable
          size="default"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select 
          v-model="statusFilter" 
          placeholder="状态筛选" 
          clearable
          size="default"
          style="width: 100%; margin-top: 12px"
        >
          <el-option label="全部状态" value="" />
          <el-option label="待批改" value="pending" />
          <el-option label="已批改" value="graded" />
          <el-option label="未提交" value="not_submitted" />
        </el-select>

        <div class="filter-stats">
          <el-tag type="warning" size="small">
            待批改: {{ pendingCount }}
          </el-tag>
        </div>
      </div>

      <div class="student-list">
        <div
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          :class="['student-item', { active: selectedSubmissionId === submission.id }]"
          @click="selectSubmission(submission.id)"
        >
          <div class="student-header">
            <el-icon :class="['status-icon', getStatusClass(submission.status)]">
              <component :is="getStatusIcon(submission.status)" />
            </el-icon>
            <span class="student-name">{{ submission.studentName }}</span>
          </div>
          <div class="student-completion">
            <span class="completion-text">{{ submission.answeredCount || 0 }}/{{ submission.totalQuestions || 0 }}</span>
            <el-progress
              :percentage="getCompletionPercentage(submission)"
              :color="getProgressColor(getCompletionPercentage(submission))"
              :show-text="false"
              style="margin-top: 4px"
            />
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredSubmissions.length"
          layout="prev, pager, next"
          small
        />
      </div>
    </div>

    <!-- 右侧：学生答题详情 -->
    <div class="right-content">
      <div v-if="selectedSubmission" class="submission-detail">
        <!-- 学生信息卡片 -->
        <div class="student-info-card">
          <div class="card-header">
            <h3>{{ homework?.title }} - 学生{{ selectedSubmission.studentName }}</h3>
            <el-tag :type="getStatusTagType(selectedSubmission.status)">
              {{ getStatusLabel(selectedSubmission.status) }}
            </el-tag>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">完成度</span>
              <span class="value">{{ selectedSubmission.answeredCount || 0 }}/{{ selectedSubmission.totalQuestions || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">完成进度</span>
              <div class="progress-wrapper">
                <el-progress
                  :percentage="getCompletionPercentage(selectedSubmission)"
                  :color="getProgressColor(getCompletionPercentage(selectedSubmission))"
                />
              </div>
            </div>
            <div class="info-item">
              <span class="label">提交时间</span>
              <span class="value">{{ formatDateTime(selectedSubmission.submitTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="question-list-card">
          <div class="card-header">
            <h4>题目列表</h4>
            <el-button type="primary" size="small" @click="handleBatchGrade">
              批量批改
            </el-button>
          </div>

          <div class="question-items">
            <div
              v-for="(answer, index) in selectedSubmission.answers"
              :key="answer.questionId"
              class="question-item"
              @click="handleGradeQuestion(index)"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}.</span>
                <el-tag :type="getTypeTagType(answer.type)" size="small">
                  {{ getTypeLabel(answer.type) }}
                </el-tag>
                <el-icon :class="['answer-status-icon', getAnswerStatusClass(answer)]">
                  <component :is="getAnswerStatusIcon(answer)" />
                </el-icon>
                <span class="answer-score">{{ answer.score || 0 }}/{{ answer.maxScore }}</span>
              </div>
              <div class="question-preview">
                {{ getQuestionText(answer.questionId) }}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <el-text type="info" size="small">
              点击题目进入批改
            </el-text>
          </div>
        </div>
      </div>

      <el-empty 
        v-else 
        description="请选择一个学生查看详情"
        :image-size="150"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, CircleCheck, CircleClose, Clock, QuestionFilled 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
const statusFilter = ref('')
const selectedSubmissionId = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const filteredSubmissions = computed(() => {
  let result = props.submissions

  if (searchText.value) {
    result = result.filter(s => s.studentName.includes(searchText.value))
  }

  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }

  return result
})

const selectedSubmission = computed(() => {
  return props.submissions.find(s => s.id === selectedSubmissionId.value)
})

const pendingCount = computed(() => {
  return props.submissions.filter(s => s.status === 'pending').length
})

// 方法
const selectSubmission = (id) => {
  selectedSubmissionId.value = id
}

const handleGradeQuestion = (questionIndex) => {
  const question = props.homework.questions[questionIndex]
  emit('grade-question', {
    submission: selectedSubmission.value,
    question,
    questionIndex
  })
}

const handleBatchGrade = () => {
  ElMessage.info('批量批改功能开发中...')
}

const getStatusIcon = (status) => {
  const map = {
    graded: CircleCheck,
    pending: Clock,
    not_submitted: CircleClose
  }
  return map[status] || QuestionFilled
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const getStatusLabel = (status) => {
  const map = {
    graded: '已批改',
    pending: '待批改',
    not_submitted: '未提交'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    graded: 'success',
    pending: 'warning',
    not_submitted: 'info'
  }
  return map[status] || ''
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

const getCompletionPercentage = (submission) => {
  if (!submission.totalQuestions) return 0
  return Math.round(((submission.answeredCount || 0) / submission.totalQuestions) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
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

const getQuestionText = (questionId) => {
  const question = props.homework?.questions.find(q => q.id === questionId)
  return question?.questionText || ''
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化：选中第一个学生
if (props.submissions.length > 0) {
  selectedSubmissionId.value = props.submissions[0].id
}
</script>

<style lang="scss" scoped>
.student-grading-view {
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

      .filter-stats {
        margin-top: 12px;
      }
    }

    .student-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;

      .student-item {
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

        .student-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .status-icon {
            font-size: 16px;

            &.status-graded {
              color: #67c23a;
            }

            &.status-pending {
              color: #e6a23c;
            }

            &.status-not_submitted {
              color: #909399;
            }
          }

          .student-name {
            font-weight: 600;
            color: #303133;
          }
        }

        .student-completion {
          .completion-text {
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid #e4e7ed;
      display: flex;
      justify-content: center;
    }
  }

  .right-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;

    .submission-detail {
      max-width: 1200px;
      margin: 0 auto;
    }

    .student-info-card,
    .question-list-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;

        .info-item {
          .label {
            display: block;
            font-size: 13px;
            color: #909399;
            margin-bottom: 8px;
          }

          .value {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          .progress-wrapper {
            margin-top: 8px;
          }
        }
      }
    }

    .question-items {
      .question-item {
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

        .question-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .question-number {
            font-weight: 600;
            color: #303133;
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

          .answer-score {
            margin-left: auto;
            font-weight: 600;
            color: #409eff;
          }
        }

        .question-preview {
          font-size: 14px;
          color: #606266;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
