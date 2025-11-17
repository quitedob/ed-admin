<template>
  <div class="question-bank-page" role="main" aria-label="题库管理页面">
    <!-- 跳转链接 -->
    <div class="skip-links" aria-label="页面导航">
      <a href="#question-content" class="skip-link">跳转到题目内容</a>
      <a href="#filter-section" class="skip-link">跳转到筛选区域</a>
      <a href="#main-navigation" class="skip-link">跳转到主导航</a>
    </div>

    <ErrorBoundary
      :on-error="handleGlobalError"
      :on-retry="handleRetry"
    >
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>题库管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>教学管理</el-breadcrumb-item>
          <el-breadcrumb-item>题库管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建题目
        </el-button>
        <el-button type="success" @click="showAIHelper = true">
          <el-icon><MagicStick /></el-icon>
          AI助手
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出题目
        </el-button>
        <el-button @click="showTagManager = true">
          <el-icon><Management /></el-icon>
          标签管理
        </el-button>
        <el-button @click="goToAnalytics">
          <el-icon><TrendCharts /></el-icon>
          数据分析
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalQuestions }}</div>
          <div class="stat-label">总题目数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon easy">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.easy }}</div>
          <div class="stat-label">简单题目</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon medium">
          <el-icon><StarFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.medium }}</div>
          <div class="stat-label">中等题目</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon hard">
          <el-icon><Trophy /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.hard }}</div>
          <div class="stat-label">困难题目</div>
        </div>
      </div>
    </div>

    <!-- 高级筛选器 -->
    <div id="filter-section" class="filter-section" role="region" aria-label="筛选选项">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索题目内容、标题..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filters.type" placeholder="题型" clearable style="width: 150px">
          <el-option label="全部题型" value="" />
          <el-option
            v-for="type in questionTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>

        <el-select v-model="filters.difficulty" placeholder="难度" clearable style="width: 120px">
          <el-option label="全部难度" value="" />
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>

        <el-select v-model="filters.subject" placeholder="学科" clearable style="width: 150px">
          <el-option label="全部学科" value="" />
          <el-option label="计算机科学" value="cs" />
          <el-option label="数学" value="math" />
          <el-option label="物理" value="physics" />
          <el-option label="化学" value="chemistry" />
        </el-select>

        <el-select
          v-model="filters.tags"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="标签筛选"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>

      <div class="filter-row">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />

        <el-select v-model="sortBy" placeholder="排序方式" style="width: 150px">
          <el-option label="创建时间" value="createTime" />
          <el-option label="更新时间" value="updateTime" />
          <el-option label="使用次数" value="useCount" />
          <el-option label="难度" value="difficulty" />
        </el-select>

        <el-select v-model="sortOrder" placeholder="排序顺序" style="width: 120px">
          <el-option label="降序" value="desc" />
          <el-option label="升序" value="asc" />
        </el-select>

        <el-button @click="resetFilters">
          <el-icon><Refresh /></el-icon>
          重置筛选
        </el-button>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="questions-section">
      <div class="section-header">
        <h3>题目列表 ({{ filteredQuestions.length }})</h3>
        <div class="view-toggle">
          <el-button-group>
            <el-button
              :type="viewMode === 'card' ? 'primary' : ''"
              @click="viewMode = 'card'"
            >
              <el-icon><Grid /></el-icon>
              卡片视图
            </el-button>
            <el-button
              :type="viewMode === 'table' ? 'primary' : ''"
              @click="viewMode = 'table'"
            >
              <el-icon><List /></el-icon>
              表格视图
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="questions-grid">
        <QuestionCard
          v-for="question in paginatedQuestions"
          :key="question.id"
          :question="question"
          @edit="handleEdit"
          @view="handleView"
          @delete="handleDelete"
          @add-to-assignment="handleAddToAssignment"
          @add-to-exam="handleAddToExam"
        />
      </div>

      <!-- 表格视图 -->
      <div v-else class="questions-table">
        <el-table :data="paginatedQuestions" stripe>
          <el-table-column prop="title" label="题目标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="80">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="学科" width="120" />
          <el-table-column prop="tags" label="标签" width="200">
            <template #default="{ row }">
              <el-tag
                v-for="tag in row.tags?.slice(0, 2)"
                :key="tag"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="row.tags?.length > 2" size="small" type="info">
                +{{ row.tags.length - 2 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="useCount" label="使用次数" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="120" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)">查看</el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-dropdown @command="(command) => handleCommand(command, row)">
                <el-button size="small">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="add-assignment">添加到作业</el-dropdown-item>
                    <el-dropdown-item command="add-exam">添加到考试</el-dropdown-item>
                    <el-dropdown-item command="duplicate">复制题目</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="filteredQuestions.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新建/编辑题目对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editingQuestion?.id ? '编辑题目' : '新建题目'"
      width="1200px"
      :close-on-click-modal="false"
    >
      <V2QuestionEditDialog
        v-if="showEditDialog"
        v-model="showEditDialog"
        :question-data="editingQuestion"
        @save="handleSaveQuestion"
      />
    </el-dialog>

    <!-- 题目详情查看器 -->
    <QuestionViewer
      v-model="showViewer"
      :question="viewingQuestion"
    />

    <!-- 标签管理器 -->
    <TagManager
      v-model="showTagManager"
      @tags-updated="handleTagsUpdated"
    />

    <!-- AI助手 -->
    <AIQuestionHelper
      v-model="showAIHelper"
      :current-question="editingQuestion || viewingQuestion"
      @question-generated="handleAIGeneratedQuestion"
    />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAccessibility, vKeyboardNavigation } from '@/composables/useAccessibility.js'
import LoadingManager from '@/components/QuestionBank/LoadingManager.vue'
import ErrorBoundary from '@/components/QuestionBank/ErrorBoundary.vue'
import {
  Plus, Upload, Download, Management, Document, Star, StarFilled,
  Trophy, Search, Refresh, Grid, List, ArrowDown, MagicStick, TrendCharts
} from '@element-plus/icons-vue'

import QuestionCard from '@/components/QuestionBank/QuestionCard.vue'
import QuestionViewer from '@/components/QuestionBank/QuestionViewer.vue'
import TagManager from '@/components/QuestionBank/TagManager.vue'
import AIQuestionHelper from '@/components/QuestionBank/AIQuestionHelper.vue'
import V2QuestionEditDialog from '@/components/V2QuestionEditDialog.vue'

const router = useRouter()

// 初始化无障碍功能
const {
  announce,
  setAriaAttributes,
  setRole,
  addSkipLink,
  generateId,
  setErrorMessage,
  clearErrorMessage,
  navigateFocus
} = useAccessibility({
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableFocusManagement: true,
  customKeyBindings: {
    'Ctrl+N': () => handleCreate(),
    'Ctrl+F': () => document.querySelector('#filter-section input')?.focus(),
    'Ctrl+A': () => selectAllQuestions(),
    'Escape': () => closeAllDialogs()
  }
})

// 响应式数据
const searchKeyword = ref('')
const viewMode = ref('card')
const currentPage = ref(1)
const pageSize = ref(24)
const showEditDialog = ref(false)
const showViewer = ref(false)
const showTagManager = ref(false)
const showAIHelper = ref(false)
const editingQuestion = ref(null)
const viewingQuestion = ref(null)

// 筛选条件
const filters = ref({
  type: '',
  difficulty: '',
  subject: '',
  tags: [],
  dateRange: []
})

const sortBy = ref('createTime')
const sortOrder = ref('desc')

// 题型配置
const questionTypes = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: '编程题', value: 'programming' },
  { label: '简答题', value: 'essay' }
]

// 模拟题目数据
const questions = ref([
  {
    id: 'q001',
    title: 'JavaScript 中闭包的概念',
    type: 'single',
    difficulty: 'medium',
    subject: 'cs',
    content: '以下关于 JavaScript 闭包的描述，哪个是正确的？',
    options: [
      { value: 'A', text: '闭包是指函数可以访问外部变量' },
      { value: 'B', text: '闭包会造成内存泄漏' },
      { value: 'C', text: '闭包只能访问全局变量' },
      { value: 'D', text: '闭包是一种错误' }
    ],
    correctAnswer: 'A',
    tags: ['JavaScript', '前端开发', '基础概念'],
    useCount: 15,
    createTime: '2024-01-15',
    updateTime: '2024-01-20'
  },
  {
    id: 'q002',
    title: 'React Hooks 使用规则',
    type: 'multiple',
    difficulty: 'hard',
    subject: 'cs',
    content: '关于 React Hooks 的使用，以下哪些说法是正确的？',
    options: [
      { value: 'A', text: '只能在函数组件中使用 Hooks' },
      { value: 'B', text: '可以在条件语句中使用 Hooks' },
      { value: 'C', text: '必须在组件顶层调用 Hooks' },
      { value: 'D', text: '可以在类组件中使用 Hooks' }
    ],
    correctAnswers: ['A', 'C'],
    tags: ['React', '前端开发', 'Hooks'],
    useCount: 8,
    createTime: '2024-01-18',
    updateTime: '2024-01-22'
  },
  {
    id: 'q003',
    title: '二叉树遍历',
    type: 'programming',
    difficulty: 'hard',
    subject: 'cs',
    content: '实现二叉树的中序遍历算法',
    problemId: 'BT-001',
    timeLimit: 1000,
    memoryLimit: 256,
    tags: ['算法', '数据结构', '二叉树'],
    useCount: 12,
    createTime: '2024-01-10',
    updateTime: '2024-01-25'
  }
])

// 可用标签（实际应该从标签管理器获取）
const availableTags = ref([
  'JavaScript', 'React', 'Vue', '前端开发', '后端开发',
  '算法', '数据结构', '数据库', '网络编程', '基础概念'
])

// 计算属性
const totalQuestions = computed(() => questions.value.length)

const stats = computed(() => {
  const easy = questions.value.filter(q => q.difficulty === 'easy').length
  const medium = questions.value.filter(q => q.difficulty === 'medium').length
  const hard = questions.value.filter(q => q.difficulty === 'hard').length
  return { easy, medium, hard }
})

const filteredQuestions = computed(() => {
  let result = questions.value

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(q =>
      q.title.toLowerCase().includes(keyword) ||
      q.content.toLowerCase().includes(keyword)
    )
  }

  // 题型筛选
  if (filters.value.type) {
    result = result.filter(q => q.type === filters.value.type)
  }

  // 难度筛选
  if (filters.value.difficulty) {
    result = result.filter(q => q.difficulty === filters.value.difficulty)
  }

  // 学科筛选
  if (filters.value.subject) {
    result = result.filter(q => q.subject === filters.value.subject)
  }

  // 标签筛选
  if (filters.value.tags.length > 0) {
    result = result.filter(q =>
      filters.value.tags.some(tag => q.tags?.includes(tag))
    )
  }

  // 日期范围筛选
  if (filters.value.dateRange?.length === 2) {
    const [start, end] = filters.value.dateRange
    result = result.filter(q => {
      const createDate = new Date(q.createTime).toISOString().split('T')[0]
      return createDate >= start && createDate <= end
    })
  }

  // 排序
  result.sort((a, b) => {
    let aValue = a[sortBy.value]
    let bValue = b[sortBy.value]

    if (sortBy.value === 'difficulty') {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
      aValue = difficultyOrder[a.difficulty]
      bValue = difficultyOrder[b.difficulty]
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    return sortOrder.value === 'asc' ? result : -result
  })

  return result
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

// 方法
const handleCreate = () => {
  editingQuestion.value = null
  showEditDialog.value = true
}

const handleEdit = (question) => {
  editingQuestion.value = { ...question }
  showEditDialog.value = true
}

const handleView = (question) => {
  viewingQuestion.value = question
  showViewer.value = true
}

const handleDelete = async (question) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除题目"${question.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = questions.value.findIndex(q => q.id === question.id)
    if (index > -1) {
      questions.value.splice(index, 1)
      ElMessage.success('题目删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const handleSaveQuestion = (questionData) => {
  if (questionData.id) {
    // 编辑现有题目
    const index = questions.value.findIndex(q => q.id === questionData.id)
    if (index > -1) {
      questions.value[index] = {
        ...questions.value[index],
        ...questionData,
        updateTime: new Date().toISOString().split('T')[0]
      }
    }
    ElMessage.success('题目更新成功')
  } else {
    // 添加新题目
    const newQuestion = {
      ...questionData,
      id: `q${Date.now()}`,
      useCount: 0,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0]
    }
    questions.value.unshift(newQuestion)
    ElMessage.success('题目创建成功')
  }
}

const handleCommand = (command, question) => {
  switch (command) {
    case 'add-assignment':
      handleAddToAssignment(question)
      break
    case 'add-exam':
      handleAddToExam(question)
      break
    case 'duplicate':
      handleDuplicate(question)
      break
    case 'delete':
      handleDelete(question)
      break
  }
}

const handleAddToAssignment = (question) => {
  ElMessage.info(`将题目"${question.title}"添加到作业`)
}

const handleAddToExam = (question) => {
  ElMessage.info(`将题目"${question.title}"添加到考试`)
}

const handleDuplicate = (question) => {
  const newQuestion = {
    ...question,
    id: `q${Date.now()}`,
    title: `${question.title} (副本)`,
    useCount: 0,
    createTime: new Date().toISOString().split('T')[0],
    updateTime: new Date().toISOString().split('T')[0]
  }
  questions.value.unshift(newQuestion)
  ElMessage.success('题目复制成功')
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const goToAnalytics = () => {
  router.push('/question-bank/analytics')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const resetFilters = () => {
  searchKeyword.value = ''
  filters.value = {
    type: '',
    difficulty: '',
    subject: '',
    tags: [],
    dateRange: []
  }
  sortBy.value = 'createTime'
  sortOrder.value = 'desc'
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleTagsUpdated = (tags) => {
  availableTags.value = tags
}

const handleAIGeneratedQuestion = (question) => {
  // 添加AI生成的题目到列表
  const newQuestion = {
    ...question,
    id: `q${Date.now()}`,
    useCount: 0,
    createTime: new Date().toISOString().split('T')[0],
    updateTime: new Date().toISOString().split('T')[0],
    source: 'AI生成'
  }
  questions.value.unshift(newQuestion)
  ElMessage.success('AI生成的题目已添加到题库')
  announce('AI生成的题目已添加到题库', 'polite')
}

// 无障碍相关处理函数
const handleGlobalError = (error, instance, info) => {
  console.error('全局错误处理:', error)
  announce(`发生错误: ${error.message}`, 'assertive')
}

const handleRetry = () => {
  announce('正在重试操作...', 'polite')
  // 实现重试逻辑
  location.reload()
}

const selectAllQuestions = () => {
  announce('已选择所有题目', 'polite')
  // 实现全选逻辑
}

const closeAllDialogs = () => {
  showEditDialog.value = false
  showViewer.value = false
  showTagManager.value = false
  showAIHelper.value = false
  announce('已关闭所有对话框', 'polite')
}

// 辅助方法
const getTypeLabel = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    programming: '编程题',
    essay: '简答题'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    programming: 'danger',
    essay: ''
  }
  return typeMap[type] || ''
}

const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return difficultyMap[difficulty] || ''
}

// 监听筛选条件变化，重置分页
watch([searchKeyword, filters, sortBy, sortOrder], () => {
  currentPage.value = 1
})

onMounted(() => {
  console.log('题库管理页面加载完成')
})
</script>

<style lang="scss" scoped>
.question-bank-page {
  padding: 24px;
  background-color: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      color: var(--color-text-primary);
      font-size: 24px;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.easy { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
      &.medium { background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); }
      &.hard { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); }
    }

    .stat-content {
      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: var(--color-text-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin-top: 4px;
      }
    }
  }
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  .filter-row {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.questions-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--color-border-lighter);

    h3 {
      margin: 0;
      color: var(--color-text-primary);
    }
  }

  .questions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    padding: 20px;
  }

  .questions-table {
    padding: 0 20px 20px 20px;
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid var(--color-border-lighter);
}

// 跳转链接样式（无障碍）
.skip-links {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 9999;

  .skip-link {
    position: absolute;
    top: 0;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.3s, top 0.3s;

    &:focus {
      opacity: 1;
      top: 40px;
    }
  }
}
</style>