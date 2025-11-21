<template>
  <div id="question-list-view" class="question-list-view">
    <!-- 工具栏 -->
    <div id="toolbar" class="toolbar">
      <el-button id="add-question-btn" type="primary" @click="handleAddQuestion">
        <el-icon><Plus /></el-icon>
        新建题目
      </el-button>
      <el-button id="batch-import-btn" @click="handleBatchImport">批量导入</el-button>
      <el-button id="manage-tags-btn" @click="handleManageTags">标签管理</el-button>

      <div id="toolbar-right" class="toolbar-right">
        <el-input
          id="search-input"
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

    <!-- 题目列表 -->
    <el-table id="question-table" :data="filteredQuestions" stripe style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="题号" width="120" />
      <el-table-column prop="type" label="题型" width="100">
        <template #default="{ row, $index }">
          <el-tag :id="`type-tag-${$index}`" :type="getTypeTagType(row.type)" size="small">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="questionText" label="题目内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="{ row, $index }">
          <el-tag :id="`difficulty-tag-${$index}`" :type="getDifficultyTagType(row.difficulty)" size="small">
            {{ getDifficultyLabel(row.difficulty) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tags" label="标签" width="200">
        <template #default="{ row, $index }">
          <el-tag
            v-for="(tag, tagIndex) in row.tags.slice(0, 2)"
            :id="`tag-${$index}-${tagIndex}`"
            :key="tag"
            size="small"
            style="margin-right: 4px"
          >
            {{ tag }}
          </el-tag>
          <span v-if="row.tags.length > 2" :id="`more-tags-${$index}`">+{{ row.tags.length - 2 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row, $index }">
          <el-button :id="`edit-btn-${$index}`" link type="primary" size="small" @click="$emit('edit', row)">
            编辑
          </el-button>
          <el-button :id="`delete-btn-${$index}`" link type="danger" size="small" @click="$emit('delete', row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div id="pagination" class="pagination">
      <el-pagination
        id="question-pagination"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- V2 新建/编辑题目对话框 -->
    <V2QuestionEditDialog
      id="v2-question-edit-dialog"
      v-model="questionDialogVisible"
      :question-data="currentQuestion"
      @save="handleSaveQuestion"
    />

    <!-- 标签管理对话框 -->
    <TagManageDialog
      id="tag-manage-dialog"
      v-model="tagDialogVisible"
      :tags="availableTags"
      @save="handleSaveTags"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import V2QuestionEditDialog from '@/components/V2QuestionEditDialog.vue'
import TagManageDialog from './TagManageDialog.vue'

const props = defineProps({
  bankId: {
    type: String,
    required: true
  },
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

// 响应式数据
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const questionDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const currentQuestion = ref(null)
const availableTags = ref([
  { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 },
  { id: 'tag_002', name: '第一章', color: '#67C23A', usage: 50 }
])

// 计算属性
const filteredQuestions = computed(() => {
  let result = props.questions
  if (searchText.value) {
    result = result.filter(q =>
      q.questionText.includes(searchText.value) ||
      q.id.includes(searchText.value)
    )
  }
  return result
})

const total = computed(() => filteredQuestions.value.length)

// 方法
const handleAddQuestion = () => {
  currentQuestion.value = null
  questionDialogVisible.value = true
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleManageTags = () => {
  tagDialogVisible.value = true
}

const handleSaveQuestion = (questionData) => {
  ElMessage.success('题目保存成功')
  questionDialogVisible.value = false
}

const handleSaveTags = (tags) => {
  availableTags.value = tags
  ElMessage.success('标签保存成功')
  tagDialogVisible.value = false
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
.question-list-view {
  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .toolbar-right {
      margin-left: auto;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
