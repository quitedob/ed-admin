<template>
  <el-dialog
    v-model="dialogVisible"
    title="提交详情"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="submissionData" class="submission-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="科目">
          {{ submissionData.subject }}
        </el-descriptions-item>
        <el-descriptions-item label="题型">
          <el-tag size="small">{{ submissionData.questionType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="题目" :span="2">
          {{ submissionData.questionTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="难度">
          <el-tag :type="getDifficultyType(submissionData.difficulty)" size="small">
            {{ getDifficultyLabel(submissionData.difficulty) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="submissionData.isCorrect ? 'success' : 'danger'" size="small">
            {{ submissionData.isCorrect ? '正确' : '错误' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用时">
          {{ formatSeconds(submissionData.timeSpent) }}
        </el-descriptions-item>
        <el-descriptions-item label="尝试次数">
          {{ submissionData.attemptCount }} 次
        </el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">
          {{ formatDateTime(submissionData.submitTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="answer-section">
        <h4>答题详情</h4>
        <el-alert
          :type="submissionData.isCorrect ? 'success' : 'error'"
          :closable="false"
          style="margin-bottom: 16px"
        >
          <template #title>
            <span v-if="submissionData.isCorrect">回答正确！</span>
            <span v-else>回答错误，请查看正确答案</span>
          </template>
        </el-alert>

        <div class="answer-content">
          <div class="answer-item">
            <div class="answer-label">学生答案：</div>
            <div class="answer-value">
              <el-text>{{ submissionData.studentAnswer || '未作答' }}</el-text>
            </div>
          </div>
          <div class="answer-item">
            <div class="answer-label">正确答案：</div>
            <div class="answer-value">
              <el-text type="success">{{ submissionData.correctAnswer || 'A' }}</el-text>
            </div>
          </div>
          <div v-if="submissionData.explanation" class="answer-item">
            <div class="answer-label">答案解析：</div>
            <div class="answer-value">
              <el-text type="info">{{ submissionData.explanation || '暂无解析' }}</el-text>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleViewQuestion">查看题目</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  submissionData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatSeconds = (seconds) => {
  if (!seconds) return '0秒'
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleViewQuestion = () => {
  ElMessage.info('跳转到题目详情页面')
}
</script>

<style lang="scss" scoped>
.submission-detail {
  .answer-section {
    margin-top: 24px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--color-text-primary);
    }

    .answer-content {
      .answer-item {
        margin-bottom: 16px;
        padding: 12px;
        background: var(--color-bg-secondary);
        border-radius: 4px;

        &:last-child {
          margin-bottom: 0;
        }

        .answer-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }

        .answer-value {
          font-size: 14px;
          line-height: 1.6;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
