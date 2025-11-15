<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>成绩管理</span>
          <div class="header-actions">
            <el-button type="success" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出成绩
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索学生姓名、学号..."
          clearable
          @keyup.enter="handleQuery"
          class="search-input"
        >
          <template #append>
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="gradeList">
        <el-table-column label="学生姓名" align="center" prop="studentName" />
        <el-table-column label="学号" align="center" prop="studentId" />
        <el-table-column label="考试标题" align="center" prop="examTitle" />
        <el-table-column label="得分" align="center" width="100">
          <template #default="scope">
            <span :style="{ color: getScoreColor(scope.row.score, scope.row.totalScore) }">
              {{ scope.row.score }} / {{ scope.row.totalScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="完成度" align="center" width="100">
          <template #default="scope">
            <span>{{ scope.row.answeredQuestions }}/{{ scope.row.totalQuestions }}题</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" align="center" width="100">
          <template #default="scope">
            <span>{{ scope.row.duration }}分钟</span>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" align="center" prop="submitTime" width="180" />
        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageCurrent"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup name="ExamGrades">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const gradeList = ref([])
const total = ref(0)

const queryParams = ref({
  pageCurrent: 1,
  pageSize: 10,
  keyword: ''
})

const getList = () => {
  loading.value = true
  setTimeout(() => {
    gradeList.value = [
      {
        id: 1,
        studentName: '张三',
        studentId: '2021001',
        examTitle: 'Python期中考试',
        score: 92,
        totalScore: 100,
        answeredQuestions: 8,
        totalQuestions: 10,
        duration: 105,
        submitTime: '2024-01-25 10:45:00'
      },
      {
        id: 2,
        studentName: '李四',
        studentId: '2021002',
        examTitle: 'Python期中考试',
        score: 78,
        totalScore: 100,
        answeredQuestions: 9,
        totalQuestions: 10,
        duration: 118,
        submitTime: '2024-01-25 10:58:00'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
}

const handleQuery = () => {
  queryParams.value.pageCurrent = 1
  getList()
}

const handleView = (row) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出成绩功能开发中...')
}

const getScoreColor = (score, totalScore) => {
  const percentage = (score / totalScore) * 100
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  max-width: 600px;
}
</style>
