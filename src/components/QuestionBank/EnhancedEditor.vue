<template>
  <div class="enhanced-editor">
    <!-- 编辑器工具栏和内容区 -->
    <div class="editor-container">
      <toolbar
        :editor="editorRef"
        :default-config="toolbarConfig"
        mode="default"
        class="editor-toolbar"
      />
      <editor
        :default-config="editorConfig"
        :model-value="modelValue"
        class="editor-content"
        @on-change="handleChange"
        @on-created="handleCreated"
        @on-focus="handleFocus"
        @on-blur="handleBlur"
      />
    </div>

    <!-- 教育工具面板 -->
    <div class="education-tools" v-show="showTools">
      <el-tabs v-model="activeTool" type="card" class="tools-tabs">
        <!-- 数学公式面板 -->
        <el-tab-pane label="数学公式" name="formula">
          <div class="formula-panel">
            <div class="formula-categories">
              <el-select
                v-model="formulaCategory"
                placeholder="选择公式类别"
                @change="handleFormulaCategoryChange"
                style="width: 150px; margin-bottom: 16px"
              >
                <el-option label="基础运算" value="basic" />
                <el-option label="分数根式" value="fraction" />
                <el-option label="上下标" value="subscript" />
                <el-option label="希腊字母" value="greek" />
                <el-option label="积分求和" value="integral" />
                <el-option label="矩阵行列式" value="matrix" />
              </el-select>
            </div>

            <div class="formula-grid">
              <div
                v-for="formula in currentFormulas"
                :key="formula.id"
                class="formula-item"
                @click="insertFormula(formula)"
              >
                <div class="formula-preview">{{ formula.preview }}</div>
                <div class="formula-name">{{ formula.name }}</div>
              </div>
            </div>

            <div class="custom-formula">
              <el-input
                v-model="customFormula"
                placeholder="输入LaTeX公式（如：x^2 + y^2 = z^2）"
                @keyup.enter="insertCustomFormula"
              >
                <template #append>
                  <el-button @click="insertCustomFormula">插入</el-button>
                </template>
              </el-input>
            </div>
          </div>
        </el-tab-pane>

        <!-- 代码片段面板 -->
        <el-tab-pane label="代码片段" name="code">
          <div class="code-panel">
            <div class="code-languages">
              <el-select
                v-model="codeLanguage"
                placeholder="选择编程语言"
                @change="handleLanguageChange"
                style="width: 150px; margin-bottom: 16px"
              >
                <el-option label="JavaScript" value="javascript" />
                <el-option label="Python" value="python" />
                <el-option label="Java" value="java" />
                <el-option label="C++" value="cpp" />
                <el-option label="HTML" value="html" />
                <el-option label="CSS" value="css" />
                <el-option label="SQL" value="sql" />
                <el-option label="JSON" value="json" />
              </el-select>
            </div>

            <div class="code-templates">
              <div
                v-for="template in codeTemplates"
                :key="template.id"
                class="code-template"
                @click="insertCodeTemplate(template)"
              >
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>

            <div class="custom-code">
              <el-input
                v-model="customCode"
                type="textarea"
                :rows="6"
                placeholder="输入代码..."
                style="margin-bottom: 12px"
              />
              <el-button type="primary" @click="insertCustomCode" style="width: 100%">
                插入代码块
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 表格工具面板 -->
        <el-tab-pane label="表格工具" name="table">
          <div class="table-panel">
            <div class="table-size-selector">
              <div class="size-grid">
                <div
                  v-for="row in 10"
                  :key="row"
                  class="size-row"
                >
                  <div
                    v-for="col in 10"
                    :key="col"
                    class="size-cell"
                    :class="{
                      'selected': selectedTableSize.rows >= row && selectedTableSize.cols >= col
                    }"
                    @mouseover="selectTableSize(row, col)"
                    @click="insertTable(row, col)"
                  ></div>
                </div>
              </div>
              <div class="size-info">
                {{ selectedTableSize.rows }} × {{ selectedTableSize.cols }} 表格
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 重点标注面板 -->
        <el-tab-pane label="重点标注" name="highlight">
          <div class="highlight-panel">
            <div class="highlight-styles">
              <div
                v-for="style in highlightStyles"
                :key="style.name"
                class="highlight-style"
                :class="{ 'active': currentHighlightStyle === style.name }"
                :style="{ backgroundColor: style.color }"
                @click="selectHighlightStyle(style)"
              >
                {{ style.label }}
              </div>
            </div>

            <div class="highlight-preview">
              <div
                class="preview-text"
                :style="{ backgroundColor: currentHighlightColor }"
              >
                这是重点标注的预览效果
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 资源选择器 -->
    <SelectorResource
      v-if="resourceSelectorVisible"
      :title="resourceSelectorTitle"
      :resource-type="resourceType"
      :multiple="resourceMultiple"
      :visible="resourceSelectorVisible"
      @close="handleResourceCallback"
    />
  </div>
</template>

<script setup>
import { ref, shallowRef, onBeforeUnmount, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import registerMenu from '../Editor/index.js'
import SelectorResource from '@/components/Selector/Resource/index.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 400
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  showTools: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

// 编辑器相关
const editorRef = shallowRef()
const editorConfig = ref({
  placeholder: props.placeholder,
  autoFocus: false,
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload/image',
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5M
      allowedFileTypes: ['image/*'],
      metaWithUrl: true,
      withCredentials: false,
      onChange(file) {
        console.log('图片上传中...', file)
      },
      onSuccess(file, res) {
        console.log('图片上传成功', res)
      },
      onFailed(file, res) {
        console.error('图片上传失败', res)
        ElMessage.error('图片上传失败')
      },
      onError(file, err, res) {
        console.error('图片上传错误', err)
        ElMessage.error('图片上传错误')
      },
      customInsert(res, insertFn) {
        insertFn(res.url, res.alt, res.href)
      }
    }
  }
})

const toolbarConfig = ref({
  excludeKeys: ['insertVideo', 'fullScreen']
})

// 教育工具相关
const activeTool = ref('formula')
const showTools = ref(props.showTools)

// 数学公式相关
const formulaCategory = ref('basic')
const customFormula = ref('')
const currentHighlightStyle = ref('yellow')

const formulaCategories = {
  basic: [
    { id: '1', name: '加法', preview: 'a + b', latex: 'a + b' },
    { id: '2', name: '减法', preview: 'a - b', latex: 'a - b' },
    { id: '3', name: '乘法', preview: 'a × b', latex: 'a \\times b' },
    { id: '4', name: '除法', preview: 'a ÷ b', latex: 'a \\div b' },
    { id: '5', name: '等于', preview: 'a = b', latex: 'a = b' },
    { id: '6', name: '不等于', preview: 'a ≠ b', latex: 'a \\neq b' }
  ],
  fraction: [
    { id: '7', name: '分数', preview: 'a/b', latex: '\\frac{a}{b}' },
    { id: '8', name: '根号', preview: '√a', latex: '\\sqrt{a}' },
    { id: '9', name: 'n次根号', preview: 'ⁿ√a', latex: '\\sqrt[n]{a}' }
  ],
  subscript: [
    { id: '10', name: '上标', preview: 'a²', latex: 'a^2' },
    { id: '11', name: '下标', preview: 'a₁', latex: 'a_1' },
    { id: '12', name: '组合上下标', preview: 'a₁²', latex: 'a_1^2' }
  ]
}

const currentFormulas = computed(() => {
  return formulaCategories[formulaCategory.value] || formulaCategories.basic
})

// 代码相关
const codeLanguage = ref('javascript')
const customCode = ref('')

const codeTemplates = {
  javascript: [
    {
      id: '1',
      name: '函数定义',
      description: '定义一个JavaScript函数',
      code: `function functionName(parameters) {
  // 函数体
  return result;
}`
    },
    {
      id: '2',
      name: 'for循环',
      description: 'JavaScript for循环结构',
      code: `for (let i = 0; i < array.length; i++) {
  // 循环体
}`
    },
    {
      id: '3',
      name: '数组方法',
      description: '常用数组操作方法',
      code: `// map方法
const newArray = array.map(item => item * 2);

// filter方法
const filtered = array.filter(item => item > 0);

// reduce方法
const sum = array.reduce((acc, item) => acc + item, 0);`
    }
  ],
  python: [
    {
      id: '4',
      name: '函数定义',
      description: '定义一个Python函数',
      code: `def function_name(parameters):
    """函数文档字符串"""
    # 函数体
    return result`
    },
    {
      id: '5',
      name: '列表推导式',
      description: 'Python列表推导式',
      code: `# 基本列表推导式
squares = [x**2 for x in range(10)]

# 带条件的列表推导式
evens = [x for x in range(20) if x % 2 == 0]`
    }
  ]
}

const currentCodeTemplates = computed(() => {
  return codeTemplates[codeLanguage.value] || codeTemplates.javascript
})

// 表格相关
const selectedTableSize = ref({ rows: 3, cols: 3 })

// 高亮样式
const highlightStyles = [
  { name: 'yellow', label: '黄色', color: '#fff3cd' },
  { name: 'green', label: '绿色', color: '#d4edda' },
  { name: 'blue', label: '蓝色', color: '#d1ecf1' },
  { name: 'red', label: '红色', color: '#f8d7da' },
  { name: 'purple', label: '紫色', color: '#e2d9f3' }
]

const currentHighlightColor = computed(() => {
  const style = highlightStyles.find(s => s.name === currentHighlightStyle.value)
  return style ? style.color : '#fff3cd'
})

// 资源选择器相关
const resourceSelectorVisible = ref(false)
const resourceSelectorTitle = ref('')
const resourceType = ref(4) // 图片类型
const resourceMultiple = ref(true)

// 方法
const handleChange = (editor) => {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

const handleCreated = (editor) => {
  editorRef.value = editor
  registerMenu(editorRef.value, toolbarConfig.value)
  initMenuEvents()
}

const handleFocus = (editor) => {
  emit('focus', editor)
}

const handleBlur = (editor) => {
  emit('blur', editor)
}

const initMenuEvents = () => {
  const editor = editorRef.value

  // 图片菜单事件
  editor.on('PicMenuClick', () => {
    resourceSelectorTitle.value = '选择图片'
    resourceType.value = 4
    resourceMultiple.value = true
    resourceSelectorVisible.value = true
  })

  // 公式菜单事件
  editor.on('FormulaMenuClick', () => {
    activeTool.value = 'formula'
    showTools.value = true
  })

  // 代码菜单事件
  editor.on('CodeMenuClick', () => {
    activeTool.value = 'code'
    showTools.value = true
  })

  // 表格菜单事件
  editor.on('TableMenuClick', () => {
    activeTool.value = 'table'
    showTools.value = true
  })

  // 高亮菜单事件
  editor.on('HighlightMenuClick', () => {
    activeTool.value = 'highlight'
    showTools.value = true
  })
}

// 数学公式相关方法
const handleFormulaCategoryChange = () => {
  // 切换公式类别
}

const insertFormula = (formula) => {
  const html = `<span class="math-formula" data-latex="${formula.latex}">${formula.preview}</span>`
  editorRef.value.dangerouslyInsertHtml(html)
  ElMessage.success('公式插入成功')
}

const insertCustomFormula = () => {
  if (!customFormula.value.trim()) {
    ElMessage.warning('请输入LaTeX公式')
    return
  }

  const html = `<span class="math-formula" data-latex="${customFormula.value}">${customFormula.value}</span>`
  editorRef.value.dangerouslyInsertHtml(html)
  customFormula.value = ''
  ElMessage.success('公式插入成功')
}

// 代码相关方法
const handleLanguageChange = () => {
  // 切换编程语言
}

const insertCodeTemplate = (template) => {
  const html = `<pre><code class="language-${codeLanguage.value}">${escapeHtml(template.code)}</code></pre>`
  editorRef.value.dangerouslyInsertHtml(html)
  ElMessage.success('代码模板插入成功')
}

const insertCustomCode = () => {
  if (!customCode.value.trim()) {
    ElMessage.warning('请输入代码内容')
    return
  }

  const html = `<pre><code class="language-${codeLanguage.value}">${escapeHtml(customCode.value)}</code></pre>`
  editorRef.value.dangerouslyInsertHtml(html)
  customCode.value = ''
  ElMessage.success('代码块插入成功')
}

// 表格相关方法
const selectTableSize = (rows, cols) => {
  selectedTableSize.value = { rows, cols }
}

const insertTable = (rows, cols) => {
  let tableHtml = '<table border="1">'
  for (let i = 0; i < rows; i++) {
    tableHtml += '<tr>'
    for (let j = 0; j < cols; j++) {
      tableHtml += '<td></td>'
    }
    tableHtml += '</tr>'
  }
  tableHtml += '</table>'

  editorRef.value.dangerouslyInsertHtml(tableHtml)
  ElMessage.success(`${rows}×${cols}表格插入成功`)
}

// 高亮相关方法
const selectHighlightStyle = (style) => {
  currentHighlightStyle.value = style.name

  // 如果有选中的文本，应用高亮
  const editor = editorRef.value
  const selectedText = editor.getSelectionText()
  if (selectedText) {
    const html = `<span class="highlight" data-style="${style.name}" style="background-color: ${style.color}">${selectedText}</span>`
    editor.dangerouslyInsertHtml(html)
    ElMessage.success('重点标注应用成功')
  }
}

// 资源选择器回调
const handleResourceCallback = (resources) => {
  resourceSelectorVisible.value = false
  if (resources && resources.length > 0) {
    const editor = editorRef.value
    resources.forEach(resource => {
      const html = `<img src="${resource.resourceUrl}" alt="${resource.resourceName || ''}" />`
      editor.dangerouslyInsertHtml(html)
    })
    ElMessage.success('图片插入成功')
  }
}

// 工具方法
const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
.enhanced-editor {
  border: 1px solid var(--color-border-lighter);
  border-radius: 8px;
  overflow: hidden;

  .editor-container {
    .editor-toolbar {
      border-bottom: 1px solid var(--color-border-lighter);
    }

    .editor-content {
      min-height: v-bind('props.height + "px"');

      :deep(.w-e-text-container) {
        min-height: v-bind('(props.height - 40) + "px"');
      }
    }
  }

  .education-tools {
    border-top: 1px solid var(--color-border-lighter);
    background: var(--color-bg-secondary);

    .tools-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        background: white;
      }

      :deep(.el-tabs__content) {
        padding: 20px;
      }
    }

    // 数学公式面板样式
    .formula-panel {
      .formula-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 20px;

        .formula-item {
          padding: 12px;
          border: 1px solid var(--color-border-lighter);
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--color-primary);
            background: var(--color-primary-light-9);
          }

          .formula-preview {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 6px;
          }

          .formula-name {
            font-size: 12px;
            color: var(--color-text-secondary);
          }
        }
      }
    }

    // 代码面板样式
    .code-panel {
      .code-templates {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        margin-bottom: 20px;

        .code-template {
          padding: 16px;
          border: 1px solid var(--color-border-lighter);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--color-primary);
            background: var(--color-primary-light-9);
          }

          .template-name {
            font-weight: 600;
            color: var(--color-text-primary);
            margin-bottom: 6px;
          }

          .template-desc {
            font-size: 12px;
            color: var(--color-text-secondary);
          }
        }
      }
    }

    // 表格面板样式
    .table-panel {
      .table-size-selector {
        .size-grid {
          display: inline-block;
          border: 1px solid var(--color-border-lighter);
          border-radius: 4px;
          overflow: hidden;

          .size-row {
            display: flex;

            .size-cell {
              width: 30px;
              height: 30px;
              border: 1px solid var(--color-border-lighter);
              cursor: pointer;
              background: white;

              &:hover {
                background: var(--color-primary-light-9);
              }

              &.selected {
                background: var(--color-primary);
                border-color: var(--color-primary);
              }
            }
          }
        }

        .size-info {
          margin-top: 12px;
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 14px;
        }
      }
    }

    // 高亮面板样式
    .highlight-panel {
      .highlight-styles {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;

        .highlight-style {
          padding: 8px 16px;
          border: 2px solid var(--color-border-lighter);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          min-width: 80px;

          &:hover {
            transform: translateY(-2px);
          }

          &.active {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }
      }

      .highlight-preview {
        padding: 20px;
        border: 1px solid var(--color-border-lighter);
        border-radius: 6px;
        text-align: center;

        .preview-text {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
      }
    }
  }
}

// 全局样式，用于编辑器内容
:deep(.math-formula) {
  display: inline-block;
  padding: 4px 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-lighter);
  border-radius: 4px;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  margin: 0 4px;
}

:deep(.highlight) {
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 600;
}

:deep(pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
}

:deep(table) {
  border-collapse: collapse;
  margin: 12px 0;

  td, th {
    border: 1px solid var(--color-border-lighter);
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: var(--color-bg-secondary);
    font-weight: 600;
  }
}
</style>