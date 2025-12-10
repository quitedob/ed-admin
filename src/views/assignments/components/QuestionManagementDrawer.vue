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
            <div class="header-buttons">
              <el-upload
                v-if="formData.type === 'programming'"
                :auto-upload="false"
                :show-file-list="false"
                accept=".json,.txt"
                :on-change="handleFileImport"
              >
                <el-button
                  type="success"
                  size="small"
                >
                  <el-icon><FolderOpened /></el-icon>
                  文件导入
                </el-button>
              </el-upload>
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
            <div v-if="formData.type === 'fill'" class="fill-blank-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>填空题特别提示：请在题目内容中使用 <strong>___</strong>（三个下划线）表示需要填空的位置，系统会自动识别空格数量</span>
            </div>
          </el-form-item>

          <el-form-item label="学科">
            <el-select v-model="formData.subject" placeholder="选择学科" clearable>
              <el-option
                v-for="subject in SUBJECT_OPTIONS"
                :key="subject.value"
                :label="subject.label"
                :value="subject.value"
              />
            </el-select>
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

          <el-form-item label="题目状态">
            <el-radio-group v-model="formData.status">
              <el-radio label="public">
                <el-icon><View /></el-icon>
                公开
              </el-radio>
              <el-radio label="hidden">
                <el-icon><Hide /></el-icon>
                隐藏
              </el-radio>
            </el-radio-group>
            <div style="margin-top: 8px; font-size: 12px; color: #909399;">
              公开：所有用户可见此题目 | 隐藏：仅管理员可见此题目
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
            <div class="header-buttons">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".json,.txt"
                :on-change="handleTestCaseFileImport"
              >
                <el-button
                  type="success"
                  size="small"
                >
                  <el-icon><FolderOpened /></el-icon>
                  文件导入
                </el-button>
              </el-upload>
              <el-button
                type="primary"
                size="small"
                @click="showJsonImportDialog = true"
              >
                <el-icon><Upload /></el-icon>
                JSON导入
              </el-button>
            </div>
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

        <!-- Scratch题型 -->
        <div v-if="formData.type === 'scratch'" class="form-section">
          <div class="section-header">
            <h3>Scratch题目设置</h3>
            <div class="header-buttons">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".sb3,.sb2"
                :on-change="handleScratchFileImport"
              >
                <el-button
                  type="success"
                  size="small"
                >
                  <el-icon><FolderOpened /></el-icon>
                  上传Scratch文件
                </el-button>
              </el-upload>
            </div>
          </div>

          <el-form-item label="初始项目文件">
            <div v-if="formData.scratchProject" class="scratch-project-info">
              <el-tag type="success">
                <el-icon><Document /></el-icon>
                {{ formData.scratchProject.name }}
              </el-tag>
              <el-button
                type="danger"
                text
                size="small"
                @click="removeScratchFile"
                style="margin-left: 8px"
              >
                删除
              </el-button>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon><Upload /></el-icon>
              <span>请上传Scratch项目文件 (.sb3/.sb2)</span>
            </div>
          </el-form-item>

          <el-form-item label="完成要求">
            <el-input
              v-model="formData.requirements"
              type="textarea"
              :rows="4"
              placeholder="请描述Scratch项目需要完成的具体要求，例如：实现角色的移动、添加声音效果等"
            />
          </el-form-item>

          <el-form-item label="评分标准">
            <el-input
              v-model="formData.gradingCriteria"
              type="textarea"
              :rows="3"
              placeholder="请描述评分标准，例如：角色移动实现（30分）、声音效果添加（30分）、程序逻辑正确（40分）"
            />
          </el-form-item>

          <el-form-item label="是否提供示例项目">
            <el-switch v-model="formData.provideExample" />
            <div class="form-tip">为学生提供示例项目作为参考</div>
          </el-form-item>

          <el-form-item v-if="formData.provideExample" label="示例项目文件">
            <div v-if="formData.exampleProject" class="scratch-project-info">
              <el-tag type="warning">
                <el-icon><Document /></el-icon>
                {{ formData.exampleProject.name }}
              </el-tag>
              <el-button
                type="danger"
                text
                size="small"
                @click="removeExampleFile"
                style="margin-left: 8px"
              >
                删除
              </el-button>
            </div>
            <div v-else class="upload-placeholder">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".sb3,.sb2"
                :on-change="handleExampleFileImport"
              >
                <el-button type="primary" size="small">
                  <el-icon><Upload /></el-icon>
                  上传示例项目
                </el-button>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="是否允许多次提交">
            <el-switch v-model="formData.multipleSubmit" />
            <div class="form-tip">允许学生多次提交Scratch项目</div>
          </el-form-item>

          <el-form-item label="最大文件大小">
            <el-input-number
              v-model="formData.maxFileSize"
              :min="1"
              :max="10"
              :step="1"
            />
            <span style="margin-left: 12px">MB</span>
            <div class="form-tip">限制学生上传的Scratch文件大小</div>
          </el-form-item>
        </div>

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
import { Plus, PriceTag, Upload, Delete, FolderOpened, Document, View, Hide, InfoFilled } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { SUBJECT_OPTIONS, getSubjectLabel } from '@/constants/subjects.js'

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

const editorConfig = computed(() => ({
  placeholder: formData.value.type === 'fill' 
    ? '请输入题目内容（填空题请使用 ___ 表示空格位置）' 
    : '请输入题目内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload',
      fieldName: 'file'
    }
  }
}))

const questionTypes = [
  { value: 'single', label: '单选题', icon: 'CircleCheckFilled', description: '选择一个正确答案' },
  { value: 'multiple', label: '多选题', icon: 'Check', description: '选择多个正确答案' },
  { value: 'fill', label: '填空题', icon: 'Edit', description: '填写空白处的答案' },
  { value: 'judge', label: '判断题', icon: 'CircleCheckFilled', description: '判断正误' },
  { value: 'programming', label: 'OJ题', icon: 'Tools', description: '编程题目' },
  { value: 'scratch', label: 'Scratch题', icon: 'Grid', description: '图形化编程题目' },
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
  subject: '', // 学科字段
  difficulty: 'medium',
  tags: [],
  status: 'public', // 新增状态字段，默认为公开
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
  testCases: [],
  // Scratch相关字段
  scratchProject: null,
  requirements: '',
  provideExample: false,
  exampleProject: null,
  maxFileSize: 5
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

// 处理OJ题目文件导入
const handleFileImport = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      let jsonData

      // 尝试解析JSON格式
      try {
        jsonData = JSON.parse(content)
      } catch {
        // 如果JSON解析失败，尝试解析文本格式
        jsonData = parseTextFileFormat(content)
      }

      if (!jsonData) {
        ElMessage.error('文件格式不支持，请导入JSON或文本格式的OJ题目文件')
        return
      }

      // 验证必需字段
      if (!jsonData.questionText) {
        ElMessage.error('文件格式错误：缺少题目内容')
        return
      }

      if (!jsonData.testCases || !Array.isArray(jsonData.testCases)) {
        ElMessage.error('文件格式错误：缺少testCases数组')
        return
      }

      const validTestCases = jsonData.testCases.filter(tc =>
        tc.input !== undefined && tc.expectedOutput !== undefined
      )

      if (validTestCases.length === 0) {
        ElMessage.error('文件格式错误：没有有效的测试用例')
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

      ElMessage.success(`成功导入题目和 ${validTestCases.length} 个测试用例`)
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式是否正确')
    }
  }
  reader.readAsText(file.raw)
}

// 处理测试用例文件导入
const handleTestCaseFileImport = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      let jsonData

      // 尝试解析JSON格式
      try {
        jsonData = JSON.parse(content)
      } catch {
        // 如果JSON解析失败，尝试解析文本格式
        jsonData = { testCases: parseTestCaseTextFormat(content) }
      }

      if (!jsonData.testCases || !Array.isArray(jsonData.testCases)) {
        ElMessage.error('文件格式错误：缺少testCases数组')
        return
      }

      const validTestCases = jsonData.testCases.filter(tc =>
        tc.input !== undefined && tc.expectedOutput !== undefined
      )

      if (validTestCases.length === 0) {
        ElMessage.error('文件格式错误：没有有效的测试用例')
        return
      }

      formData.value.testCases = validTestCases
      ElMessage.success(`成功导入 ${validTestCases.length} 个测试用例`)
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式是否正确')
    }
  }
  reader.readAsText(file.raw)
}

// 解析文本格式文件（简单格式）
const parseTextFileFormat = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return null

  // 简单的文本格式解析：第一行是题目，后面是输入输出对
  const questionText = lines[0].trim()
  const testCases = []

  for (let i = 1; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      testCases.push({
        input: lines[i].trim(),
        expectedOutput: lines[i + 1].trim()
      })
    }
  }

  if (testCases.length === 0) return null

  return {
    questionText,
    testCases,
    difficulty: 'medium',
    tags: [],
    explanation: '',
    timeLimit: 1000,
    memoryLimit: 256,
    required: true,
    multipleSubmit: true
  }
}

// 解析测试用例文本格式
const parseTestCaseTextFormat = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  const testCases = []

  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      testCases.push({
        input: lines[i].trim(),
        expectedOutput: lines[i + 1].trim()
      })
    }
  }

  return testCases
}

// Scratch文件处理方法
const handleScratchFileImport = (file) => {
  // 检查文件类型
  const validTypes = ['application/x.scratch.sb3', 'application/x.scratch.sb2', 'application/zip']
  if (!validTypes.includes(file.raw.type) && !file.name.endsWith('.sb3') && !file.name.endsWith('.sb2')) {
    ElMessage.error('请上传正确的Scratch项目文件 (.sb3/.sb2)')
    return
  }

  // 检查文件大小（默认限制为5MB）
  const maxSize = formData.value.maxFileSize * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error(`文件大小不能超过 ${formData.value.maxFileSize}MB`)
    return
  }

  formData.value.scratchProject = {
    name: file.name,
    size: file.raw.size,
    type: file.raw.type,
    file: file.raw
  }

  ElMessage.success('Scratch项目文件上传成功')
}

const handleExampleFileImport = (file) => {
  // 检查文件类型
  if (!file.name.endsWith('.sb3') && !file.name.endsWith('.sb2')) {
    ElMessage.error('请上传正确的Scratch项目文件 (.sb3/.sb2)')
    return
  }

  formData.value.exampleProject = {
    name: file.name,
    size: file.raw.size,
    type: file.raw.type,
    file: file.raw
  }

  ElMessage.success('示例项目文件上传成功')
}

const removeScratchFile = () => {
  formData.value.scratchProject = null
  ElMessage.info('已删除初始项目文件')
}

const removeExampleFile = () => {
  formData.value.exampleProject = null
  ElMessage.info('已删除示例项目文件')
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

.fill-blank-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 13px;
  color: #0050b3;
  line-height: 1.6;

  .el-icon {
    font-size: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  strong {
    color: #0050b3;
    font-weight: 600;
    padding: 0 4px;
    background: rgba(24, 144, 255, 0.1);
    border-radius: 2px;
  }
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

  .header-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
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

// Scratch相关样式
.scratch-project-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  background: #fafafa;
  color: #909399;
  text-align: center;
  justify-content: center;

  .el-icon {
    font-size: 24px;
    color: #c0c4cc;
  }

  span {
    font-size: 14px;
  }
}
</style>
