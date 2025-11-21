<template>
  <div id="error-based-container" class="error-based-container">
    <div id="page-header" class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/ai/assistant' }">智能作业生成</el-breadcrumb-item>
        <el-breadcrumb-item>基于错题生成</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>基于错题生成试卷/作业</h2>
      <p>分析学生的答题错误，针对性地生成练习题，帮助学生查漏补缺</p>
    </div>

    <!-- 数据选择区域 -->
    <el-card id="selection-card" class="selection-card">
      <template #header>
        <div id="selection-header" class="card-header">
          <span>数据选择与筛选</span>
          <el-button type="primary" size="small" @click="loadData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>

      <el-form :model="filterForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="班级">
              <el-select v-model="filterForm.classId" placeholder="请选择班级" @change="onClassChange">
                <el-option
                  v-for="cls in classes"
                  :key="cls.id"
                  :label="cls.name"
                  :value="cls.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="学生">
              <el-select
                v-model="filterForm.studentIds"
                multiple
                placeholder="全选"
                :disabled="!filterForm.classId"
                collapse-tags
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
          <el-col :span="6">
            <el-form-item label="时间段">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型">
              <el-select v-model="filterForm.type" placeholder="全部">
                <el-option label="全部" value="" />
                <el-option label="考试" value="exam" />
                <el-option label="作业" value="homework" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="选择记录">
          <el-checkbox-group v-model="filterForm.recordIds" :disabled="!filterForm.classId">
            <div v-for="record in filteredRecords" :key="record.id" :id="`record-checkbox-${record.id}`" class="record-checkbox">
              <el-checkbox :label="record.id">
                <span class="record-name">{{ record.name }}</span>
                <el-tag :type="record.type === 'exam' ? 'danger' : 'success'" size="small">
                  {{ record.type === 'exam' ? '考试' : '作业' }}
                </el-tag>
                <span class="record-date">{{ record.date }}</span>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="analyzeErrors" :loading="analyzing">
            <el-icon><DataAnalysis /></el-icon>
            开始分析
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="uploadPapers">
            <el-icon><Upload /></el-icon>
            上传纸质试卷
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 分析结果区域 -->
    <div v-if="analysisResult" id="analysis-result" class="analysis-result">
      <el-row :gutter="20">
        <!-- 左侧：错题统计 -->
        <el-col :span="8">
          <el-card id="stat-card" class="stat-card">
            <template #header>
              <span>错题统计</span>
            </template>
            <div id="stat-items" class="stat-items">
              <div id="stat-total-errors" class="stat-item">
                <span class="label">总错题数</span>
                <span class="value">{{ analysisResult.totalErrors }}</span>
              </div>
              <div class="stat-item">
                <span class="label">涉及知识点</span>
                <span class="value">{{ analysisResult.knowledgePoints.length }}</span>
              </div>
              <div class="stat-item">
                <span class="label">平均错误率</span>
                <span class="value">{{ analysisResult.avgErrorRate }}%</span>
              </div>
              <div class="stat-item">
                <span class="label">学生数</span>
                <span class="value">{{ analysisResult.studentCount }}</span>
              </div>
            </div>

            <div class="knowledge-points">
              <h4>薄弱知识点</h4>
              <div class="point-list">
                <div
                  v-for="point in analysisResult.weakPoints"
                  :key="point.id"
                  class="point-item"
                >
                  <span class="point-name">{{ point.name }}</span>
                  <el-progress
                    :percentage="point.errorRate"
                    :color="getProgressColor(point.errorRate)"
                    :show-text="false"
                  />
                  <span class="point-rate">{{ point.errorRate }}%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：错题列表和知识点分布 -->
        <el-col :span="16">
          <el-tabs>
            <el-tab-pane label="错题列表">
              <el-table :data="analysisResult.errorQuestions" stripe style="width: 100%">
                <el-table-column prop="questionText" label="题目" min-width="200" />
                <el-table-column prop="errorCount" label="错误次数" width="100" align="center" />
                <el-table-column prop="errorRate" label="错误率" width="100" align="center">
                  <template #default="{ row }">
                    <el-progress :percentage="row.errorRate" :show-text="false" />
                  </template>
                </el-table-column>
                <el-table-column prop="knowledgePoint" label="知识点" width="120" />
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="viewQuestion(row)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="知识点分布">
              <div class="chart-container">
                <div class="chart-placeholder">
                  <p>知识点掌握情况分布图</p>
                  <p style="font-size: 12px; color: #909399;">
                    (实际项目中使用 ECharts 或其他图表库)
                  </p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>

      <!-- 生成选项 -->
      <el-card id="generation-card" class="generation-card">
        <template #header>
          <span>生成选项</span>
        </template>

        <el-form :model="generationForm" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="输出类型">
                <el-select v-model="generationForm.outputType" placeholder="请选择">
                  <el-option label="生成作业" value="homework" />
                  <el-option label="生成考试" value="exam" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="题目数量">
                <el-input-number v-model="generationForm.questionCount" :min="1" :max="100" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="难度分布">
                <el-select v-model="generationForm.difficulty" placeholder="请选择">
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                  <el-option label="混合" value="mixed" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="完成时间建议">
            <el-input-number v-model="generationForm.suggestedTime" :min="0" /> 分钟
          </el-form-item>

          <el-form-item label="生成内容">
            <el-checkbox-group v-model="generationForm.content">
              <el-checkbox label="student-report">学生分析报告</el-checkbox>
              <el-checkbox label="teaching-plan">教学计划和大纲</el-checkbox>
              <el-checkbox label="practice">针对练习题</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="generateContent" :loading="generating">
              <el-icon><DocumentCopy /></el-icon>
              生成内容
            </el-button>
            <el-button @click="previewResult">预览</el-button>
            <el-button @click="exportResult">导出</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 生成结果预览 -->
      <div v-if="generationResult" id="result-preview" class="result-preview">
        <el-card>
          <template #header>
            <span>生成结果预览</span>
          </template>
          <JsonPreview :data="generationResult" />
        </el-card>
      </div>
    </div>

    <!-- 上传纸质试卷对话框 -->
    <el-dialog id="upload-dialog" v-model="uploadDialogVisible" title="上传纸质试卷" width="600px">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileUpload"
        accept="image/*,.pdf"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持图片(JPG/PNG)和PDF文件，单个文件不超过10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" :loading="uploading">
          上传并识别
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, DataAnalysis, Upload, DocumentCopy, UploadFilled } from '@element-plus/icons-vue'
import JsonPreview from '../components/JsonPreview.vue'

const analyzing = ref(false)
const generating = ref(false)
const uploading = ref(false)
const uploadDialogVisible = ref(false)
const uploadedFile = ref(null)

// 筛选表单
const filterForm = reactive({
  classId: '',
  studentIds: [],
  dateRange: [],
  type: '',
  recordIds: []
})

// 生成表单
const generationForm = reactive({
  outputType: 'homework',
  questionCount: 20,
  difficulty: 'mixed',
  suggestedTime: 60,
  content: ['student-report', 'teaching-plan', 'practice']
})

// 数据
const classes = ref([
  { id: 'class_001', name: '一年级一班' },
  { id: 'class_002', name: '一年级二班' }
])

const students = ref([])
const records = ref([])
const analysisResult = ref(null)
const generationResult = ref(null)

// 初始化模拟数据
const initMockData = () => {
  students.value = [
    { id: 'stu_001', name: '张三' },
    { id: 'stu_002', name: '李四' },
    { id: 'stu_003', name: '王五' }
  ]

  records.value = [
    { id: 'rec_001', name: '数学期中考试', type: 'exam', date: '2024-11-15' },
    { id: 'rec_002', name: '第一章作业', type: 'homework', date: '2024-11-10' },
    { id: 'rec_003', name: '数学期末考试', type: 'exam', date: '2024-12-01' }
  ]
}

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (filterForm.type && r.type !== filterForm.type) return false
    return true
  })
})

const onClassChange = () => {
  filterForm.studentIds = []
  filterForm.recordIds = []
}

const loadData = () => {
  ElMessage.success('数据已刷新')
}

const analyzeErrors = async () => {
  if (!filterForm.classId) {
    ElMessage.warning('请选择班级')
    return
  }
  if (filterForm.recordIds.length === 0) {
    ElMessage.warning('请选择至少一条记录')
    return
  }

  analyzing.value = true
  try {
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    analysisResult.value = {
      totalErrors: 45,
      studentCount: filterForm.studentIds.length || 3,
      avgErrorRate: 35,
      knowledgePoints: [
        { id: 'kp_001', name: '一元一次方程' },
        { id: 'kp_002', name: '二次函数' },
        { id: 'kp_003', name: '几何证明' }
      ],
      weakPoints: [
        { id: 'kp_001', name: '一元一次方程', errorRate: 65 },
        { id: 'kp_002', name: '二次函数', errorRate: 48 },
        { id: 'kp_003', name: '几何证明', errorRate: 32 }
      ],
      errorQuestions: [
        {
          id: 'q_001',
          questionText: '解方程：2x + 3 = 11',
          errorCount: 12,
          errorRate: 60,
          knowledgePoint: '一元一次方程'
        },
        {
          id: 'q_002',
          questionText: '求二次函数 y = x² - 2x + 1 的顶点',
          errorCount: 8,
          errorRate: 40,
          knowledgePoint: '二次函数'
        },
        {
          id: 'q_003',
          questionText: '证明：三角形ABC中，AB = AC，则∠B = ∠C',
          errorCount: 5,
          errorRate: 25,
          knowledgePoint: '几何证明'
        }
      ]
    }

    ElMessage.success('分析完成')
  } finally {
    analyzing.value = false
  }
}

const generateContent = async () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先进行错题分析')
    return
  }

  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    generationResult.value = {
      type: generationForm.outputType,
      title: `${generationForm.outputType === 'exam' ? '考试' : '作业'} - 错题巩固`,
      questions: Array.from({ length: generationForm.questionCount }, (_, i) => ({
        id: `q_${i + 1}`,
        type: 'single',
        text: `题目 ${i + 1}`,
        score: 5,
        knowledgePoint: analysisResult.value.weakPoints[i % analysisResult.value.weakPoints.length].name
      })),
      studentReport: {
        currentLevel: '中等水平',
        knowledgeStatus: analysisResult.value.weakPoints,
        suggestions: [
          '加强一元一次方程的练习',
          '重点复习二次函数的性质',
          '多做几何证明题'
        ]
      },
      teachingPlan: {
        weeks: 4,
        lessons: [
          { week: 1, topic: '一元一次方程基础', hours: 2 },
          { week: 2, topic: '二次函数深入', hours: 3 },
          { week: 3, topic: '几何证明方法', hours: 2 },
          { week: 4, topic: '综合复习与测试', hours: 2 }
        ]
      }
    }

    ElMessage.success('内容生成成功')
  } finally {
    generating.value = false
  }
}

const previewResult = () => {
  if (!generationResult.value) {
    ElMessage.warning('请先生成内容')
    return
  }
  ElMessage.info('预览功能开发中...')
}

const exportResult = () => {
  if (!generationResult.value) {
    ElMessage.warning('请先生成内容')
    return
  }
  ElMessage.success('已导出为JSON文件')
}

const uploadPapers = () => {
  uploadDialogVisible.value = true
}

const handleFileUpload = (file) => {
  uploadedFile.value = file
}

const confirmUpload = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  uploading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('文件已上传并识别')
    uploadDialogVisible.value = false
    uploadedFile.value = null
  } finally {
    uploading.value = false
  }
}

const viewQuestion = (question) => {
  ElMessage.info(`查看题目: ${question.questionText}`)
}

const resetForm = () => {
  filterForm.classId = ''
  filterForm.studentIds = []
  filterForm.dateRange = []
  filterForm.type = ''
  filterForm.recordIds = []
  analysisResult.value = null
  generationResult.value = null
}

const getProgressColor = (rate) => {
  if (rate >= 60) return '#f56c6c'
  if (rate >= 40) return '#e6a23c'
  return '#67c23a'
}

onMounted(() => {
  initMockData()
})
</script>

<style scoped>
.error-based-container {
  padding: 20px;
  background-color: var(--color-bg-secondary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 12px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.page-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.selection-card,
.stat-card,
.generation-card,
.result-preview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.record-name {
  margin-right: 8px;
}

.record-date {
  margin-left: 8px;
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.stat-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

.knowledge-points {
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}

.knowledge-points h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.point-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.point-name {
  min-width: 100px;
  font-size: 13px;
}

.point-item :deep(.el-progress) {
  flex: 1;
}

.point-rate {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: var(--color-text-tertiary);
}

.analysis-result {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
