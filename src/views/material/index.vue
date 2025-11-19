<template>
  <div class="material-management">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>素材管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 工具栏 -->
      <template #header>
        <div class="card-header">
          <span>素材管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              上传素材
            </el-button>
            <el-button @click="handleImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索素材名称..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterType"
          placeholder="筛选类型"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="全部" value="" />
          <el-option label="图片" value="image" />
          <el-option label="视频" value="video" />
        </el-select>

        <el-select
          v-model="filterStatus"
          placeholder="筛选状态"
          clearable
          style="width: 150px; margin-left: 12px"
        >
          <el-option label="全部" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section" style="margin-top: 20px; margin-bottom: 20px">
        <div class="stat-card">
          <div class="stat-icon total">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalMaterials }}</div>
            <div class="stat-label">总素材数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon image">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.image }}</div>
            <div class="stat-label">图片素材</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon video">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.video }}</div>
            <div class="stat-label">视频素材</div>
          </div>
        </div>
      </div>

      <!-- 素材卡片列表 -->
      <div class="material-grid">
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col
            v-for="material in filteredMaterials"
            :key="material.id"
            :span="6"
          >
            <el-card class="material-card" shadow="hover">
              <div class="card-preview">
                <div v-if="material.type === 'image'" class="image-preview">
                  <el-image
                    :src="material.thumbnailUrl || material.fileUrl"
                    fit="cover"
                    class="preview-image"
                  />
                  <div class="preview-overlay">
                    <el-button link type="primary" @click="handlePreview(material)">
                      <el-icon><ZoomIn /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div v-else-if="material.type === 'video'" class="video-preview">
                  <video
                    :src="material.fileUrl"
                    class="preview-video"
                    muted
                  />
                  <div class="play-overlay">
                    <el-icon class="play-icon"><VideoPlay /></el-icon>
                  </div>
                </div>
              </div>

              <div class="card-content">
                <h4 class="material-title">{{ material.name }}</h4>
                <p class="material-desc">{{ material.description }}</p>
                <div class="material-meta">
                  <el-tag size="small" :type="getTypeTagType(material.type)">
                    {{ getTypeLabel(material.type) }}
                  </el-tag>
                  <span class="material-size">{{ formatFileSize(material.size) }}</span>
                </div>
                <div class="material-status">
                  <el-tag
                    size="small"
                    :type="material.status === 'published' ? 'success' : 'info'"
                  >
                    {{ getStatusLabel(material.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="card-actions">
                <el-button link type="primary" size="small" @click="handleEdit(material)">
                  编辑
                </el-button>
                <el-button link type="primary" size="small" @click="handleCopy(material)">
                  复制
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(material)">
                  删除
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="filteredMaterials.length === 0" description="暂无素材" style="margin-top: 20px" />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36]"
        :total="filteredMaterials.length"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 素材编辑对话框 -->
    <MaterialDialog
      v-model="materialDialogVisible"
      :material="currentMaterial"
      @save="handleSaveMaterial"
    />

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="80%"
      append-to-body
    >
      <div v-if="previewMaterial" class="preview-dialog-content">
        <el-image
          :src="previewMaterial.fileUrl"
          fit="contain"
          style="max-width: 100%; max-height: 600px;"
          :preview-src-list="[previewMaterial.fileUrl]"
        />
        <div class="preview-info" style="margin-top: 20px">
          <p><strong>名称:</strong> {{ previewMaterial.name }}</p>
          <p><strong>描述:</strong> {{ previewMaterial.description }}</p>
          <p><strong>大小:</strong> {{ formatFileSize(previewMaterial.size) }}</p>
          <p><strong>上传时间:</strong> {{ formatDate(previewMaterial.createTime) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Search, Picture, VideoPlay, ZoomIn, Folder } from '@element-plus/icons-vue'
import MaterialDialog from './components/MaterialDialog.vue'

const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const materialDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const currentMaterial = ref(null)
const previewMaterial = ref(null)

const materials = ref([
  {
    id: 'mat_001',
    name: '教学背景图1',
    type: 'image',
    description: '高质量教学背景图片',
    fileUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 1%3C/text%3E%3C/svg%3E',
    thumbnailUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 1%3C/text%3E%3C/svg%3E',
    size: 2048576,
    status: 'published',
    createTime: new Date('2024-11-15T10:00:00')
  },
  {
    id: 'mat_002',
    name: '教学视频1',
    type: 'video',
    description: '高清教学视频',
    fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    size: 10485760,
    status: 'published',
    createTime: new Date('2024-11-14T14:00:00')
  },
  {
    id: 'mat_003',
    name: '教学背景图2',
    type: 'image',
    description: '蓝色教学背景',
    fileUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e3f2fd" width="400" height="300"/%3E%3Ctext fill="%231976d2" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 2%3C/text%3E%3C/svg%3E',
    thumbnailUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e3f2fd" width="200" height="150"/%3E%3Ctext fill="%231976d2" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 2%3C/text%3E%3C/svg%3E',
    size: 1572864,
    status: 'draft',
    createTime: new Date('2024-11-13T09:30:00')
  }
])

const stats = computed(() => {
  return {
    image: materials.value.filter(m => m.type === 'image').length,
    video: materials.value.filter(m => m.type === 'video').length
  }
})

const totalMaterials = computed(() => materials.value.length)

const filteredMaterials = computed(() => {
  let result = materials.value

  if (searchText.value) {
    result = result.filter(m =>
      m.name.includes(searchText.value) ||
      m.description.includes(searchText.value)
    )
  }

  if (filterType.value) {
    result = result.filter(m => m.type === filterType.value)
  }

  if (filterStatus.value) {
    result = result.filter(m => m.status === filterStatus.value)
  }

  return result.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getTypeTagType = (type) => {
  const map = {
    image: 'primary',
    video: 'success'
  }
  return map[type] || 'primary'
}

const getTypeLabel = (type) => {
  const map = {
    image: '图片',
    video: '视频'
  }
  return map[type] || type
}

const getStatusLabel = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿'
  }
  return map[status] || status
}

const handleCreate = () => {
  currentMaterial.value = null
  materialDialogVisible.value = true
}

const handleEdit = (material) => {
  currentMaterial.value = { ...material }
  materialDialogVisible.value = true
}

const handlePreview = (material) => {
  previewMaterial.value = material
  previewDialogVisible.value = true
}

const handleCopy = (material) => {
  const newMaterial = {
    ...material,
    id: `mat_${Date.now()}`,
    name: `${material.name}(副本)`,
    status: 'draft'
  }
  materials.value.push(newMaterial)
  ElMessage.success('素材已复制')
}

const handleDelete = (material) => {
  ElMessageBox.confirm(
    `确定删除素材 "${material.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = materials.value.findIndex(m => m.id === material.id)
    if (index > -1) {
      materials.value.splice(index, 1)
    }
    ElMessage.success('素材已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleSaveMaterial = (data) => {
  if (currentMaterial.value) {
    const index = materials.value.findIndex(m => m.id === currentMaterial.value.id)
    if (index > -1) {
      materials.value[index] = { ...materials.value[index], ...data }
    }
    ElMessage.success('素材已更新')
  } else {
    materials.value.push({
      id: `mat_${Date.now()}`,
      ...data,
      createTime: new Date()
    })
    ElMessage.success('素材已上传')
  }
  materialDialogVisible.value = false
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleExport = () => {
  ElMessage.success('已导出素材列表')
}

onMounted(() => {
  console.log('Material management page loaded')
})
</script>

<style scoped>
.material-management {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  background: #eef2f8;
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 28px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.image {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.video {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.material-grid {
  margin-top: 20px;
}

.material-card {
  height: 100%;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.material-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-preview {
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 12px;
}

.image-preview,
.video-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  color: white;
  font-size: 24px;
}

.card-content {
  flex: 1;
  padding: 12px 0;
}

.material-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-desc {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.material-size {
  font-size: 12px;
  color: #999;
}

.material-status {
  text-align: right;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-actions .el-button {
  font-size: 12px;
  padding: 4px 8px;
}

.preview-dialog-content {
  text-align: center;
}

.preview-info {
  text-align: left;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview-info p {
  margin: 8px 0;
  font-size: 14px;
}
</style>
