import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const aiApi = {
  // AI对话相关API
  // 发送消息
  sendMessage: (data) => {
    return postRequest('/ai/admin/chat/send', data)
  },

  // 获取对话历史
  getChatHistory: (params) => {
    return postRequest('/ai/admin/chat/history', params)
  },

  // 清空对话历史
  clearChatHistory: (userId, context) => {
    return deleteRequest(`/ai/admin/chat/history?userId=${userId}&context=${context}`)
  },

  // 获取对话会话列表
  getChatSessions: (userId) => {
    return getRequest(`/ai/admin/chat/sessions?userId=${userId}`)
  },

  // AI提示管理
  // 获取提示列表
  getPrompts: (params) => {
    return postRequest('/ai/admin/prompts/list', params)
  },

  // 保存提示
  savePrompt: (data) => {
    return postRequest('/ai/admin/prompts/save', data)
  },

  // 修改提示
  editPrompt: (data) => {
    return putRequest('/ai/admin/prompts/edit', data)
  },

  // 删除提示
  deletePrompt: (id) => {
    return deleteRequest(`/ai/admin/prompts/delete?id=${id}`)
  },

  // 获取问题类型
  getQuestionTypes: () => {
    return getRequest('/ai/admin/prompts/question-types')
  },

  // AI使用统计
  // 获取使用统计
  getUsageStats: (params) => {
    return postRequest('/ai/admin/stats/usage', params)
  },

  // 获取用户提问记录
  getUserQuestions: (params) => {
    return postRequest('/ai/admin/stats/user-questions', params)
  },

  // 获取热门问题
  getPopularQuestions: (params) => {
    return postRequest('/ai/admin/stats/popular-questions', params)
  },

  // AI配置管理
  // 获取AI配置
  getAiConfig: () => {
    return getRequest('/ai/admin/config')
  },

  // 保存AI配置
  saveAiConfig: (data) => {
    return postRequest('/ai/admin/config/save', data)
  },

  // 答案控制相关
  // 获取答案查看条件
  getAnswerConditions: (userId, problemId) => {
    return getRequest(`/ai/admin/answer/conditions?userId=${userId}&problemId=${problemId}`)
  },

  // 检查是否可以查看答案
  checkAnswerAccess: (userId, problemId) => {
    return getRequest(`/ai/admin/answer/check?userId=${userId}&problemId=${problemId}`)
  },

  // 记录答案查看
  recordAnswerView: (data) => {
    return postRequest('/ai/admin/answer/record-view', data)
  },

  // 教学内容集成
  // 根据教学内容生成提示
  generateContentPrompt: (contentId, contentType) => {
    return getRequest(`/ai/admin/content/generate-prompt?contentId=${contentId}&contentType=${contentType}`)
  },

  // 根据题目生成解题思路
  generateProblemHint: (problemId, userCode) => {
    return postRequest('/ai/admin/problem/generate-hint', { problemId, userCode })
  },

  // 分析代码错误
  analyzeCodeError: (data) => {
    return postRequest('/ai/admin/code/analyze-error', data)
  },

  // AI反馈管理
  // 获取用户反馈
  getFeedback: (params) => {
    return postRequest('/ai/admin/feedback/list', params)
  },

  // 保存用户反馈
  saveFeedback: (data) => {
    return postRequest('/ai/admin/feedback/save', data)
  },

  // AI质量评估
  // 评估AI回答质量
  evaluateAiResponse: (data) => {
    return postRequest('/ai/admin/quality/evaluate', data)
  },

  // 获取质量报告
  getQualityReport: (params) => {
    return postRequest('/ai/admin/quality/report', params)
  },

  // 智能推荐
  // 获取学习资源推荐
  getResourceRecommendations: (userId, courseId) => {
    return getRequest(`/ai/admin/recommend/resources?userId=${userId}&courseId=${courseId}`)
  },

  // 获取练习题目推荐
  getProblemRecommendations: (userId, difficulty) => {
    return getRequest(`/ai/admin/recommend/problems?userId=${userId}&difficulty=${difficulty}`)
  },

  // 获取学习路径建议
  getLearningPath: (userId, courseId) => {
    return getRequest(`/ai/admin/recommend/learning-path?userId=${userId}&courseId=${courseId}`)
  }
}