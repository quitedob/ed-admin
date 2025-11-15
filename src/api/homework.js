import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'
import { mockApi } from '@/utils/mockData'

export const homeworkApi = {
  // 作业分页
  homeworkPage: (params, pageCurrent = 1, pageSize = 20) => {
    // 使用模拟数据代替真实API请求
    return mockApi.getHomeworks({ ...params, page: pageCurrent, pageSize })
  },

  // 作业详情
  homeworkView: (data) => {
    return getRequest('/homework/admin/homework/view?id=' + data.id)
  },

  // 作业修改
  homeworkEdit: (data) => {
    return putRequest('/homework/admin/homework/edit', data)
  },

  // 作业排序
  homeworkSort: (data) => {
    return putRequest('/homework/admin/homework/sort', data)
  },

  // 作业保存
  homeworkSave: (data) => {
    return postRequest('/homework/admin/homework/save', data)
  },

  // 作业删除
  homeworkDelete: (data) => {
    return deleteRequest('/homework/admin/homework/delete?id=' + data.id)
  },

  // 作业复制
  homeworkCopy: (data) => {
    return postRequest('/homework/admin/homework/copy', data)
  },

  // 作业发布
  homeworkPublish: (data) => {
    return putRequest('/homework/admin/homework/publish', data)
  },

  // 作业取消发布
  homeworkUnpublish: (data) => {
    return putRequest('/homework/admin/homework/unpublish', data)
  },

  // 获取作业提交列表
  submissionPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/homework/admin/submission/page', { pageCurrent, pageSize, ...params })
  },

  // 获取作业提交详情
  submissionView: (data) => {
    return getRequest('/homework/admin/submission/view?id=' + data.id)
  },

  // 批改作业
  submissionGrade: (data) => {
    return putRequest('/homework/admin/submission/grade', data)
  },

  // 批量批改作业
  submissionBatchGrade: (data) => {
    return putRequest('/homework/admin/submission/batch/grade', data)
  },

  // 作业统计
  homeworkStats: (data) => {
    // 使用模拟数据代替真实API请求
    return Promise.resolve({
      totalSubmissions: 2543,
      averageScore: 82.3,
      completionRate: 78.5
    })
  },

  // ========== 统一题目库相关API ==========

  // 获取题目库列表（支持所有5种题型）
  questionBankPage: (params, pageCurrent = 1, pageSize = 20) => {
    // 在开发阶段使用mock数据，生产环境替换为真实API
    return mockApi.getQuestionBank({ ...params, page: pageCurrent, pageSize })
  },

  // 获取题目详情
  questionView: (data) => {
    return mockApi.getQuestionDetail(data.id)
  },

  // 添加题目到题库
  questionSave: (data) => {
    return mockApi.addQuestion(data)
  },

  // 更新题目
  questionEdit: (data) => {
    return mockApi.updateQuestion(data.id, data)
  },

  // 删除题目
  questionDelete: (data) => {
    return mockApi.deleteQuestion(data.id)
  },

  // 批量导入题目
  questionImport: (data) => {
    return mockApi.importQuestions(data.questions)
  },

  // 导出题目
  questionExport: (data) => {
    return mockApi.exportQuestions(data)
  },

  // 获取题目统计信息
  questionStats: () => {
    return mockApi.getQuestionStats()
  },

  // ========== 作业导入相关API ==========

  // 从题目库导入题目到作业
  importQuestionsToHomework: (homeworkId, questionIds) => {
    return postRequest('/homework/admin/homework/import-questions', {
      homeworkId,
      questionIds
    })
  },

  // 导入完整作业模板
  importHomeworkTemplate: (data) => {
    return postRequest('/homework/admin/homework/import-template', data)
  },

  // 获取作业模板列表
  homeworkTemplatePage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/homework/admin/homework-template/page', {
      pageCurrent,
      pageSize,
      ...params
    })
  },

  // 复制作业（包含题目）
  homeworkCopyWithQuestions: (data) => {
    return postRequest('/homework/admin/homework/copy-with-questions', data)
  },

  // ========== OJ题目集成API ==========

  // 获取OJ题目列表（用于导入到作业）
  ojQuestionsPage: (params, pageCurrent = 1, pageSize = 20) => {
    return mockApi.getOJProblems({ ...params, page: pageCurrent, pageSize })
  },

  // 将OJ题目转换为作业题目格式
  convertOjQuestionToHomework: (ojQuestionId) => {
    return postRequest('/homework/admin/oj-question/convert', {
      ojQuestionId
    })
  },

  // 获取作业中的OJ题目提交记录
  ojSubmissionPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/homework/admin/oj-submission/page', {
      pageCurrent,
      pageSize,
      ...params
    })
  },

  // ========== 混合题型作业API ==========

  // 创建包含多种题型的作业
  createMixedHomework: (data) => {
    return postRequest('/homework/admin/homework/create-mixed', data)
  },

  // 获取混合作业统计
  mixedHomeworkStats: (homeworkId) => {
    return getRequest(`/homework/admin/homework/mixed-stats?id=${homeworkId}`)
  },

  // 批量操作题目
  batchQuestionOperations: (data) => {
    return postRequest('/homework/admin/question/batch-operations', data)
  },

  // ========== 作业模板管理API ==========

  // 保存作业模板
  saveHomeworkTemplate: (data) => {
    return postRequest('/homework/admin/homework-template/save', data)
  },

  // 获取作业模板详情
  homeworkTemplateView: (templateId) => {
    return getRequest(`/homework/admin/homework-template/view?id=${templateId}`)
  },

  // 删除作业模板
  homeworkTemplateDelete: (templateId) => {
    return deleteRequest(`/homework/admin/homework-template/delete?id=${templateId}`)
  },

  // 应用作业模板
  applyHomeworkTemplate: (templateId, courseId) => {
    return postRequest('/homework/admin/homework-template/apply', {
      templateId,
      courseId
    })
  }
}
