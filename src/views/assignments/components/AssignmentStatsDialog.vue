<template>
  <el-dialog
    title="完成度统计"
    v-model="visible"
    width="800px"
    append-to-body
    id="assignment-stats-dialog"
  >
    <div class="assignment-stats" v-if="assignmentData" id="assignment-stats-content">
      <el-row :gutter="20" class="stats-overview" id="stats-overview-row">
        <el-col :span="6" id="total-students-stat-col">
          <el-statistic title="总学生数" :value="statsData.totalStudents" id="total-students-stat" />
        </el-col>
        <el-col :span="6" id="submitted-count-col">
          <el-statistic title="已提交" :value="statsData.submittedCount" id="submitted-count-stat" />
        </el-col>
        <el-col :span="6" id="completion-rate-col">
          <el-statistic title="提交率" :value="statsData.completionRate" suffix="%" id="completion-rate-stat" />
        </el-col>
        <el-col :span="6" id="avg-completion-col">
          <el-statistic title="平均完成度" :value="statsData.averageCompletionRate" suffix="%" id="avg-completion-stat" />
        </el-col>
      </el-row>

      <el-divider />

      <div class="completion-distribution" id="completion-distribution">
        <h4>完成度分布</h4>
        <div class="completion-ranges" id="completion-ranges">
          <div class="completion-range" id="excellent-range">
            <span class="range-label">90-100%:</span>
            <el-progress :percentage="statsData.completionDistribution.excellent" color="#67c23a" id="excellent-progress" />
          </div>
          <div class="completion-range" id="good-range">
            <span class="range-label">60-89%:</span>
            <el-progress :percentage="statsData.completionDistribution.good" color="#409eff" id="good-progress" />
          </div>
          <div class="completion-range" id="average-range">
            <span class="range-label">30-59%:</span>
            <el-progress :percentage="statsData.completionDistribution.average" color="#e6a23c" id="average-progress" />
          </div>
          <div class="completion-range" id="poor-range">
            <span class="range-label">0-29%:</span>
            <el-progress :percentage="statsData.completionDistribution.poor" color="#f56c6c" id="poor-progress" />
          </div>
        </div>
      </div>

      <el-divider />

      <div class="question-stats" id="question-stats-section">
        <h4>题目答题情况</h4>
        <el-table :data="statsData.questionStats" style="width: 100%" id="question-stats-table">
          <el-table-column prop="questionTitle" label="题目" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag size="small" :id="`question-type-tag-${scope.$index}`">{{ getQuestionTypeLabel(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="answeredCount" label="作答人数" width="100" :id="`answered-count-${scope.$index}`" />
          <el-table-column prop="correctRate" label="正确率" width="120">
            <template #default="scope">
              <span :style="{ color: getCorrectRateColor(scope.row.correctRate) }" :id="`correct-rate-${scope.$index}`">
                {{ scope.row.correctRate }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer" id="stats-dialog-footer">
        <el-button @click="handleClose" id="stats-close-btn">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  assignmentData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const statsData = ref({
  totalStudents: 30,
  submittedCount: 25,
  completionRate: 83.3,
  averageCompletionRate: 75,
  completionDistribution: {
    excellent: 20,
    good: 35,
    average: 25,
    poor: 20
  },
  questionStats: []
})

const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '应用题',
    'oj': 'OJ题'
  }
  return typeMap[type] || type
}

const getCorrectRateColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const generateStatsData = () => {
  if (!props.assignmentData) return

  // 模拟统计数据生成
  const questionStats = props.assignmentData.questions?.map(question => ({
    questionTitle: question.title || `题目${question.id}`,
    type: question.type,
    answeredCount: Math.floor(Math.random() * 25) + 5,
    correctRate: Math.floor(Math.random() * 40) + 60 // 60-100
  })) || []

  statsData.value = {
    ...statsData.value,
    questionStats
  }
}

const handleClose = () => {
  visible.value = false
}


watch(() => props.assignmentData, () => {
  generateStatsData()
}, { immediate: true })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/AssignmentStatsDialog.vue`);
  });

</script>

<style scoped>
.assignment-stats {
  .stats-overview {
    margin-bottom: 20px;
  }

  .completion-distribution {
    .completion-ranges {
      .completion-range {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .range-label {
          width: 100px;
          font-size: 14px;
          color: #606266;
        }

        .el-progress {
          flex: 1;
          margin-left: 10px;
        }
      }
    }
  }

  .question-stats {
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }
  }
}
</style>