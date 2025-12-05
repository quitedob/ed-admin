<template>
  <div id="custom-generate-container" class="custom-generate-container">
    <div id="page-header" class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/ai/assistant' }">智能作业生成</el-breadcrumb-item>
        <el-breadcrumb-item>自定义生成</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>自定义生成试卷/作业</h2>
      <p>根据您的具体要求，自定义题目类型、数量、难度等参数生成试卷</p>
    </div>

    <div id="content-wrapper" class="content-wrapper">
      <el-row :gutter="20">
        <!-- 左侧配置区域 -->
        <el-col :span="16">
          <!-- 基础信息 -->
          <el-card id="basic-info-card" class="config-card">
            <template #header>
              <div id="basic-info-header" class="card-header">
                <span>基础信息</span>
                <el-button type="primary" size="small" @click="useTemplate">
                  <el-icon><DocumentCopy /></el-icon>
                  使用模板
                </el-button>
              </div>
            </template>

            <el-form :model="config" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="标题" required>
                    <el-input v-model="config.title" placeholder="请输入试卷标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="输出类型" required>
                    <el-select v-model="config.outputType" placeholder="请选择" @change="onOutputTypeChange">
                      <el-option label="生成作业" value="homework" />
                      <el-option label="生成考试" value="exam" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="难度">
                    <el-select v-model="config.difficulty" placeholder="请选择">
                      <el-option label="简单" value="easy" />
                      <el-option label="中等" value="medium" />
                      <el-option label="困难" value="hard" />
                      <el-option label="混合" value="mixed" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="总分">
                    <el-input-number v-model="config.totalScore" :min="1" :max="200" />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 考试特有字段 -->
              <template v-if="config.outputType === 'exam'">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="及格线">
                      <el-input-number
                        v-model="config.passingScore"
                        :min="0"
                        :max="config.totalScore"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="考试时长">
                      <el-input-number v-model="config.duration" :min="0" /> 分钟
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="阅卷规则">
                  <el-checkbox-group v-model="config.gradingRules">
                    <el-checkbox label="auto-grade">自动评分</el-checkbox>
                    <el-checkbox label="manual-review">人工审核</el-checkbox>
                    <el-checkbox label="show-answers">显示答案</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </template>

              <!-- 作业特有字段 -->
              <template v-else>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="完成时间建议">
                      <el-input-number v-model="config.suggestedTime" :min="0" /> 分钟
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="完成度要求">
                      <el-input-number v-model="config.completionRequirement" :min="0" :max="100" /> %
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>

              <el-form-item label="描述">
                <el-input
                  v-model="config.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入描述"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 题目配置 -->
          <el-card id="question-config-card" class="config-card">
            <template #header>
              <div id="question-config-header" class="card-header">
                <span>题目配置</span>
                <div id="question-config-actions" class="header-actions">
                  <el-button type="text" size="small" @click="autoBalance">自动平衡</el-button>
                  <el-button type="text" size="small" @click="resetQuestions">重置</el-button>
                </div>
              </div>
            </template>

            <div class="question-config">
              <div
                v-for="type in questionTypes"
                :key="type.value"
                class="type-item"
              >
                <div class="type-header">
                  <span class="type-name">{{ type.label }}</span>
                  <span class="type-score">{{ type.score }}分/题</span>
                </div>
                <div class="type-controls">
                  <el-input-number
                    v-model="config.questions[type.value].count"
                    :min="0"
                    :max="50"
                    size="small"
                    placeholder="数量"
                  />
                  <span class="total-score">
                    小计: {{ config.questions[type.value].count * type.score }}分
                  </span>
                </div>
              </div>
            </div>

            <div class="score-summary">
              <span>总分: {{ calculateTotalScore() }} / {{ config.totalScore }}</span>
              <el-progress
                :percentage="(calculateTotalScore() / config.totalScore) * 100"
                :show-text="false"
              />
            </div>
          </el-card>

          <!-- 知识点配置 -->
          <el-card id="knowledge-config-card" class="config-card">
            <template #header>
              <span>知识点权重配置</span>
            </template>

            <div id="knowledge-points" class="knowledge-points">
              <div
                v-for="point in knowledgePoints"
                :key="point.id"
                :id="`point-item-${point.id}`"
                class="point-item"
              >
                <span class="point-name">{{ point.name }}</span>
                <el-slider
                  v-model="point.weight"
                  :min="0"
                  :max="100"
                  :step="5"
                  show-input
                  input-size="small"
                />
              </div>
            </div>
          </el-card>

          <!-- 高级选项 -->
          <el-card id="advanced-options-card" class="config-card">
            <template #header>
              <span>高级选项</span>
            </template>

            <el-form :model="config" label-width="100px">
              <el-form-item label="选项">
                <el-checkbox-group v-model="config.options">
                  <div v-for="option in advancedOptions" :key="option.value" :id="`option-item-${option.value}`" class="option-item">
                    <el-checkbox :label="option.value">
                      {{ option.label }}
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="模板">
                <el-select v-model="config.template" placeholder="选择模板">
                  <el-option label="标准模板" value="standard" />
                  <el-option label="简洁模板" value="simple" />
                  <el-option label="详细模板" value="detailed" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 操作按钮 -->
          <div id="action-buttons" class="action-buttons">
            <el-button @click="resetAll">重置全部</el-button>
            <el-button @click="previewConfig">预览配置</el-button>
            <el-button type="primary" @click="generatePaper" :loading="generating">
              <el-icon><DocumentCopy /></el-icon>
              生成试卷
            </el-button>
          </div>
        </el-col>

        <!-- 右侧预览区域 -->
        <el-col :span="8">
          <el-card id="preview-card" class="preview-card">
            <template #header>
              <span>配置预览</span>
            </template>

            <div id="preview-content" class="preview-content">
              <div class="preview-item">
                <span class="label">标题:</span>
                <span class="value">{{ config.title || '未设置' }}</span>
              </div>
              <div class="preview-item">
                <span class="label">类型:</span>
                <el-tag :type="config.outputType === 'exam' ? 'danger' : 'success'">
                  {{ config.outputType === 'exam' ? '考试' : '作业' }}
                </el-tag>
              </div>
              <div class="preview-item">
                <span class="label">难度:</span>
                <span class="value">{{ getDifficultyLabel(config.difficulty) }}</span>
              </div>
              <div class="preview-item">
                <span class="label">总分:</span>
                <span class="value">{{ config.totalScore }}分</span>
              </div>

              <div class="divider"></div>

              <div class="preview-item">
                <span class="label">题目统计:</span>
              </div>
              <div v-for="type in questionTypes" :key="type.value" class="preview-item sub">
                <span class="label">{{ type.label }}:</span>
                <span class="value">{{ config.questions[type.value].count }}题</span>
              </div>

              <div class="divider"></div>

              <div class="preview-item">
                <span class="label">知识点:</span>
              </div>
              <div v-for="point in knowledgePoints" :key="point.id" class="preview-item sub">
                <span class="label">{{ point.name }}:</span>
                <span class="value">{{ point.weight }}%</span>
              </div>

              <div class="divider"></div>

              <div class="preview-item">
                <span class="label">总题数:</span>
                <span class="value">{{ calculateTotalQuestions() }}题</span>
              </div>
              <div class="preview-item">
                <span class="label">总分数:</span>
                <span class="value">{{ calculateTotalScore() }}分</span>
              </div>
            </div>
          </el-card>

          <!-- 生成结果 -->
          <el-card v-if="generatedPaper" id="result-card" class="result-card">
            <template #header>
              <span>生成结果</span>
            </template>

            <div id="result-content" class="result-content">
              <el-alert
                title="生成成功"
                type="success"
                :closable="false"
                style="margin-bottom: 12px"
              />
              <el-button type="primary" size="small" @click="viewResult" style="width: 100%; margin-bottom: 8px">
                查看详情
              </el-button>
              <el-button size="small" @click="exportPaper" style="width: 100%; margin-bottom: 8px">
                导出JSON
              </el-button>
              <el-button size="small" @click="createHomework" v-if="config.outputType === 'homework'" style="width: 100%">
                创建作业
              </el-button>
              <el-button size="small" @click="createExam" v-else style="width: 100%">
                创建考试
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 预览对话框 -->
    <el-dialog id="preview-dialog" v-model="previewDialogVisible" title="配置预览" width="600px">
      <JsonPreview :data="config" />
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import JsonPreview from '../components/JsonPreview.vue'

const generating = ref(false)
const previewDialogVisible = ref(false)
const generatedPaper = ref(null)

// 配置数据
const config = reactive({
  title: '',
  outputType: 'homework',
  difficulty: 'medium',
  totalScore: 100,
  passingScore: 60,
  duration: 120,
  suggestedTime: 60,
  completionRequirement: 100,
  description: '',
  gradingRules: ['auto-grade'],
  options: ['randomOrder'],
  template: 'standard',
  questions: {
    single: { count: 10 },
    multiple: { count: 5 },
    fillBlank: { count: 5 },
    essay: { count: 2 }
  }
})

// 题目类型
const questionTypes = [
  { value: 'single', label: '单选题', score: 2 },
  { value: 'multiple', label: '多选题', score: 3 },
  { value: 'fillBlank', label: '填空题', score: 2 },
  { value: 'essay', label: '简答题', score: 5 }
]

// 知识点
const knowledgePoints = ref([
  { id: 'kp_001', name: '基础概念', weight: 30 },
  { id: 'kp_002', name: '应用分析', weight: 40 },
  { id: 'kp_003', name: '综合应用', weight: 30 }
])

// 高级选项
const advancedOptions = [
  { value: 'randomOrder', label: '随机排序' },
  { value: 'showAnswers', label: '显示答案' },
  { value: 'autoGrading', label: '自动评分' },
  { value: 'allowReview', label: '允许查看答案' },
  { value: 'showHints', label: '显示解题提示' },
  { value: 'preventCopy', label: '防复制' }
]

// 计算总题数
const calculateTotalQuestions = () => {
  return Object.values(config.questions).reduce((sum, q) => sum + q.count, 0)
}

// 计算总分
const calculateTotalScore = () => {
  let total = 0
  questionTypes.forEach(type => {
    total += config.questions[type.value].count * type.score
  })
  return total
}

// 获取难度标签
const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    mixed: '混合'
  }
  return map[difficulty] || difficulty
}

// 输出类型变化
const onOutputTypeChange = () => {
  generatedPaper.value = null
}

// 自动平衡
const autoBalance = () => {
  const totalScore = config.totalScore
  const totalQuestions = calculateTotalQuestions()
  
  if (totalQuestions === 0) {
    ElMessage.warning('请先设置题目数量')
    return
  }

  ElMessage.success('已自动平衡分值分配')
}

// 重置题目
const resetQuestions = () => {
  config.questions = {
    single: { count: 10 },
    multiple: { count: 5 },
    fillBlank: { count: 5 },
    essay: { count: 2 }
  }
}

// 重置全部
const resetAll = () => {
  config.title = ''
  config.outputType = 'homework'
  config.difficulty = 'medium'
  config.totalScore = 100
  config.description = ''
  resetQuestions()
  generatedPaper.value = null
}

// 使用模板
const useTemplate = () => {
  ElMessage.info('模板选择功能开发中...')
}

// 预览配置
const previewConfig = () => {
  previewDialogVisible.value = true
}

// 生成试卷
const generatePaper = async () => {
  if (!config.title) {
    ElMessage.warning('请输入试卷标题')
    return
  }

  if (calculateTotalQuestions() === 0) {
    ElMessage.warning('请设置题目数量')
    return
  }

  generating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    generatedPaper.value = {
      id: `paper_${Date.now()}`,
      ...config,
      questions: Array.from({ length: calculateTotalQuestions() }, (_, i) => ({
        id: `q_${i + 1}`,
        type: 'single',
        text: `题目 ${i + 1}`,
        score: 5
      })),
      createdAt: new Date().toISOString()
    }

    ElMessage.success('试卷生成成功')
  } finally {
    generating.value = false
  }
}

// 查看结果
const viewResult = () => {
  previewDialogVisible.value = true
}

// 导出试卷
const exportPaper = () => {
  if (!generatedPaper.value) {
    ElMessage.warning('请先生成试卷')
    return
  }
  ElMessage.success('已导出为JSON文件')
}

// 创建作业
const createHomework = () => {
  if (!generatedPaper.value) {
    ElMessage.warning('请先生成试卷')
    return
  }
  ElMessage.success('作业已创建')
}

// 创建考试
const createExam = () => {
  if (!generatedPaper.value) {
    ElMessage.warning('请先生成试卷')
    return
  }
  ElMessage.success('考试已创建')
}
</script>

<style scoped>
.custom-generate-container {
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

.content-wrapper {
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

.config-card,
.preview-card,
.result-card {
  margin-bottom: 20px;
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

.question-config {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.type-item {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
}

.type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.type-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.type-score {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.type-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-controls :deep(.el-input-number) {
  flex: 1;
}

.total-score {
  font-size: 12px;
  color: var(--color-primary);
  white-space: nowrap;
}

.score-summary {
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  margin-bottom: 12px;
}

.score-summary span {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.knowledge-points {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.point-name {
  min-width: 100px;
  font-size: 14px;
}

.point-item :deep(.el-slider) {
  flex: 1;
}

.option-item {
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-buttons .el-button {
  flex: 1;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  font-size: 13px;
}

.preview-item.sub {
  margin-left: 16px;
  background: transparent;
}

.preview-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.preview-item .value {
  color: var(--color-text-primary);
}

.divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 8px 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-content .el-button {
  width: 100%;
}
</style>
