// src/utils/permissionList.js
// 优化后的系统权限清单 - 支持层级结构、清晰的权限分类

export const PERMISSION_MODULES = [
  {
    label: '数据视角',
    code: 'data-view',
    permissions: [
      {
        label: '全局视角',
        value: 'data:global-view',
        description: '可以查看系统中所有数据（所有班级、课程、作业、考试等），适用于管理员和班主任'
      },
      {
        label: '个人视角',
        value: 'data:personal-view',
        description: '只能查看被授权的数据（被分配的班级、课程等），适用于普通教师'
      }
    ]
  },
  {
    label: '仪表盘',
    code: 'dashboard',
    permissions: [
      { label: '访问仪表盘', value: 'dashboard:view', description: '查看统计数据和概览' }
    ]
  },
  {
    label: '班级管理',
    code: 'class',
    permissions: [
      // 基础管理
      { label: '查看班级', value: 'class:view', description: '查看班级列表和详情' },
      { label: '创建班级', value: 'class:create', description: '新建班级' },
      { label: '编辑班级', value: 'class:edit', description: '修改班级基本信息' },
      { label: '删除班级', value: 'class:delete', description: '删除班级' },
      { label: '批量导入', value: 'class:import', description: 'Excel批量导入班级' },

      // 资源授权(子权限组)
      {
        label: '管理班级资源',
        value: 'class:manage-resources',
        description: '为班级授权课程、作业、考试',
        children: [
          { label: '管理课程', value: 'class:manage-courses', description: '为班级添加/移除课程' },
          { label: '管理作业', value: 'class:manage-homeworks', description: '为班级添加/移除作业' },
          { label: '管理考试', value: 'class:manage-exams', description: '为班级添加/移除考试' }
        ]
      },

      // 人员管理(子权限组)
      {
        label: '管理班级成员',
        value: 'class:manage-members',
        description: '管理班级的教师和学生',
        children: [
          { label: '管理教师', value: 'class:manage-teachers', description: '为班级分配/移除教师' },
          { label: '管理学生', value: 'class:manage-students', description: '为班级添加/移除学生' }
        ]
      }
    ]
  },
  {
    label: '课程管理',
    code: 'course',
    permissions: [
      // 课程基础管理
      { label: '查看课程', value: 'course:view', description: '查看课程列表和详情' },
      { label: '创建课程', value: 'course:create', description: '新建课程' },
      { label: '编辑课程', value: 'course:edit', description: '修改课程基本信息和设置' },
      { label: '删除课程', value: 'course:delete', description: '删除课程' },

      // 章节管理(子权限组)
      {
        label: '管理章节',
        value: 'course:manage-chapters',
        description: '管理课程章节和小节',
        children: [
          { label: '创建章节', value: 'course:chapter:create', description: '新增课程章节' },
          { label: '编辑章节', value: 'course:chapter:edit', description: '修改章节信息' },
          { label: '删除章节', value: 'course:chapter:delete', description: '删除课程章节' },
          { label: '创建小节', value: 'course:section:create', description: '新增课程小节' },
          { label: '编辑小节', value: 'course:section:edit', description: '修改小节内容' },
          { label: '删除小节', value: 'course:section:delete', description: '删除课程小节' }
        ]
      },

      // 课程开放管理(子权限组)
      {
        label: '管理课程开放',
        value: 'course:manage-openness',
        description: '管理课程章节和小节的开放状态',
        children: [
          { label: '章节开放', value: 'course:chapter:open', description: '控制章节的开放/关闭状态' },
          { label: '小节开放', value: 'course:section:open', description: '控制小节的开放/关闭状态' }
        ]
      },

      // 课程资源管理
      {
        label: '管理课程资源',
        value: 'course:manage-resources',
        description: '管理课程的视频、文档等资源',
        children: [
          { label: '上传视频', value: 'course:upload-video', description: '上传小节视频文件' },
          { label: '上传文档', value: 'course:upload-document', description: '上传PDF、图片等文档' }
        ]
      }
    ]
  },
  {
    label: '题库管理',
    code: 'question',
    permissions: [
      // 基础管理
      { label: '查看题库', value: 'question:view', description: '查看题库题目列表' },
      { label: '创建题目', value: 'question:create', description: '新建题目' },
      { label: '编辑题目', value: 'question:edit', description: '修改题目内容' },
      { label: '删除题目', value: 'question:delete', description: '删除题目' },
      { label: '导入题目', value: 'question:import', description: 'JSON/Excel批量导入题目' },
      { label: '导出题目', value: 'question:export', description: '导出题目数据' },

      // 标签管理
      { label: '管理标签', value: 'question:manage-tags', description: '管理题目标签分类' },

      // 科目权限(关键新增)
      {
        label: '科目访问权限',
        value: 'question:subject-access',
        description: '控制教师可访问的科目题库',
        // 科目权限通过授权接口动态配置,不在此枚举
        dynamic: true
      }
    ]
  },
  {
    label: '作业管理',
    code: 'homework',
    permissions: [
      // 基础管理
      { label: '查看作业', value: 'homework:view', description: '查看作业列表' },
      { label: '创建作业', value: 'homework:create', description: '新建作业' },
      { label: '编辑作业', value: 'homework:edit', description: '修改作业内容和设置' },
      { label: '删除作业', value: 'homework:delete', description: '删除作业' },
      { label: '批量导入', value: 'homework:import', description: '导入作业模板' },
      { label: '导出作业', value: 'homework:export', description: '导出作业数据' },

      // 题目管理
      {
        label: '管理作业题目',
        value: 'homework:manage-questions',
        description: '为作业添加/删除题目',
        children: [
          { label: '添加题目', value: 'homework:add-question', description: '单个添加题目(搜索选择)' },
          { label: '批量添加题目', value: 'homework:batch-add', description: '通过题目ID批量添加' }
        ]
      },

      // 批改与统计
      { label: '批改作业', value: 'homework:grade', description: '批改学生作业' },
      { label: '查看统计', value: 'homework:view-statistics', description: '查看作业统计数据' }
    ]
  },
  {
    label: '考试管理',
    code: 'exam',
    permissions: [
      // 基础管理
      { label: '查看考试', value: 'exam:view', description: '查看考试列表' },
      { label: '创建考试', value: 'exam:create', description: '新建考试' },
      { label: '编辑考试', value: 'exam:edit', description: '修改考试内容和设置' },
      { label: '删除考试', value: 'exam:delete', description: '删除考试' },

      // 题目管理
      {
        label: '管理考试题目',
        value: 'exam:manage-questions',
        description: '为考试添加/删除题目',
        children: [
          { label: '添加题目', value: 'exam:add-question', description: '单个添加题目(搜索选择)' },
          { label: '批量添加题目', value: 'exam:batch-add', description: '通过题目ID批量添加' }
        ]
      },

      // 监考与批改
      { label: '考试监控', value: 'exam:monitor', description: '实时监控考试进行' },
      { label: '批改试卷', value: 'exam:grade', description: '批改主观题和成绩管理' },
      { label: '查看统计', value: 'exam:view-statistics', description: '查看考试统计数据' }
    ]
  },
  {
    label: '教师管理',
    code: 'teacher',
    permissions: [
      // 基础管理
      { label: '查看教师', value: 'teacher:view', description: '查看教师列表' },
      { label: '创建教师', value: 'teacher:create', description: '新增教师账号' },
      { label: '编辑教师', value: 'teacher:edit', description: '修改教师基本信息' },
      { label: '删除教师', value: 'teacher:delete', description: '删除教师账号' },
      { label: '启用/禁用', value: 'teacher:toggle-status', description: '切换教师账号状态' },

      // 授权管理
      {
        label: '授权教师',
        value: 'teacher:authorize',
        description: '为教师分配班级和资源',
        children: [
          { label: '授权班级', value: 'teacher:authorize-class', description: '为教师分配班级权限' },
          { label: '授权资源', value: 'teacher:authorize-resource', description: '为教师分配课程、作业、考试权限' }
        ]
      }
    ]
  },
  {
    label: '学生管理',
    code: 'student',
    permissions: [
      // 基础管理(通过班级管理实现)
      { label: '查看学生', value: 'student:view', description: '通过班级查看学生信息' },
      { label: '查看详情', value: 'student:view-detail', description: '查看学生详细信息页面' },

      // 学习记录查看
      {
        label: '查看学习记录',
        value: 'student:view-records',
        description: '查看学生作业、考试、学习记录',
        children: [
          { label: '查看作业记录', value: 'student:view-homework', description: '访问学生作业记录页面' },
          { label: '查看考试记录', value: 'student:view-exam', description: '访问学生考试记录页面' },
          { label: '查看学习记录', value: 'student:view-learning', description: '访问学生学习记录页面' }
        ]
      }
    ]
  },
  {
    label: '素材管理',
    code: 'material',
    permissions: [
      { label: '查看素材', value: 'material:view', description: '查看素材列表' },
      { label: '上传素材', value: 'material:upload', description: '上传新素材文件' },
      { label: '编辑素材', value: 'material:edit', description: '修改素材信息' },
      { label: '删除素材', value: 'material:delete', description: '删除素材' },
      { label: '批量操作', value: 'material:batch-operate', description: '批量上传/删除/移动素材' }
    ]
  },
  {
    label: 'AIGC作品管理',
    code: 'aigc',
    permissions: [
      { label: '查看作品墙', value: 'aigc:view', description: '查看AIGC作品展示墙' },
      { label: '删除作品', value: 'aigc:delete', description: '删除作品' },
      { label: '批量管理', value: 'aigc:batch-manage', description: '批量操作作品' }
    ]
  },
  {
    label: '系统设置',
    code: 'system',
    permissions: [
      { label: '系统配置', value: 'system:config', description: '访问系统配置页面' },
      { label: '用户管理', value: 'system:manage-users', description: '管理系统用户' },

      // 角色与权限管理
      {
        label: '角色权限管理',
        value: 'system:manage-roles',
        description: '管理角色和权限配置',
        children: [
          { label: '创建角色', value: 'system:create-role', description: '新建角色' },
          { label: '编辑角色', value: 'system:edit-role', description: '修改角色权限' },
          { label: '删除角色', value: 'system:delete-role', description: '删除角色' },
          { label: '分配权限', value: 'system:assign-permissions', description: '为角色分配权限' }
        ]
      },

      { label: '查看日志', value: 'system:view-logs', description: '查看系统操作日志' }
    ]
  }
]

// 根据权限代码获取权限信息
export const getPermissionByCode = (code) => {
  for (const module of PERMISSION_MODULES) {
    const permission = module.permissions.find(p => p.value === code)
    if (permission) {
      return { ...permission, module: module.label, moduleCode: module.code }
    }
  }
  return null
}

// 获取所有权限代码列表
export const getAllPermissionCodes = () => {
  return PERMISSION_MODULES.flatMap(module =>
    module.permissions.map(p => p.value)
  )
}

// 根据模块代码获取权限列表
export const getPermissionsByModule = (moduleCode) => {
  const module = PERMISSION_MODULES.find(m => m.code === moduleCode)
  return module ? module.permissions : []
}