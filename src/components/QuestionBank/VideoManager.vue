<template>
  <el-dialog
    v-model="dialogVisible"
    title="视频讲解管理"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="video-manager">
      <div class="upload-section">
        <el-upload
          class="video-uploader"
          drag
          :action="uploadUrl"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
          accept="video/*"
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">
              <p>点击上传或拖拽视频文件到此处</p>
              <p class="upload-hint">支持 MP4, AVI, MOV 格式，最大 100MB</p>
            </div>
          </div>
        </el-upload>
      </div>

      <el-divider>或</el-divider>

      <div class="external-section">
        <h4>外部视频链接</h4>
        <el-form :model="externalForm" label-width="100px">
          <el-form-item label="视频平台">
            <el-select v-model="externalForm.platform" placeholder="选择平台">
              <el-option label="Bilibili" value="bilibili" />
              <el-option label="YouTube" value="youtube" />
              <el-option label="腾讯视频" value="tencent" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="视频链接">
            <el-input
              v-model="externalForm.url"
              placeholder="请输入视频链接"
            />
          </el-form-item>

          <el-form-item label="视频标题">
            <el-input
              v-model="externalForm.title"
              placeholder="请输入视频标题"
            />
          </el-form-item>

          <el-form-item label="描述">
            <el-input
              v-model="externalForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入视频描述"
            />
          </el-form-item>
        </el-form>

        <div class="section-actions">
          <el-button type="primary" @click="addExternalVideo">
            添加外部视频
          </el-button>
        </div>
      </div>

      <!-- 已添加的视频列表 -->
      <div v-if="videoList.length > 0" class="video-list-section">
        <el-divider>已添加的视频</el-divider>
        <div class="video-list">
          <div
            v-for="(video, index) in videoList"
            :key="index"
            class="video-item"
          >
            <div class="video-info">
              <div class="video-header">
                <h5>{{ video.title }}</h5>
                <el-tag :type="getVideoTypeTag(video.type)" size="small">
                  {{ getVideoTypeLabel(video.type) }}
                </el-tag>
              </div>
              <p class="video-description">{{ video.description }}</p>
              <div class="video-meta">
                <span v-if="video.duration">时长：{{ video.duration }}</span>
                <span v-if="video.size">大小：{{ formatFileSize(video.size) }}</span>
                <span v-if="video.uploadTime">上传时间：{{ formatDate(video.uploadTime) }}</span>
              </div>
            </div>
            <div class="video-actions">
              <el-button size="small" @click="previewVideo(video)">
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button size="small" type="danger" @click="removeVideo(index)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">
          保存 ({{ videoList.length }} 个视频)
        </el-button>
      </div>
    </div>

    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="视频预览"
      width="800px"
      append-to-body
    >
      <div v-if="previewVideo" class="video-preview">
        <div v-if="previewVideo.type === 'local'" class="local-video">
          <video
            :src="previewVideo.url"
            controls
            width="100%"
            style="max-height: 400px"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
        <div v-else class="external-video">
          <div class="video-placeholder">
            <el-icon><VideoPlay /></el-icon>
            <p>外部视频：{{ previewVideo.title }}</p>
            <p class="video-url">{{ previewVideo.url }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, View, Delete, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questionId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'video-added'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const uploadUrl = ref('/api/upload/video') // 实际项目中配置上传接口
const videoList = ref([])
const showPreview = ref(false)
const previewVideo = ref(null)

// 外部视频表单
const externalForm = ref({
  platform: 'bilibili',
  url: '',
  title: '',
  description: ''
})

// 方法
const beforeUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('视频文件大小不能超过 100MB!')
    return false
  }

  ElMessage.info('视频上传中，请稍候...')
  return true
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success('视频上传成功')

  const video = {
    type: 'local',
    title: file.name.replace(/\.[^/.]+$/, ""), // 移除文件扩展名
    url: response.url || URL.createObjectURL(file.raw),
    size: file.size,
    duration: response.duration || '未知',
    uploadTime: new Date().toISOString(),
    description: '本地上传的视频'
  }

  videoList.value.push(video)
}

const handleUploadError = (error) => {
  ElMessage.error('视频上传失败')
  console.error('Upload error:', error)
}

const addExternalVideo = () => {
  if (!externalForm.value.url.trim()) {
    ElMessage.warning('请输入视频链接')
    return
  }

  if (!externalForm.value.title.trim()) {
    ElMessage.warning('请输入视频标题')
    return
  }

  const video = {
    type: 'external',
    platform: externalForm.value.platform,
    title: externalForm.value.title,
    url: externalForm.value.url,
    description: externalForm.value.description,
    uploadTime: new Date().toISOString()
  }

  videoList.value.push(video)

  // 重置表单
  externalForm.value = {
    platform: 'bilibili',
    url: '',
    title: '',
    description: ''
  }

  ElMessage.success('外部视频添加成功')
}

const removeVideo = (index) => {
  videoList.value.splice(index, 1)
  ElMessage.success('视频删除成功')
}

const previewVideo = (video) => {
  previewVideo.value = video
  showPreview.value = true
}

const handleSave = () => {
  if (videoList.value.length === 0) {
    ElMessage.warning('请至少添加一个视频')
    return
  }

  // 发送视频添加事件
  videoList.value.forEach(video => {
    emit('video-added', video)
  })

  // 清空列表并关闭对话框
  videoList.value = []
  dialogVisible.value = false
  ElMessage.success('视频保存成功')
}

const handleClose = () => {
  videoList.value = []
  externalForm.value = {
    platform: 'bilibili',
    url: '',
    title: '',
    description: ''
  }
}

// 辅助方法
const getVideoTypeLabel = (type) => {
  const typeMap = {
    local: '本地视频',
    external: '外部链接'
  }
  return typeMap[type] || type
}

const getVideoTypeTag = (type) => {
  const typeMap = {
    local: 'success',
    external: 'info'
  }
  return typeMap[type] || ''
}

const formatFileSize = (size) => {
  if (!size) return '未知'
  const mb = size / 1024 / 1024
  return `${mb.toFixed(2)} MB`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.video-manager {
  .upload-section {
    .video-uploader {
      width: 100%;

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 180px;
        border: 2px dashed var(--color-border-lighter);
        border-radius: 8px;
        background: var(--color-bg-secondary);
        transition: all 0.3s;

        &:hover {
          border-color: var(--color-primary);
          background: var(--color-primary-light-9);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;

          .upload-icon {
            font-size: 48px;
            color: var(--color-primary);
            margin-bottom: 16px;
          }

          .upload-text {
            text-align: center;

            p {
              margin: 8px 0;
              color: var(--color-text-primary);
            }

            .upload-hint {
              font-size: 12px;
              color: var(--color-text-secondary);
            }
          }
        }
      }
    }
  }

  .external-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      color: var(--color-text-primary);
    }

    .section-actions {
      text-align: center;
      margin-top: 16px;
    }
  }

  .video-list-section {
    .video-list {
      .video-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid var(--color-border-lighter);
        border-radius: 8px;
        background: var(--color-bg-secondary);

        .video-info {
          flex: 1;

          .video-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            h5 {
              margin: 0;
              color: var(--color-text-primary);
            }
          }

          .video-description {
            margin: 8px 0;
            color: var(--color-text-secondary);
            font-size: 14px;
          }

          .video-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: var(--color-text-secondary);
          }
        }

        .video-actions {
          display: flex;
          gap: 8px;
          margin-left: 16px;
        }
      }
    }
  }

  .dialog-footer {
    text-align: right;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-lighter);
  }
}

.video-preview {
  .local-video {
    video {
      border-radius: 8px;
    }
  }

  .external-video {
    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      text-align: center;

      .el-icon {
        font-size: 48px;
        color: var(--color-primary);
        margin-bottom: 16px;
      }

      p {
        margin: 8px 0;
        color: var(--color-text-primary);
      }

      .video-url {
        font-size: 12px;
        color: var(--color-text-secondary);
        word-break: break-all;
      }
    }
  }
}
</style>