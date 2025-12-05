<template>
  <div class="authorization-panel">
    <!-- 学生授权面板 -->
    <div v-if="type === 'student'" class="panel-content">
      <h4>学生授权</h4>

      <!-- 已授权学生列表 -->
      <div class="section">
        <h5>已授权学生</h5>
        <div class="student-list">
          <div v-for="student in authorizedStudents" :key="student.id" class="student-item">
            <span>{{ student.name }}（{{ student.studentId }}）</span>
            <el-button text type="danger" size="small" @click="removeStudent(student)">
              移除
            </el-button>
          </div>
        </div>
        <el-empty v-if="authorizedStudents.length === 0" description="暂无已授权学生" />
      </div>

      <!-- 添加学生按钮 -->
      <el-button type="primary" size="small" @click="showAddStudents">
        添加学生
      </el-button>

      <!-- 待审核申请列表 -->
      <div class="section">
        <h5>待审核申请</h5>
        <div class="pending-list">
          <div v-for="student in pendingStudents" :key="student.id" class="pending-item">
            <div class="pending-info">
              <span class="name">{{ student.name }}</span>
              <span class="time">{{ formatDate(student.applyTime) }}</span>
            </div>
            <div class="pending-actions">
              <el-button text type="success" size="small" @click="approvePending(student)">
                批准
              </el-button>
              <el-button text type="danger" size="small" @click="rejectPending(student)">
                拒绝
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-if="pendingStudents.length === 0" description="暂无待审核申请" />
      </div>
    </div>

    <!-- 老师授权面板 -->
    <div v-else-if="type === 'teacher'" class="panel-content">
      <h4>老师授权</h4>

      <el-row :gutter="20">
        <!-- 班主任选择 -->
        <el-col :span="12">
          <h5>班主任</h5>
          <el-select
            v-model="selectedHeadTeachers"
            multiple
            placeholder="选择班主任"
            style="width: 100%; margin-bottom: 12px;"
          >
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher"
            />
          </el-select>
          <div class="selected-list">
            <div v-for="teacher in selectedHeadTeachers" :key="teacher.id" class="selected-item">
              <span>{{ teacher.name }}</span>
              <el-button text type="danger" size="small" @click="removeHeadTeacher(teacher)">
                移除
              </el-button>
            </div>
          </div>
        </el-col>

        <!-- 授课老师选择 -->
        <el-col :span="12">
          <h5>授课老师</h5>
          <el-select
            v-model="selectedTeachingTeachers"
            multiple
            placeholder="选择授课老师"
            style="width: 100%; margin-bottom: 12px;"
          >
            <el-option
              v-for="teacher in availableTeachers"
              :key="teacher.id"
              :label="teacher.name"
              :value="teacher"
            />
          </el-select>
          <div class="selected-list">
            <div v-for="teacher in selectedTeachingTeachers" :key="teacher.id" class="selected-item">
              <span>{{ teacher.name }}</span>
              <el-button text type="danger" size="small" @click="removeTeachingTeacher(teacher)">
                移除
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 课程/作业/考试授权面板 -->
    <div v-else class="panel-content">
      <h4>{{ getTypeLabel }}授权</h4>

      <el-transfer
        v-model="selectedItems"
        :data="availableItems"
        :titles="['可选' + getTypeLabel, '已授权' + getTypeLabel]"
        filterable
        filter-placeholder="搜索"
      />
    </div>

    <!-- 保存按钮 -->
    <div class="panel-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  classId: String,
  classData: Object
})

const emit = defineEmits(['close'])

// 响应式数据
const selectedHeadTeachers = ref([])
const selectedTeachingTeachers = ref([])
const selectedItems = ref([])
const authorizedStudents = ref([
  { id: 'stu_001', name: '张三', studentId: '20240001' },
  { id: 'stu_002', name: '李四', studentId: '20240002' }
])
const pendingStudents = ref([
  { id: 'stu_pending_001', name: '王五', applyTime: new Date('2024-11-15T10:30:00Z') }
])

// 模拟可用老师
const availableTeachers = ref([
  { id: 'teacher_001', name: '王老师' },
  { id: 'teacher_002', name: '李老师' },
  { id: 'teacher_003', name: '张老师' },
  { id: 'teacher_004', name: '赵老师' }
])

// 模拟可用项目
const availableItems = ref([
  { key: 'item_001', label: 'JavaScript基础' },
  { key: 'item_002', label: 'Vue.js框架' },
  { key: 'item_003', label: 'React框架' },
  { key: 'item_004', label: 'Node.js后端' },
  { key: 'item_005', label: 'TypeScript进阶' },
  { key: 'item_006', label: '数据库设计' },
  { key: 'item_007', label: '前端工程化' },
  { key: 'item_008', label: '性能优化' }
])

// 初始化已选项
selectedItems.value = ['item_001', 'item_002']

// 计算属性
const getTypeLabel = computed(() => {
  const map = {
    course: '课程',
    homework: '作业',
    exam: '考试'
  }
  return map[props.type] || props.type
})

// 方法
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const removeStudent = (student) => {
  const index = authorizedStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    authorizedStudents.value.splice(index, 1)
    ElMessage.success(`已移除学生：${student.name}`)
  }
}

const showAddStudents = () => {
  ElMessage.info('打开学生选择器')
}

const approvePending = (student) => {
  const index = pendingStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    pendingStudents.value.splice(index, 1)
    authorizedStudents.value.push({
      id: student.id,
      name: student.name,
      studentId: student.studentId || 'N/A'
    })
    ElMessage.success(`已批准学生：${student.name}`)
  }
}

const rejectPending = (student) => {
  const index = pendingStudents.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    pendingStudents.value.splice(index, 1)
    ElMessage.success(`已拒绝学生：${student.name}`)
  }
}

const removeHeadTeacher = (teacher) => {
  const index = selectedHeadTeachers.value.findIndex(t => t.id === teacher.id)
  if (index > -1) {
    selectedHeadTeachers.value.splice(index, 1)
  }
}

const removeTeachingTeacher = (teacher) => {
  const index = selectedTeachingTeachers.value.findIndex(t => t.id === teacher.id)
  if (index > -1) {
    selectedTeachingTeachers.value.splice(index, 1)
  }
}

const handleClose = () => {
  emit('close')
}

const handleSave = () => {
  ElMessage.success(`${getTypeLabel.value}授权已保存`)
  handleClose()
}
</script>

<style lang="scss" scoped>
.authorization-panel {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.panel-content {
  h4 {
    margin: 0 0 16px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  h5 {
    margin: 0 0 12px 0;
    color: #606266;
    font-size: 13px;
    font-weight: 500;
  }
}

.section {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 4px;
}

.student-list,
.pending-list,
.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.student-item,
.pending-item,
.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 13px;
}

.pending-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .name {
    color: #303133;
    font-weight: 500;
  }

  .time {
    color: #909399;
    font-size: 12px;
  }
}

.pending-actions {
  display: flex;
  gap: 8px;
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}
</style>
