<template>
  <el-drawer
    v-model="drawerVisible"
    :title="`${classData?.name || '班级'} - 权限管理`"
    size="70%"
    direction="rtl"
  >
    <div class="resource-management-container">
      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" class="resource-tabs">
        <!-- 课程管理 - 需要 class:manage-courses 权限 -->
        <el-tab-pane v-if="hasPermission('class:manage-courses')" label="课程清单" name="courses">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-info">
                <h3>课程列表</h3>
                <span class="count">已授权 {{ selectedCourses.length }} 门课程</span>
              </div>
              <el-button type="primary" @click="handleAddCourses">
                <el-icon><Plus /></el-icon>
                添加课程
              </el-button>
            </div>
            
            <div class="resource-list">
              <el-table :data="selectedCourses" stripe>
                <el-table-column prop="name" label="课程名称" min-width="200" />
                <el-table-column prop="category" label="分类" width="120" />
                <el-table-column label="课次" width="100" align="center">
                  <template #default="scope">
                    {{ scope.row.lessonCount || 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
                      {{ scope.row.status === 'active' ? '进行中' : '已结束' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button link type="primary" size="small" @click="handleCourseAccess(scope.row)">
                      课次开放
                    </el-button>
                    <el-button link type="danger" size="small" @click="handleRemoveCourse(scope.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="selectedCourses.length === 0" description="暂无课程" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 作业管理 - 需要 class:manage-homeworks 权限 -->
        <el-tab-pane v-if="hasPermission('class:manage-homeworks')" label="作业清单" name="assignments">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-info">
                <h3>作业列表</h3>
                <span class="count">已授权 {{ selectedAssignments.length }} 个作业</span>
              </div>
              <el-button type="primary" @click="handleAddAssignments">
                <el-icon><Plus /></el-icon>
                添加作业
              </el-button>
            </div>
            
            <div class="resource-list">
              <el-table :data="selectedAssignments" stripe>
                <el-table-column prop="name" label="作业名称" min-width="200" />
                <el-table-column prop="courseName" label="所属课程" width="150" />
                <el-table-column label="截止时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.deadline) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getAssignmentStatusType(scope.row)" size="small">
                      {{ getAssignmentStatusLabel(scope.row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleRemoveAssignment(scope.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="selectedAssignments.length === 0" description="暂无作业" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 考试管理 - 需要 class:manage-exams 权限 -->
        <el-tab-pane v-if="hasPermission('class:manage-exams')" label="考试清单" name="exams">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-info">
                <h3>考试列表</h3>
                <span class="count">已授权 {{ selectedExams.length }} 场考试</span>
              </div>
              <el-button type="primary" @click="handleAddExams">
                <el-icon><Plus /></el-icon>
                添加考试
              </el-button>
            </div>
            
            <div class="resource-list">
              <el-table :data="selectedExams" stripe>
                <el-table-column prop="name" label="考试名称" min-width="200" />
                <el-table-column prop="courseName" label="所属课程" width="150" />
                <el-table-column label="考试时间" width="180">
                  <template #default="scope">
                    {{ formatDate(scope.row.examTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="时长" width="100" align="center">
                  <template #default="scope">
                    {{ scope.row.duration }}分钟
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getExamStatusType(scope.row)" size="small">
                      {{ getExamStatusLabel(scope.row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleRemoveExam(scope.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="selectedExams.length === 0" description="暂无考试" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 老师管理 - 需要 class:manage-teachers 权限 -->
        <el-tab-pane v-if="hasPermission('class:manage-teachers')" label="老师清单" name="teachers">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-info">
                <h3>老师列表</h3>
                <span class="count">共 {{ selectedTeachers.length }} 名老师</span>
              </div>
              <el-button type="primary" @click="handleAddTeachers">
                <el-icon><Plus /></el-icon>
                添加老师
              </el-button>
            </div>
            
            <div class="resource-list">
              <el-table :data="selectedTeachers" stripe>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="teacherId" label="工号" width="120" />
                <el-table-column label="角色" width="150">
                  <template #default="scope">
                    <el-tag
                      v-for="role in scope.row.roles"
                      :key="role"
                      size="small"
                      style="margin-right: 4px"
                    >
                      {{ role }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="授课科目" min-width="200">
                  <template #default="scope">
                    <el-tag
                      v-for="subject in scope.row.subjects"
                      :key="subject"
                      size="small"
                      type="info"
                      style="margin-right: 4px"
                    >
                      {{ subject }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="是否班主任" width="120" align="center">
                  <template #default="scope">
                    <el-switch
                      v-model="scope.row.isHeadTeacher"
                      @change="handleHeadTeacherChange(scope.row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleRemoveTeacher(scope.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="selectedTeachers.length === 0" description="暂无老师" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 学生管理 - 需要 class:manage-students 权限 -->
        <el-tab-pane v-if="hasPermission('class:manage-students')" label="学生清单" name="students">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-info">
                <h3>学生列表</h3>
                <span class="count">共 {{ selectedStudents.length }} 名学生</span>
              </div>
              <div class="header-actions">
                <el-button type="primary" @click="handleAddStudents">
                  <el-icon><Plus /></el-icon>
                  添加学生
                </el-button>
                <el-button @click="handleBatchImportStudents">
                  <el-icon><Upload /></el-icon>
                  批量导入
                </el-button>
              </div>
            </div>
            
            <div class="resource-list">
              <el-table :data="selectedStudents" stripe>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="studentId" label="学号" width="150" />
                <el-table-column prop="mobile" label="手机号" width="150" />
                <el-table-column prop="email" label="邮箱" min-width="200" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                      {{ getStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button link type="danger" size="small" @click="handleRemoveStudent(scope.row)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="selectedStudents.length === 0" description="暂无学生" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleSave">保存更改</el-button>
      </div>
    </template>

    <!-- 选择课程对话框 -->
    <SelectResourceDialog
      v-model="selectCourseVisible"
      title="选择课程"
      :resource-type="'courses'"
      :selected-ids="selectedCourses.map(c => c.id)"
      @confirm="handleCoursesSelected"
    />

    <!-- 选择作业对话框 -->
    <SelectResourceDialog
      v-model="selectAssignmentVisible"
      title="选择作业"
      :resource-type="'assignments'"
      :selected-ids="selectedAssignments.map(a => a.id)"
      @confirm="handleAssignmentsSelected"
    />

    <!-- 选择考试对话框 -->
    <SelectResourceDialog
      v-model="selectExamVisible"
      title="选择考试"
      :resource-type="'exams'"
      :selected-ids="selectedExams.map(e => e.id)"
      @confirm="handleExamsSelected"
    />

    <!-- 选择老师对话框 -->
    <SelectResourceDialog
      v-model="selectTeacherVisible"
      title="选择老师"
      :resource-type="'teachers'"
      :selected-ids="selectedTeachers.map(t => t.id)"
      @confirm="handleTeachersSelected"
    />

    <!-- 选择学生对话框 -->
    <SelectResourceDialog
      v-model="selectStudentVisible"
      title="选择学生"
      :resource-type="'students'"
      :selected-ids="selectedStudents.map(s => s.id)"
      @confirm="handleStudentsSelected"
    />

    <!-- 课次开放对话框 -->
    <CourseAccessDialog
      v-model="courseAccessVisible"
      :class-id="classData?.id"
      :course-id="selectedCourseId"
      @save="handleCourseAccessSave"
    />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import SelectResourceDialog from './SelectResourceDialog.vue'
import CourseAccessDialog from './CourseAccessDialog.vue'
import { usePermission } from '@/composables/usePermission'

// 权限控制
const { hasPermission } = usePermission()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  classData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// 响应式数据 - 默认显示第一个有权限的标签页
const getDefaultTab = () => {
  if (hasPermission('class:manage-courses')) return 'courses'
  if (hasPermission('class:manage-homeworks')) return 'assignments'
  if (hasPermission('class:manage-exams')) return 'exams'
  if (hasPermission('class:manage-teachers')) return 'teachers'
  if (hasPermission('class:manage-students')) return 'students'
  return 'courses'
}
const activeTab = ref(getDefaultTab())
const selectCourseVisible = ref(false)
const selectAssignmentVisible = ref(false)
const selectExamVisible = ref(false)
const selectTeacherVisible = ref(false)
const selectStudentVisible = ref(false)
const courseAccessVisible = ref(false)
const selectedCourseId = ref('')

const selectedCourses = ref([])
const selectedAssignments = ref([])
const selectedExams = ref([])
const selectedTeachers = ref([])
const selectedStudents = ref([])

// 计算属性
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 初始化数据
const initData = () => {
  if (props.classData) {
    // 加载班级的资源数据
    loadClassResources()
  }
}

// 加载班级资源（模拟数据）
const loadClassResources = () => {
  // 模拟加载课程
  selectedCourses.value = [
    { id: 'course_001', name: 'Python编程基础', category: '编程语言', lessonCount: 20, status: 'active' },
    { id: 'course_002', name: '数据结构与算法', category: '计算机科学', lessonCount: 15, status: 'active' }
  ]

  // 模拟加载作业
  selectedAssignments.value = [
    { id: 'hw_001', name: 'Python基础练习1', courseName: 'Python编程基础', deadline: '2024-12-31T23:59:59', status: 'ongoing' },
    { id: 'hw_002', name: '算法题目集', courseName: '数据结构与算法', deadline: '2024-12-25T23:59:59', status: 'ongoing' }
  ]

  // 模拟加载考试
  selectedExams.value = [
    { id: 'exam_001', name: 'Python期中考试', courseName: 'Python编程基础', examTime: '2024-12-20T14:00:00', duration: 120, status: 'upcoming' },
    { id: 'exam_002', name: '算法期末考试', courseName: '数据结构与算法', examTime: '2025-01-10T14:00:00', duration: 150, status: 'upcoming' }
  ]

  // 模拟加载老师
  selectedTeachers.value = [
    { id: 'teacher_001', name: '王老师', teacherId: 'T001', roles: ['班主任', '任课教师'], subjects: ['数学', '算法'], isHeadTeacher: true },
    { id: 'teacher_002', name: '李老师', teacherId: 'T002', roles: ['任课教师'], subjects: ['语文'], isHeadTeacher: false }
  ]

  // 模拟加载学生
  selectedStudents.value = [
    { id: 'student_001', name: '张三', studentId: 'S001', mobile: '13800138001', email: 'zhangsan@example.com', status: 'studying' },
    { id: 'student_002', name: '李四', studentId: 'S002', mobile: '13800138002', email: 'lisi@example.com', status: 'new' },
    { id: 'student_003', name: '王五', studentId: 'S003', mobile: '13800138003', email: 'wangwu@example.com', status: 'suspended' },
    { id: 'student_004', name: '赵六', studentId: 'S004', mobile: '13800138004', email: 'zhaoliu@example.com', status: 'studying' },
    { id: 'student_005', name: '钱七', studentId: 'S005', mobile: '13800138005', email: 'qianqi@example.com', status: 'finished' }
  ]
}

// 方法
const handleAddCourses = () => {
  selectCourseVisible.value = true
}

const handleAddAssignments = () => {
  selectAssignmentVisible.value = true
}

const handleAddExams = () => {
  selectExamVisible.value = true
}

const handleAddTeachers = () => {
  selectTeacherVisible.value = true
}

const handleAddStudents = () => {
  selectStudentVisible.value = true
}

const handleBatchImportStudents = () => {
  ElMessage.info('批量导入学生功能开发中...')
}

const handleCoursesSelected = (courses) => {
  selectedCourses.value = courses
  selectCourseVisible.value = false
  ElMessage.success(`已选择 ${courses.length} 门课程`)
}

const handleAssignmentsSelected = (assignments) => {
  selectedAssignments.value = assignments
  selectAssignmentVisible.value = false
  ElMessage.success(`已选择 ${assignments.length} 个作业`)
}

const handleExamsSelected = (exams) => {
  selectedExams.value = exams
  selectExamVisible.value = false
  ElMessage.success(`已选择 ${exams.length} 场考试`)
}

const handleTeachersSelected = (teachers) => {
  selectedTeachers.value = teachers
  selectTeacherVisible.value = false
  ElMessage.success(`已选择 ${teachers.length} 名老师`)
}

const handleStudentsSelected = (students) => {
  selectedStudents.value = students
  selectStudentVisible.value = false
  ElMessage.success(`已选择 ${students.length} 名学生`)
}

const handleRemoveCourse = (course) => {
  ElMessageBox.confirm(`确定要移除课程"${course.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = selectedCourses.value.findIndex(c => c.id === course.id)
    if (index > -1) {
      selectedCourses.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleRemoveAssignment = (assignment) => {
  ElMessageBox.confirm(`确定要移除作业"${assignment.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = selectedAssignments.value.findIndex(a => a.id === assignment.id)
    if (index > -1) {
      selectedAssignments.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleRemoveExam = (exam) => {
  ElMessageBox.confirm(`确定要移除考试"${exam.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = selectedExams.value.findIndex(e => e.id === exam.id)
    if (index > -1) {
      selectedExams.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleRemoveTeacher = (teacher) => {
  ElMessageBox.confirm(`确定要移除老师"${teacher.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = selectedTeachers.value.findIndex(t => t.id === teacher.id)
    if (index > -1) {
      selectedTeachers.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleRemoveStudent = (student) => {
  ElMessageBox.confirm(`确定要移除学生"${student.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = selectedStudents.value.findIndex(s => s.id === student.id)
    if (index > -1) {
      selectedStudents.value.splice(index, 1)
      ElMessage.success('移除成功')
    }
  })
}

const handleHeadTeacherChange = (teacher) => {
  if (teacher.isHeadTeacher) {
    ElMessage.success(`已将"${teacher.name}"设置为班主任`)
  } else {
    ElMessage.info(`已取消"${teacher.name}"的班主任身份`)
  }
}

const handleCourseAccess = (course) => {
  selectedCourseId.value = course.id
  courseAccessVisible.value = true
}

const handleCourseAccessSave = () => {
  ElMessage.success('课次开放设置已保存')
  courseAccessVisible.value = false
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = () => {
  const data = {
    courses: selectedCourses.value,
    assignments: selectedAssignments.value,
    exams: selectedExams.value,
    teachers: selectedTeachers.value,
    students: selectedStudents.value,
    headTeachers: selectedTeachers.value.filter(t => t.isHeadTeacher)
  }
  
  emit('save', data)
  ElMessage.success('资源管理已保存')
  emit('update:modelValue', false)
}

// 工具方法
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAssignmentStatusType = (assignment) => {
  const now = new Date()
  const deadline = new Date(assignment.deadline)
  if (now > deadline) return 'info'
  return 'success'
}

const getAssignmentStatusLabel = (assignment) => {
  const now = new Date()
  const deadline = new Date(assignment.deadline)
  if (now > deadline) return '已截止'
  return '进行中'
}

const getExamStatusType = (exam) => {
  const now = new Date()
  const examTime = new Date(exam.examTime)
  if (now > examTime) return 'info'
  return 'warning'
}

const getExamStatusLabel = (exam) => {
  const now = new Date()
  const examTime = new Date(exam.examTime)
  if (now > examTime) return '已结束'
  return '未开始'
}

// 学生状态相关函数
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
    new: 'info',
    studying: 'success',
    suspended: 'warning',
    archived: 'info',
    finished: '',
    refunded: 'danger'
  }
  return map[status] || ''
}

// 监听props变化
watch(() => props.classData, () => {
  initData()
}, { immediate: true })
</script>

<style lang="scss" scoped>
.resource-management-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-lighter);

  .header-info {
    display: flex;
    align-items: center;
    gap: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .count {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.resource-list {
  flex: 1;
  overflow-y: auto;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
