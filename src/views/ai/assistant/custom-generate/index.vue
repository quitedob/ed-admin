<template>
  <div class="custom-generate">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/ai/assistant' }">智能作业生成</el-breadcrumb-item>
        <el-breadcrumb-item>自定义生成</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>自定义生成试卷/作业</h2>
      <p>根据您的具体要求，自定义题目类型、数量、难度等参数生成试卷</p>
    </div>

    <div class="content-container">
      <el-row :gutter="20">
        <!-- 左侧配置区域 -->
        <el-col :span="16">
          <!-- 基础信息 -->
          <el-card class="config-section">
            <template #header>
              <div class="card-header">
                <span>基础信息</span>
                <el-button type="primary" size="small" @click="useTemplate">
                  <el-icon><Document /></el-icon>
                  使用模板
                </el-button>
              </div>
            </template>

            <el-form :model="paperConfig" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="试卷标题" required>
                    <el-input v-model="paperConfig.title" placeholder="请输入试卷标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="试卷类型" required>
                    <el-select v-model="paperConfig.type" placeholder="请选择试卷类型">
                      <el-option label="作业" value="homework" />
                      <el-option label="考试" value="exam" />
                      <el-option label="练习" value="exercise" />
                      <el-option label="测验" value="quiz" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="难度等级">
                    <el-select v-model="paperConfig.difficulty" placeholder="请选择难度">
                      <el-option label="简单" value="easy" />
                      <el-option label="中等" value="medium" />
                      <el-option label="困难" value="hard" />
                      <el-option label="混合" value="mixed" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="总分">
                    <el-input-number
                      v-model="paperConfig.totalScore"
                      :min="1"
                      :max="200"
                      placeholder="100"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="试卷描述">
                <el-input
                  v-model="paperConfig.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入试卷描述"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 题目配置 -->
          <el-card class="config-section">
            <template #header>
              <div class="card-header">
                <span>题目配置</span>
                <div class="header-actions">
                  <el-button type="text" @click="autoBalance">自动平衡</el-button>
                  <el-button type="text" @click="resetQuestions">重置</el-button>
                </div>
              </div>
            </template>

            <el-form :model="paperConfig" label-width="120px">
              <div class="question-types-config">
                <div
                  v-for="type in questionTypes"
                  :key="type.value"
                  class="type-config-item"
                >
                  <div class="type-header">
                    <div class="type-info">
                      <el-icon :class="getTypeIconClass(type.value)">
                        <component :is="getTypeIcon(type.value)" />
                      </el-icon>
                      <span class="type-name">{{ type.label }}</span>
                    </div>
                    <div class="type-controls">
                      <el-input-number
                        v-model="paperConfig.questions[type.value].count"
                        :min="0"
                        :max="50"
                        size="small"
                        placeholder="数量"
                        @change="updateScores"
                      />
                      <el-input-number
                        v-model="paperConfig.questions[type.value].score"
                        :min="1"
                        :max="50"
                        size="small"
                        placeholder="分值"
                        @change="updateScores"
                      />
                    </div>
                  </div>
                  <div class="type-detail">
                    <span class="type-total">小计: {{ calculateTypeTotal(type.value) }}分</span>
                    <span class="type-percentage">占比: {{ calculateTypePercentage(type.value) }}%</span>
                  </div>
                </div>
              </div>

              <el-form-item label="题目总数">
                <span class="summary-info">{{ calculateTotalQuestions }}题</span>
              </el-form-item>

              <el-form-item label="分数分配">
                <el-progress
                  :percentage="calculateScorePercentage"
                  :color="getProgressColor"
                  :stroke-width="8"
                />
                <div class="score-summary">
                  <span>已分配: {{ calculateAllocatedScore }}分</span>
                  <span>总分: {{ paperConfig.totalScore }}分</span>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 知识点配置 -->
          <el-card class="config-section">
            <template #header>
              <span>知识点配置</span>
            </template>

            <el-form :model="paperConfig" label-width="120px">
              <el-form-item label="主要知识点">
                <el-select
                  v-model="paperConfig.knowledgePoints.main"
                  multiple
                  filterable
                  allow-create
                  placeholder="请选择或输入主要知识点"
                  style="width: 100%"
                >
                  <el-option
                    v-for="point in availableKnowledgePoints"
                    :key="point"
                    :label="point"
                    :value="point"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="次要知识点">
                <el-select
                  v-model="paperConfig.knowledgePoints.secondary"
                  multiple
                  filterable
                  allow-create
                  placeholder="请选择或输入次要知识点"
                  style="width: 100%"
                >
                  <el-option
                    v-for="point in availableKnowledgePoints"
                    :key="point"
                    :label="point"
                    :value="point"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="知识点权重">
                <div class="weight-sliders">
                  <div
                    v-for="point in selectedKnowledgePoints"
                    :key="point"
                    class="weight-item"
                  >
                    <span class="weight-label">{{ point }}</span>
                    <el-slider
                      v-model="paperConfig.knowledgeWeights[point]"
                      :max="100"
                      :step="5"
                      show-input
                      :show-input-controls="false"
                      input-size="small"
                    />
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 高级设置 -->
          <el-card class="config-section">
            <template #header>
              <span>高级设置</span>
            </template>

            <el-form :model="paperConfig.advanced" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="随机排序">
                    <el-switch v-model="paperConfig.advanced.randomOrder" />
                    <div class="setting-desc">随机排列题目顺序</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="显示答案">
                    <el-switch v-model="paperConfig.advanced.showAnswers" />
                    <div class="setting-desc">在试卷中显示正确答案</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="时间限制">
                    <el-input-number
                      v-model="paperConfig.advanced.timeLimit"
                      :min="0"
                      placeholder="分钟"
                      :disabled="!paperConfig.advanced.enableTimeLimit"
                    />
                    <el-switch
                      v-model="paperConfig.advanced.enableTimeLimit"
                      style="margin-left: 12px"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="及格分数">
                    <el-input-number
                      v-model="paperConfig.advanced.passingScore"
                      :min="0"
                      :max="paperConfig.totalScore"
                      placeholder="60"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="评分规则">
                <el-radio-group v-model="paperConfig.advanced.gradingRule">
                  <el-radio label="standard">标准评分</el-radio>
                  <el-radio label="partial">部分得分</el-radio>
                  <el-radio label="strict">严格评分</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="其他选项">
                <el-checkbox-group v-model="paperConfig.advanced.options">
                  <el-checkbox label="allowReview">允许查看答案</el-checkbox>
                  <el-checkbox label="showHints">显示解题提示</el-checkbox>
                  <el-checkbox label="autoSubmit">自动提交</el-checkbox>
                  <el-checkbox label="preventCopy">防复制</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧预览区域 -->
        <el-col :span="8">
          <div class="preview-sidebar">
            <!-- 实时预览 -->
            <el-card class="preview-section">
              <template #header>
                <div class="card-header">
                  <span>实时预览</span>
                  <el-button type="text" @click="refreshPreview">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </template>

              <div class="preview-content">
                <div class="paper-preview">
                  <h3>{{ paperConfig.title || '试卷标题' }}</h3>
                  <div class="paper-meta">
                    <el-tag :type="getTypeColor(paperConfig.type)" size="small">
                      {{ getTypeLabel(paperConfig.type) }}
                    </el-tag>
                    <el-tag :type="getDifficultyColor(paperConfig.difficulty)" size="small">
                      {{ getDifficultyLabel(paperConfig.difficulty) }}
                    </el-tag>
                  </div>
                  <div class="paper-stats">
                    <div class="stat-item">
                      <span class="stat-label">题目数量</span>
                      <span class="stat-value">{{ calculateTotalQuestions }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">总分</span>
                      <span class="stat-value">{{ paperConfig.totalScore }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">预计用时</span>
                      <span class="stat-value">{{ estimateTime() }}分钟</span>
                    </div>
                  </div>

                  <div class="question-breakdown">
                    <h4>题型分布</h4>
                    <div
                      v-for="type in questionTypes"
                      :key="type.value"
                      class="breakdown-item"
                    >
                      <div class="breakdown-info">
                        <el-icon :class="getTypeIconClass(type.value)">
                          <component :is="getTypeIcon(type.value)" />
                        </el-icon>
                        <span>{{ type.label }}</span>
                      </div>
                      <div class="breakdown-stats">
                        <span>{{ paperConfig.questions[type.value].count }}题</span>
                        <span>{{ calculateTypeTotal(type.value) }}分</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 快速操作 -->
            <el-card class="actions-section">
              <template #header>
                <span>快速操作</span>
              </template>

              <div class="action-buttons">
                <el-button type="primary" @click="generatePaper" :loading="generating" block>
                  <el-icon><MagicStick /></el-icon>
                  生成试卷
                </el-button>
                <el-button type="success" @click="saveConfig" block>
                  <el-icon><Folder /></el-icon>
                  保存配置
                </el-button>
                <el-button type="warning" @click="exportConfig" block>
                  <el-icon><Download /></el-icon>
                  导出配置
                </el-button>
                <el-button type="info" @click="previewJson" block>
                  <el-icon><View /></el-icon>
                  JSON预览
                </el-button>
              </div>
            </el-card>

            <!-- 配置历史 -->
            <el-card class="history-section">
              <template #header>
                <span>配置历史</span>
              </template>

              <div class="history-list">
                <div
                  v-for="item in configHistory"
                  :key="item.id"
                  class="history-item"
                  @click="loadConfig(item)"
                >
                  <div class="history-title">{{ item.title }}</div>
                  <div class="history-time">{{ formatTime(item.createdAt) }}</div>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>

      <!-- 生成结果 -->
      <div v-if="generatedPaper" class="result-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
              <div class="header-actions">
                <el-button type="primary" @click="viewPaper">
                  <el-icon><View /></el-icon>
                  查看试卷
                </el-button>
                <el-button type="success" @click="exportPaper">
                  <el-icon><Download /></el-icon>
                  导出试卷
                </el-button>
                <el-button type="warning" @click="editPaper">
                  <el-icon><Edit /></el-icon>
                  编辑试卷
                </el-button>
              </div>
            </div>
          </template>

          <div class="result-content">
            <div class="result-summary">
              <h4>{{ generatedPaper.title }}</h4>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="item-label">题目总数</span>
                  <span class="item-value">{{ generatedPaper.questions?.length || 0 }}题</span>
                </div>
                <div class="summary-item">
                  <span class="item-label">总分</span>
                  <span class="item-value">{{ generatedPaper.totalScore || 0 }}分</span>
                </div>
                <div class="summary-item">
                  <span class="item-label">生成时间</span>
                  <span class="item-value">{{ formatTime(generatedPaper.createdAt) }}</span>
                </div>
                <div class="summary-item">
                  <span class="item-label">预计用时</span>
                  <span class="item-value">{{ generatedPaper.estimatedTime || 60 }}分钟</span>
                </div>
              </div>
            </div>

            <div class="result-preview">
              <h5>题目预览 (前5题)</h5>
              <div class="preview-questions">
                <div
                  v-for="(question, index) in generatedPaper.questions?.slice(0, 5)"
                  :key="index"
                  class="preview-question"
                >
                  <div class="question-header">
                    <span class="question-number">{{ index + 1 }}.</span>
                    <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                      {{ getQuestionTypeLabel(question.type) }}
                    </el-tag>
                    <span class="question-score">{{ question.score }}分</span>
                  </div>
                  <div class="question-content">{{ question.questionText }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- JSON预览对话框 -->
    <el-dialog v-model="showJsonDialog" title="JSON配置预览" width="60%">
      <div class="json-preview">
        <pre><code>{{ JSON.stringify(paperConfig, null, 2) }}</code></pre>
      </div>
      <template #footer>
        <el-button @click="copyJson">复制JSON</el-button>
        <el-button type="primary" @click="showJsonDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 试卷预览对话框 -->
    <el-dialog v-model="showPaperDialog" title="试卷预览" width="80%">
      <div v-if="generatedPaper" class="paper-full-preview">
        <div class="paper-header">
          <h2>{{ generatedPaper.title }}</h2>
          <div class="paper-info">
            <span>题目总数: {{ generatedPaper.questions?.length || 0 }}</span>
            <span>总分: {{ generatedPaper.totalScore || 0 }}</span>
            <span>预计用时: {{ generatedPaper.estimatedTime || 60 }}分钟</span>
          </div>
        </div>
        <div class="paper-questions">
          <div
            v-for="(question, index) in generatedPaper.questions"
            :key="index"
            class="paper-question"
          >
            <div class="question-header">
              <span class="question-number">{{ index + 1 }}.</span>
              <el-tag :type="getQuestionTypeColor(question.type)" size="small">
                {{ getQuestionTypeLabel(question.type) }}
              </el-tag>
              <span class="question-score">{{ question.score }}分</span>
            </div>
            <div class="question-content">{{ question.questionText }}</div>
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
  Document,
  Refresh,
  MagicStick,
  Folder,
  Download,
  View,
  Edit,
  CircleCheck,
  List,
  EditPen,
  QuestionFilled
} from '@element-plus/icons-vue'

// 响应式数据
const generating = ref(false)
const showJsonDialog = ref(false)
const showPaperDialog = ref(false)
const generatedPaper = ref(null)

// 试卷配置
const paperConfig = reactive({
  title: '',
  type: 'homework',
  difficulty: 'medium',
  totalScore: 100,
  description: '',
  questions: {
    singleChoice: { count: 10, score: 5 },
    multipleChoice: { count: 5, score: 10 },
    fillBlank: { count: 5, score: 5 },
    essay: { count: 2, score: 15 }
  },
  knowledgePoints: {
    main: [],
    secondary: []
  },
  knowledgeWeights: {},
  advanced: {
    randomOrder: false,
    showAnswers: false,
    enableTimeLimit: false,
    timeLimit: 60,
    passingScore: 60,
    gradingRule: 'standard',
    options: []
  }
})

// 题型配置
const questionTypes = ref([
  { label: '单选题', value: 'singleChoice' },
  { label: '多选题', value: 'multipleChoice' },
  { label: '填空题', value: 'fillBlank' },
  { label: '问答题', value: 'essay' }
])

// 可用知识点
const availableKnowledgePoints = ref([
  'JavaScript基础',
  '数据结构',
  '算法设计',
  'Web开发',
  '数据库',
  '计算机网络',
  '操作系统',
  '软件工程',
  '前端框架',
  '后端开发'
])

// 配置历史
const configHistory = ref([
  {
    id: 1,
    title: 'JavaScript基础测试',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: '数据结构期中考试',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
])

// 计算属性
const calculateTotalQuestions = computed(() => {
  return Object.values(paperConfig.questions).reduce((total, type) => total + type.count, 0)
})

const calculateAllocatedScore = computed(() => {
  return Object.values(paperConfig.questions).reduce((total, type) => total + (type.count * type.score), 0)
})

const calculateScorePercentage = computed(() => {
  const percentage = (calculateAllocatedScore.value / paperConfig.totalScore) * 100
  return Math.min(percentage, 100)
})

const selectedKnowledgePoints = computed(() => {
  return [...paperConfig.knowledgePoints.main, ...paperConfig.knowledgePoints.secondary]
})

const getProgressColor = computed(() => {
  const percentage = calculateScorePercentage.value
  if (percentage === 100) return '#67c23a'
  if (percentage >= 80) return '#e6a23c'
  return '#f56c6c'
})

// 方法
const calculateTypeTotal = (type) => {
  return paperConfig.questions[type].count * paperConfig.questions[type].score
}

const calculateTypePercentage = (type) => {
  const typeTotal = calculateTypeTotal(type)
  const allocatedTotal = calculateAllocatedScore.value || 1
  return Math.round((typeTotal / allocatedTotal) * 100)
}

const updateScores = () => {
  // 自动平衡分数分配
  const totalQuestions = calculateTotalQuestions.value
  if (totalQuestions === 0) return

  const avgScore = paperConfig.totalScore / totalQuestions
  Object.keys(paperConfig.questions).forEach(type => {
    if (paperConfig.questions[type].count > 0 && !paperConfig.questions[type].score) {
      paperConfig.questions[type].score = Math.round(avgScore)
    }
  })
}

const autoBalance = () => {
  // 自动平衡题目数量和分数
  const targetScore = paperConfig.totalScore
  const typeCount = Object.keys(paperConfig.questions).length
  const avgScorePerType = Math.floor(targetScore / typeCount)

  Object.keys(paperConfig.questions).forEach(type => {
    const avgQuestions = Math.floor((avgScorePerType) / 5) // 假设平均每题5分
    paperConfig.questions[type].count = Math.max(avgQuestions, 1)
    paperConfig.questions[type].score = 5
  })

  ElMessage.success('已自动平衡题目配置')
}

const resetQuestions = () => {
  Object.keys(paperConfig.questions).forEach(type => {
    paperConfig.questions[type].count = 0
    paperConfig.questions[type].score = 0
  })
  ElMessage.success('已重置题目配置')
}

const useTemplate = () => {
  // 使用预设模板
  paperConfig.title = 'JavaScript基础测试卷'
  paperConfig.type = 'homework'
  paperConfig.difficulty = 'medium'
  paperConfig.questions.singleChoice = { count: 10, score: 5 }
  paperConfig.questions.multipleChoice = { count: 5, score: 10 }
  paperConfig.questions.fillBlank = { count: 5, score: 5 }
  paperConfig.questions.essay = { count: 2, score: 15 }
  paperConfig.knowledgePoints.main = ['JavaScript基础', 'Web开发']
  ElMessage.success('已应用模板')
}

const refreshPreview = () => {
  ElMessage.success('预览已刷新')
}

const estimateTime = () => {
  const totalQuestions = calculateTotalQuestions.value
  const baseTime = totalQuestions * 2 // 每题基础时间2分钟
  const essayQuestions = paperConfig.questions.essay.count
  const essayTime = essayQuestions * 10 // 问答题每题10分钟
  return baseTime + essayTime
}

const generatePaper = async () => {
  if (!paperConfig.title) {
    ElMessage.warning('请输入试卷标题')
    return
  }

  if (calculateTotalQuestions.value === 0) {
    ElMessage.warning('请配置题目数量')
    return
  }

  generating.value = true

  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    generatedPaper.value = {
      title: paperConfig.title,
      type: paperConfig.type,
      difficulty: paperConfig.difficulty,
      totalScore: calculateAllocatedScore.value,
      estimatedTime: estimateTime(),
      createdAt: new Date().toISOString(),
      questions: generateMockQuestions()
    }

    ElMessage.success('试卷生成成功')
  } catch (error) {
    ElMessage.error('试卷生成失败')
  } finally {
    generating.value = false
  }
}

const generateMockQuestions = () => {
  const questions = []

  // 生成单选题
  for (let i = 0; i < paperConfig.questions.singleChoice.count; i++) {
    questions.push({
      type: 'single',
      questionText: `单选题 ${i + 1}：这是一个示例单选题内容`,
      score: paperConfig.questions.singleChoice.score,
      options: [
        { id: 'opt_a', value: 'A', text: '选项A' },
        { id: 'opt_b', value: 'B', text: '选项B' },
        { id: 'opt_c', value: 'C', text: '选项C' },
        { id: 'opt_d', value: 'D', text: '选项D' }
      ],
      correctAnswer: 'A'
    })
  }

  // 生成多选题
  for (let i = 0; i < paperConfig.questions.multipleChoice.count; i++) {
    questions.push({
      type: 'multiple',
      questionText: `多选题 ${i + 1}：这是一个示例多选题内容`,
      score: paperConfig.questions.multipleChoice.score,
      options: [
        { id: 'opt_a', value: 'A', text: '选项A' },
        { id: 'opt_b', value: 'B', text: '选项B' },
        { id: 'opt_c', value: 'C', text: '选项C' },
        { id: 'opt_d', value: 'D', text: '选项D' }
      ],
      correctAnswers: ['A', 'B']
    })
  }

  // 生成填空题
  for (let i = 0; i < paperConfig.questions.fillBlank.count; i++) {
    questions.push({
      type: 'fill',
      questionText: `填空题 ${i + 1}：请填写正确的答案___`,
      score: paperConfig.questions.fillBlank.score,
      correctAnswers: ['答案']
    })
  }

  // 生成问答题
  for (let i = 0; i < paperConfig.questions.essay.count; i++) {
    questions.push({
      type: 'essay',
      questionText: `问答题 ${i + 1}：请详细回答以下问题...`,
      score: paperConfig.questions.essay.score,
      referenceAnswer: '这是一个参考答案'
    })
  }

  return questions
}

const saveConfig = () => {
  const config = JSON.parse(JSON.stringify(paperConfig))
  configHistory.value.unshift({
    id: Date.now(),
    title: config.title || '未命名配置',
    createdAt: new Date().toISOString(),
    config: config
  })
  ElMessage.success('配置已保存')
}

const exportConfig = () => {
  const content = JSON.stringify(paperConfig, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${paperConfig.title || '试卷配置'}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

const loadConfig = (item) => {
  if (item.config) {
    Object.assign(paperConfig, item.config)
    ElMessage.success('配置已加载')
  }
}

const previewJson = () => {
  showJsonDialog.value = true
}

const copyJson = async () => {
  const content = JSON.stringify(paperConfig, null, 2)
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('JSON已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const viewPaper = () => {
  showPaperDialog.value = true
}

const exportPaper = () => {
  if (!generatedPaper.value) return

  const content = JSON.stringify(generatedPaper.value, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${generatedPaper.value.title}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('试卷已导出')
}

const editPaper = () => {
  ElMessage.info('编辑功能开发中...')
}

// 辅助函数
const getTypeIcon = (type) => {
  const iconMap = {
    singleChoice: CircleCheck,
    multipleChoice: List,
    fillBlank: EditPen,
    essay: QuestionFilled
  }
  return iconMap[type] || Document
}

const getTypeIconClass = (type) => {
  const classMap = {
    singleChoice: 'icon-single',
    multipleChoice: 'icon-multiple',
    fillBlank: 'icon-fill',
    essay: 'icon-essay'
  }
  return classMap[type] || ''
}

const getTypeColor = (type) => {
  const colorMap = {
    homework: 'primary',
    exam: 'danger',
    exercise: 'success',
    quiz: 'warning'
  }
  return colorMap[type] || 'info'
}

const getTypeLabel = (type) => {
  const labelMap = {
    homework: '作业',
    exam: '考试',
    exercise: '练习',
    quiz: '测验'
  }
  return labelMap[type] || '未知'
}

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger',
    mixed: 'info'
  }
  return colorMap[difficulty] || 'info'
}

const getDifficultyLabel = (difficulty) => {
  const labelMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    mixed: '混合'
  }
  return labelMap[difficulty] || '未知'
}

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'danger'
  }
  return colorMap[type] || 'info'
}

const getQuestionTypeLabel = (type) => {
  const labelMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return labelMap[type] || '未知'
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/custom-generate/index.vue`);
  });

</script>

<style scoped>
.custom-generate {
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

.config-section {
  margin-bottom: 20px;
}

/* 题目配置样式 */
.question-types-config {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.type-config-item {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.type-config-item:last-child {
  margin-bottom: 0;
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-name {
  font-weight: 500;
  color: #303133;
}

.type-controls {
  display: flex;
  gap: 8px;
}

.type-detail {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.summary-info {
  font-weight: 500;
  color: #409eff;
}

.score-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}

/* 知识点权重 */
.weight-sliders {
  max-height: 200px;
  overflow-y: auto;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.weight-label {
  min-width: 120px;
  color: #606266;
}

/* 设置描述 */
.setting-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 预览侧边栏 */
.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-section,
.actions-section,
.history-section {
  position: sticky;
  top: 20px;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

.paper-preview h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.paper-meta {
  margin-bottom: 16px;
}

.paper-stats {
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: 500;
  color: #303133;
}

.question-breakdown h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.breakdown-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 配置历史 */
.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.history-item:hover {
  background: #ecf5ff;
}

.history-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

/* 结果区域 */
.result-section {
  background: white;
}

.result-content {
  padding: 20px 0;
}

.result-summary h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.item-label {
  display: block;
  color: #606266;
  font-size: 12px;
  margin-bottom: 4px;
}

.item-value {
  display: block;
  color: #303133;
  font-weight: 500;
}

.result-preview h5 {
  margin: 0 0 16px 0;
  color: #303133;
}

.preview-questions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-question {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.preview-question .question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
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
  color: #303133;
  line-height: 1.5;
}

/* 对话框样式 */
.json-preview {
  max-height: 60vh;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
}

.json-preview pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.paper-full-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.paper-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4e7ed;
}

.paper-header h2 {
  margin: 0 0 12px 0;
  color: #303133;
}

.paper-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #606266;
}

.paper-questions {
  margin-top: 20px;
}

.paper-question {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.paper-question .question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-options {
  margin-top: 12px;
  padding-left: 20px;
}

.option-item {
  margin-bottom: 6px;
  color: #606266;
}

/* 图标颜色 */
.icon-single { color: #409eff; }
.icon-multiple { color: #67c23a; }
.icon-fill { color: #e6a23c; }
.icon-essay { color: #f56c6c; }

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col:first-child {
    span: 24;
  }
  .el-col:last-child {
    span: 24;
  }
  .preview-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .custom-generate {
    padding: 12px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
    margin-bottom: 16px;
  }

  .type-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .breakdown-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .weight-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>