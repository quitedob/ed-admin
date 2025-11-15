<template>
  <el-dialog
    :title="isEdit ? '编辑题目' : '新增题目'"
    v-model="visible"
    width="900px"
    append-to-body
    @close="handleClose"
    class="assignment-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="题目标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入题目标题" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="题目类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择题目类型" @change="handleTypeChange">
              <el-option label="单选" value="single" />
              <el-option label="多选" value="multiple" />
              <el-option label="填空" value="fill" />
              <el-option label="简答" value="essay" />
              <el-option label="OJ" value="oj" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="form.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="题目内容" prop="questionText">
        <el-input
          v-model="form.questionText"
          type="textarea"
          placeholder="请输入题目内容"
          :rows="4"
        />
      </el-form-item>

      <el-form-item label="分值" prop="score">
        <el-input-number v-model="form.score" :min="1" :max="100" />
      </el-form-item>

      <!-- 单选题选项 -->
      <template v-if="form.type === 'single'">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">单选题选项</span>
        </el-divider>

        <div v-for="(option, index) in form.options" :key="index" class="option-item">
          <el-form-item :label="`选项 ${String.fromCharCode(65 + index)}`">
            <el-input v-model="option.text" placeholder="请输入选项内容">
              <template #append>
                <el-radio v-model="form.correctAnswer" :label="index">正确答案</el-radio>
                <el-button 
                  v-if="form.options.length > 2" 
                  type="danger" 
                  text 
                  @click="removeOption(index)"
                >
                  删除
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-button type="primary" plain @click="addOption">添加选项</el-button>
      </template>

      <!-- 多选题选项 -->
      <template v-if="form.type === 'multiple'">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">多选题选项</span>
        </el-divider>

        <div v-for="(option, index) in form.options" :key="index" class="option-item">
          <el-form-item :label="`选项 ${String.fromCharCode(65 + index)}`">
            <el-input v-model="option.text" placeholder="请输入选项内容">
              <template #append>
                <el-checkbox v-model="option.isCorrect">正确答案</el-checkbox>
                <el-button 
                  v-if="form.options.length > 2" 
                  type="danger" 
                  text 
                  @click="removeOption(index)"
                >
                  删除
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-button type="primary" plain @click="addOption">添加选项</el-button>
      </template>

      <!-- 填空题 -->
      <template v-if="form.type === 'fill'">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">填空题答案</span>
        </el-divider>

        <el-form-item label="标准答案" prop="fillAnswers">
          <el-input
            v-model="form.fillAnswers"
            type="textarea"
            placeholder="多个答案用英文分号分隔，如：答案1;答案2;答案3"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="答案说明">
          <el-input
            v-model="form.answerExplanation"
            type="textarea"
            placeholder="请输入答案说明（可选）"
            :rows="2"
          />
        </el-form-item>
      </template>

      <!-- 简答题 -->
      <template v-if="form.type === 'essay'">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">简答题设置</span>
        </el-divider>

        <el-form-item label="参考答案">
          <el-input
            v-model="form.referenceAnswer"
            type="textarea"
            placeholder="请输入参考答案"
            :rows="5"
          />
        </el-form-item>

        <el-form-item label="评分标准">
          <el-input
            v-model="form.gradingCriteria"
            type="textarea"
            placeholder="请输入评分标准（可选）"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="字数限制">
          <el-input-number v-model="form.wordLimit" :min="0" :max="10000" :step="100" />
          <span style="margin-left: 10px;">字（0表示不限制）</span>
        </el-form-item>
      </template>

      <!-- OJ题特殊设置 -->
      <template v-if="form.type === 'oj'">
        <el-divider content-position="left">
          <span style="color: #409eff; font-weight: 500;">OJ题设置</span>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间限制" prop="timeLimit">
              <el-input-number v-model="form.timeLimit" :min="100" :max="10000" :step="100" />
              <span style="margin-left: 10px;">ms</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内存限制" prop="memoryLimit">
              <el-input-number v-model="form.memoryLimit" :min="32" :max="1024" :step="32" />
              <span style="margin-left: 10px;">MB</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="输入格式" prop="inputFormat">
          <el-input
            v-model="form.inputFormat"
            type="textarea"
            placeholder="请输入输入格式说明"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="输出格式" prop="outputFormat">
          <el-input
            v-model="form.outputFormat"
            type="textarea"
            placeholder="请输入输出格式说明"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="样例输入" prop="sampleInput">
          <el-input
            v-model="form.sampleInput"
            type="textarea"
            placeholder="请输入样例输入"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="样例输出" prop="sampleOutput">
          <el-input
            v-model="form.sampleOutput"
            type="textarea"
            placeholder="请输入样例输出"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="提示">
          <el-input
            v-model="form.hint"
            type="textarea"
            placeholder="请输入解题提示（可选）"
            :rows="3"
          />
        </el-form-item>
      </template>

      <el-form-item label="题目解析">
        <el-input
          v-model="form.explanation"
          type="textarea"
          placeholder="请输入题目解析（可选）"
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  assignmentData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.assignmentData)

const formRef = ref()
const form = ref({
  title: '',
  type: 'single',
  difficulty: 'easy',
  questionText: '',
  score: 10,
  // 单选题
  correctAnswer: null,
  // 多选题/单选题
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ],
  // 填空题
  fillAnswers: '',
  answerExplanation: '',
  // 简答题
  referenceAnswer: '',
  gradingCriteria: '',
  wordLimit: 0,
  // OJ题
  timeLimit: 1000,
  memoryLimit: 256,
  inputFormat: '',
  outputFormat: '',
  sampleInput: '',
  sampleOutput: '',
  hint: '',
  // 题目解析
  explanation: ''
})

const rules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  questionText: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }]
}

// 题目类型改变
const handleTypeChange = (type) => {
  // 重置选项
  if (type === 'single' || type === 'multiple') {
    form.value.options = [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
    form.value.correctAnswer = null
  }
}

// 添加选项
const addOption = () => {
  form.value.options.push({ text: '', isCorrect: false })
}

// 删除选项
const removeOption = (index) => {
  form.value.options.splice(index, 1)
}

// 重置表单数据
const resetForm = () => {
  form.value = {
    title: '',
    type: 'single',
    difficulty: 'easy',
    questionText: '',
    score: 10,
    correctAnswer: null,
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    fillAnswers: '',
    answerExplanation: '',
    referenceAnswer: '',
    gradingCriteria: '',
    wordLimit: 0,
    timeLimit: 1000,
    memoryLimit: 256,
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    hint: '',
    explanation: ''
  }
}

// 监听外部数据变化
watch(() => props.assignmentData, (newData) => {
  if (newData) {
    form.value = { ...form.value, ...newData }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      emit('save', { ...form.value })
      handleClose()
    }
  })
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/assignments/components/AssignmentDialog.vue`);
});

</script>

<style scoped>
.option-item {
  margin-bottom: 15px;
}

.option-item :deep(.el-input-group__append) {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.assignment-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
}

:deep(.assignment-dialog .el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

:deep(.assignment-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
  font-size: 20px;
}

:deep(.assignment-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #f0f0f0;
}

:deep(.assignment-dialog .el-dialog__body) {
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.assignment-dialog .el-divider__text) {
  background-color: #fff;
}
</style>