<template>
  <el-dialog
    v-model="visible"
    :title="teacherData?.id ? `编辑老师 - ${teacherData?.name}` : '新建老师'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
      :rules="rules"
    >
      <el-form-item label="老师姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入老师姓名" />
      </el-form-item>
      <el-form-item label="工号" prop="teacherId">
        <el-input v-model="formData.teacherId" placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="负责班级数" prop="classCount">
        <el-input-number v-model="formData.classCount" :min="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  teacherData: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)

const formData = ref({
  name: '',
  teacherId: '',
  phone: '',
  email: '',
  classCount: 0
})

const rules = {
  name: [{ required: true, message: '请输入老师姓名', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

watch(
  () => props.teacherData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        name: newVal.name || '',
        teacherId: newVal.teacherId || '',
        phone: newVal.phone || '',
        email: newVal.email || '',
        classCount: newVal.classCount || 0
      }
    } else {
      formData.value = {
        name: '',
        teacherId: '',
        phone: '',
        email: '',
        classCount: 0
      }
    }
  },
  { immediate: true }
)

const handleClose = () => {
  visible.value = false
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    emit('save', formData.value)
    handleClose()
  } catch (error) {
    ElMessage.error('请填写完整的表单信息')
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
