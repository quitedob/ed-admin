<template>
  <div class="homework-list-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title-section">
        <h2>作业管理</h2>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建作业
        </el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索作业..."
        clearable
        style="width: 200px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterClass" placeholder="班级" clearable style="width: 150px">
        <el-option label="全部班级" value="" />
        <el-option label="前端开发一班" value="class_001" />
        <el-option label="前端开发二班" value="class_002" />
        <el-option label="数据科学班" value="class_003" />
      </el-select>

      <el-select v-model="filterCourse" placeholder="课程" clearable style="width: 150px">
        <el-option label="全部课程" value="" />
        <el-option label="前端开发基础" value="course_001" />
        <el-option label="前端开发进阶" value="course_001" />
        <el-option label="数据科学基础" value="course_002" />
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px">
        <el-option label="全部状态" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="已结束" value="ended" />
      </el-select>
    </div>

    <!-- 作业列表（卡片式布局） -->
    <div class="homework-list">
      <el-row :gutter="20">
        <el-col
          v-for="homework in filteredHomeworks"
          :key="homework.id"
          :span="8"
        >
          <el-card class="homework-card" shadow="hover">
            <div class="homework-header">
              <div class="homework-title-section">
                <h3 class="homework-title">{{ homework.title }}</h3>
                <el-tag :type="getStatusTagType(homework.status)" size="small">
                  {{ getStatusLabel(homework.status) }}
                </el-tag>
              </div>
              <div class="homework-tags">
                <el-tag type="info" size="small">{{ homework.className }}</el-tag>
                <el-tag type="warning" size="small">{{ homework.courseName }}</el-tag>
              </div>
            </div>

            <div class="homework-description">
              {{ homework.description || '暂无描述' }}
            </div>

            <div class="homework-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>开始: {{ formatDate(homework.schedule.releaseTime) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>截止: {{ formatDate(homework.schedule.dueTime) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>{{ homework.questions.length }}道题</span>
              </div>
            </div>

            <!-- 作业完成度统计 -->
            <div class="homework-stats">
              <div class="completion-info">
                <span class="stat-label">完成进度:</span>
                <div class="progress-container">
                  <el-progress
                    :percentage="homework.completionRate || 0"
                    :color="getProgressColor(homework.completionRate || 0)"
                    :show-text="false"
                    :stroke-width="8"
                  />
                  <span class="progress-text">{{ homework.submittedCount || 0 }}/{{ homework.totalStudents || 0 }}</span>
                </div>
                <span class="percentage">{{ homework.completionRate || 0 }}%</span>
              </div>
            </div>

            <div class="homework-actions card-actions">
              <el-button link type="primary" @click="handleEdit(homework)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="success" @click="handleGrade(homework)">
                <el-icon><Document /></el-icon>
                批改
              </el-button>
              <el-button link type="danger" @click="handleDelete(homework)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="filteredHomeworks.length === 0" description="暂无作业" />
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[9, 18, 36]"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script setup name="HomeworkList">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Edit,
  Document,
  Delete,
  Calendar
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const homeworks = ref([])
const searchKeyword = ref('')
const filterClass = ref('')
const filterCourse = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(9)

// 计算属性
const total = computed(() => filteredHomeworks.value.length)

const filteredHomeworks = computed(() => {
  let result = homeworks.value

  // 搜索过滤
  if (searchKeyword.value) {
    result = result.filter(hw =>
      hw.title.includes(searchKeyword.value) ||
      hw.className.includes(searchKeyword.value) ||
      hw.courseName.includes(searchKeyword.value)
    )
  }

  // 班级过滤
  if (filterClass.value) {
    result = result.filter(hw => hw.classId === filterClass.value)
  }

  // 课程过滤
  if (filterCourse.value) {
    result = result.filter(hw => hw.courseId === filterCourse.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(hw => hw.status === filterStatus.value)
  }

  return result
})

// 初始化模拟数据
const initMockData = () => {
  homeworks.value = [
    {
      id: 'hw_001',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第一章作业',
      description: '完成第一章基础知识的练习',
      type: 'exercise',
      difficulty: 'easy',
      schedule: {
        releaseTime: '2024-12-15T10:00:00Z',
        dueTime: '2024-12-25T23:59:59Z',
        remindTime: '2024-12-24T12:00:00Z'
      },
      questions: [
        { id: 'hwq_001', questionId: 'q_001', type: 'single', score: 2 },
        { id: 'hwq_002', questionId: 'q_002', type: 'multiple', score: 3 },
        { id: 'hwq_003', questionId: 'q_003', type: 'fill', score: 2 },
        { id: 'hwq_004', questionId: 'q_004', type: 'essay', score: 5 }
      ],
      totalStudents: 30,
      submittedCount: 15,
      completionRate: 50,
      settings: {
        autoGrade: true,
        aiGrade: true,
        manualReview: true
      },
      status: 'published',
      createdAt: '2024-12-01T10:00:00Z'
    },
    {
      id: 'hw_002',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第二章作业',
      description: '完成第二章进阶知识的练习',
      type: 'exercise',
      difficulty: 'medium',
      schedule: {
        releaseTime: '2024-12-20T10:00:00Z',
        dueTime: '2024-12-30T23:59:59Z',
        remindTime: '2024-12-29T12:00:00Z'
      },
      questions: [],
      totalStudents: 30,
      submittedCount: 20,
      completionRate: 67,
      settings: {
        autoGrade: true,
        aiGrade: true,
        manualReview: false
      },
      status: 'published',
      createdAt: '2024-12-05T10:00:00Z'
    },
    {
      id: 'hw_003',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第三章作业',
      description: '第三章综合练习',
      type: 'practice',
      difficulty: 'hard',
      schedule: {
        releaseTime: '2024-12-25T10:00:00Z',
        dueTime: '2025-01-05T23:59:59Z',
        remindTime: '2025-01-04T12:00:00Z'
      },
      questions: [],
      totalStudents: 30,
      submittedCount: 0,
      completionRate: 0,
      settings: {
        autoGrade: true,
        aiGrade: true,
        manualReview: true
      },
      status: 'draft',
      createdAt: '2024-12-10T10:00:00Z'
    },
    {
      id: 'hw_004',
      classId: 'class_002',
      className: '前端开发二班',
      courseId: 'course_001',
      courseName: '前端开发进阶',
      title: '综合练习',
      description: '综合练习题',
      type: 'exam',
      difficulty: 'medium',
      schedule: {
        releaseTime: '2024-12-18T10:00:00Z',
        dueTime: '2024-12-28T23:59:59Z',
        remindTime: '2024-12-27T12:00:00Z'
      },
      questions: [],
      totalStudents: 25,
      submittedCount: 12,
      completionRate: 48,
      settings: {
        autoGrade: true,
        aiGrade: false,
        manualReview: true
      },
      status: 'published',
      createdAt: '2024-12-08T10:00:00Z'
    }
  ]
}

// 方法
const handleCreate = () => {
  router.push('/homework/create')
}

const handleEdit = (homework) => {
  router.push(`/homework/edit/${homework.id}`)
}

const handleGrade = (homework) => {
  router.push(`/homework/grading?id=${homework.id}`)
}

const handleDelete = (homework) => {
  ElMessageBox.confirm('确定要删除该作业吗？删除后无法恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    const index = homeworks.value.findIndex(hw => hw.id === homework.id)
    if (index > -1) {
      homeworks.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const getStatusIcon = (homework) => {
  const now = new Date()
  const dueTime = new Date(homework.schedule.dueTime)
  
  if (homework.status === 'draft') return Clock
  if (homework.submitRate === 100) return CircleCheck
  if (now > dueTime) return CircleClose
  return Clock
}

const getStatusClass = (homework) => {
  const now = new Date()
  const dueTime = new Date(homework.schedule.dueTime)
  
  if (homework.status === 'draft') return 'status-draft'
  if (homework.submitRate === 100) return 'status-complete'
  if (now > dueTime) return 'status-overdue'
  return 'status-ongoing'
}

const getStatusLabel = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    ended: '已结束'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    published: 'success',
    draft: 'info',
    ended: 'danger'
  }
  return map[status] || ''
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
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
.homework-list-container {
  padding: 20px;
  background: var(--color-bg-primary);
  min-height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .title-section {
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

  .el-input,
  .el-select {
    flex-shrink: 0;
  }
}

.homework-list {
  margin-bottom: 24px;

  .el-row {
    width: 100%;
  }
}

.homework-card {
  height: 100%;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .homework-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-lighter);

    .homework-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .homework-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
        flex: 1;
      }
    }

    .homework-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .homework-description {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .homework-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--color-text-secondary);

      .el-icon {
        font-size: 14px;
        color: var(--color-primary);
      }
    }
  }

  .homework-stats {
    margin-bottom: 12px;
    padding: 8px;
    background-color: var(--color-bg-primary);
    border-radius: 6px;

    .completion-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .stat-label {
        color: var(--color-text-secondary);
        font-weight: 500;
        min-width: 60px;
      }

      .progress-container {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;

        .progress-text {
          font-size: 11px;
          color: var(--color-text-secondary);
          min-width: 40px;
          text-align: right;
        }
      }

      .percentage {
        font-weight: 600;
        color: var(--color-text-primary);
        min-width: 35px;
        text-align: right;
      }
    }
  }

  .homework-actions {
    padding-top: 12px;
    border-top: 1px solid var(--color-border-lighter);

    .el-button {
      font-size: 12px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
