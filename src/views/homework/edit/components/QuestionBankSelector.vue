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
      <div class="filter-row">
        <el-select v-model="filterBank" placeholder="题库" clearable style="width: 180px">
          <el-option label="全部题库" value="" />
          <el-option 
            v-for="bank in questionBanks" 
            :key="bank.id" 
            :label="bank.name" 
            :value="bank.id" 
          />
        </el-select>

        <el-select v-model="filterType" placeholder="题型" clearable style="width: 140px">
          <el-option label="全部题型" value="" />
          <el-option label="单选题" value="single">
            <el-tag type="primary" size="small">单选</el-tag>
          </el-option>
          <el-option label="多选题" value="multiple">
            <el-tag type="success" size="small">多选</el-tag>
          </el-option>
          <el-option label="填空题" value="fill">
            <el-tag type="warning" size="small">填空</el-tag>
          </el-option>
          <el-option label="问答题" value="essay">
            <el-tag type="info" size="small">问答</el-tag>
          </el-option>
          <el-option label="编程题" value="programming">
            <el-tag type="danger" size="small">编程</el-tag>
          </el-option>
        </el-select>

        <el-select v-model="filterDifficulty" placeholder="难度" clearable style="width: 120px">
          <el-option label="全部难度" value="" />
          <el-option label="简单" value="easy">
            <el-tag type="success" size="small">简单</el-tag>
          </el-option>
          <el-option label="中等" value="medium">
            <el-tag type="warning" size="small">中等</el-tag>
          </el-option>
          <el-option label="困难" value="hard">
            <el-tag type="danger" size="small">困难</el-tag>
          </el-option>
        </el-select>

        <el-select
          v-model="filterTags"
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

        <el-button @click="clearFilters">
          <el-icon><RefreshLeft /></el-icon>
          清除筛选
        </el-button>

        <el-input
          v-model="searchText"
          placeholder="搜索题目内容或题号..."
          clearable
          style="width: 240px; margin-left: auto"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 筛选结果统计 -->
      <div class="filter-stats">
        <el-tag type="info" size="small">
          共找到 {{ filteredQuestions.length }} 道题目
        </el-tag>
        <el-tag v-if="filterBank" type="primary" size="small" closable @close="filterBank = ''">
          题库: {{ getBankName(filterBank) }}
        </el-tag>
        <el-tag v-if="filterType" type="success" size="small" closable @close="filterType = ''">
          题型: {{ getTypeLabel(filterType) }}
        </el-tag>
        <el-tag v-if="filterDifficulty" type="warning" size="small" closable @close="filterDifficulty = ''">
          难度: {{ getDifficultyLabel(filterDifficulty) }}
        </el-tag>
        <el-tag 
          v-for="tag in filterTags" 
          :key="tag" 
          size="small" 
          closable 
          @close="removeTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 题目列表 -->
    <el-table
      ref="tableRef"
      :data="paginatedQuestions"
      @selection-change="handleSelectionChange"
      style="margin-top: 16px"
      max-height="500px"
      stripe
      :empty-text="emptyText"
    >
      <el-table-column type="selection" width="55" :selectable="checkSelectable" />
      <el-table-column type="index" label="序号" width="60" :index="getTableIndex" />
      <el-table-column prop="id" label="题号" width="120">
        <template #default="{ row }">
          <el-text type="primary">{{ row.id }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="题型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="questionText" label="题目内容" min-width="350" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="question-text-cell">
            <span>{{ row.questionText }}</span>
            <el-button 
              link 
              type="primary" 
              size="small"
              @click="handlePreviewQuestion(row)"
            >
              <el-icon><View /></el-icon>
              预览
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="难度" width="100">
        <template #default="{ row }">
          <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
            {{ getDifficultyLabel(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分值" width="80" align="center">
        <template #default="{ row }">
          <el-text type="primary" style="font-weight: 600">{{ row.score }}分</el-text>
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
          <el-tooltip 
            v-if="row.tags.length > 2" 
            :content="row.tags.slice(2).join(', ')"
            placement="top"
          >
            <el-tag size="small">+{{ row.tags.length - 2 }}</el-tag>
          </el-tooltip>
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
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, View } from '@element-plus/icons-vue'
import { useMockStore } from '@/stores/mockStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  excludeQuestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const mockStore = useMockStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const tableRef = ref()
const searchText = ref('')
const filterBank = ref('')
const filterType = ref('')
const filterDifficulty = ref('')
const filterTags = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const selectedQuestions = ref([])

// 从 Mock Store 获取数据
const questionBanks = computed(() => mockStore.questionBanks)
const allQuestions = computed(() => mockStore.questions)

// 获取所有可用标签
const availableTags = computed(() => {
  const tags = new Set()
  allQuestions.value.forEach(q => {
    q.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

// 计算属性
const filteredQuestions = computed(() => {
  let result = allQuestions.value

  // 排除已添加的题目
  if (props.excludeQuestions.length > 0) {
    const excludeIds = props.excludeQuestions.map(q => q.questionId || q.id)
    result = result.filter(q => !excludeIds.includes(q.id))
  }

  // 题库筛选
  if (filterBank.value) {
    result = result.filter(q => q.bankId === filterBank.value)
  }

  // 题型筛选
  if (filterType.value) {
    result = result.filter(q => q.type === filterType.value)
  }

  // 难度筛选
  if (filterDifficulty.value) {
    result = result.filter(q => q.difficulty === filterDifficulty.value)
  }

  // 标签筛选
  if (filterTags.value.length > 0) {
    result = result.filter(q =>
      filterTags.value.some(tag => q.tags?.includes(tag))
    )
  }

  // 搜索筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(q =>
      q.questionText?.toLowerCase().includes(keyword) ||
      q.id?.toLowerCase().includes(keyword)
    )
  }

  return result
})

const total = computed(() => filteredQuestions.value.length)

// 分页后的题目
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

const selectedTotalScore = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => sum + (q.score || 0), 0)
})

const emptyText = computed(() => {
  if (allQuestions.value.length === 0) {
    return '暂无题目数据'
  }
  if (filteredQuestions.value.length === 0) {
    return '没有符合条件的题目，请调整筛选条件'
  }
  return '暂无数据'
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
  selectedQuestions.value = []
}

const clearFilters = () => {
  filterBank.value = ''
  filterType.value = ''
  filterDifficulty.value = ''
  filterTags.value = []
  searchText.value = ''
  currentPage.value = 1
}

const removeTag = (tag) => {
  const index = filterTags.value.indexOf(tag)
  if (index > -1) {
    filterTags.value.splice(index, 1)
  }
}

const checkSelectable = (row) => {
  // 可以添加额外的选择限制逻辑
  return true
}

const getTableIndex = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1
}

const getBankName = (bankId) => {
  const bank = questionBanks.value.find(b => b.id === bankId)
  return bank?.name || bankId
}

const handlePreviewQuestion = (question) => {
  ElMessage.info('题目预览功能开发中...')
  // TODO: 打开题目预览对话框
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
  // 重置筛选条件
  clearFilters()
}

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal) {
    // 确保 Mock Store 已初始化
    if (!mockStore.initialized) {
      mockStore.initialize()
    }
  }
})

// 组件挂载时初始化
onMounted(() => {
  if (!mockStore.initialized) {
    mockStore.initialize()
  }
})

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
  .filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .filter-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 0;
  }
}

.question-text-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
    color: #606266;

    strong {
      color: #409eff;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

:deep(.el-table) {
  .el-table__row {
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }
  }
}
</style>
