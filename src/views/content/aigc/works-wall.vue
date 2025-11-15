<template>
  <div class="aigc-works-wall">
    <el-card class="wall-card">
      <template #header>
        <div class="card-header">
          <span>AIGC作品展示墙</span>
          <div class="header-actions">
            <el-button type="primary" @click="showSubmitDialog = true">
              <el-icon><Plus /></el-icon>
              提交作品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="班级">
            <el-select v-model="filterForm.classId" placeholder="选择班级" clearable style="width: 150px">
              <el-option
                v-for="item in classOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程">
            <el-select v-model="filterForm.courseId" placeholder="选择课程" clearable style="width: 150px">
              <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="作品类型">
            <el-select v-model="filterForm.type" placeholder="选择类型" clearable style="width: 120px">
              <el-option label="文章" value="article" />
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="网页" value="webpage" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索作品标题或描述"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Search /></el-icon>
              筛选
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div class="stats-container">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总作品数" :value="totalWorks">
              <template #suffix>个</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="总浏览量" :value="totalViews">
              <template #suffix">次</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="总点赞数" :value="totalLikes">
              <template #suffix">个</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="活跃作者" :value="activeAuthors">
              <template #suffix">人</template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 作品展示墙 -->
      <div class="works-wall">
        <div v-loading="loading" class="works-grid">
          <div
            v-for="work in worksList"
            :key="work.id"
            class="work-card"
            @click="viewWorkDetail(work)"
          >
            <div class="work-thumbnail">
              <img :src="work.thumbnail" :alt="work.title" />
              <div class="work-type-badge">
                <el-tag :type="getTypeTagType(work.type)" size="small">
                  {{ getTypeLabel(work.type) }}
                </el-tag>
              </div>
              <div class="work-actions">
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click.stop="previewWork(work)"
                >
                  <el-icon><View /></el-icon>
                </el-button>
                <el-button
                  :type="work.isLiked ? 'danger' : 'info'"
                  size="small"
                  circle
                  @click.stop="toggleLike(work)"
                >
                  <el-icon><Heart /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="work-info">
              <h3 class="work-title">{{ work.title }}</h3>
              <p class="work-description">{{ work.description }}</p>
              <div class="work-meta">
                <span class="author">{{ work.author }}</span>
                <span class="class">{{ work.className }}</span>
              </div>
              <div class="work-stats">
                <span><el-icon><View /></el-icon> {{ work.viewCount }}</span>
                <span><el-icon><Heart /></el-icon> {{ work.likeCount }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ work.commentCount }}</span>
              </div>
              <div class="work-tags">
                <el-tag
                  v-for="tag in work.tags"
                  :key="tag"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore">
          <el-button @click="loadMore" :loading="loadingMore">
            加载更多
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 提交作品对话框 -->
    <el-dialog v-model="showSubmitDialog" title="提交AIGC作品" width="800px">
      <el-form :model="submitForm" :rules="submitRules" ref="submitFormRef" label-width="100px">
        <el-form-item label="作品标题" prop="title">
          <el-input v-model="submitForm.title" placeholder="请输入作品标题" />
        </el-form-item>

        <el-form-item label="作品类型" prop="type">
          <el-select v-model="submitForm.type" placeholder="请选择作品类型" style="width: 100%">
            <el-option label="文章" value="article" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="音频" value="audio" />
            <el-option label="网页" value="webpage" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属班级" prop="classId">
          <el-select v-model="submitForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属课程" prop="courseId">
          <el-select v-model="submitForm.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="item in courseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="作品描述" prop="description">
          <el-input
            v-model="submitForm.description"
            type="textarea"
            :rows="4"
            placeholder="请描述您的创作思路和作品特点"
          />
        </el-form-item>

        <el-form-item label="作品文件" prop="files">
          <el-upload
            v-model:file-list="submitFileList"
            class="work-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
            multiple
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将作品文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持多文件上传，单个文件不超过 200MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="作品标签">
          <div class="tags-container">
            <el-tag
              v-for="tag in submitForm.tags"
              :key="tag"
              closable
              @close="removeSubmitTag(tag)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="tagInputRef"
              v-model="inputValue"
              class="tag-input"
              size="small"
              @keyup.enter="handleTagInputConfirm"
              @blur="handleTagInputConfirm"
            />
            <el-button v-else class="button-new-tag" size="small" @click="showTagInput">
              + 添加标签
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="公开状态">
          <el-switch
            v-model="submitForm.isPublic"
            active-text="公开显示"
            inactive-text="仅自己可见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSubmitDialog = false">取消</el-button>
        <el-button type="primary" @click="submitWork" :loading="submitting">
          提交作品
        </el-button>
      </template>
    </el-dialog>

    <!-- 作品详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="currentWork?.title" width="900px">
      <div v-if="currentWork" class="work-detail">
        <div class="detail-header">
          <div class="detail-thumbnail">
            <img :src="currentWork.thumbnail" :alt="currentWork.title" />
          </div>
          <div class="detail-info">
            <h2>{{ currentWork.title }}</h2>
            <el-tag :type="getTypeTagType(currentWork.type)">
              {{ getTypeLabel(currentWork.type) }}
            </el-tag>
            <p class="description">{{ currentWork.description }}</p>
            <div class="meta-info">
              <p><strong>作者：</strong>{{ currentWork.author }}</p>
              <p><strong>班级：</strong>{{ currentWork.className }}</p>
              <p><strong>课程：</strong>{{ currentWork.courseName }}</p>
              <p><strong>提交时间：</strong>{{ currentWork.submitTime }}</p>
            </div>
            <div class="detail-stats">
              <span><el-icon><View /></el-icon> {{ currentWork.viewCount }} 浏览</span>
              <span><el-icon><Heart /></el-icon> {{ currentWork.likeCount }} 点赞</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ currentWork.commentCount }} 评论</span>
            </div>
          </div>
        </div>

        <div class="detail-content">
          <h4>作品文件</h4>
          <div class="files-list">
            <div
              v-for="file in currentWork.files"
              :key="file.id"
              class="file-item"
            >
              <el-icon><Document /></el-icon>
              <span>{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
              <el-button type="primary" size="small" @click="downloadFile(file)">
                下载
              </el-button>
            </div>
          </div>
        </div>

        <div class="detail-tags">
          <h4>标签</h4>
          <div>
            <el-tag
              v-for="tag in currentWork.tags"
              :key="tag"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" :title="previewWork?.title" width="80%">
      <div class="preview-content">
        <iframe
          v-if="previewWork?.type === 'webpage'"
          :src="previewWork?.previewUrl"
          style="width: 100%; height: 600px; border: none;"
        />
        <div v-else-if="previewWork?.type === 'image'" class="image-preview">
          <img :src="previewWork?.previewUrl" :alt="previewWork?.title" style="max-width: 100%;" />
        </div>
        <div v-else class="other-preview">
          <p>此文件类型暂不支持预览，请下载查看</p>
          <el-button type="primary" @click="downloadWorkFile(previewWork)">
            下载文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  View,
  Heart,
  ChatDotRound,
  UploadFilled,
  Document
} from '@element-plus/icons-vue'
import contentApi from '@/api/content'

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const hasMore = ref(true)
const showSubmitDialog = ref(false)
const showDetailDialog = ref(false)
const showPreviewDialog = ref(false)
const currentWork = ref(null)
const previewWork = ref(null)
const worksList = ref([])
const totalWorks = ref(0)
const totalViews = ref(0)
const totalLikes = ref(0)
const activeAuthors = ref(0)
const submitFileList = ref([])
const tagInputRef = ref()
const inputVisible = ref(false)
const inputValue = ref('')

// 筛选表单
const filterForm = reactive({
  classId: null,
  courseId: null,
  type: '',
  keyword: '',
  page: 1,
  limit: 12
})

// 提交表单
const submitForm = reactive({
  title: '',
  type: '',
  classId: null,
  courseId: null,
  description: '',
  tags: [],
  isPublic: true,
  files: []
})

// 表单验证规则
const submitRules = {
  title: [{ required: true, message: '请输入作品标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择作品类型', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  description: [{ required: true, message: '请输入作品描述', trigger: 'blur' }]
}

const submitFormRef = ref()

// 模拟数据
const classOptions = ref([
  { id: 1, name: '前端开发基础班' },
  { id: 2, name: 'Vue.js进阶班' },
  { id: 3, name: 'React实战班' }
])

const courseOptions = ref([
  { id: 1, name: 'JavaScript基础编程' },
  { id: 2, name: 'Vue.js组件开发' }
])

// 获取作品列表
const getWorksList = async (reset = false) => {
  if (reset) {
    filterForm.page = 1
    worksList.value = []
    hasMore.value = true
  }

  loading.value = reset ? true : loadingMore.value
  try {
    const response = await contentApi.getAIGCWorksList(filterForm)
    if (response.code === 200) {
      if (reset) {
        worksList.value = response.data.items
      } else {
        worksList.value.push(...response.data.items)
      }

      // 更新统计信息
      updateStats(response.data.items)

      // 判断是否还有更多数据
      hasMore.value = response.data.items.length === filterForm.limit
    }
  } catch (error) {
    ElMessage.error('获取作品列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 更新统计信息
const updateStats = (items) => {
  if (filterForm.page === 1) {
    totalWorks.value = items.length
    totalViews.value = items.reduce((sum, item) => sum + item.viewCount, 0)
    totalLikes.value = items.reduce((sum, item) => sum + item.likeCount, 0)
    const authors = new Set(items.map(item => item.author))
    activeAuthors.value = authors.size
  }
}

// 筛选
const handleFilter = () => {
  getWorksList(true)
}

// 重置筛选
const resetFilter = () => {
  filterForm.classId = null
  filterForm.courseId = null
  filterForm.type = ''
  filterForm.keyword = ''
  getWorksList(true)
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    filterForm.page++
    getWorksList()
  }
}

// 查看作品详情
const viewWorkDetail = async (work) => {
  try {
    const response = await contentApi.getAIGCWorkDetail(work.id)
    if (response.code === 200) {
      currentWork.value = response.data
      showDetailDialog.value = true
    }
  } catch (error) {
    ElMessage.error('获取作品详情失败')
  }
}

// 预览作品
const previewWork = (work) => {
  previewWork.value = work
  showPreviewDialog.value = true
}

// 点赞/取消点赞
const toggleLike = async (work) => {
  try {
    const response = await contentApi.toggleLike(work.id)
    if (response.code === 200) {
      work.likeCount = response.data.likeCount
      work.isLiked = response.data.liked
      ElMessage.success(response.data.message)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理文件变化
const handleFileChange = (file, fileList) => {
  submitFileList.value = fileList
  submitForm.files = fileList.map(item => ({
    name: item.name,
    size: item.size,
    type: item.raw?.type || 'unknown'
  }))
}

// 处理文件移除
const handleFileRemove = (file, fileList) => {
  submitFileList.value = fileList
  submitForm.files = fileList.map(item => ({
    name: item.name,
    size: item.size,
    type: item.raw?.type || 'unknown'
  }))
}

// 标签相关方法
const removeSubmitTag = (tag) => {
  const index = submitForm.tags.indexOf(tag)
  if (index > -1) {
    submitForm.tags.splice(index, 1)
  }
}

const showTagInput = () => {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

const handleTagInputConfirm = () => {
  if (inputValue.value) {
    if (!submitForm.tags.includes(inputValue.value)) {
      submitForm.tags.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 提交作品
const submitWork = async () => {
  try {
    await submitFormRef.value.validate()
    submitting.value = true

    const response = await contentApi.submitAIGCWork({
      ...submitForm,
      files: submitForm.files
    })

    if (response.code === 200) {
      ElMessage.success('作品提交成功')
      showSubmitDialog.value = false
      resetSubmitForm()
      getWorksList(true)
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 重置提交表单
const resetSubmitForm = () => {
  submitForm.title = ''
  submitForm.type = ''
  submitForm.classId = null
  submitForm.courseId = null
  submitForm.description = ''
  submitForm.tags = []
  submitForm.isPublic = true
  submitForm.files = []
  submitFileList.value = []
  submitFormRef.value?.resetFields()
}

// 下载文件
const downloadFile = (file) => {
  // 模拟文件下载
  ElMessage.success(`开始下载 ${file.name}`)
}

// 下载作品文件
const downloadWorkFile = (work) => {
  if (work.files && work.files.length > 0) {
    downloadFile(work.files[0])
  }
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    article: 'primary',
    image: 'success',
    video: 'warning',
    audio: 'info',
    webpage: 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签
const getTypeLabel = (type) => {
  const typeMap = {
    article: '文章',
    image: '图片',
    video: '视频',
    audio: '音频',
    webpage: '网页'
  }
  return typeMap[type] || type
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/content/aigc/works-wall.vue`);
  getWorksList(true)
})
</script>

<style scoped>
.aigc-works-wall {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.stats-container {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.works-wall {
  min-height: 400px;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.work-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.work-thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.work-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.work-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.work-card:hover .work-actions {
  opacity: 1;
}

.work-info {
  padding: 16px;
}

.work-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.work-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;
}

.work-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #909399;
}

.work-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.load-more {
  text-align: center;
  margin-top: 30px;
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

.work-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-thumbnail {
  flex-shrink: 0;
}

.detail-thumbnail img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-info {
  flex: 1;
}

.detail-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.detail-info .description {
  margin: 12px 0;
  color: #606266;
  line-height: 1.6;
}

.meta-info p {
  margin: 4px 0;
  color: #909399;
}

.detail-stats {
  margin-top: 12px;
  display: flex;
  gap: 20px;
  color: #909399;
}

.detail-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-content,
.detail-tags {
  margin-top: 20px;
}

.detail-content h4,
.detail-tags h4 {
  margin-bottom: 8px;
  color: #303133;
}

.files-list {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.file-item:last-child {
  border-bottom: none;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.preview-content {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.other-preview {
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>