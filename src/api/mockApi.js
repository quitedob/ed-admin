// Mock API for development when backend is not available
import { ElMessage } from 'element-plus'

// Mock data storage
let mockQuestions = [
  {
    id: 'q001',
    title: 'JavaScript 闭包概念',
    content: '以下关于 JavaScript 闭包的描述，哪个是正确的？',
    type: 'single',
    difficulty: 'medium',
    score: 5,
    subject: 'cs',
    tags: ['JavaScript', '前端开发', '基础概念'],
    options: [
      { value: 'A', text: '闭包是指函数可以访问外部变量', isCorrect: true },
      { value: 'B', text: '闭包会造成内存泄漏', isCorrect: false },
      { value: 'C', text: '闭包只能访问全局变量', isCorrect: false },
      { value: 'D', text: '闭包是一种错误', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '闭包是JavaScript中的一个重要概念，它允许函数访问其外部作用域中的变量。',
    hint: '思考函数作用域和变量访问规则',
    useCount: 15,
    createTime: '2024-01-15',
    updateTime: '2024-01-20',
    status: 'active',
    source: 'manual'
  },
  {
    id: 'q002',
    title: 'React Hooks 使用规则',
    content: '关于 React Hooks 的使用，以下哪些说法是正确的？',
    type: 'multiple',
    difficulty: 'hard',
    score: 8,
    subject: 'cs',
    tags: ['React', '前端开发', 'Hooks'],
    options: [
      { value: 'A', text: '只能在函数组件中使用 Hooks', isCorrect: true },
      { value: 'B', text: '可以在条件语句中使用 Hooks', isCorrect: false },
      { value: 'C', text: '必须在组件顶层调用 Hooks', isCorrect: true },
      { value: 'D', text: '可以在类组件中使用 Hooks', isCorrect: false }
    ],
    correctAnswers: ['A', 'C'],
    explanation: 'React Hooks 必须在函数组件的顶层调用，不能在条件语句、循环或嵌套函数中使用。',
    hint: '记住 Hooks 的使用规则',
    useCount: 8,
    createTime: '2024-01-18',
    updateTime: '2024-01-22',
    status: 'active',
    source: 'manual'
  }
]

let mockTags = [
  { id: 'tag_001', name: 'JavaScript', category: 'language', color: '#f7df1e', usageCount: 45 },
  { id: 'tag_002', name: '基础概念', category: 'level', color: '#67c23a', usageCount: 23 },
  { id: 'tag_003', name: '算法', category: 'topic', color: '#e6a23c', usageCount: 67 },
  { id: 'tag_004', name: '前端开发', category: 'field', color: '#409eff', usageCount: 89 }
]

let mockVideos = [
  {
    id: 'video_001',
    title: 'JavaScript 闭包详解',
    url: 'https://example.com/video1.mp4',
    type: 'external',
    platform: 'bilibili',
    description: '详细讲解 JavaScript 闭包的概念和用法',
    duration: '15:30',
    uploadTime: '2024-01-10'
  }
]

// Mock API functions
const mockApi = {
  // 模拟网络延迟
  delay: (ms = 800) => new Promise(resolve => setTimeout(resolve, ms)),

  // 成功响应
  success: (data) => ({
    code: 200,
    message: 'success',
    data
  }),

  // 错误响应
  error: (message = '请求失败') => ({
    code: 500,
    message,
    data: null
  }),

  // 获取题目列表
  getQuestions: async (params = {}) => {
    await this.delay()
    const { page = 1, limit = 20, keyword, type, difficulty, subject } = params

    let filteredQuestions = [...mockQuestions]

    // 应用筛选条件
    if (keyword) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.title.toLowerCase().includes(keyword.toLowerCase()) ||
        q.content.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    if (type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === type)
    }

    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty)
    }

    if (subject) {
      filteredQuestions = filteredQuestions.filter(q => q.subject === subject)
    }

    // 分页
    const start = (page - 1) * limit
    const paginatedQuestions = filteredQuestions.slice(start, start + limit)

    return this.success({
      items: paginatedQuestions,
      total: filteredQuestions.length,
      page,
      limit
    })
  },

  // 创建题目
  createQuestion: async (data) => {
    await this.delay()
    const newQuestion = {
      ...data,
      id: `q${Date.now()}`,
      useCount: 0,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
      status: 'active',
      source: 'manual'
    }
    mockQuestions.unshift(newQuestion)
    ElMessage.success('题目创建成功')
    return this.success(newQuestion)
  },

  // 更新题目
  updateQuestion: async (id, data) => {
    await this.delay()
    const index = mockQuestions.findIndex(q => q.id === id)
    if (index === -1) {
      return this.error('题目不存在')
    }

    mockQuestions[index] = {
      ...mockQuestions[index],
      ...data,
      updateTime: new Date().toISOString().split('T')[0]
    }

    ElMessage.success('题目更新成功')
    return this.success(mockQuestions[index])
  },

  // 删除题目
  deleteQuestion: async (id) => {
    await this.delay()
    const index = mockQuestions.findIndex(q => q.id === id)
    if (index === -1) {
      return this.error('题目不存在')
    }

    mockQuestions.splice(index, 1)
    ElMessage.success('题目删除成功')
    return this.success(null)
  },

  // 获取标签列表
  getTags: async (params = {}) => {
    await this.delay()
    return this.success(mockTags)
  },

  // 创建标签
  createTag: async (data) => {
    await this.delay()
    const newTag = {
      ...data,
      id: `tag${Date.now()}`,
      usageCount: 0,
      createTime: new Date().toISOString().split('T')[0]
    }
    mockTags.push(newTag)
    ElMessage.success('标签创建成功')
    return this.success(newTag)
  },

  // 更新标签
  updateTag: async (id, data) => {
    await this.delay()
    const index = mockTags.findIndex(t => t.id === id)
    if (index === -1) {
      return this.error('标签不存在')
    }

    mockTags[index] = { ...mockTags[index], ...data }
    ElMessage.success('标签更新成功')
    return this.success(mockTags[index])
  },

  // 删除标签
  deleteTag: async (id) => {
    await this.delay()
    const index = mockTags.findIndex(t => t.id === id)
    if (index === -1) {
      return this.error('标签不存在')
    }

    mockTags.splice(index, 1)
    ElMessage.success('标签删除成功')
    return this.success(null)
  },

  // 获取视频列表
  getQuestionVideos: async (questionId) => {
    await this.delay()
    // 模拟返回该题目的视频列表
    return this.success(mockVideos)
  },

  // 上传视频
  uploadVideo: async (formData) => {
    await this.delay(2000) // 模拟上传时间
    const newVideo = {
      id: `video${Date.now()}`,
      title: formData.get('title') || '未命名视频',
      url: 'https://example.com/uploaded-video.mp4',
      type: 'local',
      uploadTime: new Date().toISOString()
    }
    mockVideos.push(newVideo)
    ElMessage.success('视频上传成功')
    return this.success(newVideo)
  },

  // 获取分析数据
  getAnalyticsData: async (params = {}) => {
    await this.delay()
    return this.success({
      totalQuestions: mockQuestions.length,
      questionsGrowth: 12.5,
      totalUsage: mockQuestions.reduce((sum, q) => sum + q.useCount, 0),
      usageGrowth: 8.3,
      avgAccuracy: 78.5,
      accuracyTrend: 2.1,
      aiGenerated: 0, // Mock data中没有AI生成的题目
      aiGrowth: 0
    })
  },

  // AI生成题目
  generateQuestionWithAI: async (data) => {
    await this.delay(2000) // 模拟AI生成时间

    const aiGeneratedQuestion = {
      id: `q${Date.now()}`,
      title: data.prompt?.slice(0, 50) + '...',
      content: '这是AI生成的题目内容',
      type: data.type || 'single',
      difficulty: data.difficulty || 'medium',
      score: 5,
      subject: data.subject || 'cs',
      tags: data.tags || ['AI生成'],
      options: [
        { value: 'A', text: '选项A - AI生成', isCorrect: true },
        { value: 'B', text: '选项B - AI生成', isCorrect: false },
        { value: 'C', text: '选项C - AI生成', isCorrect: false },
        { value: 'D', text: '选项D - AI生成', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: '这是AI生成的题目解析',
      useCount: 0,
      createTime: new Date().toISOString().split('T')[0],
      updateTime: new Date().toISOString().split('T')[0],
      source: 'ai'
    }

    mockQuestions.unshift(aiGeneratedQuestion)
    ElMessage.success('AI题目生成成功')
    return this.success(aiGeneratedQuestion)
  },

  // 导入题目
  importQuestions: async (formData) => {
    await this.delay(3000) // 模拟导入处理时间

    const importedCount = 3 // 模拟导入3个题目
    for (let i = 0; i < importedCount; i++) {
      const importedQuestion = {
        id: `q${Date.now() + i}`,
        title: `导入的题目 ${i + 1}`,
        content: '这是导入的题目内容',
        type: 'single',
        difficulty: 'medium',
        score: 5,
        subject: 'cs',
        tags: ['导入'],
        options: [
          { value: 'A', text: '选项A', isCorrect: true },
          { value: 'B', text: '选项B', isCorrect: false }
        ],
        correctAnswer: 'A',
        useCount: 0,
        createTime: new Date().toISOString().split('T')[0],
        updateTime: new Date().toISOString().split('T')[0],
        source: 'import'
      }
      mockQuestions.push(importedQuestion)
    }

    ElMessage.success(`成功导入 ${importedCount} 个题目`)
    return this.success({
      total: importedCount,
      success: importedCount,
      failed: 0
    })
  }
}

export default mockApi