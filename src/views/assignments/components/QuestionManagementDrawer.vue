<template>
  <el-drawer
    v-model="visible"
    title="新建题目"
    size="90%"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="question-create-container">
      <!-- 题型选择 -->
      <div class="type-selection-section">
        <h3>选择题型</h3>
        <div class="type-cards">
          <div
            v-for="type in questionTypes"
            :key="type.value"
            :class="['type-card', { active: formData.type === type.value }]"
            @click="selectType(type.value)"
          >
            <el-icon :size="32"><component :is="type.icon" /></el-icon>
            <div class="type-info">
              <h4>{{ type.label }}</h4>
              <p>{{ type.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 题目表单 -->
      <el-form
        v-if="formData.type"
        ref="formRef"
        :model="formData"
        label-width="120px"
        class="question-form"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-header">
            <h3>基础信息</h3>
            <el-button
              v-if="formData.type === 'programming'"
              type="primary"
              size="small"
              @click="showGlobalJsonImportDialog = true"
            >
              <el-icon><Upload /></el-icon>
              题目导入
            </el-button>
          </div>

          <el-form-item label="题目内容" required>
            <div class="rich-editor-wrapper">
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                mode="default"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                v-model="formData.questionText"
                :defaultConfig="editorConfig"
                mode="default"
                style="height: 300px; overflow-y: hidden"
                @onCreated="handleEditorCreated"
              />
            </div>
          </el-form-item>

          <el-form-item label="难度">
            <el-select v-model="formData.difficulty" placeholder="选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>

          <el-form-item label="题目标签">
            <el-select
              v-model="formData.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入题目标签（输入新标签自动创建）"
              style="width: 100%"
              @change="handleTagsChange"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag.name"
                :label="tag.name"
                :value="tag.name"
              >
                <span :style="{ color: tag.color, fontWeight: 500 }">
                  <el-icon style="vertical-align: middle; margin-right: 4px;"><PriceTag /></el-icon>
                  {{ tag.name }}
                </span>
              </el-option>
            </el-select>
            <div style="margin-top: 8px; font-size: 12px; color: #909399;">
              提示：输入新标签名称后按回车即可创建，系统会自动查重并分配颜色
            </div>
          </el-form-item>
        </div>

        <!-- 单选题选项 -->
        <div v-if="formData.type === 'single'" class="form-section">
          <h3>选项设置</h3>
          <div
            v-for="(option, index) in formData.options"
            :key="index"
            class="option-item"
          >
            <el-radio v-model="formData.correctAnswer" :label="option.value">
              {{ option.value }}
            </el-radio>
            <el-input
              v-model="option.text"
              :placeholder="`选项 ${option.value}`"
              class="option-input"
            />
            <el-button
              v-if="formData.options.length > 2"
              type="danger"
              text
              @click="removeOption(index)"
            >
              删除
            </el-button>
          </div>
          <el-button @click="addOption" style="margin-top: 10px">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>

        <!-- 多选题选项 -->
        <div v-if="formData.type === 'multiple'" class="form-section">
          <h3>选项设置</h3>
          <div
            v-for="(option, index) in formData.options"
            :key="index"
            class="option-item"
          >
            <el-checkbox
              v-model="option.isCorrect"
              @change="updateMultipleAnswer"
            >
              {{ option.value }}
            </el-checkbox>
            <el-input
              v-model="option.text"
              :placeholder="`选项 ${option.value}`"
              class="option-input"
            />
            <el-button
              v-if="formData.options.length > 2"
              type="danger"
              text
              @click="removeOption(index)"
            >
              删除
            </el-button>
          </div>
          <el-button @click="addOption" style="margin-top: 10px">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>

        <!-- 填空题 -->
        <div v-if="formData.type === 'fill'" class="form-section">
          <h3>填空设置</h3>
          <div
            v-for="(blank, index) in formData.fillBlanks"
            :key="index"
            class="blank-item"
          >
            <el-form-item :label="`空格 ${index + 1}`">
              <el-select
                v-model="blank.answers"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入可能的答案（支持多个）"
                style="width: 100%"
              />
            </el-form-item>
            <el-button
              v-if="formData.fillBlanks.length > 1"
              type="danger"
              text
              @click="removeBlank(index)"
            >
              删除
            </el-button>
          </div>
          <el-button @click="addBlank" style="margin-top: 10px">
            <el-icon><Plus /></el-icon>
            添加空格
          </el-button>
        </div>

        <!-- 判断题 -->
        <div v-if="formData.type === 'judge'" class="form-section">
          <h3>答案设置</h3>
          <el-form-item label="正确答案">
            <el-radio-group v-model="formData.correctAnswer">
              <el-radio :label="true">正确</el-radio>
              <el-radio :label="false">错误</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- OJ题型 -->
        <div v-if="formData.type === 'programming'" class="form-section">
          <div class="section-header">
            <h3>OJ题目设置</h3>
            <el-button
              type="primary"
              size="small"
              @click="showJsonImportDialog = true"
            >
              <el-icon><Upload /></el-icon>
              JSON导入
            </el-button>
          </div>

          <el-form-item label="测试用例">
            <div class="testcase-container">
              <div
                v-for="(testcase, index) in formData.testCases"
                :key="index"
                class="testcase-item"
              >
                <div class="testcase-header">
                  <span>测试用例 {{ index + 1 }}</span>
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click="removeTestCase(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-input
                  v-model="testcase.input"
                  type="textarea"
                  :rows="3"
                  placeholder="输入数据"
                  class="testcase-input"
                />
                <el-input
                  v-model="testcase.expectedOutput"
                  type="textarea"
                  :rows="3"
                  placeholder="预期输出数据"
                  class="testcase-input"
                />
              </div>
              <el-button
                type="primary"
                text
                @click="addTestCase"
                style="margin-top: 10px"
              >
                <el-icon><Plus /></el-icon>
                添加测试用例
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="时间限制(ms)">
            <el-input-number v-model="formData.timeLimit" :min="100" :step="100" />
          </el-form-item>

          <el-form-item label="内存限制(MB)">
            <el-input-number v-model="formData.memoryLimit" :min="32" :step="32" />
          </el-form-item>

          <el-form-item label="是否必做">
            <el-switch v-model="formData.required" />
          </el-form-item>

          <el-form-item label="允许多次提交">
            <el-switch v-model="formData.multipleSubmit" />
          </el-form-item>
        </div>

        <!-- JSON导入对话框 -->
        <el-dialog
          v-model="showJsonImportDialog"
          title="JSON导入测试用例"
          width="60%"
          :close-on-click-modal="false"
        >
          <div class="json-import-dialog">
            <el-alert
              title="JSON格式说明"
              type="info"
              :closable="false"
              style="margin-bottom: 16px"
            >
              <template #default>
                <p>请按照以下JSON格式导入测试用例：</p>
                <pre class="json-example">{{ jsonExample }}</pre>
              </template>
            </el-alert>

            <el-input
              v-model="jsonImportText"
              type="textarea"
              :rows="12"
              placeholder="请粘贴JSON格式的测试用例数据..."
              class="json-textarea"
            />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showJsonImportDialog = false">取消</el-button>
              <el-button type="primary" @click="handleJsonImport">
                导入测试用例
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 全局题目JSON导入对话框 -->
        <el-dialog
          v-model="showGlobalJsonImportDialog"
          title="JSON导入OJ题目"
          width="70%"
          :close-on-click-modal="false"
        >
          <div class="json-import-dialog">
            <el-alert
              title="OJ题目JSON格式说明"
              type="info"
              :closable="false"
              style="margin-bottom: 16px"
            >
              <template #default>
                <p>请按照以下JSON格式导入完整的OJ题目信息：</p>
                <pre class="json-example">{{ globalJsonExample }}</pre>
              </template>
            </el-alert>

            <el-input
              v-model="globalJsonImportText"
              type="textarea"
              :rows="15"
              placeholder="请粘贴JSON格式的OJ题目数据..."
              class="json-textarea"
            />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showGlobalJsonImportDialog = false">取消</el-button>
              <el-button type="primary" @click="handleGlobalJsonImport">
                导入题目
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 简答题 -->
        <div v-if="formData.type === 'essay'" class="form-section">
          <h3>简答题设置</h3>
          
          <el-form-item label="参考答案">
            <el-input
              v-model="formData.referenceAnswer"
              type="textarea"
              :rows="4"
              placeholder="输入参考答案"
            />
          </el-form-item>

          <el-form-item label="评分标准">
            <el-input
              v-model="formData.gradingCriteria"
              type="textarea"
              :rows="3"
              placeholder="输入评分标准"
            />
          </el-form-item>

          <el-form-item label="AI自动评分">
            <el-switch v-model="formData.aiGrading" />
          </el-form-item>
        </div>

        <!-- 通用字段 -->
        <div class="form-section">
          <h3>其他信息</h3>

          <el-form-item label="题目解析">
            <el-input
              v-model="formData.explanation"
              type="textarea"
              :rows="3"
              placeholder="输入题目解析"
            />
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存题目</el-button>
        </div>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup name="QuestionManagementDrawer">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, PriceTag, Upload, Delete } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
  modelValue: Boolean,
  bankId: String
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const editorRef = ref(null)

const toolbarConfig = {
  excludeKeys: ['fullScreen']
}

const editorConfig = {
  placeholder: '请输入题目内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload',
      fieldName: 'file'
    }
  }
}

const questionTypes = [
  { value: 'single', label: '单选题', icon: 'CircleCheckFilled', description: '选择一个正确答案' },
  { value: 'multiple', label: '多选题', icon: 'CircleCheckFilled', description: '选择多个正确答案' },
  { value: 'fill', label: '填空题', icon: 'Edit', description: '填写空白处的答案' },
  { value: 'judge', label: '判断题', icon: 'CircleCheckFilled', description: '判断正误' },
  { value: 'programming', label: 'OJ题', icon: 'CodeBrackets', description: '编程题目' },
  { value: 'essay', label: '简答题', icon: 'Document', description: '简述题目' }
]

const availableTags = ref([
  { name: '面向对象', color: '#409eff' },
  { name: '封装继承多态', color: '#67c23a' },
  { name: 'Java集合', color: '#e6a23c' },
  { name: '异常处理', color: '#f56c6c' },
  { name: '数组操作', color: '#909399' }
])

const formData = ref({
  type: '',
  questionText: '',
  difficulty: 'medium',
  tags: [],
  options: [
    { value: 'A', text: '', isCorrect: false },
    { value: 'B', text: '', isCorrect: false },
    { value: 'C', text: '', isCorrect: false },
    { value: 'D', text: '', isCorrect: false }
  ],
  correctAnswer: 'A',
  fillBlanks: [{ answers: [] }],
  referenceAnswer: '',
  gradingCriteria: '',
  aiGrading: false,
  explanation: '',
  score: 1,
  hojProblemId: '',
  timeLimit: 1000,
  memoryLimit: 256,
  required: true,
  multipleSubmit: true,
  testCases: []
})

const showJsonImportDialog = ref(false)
const jsonImportText = ref('')

const showGlobalJsonImportDialog = ref(false)
const globalJsonImportText = ref('')

const jsonExample = `{
  "testCases": [
    {
      "input": "5\\n3\\n8",
      "expectedOutput": "8"
    },
    {
      "input": "10\\n20\\n30",
      "expectedOutput": "30"
    }
  ]
}`

const globalJsonExample = `{
  "questionText": "编写一个程序，找出三个数中的最大值。\\n\\n输入格式：\\n输入三个整数 a, b, c\\n\\n输出格式：\\n输出最大值",
  "difficulty": "medium",
  "tags": ["基础算法", "条件判断", "数组操作"],
  "explanation": "使用条件判断或内置函数找出最大值",
  "timeLimit": 1000,
  "memoryLimit": 256,
  "required": true,
  "multipleSubmit": true,
  "testCases": [
    {
      "input": "5 3 8",
      "expectedOutput": "8"
    },
    {
      "input": "10 20 30",
      "expectedOutput": "30"
    },
    {
      "input": "-5 -2 -8",
      "expectedOutput": "-2"
    }
  ]
}`

const formRef = ref()

const selectType = (type) => {
  formData.value.type = type
  resetFormData()
}

const resetFormData = () => {
  formData.value.questionText = ''
  formData.value.correctAnswer = formData.value.type === 'single' ? 'A' : formData.value.type === 'judge' ? true : []
  formData.value.options = [
    { value: 'A', text: '', isCorrect: false },
    { value: 'B', text: '', isCorrect: false },
    { value: 'C', text: '', isCorrect: false },
    { value: 'D', text: '', isCorrect: false }
  ]
  formData.value.fillBlanks = [{ answers: [] }]
}

const addOption = () => {
  const nextValue = String.fromCharCode(65 + formData.value.options.length)
  formData.value.options.push({ value: nextValue, text: '', isCorrect: false })
}

const removeOption = (index) => {
  formData.value.options.splice(index, 1)
}

const addBlank = () => {
  formData.value.fillBlanks.push({ answers: [] })
}

const removeBlank = (index) => {
  formData.value.fillBlanks.splice(index, 1)
}

const updateMultipleAnswer = () => {
  formData.value.correctAnswer = formData.value.options
    .filter(opt => opt.isCorrect)
    .map(opt => opt.value)
}

const handleTagsChange = (tags) => {
  formData.value.tags = tags
}

const handleEditorCreated = (editor) => {
  editorRef.value = editor
}

const handleCancel = () => {
  visible.value = false
  resetFormData()
}

const handleSubmit = async () => {
  if (!formData.value.type) {
    ElMessage.error('请选择题型')
    return
  }

  if (!formData.value.questionText) {
    ElMessage.error('请输入题目内容')
    return
  }

  const questionData = {
    ...formData.value,
    id: `q_${Date.now()}`
  }

  emit('save', [questionData])
  ElMessage.success('题目保存成功')
  visible.value = false
  resetFormData()
}

const handleVisibleChange = (val) => {
  if (!val) {
    resetFormData()
  }
}

const addTestCase = () => {
  formData.value.testCases.push({
    input: '',
    expectedOutput: ''
  })
}

const removeTestCase = (index) => {
  formData.value.testCases.splice(index, 1)
}

const handleJsonImport = () => {
  try {
    const jsonData = JSON.parse(jsonImportText.value)

    if (!jsonData.testCases || !Array.isArray(jsonData.testCases)) {
      ElMessage.error('JSON格式错误：缺少testCases数组')
      return
    }

    const validTestCases = jsonData.testCases.filter(tc =>
      tc.input !== undefined && tc.expectedOutput !== undefined
    )

    if (validTestCases.length === 0) {
      ElMessage.error('JSON格式错误：没有有效的测试用例')
      return
    }

    formData.value.testCases = validTestCases
    showJsonImportDialog.value = false
    jsonImportText.value = ''
    ElMessage.success(`成功导入 ${validTestCases.length} 个测试用例`)
  } catch (error) {
    ElMessage.error('JSON格式错误：请检查JSON语法是否正确')
  }
}

const handleGlobalJsonImport = () => {
  try {
    const jsonData = JSON.parse(globalJsonImportText.value)

    // 验证必需字段
    if (!jsonData.questionText) {
      ElMessage.error('JSON格式错误：缺少题目内容')
      return
    }

    if (!jsonData.testCases || !Array.isArray(jsonData.testCases)) {
      ElMessage.error('JSON格式错误：缺少testCases数组')
      return
    }

    const validTestCases = jsonData.testCases.filter(tc =>
      tc.input !== undefined && tc.expectedOutput !== undefined
    )

    if (validTestCases.length === 0) {
      ElMessage.error('JSON格式错误：没有有效的测试用例')
      return
    }

    // 更新表单数据
    formData.value.questionText = jsonData.questionText || ''
    formData.value.difficulty = jsonData.difficulty || 'medium'
    formData.value.tags = jsonData.tags || []
    formData.value.explanation = jsonData.explanation || ''
    formData.value.timeLimit = jsonData.timeLimit || 1000
    formData.value.memoryLimit = jsonData.memoryLimit || 256
    formData.value.required = jsonData.required !== undefined ? jsonData.required : true
    formData.value.multipleSubmit = jsonData.multipleSubmit !== undefined ? jsonData.multipleSubmit : true
    formData.value.testCases = validTestCases

    showGlobalJsonImportDialog.value = false
    globalJsonImportText.value = ''
    ElMessage.success(`成功导入题目和 ${validTestCases.length} 个测试用例`)
  } catch (error) {
    ElMessage.error('JSON格式错误：请检查JSON语法是否正确')
  }
}
</script>

<style lang="scss" scoped>
.question-create-container {
  padding: 20px;
}

.type-selection-section {
  margin-bottom: 30px;

  h3 {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
  }
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.type-card {
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.active {
    border-color: #409eff;
    background: #e6f7ff;
  }

  .type-info {
    flex: 1;

    h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }
}

.question-form {
  margin-top: 20px;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;

  h3 {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .option-input {
    flex: 1;
  }
}

.blank-item {
  margin-bottom: 12px;
}

.rich-editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.testcase-container {
  .testcase-item {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
    background: #fafafa;

    .testcase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 500;
      color: #303133;
    }

    .testcase-input {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.json-import-dialog {
  .json-example {
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 12px;
    margin: 8px 0;
    font-size: 12px;
    line-height: 1.4;
    overflow-x: auto;
  }

  .json-textarea {
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>
