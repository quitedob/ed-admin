<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    top="5vh"
    @close="handleClose"
    class="grading-dialog"
  >
    <div v-if="currentAnswer" class="grading-content">
      <!-- 题目内容区（只读） -->
      <div class="question-section">
        <div class="section-header">
          <h3>题目内容</h3>
          <div class="question-meta">
            <el-tag :type="getTypeTagType(currentQuestion.type)">
              {{ getTypeLabel(currentQuestion.type) }}
            </el-tag>
            <span class="question-score">满分: {{ currentQuestion.score }}分</span>
          </div>
        </div>

        <div class="question-content">
          <div class="question-text">{{ currentQuestion.questionText }}</div>

          <!-- 单选题选项 -->
          <div v-if="currentQuestion.type === 'single'" class="options-display">
            <div
              v-for="option in currentQuestion.options"
              :key="option.value"
              :class="['option-item', { correct: option.value === currentQuestion.correctAnswer }]"
            >
              <span class="option-label">{{ option.value }}.</span>
              <span class="option-text">{{ option.text }}</span>
              <el-tag v-if="option.value === currentQuestion.correctAnswer" type="success" size="small">
                标准答案
              </el-tag>
            </div>
          </div>

          <!-- 多选题选项 -->
          <div v-if="currentQuestion.type === 'multiple'" class="options-display">
            <div
              v-for="option in currentQuestion.options"
              :key="option.value"
              :class="['option-item', { correct: option.isCorrect }]"
            >
              <span class="option-label">{{ option.value }}.</span>
              <span class="option-text">{{ option.text }}</span>
              <el-tag v-if="option.isCorrect" type="success" size="small">
                标准答案
              </el-tag>
            </div>
          </div>

          <!-- 填空题答案 -->
          <div v-if="currentQuestion.type === 'fill'" class="reference-answer">
            <div class="answer-label">参考答案：</div>
            <div v-for="(blank, index) in currentQuestion.fillBlanks" :key="index" class="blank-answer">
              <span class="blank-label">第{{ index + 1 }}空：</span>
              <el-tag
                v-for="answer in blank.answers"
                :key="answer"
                type="success"
                size="small"
                style="margin-right: 8px"
              >
                {{ answer }}
              </el-tag>
            </div>
          </div>

          <!-- 问答题参考答案 -->
          <div v-if="currentQuestion.type === 'essay'" class="reference-answer">
            <div class="answer-label">参考答案：</div>
            <div class="answer-content">{{ currentQuestion.referenceAnswer }}</div>
          </div>
        </div>
      </div>

      <!-- 学生答案区 -->
      <div class="student-answer-section">
        <div class="section-header">
          <h3>学生 {{ submission?.studentName }} 的答案</h3>
          <el-tag :type="currentAnswer.isCorrect ? 'success' : 'danger'">
            {{ currentAnswer.isCorrect ? '正确' : '错误' }}
          </el-tag>
        </div>

        <div class="student-answer-content">
          <!-- 单选题答案 -->
          <div v-if="currentQuestion.type === 'single'" class="options-display">
            <div
              v-for="option in currentQuestion.options"
              :key="option.value"
              :class="[
                'option-item',
                {
                  selected: option.value === currentAnswer.studentAnswer,
                  correct: option.value === currentQuestion.correctAnswer,
                  wrong: option.value === currentAnswer.studentAnswer && !currentAnswer.isCorrect
                }
              ]"
            >
              <el-radio
                :model-value="currentAnswer.studentAnswer"
                :label="option.value"
                disabled
              >
                {{ option.value }}. {{ option.text }}
              </el-radio>
              <el-icon v-if="option.value === currentAnswer.studentAnswer" class="student-choice-icon">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <!-- 多选题答案 -->
          <div v-if="currentQuestion.type === 'multiple'" class="options-display">
            <div
              v-for="option in currentQuestion.options"
              :key="option.value"
              :class="[
                'option-item',
                {
                  selected: isStudentSelected(option.value),
                  correct: option.isCorrect,
                  wrong: isStudentSelected(option.value) && !option.isCorrect
                }
              ]"
            >
              <el-checkbox
                :model-value="isStudentSelected(option.value)"
                :label="option.value"
                disabled
              >
                {{ option.value }}. {{ option.text }}
              </el-checkbox>
            </div>
          </div>

          <!-- 填空题答案 -->
          <div v-if="currentQuestion.type === 'fill'" class="fill-answer-display">
            <div v-for="(answer, index) in currentAnswer.studentAnswer" :key="index" class="fill-item">
              <span class="fill-label">第{{ index + 1 }}空：</span>
              <el-tag :type="isBlankCorrect(index) ? 'success' : 'danger'">
                {{ answer }}
              </el-tag>
            </div>
          </div>

          <!-- 问答题答案 -->
          <div v-if="currentQuestion.type === 'essay'" class="essay-answer-display">
            <div class="answer-text">{{ currentAnswer.studentAnswer }}</div>
          </div>

          <!-- 自动评分结果 -->
          <div v-if="['single', 'multiple', 'fill'].includes(currentQuestion.type)" class="auto-grade-result">
            <el-alert
              :type="currentAnswer.isCorrect ? 'success' : 'error'"
              :closable="false"
            >
              <template #title>
                系统自动评分: {{ currentAnswer.isCorrect ? '✓ 正确' : '✗ 错误' }}
                - {{ currentAnswer.score }}/{{ currentAnswer.maxScore }}分
              </template>
            </el-alert>
          </div>
        </div>
      </div>

      <!-- 批改操作区 -->
      <div class="grading-section">
        <div class="section-header">
          <h3>批改操作</h3>
        </div>

        <!-- AI批改结果（问答题） -->
        <div v-if="currentQuestion.type === 'essay' && currentAnswer.aiScore !== undefined" class="ai-grading-result">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>AI批改结果</span>
                <el-switch
                  v-model="aiGradingEnabled"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </div>
            </template>

            <div class="ai-result-content">
              <div class="result-item">
                <span class="result-label">AI评分：</span>
                <span class="result-value">{{ currentAnswer.aiScore }}/{{ currentAnswer.maxScore }}分</span>
              </div>
              <div class="result-item">
                <span class="result-label">AI评语：</span>
                <span class="result-value">{{ currentAnswer.aiComment }}</span>
              </div>
              <div class="ai-accuracy">
                <el-radio-group v-model="aiAccuracy">
                  <el-radio label="correct">
                    <el-icon color="#67c23a"><CircleCheck /></el-icon>
                    AI评分准确
                  </el-radio>
                  <el-radio label="incorrect">
                    <el-icon color="#f56c6c"><CircleClose /></el-icon>
                    AI评分有误
                  </el-radio>
                </el-radio-group>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 人工批改 -->
        <div class="manual-grading">
          <el-form :model="gradingForm" label-width="100px">
            <el-form-item label="确认分数">
              <div class="score-input-group">
                <el-input-number
                  v-model="gradingForm.score"
                  :min="0"
                  :max="currentQuestion.score"
                  :step="0.5"
                  :disabled="scoreLocked"
                />
                <span class="score-max">/ {{ currentQuestion.score }}分</span>
                <el-button
                  :type="scoreLocked ? 'primary' : 'default'"
                  @click="scoreLocked = !scoreLocked"
                >
                  {{ scoreLocked ? '解锁' : '锁定' }}
                </el-button>
                <el-button
                  v-if="currentAnswer.aiScore !== undefined"
                  type="info"
                  @click="useAIScore"
                >
                  使用AI评分
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="批改意见">
              <el-input
                v-model="gradingForm.comment"
                type="textarea"
                :rows="4"
                placeholder="请输入批改意见和建议..."
              />
            </el-form-item>

            <el-form-item label="评分标签">
              <el-checkbox-group v-model="gradingForm.tags">
                <el-checkbox label="优秀">优秀</el-checkbox>
                <el-checkbox label="良好">良好</el-checkbox>
                <el-checkbox label="需改进">需改进</el-checkbox>
                <el-checkbox label="概念清晰">概念清晰</el-checkbox>
                <el-checkbox label="逻辑严谨">逻辑严谨</el-checkbox>
                <el-checkbox label="表达欠佳">表达欠佳</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="navigation-buttons">
          <el-button @click="handlePrev" :disabled="isFirstQuestion">
            <el-icon><ArrowLeft /></el-icon>
            上一题
          </el-button>
          <span class="question-indicator">
            {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
          </span>
          <el-button @click="handleNext" :disabled="isLastQuestion">
            下一题
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="action-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave">保存评分</el-button>
          <el-button type="success" @click="handleSaveAndNext">保存并下一题</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  submission: {
    type: Object,
    default: null
  },
  questionIndex: {
    type: Number,
    default: 0
  },
  homework: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'next', 'prev'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const aiGradingEnabled = ref(true)
const aiAccuracy = ref('correct')
const scoreLocked = ref(false)
const gradingForm = ref({
  score: 0,
  comment: '',
  tags: []
})

// 计算属性
const currentQuestionIndex = computed(() => props.questionIndex)
const totalQuestions = computed(() => props.homework?.questions.length || 0)
const isFirstQuestion = computed(() => currentQuestionIndex.value === 0)
const isLastQuestion = computed(() => currentQuestionIndex.value === totalQuestions.value - 1)

const currentQuestion = computed(() => {
  if (!props.homework || currentQuestionIndex.value === null) return null
  return props.homework.questions[currentQuestionIndex.value]
})

const currentAnswer = computed(() => {
  if (!props.submission || !currentQuestion.value) return null
  return props.submission.answers.find(a => a.questionId === currentQuestion.value.id)
})

const dialogTitle = computed(() => {
  if (!props.submission || !currentQuestion.value) return '批改题目'
  return `批改 > ${props.homework?.title} > 题目${currentQuestionIndex.value + 1} > 学生${props.submission.studentName}`
})

// 监听答案变化，更新表单
watch(() => currentAnswer.value, (newAnswer) => {
  if (newAnswer) {
    gradingForm.value.score = newAnswer.manualScore !== undefined ? newAnswer.manualScore : newAnswer.score
    gradingForm.value.comment = newAnswer.manualComment || ''
    gradingForm.value.tags = []
    
    if (newAnswer.aiScore !== undefined) {
      aiAccuracy.value = 'correct'
    }
  }
}, { immediate: true })

// 方法
const isStudentSelected = (optionValue) => {
  if (!currentAnswer.value || !Array.isArray(currentAnswer.value.studentAnswer)) return false
  return currentAnswer.value.studentAnswer.includes(optionValue)
}

const isBlankCorrect = (index) => {
  if (!currentQuestion.value || !currentAnswer.value) return false
  const studentAnswer = currentAnswer.value.studentAnswer[index]
  const correctAnswers = currentQuestion.value.fillBlanks[index]?.answers || []
  return correctAnswers.includes(studentAnswer)
}

const useAIScore = () => {
  if (currentAnswer.value?.aiScore !== undefined) {
    gradingForm.value.score = currentAnswer.value.aiScore
    gradingForm.value.comment = currentAnswer.value.aiComment || ''
    ElMessage.success('已使用AI评分')
  }
}

const handlePrev = () => {
  emit('prev')
}

const handleNext = () => {
  emit('next')
}

const handleSave = () => {
  const gradeData = {
    submissionId: props.submission.id,
    questionId: currentQuestion.value.id,
    score: gradingForm.value.score,
    comment: gradingForm.value.comment,
    tags: gradingForm.value.tags,
    aiAccuracy: aiAccuracy.value
  }
  emit('save', gradeData)
  ElMessage.success('评分保存成功')
}

const handleSaveAndNext = () => {
  handleSave()
  if (!isLastQuestion.value) {
    setTimeout(() => {
      handleNext()
    }, 300)
  } else {
    ElMessage.info('已经是最后一题了')
  }
}

const handleClose = () => {
  visible.value = false
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
</script>

<style lang="scss" scoped>
.grading-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.grading-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.question-section,
.student-answer-section,
.grading-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--color-border-light);

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .question-score {
        font-size: 14px;
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  }
}

/* 题目内容区 */
.question-section {
  background: var(--color-bg-secondary);
  padding: 20px;
  border-radius: 12px;

  .question-content {
    .question-text {
      font-size: 15px;
      line-height: 1.8;
      color: var(--color-text-primary);
      margin-bottom: 16px;
    }

    .options-display {
      .option-item {
        padding: 12px;
        margin-bottom: 8px;
        background: white;
        border-radius: 8px;
        border: 1px solid var(--color-border-light);
        display: flex;
        align-items: center;
        gap: 8px;

        &.correct {
          background: #f0f9ff;
          border-color: #67c23a;
        }

        .option-label {
          font-weight: 600;
          color: var(--color-text-primary);
          min-width: 24px;
        }

        .option-text {
          flex: 1;
          color: var(--color-text-regular);
        }
      }
    }

    .reference-answer {
      padding: 16px;
      background: white;
      border-radius: 8px;

      .answer-label {
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 12px;
      }

      .answer-content {
        line-height: 1.8;
        color: var(--color-text-regular);
        white-space: pre-wrap;
      }

      .blank-answer {
        margin-bottom: 8px;

        .blank-label {
          font-weight: 500;
          margin-right: 8px;
        }
      }
    }
  }
}

/* 学生答案区 */
.student-answer-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid var(--color-primary-light-7);

  .student-answer-content {
    .options-display {
      .option-item {
        padding: 12px;
        margin-bottom: 8px;
        background: var(--color-bg-secondary);
        border-radius: 8px;
        border: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;

        &.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-light-9);
        }

        &.wrong {
          border-color: #f56c6c;
          background: #fef0f0;
        }

        &.correct {
          background: #f0f9ff;
        }

        .student-choice-icon {
          position: absolute;
          right: 12px;
          font-size: 20px;
          color: var(--color-primary);
        }
      }
    }

    .fill-answer-display,
    .essay-answer-display {
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;

      .fill-item {
        margin-bottom: 12px;

        .fill-label {
          font-weight: 500;
          margin-right: 8px;
        }
      }

      .answer-text {
        line-height: 1.8;
        color: var(--color-text-primary);
        white-space: pre-wrap;
      }
    }

    .auto-grade-result {
      margin-top: 16px;
    }
  }
}

/* 批改操作区 */
.grading-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid var(--color-success-light-7);

  .ai-grading-result {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ai-result-content {
      .result-item {
        margin-bottom: 12px;

        .result-label {
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-right: 8px;
        }

        .result-value {
          color: var(--color-text-primary);
        }
      }

      .ai-accuracy {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--color-border-lighter);
      }
    }
  }

  .manual-grading {
    .score-input-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .score-max {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border-light);

  .navigation-buttons {
    display: flex;
    align-items: center;
    gap: 12px;

    .question-indicator {
      font-size: 14px;
      color: var(--color-text-secondary);
      padding: 0 12px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}
</style>
