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

      <el-form-item label="班级" prop="classIds">
        <el-select
          v-model="formData.classIds"
          placeholder="请选择班级"
          multiple
          style="width: 100%"
        >
          <el-option
            v-for="cls in classOptions"
            :key="cls.id"
            :label="cls.name"
            :value="cls.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">在读</el-radio>
          <el-radio label="inactive">休学</el-radio>
          <el-radio label="graduated">已毕业</el-radio>
        </el-radio-group>
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
  classIds: [],
  status: 'active'
})

// 班级选项
const classOptions = ref([
  { id: 'class_001', name: '前端开发一班' },
  { id: 'class_002', name: '前端开发二班' },
  { id: 'class_003', name: '数据科学班' }
])

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
  classIds: [
    { required: true, message: '请选择至少一个班级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const isEdit = computed(() => !!props.studentData)
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 初始化表单数据
const initFormData = () => {
  if (props.studentData) {
    formData.value = {
      studentId: props.studentData.studentId || '',
      name: props.studentData.name || '',
      phone: props.studentData.phone || '',
      email: props.studentData.email || '',
      classIds: props.studentData.classes ? props.studentData.classes.map(c => c.id) : [],
      status: props.studentData.status || 'active'
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
    classIds: [],
    status: 'active'
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
      classes: formData.value.classIds.map(id => {
        const cls = classOptions.value.find(c => c.id === id)
        return {
          id,
          name: cls ? cls.name : '',
          joinTime: new Date().toISOString()
        }
      }),
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
watch(() => props.studentData, () => {
  initFormData()
}, { immediate: true })

initFormData()
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>