<template>
  <div class="homework-exam-list-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ pageTitle }}</h2>
      <p class="subtitle">{{ pageSubtitle }}</p>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="homework-exam-tabs">
      <!-- 作业列表 -->
      <el-tab-pane label="作业列表" name="homework">
        <div class="tab-content">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="homeworkSearchKeyword"
              placeholder="搜索作业名称..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 作业表格 -->
          <el-table :data="filteredHomeworks" stripe>
            <el-table-column label="作业名称" prop="name" min-width="200" show-overflow-tooltip />
            <el-table-column label="所属班级" prop="className" width="150" />
            <el-table-column label="所属课程" prop="courseName" width="150" />
            <el-table-column label="完成度" width="120" align="center">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.completionRate"
                  :color="getProgressColor(scope.row.completionRate)"
                />
              </template>
            </el-table-column>
            <el-table-column label="提交时间" prop="submitTime" width="180" align="center">
              <template #default="scope">
                {{ formatDate(scope.row.submitTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="scope">
                <el-button text type="primary" size="small" @click="viewHomeworkDetail(scope.row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-show="homeworkTotal > 0"
              v-model:current-page="homeworkPage"
              v-model:page-size="homeworkPageSize"
              :total="homeworkTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>

          <!-- 空状态 -->
          <el-empty v-if="filteredHomeworks.length === 0" description="暂无作业" />
        </div>
      </el-tab-pane>

      <!-- 考试列表 -->
      <el-tab-pane label="考试列表" name="exam">
        <div class="tab-content">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="examSearchKeyword"
              placeholder="搜索考试名称..."
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 考试表格 -->
          <el-table :data="filteredExams" stripe>
            <el-table-column label="考试名称" prop="name" min-width="200" show-overflow-tooltip />
            <el-table-column label="所属班级" prop="className" width="150" />
            <el-table-column label="所属课程" prop="courseName" width="150" />
            <el-table-column label="分数" width="100" align="center">
              <template #default="scope">
                <span :style="{ color: getScoreColor(scope.row.score, scope.row.totalScore) }">
                  {{ scope.row.score }}/{{ scope.row.totalScore }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="完成度" width="120" align="center">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.completionRate"
                  :color="getProgressColor(scope.row.completionRate)"
                />
              </template>
            </el-table-column>
            <el-table-column label="提交时间" prop="submitTime" width="180" align="center">
              <template #default="scope">
                {{ formatDate(scope.row.submitTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="scope">
                <el-button text type="primary" size="small" @click="viewExamDetail(scope.row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-show="examTotal > 0"
              v-model:current-page="examPage"
              v-model:page-size="examPageSize"
              :total="examTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>

          <!-- 空状态 -->
          <el-empty v-if="filteredExams.length === 0" description="暂无考试" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const activeTab = ref('homework')
const homeworkSearchKeyword = ref('')
const examSearchKeyword = ref('')
const homeworkPage = ref(1)
const homeworkPageSize = ref(10)
const examPage = ref(1)
const examPageSize = ref(10)

// 页面标题
const pageTitle = computed(() => {
  if (route.query.courseName) {
    return `${route.query.courseName} - 作业和考试`
  }
  if (route.query.className) {
    return `${route.query.className} - 作业和考试`
  }
  return '作业和考试'
})

const pageSubtitle = computed(() => {
  if (route.query.courseName) {
    return `课程：${route.query.courseName}`
  }
  if (route.query.className) {
    return `班级：${route.query.className}`
  }
  return ''
})

// 模拟作业数据
const homeworks = ref([
  {
    id: 'hw_001',
    name: '第一章 JavaScript基础练习',
    className: '前端开发一班',
    courseName: 'JavaScript基础',
    completionRate: 100,
    submitTime: new Date('2024-11-10T14:30:00Z'),
    status: 'submitted'
  },
  {
    id: 'hw_002',
    name: '第二章 DOM操作练习',
    className: '前端开发一班',
    courseName: 'JavaScript基础',
    completionRate: 75,
    submitTime: new Date('2024-11-12T10:15:00Z'),
    status: 'submitted'
  },
  {
    id: 'hw_003',
    name: '第三章 事件处理练习',
    className: '前端开发一班',
    courseName: 'JavaScript基础',
    completionRate: 50,
    submitTime: null,
    status: 'pending'
  },
  {
    id: 'hw_004',
    name: 'Vue组件开发练习',
    className: '前端开发一班',
    courseName: 'Vue.js框架',
    completionRate: 100,
    submitTime: new Date('2024-11-08T16:45:00Z'),
    status: 'submitted'
  },
  {
    id: 'hw_005',
    name: 'Vue路由配置练习',
    className: '前端开发一班',
    courseName: 'Vue.js框架',
    completionRate: 60,
    submitTime: new Date('2024-11-13T09:20:00Z'),
    status: 'submitted'
  }
])

// 模拟考试数据
const exams = ref([
  {
    id: 'exam_001',
    name: 'JavaScript基础测试',
    className: '前端开发一班',
    courseName: 'JavaScript基础',
    score: 85,
    totalScore: 100,
    completionRate: 100,
    submitTime: new Date('2024-11-05T15:00:00Z'),
    status: 'graded'
  },
  {
    id: 'exam_002',
    name: 'DOM和事件处理测试',
    className: '前端开发一班',
    courseName: 'JavaScript基础',
    score: 92,
    totalScore: 100,
    completionRate: 100,
    submitTime: new Date('2024-11-09T14:30:00Z'),
    status: 'graded'
  },
  {
    id: 'exam_003',
    name: 'Vue.js基础测试',
    className: '前端开发一班',
    courseName: 'Vue.js框架',
    score: 78,
    totalScore: 100,
    completionRate: 100,
    submitTime: new Date('2024-11-11T16:00:00Z'),
    status: 'graded'
  },
  {
    id: 'exam_004',
    name: 'Vue路由和状态管理测试',
    className: '前端开发一班',
    courseName: 'Vue.js框架',
    score: 0,
    totalScore: 100,
    completionRate: 0,
    submitTime: null,
    status: 'pending'
  }
])

// 计算属性
const filteredHomeworks = computed(() => {
  let result = homeworks.value

  if (route.query.courseId) {
    result = result.filter(h => h.courseName === route.query.courseName)
  }

  if (route.query.classId) {
    result = result.filter(h => h.className === route.query.className)
  }

  if (homeworkSearchKeyword.value) {
    result = result.filter(h =>
      h.name.includes(homeworkSearchKeyword.value)
    )
  }

  return result
})

const filteredExams = computed(() => {
  let result = exams.value

  if (route.query.courseId) {
    result = result.filter(e => e.courseName === route.query.courseName)
  }

  if (route.query.classId) {
    result = result.filter(e => e.className === route.query.className)
  }

  if (examSearchKeyword.value) {
    result = result.filter(e =>
      e.name.includes(examSearchKeyword.value)
    )
  }

  return result
})

const homeworkTotal = computed(() => filteredHomeworks.value.length)
const examTotal = computed(() => filteredExams.value.length)

// 方法
const goBack = () => {
  router.back()
}

const formatDate = (dateString) => {
  if (!dateString) return '未提交'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
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
  console.log(`打开文件: ${location.pathname} -> views/users/homework-exam-list.vue`)
  console.log('路由参数:', {
    courseId: route.query.courseId,
    courseName: route.query.courseName,
    classId: route.query.classId,
    className: route.query.className
  })
})
</script>

<style lang="scss" scoped>
.homework-exam-list-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.back-button {
  margin-bottom: 20px;
}

.page-header {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .subtitle {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.homework-exam-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 24px;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
