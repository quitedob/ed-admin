<template>
  <div class="course-resource-viewer">
    <!-- 视频内容 -->
    <div v-if="section.contentUrl" class="resource-section video-section">
      <div class="section-header">
        <el-icon><VideoPlay /></el-icon>
        <span>视频课程</span>
      </div>
      <div class="video-container">
        <video
          v-if="isVideoUrl(section.contentUrl)"
          :src="section.contentUrl"
          controls
          class="video-player"
        ></video>
        <div v-else class="video-placeholder">
          <el-icon :size="48"><VideoPlay /></el-icon>
          <p>视频地址：{{ section.contentUrl }}</p>
          <el-button type="primary" @click="openVideo(section.contentUrl)">
            播放视频
          </el-button>
        </div>
      </div>
      <div v-if="section.duration" class="video-duration">
        时长：{{ formatDuration(section.duration) }}
      </div>
    </div>

    <!-- 文本内容 -->
    <div v-if="section.textContent" class="resource-section text-section">
      <div class="section-header">
        <el-icon><Document /></el-icon>
        <span>课程内容</span>
      </div>
      <div class="text-content" v-html="formatTextContent(section.textContent)"></div>
    </div>

    <!-- PDF文档 -->
    <div v-if="section.pdfUrl" class="resource-section pdf-section">
      <div class="section-header">
        <el-icon><Document /></el-icon>
        <span>PDF文档</span>
        <span v-if="section.pdfFileName" class="file-name">{{ section.pdfFileName }}</span>
      </div>
      <div class="pdf-container">
        <iframe
          v-if="canEmbedPdf"
          :src="section.pdfUrl"
          class="pdf-viewer"
        ></iframe>
        <div v-else class="pdf-placeholder">
          <el-icon :size="48"><Document /></el-icon>
          <p>{{ section.pdfFileName || 'PDF文档' }}</p>
          <el-button type="primary" @click="openPdf(section.pdfUrl)">
            查看PDF
          </el-button>
          <el-button @click="downloadPdf(section.pdfUrl)">
            下载PDF
          </el-button>
        </div>
      </div>
    </div>

    <!-- 图片内容 -->
    <div v-if="hasImages" class="resource-section image-section">
      <div class="section-header">
        <el-icon><Picture /></el-icon>
        <span>图片资料</span>
      </div>
      <div class="image-gallery">
        <el-image
          v-for="(img, index) in getImages()"
          :key="img.id || index"
          :src="img.url"
          :alt="img.alt || img.title"
          :preview-src-list="getImageUrls()"
          :initial-index="index"
          fit="cover"
          class="gallery-image"
        >
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </div>

    <!-- 课程作业 -->
    <div v-if="section.hasHomework || section.homeworkId" class="resource-section homework-section">
      <div class="section-header">
        <el-icon><EditPen /></el-icon>
        <span>课程作业</span>
        <el-tag v-if="section.homeworkProgress?.submitted" type="success" size="small">已提交</el-tag>
        <el-tag v-else type="warning" size="small">未提交</el-tag>
      </div>
      
      <div class="homework-card">
        <div class="homework-info">
          <h4>{{ section.homeworkTitle || section.homeworkData?.title || '章节作业' }}</h4>
          <p v-if="section.homeworkData?.description">{{ section.homeworkData.description }}</p>
        </div>
        
        <!-- 作业进度 -->
        <div v-if="section.homeworkProgress" class="homework-progress">
          <div class="progress-item">
            <span class="label">得分：</span>
            <span class="value">{{ section.homeworkProgress.score }} / {{ section.homeworkProgress.maxScore }}</span>
          </div>
          <el-progress
            :percentage="section.homeworkProgress.percentage || 0"
            :status="getProgressStatus(section.homeworkProgress)"
          />
        </div>

        <!-- 作业题目列表 -->
        <div v-if="section.homeworkData?.questions?.length" class="homework-questions">
          <div class="questions-header">
            <span>题目列表（共 {{ section.homeworkData.questions.length }} 题）</span>
            <el-button type="primary" size="small" @click="startHomework">
              {{ section.homeworkProgress?.submitted ? '查看作业' : '开始作业' }}
            </el-button>
          </div>
          
          <div class="questions-preview">
            <div
              v-for="(question, index) in section.homeworkData.questions.slice(0, 3)"
              :key="question.id || index"
              class="question-preview-item"
            >
              <span class="question-number">{{ index + 1 }}.</span>
              <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                {{ getQuestionTypeLabel(question.type) }}
              </el-tag>
              <span class="question-text">{{ truncateText(question.questionText || question.content, 50) }}</span>
              <span class="question-score">{{ question.score || 5 }}分</span>
            </div>
            <div v-if="section.homeworkData.questions.length > 3" class="more-questions">
              还有 {{ section.homeworkData.questions.length - 3 }} 道题目...
            </div>
          </div>
        </div>

        <!-- 直接关联的题目ID -->
        <div v-else-if="section.questionIds" class="linked-questions">
          <div class="questions-header">
            <span>关联题目</span>
          </div>
          <div class="question-ids">
            <el-tag
              v-for="qid in parseQuestionIds(section.questionIds)"
              :key="qid"
              size="small"
              type="info"
            >
              {{ qid }}
            </el-tag>
          </div>
        </div>

        <div class="homework-actions">
          <el-button type="primary" @click="startHomework">
            <el-icon><EditPen /></el-icon>
            {{ section.homeworkProgress?.submitted ? '查看详情' : '开始作业' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 练习题 -->
    <div v-if="section.practice && section.practice.questions > 0" class="resource-section practice-section">
      <div class="section-header">
        <el-icon><List /></el-icon>
        <span>课后练习</span>
        <el-tag type="warning" size="small">{{ section.practice.questions }}道题</el-tag>
        <el-tag v-if="section.practice.optional" type="info" size="small">选做</el-tag>
      </div>
      <div class="practice-card">
        <p>本节包含 {{ section.practice.questions }} 道练习题，完成练习可以巩固所学知识。</p>
        <el-button type="primary" @click="startPractice">
          <el-icon><EditPen /></el-icon>
          开始练习
        </el-button>
      </div>
    </div>

    <!-- 编程练习 -->
    <div v-if="section.programming" class="resource-section programming-section">
      <div class="section-header">
        <el-icon><Monitor /></el-icon>
        <span>编程练习</span>
        <el-tag type="danger" size="small">{{ section.programming.language }}</el-tag>
      </div>
      <div class="programming-card">
        <div v-if="section.programming.description" class="programming-desc">
          {{ section.programming.description }}
        </div>
        <div v-if="section.programming.codeExample" class="code-example">
          <div class="code-header">示例代码</div>
          <pre><code>{{ section.programming.codeExample }}</code></pre>
        </div>
        <div class="programming-actions">
          <el-button v-if="section.programming.enableEditor" type="primary" @click="openCodeEditor">
            <el-icon><Edit /></el-icon>
            打开编辑器
          </el-button>
          <el-button v-if="section.programming.enableHOJ" type="success" @click="goToHOJ">
            <el-icon><Monitor /></el-icon>
            前往OJ系统
          </el-button>
        </div>
      </div>
    </div>

    <!-- 学习资料 -->
    <div v-if="hasMaterials" class="resource-section materials-section">
      <div class="section-header">
        <el-icon><Folder /></el-icon>
        <span>学习资料</span>
      </div>
      <div class="materials-list">
        <div
          v-for="material in section.resources?.materials"
          :key="material.id"
          class="material-item"
        >
          <el-icon><Document /></el-icon>
          <span class="material-title">{{ material.title }}</span>
          <el-button size="small" text type="primary" @click="downloadMaterial(material)">
            下载
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="isEmpty" class="empty-content">
      <el-empty description="暂无课程内容" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  VideoPlay, Document, Picture, EditPen, List, Monitor,
  Edit, Folder, Loading
} from '@element-plus/icons-vue'

const props = defineProps({
  section: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['start-homework', 'start-practice', 'open-editor', 'go-hoj'])

// 计算属性
const hasImages = computed(() => {
  if (props.section.images?.length > 0) return true
  const materials = props.section.resources?.materials || []
  return materials.some(m => m.type === 'image' && m.images?.length > 0)
})

const hasMaterials = computed(() => {
  const materials = props.section.resources?.materials || []
  return materials.some(m => m.type !== 'image')
})

const canEmbedPdf = computed(() => {
  // 检查是否可以嵌入PDF（某些浏览器可能不支持）
  return true
})

const isEmpty = computed(() => {
  return !props.section.contentUrl &&
         !props.section.textContent &&
         !props.section.pdfUrl &&
         !hasImages.value &&
         !props.section.hasHomework &&
         !props.section.homeworkId &&
         !props.section.practice?.questions &&
         !props.section.programming
})

// 方法
const isVideoUrl = (url) => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

const formatDuration = (seconds) => {
  if (!seconds) return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分${secs}秒`
}

const formatTextContent = (content) => {
  if (!content) return ''
  // 简单的文本格式化，支持换行
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
}

const getImages = () => {
  if (props.section.images?.length > 0) {
    return props.section.images
  }
  const materials = props.section.resources?.materials || []
  const imageMaterial = materials.find(m => m.type === 'image')
  return imageMaterial?.images || []
}

const getImageUrls = () => {
  return getImages().map(img => img.url)
}

const openVideo = (url) => {
  window.open(url, '_blank')
}

const openPdf = (url) => {
  window.open(url, '_blank')
}

const downloadPdf = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = props.section.pdfFileName || 'document.pdf'
  link.click()
}

const downloadMaterial = (material) => {
  ElMessage.info(`下载资料：${material.title}`)
}

const getProgressStatus = (progress) => {
  if (!progress) return ''
  const percentage = progress.percentage || (progress.score / progress.maxScore * 100)
  if (percentage >= 80) return 'success'
  if (percentage >= 60) return 'warning'
  return 'exception'
}

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    essay: '',
    programming: 'danger',
    oj: 'danger'
  }
  return colorMap[type] || 'info'
}

const getQuestionTypeLabel = (type) => {
  const labelMap = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    essay: '简答',
    programming: '编程',
    oj: 'OJ'
  }
  return labelMap[type] || type
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  // 移除HTML标签
  const plainText = text.replace(/<[^>]*>/g, '')
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength) + '...'
}

const parseQuestionIds = (ids) => {
  if (!ids) return []
  return ids.split(/[,，]/).map(id => id.trim()).filter(id => id)
}

const startHomework = () => {
  emit('start-homework', props.section)
}

const startPractice = () => {
  emit('start-practice', props.section)
}

const openCodeEditor = () => {
  emit('open-editor', props.section)
}

const goToHOJ = () => {
  emit('go-hoj', props.section)
}
</script>


<style lang="scss" scoped>
.course-resource-viewer {
  padding: 16px;
}

.resource-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      color: #409eff;
    }

    .file-name {
      font-size: 14px;
      font-weight: normal;
      color: #909399;
      margin-left: auto;
    }
  }
}

// 视频部分
.video-section {
  .video-container {
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  .video-player {
    width: 100%;
    max-height: 500px;
  }

  .video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #fff;

    .el-icon {
      margin-bottom: 16px;
      opacity: 0.8;
    }

    p {
      margin-bottom: 16px;
      font-size: 14px;
      opacity: 0.7;
    }
  }

  .video-duration {
    margin-top: 12px;
    font-size: 14px;
    color: #909399;
  }
}

// 文本内容
.text-section {
  .text-content {
    line-height: 1.8;
    font-size: 15px;
    color: #606266;

    :deep(strong) {
      color: #303133;
    }

    :deep(em) {
      color: #409eff;
    }
  }
}

// PDF部分
.pdf-section {
  .pdf-container {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
  }

  .pdf-viewer {
    width: 100%;
    height: 600px;
    border: none;
  }

  .pdf-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: #f5f7fa;

    .el-icon {
      color: #909399;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 16px;
      font-size: 14px;
      color: #606266;
    }

    .el-button {
      margin: 0 8px;
    }
  }
}

// 图片部分
.image-section {
  .image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .gallery-image {
    width: 100%;
    height: 150px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.02);
    }
  }

  .image-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
  }
}

// 作业部分
.homework-section {
  .homework-card {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 20px;
  }

  .homework-info {
    margin-bottom: 16px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
    }
  }

  .homework-progress {
    margin-bottom: 16px;
    padding: 12px;
    background: #fff;
    border-radius: 6px;

    .progress-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .label {
        color: #909399;
      }

      .value {
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .homework-questions {
    margin-bottom: 16px;

    .questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }

    .questions-preview {
      background: #fff;
      border-radius: 6px;
      padding: 12px;
    }

    .question-preview-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .question-number {
        font-weight: 600;
        color: #409eff;
        min-width: 24px;
      }

      .question-text {
        flex: 1;
        font-size: 14px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .question-score {
        font-size: 13px;
        color: #67c23a;
        font-weight: 500;
      }
    }

    .more-questions {
      padding: 8px 0;
      text-align: center;
      font-size: 13px;
      color: #909399;
    }
  }

  .linked-questions {
    margin-bottom: 16px;

    .questions-header {
      margin-bottom: 12px;
      font-size: 14px;
      color: #606266;
    }

    .question-ids {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .homework-actions {
    text-align: center;
  }
}

// 练习部分
.practice-section {
  .practice-card {
    background: #fdf6ec;
    border-radius: 8px;
    padding: 20px;
    text-align: center;

    p {
      margin: 0 0 16px 0;
      color: #e6a23c;
    }
  }
}

// 编程部分
.programming-section {
  .programming-card {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 20px;
    color: #d4d4d4;
  }

  .programming-desc {
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .code-example {
    margin-bottom: 16px;

    .code-header {
      font-size: 12px;
      color: #808080;
      margin-bottom: 8px;
    }

    pre {
      background: #2d2d2d;
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      margin: 0;

      code {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }

  .programming-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

// 学习资料
.materials-section {
  .materials-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .material-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    .el-icon {
      color: #409eff;
    }

    .material-title {
      flex: 1;
      font-size: 14px;
      color: #606266;
    }
  }
}

// 空状态
.empty-content {
  padding: 40px 0;
}
</style>
