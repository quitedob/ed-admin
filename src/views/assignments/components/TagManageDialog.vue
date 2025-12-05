<template>
  <el-dialog
      id="tag-manage-dialog"
      v-model="visible"
      title="标签管理"
      width="700px"
      @close="handleClose"
  >
    <!-- 工具栏 -->
    <div id="tag-toolbar" class="toolbar">
      <el-button id="add-tag-btn" type="primary" @click="handleAddTag">
        <el-icon><Plus /></el-icon>
        新建标签
      </el-button>
      <el-input
        id="tag-search-input"
        v-model="searchText"
        placeholder="搜索标签..."
        clearable
        style="width: 200px; margin-left: auto"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select id="tag-sort-select" v-model="sortType" placeholder="排序" style="width: 150px; margin-left: 12px">
        <el-option label="按名称" value="name" />
        <el-option label="按使用频率" value="usage" />
        <el-option label="按创建时间" value="time" />
      </el-select>
    </div>

    <!-- 标签列表 -->
    <el-table id="tag-table" :data="filteredTags" stripe style="width: 100%; margin-top: 16px">
      <el-table-column type="selection" width="55" />
      <el-table-column label="标签名称" min-width="150">
        <template #default="{ row }">
          <el-tag :color="row.color" style="color: white">
            {{ row.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="usage" label="使用次数" width="100" align="center">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.usage }}道题</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEditTag(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDeleteTag(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div id="tag-pagination" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
      />
    </div>

    <template #footer>
      <el-button id="close-tag-dialog-btn" @click="handleClose">关闭</el-button>
      <el-button id="save-tags-btn" type="primary" @click="handleSave">保存</el-button>
    </template>

    <!-- 新建/编辑标签对话框 -->
    <el-dialog
      id="tag-form-dialog"
      v-model="tagFormVisible"
      :title="isEditMode ? '编辑标签' : '新建标签'"
      width="500px"
      append-to-body
    >
      <el-form id="tag-form" ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
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
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="tagForm.type" placeholder="请选择标签类型">
            <el-option label="知识点" value="knowledge_point" />
            <el-option label="难度" value="difficulty" />
            <el-option label="题型" value="question_type" />
            <el-option label="章节" value="chapter" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTag">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
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

// 响应式数据
const searchText = ref('')
const sortType = ref('usage')
const currentPage = ref(1)
const pageSize = ref(10)
const tagFormVisible = ref(false)
const isEditMode = ref(false)
const tagFormRef = ref()

const localTags = ref([...props.tags])

const tagForm = ref({
  id: '',
  name: '',
  description: '',
  color: '#409EFF',
  type: 'knowledge_point',
  usage: 0
})

const tagRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }],
  type: [{ required: true, message: '请选择标签类型', trigger: 'change' }]
}

// 计算属性
const filteredTags = computed(() => {
  let result = localTags.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(tag =>
      tag.name.includes(searchText.value) ||
      (tag.description && tag.description.includes(searchText.value))
    )
  }

  // 排序
  if (sortType.value === 'name') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortType.value === 'usage') {
    result = [...result].sort((a, b) => b.usage - a.usage)
  } else if (sortType.value === 'time') {
    result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return result
})

const total = computed(() => filteredTags.value.length)

// 方法
const handleAddTag = () => {
  isEditMode.value = false
  tagForm.value = {
    id: '',
    name: '',
    description: '',
    color: '#409EFF',
    type: 'knowledge_point',
    usage: 0
  }
  tagFormVisible.value = true
}

const handleEditTag = (tag) => {
  isEditMode.value = true
  tagForm.value = { ...tag }
  tagFormVisible.value = true
}

const handleSaveTag = () => {
  tagFormRef.value.validate((valid) => {
    if (valid) {
      if (isEditMode.value) {
        // 更新标签
        const index = localTags.value.findIndex(t => t.id === tagForm.value.id)
        if (index > -1) {
          localTags.value[index] = { ...tagForm.value }
        }
        ElMessage.success('标签更新成功')
      } else {
        // 新建标签
        const newTag = {
          ...tagForm.value,
          id: `tag_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        localTags.value.push(newTag)
        ElMessage.success('标签创建成功')
      }
      tagFormVisible.value = false
    }
  })
}

const handleDeleteTag = (tag) => {
  if (tag.usage > 0) {
    ElMessageBox.confirm(
      `该标签已被 ${tag.usage} 道题目使用，删除后这些题目将失去该标签。确定要删除吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const index = localTags.value.findIndex(t => t.id === tag.id)
      if (index > -1) {
        localTags.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
  } else {
    ElMessageBox.confirm('确定要删除该标签吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const index = localTags.value.findIndex(t => t.id === tag.id)
      if (index > -1) {
        localTags.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
  }
}

const handleSave = () => {
  emit('save', localTags.value)
  handleClose()
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
