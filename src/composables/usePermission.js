/**
 * 权限控制组合式函数
 * 用于页面元素级别的权限控制
 */
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  // 获取当前用户的权限列表
  const permissions = computed(() => userStore.permissionList || [])

  // 获取当前用户的角色列表
  const roles = computed(() => userStore.roleList || [])

  // 获取当前用户被授权的班级ID列表
  const authorizedClassIds = computed(() => userStore.authorizedClassIds || [])

  // 获取当前用户被授权的学科列表
  const authorizedSubjects = computed(() => userStore.authorizedSubjects || [])

  /**
   * 检查是否拥有某个权限
   * @param {string} permission - 权限代码，如 'class:create'
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!permission) return true
    // 超级管理员拥有所有权限
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否拥有多个权限中的任意一个
   * @param {string[]} permissionList - 权限代码数组
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true
    if (permissions.value.includes('*')) return true
    return permissionList.some(p => permissions.value.includes(p))
  }

  /**
   * 检查是否拥有所有指定权限
   * @param {string[]} permissionList - 权限代码数组
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true
    if (permissions.value.includes('*')) return true
    return permissionList.every(p => permissions.value.includes(p))
  }

  /**
   * 检查是否是某个角色
   * @param {string} role - 角色代码
   * @returns {boolean}
   */
  const hasRole = (role) => {
    if (!role) return true
    return roles.value.includes(role)
  }

  /**
   * 检查是否是管理员
   * @returns {boolean}
   */
  const isAdmin = computed(() => {
    return roles.value.includes('admin') || permissions.value.includes('*')
  })

  /**
   * 检查是否是班主任
   * @returns {boolean}
   */
  const isHeadTeacher = computed(() => {
    return roles.value.includes('headTeacher')
  })

  /**
   * 检查是否是普通老师
   * @returns {boolean}
   */
  const isTeacher = computed(() => {
    return roles.value.includes('teacher')
  })

  /**
   * 检查是否有全局数据视角（可以看到所有数据）
   * 通过权限 'data:global-view' 控制，由管理员在角色权限中配置
   * @returns {boolean}
   */
  const hasGlobalView = computed(() => {
    // 超级管理员拥有全局视角
    if (permissions.value.includes('*')) {
      console.log('[权限检查] 超级管理员，拥有全局视角')
      return true
    }
    // 检查是否有全局视角权限
    const hasGlobal = permissions.value.includes('data:global-view')
    console.log('[权限检查] 检查 data:global-view:', hasGlobal, '权限列表:', permissions.value)
    return hasGlobal
  })

  /**
   * 检查是否有个人数据视角（只能看到自己被授权的数据）
   * 通过权限 'data:personal-view' 控制
   * @returns {boolean}
   */
  const hasPersonalView = computed(() => {
    // 超级管理员也有个人视角
    if (permissions.value.includes('*')) return true
    // 检查是否有个人视角权限
    return permissions.value.includes('data:personal-view')
  })

  /**
   * 检查是否有权限访问某个班级
   * @param {string} classId - 班级ID
   * @returns {boolean}
   */
  const canAccessClass = (classId) => {
    // 全局视角可以访问所有班级
    if (hasGlobalView.value) return true
    // 否则检查是否在授权列表中
    return authorizedClassIds.value.includes(classId)
  }

  /**
   * 过滤班级列表，只返回有权限访问的班级
   * @param {Array} classList - 班级列表
   * @returns {Array}
   */
  const filterAuthorizedClasses = (classList) => {
    // 全局视角返回全部
    if (hasGlobalView.value) return classList
    // 否则只返回授权的班级
    return classList.filter(c => authorizedClassIds.value.includes(c.id))
  }

  /**
   * 检查是否有权限访问某个学科
   * @param {string} subject - 学科代码
   * @returns {boolean}
   */
  const canAccessSubject = (subject) => {
    // 全局视角可以访问所有学科
    if (hasGlobalView.value) return true
    // 否则检查是否在授权列表中
    return authorizedSubjects.value.includes(subject)
  }

  /**
   * 过滤题目列表，只返回有权限访问的学科的题目
   * @param {Array} questionList - 题目列表
   * @param {string} subjectField - 学科字段名，默认 'subject'
   * @returns {Array}
   */
  const filterAuthorizedQuestions = (questionList, subjectField = 'subject') => {
    // 全局视角返回全部
    if (hasGlobalView.value) return questionList
    // 否则只返回授权学科的题目
    return questionList.filter(q => authorizedSubjects.value.includes(q[subjectField]))
  }

  /**
   * 过滤作业列表，只返回有权限访问的学科的作业
   * @param {Array} homeworkList - 作业列表
   * @param {string} subjectField - 学科字段名，默认 'subject'
   * @returns {Array}
   */
  const filterAuthorizedHomeworks = (homeworkList, subjectField = 'subject') => {
    // 全局视角返回全部
    if (hasGlobalView.value) return homeworkList
    // 否则只返回授权学科的作业
    return homeworkList.filter(h => authorizedSubjects.value.includes(h[subjectField]))
  }

  /**
   * 过滤考试列表，只返回有权限访问的学科的考试
   * @param {Array} examList - 考试列表
   * @param {string} subjectField - 学科字段名，默认 'subject'
   * @returns {Array}
   */
  const filterAuthorizedExams = (examList, subjectField = 'subject') => {
    // 全局视角返回全部
    if (hasGlobalView.value) return examList
    // 否则只返回授权学科的考试
    return examList.filter(e => authorizedSubjects.value.includes(e[subjectField]))
  }

  return {
    permissions,
    roles,
    authorizedClassIds,
    authorizedSubjects,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isHeadTeacher,
    isTeacher,
    hasGlobalView,
    hasPersonalView,
    canAccessClass,
    canAccessSubject,
    filterAuthorizedClasses,
    filterAuthorizedQuestions,
    filterAuthorizedHomeworks,
    filterAuthorizedExams
  }
}

/**
 * 权限指令 - 用于模板中控制元素显示
 * 使用方式: v-permission="'class:create'" 或 v-permission="['class:create', 'class:edit']"
 */
export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissionList || []

    // 超级管理员拥有所有权限
    if (permissions.includes('*')) return

    let hasPermission = false

    if (Array.isArray(value)) {
      // 数组：拥有任意一个权限即可
      hasPermission = value.some(p => permissions.includes(p))
    } else if (typeof value === 'string') {
      // 字符串：检查单个权限
      hasPermission = permissions.includes(value)
    }

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default usePermission
