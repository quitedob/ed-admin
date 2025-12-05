<template>
  <el-dialog
    v-model="visible"
    title="从题库中选题"
    width="90%"
    top="5vh"
    @close="handleClose"
  >
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-select v-model="filterBank" placeholder="题库" clearable style="width: 150px">
        <el-option label="全部题库" value="" />
        <el-option label="第一章基础题库" value="bank_001" />
        <el-option label="第二章进阶题库" value="bank_002" />
      </el-select>

      <el-select v-model="filterType" placeholder="题型" clearable style="width: 120px">
        <el-option label="全部题型" value="" />
        <el-option label="单选题" value="single" />
        <el-option label="多选题" value="multiple" />
        <el-option label="填空题" value="fill" />
        <el-option label="问答题" value="essay" />
        <el-option label="编程题" value="programming" />
      </el-select>

      <el-select
        v-model="filterTags"
        multiple
        placeholder="标签"
        clearable
        style="width: 200px"
      >
        <el-option label="基础" value="基础" />
        <el-option label="第一章" value="第一章" />
        <el-option label="进阶" value="进阶" />
      </el-select>

      <el-button @click="clearFilters">清除筛选</el-button>

      <el-input
        v-model="searchText"
        placeholder="搜索题目..."
        clearable
        style="width: 200px; margin-left: auto"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 题目列表 -->
    <el-table
      ref="tableRef"
      :data="filteredQuestions"
      @selection-change="handleSelectionChange"
      style="margin-top: 16px"
      max-height="500px"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="题号" width="120" />
      <el-table-column label="题型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="questionText" label="题目内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
            {{ getDifficultyLabel(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分值" width="80" align="center">
        <template #default="{ row }">
          {{ row.score }}分
        </template>
      </el-table-column>
      <el-table-column label="标签" width="200">
        <template #default="{ row }">
          <el-tag
            v-for="tag in row.tags.slice(0, 2)"
            :key="tag"
            size="small"
            style="margin-right: 4px"
          >
            {{ tag }}
          </el-tag>
          <span v-if="row.tags.length > 2">+{{ row.tags.length - 2 }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
      />
    </div>

    <!-- 底部统计和操作 -->
    <template #footer>
      <div class="footer-content">
        <div class="selection-info">
          <span>已选题目: <strong>{{ selectedQuestions.length }}</strong> 道</span>
          <span style="margin-left: 20px">总分: <strong>{{ selectedTotalScore }}</strong> 分</span>
        </div>
        <div class="footer-actions">
          <el-button @click="handleSelectAll">批量选择本页</el-button>
          <el-button @click="handleClearSelection">取消全选</el-button>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定添加</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const tableRef = ref()
const searchText = ref('')
const filterBank = ref('')
const filterType = ref('')
const filterTags = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const selectedQuestions = ref([])

// 模拟题目数据
const allQuestions = ref([
  {
    id: 'q_001',
    bankId: 'bank_001',
    type: 'single',
    questionText: '软件工程的核心目标是什么?',
    options: [
      { value: 'A', text: '提高开发速度', isCorrect: false },
      { value: 'B', text: '降低开发成本', isCorrect: false },
      { value: 'C', text: '提高软件质量和可维护性', isCorrect: false },
      { value: 'D', text: '增加代码量', isCorrect: false }
    ],
    correctAnswer: 'C',
    difficulty: 'easy',
    score: 2,
    tags: ['基础', '第一章']
  },
  {
    id: 'q_002',
    bankId: 'bank_001',
    type: 'multiple',
    questionText: '以下哪些是软件开发模型?',
    options: [
      { value: 'A', text: '瀑布模型', isCorrect: true },
      { value: 'B', text: '敏捷开发', isCorrect: true },
      { value: 'C', text: '螺旋模型', isCorrect: true },
      { value: 'D', text: '线性模型', isCorrect: false }
    ],
    difficulty: 'medium',
    score: 3,
    tags: ['基础', '第一章', '开发模型']
  },
  {
    id: 'q_003',
    bankId: 'bank_001',
    type: 'fill',
    questionText: '中国的首都是_____，有___个民族',
    fillBlanks: [
      { answers: ['北京', '北京市'] },
      { answers: ['56', '五十六'] }
    ],
    difficulty: 'easy',
    score: 2,
    tags: ['基础']
  },
  {
    id: 'q_004',
    bankId: 'bank_001',
    type: 'essay',
    questionText: '请简述软件工程的三要素',
    referenceAnswer: '1. 方法\n2. 工具\n3. 过程',
    difficulty: 'medium',
    score: 5,
    tags: ['基础', '第一章']
  },
  {
    id: 'q_005',
    bankId: 'bank_002',
    type: 'programming',
    questionText: '实现一个数组求和函数',
    hojProblemId: 'CF-1001',
    timeLimit: 1000,
    memoryLimit: 256,
    difficulty: 'easy',
    score: 10,
    tags: ['编程', '算法']
  }
])

// 计算属性
const filteredQuestions = computed(() => {
  let result = allQuestions.value

  // 题库筛选
  if (filterBank.value) {
    result = result.filter(q => q.bankId === filterBank.value)
  }

  // 题型筛选
  if (filterType.value) {
    result = result.filter(q => q.type === filterType.value)
  }

  // 标签筛选
  if (filterTags.value.length > 0) {
    result = result.filter(q =>
      filterTags.value.some(tag => q.tags.includes(tag))
    )
  }

  // 搜索筛选
  if (searchText.value) {
    result = result.filter(q =>
      q.questionText.includes(searchText.value) ||
      q.id.includes(searchText.value)
    )
  }

  return result
})

const total = computed(() => filteredQuestions.value.length)

const selectedTotalScore = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => sum + (q.score || 0), 0)
})

// 方法
const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

const handleSelectAll = () => {
  tableRef.value.toggleAllSelection()
}

const handleClearSelection = () => {
  tableRef.value.clearSelection()
}

const clearFilters = () => {
  filterBank.value = ''
  filterType.value = ''
  filterTags.value = []
  searchText.value = ''
}

const handleConfirm = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请至少选择一道题目')
    return
  }
  emit('select', selectedQuestions.value)
  handleClose()
}

const handleClose = () => {
  visible.value = false
  selectedQuestions.value = []
  tableRef.value?.clearSelection()
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答',
    programming: '编程'
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
</script>

<style lang="scss" scoped>
.filter-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .selection-info {
    font-size: 14px;
    color: var(--color-text-regular);

    strong {
      color: var(--color-primary);
      font-size: 16px;
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
