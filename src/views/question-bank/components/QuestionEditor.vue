<template>
  <div class="question-editor">
    <el-form :model="question" label-width="100px">
      <!-- 基础信息 -->
      <div class="section">
        <h4>基础信息</h4>

        <el-form-item label="题型" required>
          <el-select v-model="question.type" placeholder="请选择题型" @change="onTypeChange">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="fillBlank" />
            <el-option label="判断题" value="judge" />
            <el-option label="OJ题" value="oj" />
            <el-option label="简答题" value="essay" />
          </el-select>
        </el-form-item>

        <el-form-item label="难度" required>
          <el-select v-model="question.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>

        <el-form-item label="分值" required>
          <el-input-number v-model="question.score" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="question.tags"
            multiple
            placeholder="选择标签"
            collapse-tags
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 题目内容 -->
      <div class="section">
        <h4>题目内容</h4>

        <el-form-item label="题目">
          <div class="editor-wrapper">
            <RichTextEditor
              v-model="question.content"
              placeholder="请输入题目内容"
              @upload="handleImageUpload"
            />
          </div>
        </el-form-item>

        <!-- 选项（单选、多选、判断） -->
        <template v-if="['single', 'multiple', 'judge'].includes(question.type)">
          <el-form-item label="选项">
            <div class="options-container">
              <div
                v-for="(option, index) in question.options"
                :key="index"
                class="option-item"
              >
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <el-input
                  v-model="option.text"
                  placeholder="请输入选项内容"
                  class="option-input"
                />
                <el-checkbox
                  v-model="option.isCorrect"
                  :label="`正确答案${question.type === 'judge' ? '' : '(多选)'}`"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeOption(index)"
                  v-if="question.options.length > 2"
                >
                  删除
                </el-button>
              </div>

              <el-button
                type="primary"
                size="small"
                @click="addOption"
                v-if="question.options.length < 6"
              >
                添加选项
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 填空题答案 -->
        <template v-else-if="question.type === 'fillBlank'">
          <el-form-item label="答案">
            <div class="answers-container">
              <div
                v-for="(answer, index) in question.answers"
                :key="index"
                class="answer-item"
              >
                <el-input
                  v-model="answer.text"
                  placeholder="请输入答案"
                  class="answer-input"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeAnswer(index)"
                  v-if="question.answers.length > 1"
                >
                  删除
                </el-button>
              </div>

              <el-button type="primary" size="small" @click="addAnswer">
                添加答案
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- OJ题代码框架 -->
        <template v-else-if="question.type === 'oj'">
          <el-form-item label="代码框架">
            <el-input
              v-model="question.codeTemplate"
              type="textarea"
              :rows="6"
              placeholder="请输入代码框架"
            />
          </el-form-item>

          <el-form-item label="测试用例">
            <div class="testcases-container">
              <div
                v-for="(testcase, index) in question.testCases"
                :key="index"
                class="testcase-item"
              >
                <div class="testcase-header">
                  <span>测试用例 {{ index + 1 }}</span>
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeTestCase(index)"
                    v-if="question.testCases.length > 1"
                  >
                    删除
                  </el-button>
                </div>
                <el-input
                  v-model="testcase.input"
                  type="textarea"
                  :rows="2"
                  placeholder="输入"
                  class="testcase-input"
                />
                <el-input
                  v-model="testcase.output"
                  type="textarea"
                  :rows="2"
                  placeholder="输出"
                  class="testcase-output"
                />
              </div>

              <el-button type="primary" size="small" @click="addTestCase">
                添加测试用例
              </el-button>
            </div>
          </el-form-item>
        </template>
      </div>

      <!-- 题目解析 -->
      <div class="section">
        <h4>题目解析</h4>

        <el-form-item label="解析">
          <div class="editor-wrapper">
            <RichTextEditor
              v-model="question.analysis"
              placeholder="请输入题目解析"
              @upload="handleImageUpload"
            />
          </div>
        </el-form-item>
      </div>

      <!-- 扩展功能预留 -->
      <div class="section">
        <h4>扩展功能</h4>

        <div class="extension-placeholders">
          <div class="placeholder-item">
            <el-icon><VideoPlay /></el-icon>
            <span>视频讲解</span>
            <el-button type="text" size="small">上传视频</el-button>
          </div>

          <div class="placeholder-item">
            <el-icon><Sparkles /></el-icon>
            <span>AI解题</span>
            <el-button type="text" size="small" disabled>功能开发中</el-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Sparkles } from '@element-plus/icons-vue'
import RichTextEditor from '@/components/RichTextEditor.vue'

const props = defineProps({
  question: Object,
  availableTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel', 'upload'])

const question = reactive({
  type: 'single',
  difficulty: 'medium',
  score: 5,
  content: '',
  tags: [],
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ],
  answers: [{ text: '' }],
  analysis: '',
  codeTemplate: '',
  testCases: [{ input: '', output: '' }]
})

watch(() => props.question, (newVal) => {
  if (newVal) {
    Object.assign(question, newVal)
  }
}, { immediate: true, deep: true })

const onTypeChange = () => {
  // 根据题型初始化选项
  if (question.type === 'judge') {
    question.options = [
      { text: '正确', isCorrect: false },
      { text: '错误', isCorrect: false }
    ]
  } else if (question.type === 'single') {
    question.options = [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  }
}

const addOption = () => {
  if (question.options.length < 6) {
    question.options.push({ text: '', isCorrect: false })
  }
}

const removeOption = (index) => {
  question.options.splice(index, 1)
}

const addAnswer = () => {
  question.answers.push({ text: '' })
}

const removeAnswer = (index) => {
  question.answers.splice(index, 1)
}

const addTestCase = () => {
  question.testCases.push({ input: '', output: '' })
}

const removeTestCase = (index) => {
  question.testCases.splice(index, 1)
}

const handleImageUpload = (file) => {
  emit('upload', file)
}

const handleSave = () => {
  // 验证
  if (!question.content) {
    ElMessage.warning('请输入题目内容')
    return
  }

  if (['single', 'multiple', 'judge'].includes(question.type)) {
    const hasCorrect = question.options.some(o => o.isCorrect)
    if (!hasCorrect) {
      ElMessage.warning('请选择正确答案')
      return
    }
  }

  emit('save', question)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.question-editor {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.section:last-child {
  border-bottom: none;
}

.section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.editor-wrapper {
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
}

.options-container,
.answers-container,
.testcases-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item,
.answer-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  min-width: 30px;
  font-weight: 500;
}

.option-input,
.answer-input {
  flex: 1;
}

.testcase-item {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.testcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.testcase-input,
.testcase-output {
  margin-bottom: 8px;
}

.extension-placeholders {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.placeholder-item {
  padding: 16px;
  background: var(--color-bg-secondary);
  border: 1px dashed var(--color-border-light);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.placeholder-item .el-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
