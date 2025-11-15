<template>
  <div class="error-based">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/ai/assistant' }">智能作业生成</el-breadcrumb-item>
        <el-breadcrumb-item>基于错题生成</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>基于错题生成试卷/作业</h2>
      <p>分析学生的答题错误，针对性地生成练习题，帮助学生查漏补缺</p>
    </div>

    <div class="content-container">
      <!-- 数据选择区域 -->
      <div class="data-selection-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>数据选择</span>
              <el-button type="primary" size="small" @click="loadData">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>
          </template>

          <el-form :model="selectionForm" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="选择班级">
                  <el-select v-model="selectionForm.classId" placeholder="请选择班级" @change="onClassChange">
                    <el-option
                      v-for="cls in classes"
                      :key="cls.id"
                      :label="cls.name"
                      :value="cls.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="选择学生">
                  <el-select
                    v-model="selectionForm.studentIds"
                    multiple
                    placeholder="请选择学生"
                    :disabled="!selectionForm.classId"
                  >
                    <el-option
                      v-for="student in students"
                      :key="student.id"
                      :label="student.name"
                      :value="student.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="时间范围">
                  <el-date-picker
                    v-model="selectionForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="考试/作业">
              <el-checkbox-group v-model="selectionForm.exams" :disabled="!selectionForm.classId">
                <el-checkbox
                  v-for="exam in exams"
                  :key="exam.id"
                  :label="exam.id"
                >
                  {{ exam.name }} ({{ exam.date }})
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="analyzeErrors" :loading="analyzing">
                <el-icon><DataAnalysis /></el-icon>
                开始分析
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <!-- 错题分析结果 -->
      <div v-if="analysisResult" class="analysis-section">
        <el-row :gutter="20">
          <!-- 统计图表 -->
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>错题分布统计</span>
              </template>
              <div class="chart-container">
                <div ref="errorChart" class="error-chart"></div>
              </div>
            </el-card>
          </el-col>

          <!-- 知识点分析 -->
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>薄弱知识点</span>
              </template>
              <div class="knowledge-points">
                <div
                  v-for="point in weakKnowledgePoints"
                  :key="point.name"
                  class="knowledge-item"
                >
                  <div class="knowledge-header">
                    <span class="knowledge-name">{{ point.name }}</span>
                    <el-tag :type="getErrorLevelColor(point.errorRate)" size="small">
                      错误率 {{ point.errorRate }}%
                    </el-tag>
                  </div>
                  <div class="knowledge-bar">
                    <div
                      class="knowledge-progress"
                      :style="{ width: point.errorRate + '%', backgroundColor: getErrorLevelColor(point.errorRate) }"
                    ></div>
                  </div>
                  <div class="knowledge-detail">
                    <span>错题数: {{ point.errorCount }}</span>
                    <span>总题数: {{ point.totalCount }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 典型错题展示 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>典型错题</span>
              <el-button type="text" @click="showAllErrors">
                查看全部 ({{ analysisResult.totalErrors }})
              </el-button>
            </div>
          </template>

          <div class="error-questions">
            <div
              v-for="(question, index) in typicalErrors"
              :key="index"
              class="error-question"
            >
              <div class="question-header">
                <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
                <span class="error-rate">错误率 {{ question.errorRate }}%</span>
                <el-tag :type="getDifficultyColor(question.difficulty)" size="small">
                  {{ question.difficulty }}
                </el-tag>
              </div>
              <div class="question-content">
                {{ question.questionText }}
              </div>
              <div v-if="question.options" class="question-options">
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  class="option-item"
                  :class="{ 'wrong-answer': isWrongAnswer(question, option) }"
                >
                  {{ option.value }}. {{ option.text }}
                </div>
              </div>
              <div class="question-answer">
                <span class="answer-label">正确答案: </span>
                <span class="correct-answer">{{ formatCorrectAnswer(question) }}</span>
              </div>
              <div class="question-analysis">
                <span class="analysis-label">错题分析: </span>
                <span class="analysis-content">{{ question.analysis }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 生成设置区域 -->
      <div v-if="analysisResult" class="generate-settings-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>生成设置</span>
              <el-button type="success" @click="generatePaper" :loading="generating">
                <el-icon><MagicStick /></el-icon>
                生成练习卷
              </el-button>
            </div>
          </template>

          <el-form :model="generateSettings" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="试卷标题">
                  <el-input v-model="generateSettings.title" placeholder="请输入试卷标题" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="难度等级">
                  <el-select v-model="generateSettings.difficulty" placeholder="请选择难度">
                    <el-option label="自适应" value="adaptive" />
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="题目数量">
                  <el-input-number
                    v-model="generateSettings.questionCount"
                    :min="5"
                    :max="50"
                    placeholder="20"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="重点知识点">
              <el-select
                v-model="generateSettings.focusPoints"
                multiple
                placeholder="请选择重点练习的知识点"
                style="width: 100%"
              >
                <el-option
                  v-for="point in weakKnowledgePoints"
                  :key="point.name"
                  :label="`${point.name} (错误率${point.errorRate}%)`"
                  :value="point.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="题型分布">
              <div class="question-types">
                <div
                  v-for="type in questionTypes"
                  :key="type.value"
                  class="type-item"
                >
                  <span class="type-label">{{ type.label }}</span>
                  <el-input-number
                    v-model="generateSettings[type.value]"
                    :min="0"
                    :max="20"
                    size="small"
                  />
                </div>
              </div>
            </el-form-item>

            <el-form-item label="生成策略">
              <el-radio-group v-model="generateSettings.strategy">
                <el-radio label="reinforce">强化练习</el-radio>
                <el-radio label="balanced">均衡练习</el-radio>
                <el-radio label="progressive">渐进提升</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="高级选项">
              <el-checkbox-group v-model="generateSettings.advanced">
                <el-checkbox label="includeOriginal">包含原题变体</el-checkbox>
                <el-checkbox label="randomOrder">随机排序</el-checkbox>
                <el-checkbox label="showHints">显示解题提示</el-checkbox>
                <el-checkbox label="timeLimit">设置时间限制</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

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
                <el-button type="warning" @click="savePaper">
                  <el-icon><Folder /></el-icon>
                  保存试卷
                </el-button>
              </div>
            </div>
          </template>

          <div class="paper-summary">
            <div class="summary-item">
              <span class="summary-label">试卷标题:</span>
              <span class="summary-value">{{ generatedPaper.title }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">题目总数:</span>
              <span class="summary-value">{{ generatedPaper.questions?.length || 0 }}题</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">总分:</span>
              <span class="summary-value">{{ generatedPaper.totalScore || 0 }}分</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">预计用时:</span>
              <span class="summary-value">{{ generatedPaper.estimatedTime || 45 }}分钟</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">生成时间:</span>
              <span class="summary-value">{{ formatTime(generatedPaper.createdAt) }}</span>
            </div>
          </div>

          <div class="paper-preview">
            <h4>预览内容 (前3题)</h4>
            <div
              v-for="(question, index) in generatedPaper.questions?.slice(0, 3)"
              :key="index"
              class="preview-question"
            >
              <div class="question-number">{{ index + 1 }}.</div>
              <div class="question-content">
                {{ question.questionText }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 全部错题对话框 -->
    <el-dialog v-model="showAllErrorsDialog" title="全部错题" width="80%">
      <div class="all-errors">
        <div
          v-for="(question, index) in allErrors"
          :key="index"
          class="error-question"
        >
          <div class="question-header">
            <span class="question-type">{{ getQuestionTypeLabel(question.type) }}</span>
            <span class="error-rate">错误率 {{ question.errorRate }}%</span>
            <el-tag :type="getDifficultyColor(question.difficulty)" size="small">
              {{ question.difficulty }}
            </el-tag>
          </div>
          <div class="question-content">
            {{ question.questionText }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 试卷预览对话框 -->
    <el-dialog v-model="showPaperPreviewDialog" title="试卷预览" width="80%">
      <div v-if="generatedPaper" class="paper-full-preview">
        <div class="paper-header">
          <h2>{{ generatedPaper.title }}</h2>
          <div class="paper-info">
            <span>题目总数: {{ generatedPaper.questions?.length || 0 }}</span>
            <span>总分: {{ generatedPaper.totalScore || 0 }}</span>
            <span>预计用时: {{ generatedPaper.estimatedTime || 45 }}分钟</span>
          </div>
        </div>
        <div class="paper-content">
          <div
            v-for="(question, index) in generatedPaper.questions"
            :key="index"
            class="full-question"
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  Refresh,
  DataAnalysis,
  MagicStick,
  View,
  Download,
  Folder
} from '@element-plus/icons-vue'

// 响应式数据
const classes = ref([])
const students = ref([])
const exams = ref([])
const analyzing = ref(false)
const generating = ref(false)
const analysisResult = ref(null)
const generatedPaper = ref(null)
const showAllErrorsDialog = ref(false)
const showPaperPreviewDialog = ref(false)
const allErrors = ref([])
const errorChart = ref(null)
let chartInstance = null

// 选择表单
const selectionForm = reactive({
  classId: '',
  studentIds: [],
  dateRange: [],
  exams: []
})

// 生成设置
const generateSettings = reactive({
  title: '错题针对性练习卷',
  difficulty: 'adaptive',
  questionCount: 20,
  focusPoints: [],
  singleChoice: 8,
  multipleChoice: 4,
  fillBlank: 4,
  essay: 2,
  strategy: 'reinforce',
  advanced: []
})

// 题型配置
const questionTypes = ref([
  { label: '单选题', value: 'singleChoice' },
  { label: '多选题', value: 'multipleChoice' },
  { label: '填空题', value: 'fillBlank' },
  { label: '问答题', value: 'essay' }
])

// 计算属性
const weakKnowledgePoints = computed(() => {
  if (!analysisResult.value?.knowledgePoints) return []
  return analysisResult.value.knowledgePoints
    .filter(point => point.errorRate > 30)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 8)
})

const typicalErrors = computed(() => {
  if (!analysisResult.value?.errors) return []
  return analysisResult.value.errors.slice(0, 3)
})

// 加载数据
const loadData = async () => {
  try {
    // 模拟加载班级数据
    classes.value = [
      { id: 1, name: '计算机科学与技术1班' },
      { id: 2, name: '计算机科学与技术2班' },
      { id: 3, name: '软件工程1班' }
    ]
    ElMessage.success('数据加载成功')
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

// 班级变化处理
const onClassChange = async (classId) => {
  try {
    // 模拟加载学生和考试数据
    students.value = [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' },
      { id: 4, name: '赵六' }
    ]

    exams.value = [
      { id: 1, name: 'JavaScript期中考试', date: '2024-03-15' },
      { id: 2, name: '数据结构月考', date: '2024-03-20' },
      { id: 3, name: '算法练习作业', date: '2024-03-25' }
    ]

    ElMessage.success('班级数据加载成功')
  } catch (error) {
    ElMessage.error('班级数据加载失败')
  }
}

// 分析错题
const analyzeErrors = async () => {
  if (!selectionForm.classId || selectionForm.exams.length === 0) {
    ElMessage.warning('请选择班级和考试/作业')
    return
  }

  analyzing.value = true

  try {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    analysisResult.value = {
      totalErrors: 45,
      totalStudents: selectionForm.studentIds.length || 25,
      knowledgePoints: [
        { name: 'JavaScript基础', errorRate: 65, errorCount: 26, totalCount: 40 },
        { name: '数据结构', errorRate: 48, errorCount: 19, totalCount: 40 },
        { name: '算法设计', errorRate: 72, errorCount: 29, totalCount: 40 },
        { name: 'Web开发', errorRate: 35, errorCount: 14, totalCount: 40 },
        { name: '数据库', errorRate: 28, errorCount: 11, totalCount: 40 }
      ],
      errors: [
        {
          type: 'single',
          questionText: 'JavaScript中，以下哪个方法可以用来向数组末尾添加元素？',
          errorRate: 68,
          difficulty: 'easy',
          options: [
            { id: 'opt_a', value: 'A', text: 'push()' },
            { id: 'opt_b', value: 'B', text: 'pop()' },
            { id: 'opt_c', value: 'C', text: 'shift()' },
            { id: 'opt_d', value: 'D', text: 'unshift()' }
          ],
          correctAnswer: 'A',
          analysis: '学生容易混淆数组的操作方法，特别是push和pop的区别'
        },
        {
          type: 'multiple',
          questionText: '以下哪些是JavaScript的基本数据类型？',
          errorRate: 52,
          difficulty: 'medium',
          options: [
            { id: 'opt_a', value: 'A', text: 'Number' },
            { id: 'opt_b', value: 'B', text: 'String' },
            { id: 'opt_c', value: 'C', text: 'Array' },
            { id: 'opt_d', value: 'D', text: 'Boolean' }
          ],
          correctAnswers: ['A', 'B', 'D'],
          analysis: '学生对数据类型和对象类型的区分不够清晰'
        },
        {
          type: 'fill',
          questionText: 'JavaScript中，使用___关键字可以声明一个常量。',
          errorRate: 45,
          difficulty: 'easy',
          correctAnswers: ['const'],
          analysis: '学生对ES6新语法的掌握还不够熟练'
        }
      ]
    }

    allErrors.value = analysisResult.value.errors

    // 绘制图表
    await nextTick()
    drawChart()

    ElMessage.success('错题分析完成')
  } catch (error) {
    ElMessage.error('错题分析失败')
  } finally {
    analyzing.value = false
  }
}

// 绘制图表
const drawChart = () => {
  if (!errorChart.value || !analysisResult.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(errorChart.value)

  const option = {
    title: {
      text: '错题类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '错题数量',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 18, name: '单选题' },
          { value: 12, name: '多选题' },
          { value: 8, name: '填空题' },
          { value: 7, name: '问答题' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 重置表单
const resetForm = () => {
  Object.assign(selectionForm, {
    classId: '',
    studentIds: [],
    dateRange: [],
    exams: []
  })
  analysisResult.value = null
  generatedPaper.value = null
}

// 生成试卷
const generatePaper = async () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先进行错题分析')
    return
  }

  generating.value = true

  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    generatedPaper.value = {
      title: generateSettings.title,
      questions: [
        {
          type: 'single',
          questionText: '以下哪个方法可以用来向数组末尾添加元素？',
          score: 5,
          options: [
            { id: 'opt_a', value: 'A', text: 'push()' },
            { id: 'opt_b', value: 'B', text: 'append()' },
            { id: 'opt_c', value: 'C', text: 'add()' },
            { id: 'opt_d', value: 'D', text: 'insert()' }
          ],
          correctAnswer: 'A'
        },
        {
          type: 'multiple',
          questionText: 'JavaScript中哪些是基本数据类型？',
          score: 10,
          options: [
            { id: 'opt_a', value: 'A', text: 'Number' },
            { id: 'opt_b', value: 'B', text: 'String' },
            { id: 'opt_c', value: 'C', text: 'Object' },
            { id: 'opt_d', value: 'D', text: 'Boolean' }
          ],
          correctAnswers: ['A', 'B', 'D']
        },
        {
          type: 'fill',
          questionText: '声明变量的关键字有___、___和___。',
          score: 5,
          correctAnswers: ['var', 'let', 'const']
        }
      ],
      totalScore: 100,
      estimatedTime: 45,
      createdAt: new Date().toISOString()
    }

    ElMessage.success('试卷生成成功')
  } catch (error) {
    ElMessage.error('试卷生成失败')
  } finally {
    generating.value = false
  }
}

// 显示全部错题
const showAllErrors = () => {
  showAllErrorsDialog.value = true
}

// 查看试卷
const viewPaper = () => {
  showPaperPreviewDialog.value = true
}

// 导出试卷
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
  ElMessage.success('试卷导出成功')
}

// 保存试卷
const savePaper = () => {
  ElMessage.success('试卷保存成功')
}

// 辅助函数
const getQuestionTypeLabel = (type) => {
  const labelMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return labelMap[type] || '未知'
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

const getDifficultyColor = (difficulty) => {
  const colorMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return colorMap[difficulty] || 'info'
}

const getErrorLevelColor = (rate) => {
  if (rate >= 70) return '#f56c6c'
  if (rate >= 50) return '#e6a23c'
  return '#67c23a'
}

const isWrongAnswer = (question, option) => {
  if (question.correctAnswer && option.value === question.correctAnswer) return false
  if (question.correctAnswers && !question.correctAnswers.includes(option.value)) return true
  return false
}

const formatCorrectAnswer = (question) => {
  if (question.correctAnswer) return question.correctAnswer
  if (question.correctAnswers) return question.correctAnswers.join(', ')
  return '无'
}

const formatTime = (timeString) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/error-based/index.vue`);
  loadData()
})
</script>

<style scoped>
.error-based {
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

/* 选择区域 */
.data-selection-section .el-form {
  padding: 20px 0;
}

/* 分析结果区域 */
.analysis-section {
  background: white;
}

.chart-container {
  height: 300px;
}

.error-chart {
  width: 100%;
  height: 100%;
}

.knowledge-points {
  max-height: 300px;
  overflow-y: auto;
}

.knowledge-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.knowledge-name {
  font-weight: 500;
  color: #303133;
}

.knowledge-bar {
  height: 6px;
  background: #e4e7ed;
  border-radius: 3px;
  margin-bottom: 8px;
  overflow: hidden;
}

.knowledge-progress {
  height: 100%;
  transition: width 0.3s ease;
}

.knowledge-detail {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

/* 错题展示 */
.error-questions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-question {
  padding: 20px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 8px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-type {
  padding: 4px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.error-rate {
  color: #f56c6c;
  font-weight: 500;
}

.question-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: #303133;
}

.question-options {
  margin-bottom: 12px;
  padding-left: 20px;
}

.option-item {
  margin-bottom: 6px;
  color: #606266;
}

.option-item.wrong-answer {
  color: #f56c6c;
  text-decoration: line-through;
}

.question-answer {
  margin-bottom: 8px;
}

.answer-label {
  color: #606266;
  margin-right: 8px;
}

.correct-answer {
  color: #67c23a;
  font-weight: 500;
}

.question-analysis {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #fbc4c4;
}

.analysis-label {
  color: #606266;
  margin-right: 8px;
}

.analysis-content {
  color: #f56c6c;
  font-style: italic;
}

/* 生成设置区域 */
.generate-settings-section {
  background: white;
}

.question-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.type-label {
  color: #606266;
  font-size: 14px;
}

/* 结果区域 */
.result-section {
  background: white;
}

.paper-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}

.summary-value {
  color: #303133;
  font-weight: 500;
}

.paper-preview h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.preview-question {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
  min-width: 24px;
}

/* 对话框内容 */
.all-errors {
  max-height: 60vh;
  overflow-y: auto;
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

.paper-content {
  margin-top: 20px;
}

.full-question {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.full-question .question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.question-score {
  color: #67c23a;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-based {
    padding: 12px;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
    margin-bottom: 16px;
  }

  .paper-summary {
    grid-template-columns: 1fr;
  }

  .question-types {
    grid-template-columns: 1fr;
  }

  .knowledge-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .paper-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>