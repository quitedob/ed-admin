<template>
  <el-card shadow="never" class="paper-builder">
    <template #header>
      <div class="card-header">
        <span class="step-title">组建试卷</span>
        <div class="header-actions">
          <el-input
            v-model="searchText"
            placeholder="搜索题目..."
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </template>

    <div class="paper-builder-content">
      <!-- 左侧：题库分类配置 -->
      <div class="question-banks-panel">
        <div class="panel-header">
          <span>题库分类</span>
          <el-button type="primary" size="small" @click="handleAddQuestionBank">
            <el-icon><Plus /></el-icon>
            添加题库
          </el-button>
        </div>

        <div class="question-bank-list">
          <div
            v-for="(bank, index) in localQuestionBanks"
            :key="bank.id"
            :class="['bank-item', { active: selectedBankIndex === index }]"
            @click="selectBank(index)"
          >
            <div class="bank-header">
              <el-icon class="drag-handle"><Rank /></el-icon>
              <el-tag :type="getTypeTagType(bank.type)" size="small">
                {{ getTypeLabel(bank.type) }}
              </el-tag>
              <span class="bank-name">{{ bank.name }}</span>
            </div>
            <div class="bank-stats">
              <span class="stat-item">题数: {{ bank.selectedCount }}</span>
              <span class="stat-item">总分: {{ bank.totalScore }}</span>
            </div>
            <div class="bank-actions">
              <el-button
                link
                type="primary"
                size="small"
                @click.stop="handleSelectQuestions(index)"
              >
                从题库选题
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click.stop="handleRemoveBank(index)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：试卷预览 -->
      <div class="paper-preview-panel">
        <div class="panel-header">
          <span>试卷预览</span>
          <div class="score-summary">
            <span class="total-score">总分: {{ localTotalScore }}分</span>
            <el-divider direction="vertical" />
            <span>及格线:</span>
            <el-input-number
              v-model="localPassingScore"
              :min="0"
              :max="localTotalScore"
              size="small"
              style="width: 100px"
            />
            <span>分</span>
          </div>
        </div>

        <div class="paper-structure">
          <div
            v-for="(bank, bankIndex) in localQuestionBanks"
            :key="bank.id"
            class="bank-section"
          >
            <div class="section-header">
              <el-tag :type="getTypeTagType(bank.type)">
                {{ getTypeLabel(bank.type) }}
              </el-tag>
              <span class="section-title">{{ bank.name }}</span>
              <span class="section-score">小计: {{ bank.totalScore }}分</span>
            </div>

            <div v-if="bank.questions && bank.questions.length > 0" class="questions-list">
              <div
                v-for="(question, qIndex) in bank.questions"
                :key="question.id"
                class="question-item"
              >
                <div class="question-header">
                  <span class="question-number">{{ getQuestionNumber(bankIndex, qIndex) }}.</span>
                  <span class="question-text">{{ question.questionText }}</span>
                </div>
                <div class="question-meta">
                  <el-input-number
                    v-model="question.score"
                    :min="1"
                    :max="100"
                    size="small"
                    @change="updateBankScore(bankIndex)"
                  />
                  <span style="margin: 0 8px">分</span>
                  <el-checkbox v-model="question.required">必做</el-checkbox>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removeQuestion(bankIndex, qIndex)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty
              v-else
              description="暂无题目，请点击"从题库选题"添加"
              :image-size="80"
            />
          </div>

          <el-empty
            v-if="localQuestionBanks.length === 0"
            description="请点击"添加题库"开始组建试卷"
            :image-size="100"
          />
        </div>
      </div>
    </div>

    <!-- 添加题库对话框 -->
    <el-dialog
      v-model="addBankDialogVisible"
      title="添加题库"
      width="500px"
    >
      <el-form :model="newBankForm" label-width="100px">
        <el-form-item label="题库类型">
          <el-select v-model="newBankForm.type" placeholder="请选择题型">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fill" />
            <el-option label="问答题" value="essay" />
            <el-option label="编程题" value="programming" />
          </el-select>
        </el-form-item>

        <el-form-item label="题库名称">
          <el-input v-model="newBankForm.name" placeholder="请输入题库名称" />
        </el-form-item>

        <el-form-item label="单题分值">
          <el-input-number
            v-model="newBankForm.scorePerQuestion"
            :min="1"
            :max="100"
          />
          <span style="margin-left: 8px">分</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addBankDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAddBank">确定</el-button>
      </template>
    </el-dialog>

    <!-- 选题对话框 -->
    <QuestionSelector
      v-model="selectorVisible"
      :question-type="currentBankType"
      @select="handleQuestionsSelected"
    />
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Rank } from '@element-plus/icons-vue'
import QuestionSelector from './QuestionSelector.vue'

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

const emit = defineEmits(['update:questionBanks', 'update:totalScore', 'update:passingScore'])

// 响应式数据
const searchText = ref('')
const selectedBankIndex = ref(null)
const addBankDialogVisible = ref(false)
const selectorVisible = ref(false)
const currentBankType = ref('')
const currentBankIndex = ref(null)

const localQuestionBanks = ref([...props.questionBanks])
const localTotalScore = ref(props.totalScore)
const localPassingScore = ref(props.passingScore)

const newBankForm = ref({
  type: 'single',
  name: '',
  scorePerQuestion: 2
})

// 监听变化并同步到父组件
watch(localQuestionBanks, (newVal) => {
  emit('update:questionBanks', newVal)
  calculateTotalScore()
}, { deep: true })

watch(localTotalScore, (newVal) => {
  emit('update:totalScore', newVal)
})

watch(localPassingScore, (newVal) => {
  emit('update:passingScore', newVal)
})

// 方法
const selectBank = (index) => {
  selectedBankIndex.value = index
}

const handleAddQuestionBank = () => {
  newBankForm.value = {
    type: 'single',
    name: '',
    scorePerQuestion: 2
  }
  addBankDialogVisible.value = true
}

const handleConfirmAddBank = () => {
  if (!newBankForm.value.name) {
    newBankForm.value.name = `${getTypeLabel(newBankForm.value.type)}题库`
  }

  const newBank = {
    id: `bank_${Date.now()}`,
    type: newBankForm.value.type,
    name: newBankForm.value.name,
    selectedCount: 0,
    scorePerQuestion: newBankForm.value.scorePerQuestion,
    totalScore: 0,
    questions: []
  }

  localQuestionBanks.value.push(newBank)
  addBankDialogVisible.value = false
  ElMessage.success('题库添加成功')
}

const handleRemoveBank = (index) => {
  localQuestionBanks.value.splice(index, 1)
  if (selectedBankIndex.value === index) {
    selectedBankIndex.value = null
  }
  ElMessage.success('题库删除成功')
}

const handleSelectQuestions = (index) => {
  currentBankIndex.value = index
  currentBankType.value = localQuestionBanks.value[index].type
  selectorVisible.value = true
}

const handleQuestionsSelected = (questions) => {
  if (currentBankIndex.value === null) return

  const bank = localQuestionBanks.value[currentBankIndex.value]
  
  // 添加题目到题库
  const newQuestions = questions.map(q => ({
    ...q,
    score: bank.scorePerQuestion,
    required: true
  }))

  bank.questions = [...(bank.questions || []), ...newQuestions]
  bank.selectedCount = bank.questions.length
  
  updateBankScore(currentBankIndex.value)
  
  ElMessage.success(`成功添加 ${questions.length} 道题目`)
}

const removeQuestion = (bankIndex, questionIndex) => {
  const bank = localQuestionBanks.value[bankIndex]
  bank.questions.splice(questionIndex, 1)
  bank.selectedCount = bank.questions.length
  updateBankScore(bankIndex)
}

const updateBankScore = (bankIndex) => {
  const bank = localQuestionBanks.value[bankIndex]
  bank.totalScore = bank.questions.reduce((sum, q) => sum + (q.score || 0), 0)
  calculateTotalScore()
}

const calculateTotalScore = () => {
  localTotalScore.value = localQuestionBanks.value.reduce(
    (sum, bank) => sum + (bank.totalScore || 0),
    0
  )
}

const getQuestionNumber = (bankIndex, questionIndex) => {
  let number = 1
  for (let i = 0; i < bankIndex; i++) {
    number += localQuestionBanks.value[i].questions?.length || 0
  }
  return number + questionIndex
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
.paper-builder {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .step-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.paper-builder-content {
  display: flex;
  gap: 20px;
  min-height: 600px;
}

/* 左侧题库面板 */
.question-banks-panel {
  width: 320px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .question-bank-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .bank-item {
      padding: 16px;
      margin-bottom: 12px;
      border: 2px solid var(--color-border-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-light-9);
      }

      &.active {
        border-color: var(--color-primary);
        background: var(--color-primary-light-9);
      }

      .bank-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .drag-handle {
          cursor: move;
          color: var(--color-text-secondary);
        }

        .bank-name {
          flex: 1;
          font-weight: 600;
          color: var(--color-text-primary);
        }
      }

      .bank-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 12px;
        font-size: 13px;
        color: var(--color-text-secondary);

        .stat-item {
          font-weight: 500;
        }
      }

      .bank-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}

/* 右侧试卷预览面板 */
.paper-preview-panel {
  flex: 1;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .score-summary {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;

      .total-score {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-primary);
      }
    }
  }

  .paper-structure {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .bank-section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;

      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--color-border-light);

        .section-title {
          flex: 1;
          font-weight: 600;
          font-size: 15px;
        }

        .section-score {
          font-weight: 600;
          color: var(--color-primary);
        }
      }

      .questions-list {
        .question-item {
          padding: 12px;
          margin-bottom: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid var(--color-border-light);

          .question-header {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;

            .question-number {
              font-weight: 600;
              color: var(--color-text-primary);
            }

            .question-text {
              flex: 1;
              color: var(--color-text-regular);
              line-height: 1.6;
            }
          }

          .question-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--color-border-lighter);
          }
        }
      }
    }
  }
}
</style>
