<template>
  <div class="student-management-panel">
    <div class="panel-header">
      <h4>学生管理</h4>
      <div class="header-actions">
        <el-button type="primary" size="small" @click="handleAddStudent">
          <el-icon><Plus /></el-icon>
          添加学生
        </el-button>
        <el-button size="small" @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名或学号..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="student-list">
      <el-table
        :data="filteredStudents"
        style="width: 100%"
        height="500"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleRemove(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="panel-footer">
      <span class="student-count">共 {{ students.length }} 名学生</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Search } from '@element-plus/icons-vue'

const props = defineProps({
  classData: Object
})

// 响应式数据
const searchKeyword = ref('')

// 模拟学生列表
const students = ref([
  { id: 'stu_001', studentId: '2024001', name: '张三', gender: 'male', phone: '13800138001', email: 'zhangsan@example.com' },
  { id: 'stu_002', studentId: '2024002', name: '李四', gender: 'male', phone: '13800138002', email: 'lisi@example.com' },
  { id: 'stu_003', studentId: '2024003', name: '王五', gender: 'female', phone: '13800138003', email: 'wangwu@example.com' },
  { id: 'stu_004', studentId: '2024004', name: '赵六', gender: 'male', phone: '13800138004', email: 'zhaoliu@example.com' },
  { id: 'stu_005', studentId: '2024005', name: '孙七', gender: 'female', phone: '13800138005', email: 'sunqi@example.com' }
])

// 计算属性
const filteredStudents = computed(() => {
  if (!searchKeyword.value) {
    return students.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return students.value.filter(student =>
    student.name.toLowerCase().includes(keyword) ||
    student.studentId.toLowerCase().includes(keyword)
  )
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleAddStudent = () => {
  ElMessage.info('添加学生功能开发中...')
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleEdit = (student) => {
  ElMessage.info(`编辑学生：${student.name}`)
}

const handleRemove = async (student) => {
  try {
    await ElMessageBox.confirm(
      `确定要将学生 ${student.name} 从班级中移除吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = students.value.findIndex(s => s.id === student.id)
    if (index > -1) {
      students.value.splice(index, 1)
      ElMessage.success(`已移除学生：${student.name}`)
    }
  } catch {
    // 用户取消
  }
}
</script>

<style lang="scss" scoped>
.student-management-panel {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
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
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.search-section {
  margin-bottom: 16px;
}

.student-list {
  flex: 1;
  overflow: hidden;
}

.panel-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
  text-align: right;

  .student-count {
    font-size: 14px;
    color: #606266;
  }
}
</style>
