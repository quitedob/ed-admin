<template>
  <el-dialog
    v-model="visible"
    title="授权管理"
    width="85%"
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
          <el-descriptions-item label="当前负责班级">{{ authorizedClasses.length }} 个</el-descriptions-item>
          <el-descriptions-item label="已授权课程">{{ authorizedResources.courses?.length || 0 }} 门</el-descriptions-item>
          <el-descriptions-item label="已授权作业">{{ authorizedResources.assignments?.length || 0 }} 个</el-descriptions-item>
          <el-descriptions-item label="已授权考试">{{ authorizedResources.exams?.length || 0 }} 个</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <!-- 授权内容标签页 -->
      <el-tabs v-model="activeTab" type="card">
        <!-- 班级授权 -->
        <el-tab-pane label="班级授权" name="classes">
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
                      :class="['item', { selected: isClassSelected(cls) }]"
                      @click="toggleClass(cls)"
                    >
                      <el-checkbox :model-value="isClassSelected(cls)" />
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
                    <h4>已授权班级 ({{ authorizedClasses.length }})</h4>
                    <el-input
                      v-model="authorizedClassSearch"
                      placeholder="搜索已授权班级..."
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
                      v-for="cls in filteredAuthorizedClasses"
                      :key="cls.id"
                      class="item selected"
                    >
                      <el-checkbox :model-value="true" disabled />
                      <span class="item-name">{{ cls.name }}</span>
                      <el-button
                        type="danger"
                        size="small"
                        text
                        @click="removeClass(cls)"
                      >
                        移除
                      </el-button>
                    </div>
                  </div>
                  <el-empty v-if="filteredAuthorizedClasses.length === 0" description="暂无已授权班级" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 课程授权 -->
        <el-tab-pane label="课程授权" name="courses">
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
                      :class="['item', { selected: isResourceSelected(course, 'courses') }]"
                      @click="toggleResource(course, 'courses')"
                    >
                      <el-checkbox :model-value="isResourceSelected(course, 'courses')" />
                      <div class="item-info">
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
                    <h4>已授权课程 ({{ authorizedResources.courses?.length || 0 }})</h4>
                    <el-input
                      v-model="authorizedCourseSearch"
                      placeholder="搜索已授权课程..."
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
                      v-for="course in filteredAuthorizedCourses"
                      :key="course.id"
                      class="item selected"
                    >
                      <el-checkbox :model-value="true" disabled />
                      <div class="item-info">
                        <span class="item-name">{{ course.name }}</span>
                        <el-button
                          type="danger"
                          size="small"
                          text
                          @click="removeResource(course, 'courses')"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAuthorizedCourses.length === 0" description="暂无已授权课程" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 作业授权 -->
        <el-tab-pane label="作业授权" name="assignments">
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
                      :class="['item', { selected: isResourceSelected(assignment, 'assignments') }]"
                      @click="toggleResource(assignment, 'assignments')"
                    >
                      <el-checkbox :model-value="isResourceSelected(assignment, 'assignments')" />
                      <div class="item-info">
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
                    <h4>已授权作业 ({{ authorizedResources.assignments?.length || 0 }})</h4>
                    <el-input
                      v-model="authorizedAssignmentSearch"
                      placeholder="搜索已授权作业..."
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
                      v-for="assignment in filteredAuthorizedAssignments"
                      :key="assignment.id"
                      class="item selected"
                    >
                      <el-checkbox :model-value="true" disabled />
                      <div class="item-info">
                        <span class="item-name">{{ assignment.name }}</span>
                        <el-button
                          type="danger"
                          size="small"
                          text
                          @click="removeResource(assignment, 'assignments')"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAuthorizedAssignments.length === 0" description="暂无已授权作业" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 考试授权 -->
        <el-tab-pane label="考试授权" name="exams">
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
                      :class="['item', { selected: isResourceSelected(exam, 'exams') }]"
                      @click="toggleResource(exam, 'exams')"
                    >
                      <el-checkbox :model-value="isResourceSelected(exam, 'exams')" />
                      <div class="item-info">
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
                    <h4>已授权考试 ({{ authorizedResources.exams?.length || 0 }})</h4>
                    <el-input
                      v-model="authorizedExamSearch"
                      placeholder="搜索已授权考试..."
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
                      v-for="exam in filteredAuthorizedExams"
                      :key="exam.id"
                      class="item selected"
                    >
                      <el-checkbox :model-value="true" disabled />
                      <div class="item-info">
                        <span class="item-name">{{ exam.name }}</span>
                        <el-button
                          type="danger"
                          size="small"
                          text
                          @click="removeResource(exam, 'exams')"
                        >
                          移除
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="filteredAuthorizedExams.length === 0" description="暂无已授权考试" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存授权
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

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
const authorizedClassSearch = ref('')
const authorizedCourseSearch = ref('')
const authorizedAssignmentSearch = ref('')
const authorizedExamSearch = ref('')

// 当前选中的项目（临时）
const tempSelectedClasses = ref([])
const tempSelectedResources = ref({
  courses: [],
  assignments: [],
  exams: []
})

// 已授权的数据
const authorizedClasses = ref([])
const authorizedResources = ref({
  courses: [],
  assignments: [],
  exams: []
})

// 可选的模拟数据
const availableClasses = ref([])
const availableCourses = ref([])
const availableAssignments = ref([])
const availableExams = ref([])

// 计算属性
const filteredAvailableClasses = computed(() => {
  if (!classSearch.value) return availableClasses.value
  return availableClasses.value.filter(cls =>
    cls.name.includes(classSearch.value)
  )
})

const filteredAvailableCourses = computed(() => {
  if (!courseSearch.value) return availableCourses.value
  return availableCourses.value.filter(course =>
    course.name.includes(courseSearch.value) || course.category.includes(courseSearch.value)
  )
})

const filteredAvailableAssignments = computed(() => {
  if (!assignmentSearch.value) return availableAssignments.value
  return availableAssignments.value.filter(assignment =>
    assignment.name.includes(assignmentSearch.value) || assignment.course.includes(assignmentSearch.value)
  )
})

const filteredAvailableExams = computed(() => {
  if (!examSearch.value) return availableExams.value
  return availableExams.value.filter(exam =>
    exam.name.includes(examSearch.value) || exam.course.includes(examSearch.value)
  )
})

const filteredAuthorizedClasses = computed(() => {
  if (!authorizedClassSearch.value) return authorizedClasses.value
  return authorizedClasses.value.filter(cls =>
    cls.name.includes(authorizedClassSearch.value)
  )
})

const filteredAuthorizedCourses = computed(() => {
  if (!authorizedCourseSearch.value) return authorizedResources.value.courses
  return authorizedResources.value.courses.filter(course =>
    course.name.includes(authorizedCourseSearch.value)
  )
})

const filteredAuthorizedAssignments = computed(() => {
  if (!authorizedAssignmentSearch.value) return authorizedResources.value.assignments
  return authorizedResources.value.assignments.filter(assignment =>
    assignment.name.includes(authorizedAssignmentSearch.value)
  )
})

const filteredAuthorizedExams = computed(() => {
  if (!authorizedExamSearch.value) return authorizedResources.value.exams
  return authorizedResources.value.exams.filter(exam =>
    exam.name.includes(authorizedExamSearch.value)
  )
})

// 方法
const isClassSelected = (cls) => {
  return tempSelectedClasses.value.some(c => c.id === cls.id)
}

const isResourceSelected = (resource, type) => {
  return tempSelectedResources.value[type].some(r => r.id === resource.id)
}

const toggleClass = (cls) => {
  const index = tempSelectedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    tempSelectedClasses.value.splice(index, 1)
  } else {
    tempSelectedClasses.value.push(cls)
  }
}

const toggleResource = (resource, type) => {
  const index = tempSelectedResources.value[type].findIndex(r => r.id === resource.id)
  if (index > -1) {
    tempSelectedResources.value[type].splice(index, 1)
  } else {
    tempSelectedResources.value[type].push(resource)
  }
}

const removeClass = (cls) => {
  const index = authorizedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    authorizedClasses.value.splice(index, 1)
  }
}

const removeResource = (resource, type) => {
  const index = authorizedResources.value[type].findIndex(r => r.id === resource.id)
  if (index > -1) {
    authorizedResources.value[type].splice(index, 1)
  }
}

const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
}

const handleSave = () => {
  saving.value = true

  // 合并临时选中的项目到已授权列表
  const finalAuthorizedClasses = [...authorizedClasses.value]
  tempSelectedClasses.value.forEach(cls => {
    if (!finalAuthorizedClasses.some(c => c.id === cls.id)) {
      finalAuthorizedClasses.push(cls)
    }
  })

  const finalAuthorizedResources = {
    courses: [...authorizedResources.value.courses],
    assignments: [...authorizedResources.value.assignments],
    exams: [...authorizedResources.value.exams]
  }

  // 合并临时选中的资源
  Object.keys(tempSelectedResources.value).forEach(type => {
    tempSelectedResources.value[type].forEach(resource => {
      if (!finalAuthorizedResources[type].some(r => r.id === resource.id)) {
        finalAuthorizedResources[type].push(resource)
      }
    })
  })

  setTimeout(() => {
    saving.value = false
    emit('save', {
      authorizedClasses: finalAuthorizedClasses,
      authorizedResources: finalAuthorizedResources
    })
    ElMessage.success('授权保存成功')
    handleClose()
  }, 1000)
}

// 初始化模拟数据
const initMockData = () => {
  // 模拟可选班级
  availableClasses.value = [
    { id: 'cls_001', name: '一年级一班', studentCount: 30, grade: '一年级' },
    { id: 'cls_002', name: '一年级二班', studentCount: 32, grade: '一年级' },
    { id: 'cls_003', name: '二年级一班', studentCount: 28, grade: '二年级' },
    { id: 'cls_004', name: '二年级二班', studentCount: 31, grade: '二年级' },
    { id: 'cls_005', name: '三年级一班', studentCount: 29, grade: '三年级' },
    { id: 'cls_006', name: '三年级二班', studentCount: 30, grade: '三年级' }
  ]

  // 模拟可选课程
  availableCourses.value = [
    { id: 'course_001', name: 'Python编程基础', category: '编程语言', duration: '40课时' },
    { id: 'course_002', name: 'Web前端开发', category: '前端开发', duration: '60课时' },
    { id: 'course_003', name: '数据结构', category: '计算机科学', duration: '50课时' },
    { id: 'course_004', name: '算法设计', category: '计算机科学', duration: '45课时' }
  ]

  // 模拟可选作业
  availableAssignments.value = [
    { id: 'assignment_001', name: 'Python基础练习', course: 'Python编程基础', questionCount: 10 },
    { id: 'assignment_002', name: 'HTML/CSS实战', course: 'Web前端开发', questionCount: 15 },
    { id: 'assignment_003', name: '链表操作', course: '数据结构', questionCount: 8 },
    { id: 'assignment_004', name: '排序算法', course: '算法设计', questionCount: 12 }
  ]

  // 模拟可选考试
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
    // 初始化已授权数据
    authorizedClasses.value = [...props.initialAuthorizedClasses]
    authorizedResources.value = {
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
  .teacher-info {
    margin-bottom: 20px;
  }

  .tab-content {
    min-height: 400px;

    .panel {
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      height: 400px;
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

          .el-checkbox {
            margin-right: 12px;
          }

          .item-name {
            flex: 1;
            font-weight: 500;
            color: #303133;
          }

          .item-info {
            flex: 1;
            display: flex;
            flex-direction: column;

            .item-meta {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }

          .item-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>