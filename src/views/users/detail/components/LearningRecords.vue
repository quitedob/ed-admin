<template>
  <div class="learning-records">
    <el-card shadow="never">
      <div class="records-header">
        <h3>学习记录</h3>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </div>

      <!-- 学习统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">12</div>
              <div class="stat-label">学习天数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">45h</div>
              <div class="stat-label">总学习时长</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">85%</div>
              <div class="stat-label">平均进度</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">92</div>
              <div class="stat-label">平均成绩</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近学习活动 -->
      <div class="recent-activities">
        <h4>最近学习活动</h4>
        <el-timeline>
          <el-timeline-item
            v-for="activity in recentActivities"
            :key="activity.id"
            :timestamp="formatDateTime(activity.timestamp)"
            :type="activity.type"
          >
            <div class="activity-content">
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.description }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const dateRange = ref([])
const recentActivities = ref([
  {
    id: 1,
    title: '完成了作业：JavaScript基础练习',
    description: '得分：45/50，用时：45分钟',
    timestamp: '2024-12-20T10:30:00Z',
    type: 'success'
  },
  {
    id: 2,
    title: '观看了课程视频：Vue组件开发',
    description: '学习时长：30分钟，完成度：100%',
    timestamp: '2024-12-19T14:20:00Z',
    type: 'primary'
  },
  {
    id: 3,
    title: '参加了考试：JavaScript期中测试',
    description: '得分：85/100，排名：班级第3名',
    timestamp: '2024-12-18T09:00:00Z',
    type: 'warning'
  }
])

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  console.log('加载学习记录:', props.userId)
})
</script>

<style lang="scss" scoped>
.learning-records {
  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
  }

  .stats-row {
    margin-bottom: 30px;

    .stat-card {
      text-align: center;

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-text-secondary);
        }
      }
    }
  }

  .recent-activities {
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .activity-content {
      strong {
        color: var(--color-text-primary);
      }

      p {
        margin: 4px 0 0 0;
        color: var(--color-text-secondary);
        font-size: 14px;
      }
    }
  }
}
</style>