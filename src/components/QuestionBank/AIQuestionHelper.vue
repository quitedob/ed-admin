<template>
  <div id="ai-question-helper" class="ai-question-helper">
    <!-- AI助手抽屉 -->
    <el-drawer
      id="ai-drawer"
      v-model="drawerVisible"
      title="AI出题助手"
      size="50%"
      direction="rtl"
      :destroy-on-close="true"
    >
      <div id="ai-helper-content" class="ai-helper-content">
        <!-- 快速操作区 -->
        <div id="quick-actions" class="quick-actions">
          <h4>快速操作</h4>
          <div id="action-buttons" class="action-buttons">
            <el-button type="primary" @click="generateFromText">
              <el-icon><Document /></el-icon>
              从文本生成题目
            </el-button>
            <el-button type="success" @click="generateSimilarQuestion">
              <el-icon><CopyDocument /></el-icon>
              生成相似题目
            </el-button>
            <el-button type="warning" @click="optimizeQuestion">
              <el-icon><Tools /></el-icon>
              优化现有题目
            </el-button>
            <el-button type="info" @click="generateSolution">
              <el-icon><Lightbulb /></el-icon>
              生成解题步骤
            </el-button>
          </div>
        </div>

        <!-- AI对话区 -->
        <div class="ai-chat">
          <div class="chat-messages" ref="chatMessagesRef">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="message.type"
            >
              <div class="message-avatar">
                <el-avatar
                  :size="32"
                  :src="message.type === 'ai' ? aiAvatar : userAvatar"
                />
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender">{{ message.type === 'ai' ? 'AI助手' : '你' }}</span>
                  <span class="time">{{ message.timestamp }}</span>
                </div>
                <div class="message-body" v-html="formatMessage(message.content)"></div>

                <!-- AI生成的题目预览 -->
                <div v-if="message.generatedQuestion" class="generated-question">
                  <div class="question-preview">
                    <h5>生成的题目预览</h5>
                    <div class="question-content">
                      <p><strong>题目：</strong>{{ message.generatedQuestion.content }}</p>
                      <div v-if="message.generatedQuestion.options" class="options">
                        <p><strong>选项：</strong></p>
                        <ul>
                          <li v-for="option in message.generatedQuestion.options" :key="option.value">
                            {{ option.value }}. {{ option.text }}
                          </li>
                        </ul>
                      </div>
                      <p><strong>正确答案：</strong>{{ message.generatedQuestion.correctAnswer }}</p>
                      <p><strong>解析：</strong>{{ message.generatedQuestion.explanation }}</p>
                    </div>
                    <div class="question-actions">
                      <el-button size="small" type="primary" @click="acceptGeneratedQuestion(message.generatedQuestion)">
                        采用此题目
                      </el-button>
                      <el-button size="small" @click="regenerateQuestion(message)">
                        重新生成
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="向AI助手提问，例如：帮我生成一个关于JavaScript闭包的单选题..."
              @keydown.ctrl.enter="sendMessage"
            />
            <div class="input-actions">
              <el-button size="small" @click="clearChat">清空对话</el-button>
              <el-button type="primary" size="small" @click="sendMessage" :loading="loading">
                发送 (Ctrl+Enter)
              </el-button>
            </div>
          </div>
        </div>

        <!-- 模板提示区 -->
        <div class="template-prompts">
          <h4>常用提示模板</h4>
          <div class="prompt-templates">
            <el-tag
              v-for="template in promptTemplates"
              :key="template.id"
              class="prompt-tag"
              @click="useTemplate(template)"
            >
              {{ template.title }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 文本输入对话框 -->
    <el-dialog
      v-model="showTextDialog"
      title="从文本生成题目"
      width="600px"
    >
      <el-form :model="textForm" label-width="100px">
        <el-form-item label="文本内容">
          <el-input
            v-model="textForm.content"
            type="textarea"
            :rows="8"
            placeholder="请粘贴或输入要生成题目的文本内容..."
          />
        </el-form-item>
        <el-form-item label="题目类型">
          <el-select v-model="textForm.questionType" placeholder="选择题目类型">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
            <el-option label="填空题" value="fill" />
            <el-option label="简答题" value="essay" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度等级">
          <el-select v-model="textForm.difficulty" placeholder="选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量">
          <el-input-number v-model="textForm.count" :min="1" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTextDialog = false">取消</el-button>
        <el-button type="primary" @click="generateQuestionsFromText" :loading="loading">
          生成题目
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, CopyDocument, Tools, Lightbulb } from '@element-plus/icons-vue'
import aiApi from '@/api/ai.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentQuestion: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'question-generated'])

// 响应式数据
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const messages = ref([])
const inputMessage = ref('')
const loading = ref(false)
const chatMessagesRef = ref(null)
const showTextDialog = ref(false)

const userAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const aiAvatar = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'

// 文本生成表单
const textForm = ref({
  content: '',
  questionType: 'single',
  difficulty: 'medium',
  count: 1
})

// 提示模板
const promptTemplates = ref([
  {
    id: 1,
    title: '生成概念题',
    content: '帮我生成一道关于{概念}的{题型}，难度为{难度}'
  },
  {
    id: 2,
    title: '生成代码题',
    content: '基于以下代码，生成一道{题型}：\n{代码}'
  },
  {
    id: 3,
    title: '优化题目',
    content: '请帮我优化这道题目：\n{题目内容}\n\n当前存在什么问题？如何改进？'
  },
  {
    id: 4,
    title: '生成解析',
    content: '请为这道题目生成详细的解题步骤和解析：\n{题目内容}'
  },
  {
    id: 5,
    title: '调整难度',
    content: '请将这道题目的难度从{当前难度}调整为{目标难度}：\n{题目内容}'
  }
])

// 方法
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date().toLocaleTimeString()
  }

  messages.value.push(userMessage)
  const messageContent = inputMessage.value.trim()
  inputMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 发送消息给AI
  loading.value = true
  try {
    const response = await aiApi.sendMessage({
      message: messageContent,
      context: 'question_generation',
      currentQuestion: props.currentQuestion
    })

    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: response.data.content,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: response.data.suggestions || []
    }

    // 检查是否包含生成的题目
    if (response.data.generatedQuestion) {
      aiMessage.generatedQuestion = response.data.generatedQuestion
    }

    messages.value.push(aiMessage)

    // 滚动到底部
    await nextTick()
    scrollToBottom()

  } catch (error) {
    console.error('AI消息发送失败:', error)
    ElMessage.error('AI助手暂时不可用，请稍后再试')
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const clearChat = () => {
  messages.value = []
  ElMessage.success('对话已清空')
}

const formatMessage = (content) => {
  // 简单的Markdown格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const useTemplate = (template) => {
  inputMessage.value = template.content
}

const generateFromText = () => {
  showTextDialog.value = true
}

const generateQuestionsFromText = async () => {
  if (!textForm.value.content.trim()) {
    ElMessage.warning('请输入文本内容')
    return
  }

  loading.value = true
  try {
    const prompt = `请基于以下文本内容生成${textForm.value.count}道${textForm.value.difficulty}难度的${getQuestionTypeLabel(textForm.value.questionType)}：

文本内容：
${textForm.value.content}

要求：
1. 题目应该准确反映文本内容
2. 选项应该具有迷惑性
3. 提供详细的解析
4. 标注知识点标签`

    const response = await aiApi.sendMessage({
      message: prompt,
      context: 'text_to_question'
    })

    if (response.data.generatedQuestions) {
      response.data.generatedQuestions.forEach((question, index) => {
        const aiMessage = {
          id: Date.now() + index,
          type: 'ai',
          content: `已生成第${index + 1}道题目：`,
          timestamp: new Date().toLocaleTimeString(),
          generatedQuestion: question
        }
        messages.value.push(aiMessage)
      })

      showTextDialog.value = false
      textForm.value.content = ''
      ElMessage.success(`成功生成${response.data.generatedQuestions.length}道题目`)
    }

  } catch (error) {
    console.error('生成题目失败:', error)
    ElMessage.error('生成题目失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const generateSimilarQuestion = async () => {
  if (!props.currentQuestion) {
    ElMessage.warning('请先选择一个题目')
    return
  }

  loading.value = true
  try {
    const prompt = `请基于以下题目生成一道相似但不同的题目：

原题目：
${props.currentQuestion.content || props.currentQuestion.questionText}

题型：${getQuestionTypeLabel(props.currentQuestion.type)}
难度：${getDifficultyLabel(props.currentQuestion.difficulty)}

要求：
1. 保持相同的考察知识点
2. 适当调整题目表述和选项
3. 确保难度相当
4. 提供新的解析`

    const response = await aiApi.sendMessage({
      message: prompt,
      context: 'generate_similar'
    })

    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response.data.content,
      timestamp: new Date().toLocaleTimeString(),
      generatedQuestion: response.data.generatedQuestion
    }

    messages.value.push(aiMessage)

  } catch (error) {
    console.error('生成相似题目失败:', error)
    ElMessage.error('生成相似题目失败')
  } finally {
    loading.value = false
  }
}

const optimizeQuestion = async () => {
  if (!props.currentQuestion) {
    ElMessage.warning('请先选择一个题目')
    return
  }

  loading.value = true
  try {
    const prompt = `请帮我优化以下题目，提出改进建议：

题目：
${props.currentQuestion.content || props.currentQuestion.questionText}

选项：${props.currentQuestion.options?.map(opt => `${opt.value}. ${opt.text}`).join('\n') || '无选项'}

正确答案：${props.currentQuestion.correctAnswer}

请从以下方面分析：
1. 题目表述是否清晰准确
2. 选项设计是否合理
3. 难度是否适中
4. 知识点考察是否准确
5. 提供具体的改进建议`

    const response = await aiApi.sendMessage({
      message: prompt,
      context: 'optimize_question'
    })

    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response.data.content,
      timestamp: new Date().toLocaleTimeString()
    }

    messages.value.push(aiMessage)

  } catch (error) {
    console.error('优化题目失败:', error)
    ElMessage.error('优化题目失败')
  } finally {
    loading.value = false
  }
}

const generateSolution = async () => {
  if (!props.currentQuestion) {
    ElMessage.warning('请先选择一个题目')
    return
  }

  loading.value = true
  try {
    const prompt = `请为以下题目生成详细的解题步骤和解析：

题目：
${props.currentQuestion.content || props.currentQuestion.questionText}

${props.currentQuestion.options ? `选项：\n${props.currentQuestion.options.map(opt => `${opt.value}. ${opt.text}`).join('\n')}` : ''}

正确答案：${props.currentQuestion.correctAnswer}

要求：
1. 提供详细的解题思路
2. 分析错误选项的原因
3. 总结相关知识点
4. 提供解题技巧`

    const response = await aiApi.sendMessage({
      message: prompt,
      context: 'generate_solution'
    })

    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response.data.content,
      timestamp: new Date().toLocaleTimeString()
    }

    messages.value.push(aiMessage)

  } catch (error) {
    console.error('生成解题步骤失败:', error)
    ElMessage.error('生成解题步骤失败')
  } finally {
    loading.value = false
  }
}

const acceptGeneratedQuestion = (question) => {
  emit('question-generated', question)
  ElMessage.success('题目已采用，请在题目编辑器中查看')
}

const regenerateQuestion = async (message) => {
  loading.value = true
  try {
    const prompt = `请重新生成一道题目，要求与之前的题目有所不同：\n\n${message.content}`

    const response = await aiApi.sendMessage({
      message: prompt,
      context: 'regenerate_question'
    })

    const aiMessage = {
      id: Date.now(),
      type: 'ai',
      content: response.data.content,
      timestamp: new Date().toLocaleTimeString(),
      generatedQuestion: response.data.generatedQuestion
    }

    messages.value.push(aiMessage)

  } catch (error) {
    console.error('重新生成题目失败:', error)
    ElMessage.error('重新生成题目失败')
  } finally {
    loading.value = false
  }
}

const getQuestionTypeLabel = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    programming: '编程题',
    essay: '简答题'
  }
  return typeMap[type] || type
}

const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}
</script>

<style lang="scss" scoped>
.ai-question-helper {
  .ai-helper-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .quick-actions {
      margin-bottom: 20px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;

      h4 {
        margin: 0 0 12px 0;
        color: var(--color-text-primary);
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }
    }

    .ai-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border-lighter);
      border-radius: 8px;
      overflow: hidden;

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;

          &.user {
            flex-direction: row-reverse;

            .message-content {
              align-items: flex-end;
            }
          }

          .message-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            max-width: 80%;

            .message-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .sender {
                font-weight: 600;
                color: var(--color-text-primary);
              }

              .time {
                font-size: 12px;
                color: var(--color-text-secondary);
              }
            }

            .message-body {
              padding: 12px 16px;
              border-radius: 8px;
              line-height: 1.6;
              word-wrap: break-word;

              :deep(pre) {
                background: var(--color-bg-secondary);
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
                margin: 8px 0;
              }

              :deep(code) {
                background: var(--color-bg-secondary);
                padding: 2px 4px;
                border-radius: 3px;
                font-family: monospace;
              }
            }

            .user & .message-body {
              background: var(--color-primary);
              color: white;
            }

            .ai & .message-body {
              background: var(--color-bg-secondary);
              border: 1px solid var(--color-border-lighter);
            }

            .generated-question {
              margin-top: 12px;
              padding: 16px;
              background: white;
              border: 1px solid var(--color-primary);
              border-radius: 8px;

              .question-preview {
                h5 {
                  margin: 0 0 12px 0;
                  color: var(--color-primary);
                }

                .question-content {
                  margin-bottom: 16px;

                  p {
                    margin: 8px 0;
                    line-height: 1.6;
                  }

                  .options {
                    ul {
                      margin: 8px 0;
                      padding-left: 20px;
                    }
                  }
                }

                .question-actions {
                  display: flex;
                  gap: 8px;
                }
              }
            }
          }
        }
      }

      .chat-input {
        padding: 16px;
        border-top: 1px solid var(--color-border-lighter);
        background: white;

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
      }
    }

    .template-prompts {
      margin-top: 20px;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;

      h4 {
        margin: 0 0 12px 0;
        color: var(--color-text-primary);
      }

      .prompt-templates {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .prompt-tag {
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: var(--color-primary);
            color: white;
          }
        }
      }
    }
  }
}
</style>