  <template>
  <div class="question-bank-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>题库管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="main-content">
      <!-- 题库头部 -->
      <div class="bank-header">
        <div class="header-left">
          <h2 class="bank-title">{{ questionBank.name }}</h2>
          <el-tag type="info">总题数: {{ questionBank.totalQuestions }}道</el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAddQuestion">
            <el-icon><Plus /></el-icon>
            添加题目
          </el-button>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".json"
            :on-change="handleImportFile"
          >
            <el-button>
              <el-icon><Upload /></el-icon>
              导入题目
            </el-button>
          </el-upload>
          <el-button @click="tagManagerDrawerVisible = true">
            <el-icon><Setting /></el-icon>
            标签管理
          </el-button>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-area">
        <!-- 题型分类标签 -->
        <div class="type-tabs">
          <div
            v-for="type in questionTypes"
            :key="type.value"
            :class="['type-tab', { active: selectedType === type.value }]"
            @click="selectedType = type.value"
          >
            <span class="type-label">{{ type.label }}</span>
            <span class="type-count">{{ getTypeCount(type.value) }}</span>
          </div>
        </div>

        <!-- 搜索和标签筛选 -->
        <div class="search-filter-section">
          <!-- 搜索框 -->
          <el-input
            v-model="searchText"
            placeholder="搜索题目内容、解析或标签..."
            clearable
            style="width: 300px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 标签筛选 -->
          <div class="tag-filter-wrapper">
            <div class="filter-label">标签筛选：</div>
            <el-select
              v-model="selectedTags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="选择或创建标签（最多5个）"
              style="width: 400px"
              :max-collapse-tags="3"
              collapse-tags
              collapse-tags-tooltip
              clearable
              @change="handleTagChange"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag.name"
                :label="tag.name"
                :value="tag.name"
                :disabled="selectedTags.length >= 5 && !selectedTags.includes(tag.name)"
              >
                <span :style="{ color: tag.color, fontWeight: 500 }">{{ tag.name }}</span>
              </el-option>
            </el-select>
            <span v-if="selectedTags.length > 0" class="tag-count-hint">
              已选 {{ selectedTags.length }}/5
            </span>
          </div>
        </div>
      </div>

      <!-- 题目列表 -->
      <div class="question-list">
        <el-table :data="filteredQuestions" stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="questionText" label="题目内容" min-width="250" show-overflow-tooltip />
          <el-table-column label="题目标签" prop="tags" width="200">
            <template #default="{ row }">
              <div class="tag-container">
                <el-tag
                  v-for="tag in (row.tags || [])"
                  :key="typeof tag === 'string' ? tag : tag.name"
                  size="small"
                  :color="getTagColor(typeof tag === 'string' ? tag : tag.name)"
                  effect="light"
                  style="margin: 2px; border: none; color: white;"
                >
                  {{ typeof tag === 'string' ? tag : tag.name }}
                </el-tag>
                <span v-if="!row.tags || row.tags.length === 0" class="no-tags">
                  暂无标签
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditQuestion(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteQuestion(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- V2 新建/编辑题目对话框 -->
    <V2QuestionEditDialog
      v-model="questionDialogVisible"
      :question-data="currentQuestion"
      @save="handleSaveQuestion"
    />

    <!-- 题目管理抽屉 -->
    <QuestionManagementDrawer
      v-model="questionDrawerVisible"
      :bank-id="questionBank.id"
      @save="handleAddQuestions"
    />

    <!-- 标签管理抽屉 -->
    <TagManagerDrawer
      v-model="tagManagerDrawerVisible"
    />
  </div>
</template>

<script setup name="QuestionBank">
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus, Upload, Setting, Search } from "@element-plus/icons-vue"
import V2QuestionEditDialog from "@/components/V2QuestionEditDialog.vue"
import QuestionManagementDrawer from "./components/QuestionManagementDrawer.vue"
import TagManagerDrawer from "./components/TagManagerDrawer.vue"
// 题型定义
const questionTypes = [
  { label: '全部', value: 'all' },
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '判断题', value: 'judge' },
  { label: 'OJ题', value: 'programming' },
  { label: '简答题', value: 'essay' }
]

// 响应式数据
const selectedType = ref('all')
const selectedTags = ref([])
const searchText = ref('')
const questionDialogVisible = ref(false)
const questionDrawerVisible = ref(false)
const tagManagerDrawerVisible = ref(false)
const currentQuestion = ref(null)
const uploadRef = ref()

// 标签颜色池
const tagColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
  '#00d2d3', '#fa6400', '#722ed1', '#eb2f96', '#52c41a',
  '#1890ff', '#faad14', '#f5222d', '#13c2c2', '#2f54eb'
]

// 可用标签列表（扁平结构，每个标签只有名称和颜色）
const availableTags = ref([
  { name: '面向对象', color: '#409eff' },
  { name: '封装继承多态', color: '#67c23a' },
  { name: 'Java集合', color: '#e6a23c' },
  { name: '异常处理', color: '#f56c6c' },
  { name: '数组操作', color: '#909399' },
  { name: '二分查找', color: '#00d2d3' },
  { name: '单例模式', color: '#fa6400' },
  { name: '矩阵运算', color: '#722ed1' },
  { name: '概率计算', color: '#eb2f96' },
  { name: '词汇辨析', color: '#52c41a' },
  { name: '时态用法', color: '#1890ff' },
  { name: '二叉树遍历', color: '#faad14' },
  { name: '快速排序', color: '#f5222d' },
  { name: '动态规划', color: '#13c2c2' },
  { name: '贪心算法', color: '#2f54eb' },
  { name: '图论', color: '#409eff' },
  { name: '字符串处理', color: '#67c23a' },
  { name: '递归', color: '#e6a23c' },
  { name: '栈和队列', color: '#f56c6c' },
  { name: '哈希表', color: '#909399' }
])

// 自动分配标签颜色
const getAutoTagColor = () => {
  const usedColors = availableTags.value.map(t => t.color)
  const availableColors = tagColors.filter(c => !usedColors.includes(c))
  if (availableColors.length > 0) {
    return availableColors[0]
  }
  // 如果所有颜色都用完了，随机返回一个
  return tagColors[Math.floor(Math.random() * tagColors.length)]
}

// 添加或获取标签（自动查重）
const addOrGetTag = (tagName) => {
  if (!tagName || !tagName.trim()) return null
  
  const trimmedName = tagName.trim()
  
  // 查找是否已存在
  const existingTag = availableTags.value.find(t => t.name === trimmedName)
  if (existingTag) {
    return existingTag.name
  }
  
  // 不存在则新建
  const newTag = {
    name: trimmedName,
    color: getAutoTagColor()
  }
  availableTags.value.push(newTag)
  ElMessage.success(`已创建新标签: ${trimmedName}`)
  return newTag.name
}

// 题库数据
const questionBank = ref({
  id: 'bank_001',
  name: '题库',
  totalQuestions: 0,
  questions: []
})

// 计算属性
const filteredQuestions = computed(() => {
  let result = questionBank.value.questions

  // 按题型过滤
  if (selectedType.value !== 'all') {
    result = result.filter(q => q.type === selectedType.value)
  }

  // 按标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(q => {
      if (!q.tags || !Array.isArray(q.tags)) return false
      return selectedTags.value.some(selectedTag => {
        return q.tags.some(qTag => {
          // 兼容字符串和对象格式
          const tagName = typeof qTag === 'string' ? qTag : qTag.name
          return tagName === selectedTag
        })
      })
    })
  }

  // 按搜索文本过滤
  if (searchText.value.trim()) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(q => {
      return q.questionText?.toLowerCase().includes(keyword) ||
             q.explanation?.toLowerCase().includes(keyword) ||
             q.tags?.some(tag => tag.toLowerCase().includes(keyword))
    })
  }

  return result
})

// 初始化模拟数据
const initMockData = () => {
  questionBank.value.questions = [
    {
      id: 'q_001',
      type: 'single',
      questionText: '以下哪个不是面向对象编程的特性？',
      difficulty: 'easy',
      tags: ['面向对象', '封装继承多态'],
      options: [
        { value: 'A', text: '封装', isCorrect: false },
        { value: 'B', text: '继承', isCorrect: false },
        { value: 'C', text: '多态', isCorrect: false },
        { value: 'D', text: '编译', isCorrect: true }
      ],
      correctAnswer: 'D',
      explanation: '编译是程序执行过程，不是面向对象的特性'
    },
    {
      id: 'q_002',
      type: 'multiple',
      questionText: '以下哪些是Java的基本数据类型？',
      difficulty: 'easy',
      tags: ['Java集合', '异常处理'],
      options: [
        { value: 'A', text: 'int', isCorrect: true },
        { value: 'B', text: 'String', isCorrect: false },
        { value: 'C', text: 'boolean', isCorrect: true },
        { value: 'D', text: 'double', isCorrect: true }
      ],
      correctAnswer: ['A', 'C', 'D'],
      explanation: 'String是引用类型，不是基本数据类型'
    },
    {
      id: 'q_003',
      type: 'fill',
      questionText: 'Java中，___是所有类的父类，___方法用于比较两个对象是否相等。',
      difficulty: 'medium',
      tags: ['Java集合', '面向对象'],
      fillBlanks: [
        { answers: ['Object'] },
        { answers: ['equals'] }
      ],
      explanation: 'Object类是Java类层次结构的根，equals方法用于对象比较'
    },
    {
      id: 'q_004',
      type: 'judge',
      questionText: 'Java中，接口可以包含方法的实现。',
      difficulty: 'medium',
      tags: ['Java集合', '异常处理'],
      correctAnswer: true,
      explanation: 'Java 8之后，接口可以包含默认方法和静态方法的实现'
    },
    {
      id: 'q_005',
      type: 'programming',
      questionText: '实现一个函数，判断一个字符串是否为回文串',
      difficulty: 'medium',
      tags: ['数组操作', '二分查找'],
      hojProblemId: '1001',
      timeLimit: 1000,
      memoryLimit: 256,
      required: true,
      multipleSubmit: true,
      explanation: '可以使用双指针法，从两端向中间比较'
    },
    {
      id: 'q_006',
      type: 'essay',
      questionText: '请简述MVC设计模式的核心思想及其优点。',
      difficulty: 'hard',
      tags: ['单例模式'],
      referenceAnswer: 'MVC将应用分为Model（模型）、View（视图）、Controller（控制器）三层。优点包括：1.分离关注点 2.提高代码复用性 3.便于维护和测试',
      gradingCriteria: '需要说明三层的作用，至少列举两个优点',
      aiGrading: false,
      explanation: 'MVC是一种经典的软件架构模式'
    },
    {
      id: 'q_007',
      type: 'single',
      questionText: '下列哪个矩阵是可逆的？',
      difficulty: 'medium',
      score: 3,
      tags: ['矩阵运算'],
      options: [
        { value: 'A', text: '[1 2; 2 4]', isCorrect: false },
        { value: 'B', text: '[1 0; 0 1]', isCorrect: true },
        { value: 'C', text: '[0 0; 0 0]', isCorrect: false },
        { value: 'D', text: '[1 1; 1 1]', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: '单位矩阵总是可逆的，其逆矩阵就是它本身'
    },
    {
      id: 'q_008',
      type: 'fill',
      questionText: '设随机变量X服从正态分布N(2, 9)，则P(X≤5) = ___（保留三位小数）',
      difficulty: 'hard',
      score: 5,
      tags: ['概率计算'],
      fillBlanks: [
        { answers: ['0.841', '0.8413'] }
      ],
      explanation: '标准化：Z = (5-2)/3 = 1，查标准正态分布表得P(Z≤1) ≈ 0.8413'
    },
    {
      id: 'q_009',
      type: 'multiple',
      questionText: '下列哪些单词的过去式与原形相同？',
      difficulty: 'easy',
      score: 2,
      tags: ['词汇辨析'],
      options: [
        { value: 'A', text: 'put', isCorrect: true },
        { value: 'B', text: 'go', isCorrect: false },
        { value: 'C', text: 'cut', isCorrect: true },
        { value: 'D', text: 'run', isCorrect: false }
      ],
      correctAnswer: ['A', 'C'],
      explanation: 'put-put-put, cut-cut-cut 是不规则动词，过去式与原形相同'
    },
    {
      id: 'q_010',
      type: 'judge',
      questionText: '现在完成时可以表示从过去开始持续到现在的动作。',
      difficulty: 'medium',
      score: 2,
      tags: ['时态用法'],
      correctAnswer: true,
      explanation: '现在完成时的主要用法之一就是表示从过去开始持续到现在的动作或状态'
    },
    {
      id: 'q_011',
      type: 'programming',
      questionText: '实现二叉树的中序遍历',
      difficulty: 'medium',
      score: 8,
      tags: ['二叉树遍历'],
      hojProblemId: '1002',
      timeLimit: 1000,
      memoryLimit: 256,
      required: true,
      multipleSubmit: true,
      explanation: '中序遍历按照左子树-根节点-右子树的顺序遍历二叉树'
    },
    {
      id: 'q_012',
      type: 'single',
      questionText: '快速排序的平均时间复杂度是？',
      difficulty: 'easy',
      score: 2,
      tags: ['快速排序'],
      options: [
        { value: 'A', text: 'O(n)', isCorrect: false },
        { value: 'B', text: 'O(n log n)', isCorrect: true },
        { value: 'C', text: 'O(n²)', isCorrect: false },
        { value: 'D', text: 'O(log n)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: '快速排序的平均时间复杂度是O(n log n)，最坏情况下是O(n²)'
    }
  ]
  questionBank.value.totalQuestions = questionBank.value.questions.length
}

// 方法
const getTypeCount = (type) => {
  if (type === 'all') {
    return questionBank.value.totalQuestions
  }
  return questionBank.value.questions.filter(q => q.type === type).length
}

const handleAddQuestion = () => {
  questionDrawerVisible.value = true
}

const handleAddQuestions = (questions) => {
  if (questions && questions.length > 0) {
    questions.forEach(q => {
      const newQuestion = {
        ...q,
        id: `q_${Date.now()}_${Math.random()}`
      }
      questionBank.value.questions.push(newQuestion)
    })
    questionBank.value.totalQuestions = questionBank.value.questions.length
    ElMessage.success(`成功添加 ${questions.length} 道题目`)
  }
  questionDrawerVisible.value = false
}

const handleEditQuestion = (question) => {
  currentQuestion.value = { ...question }
  questionDialogVisible.value = true
}

const handleSaveQuestion = (questionData) => {
  if (currentQuestion.value && currentQuestion.value.id) {
    // 编辑现有题目
    const index = questionBank.value.questions.findIndex(q => q.id === currentQuestion.value.id)
    if (index > -1) {
      questionBank.value.questions[index] = { ...questionData, id: currentQuestion.value.id }
      ElMessage.success('题目更新成功')
    }
  } else {
    // 新增题目
    const newQuestion = {
      ...questionData,
      id: `q_${Date.now()}`
    }
    questionBank.value.questions.push(newQuestion)
    questionBank.value.totalQuestions++
    ElMessage.success('题目添加成功')
  }
  questionDialogVisible.value = false
}

const handleDeleteQuestion = (question) => {
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = questionBank.value.questions.findIndex(q => q.id === question.id)
    if (index > -1) {
      questionBank.value.questions.splice(index, 1)
      questionBank.value.totalQuestions--
      ElMessage.success('删除成功')
    }
  })
}

const handleImportFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (Array.isArray(data)) {
        // 导入题目数组
        data.forEach(q => {
          questionBank.value.questions.push({
            ...q,
            id: `q_${Date.now()}_${Math.random()}`
          })
        })
        questionBank.value.totalQuestions = questionBank.value.questions.length
        ElMessage.success(`成功导入 ${data.length} 道题目`)
      } else {
        ElMessage.error('JSON格式不正确，应为题目数组')
      }
    } catch (error) {
      ElMessage.error('文件解析失败，请检查JSON格式')
    }
  }
  reader.readAsText(file.raw)
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



// 处理标签变化（自动创建新标签）
const handleTagChange = (values) => {
  // 处理新创建的标签
  const processedTags = values.map(value => {
    const existingTag = availableTags.value.find(t => t.name === value)
    if (!existingTag) {
      // 新标签，自动创建
      return addOrGetTag(value)
    }
    return value
  }).filter(Boolean)
  
  selectedTags.value = processedTags
}

// 获取标签颜色
const getTagColor = (tagName) => {
  const tag = availableTags.value.find(t => t.name === tagName)
  return tag ? tag.color : '#909399'
}

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.question-bank-container {
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .bank-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.filter-area {
  margin-bottom: 20px;
}

.type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .type-tab {
    padding: 8px 16px;
    border-radius: 4px;
    background: #f5f7fa;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: #e4e7ed;
    }

    &.active {
      background: #409eff;
      color: white;

      .type-count {
        background: rgba(255, 255, 255, 0.3);
        color: white;
      }
    }

    .type-label {
      font-size: 14px;
    }

    .type-count {
      background: #e4e7ed;
      color: #606266;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
    }
  }
}

.search-filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  .tag-filter-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    .filter-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
    }

    .tag-count-hint {
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }
  }
}

.question-list {
  flex: 1;
  overflow-y: auto;
}

/* 题目标签相关样式 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-start;
  align-items: center;
  min-height: 24px;
}

.no-tags {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}
</style>
