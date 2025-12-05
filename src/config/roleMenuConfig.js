/**
 * 角色菜单配置
 * 不同角色登录后显示不同的侧边栏菜单
 */

// 管理员菜单 - 全部功能
export const adminMenuList = [
  { id: 1, menuName: '首页', path: '/dashboard', menuIcon: 'dashboard', parentId: 0, children: [] },
  {
    id: 2,
    menuName: '课程管理',
    path: '/course',
    menuIcon: 'course',
    parentId: 0,
    children: [
      { id: 21, menuName: '课程列表', path: '/course', parentId: 2 },
      { id: 22, menuName: '课程详情', path: '/course/detail', parentId: 2 },
      { id: 23, menuName: '创建课程', path: '/course/create', parentId: 2 },
      { id: 24, menuName: '编辑课程', path: '/course/update', parentId: 2 },
      { id: 25, menuName: '课程分析', path: '/course/analytics', parentId: 2 },
      { id: 26, menuName: '章节管理', path: '/course/chapter', parentId: 2 },
      { id: 27, menuName: '课程数据', path: '/course/record', parentId: 2 }
    ]
  },
  {
    id: 3,
    menuName: '学生管理',
    path: '/users',
    menuIcon: 'users',
    parentId: 0,
    children: [
      { id: 31, menuName: '学生列表', path: '/users', parentId: 3 },
      { id: 32, menuName: '学生记录', path: '/users/record', parentId: 3 },
      { id: 33, menuName: '学习报告', path: '/learning/report', parentId: 3 },
      { id: 34, menuName: '授权管理', path: '/authorization', parentId: 3 },
      { id: 35, menuName: '我的课程', path: '/student/my-courses', parentId: 3 }
    ]
  },
  {
    id: 4,
    menuName: 'AIGC管理',
    path: '/aigc',
    menuIcon: 'picture',
    parentId: 0,
    children: [
      { id: 41, menuName: '作品管理', path: '/aigc/works', parentId: 4 },
      { id: 42, menuName: '作品墙', path: '/aigc/gallery', parentId: 4 }
    ]
  },
  {
    id: 10,
    menuName: '素材管理',
    path: '/material',
    menuIcon: 'folder',
    parentId: 0,
    children: []
  },
  {
    id: 5,
    menuName: '题库管理',
    path: '/assignments',
    menuIcon: 'document',
    parentId: 0,
    children: [
      { id: 51, menuName: '题库管理', path: '/assignments', parentId: 5 },
      { id: 52, menuName: '提交记录', path: '/oj/submission', parentId: 5 }
    ]
  },
  {
    id: 7,
    menuName: '作业管理',
    path: '/homework',
    menuIcon: 'edit-pen',
    parentId: 0,
    children: [
      { id: 71, menuName: '作业列表', path: '/homework/list', parentId: 7 },
      { id: 72, menuName: '作业批改', path: '/homework/review', parentId: 7 },
      { id: 73, menuName: '作业统计', path: '/homework/statistics', parentId: 7 }
    ]
  },
  {
    id: 8,
    menuName: '考试管理',
    path: '/exam',
    menuIcon: 'video-play',
    parentId: 0,
    children: [
      { id: 81, menuName: '考试列表', path: '/exam/list', parentId: 8 },
      { id: 82, menuName: '考试监控', path: '/exam/monitor', parentId: 8 },
      { id: 83, menuName: '成绩管理', path: '/exam/grades', parentId: 8 }
    ]
  },
  {
    id: 6,
    menuName: 'AI助教',
    path: '/ai',
    menuIcon: 'chat-dot-round',
    parentId: 0,
    children: [
      { id: 61, menuName: '助教管理', path: '/ai/assistant', parentId: 6 }
    ]
  },
  {
    id: 9,
    menuName: '班级管理',
    path: '/class',
    menuIcon: 'user',
    parentId: 0,
    children: [
      { id: 91, menuName: '班级管理', path: '/class/management', parentId: 9 },
      { id: 92, menuName: '班级授权', path: '/class/authorization', parentId: 9 }
    ]
  },
  {
    id: 12,
    menuName: '系统管理',
    path: '/system',
    menuIcon: 'setting',
    parentId: 0,
    children: [
      { id: 121, menuName: '角色管理', path: '/system/role', parentId: 12 },
      { id: 122, menuName: '系统设置', path: '/system/settings', parentId: 12 }
    ]
  },
  {
    id: 13,
    menuName: '老师管理',
    path: '/users/lecturer',
    menuIcon: 'user',
    parentId: 0,
    children: [
      { id: 131, menuName: '老师列表', path: '/users/lecturer', parentId: 13 },
      { id: 132, menuName: '老师日志', path: '/users/log', parentId: 13 }
    ]
  }
]

// 班主任菜单 - 没有系统管理和老师管理
export const headTeacherMenuList = [
  { id: 1, menuName: '首页', path: '/dashboard', menuIcon: 'dashboard', parentId: 0, children: [] },
  {
    id: 2,
    menuName: '课程管理',
    path: '/course',
    menuIcon: 'course',
    parentId: 0,
    children: [
      { id: 21, menuName: '课程列表', path: '/course', parentId: 2 },
      { id: 22, menuName: '课程详情', path: '/course/detail', parentId: 2 },
      { id: 23, menuName: '创建课程', path: '/course/create', parentId: 2 },
      { id: 24, menuName: '编辑课程', path: '/course/update', parentId: 2 },
      { id: 25, menuName: '课程分析', path: '/course/analytics', parentId: 2 },
      { id: 26, menuName: '章节管理', path: '/course/chapter', parentId: 2 },
      { id: 27, menuName: '课程数据', path: '/course/record', parentId: 2 }
    ]
  },
  {
    id: 3,
    menuName: '学生管理',
    path: '/users',
    menuIcon: 'users',
    parentId: 0,
    children: [
      { id: 31, menuName: '学生列表', path: '/users', parentId: 3 },
      { id: 32, menuName: '学生记录', path: '/users/record', parentId: 3 },
      { id: 33, menuName: '学习报告', path: '/learning/report', parentId: 3 },
      { id: 34, menuName: '授权管理', path: '/authorization', parentId: 3 },
      { id: 35, menuName: '我的课程', path: '/student/my-courses', parentId: 3 }
    ]
  },
  {
    id: 4,
    menuName: 'AIGC管理',
    path: '/aigc',
    menuIcon: 'picture',
    parentId: 0,
    children: [
      { id: 41, menuName: '作品管理', path: '/aigc/works', parentId: 4 },
      { id: 42, menuName: '作品墙', path: '/aigc/gallery', parentId: 4 }
    ]
  },
  {
    id: 10,
    menuName: '素材管理',
    path: '/material',
    menuIcon: 'folder',
    parentId: 0,
    children: []
  },
  {
    id: 5,
    menuName: '题库管理',
    path: '/assignments',
    menuIcon: 'document',
    parentId: 0,
    children: [
      { id: 51, menuName: '题库管理', path: '/assignments', parentId: 5 },
      { id: 52, menuName: '提交记录', path: '/oj/submission', parentId: 5 }
    ]
  },
  {
    id: 7,
    menuName: '作业管理',
    path: '/homework',
    menuIcon: 'edit-pen',
    parentId: 0,
    children: [
      { id: 71, menuName: '作业列表', path: '/homework/list', parentId: 7 },
      { id: 72, menuName: '作业批改', path: '/homework/review', parentId: 7 },
      { id: 73, menuName: '作业统计', path: '/homework/statistics', parentId: 7 }
    ]
  },
  {
    id: 8,
    menuName: '考试管理',
    path: '/exam',
    menuIcon: 'video-play',
    parentId: 0,
    children: [
      { id: 81, menuName: '考试列表', path: '/exam/list', parentId: 8 },
      { id: 82, menuName: '考试监控', path: '/exam/monitor', parentId: 8 },
      { id: 83, menuName: '成绩管理', path: '/exam/grades', parentId: 8 }
    ]
  },
  {
    id: 6,
    menuName: 'AI助教',
    path: '/ai',
    menuIcon: 'chat-dot-round',
    parentId: 0,
    children: [
      { id: 61, menuName: '助教管理', path: '/ai/assistant', parentId: 6 }
    ]
  },
  {
    id: 9,
    menuName: '班级管理',
    path: '/class',
    menuIcon: 'user',
    parentId: 0,
    children: [
      { id: 91, menuName: '班级管理', path: '/class/management', parentId: 9 },
      { id: 92, menuName: '班级授权', path: '/class/authorization', parentId: 9 }
    ]
  }
  // 班主任没有：系统管理、老师管理
]

// 老师菜单 - 没有系统管理、老师管理、学生管理，有班级管理（但不能管理教师）
export const teacherMenuList = [
  { id: 1, menuName: '首页', path: '/dashboard', menuIcon: 'dashboard', parentId: 0, children: [] },
  {
    id: 2,
    menuName: '课程管理',
    path: '/course',
    menuIcon: 'course',
    parentId: 0,
    children: [
      { id: 21, menuName: '课程列表', path: '/course', parentId: 2 },
      { id: 22, menuName: '课程详情', path: '/course/detail', parentId: 2 },
      { id: 23, menuName: '创建课程', path: '/course/create', parentId: 2 },
      { id: 24, menuName: '编辑课程', path: '/course/update', parentId: 2 },
      { id: 25, menuName: '课程分析', path: '/course/analytics', parentId: 2 },
      { id: 26, menuName: '章节管理', path: '/course/chapter', parentId: 2 },
      { id: 27, menuName: '课程数据', path: '/course/record', parentId: 2 }
    ]
  },
  {
    id: 4,
    menuName: 'AIGC管理',
    path: '/aigc',
    menuIcon: 'picture',
    parentId: 0,
    children: [
      { id: 41, menuName: '作品管理', path: '/aigc/works', parentId: 4 },
      { id: 42, menuName: '作品墙', path: '/aigc/gallery', parentId: 4 }
    ]
  },
  {
    id: 10,
    menuName: '素材管理',
    path: '/material',
    menuIcon: 'folder',
    parentId: 0,
    children: []
  },
  {
    id: 5,
    menuName: '题库管理',
    path: '/assignments',
    menuIcon: 'document',
    parentId: 0,
    children: [
      { id: 51, menuName: '题库管理', path: '/assignments', parentId: 5 },
      { id: 52, menuName: '提交记录', path: '/oj/submission', parentId: 5 }
    ]
  },
  {
    id: 7,
    menuName: '作业管理',
    path: '/homework',
    menuIcon: 'edit-pen',
    parentId: 0,
    children: [
      { id: 71, menuName: '作业列表', path: '/homework/list', parentId: 7 },
      { id: 72, menuName: '作业批改', path: '/homework/review', parentId: 7 },
      { id: 73, menuName: '作业统计', path: '/homework/statistics', parentId: 7 }
    ]
  },
  {
    id: 8,
    menuName: '考试管理',
    path: '/exam',
    menuIcon: 'video-play',
    parentId: 0,
    children: [
      { id: 81, menuName: '考试列表', path: '/exam/list', parentId: 8 },
      { id: 82, menuName: '考试监控', path: '/exam/monitor', parentId: 8 },
      { id: 83, menuName: '成绩管理', path: '/exam/grades', parentId: 8 }
    ]
  },
  {
    id: 6,
    menuName: 'AI助教',
    path: '/ai',
    menuIcon: 'chat-dot-round',
    parentId: 0,
    children: [
      { id: 61, menuName: '助教管理', path: '/ai/assistant', parentId: 6 }
    ]
  },
  {
    id: 9,
    menuName: '班级管理',
    path: '/class',
    menuIcon: 'user',
    parentId: 0,
    children: [
      { id: 91, menuName: '班级管理', path: '/class/management', parentId: 9 }
    ]
  }
  // 老师没有：系统管理、老师管理、学生管理
]

// 根据角色获取菜单
export function getMenuListByRole(role) {
  switch (role) {
    case 'admin':
      return adminMenuList
    case 'headTeacher':
      return headTeacherMenuList
    case 'teacher':
      return teacherMenuList
    default:
      return adminMenuList
  }
}

// 角色信息配置
export const ROLE_INFO = {
  admin: { name: '管理员', color: '#409EFF' },
  headTeacher: { name: '班主任', color: '#67C23A' },
  teacher: { name: '老师', color: '#E6A23C' }
}

// 管理员权限 - 全部权限
export const adminPermissions = ['*']

// 班主任权限 - 没有系统管理和老师管理权限，有全局视角
export const headTeacherPermissions = [
  // 数据视角权限 - 班主任有全局视角，可以看到所有班级
  'data:global-view',
  // 仪表盘
  'dashboard:view', 'stat:data', 'stat:login', 'stat:vod',
  // 班级管理 - 全部权限
  'class:view', 'class:create', 'class:edit', 'class:delete', 'class:import',
  'class:manage-resources', 'class:manage-courses', 'class:manage-homeworks', 'class:manage-exams',
  'class:manage-teachers', 'class:manage-students',
  // 课程管理
  'course:view', 'course:create', 'course:edit', 'course:delete', 'course:save',
  'course:manage-chapters', 'course:chapter:create', 'course:chapter:edit', 'course:chapter:delete',
  'course:section:create', 'course:section:edit', 'course:section:delete',
  'course:upload-video', 'course:upload-document',
  // 学生管理
  'student:view', 'student:view-detail', 'student:view-homework', 'student:view-exam', 'student:view-learning',
  'student:manage-in-class', 'student:add-to-class', 'student:remove-from-class',
  // 题库管理
  'question:view', 'question:create', 'question:edit', 'question:delete', 'question:import', 'question:export', 'question:manage-tags',
  // 作业管理
  'homework:view', 'homework:create', 'homework:edit', 'homework:delete',
  'homework:grade', 'homework:view-statistics',
  // 考试管理
  'exam:view', 'exam:create', 'exam:edit', 'exam:delete',
  'exam:monitor', 'exam:grade', 'exam:view-statistics',
  // 素材管理
  'material:view', 'material:upload', 'material:edit', 'material:delete',
  // AIGC
  'aigc:view', 'aigc:delete',
  // AI助教
  'ai:assistant:view', 'ai:assistant:config'
]

// 老师权限 - 没有系统管理、老师管理、学生管理，有班级管理（但不能管理教师），只有个人视角
export const teacherPermissions = [
  // 数据视角权限 - 老师只有个人视角，只能看到被授权的班级
  'data:personal-view',
  // 注意：没有 'data:global-view' 权限，所以只能看到自己被授权的数据
  // 仪表盘
  'dashboard:view', 'stat:data',
  // 班级管理 - 可以查看和编辑，可以管理课程/作业/考试/学生，但不能管理教师
  'class:view', 'class:edit',
  'class:manage-resources', 'class:manage-courses', 'class:manage-homeworks', 'class:manage-exams',
  'class:manage-students',
  // 注意：没有 'class:manage-teachers' 权限
  // 课程管理 - 只能查看和编辑，不能删除
  'course:view', 'course:create', 'course:edit', 'course:save',
  'course:manage-chapters', 'course:chapter:create', 'course:chapter:edit',
  'course:section:create', 'course:section:edit',
  'course:upload-video', 'course:upload-document',
  // 题库管理 - 只能查看和创建，不能删除和导入
  'question:view', 'question:create', 'question:edit',
  // 作业管理 - 可以创建和批改，不能删除
  'homework:view', 'homework:create', 'homework:edit',
  'homework:grade', 'homework:view-statistics',
  // 考试管理 - 可以创建和批改，不能删除
  'exam:view', 'exam:create', 'exam:edit',
  'exam:grade', 'exam:view-statistics',
  // 素材管理 - 只能查看和上传
  'material:view', 'material:upload',
  // AIGC - 只能查看
  'aigc:view',
  // AI助教
  'ai:assistant:view'
]

// 根据角色获取权限
export function getPermissionsByRole(role) {
  switch (role) {
    case 'admin':
      return adminPermissions
    case 'headTeacher':
      return headTeacherPermissions
    case 'teacher':
      return teacherPermissions
    default:
      return adminPermissions
  }
}
