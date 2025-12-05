import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const examApi = {
  // 考试分页
  examPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/exam/admin/exam/page', { pageCurrent, pageSize, ...params })
  },

  // 考试详情
  examView: (data) => {
    return getRequest('/exam/admin/exam/view?id=' + data.id)
  },

  // 考试修改
  examEdit: (data) => {
    return putRequest('/exam/admin/exam/edit', data)
  },

  // 考试排序
  examSort: (data) => {
    return putRequest('/exam/admin/exam/sort', data)
  },

  // 考试保存
  examSave: (data) => {
    return postRequest('/exam/admin/exam/save', data)
  },

  // 考试删除
  examDelete: (data) => {
    return deleteRequest('/exam/admin/exam/delete?id=' + data.id)
  },

  // 考试复制
  examCopy: (data) => {
    return postRequest('/exam/admin/exam/copy', data)
  },

  // 考试发布
  examPublish: (data) => {
    return putRequest('/exam/admin/exam/publish', data)
  },

  // 考试取消发布
  examUnpublish: (data) => {
    return putRequest('/exam/admin/exam/unpublish', data)
  },

  // 考试开始
  examStart: (data) => {
    return putRequest('/exam/admin/exam/start', data)
  },

  // 考试结束
  examEnd: (data) => {
    return putRequest('/exam/admin/exam/end', data)
  },

  // 获取考试提交列表
  submissionPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/exam/admin/submission/page', { pageCurrent, pageSize, ...params })
  },

  // 获取考试提交详情
  submissionView: (data) => {
    return getRequest('/exam/admin/submission/view?id=' + data.id)
  },

  // 批改考试
  submissionGrade: (data) => {
    return putRequest('/exam/admin/submission/grade', data)
  },

  // 批量批改考试
  submissionBatchGrade: (data) => {
    return putRequest('/exam/admin/submission/batch/grade', data)
  },

  // 考试统计
  examStats: (data) => {
    return postRequest('/exam/admin/exam/stats', data)
  },

  // 题目库分页
  questionBankPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/exam/admin/questionbank/page', { pageCurrent, pageSize, ...params })
  },

  // 题目库详情
  questionBankView: (data) => {
    return getRequest('/exam/admin/questionbank/view?id=' + data.id)
  },

  // 题目库修改
  questionBankEdit: (data) => {
    return putRequest('/exam/admin/questionbank/edit', data)
  },

  // 题目库排序
  questionBankSort: (data) => {
    return putRequest('/exam/admin/questionbank/sort', data)
  },

  // 题目库保存
  questionBankSave: (data) => {
    return postRequest('/exam/admin/questionbank/save', data)
  },

  // 题目库删除
  questionBankDelete: (data) => {
    return deleteRequest('/exam/admin/questionbank/delete?id=' + data.id)
  },

  // 题目库复制
  questionBankCopy: (data) => {
    return postRequest('/exam/admin/questionbank/copy', data)
  },

  // 获取考试监控数据
  examMonitor: (data) => {
    return postRequest('/exam/admin/exam/monitor', data)
  },

  // 获取考试作弊记录
  examCheatingRecords: (data) => {
    return postRequest('/exam/admin/exam/cheating', data)
  },

  // 获取考试异常记录
  examAbnormalRecords: (data) => {
    return postRequest('/exam/admin/exam/abnormal', data)
  }
}
