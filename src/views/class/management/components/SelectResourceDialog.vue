<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="select-resource-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 资源列表 -->
      <div class="resource-table">
        <el-table
          ref="tableRef"
          :data="filteredResources"
          @selection-change="handleSelectionChange"
          max-height="400"
        >
          <el-table-column type="selection" width="55" :reserve-selection="true" />
          <el-table-column
            v-for="column in tableColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
          >
            <template v-if="column.slot" #default="scope">
              <component :is="column.slot" :row="scope.row" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <span class="selected-count">已选择 {{ selectedResources.length }} 项</span>
        <div class="footer-actions">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, h } from 'vue'
import { ElTag } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '选择资源'
  },
  resourceType: {
    type: String,
    required: true,
    validator: (value) => ['courses', 'assignments', 'exams', 'teachers', 'students'].includes(value)
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// 响应式数据
const searchText = ref('')
const selectedResources = ref([])
const tableRef = ref()

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 根据资源类型获取表格列配置
const tableColumns = computed(() => {
  const columnsMap = {
    courses: [
      { prop: 'name', label: '课程名称', minWidth: 200 },
      { prop: 'category', label: '分类', width: 120 },
      { 
        prop: 'status', 
        label: '状态', 
        width: 100,
        slot: ({ row }) => h(ElTag, {
          type: row.status === 'active' ? 'success' : 'info',
          size: 'small'
        }, () => row.status === 'active' ? '进行中' : '已结束')
      }
    ],
    assignments: [
      { prop: 'name', label: '作业名称', minWidth: 200 },
      { prop: 'courseName', label: '所属课程', width: 150 },
      { prop: 'deadline', label: '截止时间', width: 180 }
    ],
    exams: [
      { prop: 'name', label: '考试名称', minWidth: 200 },
      { prop: 'courseName', label: '所属课程', width: 150 },
      { prop: 'examTime', label: '考试时间', width: 180 }
    ],
    teachers: [
      { prop: 'name', label: '姓名', width: 120 },
      { prop: 'teacherId', label: '工号', width: 120 },
      { prop: 'subjects', label: '授课科目', minWidth: 200 }
    ],
    students: [
      { prop: 'name', label: '姓名', width: 120 },
      { prop: 'studentId', label: '学号', width: 150 },
      { prop: 'mobile', label: '手机号', width: 150 },
      { prop: 'email', label: '邮箱', minWidth: 200 }
    ]
  }
  return columnsMap[props.resourceType] || []
})

// 获取资源数据（模拟）
const allResources = computed(() => {
  const resourcesMap = {
    courses: [
      { id: 'course_001', name: 'Python编程基础', category: '编程语言', status: 'active' },
      { id: 'course_002', name: '数据结构与算法', category: '计算机科学', status: 'active' },
      { id: 'course_003', name: 'Web前端开发', category: '前端技术', status: 'active' },
      { id: 'course_004', name: 'Java高级编程', category: '编程语言', status: 'active' },
      { id: 'course_005', name: '数据库原理', category: '数据库', status: 'active' }
    ],
    assignments: [
      { id: 'hw_001', name: 'Python基础练习1', courseName: 'Python编程基础', deadline: '2024-12-31 23:59' },
      { id: 'hw_002', name: '算法题目集', courseName: '数据结构与算法', deadline: '2024-12-25 23:59' },
      { id: 'hw_003', name: 'HTML/CSS作业', courseName: 'Web前端开发', deadline: '2024-12-28 23:59' },
      { id: 'hw_004', name: 'Java面向对象练习', courseName: 'Java高级编程', deadline: '2024-12-30 23:59' },
      { id: 'hw_005', name: 'SQL查询练习', courseName: '数据库原理', deadline: '2025-01-05 23:59' }
    ],
    exams: [
      { id: 'exam_001', name: 'Python期中考试', courseName: 'Python编程基础', examTime: '2024-12-20 14:00' },
      { id: 'exam_002', name: '算法期末考试', courseName: '数据结构与算法', examTime: '2025-01-10 14:00' },
      { id: 'exam_003', name: '前端综合测试', courseName: 'Web前端开发', examTime: '2024-12-22 14:00' },
      { id: 'exam_004', name: 'Java期末考试', courseName: 'Java高级编程', examTime: '2025-01-08 14:00' },
      { id: 'exam_005', name: '数据库期末考试', courseName: '数据库原理', examTime: '2025-01-12 14:00' }
    ],
    teachers: [
      { id: 'teacher_001', name: '王老师', teacherId: 'T001', subjects: '数学, 算法' },
      { id: 'teacher_002', name: '李老师', teacherId: 'T002', subjects: '语文' },
      { id: 'teacher_003', name: '张老师', teacherId: 'T003', subjects: '英语' },
      { id: 'teacher_004', name: '赵老师', teacherId: 'T004', subjects: '物理' },
      { id: 'teacher_005', name: '陈老师', teacherId: 'T005', subjects: '体育, 篮球' }
    ],
    students: [
      { id: 'student_001', name: '张三', studentId: 'S001', mobile: '13800138001', email: 'zhangsan@example.com' },
      { id: 'student_002', name: '李四', studentId: 'S002', mobile: '13800138002', email: 'lisi@example.com' },
      { id: 'student_003', name: '王五', studentId: 'S003', mobile: '13800138003', email: 'wangwu@example.com' },
      { id: 'student_004', name: '赵六', studentId: 'S004', mobile: '13800138004', email: 'zhaoliu@example.com' },
      { id: 'student_005', name: '孙七', studentId: 'S005', mobile: '13800138005', email: 'sunqi@example.com' }
    ]
  }
  return resourcesMap[props.resourceType] || []
})

// 过滤后的资源
const filteredResources = computed(() => {
  if (!searchText.value) return allResources.value
  
  return allResources.value.filter(resource => {
    return Object.values(resource).some(value => 
      String(value).toLowerCase().includes(searchText.value.toLowerCase())
    )
  })
})

// 方法
const handleSelectionChange = (selection) => {
  selectedResources.value = selection
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm', selectedResources.value)
}

// 初始化已选择的项
const initSelectedRows = () => {
  if (!tableRef.value || !props.selectedIds.length) return
  
  nextTick(() => {
    allResources.value.forEach(resource => {
      if (props.selectedIds.includes(resource.id)) {
        tableRef.value.toggleRowSelection(resource, true)
      }
    })
  })
}

// 监听对话框打开
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    searchText.value = ''
    selectedResources.value = []
    nextTick(() => {
      initSelectedRows()
    })
  }
})
</script>

<style lang="scss" scoped>
.select-resource-container {
  .search-bar {
    margin-bottom: 16px;
  }

  .resource-table {
    margin-bottom: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-count {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}
</style>
