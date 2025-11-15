<template>
  <div class="question-bank-list">
    <el-table
      v-loading="loading"
      :data="questions"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目ID" align="center" prop="id" width="120">
        <template #default="scope">
          <span class="question-id">{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题目标题" align="left" prop="title" min-width="250" show-overflow-tooltip>
        <template #default="scope">
          <div class="question-title">
            <div class="title-text">{{ scope.row.title }}</div>
            <div class="question-meta">
              <el-tag size="small" :type="getDifficultyTagType(scope.row.difficulty)">
                {{ getDifficultyLabel(scope.row.difficulty) }}
              </el-tag>
              <el-tag size="small" type="info">
                {{ getQuestionTypeLabel(scope.row.type) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="题目内容" align="left" min-width="300" show-overflow-tooltip>
        <template #default="scope">
          <div class="question-content">
            {{ stripHtml(scope.row.questionText) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" width="120">
        <template #default="scope">
          <el-tag type="info" size="small">
            {{ getCategoryLabel(scope.row.metadata?.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" width="200">
        <template #default="scope">
          <div class="tags-container">
            <el-tag
              v-for="tag in (scope.row.metadata?.tags || scope.row.tags || []).slice(0, 3)"
              :key="tag"
              size="small"
              style="margin: 2px;"
            >
              {{ tag }}
            </el-tag>
            <span v-if="(scope.row.metadata?.tags || scope.row.tags || []).length > 3" class="more-tags">
              +{{ (scope.row.metadata?.tags || scope.row.tags || []).length - 3 }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最后使用" align="center" width="120">
        <template #default="scope">
          <span>{{ formatLastUsed(scope.row.lastUsed) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="success" size="small" @click="$emit('add-to-assignment', scope.row)">
            添加到作业
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('edit', scope.row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="$emit('delete', scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 题目预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="`题目预览 - ${currentQuestion?.title || '未知题目'}`"
      width="80%"
      append-to-body
      @closed="handlePreviewClose"
    >
      <div v-if="currentQuestion" class="question-preview">
        <!-- 单选题预览 -->
        <SingleChoice
          v-if="currentQuestion.type === 'single'"
          :key="`single-${currentQuestion.id}`"
          :question="currentQuestion"
          :show-answer="true"
          :show-explanation="true"
        />

        <!-- 多选题预览 -->
        <MultipleChoice
          v-else-if="currentQuestion.type === 'multiple'"
          :key="`multiple-${currentQuestion.id}`"
          :question="currentQuestion"
          :show-answer="true"
          :show-explanation="true"
        />

        <!-- 填空题预览 -->
        <FillBlank
          v-else-if="currentQuestion.type === 'fill'"
          :key="`fill-${currentQuestion.id}`"
          :question="currentQuestion"
          :show-answer="true"
          :show-explanation="true"
        />

        <!-- 应用题预览 -->
        <EssayQuestion
          v-else-if="currentQuestion.type === 'essay'"
          :key="`essay-${currentQuestion.id}`"
          :question="currentQuestion"
          :show-answer="true"
          :show-explanation="true"
        />

        <!-- OJ题预览 -->
        <OJQuestion
          v-else-if="currentQuestion.type === 'oj'"
          :key="`oj-${currentQuestion.id}`"
          :question="currentQuestion"
          :show-answer="false"
          :show-explanation="true"
          :show-solution="true"
          :is-admin="true"
        />

        <!-- 默认显示 -->
        <div v-else :key="`default-${currentQuestion.id}`" class="question-preview-placeholder">
          <p>该题目类型暂不支持预览</p>
          <pre>{{ JSON.stringify(currentQuestion, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SingleChoice from '@/components/Renderer/questions/SingleChoice.vue'
import MultipleChoice from '@/components/Renderer/questions/MultipleChoice.vue'
import FillBlank from '@/components/Renderer/questions/FillBlank.vue'
import EssayQuestion from '@/components/Renderer/questions/EssayQuestion.vue'
import OJQuestion from '@/components/Renderer/questions/OJQuestion.vue'

const props = defineProps({
  questionType: {
    type: String,
    default: 'single'
  },
  questions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-to-assignment', 'edit', 'delete', 'selection-change'])

// 预览相关
const previewVisible = ref(false)
const currentQuestion = ref(null)

const handlePreviewClose = () => {
  currentQuestion.value = null
}

// 去除HTML标签
const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 100) + (html.length > 100 ? '...' : '')
}

// 格式化最后使用时间
const formatLastUsed = (dateString) => {
  if (!dateString) return '未使用'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return date.toLocaleDateString('zh-CN')
}

// 获取难度标签颜色
const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return difficultyMap[difficulty] || 'info'
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

// 获取题目类型标签文本
const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '应用题',
    'oj': 'OJ题'
  }
  return typeMap[type] || type
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const categoryMap = {
    'theory': '理论',
    'frontend': '前端开发',
    'algorithm': '算法',
    'datastructure': '数据结构',
    'application': '理论应用',
    'uncategorized': '未分类'
  }
  return categoryMap[category] || category || '未分类'
}


// 处理选择变化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/QuestionBankList.vue`);
  });

</script>

<style lang="scss" scoped>
.question-bank-list {
  .question-id {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #909399;
  }

  .question-title {
    .title-text {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .question-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .score {
        font-weight: 600;
        color: #f56c6c;
        font-size: 12px;
      }
    }
  }

  .question-content {
    color: #606266;
    line-height: 1.4;
    font-size: 13px;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: center;

    .more-tags {
      font-size: 12px;
      color: #909399;
      margin-left: 4px;
    }
  }

  .usage-count {
    font-weight: 600;
    color: #409eff;
  }
}

.question-preview {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.question-preview-placeholder {
  padding: 20px;
  text-align: center;
  color: #909399;

  p {
    margin-bottom: 15px;
    font-size: 16px;
  }

  pre {
    text-align: left;
    background: #f5f5f5;
    padding: 15px;
    border-radius: 6px;
    font-size: 12px;
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>