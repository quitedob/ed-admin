<template>
  <el-dialog
    v-model="visible"
    title="授权班级"
    width="70%"
    @close="handleClose"
  >
    <div class="authorize-container">
      <el-row :gutter="20" style="height: 400px;">
        <!-- 左侧：可选班级列表 -->
        <el-col :span="10" class="left-panel">
          <div class="panel-header">
            <h4>可选班级</h4>
            <el-input
              v-model="availableSearch"
              placeholder="搜索班级..."
              clearable
              size="small"
              style="width: 100%; margin-top: 8px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="class-list">
            <div
              v-for="cls in filteredAvailableClasses"
              :key="cls.id"
              :class="['class-item', { selected: isClassSelected(cls) }]"
              @click="toggleClass(cls)"
            >
              <el-checkbox :model-value="isClassSelected(cls)" />
              <span class="class-name">{{ cls.name }}</span>
            </div>
          </div>

          <el-empty v-if="filteredAvailableClasses.length === 0" description="暂无可选班级" />
        </el-col>

        <!-- 中间：操作按钮 -->
        <el-col :span="4" class="middle-panel">
          <div class="button-group">
            <el-button
              type="primary"
              @click="addClasses"
              :disabled="tempSelectedClasses.length === 0"
            >
              添加 →
            </el-button>
            <el-button
              @click="removeClasses"
              :disabled="tempAuthorizedClasses.length === 0"
            >
              ← 移除
            </el-button>
          </div>
        </el-col>

        <!-- 右侧：已授权班级列表 -->
        <el-col :span="10" class="right-panel">
          <div class="panel-header">
            <h4>已授权班级（{{ tempAuthorizedClasses.length }}个）</h4>
          </div>

          <div class="class-list">
            <div
              v-for="cls in tempAuthorizedClasses"
              :key="cls.id"
              :class="['class-item', { selected: isAuthorizedSelected(cls) }]"
              @click="toggleAuthorized(cls)"
            >
              <el-checkbox :model-value="isAuthorizedSelected(cls)" />
              <span class="class-name">{{ cls.name }}</span>
            </div>
          </div>

          <el-empty v-if="tempAuthorizedClasses.length === 0" description="暂无已授权班级" />
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
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  teacherId: String,
  authorizedClasses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:authorized-classes'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const availableSearch = ref('')
const tempSelectedClasses = ref([])
const tempAuthorizedClasses = ref([])

// 模拟所有班级
const allClasses = ref([
  { id: 'cls_001', name: '一年级一班' },
  { id: 'cls_002', name: '五年级二班' },
  { id: 'cls_003', name: '初二一班' },
  { id: 'cls_004', name: '高三三班' },
  { id: 'cls_005', name: '二年级一班' },
  { id: 'cls_006', name: '三年级二班' },
  { id: 'cls_007', name: '初一一班' },
  { id: 'cls_008', name: '高一二班' }
])

// 计算属性
const availableClasses = computed(() => {
  const authorizedIds = new Set(tempAuthorizedClasses.value.map(c => c.id))
  return allClasses.value.filter(c => !authorizedIds.has(c.id))
})

const filteredAvailableClasses = computed(() => {
  if (!availableSearch.value) return availableClasses.value
  return availableClasses.value.filter(c =>
    c.name.includes(availableSearch.value)
  )
})

// 监听 authorizedClasses 变化
watch(
  () => props.authorizedClasses,
  (newVal) => {
    tempAuthorizedClasses.value = [...newVal]
  },
  { immediate: true }
)

// 方法
const isClassSelected = (cls) => {
  return tempSelectedClasses.value.some(c => c.id === cls.id)
}

const isAuthorizedSelected = (cls) => {
  return tempAuthorizedClasses.value.some(c => c.id === cls.id)
}

const toggleClass = (cls) => {
  const index = tempSelectedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    tempSelectedClasses.value.splice(index, 1)
  } else {
    tempSelectedClasses.value.push(cls)
  }
}

const toggleAuthorized = (cls) => {
  const index = tempAuthorizedClasses.value.findIndex(c => c.id === cls.id)
  if (index > -1) {
    tempAuthorizedClasses.value.splice(index, 1)
  } else {
    tempAuthorizedClasses.value.push(cls)
  }
}

const addClasses = () => {
  tempAuthorizedClasses.value.push(...tempSelectedClasses.value)
  tempSelectedClasses.value = []
}

const removeClasses = () => {
  const selectedIds = new Set(tempAuthorizedClasses.value.map(c => c.id))
  tempAuthorizedClasses.value = tempAuthorizedClasses.value.filter(
    c => !selectedIds.has(c.id)
  )
}

const handleClose = () => {
  visible.value = false
  tempSelectedClasses.value = []
}

const handleSave = () => {
  emit('update:authorized-classes', tempAuthorizedClasses.value)
  ElMessage.success('班级授权已保存')
  handleClose()
}
</script>

<style lang="scss" scoped>
.authorize-container {
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

.middle-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .el-button {
    width: 100%;
  }
}

.panel-header {
  margin-bottom: 12px;

  h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
}

.class-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
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

  .class-name {
    flex: 1;
    color: #303133;
    font-size: 14px;
  }
}
</style>
