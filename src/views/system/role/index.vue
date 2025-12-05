<!-- src/views/system/role/index.vue -->
<template>
  <div class="app-container">
    <!-- 顶部操作栏 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="输入角色名称搜索"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" class="filter-item" @click="handleSearch">
        搜索
      </el-button>
      <el-button type="success" class="filter-item" @click="handleCreate">
        <el-icon><Plus /></el-icon> 新增角色
      </el-button>
    </div>

    <!-- 角色表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />

      <el-table-column label="角色名称" prop="roleName" align="center" width="150">
        <template #default="{ row }">
          <span style="font-weight: 600;">{{ row.roleName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="角色标识" prop="roleCode" align="center" width="150">
        <template #default="{ row }">
          <el-tag type="info">{{ row.roleCode }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="描述" prop="description" align="left" min-width="200" show-overflow-tooltip />

      <el-table-column label="权限数量" align="center" width="100">
        <template #default="{ row }">
          <el-tag type="success">{{ row.permissions?.length || 0 }} 个</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="创建时间" prop="createTime" align="center" width="160">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleUpdate(row)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-model:page="page"
      v-model:limit="limit"
      :total="total"
      @pagination="getList"
    />

    <!-- 编辑/新增 抽屉组件 -->
    <RoleDrawer ref="roleDrawerRef" @refresh="getList" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RoleDrawer from './components/RoleDrawer.vue'
import Pagination from '@/components/Pagination/index.vue'

// 模拟数据
const mockRoles = [
  {
    id: 1,
    roleName: '超级管理员',
    roleCode: 'admin',
    description: '拥有所有权限，可管理整个系统',
    status: 1,
    permissions: ['dashboard:view', 'stat:data', 'stat:login', 'stat:vod'],
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    roleName: '教务管理员',
    roleCode: 'academic_admin',
    description: '负责课程、班级、作业、考试等教学相关管理',
    status: 1,
    permissions: ['class:view', 'class:create', 'course:view', 'course:create'],
    createTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    roleName: '教师',
    roleCode: 'teacher',
    description: '授课教师，可管理自己的课程和班级',
    status: 1,
    permissions: ['course:view', 'class:view', 'homework:view'],
    createTime: '2024-01-03 10:00:00'
  },
  {
    id: 4,
    roleName: '运营专员',
    roleCode: 'operator',
    description: '负责用户运营和数据查看',
    status: 1,
    permissions: ['dashboard:view', 'stat:data', 'student:view'],
    createTime: '2024-01-04 10:00:00'
  },
  {
    id: 5,
    roleName: '学生',
    roleCode: 'student',
    description: '学生用户，可查看自己的课程和学习数据',
    status: 1,
    permissions: ['course:view', 'homework:view', 'exam:view'],
    createTime: '2024-01-05 10:00:00'
  }
]

const list = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const listLoading = ref(true)
const searchQuery = ref('')
const roleDrawerRef = ref(null)

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return dateString
}

// 获取列表
const getList = () => {
  listLoading.value = true

  // 模拟API请求
  setTimeout(() => {
    let filteredList = mockRoles
    if (searchQuery.value) {
      filteredList = mockRoles.filter(item =>
        item.roleName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.roleCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.description.includes(searchQuery.value)
      )
    }

    total.value = filteredList.length
    const start = (page.value - 1) * limit.value
    const end = start + limit.value
    list.value = filteredList.slice(start, end)

    listLoading.value = false
  }, 500)
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleCreate = () => {
  roleDrawerRef.value.openDrawer()
}

const handleUpdate = (row) => {
  roleDrawerRef.value.openDrawer(row)
}

const handleDelete = (row) => {
  if (row.roleCode === 'admin') {
    ElMessage.warning('超级管理员角色不能删除')
    return
  }

  ElMessageBox.confirm('确认删除该角色吗？删除后无法恢复', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里调用API删除
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {
    // 取消删除
  })
}

const handleStatusChange = (row) => {
  if (row.roleCode === 'admin' && row.status === 0) {
    ElMessage.warning('超级管理员角色不能禁用')
    row.status = 1
    return
  }

  ElMessage.success(row.status === 1 ? '角色已启用' : '角色已禁用')
  // 这里调用API更新状态
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: calc(100vh - 84px);
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-item {
  margin-right: 10px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}

:deep(.el-table__fixed-right) {
  right: 0 !important;
}
</style>
