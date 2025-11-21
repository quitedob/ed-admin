<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="800px"
    @close="handleClose"
  >
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        :placeholder="searchPlaceholder"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      :data="filteredData"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      max-height="400"
      style="margin-top: 16px"
    >
      <el-table-column
        type="selection"
        width="55"
        :selectable="checkSelectable"
      />
      
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :formatter="column.formatter"
      >
        <template v-if="column.slot" #default="scope">
          <slot :name="column.slot" :row="scope.row" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredData.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        small
      />
    </div>

    <!-- 已选择提示 -->
    <div v-if="selectedItems.length > 0" class="selected-info">
      <span>已选择 {{ selectedItems.length }} 项</span>
      <el-button link type="primary" size="small" @click="handleClearSelection">
        清空选择
      </el-button>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedItems.length === 0">
          确定（{{ selectedItems.length }}）
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  entityType: {
    type: String,
    required: true,
    validator: (value) => ['student', 'teacher', 'course', 'assignment', 'exam'].includes(value)
  },
  multiple: {
    type: Boolean,
    default: true
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },
  // 外部传入的数据源
  dataSource: {
    type: Array,
    default: () => []
  },
  // 外部传入的列配置
  columnConfig: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const tableRef = ref()
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedItems = ref([])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const computedTitle = computed(() => {
  if (props.title) return props.title
  const typeMap = {
    student: '选择学生',
    teacher: '选择老师',
    course: '选择课程',
    assignment: '选择作业',
    exam: '选择考试'
  }
  return typeMap[props.entityType] || '选择'
})

const computedSearchPlaceholder = computed(() => {
  if (props.searchPlaceholder !== '搜索...') return props.searchPlaceholder
  const typeMap = {
    student: '搜索学号、姓名...',
    teacher: '搜索工号、姓名...',
    course: '搜索课程名称...',
    assignment: '搜索作业名称...',
    exam: '搜索考试名称...'
  }
  return typeMap[props.entityType] || '搜索...'
})

// 默认列配置
const defaultColumns = computed(() => {
  const columnMap = {
    student: [
      { prop: 'studentId', label: '学号', width: 120 },
      { prop: 'name', label: '姓名', width: 120 },
      { prop: 'phone', label: '手机号', width: 150 },
      { prop: 'email', label: '邮箱', minWidth: 180 }
    ],
    teacher: [
      { prop: 'teacherId', label: '工号', width: 120 },
      { prop: 'name', label: '姓名', width: 120 },
      { prop: 'mobile', label: '手机号', width: 150 },
      { prop: 'subjects', label: '授课科目', minWidth: 180, slot: 'subjects' }
    ],
    course: [
      { prop: 'name', label: '课程名称', minWidth: 200 },
      { prop: 'category', label: '分类', width: 120 },
      { prop: 'lessonCount', label: '课次数', width: 100 }
    ],
    assignment: [
      { prop: 'title', label: '作业名称', minWidth: 200 },
      { prop: 'courseName', label: '所属课程', width: 150 },
      { prop: 'dueDate', label: '截止时间', width: 180 }
    ],
    exam: [
      { prop: 'title', label: '考试名称', minWidth: 200 },
      { prop: 'type', label: '类型', width: 120 },
      { prop: 'startTime', label: '考试时间', width: 180 }
    ]
  }
  return columnMap[props.entityType] || []
})

const columns = computed(() => {
  return props.columnConfig.length > 0 ? props.columnConfig : defaultColumns.value
})

// 过滤后的数据
const filteredData = computed(() => {
  let result = props.dataSource

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(keyword)
        }
        if (Array.isArray(value)) {
          return value.some(v => String(v).toLowerCase().includes(keyword))
        }
        return false
      })
    })
  }

  return result
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const handleClearSelection = () => {
  tableRef.value.clearSelection()
  selectedItems.value = []
}

const checkSelectable = (row) => {
  // 如果是单选模式，且已经选择了其他项，则不可选
  if (!props.multiple && selectedItems.value.length > 0) {
    return selectedItems.value[0].id === row.id
  }
  return true
}

const handleClose = () => {
  emit('update:modelValue', false)
  // 重置状态
  searchKeyword.value = ''
  currentPage.value = 1
  selectedItems.value = []
}

const handleConfirm = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请至少选择一项')
    return
  }

  const selectedIds = selectedItems.value.map(item => item.id)
  emit('confirm', {
    ids: selectedIds,
    items: selectedItems.value
  })
  handleClose()
}

// 监听对话框打开，设置已选中的项
watch(() => props.modelValue, async (visible) => {
  if (visible && props.selectedIds.length > 0) {
    await nextTick()
    // 设置已选中的行
    props.dataSource.forEach(item => {
      if (props.selectedIds.includes(item.id)) {
        tableRef.value.toggleRowSelection(item, true)
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.search-bar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.selected-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-top: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
