<template>
  <el-dialog
    :model-value="modelValue"
    :title="material ? '编辑素材' : '上传素材'"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="素材名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入素材名称"
        />
      </el-form-item>

      <el-form-item label="素材类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择素材类型"
          @change="handleTypeChange"
        >
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
        </el-select>
      </el-form-item>

      <el-form-item label="素材描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入素材描述"
        />
      </el-form-item>

      <el-form-item label="上传文件" prop="file">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :file-list="fileList"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :accept="getAcceptTypes(formData.type)"
          :limit="1"
          list-type="picture-card"
        >
          <template #default>
            <div class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">
                <p>{{ getUploadText(formData.type) }}</p>
                <p class="upload-hint">{{ getUploadHint(formData.type) }}</p>
              </div>
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="发布状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="draft">草稿</el-radio>
          <el-radio value="published">已发布</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ material ? '更新' : '上传' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  material: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])
const submitting = ref(false)

const formData = reactive({
  name: '',
  type: 'image',
  description: '',
  file: null,
  status: 'draft'
})

const formRules = {
  name: [
    { required: true, message: '请输入素材名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择素材类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入素材描述', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请上传素材文件', trigger: 'change' }
  ]
}

const resetForm = () => {
  formRef.value?.resetFields()
  fileList.value = []
  Object.assign(formData, {
    name: '',
    type: 'image',
    description: '',
    file: null,
    status: 'draft'
  })
}

watch(() => props.material, (newVal) => {
  if (newVal) {
    formData.name = newVal.name
    formData.type = newVal.type
    formData.description = newVal.description
    formData.status = newVal.status
    if (newVal.fileUrl) {
      fileList.value = [{
        name: newVal.name,
        url: newVal.fileUrl
      }]
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const getAcceptTypes = (type) => {
  const acceptMap = {
    image: 'image/*',
    video: 'video/*'
  }
  return acceptMap[type] || '*/*'
}

const getUploadText = (type) => {
  const textMap = {
    image: '上传图片素材',
    video: '上传视频素材'
  }
  return textMap[type] || '上传文件'
}

const getUploadHint = (type) => {
  const hintMap = {
    image: '支持 JPG、PNG、GIF 等图片格式，单个文件不超过 10MB',
    video: '支持 MP4、AVI、MOV 等视频格式，单个文件不超过 500MB'
  }
  return hintMap[type] || '请选择要上传的文件'
}

const beforeUpload = (file) => {
  const maxSize = formData.type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error(`文件大小不能超过 ${formData.type === 'video' ? '500MB' : '10MB'}`)
    return false
  }
  return true
}

const handleFileChange = (file) => {
  formData.file = file.raw
}

const handleFileRemove = () => {
  formData.file = null
}

const handleTypeChange = () => {
  fileList.value = []
  formData.file = null
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    // 模拟上传
    setTimeout(() => {
      const data = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        status: formData.status,
        fileUrl: URL.createObjectURL(formData.file),
        size: formData.file?.size || 0
      }

      emit('save', data)
      submitting.value = false
      emit('update:modelValue', false)
      resetForm()
    }, 1500)

  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  .upload-icon {
    font-size: 24px;
    color: #c0c4cc;
    margin-bottom: 8px;
  }

  .upload-text {
    text-align: center;

    p {
      margin: 0;
      font-size: 14px;
      color: #606266;

      &.upload-hint {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}
</style>
