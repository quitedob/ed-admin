<template>
  <div class="lecturer-list-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title-section">
        <h2>老师管理</h2>
        <div class="stats">
          <span>共 {{ filteredLecturers.length }} 名老师</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreateLecturer">
          <el-icon><Plus /></el-icon>
          新建老师
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedLecturers.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索老师工号、姓名、手机号、邮箱、部门、职称..."
        clearable
        style="width: 400px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStatus" placeholder="账号状态" clearable style="width: 150px">
        <el-option label="全部状态" value="" />
        <el-option label="活跃" value="active" />
        <el-option label="停用" value="inactive" />
      </el-select>

      <el-select v-model="filterEducation" placeholder="学历" clearable style="width: 150px">
        <el-option label="全部学历" value="" />
        <el-option label="本科" value="bachelor" />
        <el-option label="硕士" value="master" />
        <el-option label="博士" value="doctor" />
      </el-select>

      <el-select v-model="filterDepartment" placeholder="部门" clearable style="width: 180px">
        <el-option label="全部部门" value="" />
        <el-option label="数学教研组" value="数学教研组" />
        <el-option label="语文教研组" value="语文教研组" />
        <el-option label="英语教研组" value="英语教研组" />
        <el-option label="体育教研组" value="体育教研组" />
        <el-option label="科学教研组" value="科学教研组" />
      </el-select>

      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 老师表格 -->
    <div class="table-container">
      <el-table :data="paginatedLecturers" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="teacherId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="学历" width="100" align="center">
          <template #default="scope">
            {{ getEducationLabel(scope.row.education) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column label="负责班级数" width="120" align="center">
          <template #default="scope">
            {{ scope.row.classCount }}
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="handleAuthorizeClass(scope.row)">
                授权班级
              </el-button>
              <el-button link type="primary" size="small" @click="handleViewDetail(scope.row)">
                查看详情
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
          :total="filteredLecturers.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 授权班级对话框 -->
    <AuthorizeDialog
      v-model="authorizeDialogVisible"
      :teacher-id="selectedLecturer?.id"
      :authorized-classes="selectedLecturer?.authorizedClasses || []"
      @update:authorized-classes="handleAuthorizeUpdate"
    />

    <!-- 新建/编辑老师对话框 -->
    <TeacherForm
      v-model="teacherDialogVisible"
      :teacher-data="currentTeacher"
      @save="handleSaveTeacher"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Delete } from '@element-plus/icons-vue'
import AuthorizeDialog from '../components/AuthorizeDialog.vue'
import TeacherForm from '../components/TeacherForm.vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterStatus = ref('')
const filterEducation = ref('')
const filterDepartment = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedLecturers = ref([])
const authorizeDialogVisible = ref(false)
const selectedLecturer = ref(null)
const teacherDialogVisible = ref(false)
const currentTeacher = ref(null)

const lecturers = ref([])

// 计算属性
const filteredLecturers = computed(() => {
  let result = lecturers.value

  if (searchText.value) {
    result = result.filter(l =>
      l.name.includes(searchText.value) ||
      l.teacherId.includes(searchText.value) ||
      l.phone.includes(searchText.value) ||
      l.email.includes(searchText.value) ||
      (l.department && l.department.includes(searchText.value)) ||
      (l.title && l.title.includes(searchText.value))
    )
  }

  if (filterStatus.value) {
    result = result.filter(l => l.status === filterStatus.value)
  }

  if (filterEducation.value) {
    result = result.filter(l => l.education === filterEducation.value)
  }

  if (filterDepartment.value) {
    result = result.filter(l => l.department === filterDepartment.value)
  }

  return result
})

const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLecturers.value.slice(start, end)
})

// 初始化模拟数据
const initMockData = () => {
  lecturers.value = [
    {
      id: 'lecturer_001',
      teacherId: 'T001',
      name: '王老师',
      phone: '13800138000',
      email: 'wang@example.com',
      gender: 'male',
      birthDate: '1985-06-15',
      joinDate: '2020-09-01',
      status: 'active',
      education: 'master',
      title: '高级教师',
      department: '数学教研组',
      specialty: '高等数学',
      address: '北京市朝阳区',
      bio: '拥有15年教学经验的资深数学教师',
      experience: '曾获得市级优秀教师称号，擅长高中数学教学',
      honors: '2021年市级优秀教师，2020年教学竞赛一等奖',
      classCount: 3,
      authorizedClasses: [
        { id: 'cls_001', name: '一年级一班' },
        { id: 'cls_002', name: '五年级二班' },
        { id: 'cls_003', name: '三年级一班' }
      ]
    },
    {
      id: 'lecturer_002',
      teacherId: 'T002',
      name: '李老师',
      phone: '13900139000',
      email: 'li@example.com',
      gender: 'female',
      birthDate: '1988-03-20',
      joinDate: '2021-09-01',
      status: 'active',
      education: 'bachelor',
      title: '中级教师',
      department: '语文教研组',
      specialty: '现代文学',
      address: '北京市海淀区',
      bio: '专注于语文教学，注重培养学生的阅读理解能力',
      experience: '8年语文教学经验，多次指导学生获得作文比赛奖项',
      honors: '2022年校级优秀教师',
      classCount: 2,
      authorizedClasses: [
        { id: 'cls_004', name: '二年级一班' },
        { id: 'cls_005', name: '四年级二班' }
      ]
    },
    {
      id: 'lecturer_003',
      teacherId: 'T003',
      name: '张老师',
      phone: '13700137000',
      email: 'zhang@example.com',
      gender: 'male',
      birthDate: '1983-11-08',
      joinDate: '2019-09-01',
      status: 'active',
      education: 'doctor',
      title: '特级教师',
      department: '英语教研组',
      specialty: '英语教学',
      address: '北京市西城区',
      bio: '英语教学专家，擅长培养学生的语言应用能力',
      experience: '12年英语教学经验，曾留学英国2年',
      honors: '2021年省级优秀教师，2020年教学创新奖',
      classCount: 4,
      authorizedClasses: [
        { id: 'cls_006', name: '五年级一班' },
        { id: 'cls_007', name: '六年级二班' },
        { id: 'cls_008', name: '三年级三班' },
        { id: 'cls_009', name: '四年级一班' }
      ]
    },
    {
      id: 'lecturer_004',
      name: '赵老师',
      teacherId: 'T004',
      phone: '13600136000',
      email: 'zhao@example.com',
      gender: 'female',
      birthDate: '1990-07-25',
      joinDate: '2022-09-01',
      status: 'inactive',
      education: 'master',
      title: '初级教师',
      department: '科学教研组',
      specialty: '物理教学',
      address: '北京市东城区',
      bio: '新入职的科学教师，对实验教学有独到见解',
      experience: '刚完成师范教育，充满教学热情',
      honors: '2022年优秀毕业生',
      classCount: 0,
      authorizedClasses: []
    },
    {
      id: 'lecturer_005',
      name: '陈老师',
      teacherId: 'T005',
      phone: '13500135000',
      email: 'chen@example.com',
      gender: 'male',
      birthDate: '1986-09-12',
      joinDate: '2018-09-01',
      status: 'active',
      education: 'bachelor',
      title: '中级教师',
      department: '体育教研组',
      specialty: '篮球教学',
      address: '北京市丰台区',
      bio: '体育教学专业，注重学生身体素质全面发展',
      experience: '10年体育教学经验，校篮球队主教练',
      honors: '2021年市级优秀体育教师',
      classCount: 6,
      authorizedClasses: [
        { id: 'cls_010', name: '一年级二班' },
        { id: 'cls_011', name: '二年级二班' },
        { id: 'cls_012', name: '三年级二班' }
      ]
    }
  ]
}

// 方法
const handleCreateLecturer = () => {
  currentTeacher.value = null
  teacherDialogVisible.value = true
}

const handleEdit = (lecturer) => {
  currentTeacher.value = { ...lecturer }
  teacherDialogVisible.value = true
}

const handleSelectionChange = (selection) => {
  selectedLecturers.value = selection
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedLecturers.value.length} 名老师吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    selectedLecturers.value.forEach(lecturer => {
      const index = lecturers.value.findIndex(l => l.id === lecturer.id)
      if (index > -1) {
        lecturers.value.splice(index, 1)
      }
    })
    selectedLecturers.value = []
    ElMessage.success('批量删除成功')
  })
}

const handleSaveTeacher = (teacherData) => {
  if (currentTeacher.value) {
    // 更新老师
    const index = lecturers.value.findIndex(l => l.id === currentTeacher.value.id)
    if (index > -1) {
      lecturers.value[index] = { ...lecturers.value[index], ...teacherData }
    }
    ElMessage.success('老师信息更新成功')
  } else {
    // 新建老师
    const newTeacher = {
      id: `lecturer_${Date.now()}`,
      ...teacherData
    }
    lecturers.value.push(newTeacher)
    ElMessage.success('老师创建成功')
  }
  teacherDialogVisible.value = false
}

const handleAuthorizeClass = (lecturer) => {
  selectedLecturer.value = { ...lecturer }
  authorizeDialogVisible.value = true
}

const handleAuthorizeUpdate = (authorizedClasses) => {
  if (selectedLecturer.value) {
    const index = lecturers.value.findIndex(l => l.id === selectedLecturer.value.id)
    if (index > -1) {
      lecturers.value[index].authorizedClasses = authorizedClasses
      lecturers.value[index].classCount = authorizedClasses.length
      ElMessage.success('班级授权已更新')
    }
  }
  authorizeDialogVisible.value = false
}

const handleViewDetail = (lecturer) => {
  router.push(`/users/lecturer/detail/${lecturer.id}`)
}

const handleDelete = (lecturer) => {
  ElMessageBox.confirm(
    `确定要删除老师"${lecturer.name}"吗？删除后无法恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = lecturers.value.findIndex(l => l.id === lecturer.id)
    if (index > -1) {
      lecturers.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}


const handleReset = () => {
  searchText.value = ''
  filterStatus.value = ''
  filterEducation.value = ''
  filterDepartment.value = ''
}

const getStatusLabel = (status) => {
  const map = {
    active: '活跃',
    inactive: '停用'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'info'
  }
  return map[status] || ''
}

const getEducationLabel = (education) => {
  const map = {
    bachelor: '本科',
    master: '硕士',
    doctor: '博士',
    other: '其他'
  }
  return map[education] || education
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/users/lecturer/list/index.vue`)
  initMockData()
})
</script>

<style lang="scss" scoped>
.lecturer-list-container {
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
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
