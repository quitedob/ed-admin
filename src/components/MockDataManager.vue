<template>
  <div class="mock-data-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>模拟数据管理</span>
          <el-tag :type="initialized ? 'success' : 'info'">
            {{ initialized ? '已初始化' : '未初始化' }}
          </el-tag>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-descriptions :column="3" border>
        <el-descriptions-item label="题库数量">
          {{ statistics.totalQuestionBanks }}
        </el-descriptions-item>
        <el-descriptions-item label="题目数量">
          {{ statistics.totalQuestions }}
        </el-descriptions-item>
        <el-descriptions-item label="班级数量">
          {{ statistics.totalClasses }}
        </el-descriptions-item>
        <el-descriptions-item label="学生数量">
          {{ statistics.totalStudents }}
        </el-descriptions-item>
        <el-descriptions-item label="作业数量">
          {{ statistics.totalHomeworks }}
        </el-descriptions-item>
        <el-descriptions-item label="考试数量">
          {{ statistics.totalExams }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 存储信息 -->
      <el-divider />
      <div v-if="storageInfo" class="storage-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="存储状态">
            <el-tag :type="storageInfo.exists ? 'success' : 'warning'">
              {{ storageInfo.exists ? '已存储' : '未存储' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="存储大小">
            {{ storageInfo.sizeKB }} KB
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            {{ storageInfo.version || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="保存时间">
            {{ formatTime(storageInfo.savedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <el-divider />
      <div class="actions">
        <el-space wrap>
          <el-button 
            type="primary" 
            :icon="Refresh" 
            @click="handleInitialize"
            :disabled="initialized"
          >
            初始化数据
          </el-button>
          
          <el-button 
            type="success" 
            :icon="Check" 
            @click="handleSave"
          >
            保存数据
          </el-button>
          
          <el-button 
            type="warning" 
            :icon="RefreshRight" 
            @click="handleReset"
          >
            重置数据
          </el-button>
          
          <el-button 
            type="danger" 
            :icon="Delete" 
            @click="handleClear"
          >
            清除数据
          </el-button>
          
          <el-button 
            type="info" 
            :icon="Download" 
            @click="handleExport"
          >
            导出数据
          </el-button>
          
          <el-upload
            :show-file-list="false"
            :before-upload="handleImport"
            accept=".json"
          >
            <el-button type="info" :icon="Upload">
              导入数据
            </el-button>
          </el-upload>
        </el-space>
      </div>
    </el-card>

    <!-- 数据预览 -->
    <el-card class="preview-card">
      <template #header>
        <span>数据预览</span>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="题库" name="questionBanks">
          <el-table :data="questionBanks" stripe>
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="totalQuestions" label="题目数" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="班级" name="classes">
          <el-table :data="classes" stripe>
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="headTeacherName" label="班主任" width="100" />
            <el-table-column prop="studentCount" label="学生数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="学生" name="students">
          <el-table :data="students.slice(0, 10)" stripe>
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column label="班级" width="150">
              <template #default="{ row }">
                {{ row.classes[0]?.name || 'N/A' }}
              </template>
            </el-table-column>
          </el-table>
          <div class="table-footer">
            显示前10条，共 {{ students.length }} 条
          </div>
        </el-tab-pane>

        <el-tab-pane label="作业" name="homeworks">
          <el-table :data="homeworks" stripe>
            <el-table-column prop="id" label="ID" width="150" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="totalScore" label="总分" width="80" />
            <el-table-column prop="submitCount" label="提交数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="考试" name="exams">
          <el-table :data="exams" stripe>
            <el-table-column prop="id" label="ID" width="150" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="totalScore" label="总分" width="80" />
            <el-table-column prop="participantCount" label="参与人数" width="100" />
            <el-table-column prop="averageScore" label="平均分" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMockStore } from '@/stores/mockStore'
import { 
  getStorageInfo, 
  exportMockData, 
  importMockData 
} from '@/utils/mockStorage'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Check,
  RefreshRight,
  Delete,
  Download,
  Upload
} from '@element-plus/icons-vue'

const mockStore = useMockStore()
const activeTab = ref('questionBanks')
const storageInfo = ref(null)

// 计算属性
const initialized = computed(() => mockStore.initialized)
const statistics = computed(() => mockStore.statistics)
const questionBanks = computed(() => mockStore.questionBanks)
const classes = computed(() => mockStore.classes)
const students = computed(() => mockStore.students)
const homeworks = computed(() => mockStore.homeworks)
const exams = computed(() => mockStore.exams)

// 初始化
const handleInitialize = () => {
  try {
    mockStore.initialize()
    updateStorageInfo()
    ElMessage.success('数据初始化成功')
  } catch (error) {
    ElMessage.error('数据初始化失败: ' + error.message)
  }
}

// 保存
const handleSave = () => {
  try {
    const success = mockStore.save()
    if (success) {
      updateStorageInfo()
      ElMessage.success('数据保存成功')
    } else {
      ElMessage.error('数据保存失败')
    }
  } catch (error) {
    ElMessage.error('数据保存失败: ' + error.message)
  }
}

// 重置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '重置将清除所有数据并重新生成，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    mockStore.reset()
    updateStorageInfo()
    ElMessage.success('数据重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('数据重置失败: ' + error.message)
    }
  }
}

// 清除
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '清除将删除所有本地存储的数据，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    localStorage.removeItem('edu_system_mock_data_v1')
    updateStorageInfo()
    ElMessage.success('数据清除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('数据清除失败')
    }
  }
}

// 导出
const handleExport = () => {
  try {
    const success = exportMockData()
    if (success) {
      ElMessage.success('数据导出成功')
    } else {
      ElMessage.error('数据导出失败')
    }
  } catch (error) {
    ElMessage.error('数据导出失败: ' + error.message)
  }
}

// 导入
const handleImport = async (file) => {
  try {
    const data = await importMockData(file)
    mockStore.loadData(data)
    updateStorageInfo()
    ElMessage.success('数据导入成功')
  } catch (error) {
    ElMessage.error('数据导入失败: ' + error.message)
  }
  return false // 阻止自动上传
}

// 更新存储信息
const updateStorageInfo = () => {
  storageInfo.value = getStorageInfo()
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return 'N/A'
  return new Date(time).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    published: 'success',
    draft: 'info',
    ended: 'warning',
    ongoing: 'primary'
  }
  return typeMap[status] || 'info'
}

// 组件挂载时更新存储信息
onMounted(() => {
  updateStorageInfo()
})
</script>

<style scoped>
.mock-data-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.storage-info {
  margin-top: 16px;
}

.actions {
  margin-top: 16px;
}

.preview-card {
  margin-top: 20px;
}

.table-footer {
  margin-top: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
