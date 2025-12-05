// 班级相关类型定义

export interface Class {
  id: string
  name: string
  code: string               // 班级码（系统生成，不可修改）
  description?: string
  grade: string              // 年级
  status: 'active' | 'inactive' | 'graduated'
  
  // 班主任列表
  headTeachers: Teacher[]
  
  // 任课老师列表
  teachers: Teacher[]
  
  // 学生列表
  students: Student[]
  
  // 统计信息
  studentCount: number
  teacherCount: number
  courseCount: number
  
  // 授权资源
  authorizedResources: ClassAuthorizedResources
  
  // 时间戳
  createdAt: string
  updatedAt?: string
}

export interface Teacher {
  id: string
  name: string
  role?: 'head_teacher' | 'subject_teacher'  // 班主任或任课老师
  subjects?: string[]        // 授课科目
}

export interface Student {
  id: string
  name: string
  studentId: string
  status?: string
}

export interface ClassAuthorizedResources {
  courses: AuthorizedCourse[]
  assignments: AuthorizedResource[]
  exams: AuthorizedResource[]
}

export interface AuthorizedCourse {
  id: string
  name: string
  category?: string
  authorizedAt: string
  // 课次开放状态
  lessonAccess?: ClassCourseLessonAccess
}

export interface AuthorizedResource {
  id: string
  name: string
  category?: string
  authorizedAt: string
}

// 班级-课程-课次开放状态
export interface ClassCourseAccess {
  classId: string
  courseId: string
  courseTitle: string
  // 每个课次的开放状态
  lessons: ClassCourseLessonAccess[]
}

export interface ClassCourseLessonAccess {
  lessonId: string
  title: string
  chapterTitle?: string      // 所属章节
  index: number              // 第几课
  isOpen: boolean            // 是否开放
}

// 班级表单数据
export interface ClassFormData {
  name: string
  description?: string
  grade: string
  status: 'active' | 'inactive' | 'graduated'
}

// 班级筛选参数
export interface ClassFilter {
  keyword?: string
  grade?: string
  status?: 'active' | 'inactive' | 'graduated'
}

// 班级查询参数
export interface ClassQueryParams extends ClassFilter {
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'createdAt' | 'studentCount'
  sortOrder?: 'asc' | 'desc'
}

// API响应类型
export interface ClassListResponse {
  list: Class[]
  total: number
  page: number
  pageSize: number
}

export interface ClassDetailResponse extends Class {
  // 详细信息可以包含更多字段
}

// 实体选择器配置
export interface EntitySelectorConfig {
  entityType: 'student' | 'teacher' | 'course' | 'assignment' | 'exam'
  multiple: boolean
  selectedIds: string[]
  title?: string
  searchPlaceholder?: string
}

// 实体选择器数据项
export interface EntitySelectorItem {
  id: string
  name: string
  [key: string]: any         // 其他字段
}
