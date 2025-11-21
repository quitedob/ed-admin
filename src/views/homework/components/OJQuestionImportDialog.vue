<template>
  <el-dialog
    v-model="visible"
    title="OJ题目导入"
    width="800px"
    @close="handleClose"
  >
    <div class="oj-import-dialog">
      <!-- 导入方式选择 -->
      <div class="import-method">
        <h4>选择导入方式</h4>
        <el-radio-group v-model="importMethod" @change="handleMethodChange">
          <el-radio-button label="file">文件导入</el-radio-button>
          <el-radio-button label="url">URL导入</el-radio-button>
          <el-radio-button label="manual">手动输入</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 文件导入 -->
      <div v-if="importMethod === 'file'" class="import-section">
        <h4>上传题目文件</h4>
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          accept=".json,.xml,.txt"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .json/.xml/.txt 格式，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>
      </div>

      <!-- URL导入 -->
      <div v-if="importMethod === 'url'" class="import-section">
        <h4>OJ平台题目链接</h4>
        <el-form :model="urlForm" label-width="100px">
          <el-form-item label="题目URL">
            <el-input
              v-model="urlForm.questionUrl"
              placeholder="请输入OJ平台的题目链接"
              clearable
            />
          </el-form-item>
          <el-form-item label="平台类型">
            <el-select v-model="urlForm.platform" placeholder="选择OJ平台">
              <el-option label="LeetCode" value="leetcode" />
              <el-option label="力扣" value="leetcode-cn" />
              <el-option label="牛客网" value="nowcoder" />
              <el-option label="洛谷" value="luogu" />
              <el-option label="Codeforces" value="codeforces" />
              <el-option label="AtCoder" value="atcoder" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="题目类型">
            <el-select v-model="urlForm.questionType" placeholder="选择题目类型">
              <el-option label="编程题" value="programming" />
              <el-option label="算法题" value="algorithm" />
              <el-option label="数据结构" value="datastructure" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleFetchFromUrl" :loading="fetching">
          <el-icon><Download /></el-icon>
          获取题目信息
        </el-button>
      </div>

      <!-- 手动输入 -->
      <div v-if="importMethod === 'manual'" class="import-section">
        <h4>手动输入题目信息</h4>
        <el-form :model="manualForm" :rules="manualRules" ref="manualFormRef" label-width="100px">
          <el-form-item label="题目标题" prop="title">
            <el-input v-model="manualForm.title" placeholder="请输入题目标题" />
          </el-form-item>
          <el-form-item label="题目描述" prop="description">
            <el-input
              v-model="manualForm.description"
              type="textarea"
              :rows="6"
              placeholder="请输入题目描述"
            />
          </el-form-item>
          <el-form-item label="输入格式" prop="inputFormat">
            <el-input
              v-model="manualForm.inputFormat"
              type="textarea"
              :rows="3"
              placeholder="请输入输入格式说明"
            />
          </el-form-item>
          <el-form-item label="输出格式" prop="outputFormat">
            <el-input
              v-model="manualForm.outputFormat"
              type="textarea"
              :rows="3"
              placeholder="请输入输出格式说明"
            />
          </el-form-item>
          <el-form-item label="样例输入" prop="sampleInput">
            <el-input
              v-model="manualForm.sampleInput"
              type="textarea"
              :rows="3"
              placeholder="请输入样例输入"
            />
          </el-form-item>
          <el-form-item label="样例输出" prop="sampleOutput">
            <el-input
              v-model="manualForm.sampleOutput"
              type="textarea"
              :rows="3"
              placeholder="请输入样例输出"
            />
          </el-form-item>
          <el-form-item label="难度等级">
            <el-rate v-model="manualForm.difficulty" :max="5" />
          </el-form-item>
          <el-form-item label="时间限制">
            <el-input-number
              v-model="manualForm.timeLimit"
              :min="100"
              :max="10000"
              :step="100"
            />
            <span class="unit">ms</span>
          </el-form-item>
          <el-form-item label="内存限制">
            <el-input-number
              v-model="manualForm.memoryLimit"
              :min="64"
              :max="1024"
              :step="64"
            />
            <span class="unit">MB</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 测试用例配置 -->
      <div v-if="importMethod !== 'file' || parsedTestData" class="test-case-section">
        <h4>测试用例配置</h4>
        <div class="test-case-actions">
          <el-button type="primary" size="small" @click="handleAddTestCase">
            <el-icon><Plus /></el-icon>
            添加测试用例
          </el-button>
          <el-button size="small" @click="handleGenerateTestCase">
            <el-icon><Magic /></el-icon>
            生成测试用例
          </el-button>
        </div>

        <el-table :data="testCases" style="margin-top: 16px">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="input" label="输入数据" min-width="200">
            <template #default="{ row }">
              <el-input
                v-model="row.input"
                type="textarea"
                :rows="2"
                placeholder="输入数据"
              />
            </template>
          </el-table-column>
          <el-table-column prop="output" label="期望输出" min-width="200">
            <template #default="{ row }">
              <el-input
                v-model="row.output"
                type="textarea"
                :rows="2"
                placeholder="期望输出"
              />
            </template>
          </el-table-column>
          <el-table-column label="分值" width="100">
            <template #default="{ row }">
              <el-input-number v-model="row.score" :min="1" :max="100" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button
                link
                type="danger"
                size="small"
                @click="handleRemoveTestCase($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 预览区域 -->
      <div v-if="previewData" class="preview-section">
        <h4>题目预览</h4>
        <el-card class="preview-card">
          <h5>{{ previewData.title }}</h5>
          <div class="preview-content">
            <p><strong>描述：</strong>{{ previewData.description }}</p>
            <p v-if="previewData.inputFormat"><strong>输入格式：</strong>{{ previewData.inputFormat }}</p>
            <p v-if="previewData.outputFormat"><strong>输出格式：</strong>{{ previewData.outputFormat }}</p>
            <p v-if="previewData.sampleInput"><strong>样例输入：</strong></p>
            <pre v-if="previewData.sampleInput">{{ previewData.sampleInput }}</pre>
            <p v-if="previewData.sampleOutput"><strong>样例输出：</strong></p>
            <pre v-if="previewData.sampleOutput">{{ previewData.sampleOutput }}</pre>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">
          导入题目
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UploadFilled,
  Download,
  Plus,
  Magic
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'import'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 响应式数据
const importMethod = ref('file')
const fileList = ref([])
const fetching = ref(false)
const importing = ref(false)
const parsedTestData = ref(null)
const previewData = ref(null)

const urlForm = ref({
  questionUrl: '',
  platform: 'leetcode',
  questionType: 'programming'
})

const manualForm = ref({
  title: '',
  description: '',
  inputFormat: '',
  outputFormat: '',
  sampleInput: '',
  sampleOutput: '',
  difficulty: 3,
  timeLimit: 1000,
  memoryLimit: 256
})

const manualRules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入题目描述', trigger: 'blur' }]
}

const testCases = ref([
  {
    input: '',
    output: '',
    score: 10
  }
])

const manualFormRef = ref(null)

// 方法
const handleMethodChange = (method) => {
  // 清空之前的数据
  fileList.value = []
  parsedTestData.value = null
  previewData.value = null
  testCases.value = [{ input: '', output: '', score: 10 }]
}

const handleFileChange = (file) => {
  console.log('文件变化:', file)
  // 这里可以添加文件解析逻辑
  parseFile(file.raw)
}

const parseFile = async (file) => {
  try {
    const text = await file.text()
    console.log('文件内容:', text)

    // 简单的JSON解析示例
    if (file.name.endsWith('.json')) {
      const data = JSON.parse(text)
      parsedTestData.value = data.testCases || []
      previewData.value = {
        title: data.title,
        description: data.description,
        inputFormat: data.inputFormat,
        outputFormat: data.outputFormat,
        sampleInput: data.sampleInput,
        sampleOutput: data.sampleOutput
      }

      if (parsedTestData.value.length > 0) {
        testCases.value = parsedTestData.value.map(tc => ({
          input: tc.input,
          output: tc.output,
          score: tc.score || 10
        }))
      }

      ElMessage.success('文件解析成功')
    }
  } catch (error) {
    ElMessage.error('文件解析失败：' + error.message)
  }
}

const handleFetchFromUrl = async () => {
  if (!urlForm.value.questionUrl) {
    ElMessage.warning('请输入题目URL')
    return
  }

  fetching.value = true
  try {
    // 模拟从URL获取题目信息
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟获取到的数据
    const mockData = {
      title: '两数之和',
      description: '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。',
      inputFormat: '第一行包含整数 n 和 target，第二行包含 n 个整数。',
      outputFormat: '输出两个整数，表示找到的下标。',
      sampleInput: '4 9\n2 7 11 15',
      sampleOutput: '0 1'
    }

    previewData.value = mockData
    ElMessage.success('题目信息获取成功')
  } catch (error) {
    ElMessage.error('获取题目信息失败：' + error.message)
  } finally {
    fetching.value = false
  }
}

const handleAddTestCase = () => {
  testCases.value.push({
    input: '',
    output: '',
    score: 10
  })
}

const handleRemoveTestCase = (index) => {
  if (testCases.value.length > 1) {
    testCases.value.splice(index, 1)
  } else {
    ElMessage.warning('至少需要一个测试用例')
  }
}

const handleGenerateTestCase = () => {
  // 根据样例生成测试用例
  if (manualForm.value.sampleInput && manualForm.value.sampleOutput) {
    testCases.value.push({
      input: manualForm.value.sampleInput,
      output: manualForm.value.sampleOutput,
      score: 20
    })
    ElMessage.success('已生成样例测试用例')
  } else {
    ElMessage.warning('请先填写样例输入和输出')
  }
}

const handleImport = async () => {
  // 验证
  if (importMethod.value === 'manual') {
    try {
      await manualFormRef.value.validate()
    } catch (error) {
      return
    }
  }

  if (importMethod.value === 'url' && !urlForm.value.questionUrl) {
    ElMessage.warning('请输入题目URL')
    return
  }

  if (importMethod.value === 'file' && fileList.value.length === 0) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  // 验证测试用例
  const validTestCases = testCases.value.filter(tc => tc.input && tc.output)
  if (validTestCases.length === 0) {
    ElMessage.warning('请至少添加一个完整的测试用例')
    return
  }

  importing.value = true
  try {
    // 构建导入数据
    let importData = {}

    if (importMethod.value === 'file') {
      importData = {
        type: 'file',
        file: fileList.value[0].raw,
        testCases: validTestCases
      }
    } else if (importMethod.value === 'url') {
      importData = {
        type: 'url',
        url: urlForm.value.questionUrl,
        platform: urlForm.value.platform,
        testCases: validTestCases
      }
    } else {
      importData = {
        type: 'manual',
        questionData: manualForm.value,
        testCases: validTestCases
      }
    }

    // 发送导入事件
    emit('import', importData)

    ElMessage.success('题目导入成功')
    handleClose()
  } catch (error) {
    ElMessage.error('题目导入失败：' + error.message)
  } finally {
    importing.value = false
  }
}

const handleClose = () => {
  visible.value = false

  // 重置数据
  importMethod.value = 'file'
  fileList.value = []
  parsedTestData.value = null
  previewData.value = null
  testCases.value = [{ input: '', output: '', score: 10 }]
  urlForm.value = {
    questionUrl: '',
    platform: 'leetcode',
    questionType: 'programming'
  }
}

// 监听器
watch(() => props.modelValue, (val) => {
  if (!val) {
    handleClose()
  }
})
</script>

<style lang="scss" scoped>
.oj-import-dialog {
  .import-method {
    margin-bottom: 24px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }
  }

  .import-section {
    margin-bottom: 24px;
    padding: 20px;
    background: var(--color-bg-secondary);
    border-radius: 8px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--color-text-primary);
    }
  }

  .test-case-section {
    margin-bottom: 24px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }

    .test-case-actions {
      margin-bottom: 16px;
    }
  }

  .preview-section {
    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--color-text-primary);
    }

    .preview-card {
      h5 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--color-text-primary);
      }

      .preview-content {
        p {
          margin-bottom: 12px;
          line-height: 1.5;

          strong {
            color: var(--color-text-primary);
          }
        }

        pre {
          background: var(--color-bg-secondary);
          padding: 12px;
          border-radius: 4px;
          margin: 8px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.4;
        }
      }
    }
  }

  .unit {
    margin-left: 8px;
    color: var(--color-text-secondary);
    font-size: 14px;
  }

  .upload-demo {
    width: 100%;
  }
}
</style>