<template>
  <div class="course-edit-tabs">
    <div class="tabs-header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-item', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <el-icon v-if="tab.icon" class="tab-icon">
          <component :is="tab.icon" />
        </el-icon>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <div class="tabs-content">
      <slot :name="`tab-${activeTab}`" />
    </div>
  </div>
</template>

<script setup name="CourseEditTabs">
import { ref } from 'vue'

defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const activeTab = ref(null)

// 初始化第一个标签
if (defineProps.tabs && defineProps.tabs.length > 0) {
  activeTab.value = defineProps.tabs[0].id
}
</script>

<style lang="scss" scoped>
.course-edit-tabs {
  .tabs-header {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #e4e7ed;
    margin-bottom: 20px;

    .tab-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.3s;
      color: #606266;
      font-weight: 500;

      &:hover {
        color: #409eff;
      }

      &.active {
        color: #409eff;
        border-bottom-color: #409eff;
      }

      .tab-icon {
        font-size: 16px;
      }

      .tab-label {
        font-size: 14px;
      }
    }
  }

  .tabs-content {
    animation: fadeIn 0.3s ease-in;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
