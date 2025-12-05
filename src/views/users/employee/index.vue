<template>
  <div class="employee-management">
    <el-card class="box-card">
      <!-- 工具栏 -->
      <template #header>
        <div class="card-header">
          <span>员工管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              新增员工
            </el-button>
            <el-button @click="handleRoleManagement">
              <el-icon><Setting /></el-icon>
              角色管理
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索员工名称或账号..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterRole"
          placeholder="筛选角色"
          clearable
          style="width: 200px; margin-left: 12px"
        >
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </div>

      <!-- 员工表格 -->
      <el-table :data="filteredEmployees" stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="account" label="账号" width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="所属角色" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="roleId in row.roleIds"
              :key="roleId"
              style="margin-right: 4px"
            >
              {{ getRoleName(roleId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="classCount" label="负责班级数" width="100" align="center" />
        <el-table-column prop="studentCount" label="负责学生数" width="100" align="center" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑信息
            </el-button>
            <el-button link type="primary" size="small" @click="handleAssignRoles(row)">
              分配角色
            </el-button>
            <el-button link type="primary" size="small" @click="handleViewAuthorization(row)">
              查看授权
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="filteredEmployees.length"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 编辑员工对话框 -->
    <EmployeeDialog
      v-model="employeeDialogVisible"
      :employee="currentEmployee"
      :roles="roles"
      @save="handleSaveEmployee"
    />

    <!-- 分配角色对话框 -->
    <RoleAssignmentDialog
      v-model="roleAssignmentVisible"
      :employee="currentEmployee"
      :roles="roles"
      @save="handleSaveRoles"
    />

    <!-- 角色管理对话框 -->
    <RoleManagementDialog
      v-model="roleManagementVisible"
      :roles="roles"
      @save="handleSaveRoles"
    />

    <!-- 查看授权对话框 -->
    <AuthorizationViewDialog
      v-model="authorizationViewVisible"
      :employee="currentEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Setting, Search } from '@element-plus/icons-vue'
import EmployeeDialog from './components/EmployeeDialog.vue'
import RoleAssignmentDialog from './components/RoleAssignmentDialog.vue'
import RoleManagementDialog from './components/RoleManagementDialog.vue'
import AuthorizationViewDialog from './components/AuthorizationViewDialog.vue'

const searchText = ref('')
const filterRole = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const employeeDialogVisible = ref(false)
const roleAssignmentVisible = ref(false)
const roleManagementVisible = ref(false)
const authorizationViewVisible = ref(false)
const currentEmployee = ref(null)

const employees = ref([])
const roles = ref([])

// 初始化模拟数据
const initMockData = () => {
  roles.value = [
    {
      id: 'role_001',
      name: '班主任',
      permissions: {
        course: { view: true, create: false, update: false, delete: false, export: false },
        homework: { view: true, create: true, update: true, delete: true, export: true },
        exam: { view: true, create: true, update: true, delete: true, export: true },
        class: { view: true, create: false, update: false, delete: false, export: false },
        ai: { view: true, create: false, update: false, delete: false, export: false }
      }
    },
    {
      id: 'role_002',
      name: '教务',
      permissions: {
        course: { view: true, create: true, update: true, delete: false, export: true },
        homework: { view: true, create: false, update: false, delete: false, export: true },
        exam: { view: true, create: false, update: false, delete: false, export: true },
        class: { view: true, create: true, update: true, delete: false, export: true },
        ai: { view: true, create: false, update: false, delete: false, export: false }
      }
    },
    {
      id: 'role_003',
      name: '前台',
      permissions: {
        course: { view: true, create: false, update: false, delete: false, export: false },
        homework: { view: true, create: false, update: false, delete: false, export: false },
        exam: { view: true, create: false, update: false, delete: false, export: false },
        class: { view: true, create: false, update: false, delete: false, export: false },
        ai: { view: false, create: false, update: false, delete: false, export: false }
      }
    },
    {
      id: 'role_004',
      name: '教研',
      permissions: {
        course: { view: true, create: true, update: true, delete: true, export: true },
        homework: { view: true, create: true, update: true, delete: true, export: true },
        exam: { view: true, create: true, update: true, delete: true, export: true },
        class: { view: true, create: false, update: false, delete: false, export: false },
        ai: { view: true, create: true, update: true, delete: true, export: true }
      }
    }
  ]

  employees.value = [
    {
      id: 'emp_001',
      name: '王老师',
      account: 'wang_teacher',
      phone: '13800138001',
      roleIds: ['role_001'],
      classCount: 2,
      studentCount: 60,
      createdAt: '2024-01-01'
    },
    {
      id: 'emp_002',
      name: '李老师',
      account: 'li_teacher',
      phone: '13800138002',
      roleIds: ['role_001', 'role_002'],
      classCount: 1,
      studentCount: 30,
      createdAt: '2024-01-02'
    },
    {
      id: 'emp_003',
      name: '张老师',
      account: 'zhang_teacher',
      phone: '13800138003',
      roleIds: ['role_004'],
      classCount: 0,
      studentCount: 0,
      createdAt: '2024-01-03'
    },
    {
      id: 'emp_004',
      name: '前台小王',
      account: 'front_desk',
      phone: '13800138004',
      roleIds: ['role_003'],
      classCount: 0,
      studentCount: 0,
      createdAt: '2024-01-04'
    }
  ]
}

const filteredEmployees = computed(() => {
  let result = employees.value

  if (searchText.value) {
    result = result.filter(e =>
      e.name.includes(searchText.value) ||
      e.account.includes(searchText.value)
    )
  }

  if (filterRole.value) {
    result = result.filter(e => e.roleIds.includes(filterRole.value))
  }

  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role?.name || roleId
}

const handleCreate = () => {
  currentEmployee.value = null
  employeeDialogVisible.value = true
}

const handleEdit = (employee) => {
  currentEmployee.value = { ...employee }
  employeeDialogVisible.value = true
}

const handleAssignRoles = (employee) => {
  currentEmployee.value = employee
  roleAssignmentVisible.value = true
}

const handleViewAuthorization = (employee) => {
  currentEmployee.value = employee
  authorizationViewVisible.value = true
}

const handleDelete = (employee) => {
  ElMessageBox.confirm(
    `确定删除员工 ${employee.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = employees.value.findIndex(e => e.id === employee.id)
    if (index > -1) {
      employees.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSaveEmployee = (data) => {
  if (currentEmployee.value) {
    const index = employees.value.findIndex(e => e.id === currentEmployee.value.id)
    if (index > -1) {
      employees.value[index] = { ...employees.value[index], ...data }
    }
    ElMessage.success('员工信息已更新')
  } else {
    employees.value.push({
      id: `emp_${Date.now()}`,
      ...data,
      roleIds: [],
      classCount: 0,
      studentCount: 0,
      createdAt: new Date().toISOString()
    })
    ElMessage.success('员工已创建')
  }
  employeeDialogVisible.value = false
}

const handleSaveRoles = (data) => {
  if (currentEmployee.value) {
    const index = employees.value.findIndex(e => e.id === currentEmployee.value.id)
    if (index > -1) {
      employees.value[index].roleIds = data.roleIds
    }
    ElMessage.success('角色已分配')
  }
  roleAssignmentVisible.value = false
}

const handleRoleManagement = () => {
  roleManagementVisible.value = true
}

onMounted(() => {
  initMockData()
})
</script>

<style scoped>
.employee-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
</style>
