<template>
  <div class="answer-review-container">
    <!-- 学生信息头部 -->
    <div class="student-header">
      <el-card>
        <div class="student-info">
          <div class="info-left">
            <h3>{{ studentData.studentName }} ({{ studentData.studentId }})</h3>
            <div class="submission-info">
              <span>提交时间: {{ formatDateTime(studentData.submitTime) }}</span>
              <span>用时: {{ formatDuration(studentData.duration) }}</span>
              <span>答题进度: {{ studentData.answeredQuestions }}/{{ studentData.totalQuestions }}</span>
            </div>
          </div>
          <div class="info-right">
            <div class="score-display">
              <div class="current-score">
                <span class="score-label">当前得分</span>
                <span class="score-value" :style="{ color: getScoreColor(currentTotalScore, totalScore) }">
                  {{ currentTotalScore }}/{{ totalScore }}
                </span>
              </div>
              <div class="score-progress">
                <el-progress
                  :percentage="scorePercentage"
                  :color="getProgressColor(scorePercentage)"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 批改工具栏 -->
    <div class="grading-toolbar">
      <el-card>
        <div class="toolbar-content">
          <div class="toolbar-left">
            <el-button-group>
              <el-button
                :type="currentView === 'questions' ? 'primary' : 'default'"
                @click="currentView = 'questions'"
              >
                题目列表
              </el-button>
              <el-button
                :type="currentView === 'overview' ? 'primary' : 'default'"
                @click="currentView = 'overview'"
              >
                答卷概览
              </el-button>
              <el-button
                :type="currentView === 'statistics' ? 'primary' : 'default'"
                @click="currentView = 'statistics'"
              >
                答题统计
              </el-button>
            </el-button-group>
          </div>

          <div class="toolbar-right">
            <el-button @click="handleAutoGrade">
              <el-icon><MagicStick /></el-icon>
              自动批改
            </el-button>
            <el-button type="success" @click="handleSaveGrading">
              <el-icon><Check /></el-icon>
              保存批改
            </el-button>
            <el-button type="warning" @click="handleSubmitGrading">
              <el-icon><Upload /></el-icon>
              提交成绩
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 题目列表视图 -->
    <div v-if="currentView === 'questions'" class="questions-view">
      <div class="questions-container">
        <div
          v-for="(answer, index) in studentData.answers"
          :key="answer.id"
          class="question-item"
          :class="{ 'current-question': currentQuestionIndex === index }"
        >
          <el-card>
            <div class="question-header">
              <div class="question-number">
                第{{ index + 1 }}题
                <el-tag :type="getQuestionTypeTagType(answer.type)" size="small">
                  {{ getQuestionTypeText(answer.type) }}
                </el-tag>
                <el-tag type="info" size="small">
                  {{ answer.score }}分
                </el-tag>
              </div>
              <div class="question-actions">
                <el-button
                  v-if="answer.status !== 'graded'"
                  type="primary"
                  size="small"
                  @click="gradeQuestion(index)"
                >
                  批改
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  @click="regradeQuestion(index)"
                >
                  重新批改
                </el-button>
              </div>
            </div>

            <div class="question-content">
              <div class="question-text">
                <h4>{{ answer.questionText }}</h4>
              </div>

              <!-- 学生答案 -->
              <div class="student-answer">
                <h5>学生答案:</h5>
                <div class="answer-content">
                  <!-- 单选题/多选题 -->
                  <div v-if="answer.type === 'single' || answer.type === 'multiple'" class="choice-answer">
                    <div
                      v-for="option in answer.options"
                      :key="option.id"
                      class="option-item"
                      :class="{ 'selected': isOptionSelected(answer, option) }"
                    >
                      <span class="option-label">{{ option.value }}.</span>
                      <span class="option-text">{{ option.text }}</span>
                      <el-icon v-if="isOptionSelected(answer, option)" class="check-icon">
                        <Check />
                      </el-icon>
                    </div>
                  </div>

                  <!-- 填空题 -->
                  <div v-else-if="answer.type === 'fill'" class="fill-answer">
                    <div class="fill-content">{{ answer.studentAnswer || '未作答' }}</div>
                  </div>

                  <!-- 问答题 -->
                  <div v-else-if="answer.type === 'essay'" class="essay-answer">
                    <div class="essay-content">{{ answer.studentAnswer || '未作答' }}</div>
                  </div>
                </div>
              </div>

              <!-- 正确答案（仅批改后显示） -->
              <div v-if="answer.status === 'graded' && showCorrectAnswer" class="correct-answer">
                <h5>参考答案:</h5>
                <div class="answer-content correct">
                  <!-- 单选题/多选题 -->
                  <div v-if="answer.type === 'single' || answer.type === 'multiple'" class="choice-answer">
                    <div
                      v-for="option in answer.options"
                      :key="option.id"
                      class="option-item correct"
                    >
                      <span class="option-label">{{ option.value }}.</span>
                      <span class="option-text">{{ option.text }}</span>
                      <el-icon class="check-icon">
                        <Check />
                      </el-icon>
                    </div>
                  </div>

                  <!-- 填空题 -->
                  <div v-else-if="answer.type === 'fill'" class="fill-answer">
                    <div class="fill-content">{{ answer.correctAnswer }}</div>
                  </div>

                  <!-- 问答题 -->
                  <div v-else-if="answer.type === 'essay'" class="essay-answer">
                    <div class="essay-content">{{ answer.referenceAnswer }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 批改结果 -->
            <div v-if="answer.status === 'graded'" class="grading-result">
              <div class="score-row">
                <span class="score-label">得分:</span>
                <el-input-number
                  v-model="answer.studentScore"
                  :min="0"
                  :max="answer.score"
                  :step="1"
                  size="small"
                  @change="updateTotalScore"
                />
                <span class="score-total">/ {{ answer.score }}分</span>
              </div>

              <div class="feedback-row">
                <span class="feedback-label">评语:</span>
                <el-input
                  v-model="answer.feedback"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入批改评语..."
                  size="small"
                />
              </div>

              <div class="correctness-row">
                <span class="correctness-label">答题情况:</span>
                <el-tag :type="answer.isCorrect ? 'success' : 'danger'">
                  {{ answer.isCorrect ? '正确' : '错误' }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 答卷概览视图 -->
    <div v-if="currentView === 'overview'" class="overview-view">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card title="题目完成情况">
            <div class="completion-chart">
              <el-progress
                type="circle"
                :percentage="completionPercentage"
                :width="200"
                :color="getProgressColor(completionPercentage)"
              >
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                  <div class="percentage-label">完成率</div>
                </template>
              </el-progress>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card title="批改进度">
            <div class="grading-chart">
              <el-progress
                type="circle"
                :percentage="gradingPercentage"
                :width="200"
                :color="getProgressColor(gradingPercentage)"
              >
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                  <div class="percentage-label">批改进度</div>
                </template>
              </el-progress>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card title="题目详情" style="margin-top: 20px;">
        <el-table :data="studentData.answers" stripe>
          <el-table-column label="题号" width="80" align="center">
            <template #default="scope">
              第{{ scope.$index + 1 }}题
            </template>
          </el-table-column>
          <el-table-column prop="type" label="题型" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getQuestionTypeTagType(scope.row.type)" size="small">
                {{ getQuestionTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分值" width="80" align="center" />
          <el-table-column label="得分" width="100" align="center">
            <template #default="scope">
              <span v-if="scope.row.status === 'graded'">
                {{ scope.row.studentScore }}
              </span>
              <span v-else class="ungraded">未批改</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'graded' ? 'success' : 'info'" size="small">
                {{ scope.row.status === 'graded' ? '已批改' : '未批改' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="正确性" width="100" align="center">
            <template #default="scope">
              <span v-if="scope.row.status === 'graded'">
                <el-tag :type="scope.row.isCorrect ? 'success' : 'danger'" size="small">
                  {{ scope.row.isCorrect ? '正确' : '错误' }}
                </el-tag>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 统计视图 -->
    <div v-if="currentView === 'statistics'" class="statistics-view">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card title="题型分布">
            <div class="type-stats">
              <div
                v-for="(stat, type) in questionTypeStats"
                :key="type"
                class="type-stat-item"
              >
                <div class="stat-label">{{ getQuestionTypeText(type) }}</div>
                <div class="stat-bar">
                  <el-progress
                    :percentage="(stat.count / studentData.answers.length) * 100"
                    :color="getTypeColor(type)"
                    :show-text="false"
                  />
                </div>
                <div class="stat-count">{{ stat.count }}题</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card title="得分分布">
            <div class="score-distribution">
              <div class="distribution-item">
                <span class="dist-label">优秀 (90-100分)</span>
                <el-progress
                  :percentage="getDistributionPercentage(90, 100)"
                  color="#67c23a"
                  :show-text="false"
                />
                <span class="dist-count">{{ getDistributionCount(90, 100) }}题</span>
              </div>
              <div class="distribution-item">
                <span class="dist-label">良好 (80-89分)</span>
                <el-progress
                  :percentage="getDistributionPercentage(80, 90)"
                  color="#409eff"
                  :show-text="false"
                />
                <span class="dist-count">{{ getDistributionCount(80, 90) }}题</span>
              </div>
              <div class="distribution-item">
                <span class="dist-label">中等 (70-79分)</span>
                <el-progress
                  :percentage="getDistributionPercentage(70, 80)"
                  color="#e6a23c"
                  :show-text="false"
                />
                <span class="dist-count">{{ getDistributionCount(70, 80) }}题</span>
              </div>
              <div class="distribution-item">
                <span class="dist-label">及格 (60-69分)</span>
                <el-progress
                  :percentage="getDistributionPercentage(60, 70)"
                  color="#f56c6c"
                  :show-text="false"
                />
                <span class="dist-count">{{ getDistributionCount(60, 70) }}题</span>
              </div>
              <div class="distribution-item">
                <span class="dist-label">不及格 (0-59分)</span>
                <el-progress
                  :percentage="getDistributionPercentage(0, 60)"
                  color="#909399"
                  :show-text="false"
                />
                <span class="dist-count">{{ getDistributionCount(0, 60) }}题</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card title="批改效率">
            <div class="efficiency-stats">
              <div class="efficiency-item">
                <div class="eff-label">平均批改时间</div>
                <div class="eff-value">2.5分钟/题</div>
              </div>
              <div class="efficiency-item">
                <div class="eff-label">批改准确率</div>
                <div class="eff-value">95%</div>
              </div>
              <div class="efficiency-item">
                <div class="eff-label">预计剩余时间</div>
                <div class="eff-value">{{ estimatedRemainingTime }}分钟</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 批改对话框 -->
    <el-dialog
      v-model="gradingDialogVisible"
      title="批改题目"
      width="800px"
    >
      <div class="grading-dialog-content">
        <div class="grading-question">
          <h4>第{{ currentGradingQuestion + 1 }}题 ({{ getQuestionTypeText(currentGradingAnswer?.type) }})</h4>
          <div class="question-text">{{ currentGradingAnswer?.questionText }}</div>
        </div>

        <div class="grading-form">
          <el-form :model="gradingForm" label-width="100px">
            <el-form-item label="题目分值">
              <span>{{ currentGradingAnswer?.score }}分</span>
            </el-form-item>

            <el-form-item label="学生答案">
              <div class="student-answer-dialog">
                <div v-if="currentGradingAnswer?.type === 'essay'" class="essay-content">
                  {{ currentGradingAnswer?.studentAnswer }}
                </div>
                <div v-else>
                  {{ currentGradingAnswer?.studentAnswer }}
                </div>
              </div>
            </el-form-item>

            <el-form-item label="参考答案" v-if="currentGradingAnswer">
              <div class="correct-answer-dialog">
                <div v-if="currentGradingAnswer.type === 'essay'" class="essay-content">
                  {{ currentGradingAnswer?.referenceAnswer }}
                </div>
                <div v-else>
                  {{ currentGradingAnswer?.correctAnswer }}
                </div>
              </div>
            </el-form-item>

            <el-form-item label="得分">
              <el-slider
                v-model="gradingForm.score"
                :min="0"
                :max="currentGradingAnswer?.score || 0"
                :step="1"
                show-input
              />
            </el-form-item>

            <el-form-item label="正确性">
              <el-radio-group v-model="gradingForm.isCorrect">
                <el-radio :label="true">正确</el-radio>
                <el-radio :label="false">错误</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="批改评语">
              <el-input
                v-model="gradingForm.feedback"
                type="textarea"
                :rows="4"
                placeholder="请输入批改评语..."
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="gradingDialogVisible = false">取消</el-button>
        <el-button @click="prevQuestion" :disabled="currentGradingQuestion === 0">上一题</el-button>
        <el-button
          @click="nextQuestion"
          :disabled="currentGradingQuestion === studentData.answers.length - 1"
        >
          下一题
        </el-button>
        <el-button type="primary" @click="saveGradingResult">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  MagicStick,
  Upload
} from '@element-plus/icons-vue'

const props = defineProps({
  studentData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'submit'])

// 响应式数据
const currentView = ref('questions')
const currentQuestionIndex = ref(0)
const showCorrectAnswer = ref(true)
const gradingDialogVisible = ref(false)
const currentGradingQuestion = ref(0)
const currentGradingAnswer = ref(null)

const gradingForm = ref({
  score: 0,
  isCorrect: false,
  feedback: ''
})

// 计算属性
const totalScore = computed(() => {
  return props.studentData.answers.reduce((sum, answer) => sum + answer.score, 0)
})

const currentTotalScore = computed(() => {
  return props.studentData.answers.reduce((sum, answer) => sum + answer.studentScore, 0)
})

const scorePercentage = computed(() => {
  return totalScore.value > 0 ? (currentTotalScore.value / totalScore.value) * 100 : 0
})

const completionPercentage = computed(() => {
  return (props.studentData.answeredQuestions / props.studentData.totalQuestions) * 100
})

const gradingPercentage = computed(() => {
  const gradedCount = props.studentData.answers.filter(answer => answer.status === 'graded').length
  return (gradedCount / props.studentData.answers.length) * 100
})

const questionTypeStats = computed(() => {
  const stats = {}
  props.studentData.answers.forEach(answer => {
    stats[answer.type] = (stats[answer.type] || 0) + 1
  })
  return stats
})

const estimatedRemainingTime = computed(() => {
  const ungradedCount = props.studentData.answers.filter(answer => answer.status === 'ungraded').length
  return ungradedCount * 2.5
})

// 方法
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

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  if (percentage >= 60) return '#f56c6c'
  return '#909399'
}

const getQuestionTypeText = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return map[type] || type
}

const getQuestionTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'danger'
  }
  return map[type] || 'info'
}

const isOptionSelected = (answer, option) => {
  if (answer.type === 'single') {
    return answer.studentAnswer === option.value
  } else if (answer.type === 'multiple') {
    return answer.studentAnswer && answer.studentAnswer.includes(option.value)
  }
  return false
}

const gradeQuestion = (index) => {
  currentGradingQuestion.value = index
  currentGradingAnswer.value = props.studentData.answers[index]

  // 初始化表单
  gradingForm.value = {
    score: currentGradingAnswer.value.studentScore || 0,
    isCorrect: currentGradingAnswer.value.isCorrect || false,
    feedback: currentGradingAnswer.value.feedback || ''
  }

  gradingDialogVisible.value = true
}

const regradeQuestion = (index) => {
  gradeQuestion(index)
}

const prevQuestion = () => {
  if (currentGradingQuestion.value > 0) {
    saveCurrentGrading()
    currentGradingQuestion.value--
    currentGradingAnswer.value = props.studentData.answers[currentGradingQuestion.value]

    // 重新初始化表单
    gradingForm.value = {
      score: currentGradingAnswer.value.studentScore || 0,
      isCorrect: currentGradingAnswer.value.isCorrect || false,
      feedback: currentGradingAnswer.value.feedback || ''
    }
  }
}

const nextQuestion = () => {
  if (currentGradingQuestion.value < props.studentData.answers.length - 1) {
    saveCurrentGrading()
    currentGradingQuestion.value++
    currentGradingAnswer.value = props.studentData.answers[currentGradingQuestion.value]

    // 重新初始化表单
    gradingForm.value = {
      score: currentGradingAnswer.value.studentScore || 0,
      isCorrect: currentGradingAnswer.value.isCorrect || false,
      feedback: currentGradingAnswer.value.feedback || ''
    }
  }
}

const saveCurrentGrading = () => {
  if (currentGradingAnswer.value) {
    currentGradingAnswer.value.studentScore = gradingForm.value.score
    currentGradingAnswer.value.isCorrect = gradingForm.value.isCorrect
    currentGradingAnswer.value.feedback = gradingForm.value.feedback
    currentGradingAnswer.value.status = 'graded'
  }
}

const saveGradingResult = () => {
  saveCurrentGrading()
  gradingDialogVisible.value = false
  ElMessage.success('批改结果已保存')
}

const updateTotalScore = () => {
  // 更新总分逻辑在计算属性中处理
}

const handleAutoGrade = () => {
  ElMessageBox.confirm(
    '确定要进行自动批改吗？这将自动批改客观题，主观题仍需手动批改。',
    '自动批改确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟自动批改
    props.studentData.answers.forEach(answer => {
      if (answer.type !== 'essay' && answer.status !== 'graded') {
        // 模拟自动批改逻辑
        answer.studentScore = Math.floor(Math.random() * answer.score * 0.8) + answer.score * 0.2
        answer.isCorrect = Math.random() > 0.3
        answer.status = 'graded'
        answer.feedback = answer.isCorrect ? '自动批改：答案正确' : '自动批改：答案有误'
      }
    })

    ElMessage.success('自动批改完成')
  })
}

const handleSaveGrading = () => {
  emit('save', props.studentData)
  ElMessage.success('批改进度已保存')
}

const handleSubmitGrading = () => {
  const hasUngraded = props.studentData.answers.some(answer => answer.status !== 'graded')

  if (hasUngraded) {
    ElMessageBox.confirm(
      '还有题目未批改，确定要提交成绩吗？未批改的题目将得0分。',
      '提交确认',
      {
        confirmButtonText: '确定提交',
        cancelButtonText: '继续批改',
        type: 'warning'
      }
    ).then(() => {
      // 将未批改的题目设为0分
      props.studentData.answers.forEach(answer => {
        if (answer.status !== 'graded') {
          answer.studentScore = 0
          answer.isCorrect = false
          answer.status = 'graded'
          answer.feedback = '未批改，得0分'
        }
      })

      emit('submit', props.studentData)
      ElMessage.success('成绩已提交')
    })
  } else {
    emit('submit', props.studentData)
    ElMessage.success('成绩已提交')
  }
}

const getTypeColor = (type) => {
  const map = {
    single: '#409eff',
    multiple: '#67c23a',
    fill: '#e6a23c',
    essay: '#f56c6c'
  }
  return map[type] || '#909399'
}

const getDistributionPercentage = (min, max) => {
  if (totalScore.value === 0) return 0

  const count = getDistributionCount(min, max)
  return (count / props.studentData.answers.length) * 100
}

const getDistributionCount = (min, max) => {
  return props.studentData.answers.filter(answer => {
    const percentage = (answer.studentScore / answer.score) * 100
    return percentage >= min && percentage < max
  }).length
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/exam/grade/components/AnswerReview.vue`)
})
</script>

<style lang="scss" scoped>
.answer-review-container {
  padding: 20px;
  background: var(--color-bg-primary);
}

.student-header {
  margin-bottom: 20px;

  .student-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-left {
      h3 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      .submission-info {
        display: flex;
        gap: 20px;
        color: #606266;
        font-size: 14px;
      }
    }

    .info-right {
      .score-display {
        text-align: right;

        .current-score {
          margin-bottom: 8px;

          .score-label {
            display: block;
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }

          .score-value {
            font-size: 24px;
            font-weight: bold;
          }
        }

        .score-progress {
          width: 200px;
          margin-left: auto;
        }
      }
    }
  }
}

.grading-toolbar {
  margin-bottom: 20px;

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }
}

.questions-view {
  .questions-container {
    .question-item {
      margin-bottom: 20px;
      border: 2px solid transparent;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: #e6a23c;
      }

      &.current-question {
        border-color: #409eff;
        box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .question-number {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          color: #303133;
        }

        .question-actions {
          display: flex;
          gap: 8px;
        }
      }

      .question-content {
        .question-text {
          margin-bottom: 16px;

          h4 {
            margin: 0;
            color: #303133;
            line-height: 1.6;
          }
        }

        .student-answer,
        .correct-answer {
          margin-bottom: 16px;

          h5 {
            margin: 0 0 8px 0;
            color: #606266;
            font-size: 14px;
          }

          .answer-content {
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            line-height: 1.6;

            &.correct {
              background-color: #f0f9ff;
              border: 1px solid #409eff;
            }
          }

          .choice-answer {
            .option-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              margin-bottom: 4px;
              border-radius: 4px;
              background-color: #f8f9fa;

              &.selected {
                background-color: #e6f7ff;
                border: 1px solid #409eff;
              }

              &.correct {
                background-color: #f0f9ff;
                border: 1px solid #409eff;
              }

              .option-label {
                font-weight: bold;
                margin-right: 8px;
                color: #606266;
              }

              .option-text {
                flex: 1;
                color: #303133;
              }

              .check-icon {
                color: #67c23a;
                margin-left: 8px;
              }
            }
          }

          .fill-answer,
          .essay-answer {
            .fill-content,
            .essay-content {
              color: #303133;
              white-space: pre-wrap;
            }
          }
        }
      }

      .grading-result {
        border-top: 1px solid #e4e7ed;
        padding-top: 16px;

        .score-row,
        .feedback-row,
        .correctness-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .score-label,
          .feedback-label,
          .correctness-label {
            min-width: 80px;
            font-weight: 500;
            color: #606266;
            margin-right: 12px;
          }

          .score-total {
            margin-left: 8px;
            color: #909399;
          }
        }

        .feedback-row {
          align-items: flex-start;

          .el-textarea {
            flex: 1;
          }
        }
      }
    }
  }
}

.overview-view {
  .completion-chart,
  .grading-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;

    .percentage-value {
      font-size: 24px;
      font-weight: bold;
      color: #409eff;
    }

    .percentage-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.statistics-view {
  .type-stats {
    .type-stat-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .stat-label {
        min-width: 80px;
        font-size: 14px;
        color: #606266;
      }

      .stat-bar {
        flex: 1;
        margin: 0 12px;
      }

      .stat-count {
        min-width: 50px;
        text-align: right;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .score-distribution {
    .distribution-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .dist-label {
        min-width: 120px;
        font-size: 14px;
        color: #606266;
      }

      .dist-bar {
        flex: 1;
        margin: 0 12px;
      }

      .dist-count {
        min-width: 50px;
        text-align: right;
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .efficiency-stats {
    .efficiency-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .eff-label {
        color: #606266;
        font-size: 14px;
      }

      .eff-value {
        font-weight: bold;
        color: #303133;
        font-size: 16px;
      }
    }
  }
}

.grading-dialog-content {
  .grading-question {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;

    h4 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .question-text {
      color: #606266;
      line-height: 1.6;
    }
  }

  .grading-form {
    .student-answer-dialog,
    .correct-answer-dialog {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;

      .essay-content {
        line-height: 1.6;
        color: #303133;
        white-space: pre-wrap;
      }
    }

    .correct-answer-dialog {
      background-color: #f0f9ff;
      border: 1px solid #409eff;
    }
  }
}
</style>