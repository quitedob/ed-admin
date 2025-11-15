<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>能力测评分析</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleUploadExam">上传试卷</el-button>
            <el-button type="success" @click="handleBatchAnalysis">批量分析</el-button>
            <el-button @click="handleExportReport">导出报告</el-button>
          </div>
        </div>
      </template>

      <!-- 上传区域 -->
      <div class="upload-section">
        <el-upload
          class="exam-uploader"
          drag
          :action="uploadUrl"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
          :on-progress="handleUploadProgress"
          :file-list="fileList"
          multiple
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将试卷图片拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JPG/PNG 格式，单张图片不超过 10MB，可同时上传多张图片
            </div>
          </template>
        </el-upload>

        <!-- 上传进度显示 -->
        <div v-if="uploadProgress.visible" class="upload-progress">
          <el-progress
            :percentage="uploadProgress.percentage"
            :status="uploadProgress.status"
          />
          <p>{{ uploadProgress.message }}</p>
        </div>
      </div>

      <!-- 分析选项 -->
      <div class="analysis-options" v-if="hasUploadedFiles">
        <el-form :model="analysisOptions" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="学生姓名">
                <el-select v-model="analysisOptions.studentId" placeholder="请选择学生" filterable>
                  <el-option
                    v-for="student in studentList"
                    :key="student.id"
                    :label="student.name"
                    :value="student.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="考试类型">
                <el-select v-model="analysisOptions.examType" placeholder="请选择考试类型">
                  <el-option label="期中考试" value="midterm" />
                  <el-option label="期末考试" value="final" />
                  <el-option label="单元测试" value="unit" />
                  <el-option label="模拟考试" value="mock" />
                  <el-option label="作业测验" value="homework" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="学科科目">
                <el-select v-model="analysisOptions.subject" placeholder="请选择学科">
                  <el-option label="数学" value="math" />
                  <el-option label="语文" value="chinese" />
                  <el-option label="英语" value="english" />
                  <el-option label="物理" value="physics" />
                  <el-option label="化学" value="chemistry" />
                  <el-option label="编程" value="programming" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="分析选项">
                <el-checkbox-group v-model="analysisOptions.analysisTypes">
                  <el-checkbox value="score_analysis">成绩分析</el-checkbox>
                  <el-checkbox value="mistake_analysis">错题分析</el-checkbox>
                  <el-checkbox value="knowledge_analysis">知识点分析</el-checkbox>
                  <el-checkbox value="capability_assessment">能力评估</el-checkbox>
                  <el-checkbox value="improvement_suggestion">改进建议</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-button type="primary" @click="startAnalysis" :loading="analyzing">
              开始分析
            </el-button>
            <el-button @click="resetOptions">重置选项</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 分析结果 -->
      <div v-if="analysisResult" class="analysis-result">
        <el-tabs v-model="activeResultTab">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <div class="result-section">
              <el-descriptions :column="3" border>
                <el-descriptions-item label="学生姓名">{{ analysisResult.studentName }}</el-descriptions-item>
                <el-descriptions-item label="考试类型">{{ getExamTypeLabel(analysisResult.examType) }}</el-descriptions-item>
                <el-descriptions-item label="学科科目">{{ getSubjectLabel(analysisResult.subject) }}</el-descriptions-item>
                <el-descriptions-item label="总分">{{ analysisResult.totalScore }}分</el-descriptions-item>
                <el-descriptions-item label="得分">{{ analysisResult.studentScore }}分</el-descriptions-item>
                <el-descriptions-item label="得分率">
                  <span :style="{ color: getScoreColor(analysisResult.scoreRate) }">
                    {{ analysisResult.scoreRate }}%
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="班级排名">{{ analysisResult.classRank }}/{{ analysisResult.classTotal }}</el-descriptions-item>
                <el-descriptions-item label="年级排名">{{ analysisResult.gradeRank }}/{{ analysisResult.gradeTotal }}</el-descriptions-item>
                <el-descriptions-item label="分析时间">{{ parseTime(analysisResult.analysisTime) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <!-- 成绩分析 -->
          <el-tab-pane label="成绩分析" name="score">
            <div class="result-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="score-distribution">
                    <h4>分数分布</h4>
                    <div class="chart-container">
                      <div class="score-bar-chart">
                        <div
                          v-for="item in scoreDistribution"
                          :key="item.range"
                          class="score-bar-item"
                        >
                          <span class="range-label">{{ item.range }}</span>
                          <div class="bar-container">
                            <div
                              class="bar"
                              :style="{ width: item.percentage + '%', backgroundColor: item.color }"
                            ></div>
                          </div>
                          <span class="count">{{ item.count }}人</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="score-comparison">
                    <h4>成绩对比</h4>
                    <div class="comparison-item">
                      <span>班级平均分</span>
                      <el-progress
                        :percentage="analysisResult.classAverage"
                        :stroke-width="20"
                        :show-text="true"
                      />
                    </div>
                    <div class="comparison-item">
                      <span>年级平均分</span>
                      <el-progress
                        :percentage="analysisResult.gradeAverage"
                        :stroke-width="20"
                        :show-text="true"
                        color="var(--color-score-90-plus)"
                      />
                    </div>
                    <div class="comparison-item">
                      <span>个人得分</span>
                      <el-progress
                        :percentage="analysisResult.scoreRate"
                        :stroke-width="20"
                        :show-text="true"
                        color="#409eff"
                      />
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 错题分析 -->
          <el-tab-pane label="错题分析" name="mistakes">
            <div class="result-section">
              <div class="mistakes-summary">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-statistic title="错题数量" :value="analysisResult.mistakeCount" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="错题率" :value="analysisResult.mistakeRate" suffix="%" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="严重错题" :value="analysisResult.seriousMistakes" />
                  </el-col>
                  <el-col :span="6">
                    <el-statistic title="可避免错题" :value="analysisResult.avoidableMistakes" />
                  </el-col>
                </el-row>
              </div>

              <div class="mistakes-list">
                <h4>错题详情</h4>
                <el-table :data="analysisResult.mistakeDetails" stripe>
                  <el-table-column label="题号" prop="questionNumber" width="80" />
                  <el-table-column label="题型" prop="questionType" width="100">
                    <template #default="scope">
                      <el-tag size="small">{{ scope.row.questionType }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="知识点" prop="knowledgePoint" />
                  <el-table-column label="分值" prop="score" width="80" />
                  <el-table-column label="得分" prop="studentScore" width="80">
                    <template #default="scope">
                      <span :style="{ color: scope.row.studentScore === 0 ? 'var(--color-score-below-60)' : 'var(--color-text-primary)' }">
                        {{ scope.row.studentScore }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="错误原因" prop="mistakeReason" width="120">
                    <template #default="scope">
                      <el-tag :type="getMistakeReasonTagType(scope.row.mistakeReason)" size="small">
                        {{ getMistakeReasonLabel(scope.row.mistakeReason) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="错误分析" prop="analysis" show-overflow-tooltip />
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 知识点分析 -->
          <el-tab-pane label="知识点分析" name="knowledge">
            <div class="result-section">
              <div class="knowledge-mastery">
                <h4>知识点掌握情况</h4>
                <el-table :data="analysisResult.knowledgeAnalysis" stripe>
                  <el-table-column label="知识点" prop="knowledgePoint" />
                  <el-table-column label="题目数量" prop="questionCount" width="100" />
                  <el-table-column label="正确率" prop="accuracy" width="120">
                    <template #default="scope">
                      <el-progress
                        :percentage="scope.row.accuracy"
                        :color="getAccuracyColor(scope.row.accuracy)"
                        :stroke-width="8"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="掌握程度" prop="masteryLevel" width="120">
                    <template #default="scope">
                      <el-tag :type="getMasteryLevelTagType(scope.row.masteryLevel)">
                        {{ getMasteryLevelLabel(scope.row.masteryLevel) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="改进建议" prop="suggestion" show-overflow-tooltip />
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 能力评估 -->
          <el-tab-pane label="能力评估" name="capability">
            <div class="result-section">
              <div class="capability-radar">
                <h4>能力雷达图</h4>
                <div class="radar-container">
                  <!-- 这里应该使用 ECharts 或其他图表库来绘制雷达图 -->
                  <div class="radar-placeholder">
                    <el-empty description="雷达图组件加载中..." />
                  </div>
                </div>
              </div>

              <div class="capability-details">
                <h4>各项能力详情</h4>
                <el-row :gutter="20">
                  <el-col
                    v-for="capability in analysisResult.capabilityDetails"
                    :key="capability.name"
                    :span="6"
                  >
                    <div class="capability-item">
                      <div class="capability-name">{{ capability.name }}</div>
                      <div class="capability-score">
                        <el-progress
                          type="circle"
                          :percentage="capability.score"
                          :width="80"
                          :color="getCapabilityColor(capability.score)"
                        />
                      </div>
                      <div class="capability-desc">{{ capability.description }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button type="primary" @click="generateImprovementPlan">
            生成提分计划
          </el-button>
          <el-button type="success" @click="saveAnalysisResult">
            保存分析结果
          </el-button>
          <el-button @click="printReport">
            打印报告
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="AssessmentAnalysis">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { assessmentApi } from '@/api/assessment'
import { parseTime } from '@/utils'

// 响应式数据
const uploadUrl = ref('/api/assessment/admin/exam/upload')
const fileList = ref([])
const hasUploadedFiles = ref(false)
const analyzing = ref(false)
const activeResultTab = ref('basic')
const analysisResult = ref(null)

// 上传进度
const uploadProgress = reactive({
  visible: false,
  percentage: 0,
  status: '',
  message: ''
})

// 分析选项
const analysisOptions = reactive({
  studentId: '',
  examType: '',
  subject: '',
  analysisTypes: ['score_analysis', 'mistake_analysis', 'knowledge_analysis']
})

// 学生列表
const studentList = ref([])

// 分数分布数据
const scoreDistribution = ref([
  { range: '90-100', count: 5, percentage: 16.7, color: 'var(--color-score-90-plus)' },
  { range: '80-89', count: 8, percentage: 26.7, color: 'var(--color-score-80-89)' },
  { range: '70-79', count: 10, percentage: 33.3, color: 'var(--color-score-70-79)' },
  { range: '60-69', count: 5, percentage: 16.7, color: 'var(--color-score-60-69)' },
  { range: '0-59', count: 2, percentage: 6.6, color: 'var(--color-score-below-60)' }
])

// 文件上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

// 文件上传进度
const handleUploadProgress = (event, file) => {
  uploadProgress.visible = true
  uploadProgress.percentage = Math.round(event.percent)
  uploadProgress.status = 'active'
  uploadProgress.message = `正在上传 ${file.name}...`
}

// 文件上传成功
const handleUploadSuccess = async (response, file) => {
  uploadProgress.visible = false
  hasUploadedFiles.value = true

  try {
    // 模拟上传成功后的处理
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success(`${file.name} 上传成功`)
  } catch (error) {
    console.error('文件上传处理失败:', error)
    ElMessage.error('文件上传处理失败')
  }
}

// 开始分析
const startAnalysis = async () => {
  if (!analysisOptions.studentId) {
    ElMessage.error('请选择学生')
    return
  }
  if (!analysisOptions.examType) {
    ElMessage.error('请选择考试类型')
    return
  }
  if (!analysisOptions.subject) {
    ElMessage.error('请选择学科科目')
    return
  }

  analyzing.value = true
  try {
    // 先获取学生信息
    const student = studentList.value.find(s => s.id === analysisOptions.studentId)

    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 获取分析结果
    const result = await assessmentApi.getAnalysisResult('mock_analysis')

    // 更新结果中的基本信息
    analysisResult.value = {
      ...result.data,
      studentName: student?.name || '未知学生',
      examType: analysisOptions.examType,
      subject: analysisOptions.subject,
      analysisTime: new Date()
    }

    ElMessage.success('试卷分析完成')
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败，请重试')
  } finally {
    analyzing.value = false
  }
}

// 批量分析
const handleBatchAnalysis = async () => {
  try {
    ElMessage.info('正在准备批量分析...')
    const result = await assessmentApi.batchAnalysis({
      studentIds: studentList.value.map(s => s.id),
      analysisConfig: {
        types: analysisOptions.analysisTypes,
        includeMistakeAnalysis: true,
        includeKnowledgeAnalysis: true
      }
    })

    ElMessage.success(`批量分析任务创建成功，共${result.data.totalStudents}名学生`)
  } catch (error) {
    console.error('批量分析失败:', error)
    ElMessage.error('批量分析失败，请重试')
  }
}

// 上传试卷
const handleUploadExam = () => {
  document.querySelector('.exam-uploader input').click()
}

// 导出报告
const handleExportReport = async () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先完成分析再导出报告')
    return
  }

  try {
    ElMessage.info('正在生成报告...')
    const result = await assessmentApi.exportReport(analysisResult.value.id, 'pdf')

    // 模拟下载
    const link = document.createElement('a')
    link.href = result.data.downloadUrl
    link.download = result.data.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('报告导出成功')
  } catch (error) {
    console.error('导出报告失败:', error)
    ElMessage.error('导出报告失败，请重试')
  }
}

// 重置选项
const resetOptions = () => {
  Object.assign(analysisOptions, {
    studentId: '',
    examType: '',
    subject: '',
    analysisTypes: ['score_analysis', 'mistake_analysis', 'knowledge_analysis']
  })
}

// 生成提分计划
const generateImprovementPlan = async () => {
  if (!analysisResult.value) {
    ElMessage.warning('请先完成分析再生成提分计划')
    return
  }

  try {
    ElMessage.info('正在根据分析结果生成个性化提分计划...')

    const planData = {
      studentId: analysisResult.value.studentId,
      title: `${analysisResult.value.studentName}的${getSubjectLabel(analysisResult.value.subject)}提分计划`,
      targetScore: Math.min(100, analysisResult.value.studentScore + 10),
      currentScore: analysisResult.value.studentScore,
      basedOnAnalysis: analysisResult.value.id,
      weakKnowledgePoints: analysisResult.value.knowledgeAnalysis
        .filter(k => k.accuracy < 80)
        .map(k => k.knowledgePoint)
    }

    const result = await assessmentApi.createImprovementPlan(planData)
    ElMessage.success('提分计划生成成功')

    // 可以跳转到提分计划页面
    // router.push('/assessment/plan')
  } catch (error) {
    console.error('生成提分计划失败:', error)
    ElMessage.error('生成提分计划失败，请重试')
  }
}

// 保存分析结果
const saveAnalysisResult = async () => {
  if (!analysisResult.value) {
    ElMessage.warning('没有可保存的分析结果')
    return
  }

  try {
    await assessmentApi.saveAnalysisResult(analysisResult.value)
    ElMessage.success('分析结果已保存')
  } catch (error) {
    console.error('保存分析结果失败:', error)
    ElMessage.error('保存分析结果失败，请重试')
  }
}

// 打印报告
const printReport = () => {
  window.print()
}

// 工具方法
const getExamTypeLabel = (type) => {
  const labels = {
    midterm: '期中考试',
    final: '期末考试',
    unit: '单元测试',
    mock: '模拟考试',
    homework: '作业测验'
  }
  return labels[type] || type
}

const getSubjectLabel = (subject) => {
  const labels = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    physics: '物理',
    chemistry: '化学',
    programming: '编程'
  }
  return labels[subject] || subject
}

const getScoreColor = (rate) => {
  if (rate >= 90) return 'var(--color-score-90-plus)'
  if (rate >= 80) return 'var(--color-score-80-89)'
  if (rate >= 60) return 'var(--color-score-70-79)'
  return 'var(--color-score-below-60)'
}

const getMistakeReasonTagType = (reason) => {
  const types = {
    concept_error: 'danger',
    calculation_error: 'warning',
    logic_error: 'danger',
    carelessness: 'info',
    time_limit: 'warning'
  }
  return types[reason] || ''
}

const getMistakeReasonLabel = (reason) => {
  const labels = {
    concept_error: '概念错误',
    calculation_error: '计算错误',
    logic_error: '逻辑错误',
    carelessness: '粗心大意',
    time_limit: '时间不足'
  }
  return labels[reason] || reason
}

const getAccuracyColor = (accuracy) => {
  if (accuracy >= 80) return 'var(--color-score-90-plus)'
  if (accuracy >= 60) return 'var(--color-score-70-79)'
  return 'var(--color-score-below-60)'
}

const getMasteryLevelTagType = (level) => {
  const types = {
    mastered: 'success',
    familiar: 'primary',
    needs_improvement: 'warning',
    weak: 'danger'
  }
  return types[level] || ''
}

const getMasteryLevelLabel = (level) => {
  const labels = {
    mastered: '已掌握',
    familiar: '熟悉',
    needs_improvement: '待提高',
    weak: '薄弱'
  }
  return labels[level] || level
}

const getCapabilityColor = (score) => {
  if (score >= 80) return 'var(--color-score-90-plus)'
  if (score >= 60) return 'var(--color-score-70-79)'
  return 'var(--color-score-below-60)'
}

// 加载学生列表
const loadStudents = async () => {
  try {
    const result = await assessmentApi.getStudentList({ limit: 100 })
    studentList.value = result.data.items
  } catch (error) {
    console.error('加载学生列表失败:', error)
    ElMessage.error('加载学生列表失败')
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.upload-section {
  margin-bottom: 30px;
}

.exam-uploader {
  width: 100%;
}

.upload-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.upload-progress p {
  margin-top: 10px;
  color: #606266;
}

.analysis-options {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.analysis-result {
  margin-top: 30px;
}

.result-section {
  padding: 20px 0;
}

.result-section h4 {
  margin-bottom: 15px;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.score-distribution,
.score-comparison {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.score-bar-chart {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.score-bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.range-label {
  width: 60px;
  text-align: right;
  font-size: 14px;
  color: #606266;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition: width 0.3s ease;
}

.count {
  width: 50px;
  text-align: left;
  font-size: 14px;
  color: #303133;
}

.comparison-item {
  margin-bottom: 20px;
}

.comparison-item span {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}

.mistakes-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.mistakes-list h4 {
  margin-bottom: 15px;
}

.knowledge-mastery h4 {
  margin-bottom: 15px;
}

.capability-radar {
  margin-bottom: 30px;
}

.radar-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capability-details h4 {
  margin-bottom: 20px;
}

.capability-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.capability-name {
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.capability-score {
  margin-bottom: 10px;
}

.capability-desc {
  font-size: 12px;
  color: #606266;
}

.result-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.result-actions .el-button {
  margin: 0 10px;
}

@media print {
  .header-actions,
  .result-actions {
    display: none;
  }
}
</style>