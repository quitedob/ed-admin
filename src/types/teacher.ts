// 老师相关类型定义

export interface Teacher {
  id: string
  teacherId: string          // 工号
  name: string
  mobile?: string            // 手机号
  email?: string
  gender?: 'male' | 'female'
  birthDate?: string
  joinDate?: string          // 入职日期
  status: 'active' | 'inactive'
  
  // 角色/权限（替代原来的部门）
  roleIds: string[]
  
  // 授课科目（替代原来的"专业领域"）
  subjects: string[]         // eg. ['数学', '前端', '算法']
  
  // 个人简介（富文本，合并原来的简介/教学经验/荣誉）
  profileHtml?: string
  
  // 教学年限 → 个人信息部分
  teachingYears?: number
  
  // 系统统计信息
  stats: TeacherStats
  
  // 其他基本信息
  address?: string
  avatar?: string
  
  // 时间戳
  createdAt?: string
  updatedAt?: string
}

export interface TeacherStats {
  classCount: number         // 负责班级数
  studentCount: number       // 学生总数
  courseCount: number        // 授权课程数
  assignmentCount: number    // 授权作业数
  examCount: number          // 授权考试数
}

// 角色定义
export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]      // 权限列表
  isSystem: boolean          // 是否系统角色
  createdAt: string
  updatedAt: string
}

// 科目定义
export interface Subject {
  id: string
  name: string
  category?: string          // 科目分类
  description?: string
  icon?: string
  color?: string
}

// 老师授权资源
export interface TeacherAuthorization {
  teacherId: string
  courses: AuthorizedResource[]
  assignments: AuthorizedResource[]
  exams: AuthorizedResource[]
  classes: AuthorizedResource[]
}

export interface AuthorizedResource {
  id: string
  name: string
  category?: string
  authorizedAt: string
  authorizedBy?: string
}

// 老师表单数据
export interface TeacherFormData {
  teacherId: string
  name: string
  mobile: string
  email: string
  gender: 'male' | 'female'
  birthDate?: string
  joinDate?: string
  status: 'active' | 'inactive'
  roleIds: string[]
  subjects: string[]
  profileHtml?: string
  teachingYears?: number
  address?: string
}

// 老师筛选参数
export interface TeacherFilter {
  keyword?: string
  status?: 'active' | 'inactive'
  roleIds?: string[]
  subjects?: string[]
  teachingYearsRange?: [number, number]
  joinDateRange?: [string, string]
}

// 老师列表查询参数
export interface TeacherQueryParams extends TeacherFilter {
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'joinDate' | 'teachingYears' | 'classCount'
  sortOrder?: 'asc' | 'desc'
}

// API响应类型
export interface TeacherListResponse {
  list: Teacher[]
  total: number
  page: number
  pageSize: number
}

export interface TeacherDetailResponse extends Teacher {
  authorizedResources: TeacherAuthorization
}
