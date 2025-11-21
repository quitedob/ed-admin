<template>
  <el-dialog
    id="question-preview-dialog"
    v-model="visible"
    title="题目预览"
    width="800px"
    top="5vh"
    @close="handleClose"
  >
    <div id="question-preview" class="question-preview">
      <!-- 题目头部信息 -->
      <div id="question-header" class="question-header">
        <div id="header-left" class="header-left">
          <el-tag id="type-tag" :type="getTypeTagType(questionData.type)" size="large">
            {{ getTypeLabel(questionData.type) }}
          </el-tag>
          <el-tag id="difficulty-tag" :type="getDifficultyTagType(questionData.difficulty)" size="large">
            {{ getDifficultyLabel(questionData.difficulty) }}
          </el-tag>
        </div>
        <div id="header-right" class="header-right">
          <el-tag
            v-for="(tag, tagIndex) in questionData.tags"
            :id="`tag-${tagIndex}`"
            :key="tag"
            size="small"
            style="margin-left: 8px"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 题目内容 -->
      <div id="question-content" class="question-content">
        <div id="question-number" class="question-number">题号: {{ questionData.questionNumber }}</div>
        <div id="question-text" class="question-text">{{ questionData.questionText || '(题目内容为空)' }}</div>
      </div>

      <!-- 单选题预览 -->
      <div v-if="questionData.type === 'single'" id="single-choice-preview" class="question-options">
        <el-radio-group id="single-choice-group" v-model="previewAnswer" disabled>
          <div
            v-for="(option, index) in questionData.singleChoice.options"
            :key="option.value"
            :id="`single-option-${index}`"
            class="option-item"
          >
            <el-radio :label="option.value">
              <span :id="`single-option-label-${index}`" class="option-label">{{ option.value }}.</span>
              <span :id="`single-option-text-${index}`" class="option-text">{{ option.text || '(选项内容为空)' }}</span>
            </el-radio>
            <el-tag
              v-if="option.value === questionData.singleChoice.correctAnswer"
              :id="`single-correct-tag-${index}`"
              type="success"
              size="small"
              style="margin-left: 12px"
            >
              正确答案
            </el-tag>
          </div>
        </el-radio-group>
      </div>

      <!-- 多选题预览 -->
      <div v-if="questionData.type === 'multiple'" id="multiple-choice-preview" class="question-options">
        <el-checkbox-group id="multiple-choice-group" v-model="previewAnswers" disabled>
          <div
            v-for="(option, index) in questionData.multipleChoice.options"
            :key="option.value"
            :id="`multiple-option-${index}`"
            class="option-item"
          >
            <el-checkbox :label="option.value">
              <span :id="`multiple-option-label-${index}`" class="option-label">{{ option.value }}.</span>
              <span :id="`multiple-option-text-${index}`" class="option-text">{{ option.text || '(选项内容为空)' }}</span>
            </el-checkbox>
            <el-tag
              v-if="option.isCorrect"
              :id="`multiple-correct-tag-${index}`"
              type="success"
              size="small"
              style="margin-left: 12px"
            >
              正确答案
            </el-tag>
          </div>
        </el-checkbox-group>
      </div>

      <!-- 填空题预览 -->
      <div v-if="questionData.type === 'fill'" id="fill-blanks-preview" class="fill-blanks">
        <div
          v-for="(blank, index) in questionData.fillBlanks.blanks"
          :key="blank.id"
          :id="`blank-item-${index}`"
          class="blank-item"
        >
          <div :id="`blank-label-${index}`" class="blank-label">第{{ index + 1 }}空:</div>
          <el-input :id="`blank-input-${index}`" placeholder="请输入答案" disabled />
          <div :id="`blank-answers-${index}`" class="blank-answers">
            <span style="color: #909399; margin-right: 8px">参考答案:</span>
            <el-tag
              v-for="(answer, aIndex) in blank.answers"
              :id="`blank-answer-${index}-${aIndex}`"
              :key="aIndex"
              type="success"
              size="small"
              style="margin-right: 4px"
            >
              {{ answer }}
            </el-tag>
          </div>
        </div>
        <div id="scoring-method" class="scoring-method">
          <el-icon><InfoFilled /></el-icon>
        </div>
      </div>

      <!-- 问答题预览 -->
      <div v-if="questionData.type === 'essay'" id="essay-preview" class="essay-answer">
        <el-input
          id="essay-textarea"
          type="textarea"
          :rows="6"
          placeholder="请输入你的答案..."
          disabled
        />
        <div v-if="questionData.essay.aiGrading" id="ai-grading-info" class="ai-grading-info">
          <el-icon><Cpu /></el-icon>
          <span>本题启用AI辅助评分</span>
        </div>
      </div>

      <!-- 编程题预览 -->
      <div v-if="questionData.type === 'programming'" id="programming-preview" class="programming-info">
        <el-descriptions id="programming-descriptions" :column="2" border>
          <el-descriptions-item id="hoj-id-item" label="HOJ题目ID">
            {{ questionData.programming.hojProblemId || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item id="problem-name-item" label="题目名称">
            {{ questionData.programming.problemName || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item id="time-limit-item" label="时间限制">
            {{ questionData.programming.timeLimit }}ms
          </el-descriptions-item>
          <el-descriptions-item id="memory-limit-item" label="内存限制">
            {{ questionData.programming.memoryLimit }}MB
          </el-descriptions-item>
          <el-descriptions-item id="required-item" label="必做">
            <el-tag :type="questionData.programming.required ? 'success' : 'info'" size="small">
              {{ questionData.programming.required ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item id="multiple-submit-item" label="多次提交">
            <el-tag :type="questionData.programming.multipleSubmit ? 'success' : 'info'" size="small">
              {{ questionData.programming.multipleSubmit ? '允许' : '不允许' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 题目解析 -->
      <div v-if="getExplanation()" id="question-explanation" class="question-explanation">
        <el-divider id="explanation-divider" content-position="left">
          <el-icon><Document /></el-icon>
          题目解析
        </el-divider>
        <div id="explanation-content" class="explanation-content">
          {{ getExplanation() }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button id="close-btn" type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { InfoFilled, Cpu, Document } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questionData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const previewAnswer = ref('')
const previewAnswers = ref([])

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

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || ''
}

const getExplanation = () => {
  const { type } = props.questionData
  if (type === 'single') return props.questionData.singleChoice.explanation
  if (type === 'multiple') return props.questionData.multipleChoice.explanation
  if (type === 'fill') return props.questionData.fillBlanks.explanation
  if (type === 'essay') return props.questionData.essay.explanation
  if (type === 'programming') return props.questionData.programming.explanation
  return ''
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.question-preview {
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .header-left {
      display: flex;
      gap: 8px;
    }
  }

  .question-content {
    margin-bottom: 24px;

    .question-number {
      font-size: 14px;
      color: #909399;
      margin-bottom: 12px;
    }

    .question-text {
      font-size: 16px;
      line-height: 1.8;
      color: #303133;
      white-space: pre-wrap;
    }
  }

  .question-options {
    margin-bottom: 24px;

    .option-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #fafafa;
      border-radius: 4px;
      display: flex;
      align-items: center;

      .option-label {
        font-weight: 600;
        margin-right: 8px;
      }

      .option-text {
        flex: 1;
      }
    }
  }

  .fill-blanks {
    margin-bottom: 24px;

    .blank-item {
      margin-bottom: 16px;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;

      .blank-label {
        font-weight: 600;
        margin-bottom: 8px;
      }

      .blank-answers {
        margin-top: 12px;
        display: flex;
        align-items: center;
      }
    }

    .scoring-method {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;
      margin-top: 12px;
    }
  }

  .essay-answer {
    margin-bottom: 24px;

    .ai-grading-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      color: #67c23a;
      font-size: 14px;
    }
  }

  .programming-info {
    margin-bottom: 24px;
  }

  .question-explanation {
    .explanation-content {
      padding: 16px;
      background: #f0f9ff;
      border-left: 4px solid #409eff;
      border-radius: 4px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }
}
</style>
