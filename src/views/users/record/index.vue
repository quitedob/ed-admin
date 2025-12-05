<template>
  <div class="learning-record-container">
    <el-row :gutter="20" class="main-layout">
      <!-- 左侧边栏 -->
      <el-col :span="5" class="sidebar">
        <!-- 学生基础信息卡 -->
        <div class="student-card">
          <img
            :alt="studentInfo.name"
            :src="studentInfo.avatar || 'https://via.placeholder.com/100'"
            class="student-avatar"
          />
          <div class="student-basic-info">
            <h3>{{ studentInfo.name }}</h3>
            <div class="info-item">
              <span class="label">学号：</span>
              <span class="value">{{ studentInfo.studentId }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属学校：</span>
              <span class="value">{{ studentInfo.school }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机：</span>
              <span class="value">{{ studentInfo.phone }}</span>
            </div>
          </div>
        </div>

        <!-- 已加入课程列表 -->
        <div class="sidebar-section">
          <h4>已加入课程</h4>
          <div class="course-list">
            <div
              v-for="course in joinedCourses"
              :key="course.id"
              :class="['course-item', { active: selectedCourse?.id === course.id }]"
              @click="selectCourse(course)"
            >
              <div class="course-item-name">{{ course.name }}</div>
              <div class="course-item-meta">
                <span class="teacher">{{ course.teacher }}</span>
              </div>
              <el-progress :percentage="course.progress" :show-text="false" size="small" />
            </div>
          </div>
        </div>

        <!-- 已加入班级列表 -->
        <div class="sidebar-section">
          <h4>已加入班级</h4>
          <div class="class-list">
            <div
              v-for="cls in joinedClasses"
              :key="cls.id"
              :class="['class-item', { active: selectedClass?.id === cls.id }]"
              @click="selectClass(cls)"
            >
              <div class="class-item-name">{{ cls.name }}</div>
              <div class="class-item-meta">
                <span class="grade">{{ cls.grade }}</span>
                <span class="teacher">{{ cls.headTeacher }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧主内容区 -->
      <el-col :span="19" class="main-content">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="content-tabs">
          <!-- 作业列表 -->
          <el-tab-pane label="作业" name="homework">
            <div class="tab-content">
              <el-table :data="filteredHomeworks" stripe>
                <el-table-column label="作业名称" prop="name" min-width="200" show-overflow-tooltip />
                <el-table-column label="所属课程" prop="courseName" width="150" />
                <el-table-column label="所属班级" prop="className" width="150" />
                <el-table-column label="完成度" width="120" align="center">
                  <template #default="scope">
                    <el-progress
                      :percentage="scope.row.completionRate"
                      :color="getProgressColor(scope.row.completionRate)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)">
                      {{ getStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button text type="primary" size="small" @click="viewHomeworkDetail(scope.row)">
                        查看
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="filteredHomeworks.length === 0" description="暂无作业" />
            </div>
          </el-tab-pane>

          <!-- 考试列表 -->
          <el-tab-pane label="考试" name="exam">
            <div class="tab-content">
              <el-table :data="filteredExams" stripe>
                <el-table-column label="考试名称" prop="name" min-width="200" show-overflow-tooltip />
                <el-table-column label="所属课程" prop="courseName" width="150" />
                <el-table-column label="所属班级" prop="className" width="150" />
                <el-table-column label="成绩" width="100" align="center">
                  <template #default="scope">
                    <span :style="{ color: getScoreColor(scope.row.score, scope.row.totalScore) }">
                      {{ scope.row.score }}/{{ scope.row.totalScore }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="排名" width="100" align="center">
                  <template #default="scope">
                    {{ scope.row.ranking || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center" fixed="right">
                  <template #default="scope">
                    <div class="table-actions">
                      <el-button text type="primary" size="small" @click="viewExamDetail(scope.row)">
                        查看
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="filteredExams.length === 0" description="暂无考试" />
            </div>
          </el-tab-pane>

          <!-- 成绩概览 -->
          <el-tab-pane label="成绩概览" name="grades">
            <div class="tab-content">
              <div class="grades-overview">
                <div class="overview-card">
                  <h4>学习成绩统计</h4>
                  <div class="chart-container">
                    <div class="stat-item">
                      <span class="stat-label">平均成绩</span>
                      <span class="stat-value">{{ studentStats.averageScore }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最高成绩</span>
                      <span class="stat-value">{{ studentStats.maxScore }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">最低成绩</span>
                      <span class="stat-value">{{ studentStats.minScore }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">及格率</span>
                      <span class="stat-value">{{ studentStats.passingRate }}%</span>
                    </div>
                  </div>
                </div>

                <div class="overview-card">
                  <h4>学习进度</h4>
                  <div class="progress-container">
                    <div class="progress-item">
                      <span class="progress-label">作业完成度</span>
                      <el-progress :percentage="studentStats.homeworkCompletion" />
                    </div>
                    <div class="progress-item">
                      <span class="progress-label">考试参加率</span>
                      <el-progress :percentage="studentStats.examParticipation" />
                    </div>
                    <div class="progress-item">
                      <span class="progress-label">课程学习进度</span>
                      <el-progress :percentage="studentStats.courseProgress" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const activeTab = ref('homework')
const selectedCourse = ref(null)
const selectedClass = ref(null)

const studentInfo = ref({
  name: '张三',
  studentId: '20240001',
  school: '北京大学',
  phone: '13800138000',
  avatar: 'https://via.placeholder.com/100'
})

const joinedCourses = ref([
  {
    id: 'course_001',
    name: 'JavaScript基础',
    teacher: '王老师',
    progress: 65
  },
  {
    id: 'course_002',
    name: 'Vue.js框架',
    teacher: '李老师',
    progress: 45
  },
  {
    id: 'course_003',
    name: 'React框架',
    teacher: '张老师',
    progress: 30
  }
])

const joinedClasses = ref([
  {
    id: 'class_001',
    name: '前端开发一班',
    grade: '2024级',
    headTeacher: '王主任'
  },
  {
    id: 'class_002',
    name: '前端开发二班',
    grade: '2024级',
    headTeacher: '李主任'
  }
])

// 模拟作业数据
const allHomeworks = ref([
  {
    id: 'hw_001',
    name: '第一章 JavaScript基础练习',
    courseName: 'JavaScript基础',
    className: '前端开发一班',
    courseId: 'course_001',
    classId: 'class_001',
    completionRate: 100,
    status: 'completed'
  },
  {
    id: 'hw_002',
    name: '第二章 DOM操作练习',
    courseName: 'JavaScript基础',
    className: '前端开发一班',
    courseId: 'course_001',
    classId: 'class_001',
    completionRate: 75,
    status: 'in_progress'
  },
  {
    id: 'hw_003',
    name: '第三章 事件处理练习',
    courseName: 'JavaScript基础',
    className: '前端开发一班',
    courseId: 'course_001',
    classId: 'class_001',
    completionRate: 0,
    status: 'not_started'
  },
  {
    id: 'hw_004',
    name: 'Vue组件开发练习',
    courseName: 'Vue.js框架',
    className: '前端开发一班',
    courseId: 'course_002',
    classId: 'class_001',
    completionRate: 100,
    status: 'completed'
  },
  {
    id: 'hw_005',
    name: 'Vue路由配置练习',
    courseName: 'Vue.js框架',
    className: '前端开发一班',
    courseId: 'course_002',
    classId: 'class_001',
    completionRate: 60,
    status: 'in_progress'
  }
])

// 模拟考试数据
const allExams = ref([
  {
    id: 'exam_001',
    name: 'JavaScript基础测试',
    courseName: 'JavaScript基础',
    className: '前端开发一班',
    courseId: 'course_001',
    classId: 'class_001',
    score: 85,
    totalScore: 100,
    ranking: 5
  },
  {
    id: 'exam_002',
    name: 'DOM和事件处理测试',
    courseName: 'JavaScript基础',
    className: '前端开发一班',
    courseId: 'course_001',
    classId: 'class_001',
    score: 92,
    totalScore: 100,
    ranking: 3
  },
  {
    id: 'exam_003',
    name: 'Vue.js基础测试',
    courseName: 'Vue.js框架',
    className: '前端开发一班',
    courseId: 'course_002',
    classId: 'class_001',
    score: 78,
    totalScore: 100,
    ranking: 8
  }
])

// 学生统计数据
const studentStats = ref({
  averageScore: 85,
  maxScore: 92,
  minScore: 78,
  passingRate: 100,
  homeworkCompletion: 72,
  examParticipation: 100,
  courseProgress: 65
})

// 计算属性
const filteredHomeworks = computed(() => {
  let result = allHomeworks.value

  if (selectedCourse.value) {
    result = result.filter(h => h.courseId === selectedCourse.value.id)
  }

  if (selectedClass.value) {
    result = result.filter(h => h.classId === selectedClass.value.id)
  }

  return result
})

const filteredExams = computed(() => {
  let result = allExams.value

  if (selectedCourse.value) {
    result = result.filter(e => e.courseId === selectedCourse.value.id)
  }

  if (selectedClass.value) {
    result = result.filter(e => e.classId === selectedClass.value.id)
  }

  return result
})

// 方法
const selectCourse = (course) => {
  selectedCourse.value = selectedCourse.value?.id === course.id ? null : course
  selectedClass.value = null
}

const selectClass = (cls) => {
  selectedClass.value = selectedClass.value?.id === cls.id ? null : cls
  selectedCourse.value = null
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getScoreColor = (score, totalScore) => {
  const percentage = (score / totalScore) * 100
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getStatusLabel = (status) => {
  const map = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    not_started: 'info',
    in_progress: 'warning',
    completed: 'success'
  }
  return map[status] || ''
}

const viewHomeworkDetail = (homework) => {
  router.push({
    path: '/homework/detail',
    query: { id: homework.id }
  })
}

const viewExamDetail = (exam) => {
  router.push({
    path: '/exam/detail',
    query: { id: exam.id }
  })
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/users/record/index.vue`)
  if (route.query.studentId) {
    ElMessage.info('学生信息已加载')
  }
})
</script>

<style lang="scss" scoped>
.learning-record-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.main-layout {
  width: 100%;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.student-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.student-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #409eff;
  margin-bottom: 12px;
}

.student-basic-info {
  h3 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;

    .label {
      color: #909399;
    }

    .value {
      color: #303133;
      font-weight: 500;
    }
  }
}

.sidebar-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.course-list,
.class-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-item,
.class-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    border-color: #409eff;
  }

  &.active {
    background: #e6f7ff;
    border-color: #409eff;
  }
}

.course-item-name,
.class-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-item-meta,
.class-item-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;

  span {
    display: inline-block;
    margin-right: 8px;
  }
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-tabs {
  :deep(.el-tabs__header) {
    padding: 0 20px;
  }

  :deep(.el-tabs__content) {
    padding: 0;
  }
}

.tab-content {
  padding: 20px;
}

.grades-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.overview-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;

  h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
}

.chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 4px;

  .stat-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #409eff;
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .progress-label {
    font-size: 13px;
    color: #606266;
    font-weight: 500;
  }
}
</style>
