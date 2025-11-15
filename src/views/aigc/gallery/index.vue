<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>AIGC作品墙</span>
          <div class="header-controls">
            <el-select v-model="currentCourseId" placeholder="选择课程" @change="handleCourseChange" style="margin-right: 10px;">
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
            <el-button @click="toggleView">
              <el-icon><component :is="viewType === 'grid' ? 'List' : 'Grid'" /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section" v-if="statsData">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="作品总数" :value="statsData.total" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="图片作品" :value="statsData.imageCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="视频作品" :value="statsData.videoCount" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="参与学生" :value="statsData.studentCount" />
          </el-col>
        </el-row>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :model="filterParams" :inline="true">
          <el-form-item label="作品类型">
            <el-select v-model="filterParams.type" placeholder="全部类型" clearable @change="handleFilter">
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
              <el-option label="文章" value="article" />
              <el-option label="网页预览" value="webpage" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="filterParams.auditStatus" placeholder="全部状态" clearable @change="handleFilter">
              <el-option label="审核通过" value="approved" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 作品展示区域 -->
      <div class="gallery-container" v-loading="loading">
        <!-- 网格视图 -->
        <div v-if="viewType === 'grid'" class="grid-view">
          <el-row :gutter="20">
            <el-col
              v-for="work in filteredWorks"
              :key="work.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              class="work-item-col"
            >
              <el-card class="work-card" :body-style="{ padding: '0px' }" @click="handlePreview(work)">
                <div class="work-preview">
                  <div v-if="work.type === 'image'" class="image-preview">
                    <el-image
                      :src="work.thumbnailUrl || work.fileUrl"
                      fit="cover"
                      class="work-thumbnail"
                    />
                  </div>
                  <div v-else-if="work.type === 'video'" class="video-preview">
                    <video
                      :src="work.fileUrl"
                      class="work-thumbnail"
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
                  <h4 class="work-title">{{ work.title }}</h4>
                  <p class="work-author">作者：{{ work.author }}</p>
                  <p class="work-desc">{{ work.description }}</p>
                  <div class="work-meta">
                    <el-tag size="small" :type="getTypeTagType(work.type)">
                      {{ getTypeLabel(work.type) }}
                    </el-tag>
                    <span class="work-time">{{ formatTime(work.createTime) }}</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-table :data="filteredWorks" stripe>
            <el-table-column label="预览" width="120">
              <template #default="scope">
                <div class="list-preview">
                  <div v-if="scope.row.type === 'image'">
                    <el-image
                      :src="scope.row.thumbnailUrl || scope.row.fileUrl"
                      fit="cover"
                      style="width: 80px; height: 60px;"
                    />
                  </div>
                  <div v-else-if="scope.row.type === 'video'">
                    <video
                      :src="scope.row.fileUrl"
                      style="width: 80px; height: 60px;"
                      muted
                    />
                  </div>
                  <div v-else class="type-icon">
                    <el-icon style="font-size: 30px;">
                      <component :is="getTypeIcon(scope.row.type)" />
                    </el-icon>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="作品标题" show-overflow-tooltip />
            <el-table-column prop="author" label="作者" width="100" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="scope">
                <el-tag size="small" :type="getTypeTagType(scope.row.type)">
                  {{ getTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="作品说明" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="150">
              <template #default="scope">
                {{ formatTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button link type="primary" @click.stop="handlePreview(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredWorks.length === 0" description="暂无作品数据" />
      </div>
    </el-card>

    <!-- 作品预览对话框 -->
    <el-dialog
      :title="previewWork?.title"
      v-model="previewOpen"
      width="80%"
      append-to-body
      destroy-on-close
    >
      <div v-if="previewWork" class="preview-dialog-content">
        <div class="preview-meta">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="作者">{{ previewWork.author }}</el-descriptions-item>
            <el-descriptions-item label="作品类型">
              <el-tag :type="getTypeTagType(previewWork.type)">
                {{ getTypeLabel(previewWork.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatTime(previewWork.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="preview-description" v-if="previewWork.description">
          <h4>作品说明</h4>
          <p>{{ previewWork.description }}</p>
        </div>

        <div class="preview-content">
          <div v-if="previewWork.type === 'image'">
            <el-image
              :src="previewWork.fileUrl"
              fit="contain"
              style="max-width: 100%; max-height: 600px;"
              :preview-src-list="[previewWork.fileUrl]"
            />
          </div>
          <div v-else-if="previewWork.type === 'video'">
            <video
              :src="previewWork.fileUrl"
              controls
              style="width: 100%; max-height: 600px;"
            />
          </div>
          <div v-else-if="previewWork.type === 'audio'">
            <audio
              :src="previewWork.fileUrl"
              controls
              style="width: 100%;"
            />
            <div class="audio-waveform">
              <div class="waveform-placeholder">音频可视化展示区域</div>
            </div>
          </div>
          <div v-else-if="previewWork.type === 'article'">
            <div class="article-content" v-html="previewWork.content"></div>
          </div>
          <div v-else-if="previewWork.type === 'webpage'">
            <iframe
              :src="previewWork.webpageUrl"
              style="width: 100%; height: 600px; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="AIGCGallery">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { List, Grid, VideoPlay, Bell, Document, Monitor, Picture } from '@element-plus/icons-vue'
import { aigcApi } from '@/api/aigc'

// 响应式数据
const loading = ref(true)
const currentCourseId = ref(null)
const viewType = ref('grid') // grid | list
const previewOpen = ref(false)
const previewWork = ref(null)

// 课程列表
const courseList = ref([
  { id: 1, name: 'Python基础课程' },
  { id: 2, name: 'Web开发课程' },
  { id: 3, name: '数据结构课程' }
])

// 作品列表
const worksList = ref([])

// 统计数据
const statsData = ref(null)

// 筛选参数
const filterParams = ref({
  type: '',
  auditStatus: 'approved'
})

// 筛选后的作品列表
const filteredWorks = computed(() => {
  let result = worksList.value

  if (filterParams.value.type) {
    result = result.filter(work => work.type === filterParams.value.type)
  }

  if (filterParams.value.auditStatus) {
    result = result.filter(work => work.auditStatus === filterParams.value.auditStatus)
  }

  return result
})

// 获取作品列表
const getWorksList = () => {
  if (!currentCourseId.value) return

  loading.value = true
  aigcApi.worksByCourse(currentCourseId.value).then(response => {
    worksList.value = response.data || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 获取统计数据
const getStatsData = () => {
  if (!currentCourseId.value) return

  aigcApi.worksStats({ courseId: currentCourseId.value }).then(response => {
    statsData.value = response.data
  })
}

// 课程切换
const handleCourseChange = (courseId) => {
  getWorksList()
  getStatsData()
}

// 筛选条件变化
const handleFilter = () => {
  // 筛选逻辑已在computed中实现
}

// 切换视图类型
const toggleView = () => {
  viewType.value = viewType.value === 'grid' ? 'list' : 'grid'
}

// 预览作品
const handlePreview = (work) => {
  previewWork.value = work
  previewOpen.value = true
}

// 获取类型图标
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

// 获取类型标签颜色
const getTypeTagType = (type) => {
  const typeMap = {
    image: '',
    video: 'success',
    audio: 'warning',
    article: 'info',
    webpage: 'danger'
  }
  return typeMap[type] || ''
}

// 获取类型标签文本
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

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  // 默认选择第一个课程
  if (courseList.value.length > 0) {
    currentCourseId.value = courseList.value[0].id
    getWorksList()
    getStatsData()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.header-controls {
  display: flex;
  align-items: center;
}

.stats-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.gallery-container {
  min-height: 400px;
}

/* 网格视图样式 */
.grid-view .work-item-col {
  margin-bottom: 20px;
}

.work-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.work-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.work-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  color: white;
  font-size: 24px;
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
}

.audio-icon,
.article-icon,
.webpage-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.work-info {
  padding: 15px;
}

.work-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-author {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.work-desc {
  margin: 0 0 10px 0;
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
}

.work-time {
  font-size: 12px;
  color: #999;
}

/* 列表视图样式 */
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

/* 预览对话框样式 */
.preview-dialog-content {
  max-height: 80vh;
  overflow-y: auto;
}

.preview-meta {
  margin-bottom: 20px;
}

.preview-description {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-description h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.preview-content {
  text-align: center;
}

.article-content {
  text-align: left;
  line-height: 1.8;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
}

.audio-waveform {
  margin-top: 20px;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 4px;
}

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
</style>