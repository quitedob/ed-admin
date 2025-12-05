<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="80%"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      @submit.prevent
    >
      <!-- 基本信息 -->
      <el-form-item label="题目类型" prop="type">
        <el-select v-model="formData.type" placeholder="选择题型" :disabled="isEdit">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="填空题" value="fill" />
          <el-option label="问答题" value="essay" />
        </el-select>
      </el-form-item>

      <el-form-item label="题目内容" prop="questionText">
        <el-input
          v-model="formData.questionText"
          type="textarea"
          :rows="4"
          placeholder="请输入题目内容"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="分值" prop="score">
        <el-input-number
          v-model="formData.score"
          :min="1"
          :max="100"
          placeholder="题目分值"
        />
      </el-form-item>

      <el-form-item label="难度等级" prop="difficulty">
        <el-select v-model="formData.difficulty" placeholder="选择难度">
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
      </el-form-item>

      <!-- 选择题选项 -->
      <template v-if="formData.type === 'single' || formData.type === 'multiple'">
        <el-divider content-position="left">
          <span class="divider-title">选项设置</span>
        </el-divider>

        <div class="options-container">
          <div
            v-for="(option, index) in formData.options"
            :key="option.id"
            class="option-item"
          >
            <el-form-item
              :label="`选项 ${String.fromCharCode(65 + index)}`"
              :prop="`options.${index}.text`"
              :rules="{ required: true, message: '请输入选项内容', trigger: 'blur' }"
            >
              <div class="option-input-group">
                <el-input
                  v-model="option.text"
                  placeholder="请输入选项内容"
                  class="option-input"
                />
                <el-switch
                  v-if="formData.type === 'single'"
                  v-model="option.isCorrect"
                  active-text="正确答案"
                  @change="handleSingleCorrectChange(index)"
                />
                <el-checkbox
                  v-else
                  v-model="option.isCorrect"
                  @change="handleMultipleCorrectChange"
                >
                  正确答案
                </el-checkbox>
                <el-button
                  type="danger"
                  size="small"
                  @click="removeOption(index)"
                  :disabled="formData.options.length <= 2"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-form-item>
          </div>
        </div>

        <el-button @click="addOption" :disabled="formData.options.length >= 8">
          <el-icon><Plus /></el-icon>
          添加选项
        </el-button>
      </template>

      <!-- 填空题答案 -->
      <template v-if="formData.type === 'fill'">
        <el-divider content-position="left">
          <span class="divider-title">正确答案</span>
        </el-divider>

        <div class="fill-answers-container">
          <div
            v-for="(answer, index) in formData.correctAnswers"
            :key="index"
            class="answer-item"
          >
            <el-form-item
              :label="`答案 ${index + 1}`"
              :prop="`correctAnswers.${index}`"
              :rules="{ required: true, message: '请输入答案', trigger: 'blur' }"
            >
              <div class="answer-input-group">
                <el-input
                  v-model="formData.correctAnswers[index]"
                  placeholder="请输入正确答案"
                  class="answer-input"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeFillAnswer(index)"
                  :disabled="formData.correctAnswers.length <= 1"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-form-item>
          </div>
        </div>

        <el-button @click="addFillAnswer">
          <el-icon><Plus /></el-icon>
          添加答案
        </el-button>
      </template>

      <!-- 问答题参考答案 -->
      <template v-if="formData.type === 'essay'">
        <el-form-item label="参考答案" prop="referenceAnswer">
          <el-input
            v-model="formData.referenceAnswer"
            type="textarea"
            :rows="6"
            placeholder="请输入参考答案"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </template>

      <!-- 题目解析 -->
      <el-form-item label="题目解析">
        <el-input
          v-model="formData.explanation"
          type="textarea"
          :rows="3"
          placeholder="请输入题目解析（可选）"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>

      <!-- 知识点 -->
      <el-form-item label="知识点">
        <div class="knowledge-points-container">
          <el-tag
            v-for="(kp, index) in formData.knowledgePoints"
            :key="index"
            closable
            @close="removeKnowledgePoint(index)"
            class="kp-tag"
          >
            {{ kp }}
          </el-tag>
          <el-input
            v-if="showKpInput"
            ref="kpInputRef"
            v-model="kpInputValue"
            class="kp-input"
            size="small"
            @keyup.enter="addKnowledgePoint"
            @blur="addKnowledgePoint"
          />
          <el-button v-else class="button-new-kp" size="small" @click="showKpInput = true">
            <el-icon><Plus /></el-icon>
            添加知识点
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '更新' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: null
  },
  questionType: {
    type: String,
    default: 'single'
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.question)

const dialogTitle = computed(() => isEdit.value ? '编辑题目' : '添加题目')

// 表单数据
const formRef = ref()
const saving = ref(false)
const showKpInput = ref(false)
const kpInputValue = ref('')
const kpInputRef = ref()

const formData = reactive({
  id: '',
  type: props.questionType || 'single',
  questionText: '',
  score: 5,
  difficulty: 'easy',
  options: [],
  correctAnswer: '',
  correctAnswers: [],
  referenceAnswer: '',
  explanation: '',
  knowledgePoints: []
})

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  questionText: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  score: [
    { required: true, message: '请输入分值', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  referenceAnswer: [
    { required: true, message: '请输入参考答案', trigger: 'blur' }
  ]
}

// 初始化选项
const initOptions = () => {
  if (formData.type === 'single' || formData.type === 'multiple') {
    if (formData.options.length === 0) {
      for (let i = 0; i < 4; i++) {
        formData.options.push({
          id: `opt_${String.fromCharCode(97 + i)}`,
          value: String.fromCharCode(65 + i),
          text: '',
          isCorrect: false
        })
      }
    }
  }
}

// 添加选项
const addOption = () => {
  const index = formData.options.length
  formData.options.push({
    id: `opt_${String.fromCharCode(97 + index)}`,
    value: String.fromCharCode(65 + index),
    text: '',
    isCorrect: false
  })
}

// 删除选项
const removeOption = (index) => {
  formData.options.splice(index, 1)
  // 重新生成选项标识
  formData.options.forEach((option, idx) => {
    option.value = String.fromCharCode(65 + idx)
    option.id = `opt_${String.fromCharCode(97 + idx)}`
  })
}

// 单选题正确答案切换
const handleSingleCorrectChange = (selectedIndex) => {
  formData.options.forEach((option, index) => {
    option.isCorrect = index === selectedIndex
  })
  formData.correctAnswer = formData.options[selectedIndex].value
}

// 多选题正确答案切换
const handleMultipleCorrectChange = () => {
  formData.correctAnswers = formData.options
    .filter(option => option.isCorrect)
    .map(option => option.value)
}

// 添加填空题答案
const addFillAnswer = () => {
  formData.correctAnswers.push('')
}

// 删除填空题答案
const removeFillAnswer = (index) => {
  formData.correctAnswers.splice(index, 1)
}

// 添加知识点
const addKnowledgePoint = () => {
  if (kpInputValue.value && !formData.knowledgePoints.includes(kpInputValue.value)) {
    formData.knowledgePoints.push(kpInputValue.value)
  }
  showKpInput.value = false
  kpInputValue.value = ''
}

// 删除知识点
const removeKnowledgePoint = (index) => {
  formData.knowledgePoints.splice(index, 1)
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    type: props.questionType || 'single',
    questionText: '',
    score: 5,
    difficulty: 'easy',
    options: [],
    correctAnswer: '',
    correctAnswers: [],
    referenceAnswer: '',
    explanation: '',
    knowledgePoints: []
  })
  initOptions()
}

// 保存题目
const handleSave = async () => {
  try {
    await formRef.value.validate()

    saving.value = true

    // 构建保存数据
    const saveData = {
      id: formData.id || `question_${Date.now()}`,
      type: formData.type,
      questionText: formData.questionText,
      score: formData.score,
      difficulty: formData.difficulty,
      explanation: formData.explanation,
      knowledgePoints: [...formData.knowledgePoints]
    }

    if (formData.type === 'single') {
      saveData.options = [...formData.options]
      saveData.correctAnswer = formData.correctAnswer
    } else if (formData.type === 'multiple') {
      saveData.options = [...formData.options]
      saveData.correctAnswers = [...formData.correctAnswers]
    } else if (formData.type === 'fill') {
      saveData.correctAnswers = [...formData.correctAnswers].filter(answer => answer.trim())
    } else if (formData.type === 'essay') {
      saveData.referenceAnswer = formData.referenceAnswer
    }

    emit('save', saveData)
    handleClose()
    ElMessage.success(isEdit.value ? '题目更新成功' : '题目添加成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 监听题目类型变化
watch(() => formData.type, (newType) => {
  if (newType === 'single' || newType === 'multiple') {
    initOptions()
  } else {
    formData.options = []
  }

  if (newType === 'fill') {
    if (formData.correctAnswers.length === 0) {
      formData.correctAnswers = ['']
    }
  } else if (newType === 'essay') {
    // 问答题不需要答案数组
  }
})

// 监听传入的题目数据
watch(() => props.question, (question) => {
  if (question) {
    Object.assign(formData, {
      id: question.id,
      type: question.type,
      questionText: question.questionText,
      score: question.score,
      difficulty: question.difficulty,
      explanation: question.explanation || '',
      knowledgePoints: question.knowledgePoints ? [...question.knowledgePoints] : []
    })

    if (question.type === 'single') {
      formData.options = question.options ? [...question.options] : []
      formData.correctAnswer = question.correctAnswer || ''
      // 设置正确答案状态
      formData.options.forEach(option => {
        option.isCorrect = option.value === formData.correctAnswer
      })
    } else if (question.type === 'multiple') {
      formData.options = question.options ? [...question.options] : []
      formData.correctAnswers = question.correctAnswers ? [...question.correctAnswers] : []
      // 设置正确答案状态
      formData.options.forEach(option => {
        option.isCorrect = formData.correctAnswers.includes(option.value)
      })
    } else if (question.type === 'fill') {
      formData.correctAnswers = question.correctAnswers ? [...question.correctAnswers] : ['']
    } else if (question.type === 'essay') {
      formData.referenceAnswer = question.referenceAnswer || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听知识点输入框显示
watch(showKpInput, (visible) => {
  if (visible) {
    nextTick(() => {
      kpInputRef.value?.focus()
    })
  }
})

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/QuestionBankManager/QuestionEditor.vue`);
  });

</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.options-container {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.option-item {
  margin-bottom: var(--spacing-md);
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.option-input {
  flex: 1;
}

.fill-answers-container {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-base);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.answer-item {
  margin-bottom: var(--spacing-md);
}

.answer-item:last-child {
  margin-bottom: 0;
}

.answer-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.answer-input {
  flex: 1;
}

.knowledge-points-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.kp-tag {
  margin: 0;
}

.kp-input {
  width: 120px;
}

.button-new-kp {
  margin: 0;
}

.divider-title {
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>