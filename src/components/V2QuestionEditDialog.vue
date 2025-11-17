<template>
  <div class="v2-question-edit-dialog">
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑题目' : '新建题目'"
      width="900px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <!-- 左侧导航栏 -->
      <div class="dialog-layout">
        <aside class="sidebar">
          <h4>题目编辑</h4>
          <nav class="nav-menu">
            <div
              v-for="section in sections"
              :key="section.id"
              class="nav-item"
              :class="{ active: currentSection === section.id, error: section.error }"
              @click="currentSection = section.id"
            >
              <el-icon><component :is="section.icon" /></el-icon>
              <span>{{ section.title }}</span>
              <el-tag v-if="section.error" type="danger" size="small">!</el-tag>
            </div>
          </nav>
        </aside>

        <!-- 右侧内容区 -->
        <main class="main-content">
          <!-- 基础信息 -->
          <section v-if="currentSection === 'basic'" class="edit-section">
            <h4>基础信息</h4>
            <el-form :model="questionData" label-width="100px">
              <el-form-item label="题型" required>
                <el-select v-model="questionData.type" placeholder="选择题型">
                  <el-option
                    v-for="type in questionTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="题目标题" required>
                <el-input
                  v-model="questionData.title"
                  placeholder="请输入题目标题"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="难度">
                <el-select v-model="questionData.difficulty" placeholder="选择难度">
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </el-form-item>
              <el-form-item label="分值">
                <el-input-number
                  v-model="questionData.score"
                  :min="1"
                  :max="100"
                  placeholder="题目分值"
                />
              </el-form-item>
            </el-form>
          </section>

          <!-- 题目内容 -->
          <section v-if="currentSection === 'content'" class="edit-section">
            <h4>题目内容</h4>
            <div class="content-editor">
              <EnhancedEditor
                v-model="questionData.questionText"
                :height="200"
                placeholder="请输入题目内容，支持富文本编辑、数学公式、代码块等功能"
              />
            </div>

            <!-- 选项编辑（单选题/多选题） -->
            <div v-if="['single', 'multiple'].includes(questionData.type)" class="options-editor">
              <h5>选项设置</h5>
              <div
                v-for="(option, index) in questionData.options"
                :key="index"
                class="option-item"
              >
                <el-input
                  v-model="option.text"
                  :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                  class="option-input"
                />
                <div class="option-actions">
                  <el-radio
                    v-if="questionData.type === 'single'"
                    v-model="questionData.correctAnswer"
                    :label="option.value"
                  >
                    正确答案
                  </el-radio>
                  <el-checkbox
                    v-else
                    v-model="questionData.correctAnswers"
                    :label="option.value"
                  >
                    正确答案
                  </el-checkbox>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeOption(index)"
                  />
                </div>
              </div>
              <el-button type="primary" :icon="Plus" @click="addOption">
                添加选项
              </el-button>
            </div>

            <!-- 填空题答案 -->
            <div v-if="questionData.type === 'fill'" class="fill-editor">
              <h5>正确答案</h5>
              <el-input
                v-model="questionData.correctAnswer"
                placeholder="请输入正确答案（多个答案用分号分隔）"
              />
            </div>

            <!-- 判断题答案 -->
            <div v-if="questionData.type === 'judge'" class="judge-editor">
              <h5>正确答案</h5>
              <el-radio-group v-model="questionData.correctAnswer">
                <el-radio :label="true">正确</el-radio>
                <el-radio :label="false">错误</el-radio>
              </el-radio-group>
            </div>

            <!-- 编程题设置 -->
            <div v-if="questionData.type === 'programming'" class="programming-editor">
              <h5>编程题设置</h5>
              <el-form label-width="100px">
                <el-form-item label="题目ID">
                  <el-input
                    v-model="questionData.problemId"
                    placeholder="HOJ题目ID（如：CF-1001）"
                  />
                </el-form-item>
                <el-form-item label="时间限制">
                  <el-input-number
                    v-model="questionData.timeLimit"
                    :min="100"
                    :max="10000"
                    placeholder="ms"
                  />
                  <span style="margin-left: 8px">ms</span>
                </el-form-item>
                <el-form-item label="内存限制">
                  <el-input-number
                    v-model="questionData.memoryLimit"
                    :min="32"
                    :max="1024"
                    placeholder="MB"
                  />
                  <span style="margin-left: 8px">MB</span>
                </el-form-item>
              </el-form>
            </div>
          </section>

          <!-- 高级设置 -->
          <section v-if="currentSection === 'advanced'" class="edit-section">
            <h4>高级设置</h4>
            <el-form :model="questionData" label-width="100px">
              <el-form-item label="标签">
                <el-select
                  v-model="questionData.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="添加标签"
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="解析">
                <EnhancedEditor
                  v-model="questionData.explanation"
                  :height="150"
                  placeholder="请输入题目解析，支持富文本编辑、数学公式、代码块等功能"
                />
              </el-form-item>
              <el-form-item label="提示">
                <EnhancedEditor
                  v-model="questionData.hint"
                  :height="100"
                  placeholder="请输入解题提示，支持富文本编辑、数学公式、代码块等功能"
                />
              </el-form-item>
            </el-form>
          </section>
        </main>
      </div>

      <!-- 底部操作按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Document, Setting, Edit } from '@element-plus/icons-vue'
import EnhancedEditor from '@/components/QuestionBank/EnhancedEditor.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  questionData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const currentSection = ref('basic')
const isEdit = computed(() => props.questionData && props.questionData.id)

// 题目数据
const questionData = ref({
  id: '',
  type: 'single',
  title: '',
  questionText: '',
  difficulty: 'medium',
  score: 5,
  options: [
    { value: 'A', text: '' },
    { value: 'B', text: '' },
    { value: 'C', text: '' },
    { value: 'D', text: '' }
  ],
  correctAnswer: 'A',
  correctAnswers: [],
  tags: [],
  explanation: '',
  hint: '',
  problemId: '',
  timeLimit: 1000,
  memoryLimit: 128
})

// 导航配置
const sections = [
  { id: 'basic', title: '基础信息', icon: Edit },
  { id: 'content', title: '题目内容', icon: Document },
  { id: 'advanced', title: '高级设置', icon: Setting }
]

// 题型选项
const questionTypes = [
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: '编程题', value: 'programming' },
  { label: '简答题', value: 'essay' }
]

// 可用标签
const availableTags = [
  '基础概念', '算法', '数据结构', '网络编程', '数据库',
  '前端开发', '后端开发', '系统设计', '安全', '测试'
]

// 监听传入数据变化
watch(() => props.questionData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(questionData.value, newVal)
  }
}, { immediate: true, deep: true })

// 方法
const addOption = () => {
  const newOption = {
    value: String.fromCharCode(65 + questionData.value.options.length),
    text: ''
  }
  questionData.value.options.push(newOption)
}

const removeOption = (index) => {
  if (questionData.value.options.length > 2) {
    questionData.value.options.splice(index, 1)
    // 重新生成选项值
    questionData.value.options.forEach((option, i) => {
      option.value = String.fromCharCode(65 + i)
    })
  } else {
    ElMessage.warning('至少需要保留2个选项')
  }
}

const validateQuestion = () => {
  // 基础验证
  if (!questionData.value.title.trim()) {
    ElMessage.error('请输入题目标题')
    return false
  }
  if (!questionData.value.questionText.trim()) {
    ElMessage.error('请输入题目内容')
    return false
  }

  // 根据题型进行特定验证
  switch (questionData.value.type) {
    case 'single':
    case 'multiple':
      const validOptions = questionData.value.options.filter(opt => opt.text.trim())
      if (validOptions.length < 2) {
        ElMessage.error('至少需要2个有效选项')
        return false
      }
      if (questionData.value.type === 'single' && !questionData.value.correctAnswer) {
        ElMessage.error('请选择正确答案')
        return false
      }
      if (questionData.value.type === 'multiple' && questionData.value.correctAnswers.length === 0) {
        ElMessage.error('请选择至少一个正确答案')
        return false
      }
      break
    case 'fill':
    case 'judge':
      if (!questionData.value.correctAnswer && questionData.value.correctAnswer !== false) {
        ElMessage.error('请设置正确答案')
        return false
      }
      break
    case 'programming':
      if (!questionData.value.problemId) {
        ElMessage.error('请输入题目ID')
        return false
      }
      break
  }

  return true
}

const handleSave = () => {
  if (!validateQuestion()) {
    return
  }

  const saveData = { ...questionData.value }

  // 多选题处理
  if (questionData.value.type === 'multiple') {
    saveData.correctAnswer = questionData.value.correctAnswers
  }

  emit('save', saveData)
  handleClose()
}

const handleClose = () => {
  dialogVisible.value = false
  currentSection.value = 'basic'
}
</script>

<style lang="scss" scoped>
.v2-question-edit-dialog {
  .dialog-layout {
    display: flex;
    min-height: 500px;
  }

  .sidebar {
    width: 200px;
    border-right: 1px solid var(--color-border-lighter);
    padding: 20px;
    background-color: var(--color-bg-primary);

    h4 {
      margin: 0 0 20px 0;
      color: var(--color-text-primary);
      font-size: 16px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      margin-bottom: 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: var(--color-bg-secondary);
      }

      &.active {
        background-color: var(--color-primary);
        color: white;
      }

      &.error {
        border: 1px solid var(--color-danger);
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    max-height: 600px;
  }

  .edit-section {
    h4, h5 {
      margin: 0 0 16px 0;
      color: var(--color-text-primary);
    }

    h5 {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    &:not(:last-child) {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--color-border-lighter);
    }
  }

  .content-editor {
    margin-bottom: 24px;
  }

  .options-editor {
    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .option-input {
        flex: 1;
      }

      .option-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .fill-editor, .judge-editor, .programming-editor {
    margin-top: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>