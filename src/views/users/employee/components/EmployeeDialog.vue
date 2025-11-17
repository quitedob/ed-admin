<template>
  <el-dialog
    v-model="visible"
    :title="employee ? '编辑员工' : '新增员工'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入员工姓名" />
      </el-form-item>

      <el-form-item label="账号" prop="account">
        <el-input
          v-model="formData.account"
          placeholder="请输入账号"
          :disabled="!!employee"
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!employee">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword" v-if="!employee">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

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

const formRef = ref(null)
const formData = ref({
  name: '',
  account: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (rule, value, callback) => {
  if (!props.employee && !value) {
    callback(new Error('请输入密码'))
  } else if (value && formData.value.password !== value) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: !props.employee, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validatePassword, trigger: 'blur' }]
}

const handleSubmit = async () => {
  await formRef.value.validate()
  emit('save', {
    name: formData.value.name,
    account: formData.value.account,
    phone: formData.value.phone
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

watch(() => props.employee, (val) => {
  if (val) {
    formData.value = {
      name: val.name,
      account: val.account,
      phone: val.phone,
      password: '',
      confirmPassword: ''
    }
  } else {
    formData.value = {
      name: '',
      account: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  }
}, { immediate: true })
</script>

<style scoped>
</style>
