<template>
  <div class="grading-workbench">
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft" text size="large">返回</el-button>
      <div class="header-info">
        <h1>批改{{ typeText }}：{{ title }}</h1>
        <p>{{ getClassName(classId) }} · 已批改 {{ gradedCount }}/{{ submissions.length }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="prevSubmission" :disabled="currentIndex === 0">
          <el-icon><ArrowLeft /></el-icon> 上一份
        </el-button>
        <span class="progress-text">{{ currentIndex + 1 }} / {{ submissions.length }}</span>
        <el-button @click="nextSubmission" :disabled="currentIndex >= submissions.length - 1">
          下一份 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <el-row :gutter="24" v-if="currentSubmission">
      <!-- 左侧：学生答案 -->
      <el-col :span="16">
        <el-card shadow="never" class="answers-card">
          <template #header>
            <div class="student-header">
              <el-avatar :size="40" :src="currentSubmission.avatar" />
              <div class="student-info">
                <div class="name">{{ currentSubmission.studentName }}</div>
                <div class="meta">学号：{{ currentSubmission.studentId }} · 提交时间：{{ currentSubmission.submitTime }}</div>
                <div class="meta" v-if="type === 'exam' && currentSubmission.score">
                  <span style="color: #409eff; font-weight: bold;">得分：{{ currentSubmission.score }} / {{ currentSubmission.totalScore }}分</span>
                </div>
              </div>
              <el-tag v-if="currentSubmission.isGraded" type="success">已批改</el-tag>
              <el-tag v-else type="warning">待批改</el-tag>
            </div>
          </template>

          <div class="answers-list">
            <div v-for="(answer, index) in currentSubmission.answers" :key="index" class="answer-item">
              <div class="question-header">
                <span class="question-num">第{{ index + 1 }}题</span>
                <el-tag :type="getTypeTagType(answer.type)" size="small">{{ getTypeLabel(answer.type) }}</el-tag>
                <span class="question-score" v-if="type === 'exam' && answer.score">{{ answer.score }}分</span>
              </div>
              <div class="question-text">{{ answer.questionText }}</div>

              <!-- 学生答案 -->
              <div class="student-answer">
                <div class="answer-label">学生答案：</div>

                <!-- 编程题答案 -->
                <div v-if="answer.type === 'programming'" class="programming-answer">
                  <pre class="code-content">{{ answer.userAnswer || '未作答' }}</pre>
                  <div v-if="answer.files && answer.files.length > 0" class="file-list">
                    <div class="file-label">提交文件：</div>
                    <el-tag v-for="file in answer.files" :key="file" type="info" size="small">{{ file }}</el-tag>
                  </div>
                </div>

                <!-- Scratch题答案 -->
                <div v-else-if="answer.type === 'scratch'" class="scratch-answer">
                  <div class="scratch-content">
                    {{ answer.userAnswer || '未作答' }}
                  </div>
                  <div v-if="answer.files && answer.files.length > 0" class="file-list">
                    <div class="file-label">作品文件：</div>
                    <el-tag v-for="file in answer.files" :key="file" type="info" size="small">{{ file }}</el-tag>
                  </div>
                  <div v-if="answer.projectUrl" class="project-url">
                    <div class="file-label">项目链接：</div>
                    <el-link :href="answer.projectUrl" target="_blank" type="primary">查看Scratch作品</el-link>
                  </div>
                </div>

                <!-- 其他题型答案 -->
                <div v-else class="answer-content" :class="{ correct: answer.isCorrect, wrong: answer.isCorrect === false }">
                  {{ answer.userAnswer || '未作答' }}
                </div>
              </div>

              <!-- 参考答案 -->
              <div class="correct-answer" v-if="answer.correctAnswer">
                <div class="answer-label">参考答案：</div>
                <div class="answer-content correct">{{ answer.correctAnswer }}</div>
              </div>

              <!-- 得分显示（考试特有） -->
              <div v-if="type === 'exam' && answer.studentScore !== undefined" class="score-display">
                <div class="answer-label">得分：</div>
                <div class="score-value">{{ answer.studentScore }} / {{ answer.score }}分</div>
              </div>

              <!-- 评语输入 -->
              <div class="comment-section">
                <el-input v-model="answer.comment" type="textarea" :rows="2" placeholder="输入评语（可选）" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：批改操作 -->
      <el-col :span="8">
        <el-card shadow="never" class="grading-panel">
          <template #header><span class="card-title">{{ typeText }}评价</span></template>

          <div class="total-score" v-if="type === 'exam' && currentSubmission.score">
            <div class="label">总分</div>
            <div class="score-display">{{ currentSubmission.score }} / {{ currentSubmission.totalScore }}分</div>
          </div>

          <div class="total-comment">
            <div class="label">总体评语</div>
            <el-input v-model="currentSubmission.totalComment" type="textarea" :rows="4" placeholder="输入总体评语" />
          </div>

          <div class="grading-actions">
            <el-button type="primary" size="large" @click="submitGrading" style="width: 100%">
              <el-icon><Check /></el-icon> 提交评语
            </el-button>
          </div>
        </el-card>

        <!-- 提交列表 -->
        <el-card shadow="never" class="submissions-list-card">
          <template #header><span class="card-title">提交列表</span></template>
          <div class="submissions-list">
            <div
              v-for="(sub, idx) in submissions"
              :key="sub.id"
              class="submission-item"
              :class="{ active: idx === currentIndex, graded: sub.isGraded }"
              @click="switchSubmission(idx)"
            >
              <el-avatar :size="32" :src="sub.avatar" />
              <div class="sub-info">
                <div class="sub-name">{{ sub.studentName }}</div>
                <div class="sub-score" v-if="type === 'exam' && sub.score">{{ sub.score }}分</div>
                <div class="sub-status">
                  <el-tag v-if="sub.isGraded" type="success" size="small">已批改</el-tag>
                  <el-tag v-else type="info" size="small">待批改</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Check } from '@element-plus/icons-vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({
  type: {
    type: String,
    default: 'homework',
    validator: (value) => ['homework', 'exam'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  submissions: {
    type: Array,
    required: true
  },
  classes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit-grading'])

const router = useRouter()
const currentIndex = ref(0)

const typeText = computed(() => props.type === 'homework' ? '作业' : '考试')
const currentSubmission = computed(() => props.submissions[currentIndex.value] || null)
const gradedCount = computed(() => props.submissions.filter(s => s.isGraded).length)

const getClassName = (classId) => props.classes.find(c => c.id === classId)?.name || '未知班级'
const getTypeLabel = (type) => ({
  single: '单选',
  multiple: '多选',
  fill: '填空',
  essay: '问答',
  programming: '编程',
  scratch: 'Scratch',
  'true/false': '判断'
}[type] || type)
const getTypeTagType = (type) => ({
  single: 'primary',
  multiple: 'success',
  fill: 'warning',
  essay: 'info',
  programming: 'danger',
  scratch: '',
  'true/false': 'warning'
}[type] || '')

const goBack = () => router.back()
const prevSubmission = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextSubmission = () => { if (currentIndex.value < props.submissions.length - 1) currentIndex.value++ }

const submitGrading = () => {
  if (currentSubmission.value) {
    // 如果是考试，计算总分
    if (props.type === 'exam') {
      const totalScore = currentSubmission.value.answers.reduce((sum, answer) => sum + (answer.studentScore || 0), 0)
      currentSubmission.value.score = totalScore
    }

    currentSubmission.value.isGraded = true
    emit('submit-grading', currentSubmission.value)
    ElMessage.success(`已完成 ${currentSubmission.value.studentName} 的${typeText.value}批改`)
    if (currentIndex.value < props.submissions.length - 1) {
      currentIndex.value++
    }
  }
}

const switchSubmission = (idx) => {
  currentIndex.value = idx
}

// 自动批改功能
const autoGradeSubmission = (submission) => {
  if (!submission) return

  submission.answers.forEach(answer => {
    if (answer.correctAnswer) {
      // 单选题
      if (answer.type === 'single') {
        answer.isCorrect = answer.userAnswer === answer.correctAnswer
        if (!answer.comment) {
          answer.comment = answer.isCorrect ? '答案正确' : '答案错误'
        }
        if (props.type === 'exam' && answer.studentScore === undefined) {
          answer.studentScore = answer.isCorrect ? answer.score : 0
        }
      }
      // 多选题
      else if (answer.type === 'multiple') {
        const isCorrect = JSON.stringify(answer.userAnswer.sort()) === JSON.stringify(answer.correctAnswer.sort())
        answer.isCorrect = isCorrect
        if (!answer.comment) {
          answer.comment = isCorrect ? '答案正确' : '答案错误'
        }
        if (props.type === 'exam' && answer.studentScore === undefined) {
          answer.studentScore = isCorrect ? answer.score : Math.floor(answer.score * 0.5)
        }
      }
      // 填空题
      else if (answer.type === 'fill') {
        const isCorrect = answer.userAnswer.trim().toLowerCase() === answer.correctAnswer.trim().toLowerCase()
        answer.isCorrect = isCorrect
        if (!answer.comment) {
          answer.comment = isCorrect ? '答案正确' : '答案错误'
        }
        if (props.type === 'exam' && answer.studentScore === undefined) {
          answer.studentScore = isCorrect ? answer.score : 0
        }
      }
      // 判断题
      else if (answer.type === 'true/false') {
        const isCorrect = answer.userAnswer === answer.correctAnswer
        answer.isCorrect = isCorrect
        if (!answer.comment) {
          answer.comment = isCorrect ? '答案正确' : '答案错误'
        }
        if (props.type === 'exam' && answer.studentScore === undefined) {
          answer.studentScore = isCorrect ? answer.score : 0
        }
      }
    }
    // 主观题不自动批改，保留人工批改
    else {
      if (answer.isCorrect === null) answer.isCorrect = null
      if (props.type === 'exam' && answer.studentScore === undefined) answer.studentScore = 0
    }
  })
}

// 组件挂载时进行自动批改
onMounted(() => {
  autoGradeSubmission(currentSubmission.value)
})

// 当切换提交记录时也进行自动批改
watch(currentSubmission, (newSubmission) => {
  autoGradeSubmission(newSubmission)
}, { immediate: true })
</script>

<style lang="scss" scoped>
.grading-workbench {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f5f7fa;

  .page-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;
    .header-info { flex: 1; }
    h1 { font-size: 20px; font-weight: 600; color: #303133; margin: 0 0 4px 0; }
    p { font-size: 14px; color: #909399; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .progress-text { font-size: 14px; color: #606266; font-weight: 500; }
  }

  .answers-card {
    .student-header {
      display: flex;
      align-items: center;
      gap: 12px;
      .student-info {
        flex: 1;
        .name { font-size: 16px; font-weight: 600; color: #303133; }
        .meta { font-size: 13px; color: #909399; }
      }
    }

    .answers-list {
      .answer-item {
        padding: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        margin-bottom: 16px;
        &:last-child { margin-bottom: 0; }

        .question-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          .question-score {
            margin-left: auto;
            color: #409eff;
            font-weight: 500;
          }
        }
        .question-num { font-weight: 600; color: #409eff; }
        .question-text { font-size: 14px; color: #303133; margin-bottom: 12px; line-height: 1.6; }

        .student-answer, .correct-answer {
          margin-bottom: 12px;
          .answer-label { font-size: 13px; color: #909399; margin-bottom: 4px; }
          .answer-content {
            padding: 12px;
            background: #f5f7fa;
            border-radius: 6px;
            font-size: 14px;
            &.correct { background: #f0f9eb; color: #67c23a; }
            &.wrong { background: #fef0f0; color: #f56c6c; }
          }
        }

        .score-display {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          .answer-label { font-size: 13px; color: #909399; }
          .score-value {
            font-size: 14px;
            font-weight: 600;
            color: #409eff;
          }
        }

        .comment-section {
          .answer-label { font-size: 13px; color: #909399; margin-bottom: 4px; }
        }

        // 编程题样式
        .programming-answer {
          .code-content {
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 16px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            line-height: 1.45;
            overflow-x: auto;
            color: #24292e;
          }

          .file-list {
            margin-top: 8px;
            .file-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
            .el-tag {
              margin-right: 4px;
              margin-bottom: 4px;
            }
          }
        }

        // Scratch题样式
        .scratch-answer {
          .scratch-content {
            background: #fff8dc;
            border: 1px solid #f0e68c;
            border-radius: 6px;
            padding: 12px;
            min-height: 40px;
          }

          .file-list {
            margin-top: 8px;
            .file-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
            .el-tag {
              margin-right: 4px;
              margin-bottom: 4px;
              background: #ff8c1a;
              border-color: #ff8c1a;
              color: white;
            }
          }

          .project-url {
            margin-top: 8px;
            .file-label {
              font-size: 12px;
              color: #909399;
              margin-bottom: 4px;
            }
          }
        }
      }
    }
  }

  .grading-panel {
    margin-bottom: 24px;
    .card-title { font-size: 16px; font-weight: 600; }
    .total-score {
      margin-bottom: 20px;
      .label { font-size: 14px; color: #606266; margin-bottom: 8px; }
      .score-display {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
      }
    }
    .total-comment { margin-bottom: 20px; }
    .label { font-size: 14px; color: #606266; margin-bottom: 8px; }
  }

  .submissions-list-card {
    .card-title { font-size: 16px; font-weight: 600; }
    .submissions-list {
      max-height: 400px;
      overflow-y: auto;
      .submission-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        &:hover { background: #f5f7fa; }
        &.active { background: #ecf5ff; border: 1px solid #409eff; }
        &.graded { opacity: 0.7; }
        .sub-info {
          flex: 1;
          .sub-name { font-size: 14px; font-weight: 500; color: #303133; }
          .sub-score {
            font-size: 12px;
            color: #409eff;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>