<template>
  <div class="lecturer-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回老师列表</el-button>
    </div>

    <!-- 基本信息卡片 -->
    <div class="info-cards">
      <div class="basic-info-card">
        <div class="avatar-section">
          <el-avatar :size="120" :src="lecturerInfo.avatar" fit="cover">
            <el-icon size="60"><User /></el-icon>
          </el-avatar>
          <div class="status-badge">
            <el-tag :type="getStatusTagType(lecturerInfo.status)" size="large">
              {{ getStatusLabel(lecturerInfo.status) }}
            </el-tag>
          </div>
        </div>
        <div class="info-section">
          <h2>{{ lecturerInfo.name }}</h2>
          <div class="info-item">
            <span class="label">工号：</span>
            <span class="value">{{ lecturerInfo.teacherId }}</span>
          </div>
          <div class="info-item">
            <span class="label">职称：</span>
            <span class="value">{{ lecturerInfo.title }}</span>
          </div>
          <div class="info-item">
            <span class="label">部门：</span>
            <span class="value">{{ lecturerInfo.department }}</span>
          </div>
          <div class="info-item">
            <span class="label">专业领域：</span>
            <span class="value">{{ lecturerInfo.specialty }}</span>
          </div>
          <div class="info-item">
            <span class="label">入职时间：</span>
            <span class="value">{{ formatDate(lecturerInfo.joinDate) }}</span>
          </div>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="handleEdit">编辑信息</el-button>
          <el-button @click="handleAuthorize">授权班级</el-button>
        </div>
      </div>

      <!-- 联系信息卡片 -->
      <div class="contact-card">
        <h3>联系方式</h3>
        <div class="info-item">
          <span class="label">手机：</span>
          <span class="value">{{ lecturerInfo.phone }}</span>
        </div>
        <div class="info-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ lecturerInfo.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">地址：</span>
          <span class="value">{{ lecturerInfo.address }}</span>
        </div>
        <div class="info-item">
          <span class="label">性别：</span>
          <span class="value">{{ getGenderLabel(lecturerInfo.gender) }}</span>
        </div>
        <div class="info-item">
          <span class="label">出生日期：</span>
          <span class="value">{{ formatDate(lecturerInfo.birthDate) }}</span>
        </div>
      </div>
    </div>

    <!-- 详细信息标签页 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 个人简介 -->
      <el-tab-pane label="个人简介" name="bio">
        <div class="tab-content">
          <h4>个人简介</h4>
          <div class="bio-content">
            {{ lecturerInfo.bio || '暂无个人简介' }}
          </div>

          <h4>教学经验</h4>
          <div class="experience-content">
            {{ lecturerInfo.experience || '暂无教学经验信息' }}
          </div>

          <h4>获得荣誉</h4>
          <div class="honors-content">
            {{ lecturerInfo.honors || '暂无荣誉信息' }}
          </div>
        </div>
      </el-tab-pane>

      <!-- 负责班级 -->
      <el-tab-pane label="负责班级" name="classes">
        <div class="tab-content">
          <div class="class-header">
            <h4>负责班级列表</h4>
            <el-button type="primary" @click="handleAuthorize">管理班级</el-button>
          </div>
          <div v-if="lecturerInfo.authorizedClasses && lecturerInfo.authorizedClasses.length > 0" class="class-list">
            <el-card
              v-for="cls in lecturerInfo.authorizedClasses"
              :key="cls.id"
              class="class-item"
            >
              <div class="class-info">
                <h5>{{ cls.name }}</h5>
                <div class="class-meta">
                  <span>班级ID: {{ cls.id }}</span>
                  <el-tag size="small">负责老师</el-tag>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂未分配任何班级" />
        </div>
      </el-tab-pane>

      <!-- 统计信息 -->
      <el-tab-pane label="统计信息" name="stats">
        <div class="tab-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic title="负责班级数" :value="lecturerInfo.classCount || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="教学年限" :value="getTeachingYears(lecturerInfo.joinDate)" suffix="年" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="学生总数" :value="stats.totalStudents || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="课程数" :value="stats.courseCount || 0" />
            </el-col>
          </el-row>

          <div class="chart-section">
            <h4>教学质量评估</h4>
            <div class="quality-stats">
              <div class="quality-item">
                <span class="quality-label">教学评分:</span>
                <el-rate v-model="stats.teachingScore" disabled show-score />
              </div>
              <div class="quality-item">
                <span class="quality-label">学生满意度:</span>
                <el-progress
                  :percentage="stats.studentSatisfaction || 0"
                  :color="getProgressColor(stats.studentSatisfaction || 0)"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <div class="tab-content">
          <div class="log-header">
            <h4>操作记录</h4>
            <el-button @click="refreshLogs">刷新</el-button>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="log in operationLogs"
              :key="log.id"
              :timestamp="formatDateTime(log.timestamp)"
              :type="getLogType(log.type)"
            >
              <div class="log-content">
                <div class="log-action">{{ log.action }}</div>
                <div class="log-operator">操作人: {{ log.operator }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 授权班级对话框 -->
    <AuthorizeDialog
      v-model="authorizeDialogVisible"
      :teacher-id="lecturerInfo.id"
      :authorized-classes="lecturerInfo.authorizedClasses || []"
      @update:authorized-classes="handleAuthorizeUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import AuthorizeDialog from '../components/AuthorizeDialog.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const activeTab = ref('bio')
const lecturerInfo = ref({})
const authorizeDialogVisible = ref(false)

// 统计数据
const stats = ref({
  totalStudents: 156,
  courseCount: 8,
  teachingScore: 4.5,
  studentSatisfaction: 92
})

// 操作日志
const operationLogs = ref([
  {
    id: 1,
    action: '更新个人基本信息',
    operator: 'admin',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'update'
  },
  {
    id: 2,
    action: '分配新班级: 三年级一班',
    operator: 'admin',
    timestamp: '2024-01-10T14:20:00Z',
    type: 'create'
  },
  {
    id: 3,
    action: '账号状态变更: 活跃 → 停用',
    operator: 'system',
    timestamp: '2023-12-20T09:15:00Z',
    type: 'warning'
  }
])

// 计算属性
const lecturerId = computed(() => route.params.id)

// 方法
const initLecturerInfo = () => {
  // 模拟从API获取数据
  const mockLecturer = {
    id: lecturerId.value,
    teacherId: 'T001',
    name: '王老师',
    phone: '13800138000',
    email: 'wang@example.com',
    gender: 'male',
    birthDate: '1985-06-15',
    joinDate: '2020-09-01',
    status: 'active',
    education: 'master',
    title: '高级教师',
    department: '数学教研组',
    specialty: '高等数学',
    address: '北京市朝阳区',
    bio: '拥有15年教学经验的资深数学教师，专注于高中数学教学，擅长培养学生的逻辑思维能力。',
    experience: '曾获得市级优秀教师称号，擅长高中数学教学，指导多名学生在数学竞赛中获奖。',
    honors: '2021年市级优秀教师，2020年教学竞赛一等奖，2019年优秀班主任',
    avatar: '',
    classCount: 3,
    authorizedClasses: [
      { id: 'cls_001', name: '一年级一班' },
      { id: 'cls_002', name: '五年级二班' },
      { id: 'cls_003', name: '三年级一班' }
    ]
  }

  lecturerInfo.value = mockLecturer
}

const goBack = () => {
  router.push('/users/lecturer/list')
}

const handleEdit = () => {
  router.push(`/users/lecturer/edit/${lecturerInfo.value.id}`)
}

const handleAuthorize = () => {
  authorizeDialogVisible.value = true
}

const handleAuthorizeUpdate = (authorizedClasses) => {
  lecturerInfo.value.authorizedClasses = authorizedClasses
  lecturerInfo.value.classCount = authorizedClasses.length
  ElMessage.success('班级授权已更新')
}

const refreshLogs = () => {
  ElMessage.success('日志已刷新')
}

// 工具方法
const getStatusLabel = (status) => {
  const map = {
    active: '活跃',
    inactive: '停用'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'info'
  }
  return map[status] || ''
}

const getGenderLabel = (gender) => {
  const map = {
    male: '男',
    female: '女'
  }
  return map[gender] || gender
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getTeachingYears = (joinDate) => {
  if (!joinDate) return 0
  const join = new Date(joinDate)
  const now = new Date()
  return now.getFullYear() - join.getFullYear()
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

const getLogType = (type) => {
  const map = {
    create: 'success',
    update: 'primary',
    delete: 'danger',
    warning: 'warning'
  }
  return map[type] || 'info'
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/users/lecturer/detail/index.vue`)
  initLecturerInfo()
})
</script>

<style lang="scss" scoped>
.lecturer-detail-container {
  padding: 24px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.back-button {
  margin-bottom: 20px;
}

.info-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.basic-info-card {
  flex: 2;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 24px;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .status-badge {
      margin-top: 8px;
    }
  }

  .info-section {
    flex: 1;

    h2 {
      margin: 0 0 16px 0;
      color: #303133;
      font-size: 24px;
    }

    .info-item {
      display: flex;
      margin-bottom: 12px;

      .label {
        min-width: 80px;
        color: #909399;
        font-weight: 500;
      }

      .value {
        color: #303133;
      }
    }
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.contact-card {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  h3 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 18px;
  }

  .info-item {
    display: flex;
    margin-bottom: 12px;

    .label {
      min-width: 80px;
      color: #909399;
      font-weight: 500;
    }

    .value {
      color: #303133;
    }
  }
}

.detail-tabs {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tab-content {
  padding: 24px;

  h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 16px;

    &:not(:first-child) {
      margin-top: 24px;
    }
  }
}

.bio-content,
.experience-content,
.honors-content {
  line-height: 1.6;
  color: #606266;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.class-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.class-item {
  .class-info {
    h5 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .class-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #909399;
      font-size: 14px;
    }
  }
}

.chart-section {
  margin-top: 32px;

  h4 {
    margin-bottom: 20px;
  }
}

.quality-stats {
  .quality-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .quality-label {
      min-width: 120px;
      font-weight: 500;
      color: #606266;
    }
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.log-content {
  .log-action {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
  }

  .log-operator {
    font-size: 14px;
    color: #909399;
  }
}
</style>