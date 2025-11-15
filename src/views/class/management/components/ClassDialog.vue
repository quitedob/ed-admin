<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑班级' : '新建班级'"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="班级名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入班级名称" />
      </el-form-item>

      <el-form-item label="班级描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入班级描述"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年级" prop="grade">
            <el-select v-model="form.grade" placeholder="请选择年级">
              <el-option label="大一" value="freshman" />
              <el-option label="大二" value="sophomore" />
              <el-option label="大三" value="junior" />
              <el-option label="大四" value="senior" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="专业" prop="major">
            <el-select v-model="form.major" placeholder="请选择专业">
              <el-option label="前端开发" value="frontend" />
              <el-option label="后端开发" value="backend" />
              <el-option label="数据科学" value="data-science" />
              <el-option label="云计算" value="cloud" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年份" prop="year">
            <el-date-picker
              v-model="form.year"
              type="year"
              placeholder="选择年份"
              style="width: 100%"
              value-format="YYYY"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学期" prop="semester">
            <el-select v-model="form.semester" placeholder="请选择学期">
              <el-option label="春季" value="spring" />
              <el-option label="秋季" value="fall" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="班主任" prop="headTeacherId">
        <el-select v-model="form.headTeacherId" placeholder="请选择班主任" filterable>
          <el-option label="王老师" value="teacher_001" />
          <el-option label="李老师" value="teacher_002" />
          <el-option label="张老师" value="teacher_003" />
          <el-option label="赵老师" value="teacher_004" />
        </el-select>
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  classData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.classData)

const formRef = ref()
const form = ref({
  name: '',
  description: '',
  grade: '',
  major: '',
  year: new Date().getFullYear().toString(),
  semester: 'fall',
  headTeacherId: '',
  headTeacherName: ''
})

const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
  major: [{ required: true, message: '请选择专业', trigger: 'change' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  headTeacherId: [{ required: true, message: '请选择班主任', trigger: 'change' }]
}

// 监听班主任选择，更新班主任姓名
watch(() => form.value.headTeacherId, (newVal) => {
  const teacherMap = {
    teacher_001: '王老师',
    teacher_002: '李老师',
    teacher_003: '张老师',
    teacher_004: '赵老师'
  }
  form.value.headTeacherName = teacherMap[newVal] || ''
})

// 监听外部数据变化
watch(() => props.classData, (newData) => {
  if (newData) {
    form.value = {
      name: newData.name || '',
      description: newData.description || '',
      grade: newData.grade || '',
      major: newData.major || '',
      year: newData.year?.toString() || new Date().getFullYear().toString(),
      semester: newData.semester || 'fall',
      headTeacherId: newData.headTeacherId || '',
      headTeacherName: newData.headTeacherName || ''
    }
  } else {
    form.value = {
      name: '',
      description: '',
      grade: '',
      major: '',
      year: new Date().getFullYear().toString(),
      semester: 'fall',
      headTeacherId: '',
      headTeacherName: ''
    }
  }
}, { immediate: true })

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', {
        ...form.value,
        year: parseInt(form.value.year)
      })
    }
  })
}

const handleClose = () => {
  visible.value = false
}
</script>
