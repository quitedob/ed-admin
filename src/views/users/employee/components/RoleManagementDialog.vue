<template>
  <el-dialog
    v-model="visible"
    title="角色管理"
    width="900px"
    @close="handleClose"
  >
    <div class="role-management">
      <!-- 角色列表 -->
      <div class="role-list-section">
        <h4>角色列表</h4>
        <el-table :data="roles" stripe style="width: 100%">
          <el-table-column prop="name" label="角色名" width="150" />
          <el-table-column label="权限数" width="100" align="center">
            <template #default="{ row }">
              {{ countPermissions(row) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditRole(row)">
                编辑权限
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteRole(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" style="margin-top: 12px" @click="handleCreateRole">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>

      <!-- 权限编辑 -->
      <div v-if="selectedRole" class="permission-edit-section">
        <h4>编辑权限 - {{ selectedRole.name }}</h4>

        <el-form label-width="120px">
          <el-form-item label="角色名">
            <el-input v-model="selectedRole.name" />
          </el-form-item>

          <div class="permissions-grid">
            <div v-for="(module, moduleKey) in modules" :key="moduleKey" class="module-card">
              <h5>{{ module.label }}</h5>
              <div class="permission-checkboxes">
                <el-checkbox
                  v-for="perm in module.permissions"
                  :key="perm"
                  v-model="selectedRole.permissions[moduleKey][perm]"
                >
                  {{ getPermissionLabel(perm) }}
                </el-checkbox>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <el-button @click="selectedRole = null">取消</el-button>
            <el-button type="primary" @click="handleSaveRole">保存</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  roles: Array
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedRole = ref(null)

const modules = {
  course: {
    label: '课程管理',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  },
  homework: {
    label: '作业管理',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  },
  exam: {
    label: '考试管理',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  },
  class: {
    label: '班级管理',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  },
  questionBank: {
    label: '题库管理',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  },
  ai: {
    label: 'AI助教',
    permissions: ['view', 'create', 'update', 'delete', 'export']
  }
}

const getPermissionLabel = (perm) => {
  const map = {
    view: '查看',
    create: '新建',
    update: '编辑',
    delete: '删除',
    export: '导出'
  }
  return map[perm] || perm
}

const countPermissions = (role) => {
  let count = 0
  Object.values(role.permissions).forEach(module => {
    Object.values(module).forEach(perm => {
      if (perm) count++
    })
  })
  return count
}

const handleEditRole = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
}

const handleCreateRole = () => {
  const newRole = {
    id: `role_${Date.now()}`,
    name: '新角色',
    permissions: {}
  }

  Object.keys(modules).forEach(moduleKey => {
    newRole.permissions[moduleKey] = {
      view: false,
      create: false,
      update: false,
      delete: false,
      export: false
    }
  })

  selectedRole.value = newRole
}

const handleDeleteRole = (role) => {
  ElMessageBox.confirm(
    `确定删除角色 ${role.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = props.roles.findIndex(r => r.id === role.id)
    if (index > -1) {
      props.roles.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSaveRole = () => {
  if (!selectedRole.value.name) {
    ElMessage.warning('请输入角色名')
    return
  }

  const existingIndex = props.roles.findIndex(r => r.id === selectedRole.value.id)
  if (existingIndex > -1) {
    props.roles[existingIndex] = selectedRole.value
    ElMessage.success('角色已更新')
  } else {
    props.roles.push(selectedRole.value)
    ElMessage.success('角色已创建')
  }

  selectedRole.value = null
}

const handleClose = () => {
  visible.value = false
  selectedRole.value = null
}
</script>

<style scoped>
.role-management {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 400px;
}

.role-list-section,
.permission-edit-section {
  display: flex;
  flex-direction: column;
}

h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.permissions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 20px 0;
}

.module-card {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border-left: 3px solid var(--color-primary);
}

.permission-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}
</style>
