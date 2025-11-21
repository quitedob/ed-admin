// 全局错误处理工具
import { ElMessage, ElNotification } from 'element-plus'

// 错误类型枚举
export const ErrorType = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  SERVER: 'SERVER',
  NOT_FOUND: 'NOT_FOUND',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
}

// 错误级别枚举
export const ErrorLevel = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
}

// 错误处理配置
const errorHandlerConfig = {
  // 是否显示详细错误信息
  showDetails: process.env.NODE_ENV === 'development',
  // 错误消息持续时间（毫秒）
  messageDuration: 5000,
  // 是否记录错误到控制台
  logToConsole: true,
  // 是否上报错误到监控服务
  reportToMonitoring: process.env.NODE_ENV === 'production',
  // 监控服务地址
  monitoringEndpoint: '/api/error-log',
  // 重试次数
  retryAttempts: 3,
  // 重试延迟（毫秒）
  retryDelay: 1000
}

// 错误类
export class AppError extends Error {
  constructor(
    message,
    type = ErrorType.UNKNOWN,
    level = ErrorLevel.ERROR,
    code,
    details,
    originalError
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.level = level
    this.code = code
    this.details = details
    this.originalError = originalError

    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  // 转换为JSON
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      level: this.level,
      code: this.code,
      details: this.details,
      stack: this.stack,
      timestamp: new Date().toISOString()
    }
  }

  // 获取用户友好的错误消息
  getUserMessage() {
    const messageMap = {
      [ErrorType.NETWORK]: '网络连接失败，请检查网络后重试',
      [ErrorType.VALIDATION]: '输入数据格式不正确',
      [ErrorType.AUTHENTICATION]: '登录已过期，请重新登录',
      [ErrorType.AUTHORIZATION]: '权限不足，请联系管理员',
      [ErrorType.SERVER]: '服务器暂时不可用，请稍后重试',
      [ErrorType.NOT_FOUND]: '请求的资源不存在',
      [ErrorType.TIMEOUT]: '请求超时，请稍后重试',
      [ErrorType.UNKNOWN]: '发生了未知错误'
    }

    return messageMap[this.type] || this.message
  }
}

// 网络错误处理
export class NetworkError extends AppError {
  constructor(originalError) {
    super(`网络错误: ${originalError.message}`, ErrorType.NETWORK, ErrorLevel.ERROR, 0, {
      url: originalError.config?.url,
      method: originalError.config?.method,
      status: originalError.response?.status,
      statusText: originalError.response?.statusText
    }, originalError)
  }
}

// API错误处理
export class ApiError extends AppError {
  constructor(response) {
    const message = response.data?.message || response.statusText || 'API请求失败'
    const type = getErrorTypeFromStatus(response.status)

    super(message, type, ErrorLevel.ERROR, response.status, {
      url: response.config?.url,
      method: response.config?.method,
      requestData: response.config?.data,
      responseData: response.data
    })
  }

  getUserMessage() {
    if (this.code === 401) {
      return '登录已过期，请重新登录'
    }
    if (this.code === 403) {
      return '权限不足，请联系管理员'
    }
    if (this.code === 404) {
      return '请求的资源不存在'
    }
    if (this.code === 429) {
      return '请求过于频繁，请稍后重试'
    }
    if (this.code >= 500) {
      return '服务器暂时不可用，请稍后重试'
    }
    return this.message
  }
}

// 验证错误处理
export class ValidationError extends AppError {
  constructor(field, message, value) {
    super(`验证失败: ${field} - ${message}`, ErrorType.VALIDATION, ErrorLevel.WARNING, 400, {
      field,
      value
    })
  }
}

// 根据HTTP状态码获取错误类型
function getErrorTypeFromStatus(status) {
  if (status === 0 || status === undefined) return ErrorType.NETWORK
  if (status === 400) return ErrorType.VALIDATION
  if (status === 401) return ErrorType.AUTHENTICATION
  if (status === 403) return ErrorType.AUTHORIZATION
  if (status === 404) return ErrorType.NOT_FOUND
  if (status === 408 || status === 504) return ErrorType.TIMEOUT
  if (status >= 500) return ErrorType.SERVER
  return ErrorType.UNKNOWN
}

// 创建错误对象
export function createError(message, type = ErrorType.UNKNOWN, details) {
  return new AppError(message, type, ErrorLevel.ERROR, undefined, details)
}

// 错误处理器类
export class ErrorHandler {
  static #instance = null
  errorQueue = []

  constructor() {
    if (ErrorHandler.#instance) {
      return ErrorHandler.#instance
    }
    ErrorHandler.#instance = this
  }

  // 获取单例实例
  static getInstance() {
    if (!ErrorHandler.#instance) {
      ErrorHandler.#instance = new ErrorHandler()
    }
    return ErrorHandler.#instance
  }

  // 处理错误
  handleError(error, context) {
    const appError = this.normalizeError(error)

    // 添加上下文信息
    if (context) {
      appError.message = `${context}: ${appError.message}`
    }

    // 记录错误
    this.logError(appError)

    // 显示用户友好的错误消息
    this.showUserMessage(appError)

    // 上报错误（生产环境）
    if (errorHandlerConfig.reportToMonitoring) {
      this.reportError(appError)
    }

    // 添加到错误队列
    this.errorQueue.push(appError)

    // 保持队列大小
    if (this.errorQueue.length > 100) {
      this.errorQueue.shift()
    }
  }

  // 标准化错误对象
  normalizeError(error) {
    if (error instanceof AppError) {
      return error
    }

    // Handle null or undefined errors
    if (!error) {
      return new AppError('Unknown error occurred', ErrorType.UNKNOWN, ErrorLevel.ERROR, undefined, null, null)
    }

    if (error.name === 'AxiosError') {
      return new ApiError(error)
    }

    if (error.message && error.message.includes('Network Error')) {
      return new NetworkError(error)
    }

    const message = error.message || String(error) || 'Unknown error occurred'
    return new AppError(message, ErrorType.UNKNOWN, ErrorLevel.ERROR, undefined, null, error)
  }

  // 记录错误
  logError(error) {
    if (!errorHandlerConfig.logToConsole) return

    const logMethod = error.level === ErrorLevel.ERROR ? 'error' : 'warn'
    console.group(`🚨 ${error.level.toUpperCase()} [${error.type}]`)

    console[logMethod]('Message:', error.message)
    console[logMethod]('Type:', error.type)
    console[logMethod]('Code:', error.code)

    if (error.details) {
      console[logMethod]('Details:', error.details)
    }

    if (error.stack && errorHandlerConfig.showDetails) {
      console[logMethod]('Stack:', error.stack)
    }

    console.groupEnd()
  }

  // 显示用户消息
  showUserMessage(error) {
    const userMessage = error.getUserMessage()

    switch (error.level) {
      case ErrorLevel.INFO:
        ElMessage({
          message: userMessage,
          type: 'info',
          duration: errorHandlerConfig.messageDuration
        })
        break
      case ErrorLevel.WARNING:
        ElMessage({
          message: userMessage,
          type: 'warning',
          duration: errorHandlerConfig.messageDuration
        })
        break
      case ErrorLevel.ERROR:
        ElNotification({
          title: '错误',
          message: userMessage,
          type: 'error',
          duration: errorHandlerConfig.messageDuration,
          dangerouslyUseHTMLString: errorHandlerConfig.showDetails
        })
        break
    }
  }

  // 上报错误
  async reportError(error) {
    try {
      // 这里可以集成错误监控服务，如 Sentry
      await fetch(errorHandlerConfig.monitoringEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error.toJSON())
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  // 获取错误统计
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      byLevel: {},
      recent: this.errorQueue.slice(-10)
    }

    this.errorQueue.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.byLevel[error.level] = (stats.byLevel[error.level] || 0) + 1
    })

    return stats
  }

  // 清空错误队列
  clearErrors() {
    this.errorQueue = []
  }
}

// 全局错误处理器实例
export const globalErrorHandler = ErrorHandler.getInstance()

// Promise错误处理装饰器
export function withErrorHandling(fn, context) {
  return ((...args) => {
    try {
      const result = fn(...args)

      // 如果返回Promise，添加错误处理
      if (result && typeof result.catch === 'function') {
        return result.catch((error) => {
          globalErrorHandler.handleError(error, context)
          throw error
        })
      }

      return result
    } catch (error) {
      globalErrorHandler.handleError(error, context)
      throw error
    }
  })
}

// 重试装饰器
export function withRetry(fn, maxAttempts = errorHandlerConfig.retryAttempts, delay = errorHandlerConfig.retryDelay) {
  return (async (...args) => {
    let lastError

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args)
      } catch (error) {
        lastError = error

        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxAttempts) {
          break
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    throw lastError
  })
}

// 全局错误处理函数
export function handleError(error, context) {
  if (typeof error === 'string') {
    error = new AppError(error)
  }

  globalErrorHandler.handleError(error, context)
}

// 自动安装全局错误处理
export function setupGlobalErrorHandler() {
  // 捕获未处理的Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handleError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      'Unhandled Promise Rejection'
    )
    event.preventDefault()
  })

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    globalErrorHandler.handleError(
      event.error || new Error(event.message),
      'Global Error'
    )
  })

  console.log('🛡️ Global error handler installed')
}

// 导出便捷方法
export const error = {
  handle: handleError,
  network: (message) => new NetworkError(new Error(message)),
  validation: (field, message, value) => new ValidationError(field, message, value),
  api: (response) => new ApiError(response),
  create: createError,
  withHandling: withErrorHandling,
  withRetry: withRetry,
  stats: () => globalErrorHandler.getErrorStats(),
  clear: () => globalErrorHandler.clearErrors()
}