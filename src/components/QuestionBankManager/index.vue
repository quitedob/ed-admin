<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="question-bank-manager" id="question-bank-manager">
      <!-- 题库选择器 -->
      <div class="bank-selector" id="bank-selector">
        <el-tabs v-model="activeBankType" @tab-change="handleBankTypeChange" id="bank-tabs">
          <el-tab-pane
            v-for="bank in questionBanks"
            :key="bank.id"
            :label="bank.name"
            :name="bank.type"
          >
            <div class="bank-header" :id="`bank-header-${bank.type}`">
              <div class="bank-info" :id="`bank-info-${bank.type}`">
                <span class="bank-title">{{ bank.name }}</span>
                <el-tag type="info">{{ bank.questionCount }} 题</el-tag>
                <el-tag type="success">每题 {{ bank.scorePerQuestion }} 分</el-tag>
                <span class="bank-description">考试抽取 {{ bank.totalQuestionsNeeded }} 题</span>
              </div>
              <div class="bank-actions" :id="`bank-actions-${bank.type}`">
                <el-button size="small" @click="importQuestions(bank.type)" :id="`import-btn-${bank.type}`">
                  <el-icon><Upload /></el-icon>
                  导入题目
                </el-button>
                <el-button size="small" @click="addQuestion(bank.type)" :id="`add-btn-${bank.type}`">
                  <el-icon><Plus /></el-icon>
                  添加题目
                </el-button>
              </div>
            </div>

            <!-- 题目列表 -->
            <div class="questions-container" :id="`questions-container-${bank.type}`">
              <div class="questions-header" :id="`questions-header-${bank.type}`">
                <el-input
                  v-model="searchText"
                  placeholder="搜索题目内容..."
                  class="search-input"
                  clearable
                  @input="handleSearch"
                  :id="`search-input-${bank.type}`"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select v-model="difficultyFilter" placeholder="难度筛选" clearable @change="handleSearch" :id="`difficulty-filter-${bank.type}`">
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </div>

              <div class="questions-list" :id="`questions-list-${bank.type}`">
                <div
                  v-for="(question, index) in filteredQuestions"
                  :key="question.id"
                  class="question-item"
                  :class="{ 'question-selected': selectedQuestions.includes(question.id) }"
                  :id="`question-item-${question.id}`"
                >
                  <div class="question-header" :id="`question-header-${question.id}`">
                    <div class="question-meta" :id="`question-meta-${question.id}`">
                      <el-checkbox
                        v-model="selectedQuestions"
                        :label="question.id"
                        @change="handleQuestionSelect(question.id)"
                        :id="`question-checkbox-${question.id}`"
                      />
                      <span class="question-number">题目 {{ index + 1 }}</span>
                      <el-tag :type="getDifficultyType(question.difficulty)" size="small">
                        {{ getDifficultyText(question.difficulty) }}
                      </el-tag>
                      <el-tag type="info" size="small">{{ question.score }}分</el-tag>
                    </div>
                    <div class="question-actions" :id="`question-actions-${question.id}`">
                      <el-button size="small" @click="editQuestion(question)" :id="`edit-question-btn-${question.id}`">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button size="small" type="danger" @click="deleteQuestion(question.id)" :id="`delete-question-btn-${question.id}`">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>

                  <div class="question-content">
                    <div class="question-text" v-html="question.questionText"></div>

                    <!-- 选择题选项 -->
                    <div v-if="question.type === 'single' || question.type === 'multiple'" class="question-options">
                      <div
                        v-for="option in question.options"
                        :key="option.id"
                        class="option-item"
                        :class="{ 'option-correct': isCorrectAnswer(question, option.value) }"
                      >
                        <span class="option-label">{{ option.value }}.</span>
                        <span class="option-text">{{ option.text }}</span>
                      </div>
                    </div>

                    <!-- 填空题答案 -->
                    <div v-else-if="question.type === 'fill'" class="fill-answers">
                      <div class="answer-label">正确答案：</div>
                      <div class="answer-list">
                        <el-tag
                          v-for="(answer, idx) in question.correctAnswers"
                          :key="idx"
                          type="success"
                          class="answer-tag"
                        >
                          {{ answer }}
                        </el-tag>
                      </div>
                    </div>

                    <!-- 问答题参考答案 -->
                    <div v-else-if="question.type === 'essay'" class="essay-answer">
                      <div class="answer-label">参考答案：</div>
                      <div class="reference-answer">{{ question.referenceAnswer }}</div>
                    </div>

                    <!-- 题目解析 -->
                    <div v-if="question.explanation" class="question-explanation">
                      <div class="explanation-label">解析：</div>
                      <div class="explanation-text">{{ question.explanation }}</div>
                    </div>

                    <!-- 知识点 -->
                    <div v-if="question.knowledgePoints && question.knowledgePoints.length" class="knowledge-points">
                      <div class="kp-label">知识点：</div>
                      <el-tag
                        v-for="kp in question.knowledgePoints"
                        :key="kp"
                        size="small"
                        class="kp-tag"
                      >
                        {{ kp }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="filteredQuestions.length"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 批量操作 -->
      <div class="batch-operations">
        <span class="selected-count">已选择 {{ selectedQuestions.length }} 道题</span>
        <el-button @click="batchDelete" :disabled="selectedQuestions.length === 0">
          批量删除
        </el-button>
        <el-button @click="batchExport" :disabled="selectedQuestions.length === 0">
          批量导出
        </el-button>
        <el-button type="primary" @click="confirmSelection">
          确认选择
        </el-button>
      </div>
    </div>

    <!-- 题目编辑对话框 -->
    <QuestionEditor
      v-if="showQuestionEditor"
      v-model="showQuestionEditor"
      :question="editingQuestion"
      :question-type="editingQuestionType"
      @save="handleQuestionSave"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Upload, Plus, Edit, Delete } from '@element-plus/icons-vue'
import QuestionEditor from './QuestionEditor.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  examBanks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 数据
const activeBankType = ref('single')
const searchText = ref('')
const difficultyFilter = ref('')
const selectedQuestions = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const showQuestionEditor = ref(false)
const editingQuestion = ref(null)
const editingQuestionType = ref('')

// 题库数据
const questionBanks = ref(props.examBanks)

// 计算属性
const dialogTitle = computed(() => '题库管理')

const currentBank = computed(() => {
  return questionBanks.value.find(bank => bank.type === activeBankType.value)
})

const filteredQuestions = computed(() => {
  let questions = currentBank.value?.questions || []

  if (searchText.value) {
    questions = questions.filter(q =>
      q.questionText.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  if (difficultyFilter.value) {
    questions = questions.filter(q => q.difficulty === difficultyFilter.value)
  }

  return questions
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const handleBankTypeChange = (type) => {
  activeBankType.value = type
  selectedQuestions.value = []
  currentPage.value = 1
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleQuestionSelect = (questionId) => {
  // 选中状态变化时的处理
}

const getDifficultyType = (difficulty) => {
  const types = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return types[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty] || '未知'
}

const isCorrectAnswer = (question, optionValue) => {
  if (question.type === 'single') {
    return question.correctAnswer === optionValue
  } else if (question.type === 'multiple') {
    return question.correctAnswers?.includes(optionValue)
  }
  return false
}

const importQuestions = (bankType) => {
  ElMessage.info('导入题目功能开发中...')
}

const addQuestion = (bankType) => {
  editingQuestion.value = null
  editingQuestionType.value = bankType
  showQuestionEditor.value = true
}

const editQuestion = (question) => {
  editingQuestion.value = { ...question }
  editingQuestionType.value = question.type
  showQuestionEditor.value = true
}

const deleteQuestion = async (questionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这道题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const bank = questionBanks.value.find(b => b.type === activeBankType.value)
    if (bank) {
      const index = bank.questions.findIndex(q => q.id === questionId)
      if (index > -1) {
        bank.questions.splice(index, 1)
        bank.questionCount = bank.questions.length
      }
    }

    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const bank = questionBanks.value.find(b => b.type === activeBankType.value)
    if (bank) {
      bank.questions = bank.questions.filter(q => !selectedQuestions.value.includes(q.id))
      bank.questionCount = bank.questions.length
    }

    selectedQuestions.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消
  }
}

const batchExport = () => {
  ElMessage.info('批量导出功能开发中...')
}

const confirmSelection = () => {
  emit('confirm', {
    banks: questionBanks.value,
    selectedQuestions: selectedQuestions.value
  })
  handleClose()
}

const handleQuestionSave = (questionData) => {
  const bank = questionBanks.value.find(b => b.type === questionData.type)
  if (bank) {
    if (editingQuestion.value) {
      // 更新题目
      const index = bank.questions.findIndex(q => q.id === questionData.id)
      if (index > -1) {
        bank.questions[index] = questionData
      }
    } else {
      // 添加新题目
      bank.questions.push(questionData)
    }
    bank.questionCount = bank.questions.length
  }

  showQuestionEditor.value = false
  editingQuestion.value = null
}

// 监听器
watch(() => props.examBanks, (newBanks) => {
  questionBanks.value = newBanks
}, { deep: true })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/QuestionBankManager/index.vue`);
  });

</script>

<style scoped>
.question-bank-manager {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.bank-selector {
  flex: 1;
  overflow: hidden;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-md);
}

.bank-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.bank-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.bank-description {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.bank-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.questions-container {
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}

.questions-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.questions-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-md);
}

.question-item {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  background-color: var(--color-bg-primary);
  transition: all 0.3s ease;
}

.question-item:hover {
  border-color: var(--color-primary-300);
  box-shadow: var(--shadow-sm);
}

.question-selected {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.question-number {
  font-weight: 600;
  color: var(--color-primary-500);
}

.question-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.question-content {
  color: var(--color-text-primary);
}

.question-text {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.question-options {
  margin: var(--spacing-sm) 0;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-xs) 0;
}

.option-label {
  font-weight: 500;
  margin-right: var(--spacing-sm);
  min-width: 24px;
}

.option-correct {
  color: var(--color-success-500);
  font-weight: 600;
}

.fill-answers,
.essay-answer,
.question-explanation,
.knowledge-points {
  margin: var(--spacing-sm) 0;
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
}

.answer-label,
.explanation-label,
.kp-label {
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.answer-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.answer-tag {
  margin: 0;
}

.reference-answer {
  color: var(--color-text-primary);
  line-height: 1.6;
}

.explanation-text {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.kp-tag {
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-md);
}

.batch-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
}

.selected-count {
  color: var(--color-text-secondary);
  font-size: 14px;
}
</style>