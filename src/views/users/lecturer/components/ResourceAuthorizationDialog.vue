<template>
  <el-drawer
    v-model="visible"
    title="资源授权"
    size="80%"
    direction="rtl"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" type="border-card" style="height: calc(100vh - 120px)">
      <!-- 课程授权 -->
      <el-tab-pane label="课程授权" name="courses">
        <div class="authorize-container">
          <el-row :gutter="20" style="height: 100%; min-height: 500px;">
            <el-col :span="10" class="left-panel">
              <div class="panel-header">
                <h4>可选课程</h4>
                <el-input
                  v-model="courseSearch"
                  placeholder="搜索课程..."
                  clearable
                  size="small"
                  style="width: 100%; margin-top: 8px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="resource-list">
                <div
                  v-for="course in filteredAvailableCourses"
                  :key="course.id"
                  :class="['resource-item', { selected: isSelected(course, 'course') }]"
                  @click="toggleSelection(course, 'course')"
                >
                  <el-checkbox :model-value="isSelected(course, 'course')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ course.name }}</span>
                    <span class="resource-meta">{{ course.category }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="filteredAvailableCourses.length === 0" description="暂无可选课程" />
            </el-col>

            <el-col :span="4" class="middle-panel">
              <div class="button-group">
                <el-button type="primary" @click="addResources('course')" :disabled="tempSelectedCourses.length === 0">
                  添加 →
                </el-button>
                <el-button @click="removeResources('course')" :disabled="tempAuthorizedCourses.length === 0">
                  ← 移除
                </el-button>
              </div>
            </el-col>

            <el-col :span="10" class="right-panel">
              <div class="panel-header">
                <h4>已授权课程（{{ tempAuthorizedCourses.length }}个）</h4>
              </div>
              <div class="resource-list">
                <div
                  v-for="course in tempAuthorizedCourses"
                  :key="course.id"
                  :class="['resource-item', { selected: isAuthorizedSelected(course, 'course') }]"
                  @click="toggleAuthorizedSelection(course, 'course')"
                >
                  <el-checkbox :model-value="isAuthorizedSelected(course, 'course')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ course.name }}</span>
                    <span class="resource-meta">{{ course.category }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="tempAuthorizedCourses.length === 0" description="暂无已授权课程" />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 作业授权 -->
      <el-tab-pane label="作业授权" name="assignments">
        <div class="authorize-container">
          <el-row :gutter="20" style="height: 100%; min-height: 500px;">
            <el-col :span="10" class="left-panel">
              <div class="panel-header">
                <h4>可选作业</h4>
                <el-input
                  v-model="assignmentSearch"
                  placeholder="搜索作业..."
                  clearable
                  size="small"
                  style="width: 100%; margin-top: 8px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="resource-list">
                <div
                  v-for="assignment in filteredAvailableAssignments"
                  :key="assignment.id"
                  :class="['resource-item', { selected: isSelected(assignment, 'assignment') }]"
                  @click="toggleSelection(assignment, 'assignment')"
                >
                  <el-checkbox :model-value="isSelected(assignment, 'assignment')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ assignment.title }}</span>
                    <span class="resource-meta">{{ assignment.courseName }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="filteredAvailableAssignments.length === 0" description="暂无可选作业" />
            </el-col>

            <el-col :span="4" class="middle-panel">
              <div class="button-group">
                <el-button type="primary" @click="addResources('assignment')" :disabled="tempSelectedAssignments.length === 0">
                  添加 →
                </el-button>
                <el-button @click="removeResources('assignment')" :disabled="tempAuthorizedAssignments.length === 0">
                  ← 移除
                </el-button>
              </div>
            </el-col>

            <el-col :span="10" class="right-panel">
              <div class="panel-header">
                <h4>已授权作业（{{ tempAuthorizedAssignments.length }}个）</h4>
              </div>
              <div class="resource-list">
                <div
                  v-for="assignment in tempAuthorizedAssignments"
                  :key="assignment.id"
                  :class="['resource-item', { selected: isAuthorizedSelected(assignment, 'assignment') }]"
                  @click="toggleAuthorizedSelection(assignment, 'assignment')"
                >
                  <el-checkbox :model-value="isAuthorizedSelected(assignment, 'assignment')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ assignment.title }}</span>
                    <span class="resource-meta">{{ assignment.courseName }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="tempAuthorizedAssignments.length === 0" description="暂无已授权作业" />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 管理老师 -->
      <el-tab-pane v-if="props.targetType === 'class'" label="管理老师" name="teachers">
        <TeacherManagementPanel :class-data="{ id: props.targetId }" />
      </el-tab-pane>

      <!-- 管理学生 -->
      <el-tab-pane v-if="props.targetType === 'class'" label="管理学生" name="students">
        <StudentManagementPanel :class-data="{ id: props.targetId }" />
      </el-tab-pane>

      <!-- 考试授权 -->
      <el-tab-pane label="考试授权" name="exams">
        <div class="authorize-container">
          <el-row :gutter="20" style="height: 100%; min-height: 500px;">
            <el-col :span="10" class="left-panel">
              <div class="panel-header">
                <h4>可选考试</h4>
                <el-input
                  v-model="examSearch"
                  placeholder="搜索考试..."
                  clearable
                  size="small"
                  style="width: 100%; margin-top: 8px;"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="resource-list">
                <div
                  v-for="exam in filteredAvailableExams"
                  :key="exam.id"
                  :class="['resource-item', { selected: isSelected(exam, 'exam') }]"
                  @click="toggleSelection(exam, 'exam')"
                >
                  <el-checkbox :model-value="isSelected(exam, 'exam')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ exam.title }}</span>
                    <span class="resource-meta">{{ exam.courseName }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="filteredAvailableExams.length === 0" description="暂无可选考试" />
            </el-col>

            <el-col :span="4" class="middle-panel">
              <div class="button-group">
                <el-button type="primary" @click="addResources('exam')" :disabled="tempSelectedExams.length === 0">
                  添加 →
                </el-button>
                <el-button @click="removeResources('exam')" :disabled="tempAuthorizedExams.length === 0">
                  ← 移除
                </el-button>
              </div>
            </el-col>

            <el-col :span="10" class="right-panel">
              <div class="panel-header">
                <h4>已授权考试（{{ tempAuthorizedExams.length }}个）</h4>
              </div>
              <div class="resource-list">
                <div
                  v-for="exam in tempAuthorizedExams"
                  :key="exam.id"
                  :class="['resource-item', { selected: isAuthorizedSelected(exam, 'exam') }]"
                  @click="toggleAuthorizedSelection(exam, 'exam')"
                >
                  <el-checkbox :model-value="isAuthorizedSelected(exam, 'exam')" />
                  <div class="resource-info">
                    <span class="resource-name">{{ exam.title }}</span>
                    <span class="resource-meta">{{ exam.courseName }}</span>
                  </div>
                </div>
              </div>
              <el-empty v-if="tempAuthorizedExams.length === 0" description="暂无已授权考试" />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px; border-top: 1px solid #e4e7ed;">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存全部</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import TeacherManagementPanel from '@/views/class/management/components/TeacherManagementPanel.vue'
import StudentManagementPanel from '@/views/class/management/components/StudentManagementPanel.vue'

const props = defineProps({
  modelValue: Boolean,
  targetId: String,
  targetType: {
    type: String,
    default: 'teacher' // 'teacher' or 'class'
  },
  authorizedResources: {
    type: Object,
    default: () => ({
      courses: [],
      assignments: [],
      exams: []
    })
  }
})

const emit = defineEmits(['update:modelValue', 'update:authorized-resources'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const activeTab = ref('courses')
const courseSearch = ref('')
const assignmentSearch = ref('')
const examSearch = ref('')

// 临时选择
const tempSelectedCourses = ref([])
const tempSelectedAssignments = ref([])
const tempSelectedExams = ref([])

// 临时已授权
const tempAuthorizedCourses = ref([])
const tempAuthorizedAssignments = ref([])
const tempAuthorizedExams = ref([])

// 模拟数据
const allCourses = ref([
  { id: 'course_001', name: 'Python编程基础', category: '编程语言' },
  { id: 'course_002', name: 'JavaScript高级开发', category: '前端开发' },
  { id: 'course_003', name: '数据结构与算法', category: '计算机基础' },
  { id: 'course_004', name: 'Web全栈开发', category: '全栈开发' },
  { id: 'course_005', name: '机器学习入门', category: '人工智能' }
])

const allAssignments = ref([
  { id: 'hw_001', title: 'Python基础练习1', courseName: 'Python编程基础' },
  { id: 'hw_002', title: 'JS异步编程作业', courseName: 'JavaScript高级开发' },
  { id: 'hw_003', title: '链表实现', courseName: '数据结构与算法' },
  { id: 'hw_004', title: 'React组件开发', courseName: 'Web全栈开发' },
  { id: 'hw_005', title: '线性回归实践', courseName: '机器学习入门' }
])

const allExams = ref([
  { id: 'exam_001', title: 'Python期中考试', courseName: 'Python编程基础' },
  { id: 'exam_002', title: 'JavaScript期末考试', courseName: 'JavaScript高级开发' },
  { id: 'exam_003', title: '算法综合测试', courseName: '数据结构与算法' },
  { id: 'exam_004', title: '全栈项目答辩', courseName: 'Web全栈开发' },
  { id: 'exam_005', title: 'ML模型评估', courseName: '机器学习入门' }
])

// 计算属性 - 可选资源
const availableCourses = computed(() => {
  const authorizedIds = new Set(tempAuthorizedCourses.value.map(c => c.id))
  return allCourses.value.filter(c => !authorizedIds.has(c.id))
})

const availableAssignments = computed(() => {
  const authorizedIds = new Set(tempAuthorizedAssignments.value.map(a => a.id))
  return allAssignments.value.filter(a => !authorizedIds.has(a.id))
})

const availableExams = computed(() => {
  const authorizedIds = new Set(tempAuthorizedExams.value.map(e => e.id))
  return allExams.value.filter(e => !authorizedIds.has(e.id))
})

// 计算属性 - 过滤后的可选资源
const filteredAvailableCourses = computed(() => {
  if (!courseSearch.value) return availableCourses.value
  return availableCourses.value.filter(c =>
    c.name.includes(courseSearch.value) || c.category.includes(courseSearch.value)
  )
})

const filteredAvailableAssignments = computed(() => {
  if (!assignmentSearch.value) return availableAssignments.value
  return availableAssignments.value.filter(a =>
    a.title.includes(assignmentSearch.value) || a.courseName.includes(assignmentSearch.value)
  )
})

const filteredAvailableExams = computed(() => {
  if (!examSearch.value) return availableExams.value
  return availableExams.value.filter(e =>
    e.title.includes(examSearch.value) || e.courseName.includes(examSearch.value)
  )
})

// 监听授权资源变化
watch(
  () => props.authorizedResources,
  (newVal) => {
    tempAuthorizedCourses.value = [...(newVal.courses || [])]
    tempAuthorizedAssignments.value = [...(newVal.assignments || [])]
    tempAuthorizedExams.value = [...(newVal.exams || [])]
  },
  { immediate: true, deep: true }
)

// 方法
const isSelected = (resource, type) => {
  const map = {
    course: tempSelectedCourses,
    assignment: tempSelectedAssignments,
    exam: tempSelectedExams
  }
  return map[type].value.some(r => r.id === resource.id)
}

const isAuthorizedSelected = (resource, type) => {
  const map = {
    course: tempAuthorizedCourses,
    assignment: tempAuthorizedAssignments,
    exam: tempAuthorizedExams
  }
  return map[type].value.some(r => r.id === resource.id)
}

const toggleSelection = (resource, type) => {
  const map = {
    course: tempSelectedCourses,
    assignment: tempSelectedAssignments,
    exam: tempSelectedExams
  }
  const list = map[type]
  const index = list.value.findIndex(r => r.id === resource.id)
  if (index > -1) {
    list.value.splice(index, 1)
  } else {
    list.value.push(resource)
  }
}

const toggleAuthorizedSelection = (resource, type) => {
  const map = {
    course: tempAuthorizedCourses,
    assignment: tempAuthorizedAssignments,
    exam: tempAuthorizedExams
  }
  const list = map[type]
  const index = list.value.findIndex(r => r.id === resource.id)
  if (index > -1) {
    list.value.splice(index, 1)
  } else {
    list.value.push(resource)
  }
}

const addResources = (type) => {
  const selectedMap = {
    course: tempSelectedCourses,
    assignment: tempSelectedAssignments,
    exam: tempSelectedExams
  }
  const authorizedMap = {
    course: tempAuthorizedCourses,
    assignment: tempAuthorizedAssignments,
    exam: tempAuthorizedExams
  }
  authorizedMap[type].value.push(...selectedMap[type].value)
  selectedMap[type].value = []
}

const removeResources = (type) => {
  const authorizedMap = {
    course: tempAuthorizedCourses,
    assignment: tempAuthorizedAssignments,
    exam: tempAuthorizedExams
  }
  const list = authorizedMap[type]
  const selectedIds = new Set(list.value.map(r => r.id))
  list.value = list.value.filter(r => !selectedIds.has(r.id))
}

const handleClose = () => {
  visible.value = false
  tempSelectedCourses.value = []
  tempSelectedAssignments.value = []
  tempSelectedExams.value = []
}

const handleSave = () => {
  const resources = {
    courses: tempAuthorizedCourses.value,
    assignments: tempAuthorizedAssignments.value,
    exams: tempAuthorizedExams.value
  }
  emit('update:authorized-resources', resources)
  ElMessage.success('资源授权已保存')
  handleClose()
}
</script>

<style lang="scss" scoped>
:deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.authorize-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.middle-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-button {
    width: 100%;
  }
}

.panel-header {
  margin-bottom: 12px;

  h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.resource-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
  max-height: calc(100vh - 300px);
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f2f5;
    border-color: #409eff;
  }

  &.selected {
    background: #e6f7ff;
    border-color: #409eff;
  }

  .resource-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .resource-name {
      color: #303133;
      font-size: 14px;
      font-weight: 500;
    }

    .resource-meta {
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
