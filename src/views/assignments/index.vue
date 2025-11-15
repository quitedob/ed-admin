<template>
  <div class="question-bank-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>题库管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="main-content">
      <!-- 左侧题库列表 -->
      <div class="left-sidebar">
        <!-- 操作按钮区 -->
        <div class="action-buttons">
          <el-button type="primary" class="new-bank-btn" @click="handleCreateBank">
            <el-icon><Plus /></el-icon>
            新建题库
          </el-button>
          <div class="secondary-actions">
            <el-button link @click="handleImport">导入</el-button>
            <el-button link @click="handleExport">导出</el-button>
          </div>
        </div>

        <!-- 题库列表 -->
        <div class="bank-list">
          <div
            v-for="bank in questionBanks"
            :key="bank.id"
            :class="['bank-item', { active: selectedBankId === bank.id }]"
            @click="selectBank(bank.id)"
          >
            <div class="bank-name">{{ bank.name }}</div>
            <div class="bank-meta">
              <span class="question-count">{{ bank.totalQuestions }}道题</span>
              <span class="last-modified">{{ formatDate(bank.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="search-filter">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题库..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="filterType" placeholder="筛选" class="filter-select" @change="handleFilter">
            <el-option label="全部" value="all" />
            <el-option label="按题量" value="size" />
            <el-option label="按时间" value="time" />
          </el-select>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <div v-if="selectedBank" class="bank-detail-card">
          <!-- 题库基本信息 -->
          <div class="bank-header">
            <h2 class="bank-title">{{ selectedBank.name }}</h2>
            <div class="bank-info">
              <el-tag type="info">总题数: {{ selectedBank.totalQuestions }}道</el-tag>
              <span class="last-modified-text">最后修改: {{ formatDateTime(selectedBank.updatedAt) }}</span>
            </div>
            <p v-if="selectedBank.description" class="bank-description">{{ selectedBank.description }}</p>
          </div>

          <!-- 题型分布统计 -->
          <div class="statistics-section">
            <h3 class="section-title">题型分布统计</h3>
            <el-row :gutter="20" class="stats-grid">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">单选题</div>
                  <div class="stat-value">{{ selectedBank.statistics.singleChoice }}题</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">多选题</div>
                  <div class="stat-value">{{ selectedBank.statistics.multipleChoice }}题</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">填空题</div>
                  <div class="stat-value">{{ selectedBank.statistics.fillBlank }}题</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">问答题</div>
                  <div class="stat-value">{{ selectedBank.statistics.essay }}题</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">编程题</div>
                  <div class="stat-value">{{ selectedBank.statistics.programming }}题</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <el-button type="primary" @click="handleEditBank">编辑</el-button>
            <el-button @click="handleViewAllQuestions">查看全部题目</el-button>
            <el-button type="danger" @click="handleDeleteBank">删除</el-button>
          </div>
        </div>

        <!-- 未选择题库时的提示 -->
        <el-empty v-else description="请选择一个题库查看详情" />
      </div>
    </div>

    <!-- 新建/编辑题库对话框 -->
    <el-dialog
      v-model="bankDialogVisible"
      :title="isEditMode ? '编辑题库' : '新建题库'"
      width="600px"
      @close="resetBankForm"
    >
      <el-form ref="bankFormRef" :model="bankForm" :rules="bankRules" label-width="100px">
        <el-form-item label="题库名称" prop="name">
          <el-input v-model="bankForm.name" placeholder="请输入题库名称" />
        </el-form-item>
        <el-form-item label="题库描述" prop="description">
          <el-input
            v-model="bankForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入题库描述"
          />
        </el-form-item>
        <el-form-item label="关联课程" prop="courseId">
          <el-select v-model="bankForm.courseId" placeholder="请选择课程" clearable>
            <el-option label="软件工程" value="course_001" />
            <el-option label="数据结构" value="course_002" />
            <el-option label="算法设计" value="course_003" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bankDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBank">保存</el-button>
      </template>
    </el-dialog>

    <!-- 题目列表对话框 -->
    <el-dialog
      v-model="questionListDialogVisible"
      title="题目列表"
      width="90%"
      top="5vh"
    >
      <QuestionListView
        v-if="questionListDialogVisible"
        :bank-id="selectedBankId"
        :questions="currentBankQuestions"
        @edit="handleEditQuestion"
        @delete="handleDeleteQuestion"
      />
    </el-dialog>
  </div>
</template>

<script setup name="QuestionBank">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import QuestionListView from './components/QuestionListView.vue'

// 响应式数据
const questionBanks = ref([])
const selectedBankId = ref(null)
const searchKeyword = ref('')
const filterType = ref('all')
const bankDialogVisible = ref(false)
const questionListDialogVisible = ref(false)
const isEditMode = ref(false)
const bankFormRef = ref()

// 题库表单
const bankForm = ref({
  name: '',
  description: '',
  courseId: ''
})

const bankRules = {
  name: [{ required: true, message: '请输入题库名称', trigger: 'blur' }]
}

// 计算属性
const selectedBank = computed(() => {
  return questionBanks.value.find(bank => bank.id === selectedBankId.value)
})

const currentBankQuestions = computed(() => {
  if (!selectedBank.value) return []
  return selectedBank.value.questions || []
})

// 初始化模拟数据
const initMockData = () => {
  questionBanks.value = [
    {
      id: 'bank_001',
      name: '第一章基础题库',
      description: '第一章的基础知识题目集合',
      courseId: 'course_001',
      totalQuestions: 50,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['基础', '第一章'],
      statistics: {
        singleChoice: 20,
        multipleChoice: 15,
        fillBlank: 10,
        essay: 5,
        programming: 0
      },
      availableTags: [
        { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 },
        { id: 'tag_002', name: '第一章', color: '#67C23A', usage: 50 }
      ],
      questions: []
    },
    {
      id: 'bank_002',
      name: '第二章进阶题库',
      description: '第二章进阶知识题目',
      courseId: 'course_001',
      totalQuestions: 35,
      createdAt: '2024-12-05T10:00:00Z',
      updatedAt: '2024-12-18T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['进阶', '第二章'],
      statistics: {
        singleChoice: 15,
        multipleChoice: 10,
        fillBlank: 5,
        essay: 3,
        programming: 2
      },
      availableTags: [],
      questions: []
    },
    {
      id: 'bank_003',
      name: '编程题库',
      description: 'HOJ编程题目集合',
      courseId: 'course_002',
      totalQuestions: 25,
      createdAt: '2024-12-10T10:00:00Z',
      updatedAt: '2024-12-15T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['编程', 'HOJ'],
      statistics: {
        singleChoice: 0,
        multipleChoice: 0,
        fillBlank: 0,
        essay: 0,
        programming: 25
      },
      availableTags: [],
      questions: []
    }
  ]

  // 默认选中第一个题库
  if (questionBanks.value.length > 0) {
    selectedBankId.value = questionBanks.value[0].id
  }
}

// 方法
const selectBank = (bankId) => {
  selectedBankId.value = bankId
}

const handleCreateBank = () => {
  isEditMode.value = false
  bankForm.value = {
    name: '',
    description: '',
    courseId: ''
  }
  bankDialogVisible.value = true
}

const handleEditBank = () => {
  if (!selectedBank.value) return
  isEditMode.value = true
  bankForm.value = {
    name: selectedBank.value.name,
    description: selectedBank.value.description,
    courseId: selectedBank.value.courseId
  }
  bankDialogVisible.value = true
}

const handleSaveBank = () => {
  bankFormRef.value.validate((valid) => {
    if (valid) {
      if (isEditMode.value) {
        // 更新题库
        const bank = questionBanks.value.find(b => b.id === selectedBankId.value)
        if (bank) {
          bank.name = bankForm.value.name
          bank.description = bankForm.value.description
          bank.courseId = bankForm.value.courseId
          bank.updatedAt = new Date().toISOString()
        }
        ElMessage.success('题库更新成功')
      } else {
        // 新建题库
        const newBank = {
          id: `bank_${Date.now()}`,
          name: bankForm.value.name,
          description: bankForm.value.description,
          courseId: bankForm.value.courseId,
          totalQuestions: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'teacher_001',
          tags: [],
          statistics: {
            singleChoice: 0,
            multipleChoice: 0,
            fillBlank: 0,
            essay: 0,
            programming: 0
          },
          availableTags: [],
          questions: []
        }
        questionBanks.value.push(newBank)
        selectedBankId.value = newBank.id
        ElMessage.success('题库创建成功')
      }
      bankDialogVisible.value = false
    }
  })
}

const handleDeleteBank = () => {
  ElMessageBox.confirm('确定要删除该题库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = questionBanks.value.findIndex(b => b.id === selectedBankId.value)
    if (index > -1) {
      questionBanks.value.splice(index, 1)
      selectedBankId.value = questionBanks.value.length > 0 ? questionBanks.value[0].id : null
      ElMessage.success('删除成功')
    }
  })
}

const handleViewAllQuestions = () => {
  questionListDialogVisible.value = true
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleSearch = () => {
  // 搜索逻辑
  console.log('搜索:', searchKeyword.value)
}

const handleFilter = () => {
  // 筛选逻辑
  console.log('筛选:', filterType.value)
}

const handleEditQuestion = (question) => {
  ElMessage.info('编辑题目功能开发中...')
}

const handleDeleteQuestion = (question) => {
  ElMessage.info('删除题目功能开发中...')
}

const resetBankForm = () => {
  bankForm.value = {
    name: '',
    description: '',
    courseId: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
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
  background: var(--color-bg-primary);
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

/* 左侧栏样式 */
.left-sidebar {
  width: 240px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.action-buttons {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-light);

  .new-bank-btn {
    width: 100%;
    margin-bottom: 12px;
  }

  .secondary-actions {
    display: flex;
    justify-content: space-around;
  }
}

.bank-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  .bank-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s;
    border-left: 3px solid transparent;

    &:hover {
      background: var(--color-bg-tertiary);
    }

    &.active {
      background: var(--color-primary-light-9);
      border-left-color: var(--color-primary);

      .bank-name {
        color: var(--color-primary);
        font-weight: 600;
      }
    }

    .bank-name {
      font-size: 14px;
      color: var(--color-text-primary);
      margin-bottom: 6px;
    }

    .bank-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--color-text-secondary);

      .question-count {
        font-weight: 500;
      }
    }
  }
}

.search-filter {
  padding: 16px;
  border-top: 1px solid var(--color-border-light);

  .el-input {
    margin-bottom: 8px;
  }

  .filter-select {
    width: 100%;
  }
}

/* 右侧内容区样式 */
.right-content {
  flex: 1;
  overflow-y: auto;
}

.bank-detail-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
  padding: 24px;
}

.bank-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-lighter);

  .bank-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 12px;
  }

  .bank-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;

    .last-modified-text {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .bank-description {
    font-size: 14px;
    color: var(--color-text-regular);
    line-height: 1.6;
  }
}

.statistics-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }

  .stats-grid {
    .stat-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      color: white;
      margin-bottom: 12px;

      .stat-label {
        font-size: 13px;
        opacity: 0.9;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 20px;
        font-weight: 600;
      }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-lighter);
}
</style>
