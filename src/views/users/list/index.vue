<template>
  <div class="student-list-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
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
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入学生
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出学生
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
    <div class="filter-bar">
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
        <el-option label="在读" value="active" />
        <el-option label="休学" value="inactive" />
        <el-option label="已毕业" value="graduated" />
      </el-select>

      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 学生表格 -->
    <div class="table-container">
      <el-table
        :data="paginatedStudents"
        @selection-change="handleSelectionChange"
        stripe
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
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            {{ getStatusLabel(scope.row.status) }}
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
    <!-- <StudentDialog
      v-model="studentDialogVisible"
      :student-data="currentStudent"
      @save="handleSaveStudent"
    /> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Delete,
  Search
} from '@element-plus/icons-vue'
// import StudentDialog from './components/StudentDialog.vue'

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
      status: 'active',
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
      status: 'active',
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
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    }
  ]
}

// 方法
const handleCreate = () => {
  // currentStudent.value = null
  // studentDialogVisible.value = true
  ElMessage.info('新建功能暂时禁用')
}

const handleEdit = (student) => {
  // currentStudent.value = { ...student }
  // studentDialogVisible.value = true
  ElMessage.info('编辑功能暂时禁用')
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

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleReset = () => {
  searchText.value = ''
  filterClass.value = ''
  filterStatus.value = ''
}

const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
}

// const handleSaveStudent = (studentData) => {
//   if (currentStudent.value) {
//     // 更新学生
//     const index = students.value.findIndex(s => s.id === currentStudent.value.id)
//     if (index > -1) {
//       students.value[index] = { ...students.value[index], ...studentData }
//     }
//     ElMessage.success('学生信息更新成功')
//   } else {
//     // 新建学生
//     const newStudent = {
//       id: `stu_${Date.now()}`,
//       ...studentData,
//       courses: [],
//       statistics: {
//         totalHomeworks: 0,
//         completedHomeworks: 0,
//         totalExams: 0,
//         completedExams: 0,
//         averageScore: 0,
//         learningTime: 0
//       },
//       status: 'active',
//       createdAt: new Date().toISOString()
//     }
//     students.value.push(newStudent)
//     ElMessage.success('学生创建成功')
//   }
//   studentDialogVisible.value = false
// }

const getClassesDisplay = (classes) => {
  if (!classes || classes.length === 0) {
    return '未分配'
  }
  return classes.map(c => c.name).join(', ')
}

const getStatusLabel = (status) => {
  const map = {
    active: '在读',
    inactive: '休学',
    graduated: '已毕业'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info'
  }
  return map[status] || ''
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
