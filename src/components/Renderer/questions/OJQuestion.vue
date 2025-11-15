<template>
  <div class="oj-question">
    <!-- 题目头部信息 -->
    <div class="question-header">
      <div class="question-title">
        <h3>{{ question.title }}</h3>
        <div class="question-meta">
          <el-tag :type="difficultyTagType" size="small">{{ difficultyText }}</el-tag>
          <el-tag type="info" size="small">OJ题</el-tag>
          <span class="score">{{ question.score }}分</span>
        </div>
      </div>
    </div>

    <!-- 题目描述 -->
    <div class="question-content">
      <div class="question-description" v-html="formattedQuestionText"></div>
    </div>

    <!-- 输入输出格式 -->
    <div class="io-formats">
      <div class="format-section" v-if="question.inputFormat">
        <h4>输入格式</h4>
        <div class="format-content" v-html="formattedInputFormat"></div>
      </div>

      <div class="format-section" v-if="question.outputFormat">
        <h4>输出格式</h4>
        <div class="format-content" v-html="formattedOutputFormat"></div>
      </div>
    </div>

    <!-- 样例输入输出 -->
    <div class="sample-io" v-if="question.sampleInput || question.sampleOutput">
      <h4>样例</h4>

      <div class="sample-section" v-if="question.sampleInput">
        <div class="sample-label">输入</div>
        <pre class="sample-content">{{ question.sampleInput }}</pre>
      </div>

      <div class="sample-section" v-if="question.sampleOutput">
        <div class="sample-label">输出</div>
        <pre class="sample-content">{{ question.sampleOutput }}</pre>
      </div>
    </div>

    <!-- 提示 -->
    <div class="hint-section" v-if="question.hint">
      <h4>提示</h4>
      <div class="hint-content" v-html="formattedHint"></div>
    </div>

    <!-- 限制条件 -->
    <div class="limits-section" v-if="question.timeLimit || question.memoryLimit">
      <h4>限制条件</h4>
      <div class="limits-content">
        <span v-if="question.timeLimit" class="limit-item">
          时间限制: {{ question.timeLimit }}ms
        </span>
        <span v-if="question.memoryLimit" class="limit-item">
          内存限制: {{ question.memoryLimit }}MB
        </span>
      </div>
    </div>

    <!-- 起始代码 -->
    <div class="starter-code-section" v-if="question.starterCode">
      <h4>起始代码</h4>
      <div class="code-editor">
        <pre><code class="language-python">{{ question.starterCode }}</code></pre>
      </div>
    </div>

    <!-- 代码编辑器 (答题模式) -->
    <div class="answer-section" v-if="showAnswer">
      <h4>请编写你的代码</h4>

      <!-- 语言选择 -->
      <div class="language-selector">
        <el-select v-model="selectedLanguage" placeholder="选择编程语言">
          <el-option
            v-for="lang in supportedLanguages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>
      </div>

      <!-- 代码编辑区域 -->
      <div class="code-editor">
        <el-input
          v-model="userCode"
          type="textarea"
          :rows="15"
          placeholder="请在此处编写你的代码..."
          class="code-textarea"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="runCode" :loading="isRunning">
          <el-icon><VideoPlay /></el-icon>
          运行代码
        </el-button>
        <el-button type="success" @click="submitCode" :loading="isSubmitting">
          <el-icon><Upload /></el-icon>
          提交答案
        </el-button>
        <el-button @click="resetCode">
          <el-icon><Refresh /></el-icon>
          重置代码
        </el-button>
      </div>

      <!-- 运行结果 -->
      <div class="run-result" v-if="runResult">
        <h4>运行结果</h4>
        <div class="result-content" :class="resultClass">
          <pre>{{ runResult }}</pre>
        </div>
      </div>
    </div>

    <!-- 题目解析 -->
    <div class="explanation-section" v-if="showExplanation && question.explanation">
      <h4>题目解析</h4>
      <div class="explanation-content" v-html="formattedExplanation"></div>
    </div>

    <!-- 参考答案 (仅管理员可见) -->
    <div class="solution-section" v-if="showSolution && isAdmin">
      <h4>参考答案</h4>
      <div class="solution-content">
        <div v-if="question.solution?.approach" class="approach">
          <h5>解题思路</h5>
          <p>{{ question.solution.approach }}</p>
        </div>

        <div v-if="question.solution?.code" class="solution-code">
          <h5>参考代码</h5>
          <pre><code class="language-python">{{ question.solution.code }}</code></pre>
        </div>

        <div v-if="question.solution?.complexity" class="complexity">
          <h5>复杂度分析</h5>
          <p>{{ question.solution.complexity }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { VideoPlay, Upload, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  showAnswer: {
    type: Boolean,
    default: false
  },
  showExplanation: {
    type: Boolean,
    default: false
  },
  showSolution: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'run'])

// 响应式数据
const selectedLanguage = ref('python')
const userCode = ref('')
const isRunning = ref(false)
const isSubmitting = ref(false)
const runResult = ref('')

// 支持的编程语言
const supportedLanguages = [
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'JavaScript', value: 'javascript' }
]

// 计算属性
const difficultyTagType = computed(() => {
  const difficultyMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return difficultyMap[props.question.difficulty] || 'info'
})

const difficultyText = computed(() => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[props.question.difficulty] || '未知'
})

const resultClass = computed(() => {
  if (!runResult.value) return ''
  if (runResult.value.includes('通过') || runResult.value.includes('正确')) {
    return 'success'
  }
  if (runResult.value.includes('错误') || runResult.value.includes('失败')) {
    return 'error'
  }
  return 'info'
})

// 格式化文本内容
const formattedQuestionText = computed(() => {
  return formatText(props.question.questionText)
})

const formattedInputFormat = computed(() => {
  return formatText(props.question.inputFormat)
})

const formattedOutputFormat = computed(() => {
  return formatText(props.question.outputFormat)
})

const formattedHint = computed(() => {
  return formatText(props.question.hint)
})

const formattedExplanation = computed(() => {
  return formatText(props.question.explanation)
})

// 方法
const formatText = (text) => {
  if (!text) return ''
  return text
    .replace(/\n/g, '<br>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

// 运行代码
const runCode = async () => {
  if (!userCode.value.trim()) {
    runResult.value = '请先编写代码'
    return
  }

  isRunning.value = true
  try {
    const result = await emit('run', {
      code: userCode.value,
      language: selectedLanguage.value,
      testCases: props.question.testCases || []
    })
    runResult.value = result || '代码运行完成'
  } catch (error) {
    runResult.value = `运行错误: ${error.message}`
  } finally {
    isRunning.value = false
  }
}

// 提交代码
const submitCode = async () => {
  if (!userCode.value.trim()) {
    runResult.value = '请先编写代码'
    return
  }

  isSubmitting.value = true
  try {
    await emit('submit', {
      code: userCode.value,
      language: selectedLanguage.value
    })
  } catch (error) {
    runResult.value = `提交失败: ${error.message}`
  } finally {
    isSubmitting.value = false
  }
}

// 重置代码
const resetCode = () => {
  userCode.value = props.question.starterCode || ''
  runResult.value = ''
}

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Renderer/questions/OJQuestion.vue`);
  // 如果有起始代码，则填充到编辑器
  if (props.question.starterCode) {
    userCode.value = props.question.starterCode
  }
})
</script>

<style lang="scss" scoped>
.oj-question {
  .question-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;

    .question-title {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }

      .question-meta {
        display: flex;
        align-items: center;
        gap: 10px;

        .score {
          font-weight: 600;
          color: #f56c6c;
        }
      }
    }
  }

  .question-content {
    margin-bottom: 20px;

    .question-description {
      line-height: 1.6;
      color: #303133;
    }
  }

  .io-formats {
    margin-bottom: 20px;

    .format-section {
      margin-bottom: 15px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #606266;
      }

      .format-content {
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #409eff;
        line-height: 1.5;
      }
    }
  }

  .sample-io {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .sample-section {
      margin-bottom: 12px;

      .sample-label {
        font-weight: 600;
        color: #409eff;
        margin-bottom: 6px;
      }

      .sample-content {
        padding: 12px;
        background-color: #f4f4f5;
        border-radius: 6px;
        border: 1px solid #dcdfe6;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }

  .hint-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .hint-content {
      padding: 12px;
      background-color: #f0f9ff;
      border-radius: 6px;
      border-left: 4px solid #67c23a;
      line-height: 1.5;
    }
  }

  .limits-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .limits-content {
      display: flex;
      gap: 20px;

      .limit-item {
        padding: 6px 12px;
        background-color: #f4f4f5;
        border-radius: 4px;
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .starter-code-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .code-editor {
      pre {
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e9ecef;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        margin: 0;
        overflow-x: auto;
      }
    }
  }

  .answer-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;

    h4 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .language-selector {
      margin-bottom: 15px;
    }

    .code-editor {
      margin-bottom: 20px;

      :deep(.code-textarea) {
        .el-textarea__inner {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.4;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .run-result {
      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: #606266;
      }

      .result-content {
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #dcdfe6;
        font-family: 'Courier New', monospace;
        font-size: 13px;

        &.success {
          background-color: #f0f9ff;
          border-color: #67c23a;
          color: #67c23a;
        }

        &.error {
          background-color: #fef0f0;
          border-color: #f56c6c;
          color: #f56c6c;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }

  .explanation-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;

    h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .explanation-content {
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 6px;
      border-left: 4px solid #e6a23c;
      line-height: 1.5;
    }
  }

  .solution-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;

    h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
    }

    .solution-content {
      .approach,
      .complexity {
        margin-bottom: 15px;

        h5 {
          margin: 0 0 6px 0;
          font-size: 13px;
          font-weight: 600;
          color: #606266;
        }

        p {
          margin: 0;
          line-height: 1.5;
          color: #303133;
        }
      }

      .solution-code {
        pre {
          padding: 16px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          overflow-x: auto;
        }
      }
    }
  }
}
</style>