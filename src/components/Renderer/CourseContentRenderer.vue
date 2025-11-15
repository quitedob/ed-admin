<template>
  <div class="course-content-renderer">
    <!-- 课程基础信息 -->
    <el-card class="course-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>{{ courseData.basicInfo?.title }}</h2>
          <el-tag :type="getStatusType(courseData.schedule?.publishStatus)">
            {{ getStatusText(courseData.schedule?.publishStatus) }}
          </el-tag>
        </div>
      </template>

      <div class="course-meta">
        <div class="meta-item">
          <span class="label">教师：</span>
          <span>{{ courseData.basicInfo?.teacher?.name }}</span>
        </div>
        <div class="meta-item">
          <span class="label">课时：</span>
          <span>{{ courseData.basicInfo?.duration }} 学时</span>
        </div>
        <div class="meta-item">
          <span class="label">难度：</span>
          <el-tag size="small">{{ getLevelText(courseData.basicInfo?.level) }}</el-tag>
        </div>
      </div>

      <div class="course-description">
        {{ courseData.basicInfo?.description }}
      </div>
    </el-card>

    <!-- 章节列表 -->
    <div class="chapters-section">
      <h3>课程大纲</h3>
      <el-collapse v-model="activeChapters" accordion>
        <el-collapse-item
          v-for="chapter in courseData.chapters"
          :key="chapter.id"
          :name="chapter.id"
        >
          <template #title>
            <div class="chapter-title">
              <span class="chapter-number">第{{ chapter.number }}章</span>
              <span class="chapter-name">{{ chapter.title }}</span>
            </div>
          </template>

          <!-- 小节列表 -->
          <div class="sections-list">
            <div
              v-for="section in chapter.sections"
              :key="section.id"
              class="section-item"
              @click="handleSectionClick(section)"
            >
              <div class="section-header">
                <el-icon class="section-icon">
                  <VideoPlay v-if="section.contentType === 'video'" />
                  <Document v-else-if="section.contentType === 'document'" />
                  <Picture v-else-if="section.contentType === 'image'" />
                </el-icon>
                <span class="section-number">{{ section.number }}</span>
                <span class="section-title">{{ section.title }}</span>
              </div>

              <div class="section-meta">
                <span v-if="section.duration" class="duration">
                  {{ formatDuration(section.duration) }}
                </span>
                <el-tag
                  v-if="section.practice?.questions"
                  size="small"
                  type="warning"
                >
                  {{ section.practice.questions }} 道练习题
                </el-tag>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 资源渲染区域 -->
    <div v-if="currentSection" class="resource-viewer">
      <div class="viewer-header">
        <h3>{{ currentSection.title }}</h3>
        <el-button @click="currentSection = null">关闭</el-button>
      </div>

      <!-- 视频播放器 -->
      <div v-if="currentSection.contentType === 'video'" class="video-player">
        <video
          :src="currentSection.contentUrl"
          controls
          controlsList="nodownload"
          style="width: 100%; max-height: 500px;"
        ></video>
      </div>

      <!-- PDF查看器 -->
      <div v-else-if="currentSection.contentType === 'document'" class="pdf-viewer">
        <iframe
          :src="`${currentSection.contentUrl}#view=FitH`"
          style="width: 100%; height: 600px; border: none;"
        ></iframe>
      </div>

      <!-- 图片展示 -->
      <div v-else-if="currentSection.contentType === 'image'" class="image-viewer">
        <div v-if="currentSection.resources?.materials" class="image-gallery">
          <el-image
            v-for="material in currentSection.resources.materials.filter(m => m.type === 'image')"
            :key="material.id"
            :src="material.url"
            :preview-src-list="getImageList(currentSection.resources.materials)"
            fit="contain"
            class="gallery-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 资源下载列表 -->
      <div v-if="currentSection.resources?.materials?.length" class="materials-list">
        <h4>课程资料</h4>
        <div
          v-for="material in currentSection.resources.materials"
          :key="material.id"
          class="material-item"
        >
          <el-icon><Document /></el-icon>
          <span>{{ material.title }}</span>
          <el-button
            type="primary"
            size="small"
            @click="downloadResource(material.url)"
          >
            下载
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { VideoPlay, Document, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  courseData: {
    type: Object,
    required: true
  }
})

const activeChapters = ref([])
const currentSection = ref(null)

const handleSectionClick = (section) => {
  currentSection.value = section
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes} 分钟`
}

const getImageList = (materials) => {
  return materials
    .filter(m => m.type === 'image')
    .flatMap(m => m.images?.map(img => img.url) || [])
}

const downloadResource = (url) => {
  window.open(url, '_blank')
}

const getStatusType = (status) => {
  const typeMap = {
    'published': 'success',
    'draft': 'info',
    'unpublished': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'published': '已发布',
    'draft': '草稿',
    'unpublished': '已下架'
  }
  return textMap[status] || status
}

const getLevelText = (level) => {
  const textMap = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return textMap[level] || level
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/CourseContentRenderer.vue`);
  });

</script>

<style scoped>
.course-content-renderer {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
}

.course-info-card {
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
}

.course-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.course-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.chapters-section {
  background-color: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
}

.chapters-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 600;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chapter-number {
  color: var(--color-primary-500);
  font-weight: 600;
}

.sections-list {
  padding: var(--spacing-sm) 0;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition);
}

.section-item:hover {
  background-color: var(--color-primary-50);
  transform: translateX(4px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-icon {
  color: var(--color-primary-500);
  font-size: 20px;
}

.section-number {
  color: var(--color-text-tertiary);
  min-width: 40px;
}

.section-title {
  color: var(--color-text-primary);
  font-weight: 500;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.duration {
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.resource-viewer {
  margin-top: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.viewer-header h3 {
  margin: 0;
  color: var(--color-text-primary);
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.gallery-image {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-base);
  overflow: hidden;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);
}

.materials-list {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.materials-list h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.material-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-sm);
}

.material-item span {
  flex: 1;
  color: var(--color-text-primary);
}
</style>