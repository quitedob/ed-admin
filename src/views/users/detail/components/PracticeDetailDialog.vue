<template>
  <el-dialog
    v-model="visible"
    :title="`练习详情 - ${practiceRecord?.questionBankName || ''}`"
    width="800px"
    @close="handleClose"
  >
    <div v-if="practiceRecord" class="practice-detail">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>练习信息</span>
            <el-tag :type="getStatusType(practiceRecord.status)" size="small">
              {{ getStatusLabel(practiceRecord.status) }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="题库名称">
            {{ practiceRecord.questionBankName }}
          </el-descriptions-item>
          <el-descriptions-item label="所属课程">
            {{ practiceRecord.courseName }}
          </el-descriptions-item>
          <el-descriptions-item label="题目数量">
            {{ practiceRecord.questionCount }} 题
          </el-descriptions-item>
          <el-descriptions-item label="正确题数">
            <el-text type="success">{{ practiceRecord.correctCount }} 题</el-text>
          </el-descriptions-item>
          <el-descriptions-item label="正确率">
            <el-progress
              :percentage="practiceRecord.correctRate"
              :color="getProgressColor(practiceRecord.correctRate)"
              :show-text="false"
              style="width: 100px"
            />
            <span class="ml-2">{{ practiceRecord.correctRate }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="用时">
            {{ formatPracticeTime(practiceRecord.duration) }}
          </el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-tag :type="getDifficultyType(practiceRecord.difficulty)" size="small">
              {{ getDifficultyLabel(practiceRecord.difficulty) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="练习时间">
            {{ formatDateTime(practiceRecord.timestamp) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 答题分析 -->
      <el-card class="analysis-card" shadow="never" style="margin-top: 16px">
        <template #header>
          <span>答题分析</span>
        </template>

        <div class="analysis-content">
          <div class="chart-container">
            <div class="chart-item">
              <h4>正确率分布</h4>
              <div class="rate-circle">
                <el-progress
                  type="circle"
                  :percentage="practiceRecord.correctRate"
                  :width="120"
                  :color="getProgressColor(practiceRecord.correctRate)"
                >
                  <template #default="{ percentage }">
                    <span class="percentage-text">{{ percentage }}%</span>
                  </template>
                </el-progress>
              </div>
            </div>

            <div class="chart-item">
              <h4>题型分布</h4>
              <div class="question-types">
                <div class="type-item">
                  <span>单选题</span>
                  <el-progress :percentage="70" :show-text="false" />
                  <span class="count">14题</span>
                </div>
                <div class="type-item">
                  <span>多选题</span>
                  <el-progress :percentage="20" :show-text="false" />
                  <span class="count">4题</span>
                </div>
                <div class="type-item">
                  <span>判断题</span>
                  <el-progress :percentage="10" :show-text="false" />
                  <span class="count">2题</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 题目列表 -->
          <div class="questions-list">
            <h4>题目详情</h4>
            <el-table :data="mockQuestionDetails" size="small" max-height="300">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="type" label="题型" width="80">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="content" label="题目内容" min-width="200" show-overflow-tooltip />
              <el-table-column label="答题状态" width="100" align="center">
                <template #default="{ row }">
                  <el-icon v-if="row.correct" color="#67c23a"><Check /></el-icon>
                  <el-icon v-else color="#f56c6c"><Close /></el-icon>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="用时" width="80" align="center">
                <template #default="{ row }">
                  {{ row.time }}s
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>

      <!-- 改进建议 -->
      <el-card class="suggestion-card" shadow="never" style="margin-top: 16px">
        <template #header>
          <span>改进建议</span>
        </template>

        <div class="suggestions">
          <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
            <el-icon class="suggestion-icon"><InfoFilled /></el-icon>
            <span>{{ suggestion }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportReport">导出报告</el-button>
        <el-button type="success" @click="handleRetest">重新测试</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  practiceRecord: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 模拟题目详情数据
const mockQuestionDetails = ref([
  { type: '单选', content: 'JavaScript中typeof null的结果是什么？', correct: true, time: 15 },
  { type: '单选', content: 'Vue.js的核心特性包括哪些？', correct: true, time: 30 },
  { type: '多选', content: '以下哪些是ES6新增的特性？', correct: false, time: 45 },
  { type: '判断', content: 'React是一个前端框架', correct: true, time: 10 },
  { type: '单选', content: 'CSS中flex布局的主轴是什么？', correct: false, time: 25 }
])

// 改进建议
const suggestions = computed(() => {
  if (!props.practiceRecord) return []

  const suggestions = []
  const correctRate = props.practiceRecord.correctRate

  if (correctRate < 60) {
    suggestions.push('建议先复习基础概念，加强对知识点的理解')
    suggestions.push('可以尝试降低练习难度，逐步提升')
  } else if (correctRate < 80) {
    suggestions.push('整体表现不错，建议重点练习错误较多的知识点')
    suggestions.push('注意提升答题速度，合理分配时间')
  } else {
    suggestions.push('表现优秀！建议挑战更高难度的题目')
    suggestions.push('可以尝试在规定时间内完成更多题目')
  }

  if (props.practiceRecord.difficulty === 'easy' && correctRate > 90) {
    suggestions.push('当前难度对你来说可能偏简单，建议提升挑战等级')
  }

  return suggestions
})

// 方法
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

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const map = {
    completed: 'success',
    in_progress: 'warning',
    abandoned: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    completed: '已完成',
    in_progress: '进行中',
    abandoned: '已放弃'
  }
  return map[status] || status
}

const getDifficultyType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 80) return '#e6a23c'
  return '#f56c6c'
}

const handleClose = () => {
  visible.value = false
}

const handleExportReport = () => {
  ElMessage.success('练习报告导出成功')
}

const handleRetest = () => {
  ElMessage.info('跳转到重新测试页面')
  handleClose()
}
</script>

<style lang="scss" scoped>
.practice-detail {
  .info-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .analysis-card {
    .analysis-content {
      .chart-container {
        display: flex;
        gap: 40px;
        margin-bottom: 30px;

        .chart-item {
          flex: 1;

          h4 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--color-text-primary);
          }

          .rate-circle {
            text-align: center;

            .percentage-text {
              font-size: 18px;
              font-weight: 600;
            }
          }

          .question-types {
            .type-item {
              display: flex;
              align-items: center;
              margin-bottom: 12px;

              span:first-child {
                width: 80px;
                font-size: 14px;
              }

              .el-progress {
                flex: 1;
                margin: 0 12px;
              }

              .count {
                width: 40px;
                text-align: right;
                font-size: 14px;
                color: var(--color-text-secondary);
              }
            }
          }
        }
      }

      .questions-list {
        h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--color-text-primary);
        }
      }
    }
  }

  .suggestion-card {
    .suggestions {
      .suggestion-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }

        .suggestion-icon {
          color: var(--color-primary);
          margin-right: 8px;
          margin-top: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>