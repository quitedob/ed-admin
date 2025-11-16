<template>
  <div class="lecturer-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回老师列表</el-button>
    </div>

    <!-- 基本信息卡片 -->
    <div class="info-card">
      <h3>基本信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ lecturerInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ lecturerInfo.teacherId }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ lecturerInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ lecturerInfo.email }}</el-descriptions-item>
        <el-descriptions-item label="入职时间">{{ formatDate(lecturerInfo.joinDate) }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="getStatusTagType(lecturerInfo.status)">
            {{ getStatusLabel(lecturerInfo.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 负责班级列表 -->
    <div class="classes-card">
      <div class="card-header">
        <h3>负责班级（{{ lecturerInfo.authorizedClasses?.length || 0 }}个）</h3>
        <div class="actions">
          <el-button type="primary" size="small" @click="handleAuthorizeClass">
            添加授权
          </el-button>
          <el-button type="danger" size="small" @click="handleRemoveAuthorize" :disabled="selectedClasses.length === 0">
            移除授权
          </el-button>
        </div>
      </div>

      <el-table
        :data="lecturerInfo.authorizedClasses || []"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="班级名称" prop="name" />
        <el-table-column label="学生数" width="100" align="center">
          <template #default="scope">
            {{ scope.row.studentCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="授课科目" width="150">
          <template #default="scope">
            {{ scope.row.subject || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!lecturerInfo.authorizedClasses || lecturerInfo.authorizedClasses.length === 0" description="暂无负责班级" />
    </div>

    <!-- 授权班级对话框 -->
    <AuthorizeDialog
      v-model="authorizeDialogVisible"
      :teacher-id="lecturerInfo.id"
      :authorized-classes="lecturerInfo.authorizedClasses || []"
      @update:authorized-classes="handleAuthorizeUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import AuthorizeDialog from '../components/AuthorizeDialog.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const lecturerInfo = ref({})
const authorizeDialogVisible = ref(false)
const selectedClasses = ref([])

// 模拟老师数据
const allLecturers = [
  {
    id: 'lecturer_001',
    name: '王老师',
    teacherId: 'T001',
    phone: '13800138000',
    email: 'wang@example.com',
    joinDate: '2020-09-01',
    status: 'active',
    authorizedClasses: [
      { id: 'cls_001', name: '一年级一班', studentCount: 30, subject: '语文' },
      { id: 'cls_002', name: '五年级二班', studentCount: 28, subject: '数学' }
    ]
  },
  {
    id: 'lecturer_002',
    name: '李老师',
    teacherId: 'T002',
    phone: '13900139000',
    email: 'li@example.com',
    joinDate: '2021-09-01',
    status: 'active',
    authorizedClasses: [
      { id: 'cls_003', name: '初二一班', studentCount: 25, subject: '英语' }
    ]
  },
  {
    id: 'lecturer_003',
    name: '张老师',
    teacherId: 'T003',
    phone: '13700137000',
    email: 'zhang@example.com',
    joinDate: '2019-09-01',
    status: 'active',
    authorizedClasses: [
      { id: 'cls_004', name: '高三三班', studentCount: 22, subject: '物理' },
      { id: 'cls_001', name: '一年级一班', studentCount: 30, subject: '体育' }
    ]
  }
]

// 方法
const goBack = () => {
  router.back()
}

const handleAuthorizeClass = () => {
  authorizeDialogVisible.value = true
}

const handleAuthorizeUpdate = (authorizedClasses) => {
  lecturerInfo.value.authorizedClasses = authorizedClasses
  ElMessage.success('班级授权已更新')
  authorizeDialogVisible.value = false
}

const handleRemoveAuthorize = () => {
  if (selectedClasses.value.length === 0) {
    ElMessage.warning('请先选择要移除的班级')
    return
  }

  ElMessageBox.confirm(
    `确定要移除选中的 ${selectedClasses.value.length} 个班级吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const selectedIds = selectedClasses.value.map(c => c.id)
    lecturerInfo.value.authorizedClasses = lecturerInfo.value.authorizedClasses.filter(
      c => !selectedIds.includes(c.id)
    )
    selectedClasses.value = []
    ElMessage.success('班级授权已移除')
  })
}

const handleSelectionChange = (selection) => {
  selectedClasses.value = selection
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getStatusLabel = (status) => {
  const map = {
    active: '活跃',
    inactive: '停用'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    active: 'success',
    inactive: 'info'
  }
  return map[status] || ''
}

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/users/lecturer/detail/index.vue`)
  const lecturerId = route.params.id
  const lecturer = allLecturers.find(l => l.id === lecturerId)
  if (lecturer) {
    lecturerInfo.value = { ...lecturer }
  } else {
    ElMessage.error('老师信息未找到')
    router.back()
  }
})
</script>

<style lang="scss" scoped>
.lecturer-detail-container {
  padding: 24px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.back-button {
  margin-bottom: 20px;
}

.info-card,
.classes-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-base);

  h3 {
    margin: 0 0 16px 0;
    color: var(--color-text-primary);
    font-size: 16px;
    font-weight: 600;
  }
}

.classes-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
