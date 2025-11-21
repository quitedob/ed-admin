<template>
  <el-dialog
      id="question-selector-dialog"
      v-model="visible"
      title="从题库选择题目"
      width="90%"
      @close="handleClose"
  >
    <div id="question-selector" class="question-selector">
      <!-- 筛选区域 -->
      <div id="question-filter-section" class="filter-section">
        <el-input
          id="question-search-input"
          v-model="searchText"
          placeholder="搜索题目..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          id="question-type-filter"
          v-model="filterType"
          placeholder="题型"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="填空题" value="fillBlank" />
          <el-option label="判断题" value="judge" />
        </el-select>

        <el-select
          id="question-difficulty-filter"
          v-model="filterDifficulty"
          placeholder="难度"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </div>

      <!-- 题目列表 -->
      <el-table
        id="question-table"
        :data="filteredQuestions"
        stripe
        style="width: 100%; margin-top: 16px"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="题目" min-width="200" />
        <el-table-column prop="type" label="题型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)" size="small">
              {{ getDifficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分值" width="80" align="center" />
        <el-table-column label="标签" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin-right: 4px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewQuestion(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        id="question-pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredQuestions.length"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; text-align: right"
      />
    </div>

    <template #footer>
      <span id="selected-count">已选择 {{ selectedQuestions.length }} 道题目</span>
      <el-button id="cancel-question-select-btn" @click="handleClose">取消</el-button>
      <el-button id="confirm-question-select-btn" type="primary" @click="handleConfirm" :disabled="selectedQuestions.length === 0">
        确定添加
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchText = ref('')
const filterType = ref('')
const filterDifficulty = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedQuestions = ref([])

// 模拟题库数据
const questions = ref([
  {
    id: 'q_001',
    title: '解方程：2x + 3 = 11',
    type: 'single',
    difficulty: 'easy',
    score: 5,
    tags: ['一元一次方程', '基础']
  },
  {
    id: 'q_002',
    title: '求二次函数 y = x² - 2x + 1 的顶点',
    type: 'multiple',
    difficulty: 'medium',
    score: 5,
    tags: ['二次函数', '应用']
  },
  {
    id: 'q_003',
    title: '判断：3 > 2',
    type: 'judge',
    difficulty: 'easy',
    score: 2,
    tags: ['基础', '判断']
  },
  {
    id: 'q_004',
    title: '填空：圆的周长公式是 ___',
    type: 'fillBlank',
    difficulty: 'easy',
    score: 3,
    tags: ['圆', '基础']
  },
  {
    id: 'q_005',
    title: '证明：三角形ABC中，AB = AC，则∠B = ∠C',
    type: 'single',
    difficulty: 'hard',
    score: 10,
    tags: ['几何证明', '困难']
  },
  {
    id: 'q_006',
    title: '计算：(2x + 3)² 的展开式',
    type: 'multiple',
    difficulty: 'medium',
    score: 5,
    tags: ['代数', '应用']
  }
])

const filteredQuestions = computed(() => {
  let result = questions.value

  if (searchText.value) {
    result = result.filter(q =>
      q.title.includes(searchText.value) ||
      q.tags.some(t => t.includes(searchText.value))
    )
  }

  if (filterType.value) {
    result = result.filter(q => q.type === filterType.value)
  }

  if (filterDifficulty.value) {
    result = result.filter(q => q.difficulty === filterDifficulty.value)
  }

  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fillBlank: '填空',
    judge: '判断',
    oj: 'OJ',
    essay: '简答'
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

const viewQuestion = (question) => {
  ElMessage.info(`查看题目: ${question.title}`)
}

const handleConfirm = () => {
  emit('select', selectedQuestions.value)
  handleClose()
}

const handleClose = () => {
  visible.value = false
  selectedQuestions.value = []
  searchText.value = ''
  filterType.value = ''
  filterDifficulty.value = ''
  currentPage.value = 1
}
</script>

<style scoped>
.question-selector {
  padding: 20px 0;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
