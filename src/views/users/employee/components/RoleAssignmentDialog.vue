<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="500px"
    @close="handleClose"
  >
    <div v-if="employee" class="role-assignment">
      <p class="employee-info">员工：<strong>{{ employee.name }}</strong></p>

      <el-form label-width="100px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="selectedRoles">
            <div v-for="role in roles" :key="role.id" class="role-item">
              <el-checkbox :label="role.id">
                <span class="role-name">{{ role.name }}</span>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div class="role-description">
        <h4>角色说明</h4>
        <div v-if="selectedRoles.length > 0" class="description-list">
          <div v-for="roleId in selectedRoles" :key="roleId" class="description-item">
            <strong>{{ getRoleName(roleId) }}</strong>
            <p>{{ getRoleDescription(roleId) }}</p>
          </div>
        </div>
        <p v-else style="color: #909399">请选择角色查看说明</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  employee: Object,
  roles: Array
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedRoles = ref([])

const getRoleName = (roleId) => {
  const role = props.roles?.find(r => r.id === roleId)
  return role?.name || roleId
}

const getRoleDescription = (roleId) => {
  const descriptions = {
    role_001: '班主任：负责班级日常管理，可创建和管理作业、考试',
    role_002: '教务：负责教务工作，可管理课程和班级',
    role_003: '前台：前台工作人员，仅可查看基本信息',
    role_004: '教研：教研人员，拥有最高权限'
  }
  return descriptions[roleId] || '暂无说明'
}

const handleConfirm = () => {
  emit('save', {
    roleIds: selectedRoles.value
  })
  handleClose()
}

const handleClose = () => {
  visible.value = false
}

watch(() => props.employee, (val) => {
  if (val) {
    selectedRoles.value = [...(val.roleIds || [])]
  }
}, { immediate: true })
</script>

<style scoped>
.role-assignment {
  padding: 20px 0;
}

.employee-info {
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--color-text-regular);
}

.role-item {
  margin-bottom: 12px;
}

.role-name {
  margin-left: 8px;
}

.role-description {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}

.role-description h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.description-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description-item {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.description-item strong {
  display: block;
  margin-bottom: 4px;
  color: var(--color-primary);
}

.description-item p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
