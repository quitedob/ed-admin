<template>
  <el-dialog
    v-model="visible"
    title="自定义权限配置"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    class="permission-selector-dialog"
  >
    <div class="permission-selector">
      <!-- 顶部操作栏 -->
      <div class="selector-header">
        <div class="quick-actions">
          <span class="label">快捷操作：</span>
          <el-button size="small" @click="selectAll">全选</el-button>
          <el-button size="small" @click="clearAll">清空</el-button>
          <el-divider direction="vertical" />
          <el-button size="small" type="primary" @click="applyTemplate('admin')">管理员模板</el-button>
          <el-button size="small" type="success" @click="applyTemplate('headTeacher')">班主任模板</el-button>
          <el-button size="small" type="warning" @click="applyTemplate('teacher')">老师模板</el-button>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索权限..."
            size="small"
            clearable
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 权限选择区域 -->
      <div class="permission-content">
        <el-scrollbar height="400px">
          <div v-for="module in filteredModules" :key="module.code" class="permission-module">
            <!-- 模块头部 -->
            <div class="module-header">
              <el-checkbox
                v-model="module.checkAll"
                :indeterminate="module.isIndeterminate"
                @change="(val) => handleModuleCheckAll(val, module)"
              >
                <span class="module-name">{{ module.label }}</span>
                <span class="module-count">({{ getModuleCheckedCount(module) }}/{{ getModuleTotalCount(module) }})</span>
              </el-checkbox>
            </div>

            <!-- 权限列表 -->
            <div class="module-permissions">
              <template v-for="perm in module.permissions" :key="perm.value">
                <!-- 有子权限的权限组 -->
                <div v-if="perm.children && perm.children.length > 0" class="permission-group">
                  <div class="group-header" @click="toggleGroup(perm)">
                    <el-icon class="collapse-icon" :class="{ expanded: perm.expanded }">
                      <ArrowRight />
                    </el-icon>
                    <el-checkbox
                      v-model="perm.checked"
                      :indeterminate="perm.isIndeterminate"
                      @change="(val) => handleGroupCheckAll(val, perm, module)"
                      @click.stop
                    >
                      <span class="perm-label">{{ perm.label }}</span>
                    </el-checkbox>
                    <span class="perm-desc">{{ perm.description }}</span>
                  </div>
                  <div v-show="perm.expanded" class="group-children">
                    <el-checkbox
                      v-for="child in perm.children"
                      :key="child.value"
                      v-model="child.checked"
                      @change="() => handleChildChange(perm, module)"
                      class="child-perm"
                    >
                      <span class="perm-label">{{ child.label }}</span>
                      <span class="perm-desc">{{ child.description }}</span>
                    </el-checkbox>
                  </div>
                </div>

                <!-- 普通权限 -->
                <el-checkbox
                  v-else
                  v-model="perm.checked"
                  @change="() => updateModuleState(module)"
                  class="single-perm"
                >
                  <span class="perm-label">{{ perm.label }}</span>
                  <span class="perm-desc">{{ perm.description }}</span>
                </el-checkbox>
              </template>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 底部预览 -->
      <div class="selector-footer">
        <div class="preview-section">
          <div class="preview-title">
            <el-icon><View /></el-icon>
            <span>将显示的菜单：</span>
          </div>
          <div class="preview-menus">
            <el-tag
              v-for="menu in visibleMenus"
              :key="menu"
              size="small"
              type="info"
              style="margin-right: 8px; margin-bottom: 4px;"
            >
              {{ menu }}
            </el-tag>
            <span v-if="visibleMenus.length === 0" class="no-menu">暂无可见菜单</span>
          </div>
        </div>
        <div class="selected-count">
          已选择 <strong>{{ selectedCount }}</strong> 个权限
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          <el-icon><Check /></el-icon>
          确认并登录
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, ArrowRight, View, Check } from '@element-plus/icons-vue'
import { PERMISSION_MODULES } from '@/utils/permissionList'
import { adminPermissions, headTeacherPermissions, teacherPermissions } from '@/config/roleMenuConfig'
import { PERMISSION_PREFIX_LABELS } from '@/config/permissionMenuMapping'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchKeyword = ref('')

// 深拷贝权限模块并添加状态
const moduleStates = ref(initModuleStates())

function initModuleStates() {
  return PERMISSION_MODULES.map(mod => ({
    ...mod,
    checkAll: false,
    isIndeterminate: false,
    permissions: mod.permissions.map(perm => {
      const newPerm = {
        ...perm,
        checked: false,
        expanded: false
      }
      if (perm.children) {
        newPerm.children = perm.children.map(child => ({
          ...child,
          checked: false
        }))
        newPerm.isIndeterminate = false
      }
      return newPerm
    })
  }))
}

// 过滤后的模块（搜索）
const filteredModules = computed(() => {
  if (!searchKeyword.value) return moduleStates.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return moduleStates.value.map(mod => {
    const filteredPerms = mod.permissions.filter(perm => {
      const matchSelf = perm.label.toLowerCase().includes(keyword) ||
                        perm.value.toLowerCase().includes(keyword)
      const matchChildren = perm.children?.some(child =>
        child.label.toLowerCase().includes(keyword) ||
        child.value.toLowerCase().includes(keyword)
      )
      return matchSelf || matchChildren
    })
    return { ...mod, permissions: filteredPerms }
  }).filter(mod => mod.permissions.length > 0)
})

// 获取所有选中的权限
const selectedPermissions = computed(() => {
  const perms = []
  moduleStates.value.forEach(mod => {
    mod.permissions.forEach(perm => {
      if (perm.children) {
        perm.children.forEach(child => {
          if (child.checked) perms.push(child.value)
        })
        // 如果父权限被选中，也加入
        if (perm.checked) perms.push(perm.value)
      } else {
        if (perm.checked) perms.push(perm.value)
      }
    })
  })
  return perms
})

// 选中数量
const selectedCount = computed(() => selectedPermissions.value.length)

// 预览可见菜单
const visibleMenus = computed(() => {
  const perms = selectedPermissions.value
  if (perms.length === 0) return []
  
  // 获取权限前缀
  const prefixes = new Set()
  perms.forEach(p => {
    const prefix = p.split(':')[0]
    if (prefix) prefixes.add(prefix)
  })
  
  // 转换为菜单名称
  const menus = []
  prefixes.forEach(prefix => {
    const label = PERMISSION_PREFIX_LABELS[prefix]
    if (label) menus.push(label)
  })
  return menus
})

// 获取模块选中数量
function getModuleCheckedCount(module) {
  let count = 0
  module.permissions.forEach(perm => {
    if (perm.children) {
      count += perm.children.filter(c => c.checked).length
    } else if (perm.checked) {
      count++
    }
  })
  return count
}

// 获取模块总数量
function getModuleTotalCount(module) {
  let count = 0
  module.permissions.forEach(perm => {
    if (perm.children) {
      count += perm.children.length
    } else {
      count++
    }
  })
  return count
}

// 更新模块状态
function updateModuleState(module) {
  const checked = getModuleCheckedCount(module)
  const total = getModuleTotalCount(module)
  module.checkAll = checked === total && total > 0
  module.isIndeterminate = checked > 0 && checked < total
}

// 模块全选
function handleModuleCheckAll(val, module) {
  module.permissions.forEach(perm => {
    if (perm.children) {
      perm.checked = val
      perm.isIndeterminate = false
      perm.children.forEach(child => {
        child.checked = val
      })
    } else {
      perm.checked = val
    }
  })
  module.isIndeterminate = false
}

// 权限组全选
function handleGroupCheckAll(val, perm, module) {
  perm.children.forEach(child => {
    child.checked = val
  })
  perm.isIndeterminate = false
  updateModuleState(module)
}

// 子权限变化
function handleChildChange(perm, module) {
  const checkedCount = perm.children.filter(c => c.checked).length
  const total = perm.children.length
  perm.checked = checkedCount === total
  perm.isIndeterminate = checkedCount > 0 && checkedCount < total
  updateModuleState(module)
}

// 展开/折叠权限组
function toggleGroup(perm) {
  perm.expanded = !perm.expanded
}

// 全选
function selectAll() {
  moduleStates.value.forEach(mod => {
    handleModuleCheckAll(true, mod)
    mod.checkAll = true
  })
}

// 清空
function clearAll() {
  moduleStates.value.forEach(mod => {
    handleModuleCheckAll(false, mod)
    mod.checkAll = false
  })
}

// 应用模板
function applyTemplate(role) {
  let templatePerms = []
  switch (role) {
    case 'admin':
      templatePerms = ['*'] // 管理员全权限
      break
    case 'headTeacher':
      templatePerms = headTeacherPermissions
      break
    case 'teacher':
      templatePerms = teacherPermissions
      break
  }
  
  // 如果是超级管理员，全选
  if (templatePerms.includes('*')) {
    selectAll()
    return
  }
  
  // 清空后应用模板
  clearAll()
  
  // 设置选中状态
  moduleStates.value.forEach(mod => {
    mod.permissions.forEach(perm => {
      if (perm.children) {
        perm.children.forEach(child => {
          child.checked = templatePerms.includes(child.value)
        })
        // 更新父权限状态
        const checkedCount = perm.children.filter(c => c.checked).length
        const total = perm.children.length
        perm.checked = checkedCount === total
        perm.isIndeterminate = checkedCount > 0 && checkedCount < total
      } else {
        perm.checked = templatePerms.includes(perm.value)
      }
    })
    updateModuleState(mod)
  })
}

// 取消
function handleCancel() {
  visible.value = false
}

// 确认
function handleConfirm() {
  if (selectedPermissions.value.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }
  emit('confirm', selectedPermissions.value)
  visible.value = false
}

// 重置状态
watch(visible, (val) => {
  if (val) {
    moduleStates.value = initModuleStates()
  }
})
</script>

<style lang="scss" scoped>
.permission-selector-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.permission-selector {
  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;

    .quick-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .permission-content {
    padding: 16px 20px;
  }

  .permission-module {
    margin-bottom: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;

    .module-header {
      padding: 12px 16px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;

      .module-name {
        font-weight: 600;
        font-size: 14px;
        color: #303133;
      }

      .module-count {
        color: #909399;
        font-size: 12px;
        margin-left: 8px;
      }
    }

    .module-permissions {
      padding: 12px 16px;

      .single-perm {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;
        width: 100%;

        .perm-label {
          font-size: 13px;
          color: #303133;
        }

        .perm-desc {
          color: #909399;
          font-size: 12px;
          margin-left: 8px;
        }
      }

      .permission-group {
        margin-bottom: 12px;
        border: 1px solid #ebeef5;
        border-radius: 6px;
        background: #fafafa;

        .group-header {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          cursor: pointer;
          user-select: none;

          &:hover {
            background: #f0f2f5;
          }

          .collapse-icon {
            margin-right: 8px;
            transition: transform 0.2s;
            color: #909399;

            &.expanded {
              transform: rotate(90deg);
            }
          }

          .perm-label {
            font-weight: 500;
            font-size: 13px;
            color: #409eff;
          }

          .perm-desc {
            color: #909399;
            font-size: 12px;
            margin-left: 8px;
          }
        }

        .group-children {
          padding: 8px 12px 8px 36px;
          border-top: 1px solid #ebeef5;
          background: #fff;

          .child-perm {
            display: flex;
            align-items: flex-start;
            margin-bottom: 6px;

            .perm-label {
              font-size: 12px;
              color: #606266;
            }

            .perm-desc {
              color: #909399;
              font-size: 11px;
              margin-left: 6px;
            }
          }
        }
      }
    }
  }

  .selector-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
    background: #fafafa;

    .preview-section {
      flex: 1;

      .preview-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;
        margin-bottom: 8px;
      }

      .preview-menus {
        .no-menu {
          color: #c0c4cc;
          font-size: 12px;
        }
      }
    }

    .selected-count {
      font-size: 14px;
      color: #606266;

      strong {
        color: #409eff;
        font-size: 18px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
