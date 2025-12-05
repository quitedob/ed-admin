/**
 * 权限与菜单的映射配置
 * 定义每个菜单项需要的权限前缀
 */

// 菜单路径 -> 权限前缀映射
export const MENU_PERMISSION_PREFIX = {
  '/dashboard': 'dashboard',
  '/class': 'class',
  '/course': 'course',
  '/users/lecturer': 'teacher',
  '/users': 'student',
  '/assignments': 'question',
  '/homework': 'homework',
  '/exam': 'exam',
  '/system': 'system',
  '/material': 'material',
  '/aigc': 'aigc',
  '/ai': 'ai'
}

// 菜单ID -> 权限前缀映射（用于顶级菜单）
export const MENU_ID_PERMISSION_PREFIX = {
  1: 'dashboard',      // 首页
  2: 'course',         // 课程管理
  3: 'student',        // 学生管理
  4: 'aigc',           // AIGC管理
  5: 'question',       // 题库管理
  6: 'ai',             // AI助教
  7: 'homework',       // 作业管理
  8: 'exam',           // 考试管理
  9: 'class',          // 班级管理
  10: 'material',      // 素材管理
  12: 'system',        // 系统管理
  13: 'teacher'        // 老师管理
}

/**
 * 根据权限列表过滤菜单
 * @param {Array} menuList - 完整菜单列表
 * @param {Array} permissions - 用户权限列表
 * @returns {Array} 过滤后的菜单列表
 */
export function filterMenuByPermissions(menuList, permissions) {
  // 超级管理员拥有所有权限
  if (permissions.includes('*')) {
    return menuList
  }

  // 获取用户拥有的权限前缀集合
  const permissionPrefixes = new Set()
  permissions.forEach(perm => {
    const prefix = perm.split(':')[0]
    if (prefix) {
      permissionPrefixes.add(prefix)
    }
  })

  // 过滤菜单
  return menuList.filter(menu => {
    // 获取该菜单需要的权限前缀
    const requiredPrefix = MENU_ID_PERMISSION_PREFIX[menu.id]
    
    if (!requiredPrefix) {
      // 没有配置权限要求的菜单默认显示
      return true
    }

    // 检查用户是否有该前缀的任意权限
    return permissionPrefixes.has(requiredPrefix)
  }).map(menu => {
    // 递归过滤子菜单
    if (menu.children && menu.children.length > 0) {
      return {
        ...menu,
        children: filterMenuByPermissions(menu.children, permissions)
      }
    }
    return menu
  })
}

/**
 * 获取权限前缀对应的菜单名称（用于预览）
 */
export const PERMISSION_PREFIX_LABELS = {
  'dashboard': '仪表盘',
  'class': '班级管理',
  'course': '课程管理',
  'teacher': '老师管理',
  'student': '学生管理',
  'question': '题库管理',
  'homework': '作业管理',
  'exam': '考试管理',
  'system': '系统管理',
  'material': '素材管理',
  'aigc': 'AIGC管理',
  'ai': 'AI助教',
  'data': '数据视角'
}
