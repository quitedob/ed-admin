<template>
  <div class="user-detail-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">学生详情 > {{ userInfo?.name }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑信息
        </el-button>
      </div>
    </div>

    <!-- 学生概览卡片 -->
    <div class="user-overview">
      <el-card shadow="never">
        <div class="overview-content">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userInfo?.avatar">
              {{ userInfo?.name?.charAt(0) }}
            </el-avatar>
          </div>
          <div class="info-section">
            <h2>{{ userInfo?.name }}</h2>
            <div class="meta-info">
              <span>学号: {{ userInfo?.studentId }}</span>
              <el-divider direction="vertical" />
              <span>状态: {{ getStatusLabel(userInfo?.status) }}</span>
            </div>

            <!-- 所属班级信息 - 只读显示 -->
            <div class="class-info">
              <span class="label">所属班级：</span>
              <el-tag
                v-for="cls in userClasses"
                :key="cls.id"
                size="small"
                class="class-tag"
                type="info"
              >
                {{ cls.name }}
              </el-tag>
              <span v-if="userClasses.length === 0" class="no-class">暂无班级</span>
            </div>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-value">{{ userInfo?.statistics.completedHomeworks || 0 }}</div>
              <div class="stat-label">完成作业</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo?.statistics.completedExams || 0 }}</div>
              <div class="stat-label">完成考试</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatLearningTime(userInfo?.statistics.learningTime || 0) }}</div>
              <div class="stat-label">学习时长</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 标签页内容 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <UserBasicInfo :user-data="userInfo" />
        </el-tab-pane>

        <el-tab-pane label="学习记录" name="learning">
          <LearningRecords :user-id="userId" />
        </el-tab-pane>

        <el-tab-pane label="作业记录" name="homework">
          <HomeworkRecords :user-id="userId" />
        </el-tab-pane>

        <el-tab-pane label="考试记录" name="exam">
          <ExamRecords :user-id="userId" />
        </el-tab-pane>

        <el-tab-pane label="题库练习" name="question_bank">
          <QuestionPracticeList :user-id="userId" />
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
import { useMockStore } from '@/stores/mockStore'

// 导入组件
import UserBasicInfo from './components/UserBasicInfo.vue'
import LearningRecords from './components/LearningRecords.vue'
import HomeworkRecords from './components/HomeworkRecords.vue'
import ExamRecords from './components/ExamRecords.vue'
import QuestionPracticeList from './components/QuestionPracticeList.vue'

const router = useRouter()
const route = useRoute()
const mockStore = useMockStore()

// 响应式数据
const userId = ref(route.params.id)
const activeTab = ref('basic')

// 计算属性
// 从 Store 中获取该学生关联的班级（单向引用），而不是从学生对象本身的字段获取
const userClasses = computed(() => {
  return mockStore.getClassesByStudentId(userId.value)
})

// 模拟用户信息数据
const userInfo = computed(() => {
  // 从 mockStore 获取学生详细信息
  const student = mockStore.students.find(s => s.id === userId.value)
  if (!student) return null

  return {
    ...student,
    statistics: {
      completedHomeworks: 8,
      completedExams: 2,
      learningTime: 4560, // 分钟
      averageScore: 82.5,
      practiceSessions: 15
    }
  }
})

// 方法
const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  // 注意：这里不再包含班级编辑功能
  ElMessage.info('编辑学生基本信息（不包含班级信息）')
}

const getStatusLabel = (status) => {
  const map = {
    new: '新生',
    studying: '在读',
    suspended: '停课',
    archived: '封存',
    finished: '结课',
    refunded: '退费'
  }
  return map[status] || status
}

const formatLearningTime = (minutes) => {
  if (!minutes) return '0小时'
  const hours = Math.floor(minutes / 60)
  return `${hours}小时`
}

// 生命周期
onMounted(() => {
  if (!mockStore.initialized) {
    mockStore.initialize()
  }
})
</script>

<style lang="scss" scoped>
.user-detail-container {
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

.user-overview {
  padding: 24px;

  .overview-content {
    display: flex;
    gap: 24px;
    align-items: flex-start;

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
        margin-bottom: 12px;
      }

      .class-info {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .label {
          font-size: 14px;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .class-tag {
          margin-right: 8px;
        }

        .no-class {
          font-size: 14px;
          color: var(--color-text-placeholder);
        }
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
</style>