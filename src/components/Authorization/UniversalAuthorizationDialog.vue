<template>
  <el-dialog
    v-model="visible"
    :title="`授权${getTypeLabel(authType)}`"
    width="70%"
    @close="handleClose"
  >
    <div class="authorization-dialog">
      <!-- 左侧：学生/员工选择 -->
      <div class="left-panel">
        <h4>选择{{ targetType === 'student' ? '学生' : '员工' }}</h4>
        <el-input
          v-model="searchText"
          placeholder="搜索..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="selection-list">
          <el-checkbox-group v-model="selectedTargets">
            <div
              v-for="target in filteredTargets"
              :key="target.id"
              class="target-item"
            >
              <el-checkbox :label="target.id">
                <div class="target-info">
                  <span class="name">{{ target.name }}</span>
                  <span class="meta">{{ target.meta }}</span>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <div class="selection-actions">
          <el-button size="small" @click="selectAll">全选</el-button>
          <el-button size="small" @click="clearSelection">清空</el-button>
        </div>
      </div>

      <!-- 右侧：内容选择 -->
      <div class="right-panel">
        <h4>选择{{ getTypeLabel(authType) }}</h4>
        <el-input
          v-model="contentSearchText"
          placeholder="搜索..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="content-list">
          <el-checkbox-group v-model="selectedContents">
            <div
              v-for="content in filteredContents"
              :key="content.id"
              class="content-item"
            >
              <el-checkbox :label="content.id">
                <div class="content-info">
                  <span class="title">{{ content.title }}</span>
                  <span class="meta">{{ content.meta }}</span>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>

        <div class="content-actions">
          <el-button size="small" @click="selectAllContents">全选</el-button>
          <el-button size="small" @click="clearContentSelection">清空</el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定授权</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  authType: {
    type: String,
    default: 'course' // 'course', 'homework', 'exam'
  },
  targetType: {
    type: String,
    default: 'student' // 'student', 'employee'
  },
  targets: {
    type: Array,
    default: () => []
  },
  contents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchText = ref('')
const contentSearchText = ref('')
const selectedTargets = ref([])
const selectedContents = ref([])

const filteredTargets = computed(() => {
  if (!searchText.value) return props.targets
  return props.targets.filter(t =>
    t.name.includes(searchText.value) ||
    t.meta.includes(searchText.value)
  )
})

const filteredContents = computed(() => {
  if (!contentSearchText.value) return props.contents
  return props.contents.filter(c =>
    c.title.includes(contentSearchText.value) ||
    c.meta.includes(contentSearchText.value)
  )
})

const selectAll = () => {
  selectedTargets.value = props.targets.map(t => t.id)
}

const clearSelection = () => {
  selectedTargets.value = []
}

const selectAllContents = () => {
  selectedContents.value = props.contents.map(c => c.id)
}

const clearContentSelection = () => {
  selectedContents.value = []
}

const getTypeLabel = (type) => {
  const map = {
    course: '课程',
    homework: '作业',
    exam: '考试'
  }
  return map[type] || type
}

const handleConfirm = () => {
  if (selectedTargets.value.length === 0) {
    ElMessage.warning(`请选择${props.targetType === 'student' ? '学生' : '员工'}`)
    return
  }
  if (selectedContents.value.length === 0) {
    ElMessage.warning(`请选择${getTypeLabel(props.authType)}`)
    return
  }

  emit('confirm', {
    targets: selectedTargets.value,
    contents: selectedContents.value,
    authType: props.authType
  })

  handleClose()
}

const handleClose = () => {
  visible.value = false
  selectedTargets.value = []
  selectedContents.value = []
  searchText.value = ''
  contentSearchText.value = ''
}

watch(() => props.modelValue, (val) => {
  if (!val) {
    selectedTargets.value = []
    selectedContents.value = []
  }
})
</script>

<style scoped>
.authorization-dialog {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 400px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
}

h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.search-input {
  margin-bottom: 12px;
}

.selection-list,
.content-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.target-item,
.content-item {
  padding: 8px;
  margin-bottom: 8px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.target-item:hover,
.content-item:hover {
  background: var(--color-primary-50);
}

.target-info,
.content-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name,
.title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.selection-actions,
.content-actions {
  display: flex;
  gap: 8px;
}
</style>
