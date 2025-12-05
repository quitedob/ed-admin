<template>
  <button
    class="enhanced-close-button"
    @click="$emit('click')"
    :title="title || '关闭此对话框'"
  >
    <svg
      class="close-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup>
import { onMounted } from 'vue';
defineEmits(['click'])
defineProps({
  title: {
    type: String,
    default: '关闭此对话框'
  }
})

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/EnhancedCloseButton/index.vue`);
  });

</script>

<style scoped>
.enhanced-close-button {
  // 布局和尺寸
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: var(--radius-base);

  // 显示在右上角
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;

  // 背景和颜色 - 使用危险色调，符合rule.txt
  background-color: var(--color-danger);
  border: 2px solid var(--color-danger);
  cursor: pointer;

  // 过渡动画
  transition: var(--transition);
  box-shadow: var(--shadow-sm);

  // Flexbox布局居中图标
  display: flex;
  align-items: center;
  justify-content: center;

  // 鼠标悬停效果
  &:hover {
    background-color: var(--color-bg-primary);
    border-color: var(--color-danger);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);

    .close-icon {
      color: var(--color-danger);
    }
  }

  // 点击效果
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
  }

  // 焦点状态
  &:focus {
    outline: 2px solid var(--color-danger);
    outline-offset: 2px;
  }

  // 禁用状态
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;

    &:hover {
      background-color: var(--color-danger);
      border-color: var(--color-danger);
      transform: none;
      box-shadow: var(--shadow-sm);

      .close-icon {
        color: var(--color-white);
      }
    }
  }
}

.close-icon {
  width: 18px;
  height: 18px;
  color: var(--color-white);
  transition: var(--transition);
  stroke-width: 2.5;
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .enhanced-close-button {
    &:hover {
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
    }
  }
}
</style>