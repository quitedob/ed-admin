<template>
  <div class="user-basic-info">
    <el-card shadow="never">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学号">
          {{ userData?.studentId }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ userData?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userData?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userData?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(userData?.status)">
            {{ getStatusLabel(userData?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatDateTime(userData?.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
const props = defineProps({
  userData: {
    type: Object,
    required: true
  }
})

const getStatusLabel = (status) => {
  const map = {
    new: '新生',
    studying: '在读',
    suspended: '停课',
    archived: '封存',
    finished: '结课',
    refunded: '退费'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    new: '',
    studying: 'success',
    suspended: 'warning',
    archived: 'info',
    finished: 'warning',
    refunded: 'danger'
  }
  return map[status] || ''
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}
</script>