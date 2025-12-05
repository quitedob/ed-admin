<template>
  <div class="question-builder">
    <div class="builder-header">
      <div class="stats">
        <span>总题数: {{ questions.length }}</span>
      </div>
      <el-button type="primary" @click="handleAddFromBank">
        <el-icon><Plus /></el-icon>
        从题库添加
      </el-button>
    </div>

    <!-- 题目列表 -->
    <div class="question-list">
      <div v-if="questions.length === 0" class="empty-state">
        <el-empty description="暂无题目，请从题库添加" />
      </div>

      <div v-else>
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-num">{{ index + 1 }}.</span>
            <el-tag :type="getTypeTagType(question.type)" size="small">
              {{ getTypeLabel(question.type) }}
            </el-tag>
            <span class="question-text">{{ question.questionText }}</span>
            <div class="question-actions">
              <el-button
                type="danger"
                size="small"
                text
                @click="handleRemove(index)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:questions', 'open-question-selector'])

const questionsValue = computed({
  get: () => props.questions,
  set: (val) => emit('update:questions', val)
})

const handleAddFromBank = () => {
  emit('open-question-selector')
}

const handleRemove = (index) => {
  questionsValue.value.splice(index, 1)
}

const getTypeLabel = (type) => {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    essay: '简答',
    programming: 'OJ'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    essay: '',
    programming: 'danger'
  }
  return map[type] || ''
}

const getDifficultyLabel = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const map = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return map[difficulty] || ''
}
</script>

<style lang="scss" scoped>
.question-builder {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-shrink: 0;

    .stats {
      font-size: 14px;
      color: var(--color-text-secondary);
    }
  }

  .question-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;

    .empty-state {
      padding: 40px 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .question-item {
      padding: 16px;
      margin-bottom: 12px;
      background: var(--color-bg-secondary);
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .question-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .question-num {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .question-text {
          flex: 1;
          color: var(--color-text-regular);
        }

        .question-actions {
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>
