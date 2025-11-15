<template>
  <div class="app-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回课程列表</el-button>
    </div>

    <!-- 课程信息头部 -->
    <div class="course-header">
      <div class="course-info">
        <img :src="courseInfo.courseLogo" :alt="courseInfo.courseName" class="course-logo" />
        <div class="course-details">
          <h1>{{ courseInfo.courseName }}</h1>
          <div class="course-meta">
            <span>讲师：{{ courseInfo.lecturerName }}</span>
            <span>分类：{{ courseInfo.categoryName }}</span>
          </div>
        </div>
      </div>
      <div class="time-filter">
        <el-date-picker
          v-model="timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleTimeChange"
        />
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="metrics-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-item">
              <div class="metric-icon">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ metrics.totalStudents }}</div>
                <div class="metric-label">总学员数</div>
                <div class="metric-change" :class="metrics.studentsChange >= 0 ? 'positive' : 'negative'">
                  {{ metrics.studentsChange >= 0 ? '+' : '' }}{{ metrics.studentsChange }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-item">
              <div class="metric-icon">
                <el-icon :size="32"><ShoppingCart /></el-icon>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ metrics.totalPurchases }}</div>
                <div class="metric-label">购买数量</div>
                <div class="metric-change" :class="metrics.purchasesChange >= 0 ? 'positive' : 'negative'">
                  {{ metrics.purchasesChange >= 0 ? '+' : '' }}{{ metrics.purchasesChange }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-item">
              <div class="metric-icon">
                <el-icon :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ metrics.completionRate }}%</div>
                <div class="metric-label">完成率</div>
                <div class="metric-change" :class="metrics.completionChange >= 0 ? 'positive' : 'negative'">
                  {{ metrics.completionChange >= 0 ? '+' : '' }}{{ metrics.completionChange }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-item">
              <div class="metric-icon">
                <el-icon :size="32"><Money /></el-icon>
              </div>
              <div class="metric-content">
                <div class="metric-value">￥{{ metrics.totalRevenue }}</div>
                <div class="metric-label">总收入</div>
                <div class="metric-change" :class="metrics.revenueChange >= 0 ? 'positive' : 'negative'">
                  {{ metrics.revenueChange >= 0 ? '+' : '' }}{{ metrics.revenueChange }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据分析标签页 -->
    <el-tabs v-model="activeTab" class="analytics-tabs">
      <!-- 学习趋势 -->
      <el-tab-pane label="学习趋势" name="trends">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>学习人数趋势</span>
                    <el-radio-group v-model="trendPeriod" size="small">
                      <el-radio-button value="day">日</el-radio-button>
                      <el-radio-button value="week">周</el-radio-button>
                      <el-radio-button value="month">月</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="学习人数趋势图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>完成率趋势</span>
                  </div>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="完成率趋势图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>收入趋势</span>
                  </div>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="收入趋势图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 学员分析 -->
      <el-tab-pane label="学员分析" name="students">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="chart-card">
                <template #header>
                  <span>学员分布</span>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="学员分布图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="16">
              <el-card class="chart-card">
                <template #header>
                  <span>学习活跃度</span>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="学习活跃度图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
              <div class="table-header">
                <span>学员详情</span>
                <div class="table-actions">
                  <el-input
                    v-model="studentSearch"
                    placeholder="搜索学员"
                    size="small"
                    style="width: 200px;"
                  />
                  <el-button size="small" @click="exportStudents">导出数据</el-button>
                </div>
              </div>
            </template>
            <el-table :data="studentList" stripe>
              <el-table-column label="学员" prop="studentName">
                <template #default="scope">
                  <div class="student-info">
                    <el-avatar :src="scope.row.avatar" :size="30">{{ scope.row.studentName?.charAt(0) }}</el-avatar>
                    <span>{{ scope.row.studentName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="学习进度" prop="progress" width="120">
                <template #default="scope">
                  <el-progress :percentage="scope.row.progress" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="学习时长" prop="studyTime" width="100" />
              <el-table-column label="完成章节" prop="completedChapters" width="100" />
              <el-table-column label="最后学习" prop="lastStudyTime" width="180">
                <template #default="scope">
                  {{ parseTime(scope.row.lastStudyTime) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" prop="status" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 内容分析 -->
      <el-tab-pane label="内容分析" name="content">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <span>章节完成率</span>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="章节完成率图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <span>资源使用率</span>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="资源使用率图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-card class="table-card" style="margin-top: 20px;">
            <template #header>
              <span>章节详情</span>
            </template>
            <el-table :data="chapterStats" stripe>
              <el-table-column label="章节名称" prop="chapterName" />
              <el-table-column label="学习人数" prop="studyCount" width="100" />
              <el-table-column label="完成人数" prop="completeCount" width="100" />
              <el-table-column label="完成率" prop="completionRate" width="120">
                <template #default="scope">
                  <el-progress :percentage="scope.row.completionRate" :stroke-width="6" />
                </template>
              </el-table-column>
              <el-table-column label="平均学习时长" prop="avgStudyTime" width="120" />
              <el-table-column label="资源使用情况" prop="resourceUsage" width="120">
                <template #default="scope">
                  <el-progress :percentage="scope.row.resourceUsage" :stroke-width="6" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <!-- 收入分析 -->
      <el-tab-pane label="收入分析" name="revenue">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <span>收入构成</span>
                    <el-radio-group v-model="revenueType" size="small">
                      <el-radio-button value="daily">日收入</el-radio-button>
                      <el-radio-button value="monthly">月收入</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="chart-container">
                  <div class="chart-placeholder">
                    <el-empty description="收入构成图表" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-label">总收入</div>
                  <div class="stat-value">￥{{ revenueStats.total }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-label">平均客单价</div>
                  <div class="stat-value">￥{{ revenueStats.avgOrder }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stat-card">
                <div class="stat-item">
                  <div class="stat-label">转化率</div>
                  <div class="stat-value">{{ revenueStats.conversionRate }}%</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, ShoppingCart, TrendCharts, Money } from '@element-plus/icons-vue'
import { parseTime } from '@/utils'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 响应式数据
const activeTab = ref('trends')
const timeRange = ref([])
const trendPeriod = ref('week')
const revenueType = ref('daily')
const studentSearch = ref('')

// 课程信息
const courseInfo = ref({})

// 核心指标
const metrics = ref({
  totalStudents: 1250,
  studentsChange: 12.5,
  totalPurchases: 890,
  purchasesChange: 8.2,
  completionRate: 75,
  completionChange: -2.1,
  totalRevenue: 88110,
  revenueChange: 15.6
})

// 学员列表
const studentList = ref([
  {
    studentName: '张三',
    avatar: '',
    progress: 80,
    studyTime: '12小时',
    completedChapters: 4,
    lastStudyTime: new Date(),
    status: 'active'
  }
])

// 章节统计
const chapterStats = ref([
  {
    chapterName: '第一章：Vue.js 基础',
    studyCount: 1200,
    completeCount: 900,
    completionRate: 75,
    avgStudyTime: '2.5小时',
    resourceUsage: 85
  }
])

// 收入统计
const revenueStats = ref({
  total: 88110,
  avgOrder: 99,
  conversionRate: 71.2
})

// 获取课程分析数据
const getCourseAnalytics = () => {
  const courseId = route.query.courseId
  if (!courseId) {
    proxy.$message.error('缺少课程ID参数')
    return
  }

  // 模拟数据
  courseInfo.value = {
    id: courseId,
    courseName: 'Vue.js 入门教程',
    courseLogo: '/images/course-logo.jpg',
    lecturerName: '张老师',
    categoryName: '前端开发'
  }

  // 设置默认时间范围（最近30天）
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  timeRange.value = [
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10)
  ]
}

// 时间范围变化
const handleTimeChange = () => {
  // 重新加载数据
  console.log('时间范围变化:', timeRange.value)
}

// 导出学员数据
const exportStudents = () => {
  proxy.$message.info('导出功能开发中...')
}

// 工具方法
const getStatusType = (status) => {
  const types = {
    active: 'success',
    inactive: 'info',
    dropped: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    active: '学习中',
    inactive: '未开始',
    dropped: '已退课'
  }
  return texts[status] || status
}

// 返回列表
const goBack = () => {
  router.push('/course')
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/analytics/index.vue`);
  getCourseAnalytics()
})
</script>

<style scoped>
.back-button {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.course-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.course-logo {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.course-details h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.course-meta {
  color: #606266;
  font-size: 14px;
}

.course-meta span {
  margin-right: 15px;
}

.metrics-section {
  margin-bottom: 20px;
}

.metric-card {
  height: 120px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
}

.metric-icon {
  color: #409eff;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.metric-label {
  color: #909399;
  font-size: 14px;
  margin: 5px 0;
}

.metric-change {
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.analytics-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tab-content {
  padding: 20px;
}

.chart-card,
.table-card,
.stat-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-item {
  padding: 10px 0;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>