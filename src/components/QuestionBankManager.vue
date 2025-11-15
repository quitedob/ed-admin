<template>
  <div class="question-bank-manager">
    <!-- 三级标签筛选器 -->
    <div class="filter-bar">
      <el-select
        v-model="filter.level1"
        placeholder="一级标签(课程/考点)"
        clearable
        class="filter-select"
        @change="applyFilter"
      >
        <el-option
          v-for="tag in level1Tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>

      <el-select
        v-model="filter.level2"
        placeholder="二级标签(题型)"
        clearable
        class="filter-select"
        @change="applyFilter"
      >
        <el-option
          v-for="tag in level2Tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>

      <el-select
        v-model="filter.level3"
        placeholder="三级标签(难度)"
        clearable
        class="filter-select"
        @change="applyFilter"
      >
        <el-option
          v-for="tag in level3Tags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>

      <el-button type="primary" @click="applyFilter">筛选</el-button>
      <el-button @click="clearFilter">清空</el-button>
    </div>

    <!-- 筛选结果统计 -->
    <div class="filter-stats">
      <span>共筛选出 <strong>{{ filteredQuestions.length }}</strong> 道题目</span>
    </div>

    <!-- 题目列表 -->
    <div class="question-list">
      <div
        v-for="(question, index) in filteredQuestions"
        :key="question.id"
        class="question-card"
      >
        <div class="question-header">
          <span class="question-index">{{ index + 1 }}.</span>
          <span class="question-content">{{ truncateText(question.content, 100) }}</span>
        </div>

        <div class="question-tags">
          <el-tag type="info" size="small" class="tag-item">
            {{ question.type }}
          </el-tag>
          <el-tag type="warning" size="small" class="tag-item">
            {{ question.difficulty }}
          </el-tag>
          <el-tag
            v-for="(point, idx) in question.knowledgePoints.slice(0, 3)"
            :key="idx"
            size="small"
            class="tag-item"
          >
            {{ point }}
          </el-tag>
          <el-tag v-if="question.knowledgePoints.length > 3" size="small" class="tag-item">
            +{{ question.knowledgePoints.length - 3 }}
          </el-tag>
        </div>

        <div class="question-actions">
          <el-button text type="primary" size="small" @click="viewDetail(question)">
            查看详情
          </el-button>
          <el-button text type="success" size="small" @click="addToHomework(question)">
            添加到作业
          </el-button>
          <el-button text type="warning" size="small" @click="addToExam(question)">
            添加到考试
          </el-button>
        </div>
      </div>

      <el-empty v-if="filteredQuestions.length === 0" description="暂无题目" />
    </div>

    <!-- 题目详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="题目详情"
      width="80%"
      append-to-body
    >
      <div v-if="selectedQuestion" class="question-detail">
        <div class="detail-section">
          <h4>题目内容</h4>
          <p>{{ selectedQuestion.content }}</p>
        </div>

        <div class="detail-section">
          <h4>题目信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="题型">{{ selectedQuestion.type }}</el-descriptions-item>
            <el-descriptions-item label="难度">{{ selectedQuestion.difficulty }}</el-descriptions-item>
            <el-descriptions-item label="分值">{{ selectedQuestion.score }}分</el-descriptions-item>
            <el-descriptions-item label="知识点">
              <el-tag
                v-for="point in selectedQuestion.knowledgePoints"
                :key="point"
                size="small"
                style="margin-right: 5px;"
              >
                {{ point }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="selectedQuestion.answer" class="detail-section">
          <h4>参考答案</h4>
          <p>{{ selectedQuestion.answer }}</p>
        </div>

        <div v-if="selectedQuestion.explanation" class="detail-section">
          <h4>题目解析</h4>
          <p>{{ selectedQuestion.explanation }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  type: {
    type: String,
    default: 'homework' // 'homework' or 'exam'
  }
})

// Emits
const emit = defineEmits(['add-to-homework', 'add-to-exam', 'view-detail'])

// 响应式数据
const filter = ref({
  level1: '',
  level2: '',
  level3: ''
})

const detailDialogVisible = ref(false)
const selectedQuestion = ref(null)

// 模拟题目数据
const questions = ref([
  {
    id: 'q1',
    content: '中国的首都是哪个城市？',
    type: '单选题',
    difficulty: '简单',
    score: 5,
    knowledgePoints: ['地理', '中国'],
    answer: 'A. 北京',
    explanation: '中国的首都是北京，位于华北平原。'
  },
  {
    id: 'q2',
    content: '以下哪些是编程语言？',
    type: '多选题',
    difficulty: '中等',
    score: 10,
    knowledgePoints: ['编程', '计算机'],
    answer: 'A, B, C',
    explanation: 'Python、Java、C++都是编程语言。'
  },
  {
    id: 'q3',
    content: '地球绕太阳公转一周需要_____天。',
    type: '填空题',
    difficulty: '简单',
    score: 5,
    knowledgePoints: ['天文', '地球'],
    answer: '365',
    explanation: '地球绕太阳公转一周约需365.25天。'
  },
  {
    id: 'q4',
    content: '请简述什么是人工智能？',
    type: '简答题',
    difficulty: '困难',
    score: 15,
    knowledgePoints: ['人工智能', '计算机科学'],
    answer: '人工智能是计算机科学的一个分支...',
    explanation: '这是一道考查学生对AI基本概念理解的题目。'
  },
  {
    id: 'q5',
    content: '计算1+2+3+...+100的和。',
    type: '编程题',
    difficulty: '中等',
    score: 20,
    knowledgePoints: ['算法', '数学'],
    answer: '5050',
    explanation: '可以使用求和公式或循环计算。'
  },
  {
    id: 'q6',
    content: '光的速度是多少？',
    type: '单选题',
    difficulty: '简单',
    score: 5,
    knowledgePoints: ['物理', '光学'],
    answer: 'C. 3×10^8 m/s',
    explanation: '光在真空中的速度约为3×10^8米每秒。'
  }
])

// 一级标签（课程/考点）
const level1Tags = ref([
  '数学',
  '物理',
  '化学',
  '生物',
  '地理',
  '编程',
  '计算机科学'
])

// 二级标签（题型）
const level2Tags = ref([
  '单选题',
  '多选题',
  '填空题',
  '简答题',
  '编程题'
])

// 三级标签（难度）
const level3Tags = ref([
  '简单',
  '中等',
  '困难'
])

// 计算过滤后的题目
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    let match = true
    if (filter.value.level1) {
      match = match && q.knowledgePoints.includes(filter.value.level1)
    }
    if (filter.value.level2) {
      match = match && q.type === filter.value.level2
    }
    if (filter.value.level3) {
      match = match && q.difficulty === filter.value.level3
    }
    return match
  })
})

// 方法
const applyFilter = () => {
  // 筛选逻辑已在computed中实现
}

const clearFilter = () => {
  filter.value = {
    level1: '',
    level2: '',
    level3: ''
  }
}

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const viewDetail = (question) => {
  selectedQuestion.value = question
  detailDialogVisible.value = true
  emit('view-detail', question)
}

const addToHomework = (question) => {
  ElMessage.success(`已添加题目 "${question.content}" 到作业`)
  emit('add-to-homework', question)
}

const addToExam = (question) => {
  ElMessage.success(`已添加题目 "${question.content}" 到考试`)
  emit('add-to-exam', question)
}
</script>

<style lang="scss" scoped>
.question-bank-manager {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  min-width: 200px;
}

.filter-stats {
  margin-bottom: 20px;
  padding: 12px;
  background: #f0f9ff;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  color: #606266;
}

.filter-stats strong {
  color: #409eff;
  font-weight: 600;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
  }
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.question-index {
  font-weight: 600;
  color: #409eff;
  min-width: 30px;
  flex-shrink: 0;
}

.question-content {
  color: #303133;
  line-height: 1.5;
  flex: 1;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag-item {
  margin: 0;
}

.question-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.question-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #606266;
    line-height: 1.6;
  }
}
</style>
