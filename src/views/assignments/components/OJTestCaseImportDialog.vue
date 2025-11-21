<template>
  <el-dialog
    v-model="visible"
    title="导入OJ测试用例"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="import-dialog">
      <el-alert
        title="JSON格式说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #default>
          <div class="format-tips">
            <p>✓ 支持导入测试用例JSON，自动覆盖OJ题目配置</p>
            <p>✓ 只需输入testCases部分，其他字段保持不变</p>
          </div>
        </template>
      </el-alert>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="JSON导入" name="json">
          <el-input
            v-model="jsonInput"
            type="textarea"
            :rows="15"
            placeholder='请粘贴测试用例JSON，例如：
{
  "testCases": [
    {
      "id": "tc001",
      "input": "1 2",
      "output": "3",
      "isSample": true
    }
  ]
}'
          />
          
          <div class="action-buttons">
            <el-button @click="handleValidateJson">验证JSON</el-button>
            <el-button type="primary" @click="handleImportJson">导入并覆盖</el-button>
          </div>

          <div v-if="validationResult" class="validation-result">
            <el-alert
              :title="validationResult.title"
              :type="validationResult.type"
              :closable="false"
            >
              <div v-html="validationResult.message"></div>
            </el-alert>
          </div>
        </el-tab-pane>

        <el-tab-pane label="示例格式" name="example">
          <div class="example-section">
            <h4>基础示例（3个测试点，总分20分）</h4>
            <pre class="example-code">{{ exampleBasic }}</pre>
            
            <h4 style="margin-top: 20px">完整示例（10个测试点，总分100分）</h4>
            <pre class="example-code">{{ exampleFull }}</pre>
            
            <el-button @click="handleCopyExample" style="margin-top: 12px">
              复制完整示例
            </el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="字段说明" name="docs">
          <div class="docs-section">
            <h4>testCases 数组字段说明</h4>
            <el-table :data="fieldDocs" border style="margin-top: 12px">
              <el-table-column prop="field" label="字段名" width="120" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>

            <h4 style="margin-top: 20px">注意事项</h4>
            <ul class="tips-list">
              <li>isSample为true的测试点会显示给学生作为示例</li>
              <li>id可以省略，系统会自动生成（tc001, tc002...）</li>
              <li>input和output支持多行文本</li>
              <li>导入后会完全覆盖原有测试用例</li>
            </ul>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'import'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('json')
const jsonInput = ref('')
const validationResult = ref(null)

const exampleBasic = `{
  "testCases": [
    {
      "id": "tc001",
      "input": "1 2",
      "output": "3",
      "isSample": true
    },
    {
      "id": "tc002",
      "input": "10 20",
      "output": "30",
      "isSample": false
    },
    {
      "id": "tc003",
      "input": "100 200",
      "output": "300",
      "isSample": false
    }
  ]
}`

const exampleFull = `{
  "testCases": [
    {
      "id": "tc001",
      "input": "1 2",
      "output": "3",
      "isSample": true
    },
    {
      "id": "tc002",
      "input": "10 20",
      "output": "30",
      "isSample": false
    },
    {
      "id": "tc003",
      "input": "100 200",
      "output": "300",
      "isSample": false
    },
    {
      "id": "tc004",
      "input": "-5 10",
      "output": "5",
      "isSample": false
    },
    {
      "id": "tc005",
      "input": "0 0",
      "output": "0",
      "isSample": false
    },
    {
      "id": "tc006",
      "input": "999 1",
      "output": "1000",
      "isSample": false
    },
    {
      "id": "tc007",
      "input": "-100 -200",
      "output": "-300",
      "isSample": false
    },
    {
      "id": "tc008",
      "input": "12345 67890",
      "output": "80235",
      "isSample": false
    },
    {
      "id": "tc009",
      "input": "1000000 2000000",
      "output": "3000000",
      "isSample": false
    },
    {
      "id": "tc010",
      "input": "-999999 999999",
      "output": "0",
      "isSample": false
    }
  ]
}`

const fieldDocs = [
  {
    field: 'id',
    type: 'string',
    required: false,
    description: '测试点唯一标识，可省略自动生成'
  },
  {
    field: 'input',
    type: 'string',
    required: true,
    description: '测试输入数据'
  },
  {
    field: 'output',
    type: 'string',
    required: true,
    description: '期望输出结果'
  },
  {
  },
  {
    field: 'isSample',
    type: 'boolean',
    required: false,
    description: '是否为示例用例，默认false'
  }
]

const handleValidateJson = () => {
  try {
    if (!jsonInput.value.trim()) {
      validationResult.value = {
        type: 'warning',
        title: '验证失败',
        message: '请输入JSON内容'
      }
      return
    }

    const data = JSON.parse(jsonInput.value)
    
    if (!data.testCases || !Array.isArray(data.testCases)) {
      validationResult.value = {
        type: 'error',
        title: '格式错误',
        message: 'JSON必须包含testCases数组'
      }
      return
    }

    if (data.testCases.length === 0) {
      validationResult.value = {
        type: 'warning',
        title: '验证失败',
        message: '测试用例数组不能为空'
      }
      return
    }

    // 验证每个测试用例
    const errors = []
    let totalScore = 0
    let sampleCount = 0
    
    data.testCases.forEach((tc, index) => {
      if (tc.input === undefined || tc.input === null) {
        errors.push(`测试用例${index + 1}: 缺少input字段`)
      }
      if (tc.output === undefined || tc.output === null) {
        errors.push(`测试用例${index + 1}: 缺少output字段`)
      }
      } else {
      }
      if (tc.isSample) {
        sampleCount++
      }
    })

    if (errors.length > 0) {
      validationResult.value = {
        type: 'error',
        title: '验证失败',
        message: errors.join('<br>')
      }
      return
    }

    validationResult.value = {
      type: 'success',
      title: '✓ 验证成功',
      message: `
        <p><strong>测试用例数量:</strong> ${data.testCases.length} 个</p>
        <p><strong>总分:</strong> ${totalScore} 分</p>
        <p><strong>示例用例:</strong> ${sampleCount} 个</p>
        <p><strong>隐藏用例:</strong> ${data.testCases.length - sampleCount} 个</p>
      `
    }
  } catch (error) {
    validationResult.value = {
      type: 'error',
      title: 'JSON解析失败',
      message: error.message
    }
  }
}

const handleImportJson = () => {
  try {
    if (!jsonInput.value.trim()) {
      ElMessage.warning('请输入JSON内容')
      return
    }

    const data = JSON.parse(jsonInput.value)
    
    if (!data.testCases || !Array.isArray(data.testCases) || data.testCases.length === 0) {
      ElMessage.error('JSON格式不正确')
      return
    }

    // 验证并规范化数据
    const testCases = data.testCases.map((tc, index) => ({
      id: tc.id || `tc${String(index + 1).padStart(3, '0')}`,
      input: String(tc.input !== undefined ? tc.input : ''),
      output: String(tc.output !== undefined ? tc.output : ''),
      isSample: Boolean(tc.isSample)
    }))


    emit('import', {
      testCases,
      totalScore
    })

    ElMessage.success({
      message: `成功导入 ${testCases.length} 个测试用例，总分 ${totalScore} 分`,
      duration: 3000
    })
    
    visible.value = false
    resetDialog()
  } catch (error) {
    ElMessage.error('导入失败: ' + error.message)
  }
}

const handleCopyExample = () => {
  navigator.clipboard.writeText(exampleFull).then(() => {
    ElMessage.success('示例已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const resetDialog = () => {
  jsonInput.value = ''
  validationResult.value = null
  activeTab.value = 'json'
}

defineExpose({
  resetDialog
})
</script>

<style lang="scss" scoped>
.import-dialog {
  .format-tips {
    font-size: 13px;
    line-height: 1.8;
    
    p {
      margin: 4px 0;
    }
  }

  .action-buttons {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }

  .validation-result {
    margin-top: 16px;
  }

  .example-section {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .example-code {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
      margin: 0;
      border: 1px solid #e4e7ed;
    }
  }

  .docs-section {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .tips-list {
      padding-left: 20px;
      
      li {
        margin: 8px 0;
        line-height: 1.6;
        color: #606266;
      }
    }
  }
}
</style>
