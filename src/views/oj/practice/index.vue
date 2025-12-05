<template>
  <div class="practice-container">
    <!-- AI助教组件 -->
    <chat-interface
      :context="'coding'"
      :problem-id="currentProblem.id"
    />
    <!-- 题目信息栏 -->
    <div class="problem-header">
      <div class="problem-info">
        <h2>{{ currentProblem.id }}. {{ currentProblem.title }}</h2>
        <div class="problem-meta">
          <el-tag :type="getDifficultyTagType(currentProblem.difficulty)">
            {{ getDifficultyLabel(currentProblem.difficulty) }}
          </el-tag>
          <el-tag type="info">{{ getCategoryLabel(currentProblem.category) }}</el-tag>
          <span class="meta-item">通过率: {{ currentProblem.acceptanceRate }}%</span>
          <span class="meta-item">时间限制: {{ currentProblem.timeLimit }}ms</span>
          <span class="meta-item">内存限制: {{ currentProblem.memoryLimit }}MB</span>
        </div>
      </div>
      <div class="problem-actions">
        <el-button @click="goBack" icon="ArrowLeft">返回题目列表</el-button>
        <el-button type="primary" @click="showHint = !showHint">
          AI助教提示
        </el-button>
      </div>
    </div>

    <!-- AI助教提示面板 -->
    <el-collapse-transition>
      <div v-if="showHint" class="ai-assistant-panel">
        <div class="assistant-header">
          <h3>🤖 AI助教提示</h3>
          <el-button text @click="showHint = false" icon="Close"></el-button>
        </div>
        <div class="assistant-content">
          <div class="assistant-tips">
            <div class="tip-item">
              <h4>💡 解题思路</h4>
              <p>{{ aiTips.approach }}</p>
            </div>
            <div class="tip-item">
              <h4>📝 关键点</h4>
              <ul>
                <li v-for="point in aiTips.keyPoints" :key="point">{{ point }}</li>
              </ul>
            </div>
            <div class="tip-item">
              <h4>⚠️ 注意事项</h4>
              <p>{{ aiTips.notes }}</p>
            </div>
          </div>
          <div class="assistant-actions">
            <el-button type="primary" @click="getMoreHelp" :disabled="!isVip">
              获取更多帮助
            </el-button>
            <span v-if="!isVip" class="vip-tip">VIP用户专享</span>
          </div>
        </div>
      </div>
    </el-collapse-transition>

    <div class="practice-main">
      <!-- 左侧题目内容 -->
      <div class="problem-section">
        <el-tabs v-model="activeTab" class="problem-tabs">
          <el-tab-pane label="题目描述" name="description">
            <div class="problem-content">
              <div class="content-section">
                <h3>题目描述</h3>
                <div class="content-text" v-html="currentProblem.description"></div>
              </div>

              <div class="content-section">
                <h3>输入格式</h3>
                <div class="content-text" v-html="currentProblem.inputFormat"></div>
              </div>

              <div class="content-section">
                <h3>输出格式</h3>
                <div class="content-text" v-html="currentProblem.outputFormat"></div>
              </div>

              <div class="content-section">
                <h3>样例</h3>
                <div class="sample-section">
                  <div class="sample-item">
                    <h4>输入</h4>
                    <pre class="sample-content">{{ currentProblem.sampleInput }}</pre>
                  </div>
                  <div class="sample-item">
                    <h4>输出</h4>
                    <pre class="sample-content">{{ currentProblem.sampleOutput }}</pre>
                  </div>
                </div>
              </div>

              <div class="content-section" v-if="currentProblem.hint">
                <h3>提示</h3>
                <div class="content-text" v-html="currentProblem.hint"></div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="提交记录" name="submissions">
            <div class="submissions-list">
              <div v-if="submissions.length === 0" class="empty-submissions">
                <el-empty description="暂无提交记录"></el-empty>
              </div>
              <div v-else class="submission-item" v-for="submission in submissions" :key="submission.id">
                <div class="submission-info">
                  <span class="status" :class="getStatusClass(submission.status)">
                    {{ getStatusText(submission.status) }}
                  </span>
                  <span class="time">{{ submission.submitTime }}</span>
                  <span class="language">{{ submission.language }}</span>
                </div>
                <div class="submission-detail">
                  <span v-if="submission.status === 'accepted'">
                    执行用时: {{ submission.time }}ms, 内存消耗: {{ submission.memory }}MB
                  </span>
                  <span v-else class="error-msg">{{ submission.errorMessage }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="题解" name="solution">
            <div class="solution-section">
              <el-alert
                title="题解查看权限"
                :description="isVip ? '您可以查看完整的题解和解析' : 'VIP用户可以查看完整题解'"
                :type="isVip ? 'success' : 'warning'"
                show-icon
              />
              <div v-if="isVip" class="solution-content">
                <h3>解题思路</h3>
                <p>{{ currentProblem.solution?.approach }}</p>

                <h3>完整代码</h3>
                <pre class="code-content">{{ currentProblem.solution?.code }}</pre>

                <h3>复杂度分析</h3>
                <p>{{ currentProblem.solution?.complexity }}</p>
              </div>
              <div v-else class="vip-upgrade">
                <el-button type="primary" @click="upgradeVip">升级VIP查看完整题解</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧代码编辑器 -->
      <div class="code-section">
        <div class="code-header">
          <div class="language-selector">
            <el-select v-model="selectedLanguage" placeholder="选择语言" size="small">
              <el-option label="C++" value="cpp"></el-option>
              <el-option label="Java" value="java"></el-option>
              <el-option label="Python" value="python"></el-option>
              <el-option label="JavaScript" value="javascript"></el-option>
            </el-select>
          </div>
          <div class="code-actions">
            <el-button size="small" @click="runCode" :loading="running">
              运行代码
            </el-button>
            <el-button type="primary" size="small" @click="submitCode" :loading="submitting">
              提交
            </el-button>
          </div>
        </div>

        <div class="code-editor">
          <textarea
            v-model="codeContent"
            class="code-textarea"
            :placeholder="`请用 ${getLanguageName(selectedLanguage)} 编写代码...`"
          ></textarea>
        </div>

        <!-- 运行结果 -->
        <div v-if="runResult" class="run-result">
          <div class="result-header">
            <h4>运行结果</h4>
            <el-tag :type="runResult.status === 'success' ? 'success' : 'danger'">
              {{ runResult.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </div>
          <div class="result-content">
            <div v-if="runResult.status === 'success'">
              <p><strong>输出:</strong></p>
              <pre class="result-output">{{ runResult.output }}</pre>
              <p><strong>执行用时:</strong> {{ runResult.time }}ms</p>
              <p><strong>内存消耗:</strong> {{ runResult.memory }}MB</p>
            </div>
            <div v-else>
              <p><strong>错误信息:</strong></p>
              <pre class="result-error">{{ runResult.error }}</pre>
            </div>
          </div>
        </div>

        <!-- 提交结果 -->
        <div v-if="submitResult" class="submit-result">
          <div class="result-header">
            <h4>提交结果</h4>
            <el-tag :type="getSubmitResultType(submitResult.status)">
              {{ getSubmitResultText(submitResult.status) }}
            </el-tag>
          </div>
          <div class="result-content">
            <div class="test-cases">
              <div
                class="test-case"
                v-for="(testCase, index) in submitResult.testCases"
                :key="index"
              >
                <span class="case-number">测试用例 {{ index + 1 }}</span>
                <el-tag size="small" :type="testCase.passed ? 'success' : 'danger'">
                  {{ testCase.passed ? '通过' : '失败' }}
                </el-tag>
                <span class="case-time">{{ testCase.time }}ms</span>
              </div>
            </div>
            <div v-if="submitResult.status === 'accepted'" class="success-info">
              <p>🎉 恭喜！您的代码通过了所有测试用例！</p>
              <p>执行用时: {{ submitResult.totalTime }}ms</p>
              <p>内存消耗: {{ submitResult.totalMemory }}MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import ChatInterface from '@/components/ai/ChatInterface.vue'

  const route = useRoute()
  const router = useRouter()

  // 响应式数据
  const currentProblem = ref({
    id: 1001,
    title: '两数之和',
    difficulty: 'easy',
    category: 'array',
    acceptanceRate: 52.8,
    timeLimit: 1000,
    memoryLimit: 256,
    description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
    inputFormat: '第一行输入数组长度 n，第二行输入 n 个整数，第三行输入目标值 target。',
    outputFormat: '输出两个整数的下标，用空格分隔。',
    sampleInput: '4\n2 7 11 15\n9',
    sampleOutput: '0 1',
    hint: '可以使用哈希表来存储已经遍历过的数字及其下标。',
    solution: {
      approach: '使用哈希表存储数字和下标的映射，当找到 target - current 存在于哈希表中时，即为答案。',
      code: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
      complexity: '时间复杂度 O(n)，空间复杂度 O(n)'
    }
  })

  const activeTab = ref('description')
  const selectedLanguage = ref('python')
  const codeContent = ref(`def two_sum(nums, target):
    # 请编写您的代码
    pass

# 测试代码
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(result)`)

  const showHint = ref(false)
  const running = ref(false)
  const submitting = ref(false)
  const runResult = ref(null)
  const submitResult = ref(null)
  const submissions = ref([])
  const isVip = ref(true) // 模拟VIP状态

  // AI助教提示
  const aiTips = ref({
    approach: '这是一道经典的"两数之和"问题。可以使用哈希表来优化查找效率，避免暴力枚举的O(n²)时间复杂度。',
    keyPoints: [
      '创建一个哈希表存储数字和对应下标',
      '遍历数组，对于每个数字，计算 target - num',
      '检查差值是否存在于哈希表中',
      '如果存在则返回两个下标，如果不存在则将当前数字存入哈希表'
    ],
    notes: '注意题目要求返回的是下标而不是数字本身，且同一个元素不能使用两次。'
  })

  // 页面方法
  const goBack = () => {
    router.push('/oj/problems')
  }

  const getMoreHelp = () => {
    ElMessage.success('AI助教正在为您生成更详细的解题指导...')
  }

  const upgradeVip = () => {
    ElMessage.info('跳转到VIP升级页面...')
  }

  const runCode = async () => {
    if (!codeContent.value.trim()) {
      ElMessage.warning('请先编写代码')
      return
    }

    running.value = true
    runResult.value = null

    // 模拟运行代码
    setTimeout(() => {
      runResult.value = {
        status: 'success',
        output: '[0, 1]',
        time: 45,
        memory: 12.5
      }
      running.value = false
      ElMessage.success('代码运行完成')
    }, 2000)
  }

  const submitCode = async () => {
    if (!codeContent.value.trim()) {
      ElMessage.warning('请先编写代码')
      return
    }

    submitting.value = true
    submitResult.value = null

    // 模拟提交代码
    setTimeout(() => {
      const mockResult = {
        status: Math.random() > 0.3 ? 'accepted' : 'wrong_answer',
        testCases: [
          { passed: true, time: 35 },
          { passed: true, time: 42 },
          { passed: true, time: 38 },
          { passed: false, time: 45 }
        ],
        totalTime: 160,
        totalMemory: 14.2
      }

      submitResult.value = mockResult
      submitting.value = false

      // 添加到提交记录
      submissions.value.unshift({
        id: Date.now(),
        status: mockResult.status,
        submitTime: new Date().toLocaleString(),
        language: getLanguageName(selectedLanguage.value),
        time: mockResult.totalTime,
        memory: mockResult.totalMemory,
        errorMessage: mockResult.status === 'accepted' ? '' : 'Wrong Answer'
      })

      if (mockResult.status === 'accepted') {
        ElMessage.success('🎉 恭喜通过！')
      } else {
        ElMessage.error('答案错误，请检查代码')
      }
    }, 3000)
  }

  // 工具方法
  const getDifficultyTagType = (difficulty) => {
    const typeMap = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger'
    }
    return typeMap[difficulty] || ''
  }

  const getDifficultyLabel = (difficulty) => {
    const typeMap = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return typeMap[difficulty] || difficulty
  }

  const getCategoryLabel = (category) => {
    const item = [
      { value: 'array', label: '数组' },
      { value: 'string', label: '字符串' },
      { value: 'tree', label: '树' },
      { value: 'dp', label: '动态规划' }
    ].find(item => item.value === category)
    return item ? item.label : category
  }

  const getLanguageName = (lang) => {
    const langMap = {
      cpp: 'C++',
      java: 'Java',
      python: 'Python',
      javascript: 'JavaScript'
    }
    return langMap[lang] || lang
  }

  const getStatusClass = (status) => {
    const classMap = {
      accepted: 'status-accepted',
      wrong_answer: 'status-wrong',
      time_limit: 'status-timeout',
      memory_limit: 'status-memory',
      runtime_error: 'status-error'
    }
    return classMap[status] || ''
  }

  const getStatusText = (status) => {
    const textMap = {
      accepted: '通过',
      wrong_answer: '答案错误',
      time_limit: '超时',
      memory_limit: '内存超限',
      runtime_error: '运行错误'
    }
    return textMap[status] || status
  }

  const getSubmitResultType = (status) => {
    return status === 'accepted' ? 'success' : 'danger'
  }

  const getSubmitResultText = (status) => {
    return status === 'accepted' ? '通过' : '未通过'
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/oj/practice/index.vue`);
    // 从路由参数获取题目ID
    const problemId = route.query.problemId
    if (problemId) {
      // 加载题目详情
      ElMessage.success('题目加载完成')
    }
  })
</script>

<style lang="scss" scoped>
  .practice-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }

  .problem-header {
    background: #fff;
    padding: 20px 30px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .problem-info {
      flex: 1;

      h2 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 24px;
        font-weight: 600;
      }

      .problem-meta {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;

        .meta-item {
          color: #606266;
          font-size: 14px;
        }
      }
    }

    .problem-actions {
      display: flex;
      gap: 10px;
    }
  }

  .ai-assistant-panel {
    background: #fff;
    margin: 0 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .assistant-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
      }
    }

    .assistant-content {
      padding: 20px;

      .assistant-tips {
        .tip-item {
          margin-bottom: 20px;

          h4 {
            color: #303133;
            margin: 0 0 10px 0;
            font-size: 14px;
          }

          ul {
            margin: 0;
            padding-left: 20px;

            li {
              margin-bottom: 5px;
              color: #606266;
            }
          }

          p {
            color: #606266;
            line-height: 1.6;
            margin: 0;
          }
        }
      }

      .assistant-actions {
        margin-top: 20px;
        text-align: center;

        .vip-tip {
          margin-left: 15px;
          color: #e6a23c;
          font-size: 12px;
        }
      }
    }
  }

  .practice-main {
    flex: 1;
    display: flex;
    padding: 20px 30px;
    gap: 20px;

    .problem-section {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .problem-tabs {
        height: 100%;

        :deep(.el-tabs__content) {
          height: calc(100% - 55px);
          overflow-y: auto;
        }

        :deep(.el-tab-pane) {
          padding: 20px;
        }
      }

      .problem-content {
        .content-section {
          margin-bottom: 25px;

          h3 {
            color: #303133;
            margin: 0 0 12px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .content-text {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #409eff;
            line-height: 1.6;
            color: #606266;
          }
        }

        .sample-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;

          .sample-item h4 {
            color: #303133;
            margin: 0 0 8px 0;
            font-size: 14px;
          }

          .sample-content {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            margin: 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
      }

      .submissions-list {
        .empty-submissions {
          text-align: center;
          padding: 40px 0;
        }

        .submission-item {
          padding: 15px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .submission-info {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 8px;

            .status {
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;

              &.status-accepted {
                background: #f0f9ff;
                color: #67c23a;
              }

              &.status-wrong {
                background: #fef0f0;
                color: #f56c6c;
              }

              &.status-timeout {
                background: #fdf6ec;
                color: #e6a23c;
              }

              &.status-memory {
                background: #fdf6ec;
                color: #e6a23c;
              }

              &.status-error {
                background: #fef0f0;
                color: #f56c6c;
              }
            }

            .time, .language {
              color: #909399;
              font-size: 12px;
            }
          }

          .submission-detail {
            color: #606266;
            font-size: 14px;

            .error-msg {
              color: #f56c6c;
            }
          }
        }
      }

      .solution-section {
        .solution-content {
          margin-top: 20px;

          h3 {
            color: #303133;
            margin: 20px 0 10px 0;
            font-size: 16px;
          }

          p {
            color: #606266;
            line-height: 1.6;
            margin: 0 0 15px 0;
          }

          .code-content {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
            white-space: pre-wrap;
            margin: 10px 0;
          }
        }

        .vip-upgrade {
          text-align: center;
          margin-top: 30px;
        }
      }
    }

    .code-section {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;

      .code-header {
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .language-selector {
          width: 120px;
        }
      }

      .code-editor {
        flex: 1;
        padding: 20px;

        .code-textarea {
          width: 100%;
          height: 100%;
          min-height: 400px;
          padding: 15px;
          border: none;
          border-radius: 4px;
          background: #f8f9fa;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.4;
          resize: none;
          outline: none;

          &:focus {
            background: #fff;
            box-shadow: 0 0 0 2px #409eff;
          }
        }
      }

      .run-result, .submit-result {
        border-top: 1px solid #e4e7ed;
        max-height: 300px;
        overflow-y: auto;

        .result-header {
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e4e7ed;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h4 {
            margin: 0;
            color: #303133;
            font-size: 16px;
          }
        }

        .result-content {
          padding: 15px 20px;

          .result-output, .result-error {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
          }

          .result-error {
            color: #f56c6c;
          }

          .test-cases {
            .test-case {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;

              &:last-child {
                border-bottom: none;
              }

              .case-number {
                color: #606266;
                font-size: 14px;
                min-width: 80px;
              }

              .case-time {
                color: #909399;
                font-size: 12px;
                margin-left: auto;
              }
            }
          }

          .success-info {
            background: #f0f9ff;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;

            p {
              margin: 5px 0;
              color: #409eff;
              font-weight: 500;

              &:first-child {
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }
</style>
