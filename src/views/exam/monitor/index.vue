<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>考试监控</span>
        </div>
      </template>

      <div class="monitor-content">
        <el-empty description="考试监控功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup name="ExamMonitor">
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-content {
  padding: 40px;
}
</style>
