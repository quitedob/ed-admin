<template>
  <el-dialog
    v-model="visible"
    :title="exam ? '编辑考试' : '新建考试'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="基本信息" />
      <el-step title="时间安排" />
      <el-step title="组建试卷" />
      <el-step title="阅卷设置" />
      <el-step title="考试设置" />
    </el-steps>

    <div class="step-content" style="margin-top: 30px">
      <!-- 步骤1：基本信息 -->
      <div v-if="activeStep === 0" class="step-form">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="考试标题" required>
            <el-input v-model="formData.title" placeholder="请输入考试标题" />
          </el-form-item>

          <el-form-item label="考试描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入考试描述"
            />
          </el-form-item>

          <el-form-item label="考试类型" required>
            <el-select v-model="formData.type" placeholder="请选择考试类型">
              <el-option label="期中考试" value="midterm" />
              <el-option label="期末考试" value="final" />
              <el-option label="测验" value="quiz" />
            </el-select>
          </el-form-item>

          <el-form-item label="难度" required>
            <el-select v-model="formData.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>

          <el-form-item label="关联班级" required>
            <el-select v-model="formData.classId" placeholder="请选择班级">
              <el-option
                v-for="cls in classes"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2：时间安排 -->
      <div v-if="activeStep === 1" class="step-form">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="开始时间" required>
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>

          <el-form-item label="结束时间" required>
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>

          <el-form-item label="考试时长" required>
            <el-input-number v-model="formData.duration" :min="1" /> 分钟
          </el-form-item>

          <el-form-item label="复习开始时间">
            <el-date-picker
              v-model="formData.reviewStartTime"
              type="datetime"
              placeholder="选择复习开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3：组建试卷 -->
      <div v-if="activeStep === 2" class="step-form">
        <div class="paper-builder">
          <div class="builder-header">
            <h4>从题库选择题目</h4>
            <el-button type="primary" size="small" @click="showQuestionSelector">
              <el-icon><Plus /></el-icon>
              添加题目
            </el-button>
          </div>

          <el-table :data="formData.questions" stripe style="width: 100%; margin-top: 16px">
            <el-table-column prop="title" label="题目" min-width="200" />
            <el-table-column prop="type" label="题型" width="100" />
            <el-table-column prop="score" label="分值" width="80" align="center">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.score"
                  :min="1"
                  :max="100"
                  size="small"
                  @change="updateTotalScore"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row, $index }">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeQuestion($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="score-summary" style="margin-top: 16px">
            <span>总分: {{ formData.totalScore }} 分</span>
            <el-input-number
              v-model="formData.passingScore"
              :min="0"
              :max="formData.totalScore"
              placeholder="及格分数"
              style="margin-left: 20px"
            />
            <span style="margin-left: 8px">及格分数</span>
          </div>
        </div>
      </div>

      <!-- 步骤4：阅卷设置 -->
      <div v-if="activeStep === 3" class="step-form">
        <el-form :model="formData" label-width="120px">
          <el-form-item label="自动评分">
            <el-switch v-model="formData.autoGrade" />
          </el-form-item>

          <el-form-item label="AI批改">
            <el-select v-model="formData.aiModel" placeholder="选择AI模型" :disabled="!formData.autoGrade">
              <el-option label="GPT-4" value="gpt4" />
              <el-option label="GPT-3.5" value="gpt35" />
              <el-option label="Claude" value="claude" />
            </el-select>
          </el-form-item>

          <el-form-item label="人工复审">
            <el-switch v-model="formData.manualReview" />
          </el-form-item>

          <el-form-item label="评卷老师" v-if="formData.manualReview">
            <el-select
              v-model="formData.reviewers"
              multiple
              placeholder="选择评卷老师"
            >
              <el-option label="王老师" value="teacher_001" />
              <el-option label="李老师" value="teacher_002" />
              <el-option label="张老师" value="teacher_003" />
            </el-select>
          </el-form-item>

          <el-form-item label="批改截止时间">
            <el-date-picker
              v-model="formData.gradingDeadline"
              type="datetime"
              placeholder="选择批改截止时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤5：考试设置 -->
      <div v-if="activeStep === 4" class="step-form">
        <el-form :model="formData" label-width="120px">
          <el-form-item label="成绩显示模式">
            <el-select v-model="formData.scoreDisplayMode" placeholder="选择成绩显示模式">
              <el-option label="考试后立即显示" value="immediate" />
              <el-option label="考试结束后显示" value="afterEnd" />
              <el-option label="批改完成后显示" value="afterGrade" />
              <el-option label="不显示" value="hidden" />
            </el-select>
          </el-form-item>

          <el-form-item label="随机出题">
            <el-switch v-model="formData.randomOrder" />
          </el-form-item>

          <el-form-item label="防作弊设置">
            <el-checkbox-group v-model="formData.antiCheatSettings">
              <el-checkbox label="禁止复制">禁止复制</el-checkbox>
              <el-checkbox label="禁止截屏">禁止截屏</el-checkbox>
              <el-checkbox label="全屏模式">全屏模式</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="监考设置">
            <el-checkbox-group v-model="formData.proctorSettings">
              <el-checkbox label="摄像头监考">摄像头监考</el-checkbox>
              <el-checkbox label="人脸识别">人脸识别</el-checkbox>
              <el-checkbox label="异常行为检测">异常行为检测</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="handlePrevStep" v-if="activeStep > 0">上一步</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleNextStep" v-if="activeStep < 4">下一步</el-button>
      <el-button type="primary" @click="handleSubmit" v-if="activeStep === 4">完成</el-button>
    </template>
  </el-dialog>

  <!-- 题目选择对话框 -->
  <QuestionSelectorDialog
    v-model="questionSelectorVisible"
    @select="handleSelectQuestions"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import QuestionSelectorDialog from '../../homework/components/QuestionSelectorDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  exam: Object,
  classes: Array
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(props.modelValue)
const activeStep = ref(0)
const questionSelectorVisible = ref(false)

const formData = ref({
  title: '',
  description: '',
  type: 'midterm',
  difficulty: 'medium',
  classId: '',
  startTime: '',
  endTime: '',
  duration: 120,
  reviewStartTime: '',
  questions: [],
  totalScore: 0,
  passingScore: 60,
  autoGrade: true,
  aiModel: 'gpt4',
  manualReview: false,
  reviewers: [],
  gradingDeadline: '',
  scoreDisplayMode: 'afterGrade',
  randomOrder: false,
  antiCheatSettings: [],
  proctorSettings: []
})

const handleNextStep = () => {
  if (activeStep.value < 4) {
    activeStep.value++
  }
}

const handlePrevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

const handleSubmit = () => {
  if (!formData.value.title) {
    ElMessage.warning('请输入考试标题')
    return
  }

  if (formData.value.questions.length === 0) {
    ElMessage.warning('请至少添加一道题目')
    return
  }

  emit('save', {
    ...formData.value,
    className: props.classes.find(c => c.id === formData.value.classId)?.name,
    status: 'notStarted'
  })

  handleClose()
}

const handleClose = () => {
  visible.value = false
  activeStep.value = 0
  emit('update:modelValue', false)
}

const showQuestionSelector = () => {
  questionSelectorVisible.value = true
}

const handleSelectQuestions = (questions) => {
  formData.value.questions.push(...questions)
  updateTotalScore()
  ElMessage.success(`已添加 ${questions.length} 道题目`)
}

const removeQuestion = (index) => {
  formData.value.questions.splice(index, 1)
  updateTotalScore()
}

const updateTotalScore = () => {
  formData.value.totalScore = formData.value.questions.reduce((sum, q) => sum + (q.score || 0), 0)
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.exam, (val) => {
  if (val) {
    formData.value = { ...val }
  }
}, { immediate: true })
</script>

<style scoped>
.step-content {
  min-height: 300px;
}

.step-form {
  padding: 20px 0;
}

.paper-builder {
  padding: 20px 0;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.builder-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.score-summary {
  display: flex;
  align-items: center;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  font-weight: 500;
}
</style>
