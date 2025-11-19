<template>
  <div class="material-management">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>素材管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <div class="main-container">
        <!-- 左侧分组树 -->
        <div class="sidebar">
          <ResourceGroupTree
            ref="groupTreeRef"
            @group-select="handleGroupSelect"
            @group-change="handleGroupChange"
          />
        </div>

        <!-- 右侧内容区 -->
        <div class="content">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="searchText"
                placeholder="搜索素材名称..."
                clearable
                style="width: 250px"
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
                <el-option label="音频" value="audio" />
                <el-option label="电子书" value="ebook" />
              </el-select>
            </div>

            <div class="toolbar-right">
              <el-button type="primary" @click="handleUpload">
                <el-icon><Plus /></el-icon>
                上传素材
              </el-button>
              <el-button @click="handleBatchDelete" :disabled="selectedResources.length === 0">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </div>

          <!-- 资源表格 -->
          <el-table
            ref="tableRef"
            :data="filteredResources"
            stripe
            style="width: 100%; margin-top: 16px"
            @selection-change="handleSelectionChange"
            v-loading="loading"
          >
            <el-table-column type="selection" width="50" />

            <el-table-column label="缩略图" width="80">
              <template #default="{ row }">
                <div class="thumbnail">
                  <el-image
                    v-if="row.type === 'image'"
                    :src="row.url"
                    fit="cover"
                    style="width: 60px; height: 60px; border-radius: 4px"
                    :preview-src-list="[row.url]"
                  />
                  <div v-else class="type-icon">
                    <el-icon v-if="row.type === 'video'"><VideoPlay /></el-icon>
                    <el-icon v-else-if="row.type === 'audio'"><Headset /></el-icon>
                    <el-icon v-else-if="row.type === 'ebook'"><Document /></el-icon>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="名称" prop="name" min-width="150" show-overflow-tooltip />

            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>

            <el-table-column label="所属分组" width="150" show-overflow-tooltip>
              <template #default="{ row }">
                {{ getGroupName(row.groupId) }}
              </template>
            </el-table-column>

            <el-table-column label="上传时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleDownload(row)">
                  下载
                </el-button>
                <el-button link type="primary" size="small" @click="handleRename(row)">
                  重命名
                </el-button>
                <el-button link type="primary" size="small" @click="handleMove(row)">
                  移动
                </el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :total="filteredResources.length"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; text-align: right"
          />
        </div>
      </div>
    </el-card>

    <!-- 上传对话框 -->
    <ResourceUploadDialog
      v-model="uploadDialogVisible"
      :groups="allGroups"
      @success="handleUploadSuccess"
    />

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名素材"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="renameForm"
        :rules="renameRules"
        ref="renameFormRef"
        label-width="80px"
      >
        <el-form-item label="新名称" prop="name">
          <el-input
            v-model="renameForm.name"
            placeholder="请输入新名称"
            @keyup.enter="handleSaveRename"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRename">确定</el-button>
      </template>
    </el-dialog>

    <!-- 移动分组对话框 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动到分组"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="moveForm"
        :rules="moveRules"
        ref="moveFormRef"
        label-width="80px"
      >
        <el-form-item label="目标分组" prop="groupId">
          <el-select
            v-model="moveForm.groupId"
            placeholder="请选择目标分组"
          >
            <el-option-group
              v-for="group in groupOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMove">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Search,
  VideoPlay,
  Document,
  Headset
} from '@element-plus/icons-vue'
import ResourceGroupTree from './components/ResourceGroupTree.vue'
import ResourceUploadDialog from './components/ResourceUploadDialog.vue'
import { courseApi } from '@/api/course'

const groupTreeRef = ref(null)
const tableRef = ref(null)
const renameFormRef = ref(null)
const moveFormRef = ref(null)

const searchText = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

const uploadDialogVisible = ref(false)
const renameDialogVisible = ref(false)
const moveDialogVisible = ref(false)

const selectedGroupId = ref('')
const selectedResources = ref([])
const currentResource = ref(null)

const resources = ref([])
const allGroups = ref([])

const renameForm = reactive({
  name: ''
})

const renameRules = {
  name: [
    { required: true, message: '请输入新名称', trigger: 'blur' }
  ]
}

const moveForm = reactive({
  groupId: ''
})

const moveRules = {
  groupId: [
    { required: true, message: '请选择目标分组', trigger: 'change' }
  ]
}

// 构建分组选项
const groupOptions = computed(() => {
  const sceneMap = {
    course: '课程素材',
    question: '题库素材',
    misc: '公共素材'
  }

  const options = {}

  allGroups.value.forEach(group => {
    const scene = group.scene || 'misc'
    const sceneLabel = sceneMap[scene]

    if (!options[sceneLabel]) {
      options[sceneLabel] = {
        label: sceneLabel,
        options: []
      }
    }

    options[sceneLabel].options.push(group)
  })

  return Object.values(options)
})

// 过滤资源
const filteredResources = computed(() => {
  let result = resources.value

  // 按分组过滤
  if (selectedGroupId.value) {
    result = result.filter(r => r.groupId === selectedGroupId.value)
  }

  // 按名称搜索
  if (searchText.value) {
    result = result.filter(r =>
      r.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  // 按类型过滤
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  return result.slice(start, end)
})

// 加载资源列表
const loadResources = async () => {
  try {
    loading.value = true
    const response = await courseApi.resourcePage({}, 1, 1000)
    resources.value = response.data || []
  } catch (error) {
    console.error('加载资源失败:', error)
    // 使用模拟数据
    resources.value = [
      {
        id: 'res_1',
        name: '教学背景图1',
        type: 'image',
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 1%3C/text%3E%3C/svg%3E',
        size: 2048576,
        groupId: 'group_1',
        createdAt: new Date('2024-11-15')
      },
      {
        id: 'res_2',
        name: '教学视频1',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        size: 10485760,
        groupId: 'group_1',
        createdAt: new Date('2024-11-14')
      },
      {
        id: 'res_3',
        name: '讲座音频',
        type: 'audio',
        url: 'https://example.com/audio.mp3',
        size: 5242880,
        groupId: 'group_3',
        createdAt: new Date('2024-11-13')
      }
    ]
  } finally {
    loading.value = false
  }
}

// 加载分组列表
const loadGroups = async () => {
  try {
    const response = await courseApi.resourceGroupList()
    allGroups.value = response.data || []
  } catch (error) {
    console.error('加载分组失败:', error)
    // 使用模拟数据
    allGroups.value = [
      { id: 'group_1', name: '课程A素材', scene: 'course' },
      { id: 'group_2', name: '课程B素材', scene: 'course' },
      { id: 'group_3', name: '题库公共素材', scene: 'question' },
      { id: 'group_4', name: '其他素材', scene: 'misc' }
    ]
  }
}

const getGroupName = (groupId) => {
  const group = allGroups.value.find(g => g.id === groupId)
  return group?.name || '-'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const getTypeTagType = (type) => {
  const map = {
    image: 'primary',
    video: 'success',
    audio: 'warning',
    ebook: 'info'
  }
  return map[type] || 'primary'
}

const getTypeLabel = (type) => {
  const map = {
    image: '图片',
    video: '视频',
    audio: '音频',
    ebook: '电子书'
  }
  return map[type] || type
}

const handleGroupSelect = (group) => {
  selectedGroupId.value = group.id
  currentPage.value = 1
}

const handleGroupChange = () => {
  loadResources()
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleUploadSuccess = () => {
  loadResources()
}

const handleSelectionChange = (selection) => {
  selectedResources.value = selection
}

const handleDownload = (resource) => {
  const link = document.createElement('a')
  link.href = resource.url
  link.download = resource.name
  link.click()
  ElMessage.success('开始下载')
}

const handleRename = (resource) => {
  currentResource.value = resource
  renameForm.name = resource.name
  renameDialogVisible.value = true
}

const handleSaveRename = async () => {
  try {
    await renameFormRef.value.validate()

    await courseApi.resourceEdit({
      id: currentResource.value.id,
      name: renameForm.name
    })

    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
    await loadResources()
  } catch (error) {
    console.error('重命名失败:', error)
  }
}

const handleMove = (resource) => {
  currentResource.value = resource
  moveForm.groupId = resource.groupId
  moveDialogVisible.value = true
}

const handleSaveMove = async () => {
  try {
    await moveFormRef.value.validate()

    await courseApi.resourceEdit({
      id: currentResource.value.id,
      groupId: moveForm.groupId
    })

    ElMessage.success('移动成功')
    moveDialogVisible.value = false
    await loadResources()
  } catch (error) {
    console.error('移动失败:', error)
  }
}

const handleDelete = (resource) => {
  ElMessageBox.confirm(
    `确定删除素材 "${resource.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await courseApi.resourceDelete({ id: resource.id })
      ElMessage.success('删除成功')
      await loadResources()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedResources.value.length === 0) {
    ElMessage.warning('请先选择要删除的素材')
    return
  }

  ElMessageBox.confirm(
    `确定删除选中的 ${selectedResources.value.length} 个素材吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await courseApi.resourceBatchDelete({
        ids: selectedResources.value.map(r => r.id)
      })
      ElMessage.success('批量删除成功')
      selectedResources.value = []
      await loadResources()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadResources()
  loadGroups()
})
</script>

<style scoped>
.material-management {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.main-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 200px);
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  padding-right: 16px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 4px;

  .type-icon {
    font-size: 28px;
    color: #909399;
  }
}

:deep(.el-table) {
  flex: 1;
  overflow-y: auto;
}
</style>
