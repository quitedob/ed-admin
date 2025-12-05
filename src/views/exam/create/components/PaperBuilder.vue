<template>
  <el-card shadow="never">
    <template #header>
      <div class="header-section">
        <span class="step-title">组建试卷</span>
        <el-button type="primary" @click="handleAddFromBank">
          <el-icon><Plus /></el-icon>
          从题库添加
        </el-button>
      </div>
    </template>

    <!-- 试卷统计 -->
    <div class="paper-stats">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">总题数</div>
            <div class="stat-value">{{ totalQuestions }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">总分值</div>
            <div class="stat-value">{{ totalScore }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <div class="stat-label">及格分</div>
            <el-input-number
              v-model="passingScoreValue"
              :min="0"
              :max="totalScore"
              size="small"
              @change="handlePassingScoreChange"
            />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 题目列表 -->
    <div class="question-list">
      <div v-if="questionBanksValue.length === 0" class="empty-state">
        <el-empty description="暂无题目，请从题库添加" />
      </div>

      <div v-else>
        <div
          v-for="(question, index) in questionBanksValue"
          :key="question.id"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-num">{{ index + 1 }}.</span>
            <el-tag :type="getTypeTagType(question.type)" size="small">
              {{ getTypeLabel(question.type) }}
            </el-tag>
            <span class="question-text">{{ question.questionText }}</span>
            <div class="question-actions">
              <el-input-number
                v-model="question.score"
                :min="1"
                :max="100"
                size="small"
                @change="updateTotalScore"
              />
              <span style="margin: 0 8px">分</span>
              <el-button
                type="danger"
                size="small"
                text
                @click="handleRemove(index)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 题目预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="题目预览"
      width="60%"
    >
      <div v-if="previewQuestion" class="question-preview">
        <div class="preview-header">
          <el-tag :type="getTypeTagType(previewQuestion.type)" size="small">
            {{ getTypeLabel(previewQuestion.type) }}
          </el-tag>
          <el-tag :type="getDifficultyTagType(previewQuestion.difficulty)" size="small">
            {{ getDifficultyLabel(previewQuestion.difficulty) }}
          </el-tag>
          <span class="preview-score">默认分值：{{ previewQuestion.score }}分</span>
        </div>

        <div class="preview-content">
          <h4>题目内容：</h4>
          <div class="question-text">{{ previewQuestion.questionText }}</div>

          <div v-if="previewQuestion.tags && previewQuestion.tags.length > 0" class="preview-tags">
            <h4>标签：</h4>
            <el-tag
              v-for="tag in previewQuestion.tags"
              :key="tag"
              size="small"
              style="margin: 2px"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import QuestionSelectorDialog from '@/views/course/update/components/QuestionSelectorDialog.vue'

const props = defineProps({
  questionBanks: {
    type: Array,
    default: () => []
  },
  totalScore: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 60
  }
})

const emit = defineEmits(['update:questionBanks', 'update:totalScore', 'update:passingScore', 'open-question-selector'])

const questionBanksValue = computed({
  get: () => props.questionBanks,
  set: (val) => emit('update:questionBanks', val)
})

const passingScoreValue = computed({
  get: () => props.passingScore,
  set: (val) => emit('update:passingScore', val)
})

const previewDialogVisible = ref(false)
const previewQuestion = ref(null)

const totalQuestions = computed(() => questionBanksValue.value.length)

const handleAddFromBank = () => {
  emit('open-question-selector')
}

const getDefaultScore = (type) => {
  const scoreMap = {
    single: 2,
    multiple: 3,
    fill: 2,
    judge: 1,
    essay: 10,
    programming: 8
  }
  return scoreMap[type] || 2
}

const handleRemove = (index) => {
  questionBanksValue.value.splice(index, 1)
  updateTotalScore()
}

const updateTotalScore = () => {
  const total = questionBanksValue.value.reduce((sum, q) => sum + (q.score || 0), 0)
  emit('update:totalScore', total)
}

const handlePassingScoreChange = (val) => {
  emit('update:passingScore', val)
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    essay: '简答',
    programming: 'OJ'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    essay: '',
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
</script>

<style lang="scss" scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .step-title {
    font-size: 16px;
    font-weight: 600;
  }
}

.paper-stats {
  margin-bottom: 24px;

  .stat-card {
    text-align: center;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;

    .stat-label {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-primary);
    }
  }
}

.question-list {
  .empty-state {
    padding: 40px 0;
  }

  .question-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .question-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .question-num {
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .question-text {
        flex: 1;
        color: var(--color-text-regular);
      }

      .question-actions {
        display: flex;
        align-items: center;
      }
    }
  }
}


.question-preview {
  .preview-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 16px;

    .preview-score {
      margin-left: auto;
      font-size: 14px;
      color: #606266;
    }
  }

  .preview-content {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 16px 0 8px 0;

      &:first-child {
        margin-top: 0;
      }
    }

    .question-text {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #409eff;
      line-height: 1.6;
    }

    .preview-tags {
      .el-tag {
        margin: 2px 4px 2px 0;
      }
    }
  }
}
</style>
