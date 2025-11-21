import request from '@/utils/request'

/**
 * 班级授权相关API
 */

// 获取课程已授权的班级列表
export function getAuthorizedClasses(courseId) {
  return request({
    url: `/class/admin/course/${courseId}/authorized-classes`,
    method: 'get'
  })
}

// 添加班级授权
export function addClassAuthorization(data) {
  return request({
    url: '/class/admin/course/authorization',
    method: 'post',
    data: {
      courseId: data.courseId,
      classIds: data.classIds
    }
  })
}

// 移除班级授权
export function removeClassAuthorization(courseId, classId) {
  return request({
    url: `/class/admin/course/${courseId}/authorization/${classId}`,
    method: 'delete'
  })
}

// 获取章节开放状态
export function getChapterOpenStatus(classId, courseId) {
  return request({
    url: `/class/admin/course/chapter/open-status`,
    method: 'get',
    params: {
      classId,
      courseId
    }
  })
}

// 更新章节开放状态
export function updateChapterOpenStatus(data) {
  return request({
    url: '/class/admin/course/chapter/open',
    method: 'post',
    data: {
      classId: data.classId,
      courseId: data.courseId,
      chapterId: data.chapterId,
      isOpen: data.isOpen,
      openAt: data.openAt,
      closeAt: data.closeAt
    }
  })
}

// 批量更新章节开放状态
export function batchUpdateChapterOpenStatus(data) {
  return request({
    url: '/class/admin/course/chapter/batch-open',
    method: 'post',
    data: {
      classId: data.classId,
      courseId: data.courseId,
      chapterIds: data.chapterIds,
      isOpen: data.isOpen
    }
  })
}

// 获取可授权的班级列表（未授权的班级）
export function getAvailableClasses(courseId) {
  return request({
    url: `/class/admin/course/${courseId}/available-classes`,
    method: 'get'
  })
}

// 更新班级授权状态（active/paused/finished）
export function updateClassAuthorizationStatus(courseId, classId, status) {
  return request({
    url: `/class/admin/course/${courseId}/authorization/${classId}/status`,
    method: 'put',
    data: {
      status
    }
  })
}
