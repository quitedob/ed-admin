<template>
  <el-dialog
      id="homework-dialog"
      v-model="visible"
      :title="homework ? '编辑作业' : '新建作业'"
      width="700px"
      @close="handleClose"
  >
    <el-form
      id="homework-form"
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="作业标题" prop="title">
        <el-input id="homework-title-input" v-model="formData.title" placeholder="请输入作业标题" />
      </el-form-item>

      <el-form-item label="班级" prop="classId">
        <el-select id="class-select" v-model="formData.classId" placeholder="请选择班级">
          <el-option
            v-for="cls in classes"
            :key="cls.id"
            :label="cls.name"
            :value="cls.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="课程">
        <el-input id="course-name-input" v-model="formData.courseName" placeholder="请输入课程名称（可选）" />
      </el-form-item>

      <el-form-item label="截止时间" prop="dueDate">
        <el-date-picker
          id="due-date-picker"
          v-model="formData.dueDate"
          type="datetime"
          placeholder="选择截止时间"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          id="homework-description-input"
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入作业描述"
        />
      </el-form-item>

      <el-form-item label="添加题目">
        <div id="questions-section" class="questions-section">
          <div id="questions-list" class="questions-list">
            <div
              v-for="(question, index) in formData.questions"
              :key="index"
              :id="`question-item-${index}`"
              class="question-item"
            >
              <span class="question-text">{{ question.title }}</span>
              <el-button
                :id="`remove-question-btn-${index}`"
                type="danger"
                size="small"
                @click="removeQuestion(index)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-button id="add-question-btn" type="primary" size="small" @click="showQuestionSelector">
            <el-icon><Plus /></el-icon>
            从题库添加
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group id="homework-status-radio" v-model="formData.status">
          <el-radio label="draft">保存为草稿</el-radio>
          <el-radio label="published">发布</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button id="cancel-homework-btn" @click="handleClose">取消</el-button>
      <el-button id="save-homework-btn" type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>

  <!-- 题目选择对话框 -->
  <QuestionSelectorDialog
    v-model="questionSelectorVisible"
    @select="handleSelectQuestions"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import QuestionSelectorDialog from './QuestionSelectorDialog.vue'

const props = defineProps({
  modelValue: Boolean,
  homework: Object,
  classes: Array
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const questionSelectorVisible = ref(false)

const formData = ref({
  title: '',
  classId: '',
  courseName: '',
  dueDate: '',
  description: '',
  questions: [],
  status: 'draft'
})

const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

const handleSubmit = async () => {
  await formRef.value.validate()

  if (formData.value.questions.length === 0) {
    ElMessage.warning('请至少添加一道题目')
    return
  }

  emit('save', {
    title: formData.value.title,
    classId: formData.value.classId,
    className: props.classes.find(c => c.id === formData.value.classId)?.name,
    courseName: formData.value.courseName,
    dueDate: formData.value.dueDate,
    description: formData.value.description,
    questionCount: formData.value.questions.length,
    questions: formData.value.questions,
    status: formData.value.status,
    completionRate: 0
  })

  handleClose()
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const removeQuestion = (index) => {
  formData.value.questions.splice(index, 1)
}

const showQuestionSelector = () => {
  questionSelectorVisible.value = true
}

const handleSelectQuestions = (questions) => {
  formData.value.questions.push(...questions)
  ElMessage.success(`已添加 ${questions.length} 道题目`)
}

watch(() => props.homework, (val) => {
  if (val) {
    formData.value = {
      title: val.title,
      classId: val.classId || '',
      courseName: val.courseName || '',
      dueDate: val.dueDate,
      description: val.description || '',
      questions: val.questions || [],
      status: val.status || 'draft'
    }
  } else {
    formData.value = {
      title: '',
      classId: '',
      courseName: '',
      dueDate: '',
      description: '',
      questions: [],
      status: 'draft'
    }
  }
}, { immediate: true })
</script>

<style scoped>
.questions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
}

.question-text {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-primary);
}
</style>
