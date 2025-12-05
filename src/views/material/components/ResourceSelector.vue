<template>
  <div class="resource-selector">
    <!-- 已选择的资源 -->
    <div v-if="selectedResource" class="selected-resource">
      <div class="resource-preview">
        <el-image
          v-if="selectedResource.type === 'image'"
          :src="selectedResource.url"
          fit="cover"
          style="width: 100%; height: 100%; border-radius: 4px"
        />
        <div v-else class="type-icon">
          <el-icon v-if="selectedResource.type === 'video'"><VideoPlay /></el-icon>
          <el-icon v-else-if="selectedResource.type === 'audio'"><Headset /></el-icon>
          <el-icon v-else-if="selectedResource.type === 'ebook'"><Document /></el-icon>
        </div>
      </div>
      <div class="resource-info">
        <p class="resource-name">{{ selectedResource.name }}</p>
        <p class="resource-type">{{ getTypeLabel(selectedResource.type) }}</p>
        <el-button link type="danger" size="small" @click="handleClear">
          清除
        </el-button>
      </div>
    </div>

    <!-- 选择按钮 -->
    <el-button
      v-else
      type="primary"
      @click="selectorDialogVisible = true"
    >
      选择{{ typeLabel }}
    </el-button>

    <!-- 资源选择对话框 -->
    <el-dialog
      v-model="selectorDialogVisible"
      :title="`选择${typeLabel}`"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="selector-container">
        <!-- 分组树 -->
        <div class="selector-sidebar">
          <el-tree
            :data="groupTree"
            :props="treeProps"
            node-key="id"
            :default-expanded-keys="defaultExpandedKeys"
            :highlight-current="true"
            @node-click="handleGroupSelect"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.children?.length"><Folder /></el-icon>
                <el-icon v-else><Document /></el-icon>
                {{ node.label }}
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 资源列表 -->
        <div class="selector-content">
          <el-input
            v-model="searchText"
            placeholder="搜索资源..."
            clearable
            style="margin-bottom: 12px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div class="resource-list">
            <div
              v-for="resource in filteredResources"
              :key="resource.id"
              class="resource-item"
              :class="{ active: resource.id === selectedResourceId }"
              @click="handleSelectResource(resource)"
            >
              <div class="item-preview">
                <el-image
                  v-if="resource.type === 'image'"
                  :src="resource.url"
                  fit="cover"
                  style="width: 100%; height: 100%; border-radius: 4px"
                />
                <div v-else class="type-icon">
                  <el-icon v-if="resource.type === 'video'"><VideoPlay /></el-icon>
                  <el-icon v-else-if="resource.type === 'audio'"><Headset /></el-icon>
                  <el-icon v-else-if="resource.type === 'ebook'"><Document /></el-icon>
                </div>
              </div>
              <div class="item-info">
                <p class="item-name">{{ resource.name }}</p>
                <p class="item-type">{{ getTypeLabel(resource.type) }}</p>
              </div>
            </div>

            <el-empty
              v-if="filteredResources.length === 0"
              description="暂无资源"
              style="margin-top: 20px"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="selectorDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :disabled="!selectedResourceId"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  VideoPlay,
  Headset,
  Document,
  Folder,
  Search
} from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'

const props = defineProps({
  modelValue: Object,
  type: {
    type: String,
    default: 'image',
    validator: (val) => ['image', 'video', 'audio', 'ebook'].includes(val)
  },
  groupId: String
})

const emit = defineEmits(['update:modelValue'])

const selectorDialogVisible = ref(false)
const searchText = ref('')
const selectedResourceId = ref('')

const resources = ref([])
const groups = ref([])
const defaultExpandedKeys = ref([])
const selectedGroupId = ref('')

const treeProps = {
  children: 'children',
  label: 'name'
}

const typeLabel = computed(() => {
  const map = {
    image: '图片',
    video: '视频',
    audio: '音频',
    ebook: '电子书'
  }
  return map[props.type] || props.type
})

const selectedResource = computed(() => props.modelValue)

// 构建树形结构
const groupTree = computed(() => {
  const sceneMap = {
    course: '课程素材',
    question: '题库素材',
    misc: '公共素材'
  }

  const tree = []
  const sceneGroups = {}

  groups.value.forEach(group => {
    const scene = group.scene || 'misc'
    if (!sceneGroups[scene]) {
      sceneGroups[scene] = {
        id: `scene_${scene}`,
        name: sceneMap[scene],
        isRoot: true,
        children: []
      }
    }
    sceneGroups[scene].children.push(group)
  })

  Object.values(sceneGroups).forEach(sceneGroup => {
    tree.push(sceneGroup)
    if (sceneGroup.id === 'scene_course') {
      defaultExpandedKeys.value.push(sceneGroup.id)
    }
  })

  return tree
})

// 过滤资源
const filteredResources = computed(() => {
  let result = resources.value

  // 按类型过滤
  result = result.filter(r => r.type === props.type)

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

  return result
})

// 加载资源
const loadResources = async () => {
  try {
    const response = await courseApi.resourcePage({}, 1, 1000)
    resources.value = response.data || []
  } catch (error) {
    console.error('加载资源失败:', error)
  }
}

// 加载分组
const loadGroups = async () => {
  try {
    const response = await courseApi.resourceGroupList()
    groups.value = response.data || []
  } catch (error) {
    console.error('加载分组失败:', error)
  }
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

const handleGroupSelect = (data) => {
  if (!data.isRoot) {
    selectedGroupId.value = data.id
  }
}

const handleSelectResource = (resource) => {
  selectedResourceId.value = resource.id
}

const handleConfirm = () => {
  const resource = resources.value.find(r => r.id === selectedResourceId.value)
  if (resource) {
    emit('update:modelValue', resource)
    selectorDialogVisible.value = false
    resetSelector()
  }
}

const handleClear = () => {
  emit('update:modelValue', null)
}

const resetSelector = () => {
  searchText.value = ''
  selectedResourceId.value = ''
  selectedGroupId.value = ''
}

onMounted(() => {
  loadResources()
  loadGroups()
})
</script>

<style scoped>
.resource-selector {
  width: 100%;
}

.selected-resource {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #dcdfe6;

  .resource-preview {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .type-icon {
      font-size: 32px;
      color: #909399;
    }
  }

  .resource-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .resource-name {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .resource-type {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #909399;
    }
  }
}

.selector-container {
  display: flex;
  gap: 16px;
  height: 400px;
}

.selector-sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  overflow-y: auto;

  :deep(.el-tree) {
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

  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
}

.selector-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .resource-list {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background: #f0f9ff;
  }

  &.active {
    border-color: #409eff;
    background: #e6f7ff;
  }

  .item-preview {
    width: 100%;
    height: 80px;
    background: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .type-icon {
      font-size: 28px;
      color: #909399;
    }
  }

  .item-info {
    .item-name {
      margin: 0;
      font-size: 12px;
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-type {
      margin: 0;
      font-size: 11px;
      color: #909399;
    }
  }
}
</style>
