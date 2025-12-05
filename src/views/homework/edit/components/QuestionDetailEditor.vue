<template>
  <div class="question-detail-editor">
    <div class="detail-header">
      <h3>题目 {{ index + 1 }}</h3>
      <el-tag :type="getTypeTagType(question.type)">
        {{ getTypeLabel(question.type) }}
      </el-tag>
    </div>

    <!-- 题目内容（只读） -->
    <div class="question-content-readonly">
      <div class="content-section">
        <div class="section-label">
          <el-icon><Document /></el-icon>
          题目内容
        </div>
        <div class="content-text">{{ question.questionText }}</div>
      </div>

      <!-- 单选题选项 -->
      <div v-if="question.type === 'single'" class="options-display">
        <div class="section-label">
          <el-icon><List /></el-icon>
          选项
        </div>
        <div
          v-for="option in question.options"
          :key="option.value"
          :class="['option-item', { correct: option.value === question.correctAnswer }]"
        >
          <span class="option-label">{{ option.value }}.</span>
          <span class="option-text">{{ option.text }}</span>
          <el-tag
            v-if="option.value === question.correctAnswer"
            type="success"
            size="small"
          >
            正确答案
          </el-tag>
        </div>
      </div>

      <!-- 多选题选项 -->
      <div v-if="question.type === 'multiple'" class="options-display">
        <div class="section-label">
          <el-icon><List /></el-icon>
          选项
        </div>
        <div
          v-for="option in question.options"
          :key="option.value"
          :class="['option-item', { correct: option.isCorrect }]"
        >
          <span class="option-label">{{ option.value }}.</span>
          <span class="option-text">{{ option.text }}</span>
          <el-tag
            v-if="option.isCorrect"
            type="success"
            size="small"
          >
            正确答案
          </el-tag>
        </div>
      </div>

      <!-- 填空题 -->
      <div v-if="question.type === 'fill'" class="fill-display">
        <div class="section-label">
          <el-icon><Edit /></el-icon>
          参考答案
        </div>
        <div v-for="(blank, bIndex) in question.fillBlanks" :key="bIndex" class="blank-item">
          <span class="blank-label">第{{ bIndex + 1 }}空:</span>
          <el-tag
            v-for="(answer, aIndex) in blank.answers"
            :key="aIndex"
            type="success"
            size="small"
            style="margin-right: 4px"
          >
            {{ answer }}
          </el-tag>
        </div>
      </div>

      <!-- 问答题 -->
      <div v-if="question.type === 'essay'" class="essay-display">
        <div class="section-label">
          <el-icon><Document /></el-icon>
          参考答案
        </div>
        <div class="reference-answer">{{ question.referenceAnswer }}</div>
      </div>

      <!-- 编程题 -->
      <div v-if="question.type === 'programming'" class="programming-display">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="HOJ题目ID">
            {{ question.hojProblemId }}
          </el-descriptions-item>
          <el-descriptions-item label="时间限制">
            {{ question.timeLimit }}ms
          </el-descriptions-item>
          <el-descriptions-item label="内存限制">
            {{ question.memoryLimit }}MB
          </el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-rate :model-value="question.difficulty" disabled :max="5" />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <el-divider />

    <!-- 作业特定设置 -->
    <div class="homework-specific-settings">
      <div class="section-label">
        <el-icon><Setting /></el-icon>
        作业设置
      </div>

      <el-form label-width="100px">
        <el-form-item label="本题分值">
          <el-input-number
            :model-value="question.score"
            :min="1"
            :max="100"
            @change="handleScoreChange"
          />
          <span style="margin-left: 8px; color: #909399">分</span>
        </el-form-item>

        <el-form-item label="是否必做">
          <el-switch
            :model-value="question.required"
            @change="handleRequiredChange"
          />
          <span style="margin-left: 12px; font-size: 13px; color: #909399">
            {{ question.required ? '学生必须完成此题' : '学生可选择完成' }}
          </span>
        </el-form-item>

        <el-form-item label="补充解析">
          <el-input
            :model-value="question.homeworkExplanation"
            type="textarea"
            :rows="4"
            placeholder="可以为本作业添加特定的答案解析，留空则使用题目原有解析"
            @input="handleExplanationChange"
          />
        </el-form-item>

        <el-form-item label="题目标签">
          <el-tag
            v-for="tag in question.tags"
            :key="tag"
            size="small"
            style="margin-right: 4px"
          >
            {{ tag }}
          </el-tag>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button @click="handleViewOriginal">
        <el-icon><View /></el-icon>
        查看原题
      </el-button>
      <el-button type="danger" @click="handleDelete">
        <el-icon><Delete /></el-icon>
        删除此题
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Document, List, Edit, Setting, View, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update', 'delete'])

const getTypeLabel = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题',
    programming: '编程题'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'info',
    programming: 'danger'
  }
  return map[type] || ''
}

const handleScoreChange = (value) => {
  emit('update', { score: value })
}

const handleRequiredChange = (value) => {
  emit('update', { required: value })
}

const handleExplanationChange = (value) => {
  emit('update', { homeworkExplanation: value })
}

const handleViewOriginal = () => {
  ElMessage.info('查看原题功能开发中...')
}

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete')
  })
}
</script>

<style lang="scss" scoped>
.question-detail-editor {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e4e7ed;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .question-content-readonly {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .content-section {
      margin-bottom: 16px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 12px;
    }

    .content-text {
      font-size: 15px;
      color: #303133;
      line-height: 1.8;
      white-space: pre-wrap;
    }

    .options-display {
      margin-top: 16px;

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        margin-bottom: 8px;
        background: white;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s;

        &.correct {
          background: #f0f9ff;
          border-color: #67c23a;
        }

        .option-label {
          font-weight: 600;
          color: #303133;
          min-width: 24px;
        }

        .option-text {
          flex: 1;
          color: #606266;
        }
      }
    }

    .fill-display,
    .essay-display {
      margin-top: 16px;

      .blank-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .blank-label {
          font-weight: 600;
          color: #606266;
        }
      }

      .reference-answer {
        padding: 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        line-height: 1.8;
        white-space: pre-wrap;
      }
    }

    .programming-display {
      margin-top: 16px;
    }
  }

  .homework-specific-settings {
    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
