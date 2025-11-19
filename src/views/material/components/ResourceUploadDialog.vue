<template>
  <el-dialog
    v-model="visible"
    title="上传素材"
    width="600px"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <el-form
      :model="formData"
      :rules="formRules"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="所属分组" prop="groupId">
        <el-select
          v-model="formData.groupId"
          placeholder="请选择分组"
          clearable
        >
          <el-option-group
            v-for="group in groupOptions"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="素材类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择素材类型"
          @change="handleTypeChange"
        >
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
          <el-option label="音频" value="audio" />
          <el-option label="电子书" value="ebook" />
        </el-select>
      </el-form-item>

      <el-form-item label="素材名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入素材名称（可选，默认使用文件名）"
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
          list-type="text"
          drag
        >
          <template #default>
            <div class="upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <p>拖拽文件到此或点击选择</p>
                <p class="upload-hint">{{ getUploadHint(formData.type) }}</p>
              </div>
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        上传
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'

const props = defineProps({
  modelValue: Boolean,
  groups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const formRef = ref(null)
const uploadRef = ref(null)
const fileList = ref([])
const submitting = ref(false)

const formData = reactive({
  groupId: '',
  type: 'image',
  name: '',
  file: null
})

const formRules = {
  groupId: [
    { required: true, message: '请选择分组', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择素材类型', trigger: 'change' }
  ],
  file: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ]
}

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 构建分组选项
const groupOptions = computed(() => {
  const sceneMap = {
    course: '课程素材',
    question: '题库素材',
    misc: '公共素材'
  }

  const options = {}

  props.groups.forEach(group => {
    const scene = group.scene || 'misc'
    const sceneLabel = sceneMap[scene]

    if (!options[sceneLabel]) {
      options[sceneLabel] = {
        label: sceneLabel,
        options: []
      }
    }

    options[sceneLabel].options.push(group)
  })

  return Object.values(options)
})

const getAcceptTypes = (type) => {
  const acceptMap = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    ebook: '.pdf,.epub,.mobi'
  }
  return acceptMap[type] || '*/*'
}

const getUploadHint = (type) => {
  const hintMap = {
    image: '支持 JPG、PNG、GIF 等图片格式，单个文件不超过 10MB',
    video: '支持 MP4、AVI、MOV 等视频格式，单个文件不超过 500MB',
    audio: '支持 MP3、WAV、M4A 等音频格式，单个文件不超过 100MB',
    ebook: '支持 PDF、EPUB、MOBI 等电子书格式，单个文件不超过 50MB'
  }
  return hintMap[type] || '请选择要上传的文件'
}

const getMaxSize = (type) => {
  const sizeMap = {
    image: 10 * 1024 * 1024,
    video: 500 * 1024 * 1024,
    audio: 100 * 1024 * 1024,
    ebook: 50 * 1024 * 1024
  }
  return sizeMap[type] || 10 * 1024 * 1024
}

const beforeUpload = (file) => {
  const maxSize = getMaxSize(formData.type)
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / 1024 / 1024)
    ElMessage.error(`文件大小不能超过 ${sizeMB}MB`)
    return false
  }
  return true
}

const handleFileChange = (file) => {
  formData.file = file.raw
  if (!formData.name && file.name) {
    formData.name = file.name.split('.')[0]
  }
}

const handleFileRemove = () => {
  formData.file = null
}

const handleTypeChange = () => {
  fileList.value = []
  formData.file = null
}

const handleVisibleChange = (val) => {
  if (!val) {
    resetForm()
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  fileList.value = []
  Object.assign(formData, {
    groupId: '',
    type: 'image',
    name: '',
    file: null
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    const formDataObj = new FormData()
    formDataObj.append('groupId', formData.groupId)
    formDataObj.append('type', formData.type)
    formDataObj.append('name', formData.name || formData.file.name.split('.')[0])
    formDataObj.append('file', formData.file)

    await courseApi.resourceSave(formDataObj)

    ElMessage.success('素材上传成功')
    emit('success')
    visible.value = false
    resetForm()
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    submitting.value = false
  }
}

defineExpose({
  resetForm
})
</script>

<style scoped>
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .upload-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 16px;
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
        margin-top: 8px;
      }
    }
  }
}

:deep(.el-upload-dragger) {
  border-radius: 4px;
}
</style>
