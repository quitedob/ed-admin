<template>
  <div class="teacher-management-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title-section">
        <h2>老师管理</h2>
        <div class="stats">
          <span>共 {{ filteredTeachers.length }} 名老师</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreateTeacher">
          <el-icon><Plus /></el-icon>
          新建老师
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入老师
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索老师姓名、工号..."
        clearable
        style="width: 300px"
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

      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 老师表格 -->
    <div class="table-container">
      <el-table :data="paginatedTeachers" stripe>
        <el-table-column prop="name" label="老师姓名" width="150" />
        <el-table-column label="工号/手机号" width="180">
          <template #default="scope">
            <div>{{ scope.row.teacherId }}</div>
            <div class="secondary-text">{{ scope.row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责班级数量" width="120" align="center">
          <template #default="scope">
            {{ scope.row.classCount }}
          </template>
        </el-table-column>
        <el-table-column label="负责课程数量" width="120" align="center">
          <template #default="scope">
            {{ scope.row.courseCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleViewDetail(scope.row)">
              详情
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredTeachers.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <!-- 老师详情抽屉 -->
    <TeacherDetailDrawer
      v-model="detailDrawerVisible"
      :teacher-data="selectedTeacher"
      @save="handleSaveTeacher"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search } from '@element-plus/icons-vue'
import TeacherDetailDrawer from './components/TeacherDetailDrawer.vue'

// 响应式数据
const searchText = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const detailDrawerVisible = ref(false)
const selectedTeacher = ref(null)

const teachers = ref([])

// 计算属性
const filteredTeachers = computed(() => {
  let result = teachers.value

  if (searchText.value) {
    result = result.filter(t =>
      t.name.includes(searchText.value) ||
      t.teacherId.includes(searchText.value) ||
      t.phone.includes(searchText.value)
    )
  }

  if (filterStatus.value) {
    result = result.filter(t => t.status === filterStatus.value)
  }

  return result
})

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTeachers.value.slice(start, end)
})

// 初始化模拟数据
const initMockData = () => {
  teachers.value = [
    {
      id: 'teacher_001',
      name: '王老师',
      teacherId: 'T001',
      phone: '13800138000',
      email: 'wang@example.com',
      status: 'active',
      classCount: 3,
      courseCount: 5,
      authorizedClasses: [
        { id: 'cls_001', name: '前端开发一班', role: 'headTeacher' },
        { id: 'cls_002', name: '前端开发二班', role: 'teacher' },
        { id: 'cls_003', name: '数据科学班', role: 'teacher' }
      ],
      authorizedCourses: [
        { id: 'c_001', name: 'JavaScript基础' },
        { id: 'c_002', name: 'Vue.js框架' },
        { id: 'c_003', name: 'React框架' },
        { id: 'c_004', name: 'Node.js后端' },
        { id: 'c_005', name: 'TypeScript进阶' }
      ]
    },
    {
      id: 'teacher_002',
      name: '李老师',
      teacherId: 'T002',
      phone: '13900139000',
      email: 'li@example.com',
      status: 'active',
      classCount: 2,
      courseCount: 3,
      authorizedClasses: [
        { id: 'cls_001', name: '前端开发一班', role: 'teacher' },
        { id: 'cls_004', name: '云计算班', role: 'headTeacher' }
      ],
      authorizedCourses: [
        { id: 'c_006', name: '数据库设计' },
        { id: 'c_007', name: '前端工程化' },
        { id: 'c_008', name: '性能优化' }
      ]
    },
    {
      id: 'teacher_003',
      name: '张老师',
      teacherId: 'T003',
      phone: '13700137000',
      email: 'zhang@example.com',
      status: 'active',
      classCount: 1,
      courseCount: 2,
      authorizedClasses: [
        { id: 'cls_003', name: '数据科学班', role: 'headTeacher' }
      ],
      authorizedCourses: [
        { id: 'c_009', name: '数据分析' },
        { id: 'c_010', name: '机器学习' }
      ]
    },
    {
      id: 'teacher_004',
      name: '赵老师',
      teacherId: 'T004',
      phone: '13600136000',
      email: 'zhao@example.com',
      status: 'inactive',
      classCount: 0,
      courseCount: 0,
      authorizedClasses: [],
      authorizedCourses: []
    }
  ]
}

// 方法
const handleCreateTeacher = () => {
  selectedTeacher.value = null
  detailDrawerVisible.value = true
}

const handleViewDetail = (teacher) => {
  selectedTeacher.value = { ...teacher }
  detailDrawerVisible.value = true
}

const handleDelete = (teacher) => {
  ElMessageBox.confirm(
    `确定要删除老师"${teacher.name}"吗？删除后无法恢复。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = teachers.value.findIndex(t => t.id === teacher.id)
    if (index > -1) {
      teachers.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = ''
}

const handleSaveTeacher = (teacherData) => {
  if (selectedTeacher.value?.id) {
    // 更新老师
    const index = teachers.value.findIndex(t => t.id === selectedTeacher.value.id)
    if (index > -1) {
      teachers.value[index] = { ...teachers.value[index], ...teacherData }
    }
    ElMessage.success('老师信息更新成功')
  } else {
    // 新建老师
    const newTeacher = {
      id: `teacher_${Date.now()}`,
      ...teacherData,
      classCount: 0,
      courseCount: 0,
      authorizedClasses: [],
      authorizedCourses: [],
      status: 'active'
    }
    teachers.value.push(newTeacher)
    ElMessage.success('老师创建成功')
  }
  detailDrawerVisible.value = false
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

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/users/teacher/index.vue`)
  initMockData()
})
</script>

<style lang="scss" scoped>
.teacher-management-container {
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

  .secondary-text {
    color: var(--color-text-secondary);
    font-size: 12px;
    margin-top: 4px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
