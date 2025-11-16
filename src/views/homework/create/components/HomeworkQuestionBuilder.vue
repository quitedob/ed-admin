<template>
  <div class="question-builder">
    <div class="builder-header">
      <div class="stats">
        <span>总题数: {{ questions.length }}</span>
      </div>
      <el-button type="primary" @click="handleAddFromBank">
        <el-icon><Plus /></el-icon>
        从题库添加
      </el-button>
    </div>

    <!-- 题目列表 -->
    <div class="question-list">
      <div v-if="questions.length === 0" class="empty-state">
        <el-empty description="暂无题目，请从题库添加" />
      </div>

      <div v-else>
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-num">{{ index + 1 }}.</span>
            <el-tag :type="getTypeTagType(question.type)" size="small">
              {{ getTypeLabel(question.type) }}
            </el-tag>
            <span class="question-text">{{ question.questionText }}</span>
            <div class="question-actions">
              <el-button
                type="danger"
                size="small"
                text
                @click="handleRemove(index)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 从题库选择对话框 -->
    <el-dialog
      v-model="selectDialogVisible"
      title="从题库选择题目"
      width="80%"
      top="5vh"
    >
      <div class="bank-selector">
        <el-tabs v-model="activeType">
          <el-tab-pane
            v-for="type in questionTypes"
            :key="type.value"
            :label="type.label"
            :name="type.value"
          >
            <el-table
              :data="getQuestionsByType(type.value)"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column label="题目内容" prop="questionText" min-width="300" />
              <el-table-column label="难度" width="100">
                <template #default="{ row }">
                  <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                    {{ getDifficultyLabel(row.difficulty) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmSelect">
          确定添加 ({{ selectedQuestions.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:questions'])

const questionsValue = computed({
  get: () => props.questions,
  set: (val) => emit('update:questions', val)
})

const selectDialogVisible = ref(false)
const activeType = ref('single')
const selectedQuestions = ref([])

const questionTypes = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: 'OJ题', value: 'programming' },
  { label: '简答题', value: 'essay' }
]

// 模拟题库数据
const mockQuestionBank = ref([
  {
    id: 'q_001',
    type: 'single',
    questionText: '以下哪个不是JavaScript的数据类型？',
    difficulty: 'easy'
  },
  {
    id: 'q_002',
    type: 'multiple',
    questionText: '以下哪些是Java的基本数据类型？',
    difficulty: 'easy'
  },
  {
    id: 'q_003',
    type: 'fill',
    questionText: 'Java中，___是所有类的父类',
    difficulty: 'medium'
  },
  {
    id: 'q_004',
    type: 'judge',
    questionText: 'Java中，接口可以包含方法的实现。',
    difficulty: 'medium'
  },
  {
    id: 'q_005',
    type: 'programming',
    questionText: '实现一个函数，判断一个字符串是否为回文串',
    difficulty: 'medium'
  },
  {
    id: 'q_006',
    type: 'essay',
    questionText: '请简述MVC设计模式的核心思想及其优点。',
    difficulty: 'hard'
  }
])

const handleAddFromBank = () => {
  selectDialogVisible.value = true
}

const getQuestionsByType = (type) => {
  return mockQuestionBank.value.filter(q => q.type === type)
}

const handleSelectionChange = (selection) => {
  selectedQuestions.value = selection
}

const handleConfirmSelect = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请选择题目')
    return
  }

  const newQuestions = selectedQuestions.value.map(q => ({ ...q }))
  questionsValue.value = [...questionsValue.value, ...newQuestions]
  
  selectDialogVisible.value = false
  selectedQuestions.value = []
  ElMessage.success(`已添加 ${newQuestions.length} 道题目`)
}

const handleRemove = (index) => {
  questionsValue.value.splice(index, 1)
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
</script>

<style lang="scss" scoped>
.question-builder {
  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .stats {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .question-list {
    .empty-state {
      padding: 40px 0;
    }

    .question-item {
      padding: 16px;
      margin-bottom: 12px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .question-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .question-num {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .question-text {
          flex: 1;
          color: var(--color-text-regular);
        }

        .question-actions {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .bank-selector {
    min-height: 400px;
  }
}
</style>
