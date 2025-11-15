<template>
  <div class="test-page">
    <div class="page-header">
      <h2>功能测试页面</h2>
      <p>测试AI助教智能作业生成系统的各项功能</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>路由测试</span>
          </template>
          <div class="test-section">
            <h4>页面导航测试</h4>
            <div class="button-group">
              <el-button type="primary" @click="navigateTo('/ai/assistant')">
                导游页面
              </el-button>
              <el-button type="success" @click="navigateTo('/ai/assistant/upload-generate')">
                上传并生成
              </el-button>
              <el-button type="warning" @click="navigateTo('/ai/assistant/error-based')">
                基于错题生成
              </el-button>
              <el-button type="info" @click="navigateTo('/ai/assistant/custom-generate')">
                自定义生成
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>组件测试</span>
          </template>
          <div class="test-section">
            <h4>公共组件测试</h4>
            <div class="button-group">
              <el-button @click="testQuestionEditor">
                题目编辑器
              </el-button>
              <el-button @click="testJsonPreview">
                JSON预览器
              </el-button>
              <el-button @click="testSettingsPanel">
                设置面板
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>数据处理测试</span>
          </template>
          <div class="test-section">
            <h4>JSON处理功能</h4>
            <div class="button-group">
              <el-button @click="testJsonValidation">
                JSON验证
              </el-button>
              <el-button @click="testHomeworkGeneration">
                生成作业
              </el-button>
              <el-button @click="testExamGeneration">
                生成考试
              </el-button>
            </div>
            <div v-if="testResult" class="test-result">
              <h5>测试结果:</h5>
              <pre>{{ testResult }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <span>类型系统测试</span>
          </template>
          <div class="test-section">
            <h4>TypeScript类型检查</h4>
            <div class="button-group">
              <el-button @click="testTypeValidation">
                类型验证
              </el-button>
              <el-button @click="testDataConversion">
                数据转换
              </el-button>
            </div>
            <div v-if="typeTestResult" class="test-result">
              <h5>类型测试结果:</h5>
              <pre>{{ typeTestResult }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 组件测试对话框 -->
    <el-dialog v-model="showComponentDialog" :title="componentDialogTitle" width="80%">
      <component :is="testComponent" v-if="testComponent" />
    </el-dialog>

    <!-- 测试统计 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>测试统计</span>
      </template>
      <div class="test-stats">
        <div class="stat-item">
          <span class="stat-label">路由测试:</span>
          <el-tag :type="testStats.routing ? 'success' : 'danger'">
            {{ testStats.routing ? '通过' : '失败' }}
          </el-tag>
        </div>
        <div class="stat-item">
          <span class="stat-label">组件测试:</span>
          <el-tag :type="testStats.components ? 'success' : 'danger'">
            {{ testStats.components ? '通过' : '失败' }}
          </el-tag>
        </div>
        <div class="stat-item">
          <span class="stat-label">数据处理:</span>
          <el-tag :type="testStats.dataProcessing ? 'success' : 'danger'">
            {{ testStats.dataProcessing ? '通过' : '失败' }}
          </el-tag>
        </div>
        <div class="stat-item">
          <span class="stat-label">类型系统:</span>
          <el-tag :type="testStats.typeSystem ? 'success' : 'danger'">
            {{ testStats.typeSystem ? '通过' : '失败' }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import QuestionEditor from '../components/QuestionEditor.vue'
import JsonPreview from '../components/JsonPreview.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import { JsonHandler } from '../utils/jsonHandler'
import { Validator } from '../utils/validator'
import type { GenerateConfig, Homework, Exam } from '../types'

const router = useRouter()

// 响应式数据
const showComponentDialog = ref(false)
const componentDialogTitle = ref('')
const testComponent = ref(null)
const testResult = ref('')
const typeTestResult = ref('')

// 测试统计
const testStats = reactive({
  routing: false,
  components: false,
  dataProcessing: false,
  typeSystem: false
})

// 导航测试
const navigateTo = (path: string) => {
  try {
    router.push(path)
    testStats.routing = true
    ElMessage.success(`导航到 ${path} 成功`)
  } catch (error) {
    ElMessage.error(`导航失败: ${error.message}`)
  }
}

// 组件测试
const testQuestionEditor = () => {
  componentDialogTitle.value = '题目编辑器测试'
  testComponent.value = QuestionEditor
  showComponentDialog.value = true
  testStats.components = true
}

const testJsonPreview = () => {
  componentDialogTitle.value = 'JSON预览器测试'
  testComponent.value = JsonPreview
  showComponentDialog.value = true
  testStats.components = true
}

const testSettingsPanel = () => {
  componentDialogTitle.value = '设置面板测试'
  testComponent.value = SettingsPanel
  showComponentDialog.value = true
  testStats.components = true
}

// 数据处理测试
const testJsonValidation = () => {
  try {
    const testData = {
      id: 'test_001',
      type: 'homework',
      title: '测试作业',
      questions: []
    }

    const result = JsonHandler.validateHomework(testData)
    testResult.value = `JSON验证结果:\n${JSON.stringify(result, null, 2)}`
    testStats.dataProcessing = true
    ElMessage.success('JSON验证测试完成')
  } catch (error) {
    testResult.value = `JSON验证失败: ${error.message}`
    ElMessage.error('JSON验证测试失败')
  }
}

const testHomeworkGeneration = () => {
  try {
    const config: GenerateConfig = {
      title: '测试作业',
      type: 'homework',
      difficulty: 'medium',
      totalScore: 100,
      questions: {
        singleChoice: { count: 5, score: 5 },
        multipleChoice: { count: 3, score: 10 },
        fillBlank: { count: 2, score: 5 },
        essay: { count: 1, score: 15 }
      },
      knowledgePoints: {
        main: ['JavaScript'],
        secondary: []
      },
      knowledgeWeights: {},
      advanced: {
        randomOrder: false,
        showAnswers: true,
        enableTimeLimit: false,
        timeLimit: 60,
        passingScore: 60,
        gradingRule: 'standard',
        options: []
      }
    }

    const homework = JsonHandler.generateHomework(config)
    testResult.value = `生成的作业JSON:\n${JSON.stringify(homework, null, 2)}`
    testStats.dataProcessing = true
    ElMessage.success('作业生成测试完成')
  } catch (error) {
    testResult.value = `作业生成失败: ${error.message}`
    ElMessage.error('作业生成测试失败')
  }
}

const testExamGeneration = () => {
  try {
    const config: GenerateConfig = {
      title: '测试考试',
      type: 'exam',
      difficulty: 'medium',
      totalScore: 100,
      questions: {
        singleChoice: { count: 10, score: 3 },
        multipleChoice: { count: 5, score: 6 },
        fillBlank: { count: 5, score: 4 },
        essay: { count: 2, score: 15 }
      },
      knowledgePoints: {
        main: ['数据结构'],
        secondary: ['算法']
      },
      knowledgeWeights: {},
      advanced: {
        randomOrder: true,
        showAnswers: false,
        enableTimeLimit: true,
        timeLimit: 90,
        passingScore: 60,
        gradingRule: 'standard',
        options: ['randomOrder']
      }
    }

    const exam = JsonHandler.generateExam(config)
    testResult.value = `生成的考试JSON:\n${JSON.stringify(exam, null, 2)}`
    testStats.dataProcessing = true
    ElMessage.success('考试生成测试完成')
  } catch (error) {
    testResult.value = `考试生成失败: ${error.message}`
    ElMessage.error('考试生成测试失败')
  }
}

// 类型系统测试
const testTypeValidation = () => {
  try {
    const config: GenerateConfig = {
      title: '类型测试',
      type: 'homework',
      difficulty: 'medium',
      totalScore: 100,
      questions: {
        singleChoice: { count: 5, score: 5 },
        multipleChoice: { count: 3, score: 10 },
        fillBlank: { count: 2, score: 5 },
        essay: { count: 1, score: 15 }
      },
      knowledgePoints: {
        main: ['测试'],
        secondary: []
      },
      knowledgeWeights: {},
      advanced: {
        randomOrder: false,
        showAnswers: true,
        enableTimeLimit: false,
        timeLimit: 60,
        passingScore: 60,
        gradingRule: 'standard',
        options: []
      }
    }

    const result = Validator.validatePaperConfig(config)
    typeTestResult.value = `类型验证结果:\n${JSON.stringify(result, null, 2)}`
    testStats.typeSystem = true
    ElMessage.success('类型验证测试完成')
  } catch (error) {
    typeTestResult.value = `类型验证失败: ${error.message}`
    ElMessage.error('类型验证测试失败')
  }
}

const testDataConversion = () => {
  try {
    const testData = {
      id: 'convert_test',
      title: '转换测试',
      score: 100,
      difficulty: 'medium'
    }

    // 测试深拷贝
    const cloned = JsonHandler.deepClone(testData)

    // 测试格式化
    const formatted = JsonHandler.formatJson(testData)

    // 测试压缩
    const minified = JsonHandler.minifyJson(testData)

    typeTestResult.value = `数据转换测试结果:\n` +
      `原始数据: ${JSON.stringify(testData)}\n` +
      `克隆数据: ${JSON.stringify(cloned)}\n` +
      `格式化长度: ${formatted.length}\n` +
      `压缩长度: ${minified.length}\n` +
      `深拷贝相等: ${JSON.stringify(testData) === JSON.stringify(cloned)}`

    testStats.typeSystem = true
    ElMessage.success('数据转换测试完成')
  } catch (error) {
    typeTestResult.value = `数据转换失败: ${error.message}`
    ElMessage.error('数据转换测试失败')
  }
}

// 运行所有测试
const runAllTests = () => {
  ElMessage.info('开始运行所有测试...')

  testJsonValidation()
  testHomeworkGeneration()
  testTypeValidation()
  testDataConversion()

  setTimeout(() => {
    const allPassed = Object.values(testStats).every(stat => stat)
    if (allPassed) {
      ElMessage.success('所有测试通过！系统功能正常')
    } else {
      ElMessage.warning('部分测试失败，请检查相关功能')
    }
  }, 1000)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/test/index.vue`);
  });

</script>

<style scoped>
.test-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 140px);
}

.page-header {
  text-align: center;
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

.test-section {
  margin-bottom: 20px;
}

.test-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.test-result {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.test-result h5 {
  margin: 0 0 8px 0;
  color: #303133;
}

.test-result pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.test-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #606266;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-page {
    padding: 12px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .el-button {
    width: 100%;
  }

  .test-stats {
    grid-template-columns: 1fr;
  }
}
</style>