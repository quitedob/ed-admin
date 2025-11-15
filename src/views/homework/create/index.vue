<template>
  <div class="homework-edit-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">{{ isEdit ? '编辑作业' : '新建作业' }} > {{ form.title || '未命名作业' }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handlePreview">预览</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handlePublish">发布</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <!-- 基本信息 -->
        <el-collapse v-model="activeCollapse" class="form-section">
          <el-collapse-item title="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="作业标题" prop="title">
                  <el-input v-model="form.title" placeholder="请输入作业标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="关联班级" prop="classId">
                  <el-select v-model="form.classId" placeholder="请选择班级">
                    <el-option label="前端开发一班" value="class_001" />
                    <el-option label="前端开发二班" value="class_002" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="作业描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入作业描述"
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="作业类型" prop="type">
                  <el-select v-model="form.type" placeholder="请选择类型">
                    <el-option label="练习" value="exercise" />
                    <el-option label="考查" value="exam" />
                    <el-option label="综合" value="practice" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="难度等级" prop="difficulty">
                  <el-select v-model="form.difficulty" placeholder="请选择难度">
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>

          <!-- 时间安排 -->
          <el-collapse-item title="时间安排" name="schedule">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="发布时间" prop="releaseTime">
                  <el-date-picker
                    v-model="form.releaseTime"
                    type="datetime"
                    placeholder="选择发布时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="截止时间" prop="dueTime">
                  <el-date-picker
                    v-model="form.dueTime"
                    type="datetime"
                    placeholder="选择截止时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="提醒时间" prop="remindTime">
                  <el-date-picker
                    v-model="form.remindTime"
                    type="datetime"
                    placeholder="选择提醒时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="允许晚交">
              <el-switch v-model="form.settings.allowLateSubmission" />
              <span style="margin-left: 12px; font-size: 13px; color: var(--color-text-secondary)">
                开启后学生可在截止时间后提交
              </span>
            </el-form-item>
          </el-collapse-item>

          <!-- 题目管理 -->
          <el-collapse-item title="题目管理" name="questions">
            <div class="question-management">
              <!-- 左侧：已添加题目列表 -->
              <div class="question-list-panel">
                <div class="panel-header">
                  <span class="panel-title">已添加题目 ({{ form.questions.length }}道)</span>
                  <span class="total-score">总分: {{ totalScore }}分</span>
                </div>

                <draggable
                  v-model="form.questions"
                  item-key="id"
                  class="question-items"
                  handle=".drag-handle"
                >
                  <template #item="{ element, index }">
                    <div
                      :class="['question-item', { active: selectedQuestionIndex === index }]"
                      @click="selectQuestion(index)"
                    >
                      <div class="question-item-content">
                        <el-icon class="drag-handle"><Rank /></el-icon>
                        <span class="question-number">{{ index + 1 }}.</span>
                        <el-tag :type="getTypeTagType(element.type)" size="small">
                          {{ getTypeLabel(element.type) }}
                        </el-tag>
                        <span class="question-score">{{ element.score }}分</span>
                      </div>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click.stop="removeQuestion(index)"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </template>
                </draggable>

                <div class="add-question-buttons">
                  <el-button type="primary" plain @click="handleAddFromBank">
                    <el-icon><Plus /></el-icon>
                    从题库选择
                  </el-button>
                </div>
              </div>

              <!-- 右侧：题目编辑/详情 -->
              <div class="question-detail-panel">
                <div v-if="selectedQuestion" class="question-detail">
                  <div class="detail-header">
                    <h3>题目 {{ selectedQuestionIndex + 1 }}</h3>
                    <el-tag :type="getTypeTagType(selectedQuestion.type)">
                      {{ getTypeLabel(selectedQuestion.type) }}
                    </el-tag>
                  </div>

                  <!-- 题目内容（只读） -->
                  <div class="question-content-readonly">
                    <div class="content-label">题目内容</div>
                    <div class="content-text">{{ selectedQuestion.questionText }}</div>

                    <!-- 选择题选项 -->
                    <div v-if="['single', 'multiple'].includes(selectedQuestion.type)" class="options-display">
                      <div
                        v-for="option in selectedQuestion.options"
                        :key="option.value"
                        class="option-item"
                      >
                        <span class="option-label">{{ option.value }}.</span>
                        <span class="option-text">{{ option.text }}</span>
                        <el-tag
                          v-if="isCorrectOption(option)"
                          type="success"
                          size="small"
                        >
                          正确答案
                        </el-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 作业特定设置 -->
                  <div class="homework-specific-settings">
                    <el-divider content-position="left">作业设置</el-divider>

                    <el-form-item label="本题分值">
                      <el-input-number
                        v-model="selectedQuestion.score"
                        :min="1"
                        :max="100"
                        @change="updateTotalScore"
                      />
                    </el-form-item>

                    <el-form-item label="是否必做">
                      <el-switch v-model="selectedQuestion.required" />
                    </el-form-item>

                    <el-form-item label="补充解析">
                      <el-input
                        v-model="selectedQuestion.homeworkExplanation"
                        type="textarea"
                        :rows="3"
                        placeholder="可以为本作业添加特定的答案解析"
                      />
                    </el-form-item>
                  </div>
                </div>

                <el-empty v-else description="请选择或添加题目" />
              </div>
            </div>
          </el-collapse-item>

          <!-- 阅卷设置 -->
          <el-collapse-item title="阅卷设置" name="grading">
            <div class="grading-settings">
              <h4>评分方式</h4>
              <el-checkbox v-model="form.settings.autoGrade">
                自动评分（选择题/填空题自动批改）
              </el-checkbox>
              <el-checkbox v-model="form.settings.aiGrade">
                AI辅助批改（问答题）
              </el-checkbox>

              <div v-if="form.settings.aiGrade" class="ai-settings">
                <el-form-item label="AI模型">
                  <el-select v-model="form.settings.aiModel">
                    <el-option label="GPT-4" value="gpt-4" />
                    <el-option label="GPT-3.5" value="gpt-3.5" />
                    <el-option label="Claude" value="claude" />
                  </el-select>
                </el-form-item>
                <el-form-item label="评分标准">
                  <el-input
                    v-model="form.settings.aiScoringRule"
                    type="textarea"
                    :rows="3"
                    placeholder="输入AI评分的标准和要求"
                  />
                </el-form-item>
              </div>

              <el-checkbox v-model="form.settings.manualReview">
                人工复审（需要老师确认最终分数）
              </el-checkbox>

              <el-divider />

              <h4>其他设置</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-checkbox v-model="form.settings.showCorrectAnswers">
                    显示正确答案
                  </el-checkbox>
                </el-col>
                <el-col :span="12">
                  <el-checkbox v-model="form.settings.immediateGrading">
                    立即评分
                  </el-checkbox>
                </el-col>
              </el-row>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>

    <!-- 从题库选择对话框 -->
    <QuestionBankSelector
      v-model="bankSelectorVisible"
      @select="handleQuestionsSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Plus,
  Close,
  Rank
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import QuestionBankSelector from './components/QuestionBankSelector.vue'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)

// 响应式数据
const formRef = ref()
const activeCollapse = ref(['basic', 'schedule', 'questions', 'grading'])
const selectedQuestionIndex = ref(null)
const bankSelectorVisible = ref(false)

const form = ref({
  title: '',
  classId: '',
  description: '',
  type: 'exercise',
  difficulty: 'easy',
  releaseTime: null,
  dueTime: null,
  remindTime: null,
  questions: [],
  settings: {
    autoGrade: true,
    aiGrade: true,
    aiModel: 'gpt-4',
    aiScoringRule: '',
    manualReview: true,
    allowLateSubmission: true,
    showCorrectAnswers: true,
    immediateGrading: true
  }
})

const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  type: [{ required: true, message: '请选择作业类型', trigger: 'change' }],
  dueTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 计算属性
const selectedQuestion = computed(() => {
  if (selectedQuestionIndex.value === null) return null
  return form.value.questions[selectedQuestionIndex.value]
})

const totalScore = computed(() => {
  return form.value.questions.reduce((sum, q) => sum + (q.score || 0), 0)
})

// 方法
const handleBack = () => {
  router.back()
}

const selectQuestion = (index) => {
  selectedQuestionIndex.value = index
}

const removeQuestion = (index) => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    form.value.questions.splice(index, 1)
    if (selectedQuestionIndex.value === index) {
      selectedQuestionIndex.value = null
    }
    ElMessage.success('删除成功')
  })
}

const handleAddFromBank = () => {
  bankSelectorVisible.value = true
}

const handleQuestionsSelected = (questions) => {
  const newQuestions = questions.map(q => ({
    ...q,
    id: `hwq_${Date.now()}_${Math.random()}`,
    questionId: q.id,
    score: q.score || 10,
    required: true,
    homeworkExplanation: ''
  }))
  form.value.questions.push(...newQuestions)
  ElMessage.success(`成功添加 ${questions.length} 道题目`)
}

const updateTotalScore = () => {
  // 触发总分更新
}

const isCorrectOption = (option) => {
  if (!selectedQuestion.value) return false
  if (selectedQuestion.value.type === 'single') {
    return option.value === selectedQuestion.value.correctAnswer
  }
  if (selectedQuestion.value.type === 'multiple') {
    return option.isCorrect
  }
  return false
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答',
    programming: '编程'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'info',
    programming: 'danger'
  }
  return map[type] || ''
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const handleSaveDraft = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('草稿保存成功')
      router.push('/homework/list')
    }
  })
}

const handlePublish = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.questions.length === 0) {
        ElMessage.warning('请至少添加一道题目')
        return
      }
      ElMessageBox.confirm('确定要发布该作业吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('作业发布成功')
        router.push('/homework/list')
      })
    }
  })
}

onMounted(() => {
  // 如果是编辑模式，加载作业数据
  if (isEdit.value) {
    // 加载作业数据
  }
})
</script>

<style lang="scss" scoped>
.homework-edit-container {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-section {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;

  :deep(.el-collapse-item__header) {
    font-size: 16px;
    font-weight: 600;
    padding: 0 20px;
  }

  :deep(.el-collapse-item__content) {
    padding: 20px;
  }
}

/* 题目管理双面板 */
.question-management {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.question-list-panel {
  width: 280px;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .panel-title {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .total-score {
      font-size: 14px;
      color: var(--color-primary);
      font-weight: 600;
    }
  }

  .question-items {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .question-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid var(--color-border-light);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--color-bg-tertiary);
    }

    &.active {
      background: var(--color-primary-light-9);
      border-color: var(--color-primary);
    }

    .question-item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;

      .drag-handle {
        cursor: move;
        color: var(--color-text-secondary);
      }

      .question-number {
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .question-score {
        margin-left: auto;
        font-size: 13px;
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  }

  .add-question-buttons {
    padding: 16px;
    border-top: 1px solid var(--color-border-light);

    .el-button {
      width: 100%;
    }
  }
}

.question-detail-panel {
  flex: 1;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;

  .question-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border-lighter);

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .question-content-readonly {
      background: var(--color-bg-secondary);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;

      .content-label {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-bottom: 8px;
      }

      .content-text {
        font-size: 15px;
        color: var(--color-text-primary);
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .options-display {
        .option-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          margin-bottom: 8px;
          background: white;
          border-radius: 4px;

          .option-label {
            font-weight: 600;
            color: var(--color-text-primary);
          }

          .option-text {
            flex: 1;
            color: var(--color-text-regular);
          }
        }
      }
    }

    .homework-specific-settings {
      .el-form-item {
        margin-bottom: 20px;
      }
    }
  }
}

.grading-settings {
  h4 {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  .el-checkbox {
    display: block;
    margin-bottom: 12px;
  }

  .ai-settings {
    margin-left: 24px;
    margin-top: 12px;
    padding: 16px;
    background: var(--color-bg-secondary);
    border-radius: 8px;
  }
}
</style>
