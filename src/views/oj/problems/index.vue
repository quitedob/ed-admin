<template>
  <div class="app-container">
    <!-- 题库管理器 -->
    <QuestionBankManager
      ref="qbManager"
      type="homework"
      @add-to-homework="handleAddToHomework"
      @add-to-exam="handleAddToExam"
      @view-detail="handleViewDetail"
    />

    <!-- 原有的OJ题目管理卡片（保留用于管理功能） -->
    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>OJ题目管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增题目</el-button>
            <el-button type="success" @click="handleImport">批量导入</el-button>
            <el-button @click="handleExport">导出题目</el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="题目总数" :value="statsData.totalProblems" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="简单题目" :value="statsData.easyProblems" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="中等题目" :value="statsData.mediumProblems" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="困难题目" :value="statsData.hardProblems" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="总提交数" :value="statsData.totalSubmissions" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="通过率" :value="statsData.acceptanceRate" suffix="%" />
          </el-col>
        </el-row>
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索题目标题、ID、标签..."
          clearable
          @keyup.enter="handleQuery"
          class="search-input"
        >
          <template #append>
            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 表格操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            @click="handleBatchCopy"
            :disabled="multiple"
          >批量复制</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            @click="handleBatchDelete"
            :disabled="multiple"
          >批量删除</el-button>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="problemList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="题目ID" align="center" prop="id" width="80" />
        <el-table-column label="题目标题" align="center" prop="title" show-overflow-tooltip>
          <template #default="scope">
            <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="难度" align="center" prop="difficulty" width="80">
          <template #default="scope">
            <el-tag :type="getDifficultyTagType(scope.row.difficulty)">
              {{ getDifficultyLabel(scope.row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" align="center" prop="category" width="100">
          <template #default="scope">
            <el-tag type="info">{{ getCategoryLabel(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" align="center" prop="tags" width="150">
          <template #default="scope">
            <el-tag
              v-for="tag in scope.row.tags"
              :key="tag"
              size="small"
              style="margin: 2px;"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通过数" align="center" prop="acceptedCount" width="80" />
        <el-table-column label="提交数" align="center" prop="submissionCount" width="80" />
        <el-table-column label="通过率" align="center" width="80">
          <template #default="scope">
            <span :style="{ color: getAcceptanceRateColor(scope.row.acceptanceRate) }">
              {{ scope.row.acceptanceRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="关联课程" align="center" prop="courseName" width="120" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
          <template #default="scope">
            <div class="table-actions">
              <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageCurrent"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改题目对话框 -->
    <el-dialog 
      :title="title" 
      v-model="open" 
      width="900px" 
      append-to-body
      class="problem-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="problemRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入题目标题" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题目类型" prop="questionType">
              <el-select v-model="form.questionType" placeholder="请选择题目类型" @change="handleQuestionTypeChange">
                <el-option label="单选" value="single" />
                <el-option label="多选" value="multiple" />
                <el-option label="填空" value="fill" />
                <el-option label="简答" value="essay" />
                <el-option label="OJ" value="oj" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="请选择难度">
                <el-option
                  v-for="dict in difficultyList"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="关联课程" prop="courseId">
              <el-select v-model="form.courseId" placeholder="请选择课程" clearable style="width: 100%">
                <el-option
                  v-for="course in courseList"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 题目内容 -->
        <el-form-item label="题目内容" prop="questionText">
          <el-input
            v-model="form.questionText"
            type="textarea"
            placeholder="请输入题目内容"
            :rows="4"
          />
        </el-form-item>

        <!-- 单选题选项 -->
        <template v-if="form.questionType === 'single'">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: 500;">单选题选项</span>
          </el-divider>

          <div v-for="(option, index) in form.options" :key="index" class="option-item">
            <el-form-item :label="`选项 ${String.fromCharCode(65 + index)}`">
              <el-input v-model="option.text" placeholder="请输入选项内容">
                <template #append>
                  <el-radio v-model="form.correctAnswer" :label="index">正确答案</el-radio>
                  <el-button 
                    v-if="form.options.length > 2" 
                    type="danger" 
                    text 
                    @click="removeOption(index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <el-button type="primary" plain @click="addOption">添加选项</el-button>
        </template>

        <!-- 多选题选项 -->
        <template v-if="form.questionType === 'multiple'">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: 500;">多选题选项</span>
          </el-divider>

          <div v-for="(option, index) in form.options" :key="index" class="option-item">
            <el-form-item :label="`选项 ${String.fromCharCode(65 + index)}`">
              <el-input v-model="option.text" placeholder="请输入选项内容">
                <template #append>
                  <el-checkbox v-model="option.isCorrect">正确答案</el-checkbox>
                  <el-button 
                    v-if="form.options.length > 2" 
                    type="danger" 
                    text 
                    @click="removeOption(index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <el-button type="primary" plain @click="addOption">添加选项</el-button>
        </template>

        <!-- 填空题 -->
        <template v-if="form.questionType === 'fill'">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: 500;">填空题答案</span>
          </el-divider>

          <el-form-item label="标准答案" prop="fillAnswers">
            <el-input
              v-model="form.fillAnswers"
              type="textarea"
              placeholder="多个答案用英文分号分隔，如：答案1;答案2;答案3"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="答案说明">
            <el-input
              v-model="form.answerExplanation"
              type="textarea"
              placeholder="请输入答案说明（可选）"
              :rows="2"
            />
          </el-form-item>
        </template>

        <!-- 简答题 -->
        <template v-if="form.questionType === 'essay'">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: 500;">简答题设置</span>
          </el-divider>

          <el-form-item label="参考答案">
            <el-input
              v-model="form.referenceAnswer"
              type="textarea"
              placeholder="请输入参考答案"
              :rows="5"
            />
          </el-form-item>

          <el-form-item label="评分标准">
            <el-input
              v-model="form.gradingCriteria"
              type="textarea"
              placeholder="请输入评分标准（可选）"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="字数限制">
            <el-input-number v-model="form.wordLimit" :min="0" :max="10000" :step="100" />
            <span style="margin-left: 10px;">字（0表示不限制）</span>
          </el-form-item>
        </template>

        <!-- OJ题特殊设置 -->
        <template v-if="form.questionType === 'oj'">
          <el-divider content-position="left">
            <span style="color: #409eff; font-weight: 500;">OJ题设置</span>
          </el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="时间限制" prop="timeLimit">
                <el-input-number v-model="form.timeLimit" :min="100" :max="10000" :step="100" />
                <span style="margin-left: 10px;">ms</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内存限制" prop="memoryLimit">
                <el-input-number v-model="form.memoryLimit" :min="32" :max="1024" :step="32" />
                <span style="margin-left: 10px;">MB</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="输入格式" prop="inputFormat">
            <el-input
              v-model="form.inputFormat"
              type="textarea"
              placeholder="请输入输入格式说明"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="输出格式" prop="outputFormat">
            <el-input
              v-model="form.outputFormat"
              type="textarea"
              placeholder="请输入输出格式说明"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="样例输入" prop="sampleInput">
            <el-input
              v-model="form.sampleInput"
              type="textarea"
              placeholder="请输入样例输入"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="样例输出" prop="sampleOutput">
            <el-input
              v-model="form.sampleOutput"
              type="textarea"
              placeholder="请输入样例输出"
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="提示">
            <el-input
              v-model="form.hint"
              type="textarea"
              placeholder="请输入解题提示（可选）"
              :rows="3"
            />
          </el-form-item>
        </template>

        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tags" multiple placeholder="请选择标签" style="width: 100%">
            <el-option
              v-for="tag in tagList"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 题目预览对话框 -->
    <el-dialog title="题目预览" v-model="previewOpen" width="80%" append-to-body>
      <div v-if="previewProblem" class="problem-preview">
        <div class="problem-header">
          <h2>{{ previewProblem.id }}. {{ previewProblem.title }}</h2>
          <div class="problem-meta">
            <el-tag :type="getDifficultyTagType(previewProblem.difficulty)">
              {{ getDifficultyLabel(previewProblem.difficulty) }}
            </el-tag>
            <el-tag type="info">{{ getCategoryLabel(previewProblem.category) }}</el-tag>
            <span>时间限制: {{ previewProblem.timeLimit }}ms</span>
            <span>内存限制: {{ previewProblem.memoryLimit }}MB</span>
          </div>
        </div>

        <div class="problem-content">
          <div class="content-section">
            <h3>题目描述</h3>
            <div class="content-text" v-html="previewProblem.description"></div>
          </div>

          <div class="content-section">
            <h3>输入格式</h3>
            <div class="content-text" v-html="previewProblem.inputFormat"></div>
          </div>

          <div class="content-section">
            <h3>输出格式</h3>
            <div class="content-text" v-html="previewProblem.outputFormat"></div>
          </div>

          <div class="content-section">
            <h3>样例</h3>
            <div class="sample-section">
              <div class="sample-item">
                <h4>输入</h4>
                <pre class="sample-content">{{ previewProblem.sampleInput }}</pre>
              </div>
              <div class="sample-item">
                <h4>输出</h4>
                <pre class="sample-content">{{ previewProblem.sampleOutput }}</pre>
              </div>
            </div>
          </div>

          <div class="content-section" v-if="previewProblem.hint">
            <h3>提示</h3>
            <div class="content-text" v-html="previewProblem.hint"></div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="OJProblems">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { ojApi } from '@/api/oj'
import { parseTime } from '@/utils'
import QuestionBankManager from '@/components/QuestionBankManager.vue'

const router = useRouter()

const { proxy } = getCurrentInstance()

// 题库管理器引用
const qbManager = ref()


// 响应式数据
const problemList = ref([])
const open = ref(false)
const previewOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const previewProblem = ref(null)

// 表单引用
const problemRef = ref()

// 表单数据
const form = ref({})

// 表单校验
const rules = ref({
  title: [
    { required: true, message: '题目标题不能为空', trigger: 'blur' }
  ],
  questionType: [
    { required: true, message: '题目类型不能为空', trigger: 'change' }
  ],
  difficulty: [
    { required: true, message: '难度不能为空', trigger: 'change' }
  ],
  category: [
    { required: true, message: '分类不能为空', trigger: 'change' }
  ],
  questionText: [
    { required: true, message: '题目内容不能为空', trigger: 'blur' }
  ]
})

// 统计数据
const statsData = ref({
  totalProblems: 0,
  easyProblems: 0,
  mediumProblems: 0,
  hardProblems: 0,
  totalSubmissions: 0,
  acceptanceRate: 0
})

// 查询参数
const queryParams = ref({
  pageCurrent: 1,
  pageSize: 10,
  keyword: ''
})

// 难度列表
const difficultyList = ref([
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
])

// 分类列表
const categoryList = ref([
  { label: '数组', value: 'array' },
  { label: '字符串', value: 'string' },
  { label: '链表', value: 'linked-list' },
  { label: '树', value: 'tree' },
  { label: '图', value: 'graph' },
  { label: '动态规划', value: 'dp' },
  { label: '贪心', value: 'greedy' },
  { label: '回溯', value: 'backtracking' }
])

// 标签列表
const tagList = ref([
  '排序', '搜索', '哈希表', '二分查找', '双指针', '递归', '分治', '数学',
  '位运算', '栈', '队列', '堆', '字典树', '并查集', '滑动窗口', '单调栈'
])

// 课程列表
const courseList = ref([
  { id: 1, name: 'Python基础课程' },
  { id: 2, name: '算法与数据结构' },
  { id: 3, name: 'Web开发课程' }
])


  // 获取列表数据
  const getList = () => {
    loading.value = true

    // 使用统一的模拟数据
    import('@/utils/mockData').then(({ mockApi }) => {
      mockApi.getOJProblems(queryParams.value).then(result => {
        problemList.value = result.records
        total.value = result.total
        loading.value = false
      })
    })
  }

  // 获取统计数据
const getStatsData = () => {
  // 模拟统计数据
  setTimeout(() => {
    statsData.value = {
      totalProblems: 5,
      easyProblems: 3,
      mediumProblems: 1,
      hardProblems: 1,
      totalSubmissions: 11190,
      acceptanceRate: 56.2
    }
  }, 300)
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.value.pageCurrent = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryParams.value = {
    pageCurrent: 1,
    pageSize: 10,
    keyword: ''
  }
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 新增按钮操作
const handleAdd = () => {
  reset()
  open.value = true
  title.value = '添加题目'
}

// 重置操作表单
const reset = () => {
  form.value = {
    id: null,
    title: null,
    questionType: null,
    difficulty: null,
    category: null,
    tags: [],
    courseId: null,
    questionText: null,
    // 单选题
    correctAnswer: null,
    // 多选题/单选题
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    // 填空题
    fillAnswers: null,
    answerExplanation: null,
    // 简答题
    referenceAnswer: null,
    gradingCriteria: null,
    wordLimit: 0,
    // OJ题
    timeLimit: 1000,
    memoryLimit: 256,
    inputFormat: null,
    outputFormat: null,
    sampleInput: null,
    sampleOutput: null,
    hint: null
  }
  if (problemRef.value) {
    problemRef.value.resetFields()
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 题目类型改变
const handleQuestionTypeChange = (type) => {
  // 重置选项
  if (type === 'single' || type === 'multiple') {
    form.value.options = [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
    form.value.correctAnswer = null
  }
}

// 添加选项
const addOption = () => {
  form.value.options.push({ text: '', isCorrect: false })
}

// 删除选项
const removeOption = (index) => {
  form.value.options.splice(index, 1)
}

// 修改按钮操作
const handleEdit = (row) => {
  reset()
  const _id = row.id || ids.value
  // 使用模拟数据获取题目详情
  import('@/utils/mockData').then(({ mockData }) => {
    const problem = mockData.ojProblems.find(p => p.id === _id)
    if (problem) {
      form.value = { ...problem }
      open.value = true
      title.value = '修改题目'
    } else {
      ElMessage.warning('未找到要编辑的题目')
    }
  })
}

  // 查看题目
  const handleView = (row) => {
    // 跳转到练习页面
    router.push({
      path: '/oj/practice',
      query: { problemId: row.id }
    })
  }

// 测试用例管理
const handleTestCases = (row) => {
  ElMessage.info('测试用例管理功能开发中...')
}

// 题解管理
const handleSolutions = (row) => {
  ElMessage.info('题解管理功能开发中...')
}

// 删除按钮操作
const handleDelete = (row) => {
  const _ids = row.id || ids.value
  ElMessageBox.confirm('是否确认删除题目编号为"' + _ids + '"的数据项？').then(() => {
    // 使用模拟数据进行删除
    import('@/utils/mockData').then(({ mockData }) => {
      const index = mockData.ojProblems.findIndex(p => p.id === _ids)
      if (index !== -1) {
        mockData.ojProblems.splice(index, 1)
        getList()
        ElMessage.success('删除成功')
      } else {
        ElMessage.warning('未找到要删除的题目')
      }
    })
  }).catch(() => {})
}

// 批量复制
const handleBatchCopy = () => {
  const _ids = ids.value
  ElMessageBox.confirm('是否确认复制选中的题目？').then(() => {
    // 使用模拟数据进行批量复制
    import('@/utils/mockData').then(({ mockData }) => {
      const copiedProblems = []
      _ids.forEach(id => {
        const originalProblem = mockData.ojProblems.find(p => p.id === id)
        if (originalProblem) {
          const copiedProblem = {
            ...originalProblem,
            id: Math.max(...mockData.ojProblems.map(p => p.id)) + 1,
            title: `${originalProblem.title} (副本)`,
            createTime: new Date().toISOString()
          }
          mockData.ojProblems.push(copiedProblem)
          copiedProblems.push(copiedProblem)
        }
      })

      if (copiedProblems.length > 0) {
        getList()
        ElMessage.success(`成功复制 ${copiedProblems.length} 个题目`)
      } else {
        ElMessage.warning('未找到要复制的题目')
      }
    })
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  const _ids = ids.value
  ElMessageBox.confirm('是否确认删除选中的题目？').then(() => {
    // 使用模拟数据进行批量删除
    import('@/utils/mockData').then(({ mockData }) => {
      let deletedCount = 0
      _ids.forEach(id => {
        const index = mockData.ojProblems.findIndex(p => p.id === id)
        if (index !== -1) {
          mockData.ojProblems.splice(index, 1)
          deletedCount++
        }
      })

      if (deletedCount > 0) {
        getList()
        ElMessage.success(`成功删除 ${deletedCount} 个题目`)
      } else {
        ElMessage.warning('未找到要删除的题目')
      }
    })
  }).catch(() => {})
}

// 导入题目
const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

// 导出题目
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 题库管理器事件处理
const handleAddToHomework = (question) => {
  ElMessage.success(`题目已添加到作业：${question.content}`)
}

const handleAddToExam = (question) => {
  ElMessage.success(`题目已添加到考试：${question.content}`)
}

const handleViewDetail = (question) => {
  ElMessage.info(`查看题目详情：${question.content}`)
}

// 获取难度标签颜色
const getDifficultyTagType = (difficulty) => {
  const typeMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return typeMap[difficulty] || ''
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
  const typeMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return typeMap[difficulty] || difficulty
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const item = categoryList.value.find(item => item.value === category)
  return item ? item.label : category
}

// 获取通过率颜色
const getAcceptanceRateColor = (rate) => {
  if (rate < 30) return '#f56c6c'
  if (rate < 60) return '#e6a23c'
  return '#67c23a'
}

// 提交表单
const submitForm = () => {
  proxy.$refs.problemRef.validate(valid => {
    if (valid) {
      // 使用模拟数据进行保存和编辑
      import('@/utils/mockData').then(({ mockData }) => {
        if (form.value.id != undefined) {
          // 编辑现有题目
          const index = mockData.ojProblems.findIndex(p => p.id === form.value.id)
          if (index !== -1) {
            mockData.ojProblems[index] = { ...form.value }
            ElMessage.success('修改成功')
            open.value = false
            getList()
          } else {
            ElMessage.warning('未找到要修改的题目')
          }
        } else {
          // 新增题目
          const newId = Math.max(...mockData.ojProblems.map(p => p.id), 0) + 1
          const newProblem = {
            ...form.value,
            id: newId,
            createTime: new Date().toISOString(),
            acceptedCount: 0,
            submissionCount: 0,
            acceptanceRate: 0
          }
          mockData.ojProblems.push(newProblem)
          ElMessage.success('新增成功')
          open.value = false
          getList()
        }
      })
    }
  })
}

onMounted(() => {
  getList()
  getStatsData()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.stats-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-section {
  margin-bottom: 20px;
}

.search-input {
  max-width: 600px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px 0 0 8px;
}

.search-input :deep(.el-input-group__append) {
  border-radius: 0 8px 8px 0;
  background: #409eff;
  border-color: #409eff;
  color: white;
  padding: 0 20px;
}

.search-input :deep(.el-input-group__append .el-button) {
  color: white;
  font-weight: 500;
}

.search-input :deep(.el-input-group__append:hover) {
  background: #66b1ff;
  border-color: #66b1ff;
}

.problem-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.problem-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.problem-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
}

.problem-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #606266;
}

.problem-content {
  line-height: 1.6;
}

.content-section {
  margin-bottom: 25px;
}

.content-section h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.content-text {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.sample-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.sample-item h4 {
  margin: 0 0 8px 0;
  color: #606266;
}

.sample-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 新增题目对话框样式 */
:deep(.problem-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
}

:deep(.problem-dialog .el-dialog__title) {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

:deep(.problem-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
  font-size: 20px;
}

:deep(.problem-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #f0f0f0;
}

:deep(.problem-dialog .el-dialog__body) {
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.problem-dialog .el-divider__text) {
  background-color: #fff;
}

.option-item {
  margin-bottom: 15px;
}

.option-item :deep(.el-input-group__append) {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>