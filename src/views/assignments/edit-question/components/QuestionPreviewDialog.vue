<template>
  <el-dialog
    v-model="visible"
    title="题目预览"
    width="800px"
    top="5vh"
    @close="handleClose"
  >
    <div class="question-preview">
      <!-- 题目头部信息 -->
      <div class="question-header">
        <div class="header-left">
          <el-tag :type="getTypeTagType(questionData.type)" size="large">
            {{ getTypeLabel(questionData.type) }}
          </el-tag>
          <el-tag :type="getDifficultyTagType(questionData.difficulty)" size="large">
            {{ getDifficultyLabel(questionData.difficulty) }}
          </el-tag>
          <el-tag type="info" size="large">
            {{ questionData.score }}分
          </el-tag>
        </div>
        <div class="header-right">
          <el-tag 
            v-for="tag in questionData.tags" 
            :key="tag" 
            size="small"
            style="margin-left: 8px"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 题目内容 -->
      <div class="question-content">
        <div class="question-number">题号: {{ questionData.questionNumber }}</div>
        <div class="question-text">{{ questionData.questionText || '(题目内容为空)' }}</div>
      </div>

      <!-- 单选题预览 -->
      <div v-if="questionData.type === 'single'" class="question-options">
        <el-radio-group v-model="previewAnswer" disabled>
          <div 
            v-for="option in questionData.singleChoice.options" 
            :key="option.value"
            class="option-item"
          >
            <el-radio :label="option.value">
              <span class="option-label">{{ option.value }}.</span>
              <span class="option-text">{{ option.text || '(选项内容为空)' }}</span>
            </el-radio>
            <el-tag 
              v-if="option.value === questionData.singleChoice.correctAnswer"
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
      <div v-if="questionData.type === 'multiple'" class="question-options">
        <el-checkbox-group v-model="previewAnswers" disabled>
          <div 
            v-for="option in questionData.multipleChoice.options" 
            :key="option.value"
            class="option-item"
          >
            <el-checkbox :label="option.value">
              <span class="option-label">{{ option.value }}.</span>
              <span class="option-text">{{ option.text || '(选项内容为空)' }}</span>
            </el-checkbox>
            <el-tag 
              v-if="option.isCorrect"
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
      <div v-if="questionData.type === 'fill'" class="fill-blanks">
        <div 
          v-for="(blank, index) in questionData.fillBlanks.blanks" 
          :key="blank.id"
          class="blank-item"
        >
          <div class="blank-label">第{{ index + 1 }}空:</div>
          <el-input placeholder="请输入答案" disabled />
          <div class="blank-answers">
            <span style="color: #909399; margin-right: 8px">参考答案:</span>
            <el-tag 
              v-for="(answer, aIndex) in blank.answers" 
              :key="aIndex"
              type="success"
              size="small"
              style="margin-right: 4px"
            >
              {{ answer }}
            </el-tag>
          </div>
        </div>
        <div class="scoring-method">
          <el-icon><InfoFilled /></el-icon>
          评分方式: {{ questionData.fillBlanks.scoringMethod === 'all' ? '全对得分' : '部分得分' }}
        </div>
      </div>

      <!-- 问答题预览 -->
      <div v-if="questionData.type === 'essay'" class="essay-answer">
        <el-input
          type="textarea"
          :rows="6"
          placeholder="请输入你的答案..."
          disabled
        />
        <div v-if="questionData.essay.aiGrading" class="ai-grading-info">
          <el-icon><Cpu /></el-icon>
          <span>本题启用AI辅助评分</span>
        </div>
      </div>

      <!-- 编程题预览 -->
      <div v-if="questionData.type === 'programming'" class="programming-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="HOJ题目ID">
            {{ questionData.programming.hojProblemId || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="题目名称">
            {{ questionData.programming.problemName || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="时间限制">
            {{ questionData.programming.timeLimit }}ms
          </el-descriptions-item>
          <el-descriptions-item label="内存限制">
            {{ questionData.programming.memoryLimit }}MB
          </el-descriptions-item>
          <el-descriptions-item label="必做">
            <el-tag :type="questionData.programming.required ? 'success' : 'info'" size="small">
              {{ questionData.programming.required ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="多次提交">
            <el-tag :type="questionData.programming.multipleSubmit ? 'success' : 'info'" size="small">
              {{ questionData.programming.multipleSubmit ? '允许' : '不允许' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 题目解析 -->
      <div v-if="getExplanation()" class="question-explanation">
        <el-divider content-position="left">
          <el-icon><Document /></el-icon>
          题目解析
        </el-divider>
        <div class="explanation-content">
          {{ getExplanation() }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
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
