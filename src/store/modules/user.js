                                                                                                                                                                                                                                                                                        import { cloneDeep, isEmpty } from 'lodash'
import { defineStore } from 'pinia'
import { removeToken } from '@/utils/cookie'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    mobile: '',
    realName: '',
    routerList: [],
    menuList: [],
    permissionList: [],
    breadcrumbMap: new Map()
  }),
  getters: {
    getMobile(state) {
      return state.mobile
    },
    getRealName(state) {
      return state.realName
    },
    getRouterList(state) {
      return state.routerList
    },
    getMenuList(state) {
      return state.menuList
    },
    getPermissionList(state) {
      return state.permissionList
    },
    getBreadcrumbMap(state) {
      return state.breadcrumbMap
    }
  },
  actions: {
    // 登录操作
    login(data) {
      this.mobile = data.mobile
      this.realName = data.realName
      this.routerList = data.routerList
      this.menuList = data.menuList
      this.permissionList = data.permissionList
      this.breadcrumbMap = buildBreadcrumbMap(data.menuList)
    },

    // 模拟登录 - 移除验证使用
    mockLogin() {
      // 设置模拟用户数据
      this.mobile = 'admin'
      this.realName = '管理员'
      // 模拟路由列表（添加新功能的路由）
      this.routerList = [
        { id: 1, path: '/dashboard', menuName: '首页', component: '/dashboard/index.vue' },
        { id: 2, path: '/course', menuName: '课程管理', component: '/course/list/index.vue' },
        { id: 3, path: '/course/detail', menuName: '课程详情', component: '/course/detail/index.vue' },
        { id: 4, path: '/course/create', menuName: '创建课程', component: '/course/create/index.vue' },
        { id: 5, path: '/course/update', menuName: '编辑课程', component: '/course/update/index.vue' },
        { id: 6, path: '/course/analytics', menuName: '课程分析', component: '/course/analytics/index.vue' },
        { id: 7, path: '/course/chapter', menuName: '章节管理', component: '/course/chapter/index.vue' },
        { id: 8, path: '/course/record', menuName: '课程数据', component: '/course/record/index.vue' },
        { id: 9, path: '/users', menuName: '学生管理', component: '/users/list/index.vue' },

        // 新功能路由
        { id: 22, path: '/class/management', menuName: '班级管理', component: '/class/management/index.vue' },
        { id: 26, path: '/ai/assistant', menuName: 'AI助教', component: '/ai/assistant/index.vue' },
        { id: 27, path: '/analysis/batch', menuName: '批量分析', component: '/analysis/batch/index.vue' },
        { id: 28, path: '/report/export', menuName: '报告导出', component: '/report/export/index.vue' },

        { id: 10, path: '/aigc/works', menuName: 'AIGC作品', component: '/aigc/works/index.vue' },
        { id: 11, path: '/aigc/gallery', menuName: '作品墙', component: '/aigc/gallery/index.vue' },
        { id: 12, path: '/oj/problems', menuName: '题库管理', component: '/assignments/index.vue' },
        { id: 13, path: '/oj/submission', menuName: '提交记录', component: '/oj/submission/index.vue' },
        { id: 15, path: '/homework/list', menuName: '作业列表', component: '/homework/list/index.vue' },
        { id: 16, path: '/homework/review', menuName: '作业批改', component: '/homework/review/index.vue' },
        { id: 17, path: '/homework/statistics', menuName: '作业统计', component: '/homework/statistics/index.vue' },
        { id: 18, path: '/exam/list', menuName: '考试列表', component: '/exam/list/index.vue' },
        { id: 19, path: '/exam/monitor', menuName: '考试监控', component: '/exam/monitor/index.vue' },
        { id: 20, path: '/exam/grades', menuName: '成绩管理', component: '/exam/grades/index.vue' },
        { id: 14, path: '/ai/assistant', menuName: 'AI助教', component: '/ai/assistant/index.vue' },
        { id: 17, path: '/learning/report', menuName: '学习报告', component: '/learning/report/index.vue' },
        { id: 19, path: '/student/my-courses', menuName: '我的课程', component: '/student/my-courses/index.vue' },
        { id: 20, path: '/student/course-detail', menuName: '课程详情', component: '/student/course-detail/index.vue' },
        { id: 21, path: '/system', menuName: '老师管理', component: '/system/user/index.vue' }
      ]
      // 模拟菜单列表
      this.menuList = [
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
          id: 5,
          menuName: '题库管理',
          path: '/oj',
          menuIcon: 'document',
          parentId: 0,
          children: [
            { id: 51, menuName: '题库管理', path: '/oj/problems', parentId: 5 },
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
          menuIcon: '用户',
          parentId: 0,
          children: [
            { id: 91, menuName: '班级管理', path: '/class/management', parentId: 9 }
          ]
        },
        { 
          id: 12, 
          menuName: '老师管理', 
          path: '/system', 
          menuIcon: 'user', 
          parentId: 0, 
          children: [
            { id: 121, menuName: '老师列表', path: '/users/lecturer', parentId: 12 },
            { id: 122, menuName: '老师日志', path: '/users/log', parentId: 12 }
          ] 
        }
      ]
      // 模拟权限列表（包含所有可能的权限）
      this.permissionList = [
        // 系统管理权限
        'system:user:view', 'system:user:add', 'system:user:edit', 'system:user:delete',
        'system:role:view', 'system:role:add', 'system:role:edit', 'system:role:delete',
        'system:menu:view', 'system:menu:add', 'system:menu:edit', 'system:menu:delete',
        'system:config:view', 'system:config:edit',

        // 课程管理权限
        'course:view', 'course:add', 'course:edit', 'course:delete', 'course:copy', 'course:analytics',
        'course:chapter:view', 'course:chapter:add', 'course:chapter:edit', 'course:chapter:delete',
        'course:period:view', 'course:period:add', 'course:period:edit', 'course:period:delete',
        'course:record:view',

        // 用户管理权限
        'users:view', 'users:add', 'users:edit', 'users:delete',
        'users:lecturer:view', 'users:lecturer:add', 'users:lecturer:edit', 'users:lecturer:delete',
        'users:record:view',

        // AIGC管理权限
        'aigc:works:view', 'aigc:works:add', 'aigc:works:edit', 'aigc:works:delete', 'aigc:works:audit',
        'aigc:gallery:view',

        // OJ系统权限
        'oj:problem:view', 'oj:problem:add', 'oj:problem:edit', 'oj:problem:delete', 'oj:problem:copy',
        'oj:submission:view', 'oj:submission:rejudge', 'oj:submission:delete',

        // AI助教权限
        'ai:assistant:view', 'ai:assistant:config', 'ai:assistant:feedback',

  
        // 学习报告权限
        'learning:report:view', 'learning:report:generate', 'learning:report:export',

        // 授权管理权限
        'authorization:view', 'authorization:add', 'authorization:edit', 'authorization:delete',
        'authorization:batch', 'authorization:toggle'
      ]
      this.breadcrumbMap = buildBreadcrumbMap(this.menuList)
    },

    // logout
    logout() {
      this.routerList = []
      this.menuList = []
      this.breadcrumbMap = new Map()
      removeToken()
    }
  }
})

/**
 * 构建菜单父级集合，面包屑导航
 */
function buildBreadcrumbMap(menuList) {
  let breadcrumbMaps = new Map()
  // 确保menuList是数组
  if (Array.isArray(menuList)) {
    recursiveMap(menuList, [], breadcrumbMaps)
  }
  return breadcrumbMaps
}
function recursiveMap(menuList, parentList, breadcrumbMaps) {
  for (const e of menuList) {
    if (e.parentId === 0) {
      parentList = []
    }
    let menuIdStr = e.id.toString()
    let cloneParentList = cloneDeep(parentList)
    cloneParentList.push({ id: menuIdStr, title: e.menuName })
    breadcrumbMaps.set(menuIdStr, cloneParentList)
    if (!isEmpty(e.children)) {
      // 递归
      recursiveMap(e.children, cloneParentList, breadcrumbMaps)
    }
  }
}
