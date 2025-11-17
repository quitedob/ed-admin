/**
 * 通知和提醒工具类
 * 支持系统通知、消息提醒等功能
 */

import { ElNotification, ElMessage } from 'element-plus'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  timestamp: Date
  read: boolean
  action?: {
    label: string
    callback: () => void
  }
}

// 通知列表（模拟存储）
let notifications: Notification[] = []

// 显示系统通知
export function showNotification(
  title: string,
  message: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'info',
  duration: number = 4500
) {
  ElNotification({
    title,
    message,
    type,
    duration,
    position: 'top-right'
  })

  // 添加到通知列表
  addNotification(title, message, type)
}

// 显示消息提示
export function showMessage(
  message: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'info',
  duration: number = 3000
) {
  ElMessage({
    message,
    type,
    duration
  })
}

// 添加通知到列表
export function addNotification(
  title: string,
  message: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'info',
  action?: { label: string; callback: () => void }
) {
  const notification: Notification = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type,
    timestamp: new Date(),
    read: false,
    action
  }

  notifications.unshift(notification)

  // 保持最多100条通知
  if (notifications.length > 100) {
    notifications = notifications.slice(0, 100)
  }

  return notification
}

// 获取所有通知
export function getNotifications(): Notification[] {
  return notifications
}

// 获取未读通知
export function getUnreadNotifications(): Notification[] {
  return notifications.filter(n => !n.read)
}

// 获取未读通知数量
export function getUnreadCount(): number {
  return notifications.filter(n => !n.read).length
}

// 标记通知为已读
export function markAsRead(notificationId: string) {
  const notification = notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

// 标记所有通知为已读
export function markAllAsRead() {
  notifications.forEach(n => {
    n.read = true
  })
}

// 删除通知
export function deleteNotification(notificationId: string) {
  notifications = notifications.filter(n => n.id !== notificationId)
}

// 清空所有通知
export function clearAllNotifications() {
  notifications = []
}

// 作业相关通知
export function notifyHomeworkCreated(homeworkTitle: string) {
  showNotification(
    '作业已创建',
    `作业 "${homeworkTitle}" 已成功创建`,
    'success'
  )
}

export function notifyHomeworkPublished(homeworkTitle: string) {
  showNotification(
    '作业已发布',
    `作业 "${homeworkTitle}" 已发布给学生`,
    'success'
  )
}

export function notifyHomeworkDeadlineApproaching(homeworkTitle: string, hoursLeft: number) {
  showNotification(
    '作业截止提醒',
    `作业 "${homeworkTitle}" 将在 ${hoursLeft} 小时后截止`,
    'warning'
  )
}

export function notifyHomeworkSubmitted(studentName: string, homeworkTitle: string) {
  showNotification(
    '作业已提交',
    `${studentName} 提交了作业 "${homeworkTitle}"`,
    'info'
  )
}

// 考试相关通知
export function notifyExamCreated(examTitle: string) {
  showNotification(
    '考试已创建',
    `考试 "${examTitle}" 已成功创建`,
    'success'
  )
}

export function notifyExamStarting(examTitle: string) {
  showNotification(
    '考试即将开始',
    `考试 "${examTitle}" 即将开始，请做好准备`,
    'warning'
  )
}

export function notifyExamEnded(examTitle: string) {
  showNotification(
    '考试已结束',
    `考试 "${examTitle}" 已结束`,
    'info'
  )
}

export function notifyExamGraded(examTitle: string) {
  showNotification(
    '考试已批改',
    `考试 "${examTitle}" 已完成批改，成绩已发布`,
    'success'
  )
}

// 学生相关通知
export function notifyStudentJoinedClass(studentName: string, className: string) {
  showNotification(
    '学生加入班级',
    `${studentName} 加入了班级 "${className}"`,
    'info'
  )
}

export function notifyStudentLeftClass(studentName: string, className: string) {
  showNotification(
    '学生离开班级',
    `${studentName} 离开了班级 "${className}"`,
    'info'
  )
}

// 系统相关通知
export function notifySystemMaintenance(message: string, duration: number = 0) {
  showNotification(
    '系统维护',
    message,
    'warning',
    duration
  )
}

export function notifySystemError(message: string) {
  showNotification(
    '系统错误',
    message,
    'error'
  )
}

// 批量通知
export function notifyBatch(
  notifications: Array<{
    title: string
    message: string
    type?: 'success' | 'warning' | 'error' | 'info'
  }>
) {
  notifications.forEach((notif, index) => {
    setTimeout(() => {
      showNotification(notif.title, notif.message, notif.type || 'info')
    }, index * 500) // 间隔显示，避免同时弹出
  })
}

// 定时提醒
export function scheduleNotification(
  title: string,
  message: string,
  delayMs: number,
  type: 'success' | 'warning' | 'error' | 'info' = 'info'
) {
  const timeoutId = setTimeout(() => {
    showNotification(title, message, type)
  }, delayMs)

  return timeoutId
}

// 取消定时提醒
export function cancelScheduledNotification(timeoutId: NodeJS.Timeout) {
  clearTimeout(timeoutId)
}

// 获取通知统计
export function getNotificationStats() {
  return {
    total: notifications.length,
    unread: getUnreadCount(),
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
    info: notifications.filter(n => n.type === 'info').length
  }
}

// 导出通知为 JSON
export function exportNotifications() {
  const dataStr = JSON.stringify(notifications, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `notifications_${new Date().toISOString()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
