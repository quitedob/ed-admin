<template>
  <div class="ai-chat-interface">
    <!-- 聊天按钮 -->
    <div
      v-if="!isOpen"
      class="chat-button"
      @click="openChat"
    >
      <el-icon class="chat-icon">
        <ChatDotRound />
      </el-icon>
      <span class="chat-text">AI助教</span>
      <div v-if="hasNewMessage" class="new-message-indicator"></div>
    </div>

    <!-- 聊天窗口 -->
    <div v-else class="chat-window">
      <!-- 窗口头部 -->
      <div class="chat-header">
        <div class="header-info">
          <el-avatar size="32" class="ai-avatar">
            🤖
          </el-avatar>
          <div class="ai-info">
            <h4>AI助教</h4>
            <span class="status">在线</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button text @click="minimizeChat" icon="Minus"></el-button>
          <el-button text @click="closeChat" icon="Close"></el-button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="chat-messages" ref="messagesRef">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'user-message': message.sender === 'user' }"
        >
          <div class="message-avatar">
            <el-avatar :size="32">
              {{ message.sender === 'user' ? '👤' : '🤖' }}
            </el-avatar>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="message.content"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            <div v-if="message.actions" class="message-actions">
              <el-button
                v-for="action in message.actions"
                :key="action.key"
                size="small"
                text
                @click="handleAction(action)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 输入中状态 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-avatar">
            <el-avatar size="32">🤖</el-avatar>
          </div>
          <div class="typing-content">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            placeholder="输入您的问题..."
            :disabled="isTyping"
            @keyup.enter="sendMessage"
            ref="inputRef"
          >
            <template #suffix>
              <el-button
                :icon="Position"
                text
                @click="sendMessage"
                :disabled="!inputMessage.trim() || isTyping"
                :loading="isTyping"
              />
            </template>
          </el-input>
        </div>

        <!-- 快速提问建议 -->
        <div v-if="quickQuestions.length > 0" class="quick-questions">
          <div class="quick-title">快速提问：</div>
          <div class="quick-buttons">
            <el-button
              v-for="question in quickQuestions"
              :key="question"
              size="small"
              text
              @click="sendQuickQuestion(question)"
            >
              {{ question }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, nextTick, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ChatDotRound, Minus, Close, Position } from '@element-plus/icons-vue'

  // Props
  const props = defineProps({
    context: {
      type: String,
      default: 'general' // general, video, coding, homework
    },
    courseId: {
      type: [String, Number],
      default: null
    },
    problemId: {
      type: [String, Number],
      default: null
    },
    videoId: {
      type: [String, Number],
      default: null
    }
  })

  // 响应式数据
  const isOpen = ref(false)
  const messages = ref([])
  const inputMessage = ref('')
  const isTyping = ref(false)
  const hasNewMessage = ref(false)
  const messagesRef = ref(null)
  const inputRef = ref(null)

  // 快速提问建议
  const quickQuestions = computed(() => {
    switch (props.context) {
      case 'video':
        return [
          '这个概念不太理解，能解释一下吗？',
          '这个知识点有什么实际应用？',
          '能举个例子吗？'
        ]
      case 'coding':
        return [
          '这道题的解题思路是什么？',
          '我的代码哪里出错了？',
          '如何优化这段代码？'
        ]
      case 'homework':
        return [
          '这道题怎么做？',
          '这个步骤我不明白',
          '能给个提示吗？'
        ]
      default:
        return [
          '你好，请问有什么可以帮助您的？',
          '我想了解更多关于这个主题的信息',
          '能推荐一些学习资源吗？'
        ]
    }
  })

  // 欢迎消息
  const welcomeMessage = computed(() => {
    switch (props.context) {
      case 'video':
        return '你好！我是你的AI学习助手。在观看视频时遇到任何疑问都可以随时向我提问，我会尽力为你解答！'
      case 'coding':
        return '你好！我是你的编程助手。在练习编程题目时遇到困难时，我会给你提示和建议，但不会直接给出完整答案。'
      case 'homework':
        return '你好！我是你的作业助手。遇到作业问题时，我会引导你思考，但请独立完成作业哦！'
      default:
        return '你好！我是你的AI学习助手，有什么问题都可以问我！'
    }
  })

  // 打开聊天
  const openChat = () => {
    isOpen.value = true
    hasNewMessage.value = false

    // 如果是第一次打开，显示欢迎消息
    if (messages.value.length === 0) {
      setTimeout(() => {
        addMessage({
          id: Date.now(),
          sender: 'ai',
          content: welcomeMessage.value,
          timestamp: new Date()
        })
      }, 500)
    }

    nextTick(() => {
      scrollToBottom()
      inputRef.value?.focus()
    })
  }

  // 关闭聊天
  const closeChat = () => {
    isOpen.value = false
  }

  // 最小化聊天
  const minimizeChat = () => {
    isOpen.value = false
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim() || isTyping.value) return

    const userMessage = inputMessage.value.trim()
    inputMessage.value = ''

    // 添加用户消息
    addMessage({
      id: Date.now(),
      sender: 'user',
      content: userMessage,
      timestamp: new Date()
    })

    // 显示输入中状态
    isTyping.value = true

    // 模拟AI回复
    setTimeout(() => {
      generateAIResponse(userMessage)
    }, 1000 + Math.random() * 2000)
  }

  // 发送快速提问
  const sendQuickQuestion = (question) => {
    inputMessage.value = question
    sendMessage()
  }

  // 生成AI回复
  const generateAIResponse = (userMessage) => {
    let response = ''
    let actions = null

    // 根据上下文生成不同的回复
    switch (props.context) {
      case 'video':
        response = generateVideoResponse(userMessage)
        break
      case 'coding':
        response = generateCodingResponse(userMessage)
        actions = [
          { key: 'hint', label: '获取提示' },
          { key: 'similar', label: '相似题目' }
        ]
        break
      case 'homework':
        response = generateHomeworkResponse(userMessage)
        break
      default:
        response = generateGeneralResponse(userMessage)
    }

    addMessage({
      id: Date.now(),
      sender: 'ai',
      content: response,
      timestamp: new Date(),
      actions: actions
    })

    isTyping.value = false
    scrollToBottom()
  }

  // 生成视频学习相关的回复
  const generateVideoResponse = (userMessage) => {
    const responses = [
      '这是一个很好的问题！让我来解释一下这个概念...',
      '在视频中提到的这个知识点，其实是这样应用的...',
      '你可以这样理解：...',
      '让我为你举个实际的例子...',
      '这个概念的核心要点是...'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 生成编程练习相关的回复
  const generateCodingResponse = (userMessage) => {
    if (userMessage.includes('不会') || userMessage.includes('不会做')) {
      return '这道题考察的是...算法的基本思想。建议你先考虑以下几个方面：<br><br>1. 理解题目的输入输出要求<br>2. 分析可能的解题方法<br>3. 考虑时间和空间复杂度<br><br>你可以先尝试写出基本框架，然后逐步完善。'
    } else if (userMessage.includes('错误') || userMessage.includes('bug')) {
      return '代码调试时建议：<br><br>1. 检查变量初始化<br>2. 验证边界条件<br>3. 使用调试工具单步执行<br>4. 打印中间结果确认逻辑<br><br>找到错误后，记住这个教训，下次就能避免了！'
    } else {
      return '编程练习中遇到问题很正常！关键是要建立正确的解题思路。建议多做练习，总结规律。有什么具体的代码问题吗？'
    }
  }

  // 生成作业辅导相关的回复
  const generateHomeworkResponse = (userMessage) => {
    return '作业是检验学习效果的重要方式！遇到困难时：<br><br>1. 回顾相关知识点<br>2. 尝试独立思考<br>3. 查看教材和笔记<br>4. 与同学讨论思路<br><br>我可以给你一些思考方向，但请独立完成作业哦！'
  }

  // 生成通用回复
  const generateGeneralResponse = (userMessage) => {
    const responses = [
      '我明白了你的问题。让我来帮你解答...',
      '这是一个很有价值的问题！',
      '让我为你详细解释一下...',
      '这个问题涉及的知识点是...'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 处理消息动作
  const handleAction = (action) => {
    switch (action.key) {
      case 'hint':
        addMessage({
          id: Date.now(),
          sender: 'ai',
          content: '💡 提示：考虑使用双指针或者哈希表来优化算法...',
          timestamp: new Date()
        })
        break
      case 'similar':
        addMessage({
          id: Date.now(),
          sender: 'ai',
          content: '📚 推荐相似题目：<br>• 两数求和 II<br>• 三数之和<br>• 四数之和<br><br>这些题目都是基于相似思路的。',
          timestamp: new Date()
        })
        break
    }
    scrollToBottom()
  }

  // 添加消息
  const addMessage = (message) => {
    messages.value.push(message)
    if (!isOpen.value) {
      hasNewMessage.value = true
    }
    nextTick(() => scrollToBottom())
  }

  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }

  // 格式化时间
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/ai/ChatInterface.vue`);
    // 可以在这里初始化一些欢迎消息或者历史消息
  })
</script>

<style lang="scss" scoped>
  .ai-chat-interface {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-size: 14px;
  }

  .chat-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 25px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }

    .chat-icon {
      font-size: 20px;
    }

    .chat-text {
      font-weight: 500;
    }

    .new-message-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #ff4757;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .chat-window {
    width: 380px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .ai-avatar {
        background: rgba(255, 255, 255, 0.2);
      }

      .ai-info h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .status {
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;

      .el-button {
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f8f9fa;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 2px;
    }
  }

  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: flex-start;

    &.user-message {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;
  }

  .message-content {
    max-width: 280px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-text {
    background: #fff;
    padding: 12px 16px;
    border-radius: 18px;
    line-height: 1.5;
    word-wrap: break-word;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .user-message .message-text {
    background: #667eea;
    color: white;
  }

  .message-time {
    font-size: 11px;
    color: #999;
    align-self: flex-start;
    margin: 0 16px;
  }

  .user-message .message-time {
    align-self: flex-end;
  }

  .message-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;

    .el-button {
      font-size: 12px;
      padding: 4px 8px;
    }
  }

  .typing-indicator {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .typing-content {
    background: #fff;
    padding: 12px 16px;
    border-radius: 18px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;

    span {
      width: 6px;
      height: 6px;
      background: #999;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }

  .chat-input {
    border-top: 1px solid #e4e7ed;
    background: #fff;

    .input-container {
      padding: 16px;

      .el-input {
        :deep(.el-input__wrapper) {
          border-radius: 25px;
          padding: 0 16px;
        }

        :deep(.el-input__suffix) {
          .el-button {
            border-radius: 50%;
            width: 32px;
            height: 32px;
            padding: 0;
          }
        }
      }
    }

    .quick-questions {
      padding: 0 16px 12px 16px;
      border-top: 1px solid #f0f0f0;

      .quick-title {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }

      .quick-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .el-button {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
        }
      }
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
</style>