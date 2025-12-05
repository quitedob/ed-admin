<template>
  <el-drawer
    v-model="visible"
    :title="`老师详情 - ${teacherData?.name}`"
    size="60%"
    @close="handleClose"
  >
    <div class="teacher-detail-container">
      <!-- 上半部分：个人信息（只读） -->
      <div class="info-section">
        <h4>个人信息</h4>
        <el-form :model="formData" label-width="100px" class="teacher-form">
          <el-form-item label="老师姓名">
            <span>{{ formData.name }}</span>
          </el-form-item>
          <el-form-item label="工号">
            <span>{{ formData.teacherId }}</span>
          </el-form-item>
          <el-form-item label="手机号">
            <span>{{ formData.phone }}</span>
          </el-form-item>
          <el-form-item label="邮箱">
            <span>{{ formData.email }}</span>
          </el-form-item>
          <el-form-item label="账号状态">
            <el-tag :type="getStatusTagType(formData.status)">
              {{ getStatusLabel(formData.status) }}
            </el-tag>
          </el-form-item>
        </el-form>
      </div>

      <!-- 下半部分：负责班级和课程 -->
      <div class="responsibility-section">
        <el-row :gutter="20">
          <!-- 负责班级列表 -->
          <el-col :span="12">
            <div class="list-panel">
              <h4>负责班级（{{ formData.authorizedClasses?.length || 0 }}个）</h4>
              <div class="list-content">
                <div
                  v-for="cls in formData.authorizedClasses"
                  :key="cls.id"
                  class="list-item"
                >
                  <div class="item-header">
                    <span class="item-name">{{ cls.name }}</span>
                    <el-tag :type="getRoleTagType(cls.role)" size="small">
                      {{ getRoleLabel(cls.role) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <el-empty v-if="!formData.authorizedClasses || formData.authorizedClasses.length === 0" description="暂无负责班级" />
            </div>
          </el-col>

          <!-- 负责课程列表 -->
          <el-col :span="12">
            <div class="list-panel">
              <h4>负责课程（{{ formData.authorizedCourses?.length || 0 }}门）</h4>
              <div class="list-content">
                <div
                  v-for="course in formData.authorizedCourses"
                  :key="course.id"
                  class="list-item"
                >
                  <span class="item-name">{{ course.name }}</span>
                </div>
              </div>
              <el-empty v-if="!formData.authorizedCourses || formData.authorizedCourses.length === 0" description="暂无负责课程" />
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <template #footer>
      <div style="flex: auto;">
        <el-button 
          :type="formData.status === 'active' ? 'warning' : 'success'"
          @click="handleToggleStatus"
        >
          {{ formData.status === 'active' ? '停用老师' : '激活老师' }}
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean,
  teacherData: Object
})

const emit = defineEmits(['update:modelValue', 'toggle-status'])

const router = useRouter()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const formData = ref({
  name: '',
  teacherId: '',
  phone: '',
  email: '',
  status: 'active',
  authorizedClasses: [],
  authorizedCourses: []
})

// 监听 teacherData 变化
watch(
  () => props.teacherData,
  (newVal) => {
    if (newVal) {
      formData.value = { ...newVal }
    } else {
      formData.value = {
        name: '',
        teacherId: '',
        phone: '',
        email: '',
        status: 'active',
        authorizedClasses: [],
        authorizedCourses: []
      }
    }
  },
  { immediate: true }
)

// 方法
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

const getRoleLabel = (role) => {
  const map = {
    headTeacher: '班主任',
    teacher: '授课老师'
  }
  return map[role] || role
}

const getRoleTagType = (role) => {
  const map = {
    headTeacher: 'warning',
    teacher: 'info'
  }
  return map[role] || ''
}

const handleClose = () => {
  visible.value = false
}

const handleToggleStatus = () => {
  const newStatus = formData.value.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '激活' : '停用'
  
  ElMessageBox.confirm(
    `确定要${action}老师"${formData.value.name}"吗？`,
    '确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emit('toggle-status', { ...formData.value, status: newStatus })
    handleClose()
  })
}
</script>

<style lang="scss" scoped>
.teacher-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  overflow-y: auto;
}

.info-section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;

  h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  .teacher-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}

.responsibility-section {
  flex: 1;
  padding: 0 20px;

  h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.list-panel {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f2f5;
    border-color: #409eff;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-name {
    color: #303133;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
