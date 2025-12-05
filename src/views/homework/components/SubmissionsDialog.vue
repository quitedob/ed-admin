<template>
  <el-dialog
    v-model="visible"
    :title="`${homework?.title} - 答题情况`"
    width="90%"
    @close="handleClose"
  >
    <div v-if="homework" class="submissions-container">
      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-statistic title="总学生数" :value="stats.totalStudents" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已提交" :value="stats.submitted" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="提交率" :value="stats.submitRate" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均完成度" :value="stats.avgCompletion" suffix="%" />
        </el-col>
      </el-row>

      <!-- 视图切换 -->
      <el-tabs v-model="activeView" style="margin-top: 20px">
        <!-- 按学生视图 -->
        <el-tab-pane label="按学生视图" name="student">
          <div class="view-content">
            <div class="view-header">
              <el-input
                v-model="searchText"
                placeholder="搜索学生..."
                clearable
                style="width: 300px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="sortBy"
                placeholder="排序方式"
                style="width: 150px; margin-left: 12px"
              >
                <el-option label="按完成度" value="completion" />
                <el-option label="按提交时间" value="submitTime" />
                <el-option label="按姓名" value="name" />
              </el-select>
            </div>

            <div class="students-list">
              <div
                v-for="student in filteredStudents"
                :key="student.id"
                class="student-item"
                @click="selectStudent(student)"
                :class="{ active: selectedStudent?.id === student.id }"
              >
                <div class="student-info">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-id">{{ student.studentId }}</span>
                </div>
                <div class="student-stats">
                  <el-progress
                    :percentage="student.completionRate"
                    :show-text="false"
                    style="width: 100px"
                  />
                  <span class="completion-text">{{ student.completionRate }}%</span>
                </div>
              </div>
            </div>

            <!-- 学生详情 -->
            <div v-if="selectedStudent" class="student-detail">
              <h4>{{ selectedStudent.name }} 的答题详情</h4>
              <el-table :data="selectedStudent.answers" stripe style="width: 100%">
                <el-table-column prop="questionTitle" label="题目" min-width="200" />
                <el-table-column prop="studentAnswer" label="学生答案" width="150" />
                <el-table-column prop="correctAnswer" label="正确答案" width="150" />
                <el-table-column label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.isCorrect ? 'success' : 'danger'">
                      {{ row.isCorrect ? '正确' : '错误' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 按题目视图 -->
        <el-tab-pane label="按题目视图" name="question">
          <div class="view-content">
            <el-table :data="questionStats" stripe style="width: 100%">
              <el-table-column prop="questionTitle" label="题目" min-width="200" />
              <el-table-column prop="correctCount" label="答对人数" width="100" align="center" />
              <el-table-column prop="totalCount" label="总人数" width="100" align="center" />
              <el-table-column label="答对率" width="150">
                <template #default="{ row }">
                  <el-progress
                    :percentage="(row.correctCount / row.totalCount) * 100"
                    :show-text="false"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="viewQuestionDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="exportData">导出数据</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  homework: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeView = ref('student')
const searchText = ref('')
const sortBy = ref('completion')
const selectedStudent = ref(null)

// 模拟数据
const students = ref([
  {
    id: 'stu_001',
    name: '张三',
    studentId: '2024001',
    completionRate: 100,
    submitTime: '2024-12-15 10:30',
    answers: [
      { questionTitle: '题目1', studentAnswer: 'A', correctAnswer: 'A', isCorrect: true },
      { questionTitle: '题目2', studentAnswer: 'B', correctAnswer: 'C', isCorrect: false }
    ]
  },
  {
    id: 'stu_002',
    name: '李四',
    studentId: '2024002',
    completionRate: 80,
    submitTime: '2024-12-15 14:20',
    answers: [
      { questionTitle: '题目1', studentAnswer: 'A', correctAnswer: 'A', isCorrect: true },
      { questionTitle: '题目2', studentAnswer: 'C', correctAnswer: 'C', isCorrect: true }
    ]
  },
  {
    id: 'stu_003',
    name: '王五',
    studentId: '2024003',
    completionRate: 50,
    submitTime: '2024-12-16 09:15',
    answers: [
      { questionTitle: '题目1', studentAnswer: 'B', correctAnswer: 'A', isCorrect: false },
      { questionTitle: '题目2', studentAnswer: 'B', correctAnswer: 'C', isCorrect: false }
    ]
  }
])

const stats = computed(() => {
  const total = students.value.length
  const submitted = students.value.filter(s => s.completionRate > 0).length
  const avgCompletion = Math.round(
    students.value.reduce((sum, s) => sum + s.completionRate, 0) / total
  )

  return {
    totalStudents: total,
    submitted: submitted,
    submitRate: Math.round((submitted / total) * 100),
    avgCompletion: avgCompletion
  }
})

const filteredStudents = computed(() => {
  let result = students.value

  if (searchText.value) {
    result = result.filter(s =>
      s.name.includes(searchText.value) ||
      s.studentId.includes(searchText.value)
    )
  }

  // 排序
  if (sortBy.value === 'completion') {
    result.sort((a, b) => b.completionRate - a.completionRate)
  } else if (sortBy.value === 'submitTime') {
    result.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime))
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  }

  return result
})

const questionStats = computed(() => {
  // 统计每道题的答对情况
  return [
    {
      questionTitle: '题目1',
      correctCount: 2,
      totalCount: 3
    },
    {
      questionTitle: '题目2',
      correctCount: 1,
      totalCount: 3
    }
  ]
})

const selectStudent = (student) => {
  selectedStudent.value = student
}

const viewQuestionDetail = (question) => {
  ElMessage.info(`查看题目详情: ${question.questionTitle}`)
}

const exportData = () => {
  ElMessage.success('已导出为Excel文件')
}

const handleClose = () => {
  visible.value = false
  selectedStudent.value = null
  searchText.value = ''
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    selectedStudent.value = null
  }
})
</script>

<style scoped>
.submissions-container {
  padding: 20px 0;
}

.stats-row {
  margin-bottom: 20px;
}

.view-content {
  padding: 20px 0;
}

.view-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.students-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.student-item {
  padding: 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-item:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary);
}

.student-item.active {
  background: var(--color-primary-50);
  border-color: var(--color-primary);
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.student-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.student-id {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.student-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.completion-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  min-width: 40px;
}

.student-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}

.student-detail h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
}
</style>
