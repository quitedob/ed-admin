<template>
  <el-drawer
    v-model="visible"
    title="标签管理"
    size="90%"
    :close-on-click-modal="false"
    @update:model-value="handleVisibleChange"
  >
    <div class="tag-manager-drawer">
      <!-- 左侧分类树 -->
      <div class="left-sidebar">
        <div class="sidebar-header">
          <h3>标签分类</h3>
          <el-button link type="primary" size="small" @click="handleAddCategory">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>

        <el-tree
          ref="categoryTreeRef"
          :data="categoryTree"
          :props="treeProps"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :highlight-current="true"
          @node-click="handleCategorySelect"
        >
          <template #default="{ node, data }">
            <div class="tree-node-content">
              <span class="node-label">
                <el-icon v-if="data.children?.length"><Folder /></el-icon>
                <el-icon v-else><Document /></el-icon>
                {{ node.label }}
              </span>
              <div class="node-actions" v-if="!data.isRoot">
                <el-button link type="primary" size="small" @click.stop="handleEditCategory(data)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button link type="danger" size="small" @click.stop="handleDeleteCategory(data)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧内容区 -->
      <div class="right-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-button type="primary" @click="handleAddTag">
            <el-icon><Plus /></el-icon>
            新建标签
          </el-button>
          <el-input
            v-model="searchText"
            placeholder="搜索标签..."
            clearable
            style="width: 250px; margin-left: 12px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="sortType" placeholder="排序" style="width: 150px; margin-left: 12px">
            <el-option label="按名称" value="name" />
            <el-option label="按使用频率" value="usage" />
            <el-option label="按创建时间" value="time" />
          </el-select>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">总标签数:</span>
            <span class="stat-value">{{ allTags.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已使用:</span>
            <span class="stat-value">{{ usedTagsCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">未使用:</span>
            <span class="stat-value">{{ unusedTagsCount }}</span>
          </div>
        </div>

        <!-- 标签表格 -->
        <el-table :data="paginatedTags" stripe style="width: 100%; margin-top: 16px">
          <el-table-column type="selection" width="55" />
          <el-table-column label="标签名称" min-width="150">
            <template #default="{ row }">
              <el-tag :color="row.color" style="color: white">
                {{ row.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="分类" width="120">
            <template #default="{ row }">
              <span>{{ getCategoryName(row.categoryId) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="usageCount" label="使用次数" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.usageCount }}道题</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="系统标签" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isSystem" type="success" size="small">是</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditTag(row)">
                编辑
              </el-button>
              <el-button
                v-if="!row.isSystem"
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
      v-model="tagFormVisible"
      :title="isEditMode ? '编辑标签' : '新建标签'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="tagForm.categoryId" placeholder="请选择分类">
            <el-option-group
              v-for="group in categoryOptions"
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
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述（可选）"
          />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="tagForm.color" show-alpha />
          <span style="margin-left: 12px">{{ tagForm.color }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTag">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类编辑对话框 -->
    <el-dialog
      v-model="categoryFormVisible"
      :title="isEditCategoryMode ? '编辑分类' : '新建分类'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类级别" prop="level">
          <el-select v-model="categoryForm.level" placeholder="请选择级别">
            <el-option label="一级分类" value="1" />
            <el-option label="二级分类" value="2" />
            <el-option label="三级分类" value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">保存</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const categoryTreeRef = ref(null)
const tagFormRef = ref(null)
const categoryFormRef = ref(null)

const searchText = ref('')
const sortType = ref('usage')
const currentPage = ref(1)
const pageSize = ref(10)
const tagFormVisible = ref(false)
const categoryFormVisible = ref(false)
const isEditMode = ref(false)
const isEditCategoryMode = ref(false)
const selectedCategoryId = ref('')
const defaultExpandedKeys = ref([])

// 分类数据
const categories = ref([
  {
    id: 'cat_1',
    name: '学科',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat_1_1', name: '数学', level: 2, parentId: 'cat_1' },
      { id: 'cat_1_2', name: '英语', level: 2, parentId: 'cat_1' },
      { id: 'cat_1_3', name: '物理', level: 2, parentId: 'cat_1' }
    ]
  },
  {
    id: 'cat_2',
    name: '知识点',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat_2_1', name: '基础概念', level: 2, parentId: 'cat_2' },
      { id: 'cat_2_2', name: '应用题', level: 2, parentId: 'cat_2' }
    ]
  }
])

// 标签数据
const tags = ref([
  {
    id: 'tag_1',
    name: '面向对象',
    categoryId: 'cat_2_1',
    description: '面向对象编程相关',
    color: '#409EFF',
    usageCount: 15,
    isSystem: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'tag_2',
    name: 'Java基础',
    categoryId: 'cat_2_1',
    description: 'Java基础知识',
    color: '#67C23A',
    usageCount: 8,
    isSystem: true,
    createdAt: '2024-01-02'
  },
  {
    id: 'tag_3',
    name: '数据结构',
    categoryId: 'cat_2_2',
    description: '数据结构相关题目',
    color: '#E6A23C',
    usageCount: 0,
    isSystem: false,
    createdAt: '2024-01-03'
  }
])

const tagForm = ref({
  id: '',
  name: '',
  categoryId: '',
  description: '',
  color: '#409EFF',
  usageCount: 0,
  isSystem: false
})

const categoryForm = ref({
  id: '',
  name: '',
  level: '1'
})

const tagRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择级别', trigger: 'change' }]
}

const treeProps = {
  children: 'children',
  label: 'name'
}

// 构建分类树
const categoryTree = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    children: cat.children || []
  }))
})

// 分类选项
const categoryOptions = computed(() => {
  const options = []
  categories.value.forEach(cat => {
    options.push({
      label: cat.name,
      options: cat.children || []
    })
  })
  return options
})

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

  // 按分类过滤
  if (selectedCategoryId.value) {
    result = result.filter(t => t.categoryId === selectedCategoryId.value)
  }

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(t =>
      t.name.includes(searchText.value) ||
      (t.description && t.description.includes(searchText.value))
    )
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

const getCategoryName = (categoryId) => {
  for (const cat of categories.value) {
    if (cat.id === categoryId) return cat.name
    if (cat.children) {
      const child = cat.children.find(c => c.id === categoryId)
      if (child) return child.name
    }
  }
  return '-'
}

const handleCategorySelect = (data) => {
  if (!data.isRoot) {
    selectedCategoryId.value = data.id
    currentPage.value = 1
  }
}

const handleAddTag = () => {
  isEditMode.value = false
  tagForm.value = {
    id: '',
    name: '',
    categoryId: selectedCategoryId.value || '',
    description: '',
    color: '#409EFF',
    usageCount: 0,
    isSystem: false
  }
  tagFormVisible.value = true
}

const handleEditTag = (tag) => {
  isEditMode.value = true
  tagForm.value = { ...tag }
  tagFormVisible.value = true
}

const handleSaveTag = async () => {
  try {
    await tagFormRef.value.validate()

    if (isEditMode.value) {
      const index = tags.value.findIndex(t => t.id === tagForm.value.id)
      if (index > -1) {
        tags.value[index] = { ...tagForm.value }
      }
      ElMessage.success('标签更新成功')
    } else {
      const newTag = {
        ...tagForm.value,
        id: `tag_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      }
      tags.value.push(newTag)
      ElMessage.success('标签创建成功')
    }
    tagFormVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleDeleteTag = (tag) => {
  if (tag.usageCount > 0) {
    ElMessageBox.confirm(
      `该标签已被 ${tag.usageCount} 道题目使用，删除后这些题目将失去该标签。确定要删除吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const index = tags.value.findIndex(t => t.id === tag.id)
      if (index > -1) {
        tags.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
  } else {
    ElMessageBox.confirm('确定要删除该标签吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const index = tags.value.findIndex(t => t.id === tag.id)
      if (index > -1) {
        tags.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
  }
}

const handleAddCategory = () => {
  isEditCategoryMode.value = false
  categoryForm.value = {
    id: '',
    name: '',
    level: '1'
  }
  categoryFormVisible.value = true
}

const handleEditCategory = (category) => {
  isEditCategoryMode.value = true
  categoryForm.value = { ...category }
  categoryFormVisible.value = true
}

const handleSaveCategory = async () => {
  try {
    await categoryFormRef.value.validate()

    if (isEditCategoryMode.value) {
      const index = categories.value.findIndex(c => c.id === categoryForm.value.id)
      if (index > -1) {
        categories.value[index] = { ...categoryForm.value }
      }
      ElMessage.success('分类更新成功')
    } else {
      const newCategory = {
        ...categoryForm.value,
        id: `cat_${Date.now()}`,
        parentId: null,
        children: []
      }
      categories.value.push(newCategory)
      ElMessage.success('分类创建成功')
    }
    categoryFormVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleDeleteCategory = (category) => {
  ElMessageBox.confirm(
    `确定要删除分类 "${category.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = categories.value.findIndex(c => c.id === category.id)
    if (index > -1) {
      categories.value.splice(index, 1)
      ElMessage.success('分类已删除')
    }
  })
}

const handleVisibleChange = (val) => {
  if (!val) {
    searchText.value = ''
    selectedCategoryId.value = ''
    currentPage.value = 1
  }
}

defineExpose({
  tags,
  categories
})
</script>

<style lang="scss" scoped>
.tag-manager-drawer {
  display: flex;
  gap: 20px;
  height: 100%;
}

/* 左侧分类树 */
.left-sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  padding-right: 16px;
  border-right: 1px solid var(--color-border-lighter);

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  :deep(.el-tree) {
    flex: 1;
    overflow-y: auto;
    background: transparent;

    .el-tree-node__content {
      height: 32px;

      &:hover {
        background: #f5f7fa;
      }
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background: #e6f7ff;
    }
  }
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4px;

  .node-label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    font-size: 13px;

    .el-icon {
      font-size: 14px;
      color: #909399;
    }
  }

  .node-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s;

    .el-button {
      padding: 0;
      font-size: 12px;
    }
  }

  &:hover .node-actions {
    opacity: 1;
  }
}

/* 右侧内容区 */
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
