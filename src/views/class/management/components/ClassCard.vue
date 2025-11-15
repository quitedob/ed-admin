<template>
  <el-card class="class-card" shadow="hover">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="class-name">{{ classData.name }}</h3>
        <el-tag type="info">{{ classData.grade }}级</el-tag>
      </div>
      <div class="class-code">
        <span class="code-label">班级码:</span>
        <span class="code-value">{{ classData.code }}</span>
        <el-button
          :icon="CopyDocument"
          size="small"
          text
          @click="copyCode"
        />
      </div>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-statistic title="学生数" :value="classData.studentCount" />
        </el-col>
        <el-col :span="12">
          <el-statistic title="老师数" :value="classData.teacherCount" />
        </el-col>
      </el-row>
    </div>

    <!-- 卡片底部操作按钮 -->
    <div class="card-actions">
      <el-button size="small" @click="expandPanel('student')">授权学生</el-button>
      <el-button size="small" @click="expandPanel('teacher')">授权老师</el-button>
      <el-button size="small" @click="expandPanel('course')">授权课程</el-button>
      <el-button size="small" @click="expandPanel('homework')">授权作业</el-button>
      <el-button size="small" @click="expandPanel('exam')">授权考试</el-button>
      <el-button size="small" type="warning" @click="showAudit">
        审核申请
        <el-badge :value="pendingCount" />
      </el-button>
      <el-button size="small" @click="editClass">编辑</el-button>
    </div>

    <!-- 展开面板 -->
    <el-collapse-transition>
      <div v-show="expanded" class="expand-panel">
        <AuthorizationPanel
          :type="panelType"
          :class-id="classData.id"
          :class-data="classData"
          @close="expanded = false"
        />
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import AuthorizationPanel from './AuthorizationPanel.vue'

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'audit'])

// 响应式数据
const expanded = ref(false)
const panelType = ref('student')
const pendingCount = ref(2) // 模拟待审核数量

// 方法
const copyCode = () => {
  navigator.clipboard.writeText(props.classData.code)
  ElMessage.success('班级码已复制')
}

const expandPanel = (type) => {
  panelType.value = type
  expanded.value = !expanded.value
}

const showAudit = () => {
  emit('audit', props.classData)
}

const editClass = () => {
  emit('edit', props.classData)
}
</script>

<style lang="scss" scoped>
.class-card {
  margin-bottom: 20px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .class-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .class-code {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;

    .code-label {
      color: #909399;
    }

    .code-value {
      color: #303133;
      font-weight: 500;
      font-family: monospace;
    }
  }
}

.card-body {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;

  .el-button {
    font-size: 12px;
  }
}

.expand-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>
