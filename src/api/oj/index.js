import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const ojApi = {
  // 题目管理相关API
  // 题目分页查询
  problemPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/oj/admin/problem/page', { pageCurrent, pageSize, ...params })
  },

  // 题目详情
  problemDetail: (id) => {
    return getRequest(`/oj/admin/problem/detail?id=${id}`)
  },

  // 题目保存
  problemSave: (data) => {
    return postRequest('/oj/admin/problem/save', data)
  },

  // 题目修改
  problemEdit: (data) => {
    return putRequest('/oj/admin/problem/edit', data)
  },

  // 题目删除
  problemDelete: (id) => {
    return deleteRequest(`/oj/admin/problem/delete?id=${id}`)
  },

  // 题目复制
  problemCopy: (id) => {
    return postRequest(`/oj/admin/problem/copy?id=${id}`)
  },

  // 题目标签管理
  problemTags: () => {
    return getRequest('/oj/admin/problem/tags')
  },

  // 题目难度枚举
  problemDifficulties: () => {
    return getRequest('/oj/admin/problem/difficulties')
  },

  // 题目分类枚举
  problemCategories: () => {
    return getRequest('/oj/admin/problem/categories')
  },

  // 提交记录相关API
  // 提交记录分页
  submissionPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/oj/admin/submission/page', { pageCurrent, pageSize, ...params })
  },

  // 提交记录详情
  submissionDetail: (id) => {
    return getRequest(`/oj/admin/submission/detail?id=${id}`)
  },

  // 重新评测
  rejudgeSubmission: (id) => {
    return putRequest(`/oj/admin/submission/rejudge?id=${id}`)
  },

  // 批量重新评测
  batchRejudge: (ids) => {
    return putRequest(`/oj/admin/submission/batch-rejudge?ids=${ids.join(',')}`)
  },

  // 获取评测状态枚举
  submissionStatuses: () => {
    return getRequest('/oj/admin/submission/statuses')
  },

  // 题解管理相关API
  // 题解分页查询
  solutionPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/oj/admin/solution/page', { pageCurrent, pageSize, ...params })
  },

  // 题解详情
  solutionDetail: (id) => {
    return getRequest(`/oj/admin/solution/detail?id=${id}`)
  },

  // 题解保存
  solutionSave: (data) => {
    return postRequest('/oj/admin/solution/save', data)
  },

  // 题解修改
  solutionEdit: (data) => {
    return putRequest('/oj/admin/solution/edit', data)
  },

  // 题解删除
  solutionDelete: (id) => {
    return deleteRequest(`/oj/admin/solution/delete?id=${id}`)
  },

  // 题解审核
  solutionAudit: (data) => {
    return putRequest('/oj/admin/solution/audit', data)
  },

  // 题库管理相关API
  // 题库分页查询
  problemSetPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/oj/admin/problem-set/page', { pageCurrent, pageSize, ...params })
  },

  // 题库详情
  problemSetDetail: (id) => {
    return getRequest(`/oj/admin/problem-set/detail?id=${id}`)
  },

  // 题库保存
  problemSetSave: (data) => {
    return postRequest('/oj/admin/problem-set/save', data)
  },

  // 题库修改
  problemSetEdit: (data) => {
    return putRequest('/oj/admin/problem-set/edit', data)
  },

  // 题库删除
  problemSetDelete: (id) => {
    return deleteRequest(`/oj/admin/problem-set/delete?id=${id}`)
  },

  // 题库添加题目
  problemSetAddProblem: (setId, problemId) => {
    return postRequest(`/oj/admin/problem-set/add-problem?setId=${setId}&problemId=${problemId}`)
  },

  // 题库移除题目
  problemSetRemoveProblem: (setId, problemId) => {
    return deleteRequest(`/oj/admin/problem-set/remove-problem?setId=${setId}&problemId=${problemId}`)
  },

  // 统计相关API
  // 获取题目统计
  problemStats: (params) => {
    return postRequest('/oj/admin/stats/problem', params)
  },

  // 获取提交统计
  submissionStats: (params) => {
    return postRequest('/oj/admin/stats/submission', params)
  },

  // 获取用户统计
  userStats: (params) => {
    return postRequest('/oj/admin/stats/user', params)
  },

  // 课程集成相关API
  // 按课程查询题目
  problemsByCourse: (courseId) => {
    return getRequest(`/oj/admin/problem/by-course?courseId=${courseId}`)
  },

  // 题目关联教学内容
  linkToContent: (data) => {
    return postRequest('/oj/admin/problem/link-content', data)
  },

  // 获取关联的教学内容
  getLinkedContent: (problemId) => {
    return getRequest(`/oj/admin/problem/linked-content?problemId=${problemId}`)
  },

  // 测试用例管理
  // 获取测试用例
  getTestCases: (problemId) => {
    return getRequest(`/oj/admin/problem/test-cases?problemId=${problemId}`)
  },

  // 保存测试用例
  saveTestCase: (data) => {
    return postRequest('/oj/admin/problem/save-test-case', data)
  },

  // 删除测试用例
  deleteTestCase: (id) => {
    return deleteRequest(`/oj/admin/problem/delete-test-case?id=${id}`)
  },

  // 代码模板管理
  // 获取代码模板
  getCodeTemplates: (problemId) => {
    return getRequest(`/oj/admin/problem/code-templates?problemId=${problemId}`)
  },

  // 保存代码模板
  saveCodeTemplate: (data) => {
    return postRequest('/oj/admin/problem/save-code-template', data)
  },

  // 评测配置
  // 获取评测配置
  getJudgeConfig: (problemId) => {
    return getRequest(`/oj/admin/problem/judge-config?problemId=${problemId}`)
  },

  // 保存评测配置
  saveJudgeConfig: (data) => {
    return postRequest('/oj/admin/problem/save-judge-config', data)
  }
}