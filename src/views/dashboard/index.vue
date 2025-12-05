<template>
  <div id="dashboard-container" class="dashboard-container">
    <el-row :gutter="20">
      <el-col v-if="hasPermission('stat:data')" :span="12">
        <stat-data />
      </el-col>
      <el-col :span="12">
        <el-card class="info">
          <template #header>芝麻编程的管理系统介绍</template>
          <div id="info-body" class="info-body">
            <div id="info-content" class="info-content">
              <div>1. <strong>课程管理</strong>：支持视频、文档、图片等多种内容形式</div>
              <div>2. <strong>学员跟踪</strong>：实时监控学习进度和成绩表现</div>
              <div>3. <strong>智能评测</strong>：AI驱动的作业和考试自动批改系统</div>
              <div>4. <strong>班级管理</strong>：灵活的班级组织和授权管理功能</div>
              <div>5. <strong>数据分析</strong>：全面的学习报告和能力评估分析</div>
            </div>
            <div id="system-features" class="system-features">
              <el-icon><Platform /></el-icon>
              <span>一站式编程教育管理平台</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div v-if="hasPermission('stat:login')" id="stat-login-section">
      <stat-login />
    </div>
    <div v-if="hasPermission('stat:vod')" id="stat-vod-section">
      <stat-vod />
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
  import StatVod from './StatVod.vue'
  import StatLogin from './StatLogin.vue'
  import StatData from './StatData.vue'
  import { Platform } from '@element-plus/icons-vue'
  import { hasPermission } from '@/utils/permission.js'

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/dashboard/index.vue`);
  });

</script>
<style lang="scss" scoped>
  .info {
    padding: 15px;
    border-radius: var(--radius-base);
    font-size: 16px;
    background-color: var(--color-bg-primary);
    border: 1px solid var(--color-border-base);

    .info-body {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .info-content {
      div {
        line-height: 24px;
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-primary);

        strong {
          color: var(--color-primary-500);
          font-weight: 600;
        }
      }
    }

    .system-features {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background-color: var(--color-primary-50);
      border: 1px solid var(--color-primary-200);
      border-radius: var(--radius-base);
      color: var(--color-primary-700);
      font-weight: 500;
      transition: var(--transition);

      .el-icon {
        font-size: 20px;
        color: var(--color-primary-500);
      }

      &:hover {
        background-color: var(--color-primary-100);
        border-color: var(--color-primary-300);
      }
    }
  }
</style>
