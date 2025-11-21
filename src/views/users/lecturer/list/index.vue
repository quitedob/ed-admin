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

      <el-select v-model="filterRole" placeholder="角色" clearable style="width: 180px">
        <el-option label="全部角色" value="" />
        <el-option label="管理员" value="role_001" />
        <el-option label="教研组长" value="role_002" />
        <el-option label="班主任" value="role_003" />
        <el-option label="任课教师" value="role_004" />
        <el-option label="助教" value="role_005" />
      </el-select>

      <el-select v-model="filterSubject" placeholder="授课科目" clearable style="width: 180px">
        <el-option label="全部科目" value="" />
        <el-option label="数学" value="数学" />
        <el-option label="语文" value="语文" />
        <el-option label="英语" value="英语" />
        <el-option label="编程" value="编程" />
        <el-option label="前端开发" value="前端开发" />
      </el-select>

      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 老师表格 -->
    <div class="table-container">
      <el-table :data="paginatedLecturers" @selection-change="handleSelectionChange" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="teacherId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="mobile" label="手机号" width="150">
          <template #default="scope">
            {{ scope.row.mobile || scope.row.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="授课科目" width="200">
          <template #default="scope">
            <el-tag
              v-for="subject in scope.row.subjects?.slice(0, 2)"
              :key="subject"
              size="small"
              style="margin-right: 4px"
            >
              {{ subject }}
            </el-tag>
            <span v-if="scope.row.subjects?.length > 2" style="color: #909399; font-size: 12px">
              +{{ scope.row.subjects.length - 2 }}
            </span>
            <span v-if="!scope.row.subjects || scope.row.subjects.length === 0" style="color: #909399">
              -
            </span>
          </template>
        </el-table-column>
        <el-table-column label="教学年限" width="100" align="center">
          <template #default="scope">
            {{ scope.row.teachingYears ? `${scope.row.teachingYears}年` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="负责班级" width="120" align="center">
          <template #default="scope">
            {{ scope.row.stats?.classCount || scope.row.classCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="handleAuthorizeClass(scope.row)">
                授权班级
              </el-button>
              <el-button link type="primary" size="small" @click="handleAuthorizeResources(scope.row)">
                授权资源
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

    <!-- 授权资源对话框 -->
    <ResourceAuthorizationDialog
      v-model="resourceAuthDialogVisible"
      :target-id="selectedLecturer?.id"
      target-type="teacher"
      :authorized-resources="selectedLecturer?.authorizedResources || {}"
      @update:authorized-resources="handleResourceAuthUpdate"
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
import ResourceAuthorizationDialog from '../components/ResourceAuthorizationDialog.vue'
import TeacherForm from '../components/TeacherForm.vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterStatus = ref('')
const filterRole = ref('')
const filterSubject = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedLecturers = ref([])
const authorizeDialogVisible = ref(false)
const resourceAuthDialogVisible = ref(false)
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

  if (filterRole.value) {
    result = result.filter(l => l.roleIds && l.roleIds.includes(filterRole.value))
  }

  if (filterSubject.value) {
    result = result.filter(l => l.subjects && l.subjects.includes(filterSubject.value))
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
      mobile: '13800138000',
      email: 'wang@example.com',
      gender: 'male',
      birthDate: '1985-06-15',
      joinDate: '2020-09-01',
      status: 'active',
      teachingYears: 15,
      roleIds: ['role_002', 'role_003'],  // 教研组长、班主任
      subjects: ['数学', '算法'],
      profileHtml: '<p>拥有15年教学经验的资深数学教师</p><p><strong>教学经验：</strong>曾获得市级优秀教师称号，擅长高中数学教学</p><p><strong>获得荣誉：</strong>2021年市级优秀教师，2020年教学竞赛一等奖</p>',
      address: '北京市朝阳区',
      stats: {
        classCount: 3,
        studentCount: 90,
        courseCount: 2,
        assignmentCount: 15,
        examCount: 8
      },
      authorizedClasses: [
        { id: 'cls_001', name: '一年级一班' },
        { id: 'cls_002', name: '五年级二班' },
        { id: 'cls_003', name: '三年级一班' }
      ],
      authorizedResources: {
        courses: [
          { id: 'course_001', name: 'Python编程基础', category: '编程语言' }
        ],
        assignments: [],
        exams: []
      }
    },
    {
      id: 'lecturer_002',
      teacherId: 'T002',
      name: '李老师',
      mobile: '13900139000',
      email: 'li@example.com',
      gender: 'female',
      birthDate: '1988-03-20',
      joinDate: '2021-09-01',
      status: 'active',
      teachingYears: 8,
      roleIds: ['role_004'],  // 任课教师
      subjects: ['语文'],
      profileHtml: '<p>专注于语文教学，注重培养学生的阅读理解能力</p><p><strong>教学经验：</strong>8年语文教学经验，多次指导学生获得作文比赛奖项</p><p><strong>获得荣誉：</strong>2022年校级优秀教师</p>',
      address: '北京市海淀区',
      stats: {
        classCount: 2,
        studentCount: 60,
        courseCount: 1,
        assignmentCount: 10,
        examCount: 4
      },
      authorizedClasses: [
        { id: 'cls_004', name: '二年级一班' },
        { id: 'cls_005', name: '四年级二班' }
      ],
      authorizedResources: {
        courses: [],
        assignments: [],
        exams: []
      }
    },
    {
      id: 'lecturer_003',
      teacherId: 'T003',
      name: '张老师',
      mobile: '13700137000',
      email: 'zhang@example.com',
      gender: 'male',
      birthDate: '1983-11-08',
      joinDate: '2019-09-01',
      status: 'active',
      teachingYears: 12,
      roleIds: ['role_002', 'role_004'],  // 教研组长、任课教师
      subjects: ['英语'],
      profileHtml: '<p>英语教学专家，擅长培养学生的语言应用能力</p><p><strong>教学经验：</strong>12年英语教学经验，曾留学英国2年</p><p><strong>获得荣誉：</strong>2021年省级优秀教师，2020年教学创新奖</p>',
      address: '北京市西城区',
      stats: {
        classCount: 4,
        studentCount: 120,
        courseCount: 3,
        assignmentCount: 20,
        examCount: 10
      },
      authorizedClasses: [
        { id: 'cls_006', name: '五年级一班' },
        { id: 'cls_007', name: '六年级二班' },
        { id: 'cls_008', name: '三年级三班' },
        { id: 'cls_009', name: '四年级一班' }
      ],
      authorizedResources: {
        courses: [],
        assignments: [],
        exams: []
      }
    },
    {
      id: 'lecturer_004',
      name: '赵老师',
      teacherId: 'T004',
      mobile: '13600136000',
      email: 'zhao@example.com',
      gender: 'female',
      birthDate: '1990-07-25',
      joinDate: '2022-09-01',
      status: 'inactive',
      teachingYears: 1,
      roleIds: ['role_005'],  // 助教
      subjects: ['物理'],
      profileHtml: '<p>新入职的科学教师，对实验教学有独到见解</p><p><strong>教学经验：</strong>刚完成师范教育，充满教学热情</p><p><strong>获得荣誉：</strong>2022年优秀毕业生</p>',
      address: '北京市东城区',
      stats: {
        classCount: 0,
        studentCount: 0,
        courseCount: 0,
        assignmentCount: 0,
        examCount: 0
      },
      authorizedClasses: [],
      authorizedResources: {
        courses: [],
        assignments: [],
        exams: []
      }
    },
    {
      id: 'lecturer_005',
      name: '陈老师',
      teacherId: 'T005',
      mobile: '13500135000',
      email: 'chen@example.com',
      gender: 'male',
      birthDate: '1986-09-12',
      joinDate: '2018-09-01',
      status: 'active',
      teachingYears: 10,
      roleIds: ['role_004'],  // 任课教师
      subjects: ['体育', '篮球'],
      profileHtml: '<p>体育教学专业，注重学生身体素质全面发展</p><p><strong>教学经验：</strong>10年体育教学经验，校篮球队主教练</p><p><strong>获得荣誉：</strong>2021年市级优秀体育教师</p>',
      address: '北京市丰台区',
      stats: {
        classCount: 6,
        studentCount: 180,
        courseCount: 2,
        assignmentCount: 5,
        examCount: 2
      },
      authorizedClasses: [
        { id: 'cls_010', name: '一年级二班' },
        { id: 'cls_011', name: '二年级二班' },
        { id: 'cls_012', name: '三年级二班' }
      ],
      authorizedResources: {
        courses: [],
        assignments: [],
        exams: []
      }
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

const handleAuthorizeResources = (lecturer) => {
  selectedLecturer.value = { ...lecturer }
  resourceAuthDialogVisible.value = true
}

const handleResourceAuthUpdate = (authorizedResources) => {
  if (selectedLecturer.value) {
    const index = lecturers.value.findIndex(l => l.id === selectedLecturer.value.id)
    if (index > -1) {
      lecturers.value[index].authorizedResources = authorizedResources
      const total = (authorizedResources.courses?.length || 0) +
                    (authorizedResources.assignments?.length || 0) +
                    (authorizedResources.exams?.length || 0)
      ElMessage.success(`资源授权已更新（共${total}项）`)
    }
  }
  resourceAuthDialogVisible.value = false
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
  filterRole.value = ''
  filterSubject.value = ''
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

// 移除 getEducationLabel 方法，不再需要

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
