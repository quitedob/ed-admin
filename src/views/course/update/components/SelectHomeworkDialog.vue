<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择作业"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="homework-selector">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索作业标题..."
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterClass" placeholder="班级" clearable>
              <el-option label="全部班级" value="" />
              <el-option label="前端开发一班" value="class_001" />
              <el-option label="前端开发二班" value="class_002" />
              <el-option label="数据科学班" value="class_003" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterCourse" placeholder="课程" clearable>
              <el-option label="全部课程" value="" />
              <el-option label="前端开发基础" value="course_001" />
              <el-option label="前端开发进阶" value="course_002" />
              <el-option label="数据科学基础" value="course_003" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filterType" placeholder="作业类型" clearable>
              <el-option label="全部类型" value="" />
              <el-option label="练习" value="exercise" />
              <el-option label="实践" value="practice" />
              <el-option label="考试" value="exam" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 作业列表 -->
      <div class="homework-list">
        <el-table
          :data="filteredHomeworks"
          style="width: 100%"
          max-height="400"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="作业ID" prop="id" width="100" />
          <el-table-column label="作业标题" prop="title" min-width="150" />
          <el-table-column label="描述" prop="description" min-width="200" show-overflow-tooltip />
          <el-table-column label="班级" prop="className" width="120" />
          <el-table-column label="课程" prop="courseName" width="120" />
          <el-table-column label="类型" width="80">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)" size="small">
                {{ getTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="难度" width="80">
            <template #default="scope">
              <el-tag :type="getDifficultyTagType(scope.row.difficulty)" size="small">
                {{ getDifficultyLabel(scope.row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题目数量" width="100">
            <template #default="scope">
              {{ scope.row.questions?.length || 0 }}道题
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="filteredHomeworks.length === 0" description="暂无匹配的作业" />
      </div>

      <!-- 已选择的作业 -->
      <div v-if="selectedHomeworks.length > 0" class="selected-section">
        <el-divider content-position="left">已选择的作业 ({{ selectedHomeworks.length }})</el-divider>
        <div class="selected-list">
          <el-tag
            v-for="homework in selectedHomeworks"
            :key="homework.id"
            closable
            @close="removeHomework(homework.id)"
            style="margin: 4px;"
          >
            {{ homework.title }} ({{ homework.id }})
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedHomeworks.length === 0">
          确认选择 ({{ selectedHomeworks.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 预选择的作业ID列表
  preselectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

// 响应式数据
const searchKeyword = ref('')
const filterClass = ref('')
const filterCourse = ref('')
const filterType = ref('')
const homeworks = ref([])
const selectedHomeworks = ref([])
const selection = ref([])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredHomeworks = computed(() => {
  let result = homeworks.value

  // 搜索过滤
  if (searchKeyword.value) {
    result = result.filter(hw =>
      hw.title.includes(searchKeyword.value) ||
      hw.description.includes(searchKeyword.value) ||
      hw.id.includes(searchKeyword.value)
    )
  }

  // 班级过滤
  if (filterClass.value) {
    result = result.filter(hw => hw.classId === filterClass.value)
  }

  // 课程过滤
  if (filterCourse.value) {
    result = result.filter(hw => hw.courseId === filterCourse.value)
  }

  // 类型过滤
  if (filterType.value) {
    result = result.filter(hw => hw.type === filterType.value)
  }

  return result
})

// 初始化模拟数据
const initMockData = () => {
  homeworks.value = [
    {
      id: 'hw_001',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第一章作业',
      description: '完成第一章基础知识的练习',
      type: 'exercise',
      difficulty: 'easy',
      questions: [
        { id: 'hwq_001', questionId: 'q_001', type: 'single', score: 2 },
        { id: 'hwq_002', questionId: 'q_002', type: 'multiple', score: 3 },
        { id: 'hwq_003', questionId: 'q_003', type: 'fill', score: 2 },
        { id: 'hwq_004', questionId: 'q_004', type: 'essay', score: 5 }
      ]
    },
    {
      id: 'hw_002',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第二章作业',
      description: '完成第二章进阶知识的练习',
      type: 'exercise',
      difficulty: 'medium',
      questions: []
    },
    {
      id: 'hw_003',
      classId: 'class_001',
      className: '前端开发一班',
      courseId: 'course_001',
      courseName: '前端开发基础',
      title: '第三章作业',
      description: '第三章综合练习',
      type: 'practice',
      difficulty: 'hard',
      questions: []
    },
    {
      id: 'hw_004',
      classId: 'class_002',
      className: '前端开发二班',
      courseId: 'course_001',
      courseName: '前端开发进阶',
      title: '综合练习',
      description: '综合练习题',
      type: 'exam',
      difficulty: 'medium',
      questions: []
    },
    {
      id: 'hw_005',
      classId: 'class_003',
      className: '数据科学班',
      courseId: 'course_002',
      courseName: '数据科学基础',
      title: 'Python基础练习',
      description: 'Python编程基础语法练习',
      type: 'exercise',
      difficulty: 'easy',
      questions: []
    }
  ]
}

// 方法
const handleSelectionChange = (selection) => {
  // 更新已选择的作业列表
  selectedHomeworks.value = [...selection]
}

const removeHomework = (homeworkId) => {
  selectedHomeworks.value = selectedHomeworks.value.filter(hw => hw.id !== homeworkId)
  // 同时更新表格选择状态
  selection.value = selection.value.filter(hw => hw.id !== homeworkId)
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  emit('confirm', selectedHomeworks.value)
  dialogVisible.value = false
}

// 工具方法
const getTypeLabel = (type) => {
  const map = {
    exercise: '练习',
    practice: '实践',
    exam: '考试'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    exercise: 'success',
    practice: 'warning',
    exam: 'danger'
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

// 监听对话框打开，初始化预选择
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 重置筛选条件
    searchKeyword.value = ''
    filterClass.value = ''
    filterCourse.value = ''
    filterType.value = ''

    // 初始化数据
    initMockData()

    // 设置预选择的作业
    if (props.preselectedIds.length > 0) {
      selectedHomeworks.value = homeworks.value.filter(hw =>
        props.preselectedIds.includes(hw.id)
      )
    } else {
      selectedHomeworks.value = []
    }
  }
})

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.homework-selector {
  .filter-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .homework-list {
    margin-bottom: 20px;
  }

  .selected-section {
    .selected-list {
      max-height: 120px;
      overflow-y: auto;
      padding: 8px;
      background: #f0f2f5;
      border-radius: 4px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>