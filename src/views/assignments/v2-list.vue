<template>
  <div class="v2-assignments-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2>作业管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>教学管理</el-breadcrumb-item>
          <el-breadcrumb-item>作业管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建作业
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入作业
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索作业..."
        clearable
        style="width: 200px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterClass" placeholder="班级" clearable style="width: 150px">
        <el-option label="全部班级" value="" />
        <el-option label="前端开发一班" value="class_001" />
        <el-option label="前端开发二班" value="class_002" />
        <el-option label="数据科学班" value="class_003" />
      </el-select>

      <el-select v-model="filterType" placeholder="类型" clearable style="width: 150px">
        <el-option label="全部类型" value="" />
        <el-option label="课后作业" value="homework" />
        <el-option label="课堂测验" value="quiz" />
        <el-option label="期中考试" value="midterm" />
        <el-option label="期末考试" value="final" />
      </el-select>

      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 150px">
        <el-option label="全部状态" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="已结束" value="ended" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
    </div>

    <!-- V2 作业管理器 -->
    <V2AssignmentManager
      @edit="handleEdit"
      @delete="handleDelete"
      @view="handleView"
      @grade="handleGrade"
    />

    <!-- 创建作业对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建作业"
      width="800px"
      :close-on-click-modal="false"
    >
      <V2AssignmentCreate
        v-if="createDialogVisible"
        @save="handleSaveAssignment"
        @cancel="createDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Search } from '@element-plus/icons-vue'
import V2AssignmentManager from '@/components/V2AssignmentManager.vue'
import V2AssignmentCreate from '@/components/V2AssignmentCreate.vue'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const filterClass = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const createDialogVisible = ref(false)

// 方法
const handleCreate = () => {
  createDialogVisible.value = true
}

const handleImport = () => {
  ElMessage.info('导入功能开发中...')
}

const handleEdit = (assignment) => {
  router.push(`/assignments/edit/${assignment.id}`)
}

const handleDelete = (assignment) => {
  // Delete logic handled in V2AssignmentManager
}

const handleView = (assignment) => {
  router.push(`/assignments/detail/${assignment.id}`)
}

const handleGrade = (assignment) => {
  router.push(`/assignments/grade/${assignment.id}`)
}

const handleSaveAssignment = (assignmentData) => {
  // Save assignment logic
  ElMessage.success('作业创建成功')
  createDialogVisible.value = false
  // Refresh assignment list
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/assignments/v2-list.vue`)
})
</script>

<style lang="scss" scoped>
.v2-assignments-page {
  padding: 24px;
  background-color: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    h2 {
      margin: 0 0 8px 0;
      color: var(--color-text-primary);
      font-size: 24px;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>