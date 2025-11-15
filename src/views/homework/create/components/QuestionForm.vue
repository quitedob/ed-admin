<template>
  <div class="question-form-container">
    <div class="question-header">
      <el-input
        v-model="localQuestion.name"
        placeholder="题目名称（如：单选题）"
        style="width: 200px; margin-right: 10px;"
      />
      <el-select v-model="localQuestion.type" placeholder="题型" style="width: 120px; margin-right: 10px;">
        <el-option label="单选题" value="single" />
        <el-option label="多选题" value="multiple" />
        <el-option label="填空题" value="fill" />
        <el-option label="简答题" value="essay" />
        <el-option label="OJ题" value="hoj" />
      </el-select>
      <el-button type="danger" size="small" @click="handleRemove">
        <el-icon><Delete /></el-icon>
        删除题目
      </el-button>
    </div>

    <div class="question-content">
      <div class="question-summary">
        <el-tag type="info">
          已选择 {{ (localQuestion.questions || []).length }} 道题目，总分：{{ calculateTotal() }} 分
        </el-tag>
      </div>

      <el-divider content-position="left">
        <span style="color: #409eff; font-weight: 500;">题目管理</span>
      </el-divider>

      <div class="questions-section">
        <div class="action-buttons-group">
          <el-button type="success" size="small" @click="showQuestionBankSelector">
            <el-icon><FolderOpened /></el-icon>
            从题库选择题目
          </el-button>
        </div>

        <div class="action-tips">
          <el-text size="small" type="info">
            <el-icon><InfoFilled /></el-icon>
            操作说明：点击"从题库选择题目"从现有题库中选择相应类型的题目
          </el-text>
        </div>

        <div class="questions-list">
          <div
            v-for="(question, index) in (localQuestion.questions || [])"
            :key="question.id"
            class="question-item"
          >
            <div class="question-header">
              <span class="question-number">题目 {{ index + 1 }}</span>
              <el-tag :type="getQuestionTypeTag(question.type)" size="small">
                {{ getQuestionTypeLabel(question.type) }}
              </el-tag>
              <div class="score-section">
                <el-input-number
                  v-model="question.score"
                  :min="1"
                  :max="100"
                  size="small"
                  @change="handleScoreChange"
                />
                <span class="score-unit">分</span>
              </div>
            </div>

            <div class="question-content">
              <div class="question-title-section">
                <span class="content-label">题目标题:</span>
                <span class="question-title">{{ question.title || '无标题' }}</span>
              </div>

              <div class="question-content-section">
                <span class="content-label">题目内容:</span>
                <span class="question-text">{{ question.content || '无内容' }}</span>
              </div>

              <!-- 选项显示 -->
              <div v-if="question.type === 'single' || question.type === 'multiple'" class="options-section">
                <span class="content-label">选项:</span>
                <div v-if="question.options && question.options.length > 0" class="options-list">
                  <div v-for="option in question.options" :key="option.id" class="option-item">
                    <span class="option-value">{{ option.value }}.</span>
                    <span class="option-text">{{ option.text || '(空选项)' }}</span>
                  </div>
                </div>
                <span v-else class="empty-options">暂无选项</span>
              </div>

              <!-- 答案显示 -->
              <div v-if="question.type === 'single'" class="answer-section">
                <span class="content-label">正确答案:</span>
                <span class="answer-text">{{ question.correctAnswer || '未设置' }}</span>
              </div>
              <div v-else-if="question.type === 'multiple'" class="answer-section">
                <span class="content-label">正确答案:</span>
                <span class="answer-text">{{ question.correctAnswers?.join(', ') || '未设置' }}</span>
              </div>
              <div v-else-if="question.type === 'fill'" class="answer-section">
                <span class="content-label">参考答案:</span>
                <span class="answer-text">{{ question.correctAnswers?.join(', ') || '未设置' }}</span>
              </div>
              <div v-else-if="question.type === 'essay'" class="answer-section">
                <span class="content-label">参考答案:</span>
                <span class="answer-text">{{ question.referenceAnswer || '未设置' }}</span>
              </div>

              <!-- 题目标签 -->
              <div v-if="question.tags && question.tags.length > 0" class="tags-section">
                <span class="content-label">标签:</span>
                <el-tag
                  v-for="tag in question.tags"
                  :key="tag"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ tag }}
                </el-tag>
              </div>

              <!-- 来源和分值信息 -->
              <div class="source-section">
                <span class="content-label">来源:</span>
                <span class="source-text">题库 (ID: {{ question.bankQuestionId || question.id }})</span>
                <span v-if="question.isFromBank && question.originalScore !== question.score" class="modified-indicator">
                  <el-tag type="warning" size="small">已修改分值: {{ question.originalScore }} → {{ question.score }}</el-tag>
                </span>
                <span v-else-if="question.isFromBank" class="score-info">
                  <el-text size="small" type="info">可修改分值</el-text>
                </span>
              </div>
            </div>

            <div class="question-actions">
              <el-button type="danger" size="small" @click="removeQuestion(index)">
                <el-icon><Delete /></el-icon>
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="(localQuestion.questions || []).length === 0" description="暂无题目，点击上方按钮从题库选择题目" :image-size="80" />
        </div>
      </div>
    </div>

    <!-- 题库选择器对话框 -->
    <el-dialog
      v-model="questionBankSelectorVisible"
      :title="`从题库选择${getQuestionTypeLabel(localQuestion.type)}`"
      width="900px"
      append-to-body
    >
      <div class="question-selector-content">
        <!-- 搜索区域 -->
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题目内容..."
            clearable
            style="width: 300px; margin-right: 10px;"
          >
            <template #append>
              <el-button type="primary" @click="searchQuestions">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
            </template>
          </el-input>
          <el-button @click="refreshQuestions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>

        <!-- 题目列表 -->
        <el-table
          v-loading="loading"
          :data="availableQuestions"
          max-height="400"
        >
          <el-table-column label="题目ID" width="80" prop="id" />
          <el-table-column label="题目类型" width="100">
            <template #default="scope">
              <el-tag :type="getQuestionTypeTag(scope.row.type)" size="small">
                {{ getQuestionTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题目内容" prop="content" show-overflow-tooltip />
          <el-table-column label="难度" width="80">
            <template #default="scope">
              <el-tag :type="getDifficultyTag(scope.row.difficulty)" size="small">
                {{ getDifficultyLabel(scope.row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分值" width="80" prop="score" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="selectSingleQuestion(scope.row)"
                :disabled="isQuestionSelected(scope.row.id)"
              >
                {{ isQuestionSelected(scope.row.id) ? '已选择' : '选择' }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="标签" width="150">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags"
                :key="tag"
                size="small"
                style="margin-right: 5px;"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="questionBankSelectorVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, FolderOpened, InfoFilled, Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'remove'])

const localQuestion = ref({
  name: '',
  type: 'single',
  questionCount: 0,
  questions: [],
  ...props.modelValue
})

// 题库选择器相关状态
const questionBankSelectorVisible = ref(false)
const searchKeyword = ref('')
const loading = ref(false)
const availableQuestions = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 监听本地数据变化，同步到父组件
watch(localQuestion, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 监听父组件数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && JSON.stringify(newVal) !== JSON.stringify(localQuestion.value)) {
    localQuestion.value = { ...newVal }
  }
}, { deep: true })

const calculateTotal = () => {
  return (localQuestion.value.questions || []).reduce((sum, question) => sum + (question.score || 0), 0)
}

const handleRemove = () => {
  emit('remove')
}

// 题库选择器函数
const showQuestionBankSelector = () => {
  questionBankSelectorVisible.value = true
  loadQuestions()
}

const loadQuestions = async () => {
  loading.value = true
  try {
    // 模拟从题库加载数据
    setTimeout(() => {
      const mockQuestions = generateMockQuestions()
      availableQuestions.value = mockQuestions.filter(q => q.type === (localQuestion.value.type || 'single'))
      total.value = availableQuestions.value.length
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('加载题目失败')
    loading.value = false
  }
}

const generateMockQuestions = () => {
  return [
    {
      id: 2001,
      type: 'single',
      content: 'Python中哪个关键字用于定义函数？',
      options: ['def', 'function', 'func', 'define'],
      correctAnswer: 'def',
      difficulty: 'easy',
      score: 2,
      tags: ['Python', '函数', '基础']
    },
    {
      id: 2002,
      type: 'multiple',
      content: '以下哪些是Python的数据结构？',
      options: ['列表', '字典', '元组', '集合'],
      correctAnswers: ['def', 'ghi', 'jkl', 'mno'],
      difficulty: 'medium',
      score: 3,
      tags: ['Python', '数据结构', '基础']
    },
    {
      id: 2003,
      type: 'fill',
      content: 'Python中用于定义类的关键字是_____',
      correctAnswers: ['class'],
      difficulty: 'easy',
      score: 2,
      tags: ['Python', '类', '面向对象']
    },
    {
      id: 2004,
      type: 'essay',
      content: '请简述Python中列表和元组的区别。',
      referenceAnswer: '列表是可变的，元组是不可变的',
      difficulty: 'medium',
      score: 5,
      tags: ['Python', '数据结构', '面向对象']
    },
    {
      id: 2005,
      type: 'hoj',
      content: '编写一个Python函数，计算给定列表的和。',
      inputFormat: '第一行输入整数n，第二行输入n个整数',
      outputFormat: '输出列表的和',
      timeLimit: 1000,
      memoryLimit: 128,
      difficulty: 'easy',
      score: 10,
      tags: ['Python', '算法', '列表']
    }
  ]
}

const searchQuestions = () => {
  if (!searchKeyword.value.trim()) {
    loadQuestions()
    return
  }

  loading.value = true
  setTimeout(() => {
    const allQuestions = generateMockQuestions()
    availableQuestions.value = allQuestions.filter(q =>
      q.type === localQuestion.value.type &&
      q.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
    total.value = availableQuestions.value.length
    loading.value = false
  }, 300)
}

const refreshQuestions = () => {
  searchKeyword.value = ''
  loadQuestions()
}

const selectSingleQuestion = (question) => {
  // 检查是否已经选择过这道题目
  if (isQuestionSelected(question.id)) {
    ElMessage.warning('该题目已经选择过了')
    return
  }

  // 确保 questions 数组存在
  if (!localQuestion.value.questions) {
    localQuestion.value.questions = []
  }

  // 将题目添加到当前题库
  const newQuestion = {
    ...question,
    bankQuestionId: question.id, // 记录原始题目ID
    originalScore: question.score, // 记录原始分值
    id: Date.now() + Math.random(), // 生成新的ID避免冲突
    selectedAt: new Date().toISOString(),
    // 添加标志表示这是从题库选择的题目
    isFromBank: true
  }

  localQuestion.value.questions.push(newQuestion)

  // 通知父组件数据变化
  handleScoreChange()

  ElMessage.success(`成功添加题目: ${question.content.substring(0, 30)}...`)
}

const isQuestionSelected = (questionId) => {
  return (localQuestion.value.questions || []).some(q => q.bankQuestionId === questionId || q.id === questionId)
}

const removeQuestion = (index) => {
  const questions = localQuestion.value.questions || []
  if (index >= 0 && index < questions.length) {
    questions.splice(index, 1)

    // 通知父组件数据变化，重新计算总分
    handleScoreChange()

    ElMessage.success('题目已移除')
  }
}

const handleScoreChange = () => {
  // 分值变化时，通知父组件重新计算总分
  emit('update:modelValue', localQuestion.value)
}

const handlePageChange = () => {
  loadQuestions()
}

const getDifficultyTag = (difficulty) => {
  const tagMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return tagMap[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labelMap[difficulty] || difficulty
}

const getQuestionTypeTag = (type) => {
  const typeMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'info',
    hoj: 'danger'
  }
  return typeMap[type] || 'info'
}

const getQuestionTypeLabel = (type) => {
  const labelMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '简答题',
    hoj: 'OJ题'
  }
  return labelMap[type] || type
}
</script>

<style scoped>
.question-form-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: white;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.question-content {
  padding: 10px 0;
}

.question-summary {
  margin: 15px 0;
}

.questions-section {
  margin-top: 15px;
}

.action-buttons-group {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.action-tips {
  margin-bottom: 15px;
  padding: 8px 12px;
  background-color: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}

.action-tips .el-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.questions-list {
  margin-top: 15px;
  min-height: 100px;
}

.question-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.question-number {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.score-section {
  display: flex;
  align-items: center;
  gap: 5px;
}

.score-unit {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.question-content {
  margin-bottom: 12px;
}

.content-label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
  display: inline-block;
}

.question-title-section,
.question-content-section {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.question-title,
.question-text {
  flex: 1;
  color: #303133;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.question-title:hover,
.question-text:hover {
  background-color: #e8f4fd;
}

.options-section,
.answer-section {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.options-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
}

.option-value {
  font-weight: 500;
  color: #409eff;
  min-width: 24px;
}

.option-text {
  flex: 1;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.option-text:hover {
  background-color: #f0f9ff;
}

.empty-options {
  color: #909399;
  font-style: italic;
}

.answer-text {
  color: #f56c6c;
  font-weight: 500;
}

.tags-section,
.source-section {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.source-text {
  color: #909399;
  font-size: 12px;
}

.modified-indicator {
  margin-left: auto;
}

.score-info {
  margin-left: 8px;
}

.question-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #e4e7ed;
}

/* 题库选择器样式 */
.question-selector-content {
  padding: 10px 0;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style>
