<template>
  <el-drawer
    v-model="visible"
    title="添加题目"
    size="90%"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="question-management-drawer">
      <!-- 左侧工具栏 -->
      <div class="left-sidebar">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" class="btn-full" @click="handleCreateQuestion">
            <el-icon><Plus /></el-icon>
            新建题目
          </el-button>
          <el-button class="btn-full" @click="handleImportQuestions">
            <el-icon><Upload /></el-icon>
            导入题目
          </el-button>
        </div>

        <!-- 筛选器 -->
        <div class="filters">
          <div class="filter-section">
            <div class="filter-label">题型</div>
            <el-select v-model="filterType" placeholder="全部题型" clearable>
              <el-option label="全部题型" value="" />
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="填空题" value="fill" />
              <el-option label="判断题" value="judge" />
              <el-option label="简答题" value="essay" />
              <el-option label="OJ题" value="programming" />
            </el-select>
          </div>

          <div class="filter-section">
            <div class="filter-label">难度</div>
            <el-select v-model="filterDifficulty" placeholder="全部难度" clearable>
              <el-option label="全部难度" value="" />
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchText"
            placeholder="搜索题目..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <div class="content-header">
          <h2>题目库</h2>
          <div class="stats">
            <span>共 {{ filteredQuestions.length }} 道题目</span>
            <span>已选择 {{ selectedQuestions.length }} 道</span>
          </div>
        </div>

        <!-- 题目表格 -->
        <el-table
          ref="tableRef"
          :data="paginatedQuestions"
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
        >
          <el-table-column type="selection" width="50" />

          <el-table-column label="题目" prop="questionText" min-width="250" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="question-title">
                <span class="title-text">{{ row.questionText }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="题型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="分值" width="80" align="center" prop="score" />

          <el-table-column label="标签" min-width="150">
            <template #default="{ row }">
              <el-tag
                v-for="tag in (row.tags || [])"
                :key="tag"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
              <span v-if="!row.tags || row.tags.length === 0" class="no-tags">
                暂无标签
              </span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleViewQuestion(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEditQuestion(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteQuestion(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredQuestions.length"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; text-align: right"
        />
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <span class="selected-info">已选择 {{ selectedQuestions.length }} 道题目</span>
        <div class="footer-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedQuestions.length === 0">
            确定添加
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  bankId: String
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const tableRef = ref(null)
const searchText = ref('')
const filterType = ref('')
const filterDifficulty = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const selectedQuestions = ref([])

// 模拟题库数据
const questions = ref([
  {
    id: 'q_001',
    questionText: '以下哪个不是面向对象编程的特性？',
    type: 'single',
    difficulty: 'easy',
    score: 2,
    tags: ['面向对象', '基础概念', 'Java']
  },
  {
    id: 'q_002',
    questionText: '以下哪些是Java的基本数据类型？',
    type: 'multiple',
    difficulty: 'easy',
    score: 3,
    tags: ['Java基础', '数据类型']
  },
  {
    id: 'q_003',
    questionText: 'Java中，___是所有类的父类，___方法用于比较两个对象是否相等。',
    type: 'fill',
    difficulty: 'medium',
    score: 4,
    tags: ['Java基础', '面向对象', '填空题']
  },
  {
    id: 'q_004',
    questionText: 'Java中，接口可以包含方法的实现。',
    type: 'judge',
    difficulty: 'medium',
    score: 2,
    tags: ['Java', '接口', '判断题']
  },
  {
    id: 'q_005',
    questionText: '实现一个函数，判断一个字符串是否为回文串',
    type: 'programming',
    difficulty: 'medium',
    score: 10,
    tags: ['算法', '字符串', '双指针', '编程题']
  },
  {
    id: 'q_006',
    questionText: '请简述MVC设计模式的核心思想及其优点。',
    type: 'essay',
    difficulty: 'hard',
    score: 10,
    tags: ['设计模式', '架构', '简答题']
  }
])

// 过滤题目
const filteredQuestions = computed(() => {
  let result = questions.value

  if (searchText.value) {
    result = result.filter(q =>
      q.questionText.includes(searchText.value) ||
      (q.tags && q.tags.some(t => t.includes(searchText.value)))
    )
  }

  if (filterType.value) {
    result = result.filter(q => q.type === filterType.value)
  }

  if (filterDifficulty.value) {
    result = result.filter(q => q.difficulty === filterDifficulty.value)
  }

  return result
})

// 分页题目
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuestions.value.slice(start, end)
})

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    oj: 'OJ',
    essay: '简答',
    programming: 'OJ'
  }
  return map[type] || type
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
}

const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

const handleViewQuestion = (question) => {
  ElMessage.info(`查看题目: ${question.questionText}`)
}

const handleEditQuestion = (question) => {
  ElMessage.info(`编辑题目: ${question.questionText}`)
}

const handleDeleteQuestion = (question) => {
  ElMessageBox.confirm(
    `确定删除题目 "${question.questionText}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = questions.value.findIndex(q => q.id === question.id)
    if (index > -1) {
      questions.value.splice(index, 1)
    }
    ElMessage.success('题目已删除')
  }).catch(() => {})
}

const handleCreateQuestion = () => {
  ElMessage.info('新建题目功能开发中...')
}

const handleImportQuestions = () => {
  ElMessage.info('导入题目功能开发中...')
}

const handleConfirm = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择题目')
    return
  }

  emit('save', selectedQuestions.value)
  handleCancel()
}

const handleCancel = () => {
  visible.value = false
  resetDrawer()
}

const handleVisibleChange = (val) => {
  if (!val) {
    resetDrawer()
  }
}

const resetDrawer = () => {
  selectedQuestions.value = []
  searchText.value = ''
  filterType.value = ''
  filterDifficulty.value = ''
  currentPage.value = 1
}

defineExpose({
  resetDrawer
})
</script>

<style lang="scss" scoped>
.question-management-drawer {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 左侧工具栏 */
.left-sidebar {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 16px;
  border-right: 1px solid var(--color-border-lighter);

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .btn-full {
      width: 100%;
    }
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .filter-section {
      .filter-label {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .el-select {
        width: 100%;
      }
    }
  }

  .search-section {
    margin-top: auto;
  }
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }

  .el-table {
    flex: 1;
    overflow-y: auto;
  }

  .el-pagination {
    margin-top: 16px;
    text-align: right;
  }
}

.question-title {
  display: flex;
  align-items: center;
  gap: 8px;

  .title-text {
    color: var(--color-text-primary);
  }
}

.no-tags {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-info {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
