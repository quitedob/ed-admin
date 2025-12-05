import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const authorizationApi = {
  // 授权记录分页查询
  authPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/auth/admin/authorization/page', { pageCurrent, pageSize, ...params })
  },

  // 授权记录详情
  authDetail: (id) => {
    return getRequest(`/auth/admin/authorization/detail?id=${id}`)
  },

  // 创建授权
  authSave: (data) => {
    return postRequest('/auth/admin/authorization/save', data)
  },

  // 批量授权
  authBatchSave: (data) => {
    return postRequest('/auth/admin/authorization/batch-save', data)
  },

  // 修改授权
  authEdit: (data) => {
    return putRequest('/auth/admin/authorization/edit', data)
  },

  // 删除授权
  authDelete: (id) => {
    return deleteRequest(`/auth/admin/authorization/delete?id=${id}`)
  },

  // 批量删除授权
  authBatchDelete: (ids) => {
    return deleteRequest(`/auth/admin/authorization/batch-delete?ids=${ids.join(',')}`)
  },

  // 激活/停用授权
  authToggleStatus: (id, status) => {
    return putRequest(`/auth/admin/authorization/toggle-status?id=${id}&status=${status}`)
  },

  // 按学生查询授权
  authByStudent: (studentId) => {
    return getRequest(`/auth/admin/authorization/by-student?studentId=${studentId}`)
  },

  // 按课程查询授权
  authByCourse: (courseId) => {
    return getRequest(`/auth/admin/authorization/by-course?courseId=${courseId}`)
  },

  // 按课次查询授权
  authByLesson: (lessonId) => {
    return getRequest(`/auth/admin/authorization/by-lesson?lessonId=${lessonId}`)
  },

  // 批量授权 - 按课程
  batchAuthByCourse: (data) => {
    return postRequest('/auth/admin/authorization/batch-by-course', data)
  },

  // 批量授权 - 按班级
  batchAuthByClass: (data) => {
    return postRequest('/auth/admin/authorization/batch-by-class', data)
  },

  // 一键全部开放/关闭
  toggleAllAccess: (courseId, status) => {
    return putRequest(`/auth/admin/authorization/toggle-all?courseId=${courseId}&status=${status}`)
  },

  // 学员学习进度查询
  studyProgress: (params) => {
    return postRequest('/auth/admin/authorization/study-progress', params)
  },

  // 作业完成情况查询
  homeworkCompletion: (params) => {
    return postRequest('/auth/admin/authorization/homework-completion', params)
  },

  // 授权统计
  authStats: (params) => {
    return postRequest('/auth/admin/authorization/stats', params)
  },

  // 导出授权数据
  exportAuthData: (params) => {
    return postRequest('/auth/admin/authorization/export', params)
  },

  // 授权历史记录
  authHistory: (authId) => {
    return getRequest(`/auth/admin/authorization/history?authId=${authId}`)
  },

  // 获取可授权的课程列表
  getAvailableCourses: () => {
    return getRequest('/auth/admin/authorization/available-courses')
  },

  // 获取可授权的学生列表
  getAvailableStudents: (params) => {
    return postRequest('/auth/admin/authorization/available-students', params)
  },

  // 获取班级列表
  getClassList: () => {
    return getRequest('/auth/admin/authorization/class-list')
  }
}