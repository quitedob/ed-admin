<template>
  <div class="question-bank-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>题库管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="main-content">
      <!-- 题库头部 -->
      <div class="bank-header">
        <div class="header-left">
          <h2 class="bank-title">{{ questionBank.name }}</h2>
          <el-tag type="info">总题数: {{ questionBank.totalQuestions }}道</el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAddQuestion">
            <el-icon><Plus /></el-icon>
            添加题目
          </el-button>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".json"
            :on-change="handleImportFile"
          >
            <el-button>
              <el-icon><Upload /></el-icon>
              导入题目
            </el-button>
          </el-upload>
        </div>
      </div>

      <!-- 题型分类标签 -->
      <div class="type-tabs">
        <div
          v-for="type in questionTypes"
          :key="type.value"
          :class="['type-tab', { active: selectedType === type.value }]"
          @click="selectedType = type.value"
        >
          <span class="type-label">{{ type.label }}</span>
          <span class="type-count">{{ getTypeCount(type.value) }}</span>
        </div>
      </div>

      <!-- 题目列表 -->
      <div class="question-list">
        <el-table :data="filteredQuestions" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionText" label="题目内容" min-width="250" show-overflow-tooltip />
          <el-table-column label="题目标签" prop="tags" width="200">
            <template #default="{ row }">
              <div class="tag-container">
                <el-tag
                  v-for="tag in (row.tags || [])"
                  :key="tag"
                  size="small"
                  type="primary"
                  effect="light"
                  style="margin: 2px;"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="!row.tags || row.tags.length === 0" class="no-tags">
                  暂无标签
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分值" width="80" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditQuestion(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteQuestion(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- V2 新建/编辑题目对话框 -->
    <V2QuestionEditDialog
      v-model="questionDialogVisible"
      :question-data="currentQuestion"
      @save="handleSaveQuestion"
    />
  </div>
</template>

<script setup name="QuestionBank">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import V2QuestionEditDialog from '@/components/V2QuestionEditDialog.vue'

// 题型定义
const questionTypes = [
  { label: '全部', value: 'all' },
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: 'OJ题', value: 'programming' },
  { label: '简答题', value: 'essay' }
]

// 响应式数据
const selectedType = ref('all')
const questionDialogVisible = ref(false)
const currentQuestion = ref(null)
const uploadRef = ref()

// 题库数据
const questionBank = ref({
  id: 'bank_001',
  name: '题库',
  totalQuestions: 0,
  questions: []
})

// 计算属性
const filteredQuestions = computed(() => {
  if (selectedType.value === 'all') {
    return questionBank.value.questions
  }
  return questionBank.value.questions.filter(q => q.type === selectedType.value)
})

// 初始化模拟数据
const initMockData = () => {
  questionBank.value.questions = [
    {
      id: 'q_001',
      type: 'single',
      questionText: '以下哪个不是面向对象编程的特性？',
      difficulty: 'easy',
      score: 2,
      tags: ['面向对象', '基础概念', 'Java'],
      options: [
        { value: 'A', text: '封装', isCorrect: false },
        { value: 'B', text: '继承', isCorrect: false },
        { value: 'C', text: '多态', isCorrect: false },
        { value: 'D', text: '编译', isCorrect: true }
      ],
      correctAnswer: 'D',
      explanation: '编译是程序执行过程，不是面向对象的特性'
    },
    {
      id: 'q_002',
      type: 'multiple',
      questionText: '以下哪些是Java的基本数据类型？',
      difficulty: 'easy',
      score: 3,
      tags: ['Java基础', '数据类型'],
      options: [
        { value: 'A', text: 'int', isCorrect: true },
        { value: 'B', text: 'String', isCorrect: false },
        { value: 'C', text: 'boolean', isCorrect: true },
        { value: 'D', text: 'double', isCorrect: true }
      ],
      correctAnswer: ['A', 'C', 'D'],
      explanation: 'String是引用类型，不是基本数据类型'
    },
    {
      id: 'q_003',
      type: 'fill',
      questionText: 'Java中，___是所有类的父类，___方法用于比较两个对象是否相等。',
      difficulty: 'medium',
      score: 4,
      tags: ['Java基础', '面向对象', '填空题'],
      fillBlanks: [
        { answers: ['Object'] },
        { answers: ['equals'] }
      ],
      explanation: 'Object类是Java类层次结构的根，equals方法用于对象比较'
    },
    {
      id: 'q_004',
      type: 'judge',
      questionText: 'Java中，接口可以包含方法的实现。',
      difficulty: 'medium',
      score: 2,
      tags: ['Java', '接口', '判断题'],
      correctAnswer: true,
      explanation: 'Java 8之后，接口可以包含默认方法和静态方法的实现'
    },
    {
      id: 'q_005',
      type: 'programming',
      questionText: '实现一个函数，判断一个字符串是否为回文串',
      difficulty: 'medium',
      score: 10,
      tags: ['算法', '字符串', '双指针', '编程题'],
      hojProblemId: '1001',
      timeLimit: 1000,
      memoryLimit: 256,
      required: true,
      multipleSubmit: true,
      explanation: '可以使用双指针法，从两端向中间比较'
    },
    {
      id: 'q_006',
      type: 'essay',
      questionText: '请简述MVC设计模式的核心思想及其优点。',
      difficulty: 'hard',
      score: 10,
      tags: ['设计模式', '架构', '简答题'],
      referenceAnswer: 'MVC将应用分为Model（模型）、View（视图）、Controller（控制器）三层。优点包括：1.分离关注点 2.提高代码复用性 3.便于维护和测试',
      gradingCriteria: '需要说明三层的作用，至少列举两个优点',
      aiGrading: false,
      explanation: 'MVC是一种经典的软件架构模式'
    }
  ]
  questionBank.value.totalQuestions = questionBank.value.questions.length
}

// 方法
const getTypeCount = (type) => {
  if (type === 'all') {
    return questionBank.value.totalQuestions
  }
  return questionBank.value.questions.filter(q => q.type === type).length
}

const handleAddQuestion = () => {
  currentQuestion.value = null
  questionDialogVisible.value = true
}

const handleEditQuestion = (question) => {
  currentQuestion.value = { ...question }
  questionDialogVisible.value = true
}

const handleSaveQuestion = (questionData) => {
  if (currentQuestion.value && currentQuestion.value.id) {
    // 编辑现有题目
    const index = questionBank.value.questions.findIndex(q => q.id === currentQuestion.value.id)
    if (index > -1) {
      questionBank.value.questions[index] = { ...questionData, id: currentQuestion.value.id }
      ElMessage.success('题目更新成功')
    }
  } else {
    // 新增题目
    const newQuestion = {
      ...questionData,
      id: `q_${Date.now()}`
    }
    questionBank.value.questions.push(newQuestion)
    questionBank.value.totalQuestions++
    ElMessage.success('题目添加成功')
  }
  questionDialogVisible.value = false
}

const handleDeleteQuestion = (question) => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = questionBank.value.questions.findIndex(q => q.id === question.id)
    if (index > -1) {
      questionBank.value.questions.splice(index, 1)
      questionBank.value.totalQuestions--
      ElMessage.success('删除成功')
    }
  })
}

const handleImportFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (Array.isArray(data)) {
        // 导入题目数组
        data.forEach(q => {
          questionBank.value.questions.push({
            ...q,
            id: `q_${Date.now()}_${Math.random()}`
          })
        })
        questionBank.value.totalQuestions = questionBank.value.questions.length
        ElMessage.success(`成功导入 ${data.length} 道题目`)
      } else {
        ElMessage.error('JSON格式不正确，应为题目数组')
      }
    } catch (error) {
      ElMessage.error('文件解析失败，请检查JSON格式')
    }
  }
  reader.readAsText(file.raw)
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    essay: '简答',
    programming: 'OJ'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    essay: '',
    programming: 'danger'
  }
  return map[type] || ''
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
  return map[difficulty] || ''
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.question-bank-container {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .bank-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .type-tab {
    padding: 8px 16px;
    border-radius: 4px;
    background: #f5f7fa;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: #e4e7ed;
    }

    &.active {
      background: #409eff;
      color: white;

      .type-count {
        background: rgba(255, 255, 255, 0.3);
        color: white;
      }
    }

    .type-label {
      font-size: 14px;
    }

    .type-count {
      background: #e4e7ed;
      color: #606266;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
    }
  }
}

.question-list {
  flex: 1;
  overflow-y: auto;
}

/* 题目标签相关样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-start;
  align-items: center;
  min-height: 24px;
}

.no-tags {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}
</style>
