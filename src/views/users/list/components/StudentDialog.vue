<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑学生' : '新建学生'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学号" prop="studentId">
            <el-input
              v-model="formData.studentId"
              placeholder="请输入学号"
              :disabled="isEdit"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="学生状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择学生状态" style="width: 100%">
          <el-option label="新生" value="new">
            <span style="color: #606266">新生</span>
          </el-option>
          <el-option label="在读" value="studying">
            <span style="color: #67c23a; font-weight: 500">在读</span>
          </el-option>
          <el-option label="停课" value="suspended">
            <span style="color: #e6a23c; font-weight: 500">停课</span>
          </el-option>
          <el-option label="封存" value="archived">
            <span style="color: #909399">封存</span>
          </el-option>
          <el-option label="结课" value="finished">
            <span style="color: #e6a23c; font-weight: 500">结课</span>
          </el-option>
          <el-option label="退费" value="refunded">
            <span style="color: #f56c6c; font-weight: 500">退费</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  studentData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref()
const saving = ref(false)

const formData = ref({
  studentId: '',
  name: '',
  phone: '',
  email: '',
  status: 'new'
})

// 表单验证规则
const rules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const isEdit = computed(() => !!props.studentData && typeof props.studentData === 'object')
const dialogVisible = computed({
  get: () => props.modelValue || false,
  set: (value) => emit('update:modelValue', value)
})

// 初始化表单数据
const initFormData = () => {
  const student = props.studentData
  if (student && typeof student === 'object') {
    formData.value = {
      studentId: student.studentId || '',
      name: student.name || '',
      phone: student.phone || '',
      email: student.email || '',
      status: student.status || 'new'
    }
  } else {
    resetForm()
  }
}

// 方法
const resetForm = () => {
  formData.value = {
    studentId: '',
    name: '',
    phone: '',
    email: '',
    status: 'new'
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  try {
    await formRef.value.validate()

    saving.value = true

    // 构建保存数据
    const saveData = {
      studentId: formData.value.studentId,
      name: formData.value.name,
      phone: formData.value.phone,
      email: formData.value.email,
      status: formData.value.status
    }

    emit('save', saveData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    saving.value = false
  }
}

// 监听props变化来初始化表单
watch(() => props.studentData, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    initFormData()
  }
}, { immediate: true, deep: false })

// 初始化表单
initFormData()
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>