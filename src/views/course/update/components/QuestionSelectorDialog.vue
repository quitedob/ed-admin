<template>
  <el-dialog
    v-model="visible"
    title="从题库选择题目"
    :width="isFullscreen ? '100%' : '85%'"
    :fullscreen="isFullscreen"
    destroy-on-close
    :close-on-click-modal="false"
    class="question-selector-dialog"
  >
    <div class="question-selector">
      <!-- 搜索和筛选区域 -->
      <div class="filter-area">
        <!-- 第一行筛选 -->
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索题目内容、ID或标签..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedSubject" placeholder="学科分类" clearable @change="handleSearch">
              <el-option label="全部学科" value="" />
              <el-option
                v-for="subject in SUBJECT_OPTIONS"
                :key="subject.value"
                :label="subject.label"
                :value="subject.value"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedType" placeholder="题型筛选" clearable @change="handleSearch">
              <el-option label="全部题型" value="" />
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="填空题" value="fill" />
              <el-option label="判断题" value="judge" />
              <el-option label="OJ编程题" value="programming" />
              <el-option label="Scratch题" value="scratch" />
              <el-option label="简答题" value="essay" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedDifficulty" placeholder="难度筛选" clearable @change="handleSearch">
              <el-option label="全部难度" value="" />
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <div class="selected-count">
              <el-tag type="info">已选择 {{ selectedQuestions.length }} 道题目</el-tag>
            </div>
          </el-col>
        </el-row>

        <!-- 批量输入题目ID区域 -->
        <el-row :gutter="16" style="margin-top: 16px;">
          <el-col :span="20">
            <el-input
              v-model="batchQuestionIds"
              type="textarea"
              :rows="2"
              placeholder="批量输入题目ID，用分号(;)分隔，直接添加到练习作业：q_001;q_002;q_003"
              clearable
            />
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              @click="handleBatchAddQuestions"
              :disabled="!batchQuestionIds.trim()"
              style="width: 100%; height: 100%;"
            >
              批量添加并确认
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 题目列表 -->
      <div class="question-list">
        <el-table
          ref="questionTable"
          :data="filteredQuestions"
          @selection-change="handleSelectionChange"
          max-height="500"
          stripe
          row-key="id"
        >
          <el-table-column type="selection" width="55" :reserve-selection="true" />
          <el-table-column label="ID" prop="id" width="120" />
          <el-table-column label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题目内容" min-width="300" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="question-content">
                {{ row.questionText }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="学科分类" width="120">
            <template #default="{ row }">
              <el-tag
                v-if="row.subject"
                :type="getSubjectTagType(row.subject)"
                size="small"
              >
                {{ getSubjectLabel(row.subject) }}
              </el-tag>
              <span v-else class="no-subject">未分类</span>
            </template>
          </el-table-column>
          <el-table-column label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标签" width="200">
            <template #default="{ row }">
              <div class="tag-container">
                <el-tag
                  v-for="tag in (row.tags || [])"
                  :key="tag"
                  size="small"
                  effect="light"
                  style="margin: 2px;"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="!row.tags || row.tags.length === 0" class="no-tags">
                  暂无标签
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalQuestions"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <template #header>
      <div class="dialog-header">
        <span>从题库选择题目</span>
        <div class="header-actions">
          <el-button
            type="text"
            @click="toggleFullscreen"
            :icon="isFullscreen ? 'Close' : 'FullScreen'"
          >
            {{ isFullscreen ? '退出全屏' : '全屏' }}
          </el-button>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="selectedQuestions.length === 0" @click="handleConfirm">
          确认选择 ({{ selectedQuestions.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { SUBJECT_OPTIONS, getSubjectLabel } from '@/constants/subjects.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialSelectedQuestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const searchKeyword = ref('')
const selectedSubject = ref('')
const selectedType = ref('')
const selectedDifficulty = ref('')
const selectedQuestions = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalQuestions = ref(0)
const batchQuestionIds = ref('')
const questionTable = ref(null)
const isFullscreen = ref(true) // 默认全屏

// 模拟题库数据
const allQuestions = ref([])

// 计算属性
const filteredQuestions = computed(() => {
  let questions = [...allQuestions.value]

  // 搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    questions = questions.filter(q =>
      q.questionText?.toLowerCase().includes(keyword) ||
      q.id?.toLowerCase().includes(keyword) ||
      q.tags?.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 学科分类过滤
  if (selectedSubject.value) {
    questions = questions.filter(q => (q.subject || '') === selectedSubject.value)
  }

  // 题型过滤
  if (selectedType.value) {
    questions = questions.filter(q => q.type === selectedType.value)
  }

  // 难度过滤
  if (selectedDifficulty.value) {
    questions = questions.filter(q => q.difficulty === selectedDifficulty.value)
  }

  return questions
})

// 题型相关方法
const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    essay: '简答',
    programming: 'OJ',
    scratch: 'Scratch'
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
    programming: 'danger',
    scratch: 'warning'
  }
  return map[type] || ''
}

// 难度相关方法
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

// 使用导入的 getSubjectLabel 函数

const getSubjectTagType = (subject) => {
  const map = {
    cpp_programming: 'primary',
    python: 'success',
    graphical_programming: 'warning',
    chinese: 'danger',
    math: '',
    english: 'info',
    physics: 'warning',
    chemistry: 'success',
    biology: 'primary',
    history: '',
    geography: 'info'
  }
  return map[subject] || 'info'
}

// 初始化模拟题库数据
const initMockQuestions = () => {
  allQuestions.value = [
    {
      id: 'q_001',
      type: 'single',
      questionText: '以下哪个不是面向对象编程的特性？',
      difficulty: 'easy',
      subject: 'python',
      tags: ['面向对象', '基础概念'],
      options: ['封装', '继承', '多态', '编译'],
      correctAnswer: 'D'
    },
    {
      id: 'q_002',
      type: 'multiple',
      questionText: '以下哪些是Python的基本数据类型？',
      difficulty: 'easy',
      subject: 'python',
      tags: ['Python', '基础语法'],
      options: ['int', 'str', 'bool', 'float'],
      correctAnswer: ['A', 'B', 'C', 'D']
    },
    {
      id: 'q_003',
      type: 'fill',
      questionText: 'Python中，___是所有类的父类',
      difficulty: 'medium',
      subject: 'python',
      tags: ['Python', '面向对象'],
      correctAnswer: 'object'
    },
    {
      id: 'q_004',
      type: 'judge',
      questionText: 'Python中，抽象基类可以包含方法的实现。',
      difficulty: 'medium',
      subject: 'python',
      tags: ['Python', '抽象基类'],
      correctAnswer: true
    },
    {
      id: 'q_005',
      type: 'programming',
      questionText: '实现一个函数，判断一个字符串是否为回文串',
      difficulty: 'medium',
      subject: 'cpp_programming',
      tags: ['算法', '字符串'],
      hojProblemId: '1001',
      timeLimit: 1000,
      memoryLimit: 256
    },
    {
      id: 'q_006',
      type: 'essay',
      questionText: '请简述MVC设计模式的核心思想及其优点。',
      difficulty: 'hard',
      subject: 'cpp_programming',
      tags: ['设计模式', '架构'],
      referenceAnswer: 'MVC将应用分为Model、View、Controller三层'
    },
    {
      id: 'q_007',
      type: 'single',
      questionText: '下列哪个矩阵是可逆的？',
      difficulty: 'medium',
      subject: 'math',
      tags: ['矩阵运算'],
      options: ['[1 2; 2 4]', '[1 0; 0 1]', '[0 0; 0 0]', '[1 1; 1 1]'],
      correctAnswer: 'B'
    },
    {
      id: 'q_008',
      type: 'fill',
      questionText: '设随机变量X服从正态分布N(2, 9)，则P(X≤5) = ___',
      difficulty: 'hard',
      subject: 'math',
      tags: ['概率计算'],
      correctAnswer: '0.841'
    },
    {
      id: 'q_009',
      type: 'multiple',
      questionText: '下列哪些单词的过去式与原形相同？',
      difficulty: 'easy',
      subject: 'english',
      tags: ['词汇辨析'],
      options: ['put', 'go', 'cut', 'run'],
      correctAnswer: ['A', 'C']
    },
    {
      id: 'q_010',
      type: 'judge',
      questionText: '现在完成时可以表示从过去开始持续到现在的动作。',
      difficulty: 'medium',
      subject: 'english',
      tags: ['时态用法'],
      correctAnswer: true
    },
    {
      id: 'q_011',
      type: 'scratch',
      questionText: '使用Scratch创建一个简单的动画故事',
      difficulty: 'easy',
      subject: 'graphical_programming',
      tags: ['Scratch', '创意编程']
    },
    {
      id: 'q_012',
      type: 'single',
      questionText: '二分查找的时间复杂度是？',
      difficulty: 'easy',
      subject: 'python',
      tags: ['算法', '数据结构'],
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 'B'
    },
    {
      id: 'q_013',
      type: 'fill',
      questionText: '中国第一个朝代是___',
      difficulty: 'easy',
      subject: 'history',
      tags: ['中国古代史'],
      correctAnswer: '夏朝'
    },
    {
      id: 'q_014',
      type: 'single',
      questionText: '光合作用的主要产物是什么？',
      difficulty: 'easy',
      subject: 'biology',
      tags: ['生物化学'],
      options: ['二氧化碳', '氧气', '氮气', '氢气'],
      correctAnswer: 'B'
    },
    {
      id: 'q_015',
      type: 'judge',
      questionText: '长江是中国最长的河流。',
      difficulty: 'easy',
      subject: 'geography',
      tags: ['中国地理'],
      correctAnswer: true
    }
  ]

  totalQuestions.value = allQuestions.value.length
}

// 事件处理方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
}

// 批量添加题目处理
const handleBatchAddQuestions = () => {
  if (!batchQuestionIds.value.trim()) {
    ElMessage.warning('请输入题目ID')
    return
  }

  // 解析输入的题目ID
  const inputIds = batchQuestionIds.value.split(';').map(id => id.trim()).filter(id => id)

  if (inputIds.length === 0) {
    ElMessage.warning('请输入有效的题目ID')
    return
  }

  // 查找对应的题目
  const foundQuestions = []
  const notFoundIds = []
  const alreadySelectedIds = []

  inputIds.forEach(id => {
    const question = allQuestions.value.find(q => q.id === id)
    if (question) {
      // 检查是否已经选择过
      const alreadySelected = selectedQuestions.value.find(q => q.id === id)
      if (!alreadySelected) {
        foundQuestions.push(question)
      } else {
        alreadySelectedIds.push(id)
      }
    } else {
      notFoundIds.push(id)
    }
  })

  // 添加找到的题目到已选择列表
  if (foundQuestions.length > 0) {
    selectedQuestions.value = [...selectedQuestions.value, ...foundQuestions]

    // 直接关闭对话框并提交结果（跳过表格选择状态同步）
    setTimeout(() => {
      emit('confirm', selectedQuestions.value)
      handleClose()
      ElMessage.success(`成功添加 ${foundQuestions.length} 道题目到练习作业`)
    }, 100)
  }

  if (alreadySelectedIds.length > 0) {
    ElMessage.info(`以下题目已经选择过: ${alreadySelectedIds.join(', ')}`)
  }

  if (notFoundIds.length > 0) {
    ElMessage.warning(`以下题目ID未找到: ${notFoundIds.join(', ')}`)
  }

  // 如果没有任何题目被添加，只清空输入框但不关闭对话框
  if (foundQuestions.length === 0) {
    if (alreadySelectedIds.length === 0) {
      ElMessage.error('没有找到任何有效的题目，请检查题目ID是否正确')
    } else {
      ElMessage.info('所有输入的题目都已经选择过了')
    }
  }

  // 只有在找到题目时才清空输入框，否则保留用户输入方便修改
  if (foundQuestions.length > 0) {
    batchQuestionIds.value = ''
  }
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleConfirm = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }

  emit('confirm', selectedQuestions.value)
  handleClose()
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    // 重置选择状态
    selectedQuestions.value = [...props.initialSelectedQuestions]

    // 延迟设置表格选择状态
    setTimeout(() => {
      if (questionTable.value && selectedQuestions.value.length > 0) {
        // 设置初始已选择的项目
        selectedQuestions.value.forEach(selectedQuestion => {
          const question = allQuestions.value.find(q => q.id === selectedQuestion.id)
          if (question) {
            questionTable.value.toggleRowSelection(question, true)
          }
        })
      }
    }, 100)
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  initMockQuestions()
})
</script>

<style lang="scss" scoped>
.question-selector-dialog {
  :deep(.el-dialog) {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  :deep(.el-dialog__header) {
    padding: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;

  span {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.question-selector {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  .filter-area {
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;
    flex-shrink: 0;

    .selected-count {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .question-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .question-content {
      max-height: 60px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }

    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .no-tags {
      color: #909399;
      font-size: 12px;
      font-style: italic;
    }

    .no-subject {
      color: #909399;
      font-size: 12px;
      font-style: italic;
    }

    :deep(.el-table) {
      flex: 1;

      .el-table__body-wrapper {
        max-height: calc(100vh - 400px);
        overflow-y: auto;
      }
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
}

.dialog-footer {
  text-align: right;
}
</style>