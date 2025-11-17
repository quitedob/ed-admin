<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <el-button-group>
          <el-button size="small" @click="insertFormat('bold')">
            <el-icon><Bold /></el-icon>
          </el-button>
          <el-button size="small" @click="insertFormat('italic')">
            <el-icon><Italic /></el-icon>
          </el-button>
          <el-button size="small" @click="insertFormat('underline')">
            <el-icon><Underline /></el-icon>
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-group">
        <el-button-group>
          <el-button size="small" @click="insertFormat('h1')">H1</el-button>
          <el-button size="small" @click="insertFormat('h2')">H2</el-button>
          <el-button size="small" @click="insertFormat('h3')">H3</el-button>
        </el-button-group>
      </div>

      <div class="toolbar-group">
        <el-button-group>
          <el-button size="small" @click="insertFormat('ul')">
            <el-icon><UnorderedList /></el-icon>
          </el-button>
          <el-button size="small" @click="insertFormat('ol')">
            <el-icon><OrderedList /></el-icon>
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-group">
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleImageSelect"
          accept="image/*"
        >
          <template #trigger>
            <el-button size="small">
              <el-icon><Picture /></el-icon>
              图片
            </el-button>
          </template>
        </el-upload>
      </div>

      <div class="toolbar-group">
        <el-button size="small" @click="insertFormat('code')">
          <el-icon><CodeBracket /></el-icon>
        </el-button>
      </div>

      <div class="toolbar-group">
        <el-button size="small" @click="clearFormat">清空</el-button>
      </div>
    </div>

    <textarea
      ref="editorRef"
      v-model="content"
      class="editor-textarea"
      :placeholder="placeholder"
      @input="handleInput"
    ></textarea>

    <div class="editor-preview">
      <div class="preview-label">预览</div>
      <div class="preview-content" v-html="renderPreview"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Bold,
  Italic,
  Underline,
  UnorderedList,
  OrderedList,
  Picture,
  CodeBracket
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue', 'upload'])

const editorRef = ref(null)
const content = ref(props.modelValue || '')

const renderPreview = computed(() => {
  // 简单的HTML渲染（实际项目中应使用更安全的方式）
  let html = content.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/\n/g, '<br>')
  return html
})

const handleInput = () => {
  emit('update:modelValue', content.value)
}

const insertFormat = (format) => {
  const textarea = editorRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  let insertText = ''

  switch (format) {
    case 'bold':
      insertText = `**${selectedText || '粗体'}**`
      break
    case 'italic':
      insertText = `*${selectedText || '斜体'}*`
      break
    case 'underline':
      insertText = `__${selectedText || '下划线'}__`
      break
    case 'h1':
      insertText = `# ${selectedText || '标题1'}`
      break
    case 'h2':
      insertText = `## ${selectedText || '标题2'}`
      break
    case 'h3':
      insertText = `### ${selectedText || '标题3'}`
      break
    case 'ul':
      insertText = `\n- ${selectedText || '列表项'}`
      break
    case 'ol':
      insertText = `\n1. ${selectedText || '列表项'}`
      break
    case 'code':
      insertText = `\`${selectedText || '代码'}\``
      break
  }

  if (insertText) {
    const newContent = content.value.substring(0, start) + insertText + content.value.substring(end)
    content.value = newContent
    emit('update:modelValue', newContent)

    // 重新定位光标
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + insertText.length
      textarea.selectionEnd = start + insertText.length
    }, 0)
  }
}

const handleImageSelect = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target.result
    const insertText = `![image](${imageUrl})`
    const textarea = editorRef.value
    const start = textarea.selectionStart
    const newContent = content.value.substring(0, start) + insertText + content.value.substring(start)
    content.value = newContent
    emit('update:modelValue', newContent)
    emit('upload', file.raw)
  }
  reader.readAsDataURL(file.raw)
}

const clearFormat = () => {
  content.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.rich-text-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 4px;
}

.editor-textarea {
  flex: 1;
  min-height: 200px;
  padding: 12px;
  border: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  resize: vertical;
  outline: none;
}

.editor-preview {
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.preview-label {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-light);
}

.preview-content {
  padding: 12px;
  min-height: 100px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.preview-content strong {
  font-weight: 600;
}

.preview-content em {
  font-style: italic;
}

.preview-content u {
  text-decoration: underline;
}

.preview-content br {
  display: block;
  height: 0.5em;
}
</style>
