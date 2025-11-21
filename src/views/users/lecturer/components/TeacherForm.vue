<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑老师' : '新建老师'"
    width="900px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-divider content-position="left">基本信息</el-divider>
      
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
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="formData.mobile" placeholder="请输入手机号" />
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
          <el-form-item label="教学年限" prop="teachingYears">
            <el-input-number
              v-model="formData.teachingYears"
              :min="0"
              :max="50"
              placeholder="教学年限"
              style="width: 100%"
            />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">年</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入地址" />
      </el-form-item>

      <el-divider content-position="left">角色与权限</el-divider>

      <el-form-item label="角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          placeholder="请选择角色（可多选）"
          multiple
          style="width: 100%"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          >
            <span>{{ role.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ role.description }}
            </span>
          </el-option>
        </el-select>
        <div style="margin-top: 8px; color: #909399; font-size: 12px">
          角色决定老师的系统权限，可在"角色管理"中配置
        </div>
      </el-form-item>

      <el-divider content-position="left">教学信息</el-divider>

      <el-form-item label="授课科目" prop="subjects">
        <el-select
          v-model="formData.subjects"
          placeholder="请选择授课科目（可多选）"
          multiple
          filterable
          allow-create
          style="width: 100%"
        >
          <el-option
            v-for="subject in subjectOptions"
            :key="subject.id"
            :label="subject.name"
            :value="subject.name"
          >
            <span>{{ subject.name }}</span>
            <span v-if="subject.category" style="float: right; color: #8492a6; font-size: 13px">
              {{ subject.category }}
            </span>
          </el-option>
        </el-select>
        <div style="margin-top: 8px; color: #909399; font-size: 12px">
          可输入自定义科目名称
        </div>
      </el-form-item>

      <el-form-item label="个人简介" prop="profileHtml">
        <div class="editor-wrapper">
          <QuillEditor
            v-model:content="formData.profileHtml"
            content-type="html"
            :options="editorOptions"
            placeholder="请输入个人简介、教学经验、获得荣誉等信息..."
          />
        </div>
        <div style="margin-top: 8px; color: #909399; font-size: 12px">
          支持富文本编辑，可包含个人简介、教学经验、获得荣誉等内容
        </div>
      </el-form-item>

      <el-divider content-position="left">账号状态</el-divider>

      <el-form-item label="账号状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="active">
            <span style="color: #67c23a; font-weight: 500">活跃</span>
          </el-radio>
          <el-radio label="inactive">
            <span style="color: #909399">停用</span>
          </el-radio>
        </el-radio-group>
        <div style="margin-top: 8px; color: #909399; font-size: 12px">
          停用后老师将无法登录系统
        </div>
      </el-form-item>

      <!-- 显示当前授权信息（只读） -->
      <el-divider content-position="left">授权信息（只读）</el-divider>

      <el-form-item label="负责班级">
        <div class="authorization-display">
          <el-tag
            v-for="cls in displayClasses"
            :key="cls.id"
            size="small"
            type="info"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ cls.name }}
          </el-tag>
          <span v-if="displayClasses.length === 0" style="color: #909399">
            暂无授权班级（请在"授权管理"或"班级管理"中配置）
          </span>
        </div>
      </el-form-item>

      <el-form-item label="授权资源">
        <div class="authorization-display">
          <div v-if="displayResources.courses.length > 0" style="margin-bottom: 8px">
            <span style="color: #606266; font-weight: 500">课程：</span>
            <el-tag
              v-for="course in displayResources.courses"
              :key="course.id"
              size="small"
              type="primary"
              style="margin-left: 8px"
            >
              {{ course.name }}
            </el-tag>
          </div>
          <div v-if="displayResources.assignments.length > 0" style="margin-bottom: 8px">
            <span style="color: #606266; font-weight: 500">作业：</span>
            <el-tag
              v-for="assignment in displayResources.assignments"
              :key="assignment.id"
              size="small"
              type="success"
              style="margin-left: 8px"
            >
              {{ assignment.name }}
            </el-tag>
          </div>
          <div v-if="displayResources.exams.length > 0">
            <span style="color: #606266; font-weight: 500">考试：</span>
            <el-tag
              v-for="exam in displayResources.exams"
              :key="exam.id"
              size="small"
              type="warning"
              style="margin-left: 8px"
            >
              {{ exam.name }}
            </el-tag>
          </div>
          <span v-if="totalAuthorizedResources === 0" style="color: #909399">
            暂无授权资源（请在"授权管理"中配置）
          </span>
        </div>
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
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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
  mobile: '',
  email: '',
  gender: 'male',
  birthDate: '',
  joinDate: '',
  teachingYears: 0,
  address: '',
  roleIds: [],
  subjects: [],
  profileHtml: '',
  status: 'active'
})

// 富文本编辑器配置
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  },
  placeholder: '请输入个人简介、教学经验、获得荣誉等信息...',
  theme: 'snow'
}

// 角色选项
const roleOptions = ref([
  { id: 'role_001', name: '管理员', description: '系统管理员，拥有所有权限' },
  { id: 'role_002', name: '教研组长', description: '教研组管理权限' },
  { id: 'role_003', name: '班主任', description: '班级管理权限' },
  { id: 'role_004', name: '任课教师', description: '基础教学权限' },
  { id: 'role_005', name: '助教', description: '辅助教学权限' }
])

// 科目选项
const subjectOptions = ref([
  { id: 'sub_001', name: '数学', category: '理科' },
  { id: 'sub_002', name: '语文', category: '文科' },
  { id: 'sub_003', name: '英语', category: '语言' },
  { id: 'sub_004', name: '物理', category: '理科' },
  { id: 'sub_005', name: '化学', category: '理科' },
  { id: 'sub_006', name: '生物', category: '理科' },
  { id: 'sub_007', name: '历史', category: '文科' },
  { id: 'sub_008', name: '地理', category: '文科' },
  { id: 'sub_009', name: '政治', category: '文科' },
  { id: 'sub_010', name: '体育', category: '其他' },
  { id: 'sub_011', name: '音乐', category: '艺术' },
  { id: 'sub_012', name: '美术', category: '艺术' },
  { id: 'sub_013', name: '编程', category: '技术' },
  { id: 'sub_014', name: '前端开发', category: '技术' },
  { id: 'sub_015', name: '算法', category: '技术' }
])

// 表单验证规则
const rules = {
  teacherId: [
    { required: true, message: '请输入工号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  mobile: [
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
  roleIds: [
    { required: true, message: '请至少选择一个角色', trigger: 'change', type: 'array', min: 1 }
  ],
  subjects: [
    { required: true, message: '请至少选择一个授课科目', trigger: 'change', type: 'array', min: 1 }
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

// 显示授权班级（只读）
const displayClasses = computed(() => {
  return props.teacherData?.authorizedClasses || []
})

// 显示授权资源（只读）
const displayResources = computed(() => {
  const resources = props.teacherData?.authorizedResources || {}
  return {
    courses: resources.courses || [],
    assignments: resources.assignments || [],
    exams: resources.exams || []
  }
})

const totalAuthorizedResources = computed(() => {
  const resources = displayResources.value
  return resources.courses.length + resources.assignments.length + resources.exams.length
})

// 初始化表单数据
const initFormData = () => {
  if (props.teacherData) {
    formData.value = {
      teacherId: props.teacherData.teacherId || '',
      name: props.teacherData.name || '',
      mobile: props.teacherData.mobile || props.teacherData.phone || '',
      email: props.teacherData.email || '',
      gender: props.teacherData.gender || 'male',
      birthDate: props.teacherData.birthDate || '',
      joinDate: props.teacherData.joinDate || '',
      teachingYears: props.teacherData.teachingYears || 0,
      address: props.teacherData.address || '',
      roleIds: props.teacherData.roleIds || [],
      subjects: props.teacherData.subjects || [],
      profileHtml: props.teacherData.profileHtml || '',
      status: props.teacherData.status || 'active'
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
    mobile: '',
    email: '',
    gender: 'male',
    birthDate: '',
    joinDate: '',
    teachingYears: 0,
    address: '',
    roleIds: [],
    subjects: [],
    profileHtml: '',
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

    // 构建保存数据（不包含授权信息，授权在专门的授权管理页面处理）
    const saveData = {
      teacherId: formData.value.teacherId,
      name: formData.value.name,
      mobile: formData.value.mobile,
      email: formData.value.email,
      gender: formData.value.gender,
      birthDate: formData.value.birthDate,
      joinDate: formData.value.joinDate,
      teachingYears: formData.value.teachingYears,
      address: formData.value.address,
      roleIds: formData.value.roleIds,
      subjects: formData.value.subjects,
      profileHtml: formData.value.profileHtml,
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

.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  
  :deep(.ql-container) {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
  }
  
  :deep(.ql-editor) {
    min-height: 200px;
  }
}

.authorization-display {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}
</style>
