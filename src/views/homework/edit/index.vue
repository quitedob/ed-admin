<template>
  <div class="homework-edit-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">编辑作业</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-form ref="formRef" :model="homeworkForm" :rules="rules" label-width="120px">
        <div class="content-layout">
          <!-- 左侧 50% - 基本信息 + 批改设置 -->
          <div class="left-column">
            <!-- 基本信息卡片 -->
            <el-card shadow="never" class="form-card basic-info-card">
              <template #header>
                <span class="card-title">基本信息</span>
              </template>

              <el-form-item label="作业ID">
                <el-input
                  :model-value="route.params.id"
                  readonly
                  placeholder="作业ID"
                />
              </el-form-item>

              <el-form-item label="作业标题" prop="title">
                <el-input
                  v-model="homeworkForm.title"
                  placeholder="请输入作业标题"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="作业描述" prop="description">
                <el-input
                  v-model="homeworkForm.description"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入作业描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="学科" prop="subject">
                <el-select v-model="homeworkForm.subject" placeholder="请选择学科" style="width: 100%" clearable>
                  <el-option
                    v-for="subject in SUBJECT_OPTIONS"
                    :key="subject.value"
                    :label="subject.label"
                    :value="subject.value"
                  />
                </el-select>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="关联班级" prop="classId">
                    <el-select v-model="homeworkForm.classId" placeholder="请选择班级" style="width: 100%">
                      <el-option label="前端开发一班" value="class_001" />
                      <el-option label="前端开发二班" value="class_002" />
                      <el-option label="数据科学班" value="class_003" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="关联课程" prop="courseId">
                    <el-select v-model="homeworkForm.courseId" placeholder="请选择课程" style="width: 100%">
                      <el-option label="前端开发基础" value="course_001" />
                      <el-option label="Vue.js框架" value="course_002" />
                      <el-option label="React基础" value="course_003" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开始时间" prop="releaseTime">
                    <el-date-picker
                      v-model="homeworkForm.releaseTime"
                      type="datetime"
                      placeholder="选择开始时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="截止时间" prop="dueTime">
                    <el-date-picker
                      v-model="homeworkForm.dueTime"
                      type="datetime"
                      placeholder="选择截止时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
          </div>

          <!-- 右侧 50% - 题目设置 -->
          <div class="right-column">
            <el-card shadow="never" class="form-card questions-card">
              <template #header>
                <span class="card-title">题目设置</span>
              </template>

              <HomeworkQuestionBuilder
                v-model:questions="homeworkForm.questions"
                @open-question-selector="handleOpenQuestionSelector"
              />
            </el-card>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 题库选择对话框 - 提升到页面级别 -->
    <QuestionSelectorDialog
      v-model="questionDialogVisible"
      :initial-selected-questions="homeworkForm.questions"
      @confirm="handleQuestionSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View } from '@element-plus/icons-vue'
import { useMockStore } from '@/stores/mockStore'
import HomeworkQuestionBuilder from '../create/components/HomeworkQuestionBuilder.vue'
import QuestionSelectorDialog from '@/views/course/update/components/QuestionSelectorDialog.vue'
import { SUBJECT_OPTIONS, getSubjectLabel } from '@/constants/subjects.js'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const questionDialogVisible = ref(false)
const mockStore = useMockStore()

// 表单数据
const homeworkForm = ref({
  title: '',
  description: '',
  subject: '', // 学科字段
  classId: '',
  courseId: '',
  releaseTime: null,
  dueTime: null,
  questions: [],
  settings: {
    autoGrade: true,
    aiGrade: true,
    manualReview: true
  }
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  releaseTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  dueTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 加载作业数据
const loadHomework = () => {
  const homeworkId = route.params.id
  if (!homeworkId) return

  // 模拟加载数据
  homeworkForm.value = {
    title: '第一章作业',
    description: '完成第一章基础知识的练习',
    classId: 'class_001',
    courseId: 'course_001',
    releaseTime: new Date('2024-12-15T10:00:00'),
    dueTime: new Date('2024-12-25T23:59:59'),
    questions: [
      {
        id: 'q_001',
        type: 'single',
        questionText: '以下哪个不是JavaScript的数据类型？',
        difficulty: 'easy'
      }
    ],
    settings: {
      autoGrade: true,
      aiGrade: true,
      manualReview: true
    }
  }
}

// 方法
const handleBack = () => {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回作业列表页
    router.push('/homework/list')
  }
}

// 打开题目选择器
const handleOpenQuestionSelector = () => {
  questionDialogVisible.value = true
}

// 处理题目选择
const handleQuestionSelect = (selectedQuestions) => {
  // 过滤掉已经存在的题目
  const existingIds = homeworkForm.value.questions.map(q => q.id)
  const newQuestions = selectedQuestions.filter(q => !existingIds.includes(q.id))

  // 添加新题目
  homeworkForm.value.questions = [...homeworkForm.value.questions, ...newQuestions]

  ElMessage.success(`成功添加 ${newQuestions.length} 道题目到作业`)
}

const handlePreview = () => {
  // 将当前作业数据存储到sessionStorage
  const previewData = {
    id: route.params.id || `temp_${Date.now()}`,
    ...homeworkForm.value,
    className: getClassName(homeworkForm.value.classId),
    courseName: getCourseName(homeworkForm.value.courseId)
  }
  sessionStorage.setItem('temp_homework_preview', JSON.stringify(previewData))
  
  // 打开预览页面
  const routeData = router.resolve({ path: `/homework/preview/${previewData.id}` })
  window.open(routeData.href, '_blank')
}

const getClassName = (classId) => {
  const classMap = {
    'class_001': '前端开发一班',
    'class_002': '前端开发二班',
    'class_003': '数据科学班'
  }
  return classMap[classId] || ''
}

const getCourseName = (courseId) => {
  const courseMap = {
    'course_001': '前端开发基础',
    'course_002': 'Vue.js框架',
    'course_003': 'React基础'
  }
  return courseMap[courseId] || ''
}

const handleSaveDraft = () => {
  // 保存到临时存储
  const homeworkData = {
    id: route.params.id || `hw_temp_${Date.now()}`,
    ...homeworkForm.value,
    className: getClassName(homeworkForm.value.classId),
    courseName: getCourseName(homeworkForm.value.courseId),
    status: 'draft',
    createdAt: new Date().toISOString()
  }
  
  // 保存到sessionStorage（临时存储，刷新后消失）
  const tempHomeworks = JSON.parse(sessionStorage.getItem('temp_homeworks') || '[]')
  const existingIndex = tempHomeworks.findIndex(h => h.id === homeworkData.id)
  if (existingIndex > -1) {
    tempHomeworks[existingIndex] = homeworkData
  } else {
    tempHomeworks.push(homeworkData)
  }
  sessionStorage.setItem('temp_homeworks', JSON.stringify(tempHomeworks))
  
  ElMessage.success('草稿保存成功')
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (homeworkForm.value.questions.length === 0) {
        ElMessage.warning('请至少添加一道题目')
        return
      }
      
      // 保存到临时存储
      const homeworkData = {
        id: route.params.id || `hw_${Date.now()}`,
        ...homeworkForm.value,
        className: getClassName(homeworkForm.value.classId),
        courseName: getCourseName(homeworkForm.value.courseId),
        schedule: {
          releaseTime: homeworkForm.value.releaseTime,
          dueTime: homeworkForm.value.dueTime
        },
        status: 'published',
        createdAt: new Date().toISOString()
      }
      
      // 保存到sessionStorage
      const tempHomeworks = JSON.parse(sessionStorage.getItem('temp_homeworks') || '[]')
      const existingIndex = tempHomeworks.findIndex(h => h.id === homeworkData.id)
      if (existingIndex > -1) {
        tempHomeworks[existingIndex] = homeworkData
      } else {
        tempHomeworks.push(homeworkData)
      }
      sessionStorage.setItem('temp_homeworks', JSON.stringify(tempHomeworks))
      
      ElMessage.success('作业保存成功')
      router.push('/homework/list')
    }
  })
}

onMounted(() => {
  loadHomework()
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

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 24px;

  .content-layout {
    display: flex;
    height: 100%;
    gap: 24px;
  }

  .left-column {
    width: 50%;
    display: flex;
    flex-direction: column;
  }

  .right-column {
    width: 50%;
    display: flex;
    flex-direction: column;
  }

  .form-card {
    display: flex;
    flex-direction: column;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .form-tip {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }
  }

  .basic-info-card {
    height: 100%;

    .el-card__body {
      flex: 1;
      overflow-y: auto;
    }
  }

  .questions-card {
    height: 100%;

    .el-card__body {
      flex: 1;
      padding: 0;
      overflow: hidden;
    }
  }
}
</style>
