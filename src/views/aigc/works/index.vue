<template>
  <div class="aigc-works-container">
    <div class="page-header">
      <h2>AIGC作品提交</h2>
      <p>展示你的AI创作才华，按顺序上传你的作品</p>
    </div>

    <!-- 作品提交表单 -->
    <el-card class="submit-card">
      <template #header>
        <div class="card-header">
          <span>上传新作品</span>
          <el-button type="primary" @click="showSubmitForm = !showSubmitForm">
            {{ showSubmitForm ? '收起' : '展开' }}
          </el-button>
        </div>
      </template>

      <el-collapse-transition>
        <div v-if="showSubmitForm" class="submit-form">
          <el-form
            :model="submitForm"
            :rules="submitRules"
            ref="submitFormRef"
            label-width="100px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
        <el-form-item label="作品标题" prop="title">
          <el-input
                    v-model="submitForm.title"
            placeholder="请输入作品标题"
          />
        </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="作品类型" prop="type">
                  <el-select v-model="submitForm.type" placeholder="选择作品类型">
                    <el-option label="文章" value="article" />
                    <el-option label="图片" value="image" />
                    <el-option label="视频" value="video" />
                    <el-option label="音乐" value="audio" />
                    <el-option label="网页预览" value="webpage" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="作品说明" prop="description">
          <el-input
                v-model="submitForm.description"
                type="textarea"
                :rows="3"
                placeholder="简要描述你的作品创作过程和创意点"
          />
        </el-form-item>

            <!-- 文件上传区域 -->
            <el-form-item
              v-if="submitForm.type !== 'webpage'"
              label="作品文件"
              prop="file"
            >
              <div class="upload-area">
                <el-upload
                  ref="uploadRef"
                  :action="uploadAction"
                  :headers="uploadHeaders"
                  :file-list="fileList"
                  :before-upload="beforeUpload"
                  :on-success="onUploadSuccess"
                  :on-error="onUploadError"
                  :on-remove="onFileRemove"
                  :accept="getAcceptTypes(submitForm.type)"
                  :limit="1"
                  list-type="picture-card"
                  class="work-upload"
                >
                  <div class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <div class="upload-text">
                      <p>{{ getUploadText(submitForm.type) }}</p>
                      <p class="upload-hint">{{ getUploadHint(submitForm.type) }}</p>
                    </div>
                  </div>
                </el-upload>
              </div>
        </el-form-item>

            <!-- 网页预览URL输入 -->
            <el-form-item
              v-if="submitForm.type === 'webpage'"
              label="网页链接"
              prop="webpageUrl"
            >
              <el-input
                v-model="submitForm.webpageUrl"
                placeholder="请输入网页链接 (http:// 或 https:// 开头)"
              />
        </el-form-item>

            <!-- 文章内容输入 -->
            <el-form-item
              v-if="submitForm.type === 'article'"
              label="文章内容"
              prop="content"
            >
              <el-input
                v-model="submitForm.content"
                type="textarea"
                :rows="8"
                placeholder="请输入文章内容，支持Markdown格式"
              />
        </el-form-item>

        <el-form-item>
              <el-button type="primary" @click="submitWork" :loading="submitting">
                提交作品
              </el-button>
              <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 我的作品列表 -->
    <el-card class="my-works-card">
      <template #header>
        <div class="card-header">
          <span>我的作品 ({{ myWorks.length }})</span>
          <div class="header-actions">
            <el-radio-group v-model="worksViewType" size="small">
              <el-radio-button value="card">卡片视图</el-radio-button>
              <el-radio-button value="list">列表视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div v-if="myWorks.length === 0" class="empty-works">
        <el-empty description="你还没有提交任何作品，快来上传你的第一个AI作品吧！">
          <template #image>
            <el-icon size="64" class="empty-icon"><Picture /></el-icon>
          </template>
          <el-button type="primary" @click="showSubmitForm = true">开始创作</el-button>
        </el-empty>
      </div>

      <!-- 卡片视图 -->
      <div v-else-if="worksViewType === 'card'" class="works-grid">
        <div
          v-for="work in myWorks"
          :key="work.id"
          class="work-card-item"
          @click="viewWork(work)"
        >
          <div class="work-preview">
            <div v-if="work.type === 'image'" class="image-preview">
              <el-image
                :src="work.thumbnailUrl || work.fileUrl"
                fit="cover"
                class="work-image"
              />
            </div>
            <div v-else-if="work.type === 'video'" class="video-preview">
              <video
                :src="work.fileUrl"
                class="work-video"
                muted
              />
              <div class="play-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div v-else-if="work.type === 'audio'" class="audio-preview">
              <div class="audio-placeholder">
                <el-icon class="audio-icon"><Bell /></el-icon>
                <span>音频作品</span>
              </div>
            </div>
            <div v-else-if="work.type === 'article'" class="article-preview">
              <div class="article-placeholder">
                <el-icon class="article-icon"><Document /></el-icon>
                <span>文章作品</span>
              </div>
            </div>
            <div v-else-if="work.type === 'webpage'" class="webpage-preview">
              <div class="webpage-placeholder">
                <el-icon class="webpage-icon"><Monitor /></el-icon>
                <span>网页作品</span>
              </div>
            </div>
          </div>

          <div class="work-info">
            <h4>{{ work.title }}</h4>
            <p class="work-desc">{{ work.description }}</p>
            <div class="work-meta">
              <el-tag size="small" :type="getTypeTagType(work.type)">
                {{ getTypeLabel(work.type) }}
              </el-tag>
              <span class="work-time">{{ formatTime(work.createTime) }}</span>
            </div>
            <div class="work-status">
              <el-tag
                size="small"
                :type="work.auditStatus === 'approved' ? 'success' : work.auditStatus === 'pending' ? 'warning' : 'danger'"
              >
                {{ getAuditStatusLabel(work.auditStatus) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="works-list">
        <el-table :data="myWorks" stripe>
          <el-table-column label="预览" width="100">
            <template #default="scope">
              <div class="list-preview">
                <div v-if="scope.row.type === 'image'">
                  <el-image
                    :src="scope.row.thumbnailUrl || scope.row.fileUrl"
                    fit="cover"
                    style="width: 60px; height: 45px;"
                  />
                </div>
                <div v-else-if="scope.row.type === 'video'">
                  <video
                    :src="scope.row.fileUrl"
                    style="width: 60px; height: 45px;"
                    muted
                  />
                </div>
                <div v-else class="type-icon">
                  <el-icon style="font-size: 24px;">
                    <component :is="getTypeIcon(scope.row.type)" />
                  </el-icon>
                </div>
            </div>
          </template>
        </el-table-column>
          <el-table-column prop="title" label="作品标题" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="80">
          <template #default="scope">
              <el-tag size="small" :type="getTypeTagType(scope.row.type)">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
          <el-table-column prop="description" label="作品说明" show-overflow-tooltip />
          <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="scope">
              <el-tag
                size="small"
                :type="scope.row.auditStatus === 'approved' ? 'success' : scope.row.auditStatus === 'pending' ? 'warning' : 'danger'"
              >
              {{ getAuditStatusLabel(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="150">
          <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
          </template>
        </el-table-column>
          <el-table-column label="操作" width="120">
          <template #default="scope">
              <el-button link type="primary" @click="viewWork(scope.row)">查看</el-button>
              <el-button
                v-if="scope.row.auditStatus === 'pending'"
                link
                type="warning"
                @click="editWork(scope.row)"
              >
                编辑
              </el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>
    </el-card>

    <!-- 作品详情对话框 -->
    <el-dialog
      :title="currentWork?.title"
      v-model="workDetailOpen"
      width="80%"
      append-to-body
    >
      <div v-if="currentWork" class="work-detail-content">
        <div class="work-meta-info">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="作品类型">
              <el-tag :type="getTypeTagType(currentWork.type)">
                {{ getTypeLabel(currentWork.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag
                :type="currentWork.auditStatus === 'approved' ? 'success' : currentWork.auditStatus === 'pending' ? 'warning' : 'danger'"
              >
                {{ getAuditStatusLabel(currentWork.auditStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatTime(currentWork.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
              </div>

        <div class="work-description" v-if="currentWork.description">
          <h4>作品说明</h4>
          <p>{{ currentWork.description }}</p>
        </div>

        <div class="work-content">
          <div v-if="currentWork.type === 'image'">
            <el-image
              :src="currentWork.fileUrl"
              fit="contain"
              style="max-width: 100%; max-height: 600px;"
              :preview-src-list="[currentWork.fileUrl]"
            />
          </div>
          <div v-else-if="currentWork.type === 'video'">
            <video
              :src="currentWork.fileUrl"
              controls
              style="width: 100%; max-height: 600px;"
            />
          </div>
          <div v-else-if="currentWork.type === 'audio'">
            <audio
              :src="currentWork.fileUrl"
              controls
              style="width: 100%;"
            />
            <div class="audio-waveform">
              <div class="waveform-placeholder">音频可视化展示区域</div>
            </div>
          </div>
          <div v-else-if="currentWork.type === 'article'">
            <div class="article-content" v-html="currentWork.content"></div>
          </div>
          <div v-else-if="currentWork.type === 'webpage'">
            <iframe
              :src="currentWork.webpageUrl"
              style="width: 100%; height: 600px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Plus,
    Picture,
    VideoPlay,
    Bell,
    Document,
    Monitor
  } from '@element-plus/icons-vue'
import { aigcApi } from '@/api/aigc'

// 响应式数据
  const showSubmitForm = ref(false)
  const submitting = ref(false)
  const worksViewType = ref('card')
  const workDetailOpen = ref(false)
  const currentWork = ref(null)
  const uploadRef = ref(null)
  const submitFormRef = ref(null)

// 表单数据
  const submitForm = reactive({
    title: '',
    type: '',
    description: '',
    file: null,
    webpageUrl: '',
    content: ''
  })

  // 文件列表
  const fileList = ref([])

  // 我的作品列表
  const myWorks = ref([
  // 模拟数据
      {
        id: 1,
      title: 'AI生成的科幻小说',
      type: 'article',
      description: '使用GPT-4生成的短篇科幻小说，探讨人工智能与人类的关系',
      content: '<p>在遥远的未来，人工智能已经成为了人类社会的一部分...</p>',
      auditStatus: 'approved',
      createTime: new Date('2024-01-15T10:30:00')
      },
      {
        id: 2,
      title: 'Stable Diffusion生成的艺术作品',
        type: 'image',
      description: '使用Stable Diffusion生成的赛博朋克风格城市景观',
      fileUrl: 'https://via.placeholder.com/800x600?text=AI+Art',
      thumbnailUrl: 'https://via.placeholder.com/300x200?text=AI+Art',
      auditStatus: 'approved',
      createTime: new Date('2024-01-14T14:20:00')
      },
      {
        id: 3,
      title: 'AI创作的背景音乐',
      type: 'audio',
      description: '使用Suno AI生成的轻音乐，适合学习和工作背景',
      fileUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      auditStatus: 'pending',
      createTime: new Date('2024-01-16T09:15:00')
    }
  ])

  // 表单验证规则
  const submitRules = ref({
    title: [
      { required: true, message: '请输入作品标题', trigger: 'blur' }
    ],
    type: [
      { required: true, message: '请选择作品类型', trigger: 'change' }
    ],
    description: [
      { required: true, message: '请输入作品说明', trigger: 'blur' }
    ],
    file: [
      { required: true, message: '请上传作品文件', trigger: 'change' }
    ],
    webpageUrl: [
      { required: true, message: '请输入网页链接', trigger: 'blur' },
      {
        pattern: /^https?:\/\/.+/,
        message: '请输入有效的网页链接',
        trigger: 'blur'
      }
    ],
    content: [
      { required: true, message: '请输入文章内容', trigger: 'blur' }
    ]
  })

  // 上传配置
  const uploadAction = ref('/api/upload/aigc-work')
  const uploadHeaders = ref({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })

  // 提交作品
  const submitWork = async () => {
    try {
      await submitFormRef.value.validate()

      submitting.value = true

      const workData = {
        ...submitForm,
        author: '当前用户', // 从用户信息中获取
        authorId: 1, // 从用户信息中获取
        courseId: 1, // 从当前课程中获取
        auditStatus: 'pending'
      }

      // 模拟提交
      setTimeout(() => {
        const newWork = {
          ...workData,
          id: Date.now(),
          createTime: new Date()
        }

        myWorks.value.unshift(newWork)
        submitting.value = false
        showSubmitForm.value = false
        resetForm()

        ElMessage.success('作品提交成功！等待管理员审核。')
      }, 2000)

    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    submitFormRef.value?.resetFields()
    fileList.value = []
    Object.assign(submitForm, {
    title: '',
    type: '',
      description: '',
      file: null,
      webpageUrl: '',
      content: ''
    })
  }

  // 文件上传相关方法
  const beforeUpload = (file) => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过50MB')
      return false
    }
    return true
  }

  const onUploadSuccess = (response, file) => {
    submitForm.file = response.data
    ElMessage.success('文件上传成功')
  }

  const onUploadError = (error) => {
    ElMessage.error('文件上传失败')
    console.error(error)
  }

  const onFileRemove = (file, fileList) => {
    submitForm.file = null
  }

  // 查看作品
  const viewWork = (work) => {
    currentWork.value = work
    workDetailOpen.value = true
  }

  // 编辑作品
  const editWork = (work) => {
    // TODO: 实现编辑功能
    ElMessage.info('编辑功能开发中...')
  }

  // 工具方法
  const getAcceptTypes = (type) => {
    const acceptMap = {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*',
      article: '.txt,.md,.doc,.docx',
      webpage: '' // 网页不需要文件上传
    }
    return acceptMap[type] || '*/*'
  }

  const getUploadText = (type) => {
    const textMap = {
      image: '上传图片作品',
      video: '上传视频作品',
      audio: '上传音频作品',
      article: '上传文章文件'
    }
    return textMap[type] || '上传文件'
  }

  const getUploadHint = (type) => {
    const hintMap = {
      image: '支持 JPG、PNG、GIF 等图片格式',
      video: '支持 MP4、AVI、MOV 等视频格式',
      audio: '支持 MP3、WAV、FLAC 等音频格式',
      article: '支持 TXT、MD、DOC 等文本格式'
    }
    return hintMap[type] || '请选择要上传的文件'
  }

  const getTypeIcon = (type) => {
    const iconMap = {
      image: 'Picture',
      video: 'VideoPlay',
      audio: 'Bell',
      article: 'Document',
      webpage: 'Monitor'
    }
    return iconMap[type] || 'Document'
  }

const getTypeTagType = (type) => {
  const typeMap = {
    image: 'primary',
    video: 'success',
    audio: 'warning',
    article: 'info',
    webpage: 'danger'
  }
  return typeMap[type] || 'primary'
}

const getTypeLabel = (type) => {
  const typeMap = {
    image: '图片',
    video: '视频',
    audio: '音频',
    article: '文章',
    webpage: '网页预览'
  }
  return typeMap[type] || type
}

const getAuditStatusLabel = (status) => {
  const statusMap = {
      pending: '审核中',
      approved: '已通过',
      rejected: '已拒绝'
  }
  return statusMap[status] || status
}

  const formatTime = (time) => {
    if (!time) return ''
    return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/aigc/works/index.vue`);
    // 加载用户作品数据
    ElMessage.success('作品数据加载完成')
})
</script>

<style lang="scss" scoped>
  .aigc-works-container {
    padding: 20px;

    .page-header {
      margin-bottom: 30px;

      h2 {
        color: #333;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .submit-card, .my-works-card {
      margin-bottom: 30px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 10px;
        }
      }
    }

    .submit-form {
      .upload-area {
        .work-upload {
          :deep(.el-upload--picture-card) {
            width: 120px;
            height: 120px;
          }
        }

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
      }
    }

    .empty-works {
  text-align: center;
      padding: 60px 0;

      .empty-icon {
        color: #c0c4cc;
        margin-bottom: 20px;
      }
    }

    .works-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;

      .work-card-item {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .work-preview {
          height: 180px;
          overflow: hidden;
          position: relative;

          .work-image, .work-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .play-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;

            .play-icon {
              color: white;
              font-size: 24px;
            }
          }

          .audio-placeholder,
          .article-placeholder,
          .webpage-placeholder {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            color: #666;

            .audio-icon,
            .article-icon,
            .webpage-icon {
              font-size: 32px;
              margin-bottom: 8px;
            }

            span {
              font-size: 14px;
            }
          }
        }

        .work-info {
          padding: 16px;

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .work-desc {
            margin: 0 0 12px 0;
            font-size: 12px;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .work-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .work-time {
            font-size: 12px;
            color: #999;
          }

          .work-status {
            text-align: right;
          }
        }
      }
    }

    .works-list {
      .list-preview {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .type-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
      }
    }

    .work-detail-content {
      max-height: 80vh;
      overflow-y: auto;

      .work-meta-info {
        margin-bottom: 20px;
      }

      .work-description {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
        }

        p {
          margin: 0;
          color: #606266;
          line-height: 1.6;
        }
      }

      .work-content {
        text-align: center;

.article-content {
  text-align: left;
          line-height: 1.8;
  padding: 20px;
          background: #fff;
          border: 1px solid #eee;
  border-radius: 4px;
          max-height: 400px;
          overflow-y: auto;
        }

        .audio-waveform {
          margin-top: 20px;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 4px;

          .waveform-placeholder {
            height: 100px;
            background: linear-gradient(to right, #409eff, #67c23a, #e6a23c, #f56c6c);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          }
        }
      }
    }
}
</style>