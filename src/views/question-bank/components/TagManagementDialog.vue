<template>
  <el-dialog
    v-model="visible"
    title="标签管理"
    width="800px"
    @close="handleClose"
  >
    <div class="tag-management">
      <el-row :gutter="20">
        <!-- 左侧：标签列表 -->
        <el-col :span="14">
          <div class="tag-list-section">
            <div class="section-header">
              <h4>标签列表</h4>
              <el-input
                v-model="searchText"
                placeholder="搜索标签..."
                clearable
                style="width: 200px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="category-tabs">
              <div
                v-for="category in categories"
                :key="category.id"
                class="category-tab"
                :class="{ active: activeCategory === category.id }"
                @click="activeCategory = category.id"
              >
                {{ category.name }}
                <el-tag type="info" size="small">{{ getCategoryTagCount(category.id) }}</el-tag>
              </div>
            </div>

            <div class="tags-container">
              <div
                v-for="tag in filteredTags"
                :key="tag.id"
                class="tag-item"
              >
                <div class="tag-content">
                  <el-tag :style="{ backgroundColor: tag.color, borderColor: tag.color }">
                    {{ tag.name }}
                  </el-tag>
                  <span class="tag-category">{{ getCategoryName(tag.categoryId) }}</span>
                  <span class="tag-usage">使用: {{ tag.usage }}次</span>
                </div>
                <div class="tag-actions">
                  <el-button link type="primary" size="small" @click="editTag(tag)">
                    编辑
                  </el-button>
                  <el-button link type="danger" size="small" @click="deleteTag(tag)">
                    删除
                  </el-button>
                </div>
              </div>

              <el-empty v-if="filteredTags.length === 0" description="暂无标签" />
            </div>
          </div>
        </el-col>

        <!-- 右侧：标签编辑/新增 -->
        <el-col :span="10">
          <div class="tag-edit-section">
            <h4>{{ editingTag ? '编辑标签' : '新增标签' }}</h4>

            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="80px"
            >
              <el-form-item label="标签名" prop="name">
                <el-input v-model="formData.name" placeholder="请输入标签名" />
              </el-form-item>

              <el-form-item label="分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择分类">
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="颜色" prop="color">
                <el-color-picker v-model="formData.color" show-alpha />
              </el-form-item>

              <el-form-item label="描述">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入标签描述"
                />
              </el-form-item>

              <div class="form-actions">
                <el-button @click="resetForm">清空</el-button>
                <el-button type="primary" @click="saveTag">保存</el-button>
              </div>
            </el-form>

            <div v-if="editingTag" class="tag-info">
              <h5>标签信息</h5>
              <div class="info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDate(editingTag.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">使用次数:</span>
                <span class="value">{{ editingTag.usage }}</span>
              </div>
              <div class="info-item">
                <span class="label">最后修改:</span>
                <span class="value">{{ formatDate(editingTag.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const searchText = ref('')
const activeCategory = ref('custom')
const editingTag = ref(null)

const categories = [
  { id: 'course', name: '课程/考点' },
  { id: 'type', name: '题型' },
  { id: 'custom', name: '自定义标签' }
]

const formData = ref({
  name: '',
  categoryId: 'custom',
  color: '#409EFF',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入标签名', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const filteredTags = computed(() => {
  let result = props.tags.filter(t => t.categoryId === activeCategory.value)

  if (searchText.value) {
    result = result.filter(t =>
      t.name.includes(searchText.value) ||
      t.description?.includes(searchText.value)
    )
  }

  return result
})

const getCategoryTagCount = (categoryId) => {
  return props.tags.filter(t => t.categoryId === categoryId).length
}

const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.name || categoryId
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const editTag = (tag) => {
  editingTag.value = tag
  formData.value = {
    name: tag.name,
    categoryId: tag.categoryId,
    color: tag.color,
    description: tag.description || ''
  }
}

const deleteTag = (tag) => {
  ElMessageBox.confirm(
    `确定删除标签 "${tag.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = props.tags.findIndex(t => t.id === tag.id)
    if (index > -1) {
      props.tags.splice(index, 1)
    }
    ElMessage.success('标签已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const saveTag = async () => {
  await formRef.value.validate()

  if (editingTag.value) {
    // 更新标签
    Object.assign(editingTag.value, {
      ...formData.value,
      updatedAt: new Date().toISOString()
    })
    ElMessage.success('标签已更新')
  } else {
    // 新增标签
    const newTag = {
      id: `tag_${Date.now()}`,
      ...formData.value,
      usage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    props.tags.push(newTag)
    ElMessage.success('标签已创建')
  }

  emit('save', props.tags)
  resetForm()
}

const resetForm = () => {
  formRef.value?.resetFields()
  editingTag.value = null
  formData.value = {
    name: '',
    categoryId: 'custom',
    color: '#409EFF',
    description: ''
  }
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    resetForm()
  }
})
</script>

<style scoped>
.tag-management {
  display: flex;
  gap: 20px;
}

.tag-list-section,
.tag-edit-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.category-tab:hover {
  background: var(--color-primary-50);
}

.category-tab.active {
  background: var(--color-primary);
  color: white;
}

.category-tab .el-tag {
  margin-left: 4px;
}

.tags-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  transition: all 0.2s;
}

.tag-item:hover {
  background: var(--color-primary-50);
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.tag-category {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.tag-usage {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.tag-actions {
  display: flex;
  gap: 8px;
}

.tag-edit-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.tag-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}

.tag-info h5 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
}

.info-item .label {
  color: var(--color-text-secondary);
}

.info-item .value {
  color: var(--color-text-primary);
}
</style>
