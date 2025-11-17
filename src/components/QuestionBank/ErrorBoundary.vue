<template>
  <div class="error-boundary">
    <!-- 正常内容 -->
    <div v-if="!hasError" class="boundary-content">
      <slot />
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-display">
      <el-result
        :icon="errorConfig.icon"
        :title="errorConfig.title"
        :sub-title="errorConfig.subTitle"
      >
        <template #extra>
          <el-button type="primary" @click="handleRetry">
            <el-icon><Refresh /></el-icon>
            重试
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><RefreshRight /></el-icon>
            刷新页面
          </el-button>
          <el-button @click="handleGoHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
        </template>
      </el-result>

      <!-- 错误详情（开发环境显示） -->
      <div v-if="isDevelopment" class="error-details">
        <el-collapse>
          <el-collapse-item title="错误详情">
            <div class="error-info">
              <p><strong>错误消息:</strong> {{ error.message }}</p>
              <p><strong>错误堆栈:</strong></p>
              <pre class="error-stack">{{ error.stack }}</pre>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, RefreshRight, House } from '@element-plus/icons-vue'

const props = defineProps({
  // 错误回退组件
  fallback: {
    type: Object,
    default: null
  },
  // 是否显示错误详情
  showDetails: {
    type: Boolean,
    default: false
  },
  // 错误处理函数
  onError: {
    type: Function,
    default: null
  },
  // 重试函数
  onRetry: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['error', 'retry'])

// 响应式数据
const hasError = ref(false)
const error = ref(null)
const errorId = ref(null)

// 计算属性
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development'
})

const errorConfig = computed(() => {
  if (!error.value) return { icon: 'error', title: '未知错误', subTitle: '' }

  const errorType = classifyError(error.value)

  const configs = {
    network: {
      icon: 'warning',
      title: '网络连接错误',
      subTitle: '请检查网络连接后重试'
    },
    permission: {
      icon: 'warning',
      title: '权限不足',
      subTitle: '您没有访问此资源的权限'
    },
    validation: {
      icon: 'warning',
      title: '数据验证错误',
      subTitle: '请检查输入数据是否正确'
    },
    server: {
      icon: 'error',
      title: '服务器错误',
      subTitle: '服务器暂时无法响应，请稍后重试'
    },
    notFound: {
      icon: 'info',
      title: '页面不存在',
      subTitle: '您访问的页面可能已被删除或移动'
    },
    timeout: {
      icon: 'warning',
      title: '请求超时',
      subTitle: '网络请求超时，请检查网络连接'
    },
    unknown: {
      icon: 'error',
      title: '未知错误',
      subTitle: '发生了未知错误，请稍后重试'
    }
  }

  return configs[errorType] || configs.unknown
})

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  console.error('ErrorBoundary caught an error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)

  error.value = err
  errorId.value = generateErrorId()
  hasError.value = true

  // 记录错误
  logError(err, instance, info)

  // 调用自定义错误处理
  if (props.onError) {
    props.onError(err, instance, info)
  }

  // 发出错误事件
  emit('error', err, instance, info)

  // 阻止错误继续向上传播
  return false
})

// 方法
const classifyError = (err) => {
  if (!err) return 'unknown'

  const message = err.message?.toLowerCase() || ''
  const status = err.status || err.response?.status

  // 网络错误
  if (message.includes('network') || message.includes('fetch') ||
      message.includes('connection') || status === 0) {
    return 'network'
  }

  // 权限错误
  if (status === 401 || status === 403 ||
      message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission'
  }

  // 验证错误
  if (status === 400 || message.includes('validation') ||
      message.includes('invalid')) {
    return 'validation'
  }

  // 服务器错误
  if (status >= 500 || message.includes('server') ||
      message.includes('internal')) {
    return 'server'
  }

  // 资源不存在
  if (status === 404 || message.includes('not found')) {
    return 'notFound'
  }

  // 超时错误
  if (message.includes('timeout') || status === 408) {
    return 'timeout'
  }

  return 'unknown'
}

const generateErrorId = () => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const logError = (err, instance, info) => {
  try {
    // 这里可以集成错误上报服务
    const errorData = {
      id: errorId.value,
      message: err.message,
      stack: err.stack,
      component: instance?.$options?.name || 'Unknown',
      info,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId(), // 假设有获取用户ID的方法
      version: getAppVersion() // 假设有获取应用版本的方法
    }

    // 开发环境下打印错误
    if (isDevelopment.value) {
      console.group(`🚨 Error [${errorId.value}]`)
      console.error('Error:', err)
      console.error('Component:', instance)
      console.error('Info:', info)
      console.groupEnd()
    }

    // 生产环境下上报错误
    if (!isDevelopment.value) {
      // 这里可以调用错误上报API
      // reportError(errorData)
    }
  } catch (logError) {
    console.error('Failed to log error:', logError)
  }
}

const getCurrentUserId = () => {
  // 从用户store或其他地方获取当前用户ID
  try {
    return localStorage.getItem('userId') || 'anonymous'
  } catch {
    return 'anonymous'
  }
}

const getAppVersion = () => {
  // 获取应用版本信息
  try {
    return process.env.VUE_APP_VERSION || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

const handleRetry = () => {
  hasError.value = false
  error.value = null
  errorId.value = null

  if (props.onRetry) {
    props.onRetry()
  }

  emit('retry')
}

const handleRefresh = () => {
  window.location.reload()
}

const handleGoHome = () => {
  window.location.href = '/'
}

// 重置错误状态
const resetError = () => {
  hasError.value = false
  error.value = null
  errorId.value = null
}

// 暴露方法给父组件
defineExpose({
  resetError,
  hasError: hasError.value,
  error: error.value
})
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;

  .boundary-content {
    width: 100%;
    height: 100%;
  }

  .error-display {
    padding: 40px 20px;
    text-align: center;

    .error-details {
      margin-top: 24px;
      text-align: left;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;

      .error-info {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;

        p {
          margin: 8px 0;
          line-height: 1.5;

          strong {
            color: var(--color-danger);
          }
        }

        .error-stack {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-lighter);
          border-radius: 4px;
          padding: 12px;
          font-size: 12px;
          line-height: 1.4;
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }
}

// 全局错误样式
:deep(.el-result) {
  .el-result__icon {
    font-size: 64px;
  }

  .el-result__title {
    margin: 16px 0 8px 0;
  }

  .el-result__subtitle {
    color: var(--color-text-secondary);
  }

  .el-result__extra {
    margin-top: 24px;

    .el-button {
      margin: 0 8px;
    }
  }
}
</style>