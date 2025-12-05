<template>
  <div class="edit-course-container">
    <!-- 左侧固定导航栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="@/assets/images/logo.png" alt="Logo" class="sidebar-logo" />
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 面包屑导航 -->
      <nav class="breadcrumb">
        <router-link to="/course" class="breadcrumb-link">系列课</router-link>
        <span class="breadcrumb-separator">></span>
        <router-link to="/course" class="breadcrumb-link">课程</router-link>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">编辑课程</span>
      </nav>

      <!-- 页面标题 -->
      <header class="page-header">
        <h1 class="page-title">编辑课程</h1>
      </header>

      <!-- 表单容器 -->
      <form class="form-container" @submit.prevent="handleSubmit">
        <!-- 基础信息 -->
        <section class="form-section">
          <h2 class="section-title">基础信息</h2>

          <!-- 分类 -->
          <div class="form-item">
            <label for="category" class="form-label">分类</label>
            <div class="form-control">
              <el-select
                id="category"
                v-model="formData.categoryId"
                placeholder="请选择分类"
                class="form-select"
              >
                <el-option label="编程基础" value="1" />
                <el-option label="前端开发" value="2" />
                <el-option label="后端开发" value="3" />
              </el-select>
            </div>
          </div>

          <!-- 名称 -->
          <div class="form-item form-item-required">
            <label for="courseName" class="form-label">名称</label>
            <div class="form-control">
              <el-input
                id="courseName"
                v-model="formData.courseName"
                maxlength="45"
                placeholder="请输入课程名称"
                class="form-input"
                @input="updateNameCount"
              />
              <span class="char-count">{{ nameCount }}/45</span>
            </div>
          </div>

          <!-- 封面 -->
          <div class="form-item form-item-required">
            <label for="cover" class="form-label">封面</label>
            <div class="form-control">
              <div class="cover-upload">
                <img
                  v-if="formData.courseLogo"
                  :src="formData.courseLogo"
                  alt="课程封面"
                  class="cover-preview"
                />
                <div v-else class="cover-placeholder">
                  <span style="font-size: 48px; color: #d0d0d0;">➕</span>
                  <p>点击上传封面</p>
                  <p class="upload-tip">尺寸：900x500px，格式：JPG、PNG，大小：<2M</p>
                </div>
                <input
                  id="cover"
                  type="file"
                  accept="image/*"
                  @change="handleCoverUpload"
                  style="display: none;"
                />
              </div>
            </div>
          </div>

          <!-- 简介 -->
          <div class="form-item form-item-required">
            <label for="introduction" class="form-label">简介</label>
            <div class="form-control">
              <div class="editor-container">
                <!-- 富文本编辑器工具栏 -->
                <div class="editor-toolbar">
                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" @click="execCommand('undo')" title="撤销">
                      <span style="font-weight: bold;">↶</span>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('redo')" title="重做">
                      <span style="font-weight: bold;">↷</span>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <select class="toolbar-select" @change="execCommand('fontSize', $event.target.value)">
                      <option value="">字号</option>
                      <option value="1">小</option>AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
(anonymous) @ request.js:92
Promise.then
_request @ axios.js?v=6c5f3571:2230
request @ axios.js?v=6c5f3571:2139
wrap @ axios.js?v=6c5f3571:8
postRequest @ request.js:117
problemCopy @ index.js:32
(anonymous) @ index.vue:600
wrappedFn @ chunk-VMGSXAPY.js?v=6c5f3571:1116
apply @ chunk-VMGSXAPY.js?v=6c5f3571:1124
map @ chunk-VMGSXAPY.js?v=6c5f3571:1048
(anonymous) @ index.vue:600
Promise.then
handleBatchCopy @ index.vue:599
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
emit @ chunk-VMGSXAPY.js?v=6c5f3571:8558
(anonymous) @ chunk-VMGSXAPY.js?v=6c5f3571:10268
handleClick @ element-plus.js?v=6c5f3571:15671
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
invoker @ chunk-VMGSXAPY.js?v=6c5f3571:11297
request.js:92 AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
(anonymous) @ request.js:92
Promise.then
_request @ axios.js?v=6c5f3571:2230
request @ axios.js?v=6c5f3571:2139
wrap @ axios.js?v=6c5f3571:8
postRequest @ request.js:117
problemCopy @ index.js:32
(anonymous) @ index.vue:600
wrappedFn @ chunk-VMGSXAPY.js?v=6c5f3571:1116
apply @ chunk-VMGSXAPY.js?v=6c5f3571:1124
map @ chunk-VMGSXAPY.js?v=6c5f3571:1048
(anonymous) @ index.vue:600
Promise.then
handleBatchCopy @ index.vue:599
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
emit @ chunk-VMGSXAPY.js?v=6c5f3571:8558
(anonymous) @ chunk-VMGSXAPY.js?v=6c5f3571:10268
handleClick @ element-plus.js?v=6c5f3571:15671
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
invoker @ chunk-VMGSXAPY.js?v=6c5f3571:11297
request.js:92 AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
(anonymous) @ request.js:92
Promise.then
_request @ axios.js?v=6c5f3571:2230
request @ axios.js?v=6c5f3571:2139
wrap @ axios.js?v=6c5f3571:8
postRequest @ request.js:117
problemCopy @ index.js:32
(anonymous) @ index.vue:600
wrappedFn @ chunk-VMGSXAPY.js?v=6c5f3571:1116
apply @ chunk-VMGSXAPY.js?v=6c5f3571:1124
map @ chunk-VMGSXAPY.js?v=6c5f3571:1048
(anonymous) @ index.vue:600
Promise.then
handleBatchCopy @ index.vue:599
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
emit @ chunk-VMGSXAPY.js?v=6c5f3571:8558
(anonymous) @ chunk-VMGSXAPY.js?v=6c5f3571:10268
handleClick @ element-plus.js?v=6c5f3571:15671
callWithErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2295
callWithAsyncErrorHandling @ chunk-VMGSXAPY.js?v=6c5f3571:2302
invoker @ chunk-VMGSXAPY.js?v=6c5f3571:11297
                      <option value="3">中</option>
                      <option value="5">大</option>
                      <option value="7">特大</option>
                    </select>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" @click="execCommand('bold')">
                      <strong>B</strong>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('italic')">
                      <em>I</em>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('underline')">
                      <u>U</u>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <input
                      type="color"
                      class="toolbar-color"
                      @change="execCommand('foreColor', $event.target.value)"
                    />
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" @click="execCommand('justifyLeft')" title="左对齐">
                      <span style="font-weight: bold;">⬅</span>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('justifyCenter')" title="居中对齐">
                      <span style="font-weight: bold;">⬌</span>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('justifyRight')" title="右对齐">
                      <span style="font-weight: bold;">➡</span>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" @click="execCommand('insertUnorderedList')" title="无序列表">
                      <span style="font-weight: bold;">•</span>
                    </button>
                    <button type="button" class="toolbar-btn" @click="execCommand('insertOrderedList')" title="有序列表">
                      <span style="font-weight: bold;">1.</span>
                    </button>
                  </div>

                  <div class="toolbar-group">
                    <button type="button" class="toolbar-btn" @click="insertImage" title="插入图片">
                      <span style="font-weight: bold;">🖼️</span>
                    </button>
                    <button type="button" class="toolbar-btn" @click="insertLink" title="插入链接">
                      <span style="font-weight: bold;">🔗</span>
                    </button>
                  </div>
                </div>

                <!-- 编辑器内容区 -->
                <div
                  ref="editorContent"
                  class="editor-content"
                  contenteditable="true"
                  @input="updateIntroduction"
                  @paste="handlePaste"
                ></div>
              </div>

              <div class="editor-actions">
                <button type="button" class="editor-btn" @click="previewContent">
                  预览
                </button>
                <a href="#" class="editor-link" @click.prevent="viewExample">查看示例</a>
              </div>
            </div>
          </div>

          <!-- 友情提示 -->
          <div class="form-item">
            <div class="form-control">
              <div class="alert alert-info">
                <el-icon class="alert-icon"><InfoFilled /></el-icon>
                <div class="alert-content">
                  <strong>友情提示：</strong>
                  请确保课程信息的准确性和完整性，这有助于学员更好地了解课程内容。
                </div>
              </div>
            </div>
          </div>

          <!-- 智能字幕 -->
          <div class="form-item">
            <label for="subtitles" class="form-label">智能字幕</label>
            <div class="form-control">
              <div class="switch-container">
                <label class="switch">
                  <input
                    id="subtitles"
                    v-model="formData.smartSubtitles"
                    type="checkbox"
                  />
                  <span class="switch-slider"></span>
                </label>
                <span class="switch-description">
                  开启智能字幕功能，系统将自动为视频内容生成字幕
                </span>
              </div>
            </div>
          </div>

          <!-- 课件资料 -->
          <div class="form-item form-item-required">
            <label for="materials" class="form-label">课件资料</label>
            <div class="form-control">
              <div class="file-uploader">
                <div class="upload-area" @click="triggerFileUpload" @drop="handleDrop" @dragover.prevent>
                  <el-icon size="48" color="#d0d0d0">
                    <Upload />
                  </el-icon>
                  <p>点击上传或拖拽文件到此处</p>
                  <p class="upload-tip">支持格式：PDF、PPT、Word、Excel，单个文件不超过10M</p>
                </div>

                <input
                  id="materials"
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx"
                  @change="handleFileUpload"
                  style="display: none;"
                />

                <!-- 已上传文件列表 -->
                <div v-if="uploadedFiles.length > 0" class="file-list">
                  <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
                    <el-icon class="file-icon"><Document /></el-icon>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <button type="button" class="file-remove" @click="removeFile(index)">
                      <el-icon><Close /></el-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            保存
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 不使用Element Plus图标，避免导入错误

const route = useRoute()
const router = useRouter()

// 当前路由
const currentRoute = computed(() => route.path)

// 导航项
const navItems = [
  { id: 1, name: '首页', path: '/dashboard', icon: '🏠' },
  { id: 2, name: '课程管理', path: '/course', icon: '📁' },
  { id: 3, name: '用户管理', path: '/users', icon: '👥' },
  { id: 4, name: '数据分析', path: '/analytics', icon: '📊' },
  { id: 5, name: '系统设置', path: '/settings', icon: '⚙️' }
]

// 表单数据
const formData = ref({
  categoryId: '',
  courseName: '',
  courseLogo: '',
  introduction: '',
  smartSubtitles: false,
  materials: []
})

// 字符计数
const nameCount = ref(0)

// 已上传文件
const uploadedFiles = ref([])

// 编辑器引用
const editorContent = ref(null)
const fileInput = ref(null)

// 更新名称字符计数
const updateNameCount = () => {
  nameCount.value = formData.value.courseName.length
}

// 更新简介内容
const updateIntroduction = () => {
  formData.value.introduction = editorContent.value?.innerHTML || ''
}

// 富文本编辑器命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editorContent.value?.focus()
}

// 插入图片
const insertImage = () => {
  const url = prompt('请输入图片URL:')
  if (url) {
    execCommand('insertImage', url)
  }
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接URL:')
  if (url) {
    execCommand('createLink', url)
  }
}

// 处理粘贴
const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// 预览内容
const previewContent = () => {
  console.log('预览内容:', formData.value.introduction)
}

// 查看示例
const viewExample = () => {
  console.log('查看示例')
}

// 处理封面上传
const handleCoverUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.courseLogo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    if (file.size <= 10 * 1024 * 1024) { // 10MB限制
      uploadedFiles.value.push(file)
    }
  })
}

// 处理拖拽
const handleDrop = (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  files.forEach(file => {
    if (file.size <= 10 * 1024 * 1024) {
      uploadedFiles.value.push(file)
    }
  })
}

// 移除文件
const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 取消
const handleCancel = () => {
  router.push('/course')
}

// 提交表单
const handleSubmit = () => {
  console.log('提交表单:', formData.value)
  // 这里添加表单提交逻辑
}

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/update/ModernEditCourse.vue`);
  const courseId = route.query.courseId
  if (courseId) {
    // 加载课程数据
    console.log('加载课程数据:', courseId)
    // 这里应该调用API获取课程数据
  }
})
</script>

<style lang="scss" scoped>
.edit-course-container {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-primary);
}

// 左侧导航栏
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  z-index: 1000;

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border-light);

    .sidebar-logo {
      height: 40px;
      width: auto;
    }
  }

  .sidebar-nav {
    padding: 20px 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition);
      position: relative;

      &:hover {
        background-color: var(--color-bg-tertiary);
        color: var(--color-text-primary);
      }

      &.active {
        color: var(--color-primary-500);
        background-color: rgba(59, 130, 246, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--color-primary-500);
        }
      }

      .nav-icon {
        margin-right: 12px;
        font-size: 18px;
      }

      .nav-text {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 主内容区
.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 24px;
  overflow-y: auto;
}

// 面包屑
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;

  .breadcrumb-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: var(--transition);

    &:hover {
      color: var(--color-primary-500);
    }
  }

  .breadcrumb-separator {
    margin: 0 8px;
    color: var(--color-text-tertiary);
  }

  .breadcrumb-current {
    color: var(--color-text-primary);
    font-weight: 500;
  }
}

// 页面标题
.page-header {
  margin-bottom: 32px;

  .page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

// 表单容器
.form-container {
  max-width: 800px;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  padding: 32px;
}

// 表单区块
.form-section {
  margin-bottom: 40px;

  .section-title {
    margin: 0 0 24px 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-primary-500);
    padding-bottom: 8px;
  }
}

// 表单项 - Grid布局
.form-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px 24px;
  align-items: center;
  margin-bottom: 24px;

  // 必填项标签样式
  &.form-item-required > label::before {
    content: '*';
    color: var(--color-danger);
    margin-right: 4px;
  }

  // 表单标签
  .form-label {
    text-align: right;
    padding-right: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  // 表单控件容器
  .form-control {
    display: flex;
    align-items: center;
    position: relative;
  }
}

// 输入框样式
.form-input,
.form-select {
  width: 100%;
  max-width: 400px;
}

// 字符计数
.char-count {
  margin-left: 12px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

// 封面上传
.cover-upload {
  width: 270px;
  height: 150px;
  border: 2px dashed var(--color-border-base);
  border-radius: var(--radius-base);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    border-color: var(--color-primary-500);
  }

  .cover-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;

    p {
      margin: 8px 0 4px 0;
      font-size: 14px;
      color: var(--color-text-secondary);

      &.upload-tip {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
    }
  }
}

// 富文本编辑器
.editor-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-base);
  overflow: hidden;

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-base);
    flex-wrap: wrap;

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border-right: 1px solid var(--color-border-light);

      &:last-child {
        border-right: none;
      }
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border-light);
      background-color: var(--color-bg-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background-color: var(--color-bg-tertiary);
        border-color: var(--color-primary-500);
      }
    }

    .toolbar-select {
      height: 32px;
      padding: 0 8px;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-sm);
      background-color: var(--color-bg-primary);
      cursor: pointer;
    }

    .toolbar-color {
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
  }

  .editor-content {
    min-height: 200px;
    padding: 16px;
    background-color: var(--color-bg-primary);
    outline: none;

    &:focus {
      background-color: var(--color-bg-secondary);
    }
  }

  .editor-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border-base);

    .editor-btn {
      padding: 6px 16px;
      border: 1px solid var(--color-border-base);
      background-color: var(--color-bg-primary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);

      &:hover {
        background-color: var(--color-bg-tertiary);
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
      }
    }

    .editor-link {
      color: var(--color-primary-500);
      text-decoration: none;
      font-size: 14px;
      transition: var(--transition);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 警告框
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-base);
  margin-bottom: 16px;

  &.alert-info {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #1890ff;
  }

  .alert-icon {
    font-size: 16px;
    margin-top: 2px;
  }

  .alert-content {
    flex: 1;

    strong {
      font-weight: 600;
    }
  }
}

// 开关组件
.switch-container {
  display: flex;
  align-items: center;
  gap: 12px;

  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 24px;

      &:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.4s;
        border-radius: 50%;
      }
    }

    input:checked + .switch-slider {
      background-color: var(--color-primary-500);
    }

    input:checked + .switch-slider:before {
      transform: translateX(20px);
    }
  }

  .switch-description {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

// 文件上传器
.file-uploader {
  width: 100%;
  max-width: 500px;

  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    border: 2px dashed var(--color-border-base);
    border-radius: var(--radius-base);
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      border-color: var(--color-primary-500);
      background-color: var(--color-bg-secondary);
    }

    p {
      margin: 8px 0 4px 0;
      font-size: 14px;
      color: var(--color-text-secondary);

      &.upload-tip {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
    }
  }

  .file-list {
    margin-top: 16px;

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border-light);
      border-radius: var(--radius-base);
      margin-bottom: 8px;

      .file-icon {
        color: var(--color-primary-500);
      }

      .file-name {
        flex: 1;
        font-size: 14px;
        color: var(--color-text-primary);
      }

      .file-size {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }

      .file-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        color: var(--color-danger);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: var(--transition);

        &:hover {
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }
  }
}

// 表单操作按钮
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-light);

  .btn {
    padding: 10px 24px;
    border: 1px solid var(--color-border-base);
    border-radius: var(--radius-base);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);

    &.btn-secondary {
      background-color: var(--color-bg-primary);
      color: var(--color-text-primary);

      &:hover {
        background-color: var(--color-bg-secondary);
        border-color: var(--color-primary-500);
        color: var(--color-primary-500);
      }
    }

    &.btn-primary {
      background: var(--gradient-primary);
      color: var(--color-text-inverse);
      border: none;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px var(--color-shadow-primary-hover);
      }
    }
  }
}
</style>