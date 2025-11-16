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
        placeholder="搜索老师工号、姓名、手机号..."
        clearable
        style="width: 350px"
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
      <el-table :data="paginatedLecturers" stripe>
        <el-table-column prop="teacherId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search } from '@element-plus/icons-vue'
import AuthorizeDialog from '../components/AuthorizeDialog.vue'

const router = useRouter()

// 响应式数据
const searchText = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const authorizeDialogVisible = ref(false)
const selectedLecturer = ref(null)

const lecturers = ref([])

// 计算属性
const filteredLecturers = computed(() => {
  let result = lecturers.value

  if (searchText.value) {
    result = result.filter(l =>
      l.name.includes(searchText.value) ||
      l.teacherId.includes(searchText.value) ||
      l.phone.includes(searchText.value)
    )
  }

  if (filterStatus.value) {
    result = result.filter(l => l.status === filterStatus.value)
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
      name: '王老师',
      teacherId: 'T001',
      phone: '13800138000',
      email: 'wang@example.com',
      joinDate: '2020-09-01',
      status: 'active',
      classCount: 3,
      authorizedClasses: [
        { id: 'cls_001', name: '一年级一班' },
        { id: 'cls_002', name: '五年级二班' }
      ]
    },
    {
      id: 'lecturer_002',
      name: '李老师',
      teacherId: 'T002',
      phone: '13900139000',
      email: 'li@example.com',
      joinDate: '2021-09-01',
      status: 'active',
      classCount: 2,
      authorizedClasses: [
        { id: 'cls_003', name: '初二一班' }
      ]
    },
    {
      id: 'lecturer_003',
      name: '张老师',
      teacherId: 'T003',
      phone: '13700137000',
      email: 'zhang@example.com',
      joinDate: '2019-09-01',
      status: 'active',
      classCount: 4,
      authorizedClasses: [
        { id: 'cls_004', name: '高三三班' },
        { id: 'cls_001', name: '一年级一班' }
      ]
    },
    {
      id: 'lecturer_004',
      name: '赵老师',
      teacherId: 'T004',
      phone: '13600136000',
      email: 'zhao@example.com',
      joinDate: '2022-09-01',
      status: 'inactive',
      classCount: 0,
      authorizedClasses: []
    }
  ]
}

// 方法
const handleCreateLecturer = () => {
  ElMessage.info('新建老师功能开发中...')
}

const handleEdit = (lecturer) => {
  ElMessage.info(`编辑老师：${lecturer.name}`)
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

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleReset = () => {
  searchText.value = ''
  filterStatus.value = ''
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
