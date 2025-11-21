<template>
  <el-dialog
      id="add-to-assignment-dialog"
      title="添加到作业"
      v-model="visible"
      width="600px"
      append-to-body
  >
    <div id="add-to-assignment-content" class="add-to-assignment-content">
      <p>已选择 {{ questions.length }} 道题目</p>

      <el-form id="assignment-form" :model="form" label-width="100px">
        <el-form-item label="选择作业">
          <el-select id="assignment-select" v-model="form.assignmentId" placeholder="请选择要添加到的作业" style="width: 100%">
            <el-option
              v-for="assignment in assignmentList"
              :key="assignment.id"
              :label="assignment.title"
              :value="assignment.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="或创建新作业">
          <el-input id="new-assignment-title" v-model="form.newAssignmentTitle" placeholder="输入新作业标题" />
        </el-form-item>
      </el-form>

      <div id="selected-questions" class="selected-questions">
        <h4>选中的题目：</h4>
        <ul>
          <li v-for="(question, index) in questions" :key="question.id" :id="`selected-question-${index}`">
            {{ question.title }} ({{ getQuestionTypeLabel(question.type) }})
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div id="add-assignment-dialog-footer" class="dialog-footer">
        <el-button id="cancel-add-btn" @click="handleClose">取消</el-button>
        <el-button id="confirm-add-btn" type="primary" @click="handleAdd">添加</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { homeworkApi } from '@/api/homework'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'add'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const assignmentList = ref([])
const form = ref({
  assignmentId: '',
  newAssignmentTitle: ''
})

const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '应用题',
    'oj': 'OJ题'
  }
  return typeMap[type] || type
}

const loadAssignments = async () => {
  try {
    const result = await homeworkApi.homeworkPage({ pageSize: 1000 })
    assignmentList.value = result.records
  } catch (error) {
    console.error('加载作业列表失败:', error)
  }
}

const handleClose = () => {
  visible.value = false
  form.value = {
    assignmentId: '',
    newAssignmentTitle: ''
  }
}

const handleAdd = () => {
  if (!form.value.assignmentId && !form.value.newAssignmentTitle) {
    ElMessage.warning('请选择现有作业或创建新作业')
    return
  }

  const assignmentId = form.value.assignmentId || 'new_' + Date.now()

  emit('add', {
    assignmentId,
    assignmentTitle: form.value.newAssignmentTitle,
    questions: props.questions
  })

  handleClose()
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/AddToAssignmentDialog.vue`);
  loadAssignments()
})
</script>

<style scoped>
.add-to-assignment-content {
  padding: 20px 0;
  line-height: 1.6;
}

.selected-questions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;

  h4 {
    margin: 0 0 10px 0;
    color: #606266;
  }

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
    color: #303133;
  }
}
</style>