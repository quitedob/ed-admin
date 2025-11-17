import request from '@/utils/request'
import mockApi from './mockApi'

// 开发环境检测
const isDevelopment = process.env.NODE_ENV === 'development'
const useMock = isDevelopment && localStorage.getItem('useMockApi') === 'true'

// 题库管理相关API接口

// 获取题目列表
export function getQuestions(params) {
  if (useMock) {
    return mockApi.getQuestions(params)
  }
  return request({
    url: '/api/question-bank/questions',
    method: 'get',
    params
  })
}

// 获取题目详情
export function getQuestionDetail(id) {
  return request({
    url: `/api/question-bank/questions/${id}`,
    method: 'get'
  })
}

// 创建题目
export function createQuestion(data) {
  if (useMock) {
    return mockApi.createQuestion(data)
  }
  return request({
    url: '/api/question-bank/questions',
    method: 'post',
    data
  })
}

// 更新题目
export function updateQuestion(id, data) {
  return request({
    url: `/api/question-bank/questions/${id}`,
    method: 'put',
    data
  })
}

// 删除题目
export function deleteQuestion(id) {
  return request({
    url: `/api/question-bank/questions/${id}`,
    method: 'delete'
  })
}

// 批量删除题目
export function batchDeleteQuestions(ids) {
  return request({
    url: '/api/question-bank/questions/batch-delete',
    method: 'post',
    data: { ids }
  })
}

// 复制题目
export function duplicateQuestion(id, data = {}) {
  return request({
    url: `/api/question-bank/questions/${id}/duplicate`,
    method: 'post',
    data
  })
}

// 导入题目
export function importQuestions(data) {
  return request({
    url: '/api/question-bank/questions/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出题目
export function exportQuestions(params) {
  return request({
    url: '/api/question-bank/questions/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取题目统计
export function getQuestionStats(params) {
  return request({
    url: '/api/question-bank/questions/stats',
    method: 'get',
    params
  })
}

// 获取题目使用记录
export function getQuestionUsage(id, params) {
  return request({
    url: `/api/question-bank/questions/${id}/usage`,
    method: 'get',
    params
  })
}

// 添加题目到作业
export function addQuestionToAssignment(questionId, assignmentId) {
  return request({
    url: `/api/question-bank/questions/${questionId}/add-to-assignment`,
    method: 'post',
    data: { assignmentId }
  })
}

// 添加题目到考试
export function addQuestionToExam(questionId, examId) {
  return request({
    url: `/api/question-bank/questions/${questionId}/add-to-exam`,
    method: 'post',
    data: { examId }
  })
}

// 标签管理相关API

// 获取标签列表
export function getTags(params) {
  if (useMock) {
    return mockApi.getTags(params)
  }
  return request({
    url: '/api/question-bank/tags',
    method: 'get',
    params
  })
}

// 创建标签
export function createTag(data) {
  return request({
    url: '/api/question-bank/tags',
    method: 'post',
    data
  })
}

// 更新标签
export function updateTag(id, data) {
  return request({
    url: `/api/question-bank/tags/${id}`,
    method: 'put',
    data
  })
}

// 删除标签
export function deleteTag(id) {
  return request({
    url: `/api/question-bank/tags/${id}`,
    method: 'delete'
  })
}

// 获取标签分类
export function getTagCategories() {
  return request({
    url: '/api/question-bank/tags/categories',
    method: 'get'
  })
}

// 创建标签分类
export function createTagCategory(data) {
  return request({
    url: '/api/question-bank/tags/categories',
    method: 'post',
    data
  })
}

// 视频管理相关API

// 上传视频
export function uploadVideo(data) {
  return request({
    url: '/api/question-bank/videos/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 添加外部视频
export function addExternalVideo(data) {
  return request({
    url: '/api/question-bank/videos/external',
    method: 'post',
    data
  })
}

// 删除视频
export function deleteVideo(id) {
  return request({
    url: `/api/question-bank/videos/${id}`,
    method: 'delete'
  })
}

// 获取题目的视频列表
export function getQuestionVideos(questionId) {
  return request({
    url: `/api/question-bank/questions/${questionId}/videos`,
    method: 'get'
  })
}

// 分析数据相关API

// 获取题库分析数据
export function getAnalyticsData(params) {
  return request({
    url: '/api/question-bank/analytics',
    method: 'get',
    params
  })
}

// 获取题目类型分布
export function getTypeDistribution(params) {
  return request({
    url: '/api/question-bank/analytics/type-distribution',
    method: 'get',
    params
  })
}

// 获取难度分布
export function getDifficultyDistribution(params) {
  return request({
    url: '/api/question-bank/analytics/difficulty-distribution',
    method: 'get',
    params
  })
}

// 获取使用趋势
export function getUsageTrends(params) {
  return request({
    url: '/api/question-bank/analytics/usage-trends',
    method: 'get',
    params
  })
}

// 获取学科分布
export function getSubjectDistribution(params) {
  return request({
    url: '/api/question-bank/analytics/subject-distribution',
    method: 'get',
    params
  })
}

// 获取标签热度
export function getTagHeatmap(params) {
  return request({
    url: '/api/question-bank/analytics/tag-heatmap',
    method: 'get',
    params
  })
}

// 导出分析数据
export function exportAnalyticsData(params) {
  return request({
    url: '/api/question-bank/analytics/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// AI相关API

// AI生成题目
export function generateQuestionWithAI(data) {
  if (useMock) {
    return mockApi.generateQuestionWithAI(data)
  }
  return request({
    url: '/api/question-bank/ai/generate-question',
    method: 'post',
    data
  })
}

// AI优化题目
export function optimizeQuestionWithAI(id, data) {
  return request({
    url: `/api/question-bank/questions/${id}/ai-optimize`,
    method: 'post',
    data
  })
}

// AI生成解题步骤
export function generateSolutionWithAI(id, data) {
  return request({
    url: `/api/question-bank/questions/${id}/ai-solution`,
    method: 'post',
    data
  })
}

// 从文本生成题目
export function generateQuestionsFromText(data) {
  return request({
    url: '/api/question-bank/ai/text-to-questions',
    method: 'post',
    data
  })
}

// 生成相似题目
export function generateSimilarQuestions(id, data) {
  return request({
    url: `/api/question-bank/questions/${id}/ai-similar`,
    method: 'post',
    data
  })
}

// 搜索相关API

// 全文搜索题目
export function searchQuestions(params) {
  return request({
    url: '/api/question-bank/questions/search',
    method: 'get',
    params
  })
}

// 智能推荐题目
export function getRecommendedQuestions(params) {
  return request({
    url: '/api/question-bank/questions/recommendations',
    method: 'get',
    params
  })
}

// 获取相关题目
export function getRelatedQuestions(id, params) {
  return request({
    url: `/api/question-bank/questions/${id}/related`,
    method: 'get',
    params
  })
}

// 版本管理相关API

// 获取题目版本历史
export function getQuestionVersions(id) {
  return request({
    url: `/api/question-bank/questions/${id}/versions`,
    method: 'get'
  })
}

// 恢复题目版本
export function restoreQuestionVersion(id, versionId) {
  return request({
    url: `/api/question-bank/questions/${id}/versions/${versionId}/restore`,
    method: 'post'
  })
}

// 创建题目版本
export function createQuestionVersion(id, data) {
  return request({
    url: `/api/question-bank/questions/${id}/versions`,
    method: 'post',
    data
  })
}

// 批量操作相关API

// 批量更新题目
export function batchUpdateQuestions(data) {
  return request({
    url: '/api/question-bank/questions/batch-update',
    method: 'post',
    data
  })
}

// 批量添加标签
export function batchAddTags(data) {
  return request({
    url: '/api/question-bank/questions/batch-add-tags',
    method: 'post',
    data
  })
}

// 批量移除标签
export function batchRemoveTags(data) {
  return request({
    url: '/api/question-bank/questions/batch-remove-tags',
    method: 'post',
    data
  })
}

// 批量更改分类
export function batchChangeCategory(data) {
  return request({
    url: '/api/question-bank/questions/batch-change-category',
    method: 'post',
    data
  })
}

// 导入导出相关API

// 获取导入模板
export function getImportTemplate(type) {
  return request({
    url: `/api/question-bank/import/template/${type}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 验证导入数据
export function validateImportData(data) {
  return request({
    url: '/api/question-bank/import/validate',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取导入状态
export function getImportStatus(taskId) {
  return request({
    url: `/api/question-bank/import/status/${taskId}`,
    method: 'get'
  })
}

// 配置相关API

// 获取题库配置
export function getQuestionBankConfig() {
  return request({
    url: '/api/question-bank/config',
    method: 'get'
  })
}

// 更新题库配置
export function updateQuestionBankConfig(data) {
  return request({
    url: '/api/question-bank/config',
    method: 'put',
    data
  })
}

// 权限相关API

// 检查题目权限
export function checkQuestionPermission(id, action) {
  return request({
    url: `/api/question-bank/questions/${id}/permission/${action}`,
    method: 'get'
  })
}

// 获取可访问的题目
export function getAccessibleQuestions(params) {
  return request({
    url: '/api/question-bank/questions/accessible',
    method: 'get',
    params
  })
}

export default {
  getQuestions,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  batchDeleteQuestions,
  duplicateQuestion,
  importQuestions,
  exportQuestions,
  getQuestionStats,
  getQuestionUsage,
  addQuestionToAssignment,
  addQuestionToExam,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getTagCategories,
  createTagCategory,
  uploadVideo,
  addExternalVideo,
  deleteVideo,
  getQuestionVideos,
  getAnalyticsData,
  getTypeDistribution,
  getDifficultyDistribution,
  getUsageTrends,
  getSubjectDistribution,
  getTagHeatmap,
  exportAnalyticsData,
  generateQuestionWithAI,
  optimizeQuestionWithAI,
  generateSolutionWithAI,
  generateQuestionsFromText,
  generateSimilarQuestions,
  searchQuestions,
  getRecommendedQuestions,
  getRelatedQuestions,
  getQuestionVersions,
  restoreQuestionVersion,
  createQuestionVersion,
  batchUpdateQuestions,
  batchAddTags,
  batchRemoveTags,
  batchChangeCategory,
  getImportTemplate,
  validateImportData,
  getImportStatus,
  getQuestionBankConfig,
  updateQuestionBankConfig,
  checkQuestionPermission,
  getAccessibleQuestions
}