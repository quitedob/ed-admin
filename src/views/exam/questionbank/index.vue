<template>
  <div class="question-bank-manage">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft" text size="large">返回</el-button>
        <h1 class="page-title">题目库管理</h1>
        <el-tag v-if="examInfo.title" type="info">{{ examInfo.title }}</el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleAddBank">
          <el-icon><Plus /></el-icon>
          新建题目库
        </el-button>
      </div>
    </div>

    <!-- 题目库列表 -->
    <div class="bank-list">
      <el-row :gutter="20">
        <el-col v-for="(bank, index) in questionBanks" :key="bank.id" :span="8">
          <el-card class="bank-card" shadow="hover">
            <div class="bank-header">
              <div class="bank-title">
                <h3>{{ bank.name }}</h3>
                <el-tag :type="getBankTypeTagType(bank.type)" size="small">
                  {{ getBankTypeLabel(bank.type) }}
                </el-tag>
              </div>
              <el-dropdown @command="(cmd) => handleBankCommand(cmd, bank, index)">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <div class="bank-stats">
              <div class="stat-item">
                <span class="stat-value">{{ bank.questions?.length || 0 }}</span>
                <span class="stat-label">题目数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getTotalScore(bank) }}</span>
                <span class="stat-label">总分值</span>
              </div>
            </div>

            <div class="bank-questions">
              <div class="questions-preview">
                <div
                  v-for="(question, qIndex) in (bank.questions || []).slice(0, 3)"
                  :key="question.id"
                  class="question-preview-item"
                >
                  <span class="question-index">{{ qIndex + 1 }}.</span>
                  <span class="question-text">{{ truncateText(question.questionText, 30) }}</span>
                  <el-tag size="small" type="info">{{ question.score }}分</el-tag>
                </div>
                <div v-if="(bank.questions?.length || 0) > 3" class="more-questions">
                  还有 {{ bank.questions.length - 3 }} 道题目...
                </div>
              </div>
            </div>

            <div class="bank-actions">
              <el-button type="primary" link @click="handleEditBank(bank)">
                <el-icon><Edit /></el-icon>
                编辑题目
              </el-button>
              <el-button type="success" link @click="handleAddQuestions(bank)">
                <el-icon><Plus /></el-icon>
                添加题目
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="questionBanks.length === 0" description="暂无题目库，请添加">
        <el-button type="primary" @click="handleAddBank">新建题目库</el-button>
      </el-empty>
    </div>

    <!-- 新建/编辑题目库对话框 -->
    <el-dialog
      v-model="bankDialogVisible"
      :title="editingBank ? '编辑题目库' : '新建题目库'"
      width="500px"
    >
      <el-form ref="bankFormRef" :model="bankForm" :rules="bankRules" label-width="100px">
        <el-form-item label="题目库名称" prop="name">
          <el-input v-model="bankForm.name" placeholder="请输入题目库名称" />
        </el-form-item>
        <el-form-item label="题型" prop="type">
          <el-select v-model="bankForm.type" placeholder="请选择题型" style="width: 100%">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fill" />
            <el-option label="判断题" value="judge" />
            <el-option label="简答题" value="essay" />
            <el-option label="编程题" value="programming" />
            <el-option label="混合题型" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="bankForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bankDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBank">确定</el-button>
      </template>
    </el-dialog>

    <!-- 题目选择对话框 -->
    <QuestionSelectorDialog
      v-model="questionSelectorVisible"
      :initial-selected-questions="currentBankQuestions"
      @confirm="handleQuestionsSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Edit, Delete, MoreFilled } from '@element-plus/icons-vue'
import QuestionSelectorDialog from '@/views/course/update/components/QuestionSelectorDialog.vue'

const route = useRoute()
const router = useRouter()

const examId = computed(() => route.query.examId)
const examInfo = ref({ title: '' })
const questionBanks = ref([])
const bankDialogVisible = ref(false)
const questionSelectorVisible = ref(false)
const editingBank = ref(null)
const currentBank = ref(null)
const bankFormRef = ref()

const bankForm = ref({
  name: '',
  type: 'single',
  description: ''
})

const bankRules = {
  name: [{ required: true, message: '请输入题目库名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择题型', trigger: 'change' }]
}

const currentBankQuestions = computed(() => {
  return currentBank.value?.questions || []
})

const goBack = () => {
  // 检查是否有历史记录
  if (window.history.length > 1) {
    router.back()
  } else {
    // 如果没有历史记录，返回考试列表页
    router.push('/exam/list')
  }
}

const getBankTypeLabel = (type) => {
  const labels = {
    single: '单选题库', multiple: '多选题库', fill: '填空题库',
    judge: '判断题库', essay: '简答题库', programming: '编程题库', mixed: '混合题库'
  }
  return labels[type] || type
}

const getBankTypeTagType = (type) => {
  const types = {
    single: 'primary', multiple: 'success', fill: 'warning',
    judge: 'info', essay: '', programming: 'danger', mixed: ''
  }
  return types[type] || ''
}

const getTotalScore = (bank) => {
  if (!bank.questions) return 0
  return bank.questions.reduce((sum, q) => sum + (q.score || 0), 0)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const handleAddBank = () => {
  editingBank.value = null
  bankForm.value = { name: '', type: 'single', description: '' }
  bankDialogVisible.value = true
}

const handleEditBank = (bank) => {
  editingBank.value = bank
  bankForm.value = { ...bank }
  bankDialogVisible.value = true
}

const handleSaveBank = () => {
  bankFormRef.value.validate((valid) => {
    if (valid) {
      if (editingBank.value) {
        // 更新现有题目库
        const index = questionBanks.value.findIndex(b => b.id === editingBank.value.id)
        if (index > -1) {
          questionBanks.value[index] = { ...questionBanks.value[index], ...bankForm.value }
        }
        ElMessage.success('题目库更新成功')
      } else {
        // 新建题目库
        const newBank = {
          id: `bank_${Date.now()}`,
          ...bankForm.value,
          questions: [],
          questionCount: 0
        }
        questionBanks.value.push(newBank)
        ElMessage.success('题目库创建成功')
      }
      saveToSession()
      bankDialogVisible.value = false
    }
  })
}

const handleBankCommand = (command, bank, index) => {
  if (command === 'edit') {
    handleEditBank(bank)
  } else if (command === 'delete') {
    ElMessageBox.confirm('确定要删除该题目库吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      questionBanks.value.splice(index, 1)
      saveToSession()
      ElMessage.success('删除成功')
    })
  }
}

const handleAddQuestions = (bank) => {
  currentBank.value = bank
  questionSelectorVisible.value = true
}

const handleQuestionsSelected = (questions) => {
  if (currentBank.value) {
    // 合并新选择的题目
    const existingIds = (currentBank.value.questions || []).map(q => q.id)
    const newQuestions = questions.filter(q => !existingIds.includes(q.id))
    
    currentBank.value.questions = [
      ...(currentBank.value.questions || []),
      ...newQuestions.map(q => ({ ...q, score: q.score || getDefaultScore(q.type) }))
    ]
    currentBank.value.questionCount = currentBank.value.questions.length
    
    saveToSession()
    ElMessage.success(`成功添加 ${newQuestions.length} 道题目`)
  }
}

const getDefaultScore = (type) => {
  const scoreMap = { single: 2, multiple: 3, fill: 2, judge: 1, essay: 10, programming: 8 }
  return scoreMap[type] || 2
}

const saveToSession = () => {
  sessionStorage.setItem(`exam_banks_${examId.value}`, JSON.stringify(questionBanks.value))
}

const loadData = () => {
  // 加载考试信息
  const tempExams = JSON.parse(sessionStorage.getItem('temp_exams') || '[]')
  const exam = tempExams.find(e => e.id === examId.value)
  if (exam) {
    examInfo.value = exam
  }
  
  // 加载题目库 - 首先检查是否有单独保存的题目库
  const savedBanks = sessionStorage.getItem(`exam_banks_${examId.value}`)
  if (savedBanks) {
    questionBanks.value = JSON.parse(savedBanks)
  } else if (exam && exam.questionBanks && exam.questionBanks.length > 0) {
    // 如果没有单独保存的题目库，但考试有题目数据，则按题型分组创建题目库
    const groupedQuestions = {}
    exam.questionBanks.forEach(q => {
      const type = q.type || 'mixed'
      if (!groupedQuestions[type]) {
        groupedQuestions[type] = []
      }
      groupedQuestions[type].push(q)
    })
    
    // 转换为题目库格式
    questionBanks.value = Object.keys(groupedQuestions).map((type, index) => ({
      id: `bank_${Date.now()}_${index}`,
      name: getQuestionTypeLabel(type) + '库',
      type: type,
      description: `${getQuestionTypeLabel(type)}题目集合`,
      questions: groupedQuestions[type],
      questionCount: groupedQuestions[type].length
    }))
    
    // 保存到session
    saveToSession()
  } else {
    // 初始化空题目库
    questionBanks.value = []
  }
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    single: '单选题', multiple: '多选题', fill: '填空题',
    judge: '判断题', essay: '简答题', programming: '编程题', mixed: '混合'
  }
  return labels[type] || type
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.question-bank-manage {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
}

.bank-list {
  .bank-card {
    margin-bottom: 20px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .bank-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .bank-title {
        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
      }
    }

    .bank-stats {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 600;
          color: #409eff;
        }

        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .bank-questions {
      margin-bottom: 16px;

      .questions-preview {
        .question-preview-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .question-index {
            font-weight: 600;
            color: #409eff;
            min-width: 24px;
          }

          .question-text {
            flex: 1;
            color: #606266;
            font-size: 13px;
          }
        }

        .more-questions {
          padding: 8px 0;
          color: #909399;
          font-size: 13px;
          text-align: center;
        }
      }
    }

    .bank-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>
