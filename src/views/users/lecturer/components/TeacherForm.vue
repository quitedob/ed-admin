<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑老师' : '新建老师'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工号" prop="teacherId">
            <el-input
              v-model="formData.teacherId"
              placeholder="请输入工号"
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

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              placeholder="选择出生日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入职日期" prop="joinDate">
            <el-date-picker
              v-model="formData.joinDate"
              type="date"
              placeholder="选择入职日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="active">活跃</el-radio>
              <el-radio label="inactive">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学历" prop="education">
            <el-select v-model="formData.education" placeholder="请选择学历" style="width: 100%">
              <el-option label="本科" value="bachelor" />
              <el-option label="硕士" value="master" />
              <el-option label="博士" value="doctor" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入职称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所在部门" prop="department">
            <el-input v-model="formData.department" placeholder="请输入所在部门" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="专业领域" prop="specialty">
            <el-input v-model="formData.specialty" placeholder="请输入专业领域" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="formData.bio"
          type="textarea"
          :rows="4"
          placeholder="请输入个人简介"
        />
      </el-form-item>

      <el-form-item label="教学经验">
        <el-input
          v-model="formData.experience"
          type="textarea"
          :rows="3"
          placeholder="请输入教学经验"
        />
      </el-form-item>

      <el-form-item label="获得荣誉">
        <el-input
          v-model="formData.honors"
          type="textarea"
          :rows="3"
          placeholder="请输入获得荣誉"
        />
      </el-form-item>

      <el-form-item label="负责班级" prop="authorizedClasses">
        <el-select
          v-model="formData.authorizedClassIds"
          placeholder="请选择负责班级"
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
  teacherData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref()
const saving = ref(false)

const formData = ref({
  teacherId: '',
  name: '',
  phone: '',
  email: '',
  gender: 'male',
  birthDate: '',
  joinDate: '',
  status: 'active',
  education: '',
  title: '',
  department: '',
  specialty: '',
  address: '',
  bio: '',
  experience: '',
  honors: '',
  authorizedClassIds: []
})

// 班级选项
const classOptions = ref([
  { id: 'cls_001', name: '一年级一班' },
  { id: 'cls_002', name: '一年级二班' },
  { id: 'cls_003', name: '二年级一班' },
  { id: 'cls_004', name: '二年级二班' },
  { id: 'cls_005', name: '三年级一班' },
  { id: 'cls_006', name: '三年级二班' },
  { id: 'cls_007', name: '四年级一班' },
  { id: 'cls_008', name: '四年级二班' },
  { id: 'cls_009', name: '五年级一班' },
  { id: 'cls_010', name: '五年级二班' },
  { id: 'cls_011', name: '六年级一班' },
  { id: 'cls_012', name: '六年级二班' }
])

// 表单验证规则
const rules = {
  teacherId: [
    { required: true, message: '请输入工号', trigger: 'blur' }
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
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
}

// 计算属性
const isEdit = computed(() => !!props.teacherData)
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 初始化表单数据
const initFormData = () => {
  if (props.teacherData) {
    formData.value = {
      teacherId: props.teacherData.teacherId || '',
      name: props.teacherData.name || '',
      phone: props.teacherData.phone || '',
      email: props.teacherData.email || '',
      gender: props.teacherData.gender || 'male',
      birthDate: props.teacherData.birthDate || '',
      joinDate: props.teacherData.joinDate || '',
      status: props.teacherData.status || 'active',
      education: props.teacherData.education || '',
      title: props.teacherData.title || '',
      department: props.teacherData.department || '',
      specialty: props.teacherData.specialty || '',
      address: props.teacherData.address || '',
      bio: props.teacherData.bio || '',
      experience: props.teacherData.experience || '',
      honors: props.teacherData.honors || '',
      authorizedClassIds: props.teacherData.authorizedClasses ?
        props.teacherData.authorizedClasses.map(c => c.id) : []
    }
  } else {
    resetForm()
  }
}

// 方法
const resetForm = () => {
  formData.value = {
    teacherId: '',
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    birthDate: '',
    joinDate: '',
    status: 'active',
    education: '',
    title: '',
    department: '',
    specialty: '',
    address: '',
    bio: '',
    experience: '',
    honors: '',
    authorizedClassIds: []
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
      teacherId: formData.value.teacherId,
      name: formData.value.name,
      phone: formData.value.phone,
      email: formData.value.email,
      gender: formData.value.gender,
      birthDate: formData.value.birthDate,
      joinDate: formData.value.joinDate,
      status: formData.value.status,
      education: formData.value.education,
      title: formData.value.title,
      department: formData.value.department,
      specialty: formData.value.specialty,
      address: formData.value.address,
      bio: formData.value.bio,
      experience: formData.value.experience,
      honors: formData.value.honors,
      authorizedClasses: formData.value.authorizedClassIds.map(id => {
        const cls = classOptions.value.find(c => c.id === id)
        return {
          id,
          name: cls ? cls.name : ''
        }
      }),
      classCount: formData.value.authorizedClassIds.length
    }

    emit('save', saveData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    saving.value = false
  }
}

// 监听props变化来初始化表单
watch(() => props.teacherData, () => {
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