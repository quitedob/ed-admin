<template>
  <div v-if="isDevelopment" class="dev-mode-toggle">
    <el-tooltip content="切换API模式" placement="top">
      <el-switch
        v-model="useMockApi"
        @change="handleToggle"
        :active-text="activeText"
        :inactive-text="inactiveText"
        active-color="#ff6b6b"
        inactive-color="#409eff"
      />
    </el-tooltip>
    <span class="mode-label">{{ modeLabel }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const isDevelopment = process.env.NODE_ENV === 'development'
const useMockApi = ref(false)

const activeText = computed(() => 'Mock API')
const inactiveText = computed(() => 'Real API')
const modeLabel = computed(() => useMockApi.value ? 'Mock模式' : 'API模式')

const handleToggle = (value) => {
  localStorage.setItem('useMockApi', value.toString())
  if (value) {
    ElMessage({
      message: '已切换到Mock API模式',
      type: 'success',
      duration: 2000
    })
  } else {
    ElMessage({
      message: '已切换到Real API模式',
      type: 'success',
      duration: 2000
    })
  }

  // 通知其他组件API模式已更改
  window.dispatchEvent(new CustomEvent('api-mode-changed', {
    detail: { useMock: value }
  }))
}

onMounted(() => {
  const savedMode = localStorage.getItem('useMockApi')
  useMockApi.value = savedMode === 'true'
})
</script>

<style lang="scss" scoped>
.dev-mode-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border-lighter);

  .mode-label {
    font-size: 12px;
    color: var(--color-text-primary);
    font-weight: 500;
  }
}
</style>