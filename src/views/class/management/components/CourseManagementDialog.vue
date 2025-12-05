<template>
  <el-dialog
    v-model="dialogVisible"
    title="管理课程"
    width="900px"
    @close="handleClose"
  >
    <div class="course-management-content">
      <!-- 操作按钮 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddCourses">
          <el-icon><Plus /></el-icon>
          添加课程
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedCourses.length === 0"
          @click="handleBatchRemove"
        >
          <el-icon><Delete /></el-icon>
          批量移除
        </el-button>
      </div>

      <!-- 课程列表 -->
      <el-table
        :data="courses"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="课程名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="课次数" width="100" align="center">
          <template #default="{ row }">
            {{ row.lessonCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="开放进度" width="180">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-progress
                :percentage="getCourseOpenProgress(row)"
                :color="getProgressColor(getCourseOpenProgress(row))"
                style="flex: 1"
              />
              <span style="font-size: 12px; color: #909399">
                {{ row.openedLessons || 0 }}/{{ row.lessonCount || 0 }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="授权时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.authorizedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleSetAccess(row)">
              <el-icon><Setting /></el-icon>
              设置开放进度
            </el-button>
            <el-button link type="danger" size="small" @click="handleRemove(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="courses.length === 0" description="暂无课程" />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>

    <!-- 添加课程选择器 -->
    <EntitySelectorDialog
      v-model="selectorVisible"
      entity-type="course"
      :multiple="true"
      :selected-ids="courses.map(c => c.id)"
      :data-source="availableCourses"
      @confirm="handleCoursesSelected"
    />

    <!-- 课次开放设置对话框 -->
    <CourseAccessDialog
      v-model="accessDialogVisible"
      :class-id="classData?.id"
      :course-id="selectedCourseId"
      @save="handleAccessSave"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Setting } from '@element-plus/icons-vue'
import EntitySelectorDialog from '@/components/EntitySelector/EntitySelectorDialog.vue'
import CourseAccessDialog from './CourseAccessDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  classData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const loading = ref(false)
const courses = ref([])
const selectedCourses = ref([])
const selectorVisible = ref(false)
const accessDialogVisible = ref(false)
const selectedCourseId = ref('')

// 可用课程列表（模拟数据）
const availableCourses = ref([
  {
    id: 'course_001',
    name: 'JavaScript基础',
    category: '编程语言',
    lessonCount: 20
  },
  {
    id: 'course_002',
    name: 'Vue.js框架',
    category: '前端框架',
    lessonCount: 15
  },
  {
    id: 'course_003',
    name: 'React基础',
    category: '前端框架',
    lessonCount: 18
  },
  {
    id: 'course_004',
    name: 'Node.js后端开发',
    category: '后端开发',
    lessonCount: 25
  },
  {
    id: 'course_005',
    name: 'Python编程',
    category: '编程语言',
    lessonCount: 30
  }
])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 方法
const loadCourses = () => {
  if (!props.classData) return
  
  loading.value = true
  // TODO: 调用实际API加载班级课程
  // const response = await api.getClassCourses(props.classData.id)
  
  // 模拟数据
  setTimeout(() => {
    courses.value = [
      {
        id: 'course_001',
        name: 'JavaScript基础',
        category: '编程语言',
        lessonCount: 20,
        openedLessons: 8,
        authorizedAt: '2024-09-01T10:00:00Z'
      },
      {
        id: 'course_002',
        name: 'Vue.js框架',
        category: '前端框架',
        lessonCount: 15,
        openedLessons: 5,
        authorizedAt: '2024-09-15T10:00:00Z'
      }
    ]
    loading.value = false
  }, 500)
}

const handleAddCourses = () => {
  selectorVisible.value = true
}

const handleCoursesSelected = ({ ids, items }) => {
  // 添加新选择的课程
  const newCourses = items.filter(item => !courses.value.some(c => c.id === item.id))
  
  newCourses.forEach(course => {
    courses.value.push({
      ...course,
      openedLessons: 0,
      authorizedAt: new Date().toISOString()
    })
  })
  
  ElMessage.success(`已添加 ${newCourses.length} 门课程`)
  emit('save', { courses: courses.value })
}

const handleSelectionChange = (selection) => {
  selectedCourses.value = selection
}

const handleBatchRemove = () => {
  ElMessageBox.confirm(
    `确定要移除选中的 ${selectedCourses.value.length} 门课程吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    selectedCourses.value.forEach(course => {
      const index = courses.value.findIndex(c => c.id === course.id)
      if (index > -1) {
        courses.value.splice(index, 1)
      }
    })
    ElMessage.success('移除成功')
    emit('save', { courses: courses.value })
  })
}

const handleRemove = (course) => {
  ElMessageBox.confirm(
    `确定要移除课程"${course.name}"吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = courses.value.findIndex(c => c.id === course.id)
    if (index > -1) {
      courses.value.splice(index, 1)
      ElMessage.success('移除成功')
      emit('save', { courses: courses.value })
    }
  })
}

const handleSetAccess = (course) => {
  selectedCourseId.value = course.id
  accessDialogVisible.value = true
}

const handleAccessSave = (accessData) => {
  // 更新课程的开放进度
  const course = courses.value.find(c => c.id === accessData.courseId)
  if (course) {
    course.openedLessons = accessData.lessons.filter(l => l.isOpen).length
    ElMessage.success('课次开放设置已保存')
  }
}

const getCourseOpenProgress = (course) => {
  if (!course.lessonCount || course.lessonCount === 0) return 0
  return Math.round((course.openedLessons / course.lessonCount) * 100)
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  if (percentage > 0) return '#409eff'
  return '#909399'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleClose = () => {
  emit('update:modelValue', false)
}

// 监听对话框打开
watch(() => props.modelValue, (visible) => {
  if (visible) {
    loadCourses()
  }
})
</script>

<style lang="scss" scoped>
.course-management-content {
  .action-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
