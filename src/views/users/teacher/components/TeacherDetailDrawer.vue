<template>
  <el-drawer
    v-model="visible"
    :title="teacherData?.id ? `编辑老师 - ${teacherData?.name}` : '新建老师'"
    size="60%"
    @close="handleClose"
  >
    <div class="teacher-detail-container">
      <!-- 上半部分：个人信息（可编辑） -->
      <div class="info-section">
        <h4>个人信息</h4>
        <el-form :model="formData" label-width="100px" class="teacher-form">
          <el-form-item label="老师姓名">
            <el-input v-model="formData.name" placeholder="请输入老师姓名" />
          </el-form-item>
          <el-form-item label="工号">
            <el-input v-model="formData.teacherId" placeholder="请输入工号" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="formData.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="账号状态">
            <el-select v-model="formData.status" placeholder="请选择状态">
              <el-option label="活跃" value="active" />
              <el-option label="停用" value="inactive" />
            </el-select>
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
                  @click="navigateToClass(cls)"
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
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean,
  teacherData: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

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

const navigateToClass = (cls) => {
  ElMessage.info(`跳转到班级管理：${cls.name}`)
  // router.push(`/class/management/${cls.id}`)
}

const handleClose = () => {
  visible.value = false
}

const handleSave = () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入老师姓名')
    return
  }
  if (!formData.value.teacherId) {
    ElMessage.warning('请输入工号')
    return
  }
  if (!formData.value.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  emit('save', formData.value)
  handleClose()
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
