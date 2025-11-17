import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/cookie'
import { PATH } from '@/utils/constants/system'

// 静态路由
const constantRoutes = [
  {
    path: '/',
    redirect: PATH.URL_LOGIN  // 修改为重定向到登录页，让路由守卫处理认证
  },
  {
    path: PATH.URL_LOGIN,
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/course',
    component: () => import('@/layout/index.vue'),
    redirect: '/course/list',
    children: [
      {
        path: 'list',
        component: () => import('@/views/course/list/index.vue'),
        meta: { title: '课程列表' }
      },
      {
        path: 'detail',
        component: () => import('@/views/course/detail/index.vue'),
        meta: { title: '课程详情' }
      },
      {
        path: 'update/modern',
        component: () => import('@/views/course/update/ModernCourseUpdate.vue'),
        meta: { title: '编辑课程' }
      },
      {
        path: 'chapter',
        component: () => import('@/views/course/update/ModernCourseUpdate.vue'),
        meta: { title: '章节管理' }
      }
    ]
  },
  {
    path: PATH.URL_404,
    component: () => import('@/views/404.vue'),
    meta: { title: '404' }
  },
  {
    path: PATH.URL_403,
    component: () => import('@/views/403.vue'),
    meta: { title: '403' }
  },
  {
    path: '/ai',
    component: Layout,
    redirect: '/ai/assistant',
    children: [
      {
        path: 'assistant',
        name: 'AIAssistant',
        component: () => import('@/views/ai/assistant/index.vue'),
        meta: { title: 'AI助教' }
      },
      {
        path: 'assistant/upload-generate',
        name: 'UploadGenerate',
        component: () => import('@/views/ai/assistant/upload-generate/index.vue'),
        meta: { title: '上传并生成' }
      },
      {
        path: 'assistant/error-based',
        name: 'ErrorBased',
        component: () => import('@/views/ai/assistant/error-based/index.vue'),
        meta: { title: '基于错题生成' }
      },
      {
        path: 'assistant/custom-generate',
        name: 'CustomGenerate',
        component: () => import('@/views/ai/assistant/custom-generate/index.vue'),
        meta: { title: '自定义生成' }
      }
    ]
  }
]

const createRouters = (routerList) =>
  createRouter({
    history: createWebHashHistory(),
    routes: routerList,
    strict: true
  })

const router = createRouters(constantRoutes)

// 路由加载前
router.beforeEach(async (to, from, next) => {
  // 演示模式：检查token，如果没有token则跳转登录页
  const token = getToken()
  if (!token) {
    if (to.path === PATH.URL_LOGIN) {
      next()
      return
    }
    next({ path: PATH.URL_LOGIN })
    return
  }
  if (to.matched.length === 0) {
    next({ path: PATH.URL_404 })
    return
  }
  next()
})

// 创建路由
export function createNewRouter(data) {
  data = data ? data : useUserStore().routerList || []
  const menuList = data.filter((e) => e.path)
  const modules = import.meta.glob('../views/**/**.vue')

  // 移除之前添加的动态路由
  const allRoutes = router.getRoutes()
  menuList.forEach(menu => {
    const parentRoute = allRoutes.find(route => route.name === `route_${menu.id}`)
    if (parentRoute) {
      router.removeRoute(`route_${menu.id}`)
    }
    const childRoute = allRoutes.find(route => route.name === menu.id.toString())
    if (childRoute) {
      router.removeRoute(menu.id.toString())
    }
  })

  // 添加新的动态路由
  for (const e of menuList) {
    // 确保组件路径正确
    let component
    try {
      component = modules[`../views${e.component}`]
      if (!component) {
        console.warn(`Component not found: ../views${e.component}`)
        // 如果组件不存在，使用一个默认的组件
        component = Layout
      }
    } catch (error) {
      console.error(`Error loading component: ../views${e.component}`, error)
      component = Layout
    }

    // 动态路由都使用Layout作为布局组件
    router.addRoute({
      path: e.path,
      name: `route_${e.id}`,
      component: Layout,
      meta: {
        id: e.id.toString(),
        title: e.menuName,
        icon: e.menuIcon
      },
      children: [
        {
          path: '',
          name: e.id.toString(),
          component: component
        }
      ]
    })
  }

  // 为有子菜单的父路径添加重定向路由
  const redirectRoutes = [
    { path: '/aigc', redirect: '/aigc/works' },
    { path: '/oj', redirect: '/oj/problems' },
    { path: '/ai', redirect: '/ai/assistant' },
    { path: '/class', redirect: '/class/management' },
    { path: '/homework', redirect: '/homework/list' },
    { path: '/exam', redirect: '/exam/list' },
    { path: '/assignments', redirect: '/assignments/v2-list' },
    { path: '/question-bank', redirect: '/question-bank' }
  ]

  // 添加新功能路由
  const featureRoutes = [
    {
      path: '/class',
      component: Layout,
      redirect: '/class/management',
      children: [
        {
          path: 'management',
          name: 'ClassManagement',
          component: () => import('@/views/class/management/index.vue'),
          meta: { title: '班级管理' }
        },
        {
          path: 'authorization',
          name: 'ClassAuthorization',
          component: () => import('@/views/class/authorization/index.vue'),
          meta: { title: '班级授权' }
        }
      ]
    },
    {
      path: '/ai',
      component: Layout,
      redirect: '/ai/assistant',
      children: [
        {
          path: 'assistant',
          name: 'AIAssistant',
          component: () => import('@/views/ai/assistant/index.vue'),
          meta: { title: 'AI助教' }
        },
        {
          path: 'assistant/upload-generate',
          name: 'UploadGenerate',
          component: () => import('@/views/ai/assistant/upload-generate/index.vue'),
          meta: { title: '上传并生成' }
        },
        {
          path: 'assistant/error-based',
          name: 'ErrorBased',
          component: () => import('@/views/ai/assistant/error-based/index.vue'),
          meta: { title: '基于错题生成' }
        },
        {
          path: 'assistant/custom-generate',
          name: 'CustomGenerate',
          component: () => import('@/views/ai/assistant/custom-generate/index.vue'),
          meta: { title: '自定义生成' }
        }
      ]
    },
    {
      path: '/learning/report',
      component: Layout,
      children: [
        {
          path: '',
          name: 'LearningReport',
          component: () => import('@/views/learning/report/index.vue'),
          meta: { title: '学习报告' }
        }
      ]
    },
    {
      path: '/analysis/batch',
      component: Layout,
      children: [
        {
          path: '',
          name: 'BatchAnalysis',
          component: () => import('@/views/analysis/batch/index.vue'),
          meta: { title: '批量分析' }
        }
      ]
    },
    {
      path: '/report/export',
      component: Layout,
      children: [
        {
          path: '',
          name: 'ReportExport',
          component: () => import('@/views/report/export/index.vue'),
          meta: { title: '报告导出' }
        }
      ]
    },
    {
      path: '/homework',
      component: Layout,
      redirect: '/homework/list',
      children: [
        {
          path: 'list',
          name: 'HomeworkList',
          component: () => import('@/views/homework/list/index.vue'),
          meta: { title: '作业列表' }
        },
        {
          path: 'create',
          name: 'HomeworkCreate',
          component: () => import('@/views/homework/create/index.vue'),
          meta: { title: '创建作业' }
        },
        {
          path: 'edit/:id',
          name: 'HomeworkEdit',
          component: () => import('@/views/homework/edit/index.vue'),
          meta: { title: '编辑作业' }
        },
        {
          path: 'detail/:id',
          name: 'HomeworkDetail',
          component: () => import('@/views/homework/detail/index.vue'),
          meta: { title: '作业详情' }
        },
        {
          path: 'grading',
          name: 'HomeworkGrading',
          component: () => import('@/views/homework/grading/index.vue'),
          meta: { title: '批改作业' }
        },
        {
          path: 'review',
          name: 'HomeworkReview',
          component: () => import('@/views/homework/review/index.vue'),
          meta: { title: '作业批改' }
        },
        {
          path: 'statistics',
          name: 'HomeworkStatistics',
          component: () => import('@/views/homework/statistics/index.vue'),
          meta: { title: '作业统计' }
        }
      ]
    },
    {
      path: '/exam',
      component: Layout,
      redirect: '/exam/list',
      children: [
        {
          path: 'list',
          name: 'ExamList',
          component: () => import('@/views/exam/list/index.vue'),
          meta: { title: '考试列表' }
        },
        {
          path: 'create',
          name: 'ExamCreate',
          component: () => import('@/views/exam/create/index.vue'),
          meta: { title: '创建考试' }
        },
        {
          path: 'edit/:id',
          name: 'ExamEdit',
          component: () => import('@/views/exam/create/index.vue'),
          meta: { title: '编辑考试' }
        },
        {
          path: 'detail/:id',
          name: 'ExamDetail',
          component: () => import('@/views/exam/detail/index.vue'),
          meta: { title: '考试详情' }
        },
        {
          path: 'grade/:id',
          name: 'ExamGrade',
          component: () => import('@/views/exam/grades/index.vue'),
          meta: { title: '批改考试' }
        },
        {
          path: 'grade/:id/paper/:submissionId',
          name: 'ExamPaperView',
          component: () => import('@/views/exam/grade/StudentPaper.vue'),
          meta: { title: '查看答卷' }
        },
        {
          path: 'monitor',
          name: 'ExamMonitor',
          component: () => import('@/views/exam/monitor/index.vue'),
          meta: { title: '考试监控' }
        },
        {
          path: 'grades',
          name: 'ExamGrades',
          component: () => import('@/views/exam/grades/index.vue'),
          meta: { title: '成绩管理' }
        }
      ]
    },
    {
      path: '/assignments',
      component: Layout,
      redirect: '/assignments/v2-list',
      children: [
        {
          path: 'v2-list',
          name: 'V2AssignmentList',
          component: () => import('@/views/assignments/v2-list.vue'),
          meta: { title: '作业管理' }
        }
      ]
    },
    {
      path: '/question-bank',
      component: Layout,
      redirect: '/question-bank',
      children: [
        {
          path: '',
          name: 'QuestionBank',
          component: () => import('@/views/question-bank/index.vue'),
          meta: { title: '题库管理' }
        },
        {
          path: 'analytics',
          name: 'QuestionBankAnalytics',
          component: () => import('@/views/question-bank/analytics.vue'),
          meta: { title: '题库分析' }
        }
      ]
    }
  ]

  // 添加新功能路由
  featureRoutes.forEach(route => {
    try {
      router.addRoute(route)
    } catch (error) {
      // 忽略重复添加路由的错误
    }
  })

  // 添加用户管理路由
  router.addRoute({
    path: '/users',
    component: Layout,
    redirect: '/users/list',
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/list/index.vue'),
        meta: { title: '用户列表' }
      },
      {
        path: 'detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/users/detail/index.vue'),
        meta: { title: '用户详情' }
      }
    ]
  })

  // 添加老师管理路由
  router.addRoute({
    path: '/users/lecturer',
    component: Layout,
    redirect: '/users/lecturer/list',
    children: [
      {
        path: 'list',
        name: 'LecturerList',
        component: () => import('@/views/users/lecturer/list/index.vue'),
        meta: { title: '老师列表' }
      },
      {
        path: 'detail/:id',
        name: 'LecturerDetail',
        component: () => import('@/views/users/lecturer/detail/index.vue'),
        meta: { title: '老师详情' }
      }
    ]
  })

  // 添加员工管理路由
  router.addRoute({
    path: '/users/employee',
    component: Layout,
    redirect: '/users/employee/list',
    children: [
      {
        path: 'list',
        name: 'EmployeeList',
        component: () => import('@/views/users/employee/index.vue'),
        meta: { title: '员工管理' }
      }
    ]
  })

  // 添加作业管理路由
  router.addRoute({
    path: '/homework',
    component: Layout,
    redirect: '/homework/list',
    children: [
      {
        path: 'list',
        name: 'HomeworkList',
        component: () => import('@/views/homework/index.vue'),
        meta: { title: '作业管理' }
      }
    ]
  })

  // 添加考试管理路由
  router.addRoute({
    path: '/exam',
    component: Layout,
    redirect: '/exam/list',
    children: [
      {
        path: 'list',
        name: 'ExamList',
        component: () => import('@/views/exam/index.vue'),
        meta: { title: '考试管理' }
      }
    ]
  })

  // 添加系统设置路由
  router.addRoute({
    path: '/system',
    component: Layout,
    redirect: '/system/settings',
    children: [
      {
        path: 'settings',
        name: 'SystemSettings',
        component: () => import('@/views/system/settings/index.vue'),
        meta: { title: '系统设置' }
      }
    ]
  })

  redirectRoutes.forEach(route => {
    try {
      router.addRoute(route)
    } catch (error) {
      // 忽略重复添加路由的错误
    }
  })
}

export default router
