<template>
  <el-dialog
    v-model="visible"
    :title="`授权${authType} - ${classData?.name}`"
    width="80%"
    @close="handleClose"
  >
    <div class="authorization-container">
      <el-row :gutter="20" style="height: 500px;">
        <!-- 左侧：可选项池 -->
        <el-col :span="12" class="left-panel">
          <div class="panel-header">
            <h4>可选{{ authTypeLabel }}</h4>
            <el-input
              v-model="availableSearch"
              placeholder="搜索..."
              clearable
              size="small"
              style="width: 200px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="item-list">
            <div
              v-for="item in filteredAvailableItems"
              :key="item.id"
              class="item"
              @click="selectAvailableItem(item)"
            >
              <el-checkbox :model-value="isItemSelected(item)" />
              <span class="item-name">{{ item.name }}</span>
            </div>
          </div>

          <el-empty v-if="filteredAvailableItems.length === 0" description="暂无可选项" />
        </el-col>

        <!-- 右侧：已授权项 -->
        <el-col :span="12" class="right-panel">
          <div class="panel-header">
            <h4>已授权{{ authTypeLabel }}</h4>
            <span class="count">共{{ selectedItems.length }}项</span>
          </div>

          <div class="item-list">
            <div
              v-for="item in selectedItems"
              :key="item.id"
              class="item selected"
            >
              <span class="item-name">{{ item.name }}</span>
              <el-button
                type="danger"
                text
                size="small"
                @click="deselectItem(item)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="selectedItems.length === 0" description="暂无已授权项" />
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <div style="flex: auto;">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  classData: Object,
  authType: {
    type: String,
    default: 'course' // 'course', 'homework', 'exam'
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const availableSearch = ref('')
const selectedItems = ref([])

// 获取授权类型标签
const authTypeLabel = computed(() => {
  const map = {
    course: '课程',
    homework: '作业',
    exam: '考试'
  }
  return map[props.authType] || props.authType
})

// 模拟可用项
const allItems = ref([
  { id: 'item_001', name: 'JavaScript基础' },
  { id: 'item_002', name: 'Vue.js框架' },
  { id: 'item_003', name: 'React框架' },
  { id: 'item_004', name: 'Node.js后端' },
  { id: 'item_005', name: 'TypeScript进阶' },
  { id: 'item_006', name: '数据库设计' },
  { id: 'item_007', name: '前端工程化' },
  { id: 'item_008', name: '性能优化' }
])

// 模拟已授权项
const authorizedItems = ref([
  { id: 'item_001', name: 'JavaScript基础' },
  { id: 'item_002', name: 'Vue.js框架' }
])

// 初始化已选项
selectedItems.value = [...authorizedItems.value]

// 计算属性
const filteredAvailableItems = computed(() => {
  let result = allItems.value

  if (availableSearch.value) {
    result = result.filter(item =>
      item.name.includes(availableSearch.value)
    )
  }

  return result
})

// 方法
const isItemSelected = (item) => {
  return selectedItems.value.some(s => s.id === item.id)
}

const selectAvailableItem = (item) => {
  if (isItemSelected(item)) {
    deselectItem(item)
  } else {
    selectedItems.value.push(item)
  }
}

const deselectItem = (item) => {
  const index = selectedItems.value.findIndex(s => s.id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  }
}

const handleClose = () => {
  visible.value = false
}

const handleSave = () => {
  emit('save', {
    authType: props.authType,
    items: selectedItems.value
  })
  ElMessage.success(`${authTypeLabel.value}授权已保存`)
  handleClose()
}
</script>

<style lang="scss" scoped>
.authorization-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;

  h4 {
    margin: 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  .count {
    color: #909399;
    font-size: 12px;
  }
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f0f2f5;
    border-color: #409eff;
  }

  &.selected {
    background: #e6f7ff;
    border-color: #409eff;
  }

  .item-name {
    flex: 1;
    color: #303133;
    font-size: 14px;
  }
}
</style>
