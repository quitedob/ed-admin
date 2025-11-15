import { useUserStore } from '@/store/modules/user.js'

export function hasPermission(keyValue) {
  // 移除验证：所有权限检查都返回true
  // const permissions = useUserStore().getPermissionList
  // if (!permissions?.includes(keyValue)) {
  //   return false
  // }
  return true
}
