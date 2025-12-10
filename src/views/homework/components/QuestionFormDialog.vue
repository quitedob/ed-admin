<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑题目' : '新建题目'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 题型选择 -->
      <el-form-item label="题型" prop="type">
        <el-select v-model="form.type" placeholder="请选择题型" @change="handleTypeChange">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="填空题" value="fill" />
          <el-option label="判断题" value="judge" />
          <el-option label="简答题" value="essay" />
          <el-option label="OJ编程题" value="programming" />
        </el-select>
      </el-form-item>

      <!-- 题目内容 -->
      <el-form-item label="题目内容" prop="questionText">
        <el-input
          v-model="form.questionText"
          type="textarea"
          :rows="4"
          :placeholder="getQuestionTextPlaceholder()"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 填空题特殊说明 -->
      <el-alert
        v-if="form.type === 'fill'"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #title>
          <div style="font-size: 13px">
            <strong>填空题说明：</strong>请在题目内容中使用 <code>____</code>（4个下划线）标记填空位置
          </div>
        </template>
      </el-alert>

      <!-- 单选题选项 -->
      <template v-if="form.type === 'single'">
        <el-form-item label="选项" required>
          <div class="options-container">
            <div v-for="(option, index) in form.options" :key="index" class="option-item">
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <el-input v-model="form.options[index]" placeholder="请输入选项内容" />
              <el-button
                v-if="form.options.length > 2"
                type="danger"
                text
                @click="removeOption(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" text @click="addOption">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-select v-model="form.correctAnswer" placeholder="请选择正确答案">
            <el-option
              v-for="(option, index) in form.options"
              :key="index"
              :label="`${String.fromCharCode(65 + index)}. ${option}`"
              :value="String.fromCharCode(65 + index)"
            />
          </el-select>
        </el-form-item>
      </template>

      <!-- 多选题选项 -->
      <template v-if="form.type === 'multiple'">
        <el-form-item label="选项" required>
          <div class="options-container">
            <div v-for="(option, index) in form.options" :key="index" class="option-item">
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <el-input v-model="form.options[index]" placeholder="请输入选项内容" />
              <el-button
                v-if="form.options.length > 2"
                type="danger"
                text
                @click="removeOption(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" text @click="addOption">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-checkbox-group v-model="form.correctAnswer">
            <el-checkbox
              v-for="(option, index) in form.options"
              :key="index"
              :label="String.fromCharCode(65 + index)"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>

      <!-- 填空题答案 -->
      <template v-if="form.type === 'fill'">
        <el-form-item label="填空数量" prop="blankCount">
          <el-input-number v-model="form.blankCount" :min="1" :max="5" @change="handleBlankCountChange" />
          <span style="margin-left: 8px; font-size: 12px; color: #909399">
            题目中有几个 ____ 就填几
          </span>
        </el-form-item>
        
        <div v-for="(blank, index) in form.blanks" :key="index" class="blank-answer-section">
          <el-form-item :label="`第${index + 1}空答案`" :prop="`blanks.${index}.correctAnswer`" required>
            <el-input
              v-model="blank.correctAnswer"
              placeholder="请输入标准答案"
            />
          </el-form-item>
          <el-form-item :label="`可接受答案`">
            <el-select
              v-model="blank.acceptableAnswers"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入后按回车添加（可选）"
              style="width: 100%"
            >
            </el-select>
            <div style="font-size: 12px; color: #909399; margin-top: 4px">
              除了标准答案外，还可以接受的其他答案形式
            </div>
          </el-form-item>
        </div>
      </template>

      <!-- 判断题答案 -->
      <el-form-item v-if="form.type === 'judge'" label="正确答案" prop="correctAnswer">
        <el-radio-group v-model="form.correctAnswer">
          <el-radio :label="true">正确</el-radio>
          <el-radio :label="false">错误</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 简答题参考答案 -->
      <template v-if="form.type === 'essay'">
        <el-form-item label="参考答案" prop="referenceAnswer">
          <el-input
            v-model="form.referenceAnswer"
            type="textarea"
            :rows="4"
            placeholder="请输入参考答案"
          />
        </el-form-item>
        <el-form-item label="评分标准" prop="scoringCriteria">
          <el-input
            v-model="form.scoringCriteria"
            type="textarea"
            :rows="3"
            placeholder="请输入评分标准，例如：答案需包含：1.核心概念(40%)；2.具体说明(40%)；3.表述清晰(20%)"
          />
        </el-form-item>
        <el-form-item label="关键得分点">
          <el-select
            v-model="form.keyPoints"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入关键词后按回车添加"
            style="width: 100%"
          >
          </el-select>
        </el-form-item>
      </template>

      <!-- OJ编程题 -->
      <template v-if="form.type === 'programming'">
        <el-form-item label="HOJ题目ID" prop="hojProblemId">
          <el-input v-model="form.hojProblemId" placeholder="请输入HOJ平台的题目ID" />
        </el-form-item>
        <el-form-item label="时间限制">
          <el-input-number v-model="form.timeLimit" :min="100" :max="10000" :step="100" />
          <span style="margin-left: 8px">ms</span>
        </el-form-item>
        <el-form-item label="内存限制">
          <el-input-number v-model="form.memoryLimit" :min="64" :max="1024" :step="64" />
          <span style="margin-left: 8px">MB</span>
        </el-form-item>
        <el-form-item label="评分标准">
          <el-input
            v-model="form.scoringCriteria"
            type="textarea"
            :rows="2"
            placeholder="例如：通过所有测试用例得满分，部分通过按比例得分"
          />
        </el-form-item>
      </template>

      <!-- 通用字段 -->
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

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入标签后按回车添加"
          style="width: 100%"
        >
        </el-select>
      </el-form-item>

      <el-form-item label="答案解析">
        <el-input
          v-model="form.explanation"
          type="textarea"
          :rows="3"
          placeholder="请输入答案解析（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  question: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const isEdit = computed(() => !!props.question)

const defaultForm = {
  type: 'single',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  referenceAnswer: '',
  scoringCriteria: '',
  keyPoints: [],
  hojProblemId: '',
  timeLimit: 1000,
  memoryLimit: 256,
  difficulty: 'medium',
  score: 5,
  tags: [],
  explanation: '',
  blankCount: 1,
  blanks: [
    {
      id: 1,
      correctAnswer: '',
      acceptableAnswers: []
    }
  ]
}

const form = ref({ ...defaultForm })

const rules = {
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  questionText: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  correctAnswer: [{ required: true, message: '请设置正确答案', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  score: [{ required: true, message: '请输入分值', trigger: 'blur' }]
}

// 获取题目内容的 placeholder
const getQuestionTextPlaceholder = () => {
  const placeholders = {
    single: '请输入题目内容',
    multiple: '请输入题目内容',
    fill: '请输入题目内容，使用 ____ (4个下划线) 标记填空位置，例如：Python中，____是所有类的父类',
    judge: '请输入题目内容',
    essay: '请输入题目内容',
    programming: '请输入题目内容'
  }
  return placeholders[form.value.type] || '请输入题目内容'
}

const handleTypeChange = () => {
  // 重置相关字段
  if (form.value.type === 'single' || form.value.type === 'multiple') {
    if (!form.value.options || form.value.options.length === 0) {
      form.value.options = ['', '', '', '']
    }
  }
  if (form.value.type === 'multiple') {
    form.value.correctAnswer = []
  } else if (form.value.type === 'judge') {
    form.value.correctAnswer = true
  } else if (form.value.type === 'fill') {
    if (!form.value.blanks || form.value.blanks.length === 0) {
      form.value.blanks = [
        {
          id: 1,
          correctAnswer: '',
          acceptableAnswers: []
        }
      ]
    }
  } else {
    form.value.correctAnswer = ''
  }
}

const handleBlankCountChange = (val) => {
  const currentLength = form.value.blanks.length
  if (val > currentLength) {
    // 添加空
    for (let i = currentLength; i < val; i++) {
      form.value.blanks.push({
        id: i + 1,
        correctAnswer: '',
        acceptableAnswers: []
      })
    }
  } else if (val < currentLength) {
    // 删除空
    form.value.blanks = form.value.blanks.slice(0, val)
  }
}

const addOption = () => {
  form.value.options.push('')
}

const removeOption = (index) => {
  form.value.options.splice(index, 1)
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证填空题
      if (form.value.type === 'fill') {
        const blankCount = (form.value.questionText.match(/____/g) || []).length
        if (blankCount === 0) {
          ElMessage.warning('请在题目内容中使用 ____ 标记填空位置')
          return
        }
        if (blankCount !== form.value.blankCount) {
          ElMessage.warning(`题目中有 ${blankCount} 个填空，但填空数量设置为 ${form.value.blankCount}，请保持一致`)
          return
        }
        // 检查每个空是否都有答案
        for (let i = 0; i < form.value.blanks.length; i++) {
          if (!form.value.blanks[i].correctAnswer) {
            ElMessage.warning(`请填写第${i + 1}空的标准答案`)
            return
          }
        }
      }

      // 验证选择题选项
      if (form.value.type === 'single' || form.value.type === 'multiple') {
        const emptyOptions = form.value.options.filter(opt => !opt.trim())
        if (emptyOptions.length > 0) {
          ElMessage.warning('请填写所有选项内容')
          return
        }
      }

      const questionData = {
        id: props.question?.id || `q_${Date.now()}`,
        ...form.value
      }

      emit('save', questionData)
      handleClose()
      ElMessage.success(isEdit.value ? '题目更新成功' : '题目创建成功')
    }
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  form.value = { ...defaultForm }
}

watch(() => props.question, (val) => {
  if (val) {
    form.value = { ...defaultForm, ...val }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.options-container {
  width: 100%;

  .option-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .option-label {
      font-weight: 600;
      min-width: 24px;
    }

    .el-input {
      flex: 1;
    }
  }
}

.blank-answer-section {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 12px;

  .el-form-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

code {
  padding: 2px 6px;
  background: #f0f2f5;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e74c3c;
  font-weight: 600;
}
</style>
