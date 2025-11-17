<template>
  <div class="question-card">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="question-type">
        <el-tag :type="getTypeTagType(question.type)" size="small">
          {{ getTypeLabel(question.type) }}
        </el-tag>
      </div>
      <div class="question-difficulty">
        <el-tag :type="getDifficultyTagType(question.difficulty)" size="small">
          <el-icon><Star /></el-icon>
          {{ getDifficultyLabel(question.difficulty) }}
        </el-tag>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <h4 class="question-title" :title="question.title">
        {{ question.title }}
      </h4>

      <div class="question-excerpt">
        {{ getExcerpt(question.content || question.questionText) }}
      </div>

      <!-- 题目标签 -->
      <div class="question-tags" v-if="question.tags?.length">
        <el-tag
          v-for="tag in question.tags.slice(0, 3)"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
          class="tag-item"
        >
          {{ tag }}
        </el-tag>
        <el-tag
          v-if="question.tags.length > 3"
          size="small"
          type="info"
          effect="plain"
          class="tag-more"
        >
          +{{ question.tags.length - 3 }}
        </el-tag>
      </div>
    </div>

    <!-- 卡片底部统计 -->
    <div class="card-stats">
      <div class="stat-item">
        <el-icon><View /></el-icon>
        <span>{{ question.useCount || 0 }}次使用</span>
      </div>
      <div class="stat-item">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDate(question.createTime) }}</span>
      </div>
    </div>

    <!-- 卡片操作 -->
    <div class="card-actions">
      <el-button size="small" @click="handleView">
        <el-icon><View /></el-icon>
        查看
      </el-button>

      <el-dropdown @command="handleCommand" placement="bottom">
        <el-button size="small" type="primary">
          操作
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit">
              <el-icon><Edit /></el-icon>
              编辑题目
            </el-dropdown-item>
            <el-dropdown-item command="add-assignment">
              <el-icon><Document /></el-icon>
              添加到作业
            </el-dropdown-item>
            <el-dropdown-item command="add-exam">
              <el-icon><DocumentChecked /></el-icon>
              添加到考试
            </el-dropdown-item>
            <el-dropdown-item command="duplicate" divided>
              <el-icon><CopyDocument /></el-icon>
              复制题目
            </el-dropdown-item>
            <el-dropdown-item command="delete" class="danger-item">
              <el-icon><Delete /></el-icon>
              删除题目
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 学科标识 -->
    <div class="subject-badge" :class="`subject-${question.subject}`">
      {{ getSubjectLabel(question.subject) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Star, View, Clock, Edit, Document, DocumentChecked,
  CopyDocument, Delete, ArrowDown
} from '@element-plus/icons-vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'add-to-assignment', 'add-to-exam'])

// 方法
const handleView = () => {
  emit('view', props.question)
}

const handleCommand = (command) => {
  switch (command) {
    case 'edit':
      emit('edit', props.question)
      break
    case 'add-assignment':
      emit('add-to-assignment', props.question)
      break
    case 'add-exam':
      emit('add-to-exam', props.question)
      break
    case 'duplicate':
      handleDuplicate()
      break
    case 'delete':
      emit('delete', props.question)
      break
  }
}

const handleDuplicate = () => {
  ElMessage.success('题目复制成功')
}

// 获取内容摘要
const getExcerpt = (content) => {
  if (!content) return '暂无内容'

  // 移除HTML标签（如果有）
  const textContent = content.replace(/<[^>]*>/g, '')

  // 截取前100个字符
  return textContent.length > 100
    ? textContent.substring(0, 100) + '...'
    : textContent
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
  return `${Math.floor(diffDays / 365)}年前`
}

// 辅助方法
const getTypeLabel = (type) => {
  const typeMap = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    programming: '编程',
    essay: '简答'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    programming: 'danger',
    essay: ''
  }
  return typeMap[type] || ''
}

const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return difficultyMap[difficulty] || ''
}

const getSubjectLabel = (subject) => {
  const subjectMap = {
    cs: '计算机',
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    english: '英语'
  }
  return subjectMap[subject] || subject
}
</script>

<style lang="scss" scoped>
.question-card {
  position: relative;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border-lighter);
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    border-color: var(--color-primary);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .question-type {
      flex-shrink: 0;
    }

    .question-difficulty {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .card-content {
    margin-bottom: 16px;

    .question-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .question-excerpt {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .question-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      .tag-item {
        font-size: 12px;
        height: 20px;
        line-height: 18px;
      }

      .tag-more {
        font-size: 12px;
        height: 20px;
        line-height: 18px;
        background-color: var(--color-bg-secondary);
      }
    }
  }

  .card-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border-lighter);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--color-text-secondary);

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;

    .el-button {
      flex: 1;
    }
  }

  .subject-badge {
    position: absolute;
    top: -1px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 0 0 8px 8px;
    font-weight: 500;

    &.subject-cs {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.subject-math {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.subject-physics {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.subject-chemistry {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.subject-english {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }
}

// 危险操作项样式
:deep(.danger-item) {
  color: var(--color-danger) !important;

  &:hover {
    background-color: var(--color-danger-light-9) !important;
  }
}
</style>