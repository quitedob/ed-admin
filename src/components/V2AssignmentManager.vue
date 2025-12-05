<template>
  <div class="v2-assignment-manager">
    <!-- 卡片式布局 -->
    <div class="assignment-grid">
      <el-card
        v-for="assignment in assignments"
        :key="assignment.id"
        class="assignment-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <div class="assignment-info">
              <h3 class="assignment-title">{{ assignment.title }}</h3>
              <el-tag :type="getStatusTagType(assignment.status)" size="small">
                {{ getStatusLabel(assignment.status) }}
              </el-tag>
            </div>
            <div class="assignment-actions">
              <el-button type="text" @click="handleEdit(assignment)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="text" @click="handleDelete(assignment)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <div class="card-content">
          <div class="assignment-meta">
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>{{ assignment.questionCount }} 道题</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDuration(assignment.duration) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ assignment.studentCount }} 学生</span>
            </div>
          </div>

          <div class="assignment-stats">
            <div class="stat-item">
              <span class="stat-label">完成率</span>
              <el-progress
                :percentage="assignment.completionRate"
                :color="getProgressColor(assignment.completionRate)"
                :show-text="false"
                :stroke-width="6"
              />
              <span class="stat-value">{{ assignment.completionRate }}%</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button type="primary" size="small" @click="handleView(assignment)">
              查看详情
            </el-button>
            <el-button type="success" size="small" @click="handleGrade(assignment)">
              批改作业
            </el-button>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 创建作业向导 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建作业"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-steps :active="createStep" finish-status="success" align-center>
        <el-step title="基础信息" />
        <el-step title="添加题目" />
        <el-step title="设置选项" />
        <el-step title="发布设置" />
        <el-step title="确认创建" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤 1: 基础信息 -->
        <div v-if="createStep === 0" class="step-panel">
          <h4>基础信息</h4>
          <el-form :model="newAssignment" label-width="100px">
            <el-form-item label="作业标题" required>
              <el-input v-model="newAssignment.title" placeholder="请输入作业标题" />
            </el-form-item>
            <el-form-item label="作业描述">
              <el-input
                v-model="newAssignment.description"
                type="textarea"
                :rows="3"
                placeholder="请输入作业描述"
              />
            </el-form-item>
            <el-form-item label="选择班级" required>
              <el-select v-model="newAssignment.classId" placeholder="选择班级">
                <el-option
                  v-for="cls in classes"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="作业类型">
              <el-select v-model="newAssignment.type" placeholder="选择类型">
                <el-option label="课后作业" value="homework" />
                <el-option label="课堂测验" value="quiz" />
                <el-option label="期中考试" value="midterm" />
                <el-option label="期末考试" value="final" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤 2: 添加题目 -->
        <div v-if="createStep === 1" class="step-panel">
          <h4>添加题目</h4>
          <div class="question-selector">
            <div class="selector-tabs">
              <el-radio-group v-model="questionSource" size="small">
                <el-radio-button value="bank">从题库选择</el-radio-button>
                <el-radio-button value="create">创建新题</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 题库选择 -->
            <div v-if="questionSource === 'bank'" class="bank-selector">
              <el-select
                v-model="selectedBank"
                placeholder="选择题库"
                style="width: 200px; margin-bottom: 16px"
              >
                <el-option
                  v-for="bank in questionBanks"
                  :key="bank.id"
                  :label="bank.name"
                  :value="bank.id"
                />
              </el-select>

              <div class="question-list">
                <el-checkbox-group v-model="selectedQuestions">
                  <div
                    v-for="question in filteredQuestions"
                    :key="question.id"
                    class="question-item"
                  >
                    <el-checkbox :label="question.id" :value="question.id">
                      <div class="question-info">
                        <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
                        <span class="question-text">{{ question.questionText }}</span>
                        <span class="question-score">{{ question.score }}分</span>
                      </div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </div>
            </div>

            <!-- 创建新题 -->
            <div v-else class="create-question">
              <V2QuestionEditDialog
                v-model="createQuestionDialogVisible"
                @save="handleAddNewQuestion"
              />
              <el-button type="primary" @click="createQuestionDialogVisible = true">
                <el-icon><Plus /></el-icon>
                创建新题目
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 3: 设置选项 -->
        <div v-if="createStep === 2" class="step-panel">
          <h4>设置选项</h4>
          <el-form :model="newAssignment" label-width="120px">
            <el-form-item label="时间限制">
              <el-input-number
                v-model="newAssignment.duration"
                :min="5"
                :max="480"
                placeholder="分钟"
              />
              <span style="margin-left: 8px">分钟</span>
            </el-form-item>
            <el-form-item label="完成度要求">
              <el-input-number
                v-model="newAssignment.completionRequirement"
                :min="0"
                :max="100"
                placeholder="100"
              />
              <span style="margin-left: 8px">%</span>
            </el-form-item>
            <el-form-item label="设置选项">
              <el-checkbox-group v-model="newAssignment.options">
                <el-checkbox label="randomOrder">随机题目顺序</el-checkbox>
                <el-checkbox label="showResult">提交后显示结果</el-checkbox>
                <el-checkbox label="allowReview">允许查看答案</el-checkbox>
                <el-checkbox label="preventCopy">防复制粘贴</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤 4: 发布设置 -->
        <div v-if="createStep === 3" class="step-panel">
          <h4>发布设置</h4>
          <el-form :model="newAssignment.schedule" label-width="100px">
            <el-form-item label="发布时间" required>
              <el-date-picker
                v-model="newAssignment.schedule.releaseTime"
                type="datetime"
                placeholder="选择发布时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="截止时间" required>
              <el-date-picker
                v-model="newAssignment.schedule.dueTime"
                type="datetime"
                placeholder="选择截止时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="提醒时间">
              <el-date-picker
                v-model="newAssignment.schedule.remindTime"
                type="datetime"
                placeholder="选择提醒时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 步骤 5: 确认创建 -->
        <div v-if="createStep === 4" class="step-panel">
          <h4>确认创建</h4>
          <div class="assignment-summary">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="作业标题">{{ newAssignment.title }}</el-descriptions-item>
              <el-descriptions-item label="作业类型">{{ getAssignmentTypeLabel(newAssignment.type) }}</el-descriptions-item>
              <el-descriptions-item label="题目数量">{{ newAssignment.questions.length }} 题</el-descriptions-item>
              <el-descriptions-item label="预计时长">{{ newAssignment.duration }} 分钟</el-descriptions-item>
              <el-descriptions-item label="发布时间">{{ newAssignment.schedule.releaseTime }}</el-descriptions-item>
              <el-descriptions-item label="截止时间">{{ newAssignment.schedule.dueTime }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelCreate">取消</el-button>
          <el-button v-if="createStep > 0" @click="createStep--">上一步</el-button>
          <el-button v-if="createStep < 4" type="primary" @click="handleNextStep">下一步</el-button>
          <el-button v-else type="primary" @click="handleConfirmCreate">确认创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- V2 题目编辑对话框 -->
    <V2QuestionEditDialog
      v-model="createQuestionDialogVisible"
      @save="handleAddNewQuestion"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Document, Clock, User, Plus } from '@element-plus/icons-vue'
import V2QuestionEditDialog from './V2QuestionEditDialog.vue'

const emit = defineEmits(['edit', 'delete', 'view', 'grade'])

// 响应式数据
const assignments = ref([
  {
    id: 'hw_001',
    title: '第一章作业：基础概念',
    status: 'published',
    questionCount: 15,
    duration: 45,
    studentCount: 30,
    completionRate: 75,
    type: 'homework'
  },
  {
    id: 'hw_002',
    title: '第二章作业：进阶练习',
    status: 'published',
    questionCount: 20,
    duration: 60,
    studentCount: 30,
    completionRate: 60,
    type: 'homework'
  },
  {
    id: 'quiz_001',
    title: '期中测验',
    status: 'draft',
    questionCount: 25,
    duration: 90,
    studentCount: 30,
    completionRate: 0,
    type: 'quiz'
  }
])

const createDialogVisible = ref(false)
const createStep = ref(0)
const createQuestionDialogVisible = ref(false)
const questionSource = ref('bank')
const selectedBank = ref('')
const selectedQuestions = ref([])

const newAssignment = ref({
  title: '',
  description: '',
  type: 'homework',
  classId: '',
  duration: 60,
  completionRequirement: 100,
  questions: [],
  options: [],
  schedule: {
    releaseTime: '',
    dueTime: '',
    remindTime: ''
  }
})

const classes = ref([
  { id: 'class_001', name: '前端开发一班' },
  { id: 'class_002', name: '前端开发二班' },
  { id: 'class_003', name: '数据科学班' }
])

const questionBanks = ref([
  { id: 'bank_001', name: 'JavaScript 基础题库' },
  { id: 'bank_002', name: '算法题库' },
  { id: 'bank_003', name: '数据库题库' }
])

const filteredQuestions = ref([
  { id: 'q_001', type: 'single', questionText: 'JavaScript 中，以下哪个是基本数据类型？', score: 2 },
  { id: 'q_002', type: 'multiple', questionText: '以下哪些是数组方法？', score: 3 },
  { id: 'q_003', type: 'fill', questionText: 'ES6 中用于声明变量的关键字有 let 和 _____。', score: 2 }
])

// 方法
const handleEdit = (assignment) => {
  emit('edit', assignment)
}

const handleDelete = (assignment) => {
  ElMessageBox.confirm(
    `确定要删除作业"${assignment.title}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 删除逻辑
    ElMessage.success('删除成功')
  })
}

const handleView = (assignment) => {
  emit('view', assignment)
}

const handleGrade = (assignment) => {
  emit('grade', assignment)
}

const handleNextStep = () => {
  // 验证当前步骤
  if (createStep.value === 0 && !newAssignment.value.title) {
    ElMessage.error('请输入作业标题')
    return
  }
  if (createStep.value === 1 && newAssignment.value.questions.length === 0) {
    ElMessage.error('请至少添加一道题目')
    return
  }
  createStep.value++
}

const handleCancelCreate = () => {
  createDialogVisible.value = false
  createStep.value = 0
  resetNewAssignment()
}

const handleConfirmCreate = () => {
  // 创建作业逻辑
  ElMessage.success('作业创建成功')
  createDialogVisible.value = false
  createStep.value = 0
  resetNewAssignment()
}

const handleAddNewQuestion = (question) => {
  newAssignment.value.questions.push(question)
  ElMessage.success('题目添加成功')
}

const resetNewAssignment = () => {
  newAssignment.value = {
    title: '',
    description: '',
    type: 'homework',
    classId: '',
    duration: 60,
    completionRequirement: 100,
    questions: [],
    options: [],
    schedule: {
      releaseTime: '',
      dueTime: '',
      remindTime: ''
    }
  }
}

// 工具方法
const getStatusTagType = (status) => {
  const map = {
    published: 'success',
    draft: 'info',
    ended: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    ended: '已结束'
  }
  return map[status] || status
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分钟`
}

const getQuestionTypeLabel = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    programming: '编程题',
    essay: '简答题'
  }
  return map[type] || type
}

const getAssignmentTypeLabel = (type) => {
  const map = {
    homework: '课后作业',
    quiz: '课堂测验',
    midterm: '期中考试',
    final: '期末考试'
  }
  return map[type] || type
}
</script>

<style lang="scss" scoped>
.v2-assignment-manager {
  padding: 24px;
  background-color: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.assignment-card {
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .assignment-info {
      flex: 1;

      .assignment-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .assignment-actions {
      display: flex;
      gap: 8px;
    }
  }

  .card-content {
    .assignment-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--color-text-secondary);
      }
    }

    .assignment-stats {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .stat-label {
          font-size: 13px;
          color: var(--color-text-secondary);
          min-width: 50px;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          min-width: 40px;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    gap: 12px;
  }
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

.step-panel {
  h4 {
    margin: 0 0 20px 0;
    color: var(--color-text-primary);
  }

  .question-selector {
    .selector-tabs {
      margin-bottom: 20px;
    }

    .bank-selector {
      .question-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--color-border-base);
        border-radius: 6px;
        padding: 12px;

        .question-item {
          margin-bottom: 12px;
          padding: 12px;
          border: 1px solid var(--color-border-lighter);
          border-radius: 6px;
          transition: all 0.3s;

          &:hover {
            border-color: var(--color-primary);
          }

          .question-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .question-type {
              padding: 2px 8px;
              background-color: var(--color-primary-light-9);
              color: var(--color-primary);
              border-radius: 4px;
              font-size: 12px;
            }

            .question-text {
              flex: 1;
              color: var(--color-text-primary);
            }

            .question-score {
              color: var(--color-success);
              font-weight: 600;
            }
          }
        }
      }
    }

    .create-question {
      text-align: center;
      padding: 40px;
    }
  }

  .assignment-summary {
    padding: 20px;
    background-color: var(--color-bg-primary);
    border-radius: 8px;
  }
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-lighter);
}
</style>