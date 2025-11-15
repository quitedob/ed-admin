<template>
  <div class="homework-edit-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/homework/list' }">作业管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑作业' : '新建作业' }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ form.title || '未命名作业' }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button @click="handleSaveDraft" :loading="saving">
          <el-icon><Document /></el-icon>
          保存
        </el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">
          <el-icon><Upload /></el-icon>
          发布
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="page-content">
      <el-scrollbar height="calc(100vh - 120px)">
        <div class="content-wrapper">
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            
            <!-- 基本信息 -->
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>基本信息</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="作业标题" prop="title">
                    <el-input 
                      v-model="form.title" 
                      placeholder="请输入作业标题"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="关联班级" prop="classId">
                    <el-select v-model="form.classId" placeholder="请选择班级" style="width: 100%">
                      <el-option 
                        v-for="cls in classList" 
                        :key="cls.id" 
                        :label="cls.name" 
                        :value="cls.id" 
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="关联课程" prop="courseId">
                    <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%">
                      <el-option 
                        v-for="course in courseList" 
                        :key="course.id" 
                        :label="course.name" 
                        :value="course.id" 
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="作业描述" prop="description">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入作业描述，说明作业要求和注意事项"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="作业类型" prop="type">
                    <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                      <el-option label="练习" value="exercise" />
                      <el-option label="考查" value="exam" />
                      <el-option label="综合" value="practice" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="难度等级" prop="difficulty">
                    <el-select v-model="form.difficulty" placeholder="请选择难度" style="width: 100%">
                      <el-option label="简单" value="easy">
                        <el-tag type="success" size="small">简单</el-tag>
                      </el-option>
                      <el-option label="中等" value="medium">
                        <el-tag type="warning" size="small">中等</el-tag>
                      </el-option>
                      <el-option label="困难" value="hard">
                        <el-tag type="danger" size="small">困难</el-tag>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>

            <!-- 时间安排 -->
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><Clock /></el-icon>
                  <span>时间安排</span>
                </div>
              </template>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="发布时间" prop="releaseTime">
                    <el-date-picker
                      v-model="form.releaseTime"
                      type="datetime"
                      placeholder="选择发布时间"
                      style="width: 100%"
                      format="YYYY-MM-DD HH:mm"
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
                      format="YYYY-MM-DD HH:mm"
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
                      format="YYYY-MM-DD HH:mm"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="允许晚交">
                <el-switch v-model="form.settings.allowLateSubmission" />
                <span class="form-tip">开启后学生可在截止时间后提交</span>
                <el-button 
                  v-if="form.settings.allowLateSubmission"
                  type="text" 
                  size="small"
                  @click="lateFeeDialogVisible = true"
                >
                  设置晚交扣分
                </el-button>
              </el-form-item>
            </el-card>

            <!-- 题目管理 -->
            <el-card class="section-card question-section" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><List /></el-icon>
                  <span>题目管理</span>
                  <el-tag type="info" style="margin-left: 12px">
                    {{ form.questions.length }}道题目
                  </el-tag>
                </div>
              </template>

              <div class="question-management">
                <!-- 左侧：已添加题目列表 -->
                <div class="question-list-panel">
                  <div class="panel-header">
                    <span class="panel-title">已添加题目</span>
                    <span class="total-score">{{ totalScore }}分</span>
                  </div>

                  <draggable
                    v-model="form.questions"
                    item-key="id"
                    class="question-items"
                    handle=".drag-handle"
                    @end="handleDragEnd"
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
                        <div class="question-actions">
                          <el-button
                            link
                            type="primary"
                            size="small"
                            @click.stop="moveUp(index)"
                            :disabled="index === 0"
                          >
                            <el-icon><Top /></el-icon>
                          </el-button>
                          <el-button
                            link
                            type="primary"
                            size="small"
                            @click.stop="moveDown(index)"
                            :disabled="index === form.questions.length - 1"
                          >
                            <el-icon><Bottom /></el-icon>
                          </el-button>
                          <el-button
                            link
                            type="danger"
                            size="small"
                            @click.stop="removeQuestion(index)"
                          >
                            <el-icon><Close /></el-icon>
                          </el-button>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <div class="add-question-buttons">
                    <el-button type="primary" @click="handleAddFromBank">
                      <el-icon><FolderOpened /></el-icon>
                      从题库选择
                    </el-button>
                  </div>
                </div>

                <!-- 右侧：题目详情/编辑 -->
                <div class="question-detail-panel">
                  <div v-if="selectedQuestion" class="question-detail">
                    <QuestionDetailEditor
                      :question="selectedQuestion"
                      :index="selectedQuestionIndex"
                      @update="updateQuestion"
                      @delete="removeQuestion(selectedQuestionIndex)"
                    />
                  </div>

                  <el-empty 
                    v-else 
                    description="请选择或添加题目"
                    :image-size="120"
                  >
                    <el-button type="primary" @click="handleAddFromBank">
                      从题库选择题目
                    </el-button>
                  </el-empty>
                </div>
              </div>
            </el-card>

            <!-- 阅卷设置 -->
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <el-icon><Edit /></el-icon>
                  <span>阅卷设置</span>
                </div>
              </template>

              <div class="grading-settings">
                <div class="settings-group">
                  <h4>评分方式</h4>
                  <el-checkbox v-model="form.settings.autoGrade">
                    <span class="checkbox-label">自动评分</span>
                    <span class="checkbox-desc">（选择题/填空题自动批改）</span>
                  </el-checkbox>

                  <el-checkbox v-model="form.settings.aiGrade">
                    <span class="checkbox-label">AI辅助批改</span>
                    <span class="checkbox-desc">（问答题）</span>
                  </el-checkbox>

                  <div v-if="form.settings.aiGrade" class="ai-settings">
                    <el-form-item label="AI模型">
                      <el-select v-model="form.settings.aiModel" style="width: 200px">
                        <el-option label="GPT-4" value="gpt-4" />
                        <el-option label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
                        <el-option label="Claude 3" value="claude-3" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="评分标准">
                      <el-input
                        v-model="form.settings.aiScoringRule"
                        type="textarea"
                        :rows="3"
                        placeholder="输入AI评分的标准和要求，留空则使用默认标准"
                      />
                    </el-form-item>
                  </div>

                  <el-checkbox v-model="form.settings.manualReview">
                    <span class="checkbox-label">人工复审</span>
                    <span class="checkbox-desc">（需要老师确认最终分数）</span>
                  </el-checkbox>
                </div>

                <el-divider />

                <div class="settings-group">
                  <h4>其他设置</h4>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.allowLateSubmission">
                        允许晚交
                      </el-checkbox>
                    </el-col>
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.groupWork">
                        分组做题
                      </el-checkbox>
                    </el-col>
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.showCorrectAnswers">
                        显示正确答案
                      </el-checkbox>
                    </el-col>
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.disableCopyPaste">
                        禁用复制粘贴
                      </el-checkbox>
                    </el-col>
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.peerReview">
                        学生互评
                      </el-checkbox>
                    </el-col>
                    <el-col :span="12">
                      <el-checkbox v-model="form.settings.peerGrading">
                        对等评分
                      </el-checkbox>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-card>

            <!-- 底部操作区 -->
            <div class="bottom-actions">
              <el-button size="large" @click="handleCancel">
                <el-icon><Close /></el-icon>
                取消
              </el-button>
              <el-button size="large" @click="handlePreview">
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button size="large" @click="handleSaveDraft" :loading="saving">
                <el-icon><Document /></el-icon>
                保存草稿
              </el-button>
              <el-button size="large" type="primary" @click="handlePublish" :loading="publishing">
                <el-icon><Upload /></el-icon>
                发布作业
              </el-button>
            </div>
          </el-form>
        </div>
      </el-scrollbar>
    </div>

    <!-- 从题库选择对话框 -->
    <QuestionBankSelector
      v-model="bankSelectorVisible"
      @select="handleQuestionsSelected"
    />

    <!-- 晚交扣分设置对话框 -->
    <LateFeeDialog
      v-model="lateFeeDialogVisible"
      :late-fee-config="form.settings.lateFeeConfig"
      @save="handleLateFeeConfigSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  View, Document, Upload, InfoFilled, Clock, List, Edit, Close,
  FolderOpened, Rank, Top, Bottom
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import QuestionBankSelector from './components/QuestionBankSelector.vue'
import QuestionDetailEditor from './components/QuestionDetailEditor.vue'
import LateFeeDialog from './components/LateFeeDialog.vue'
import { useMockStore } from '@/stores/mockStore'

const route = useRoute()
const router = useRouter()
const mockStore = useMockStore()

const isEdit = computed(() => !!route.query.id)

// 响应式数据
const formRef = ref()
const saving = ref(false)
const publishing = ref(false)
const selectedQuestionIndex = ref(null)
const bankSelectorVisible = ref(false)
const lateFeeDialogVisible = ref(false)

// 班级列表
const classList = computed(() => mockStore.classes)

// 课程列表
const courseList = computed(() => [
  { id: 'course_001', name: '前端开发基础' },
  { id: 'course_002', name: '前端开发进阶' },
  { id: 'course_003', name: '数据科学基础' }
])

const form = ref({
  title: '',
  classId: '',
  courseId: '',
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
    groupWork: false,
    showCorrectAnswers: true,
    disableCopyPaste: false,
    peerReview: false,
    peerGrading: false,
    lateFeeConfig: {
      enabled: false,
      deductionRate: 10,
      maxDeduction: 50
    }
  }
})

const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
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

const moveUp = (index) => {
  if (index === 0) return
  const temp = form.value.questions[index]
  form.value.questions[index] = form.value.questions[index - 1]
  form.value.questions[index - 1] = temp
  selectedQuestionIndex.value = index - 1
}

const moveDown = (index) => {
  if (index === form.value.questions.length - 1) return
  const temp = form.value.questions[index]
  form.value.questions[index] = form.value.questions[index + 1]
  form.value.questions[index + 1] = temp
  selectedQuestionIndex.value = index + 1
}

const handleDragEnd = () => {
  ElMessage.success('题目顺序已更新')
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

const updateQuestion = (updates) => {
  if (selectedQuestionIndex.value !== null) {
    Object.assign(form.value.questions[selectedQuestionIndex.value], updates)
  }
}

const handleLateFeeConfigSave = (config) => {
  form.value.settings.lateFeeConfig = config
  ElMessage.success('晚交扣分设置已保存')
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

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handlePublish = async () => {
  try {
    await formRef.value.validate()
    
    if (form.value.questions.length === 0) {
      ElMessage.warning('请至少添加一道题目')
      return
    }

    await ElMessageBox.confirm(
      '确定要发布该作业吗？发布后学生将可以看到并提交作业。',
      '确认发布',
      {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    publishing.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('作业发布成功')
    router.push('/homework/list')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error)
    }
  } finally {
    publishing.value = false
  }
}

const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消编辑吗？未保存的内容将丢失。',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.back()
  })
}

// 初始化
onMounted(() => {
  mockStore.initialize()
  
  if (isEdit.value) {
    // 加载作业数据
    console.log('加载作业:', route.query.id)
  }
})
</script>

<style lang="scss" scoped>
.homework-edit-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;

    .content-wrapper {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px;
    }
  }

  .section-card {
    margin-bottom: 20px;

    :deep(.el-card__header) {
      background: #fafafa;
      border-bottom: 2px solid #409eff;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .form-tip {
      margin-left: 12px;
      font-size: 13px;
      color: #909399;
    }
  }

  .question-section {
    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .question-management {
    display: flex;
    min-height: 600px;
  }

  .question-list-panel {
    width: 300px;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .panel-header {
      padding: 20px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .panel-title {
        font-weight: 600;
        color: #303133;
      }

      .total-score {
        font-size: 16px;
        color: #409eff;
        font-weight: 600;
      }
    }

    .question-items {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .question-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #ecf5ff;
        border-color: #409eff;
      }

      .question-item-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;

        .drag-handle {
          cursor: move;
          color: #909399;
        }

        .question-number {
          font-weight: 600;
          color: #303133;
        }

        .question-score {
          margin-left: auto;
          font-size: 13px;
          color: #409eff;
          font-weight: 600;
        }
      }

      .question-actions {
        display: flex;
        gap: 4px;
      }
    }

    .add-question-buttons {
      padding: 16px;
      border-top: 1px solid #e4e7ed;

      .el-button {
        width: 100%;
      }
    }
  }

  .question-detail-panel {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .grading-settings {
    .settings-group {
      margin-bottom: 24px;

      h4 {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;
      }

      .el-checkbox {
        display: block;
        margin-bottom: 12px;

        .checkbox-label {
          font-weight: 600;
        }

        .checkbox-desc {
          color: #909399;
          font-size: 13px;
        }
      }

      .ai-settings {
        margin-left: 24px;
        margin-top: 12px;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
      }
    }
  }

  .bottom-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 8px;
    margin-top: 20px;
  }
}
</style>
