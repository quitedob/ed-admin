
<template>
  <div class="class-management-container">
    <div class="main-content">
      <!-- 左侧工具栏 -->
      <div class="left-sidebar">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" class="new-class-btn" @click="handleCreateClass">
            <el-icon><Plus /></el-icon>
            新建班级
          </el-button>
          <el-button class="import-btn" @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </div>

        <!-- 筛选器 -->
        <div class="filters">
          <div class="filter-section">
            <div class="filter-label">年级</div>
            <el-select v-model="filterGrade" placeholder="全部年级" clearable>
              <el-option label="全部年级" value="" />
              <el-option label="一年级" value="grade1" />
              <el-option label="二年级" value="grade2" />
              <el-option label="三年级" value="grade3" />
              <el-option label="四年级" value="grade4" />
              <el-option label="五年级" value="grade5" />
              <el-option label="初一" value="grade7" />
              <el-option label="初二" value="grade8" />
              <el-option label="初三" value="grade9" />
              <el-option label="高一" value="grade10" />
              <el-option label="高二" value="grade11" />
              <el-option label="高三" value="grade12" />
            </el-select>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="search-section">
          <el-input
            v-model="searchText"
            placeholder="搜索班级..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 右侧班级卡片网格 -->
      <div class="right-content">
        <div class="content-header">
          <h2>班级管理</h2>
          <div class="stats">
            <span>共 {{ filteredClasses.length }} 个班级</span>
            <span>总学生数: {{ totalStudents }}</span>
          </div>
        </div>

        <div class="class-grid">
          <el-row :gutter="20">
            <el-col
              v-for="classItem in paginatedClasses"
              :key="classItem.id"
              :span="8"
            >
              <el-card class="class-card" shadow="hover">
                <div class="card-header">
                  <div class="class-info">
                    <h3 class="class-name">{{ classItem.name }}</h3>
                    <el-tag :type="getStatusTagType(classItem.status)" size="small">
                      {{ getStatusLabel(classItem.status) }}
                    </el-tag>
                  </div>
                  <el-tag type="info">{{ getGradeLabel(classItem.grade) }}</el-tag>
                </div>

                <div class="card-description">
                  {{ classItem.description || '暂无描述' }}
                </div>

                <div class="card-stats">
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>{{ classItem.studentCount }}名学生</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><UserFilled /></el-icon>
                    <span>{{ classItem.teacherCount }}名老师</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Reading /></el-icon>
                    <span>课程: {{ classItem.courseCount }}门</span>
                  </div>
                  <div class="stat-item class-code-item">
                    <span class="code-label">班级码:</span>
                    <el-input
                      v-model="classItem.code"
                      size="small"
                      class="code-input"
                      readonly
                    />
                    <el-button
                      type="primary"
                      size="small"
                      text
                      @click="editClassCode(classItem)"
                    >
                      编辑
                    </el-button>
                  </div>
                </div>

                <div class="card-head-teachers">
                  <span class="label">班主任：</span>
                  <el-tag
                    v-for="teacher in classItem.headTeachers"
                    :key="teacher.id"
                    size="small"
                    style="margin-right: 4px;"
                  >
                    {{ teacher.name }}
                  </el-tag>
                </div>

                <div class="card-actions">
                  <el-button link type="primary" size="small" @click="handleEdit(classItem)">
                    编辑班级信息
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleManageStudents(classItem)">
                    管理学生
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleManageTeachers(classItem)">
                    管理老师
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleAuthorizeCourses(classItem)">
                    授权课程
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleAuthorizeHomeworks(classItem)">
                    授权作业
                  </el-button>
                  <el-button link type="primary" size="small" @click="handleAuthorizeExams(classItem)">
                    授权考试
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-empty v-if="filteredClasses.length === 0" description="暂无班级" />
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredClasses.length"
            :page-sizes="[9, 18, 36]"
            layout="total, sizes, prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- 新建/编辑班级对话框 -->
    <ClassDialog
      v-model="classDialogVisible"
      :class-data="currentClass"
      @save="handleSaveClass"
    />

    <!-- 学生管理抽屉 -->
    <StudentManagementDrawer
      v-model="studentDrawerVisible"
      :class-data="currentClass"
      @save="handleStudentsSave"
    />

    <!-- 老师管理抽屉 -->
    <TeacherManagementDrawer
      v-model="teacherDrawerVisible"
      :class-data="currentClass"
      @save="handleTeachersSave"
    />

    <!-- 授权对话框 -->
    <AuthorizationDialog
      v-model="authorizationDialogVisible"
      :class-data="currentClass"
      :auth-type="currentAuthType"
      @save="handleAuthorizationSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Search,
  User,
  UserFilled,
  Reading,
  Calendar,
  View,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import ClassDialog from './components/ClassDialog.vue'
import StudentManagementDrawer from './components/StudentManagementDrawer.vue'
import TeacherManagementDrawer from './components/TeacherManagementDrawer.vue'
import AuthorizationDialog from './components/AuthorizationDialog.vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterGrade = ref('')
const filterMajor = ref('')
const filterSemester = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const classDialogVisible = ref(false)
const currentClass = ref(null)
const studentDrawerVisible = ref(false)
const teacherDrawerVisible = ref(false)
const authorizationDialogVisible = ref(false)
const currentAuthType = ref('course')

const classes = ref([])

// 计算属性
const filteredClasses = computed(() => {
  let result = classes.value

  if (searchText.value) {
    result = result.filter(c =>
      c.name.includes(searchText.value) ||
      c.description?.includes(searchText.value) ||
      c.headTeacherName.includes(searchText.value)
    )
  }

  if (filterGrade.value) {
    result = result.filter(c => c.grade === filterGrade.value)
  }

  if (filterMajor.value) {
    result = result.filter(c => c.major === filterMajor.value)
  }

  if (filterSemester.value) {
    result = result.filter(c => c.semester === filterSemester.value)
  }

  return result
})

const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClasses.value.slice(start, end)
})

const totalStudents = computed(() => {
  return classes.value.reduce((sum, c) => sum + c.studentCount, 0)
})

// 初始化模拟数据
const initMockData = () => {
  classes.value = [
    {
      id: 'class_001',
      name: '一年级一班',
      description: '小学一年级基础班',
      headTeachers: [
        { id: 'teacher_001', name: '王老师' },
        { id: 'teacher_005', name: '陈老师' }
      ],
      grade: 'grade1',
      studentCount: 30,
      teacherCount: 3,
      courseCount: 3,
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'class_002',
      name: '五年级二班',
      description: '小学五年级进阶班',
      headTeachers: [
        { id: 'teacher_002', name: '李老师' }
      ],
      grade: 'grade5',
      studentCount: 28,
      teacherCount: 2,
      courseCount: 2,
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'class_003',
      name: '初二一班',
      description: '初中二年级班',
      headTeachers: [
        { id: 'teacher_003', name: '张老师' }
      ],
      grade: 'grade8',
      studentCount: 25,
      teacherCount: 2,
      courseCount: 4,
      status: 'active',
      createdAt: '2024-03-01T10:00:00Z'
    },
    {
      id: 'class_004',
      name: '高三三班',
      description: '高中三年级毕业班',
      headTeachers: [
        { id: 'teacher_004', name: '赵老师' },
        { id: 'teacher_006', name: '刘老师' }
      ],
      grade: 'grade12',
      studentCount: 22,
      teacherCount: 3,
      courseCount: 3,
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    }
  ]
}

// 方法
const handleCreateClass = () => {
  currentClass.value = null
  classDialogVisible.value = true
}

const handleEdit = (classItem) => {
  currentClass.value = { ...classItem }
  classDialogVisible.value = true
}

const handleManageStudents = (classItem) => {
  currentClass.value = classItem
  studentDrawerVisible.value = true
}

const handleManageTeachers = (classItem) => {
  currentClass.value = classItem
  teacherDrawerVisible.value = true
}

const handleAuthorizeCourses = (classItem) => {
  currentClass.value = classItem
  currentAuthType.value = 'course'
  authorizationDialogVisible.value = true
}

const handleAuthorizeHomeworks = (classItem) => {
  currentClass.value = classItem
  currentAuthType.value = 'homework'
  authorizationDialogVisible.value = true
}

const handleAuthorizeExams = (classItem) => {
  currentClass.value = classItem
  currentAuthType.value = 'exam'
  authorizationDialogVisible.value = true
}

const editClassCode = (classItem) => {
  ElMessageBox.prompt('请输入新的班级码', '编辑班级码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: classItem.code
  }).then(({ value }) => {
    if (value) {
      classItem.code = value
      ElMessage.success('班级码已更新')
    }
  }).catch(() => {
    ElMessage.info('已取消编辑')
  })
}

const handleStudentsSave = (data) => {
  ElMessage.success('学生列表已更新')
}

const handleTeachersSave = (data) => {
  if (currentClass.value) {
    currentClass.value.headTeachers = data.headTeachers
    // 更新班级数据
    const index = classes.value.findIndex(c => c.id === currentClass.value.id)
    if (index > -1) {
      classes.value[index].headTeachers = data.headTeachers
    }
  }
  ElMessage.success('老师列表已更新')
}

const handleAuthorizationSave = (data) => {
  ElMessage.success(`${data.authType === 'course' ? '课程' : data.authType === 'homework' ? '作业' : '考试'}授权已更新`)
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleSaveClass = (classData) => {
  if (currentClass.value) {
    // 更新班级
    const index = classes.value.findIndex(c => c.id === currentClass.value.id)
    if (index > -1) {
      classes.value[index] = { ...classes.value[index], ...classData }
    }
    ElMessage.success('班级更新成功')
  } else {
    // 新建班级
    const newClass = {
      id: `class_${Date.now()}`,
      ...classData,
      studentCount: 0,
      courseCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    classes.value.push(newClass)
    ElMessage.success('班级创建成功')
  }
  classDialogVisible.value = false
}

const getGradeLabel = (grade) => {
  const map = {
    grade1: '一年级',
    grade2: '二年级',
    grade3: '三年级',
    grade4: '四年级',
    grade5: '五年级',
    grade7: '初一',
    grade8: '初二',
    grade9: '初三',
    grade10: '高一',
    grade11: '高二',
    grade12: '高三'
  }
  return map[grade] || grade
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
    active: '活跃',
    inactive: '停用',
    graduated: '已毕业'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'info',
    graduated: 'warning'
  }
  return map[status] || ''
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.class-management-container {
  min-height: calc(100vh - 60px);
  background: var(--color-bg-primary);
}

.main-content {
  display: flex;
  gap: 20px;
  padding: 24px;
}

/* 左侧工具栏 */
.left-sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .new-class-btn,
    .import-btn {
      width: 100%;
    }
  }

  .filters {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--shadow-base);

    .filter-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-label {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }

      .el-select {
        width: 100%;
      }
    }
  }

  .search-section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: var(--shadow-base);
  }
}

/* 右侧内容区 */
.right-content {
  flex: 1;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .class-grid {
    margin-bottom: 20px;
  }
}

/* 班级卡片 */
.class-card {
  margin-bottom: 20px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .class-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;

      .class-name {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }
    }
  }

  .card-description {
    color: var(--color-text-secondary);
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.6;
    min-height: 40px;
  }

  .card-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--color-bg-secondary);
    border-radius: 8px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-text-regular);

      .el-icon {
        color: var(--color-primary);
      }

      &.class-code-item {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        gap: 8px;

        .code-label {
          color: var(--color-text-secondary);
          font-weight: 500;
          min-width: 50px;
        }

        .code-input {
          flex: 1;
          max-width: 150px;

          :deep(.el-input__wrapper) {
            padding: 4px 8px;
          }

          :deep(.el-input__inner) {
            font-size: 12px;
            font-family: monospace;
          }
        }

        .el-button {
          margin-left: 8px;
        }
      }
    }
  }

  .card-head-teachers {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;

    .label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
  }

  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border-lighter);

    .el-button {
      font-size: 12px;
      padding: 4px 8px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
