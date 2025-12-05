<template>
  <div id="class-detail-container" class="class-detail-container">
    <!-- 顶部导航 -->
    <div id="top-bar" class="top-bar">
      <div id="title-section" class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">班级详情 > {{ classInfo?.name }}</span>
      </div>
      <div id="action-buttons" class="action-buttons">
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑班级
        </el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <div id="main-content" class="main-content">
      <el-tabs v-model="activeTab" id="detail-tabs" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="info">
          <el-card shadow="never" id="basic-info-card">
            <el-descriptions :column="2" border id="basic-info-descriptions">
              <el-descriptions-item label="班级名称">
                {{ classInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(classInfo?.status)">
                  {{ getStatusLabel(classInfo?.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="年级">
                {{ getGradeLabel(classInfo?.grade) }}
              </el-descriptions-item>
              <el-descriptions-item label="专业">
                {{ getMajorLabel(classInfo?.major) }}
              </el-descriptions-item>
              <el-descriptions-item label="学年学期">
                {{ classInfo?.year }}年{{ getSemesterLabel(classInfo?.semester) }}
              </el-descriptions-item>
              <el-descriptions-item label="班主任">
                {{ classInfo?.headTeacherName }}
              </el-descriptions-item>
              <el-descriptions-item label="学生人数">
                {{ classInfo?.studentCount }}人
              </el-descriptions-item>
              <el-descriptions-item label="课程数量">
                {{ classInfo?.courseCount }}门
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2">
                {{ formatDateTime(classInfo?.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="班级描述" :span="2">
                {{ classInfo?.description || '暂无描述' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-tab-pane>

        <!-- 学生管理标签页 -->
        <el-tab-pane label="学生管理" name="students">
          <el-card shadow="never" id="student-management-card">
            <!-- 工具栏 -->
            <div id="student-toolbar" class="toolbar">
              <div id="student-toolbar-left" class="toolbar-left">
                <el-button type="primary" @click="handleAddStudent">
                  <el-icon><Plus /></el-icon>
                  添加学生
                </el-button>
                <el-button @click="handleImportStudents">
                  <el-icon><Upload /></el-icon>
                  导入学生
                </el-button>
                <el-button @click="handleExportStudents">
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
              <div id="student-toolbar-right" class="toolbar-right">
                <el-input
                  v-model="studentSearch"
                  placeholder="搜索学生..."
                  clearable
                  style="width: 200px"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select v-model="studentStatusFilter" placeholder="状态" style="width: 120px">
                  <el-option label="全部" value="" />
                  <el-option label="在读" value="active" />
                  <el-option label="休学" value="inactive" />
                  <el-option label="毕业" value="graduated" />
                </el-select>
              </div>
            </div>

            <!-- 学生列表 -->
            <el-table
              :data="paginatedStudents"
              @selection-change="handleSelectionChange"
              style="margin-top: 16px"
              stripe
              :empty-text="filteredStudents.length === 0 ? '暂无学生数据' : '暂无数据'"
              id="student-table"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column type="index" label="序号" width="60" :index="getTableIndex" />
              <el-table-column prop="studentId" label="学号" width="120">
                <template #default="{ row }">
                  <el-text type="primary">{{ row.studentId }}</el-text>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="姓名" width="120">
                <template #default="{ row }">
                  <el-link type="primary" @click="handleViewStudent(row)">
                    {{ row.name }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="手机号" width="220" />
              <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
              <el-table-column label="加入时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.classes?.[0]?.joinTime || row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusTagType(row.status)" size="small">
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewStudent(row)">
                    <el-icon><View /></el-icon>
                    查看
<el-button link type="success" size="small" @click="handleManagePacing(row)">                    进度管理                  </el-button>
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleEditStudent(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button link type="danger" size="small" @click="handleDeleteStudent(row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div id="student-pagination" class="pagination">
              <el-pagination
                v-model:current-page="studentPage"
                v-model:page-size="studentPageSize"
                :total="filteredStudents.length"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 课程绑定标签页 -->
        <el-tab-pane label="课程绑定" name="courses">
          <el-card shadow="never" id="course-binding-card">
            <!-- 工具栏 -->
            <div id="course-toolbar" class="toolbar">
              <el-button type="primary" @click="handleAddCourse">
                <el-icon><Plus /></el-icon>
                添加课程
              </el-button>
            </div>

            <!-- 课程列表 -->
            <el-table :data="classCourses" style="margin-top: 16px" id="course-table">
              <el-table-column prop="name" label="课程名称" min-width="200" />
              <el-table-column prop="teacherName" label="授课教师" width="120" />
              <el-table-column prop="assignedTime" label="绑定时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.assignedTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ row.status === 'active' ? '进行中' : '已结束' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewCourse(row)">
                    查看
<el-button link type="success" size="small" @click="handleManagePacing(row)">                    进度管理                  </el-button>
                  </el-button>
                  <el-button link type="danger" size="small" @click="handleUnbindCourse(row)">
                    解绑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 添加/编辑学生对话框 -->
    <StudentDialog
      v-model="studentDialogVisible"
      :student-data="currentStudent"
      @save="handleSaveStudent"
    />

    <!-- 添加课程对话框 -->
    <CourseBindDialog
    <CoursePacingDialog      v-model="pacingDialogVisible"      :class-id="classId"      :course-id="currentCourse?.id"      :course-name="currentCourse?.name"      @saved="handlePacingSaved"    />
      v-model="courseDialogVisible"
      :class-id="classId"
      @bind="handleBindCourse"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Plus,
  Upload,
  Download,
  Delete,
  Search,
  View
} from '@element-plus/icons-vue'
import { useMockStore } from '@/stores/mockStore'
import StudentDialog from './components/StudentDialog.vue'
import CourseBindDialog from './components/CourseBindDialog.vue'
    <CoursePacingDialog      v-model="pacingDialogVisible"      :class-id="classId"      :course-id="currentCourse?.id"      :course-name="currentCourse?.name"      @saved="handlePacingSaved"    />
import CoursePacingDialog from './components/CoursePacingDialog.vue'

const router = useRouter()
const route = useRoute()
const mockStore = useMockStore()

const classId = ref(route.params.id || 'class_001')
const activeTab = ref('info')
const studentSearch = ref('')
const studentStatusFilter = ref('')
const studentPage = ref(1)
const studentPageSize = ref(10)
const selectedStudents = ref([])
const studentDialogVisible = ref(false)
const courseDialogVisible = ref(false)
const pacingDialogVisible = ref(false)const currentCourse = ref(null)
const currentStudent = ref(null)

const classInfo = ref(null)
const students = ref([])
const classCourses = ref([])

// 计算属性
const filteredStudents = computed(() => {
  let result = students.value

  if (studentSearch.value) {
    result = result.filter(s =>
      s.name.includes(studentSearch.value) ||
      s.studentId.includes(studentSearch.value) ||
      s.phone?.includes(studentSearch.value)
    )
  }

  if (studentStatusFilter.value) {
    result = result.filter(s => s.status === studentStatusFilter.value)
  }

  return result
})

// 分页后的学生列表
const paginatedStudents = computed(() => {
  const start = (studentPage.value - 1) * studentPageSize.value
  const end = start + studentPageSize.value
  return filteredStudents.value.slice(start, end)
})

// 初始化数据
const initData = () => {
  mockStore.initialize()

  // 从 Mock Store 获取班级信息
  const classData = mockStore.classes.find(c => c.id === classId.value)
  if (classData) {
    classInfo.value = classData
  }

  // 从 Mock Store 获取该班级的学生
  const classStudents = mockStore.getStudentsByClass(classId.value)
  students.value = classStudents

  // 模拟课程数据
  classCourses.value = [
    {
      id: 'course_001',
      name: 'JavaScript基础',
      teacherName: '王老师',
      assignedTime: '2024-09-01T10:00:00Z',
      status: 'active'
    },
    {
      id: 'course_002',
      name: 'Vue.js框架',
      teacherName: '李老师',
      assignedTime: '2024-09-15T10:00:00Z',
      status: 'active'
    },
    {
      id: 'course_003',
      name: 'React基础',
      teacherName: '张老师',
      assignedTime: '2024-10-01T10:00:00Z',
      status: 'active'
    }
  ]
}

// 方法
const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/class/edit/${classId.value}`)
}

const handleAddStudent = () => {
  currentStudent.value = null
  studentDialogVisible.value = true
}

const handleEditStudent = (student) => {
  currentStudent.value = { ...student }
  studentDialogVisible.value = true
}

const handleDeleteStudent = (student) => {
  ElMessageBox.confirm(`确定要将学生"${student.name}"从班级中移除吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从班级中移除学生
    const index = students.value.findIndex(s => s.id === student.id)
    if (index > -1) {
      students.value.splice(index, 1)
      
      // 更新班级学生数
      if (classInfo.value) {
        classInfo.value.studentCount--
        mockStore.updateClass(classId.value, {
          studentCount: classInfo.value.studentCount
        })
      }
      
      // 更新学生的班级信息
      const updatedClasses = student.classes.filter(c => c.id !== classId.value)
      mockStore.updateStudent(student.id, {
        classes: updatedClasses
      })
      
      ElMessage.success('学生已从班级中移除')
    }
  })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedStudents.value.length} 名学生吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedStudents.value.forEach(student => {
      const index = students.value.findIndex(s => s.id === student.id)
      if (index > -1) {
        students.value.splice(index, 1)
      }
    })
    classInfo.value.studentCount -= selectedStudents.value.length
    selectedStudents.value = []
    ElMessage.success('批量删除成功')
  })
}

const handleImportStudents = () => {
  ElMessage.info('导入学生功能开发中...')
}

const handleExportStudents = () => {
  ElMessage.info('导出学生功能开发中...')
}

const handleSelectionChange = (selection) => {
  selectedStudents.value = selection
}

const getTableIndex = (index) => {
  return (studentPage.value - 1) * studentPageSize.value + index + 1
}

const handleViewStudent = (student) => {
  router.push(`/users/detail/${student.id}`)
}

const handleSaveStudent = (studentData) => {
  if (currentStudent.value) {
    // 更新学生
    mockStore.updateStudent(currentStudent.value.id, studentData)
    const index = students.value.findIndex(s => s.id === currentStudent.value.id)
    if (index > -1) {
      students.value[index] = { ...students.value[index], ...studentData }
    }
    ElMessage.success('学生信息更新成功')
  } else {
    // 添加学生
    const newStudent = {
      id: `stu_${Date.now()}`,
      ...studentData,
      classes: [{
        id: classId.value,
        name: classInfo.value.name,
        joinTime: new Date().toISOString()
      }],
      status: 'active',
      createdAt: new Date().toISOString()
    }
    mockStore.addStudent(newStudent)
    students.value.push(newStudent)
    
    // 更新班级学生数
    if (classInfo.value) {
      classInfo.value.studentCount++
      mockStore.updateClass(classId.value, {
        studentCount: classInfo.value.studentCount
      })
    }
    
    ElMessage.success('学生添加成功')
  }
  studentDialogVisible.value = false
}

const handleAddCourse = () => {
  courseDialogVisible.value = true
}

const handleViewCourse = (course) => {
  router.push(`/course/detail/${course.id}`)
}

const handleUnbindCourse = (course) => {
  ElMessageBox.confirm(`确定要解绑课程"${course.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = classCourses.value.findIndex(c => c.id === course.id)
    if (index > -1) {
      classCourses.value.splice(index, 1)
      classInfo.value.courseCount--
      ElMessage.success('解绑成功')
    }
  })
}

const handleBindCourse = (courseData) => {
  classCourses.value.push({
    ...courseData,
    assignedTime: new Date().toISOString(),
    status: 'active'
  })
  classInfo.value.courseCount++
  ElMessage.success('课程绑定成功')
  courseDialogVisible.value = false
const handleManagePacing = (course) => {  currentCourse.value = course  pacingDialogVisible.value = true}const handlePacingSaved = (config) => {  console.log('课程进度配置已保存:', config)  ElMessage.success('课程进度权限已更新')}
}

const getGradeLabel = (grade) => {
  const map = {
    freshman: '大一',
    sophomore: '大二',
    junior: '大三',
    senior: '大四'
  }
  return map[grade] || grade
}

const getMajorLabel = (major) => {
  const map = {
    frontend: '前端开发',
    backend: '后端开发',
    'data-science': '数据科学',
    cloud: '云计算'
  }
  return map[major] || major
}

const getSemesterLabel = (semester) => {
  const map = {
    spring: '春季',
    fall: '秋季'
  }
  return map[semester] || semester
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.class-detail-container {
  min-height: calc(100vh - 60px);
  background: var(--color-bg-primary);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--color-border-light);

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.main-content {
  padding: 24px;

  .detail-tabs {
    background: white;
    padding: 20px;
    border-radius: 8px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
