import { useUserStore } from '@/store/modules/user.js'

/**
 * 检查是否拥有某个权限
 * @param {string|string[]} keyValue - 权限代码或权限代码数组
 * @returns {boolean}
 */
export function hasPermission(keyValue) {
  const permissions = useUserStore().getPermissionList || []
  
  // 超级管理员拥有所有权限
  if (permissions.includes('*')) {
    return true
  }
  
  // 如果是数组，检查是否拥有任意一个权限
  if (Array.isArray(keyValue)) {
    return keyValue.some(p => permissions.includes(p))
  }
  
  // 单个权限检查
  return permissions.includes(keyValue)
}
