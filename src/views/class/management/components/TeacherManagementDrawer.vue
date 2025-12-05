<template>
  <el-drawer
    v-model="visible"
    :title="`管理老师 - ${classData?.name}`"
    size="80%"
    @close="handleClose"
  >
    <div class="teacher-management-container">
      <!-- 全局搜索框 -->
      <div class="global-search">
        <el-input
          v-model="teacherSearch"
          placeholder="搜索老师姓名或工号..."
          clearable
          size="default"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div v-if="teacherSearch" class="search-hint">
          找到 {{ availableHeadTeachers.length + availableTeachingTeachers.length }} 位可添加的老师
        </div>
      </div>

      <el-row :gutter="20" style="height: calc(100% - 80px);">
        <!-- 班主任管理 -->
        <el-col :span="12" class="panel">
          <div class="panel-header">
            <h4>班主任</h4>
            <span class="subtitle">支持多个班主任</span>
          </div>

          <div class="teacher-list">
            <div
              v-for="teacher in headTeachers"
              :key="teacher.id"
              class="teacher-item"
            >
              <div class="teacher-info">
                <span class="teacher-name">{{ teacher.name }}</span>
                <span class="teacher-id">{{ teacher.id }}</span>
              </div>
              <el-button
                type="danger"
                text
                size="small"
                @click="removeHeadTeacher(teacher)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="headTeachers.length === 0" description="暂无班主任" />

          <div class="add-section">
            <el-select
              v-model="selectedHeadTeacher"
              placeholder="搜索班主任"
              size="small"
              style="width: 100%; margin-bottom: 8px;"
              filterable
              clearable
              :filter-method="filterHeadTeachers"
            >
              <el-option
                v-for="teacher in filteredHeadTeachers"
                :key="teacher.id"
                :label="`${teacher.name} (${teacher.id})`"
                :value="teacher"
              />
            </el-select>
            <el-button
              type="primary"
              size="small"
              @click="addHeadTeacher"
              style="width: 100%;"
            >
              添加班主任
            </el-button>
          </div>
        </el-col>

        <!-- 授课老师管理 -->
        <el-col :span="12" class="panel">
          <div class="panel-header">
            <h4>授课老师</h4>
            <span class="subtitle">支持多个授课老师</span>
          </div>

          <div class="teacher-list">
            <div
              v-for="teacher in teachingTeachers"
              :key="teacher.id"
              class="teacher-item"
            >
              <div class="teacher-info">
                <span class="teacher-name">{{ teacher.name }}</span>
                <span class="teacher-id">{{ teacher.id }}</span>
              </div>
              <el-button
                type="danger"
                text
                size="small"
                @click="removeTeachingTeacher(teacher)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="teachingTeachers.length === 0" description="暂无授课老师" />

          <div class="add-section">
            <el-select
              v-model="selectedTeachingTeacher"
              placeholder="搜索授课老师"
              size="small"
              style="width: 100%; margin-bottom: 8px;"
              filterable
              clearable
              :filter-method="filterTeachingTeachers"
            >
              <el-option
                v-for="teacher in filteredTeachingTeachers"
                :key="teacher.id"
                :label="`${teacher.name} (${teacher.id})`"
                :value="teacher"
              />
            </el-select>
            <el-button
              type="primary"
              size="small"
              @click="addTeachingTeacher"
              style="width: 100%;"
            >
              添加授课老师
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div style="flex: auto;">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  classData: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const teacherSearch = ref('')
const selectedHeadTeacher = ref(null)
const selectedTeachingTeacher = ref(null)
const filteredHeadTeachers = ref([])
const filteredTeachingTeachers = ref([])

// 模拟班主任列表
const headTeachers = ref([
  { id: 'teacher_001', name: '王老师' },
  { id: 'teacher_005', name: '陈老师' }
])

// 模拟授课老师列表
const teachingTeachers = ref([
  { id: 'teacher_002', name: '李老师' },
  { id: 'teacher_003', name: '张老师' }
])

// 模拟所有可用老师
const allTeachers = ref([
  { id: 'teacher_001', name: '王老师' },
  { id: 'teacher_002', name: '李老师' },
  { id: 'teacher_003', name: '张老师' },
  { id: 'teacher_004', name: '赵老师' },
  { id: 'teacher_005', name: '陈老师' },
  { id: 'teacher_006', name: '刘老师' },
  { id: 'teacher_007', name: '杨老师' },
  { id: 'teacher_008', name: '黄老师' }
])

// 计算属性
const availableHeadTeachers = computed(() => {
  const usedIds = new Set([
    ...headTeachers.value.map(t => t.id),
    ...teachingTeachers.value.map(t => t.id)
  ])
  let available = allTeachers.value.filter(t => !usedIds.has(t.id))
  
  // 应用全局搜索过滤
  if (teacherSearch.value) {
    const searchLower = teacherSearch.value.toLowerCase()
    available = available.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower)
    )
  }
  
  return available
})

const availableTeachingTeachers = computed(() => {
  const usedIds = new Set([
    ...headTeachers.value.map(t => t.id),
    ...teachingTeachers.value.map(t => t.id)
  ])
  let available = allTeachers.value.filter(t => !usedIds.has(t.id))
  
  // 应用全局搜索过滤
  if (teacherSearch.value) {
    const searchLower = teacherSearch.value.toLowerCase()
    available = available.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower)
    )
  }
  
  return available
})

// 初始化过滤列表
const initFilteredTeachers = () => {
  filteredHeadTeachers.value = availableHeadTeachers.value
  filteredTeachingTeachers.value = availableTeachingTeachers.value
}

// 方法
const filterHeadTeachers = (query) => {
  if (!query) {
    filteredHeadTeachers.value = availableHeadTeachers.value
  } else {
    filteredHeadTeachers.value = availableHeadTeachers.value.filter(teacher => 
      teacher.name.toLowerCase().includes(query.toLowerCase()) ||
      teacher.id.toLowerCase().includes(query.toLowerCase())
    )
  }
}

const filterTeachingTeachers = (query) => {
  if (!query) {
    filteredTeachingTeachers.value = availableTeachingTeachers.value
  } else {
    filteredTeachingTeachers.value = availableTeachingTeachers.value.filter(teacher => 
      teacher.name.toLowerCase().includes(query.toLowerCase()) ||
      teacher.id.toLowerCase().includes(query.toLowerCase())
    )
  }
}
const removeHeadTeacher = (teacher) => {
  const index = headTeachers.value.findIndex(t => t.id === teacher.id)
  if (index > -1) {
    headTeachers.value.splice(index, 1)
    ElMessage.success(`已移除班主任：${teacher.name}`)
  }
}

const addHeadTeacher = () => {
  if (!selectedHeadTeacher.value) {
    ElMessage.warning('请选择班主任')
    return
  }
  headTeachers.value.push(selectedHeadTeacher.value)
  ElMessage.success(`已添加班主任：${selectedHeadTeacher.value.name}`)
  selectedHeadTeacher.value = null
}

const removeTeachingTeacher = (teacher) => {
  const index = teachingTeachers.value.findIndex(t => t.id === teacher.id)
  if (index > -1) {
    teachingTeachers.value.splice(index, 1)
    ElMessage.success(`已移除授课老师：${teacher.name}`)
  }
}

const addTeachingTeacher = () => {
  if (!selectedTeachingTeacher.value) {
    ElMessage.warning('请选择授课老师')
    return
  }
  teachingTeachers.value.push(selectedTeachingTeacher.value)
  ElMessage.success(`已添加授课老师：${selectedTeachingTeacher.value.name}`)
  selectedTeachingTeacher.value = null
}

const handleClose = () => {
  visible.value = false
}

const handleSave = () => {
  emit('save', {
    headTeachers: headTeachers.value,
    teachingTeachers: teachingTeachers.value
  })
  ElMessage.success('老师列表已保存')
  handleClose()
}

// 监听可用老师列表变化，更新过滤列表
watch([availableHeadTeachers, availableTeachingTeachers], () => {
  initFilteredTeachers()
}, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  initFilteredTeachers()
})
</script>

<style lang="scss" scoped>
.teacher-management-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.global-search {
  margin-bottom: 20px;
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .search-hint {
    margin-top: 8px;
    font-size: 12px;
    color: #409eff;
    padding-left: 12px;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  h4 {
    margin: 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  .subtitle {
    color: #909399;
    font-size: 12px;
  }
}

.teacher-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  flex: 1;
}

.teacher-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f8f9fa;

  &:hover {
    background: #f0f2f5;
  }
}

.teacher-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  .teacher-name {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .teacher-id {
    color: #909399;
    font-size: 12px;
  }
}

.add-section {
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}
</style>
