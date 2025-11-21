<template>
  <el-drawer
    id="tag-manager-drawer"
    v-model="visible"
    title="标签管理"
    size="800px"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div id="tag-manager-container" class="tag-manager-drawer">
      <el-alert
        title="标签说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <p style="margin: 0; line-height: 1.6;">
          标签采用扁平结构，无层级关系。创建标签时只需输入名称，系统会自动查重（存在则直接选用）、分配颜色。
        </p>
      </el-alert>

      <!-- 内容区 -->
      <div id="right-content" class="right-content">
        <!-- 工具栏 -->
        <div id="toolbar" class="toolbar">
          <el-button id="add-tag-btn" type="primary" @click="handleAddTag">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
          <el-input
            id="tag-search-input"
            v-model="searchText"
            placeholder="搜索标签名称..."
            clearable
            style="width: 250px; margin-left: 12px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select id="sort-type-select" v-model="sortType" placeholder="排序" style="width: 150px; margin-left: 12px">
            <el-option label="按名称" value="name" />
            <el-option label="按使用频率" value="usage" />
            <el-option label="按创建时间" value="time" />
          </el-select>
        </div>

        <!-- 统计信息 -->
        <div id="stats-section" class="stats-section">
          <div id="total-tags-stat" class="stat-item">
            <span class="stat-label">总标签数:</span>
            <span class="stat-value">{{ allTags.length }}</span>
          </div>
          <div id="used-tags-stat" class="stat-item">
            <span class="stat-label">已使用:</span>
            <span class="stat-value">{{ usedTagsCount }}</span>
          </div>
          <div id="unused-tags-stat" class="stat-item">
            <span class="stat-label">未使用:</span>
            <span class="stat-value">{{ unusedTagsCount }}</span>
          </div>
        </div>

        <!-- 标签表格 -->
        <el-table id="tags-table" :data="paginatedTags" stripe style="width: 100%; margin-top: 16px">
          <el-table-column type="selection" width="55" />
          <el-table-column label="标签名称" min-width="200">
            <template #default="{ row, $index }">
              <el-tag :id="`tag-name-${$index}`" :color="row.color" style="color: white; font-weight: 500;">
                {{ row.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="颜色" width="120">
            <template #default="{ row, $index }">
              <div :id="`color-display-${$index}`" style="display: flex; align-items: center; gap: 8px;">
                <div :style="{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: row.color }"></div>
                <span style="font-size: 12px; color: #909399;">{{ row.color }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="usageCount" label="使用次数" width="120" align="center">
            <template #default="{ row, $index }">
              <el-tag :id="`usage-tag-${$index}`" type="info" size="small">{{ row.usageCount }}道题</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="120" align="center">
            <template #default="{ row, $index }">
              <span :id="`created-time-${$index}`" style="font-size: 12px; color: #909399;">{{ row.createdAt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row, $index }">
              <el-button :id="`edit-tag-btn-${$index}`" link type="primary" size="small" @click="handleEditTag(row)">
                编辑
              </el-button>
              <el-button
                :id="`delete-tag-btn-${$index}`"
                link
                type="danger"
                size="small"
                @click="handleDeleteTag(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          id="tag-pagination"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredTags.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 16px; text-align: right"
        />
      </div>
    </div>

    <!-- 标签编辑对话框 -->
    <el-dialog
      id="tag-edit-dialog"
      v-model="tagFormVisible"
      :title="isEditMode ? '编辑标签' : '新建标签'"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-alert
        v-if="!isEditMode"
        title="自动功能"
        type="success"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <p style="margin: 0; font-size: 13px; line-height: 1.6;">
          ✓ 自动查重：如果标签名称已存在，将直接使用现有标签<br>
          ✓ 自动分配颜色：系统会为新标签自动分配颜色
        </p>
      </el-alert>

      <el-form id="tag-form" ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="80px">
        <el-form-item id="tag-name-item" label="标签名称" prop="name">
          <el-input 
            id="tag-name-input" 
            v-model="tagForm.name" 
            placeholder="请输入标签名称" 
            @blur="checkDuplicateTag"
          />
          <div v-if="duplicateWarning" style="color: #e6a23c; font-size: 12px; margin-top: 4px;">
            ⚠️ 该标签已存在，保存后将使用现有标签
          </div>
        </el-form-item>
        <el-form-item id="tag-color-item" label="颜色" prop="color">
          <el-color-picker id="tag-color-picker" v-model="tagForm.color" />
          <span id="tag-color-display" style="margin-left: 12px; font-size: 13px; color: #909399;">{{ tagForm.color }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button id="tag-form-cancel" @click="tagFormVisible = false">取消</el-button>
        <el-button id="tag-form-save" type="primary" @click="handleSaveTag">保存</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const tagFormRef = ref(null)

const searchText = ref('')
const sortType = ref('usage')
const currentPage = ref(1)
const pageSize = ref(10)
const tagFormVisible = ref(false)
const isEditMode = ref(false)
const duplicateWarning = ref(false)

// 标签颜色池
const tagColors = [
  '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399',
  '#00d2d3', '#fa6400', '#722ed1', '#eb2f96', '#52c41a',
  '#1890ff', '#faad14', '#f5222d', '#13c2c2', '#2f54eb'
]

// 标签数据（扁平结构）
const tags = ref([
  {
    id: 'tag_1',
    name: '面向对象',
    color: '#409EFF',
    usageCount: 15,
    createdAt: '2024-01-01'
  },
  {
    id: 'tag_2',
    name: 'Java基础',
    color: '#67C23A',
    usageCount: 8,
    createdAt: '2024-01-02'
  },
  {
    id: 'tag_3',
    name: '数据结构',
    color: '#E6A23C',
    usageCount: 5,
    createdAt: '2024-01-03'
  },
  {
    id: 'tag_4',
    name: '算法',
    color: '#f56c6c',
    usageCount: 12,
    createdAt: '2024-01-04'
  },
  {
    id: 'tag_5',
    name: '数组操作',
    color: '#909399',
    usageCount: 0,
    createdAt: '2024-01-05'
  }
])

const tagForm = ref({
  id: '',
  name: '',
  color: '#409EFF',
  usageCount: 0
})

const tagRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

// 自动分配标签颜色
const getAutoTagColor = () => {
  const usedColors = tags.value.map(t => t.color)
  const availableColors = tagColors.filter(c => !usedColors.includes(c))
  if (availableColors.length > 0) {
    return availableColors[0]
  }
  return tagColors[Math.floor(Math.random() * tagColors.length)]
}

// 所有标签
const allTags = computed(() => tags.value)

// 已使用标签数
const usedTagsCount = computed(() => {
  return tags.value.filter(t => t.usageCount > 0).length
})

// 未使用标签数
const unusedTagsCount = computed(() => {
  return tags.value.filter(t => t.usageCount === 0).length
})

// 过滤标签
const filteredTags = computed(() => {
  let result = tags.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(t => t.name.includes(searchText.value))
  }

  // 排序
  if (sortType.value === 'name') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortType.value === 'usage') {
    result = [...result].sort((a, b) => b.usageCount - a.usageCount)
  } else if (sortType.value === 'time') {
    result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return result
})

// 分页标签
const paginatedTags = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTags.value.slice(start, end)
})

// 检查标签重复
const checkDuplicateTag = () => {
  if (!tagForm.value.name.trim()) {
    duplicateWarning.value = false
    return
  }
  
  const exists = tags.value.some(t => 
    t.name.trim().toLowerCase() === tagForm.value.name.trim().toLowerCase() && 
    t.id !== tagForm.value.id
  )
  duplicateWarning.value = exists
}

const handleAddTag = () => {
  isEditMode.value = false
  duplicateWarning.value = false
  tagForm.value = {
    id: '',
    name: '',
    color: getAutoTagColor(),
    usageCount: 0
  }
  tagFormVisible.value = true
}

const handleEditTag = (tag) => {
  isEditMode.value = true
  duplicateWarning.value = false
  tagForm.value = { ...tag }
  tagFormVisible.value = true
}

const handleSaveTag = async () => {
  try {
    await tagFormRef.value.validate()

    const trimmedName = tagForm.value.name.trim()
    
    // 检查是否重复（编辑时排除自己）
    const existingTag = tags.value.find(t => 
      t.name.trim().toLowerCase() === trimmedName.toLowerCase() && 
      t.id !== tagForm.value.id
    )

    if (existingTag && !isEditMode.value) {
      ElMessage.warning(`标签"${trimmedName}"已存在，将使用现有标签`)
      tagFormVisible.value = false
      return
    }

    if (isEditMode.value) {
      const index = tags.value.findIndex(t => t.id === tagForm.value.id)
      if (index > -1) {
        tags.value[index] = { 
          ...tagForm.value,
          name: trimmedName
        }
      }
      ElMessage.success('标签更新成功')
    } else {
      const newTag = {
        ...tagForm.value,
        id: `tag_${Date.now()}`,
        name: trimmedName,
        usageCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      tags.value.push(newTag)
      ElMessage.success(`标签"${trimmedName}"创建成功`)
    }
    tagFormVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleDeleteTag = (tag) => {
  const message = tag.usageCount > 0
    ? `该标签已被 ${tag.usageCount} 道题目使用，删除后这些题目将失去该标签。确定要删除吗？`
    : `确定要删除标签"${tag.name}"吗？`

  ElMessageBox.confirm(message, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index > -1) {
      tags.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleVisibleChange = (val) => {
  if (!val) {
    searchText.value = ''
    currentPage.value = 1
  }
}

defineExpose({
  tags
})
</script>

<style lang="scss" scoped>
.tag-manager-drawer {
  height: 100%;
}

/* 内容区 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stats-section {
    display: flex;
    gap: 24px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;

      .stat-label {
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .stat-value {
        color: var(--color-primary);
        font-weight: 600;
        font-size: 16px;
      }
    }
  }

  .el-table {
    flex: 1;
    overflow-y: auto;
  }

  .el-pagination {
    margin-top: 16px;
    text-align: right;
  }
}
</style>
