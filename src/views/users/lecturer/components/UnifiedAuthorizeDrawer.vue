<template>
  <el-drawer
    v-model="visible"
    title="授权管理"
    size="85%"
    direction="rtl"
    @close="handleClose"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="authorize-management">
      <!-- 教师信息展示 -->
      <div class="teacher-info" v-if="teacherData">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="教师姓名">{{ teacherData.name }}</el-descriptions-item>
          <el-descriptions-item label="工号">{{ teacherData.teacherId }}</el-descriptions-item>
          <el-descriptions-item label="授课科目">{{ teacherData.subjects?.join('、') || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前负责班级">{{ confirmedClasses.length }} 个</el-descriptions-item>
          <el-descriptions-item label="已授权课程">{{ confirmedResources.courses?.length || 0 }} 门</el-descriptions-item>
          <el-descriptions-item label="已授权作业">{{ confirmedResources.assignments?.length || 0 }} 个</el-descriptions-item>
          <el-descriptions-item label="已授权考试">{{ confirmedResources.exams?.length || 0 }} 个</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- 授权内容标签页 -->
      <el-tabs v-model="activeTab" type="card">
        <!-- 班级授权 -->
        <el-tab-pane label="班级管理" name="classes">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>可选班级</h4>
                    <el-input
                      v-model="classSearch"
                      placeholder="搜索班级名称..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="cls in filteredAvailableClasses"
                      :key="cls.id"
                      :class="['item', { selected: isClassTempSelected(cls) }]"
                      @click="toggleTempClass(cls)"
                    >
                      <el-checkbox :model-value="isClassTempSelected(cls)" />
                      <span class="item-name">{{ cls.name }}</span>
                      <span class="item-info">{{ cls.studentCount || 0 }}名学生</span>
                    </div>
                  </div>
                  <el-empty v-if="filteredAvailableClasses.length === 0" description="暂无可选班级" />
                </div>
              </el-col>

              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>已确认班级 ({{ confirmedClasses.length }})</h4>
                    <el-input
                      v-model="confirmedClassSearch"
                      placeholder="搜索已确认班级..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="cls in filteredConfirmedClasses"
                      :key="cls.id"
                      class="item confirmed"
                    >
                      <el-icon class="confirmed-icon"><CircleCheck /></el-icon>
                      <span class="item-name">{{ cls.name }}</span>
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="removeConfirmedClass(cls)"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>
                  <el-empty v-if="filteredConfirmedClasses.length === 0" description="暂无已确认班级" />
                </div>
              </el-col>
            </el-row>
            
            <!-- 班级管理单独确认按钮 -->
            <div class="tab-footer">
              <div class="selection-info">
                <span v-if="tempSelectedClasses.length > 0">
                  已选择 <strong>{{ tempSelectedClasses.length }}</strong> 个班级待确认
                </span>
              </div>
              <el-button 
                type="primary" 
                :disabled="tempSelectedClasses.length === 0"
                @click="confirmClasses"
              >
                <el-icon><Check /></el-icon>
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 课程授权 -->
        <el-tab-pane label="课程管理" name="courses">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>可选课程</h4>
                    <el-input
                      v-model="courseSearch"
                      placeholder="搜索课程名称..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="course in filteredAvailableCourses"
                      :key="course.id"
                      :class="['item', { selected: isResourceTempSelected(course, 'courses') }]"
                      @click="toggleTempResource(course, 'courses')"
                    >
                      <el-checkbox :model-value="isResourceTempSelected(course, 'courses')" />
                      <div class="item-content">
                        <span class="item-name">{{ course.name }}</span>
                        <span class="item-meta">{{ course.category }} • {{ course.duration }}</span>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAvailableCourses.length === 0" description="暂无可选课程" />
                </div>
              </el-col>

              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>已确认课程 ({{ confirmedResources.courses?.length || 0 }})</h4>
                    <el-input
                      v-model="confirmedCourseSearch"
                      placeholder="搜索已确认课程..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="course in filteredConfirmedCourses"
                      :key="course.id"
                      class="item confirmed"
                    >
                      <el-icon class="confirmed-icon"><CircleCheck /></el-icon>
                      <div class="item-content">
                        <span class="item-name">{{ course.name }}</span>
                      </div>
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="removeConfirmedResource(course, 'courses')"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>
                  <el-empty v-if="filteredConfirmedCourses.length === 0" description="暂无已确认课程" />
                </div>
              </el-col>
            </el-row>
            
            <!-- 课程管理单独确认按钮 -->
            <div class="tab-footer">
              <div class="selection-info">
                <span v-if="tempSelectedResources.courses.length > 0">
                  已选择 <strong>{{ tempSelectedResources.courses.length }}</strong> 门课程待确认
                </span>
              </div>
              <el-button 
                type="primary" 
                :disabled="tempSelectedResources.courses.length === 0"
                @click="confirmResources('courses')"
              >
                <el-icon><Check /></el-icon>
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 作业授权 -->
        <el-tab-pane label="作业管理" name="assignments">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>可选作业</h4>
                    <el-input
                      v-model="assignmentSearch"
                      placeholder="搜索作业名称..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="assignment in filteredAvailableAssignments"
                      :key="assignment.id"
                      :class="['item', { selected: isResourceTempSelected(assignment, 'assignments') }]"
                      @click="toggleTempResource(assignment, 'assignments')"
                    >
                      <el-checkbox :model-value="isResourceTempSelected(assignment, 'assignments')" />
                      <div class="item-content">
                        <span class="item-name">{{ assignment.name }}</span>
                        <span class="item-meta">{{ assignment.course }} • {{ assignment.questionCount }}题</span>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAvailableAssignments.length === 0" description="暂无可选作业" />
                </div>
              </el-col>

              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>已确认作业 ({{ confirmedResources.assignments?.length || 0 }})</h4>
                    <el-input
                      v-model="confirmedAssignmentSearch"
                      placeholder="搜索已确认作业..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="assignment in filteredConfirmedAssignments"
                      :key="assignment.id"
                      class="item confirmed"
                    >
                      <el-icon class="confirmed-icon"><CircleCheck /></el-icon>
                      <div class="item-content">
                        <span class="item-name">{{ assignment.name }}</span>
                      </div>
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="removeConfirmedResource(assignment, 'assignments')"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>
                  <el-empty v-if="filteredConfirmedAssignments.length === 0" description="暂无已确认作业" />
                </div>
              </el-col>
            </el-row>
            
            <!-- 作业管理单独确认按钮 -->
            <div class="tab-footer">
              <div class="selection-info">
                <span v-if="tempSelectedResources.assignments.length > 0">
                  已选择 <strong>{{ tempSelectedResources.assignments.length }}</strong> 个作业待确认
                </span>
              </div>
              <el-button 
                type="primary" 
                :disabled="tempSelectedResources.assignments.length === 0"
                @click="confirmResources('assignments')"
              >
                <el-icon><Check /></el-icon>
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 考试授权 -->
        <el-tab-pane label="考试管理" name="exams">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>可选考试</h4>
                    <el-input
                      v-model="examSearch"
                      placeholder="搜索考试名称..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="exam in filteredAvailableExams"
                      :key="exam.id"
                      :class="['item', { selected: isResourceTempSelected(exam, 'exams') }]"
                      @click="toggleTempResource(exam, 'exams')"
                    >
                      <el-checkbox :model-value="isResourceTempSelected(exam, 'exams')" />
                      <div class="item-content">
                        <span class="item-name">{{ exam.name }}</span>
                        <span class="item-meta">{{ exam.course }} • {{ exam.duration }}分钟</span>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAvailableExams.length === 0" description="暂无可选考试" />
                </div>
              </el-col>

              <el-col :span="10">
                <div class="panel">
                  <div class="panel-header">
                    <h4>已确认考试 ({{ confirmedResources.exams?.length || 0 }})</h4>
                    <el-input
                      v-model="confirmedExamSearch"
                      placeholder="搜索已确认考试..."
                      clearable
                      size="small"
                      style="width: 100%; margin-top: 8px;"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <div class="item-list">
                    <div
                      v-for="exam in filteredConfirmedExams"
                      :key="exam.id"
                      class="item confirmed"
                    >
                      <el-icon class="confirmed-icon"><CircleCheck /></el-icon>
                      <div class="item-content">
                        <span class="item-name">{{ exam.name }}</span>
                      </div>
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="removeConfirmedResource(exam, 'exams')"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>
                  <el-empty v-if="filteredConfirmedExams.length === 0" description="暂无已确认考试" />
                </div>
              </el-col>
            </el-row>
            
            <!-- 考试管理单独确认按钮 -->
            <div class="tab-footer">
              <div class="selection-info">
                <span v-if="tempSelectedResources.exams.length > 0">
                  已选择 <strong>{{ tempSelectedResources.exams.length }}</strong> 个考试待确认
                </span>
              </div>
              <el-button 
                type="primary" 
                :disabled="tempSelectedResources.exams.length === 0"
                @click="confirmResources('exams')"
              >
                <el-icon><Check /></el-icon>
                确认选择
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存全部授权
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Check, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  teacherData: {
    type: Object,
    default: null
  },
  initialAuthorizedClasses: {
    type: Array,
    default: () => []
  },
  initialAuthorizedResources: {
    type: Object,
    default: () => ({
      courses: [],
      assignments: [],
      exams: []
    })
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const saving = ref(false)
const activeTab = ref('classes')

// 搜索关键词
const classSearch = ref('')
const courseSearch = ref('')
const assignmentSearch = ref('')
const examSearch = ref('')
const confirmedClassSearch = ref('')
const confirmedCourseSearch = ref('')
const confirmedAssignmentSearch = ref('')
const confirmedExamSearch = ref('')

// 临时选中的项目（待确认）
const tempSelectedClasses = ref([])
const tempSelectedResources = ref({
  courses: [],
  assignments: [],
  exams: []
})

// 已确认的数据
const confirmedClasses = ref([])
const confirmedResources = ref({
  courses: [],
  assignments: [],
  exams: []
})

// 可选的模拟数据
const availableClasses = ref([])
const availableCourses = ref([])
const availableAssignments = ref([])
const availableExams = ref([])

// 计算属性 - 过滤可选列表（排除已确认的）
const filteredAvailableClasses = computed(() => {
  let result = availableClasses.value.filter(cls => 
    !confirmedClasses.value.some(c => c.id === cls.id)
  )
  if (classSearch.value) {
    result = result.filter(cls => cls.name.includes(classSearch.value))
  }
  return result
})

const filteredAvailableCourses = computed(() => {
  let result = availableCourses.value.filter(course => 
    !confirmedResources.value.courses.some(c => c.id === course.id)
  )
  if (courseSearch.value) {
    result = result.filter(course =>
      course.name.includes(courseSearch.value) || course.category.includes(courseSearch.value)
    )
  }
  return result
})

const filteredAvailableAssignments = computed(() => {
  let result = availableAssignments.value.filter(assignment => 
    !confirmedResources.value.assignments.some(a => a.id === assignment.id)
  )
  if (assignmentSearch.value) {
    result = result.filter(assignment =>
      assignment.name.includes(assignmentSearch.value) || assignment.course.includes(assignmentSearch.value)
    )
  }
  return result
})

const filteredAvailableExams = computed(() => {
  let result = availableExams.value.filter(exam => 
    !confirmedResources.value.exams.some(e => e.id === exam.id)
  )
  if (examSearch.value) {
    result = result.filter(exam =>
      exam.name.includes(examSearch.value) || exam.course.includes(examSearch.value)
    )
  }
  return result
})

// 计算属性 - 过滤已确认列表
const filteredConfirmedClasses = computed(() => {
  if (!confirmedClassSearch.value) return confirmedClasses.value
  return confirmedClasses.value.filter(cls =>
    cls.name.includes(confirmedClassSearch.value)
  )
})

const filteredConfirmedCourses = computed(() => {
  if (!confirmedCourseSearch.value) return confirmedResources.value.courses
  return confirmedResources.value.courses.filter(course =>
    course.name.includes(confirmedCourseSearch.value)
  )
})

const filteredConfirmedAssignments = computed(() => {
  if (!confirmedAssignmentSearch.value) return confirmedResources.value.assignments
  return confirmedResources.value.assignments.filter(assignment =>
    assignment.name.includes(confirmedAssignmentSearch.value)
  )
})

const filteredConfirmedExams = computed(() => {
  if (!confirmedExamSearch.value) return confirmedResources.value.exams
  return confirmedResources.value.exams.filter(exam =>
    exam.name.includes(confirmedExamSearch.value)
  )
})

// 方法 - 临时选择
const isClassTempSelected = (cls) => {
  return tempSelectedClasses.value.some(c => c.id === cls.id)
}

const isResourceTempSelected = (resource, type) => {
  return tempSelectedResources.value[type].some(r => r.id === resource.id)
}

const toggleTempClass = (cls) => {
  const index = tempSelectedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    tempSelectedClasses.value.splice(index, 1)
  } else {
    tempSelectedClasses.value.push(cls)
  }
}

const toggleTempResource = (resource, type) => {
  const index = tempSelectedResources.value[type].findIndex(r => r.id === resource.id)
  if (index > -1) {
    tempSelectedResources.value[type].splice(index, 1)
  } else {
    tempSelectedResources.value[type].push(resource)
  }
}

// 方法 - 确认选择（单独确认按钮）
const confirmClasses = () => {
  tempSelectedClasses.value.forEach(cls => {
    if (!confirmedClasses.value.some(c => c.id === cls.id)) {
      confirmedClasses.value.push(cls)
    }
  })
  ElMessage.success(`已确认 ${tempSelectedClasses.value.length} 个班级`)
  tempSelectedClasses.value = []
}

const confirmResources = (type) => {
  const typeLabels = {
    courses: '课程',
    assignments: '作业',
    exams: '考试'
  }
  tempSelectedResources.value[type].forEach(resource => {
    if (!confirmedResources.value[type].some(r => r.id === resource.id)) {
      confirmedResources.value[type].push(resource)
    }
  })
  ElMessage.success(`已确认 ${tempSelectedResources.value[type].length} 个${typeLabels[type]}`)
  tempSelectedResources.value[type] = []
}

// 方法 - 移除已确认项
const removeConfirmedClass = (cls) => {
  const index = confirmedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    confirmedClasses.value.splice(index, 1)
    ElMessage.info('已移除班级')
  }
}

const removeConfirmedResource = (resource, type) => {
  const index = confirmedResources.value[type].findIndex(r => r.id === resource.id)
  if (index > -1) {
    confirmedResources.value[type].splice(index, 1)
    ElMessage.info('已移除')
  }
}

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSave = () => {
  saving.value = true

  setTimeout(() => {
    saving.value = false
    emit('save', {
      authorizedClasses: [...confirmedClasses.value],
      authorizedResources: {
        courses: [...confirmedResources.value.courses],
        assignments: [...confirmedResources.value.assignments],
        exams: [...confirmedResources.value.exams]
      }
    })
    ElMessage.success('授权保存成功')
    handleClose()
  }, 500)
}

// 初始化模拟数据
const initMockData = () => {
  availableClasses.value = [
    { id: 'cls_001', name: '一年级一班', studentCount: 30, grade: '一年级' },
    { id: 'cls_002', name: '一年级二班', studentCount: 32, grade: '一年级' },
    { id: 'cls_003', name: '二年级一班', studentCount: 28, grade: '二年级' },
    { id: 'cls_004', name: '二年级二班', studentCount: 31, grade: '二年级' },
    { id: 'cls_005', name: '三年级一班', studentCount: 29, grade: '三年级' },
    { id: 'cls_006', name: '三年级二班', studentCount: 30, grade: '三年级' }
  ]

  availableCourses.value = [
    { id: 'course_001', name: 'Python编程基础', category: '编程语言', duration: '40课时' },
    { id: 'course_002', name: 'Web前端开发', category: '前端开发', duration: '60课时' },
    { id: 'course_003', name: '数据结构', category: '计算机科学', duration: '50课时' },
    { id: 'course_004', name: '算法设计', category: '计算机科学', duration: '45课时' }
  ]

  availableAssignments.value = [
    { id: 'assignment_001', name: 'Python基础练习', course: 'Python编程基础', questionCount: 10 },
    { id: 'assignment_002', name: 'HTML/CSS实战', course: 'Web前端开发', questionCount: 15 },
    { id: 'assignment_003', name: '链表操作', course: '数据结构', questionCount: 8 },
    { id: 'assignment_004', name: '排序算法', course: '算法设计', questionCount: 12 }
  ]

  availableExams.value = [
    { id: 'exam_001', name: 'Python期末考试', course: 'Python编程基础', duration: 120 },
    { id: 'exam_002', name: '前端开发期中考试', course: 'Web前端开发', duration: 90 },
    { id: 'exam_003', name: '数据结构期中考试', course: '数据结构', duration: 100 },
    { id: 'exam_004', name: '算法设计期末考试', course: '算法设计', duration: 120 }
  ]
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.teacherData) {
    // 初始化已确认数据
    confirmedClasses.value = [...props.initialAuthorizedClasses]
    confirmedResources.value = {
      courses: [...props.initialAuthorizedResources.courses],
      assignments: [...props.initialAuthorizedResources.assignments],
      exams: [...props.initialAuthorizedResources.exams]
    }

    // 清空临时选择
    tempSelectedClasses.value = []
    tempSelectedResources.value = {
      courses: [],
      assignments: [],
      exams: []
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

onMounted(() => {
  initMockData()
})
</script>

<style lang="scss" scoped>
.authorize-management {
  padding: 0 20px;
  
  .teacher-info {
    margin-bottom: 20px;
  }

  .tab-content {
    min-height: 450px;
    display: flex;
    flex-direction: column;

    .panel {
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      height: 380px;
      display: flex;
      flex-direction: column;

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;
        background-color: #f8f9fa;

        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .item-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;

        .item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #ebeef5;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
            background-color: #f0f9ff;
          }

          &.selected {
            border-color: #409eff;
            background-color: #ecf5ff;
          }

          &.confirmed {
            border-color: #67c23a;
            background-color: #f0f9eb;
            cursor: default;
          }

          .el-checkbox {
            margin-right: 12px;
          }

          .confirmed-icon {
            margin-right: 12px;
            color: #67c23a;
            font-size: 18px;
          }

          .item-name {
            flex: 1;
            font-weight: 500;
            color: #303133;
          }

          .item-info {
            font-size: 12px;
            color: #909399;
          }

          .item-content {
            flex: 1;
            display: flex;
            flex-direction: column;

            .item-meta {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }
        }
      }
    }

    .tab-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding: 12px 16px;
      background: #f5f7fa;
      border-radius: 6px;

      .selection-info {
        font-size: 14px;
        color: #606266;

        strong {
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
