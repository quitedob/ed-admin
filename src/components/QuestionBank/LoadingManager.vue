<template>
  <div class="loading-manager">
    <!-- 全局加载遮罩 -->
    <div v-if="globalLoading" class="global-loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <p>{{ globalLoadingText }}</p>
      </div>
    </div>

    <!-- 按钮加载状态 -->
    <el-button
      v-if="buttonLoading"
      :loading="buttonLoading"
      :disabled="buttonLoading"
      v-bind="$attrs"
    >
      {{ loadingText }}
    </el-button>

    <!-- 内容区域加载 -->
    <div v-if="contentLoading" class="content-loading">
      <el-skeleton :rows="skeletonRows" animated />
    </div>

    <!-- 进度条加载 -->
    <div v-if="progressLoading" class="progress-loading">
      <el-progress
        :percentage="progressPercentage"
        :status="progressStatus"
        :stroke-width="8"
      />
      <p class="progress-text">{{ progressText }}</p>
    </div>

    <!-- 空状态 -->
    <div v-if="showEmpty" class="empty-state">
      <el-empty
        :description="emptyDescription"
        :image="emptyImage"
      >
        <template #image>
          <el-icon class="empty-icon">
            <component :is="emptyIcon" />
          </el-icon>
        </template>
        <template #description>
          <p>{{ emptyDescription }}</p>
          <p class="empty-subtitle">{{ emptySubtitle }}</p>
        </template>
        <el-button
          v-if="emptyAction"
          type="primary"
          @click="handleEmptyAction"
        >
          {{ emptyActionText }}
        </el-button>
      </el-empty>
    </div>

    <!-- 错误状态 -->
    <div v-if="showError" class="error-state">
      <el-result
        :icon="errorIcon"
        :title="errorTitle"
        :sub-title="errorSubTitle"
      >
        <template #extra>
          <el-button type="primary" @click="handleRetry">重试</el-button>
          <el-button @click="handleErrorAction">其他操作</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading, Document, DataAnalysis, Warning, CircleCloseFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  // 全局加载
  globalLoading: {
    type: Boolean,
    default: false
  },
  globalLoadingText: {
    type: String,
    default: '加载中...'
  },

  // 按钮加载
  buttonLoading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中'
  },

  // 内容加载
  contentLoading: {
    type: Boolean,
    default: false
  },
  skeletonRows: {
    type: Number,
    default: 5
  },

  // 进度条加载
  progressLoading: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  progressStatus: {
    type: String,
    default: ''
  },
  progressText: {
    type: String,
    default: '处理中...'
  },

  // 空状态
  showEmpty: {
    type: Boolean,
    default: false
  },
  emptyType: {
    type: String,
    default: 'data' // data, search, network, error
  },
  emptyDescription: {
    type: String,
    default: '暂无数据'
  },
  emptySubtitle: {
    type: String,
    default: ''
  },
  emptyAction: {
    type: Boolean,
    default: false
  },
  emptyActionText: {
    type: String,
    default: '立即创建'
  },

  // 错误状态
  showError: {
    type: Boolean,
    default: false
  },
  errorType: {
    type: String,
    default: 'network' // network, permission, server, notFound
  },
  errorTitle: {
    type: String,
    default: '出错了'
  },
  errorSubTitle: {
    type: String,
    default: '请稍后重试或联系管理员'
  }
})

const emit = defineEmits(['retry', 'empty-action', 'error-action'])

// 计算属性
const emptyIcon = computed(() => {
  const iconMap = {
    data: Document,
    search: DataAnalysis,
    network: Warning,
    error: CircleCloseFilled
  }
  return iconMap[props.emptyType] || Document
})

const emptyImage = computed(() => {
  // 可以根据类型返回不同的图片
  return ''
})

const errorIcon = computed(() => {
  const iconMap = {
    network: 'warning',
    permission: 'warning',
    server: 'error',
    notFound: 'info'
  }
  return iconMap[props.errorType] || 'error'
})

// 方法
const handleRetry = () => {
  emit('retry')
}

const handleEmptyAction = () => {
  emit('empty-action')
}

const handleErrorAction = () => {
  emit('error-action')
}

// 监听进度变化，自动完成
watch(() => props.progressPercentage, (newVal) => {
  if (newVal >= 100 && props.progressLoading) {
    setTimeout(() => {
      ElMessage.success('操作完成')
    }, 500)
  }
})
</script>

<style lang="scss" scoped>
.loading-manager {
  position: relative;
  width: 100%;
  height: 100%;

  .global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .loading-content {
      text-align: center;

      .loading-icon {
        font-size: 48px;
        color: var(--color-primary);
        animation: rotate 2s linear infinite;
      }

      p {
        margin-top: 16px;
        color: var(--color-text-primary);
        font-size: 16px;
      }
    }
  }

  .content-loading {
    padding: 20px;
  }

  .progress-loading {
    padding: 20px;
    text-align: center;

    .progress-text {
      margin-top: 12px;
      color: var(--color-text-secondary);
      font-size: 14px;
    }
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;

    .empty-icon {
      font-size: 64px;
      color: var(--color-text-placeholder);
      margin-bottom: 16px;
    }

    .empty-subtitle {
      color: var(--color-text-secondary);
      font-size: 14px;
      margin-top: 8px;
    }
  }

  .error-state {
    padding: 40px 20px;
    text-align: center;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>