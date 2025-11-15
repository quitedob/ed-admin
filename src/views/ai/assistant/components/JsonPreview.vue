<template>
  <div class="json-preview">
    <el-card>
      <template #header>
        <div class="preview-header">
          <span>JSON预览</span>
          <div class="header-actions">
            <el-button type="text" @click="copyJson">
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
            <el-button type="text" @click="downloadJson">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button type="text" @click="formatJson">
              <el-icon><MagicStick /></el-icon>
              格式化
            </el-button>
            <el-button type="text" @click="validateJson">
              <el-icon><Check /></el-icon>
              验证
            </el-button>
          </div>
        </div>
      </template>

      <!-- 编辑器模式切换 -->
      <div class="editor-toolbar">
        <el-radio-group v-model="editorMode" size="small">
          <el-radio-button label="preview">预览</el-radio-button>
          <el-radio-button label="edit">编辑</el-radio-button>
          <el-radio-button label="tree">树形</el-radio-button>
        </el-radio-group>

        <div class="toolbar-info">
          <el-tag v-if="isValid" type="success" size="small">
            <el-icon><CircleCheck /></el-icon>
            JSON有效
          </el-tag>
          <el-tag v-else type="danger" size="small">
            <el-icon><CircleClose /></el-icon>
            JSON无效
          </el-tag>
          <span class="json-size">{{ formatSize(jsonString.length) }}</span>
        </div>
      </div>

      <!-- 预览模式 -->
      <div v-if="editorMode === 'preview'" class="preview-mode">
        <div class="json-container">
          <pre><code :class="['language-json', 'hljs']">{{ formattedJson }}</code></pre>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else-if="editorMode === 'edit'" class="edit-mode">
        <el-input
          v-model="jsonString"
          type="textarea"
          :rows="20"
          placeholder="请输入JSON内容..."
          class="json-editor"
          @input="onJsonChange"
        />
        <div v-if="errorMessage" class="error-message">
          <el-icon><Warning /></el-icon>
          {{ errorMessage }}
        </div>
      </div>

      <!-- 树形模式 -->
      <div v-else-if="editorMode === 'tree'" class="tree-mode">
        <div class="json-tree">
          <json-tree-node
            v-for="(node, index) in treeData"
            :key="index"
            :node="node"
            :level="0"
            @update-node="onNodeUpdate"
          />
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="json-stats">
        <div class="stats-item">
          <span class="stats-label">字符数:</span>
          <span class="stats-value">{{ jsonString.length }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">行数:</span>
          <span class="stats-value">{{ jsonString.split('\n').length }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">对象数:</span>
          <span class="stats-value">{{ objectCount }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">数组数:</span>
          <span class="stats-value">{{ arrayCount }}</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">嵌套深度:</span>
          <span class="stats-value">{{ maxDepth }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  Download,
  MagicStick,
  Check,
  CircleCheck,
  CircleClose,
  Warning
} from '@element-plus/icons-vue'
import JsonTreeNode from './JsonTreeNode.vue'

const props = defineProps({
  data: {
    type: [Object, Array, String, Number, Boolean],
    default: null
  },
  filename: {
    type: String,
    default: 'data.json'
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:data', 'change', 'error'])

// 响应式数据
const editorMode = ref('preview')
const jsonString = ref('')
const errorMessage = ref('')
const isValid = ref(true)

// 计算属性
const formattedJson = computed(() => {
  try {
    if (typeof jsonString.value === 'string') {
      const parsed = JSON.parse(jsonString.value)
      return JSON.stringify(parsed, null, 2)
    }
    return JSON.stringify(jsonString.value, null, 2)
  } catch (error) {
    return jsonString.value
  }
})

const treeData = computed(() => {
  try {
    const parsed = typeof jsonString.value === 'string' ? JSON.parse(jsonString.value) : jsonString.value
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch (error) {
    return []
  }
})

const objectCount = computed(() => {
  try {
    const parsed = typeof jsonString.value === 'string' ? JSON.parse(jsonString.value) : jsonString.value
    return countObjects(parsed)
  } catch (error) {
    return 0
  }
})

const arrayCount = computed(() => {
  try {
    const parsed = typeof jsonString.value === 'string' ? JSON.parse(jsonString.value) : jsonString.value
    return countArrays(parsed)
  } catch (error) {
    return 0
  }
})

const maxDepth = computed(() => {
  try {
    const parsed = typeof jsonString.value === 'string' ? JSON.parse(jsonString.value) : jsonString.value
    return calculateDepth(parsed)
  } catch (error) {
    return 0
  }
})

// 监听数据变化
watch(() => props.data, (newVal) => {
  if (newVal !== null) {
    jsonString.value = JSON.stringify(newVal, null, 2)
    validateJson()
  }
}, { immediate: true, deep: true })

watch(jsonString, () => {
  validateJson()
})

// 方法
const validateJson = () => {
  try {
    const parsed = JSON.parse(jsonString.value)
    isValid.value = true
    errorMessage.value = ''
    emit('update:data', parsed)
    emit('change', parsed)
  } catch (error) {
    isValid.value = false
    errorMessage.value = error.message
    emit('error', error)
  }
}

const onJsonChange = () => {
  validateJson()
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonString.value)
    jsonString.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON格式化成功')
  } catch (error) {
    ElMessage.error('JSON格式无效，无法格式化')
  }
}

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    ElMessage.success('JSON已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadJson = () => {
  try {
    const blob = new Blob([formattedJson.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.filename
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('JSON文件下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const onNodeUpdate = (newData) => {
  jsonString.value = JSON.stringify(newData, null, 2)
  validateJson()
}

// 辅助函数
const countObjects = (obj) => {
  if (typeof obj !== 'object' || obj === null) return 0
  if (Array.isArray(obj)) {
    return obj.reduce((count, item) => count + countObjects(item), 0)
  }
  return 1 + Object.values(obj).reduce((count, value) => count + countObjects(value), 0)
}

const countArrays = (obj) => {
  if (typeof obj !== 'object' || obj === null) return 0
  if (Array.isArray(obj)) {
    return 1 + obj.reduce((count, item) => count + countArrays(item), 0)
  }
  return Object.values(obj).reduce((count, value) => count + countArrays(value), 0)
}

const calculateDepth = (obj, currentDepth = 0) => {
  if (typeof obj !== 'object' || obj === null) return currentDepth
  if (Array.isArray(obj)) {
    return Math.max(...obj.map(item => calculateDepth(item, currentDepth + 1)))
  }
  return Math.max(...Object.values(obj).map(value => calculateDepth(value, currentDepth + 1)))
}

const formatSize = (size) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/components/JsonPreview.vue`);
  if (props.data !== null) {
    jsonString.value = JSON.stringify(props.data, null, 2)
  }
})
</script>

<style scoped>
.json-preview {
  width: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.toolbar-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.json-size {
  font-size: 12px;
  color: #909399;
}

/* 预览模式 */
.preview-mode .json-container {
  max-height: 500px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.preview-mode pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-mode code {
  background: none;
  padding: 0;
}

/* 编辑模式 */
.edit-mode .json-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.edit-mode .el-textarea__inner {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;
}

/* 树形模式 */
.tree-mode .json-tree {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

/* 统计信息 */
.json-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats-label {
  color: #606266;
  font-size: 12px;
}

.stats-value {
  color: #303133;
  font-weight: 500;
  font-size: 12px;
}

/* 语法高亮 */
:deep(.hljs) {
  background: #f8f9fa !important;
  color: #303133;
}

:deep(.hljs-string) {
  color: #67c23a;
}

:deep(.hljs-number) {
  color: #409eff;
}

:deep(.hljs-boolean) {
  color: #e6a23c;
}

:deep(.hljs-null) {
  color: #909399;
}

:deep(.hljs-key) {
  color: #f56c6c;
}

:deep(.hljs-punctuation) {
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .editor-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .json-stats {
    flex-direction: column;
    gap: 8px;
  }

  .stats-item {
    justify-content: space-between;
  }
}
</style>