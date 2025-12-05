<template>
  <div class="question-edit-page" id="question-edit-page">
    <!-- 顶部操作栏 -->
    <div class="page-header" id="page-header">
      <el-breadcrumb separator=">" id="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/assignments' }">题库</el-breadcrumb-item>
        <el-breadcrumb-item>{{ bankName }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ isEdit ? '编辑题目' : '新建题目' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="header-actions" id="header-actions">
        <el-button @click="handlePreview" id="preview-button">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" id="save-button">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button @click="handleCancel" id="cancel-button">
          <el-icon><Close /></el-icon>
          取消
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="page-content" id="page-content">
      <el-scrollbar height="calc(100vh - 120px)" id="main-scrollbar">
        <div class="content-wrapper" id="content-wrapper">
          <!-- 基本信息区 -->
          <el-card class="info-card" shadow="never" id="info-card">
            <template #header>
              <span class="card-title">题目基本信息</span>
            </template>
            
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" id="question-form">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="题号" prop="questionNumber">
                    <el-input v-model="form.questionNumber" placeholder="自动生成" disabled id="question-number-input" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="题型" prop="type">
                    <el-select
                      v-model="form.type"
                      placeholder="请选择题型"
                      @change="handleTypeChange"
                      style="width: 100%"
                      id="question-type-select"
                    >
                      <el-option label="单选题" value="single">
                        <el-icon><CircleCheck /></el-icon>
                        <span style="margin-left: 8px">单选题</span>
                      </el-option>
                      <el-option label="多选题" value="multiple">
                        <el-icon><Select /></el-icon>
                        <span style="margin-left: 8px">多选题</span>
                      </el-option>
                      <el-option label="填空题" value="fill">
                        <el-icon><Edit /></el-icon>
                        <span style="margin-left: 8px">填空题</span>
                      </el-option>
                      <el-option label="问答题" value="essay">
                        <el-icon><Document /></el-icon>
                        <span style="margin-left: 8px">问答题</span>
                      </el-option>
                      <el-option label="编程题(HOJ)" value="programming">
                        <el-icon><Cpu /></el-icon>
                        <span style="margin-left: 8px">编程题(HOJ)</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="难度" prop="difficulty">
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
                <el-col :span="6">
                </el-col>
              </el-row>

              <!-- 标签 -->
              <el-form-item label="标签" prop="tags">
                <el-select
                  v-model="form.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="选择或创建标签"
                  style="width: 100%"
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.name"
                  >
                    <el-tag :color="tag.color" size="small" style="margin-right: 8px">
                      {{ tag.name }}
                    </el-tag>
                    <span style="color: #909399; font-size: 12px">
                      ({{ tag.usage }}道题)
                    </span>
                  </el-option>
                </el-select>
                <el-button 
                  type="text" 
                  style="margin-left: 12px" 
                  @click="tagDialogVisible = true"
                >
                  <el-icon><Setting /></el-icon>
                  管理标签
                </el-button>
              </el-form-item>

              <!-- 题目描述 -->
              <el-form-item label="题目描述" prop="questionText">
                <div class="rich-editor-wrapper">
                  <el-input
                    v-model="form.questionText"
                    type="textarea"
                    :rows="6"
                    placeholder="请输入题目内容，支持富文本编辑..."
                  />
                  <div class="editor-toolbar">
                    <el-button-group>
                      <el-button size="small" @click="insertImage">
                        <el-icon><Picture /></el-icon>
                        图片
                      </el-button>
                      <el-button size="small" @click="insertTable">
                        <el-icon><Grid /></el-icon>
                        表格
                      </el-button>
                      <el-button size="small" @click="insertCode">
                        <el-icon><Code /></el-icon>
                        代码
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 题型编辑区 -->
          <el-card class="type-card" shadow="never">
            <template #header>
              <span class="card-title">{{ getTypeTitle() }}</span>
            </template>

            <!-- 单选题 -->
            <template v-if="form.type === 'single'">
              <SingleChoiceEditor v-model="form.singleChoice" />
            </template>

            <!-- 多选题 -->
            <template v-if="form.type === 'multiple'">
              <MultipleChoiceEditor v-model="form.multipleChoice" />
            </template>

            <!-- 填空题 -->
            <template v-if="form.type === 'fill'">
              <FillBlankEditor v-model="form.fillBlanks" />
            </template>

            <!-- 问答题 -->
            <template v-if="form.type === 'essay'">
              <EssayEditor v-model="form.essay" />
            </template>

            <!-- 编程题 -->
            <template v-if="form.type === 'programming'">
              <ProgrammingEditor v-model="form.programming" />
            </template>
          </el-card>

          <!-- 底部操作区 -->
          <el-card class="action-card" shadow="never">
            <div class="action-buttons">
              <el-button size="large" @click="handlePreview">
                <el-icon><View /></el-icon>
                预览题目
              </el-button>
              <el-button size="large" type="info" @click="handleSaveDraft">
                <el-icon><Document /></el-icon>
                保存草稿
              </el-button>
              <el-button size="large" type="primary" @click="handlePublish">
                <el-icon><Upload /></el-icon>
                发布到题库
              </el-button>
              <el-button size="large" @click="handleCancel">
                <el-icon><Close /></el-icon>
                取消编辑
              </el-button>
            </div>
          </el-card>
        </div>
      </el-scrollbar>
    </div>

    <!-- 标签管理对话框 -->
    <TagManageDialog
      v-model="tagDialogVisible"
      :tags="availableTags"
      @save="handleSaveTags"
    />

    <!-- 预览对话框 -->
    <QuestionPreviewDialog
      v-model="previewVisible"
      :question-data="form"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  View, Check, Close, CircleCheck, Select, Edit, Document, Cpu,
  Setting, Picture, Grid, Code, Upload
} from '@element-plus/icons-vue'

import SingleChoiceEditor from './components/SingleChoiceEditor.vue'
import MultipleChoiceEditor from './components/MultipleChoiceEditor.vue'
import FillBlankEditor from './components/FillBlankEditor.vue'
import EssayEditor from './components/EssayEditor.vue'
import ProgrammingEditor from './components/ProgrammingEditor.vue'
import TagManageDialog from '../components/TagManageDialog.vue'
import QuestionPreviewDialog from './components/QuestionPreviewDialog.vue'

const route = useRoute()
const router = useRouter()

const bankId = ref(route.query.bankId || '')
const questionId = ref(route.query.questionId || '')
const isEdit = computed(() => !!questionId.value)

const bankName = ref('第一章基础题库')
const saving = ref(false)
const tagDialogVisible = ref(false)
const previewVisible = ref(false)
const formRef = ref()

// 可用标签
const availableTags = ref([
  { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 },
  { id: 'tag_002', name: '第一章', color: '#67C23A', usage: 50 },
  { id: 'tag_003', name: '进阶', color: '#E6A23C', usage: 30 },
  { id: 'tag_004', name: '算法', color: '#F56C6C', usage: 25 },
  { id: 'tag_005', name: '数据结构', color: '#909399', usage: 20 }
])

// 表单数据
const form = ref({
  questionNumber: `Q${Date.now()}`,
  type: 'single',
  difficulty: 'easy',
  tags: [],
  questionText: '',
  // 单选题
  singleChoice: {
    options: [
      { value: 'A', text: '', isCorrect: false },
      { value: 'B', text: '', isCorrect: false },
      { value: 'C', text: '', isCorrect: false },
      { value: 'D', text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: ''
  },
  // 多选题
  multipleChoice: {
    options: [
      { value: 'A', text: '', isCorrect: false },
      { value: 'B', text: '', isCorrect: false },
      { value: 'C', text: '', isCorrect: false },
      { value: 'D', text: '', isCorrect: false }
    ],
    correctAnswers: [],
    explanation: ''
  },
  // 填空题
  fillBlanks: {
    blanks: [
      { id: 1, answers: [''] }
    ],
    explanation: ''
  },
  // 编程题
  programming: {
    hojProblemId: '',
    problemName: '',
    timeLimit: 1000,
    memoryLimit: 256,
    difficulty: 2,
    required: true,
    multipleSubmit: true,
    showTestCases: false,
    explanation: ''
  }
})

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  questionText: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],

// 方法
const getTypeTitle = () => {
  const map = {
    single: '单选题编辑',
    multiple: '多选题编辑',
    fill: '填空题编辑',
    essay: '问答题编辑',
    programming: '编程题(HOJ)编辑'
  }
  return map[form.value.type] || '题型编辑'
}

const handleTypeChange = () => {
  // 题型切换时重置对应数据
  console.log('题型切换:', form.value.type)
}

const insertImage = () => {
  ElMessage.info('图片插入功能开发中...')
}

const insertTable = () => {
  ElMessage.info('表格插入功能开发中...')
}

const insertCode = () => {
  ElMessage.info('代码插入功能开发中...')
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('题目保存成功')
    router.back()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handleSaveDraft = async () => {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  ElMessage.success('草稿保存成功')
  saving.value = false
}

const handlePublish = async () => {
  try {
    await formRef.value.validate()
    
    await ElMessageBox.confirm(
      '确定要发布该题目到题库吗？发布后学生将可以看到该题目。',
      '确认发布',
      {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    saving.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('题目发布成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error)
    }
  } finally {
    saving.value = false
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

const handleSaveTags = (tags) => {
  availableTags.value = tags
  ElMessage.success('标签保存成功')
}

// 加载题目数据
onMounted(() => {
  if (isEdit.value) {
    // 加载题目数据
    console.log('加载题目:', questionId.value)
  }
})
</script>

<style lang="scss" scoped>
.question-edit-page {
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
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;

      .info-card,
      .type-card,
      .action-card {
        margin-bottom: 20px;

        :deep(.el-card__header) {
          background: #fafafa;
          border-bottom: 2px solid #409eff;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .rich-editor-wrapper {
        position: relative;

        .editor-toolbar {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #dcdfe6;
        }
      }

      .action-card {
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
      }
    }
  }
}
</style>
