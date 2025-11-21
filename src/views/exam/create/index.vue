<template>
  <div id="exam-create-container" class="exam-create-container">
    <!-- 顶部导航 -->
    <div id="exam-top-bar" class="top-bar">
      <div id="exam-title-section" class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ isEdit ? '编辑考试' : '创建考试' }}</span>
      </div>
      <div id="exam-action-buttons" class="action-buttons">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布考试</el-button>
      </div>
    </div>

    <!-- 步骤条 -->
    <div id="exam-steps-container" class="steps-container">
      <el-steps :active="currentStep" align-center finish-status="success" id="exam-steps">
        <el-step title="基本信息" />
        <el-step title="时间安排" />
        <el-step title="组建试卷" />
        <el-step title="阅卷设置" />
        <el-step title="考试设置" />
      </el-steps>
    </div>

    <!-- 主内容区 -->
    <div id="exam-main-content" class="main-content">
      <el-form ref="formRef" :model="examForm" :rules="rules" label-width="120px" id="exam-form">
        <!-- 第一步：基本信息 -->
        <div v-show="currentStep === 0" id="step-basic-info" class="step-content">
          <el-card shadow="never" id="basic-info-card">
            <template #header>
              <span class="step-title">基本信息</span>
            </template>

            <el-form-item label="考试标题" prop="title">
              <el-input
                v-model="examForm.title"
                placeholder="请输入考试标题"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="考试描述" prop="description">
              <el-input
                v-model="examForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入考试描述"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="考试类型" prop="type">
                  <el-select v-model="examForm.type" placeholder="请选择考试类型">
                    <el-option label="测验" value="quiz" />
                    <el-option label="期中考试" value="midterm" />
                    <el-option label="期末考试" value="final" />
                    <el-option label="编程考试" value="programming" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="难度等级" prop="difficulty">
                  <el-select v-model="examForm.difficulty" placeholder="请选择难度">
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="关联班级" prop="classId">
              <el-select v-model="examForm.classId" placeholder="请选择班级">
                <el-option label="前端开发一班" value="class_001" />
                <el-option label="前端开发二班" value="class_002" />
              </el-select>
            </el-form-item>
          </el-card>
        </div>

        <!-- 第二步：时间安排 -->
        <div v-show="currentStep === 1" id="step-time-schedule" class="step-content">
          <el-card shadow="never" id="time-schedule-card">
            <template #header>
              <span class="step-title">时间安排</span>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="考试开始" prop="startTime">
                  <el-date-picker
                    v-model="examForm.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="考试结束" prop="endTime">
                  <el-date-picker
                    v-model="examForm.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="考试时长" prop="duration">
              <el-input-number
                v-model="examForm.duration"
                :min="10"
                :max="300"
                :step="10"
              />
              <span style="margin-left: 12px">分钟</span>
            </el-form-item>

            <el-form-item label="复习开始">
              <el-date-picker
                v-model="examForm.reviewStartTime"
                type="datetime"
                placeholder="选择复习开始时间（可选）"
                style="width: 100%"
              />
              <div class="form-tip">学生可以在此时间后查看试卷和答案</div>
            </el-form-item>
          </el-card>
        </div>

        <!-- 第三步：组建试卷 -->
        <div v-show="currentStep === 2" id="step-paper-builder" class="step-content">
          <PaperBuilder
            v-model:question-banks="examForm.questionBanks"
            v-model:total-score="examForm.totalScore"
            v-model:passing-score="examForm.passingScore"
            id="paper-builder"
          />
        </div>

        <!-- 第四步：阅卷设置 -->
        <div v-show="currentStep === 3" id="step-grading-settings" class="step-content">
          <el-card shadow="never" id="grading-settings-card">
            <template #header>
              <span class="step-title">阅卷设置</span>
            </template>

            <el-form-item label="自动评分">
              <el-switch v-model="examForm.grading.autoGrade" />
              <div class="form-tip">选择题和填空题将自动评分</div>
            </el-form-item>

            <el-form-item label="AI批改">
              <el-switch v-model="examForm.grading.aiGrade" />
              <div class="form-tip">启用AI辅助批改问答题和编程题</div>
            </el-form-item>

            <div v-if="examForm.grading.aiGrade" id="ai-config-section" class="ai-config-section">
              <el-form-item label="AI模型">
                <el-select v-model="examForm.grading.aiModel">
                  <el-option label="GPT-4" value="gpt-4" />
                  <el-option label="GPT-3.5" value="gpt-3.5" />
                  <el-option label="Claude" value="claude" />
                </el-select>
              </el-form-item>

              <el-form-item label="AI评分规则">
                <el-input
                  v-model="examForm.grading.aiScoringRule"
                  type="textarea"
                  :rows="3"
                  placeholder="输入AI评分的标准和要求"
                />
              </el-form-item>

              <el-form-item label="启用AI的题型">
                <el-checkbox-group v-model="examForm.grading.aiEnabledTypes">
                  <el-checkbox label="essay">问答题</el-checkbox>
                  <el-checkbox label="programming">编程题</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>

            <el-form-item label="人工复审">
              <el-switch v-model="examForm.grading.manualReview" />
              <div class="form-tip">需要教师确认最终分数</div>
            </el-form-item>

            <el-form-item v-if="examForm.grading.manualReview" label="评卷老师">
              <el-select
                v-model="examForm.grading.reviewers"
                multiple
                placeholder="选择评卷老师"
              >
                <el-option label="张老师" value="teacher_001" />
                <el-option label="李老师" value="teacher_002" />
                <el-option label="王老师" value="teacher_003" />
              </el-select>
            </el-form-item>

            <el-form-item label="批改截止">
              <el-date-picker
                v-model="examForm.grading.gradingDeadline"
                type="datetime"
                placeholder="选择批改截止时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-card>
        </div>

        <!-- 第五步：考试设置 -->
        <div v-show="currentStep === 4" id="step-exam-settings" class="step-content">
          <el-card shadow="never" id="exam-settings-card">
            <template #header>
              <span class="step-title">考试设置</span>
            </template>

            <el-form-item label="显示成绩">
              <el-radio-group v-model="examForm.settings.showScoreMode" id="score-display-mode">
                <el-radio label="immediate">考完立即显示</el-radio>
                <el-radio label="scheduled">指定时间显示</el-radio>
                <el-radio label="manual">手动发布</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item
              v-if="examForm.settings.showScoreMode === 'scheduled'"
              label="显示时间"
            >
              <el-date-picker
                v-model="examForm.settings.showScoreTime"
                type="datetime"
                placeholder="选择成绩显示时间"
                style="width: 100%"
              />
            </el-form-item>

            <el-divider />

            <el-form-item label="随机出题">
              <el-switch v-model="examForm.settings.randomQuestions" />
              <div class="form-tip">从题库中随机抽取题目</div>
            </el-form-item>

            <el-form-item label="随机顺序">
              <el-switch v-model="examForm.settings.randomOrder" />
              <div class="form-tip">打乱题目和选项顺序</div>
            </el-form-item>

            <el-divider />

            <el-form-item label="禁用复制粘贴">
              <el-switch v-model="examForm.settings.disableCopyPaste" />
            </el-form-item>

            <el-form-item label="全屏模式">
              <el-switch v-model="examForm.settings.fullscreenRequired" />
              <div class="form-tip">要求学生全屏答题</div>
            </el-form-item>

            <el-divider />

            <el-form-item label="监考设置">
              <el-radio-group v-model="examForm.settings.proctorMode" id="proctor-mode">
                <el-radio label="none">不需要监考</el-radio>
                <el-radio label="camera">摄像头监考</el-radio>
                <el-radio label="screen">屏幕录制</el-radio>
                <el-radio label="both">摄像头+屏幕</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="examForm.settings.proctorMode !== 'none'" label="监考频率">
              <el-select v-model="examForm.settings.proctorFrequency">
                <el-option label="每5分钟" value="5" />
                <el-option label="每10分钟" value="10" />
                <el-option label="每15分钟" value="15" />
                <el-option label="持续监控" value="continuous" />
              </el-select>
            </el-form-item>

            <el-divider />

            <el-form-item label="允许切屏">
              <el-switch v-model="examForm.settings.allowTabSwitch" />
              <div class="form-tip">允许学生切换浏览器标签页</div>
            </el-form-item>

            <el-form-item v-if="!examForm.settings.allowTabSwitch" label="切屏次数限制">
              <el-input-number
                v-model="examForm.settings.maxTabSwitches"
                :min="0"
                :max="10"
              />
              <span style="margin-left: 12px">次（超过后自动提交）</span>
            </el-form-item>
          </el-card>
        </div>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div id="exam-bottom-bar" class="bottom-bar">
      <el-button v-if="currentStep > 0" @click="handlePrevStep">上一步</el-button>
      <el-button v-if="currentStep < 4" type="primary" @click="handleNextStep">
        下一步
      </el-button>
      <el-button v-if="currentStep === 4" type="success" @click="handleComplete">
        完成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import PaperBuilder from './components/PaperBuilder.vue'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const currentStep = ref(0)
const formRef = ref()

// 表单数据
const examForm = ref({
  title: '',
  description: '',
  type: 'quiz',
  difficulty: 'medium',
  classId: '',
  startTime: null,
  endTime: null,
  duration: 90,
  reviewStartTime: null,
  questionBanks: [],
  totalScore: 0,
  passingScore: 60,
  grading: {
    autoGrade: true,
    aiGrade: true,
    aiModel: 'gpt-4',
    aiScoringRule: '',
    aiEnabledTypes: ['essay', 'programming'],
    manualReview: true,
    reviewers: [],
    gradingDeadline: null
  },
  settings: {
    showScoreMode: 'immediate',
    showScoreTime: null,
    randomQuestions: false,
    randomOrder: true,
    disableCopyPaste: true,
    fullscreenRequired: false,
    proctorMode: 'none',
    proctorFrequency: '10',
    allowTabSwitch: false,
    maxTabSwitches: 3
  }
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入考试标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入考试时长', trigger: 'blur' }]
}

// 方法
const handleBack = () => {
  router.back()
}

const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleNextStep = () => {
  // 验证当前步骤
  if (currentStep.value === 0) {
    formRef.value.validateField(['title', 'type', 'classId'], (valid) => {
      if (valid) {
        currentStep.value++
      }
    })
  } else if (currentStep.value === 1) {
    formRef.value.validateField(['startTime', 'endTime', 'duration'], (valid) => {
      if (valid) {
        currentStep.value++
      }
    })
  } else if (currentStep.value === 2) {
    if (examForm.value.questionBanks.length === 0) {
      ElMessage.warning('请至少添加一道题目')
      return
    }
    currentStep.value++
  } else {
    currentStep.value++
  }
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

const handlePublish = () => {
  ElMessageBox.confirm('确定要发布该考试吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('考试发布成功')
    router.push('/exam/list')
  })
}

const handleComplete = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      handlePublish()
    }
  })
}

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    // 加载考试数据
  }
})
</script>

<style lang="scss" scoped>
.exam-create-container {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
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

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.steps-container {
  padding: 24px;
  background: white;
  border-bottom: 1px solid var(--color-border-light);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .step-content {
    max-width: 900px;
    margin: 0 auto;

    .step-title {
      font-size: 16px;
      font-weight: 600;
    }

    .form-tip {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }

    .ai-config-section {
      margin-left: 24px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
    }
  }
}

.bottom-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid var(--color-border-light);
}
</style>
