<template>
  <el-drawer
    v-model="visible"
    :title="`管理学生 - ${classData?.name}`"
    size="80%"
    @close="handleClose"
  >
    <div class="student-management-container">
      <el-row :gutter="20" style="height: 100%;">
        <!-- 左侧：当前班级学生列表 -->
        <el-col :span="12" class="left-panel">
          <div class="panel-header">
            <h4>班级学生列表</h4>
            <el-input
              v-model="currentStudentSearch"
              placeholder="搜索学生..."
              clearable
              size="small"
              style="width: 200px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="student-list">
            <div
              v-for="student in filteredCurrentStudents"
              :key="student.id"
              class="student-item"
            >
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <span class="student-id">{{ student.studentId }}</span>
              </div>
              <el-button
                type="danger"
                text
                size="small"
                @click="removeStudent(student)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="filteredCurrentStudents.length === 0" description="暂无学生" />
        </el-col>

        <!-- 右侧：全局学生搜索和待审核列表 -->
        <el-col :span="12" class="right-panel">
          <!-- 全局学生搜索 -->
          <div class="search-section">
            <h4>添加学生</h4>
            <el-input
              v-model="globalStudentSearch"
              placeholder="搜索全局学生..."
              clearable
              size="small"
              style="width: 100%; margin-bottom: 12px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="available-students">
              <div
                v-for="student in filteredAvailableStudents"
                :key="student.id"
                class="student-item"
              >
                <div class="student-info">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-id">{{ student.studentId }}</span>
                </div>
                <el-button
                  type="success"
                  text
                  size="small"
                  @click="addStudent(student)"
                >
                  添加
                </el-button>
              </div>
            </div>

            <el-empty v-if="filteredAvailableStudents.length === 0" description="暂无可添加的学生" />
          </div>

          <!-- 待审核学生列表 -->
          <div class="pending-section">
            <h4>待审核学生（通过班级码申请）</h4>
            <div class="pending-students">
              <div
                v-for="student in pendingStudents"
                :key="student.id"
                class="pending-item"
              >
                <div class="student-info">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-id">{{ student.studentId }}</span>
                  <span class="apply-time">申请时间：{{ formatDate(student.applyTime) }}</span>
                </div>
                <div class="actions">
                  <el-button
                    type="success"
                    text
                    size="small"
                    @click="approvePendingStudent(student)"
                  >
                    批准
                  </el-button>
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click="rejectPendingStudent(student)"
                  >
                    拒绝
                  </el-button>
                </div>
              </div>
            </div>

            <el-empty v-if="pendingStudents.length === 0" description="暂无待审核学生" />
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
import { ref, computed } from 'vue'
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
const currentStudentSearch = ref('')
const globalStudentSearch = ref('')

// 模拟当前班级学生
const currentStudents = ref([
  { id: 'stu_001', name: '张三', studentId: '20240001' },
  { id: 'stu_002', name: '李四', studentId: '20240002' },
  { id: 'stu_003', name: '王五', studentId: '20240003' }
])

// 模拟全局可用学生
const availableStudents = ref([
  { id: 'stu_004', name: '赵六', studentId: '20240004' },
  { id: 'stu_005', name: '孙七', studentId: '20240005' },
  { id: 'stu_006', name: '周八', studentId: '20240006' },
  { id: 'stu_007', name: '吴九', studentId: '20240007' }
])

// 模拟待审核学生
const pendingStudents = ref([
  { id: 'stu_pending_001', name: '郑十', studentId: '20240008', applyTime: new Date('2024-11-15T10:30:00Z') },
  { id: 'stu_pending_002', name: '冯十一', studentId: '20240009', applyTime: new Date('2024-11-14T14:20:00Z') }
])

// 计算属性
const filteredCurrentStudents = computed(() => {
  if (!currentStudentSearch.value) return currentStudents.value
  return currentStudents.value.filter(s =>
    s.name.includes(currentStudentSearch.value) ||
    s.studentId.includes(currentStudentSearch.value)
  )
})

const filteredAvailableStudents = computed(() => {
  if (!globalStudentSearch.value) return availableStudents.value
  return availableStudents.value.filter(s =>
    s.name.includes(globalStudentSearch.value) ||
    s.studentId.includes(globalStudentSearch.value)
  )
})

// 方法
const removeStudent = (student) => {
  const index = currentStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    currentStudents.value.splice(index, 1)
    availableStudents.value.push(student)
    ElMessage.success(`已移除学生：${student.name}`)
  }
}

const addStudent = (student) => {
  const index = availableStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    availableStudents.value.splice(index, 1)
    currentStudents.value.push(student)
    ElMessage.success(`已添加学生：${student.name}`)
  }
}

const approvePendingStudent = (student) => {
  const index = pendingStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    pendingStudents.value.splice(index, 1)
    currentStudents.value.push({
      id: student.id,
      name: student.name,
      studentId: student.studentId
    })
    ElMessage.success(`已批准学生：${student.name}`)
  }
}

const rejectPendingStudent = (student) => {
  const index = pendingStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    pendingStudents.value.splice(index, 1)
    ElMessage.success(`已拒绝学生：${student.name}`)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const handleClose = () => {
  visible.value = false
}

const handleSave = () => {
  emit('save', {
    students: currentStudents.value
  })
  ElMessage.success('学生列表已保存')
  handleClose()
}
</script>

<style lang="scss" scoped>
.student-management-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-panel,
.right-panel {
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
}

.search-section,
.pending-section {
  margin-bottom: 20px;

  h4 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.student-list,
.available-students,
.pending-students {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-item,
.pending-item {
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

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  .student-name {
    font-weight: 500;
    color: #303133;
    font-size: 14px;
  }

  .student-id {
    color: #909399;
    font-size: 12px;
  }

  .apply-time {
    color: #909399;
    font-size: 12px;
  }
}

.pending-item {
  flex-direction: column;
  align-items: flex-start;

  .student-info {
    width: 100%;
    margin-bottom: 8px;
  }

  .actions {
    width: 100%;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
