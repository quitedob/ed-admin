<template>
  <div class="student-list-container" id="users-student-list-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar" id="users-student-top-bar">
      <div class="title-section">
        <h2>学生管理</h2>
        <div class="stats">
          <span>共 {{ filteredStudents.length }} 名学生</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建学生
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedStudents.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar" id="users-student-filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索学号、姓名..."
        clearable
        style="width: 250px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterClass" placeholder="班级" clearable style="width: 180px">
        <el-option label="全部班级" value="" />
        <el-option label="前端开发一班" value="class_001" />
        <el-option label="前端开发二班" value="class_002" />
        <el-option label="数据科学班" value="class_003" />
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px">
        <el-option label="全部状态" value="" />
        <el-option label="新生" value="new" />
        <el-option label="在读" value="studying" />
        <el-option label="停课" value="suspended" />
        <el-option label="封存" value="archived" />
        <el-option label="结课" value="finished" />
        <el-option label="退费" value="refunded" />
      </el-select>

      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 学生表格 -->
    <div class="table-container" id="users-student-table-container">
      <el-table
        :data="paginatedStudents"
        @selection-change="handleSelectionChange"
        stripe
        id="users-student-data-table"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="班级数" width="100" align="center">
          <template #default="scope">
            {{ scope.row.classes?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="学习时长" width="120" align="center">
          <template #default="scope">
            {{ formatLearningTime(scope.row.statistics?.learningTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="启用/禁用" width="100" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isDisabled"
              :active-value="false"
              :inactive-value="true"
              @change="handleToggleDisable(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleViewDetail(scope.row)">
                查看
              </el-button>
              <el-button link type="warning" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredStudents.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 新建/编辑学生对话框 -->
    <StudentDialog
      v-model="studentDialogVisible"
      :student-data="currentStudent"
      @save="handleSaveStudent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Search
} from '@element-plus/icons-vue'
import StudentDialog from './components/StudentDialog.vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterClass = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedStudents = ref([])
const studentDialogVisible = ref(false)
const currentStudent = ref(null)

const students = ref([])

// 计算属性
const filteredStudents = computed(() => {
  let result = students.value

  if (searchText.value) {
    result = result.filter(s =>
      s.studentId.includes(searchText.value) ||
      s.name.includes(searchText.value) ||
      s.phone.includes(searchText.value) ||
      s.email?.includes(searchText.value)
    )
  }

  if (filterClass.value) {
    result = result.filter(s =>
      s.classes.some(c => c.id === filterClass.value)
    )
  }

  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }

  return result
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredStudents.value.slice(start, end)
})

// 初始化模拟数据
const initMockData = () => {
  students.value = [
    {
      id: 'stu_001',
      studentId: '20240001',
      name: '张三',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      classes: [
        { id: 'class_001', name: '前端开发一班', joinTime: '2024-09-01T10:00:00Z' }
      ],
      courses: [
        { id: 'course_001', name: 'JavaScript基础', progress: 65, score: 85 },
        { id: 'course_002', name: 'Vue.js框架', progress: 45, score: 78 }
      ],
      statistics: {
        totalHomeworks: 10,
        completedHomeworks: 8,
        totalExams: 2,
        completedExams: 2,
        averageScore: 82.5,
        learningTime: 4560
      },
      status: 'studying',
      isDisabled: false,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'stu_002',
      studentId: '20240002',
      name: '李四',
      phone: '13900139000',
      email: 'lisi@example.com',
      classes: [
        { id: 'class_001', name: '前端开发一班', joinTime: '2024-09-01T10:00:00Z' }
      ],
      courses: [
        { id: 'course_001', name: 'JavaScript基础', progress: 80, score: 92 }
      ],
      statistics: {
        totalHomeworks: 10,
        completedHomeworks: 10,
        totalExams: 2,
        completedExams: 2,
        averageScore: 90.0,
        learningTime: 5200
      },
      status: 'studying',
      isDisabled: false,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'stu_003',
      studentId: '20240003',
      name: '王五',
      phone: '13800138001',
      email: 'wangwu@example.com',
      classes: [
        { id: 'class_002', name: '前端开发二班', joinTime: '2024-09-01T10:00:00Z' }
      ],
      courses: [
        { id: 'course_001', name: 'JavaScript基础', progress: 50, score: 75 }
      ],
      statistics: {
        totalHomeworks: 10,
        completedHomeworks: 6,
        totalExams: 2,
        completedExams: 1,
        averageScore: 72.0,
        learningTime: 3800
      },
      status: 'suspended',
      isDisabled: false,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'stu_004',
      studentId: '20240004',
      name: '赵六',
      phone: '13800138002',
      email: 'zhaoliu@example.com',
      classes: [],
      courses: [],
      statistics: {
        totalHomeworks: 0,
        completedHomeworks: 0,
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        learningTime: 0
      },
      status: 'new',
      isDisabled: false,
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'stu_005',
      studentId: '20240005',
      name: '孙七',
      phone: '13800138003',
      email: 'sunqi@example.com',
      classes: [
        { id: 'class_001', name: '前端开发一班', joinTime: '2024-09-01T10:00:00Z' }
      ],
      courses: [
        { id: 'course_001', name: 'JavaScript基础', progress: 100, score: 95 }
      ],
      statistics: {
        totalHomeworks: 10,
        completedHomeworks: 10,
        totalExams: 2,
        completedExams: 2,
        averageScore: 95.0,
        learningTime: 6000
      },
      status: 'finished',
      isDisabled: false,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'stu_006',
      studentId: '20240006',
      name: '周八',
      phone: '13800138004',
      email: 'zhouba@example.com',
      classes: [
        { id: 'class_002', name: '前端开发二班', joinTime: '2024-09-01T10:00:00Z' }
      ],
      courses: [],
      statistics: {
        totalHomeworks: 0,
        completedHomeworks: 0,
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        learningTime: 120
      },
      status: 'archived',
      isDisabled: true,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'stu_007',
      studentId: '20240007',
      name: '吴九',
      phone: '13800138005',
      email: 'wujiu@example.com',
      classes: [],
      courses: [],
      statistics: {
        totalHomeworks: 5,
        completedHomeworks: 2,
        totalExams: 1,
        completedExams: 0,
        averageScore: 45.0,
        learningTime: 800
      },
      status: 'refunded',
      isDisabled: true,
      createdAt: '2024-10-01T10:00:00Z'
    }
  ]
}

// 方法
const handleCreate = () => {
  currentStudent.value = null
  studentDialogVisible.value = true
}

const handleEdit = (student) => {
  currentStudent.value = { ...student }
  studentDialogVisible.value = true
}

const handleViewDetail = (student) => {
  router.push(`/users/detail/${student.id}`)
}

const handleDelete = (student) => {
  ElMessageBox.confirm(
    `确定要删除学生"${student.name}"吗？删除后无法恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = students.value.findIndex(s => s.id === student.id)
    if (index > -1) {
      students.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedStudents.value.length} 名学生吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    selectedStudents.value.forEach(student => {
      const index = students.value.findIndex(s => s.id === student.id)
      if (index > -1) {
        students.value.splice(index, 1)
      }
    })
    selectedStudents.value = []
    ElMessage.success('批量删除成功')
  })
}

const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
}

const handleReset = () => {
  searchText.value = ''
  filterClass.value = ''
  filterStatus.value = ''
}


const handleSaveStudent = (studentData) => {
  if (currentStudent.value) {
    // 更新学生
    const index = students.value.findIndex(s => s.id === currentStudent.value.id)
    if (index > -1) {
      students.value[index] = { ...students.value[index], ...studentData }
    }
    ElMessage.success('学生信息更新成功')
  } else {
    // 新建学生
    const newStudent = {
      id: `stu_${Date.now()}`,
      ...studentData,
      courses: [],
      statistics: {
        totalHomeworks: 0,
        completedHomeworks: 0,
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        learningTime: 0
      },
      status: 'active',
      createdAt: new Date().toISOString()
    }
    students.value.push(newStudent)
    ElMessage.success('学生创建成功')
  }
  studentDialogVisible.value = false
}

const getClassesDisplay = (classes) => {
  if (!classes || classes.length === 0) {
    return '未分配'
  }
  return classes.map(c => c.name).join(', ')
}

const getStatusLabel = (status) => {
  const map = {
    new: '新生',
    studying: '在读',
    suspended: '停课',
    archived: '封存',
    finished: '结课',
    refunded: '退费'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    new: '',
    studying: 'success',
    suspended: 'warning',
    archived: 'info',
    finished: 'warning',
    refunded: 'danger'
  }
  return map[status] || ''
}

// 切换启用/禁用状态
const handleToggleDisable = async (student) => {
  try {
    const action = student.isDisabled ? '禁用' : '启用'
    
    // TODO: 调用API更新禁用状态
    // await updateStudentDisable(student.id, student.isDisabled)
    
    ElMessage.success(`已${action}学生：${student.name}`)
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
    // 回滚状态
    student.isDisabled = !student.isDisabled
  }
}

const formatLearningTime = (minutes) => {
  if (!minutes) return '0小时'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins}分钟`
  }
  return `${hours}小时${mins}分钟`
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.student-list-container {
  padding: 24px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .title-section {
    display: flex;
    align-items: center;
    gap: 20px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .stats {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-base);
}

.table-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow-base);

  .stats-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
  }

  .score-text {
    font-weight: 600;
    color: var(--color-primary);
    font-size: 16px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
