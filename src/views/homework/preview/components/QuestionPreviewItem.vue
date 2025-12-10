<template>
  <div class="question-preview-item">
    <!-- 题目内容 -->
    <div class="question-text">
      <span class="question-content" v-html="formatContent(question.questionText || question.content)"></span>
    </div>

    <!-- 单选题选项 -->
    <div v-if="question.type === 'single'" class="options-section">
      <div
        v-for="option in question.options"
        :key="option.id || option.value"
        class="option-item"
        :class="{ 'correct-option': isCorrectAnswer(option.value) }"
      >
        <span class="option-label">{{ option.value }}.</span>
        <span class="option-text">{{ option.text }}</span>
        <el-icon v-if="isCorrectAnswer(option.value)" class="correct-icon"><Check /></el-icon>
      </div>
    </div>

    <!-- 多选题选项 -->
    <div v-else-if="question.type === 'multiple'" class="options-section">
      <div
        v-for="option in question.options"
        :key="option.id || option.value"
        class="option-item"
        :class="{ 'correct-option': isCorrectAnswerMultiple(option.value) }"
      >
        <span class="option-label">{{ option.value }}.</span>
        <span class="option-text">{{ option.text }}</span>
        <el-icon v-if="isCorrectAnswerMultiple(option.value)" class="correct-icon"><Check /></el-icon>
      </div>
    </div>

    <!-- 填空题 -->
    <div v-else-if="question.type === 'fill'" class="fill-section">
      <div class="fill-hint">填空题，请在空白处填写答案</div>
      <div v-if="question.correctAnswers" class="fill-answers">
        <div v-for="(answer, index) in question.correctAnswers" :key="index" class="fill-answer">
          <span class="fill-index">答案{{ index + 1 }}:</span>
          <span class="fill-value">{{ answer }}</span>
        </div>
      </div>
      <div v-else-if="question.correctAnswer" class="fill-answers">
        <div class="fill-answer">
          <span class="fill-index">参考答案:</span>
          <span class="fill-value">{{ question.correctAnswer }}</span>
        </div>
      </div>
    </div>

    <!-- 判断题 -->
    <div v-else-if="question.type === 'judge'" class="judge-section">
      <div class="judge-options">
        <div class="judge-option" :class="{ 'correct-option': question.correctAnswer === true || question.correctAnswer === 'true' }">
          <el-icon><Check /></el-icon>
          <span>正确</span>
        </div>
        <div class="judge-option" :class="{ 'correct-option': question.correctAnswer === false || question.correctAnswer === 'false' }">
          <el-icon><Close /></el-icon>
          <span>错误</span>
        </div>
      </div>
    </div>

    <!-- 简答题 -->
    <div v-else-if="question.type === 'essay'" class="essay-section">
      <div class="essay-hint">简答题，请详细回答以下问题</div>
      <div v-if="question.referenceAnswer" class="essay-answer">
        <span class="answer-label">参考答案:</span>
        <div class="answer-content">{{ question.referenceAnswer }}</div>
      </div>
    </div>

    <!-- 编程题 -->
    <div v-else-if="question.type === 'oj' || question.type === 'programming'" class="oj-section">
      <div class="oj-info">
        <div v-if="question.description" class="oj-description">
          <h5>题目描述</h5>
          <p>{{ question.description }}</p>
        </div>
        <div v-if="question.input" class="oj-input">
          <h5>输入格式</h5>
          <p>{{ question.input }}</p>
        </div>
        <div v-if="question.output" class="oj-output">
          <h5>输出格式</h5>
          <p>{{ question.output }}</p>
        </div>
        <div v-if="question.examples" class="oj-examples">
          <h5>示例</h5>
          <pre>{{ question.examples }}</pre>
        </div>
        <div class="oj-limits">
          <span v-if="question.timeLimit">时间限制: {{ question.timeLimit }}ms</span>
          <span v-if="question.memoryLimit">内存限制: {{ question.memoryLimit }}MB</span>
        </div>
      </div>
    </div>

    <!-- 题目解析 -->
    <div v-if="question.explanation" class="question-explanation">
      <span class="explanation-label">题目解析:</span>
      <div class="explanation-content">{{ question.explanation }}</div>
    </div>
  </div>
</template>

<script setup>
import { Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    default: 1
  }
})

const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

const isCorrectAnswer = (value) => {
  return props.question.correctAnswer === value
}

const isCorrectAnswerMultiple = (value) => {
  if (Array.isArray(props.question.correctAnswers)) {
    return props.question.correctAnswers.includes(value)
  }
  return false
}
</script>

<style lang="scss" scoped>
.question-preview-item {
  .question-text {
    font-size: 15px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 16px;
  }

  .options-section {
    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s;

      &.correct-option {
        background-color: #f0f9eb;
        border-color: #67c23a;
      }

      .option-label {
        font-weight: 600;
        color: #303133;
        min-width: 24px;
      }

      .option-text {
        flex: 1;
        color: #606266;
      }

      .correct-icon {
        color: #67c23a;
        font-size: 18px;
      }
    }
  }

  .fill-section {
    .fill-hint {
      color: #909399;
      font-style: italic;
      margin-bottom: 12px;
    }

    .fill-answers {
      .fill-answer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #f0f9eb;
        border-radius: 4px;
        margin-bottom: 8px;

        .fill-index {
          font-weight: 600;
          color: #67c23a;
        }

        .fill-value {
          color: #303133;
        }
      }
    }
  }

  .judge-section {
    .judge-options {
      display: flex;
      gap: 24px;

      .judge-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        color: #606266;

        &.correct-option {
          background-color: #f0f9eb;
          border-color: #67c23a;
          color: #67c23a;
        }
      }
    }
  }

  .essay-section {
    .essay-hint {
      color: #909399;
      font-style: italic;
      margin-bottom: 12px;
    }

    .essay-answer {
      .answer-label {
        font-weight: 600;
        color: #409eff;
        display: block;
        margin-bottom: 8px;
      }

      .answer-content {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        line-height: 1.6;
        color: #606266;
      }
    }
  }

  .oj-section {
    .oj-info {
      h5 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 16px 0 8px 0;

        &:first-child {
          margin-top: 0;
        }
      }

      p {
        color: #606266;
        line-height: 1.6;
        margin: 0;
      }

      pre {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        font-family: monospace;
      }

      .oj-limits {
        display: flex;
        gap: 24px;
        margin-top: 12px;
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .question-explanation {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #e4e7ed;

    .explanation-label {
      font-weight: 600;
      color: #409eff;
      display: block;
      margin-bottom: 8px;
    }

    .explanation-content {
      background: #f0f9ff;
      padding: 12px;
      border-radius: 4px;
      line-height: 1.6;
      color: #606266;
    }
  }
}
</style>
