<template>
  <div class="tag-cascader-filter">
    <div class="filter-title">
      <el-icon><Filter /></el-icon>
      <span>三级标签筛选</span>
    </div>

    <div class="cascader-container">
      <!-- 一级分类：学科门类 -->
      <el-select
        v-model="selectedLevel1"
        placeholder="选择学科"
        clearable
        @change="handleLevel1Change"
        @clear="handleLevel1Clear"
        class="level-select"
      >
        <el-option
          v-for="category in level1Categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>

      <!-- 二级分类：专业方向 -->
      <el-select
        v-model="selectedLevel2"
        placeholder="选择专业方向"
        clearable
        :disabled="!selectedLevel1"
        @change="handleLevel2Change"
        @clear="handleLevel2Clear"
        class="level-select"
      >
        <el-option
          v-for="category in level2Categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>

      <!-- 三级分类：具体知识点 -->
      <el-select
        v-model="selectedLevel3"
        placeholder="选择知识点"
        clearable
        :disabled="!selectedLevel2"
        @change="handleLevel3Change"
        @clear="handleLevel3Clear"
        class="level-select"
      >
        <el-option
          v-for="category in level3Categories"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        />
      </el-select>
    </div>

    <!-- 选中的标签显示 -->
    <div v-if="selectedTags.length > 0" class="selected-tags">
      <div class="tags-label">已选标签：</div>
      <div class="tags-container">
        <el-tag
          v-for="tag in selectedTags"
          :key="tag.id"
          :color="tag.color"
          closable
          @close="removeTag(tag)"
          class="tag-item"
        >
          {{ tag.name }}
        </el-tag>
      </div>
      <el-button size="small" @click="clearAllTags">清空全部</el-button>
    </div>

    <!-- 快速选择常用标签 -->
    <div v-if="availableTags.length > 0" class="quick-tags">
      <div class="quick-tags-label">快速选择：</div>
      <div class="quick-tags-container">
        <el-tag
          v-for="tag in displayedTags"
          :key="tag.id"
          :color="tag.color"
          :effect="isTagSelected(tag) ? 'dark' : 'light'"
          @click="toggleTag(tag)"
          class="quick-tag"
        >
          {{ tag.name }}
        </el-tag>
        <el-button
          v-if="availableTags.length > displayLimit"
          size="small"
          text
          @click="showMore = !showMore"
        >
          {{ showMore ? '收起' : `更多(${availableTags.length - displayLimit})` }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Filter } from '@element-plus/icons-vue'
import {
  tagCategories,
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories,
  getTagsByCategoryPath,
  getCategoryPath
} from '@/utils/tagData'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const selectedLevel1 = ref('')
const selectedLevel2 = ref('')
const selectedLevel3 = ref('')
const selectedTags = ref([])
const availableTags = ref([])
const showMore = ref(false)
const displayLimit = 8

// 计算属性
const level1Categories = computed(() => getLevel1Categories())

const level2Categories = computed(() => {
  if (!selectedLevel1.value) return []
  return getLevel2Categories(selectedLevel1.value)
})

const level3Categories = computed(() => {
  if (!selectedLevel2.value) return []
  return getLevel3Categories(selectedLevel2.value)
})

const displayedTags = computed(() => {
  if (showMore.value) {
    return availableTags.value
  }
  return availableTags.value.slice(0, displayLimit)
})

// 方法
const handleLevel1Change = (value) => {
  selectedLevel2.value = ''
  selectedLevel3.value = ''
  loadAvailableTags()
}

const handleLevel1Clear = () => {
  selectedLevel2.value = ''
  selectedLevel3.value = ''
  availableTags.value = []
}

const handleLevel2Change = (value) => {
  selectedLevel3.value = ''
  loadAvailableTags()
}

const handleLevel2Clear = () => {
  selectedLevel3.value = ''
  loadAvailableTags()
}

const handleLevel3Change = (value) => {
  loadAvailableTags()
}

const handleLevel3Clear = () => {
  loadAvailableTags()
}

const loadAvailableTags = () => {
  const categoryPath = []

  if (selectedLevel1.value) categoryPath.push(selectedLevel1.value)
  if (selectedLevel2.value) categoryPath.push(selectedLevel2.value)
  if (selectedLevel3.value) categoryPath.push(selectedLevel3.value)

  if (categoryPath.length > 0) {
    availableTags.value = getTagsByCategoryPath(categoryPath)
    // 按使用次数排序
    availableTags.value.sort((a, b) => b.usageCount - a.usageCount)
  } else {
    availableTags.value = []
  }
}

const isTagSelected = (tag) => {
  return selectedTags.value.some(t => t.id === tag.id)
}

const toggleTag = (tag) => {
  const index = selectedTags.value.findIndex(t => t.id === tag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  emitChange()
}

const removeTag = (tag) => {
  const index = selectedTags.value.findIndex(t => t.id === tag.id)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    emitChange()
  }
}

const clearAllTags = () => {
  selectedTags.value = []
  emitChange()
}

const emitChange = () => {
  emit('update:modelValue', selectedTags.value)
  emit('change', selectedTags.value)
}

// 监听外部传入的值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== selectedTags.value) {
    selectedTags.value = newValue || []
  }
}, { immediate: true, deep: true })

// 重置筛选条件
const reset = () => {
  selectedLevel1.value = ''
  selectedLevel2.value = ''
  selectedLevel3.value = ''
  selectedTags.value = []
  availableTags.value = []
  showMore.value = false
  emitChange()
}

// 获取当前筛选条件描述
const getFilterDescription = () => {
  const parts = []

  if (selectedLevel1.value) {
    const level1Category = level1Categories.value.find(cat => cat.id === selectedLevel1.value)
    if (level1Category) parts.push(level1Category.name)
  }

  if (selectedLevel2.value) {
    const level2Category = level2Categories.value.find(cat => cat.id === selectedLevel2.value)
    if (level2Category) parts.push(level2Category.name)
  }

  if (selectedLevel3.value) {
    const level3Category = level3Categories.value.find(cat => cat.id === selectedLevel3.value)
    if (level3Category) parts.push(level3Category.name)
  }

  if (selectedTags.value.length > 0) {
    const tagNames = selectedTags.value.map(tag => tag.name).join('、')
    parts.push(`标签: ${tagNames}`)
  }

  return parts.join(' > ')
}

// 暴露方法给父组件
defineExpose({
  reset,
  getFilterDescription
})
</script>

<style lang="scss" scoped>
.tag-cascader-filter {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;

  .filter-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      color: #409eff;
    }
  }

  .cascader-container {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .level-select {
      min-width: 160px;
      flex: 1;
    }
  }

  .selected-tags {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 16px;

    .tags-label {
      font-weight: 500;
      color: #606266;
      white-space: nowrap;
      margin-top: 4px;
    }

    .tags-container {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag-item {
        margin: 0;
      }
    }
  }

  .quick-tags {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #e4e7ed;

    .quick-tags-label {
      font-weight: 500;
      color: #606266;
      white-space: nowrap;
      margin-top: 4px;
    }

    .quick-tags-container {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;

      .quick-tag {
        cursor: pointer;
        margin: 0;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tag-cascader-filter {
    padding: 16px;

    .cascader-container {
      flex-direction: column;

      .level-select {
        width: 100%;
      }
    }

    .selected-tags,
    .quick-tags {
      flex-direction: column;
      gap: 8px;

      .tags-label,
      .quick-tags-label {
        margin-top: 0;
      }
    }
  }
}
</style>