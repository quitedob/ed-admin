<template>
  <div class="upload-generate">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/ai/assistant' }">智能作业生成</el-breadcrumb-item>
        <el-breadcrumb-item>上传并生成</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>上传并生成试卷/作业</h2>
      <p>上传现有试卷或作业文件，AI将为您生成类似内容和格式的新试卷</p>
    </div>

    <div class="content-container">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>文件上传</span>
              <el-tag type="info">支持 PDF, Word, JSON</el-tag>
            </div>
          </template>

          <div class="upload-area">
            <el-upload
              class="upload-dragger"
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              accept=".pdf,.doc,.docx,.json"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖拽到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 PDF、Word、JSON 格式，文件大小不超过 50MB
                </div>
              </template>
            </el-upload>
          </div>

          <div v-if="fileList.length > 0" class="file-list">
            <h4>已上传文件</h4>
            <div
              v-for="file in fileList"
              :key="file.uid"
              class="file-item"
            >
              <div class="file-info">
                <el-icon><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <div class="file-actions">
                <el-button type="text" size="small" @click="previewFile(file)">
                  预览
                </el-button>
                <el-button type="text" size="small" @click="removeFile(file)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 参数设置区域 -->
      <div class="settings-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>生成参数设置</span>
              <el-button type="primary" size="small" @click="useTemplate">
                使用模板
              </el-button>
            </div>
          </template>

          <el-form :model="generateSettings" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="试卷类型">
                  <el-select v-model="generateSettings.type" placeholder="请选择试卷类型">
                    <el-option label="作业" value="homework" />
                    <el-option label="考试" value="exam" />
                    <el-option label="练习" value="exercise" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="难度等级">
                  <el-select v-model="generateSettings.difficulty" placeholder="请选择难度">
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="单选题数量">
                  <el-input-number
                    v-model="generateSettings.singleChoice"
                    :min="0"
                    :max="50"
                    placeholder="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="多选题数量">
                  <el-input-number
                    v-model="generateSettings.multipleChoice"
                    :min="0"
                    :max="50"
                    placeholder="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="填空题数量">
                  <el-input-number
                    v-model="generateSettings.fillBlank"
                    :min="0"
                    :max="50"
                    placeholder="0"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="问答题数量">
                  <el-input-number
                    v-model="generateSettings.essay"
                    :min="0"
                    :max="20"
                    placeholder="0"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="总分">
                  <el-input-number
                    v-model="generateSettings.totalScore"
                    :min="1"
                    :max="200"
                    placeholder="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="生成数量">
                  <el-input-number
                    v-model="generateSettings.generateCount"
                    :min="1"
                    :max="5"
                    placeholder="1"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="知识点">
              <el-select
                v-model="generateSettings.knowledgePoints"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入知识点"
                style="width: 100%"
              >
                <el-option
                  v-for="point in knowledgePoints"
                  :key="point"
                  :label="point"
                  :value="point"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="高级设置">
              <el-checkbox-group v-model="generateSettings.advanced">
                <el-checkbox label="randomOrder">随机排序题目</el-checkbox>
                <el-checkbox label="showAnswers">显示答案</el-checkbox>
                <el-checkbox label="autoGrading">自动评分</el-checkbox>
                <el-checkbox label="timeLimit">设置时间限制</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 预览区域 -->
      <div v-if="previewData" class="preview-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>预览内容</span>
              <div class="header-actions">
                <el-button type="success" size="small" @click="generatePaper">
                  <el-icon><MagicStick /></el-icon>
                  生成试卷
                </el-button>
                <el-button type="warning" size="small" @click="editPreview">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
              </div>
            </div>
          </template>

          <div class="preview-content">
            <div class="paper-header">
              <h3>{{ previewData.title || '试卷预览' }}</h3>
              <div class="paper-info">
                <span>题目总数: {{ previewData.totalQuestions || 0 }}</span>
                <span>总分: {{ previewData.totalScore || 0 }}</span>
                <span>预计用时: {{ previewData.estimatedTime || 60 }}分钟</span>
              </div>
            </div>

            <div class="questions-preview">
              <div
                v-for="(question, index) in previewData.questions?.slice(0, 3)"
                :key="index"
                class="question-preview"
              >
                <div class="question-header">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                    {{ getQuestionTypeLabel(question.type) }}
                  </el-tag>
                  <span class="question-score">{{ question.score }}分</span>
                </div>
                <div class="question-content">
                  {{ question.questionText }}
                </div>
                <div v-if="question.options" class="question-options">
                  <div
                    v-for="option in question.options"
                    :key="option.id"
                    class="option-item"
                  >
                    {{ option.value }}. {{ option.text }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="previewData.questions?.length > 3" class="preview-more">
              <el-button type="text" @click="showFullPreview">
                查看全部题目 ({{ previewData.questions.length }})
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 生成结果区域 -->
      <div v-if="generatedPapers.length > 0" class="results-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="exportAll">
                  <el-icon><Download /></el-icon>
                  导出全部
                </el-button>
              </div>
            </div>
          </template>

          <div class="papers-list">
            <div
              v-for="(paper, index) in generatedPapers"
              :key="index"
              class="paper-item"
            >
              <div class="paper-info">
                <h4>{{ paper.title }} (版本 {{ index + 1 }})</h4>
                <div class="paper-meta">
                  <span>题目: {{ paper.questions?.length || 0 }}道</span>
                  <span>总分: {{ paper.totalScore || 0 }}分</span>
                  <span>生成时间: {{ formatTime(paper.createdAt) }}</span>
                </div>
              </div>
              <div class="paper-actions">
                <el-button type="text" size="small" @click="viewPaper(paper)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click="editPaper(paper)">
                  编辑
                </el-button>
                <el-button type="text" size="small" @click="exportPaper(paper)">
                  导出
                </el-button>
                <el-button type="text" size="small" @click="savePaper(paper)">
                  保存
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 文件预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="文件预览" width="80%">
      <div v-if="previewFileContent" class="file-preview">
        <pre>{{ previewFileContent }}</pre>
      </div>
    </el-dialog>

    <!-- 完整预览对话框 -->
    <el-dialog v-model="showFullPreviewDialog" title="完整试卷预览" width="80%">
      <div v-if="previewData" class="full-preview">
        <div class="paper-header">
          <h2>{{ previewData.title }}</h2>
          <div class="paper-info">
            <span>题目总数: {{ previewData.totalQuestions }}</span>
            <span>总分: {{ previewData.totalScore }}</span>
            <span>预计用时: {{ previewData.estimatedTime }}分钟</span>
          </div>
        </div>
        <div class="all-questions">
          <div
            v-for="(question, index) in previewData.questions"
            :key="index"
            class="question-preview"
          >
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                {{ getQuestionTypeLabel(question.type) }}
              </el-tag>
              <span class="question-score">{{ question.score }}分</span>
            </div>
            <div class="question-content">
              {{ question.questionText }}
            </div>
            <div v-if="question.options" class="question-options">
              <div
                v-for="option in question.options"
                :key="option.id"
                class="option-item"
              >
                {{ option.value }}. {{ option.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  Document,
  MagicStick,
  Edit,
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const fileList = ref([])
const previewData = ref(null)
const generatedPapers = ref([])
const showPreviewDialog = ref(false)
const showFullPreviewDialog = ref(false)
const previewFileContent = ref('')

// 生成设置
const generateSettings = reactive({
  type: 'homework',
  difficulty: 'medium',
  singleChoice: 10,
  multipleChoice: 5,
  fillBlank: 5,
  essay: 2,
  totalScore: 100,
  generateCount: 1,
  knowledgePoints: [],
  advanced: []
})

// 知识点列表
const knowledgePoints = ref([
  'JavaScript基础',
  '数据结构',
  '算法设计',
  'Web开发',
  '数据库',
  '计算机网络',
  '操作系统',
  '软件工程'
])

// 文件变化处理
const handleFileChange = (file, files) => {
  fileList.value = files
  if (files.length > 0) {
    parseFile(files[0])
  }
}

// 文件移除处理
const handleFileRemove = (file, files) => {
  fileList.value = files
  if (files.length === 0) {
    previewData.value = null
  }
}

// 删除文件
const removeFile = (file) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
  if (fileList.value.length === 0) {
    previewData.value = null
  }
}

// 解析文件
const parseFile = async (file) => {
  try {
    // 模拟文件解析
    ElMessage.info('正在解析文件...')

    setTimeout(() => {
      previewData.value = {
        title: 'JavaScript基础测试卷',
        totalQuestions: 22,
        totalScore: 100,
        estimatedTime: 60,
        questions: [
          {
            type: 'single',
            questionText: 'JavaScript中，以下哪个不是基本数据类型？',
            score: 5,
            options: [
              { id: 'opt_a', value: 'A', text: 'Number' },
              { id: 'opt_b', value: 'B', text: 'String' },
              { id: 'opt_c', value: 'C', text: 'Array' },
              { id: 'opt_d', value: 'D', text: 'Boolean' }
            ]
          },
          {
            type: 'multiple',
            questionText: '以下哪些是JavaScript的循环语句？',
            score: 10,
            options: [
              { id: 'opt_a', value: 'A', text: 'for' },
              { id: 'opt_b', value: 'B', text: 'while' },
              { id: 'opt_c', value: 'C', text: 'do-while' },
              { id: 'opt_d', value: 'D', text: 'loop' }
            ]
          },
          {
            type: 'fill',
            questionText: 'JavaScript中声明变量的关键字有___、___和___。',
            score: 5,
            correctAnswers: ['var', 'let', 'const']
          }
        ]
      }
      ElMessage.success('文件解析完成')
    }, 2000)
  } catch (error) {
    ElMessage.error('文件解析失败')
  }
}

// 预览文件
const previewFile = (file) => {
  // 模拟文件预览
  previewFileContent.value = `文件预览内容\n文件名: ${file.name}\n文件大小: ${formatFileSize(file.size)}`
  showPreviewDialog.value = true
}

// 使用模板
const useTemplate = () => {
  generateSettings.singleChoice = 10
  generateSettings.multipleChoice = 5
  generateSettings.fillBlank = 5
  generateSettings.essay = 2
  generateSettings.totalScore = 100
  generateSettings.difficulty = 'medium'
  ElMessage.success('已应用模板设置')
}

// 生成试卷
const generatePaper = async () => {
  if (!previewData.value) {
    ElMessage.warning('请先上传文件')
    return
  }

  try {
    ElMessage.info('正在生成试卷...')

    // 模拟生成过程
    setTimeout(() => {
      const papers = []
      for (let i = 0; i < generateSettings.generateCount; i++) {
        papers.push({
          title: `${previewData.value.title} - 版本${i + 1}`,
          totalQuestions: previewData.value.totalQuestions,
          totalScore: previewData.value.totalScore,
          estimatedTime: previewData.value.estimatedTime,
          questions: previewData.value.questions,
          createdAt: new Date().toISOString()
        })
      }
      generatedPapers.value = papers
      ElMessage.success(`成功生成 ${papers.length} 份试卷`)
    }, 3000)
  } catch (error) {
    ElMessage.error('生成失败')
  }
}

// 编辑预览
const editPreview = () => {
  ElMessage.info('编辑功能开发中...')
}

// 显示完整预览
const showFullPreview = () => {
  showFullPreviewDialog.value = true
}

// 查看试卷
const viewPaper = (paper) => {
  previewData.value = paper
  showFullPreviewDialog.value = true
}

// 编辑试卷
const editPaper = (paper) => {
  ElMessage.info('编辑功能开发中...')
}

// 导出试卷
const exportPaper = (paper) => {
  // 模拟导出
  const content = JSON.stringify(paper, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${paper.title}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('试卷导出成功')
}

// 导出全部
const exportAll = () => {
  generatedPapers.value.forEach((paper, index) => {
    setTimeout(() => {
      exportPaper(paper)
    }, index * 500)
  })
}

// 保存试卷
const savePaper = (paper) => {
  ElMessage.success('试卷保存成功')
}

// 获取题目类型颜色
const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'danger'
  }
  return colorMap[type] || 'info'
}

// 获取题目类型标签
const getQuestionTypeLabel = (type) => {
  const labelMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return labelMap[type] || '未知'
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/upload-generate/index.vue`);
  });

</script>

<style scoped>
.upload-generate {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 140px);
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 12px 0 8px 0;
  color: #303133;
}

.page-header p {
  color: #606266;
  margin: 0;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* 上传区域 */
.upload-area {
  margin-bottom: 20px;
}

.upload-dragger {
  width: 100%;
}

.file-list h4 {
  margin: 20px 0 12px 0;
  color: #303133;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-weight: 500;
  color: #303133;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

/* 设置区域 */
.settings-section .el-form {
  padding: 20px 0;
}

/* 预览区域 */
.preview-section {
  background: white;
}

.preview-content {
  padding: 20px 0;
}

.paper-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4e7ed;
}

.paper-header h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 24px;
}

.paper-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #606266;
}

.questions-preview {
  margin-bottom: 20px;
}

.question-preview {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
}

.question-score {
  color: #67c23a;
  font-weight: 500;
}

.question-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #303133;
}

.question-options {
  padding-left: 20px;
}

.option-item {
  margin-bottom: 6px;
  color: #606266;
}

.preview-more {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

/* 结果区域 */
.results-section {
  background: white;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paper-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.paper-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.paper-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.paper-actions {
  display: flex;
  gap: 8px;
}

/* 对话框内容 */
.file-preview {
  max-height: 500px;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
}

.file-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.full-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.all-questions {
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-generate {
    padding: 12px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
    margin-bottom: 16px;
  }

  .paper-info {
    flex-direction: column;
    gap: 8px;
  }

  .paper-meta {
    flex-direction: column;
    gap: 4px;
  }

  .paper-item {
    flex-direction: column;
    gap: 12px;
  }

  .paper-actions {
    justify-content: flex-start;
  }
}
</style>