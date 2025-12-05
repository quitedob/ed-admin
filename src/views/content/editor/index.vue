<template>
  <div class="content-editor">
    <el-card class="editor-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑内容' : '创建内容' }}</span>
          <div class="header-actions">
            <el-button @click="goBack">返回</el-button>
            <el-button type="info" @click="saveDraft" :loading="savingDraft">
              保存草稿
            </el-button>
            <el-button type="primary" @click="publishContent" :loading="publishing">
              {{ isEdit ? '更新' : '发布' }}
            </el-button>
          </div>
        </div>
      </template>

      <el-form :model="contentForm" :rules="contentRules" ref="contentFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 主要内容区域 -->
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="contentForm.title"
                placeholder="请输入内容标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="内容类型" prop="type">
              <el-radio-group v-model="contentForm.type" @change="handleTypeChange">
                <el-radio label="article">文章</el-radio>
                <el-radio label="video">视频</el-radio>
                <el-radio label="audio">音频</el-radio>
                <el-radio label="image">图片</el-radio>
                <el-radio label="file">文件</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="内容摘要" prop="summary">
              <el-input
                v-model="contentForm.summary"
                type="textarea"
                :rows="3"
                placeholder="请输入内容摘要"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <!-- 富文本编辑器 -->
            <el-form-item label="正文内容" prop="content" v-if="['article', 'video', 'audio'].includes(contentForm.type)">
              <div class="editor-container">
                <Editor
                  v-model="contentForm.content"
                  :height="400"
                  :toolbar="toolbarConfig"
                  @change="handleEditorChange"
                />
              </div>
            </el-form-item>

            <!-- 图片上传 -->
            <el-form-item label="图片内容" prop="images" v-if="contentForm.type === 'image'">
              <div class="image-upload-container">
                <el-upload
                  v-model:file-list="imageFileList"
                  class="image-uploader"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleImageChange"
                  :on-preview="handlePicturePreview"
                  :on-remove="handleImageRemove"
                  :limit="9"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </div>
            </el-form-item>

            <!-- 文件上传 -->
            <el-form-item label="文件上传" prop="files" v-if="contentForm.type === 'file'">
              <div class="file-upload-container">
                <el-upload
                  v-model:file-list="fileFileList"
                  class="file-uploader"
                  action="#"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :on-remove="handleFileRemove"
                  drag
                  multiple
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持多文件上传，单个文件不超过 100MB
                    </div>
                  </template>
                </el-upload>
              </div>
            </el-form-item>

            <!-- 标签 -->
            <el-form-item label="标签">
              <div class="tags-container">
                <el-tag
                  v-for="tag in contentForm.tags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-if="inputVisible"
                  ref="inputRef"
                  v-model="inputValue"
                  class="tag-input"
                  size="small"
                  @keyup.enter="handleInputConfirm"
                  @blur="handleInputConfirm"
                />
                <el-button v-else class="button-new-tag" size="small" @click="showInput">
                  + 新标签
                </el-button>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <!-- 侧边栏设置 -->
            <div class="sidebar-settings">
              <!-- 封面图片 -->
              <el-form-item label="封面图片">
                <div class="cover-upload">
                  <el-upload
                    class="cover-uploader"
                    action="#"
                    :show-file-list="false"
                    :auto-upload="false"
                    :on-change="handleCoverChange"
                  >
                    <img v-if="contentForm.coverImage" :src="contentForm.coverImage" class="cover-image" />
                    <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="cover-tips">
                    <p>建议尺寸：16:9</p>
                    <p>支持格式：JPG、PNG</p>
                  </div>
                </div>
              </el-form-item>

              <!-- 分类 -->
              <el-form-item label="内容分类" prop="categoryId">
                <el-select v-model="contentForm.categoryId" placeholder="请选择分类" style="width: 100%">
                  <el-option
                    v-for="category in categoryOptions"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>

              <!-- 作者 -->
              <el-form-item label="作者" prop="author">
                <el-input v-model="contentForm.author" placeholder="请输入作者名称" />
              </el-form-item>

              <!-- 发布设置 -->
              <el-divider content-position="left">发布设置</el-divider>

              <el-form-item label="发布状态">
                <el-radio-group v-model="contentForm.publishType">
                  <el-radio label="immediate">立即发布</el-radio>
                  <el-radio label="scheduled">定时发布</el-radio>
                  <el-radio label="draft">保存草稿</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="发布时间" v-if="contentForm.publishType === 'scheduled'">
                <el-date-picker
                  v-model="contentForm.publishTime"
                  type="datetime"
                  placeholder="选择发布时间"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="评论设置">
                <el-switch
                  v-model="contentForm.allowComment"
                  active-text="允许评论"
                  inactive-text="禁止评论"
                />
              </el-form-item>

              <el-form-item label="公开状态">
                <el-switch
                  v-model="contentForm.isPublic"
                  active-text="公开"
                  inactive-text="私密"
                />
              </el-form-item>

              <!-- SEO设置 -->
              <el-divider content-position="left">SEO设置</el-divider>

              <el-form-item label="SEO标题">
                <el-input
                  v-model="contentForm.seoTitle"
                  placeholder="留空则使用内容标题"
                  maxlength="60"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="SEO关键词">
                <el-input
                  v-model="contentForm.seoKeywords"
                  placeholder="多个关键词用英文逗号分隔"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="SEO描述">
                <el-input
                  v-model="contentForm.seoDescription"
                  type="textarea"
                  :rows="2"
                  placeholder="留空则使用内容摘要"
                  maxlength="160"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览">
      <img w-full :src="previewImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import Editor from '@/components/Editor/index.vue'
import contentApi from '@/api/content'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const isEdit = ref(false)
const savingDraft = ref(false)
const publishing = ref(false)
const contentFormRef = ref()
const inputRef = ref()
const inputVisible = ref(false)
const inputValue = ref('')
const previewVisible = ref(false)
const previewImageUrl = ref('')
const categoryOptions = ref([])
const imageFileList = ref([])
const fileFileList = ref([])

// 内容表单
const contentForm = reactive({
  title: '',
  type: 'article',
  summary: '',
  content: '',
  coverImage: '',
  categoryId: null,
  author: '',
  tags: [],
  publishType: 'immediate',
  publishTime: null,
  allowComment: true,
  isPublic: true,
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
  images: [],
  files: []
})

// 表单验证规则
const contentRules = {
  title: [{ required: true, message: '请输入内容标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择内容类型', trigger: 'change' }],
  content: [
    { required: true, message: '请输入正文内容', trigger: 'blur' },
    { min: 50, message: '正文内容至少50个字符', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择内容分类', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }]
}

// 编辑器工具栏配置
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    '|',
    'bold',
    'italic',
    'underline',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'insertLink',
    'uploadImage',
    'insertVideo',
    'insertTable',
    '|',
    'codeBlock',
    'divider',
    '|',
    'undo',
    'redo'
  ]
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const response = await contentApi.getCategoryList()
    if (response.code === 200) {
      categoryOptions.value = response.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 处理类型变化
const handleTypeChange = (type) => {
  // 清空相关数据
  contentForm.content = ''
  contentForm.images = []
  contentForm.files = []
  imageFileList.value = []
  fileFileList.value = []
}

// 处理编辑器变化
const handleEditorChange = (content) => {
  contentForm.content = content
}

// 处理封面变化
const handleCoverChange = (file) => {
  // 模拟图片上传
  const reader = new FileReader()
  reader.onload = (e) => {
    contentForm.coverImage = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 处理图片变化
const handleImageChange = (file, fileList) => {
  imageFileList.value = fileList
  // 转换图片数据
  contentForm.images = fileList.map(item => ({
    name: item.name,
    url: URL.createObjectURL(item.raw),
    size: item.size,
    type: item.raw.type
  }))
}

// 处理图片预览
const handlePicturePreview = (file) => {
  previewImageUrl.value = file.url
  previewVisible.value = true
}

// 处理图片移除
const handleImageRemove = (file, fileList) => {
  imageFileList.value = fileList
  contentForm.images = fileList.map(item => ({
    name: item.name,
    url: item.url,
    size: item.size,
    type: item.raw?.type || 'image'
  }))
}

// 处理文件变化
const handleFileChange = (file, fileList) => {
  fileFileList.value = fileList
  contentForm.files = fileList.map(item => ({
    name: item.name,
    url: URL.createObjectURL(item.raw),
    size: item.size,
    type: item.raw.type
  }))
}

// 处理文件移除
const handleFileRemove = (file, fileList) => {
  fileFileList.value = fileList
  contentForm.files = fileList.map(item => ({
    name: item.name,
    url: item.url,
    size: item.size,
    type: item.raw?.type || 'file'
  }))
}

// 标签相关方法
const removeTag = (tag) => {
  const index = contentForm.tags.indexOf(tag)
  if (index > -1) {
    contentForm.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (!contentForm.tags.includes(inputValue.value)) {
      contentForm.tags.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 保存草稿
const saveDraft = async () => {
  try {
    savingDraft.value = true
    const formData = {
      ...contentForm,
      status: 0
    }

    if (isEdit.value) {
      const response = await contentApi.updateContent(route.params.id, formData)
      if (response.code === 200) {
        ElMessage.success('草稿保存成功')
      }
    } else {
      const response = await contentApi.createContent(formData)
      if (response.code === 200) {
        ElMessage.success('草稿保存成功')
        router.push(`/content/editor/${response.data.id}`)
      }
    }
  } catch (error) {
    ElMessage.error('保存草稿失败')
  } finally {
    savingDraft.value = false
  }
}

// 发布内容
const publishContent = async () => {
  try {
    await contentFormRef.value.validate()
    publishing.value = true

    const formData = {
      ...contentForm,
      status: 1,
      publishTime: contentForm.publishType === 'immediate'
        ? new Date().toISOString()
        : contentForm.publishTime?.toISOString()
    }

    if (isEdit.value) {
      const response = await contentApi.updateContent(route.params.id, formData)
      if (response.code === 200) {
        ElMessage.success('内容更新成功')
        router.push('/content/list')
      }
    } else {
      const response = await contentApi.createContent(formData)
      if (response.code === 200) {
        ElMessage.success('内容发布成功')
        router.push('/content/list')
      }
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    publishing.value = false
  }
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 获取内容详情
const getContentDetail = async (id) => {
  try {
    const response = await contentApi.getContentDetail(id)
    if (response.code === 200) {
      Object.assign(contentForm, response.data)
      // 设置文件列表
      if (response.data.images) {
        imageFileList.value = response.data.images.map(img => ({
          name: img.name,
          url: img.url
        }))
      }
      if (response.data.files) {
        fileFileList.value = response.data.files.map(file => ({
          name: file.name,
          url: file.url
        }))
      }
    }
  } catch (error) {
    ElMessage.error('获取内容详情失败')
  }
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/content/editor/index.vue`);
  getCategoryOptions()
  if (route.params.id) {
    isEdit.value = true
    getContentDetail(route.params.id)
  }
})
</script>

<style scoped>
.content-editor {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.image-upload-container,
.file-upload-container {
  width: 100%;
}

.cover-upload {
  text-align: center;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 120px;
  display: inline-block;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.cover-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.cover-tips p {
  margin: 2px 0;
}

.tags-container {
  width: 100%;
}

.tag-input {
  width: 100px;
  margin-right: 8px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-bottom: 8px;
}

.sidebar-settings {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>