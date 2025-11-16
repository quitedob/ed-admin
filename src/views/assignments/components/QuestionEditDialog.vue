<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑题目' : '新建题目'"
    width="900px"
    top="5vh"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="题号" prop="id">
            <el-input v-model="form.id" placeholder="自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="题型" prop="type">
            <el-select v-model="form.type" placeholder="请选择题型" @change="handleTypeChange">
              <el-option label="单选题" value="single" />
              <el-option label="多选题" value="multiple" />
              <el-option label="填空题" value="fill" />
              <el-option label="判断题" value="judge" />
              <el-option label="OJ题" value="programming" />
              <el-option label="简答题" value="essay" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="form.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分值" prop="score">
            <el-input-number v-model="form.score" :min="1" :max="100" />
          </el-form-item>
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
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <!-- 题目描述 -->
      <el-form-item label="题目描述" prop="questionText">
        <el-input
          v-model="form.questionText"
          type="textarea"
          :rows="4"
          placeholder="请输入题目内容"
        />
      </el-form-item>

      <!-- 单选题选项 -->
      <template v-if="form.type === 'single'">
        <el-divider content-position="left">单选题选项</el-divider>
        <div v-for="(option, index) in form.options" :key="index" class="option-row">
          <el-radio v-model="form.correctAnswer" :label="option.value" style="margin-right: 12px" />
          <span style="margin-right: 8px">{{ option.value }}:</span>
          <el-input
            v-model="option.text"
            placeholder="请输入选项内容"
            style="flex: 1"
          />
          <el-button
            v-if="form.options.length > 2"
            type="danger"
            text
            @click="removeOption(index)"
          >
            删除
          </el-button>
        </div>
        <el-button type="primary" plain @click="addOption" style="margin-top: 12px">
          添加选项
        </el-button>
      </template>

      <!-- 多选题选项 -->
      <template v-if="form.type === 'multiple'">
        <el-divider content-position="left">多选题选项</el-divider>
        <div v-for="(option, index) in form.options" :key="index" class="option-row">
          <el-checkbox v-model="option.isCorrect" style="margin-right: 12px" />
          <span style="margin-right: 8px">{{ option.value }}:</span>
          <el-input
            v-model="option.text"
            placeholder="请输入选项内容"
            style="flex: 1"
          />
          <el-button
            v-if="form.options.length > 2"
            type="danger"
            text
            @click="removeOption(index)"
          >
            删除
          </el-button>
        </div>
        <el-button type="primary" plain @click="addOption" style="margin-top: 12px">
          添加选项
        </el-button>
      </template>

      <!-- 判断题 -->
      <template v-if="form.type === 'judge'">
        <el-divider content-position="left">判断题答案</el-divider>
        <el-form-item label="正确答案">
          <el-radio-group v-model="form.correctAnswer">
            <el-radio :label="true">正确</el-radio>
            <el-radio :label="false">错误</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>

      <!-- 填空题 -->
      <template v-if="form.type === 'fill'">
        <el-divider content-position="left">填空题答案配置</el-divider>
        <div v-for="(blank, index) in form.fillBlanks" :key="index" class="blank-section">
          <div class="blank-header">
            <span class="blank-title">第{{ index + 1 }}空:</span>
            <el-button
              v-if="form.fillBlanks.length > 1"
              type="danger"
              text
              size="small"
              @click="removeBlank(index)"
            >
              删除
            </el-button>
          </div>
          <div v-for="(answer, aIndex) in blank.answers" :key="aIndex" class="answer-row">
            <el-input
              v-model="blank.answers[aIndex]"
              placeholder="输入可接受的答案"
              style="flex: 1"
            />
            <el-button
              v-if="blank.answers.length > 1"
              type="danger"
              text
              @click="removeAnswer(index, aIndex)"
            >
              删除
            </el-button>
          </div>
          <el-button type="text" @click="addAnswer(index)">+ 添加答案</el-button>
        </div>
        <el-button type="primary" plain @click="addBlank" style="margin-top: 12px">
          添加填空
        </el-button>
      </template>

      <!-- 问答题 -->
      <template v-if="form.type === 'essay'">
        <el-divider content-position="left">问答题设置</el-divider>
        <el-form-item label="参考答案">
          <el-input
            v-model="form.referenceAnswer"
            type="textarea"
            :rows="5"
            placeholder="请输入参考答案"
          />
        </el-form-item>
        <el-form-item label="评分标准">
          <el-input
            v-model="form.gradingCriteria"
            type="textarea"
            :rows="3"
            placeholder="请输入评分标准（可选）"
          />
        </el-form-item>
        <el-form-item label="AI辅助评分">
          <el-switch v-model="form.aiGrading" />
        </el-form-item>
      </template>

      <!-- 编程题(HOJ) -->
      <template v-if="form.type === 'programming'">
        <el-divider content-position="left">编程题(HOJ)设置</el-divider>
        <el-form-item label="题目ID">
          <el-input v-model="form.hojProblemId" placeholder="如: CF-1001" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间限制">
              <el-input-number v-model="form.timeLimit" :min="100" :max="10000" :step="100" />
              <span style="margin-left: 8px">ms</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存限制">
              <el-input-number v-model="form.memoryLimit" :min="32" :max="1024" :step="32" />
              <span style="margin-left: 8px">MB</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="必做">
          <el-switch v-model="form.required" />
        </el-form-item>
        <el-form-item label="允许多次提交">
          <el-switch v-model="form.multipleSubmit" />
        </el-form-item>
      </template>

      <!-- 题目解析 -->
      <el-form-item label="题目解析">
        <el-input
          v-model="form.explanation"
          type="textarea"
          :rows="3"
          placeholder="请输入题目解析（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="info" @click="handlePreview">预览</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questionData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.questionData)

const formRef = ref()
const availableTags = ref(['基础', '第一章', '进阶', '算法', '数据结构'])

const form = ref({
  id: '',
  type: 'single',
  difficulty: 'easy',
  score: 10,
  tags: [],
  questionText: '',
  // 单选/多选
  options: [
    { value: 'A', text: '', isCorrect: false },
    { value: 'B', text: '', isCorrect: false }
  ],
  correctAnswer: '',
  // 填空题
  fillBlanks: [{ answers: [''] }],
  // 问答题
  referenceAnswer: '',
  gradingCriteria: '',
  aiGrading: false,
  // 编程题
  hojProblemId: '',
  timeLimit: 1000,
  memoryLimit: 256,
  required: true,
  multipleSubmit: true,
  // 解析
  explanation: ''
})

const rules = {
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  questionText: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }]
}

const handleTypeChange = () => {
  // 重置选项
  if (form.value.type === 'single' || form.value.type === 'multiple') {
    form.value.options = [
      { value: 'A', text: '', isCorrect: false },
      { value: 'B', text: '', isCorrect: false }
    ]
  }
}

const addOption = () => {
  const nextLetter = String.fromCharCode(65 + form.value.options.length)
  form.value.options.push({ value: nextLetter, text: '', isCorrect: false })
}

const removeOption = (index) => {
  form.value.options.splice(index, 1)
  // 重新分配字母
  form.value.options.forEach((opt, i) => {
    opt.value = String.fromCharCode(65 + i)
  })
}

const addBlank = () => {
  form.value.fillBlanks.push({ answers: [''] })
}

const removeBlank = (index) => {
  form.value.fillBlanks.splice(index, 1)
}

const addAnswer = (blankIndex) => {
  form.value.fillBlanks[blankIndex].answers.push('')
}

const removeAnswer = (blankIndex, answerIndex) => {
  form.value.fillBlanks[blankIndex].answers.splice(answerIndex, 1)
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', { ...form.value })
      handleClose()
    }
  })
}

const handleClose = () => {
  visible.value = false
}

watch(() => props.questionData, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
  } else {
    // 重置表单
    form.value = {
      id: `q_${Date.now()}`,
      type: 'single',
      difficulty: 'easy',
      score: 10,
      tags: [],
      questionText: '',
      options: [
        { value: 'A', text: '', isCorrect: false },
        { value: 'B', text: '', isCorrect: false }
      ],
      correctAnswer: '',
      fillBlanks: [{ answers: [''] }],
      referenceAnswer: '',
      gradingCriteria: '',
      aiGrading: false,
      hojProblemId: '',
      timeLimit: 1000,
      memoryLimit: 256,
      required: true,
      multipleSubmit: true,
      explanation: ''
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.blank-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 8px;

  .blank-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .blank-title {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  .answer-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
}
</style>
