<template>
  <div class="v2-assignment-create">
    <!-- 5步骤创建向导 -->
    <el-steps :active="currentStep" finish-status="success" align-center>
      <el-step title="基础信息" />
      <el-step title="选择题目" />
      <el-step title="作业设置" />
      <el-step title="时间安排" />
      <el-step title="确认创建" />
    </el-steps>

    <div class="step-content">
      <!-- 步骤 1: 基础信息 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h4>基础信息</h4>
        <el-form :model="assignmentData" :rules="basicRules" ref="basicForm" label-width="100px">
          <el-form-item label="作业标题" prop="title">
            <el-input
              v-model="assignmentData.title"
              placeholder="请输入作业标题"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="作业描述" prop="description">
            <el-input
              v-model="assignmentData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入作业描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="选择班级" prop="classId">
            <el-select v-model="assignmentData.classId" placeholder="选择班级">
              <el-option
                v-for="cls in classes"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="作业类型" prop="type">
            <el-select v-model="assignmentData.type" placeholder="选择类型">
              <el-option label="课后作业" value="homework" />
              <el-option label="课堂测验" value="quiz" />
              <el-option label="期中考试" value="midterm" />
              <el-option label="期末考试" value="final" />
            </el-select>
          </el-form-item>
          <el-form-item label="难度级别" prop="difficulty">
            <el-select v-model="assignmentData.difficulty" placeholder="选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤 2: 选择题目 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h4>选择题目</h4>
        <div class="question-selector">
          <div class="selector-header">
            <el-radio-group v-model="questionSource" size="small">
              <el-radio-button value="bank">从题库选择</el-radio-button>
              <el-radio-button value="create">创建新题</el-radio-button>
              <el-radio-button value="import">导入题目</el-radio-button>
            </el-radio-group>

            <div class="selected-count">
              已选择 {{ selectedQuestions.length }} 题，预计总分 {{ calculateTotalScore() }} 分
            </div>
          </div>

          <!-- 题库选择 -->
          <div v-if="questionSource === 'bank'" class="bank-selector">
            <div class="bank-filters">
              <el-select v-model="filterType" placeholder="题型" clearable style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="单选题" value="single" />
                <el-option label="多选题" value="multiple" />
                <el-option label="填空题" value="fill" />
                <el-option label="判断题" value="judge" />
                <el-option label="编程题" value="programming" />
                <el-option label="简答题" value="essay" />
              </el-select>

              <el-select v-model="filterDifficulty" placeholder="难度" clearable style="width: 120px">
                <el-option label="全部" value="" />
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>

              <el-input
                v-model="searchKeyword"
                placeholder="搜索题目..."
                clearable
                style="width: 200px"
              />
            </div>

            <div class="question-grid">
              <div
                v-for="question in filteredQuestions"
                :key="question.id"
                class="question-card"
                :class="{ selected: isQuestionSelected(question.id) }"
                @click="toggleQuestionSelection(question)"
              >
                <div class="question-header">
                  <el-tag :type="getQuestionTypeTagType(question.type)" size="small">
                    {{ getQuestionTypeLabel(question.type) }}
                  </el-tag>
                  <el-tag :type="getDifficultyTagType(question.difficulty)" size="small">
                    {{ getDifficultyLabel(question.difficulty) }}
                  </el-tag>
                  <span class="question-score">{{ question.score }}分</span>
                </div>
                <div class="question-content">
                  {{ question.questionText }}
                </div>
              </div>
            </div>
          </div>

          <!-- 创建新题 -->
          <div v-else-if="questionSource === 'create'" class="create-question">
            <el-button type="primary" @click="showCreateQuestionDialog = true">
              <el-icon><Plus /></el-icon>
              创建新题目
            </el-button>
            <div v-if="assignmentData.questions.length > 0" class="created-questions">
              <h5>已创建题目</h5>
              <div class="question-list">
                <div
                  v-for="(question, index) in assignmentData.questions"
                  :key="question.id"
                  class="question-item"
                >
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span class="question-text">{{ question.questionText }}</span>
                  <span class="question-score">{{ question.score }}分</span>
                  <el-button type="text" @click="removeQuestion(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 导入题目 -->
          <div v-else class="import-question">
            <el-upload
              class="upload-demo"
              drag
              accept=".json,.xlsx,.xls"
              :auto-upload="false"
              :on-change="handleFileImport"
              :show-file-list="false"
            >
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JSON、Excel 格式，文件大小不超过 10MB
                </div>
              </template>
            </el-upload>
          </div>
        </div>
      </div>

      <!-- 步骤 3: 作业设置 -->
      <div v-if="currentStep === 2" class="step-panel">
        <h4>作业设置</h4>
        <el-form :model="assignmentData.settings" label-width="120px">
          <el-form-item label="完成度要求">
            <el-input-number
              v-model="assignmentData.settings.completionRequirement"
              :min="0"
              :max="100"
              placeholder="100"
            />
            <span style="margin-left: 8px">%</span>
          </el-form-item>
          <el-form-item label="时间限制">
            <el-input-number
              v-model="assignmentData.settings.timeLimit"
              :min="5"
              :max="480"
              placeholder="60"
            />
            <span style="margin-left: 8px">分钟</span>
          </el-form-item>
          <el-form-item label="功能选项">
            <el-checkbox-group v-model="assignmentData.settings.options">
              <el-checkbox label="randomOrder">随机题目顺序</el-checkbox>
              <el-checkbox label="randomOptions">随机选项顺序</el-checkbox>
              <el-checkbox label="showScore">提交后显示得分</el-checkbox>
              <el-checkbox label="showAnswer">提交后显示答案</el-checkbox>
              <el-checkbox label="allowReview">允许查看答案</el-checkbox>
              <el-checkbox label="preventCopy">防复制粘贴</el-checkbox>
              <el-checkbox label="autoSave">自动保存</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="批改设置">
            <el-radio-group v-model="assignmentData.settings.gradingMode">
              <el-radio label="auto">自动批改</el-radio>
              <el-radio label="manual">手动批改</el-radio>
              <el-radio label="mixed">混合批改</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤 4: 时间安排 -->
      <div v-if="currentStep === 3" class="step-panel">
        <h4>时间安排</h4>
        <el-form :model="assignmentData.schedule" :rules="scheduleRules" ref="scheduleForm" label-width="100px">
          <el-form-item label="发布时间" prop="releaseTime">
            <el-date-picker
              v-model="assignmentData.schedule.releaseTime"
              type="datetime"
              placeholder="选择发布时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="截止时间" prop="dueTime">
            <el-date-picker
              v-model="assignmentData.schedule.dueTime"
              type="datetime"
              placeholder="选择截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="提醒时间">
            <el-date-picker
              v-model="assignmentData.schedule.remindTime"
              type="datetime"
              placeholder="选择提醒时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="迟交处理">
            <el-radio-group v-model="assignmentData.schedule.latePolicy">
              <el-radio label="allow">允许迟交</el-radio>
              <el-radio label="penalty">迟交扣分</el-radio>
              <el-radio label="reject">拒绝迟交</el-radio>
            </el-radio-group>
            <el-input-number
              v-if="assignmentData.schedule.latePolicy === 'penalty'"
              v-model="assignmentData.schedule.latePenalty"
              :min="0"
              :max="100"
              placeholder="扣分比例"
              style="margin-left: 16px"
            />
            <span v-if="assignmentData.schedule.latePolicy === 'penalty'" style="margin-left: 8px">%</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤 5: 确认创建 -->
      <div v-if="currentStep === 4" class="step-panel">
        <h4>确认创建</h4>
        <div class="assignment-summary">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="作业标题" span="2">{{ assignmentData.title }}</el-descriptions-item>
            <el-descriptions-item label="作业类型">{{ getAssignmentTypeLabel(assignmentData.type) }}</el-descriptions-item>
            <el-descriptions-item label="难度级别">{{ getDifficultyLabel(assignmentData.difficulty) }}</el-descriptions-item>
            <el-descriptions-item label="题目数量">{{ assignmentData.questions.length }} 题</el-descriptions-item>
            <el-descriptions-item label="总分">{{ calculateTotalScore() }} 分</el-descriptions-item>
            <el-descriptions-item label="时间限制">{{ assignmentData.settings.timeLimit }} 分钟</el-descriptions-item>
            <el-descriptions-item label="完成度要求">{{ assignmentData.settings.completionRequirement }}%</el-descriptions-item>
            <el-descriptions-item label="发布时间" span="2">{{ assignmentData.schedule.releaseTime }}</el-descriptions-item>
            <el-descriptions-item label="截止时间" span="2">{{ assignmentData.schedule.dueTime }}</el-descriptions-item>
          </el-descriptions>

          <div class="summary-actions">
            <el-button @click="currentStep--">返回修改</el-button>
            <el-button type="primary" :loading="creating" @click="handleCreateAssignment">
              确认创建
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- V2 题目创建对话框 -->
    <V2QuestionEditDialog
      v-model="showCreateQuestionDialog"
      @save="handleAddQuestion"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Upload } from '@element-plus/icons-vue'
import V2QuestionEditDialog from './V2QuestionEditDialog.vue'

const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const currentStep = ref(0)
const creating = ref(false)
const showCreateQuestionDialog = ref(false)
const questionSource = ref('bank')
const filterType = ref('')
const filterDifficulty = ref('')
const searchKeyword = ref('')
const selectedQuestions = ref([])

const assignmentData = ref({
  title: '',
  description: '',
  type: 'homework',
  difficulty: 'medium',
  classId: '',
  questions: [],
  settings: {
    completionRequirement: 100,
    timeLimit: 60,
    options: [],
    gradingMode: 'auto'
  },
  schedule: {
    releaseTime: '',
    dueTime: '',
    remindTime: '',
    latePolicy: 'allow',
    latePenalty: 10
  }
})

const basicForm = ref(null)
const scheduleForm = ref(null)

// 表单验证规则
const basicRules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  type: [{ required: true, message: '请选择作业类型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度级别', trigger: 'change' }]
}

const scheduleRules = {
  releaseTime: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  dueTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 模拟数据
const classes = ref([
  { id: 'class_001', name: '前端开发一班' },
  { id: 'class_002', name: '前端开发二班' },
  { id: 'class_003', name: '数据科学班' }
])

const questionBank = ref([
  {
    id: 'q_001',
    type: 'single',
    questionText: 'JavaScript 中，以下哪个是基本数据类型？',
    difficulty: 'easy',
    score: 2,
    options: ['Object', 'Array', 'String', 'Function'],
    correctAnswer: 'String'
  },
  {
    id: 'q_002',
    type: 'multiple',
    questionText: '以下哪些是数组方法？',
    difficulty: 'medium',
    score: 3,
    options: ['push()', 'pop()', 'length', 'forEach()'],
    correctAnswer: ['push()', 'pop()', 'forEach()']
  },
  {
    id: 'q_003',
    type: 'fill',
    questionText: 'ES6 中用于声明变量的关键字有 let 和 _____。',
    difficulty: 'easy',
    score: 2,
    correctAnswer: 'const'
  }
])

// 计算属性
const filteredQuestions = computed(() => {
  let questions = questionBank.value

  if (filterType.value) {
    questions = questions.filter(q => q.type === filterType.value)
  }
  if (filterDifficulty.value) {
    questions = questions.filter(q => q.difficulty === filterDifficulty.value)
  }
  if (searchKeyword.value) {
    questions = questions.filter(q =>
      q.questionText.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  return questions
})

// 方法
const calculateTotalScore = () => {
  return assignmentData.value.questions.reduce((total, question) => total + (question.score || 0), 0)
}

const isQuestionSelected = (questionId) => {
  return selectedQuestions.value.includes(questionId)
}

const toggleQuestionSelection = (question) => {
  const index = selectedQuestions.value.indexOf(question.id)
  if (index > -1) {
    selectedQuestions.value.splice(index, 1)
  } else {
    selectedQuestions.value.push(question.id)
    assignmentData.value.questions.push(question)
  }
}

const removeQuestion = (index) => {
  const question = assignmentData.value.questions[index]
  const selectedIndex = selectedQuestions.value.indexOf(question.id)
  if (selectedIndex > -1) {
    selectedQuestions.value.splice(selectedIndex, 1)
  }
  assignmentData.value.questions.splice(index, 1)
}

const handleAddQuestion = (question) => {
  assignmentData.value.questions.push({
    ...question,
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  })
  ElMessage.success('题目添加成功')
}

const handleFileImport = (file) => {
  // 文件导入逻辑
  ElMessage.success('文件导入成功')
}

const handleCreateAssignment = async () => {
  if (assignmentData.value.questions.length === 0) {
    ElMessage.error('请至少添加一道题目')
    return
  }

  creating.value = true

  try {
    // 模拟创建作业
    await new Promise(resolve => setTimeout(resolve, 2000))

    emit('save', {
      ...assignmentData.value,
      id: `assignment_${Date.now()}`,
      createdAt: new Date().toISOString()
    })

    ElMessage.success('作业创建成功')
  } catch (error) {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 工具方法
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

const getQuestionTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    programming: 'danger',
    essay: 'primary'
  }
  return map[type] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || 'info'
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
.v2-assignment-create {
  padding: 20px 0;
}

.step-content {
  min-height: 400px;
  margin-top: 32px;
}

.step-panel {
  h4 {
    margin: 0 0 20px 0;
    color: var(--color-text-primary);
    font-size: 16px;
  }
}

.question-selector {
  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border-lighter);

    .selected-count {
      color: var(--color-primary);
      font-weight: 500;
    }
  }

  .bank-filters {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .question-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;

    .question-card {
      padding: 12px;
      border: 1px solid var(--color-border-base);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--color-primary);
      }

      &.selected {
        border-color: var(--color-primary);
        background-color: var(--color-primary-light-9);
      }

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .question-score {
          font-weight: 600;
          color: var(--color-success);
        }
      }

      .question-content {
        font-size: 14px;
        line-height: 1.4;
        color: var(--color-text-primary);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }

  .create-question {
    text-align: center;
    padding: 40px;

    .created-questions {
      margin-top: 24px;
      text-align: left;

      .question-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--color-border-base);
        border-radius: 6px;

        .question-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--color-border-lighter);

          &:last-child {
            border-bottom: none;
          }

          .question-number {
            min-width: 30px;
            color: var(--color-text-secondary);
          }

          .question-text {
            flex: 1;
            color: var(--color-text-primary);
          }

          .question-score {
            color: var(--color-success);
            font-weight: 600;
            min-width: 40px;
          }
        }
      }
    }
  }

  .import-question {
    text-align: center;
    padding: 40px;
  }
}

.assignment-summary {
  padding: 20px;
  background-color: var(--color-bg-primary);
  border-radius: 8px;

  .summary-actions {
    margin-top: 24px;
    text-align: center;

    .el-button {
      margin: 0 12px;
    }
  }
}
</style>