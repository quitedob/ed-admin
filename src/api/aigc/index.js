import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const aigcApi = {
  // 作品分页查询
  worksPage: (params, pageCurrent = 1, pageSize = 20) => {
    return postRequest('/aigc/admin/works/page', { pageCurrent, pageSize, ...params })
  },

  // 作品详情
  worksDetail: (id) => {
    return getRequest(`/aigc/admin/works/detail?id=${id}`)
  },

  // 作品保存
  worksSave: (data) => {
    return postRequest('/aigc/admin/works/save', data)
  },

  // 作品修改
  worksEdit: (data) => {
    return putRequest('/aigc/admin/works/edit', data)
  },

  // 作品删除
  worksDelete: (id) => {
    return deleteRequest(`/aigc/admin/works/delete?id=${id}`)
  },

  // 作品审核
  worksAudit: (data) => {
    return putRequest('/aigc/admin/works/audit', data)
  },

  // 批量审核
  worksBatchAudit: (data) => {
    return putRequest('/aigc/admin/works/batch-audit', data)
  },

  // 作品排序
  worksSort: (data) => {
    return putRequest('/aigc/admin/works/sort', data)
  },

  // 按课程查询作品
  worksByCourse: (courseId) => {
    return getRequest(`/aigc/admin/works/by-course?courseId=${courseId}`)
  },

  // 作品墙数据
  galleryData: (courseId) => {
    return getRequest(`/aigc/admin/gallery/data?courseId=${courseId}`)
  },

  // 作品统计
  worksStats: (params) => {
    return postRequest('/aigc/admin/works/stats', params)
  },

  // 作品类型枚举
  workTypes: () => {
    return getRequest('/aigc/admin/works/types')
  },

  // 上传文件接口
  uploadFile: (data) => {
    return postRequest('/aigc/admin/upload/file', data)
  },

  // 获取作品预览链接
  getPreviewUrl: (id) => {
    return getRequest(`/aigc/admin/works/preview?id=${id}`)
  }
}