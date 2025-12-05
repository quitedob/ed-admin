<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    size="70%"
    :before-close="handleClose"
    destroy-on-close
    :close-on-click-modal="true"
  >
    <div class="drawer-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">

        <div class="section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色标识" prop="roleCode">
              <el-input v-model="formData.roleCode" placeholder="如：academic_admin" :disabled="isEdit && formData.roleCode === 'admin'" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色描述" prop="description">
          <el-input type="textarea" v-model="formData.description" :rows="2" placeholder="请输入角色描述信息" />
        </el-form-item>

        <el-divider />

        <div class="permission-header">
          <div class="section-title" style="margin-bottom: 0;">权限配置</div>
          <div class="permission-filter">
            <el-input
              v-model="permKeyword"
              placeholder="搜索权限名称..."
              size="small"
              style="width: 150px; margin-right: 10px;"
              :prefix-icon="Search"
            />
            <el-select v-model="categoryFilter" placeholder="所有分类" size="small" style="width: 120px;" clearable>
              <el-option v-for="mod in PERMISSION_MODULES" :key="mod.code" :label="mod.label" :value="mod.code" />
            </el-select>
            <div class="batch-operations">
              <el-button size="small" @click="checkAllPermissions(true)">全选</el-button>
              <el-button size="small" @click="checkAllPermissions(false)">清空</el-button>
            </div>
          </div>
        </div>

        <div class="permission-container">
          <el-scrollbar height="400px">
            <div v-if="filteredModules.length === 0" class="empty-text">没有找到相关权限</div>

            <div v-for="mod in filteredModules" :key="mod.code" class="permission-group">
              <div class="group-header">
                <el-checkbox
                  v-model="mod.checkAll"
                  :indeterminate="mod.isIndeterminate"
                  @change="(val) => handleCheckAllChange(val, mod)"
                >
                  <span class="group-label">{{ mod.label }}</span>
                </el-checkbox>
              </div>

              <div class="group-items">
                <el-checkbox-group
                  v-model="formData.permissions"
                  @change="(val) => handleCheckedPermsChange(val, mod)"
                >
                  <!-- 渲染层级权限结构 -->
                  <template v-for="perm in mod.permissions" :key="perm.value">
                    <!-- 有子权限的权限组 -->
                    <div v-if="perm.children && perm.children.length > 0" class="permission-subgroup">
                      <div class="subgroup-header" @click="toggleSubgroup(perm)">
                        <el-icon class="collapse-icon" :class="{ 'collapsed': !perm.expanded }">
                          <ArrowRight />
                        </el-icon>
                        <el-checkbox
                          v-model="perm.checked"
                          :indeterminate="perm.isIndeterminate"
                          @change="(val) => handleParentPermissionChange(val, perm, mod)"
                          @click.stop
                        >
                          <span class="subgroup-label">{{ perm.label }}</span>
                          <span class="permission-desc">{{ perm.description }}</span>
                        </el-checkbox>
                      </div>
                      <div v-show="perm.expanded" class="subgroup-items">
                        <el-checkbox-group
                          v-model="formData.permissions"
                          @change="(val) => handleChildPermissionChange(val, perm, mod)"
                        >
                          <el-checkbox
                            v-for="child in perm.children"
                            :key="child.value"
                            :label="child.value"
                            class="perm-item child-perm"
                          >
                            {{ child.label }}
                            <span class="permission-desc">{{ child.description }}</span>
                          </el-checkbox>
                        </el-checkbox-group>
                      </div>
                    </div>

                    <!-- 普通权限 -->
                    <el-checkbox
                      v-else
                      :label="perm.value"
                      class="perm-item"
                    >
                      {{ perm.label }}
                      <span class="permission-desc">{{ perm.description }}</span>
                    </el-checkbox>
                  </template>
                </el-checkbox-group>
              </div>
            </div>
          </el-scrollbar>
        </div>

      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import { PERMISSION_MODULES } from '@/utils/permissionList.js'

const emit = defineEmits(['refresh'])

const visible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const moduleStates = ref(flattenPermissionModules(JSON.parse(JSON.stringify(PERMISSION_MODULES))))

const formData = reactive({
  id: '',
  roleName: '',
  roleCode: '',
  description: '',
  permissions: []
})

const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

const permKeyword = ref('')
const categoryFilter = ref('')

// 扁平化权限模块，为层级权限添加状态管理
function flattenPermissionModules(modules) {
  return modules.map(mod => ({
    ...mod,
    permissions: mod.permissions.map(perm => {
      const flattenedPerm = { ...perm }
      if (perm.children) {
        flattenedPerm.children = [...perm.children]
        flattenedPerm.checked = false
        flattenedPerm.isIndeterminate = false
        // 默认折叠状态
        flattenedPerm.expanded = false
      }
      return flattenedPerm
    })
  }))
}

// 切换子权限组的展开/折叠状态
const toggleSubgroup = (perm) => {
  perm.expanded = !perm.expanded
}

const filteredModules = computed(() => {
  let modules = moduleStates.value
  if (categoryFilter.value) {
    modules = modules.filter(m => m.code === categoryFilter.value)
  }

  if (!permKeyword.value) return modules

  return modules.map(mod => {
    const filteredPerms = mod.permissions.filter(p => {
      // 检查权限本身是否匹配
      const selfMatch = p.label.includes(permKeyword.value) || p.value.includes(permKeyword.value)
      // 检查子权限是否匹配
      const childMatch = p.children ? p.children.some(child =>
        child.label.includes(permKeyword.value) || child.value.includes(permKeyword.value)
      ) : false
      return selfMatch || childMatch
    }).map(p => {
      // 如果有子权限，只保留匹配的子权限
      if (p.children && !p.label.includes(permKeyword.value) && !p.value.includes(permKeyword.value)) {
        return {
          ...p,
          children: p.children.filter(child =>
            child.label.includes(permKeyword.value) || child.value.includes(permKeyword.value)
          )
        }
      }
      return p
    }).filter(p => {
      // 保留权限本身匹配的，或者有匹配子权限的
      const selfMatch = p.label.includes(permKeyword.value) || p.value.includes(permKeyword.value)
      const childMatch = p.children ? p.children.length > 0 : false
      return selfMatch || childMatch
    })
    return {
      ...mod,
      permissions: filteredPerms
    }
  }).filter(mod => mod.permissions.length > 0)
})

const openDrawer = (row) => {
  visible.value = true
  isEdit.value = !!row

  if (row) {
    Object.assign(formData, row)
    if (!formData.permissions) formData.permissions = []
    initCheckboxState()
  } else {
    formData.id = ''
    formData.roleName = ''
    formData.roleCode = ''
    formData.description = ''
    formData.permissions = []
    resetCheckboxState()
  }
}

// 处理父权限的选中状态变化
const handleParentPermissionChange = (val, perm, mod) => {
  const allChildValues = perm.children.map(child => child.value)
  const currentChecked = formData.permissions

  if (val) {
    // 选中父权限，自动选中所有子权限
    const toAdd = allChildValues.filter(p => !currentChecked.includes(p))
    formData.permissions = [...currentChecked, ...toAdd]
    perm.isIndeterminate = false
  } else {
    // 取消选中父权限，自动取消所有子权限
    formData.permissions = currentChecked.filter(p => !allChildValues.includes(p))
    perm.isIndeterminate = false
  }

  // 更新模块的选中状态
  updateModuleCheckState(mod)
}

// 处理子权限的选中状态变化
const handleChildPermissionChange = (value, perm, mod) => {
  const childValues = perm.children.map(child => child.value)
  const checkedCount = childValues.filter(v => value.includes(v)).length
  const totalCount = childValues.length

  // 更新父权限的状态
  perm.checked = checkedCount === totalCount
  perm.isIndeterminate = checkedCount > 0 && checkedCount < totalCount

  // 如果所有子权限都选中了，也选中父权限值
  if (perm.checked) {
    if (!formData.permissions.includes(perm.value)) {
      formData.permissions.push(perm.value)
    }
  } else if (checkedCount === 0) {
    // 如果没有子权限被选中，移除父权限
    const index = formData.permissions.indexOf(perm.value)
    if (index > -1) {
      formData.permissions.splice(index, 1)
    }
  }

  // 更新模块的选中状态
  updateModuleCheckState(mod)
}

// 更新模块的选中状态
const updateModuleCheckState = (mod) => {
  const allPermValues = getAllPermissionValues(mod.permissions)
  const checkedCount = allPermValues.filter(v => formData.permissions.includes(v)).length
  const totalCount = allPermValues.length

  mod.checkAll = checkedCount === totalCount
  mod.isIndeterminate = checkedCount > 0 && checkedCount < totalCount
}

// 获取模块中所有权限的值（包括子权限）
const getAllPermissionValues = (permissions) => {
  const values = []
  permissions.forEach(perm => {
    values.push(perm.value)
    if (perm.children) {
      values.push(...perm.children.map(child => child.value))
    }
  })
  return values
}

const handleCheckAllChange = (val, mod) => {
  const allPermValues = getAllPermissionValues(mod.permissions)
  const currentChecked = formData.permissions

  if (val) {
    const toAdd = allPermValues.filter(p => !currentChecked.includes(p))
    formData.permissions = [...currentChecked, ...toAdd]
    mod.isIndeterminate = false

    // 更新所有父权限的选中状态
    mod.permissions.forEach(perm => {
      if (perm.children) {
        perm.checked = true
        perm.isIndeterminate = false
      }
    })
  } else {
    formData.permissions = currentChecked.filter(p => !allPermValues.includes(p))
    mod.isIndeterminate = false

    // 更新所有父权限的选中状态
    mod.permissions.forEach(perm => {
      if (perm.children) {
        perm.checked = false
        perm.isIndeterminate = false
      }
    })
  }
}

const handleCheckedPermsChange = (value, mod) => {
  // 检查所有权限（包括子权限）的选中状态
  const allPermValues = getAllPermissionValues(mod.permissions)
  const checkedCount = allPermValues.filter(v => value.includes(v)).length
  const totalCount = allPermValues.length

  mod.checkAll = checkedCount === totalCount
  mod.isIndeterminate = checkedCount > 0 && checkedCount < totalCount

  // 更新父权限的状态
  mod.permissions.forEach(perm => {
    if (perm.children) {
      const childValues = perm.children.map(child => child.value)
      const childCheckedCount = childValues.filter(v => value.includes(v)).length
      const childTotalCount = childValues.length

      perm.checked = childCheckedCount === childTotalCount
      perm.isIndeterminate = childCheckedCount > 0 && childCheckedCount < childTotalCount
    }
  })
}

const checkAllPermissions = (checkAll) => {
  if (checkAll) {
    const allPerms = []
    moduleStates.value.forEach(mod => {
      const allModPermValues = getAllPermissionValues(mod.permissions)
      allPerms.push(...allModPermValues)
      mod.checkAll = true
      mod.isIndeterminate = false

      // 更新所有父权限的选中状态
      mod.permissions.forEach(perm => {
        if (perm.children) {
          perm.checked = true
          perm.isIndeterminate = false
        }
      })
    })
    formData.permissions = allPerms
  } else {
    formData.permissions = []
    resetCheckboxState()
  }
}

const initCheckboxState = () => {
  moduleStates.value.forEach(mod => {
    const allModPermValues = getAllPermissionValues(mod.permissions)
    const checkedCount = allModPermValues.filter(p => formData.permissions.includes(p)).length
    const totalCount = allModPermValues.length

    mod.checkAll = checkedCount === totalCount && totalCount > 0
    mod.isIndeterminate = checkedCount > 0 && checkedCount < totalCount

    // 初始化父权限的选中状态
    mod.permissions.forEach(perm => {
      if (perm.children) {
        const childValues = perm.children.map(child => child.value)
        const childCheckedCount = childValues.filter(p => formData.permissions.includes(p)).length
        const childTotalCount = childValues.length

        perm.checked = childCheckedCount === childTotalCount
        perm.isIndeterminate = childCheckedCount > 0 && childCheckedCount < childTotalCount
      }
    })
  })
}

const resetCheckboxState = () => {
  moduleStates.value.forEach(mod => {
    mod.checkAll = false
    mod.isIndeterminate = false

    // 重置父权限的选中状态
    mod.permissions.forEach(perm => {
      if (perm.children) {
        perm.checked = false
        perm.isIndeterminate = false
      }
    })
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      setTimeout(() => {
        console.log('提交数据:', JSON.stringify(formData))
        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
        loading.value = false
        visible.value = false
        emit('refresh')
      }, 600)
    }
  })
}

defineExpose({ openDrawer })
</script>

<style scoped lang="scss">
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.permission-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.batch-operations {
  display: flex;
  gap: 5px;
}

.permission-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #fbfbfb;
}

.permission-group {
  margin-bottom: 15px;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .group-header {
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 8px;

    .group-label {
      font-weight: 600;
      font-size: 14px;
    }
  }

  .group-items {
    padding-left: 24px;

    .perm-item {
      margin-right: 20px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      .permission-desc {
        color: #909399;
        font-size: 12px;
        margin-left: 8px;
        flex: 1;
        min-width: 0;
      }
    }

    .permission-subgroup {
      margin-bottom: 12px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fafafa;

      .subgroup-header {
        padding: 8px 12px;
        background-color: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;

        &:hover {
          background-color: #ecf5ff;
        }

        .collapse-icon {
          margin-right: 8px;
          font-size: 12px;
          color: #909399;
          transition: transform 0.2s ease;

          &.collapsed {
            transform: rotate(0deg);
          }

          &:not(.collapsed) {
            transform: rotate(90deg);
          }
        }

        .subgroup-label {
          font-weight: 600;
          font-size: 13px;
          color: #409eff;
        }

        .permission-desc {
          color: #909399;
          font-size: 12px;
          margin-left: 8px;
        }

        :deep(.el-checkbox__label) {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
        }
      }

      .subgroup-items {
        padding: 8px 12px;
        padding-left: 24px;

        .child-perm {
          margin-bottom: 4px;

          .permission-desc {
            color: #909399;
            font-size: 11px;
            margin-left: 6px;
          }
        }
      }
    }
  }
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>