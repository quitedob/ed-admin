<template>
  <div class="student-detail-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">学生详情 > {{ studentInfo?.name }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
      </div>
    </div>

    <!-- 学生概览卡片 -->
    <div class="student-overview">
      <el-card shadow="never">
        <div class="overview-content">
          <div class="avatar-section">
            <el-avatar :size="80" :src="studentInfo?.avatar">
              {{ studentInfo?.name?.charAt(0) }}
            </el-avatar>
          </div>
          <div class="info-section">
            <h2>{{ studentInfo?.name }}</h2>
            <div class="meta-info">
              <span>学号: {{ studentInfo?.studentId }}</span>
              <el-divider direction="vertical" />
              <span>班级: {{ studentInfo?.classes?.map(c => c.name).join(', ') }}</span>
              <el-divider direction="vertical" />
              <el-tag :type="getStatusTagType(studentInfo?.status)" size="small">
                {{ getStatusLabel(studentInfo?.status) }}
              </el-tag>
            </div>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-value">{{ studentInfo?.statistics.averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ studentInfo?.statistics.completedHomeworks }}</div>
              <div class="stat-label">完成作业</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ studentInfo?.statistics.completedExams }}</div>
              <div class="stat-label">完成考试</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatLearningTime(studentInfo?.statistics.learningTime) }}</div>
              <div class="stat-label">学习时长</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 标签页 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 基本信息标签页 -->
        <el-tab-pane label="基本信息" name="info">
          <el-card shadow="never">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="学号">
                {{ studentInfo?.studentId }}
              </el-descriptions-item>
              <el-descriptions-item label="姓名">
                {{ studentInfo?.name }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ studentInfo?.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ studentInfo?.email }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusTagType(studentInfo?.status)">
                  {{ getStatusLabel(studentInfo?.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ formatDateTime(studentInfo?.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="所属班级" :span="2">
                <el-tag
                  v-for="cls in studentInfo?.classes"
                  :key="cls.id"
                  style="margin-right: 8px"
                >
                  {{ cls.name }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-tab-pane>

        <!-- 学习记录标签页 -->
        <el-tab-pane label="学习记录" name="courses">
          <el-card shadow="never">
            <div class="courses-section">
              <h3>已加入课程</h3>
              <el-row :gutter="20">
                <el-col
                  v-for="course in studentInfo?.courses"
                  :key="course.id"
                  :span="8"
                >
                  <el-card class="course-card" shadow="hover">
                    <div class="course-header">
                      <h4>{{ course.name }}</h4>
                      <el-tag type="success">进行中</el-tag>
                    </div>
                    <div class="course-progress">
                      <div class="progress-label">
                        <span>学习进度</span>
                        <span>{{ course.progress }}%</span>
                      </div>
                      <el-progress
                        :percentage="course.progress"
                        :color="getProgressColor(course.progress)"
                      />
                    </div>
                    <div class="course-score">
                      <span class="score-label">课程成绩</span>
                      <span class="score-value">{{ course.score }}分</span>
                    </div>
                    <div class="course-actions">
                      <el-button link type="primary" @click="handleViewCourse(course)">
                        查看详情
                      </el-button>
                    </div>
                  </el-card>
                </el-col>
              </el-row>

              <el-empty
                v-if="!studentInfo?.courses || studentInfo.courses.length === 0"
                description="暂无课程"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 作业/考试成绩标签页 -->
        <el-tab-pane label="作业/考试成绩" name="records">
          <el-card shadow="never">
            <!-- 筛选器 -->
            <div class="records-filter">
              <el-radio-group v-model="recordType">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="homework">作业</el-radio-button>
                <el-radio-button label="exam">考试</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 记录列表 -->
            <el-table :data="filteredRecords" style="margin-top: 16px">
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'homework_submitted' ? 'primary' : 'warning'">
                    {{ row.type === 'homework_submitted' ? '作业' : '考试' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="名称" min-width="200" />
              <el-table-column label="提交状态" width="120" align="center">
                <template #default="{ row }">
                  <el-tag type="success" size="small">已提交</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="150" align="center">
                <template #default="{ row }">
                  <span class="score-display">{{ row.score }}/{{ row.maxScore }}</span>
                </template>
              </el-table-column>
              <el-table-column label="完成度" width="180">
                <template #default="{ row }">
                  <el-progress
                    :percentage="getScorePercentage(row)"
                    :color="getProgressColor(getScorePercentage(row))"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="timestamp" label="提交时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewRecord(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const studentId = ref(route.params.id)
const activeTab = ref('info')
const recordType = ref('all')

const studentInfo = ref(null)
const learningRecords = ref([])

// 计算属性
const filteredRecords = computed(() => {
  if (recordType.value === 'all') {
    return learningRecords.value
  }
  const typeMap = {
    homework: 'homework_submitted',
    exam: 'exam_submitted'
  }
  return learningRecords.value.filter(r => r.type === typeMap[recordType.value])
})

// 初始化模拟数据
const initMockData = () => {
  studentInfo.value = {
    id: 'stu_001',
    studentId: '20240001',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    avatar: '',
    classes: [
      { id: 'class_001', name: '前端开发一班', joinTime: '2024-09-01T10:00:00Z' }
    ],
    courses: [
      { id: 'course_001', name: 'JavaScript基础', progress: 65, score: 85 },
      { id: 'course_002', name: 'Vue.js框架', progress: 45, score: 78 },
      { id: 'course_003', name: 'React基础', progress: 30, score: 72 }
    ],
    statistics: {
      totalHomeworks: 10,
      completedHomeworks: 8,
      totalExams: 2,
      completedExams: 2,
      averageScore: 82.5,
      learningTime: 4560
    },
    status: 'active',
    createdAt: '2024-09-01T10:00:00Z'
  }

  learningRecords.value = [
    {
      id: 'rec_001',
      type: 'homework_submitted',
      homeworkId: 'hw_001',
      name: '第一章作业',
      timestamp: '2024-12-20T15:30:00Z',
      score: 40,
      maxScore: 50
    },
    {
      id: 'rec_002',
      type: 'homework_submitted',
      homeworkId: 'hw_002',
      name: '第二章作业',
      timestamp: '2024-12-18T14:20:00Z',
      score: 45,
      maxScore: 50
    },
    {
      id: 'rec_003',
      type: 'exam_submitted',
      examId: 'exam_001',
      name: '期中考试',
      timestamp: '2024-12-15T11:25:00Z',
      score: 75,
      maxScore: 100
    },
    {
      id: 'rec_004',
      type: 'exam_submitted',
      examId: 'exam_002',
      name: 'JavaScript测验',
      timestamp: '2024-12-10T10:30:00Z',
      score: 42,
      maxScore: 50
    }
  ]
}

// 方法
const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  ElMessage.info('编辑功能开发中...')
}

const handleViewCourse = (course) => {
  router.push(`/course/detail/${course.id}`)
}

const handleViewRecord = (record) => {
  if (record.type === 'homework_submitted') {
    router.push(`/homework/review?id=${record.homeworkId}&student=${studentId.value}`)
  } else {
    router.push(`/exam/grade/${record.examId}?student=${studentId.value}`)
  }
}

const getStatusLabel = (status) => {
  const map = {
    active: '在读',
    inactive: '休学',
    graduated: '已毕业'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'warning',
    graduated: 'info'
  }
  return map[status] || ''
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getScorePercentage = (record) => {
  if (!record.maxScore) return 0
  return Math.round((record.score / record.maxScore) * 100)
}

const formatLearningTime = (minutes) => {
  if (!minutes) return '0小时'
  const hours = Math.floor(minutes / 60)
  return `${hours}小时`
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.student-detail-container {
  min-height: calc(100vh - 60px);
  background: var(--color-bg-primary);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--color-border-light);

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.student-overview {
  padding: 24px;

  .overview-content {
    display: flex;
    gap: 24px;
    align-items: center;

    .avatar-section {
      flex-shrink: 0;
    }

    .info-section {
      flex: 1;

      h2 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 12px 0;
      }

      .meta-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-text-secondary);
        font-size: 14px;
      }
    }

    .stats-section {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-primary);
          display: block;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: var(--color-text-secondary);
        }
      }
    }
  }
}

.main-content {
  padding: 0 24px 24px;

  .detail-tabs {
    background: white;
    padding: 20px;
    border-radius: 8px;
  }
}

.courses-section {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .course-card {
    margin-bottom: 20px;

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
    }

    .course-progress {
      margin-bottom: 16px;

      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }
    }

    .course-score {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--color-bg-secondary);
      border-radius: 6px;
      margin-bottom: 12px;

      .score-label {
        font-size: 13px;
        color: var(--color-text-secondary);
      }

      .score-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-primary);
      }
    }

    .course-actions {
      text-align: center;
    }
  }
}

.records-filter {
  margin-bottom: 16px;
}

.score-display {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 16px;
}
</style>
