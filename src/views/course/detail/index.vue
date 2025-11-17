<template>
  <div class="app-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回课程列表</el-button>
    </div>

    <!-- 课程基本信息 -->
    <div class="course-header">
      <div class="course-info">
        <div class="course-logo">
          <img :src="courseInfo.basicInfo?.cover" :alt="courseInfo.basicInfo?.title" />
        </div>
        <div class="course-details">
          <h1>{{ courseInfo.basicInfo?.title }}</h1>
          <div class="course-meta">
            <span class="lecturer">讲师：{{ courseInfo.basicInfo?.teacher?.name }}</span>
            <span class="level">难度：{{ getLevelText(courseInfo.basicInfo?.level) }}</span>
            <span class="duration">时长：{{ courseInfo.basicInfo?.duration }}小时</span>
            <span class="status">
              <el-tag :type="getStatusType(courseInfo.schedule?.publishStatus)">
                {{ getStatusText(courseInfo.schedule?.publishStatus) }}
              </el-tag>
            </span>
          </div>
          <div class="course-tags">
            <el-tag
              v-for="tag in courseInfo.basicInfo?.tags"
              :key="tag"
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="course-schedule">
            <span>开始时间：{{ courseInfo.schedule?.startDate }}</span>
            <span>结束时间：{{ courseInfo.schedule?.endDate }}</span>
          </div>
        </div>
      </div>
      <div class="course-actions">
        <el-button type="primary" @click="editCourse">编辑课程</el-button>
      </div>
    </div>

    <!-- 课程描述 -->
    <div class="course-description">
      <h3>课程描述</h3>
      <p>{{ courseInfo.basicInfo?.description }}</p>
    </div>

    <!-- 元数据信息 -->
    <div class="metadata-section">
      <h3>元数据信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程ID">{{ courseInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ courseInfo.metadata?.version }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(courseInfo.metadata?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(courseInfo.metadata?.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ courseInfo.metadata?.createdBy }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="学习人数" :value="courseInfo.countStudy || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="完成率" :value="courseInfo.completionRate || 0" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均评分" :value="courseInfo.avgRating || 0" suffix="分" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="章节数量" :value="courseInfo.chapters?.length || 0" />
        </el-col>
      </el-row>
    </div>

    <!-- 标签页内容 -->
    <el-tabs v-model="activeTab" class="course-tabs">

      <!-- 章节内容 - 使用渲染器组件 -->
      <el-tab-pane label="章节内容" name="chapters">
        <div class="chapters-content">
          <div class="chapter-actions">
            <el-button type="primary" @click="manageChapters">管理章节</el-button>
            <el-button @click="toggleViewMode">
              {{ viewMode === 'renderer' ? '切换到列表视图' : '切换到预览视图' }}
            </el-button>
          </div>

          <!-- 渲染器视图 -->
          <div v-if="viewMode === 'renderer' && chapters.length > 0">
            <CourseContentRenderer :course-data="courseInfo" />
          </div>

          <!-- 列表视图 -->
          <div v-else-if="viewMode === 'list' && chapters.length > 0" class="chapter-list">
            <el-collapse v-model="activeChapters" accordion>
              <el-collapse-item
                v-for="chapter in chapters"
                :key="chapter.id"
                :title="chapter.title"
                :name="chapter.id"
              >
                <div class="chapter-info">
                  <p>{{ chapter.description }}</p>
                </div>
                <div class="section-list">
                  <div
                    v-for="section in chapter.sections"
                    :key="section.id"
                    class="section-item"
                  >
                    <div class="section-info">
                      <span class="section-index">{{ section.number }}.</span>
                      <span class="section-name">{{ section.title }}</span>
                      <el-tag size="small" effect="plain">
                        {{ getContentTypeText(section.contentType) }}
                      </el-tag>
                      <span v-if="section.duration" class="section-duration">
                        时长：{{ formatTime(section.duration) }}
                      </span>
                    </div>
                    <div class="section-resources">
                      <div v-if="section.resources?.materials?.length > 0" class="resource-list">
                        <span class="resource-title">学习资料：</span>
                        <el-tag
                          v-for="material in section.resources.materials"
                          :key="material.id"
                          size="small"
                          type="info"
                          class="resource-tag"
                        >
                          {{ material.title }}
                        </el-tag>
                      </div>
                      <div v-if="section.practice" class="practice-info">
                        <el-tag size="small" type="warning">
                          练习题：{{ section.practice.questions }}道
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          <el-empty v-else description="暂无章节内容" />
        </div>
      </el-tab-pane>

      <!-- 学习数据 -->
      <el-tab-pane label="学习数据" name="data">
        <div class="data-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="chart-card">
                <h3>学习进度趋势</h3>
                <div class="chart-placeholder">
                  <el-empty description="学习进度趋势图表" />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-card">
                <h3>完成率分布</h3>
                <div class="chart-placeholder">
                  <el-empty description="完成率分布图表" />
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="data-table">
            <h3>学习详情</h3>
            <el-table :data="studyData" stripe>
              <el-table-column label="学员姓名" prop="studentName" />
              <el-table-column label="学习进度" prop="progress" width="120">
                <template #default="scope">
                  <el-progress :percentage="scope.row.progress" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="完成章节" prop="completedChapters" width="100" />
              <el-table-column label="总章节" prop="totalChapters" width="100" />
              <el-table-column label="学习时长" prop="studyTime" width="120" />
              <el-table-column label="最后学习" prop="lastStudyTime" width="180">
                <template #default="scope">
                  {{ parseTime(scope.row.lastStudyTime) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { parseTime, formatTime } from '@/utils'
import CourseContentRenderer from '@/components/Renderer/CourseContentRenderer.vue'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 响应式数据
const activeTab = ref('chapters')
const activeChapters = ref([])
const courseInfo = ref({})
const chapters = ref([])
const studyData = ref([])
const viewMode = ref('renderer') // 'renderer' or 'list'

// 获取课程详情
const getCourseDetail = () => {
  const courseId = route.query.courseId
  if (!courseId) {
    proxy.$message.error('缺少课程ID参数')
    return
  }

  // 使用模拟数据
  import('@/utils/mockData').then(({ mockApi }) => {
    mockApi.getCourseDetail(courseId).then(course => {
      courseInfo.value = course || {}
      chapters.value = course.chapters || []
      
      // 添加一些模拟统计数据
      courseInfo.value.countStudy = 1250
      courseInfo.value.completionRate = 75
      courseInfo.value.avgRating = 4.5
    })
  })
}

// 返回列表
const goBack = () => {
  // 使用router.go(-1)返回上一页，如果上一页不是课程列表，则跳转到课程列表
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/course')
  }
}

// 编辑课程
const editCourse = () => {
  if (!courseInfo.value.id) {
    proxy.$message.error('课程信息未加载完成，请稍后再试')
    return
  }

  // 获取第一个章节和第一个小节的ID（如果存在）
  let chapterId = ''
  let sectionId = ''
  if (chapters.value.length > 0) {
    chapterId = chapters.value[0].id
    if (chapters.value[0].sections && chapters.value[0].sections.length > 0) {
      sectionId = chapters.value[0].sections[0].id
    }
  }

  router.push({
    path: '/course/update/modern',
    query: {
      courseId: courseInfo.value.id,
      chapterId: chapterId,
      sectionId: sectionId,
      tab: 'chapters'
    }
  })
}

// 管理章节
const manageChapters = () => {
  router.push({ path: '/course/chapter', query: { courseId: courseInfo.value.id } })
}

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'renderer' ? 'list' : 'renderer'
}

// 工具方法
const getStatusType = (status) => {
  const statusMap = {
    'draft': 'info',
    'published': 'success',
    'unpublished': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'unpublished': '未发布'
  }
  return statusMap[status] || '未知'
}

const getLevelText = (level) => {
  const levelMap = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return levelMap[level] || '未知'
}

const getContentTypeText = (type) => {
  const typeMap = {
    'video': '视频',
    'audio': '音频',
    'document': '文档',
    'image': '图片'
  }
  return typeMap[type] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 模拟学习数据
studyData.value = [
  {
    studentName: '张三',
    progress: 80,
    completedChapters: 4,
    totalChapters: 5,
    studyTime: '12小时',
    lastStudyTime: new Date()
  },
  {
    studentName: '李四',
    progress: 65,
    completedChapters: 3,
    totalChapters: 5,
    studyTime: '10小时',
    lastStudyTime: new Date(Date.now() - 86400000)
  }
]

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/detail/index.vue`);
  getCourseDetail()
})
</script>

<style scoped>
.back-button {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.course-info {
  display: flex;
  gap: 20px;
}

.course-logo img {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.course-details h1 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 24px;
}

.course-meta {
  margin-bottom: 15px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.course-meta span {
  color: #606266;
}

.course-tags {
  margin-bottom: 15px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 5px;
}

.course-schedule {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.course-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-description {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.course-description h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.course-description p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.metadata-section {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.metadata-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.stats-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.course-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chapters-content,
.data-content {
  padding: 20px;
}

.chapter-actions h3,
.chart-card h3,
.data-table h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

.chapter-info {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.section-list {
  padding: 10px 0;
}

.section-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.section-index {
  color: #909399;
  font-weight: bold;
}

.section-name {
  font-weight: 500;
  flex: 1;
}

.section-duration {
  color: #606266;
  font-size: 14px;
}

.section-resources {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
}

.resource-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-title {
  color: #606266;
  font-size: 14px;
}

.resource-tag {
  margin-right: 5px;
}

.practice-info {
  align-self: flex-start;
}

.chart-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.chart-placeholder {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
}

.data-table {
  margin-top: 20px;
}
</style>