<template>
  <el-card class="class-card" shadow="hover">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="class-name">{{ classData.name }}</h3>
      </div>
      <div class="header-right">
        <el-tag type="info">{{ getGradeLabel(classData.grade) }}</el-tag>
      </div>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-statistic title="学生数" :value="classData.studentCount" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="老师数" :value="classData.teacherCount" />
        </el-col>
        <el-col :span="8">
          <div class="class-code-display">
            <div class="code-label">班级码</div>
            <div class="code-value">{{ classData.code }}</div>
          </div>
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
const expandPanel = (type) => {
  panelType.value = type
  expanded.value = !expanded.value
}

const editClass = () => {
  emit('edit', props.classData)
}

const getGradeLabel = (grade) => {
  const map = {
    grade1: '一年级',
    grade2: '二年级',
    grade3: '三年级',
    grade4: '四年级',
    grade5: '五年级',
    grade7: '初一',
    grade8: '初二',
    grade9: '初三',
    grade10: '高一',
    grade11: '高二',
    grade12: '高三'
  }
  return map[grade] || grade
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
  align-items: center;
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

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.card-body {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;

  .class-code-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .code-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .code-value {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      font-family: monospace;
      letter-spacing: 2px;
    }
  }
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
