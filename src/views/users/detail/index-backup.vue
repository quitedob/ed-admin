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

        <!-- 作业记录标签页 -->
        <el-tab-pane label="作业记录" name="homework">
          <el-card shadow="never">
            <div class="records-header">
              <h3>作业完成情况</h3>
              <el-button type="primary" @click="handleViewAllHomework">
                查看全部作业
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>

            <!-- 筛选器 -->
            <div class="records-filter">
              <el-select v-model="homeworkClassFilter" placeholder="按班级筛选" clearable style="width: 200px">
                <el-option
                  v-for="cls in studentInfo?.classes"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
              <el-select v-model="homeworkCourseFilter" placeholder="按课程筛选" clearable style="width: 200px; margin-left: 12px">
                <el-option
                  v-for="course in studentInfo?.courses"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                />
              </el-select>
              <el-date-picker
                v-model="homeworkDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-left: 12px"
              />
            </div>

            <!-- 作业列表 -->
            <el-table :data="filteredHomeworkRecords" style="margin-top: 16px">
              <el-table-column prop="name" label="作业名称" min-width="200" />
              <el-table-column prop="courseName" label="所属课程" width="150" />
              <el-table-column label="提交状态" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.submitted ? 'success' : 'danger'" size="small">
                    {{ row.submitted ? '已提交' : '未提交' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="120" align="center">
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
                  <el-button link type="primary" size="small" @click="handleViewHomework(row)">
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <!-- 考试记录标签页 -->
        <!-- 题库刷题记录标签页 -->        <el-tab-pane label="题库刷题记录" name="practice">          <el-card shadow="never">            <div class="records-header">              <h3>题库练习情况</h3>              <el-button type="primary" @click="handleViewAllPractice">                查看全部练习                <el-icon><ArrowRight /></el-icon>              </el-button>            </div>            <!-- 筛选器 -->            <div class="records-filter">              <el-select v-model="practiceCourseFilter" placeholder="按课程筛选" clearable style="width: 200px">                <el-option                  v-for="course in studentInfo?.courses"                  :key="course.id"                  :label="course.name"                  :value="course.id"                />              </el-select>              <el-date-picker                v-model="practiceDateRange"                type="daterange"                range-separator="至"                start-placeholder="开始日期"                end-placeholder="结束日期"                style="margin-left: 12px"              />            </div>            <!-- 题库练习记录列表 -->            <el-table :data="filteredPracticeRecords" style="margin-top: 16px">              <el-table-column prop="questionBankName" label="题库" min-width="200" />              <el-table-column prop="courseName" label="所属课程" width="150" />              <el-table-column prop="questionCount" label="题目数量" width="120" align="center" />              <el-table-column label="正确率" width="120" align="center">                <template #default="{ row }">                  <span class="score-display">{{ row.correctRate }}%</span>                </template>              </el-table-column>              <el-table-column label="用时" width="120" align="center">                <template #default="{ row }">                  {{ formatPracticeTime(row.duration) }}                </template>              </el-table-column>              <el-table-column prop="timestamp" label="练习时间" width="180">                <template #default="{ row }">                  {{ formatDateTime(row.timestamp) }}                </template>              </el-table-column>              <el-table-column label="操作" width="150" fixed="right">                <template #default="{ row }">                  <el-button link type="primary" size="small" @click="handleViewPractice(row)">                    查看详情                  </el-button>                </template>              </el-table-column>            </el-table>          </el-card>        </el-tab-pane>
        <el-tab-pane label="考试记录" name="exam">
          <el-card shadow="never">
            <div class="records-header">
              <h3>考试成绩情况</h3>
              <el-button type="primary" @click="handleViewAllExam">
                查看全部考试
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>

            <!-- 筛选器 -->
            <div class="records-filter">
              <el-select v-model="examClassFilter" placeholder="按班级筛选" clearable style="width: 200px">
                <el-option
                  v-for="cls in studentInfo?.classes"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
              <el-select v-model="examCourseFilter" placeholder="按课程筛选" clearable style="width: 200px; margin-left: 12px">
                <el-option
                  v-for="course in studentInfo?.courses"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                />
              </el-select>
              <el-date-picker
                v-model="examDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-left: 12px"
              />
            </div>

            <!-- 考试列表 -->
            <el-table :data="filteredExamRecords" style="margin-top: 16px">
              <el-table-column prop="name" label="考试名称" min-width="200" />
              <el-table-column prop="courseName" label="所属课程" width="150" />
              <el-table-column label="考试类型" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="getExamTypeTag(row.examType)" size="small">
                    {{ getExamTypeLabel(row.examType) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="120" align="center">
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
              <el-table-column prop="timestamp" label="考试时间" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleViewExam(row)">
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
import { ArrowLeft, Edit, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const studentId = ref(route.params.id)
const activeTab = ref('info')

// 作业筛选
const homeworkClassFilter = ref('')
const homeworkCourseFilter = ref('')
const homeworkDateRange = ref([])

// 考试筛选
const examClassFilter = ref('')
const examCourseFilter = ref('')
const examDateRange = ref([])

const studentInfo = ref(null)
const homeworkRecords = ref([])
const examRecords = ref([])

// 题库练习筛选
const practiceCourseFilter = ref('')
const practiceDateRange = ref([])

const practiceRecords = ref([])

// 计算属性 - 过滤作业记录
const filteredHomeworkRecords = computed(() => {
  let records = homeworkRecords.value

  if (homeworkClassFilter.value) {
    records = records.filter(r => r.classId === homeworkClassFilter.value)
  }

  if (homeworkCourseFilter.value) {
    records = records.filter(r => r.courseId === homeworkCourseFilter.value)
  }

  if (homeworkDateRange.value && homeworkDateRange.value.length === 2) {
    const [start, end] = homeworkDateRange.value
    records = records.filter(r => {
      const date = new Date(r.timestamp)
      return date >= start && date <= end
    })
  }

  return records
})

// 计算属性 - 过滤考试记录
const filteredExamRecords = computed(() => {
  let records = examRecords.value

  if (examClassFilter.value) {
    records = records.filter(r => r.classId === examClassFilter.value)
  }

  if (examCourseFilter.value) {
    records = records.filter(r => r.courseId === examCourseFilter.value)
  }

  if (examDateRange.value && examDateRange.value.length === 2) {
    const [start, end] = examDateRange.value
    records = records.filter(r => {
      const date = new Date(r.timestamp)
      return date >= start && date <= end
    })
  }

  return records
})

// 计算属性 - 过滤题库练习记录
const filteredPracticeRecords = computed(() => {
  let records = practiceRecords.value

  if (practiceCourseFilter.value) {
    records = records.filter(r => r.courseId === practiceCourseFilter.value)
  }

  if (practiceDateRange.value && practiceDateRange.value.length === 2) {
    const [start, end] = practiceDateRange.value
    records = records.filter(r => {
      const date = new Date(r.timestamp)
      return date >= start && date <= end
    })
  }

  return records
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
    status: 'studying',
    isDisabled: false,
    createdAt: '2024-09-01T10:00:00Z'
  }

  // 作业记录
  homeworkRecords.value = [
    {
      id: 'hw_rec_001',
      homeworkId: 'hw_001',
      name: '第一章作业：JavaScript基础',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      classId: 'class_001',
      submitted: true,
      timestamp: '2024-12-20T15:30:00Z',
      score: 40,
      maxScore: 50
    },
    {
      id: 'hw_rec_002',
      homeworkId: 'hw_002',
      name: '第二章作业：变量与数据类型',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      classId: 'class_001',
      submitted: true,
      timestamp: '2024-12-18T14:20:00Z',
      score: 45,
      maxScore: 50
    },
    {
      id: 'hw_rec_003',
      homeworkId: 'hw_003',
      name: 'Vue组件练习',
      courseName: 'Vue.js框架',
      courseId: 'course_002',
      classId: 'class_001',
      submitted: true,
      timestamp: '2024-12-15T10:00:00Z',
      score: 38,
      maxScore: 50
    },
    {
      id: 'hw_rec_004',
      homeworkId: 'hw_004',
      name: 'React Hooks练习',
      courseName: 'React基础',
      courseId: 'course_003',
      classId: 'class_001',
      submitted: false,
      timestamp: null,
      score: 0,
      maxScore: 50
    }
  ]

  // 考试记录
  examRecords.value = [
    {
      id: 'exam_rec_001',
      examId: 'exam_001',
      name: 'JavaScript期中考试',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      classId: 'class_001',
      examType: 'midterm',
      timestamp: '2024-12-15T11:25:00Z',
      score: 75,
      maxScore: 100
    },
    {
      id: 'exam_rec_002',
      examId: 'exam_002',
      name: 'JavaScript单元测验',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      classId: 'class_001',
      examType: 'quiz',
      timestamp: '2024-12-10T10:30:00Z',
      score: 42,
      maxScore: 50
    },
    {
      id: 'exam_rec_003',
      examId: 'exam_003',
      name: 'Vue.js期末考试',
      courseName: 'Vue.js框架',
      courseId: 'course_002',
      classId: 'class_001',
      examType: 'final',
      timestamp: '2024-12-05T14:00:00Z',
      score: 82,
      maxScore: 100
    }
  ]

  // 题库练习记录
  practiceRecords.value = [
    {
      id: 'practice_rec_001',
      questionBankId: 'qb_001',
      questionBankName: 'JavaScript基础题库',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      questionCount: 20,
      correctCount: 18,
      correctRate: 90,
      duration: 1200, // 秒
      timestamp: '2024-12-20T16:30:00Z'
    },
    {
      id: 'practice_rec_002',
      questionBankId: 'qb_002',
      questionBankName: 'Vue.js组件题库',
      courseName: 'Vue.js框架',
      courseId: 'course_002',
      questionCount: 15,
      correctCount: 12,
      correctRate: 80,
      duration: 900,
      timestamp: '2024-12-18T10:15:00Z'
    },
    {
      id: 'practice_rec_003',
      questionBankId: 'qb_001',
      questionBankName: 'JavaScript基础题库',
      courseName: 'JavaScript基础',
      courseId: 'course_001',
      questionCount: 25,
      correctCount: 22,
      correctRate: 88,
      duration: 1500,
      timestamp: '2024-12-15T14:45:00Z'
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

const handleViewAllHomework = () => {
  router.push(`/users/detail/${studentId.value}/homework`)
}

const handleViewAllExam = () => {
  router.push(`/users/detail/${studentId.value}/exam`)
}

const handleViewHomework = (record) => {
  router.push(`/homework/review?id=${record.homeworkId}&student=${studentId.value}`)
}

const handleViewExam = (record) => {
  router.push(`/exam/grade/${record.examId}?student=${studentId.value}`)
}

const handleViewAllPractice = () => {
  ElMessage.info('查看全部练习功能开发中...')
}

const handleViewPractice = (record) => {
  ElMessage.info(`查看题库练习详情: ${record.questionBankName}`)
}

const formatPracticeTime = (seconds) => {
  if (!seconds) return '0分钟'
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}小时${remainingMinutes}分钟`
  }
  return `${minutes}分钟`
}

const getStatusLabel = (status) => {
  const map = {
    new: '新生',
    studying: '在读',
    listening: '听课',
    archived: '封存',
    finished: '结课',
    refunded: '退费'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    new: '',
    studying: 'success',
    listening: 'primary',
    archived: 'info',
    finished: 'warning',
    refunded: 'danger'
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

const getExamTypeLabel = (type) => {
  const map = {
    quiz: '测验',
    midterm: '期中',
    final: '期末',
    practice: '练习'
  }
  return map[type] || type
}

const getExamTypeTag = (type) => {
  const map = {
    quiz: 'info',
    midterm: 'warning',
    final: 'danger',
    practice: 'success'
  }
  return map[type] || 'info'
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

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }
}

.records-filter {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.score-display {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 16px;
}
</style>
