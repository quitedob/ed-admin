<template>
  <el-dialog
    v-model="dialogVisible"
    title="标签管理"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="tag-manager">
      <!-- 左侧标签树 -->
      <div class="tag-sidebar">
        <div class="sidebar-header">
          <h4>标签分类</h4>
          <el-button size="small" type="primary" @click="showCategoryDialog = true">
            <el-icon><Plus /></el-icon>
            新建分类
          </el-button>
        </div>

        <div class="category-tree">
          <el-tree
            :data="categoryTree"
            :props="treeProps"
            node-key="id"
            :default-expanded-keys="expandedKeys"
            :highlight-current="true"
            @node-click="handleCategoryClick"
          >
            <template #default="{ node, data }">
              <div class="category-node">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">({{ data.tagCount || 0 }})</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧标签列表 -->
      <div class="tag-content">
        <div class="content-header">
          <div class="header-info">
            <h4>{{ currentCategory?.name || '全部标签' }}</h4>
            <span class="tag-count">共 {{ filteredTags.length }} 个标签</span>
          </div>

          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索标签..."
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <el-button type="primary" @click="showTagDialog = true">
              <el-icon><Plus /></el-icon>
              新建标签
            </el-button>

            <el-button @click="handleImport">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </div>
        </div>

        <!-- 标签统计 -->
        <div class="tag-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalTags }}</div>
            <div class="stat-label">总标签数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ usedTags }}</div>
            <div class="stat-label">已使用</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ unusedTags }}</div>
            <div class="stat-label">未使用</div>
          </div>
        </div>

        <!-- 标签列表 -->
        <div class="tag-list">
          <el-table :data="paginatedTags" stripe>
            <el-table-column prop="name" label="标签名称" min-width="150">
              <template #default="{ row }">
                <div class="tag-name-cell">
                  <el-tag :color="row.color" effect="light" size="small">
                    {{ row.name }}
                  </el-tag>
                  <el-icon v-if="row.isSystem" class="system-icon">
                    <Lock />
                  </el-icon>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">
                <span>{{ getCategoryName(row.category) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

            <el-table-column prop="usageCount" label="使用次数" width="100" sortable>
              <template #default="{ row }">
                <span :class="{ 'unused-tag': row.usageCount === 0 }">
                  {{ row.usageCount }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="createTime" label="创建时间" width="120" sortable>
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                <el-dropdown @command="(command) => handleTagCommand(command, row)">
                  <el-button size="small">
                    更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="merge">合并标签</el-dropdown-item>
                      <el-dropdown-item command="export">导出数据</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[20, 50, 100]"
              :total="filteredTags.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑标签对话框 -->
    <el-dialog
      v-model="showTagDialog"
      :title="editingTag?.id ? '编辑标签' : '新建标签'"
      width="500px"
      append-to-body
    >
      <el-form :model="tagForm" :rules="tagRules" ref="tagFormRef" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>

        <el-form-item label="所属分类" prop="category">
          <el-select v-model="tagForm.category" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="category in flatCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="tagForm.color" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
          />
        </el-form-item>

        <el-form-item label="系统标签" prop="isSystem">
          <el-switch
            v-model="tagForm.isSystem"
            :disabled="editingTag?.isSystem"
            active-text="是"
            inactive-text="否"
          />
          <div class="form-tip">系统标签不可删除，谨慎设置</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTag">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新建分类对话框 -->
    <el-dialog
      v-model="showCategoryDialog"
      title="新建标签分类"
      width="400px"
      append-to-body
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="父分类" prop="parent">
          <el-select v-model="categoryForm.parent" placeholder="选择父分类（可选）" style="width: 100%" clearable>
            <el-option
              v-for="category in flatCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCategoryDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Upload, Lock, ArrowDown
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'tags-updated'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const currentCategory = ref(null)
const showTagDialog = ref(false)
const showCategoryDialog = ref(false)
const editingTag = ref(null)
const tagFormRef = ref(null)
const categoryFormRef = ref(null)

// 表单数据
const tagForm = ref({
  name: '',
  category: '',
  color: '#409EFF',
  description: '',
  isSystem: false
})

const categoryForm = ref({
  name: '',
  parent: '',
  description: ''
})

// 表单验证规则
const tagRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度为1-20个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择所属分类', trigger: 'change' }
  ]
}

const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '分类名称长度为1-20个字符', trigger: 'blur' }
  ]
}

// 模拟分类数据
const categories = ref([
  {
    id: 'cat_001',
    name: '知识点',
    description: '课程知识点相关标签',
    children: [
      {
        id: 'cat_001_001',
        name: '基础概念',
        parentId: 'cat_001'
      },
      {
        id: 'cat_001_002',
        name: '进阶知识',
        parentId: 'cat_001'
      }
    ]
  },
  {
    id: 'cat_002',
    name: '难度等级',
    description: '题目难度等级标签'
  },
  {
    id: 'cat_003',
    name: '题型分类',
    description: '题目类型相关标签'
  },
  {
    id: 'cat_004',
    name: '学科领域',
    description: '学科专业领域标签',
    children: [
      {
        id: 'cat_004_001',
        name: '计算机科学',
        parentId: 'cat_004'
      },
      {
        id: 'cat_004_002',
        name: '数学',
        parentId: 'cat_004'
      }
    ]
  }
])

// 模拟标签数据
const tags = ref([
  {
    id: 'tag_001',
    name: 'JavaScript',
    category: 'cat_004_001',
    color: '#f7df1e',
    description: 'JavaScript编程语言相关',
    usageCount: 45,
    isSystem: true,
    createTime: '2024-01-01'
  },
  {
    id: 'tag_002',
    name: '基础概念',
    category: 'cat_001_001',
    color: '#67c23a',
    description: '基础概念类题目',
    usageCount: 23,
    isSystem: false,
    createTime: '2024-01-02'
  },
  {
    id: 'tag_003',
    name: '算法',
    category: 'cat_001',
    color: '#e6a23c',
    description: '算法相关题目',
    usageCount: 67,
    isSystem: true,
    createTime: '2024-01-03'
  },
  {
    id: 'tag_004',
    name: '前端开发',
    category: 'cat_004_001',
    color: '#409eff',
    description: '前端开发相关技术',
    usageCount: 89,
    isSystem: false,
    createTime: '2024-01-04'
  },
  {
    id: 'tag_005',
    name: '未使用标签',
    category: 'cat_001',
    color: '#909399',
    description: '暂无题目使用',
    usageCount: 0,
    isSystem: false,
    createTime: '2024-01-05'
  }
])

// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'name'
}

const expandedKeys = ref(['cat_001', 'cat_004'])

// 计算属性
const categoryTree = computed(() => {
  return [
    {
      id: 'all',
      name: '全部标签',
      tagCount: tags.value.length
    },
    ...categories.value.map(cat => ({
      ...cat,
      tagCount: tags.value.filter(tag => tag.category === cat.id || isInChildCategory(tag.category, cat.id)).length
    }))
  ]
})

const flatCategories = computed(() => {
  const flatten = (cats, result = []) => {
    cats.forEach(cat => {
      result.push(cat)
      if (cat.children) {
        flatten(cat.children, result)
      }
    })
    return result
  }
  return flatten(categories.value)
})

const filteredTags = computed(() => {
  let result = tags.value

  // 分类筛选
  if (currentCategory.value && currentCategory.value.id !== 'all') {
    result = result.filter(tag => {
      return tag.category === currentCategory.value.id ||
             isInChildCategory(tag.category, currentCategory.value.id)
    })
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(tag =>
      tag.name.toLowerCase().includes(keyword) ||
      tag.description.toLowerCase().includes(keyword)
    )
  }

  return result
})

const paginatedTags = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTags.value.slice(start, end)
})

const totalTags = computed(() => tags.value.length)
const usedTags = computed(() => tags.value.filter(tag => tag.usageCount > 0).length)
const unusedTags = computed(() => tags.value.filter(tag => tag.usageCount === 0).length)

// 方法
const isInChildCategory = (tagCategoryId, parentCategoryId) => {
  const findCategory = (cats, id) => {
    for (const cat of cats) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = findCategory(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  const tagCat = findCategory(categories.value, tagCategoryId)
  if (!tagCat) return false

  const parentCat = findCategory(categories.value, parentCategoryId)
  if (!parentCat) return false

  // 检查tagCat是否在parentCat的子树中
  const checkParent = (cat, targetId) => {
    if (cat.id === targetId) return true
    if (cat.children) {
      return cat.children.some(child => checkParent(child, targetId))
    }
    return false
  }

  return checkParent(parentCat, tagCategoryId)
}

const handleCategoryClick = (data) => {
  currentCategory.value = data
  currentPage.value = 1
}

const handleEdit = (tag) => {
  editingTag.value = { ...tag }
  tagForm.value = {
    name: tag.name,
    category: tag.category,
    color: tag.color,
    description: tag.description,
    isSystem: tag.isSystem
  }
  showTagDialog.value = true
}

const handleTagCommand = (command, tag) => {
  switch (command) {
    case 'merge':
      handleMerge(tag)
      break
    case 'export':
      handleExport(tag)
      break
    case 'delete':
      handleDelete(tag)
      break
  }
}

const handleMerge = (tag) => {
  ElMessage.info(`合并标签功能开发中：${tag.name}`)
}

const handleExport = (tag) => {
  ElMessage.info(`导出标签数据：${tag.name}`)
}

const handleDelete = async (tag) => {
  if (tag.isSystem) {
    ElMessage.warning('系统标签不可删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除标签"${tag.name}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = tags.value.findIndex(t => t.id === tag.id)
    if (index > -1) {
      tags.value.splice(index, 1)
      ElMessage.success('标签删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const saveTag = async () => {
  try {
    await tagFormRef.value.validate()

    if (editingTag.value) {
      // 编辑现有标签
      const index = tags.value.findIndex(t => t.id === editingTag.value.id)
      if (index > -1) {
        tags.value[index] = {
          ...tags.value[index],
          ...tagForm.value
        }
      }
      ElMessage.success('标签更新成功')
    } else {
      // 添加新标签
      const newTag = {
        ...tagForm.value,
        id: `tag_${Date.now()}`,
        usageCount: 0,
        createTime: new Date().toISOString().split('T')[0]
      }
      tags.value.unshift(newTag)
      ElMessage.success('标签创建成功')
    }

    showTagDialog.value = false
    emit('tags-updated', tags.value)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const saveCategory = async () => {
  try {
    await categoryFormRef.value.validate()

    const newCategory = {
      ...categoryForm.value,
      id: `cat_${Date.now()}`,
      tagCount: 0
    }

    if (categoryForm.value.parent) {
      // 添加到父分类的children中
      const parentCategory = findCategoryById(categories.value, categoryForm.value.parent)
      if (parentCategory) {
        if (!parentCategory.children) {
          parentCategory.children = []
        }
        parentCategory.children.push(newCategory)
      }
    } else {
      // 添加为顶级分类
      categories.value.push(newCategory)
    }

    ElMessage.success('分类创建成功')
    showCategoryDialog.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const findCategoryById = (cats, id) => {
  for (const cat of cats) {
    if (cat.id === id) return cat
    if (cat.children) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return null
}

const getCategoryName = (categoryId) => {
  const category = findCategoryById(categories.value, categoryId)
  return category ? category.name : '未分类'
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const handleClose = () => {
  // 重置状态
  searchKeyword.value = ''
  currentCategory.value = null
  currentPage.value = 1
}

// 监听对话框打开，初始化数据
const initDialog = () => {
  currentCategory.value = { id: 'all', name: '全部标签' }
}

onMounted(() => {
  if (dialogVisible.value) {
    initDialog()
  }
})
</script>

<style lang="scss" scoped>
.tag-manager {
  display: flex;
  height: 600px;
  gap: 20px;
}

.tag-sidebar {
  width: 280px;
  border-right: 1px solid var(--color-border-lighter);
  padding-right: 20px;

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      color: var(--color-text-primary);
    }
  }

  .category-tree {
    :deep(.el-tree) {
      background: transparent;
    }

    .category-node {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .node-count {
        font-size: 12px;
        color: var(--color-text-secondary);
      }
    }
  }
}

.tag-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-info {
      h4 {
        margin: 0 0 4px 0;
        color: var(--color-text-primary);
      }

      .tag-count {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .tag-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .stat-item {
      flex: 1;
      text-align: center;
      padding: 16px;
      background: var(--color-bg-secondary);
      border-radius: 8px;

      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: var(--color-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin-top: 4px;
      }
    }
  }

  .tag-list {
    flex: 1;
    overflow: hidden;

    .tag-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .system-icon {
        color: var(--color-warning);
        font-size: 14px;
      }
    }

    .unused-tag {
      color: var(--color-text-secondary);
    }

    .pagination-section {
      display: flex;
      justify-content: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-lighter);
    }
  }
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
</style>