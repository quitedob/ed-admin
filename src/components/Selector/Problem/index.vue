<template>
  <el-dialog
    title="选择编程题目"
    :model-value="visible"
    width="80%"
    append-to-body
    @close="handleClose"
  >
    <div class="problem-selector">
      <!-- 搜索筛选 -->
      <div class="filter-section">
        <el-form :inline="true" :model="queryParams" size="small">
          <el-form-item label="题目标题">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入题目标题"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="难度">
            <el-select v-model="queryParams.difficulty" placeholder="请选择难度" clearable>
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
              <el-option
                v-for="category in categoryList"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="queryParams.tags" multiple placeholder="请选择标签" clearable>
              <el-option
                v-for="tag in tagList"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">搜索</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 题目列表 -->
      <div class="problem-list">
        <el-table
          ref="problemTableRef"
          v-loading="loading"
          :data="problemList"
          @selection-change="handleSelectionChange"
          max-height="400"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="题目ID" prop="id" width="80" />
          <el-table-column label="题目标题" prop="title" show-overflow-tooltip>
            <template #default="scope">
              <el-link type="primary" @click="handlePreview(scope.row)">
                {{ scope.row.title }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="难度" prop="difficulty" width="80">
            <template #default="scope">
              <el-tag :type="getDifficultyTagType(scope.row.difficulty)" size="small">
                {{ getDifficultyLabel(scope.row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分类" prop="category" width="100">
            <template #default="scope">
              <el-tag type="info" size="small">
                {{ getCategoryLabel(scope.row.category) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="标签" prop="tags" width="150">
            <template #default="scope">
              <el-tag
                v-for="tag in scope.row.tags?.slice(0, 2)"
                :key="tag"
                size="small"
                style="margin: 2px;"
              >
                {{ tag }}
              </el-tag>
              <span v-if="scope.row.tags?.length > 2" style="font-size: 12px; color: #909399;">
                +{{ scope.row.tags.length - 2 }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="通过率" prop="acceptanceRate" width="100">
            <template #default="scope">
              <span :style="{ color: getAcceptanceColor(scope.row.acceptanceRate) }">
                {{ scope.row.acceptanceRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="提交数" prop="submissionCount" width="80" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
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
      </div>

      <!-- 已选择的题目 -->
      <div class="selected-problems" v-if="selectedProblems.length > 0">
        <h4>已选择的题目 ({{ selectedProblems.length }})</h4>
        <div class="selected-list">
          <el-tag
            v-for="problem in selectedProblems"
            :key="problem.id"
            closable
            @close="removeSelectedProblem(problem)"
            style="margin: 4px;"
          >
            {{ problem.id }}. {{ problem.title }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="selectedProblems.length === 0">
          确定选择 ({{ selectedProblems.length }})
        </el-button>
      </div>
    </template>

    <!-- 题目预览对话框 -->
    <el-dialog title="题目预览" v-model="previewVisible" width="70%" append-to-body>
      <div v-if="currentProblem" class="problem-preview">
        <div class="preview-header">
          <h3>{{ currentProblem.id }}. {{ currentProblem.title }}</h3>
          <div class="preview-meta">
            <el-tag :type="getDifficultyTagType(currentProblem.difficulty)">
              {{ getDifficultyLabel(currentProblem.difficulty) }}
            </el-tag>
            <el-tag type="info">{{ getCategoryLabel(currentProblem.category) }}</el-tag>
            <span>时间限制: {{ currentProblem.timeLimit }}ms</span>
            <span>内存限制: {{ currentProblem.memoryLimit }}KB</span>
            <span>通过率: {{ currentProblem.acceptanceRate }}%</span>
          </div>
        </div>

        <div class="preview-content">
          <div class="content-section">
            <h4>题目描述</h4>
            <div class="content-text" v-html="currentProblem.description"></div>
          </div>

          <div class="content-section">
            <h4>输入格式</h4>
            <div class="content-text" v-html="currentProblem.inputFormat"></div>
          </div>

          <div class="content-section">
            <h4>输出格式</h4>
            <div class="content-text" v-html="currentProblem.outputFormat"></div>
          </div>

          <div class="content-section">
            <h4>样例</h4>
            <div class="sample-section">
              <div class="sample-item">
                <h5>输入</h5>
                <pre class="sample-content">{{ currentProblem.sampleInput }}</pre>
              </div>
              <div class="sample-item">
                <h5>输出</h5>
                <pre class="sample-content">{{ currentProblem.sampleOutput }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
  import { ref, reactive, onMounted, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ojApi } from '@/api/oj'
  import Pagination from '@/components/Pagination/index.vue'

  // Props & Emits
  const props = defineProps({
    visible: Boolean,
    selectedProblems: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['close', 'confirm'])

  // 响应式数据
  const problemTableRef = ref()
  const loading = ref(false)
  const previewVisible = ref(false)
  const currentProblem = ref(null)

  // 查询参数
  const queryParams = reactive({
    pageCurrent: 1,
    pageSize: 10,
    title: '',
    difficulty: '',
    category: '',
    tags: []
  })

  // 题目列表
  const problemList = ref([])
  const total = ref(0)
  const selectedProblems = ref([])

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

  // 监听props变化
  watch(() => props.visible, (val) => {
    if (val) {
      selectedProblems.value = [...props.selectedProblems]
      getList()
    }
  })

  // 获取题目列表
  const getList = () => {
    loading.value = true
    ojApi.problemPage(queryParams).then(response => {
      problemList.value = response.data.records || []
      total.value = response.data.total || 0
      loading.value = false

      // 更新选中状态
      updateSelection()
    }).catch(() => {
      loading.value = false
    })
  }

  // 更新选中状态
  const updateSelection = () => {
    if (problemTableRef.value) {
      problemList.value.forEach(problem => {
        const isSelected = selectedProblems.value.some(p => p.id === problem.id)
        if (isSelected) {
          problemTableRef.value.toggleRowSelection(problem, true)
        }
      })
    }
  }

  // 搜索
  const handleQuery = () => {
    queryParams.pageCurrent = 1
    getList()
  }

  // 重置查询
  const resetQuery = () => {
    Object.assign(queryParams, {
      pageCurrent: 1,
      pageSize: 10,
      title: '',
      difficulty: '',
      category: '',
      tags: []
    })
    getList()
  }

  // 选择变化
  const handleSelectionChange = (selection) => {
    selectedProblems.value = [...selection]
  }

  // 移除已选择的题目
  const removeSelectedProblem = (problem) => {
    const index = selectedProblems.value.findIndex(p => p.id === problem.id)
    if (index > -1) {
      selectedProblems.value.splice(index, 1)
      // 更新表格选中状态
      const tableRow = problemList.value.find(p => p.id === problem.id)
      if (tableRow) {
        problemTableRef.value.toggleRowSelection(tableRow, false)
      }
    }
  }

  // 预览题目
  const handlePreview = (row) => {
    currentProblem.value = row
    previewVisible.value = true
  }

  // 关闭对话框
  const handleClose = () => {
    emit('close')
  }

  // 确认选择
  const handleConfirm = () => {
    emit('confirm', selectedProblems.value)
  }

  // 工具方法
  const getDifficultyTagType = (difficulty) => {
    const types = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger'
    }
    return types[difficulty] || ''
  }

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return labels[difficulty] || difficulty
  }

  const getCategoryLabel = (category) => {
    const item = categoryList.value.find(item => item.value === category)
    return item ? item.label : category
  }

  const getAcceptanceColor = (rate) => {
    if (rate >= 70) return '#67c23a'
    if (rate >= 40) return '#e6a23c'
    return '#f56c6c'
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Selector/Problem/index.vue`);
    if (props.visible) {
      selectedProblems.value = [...props.selectedProblems]
      getList()
    }
  })
</script>

<style scoped>
.problem-selector {
  min-height: 500px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.problem-list {
  margin-bottom: 20px;
}

.selected-problems {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}

.selected-problems h4 {
  margin: 0 0 10px 0;
  color: #1e40af;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.problem-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.preview-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #606266;
}

.preview-content {
  line-height: 1.6;
}

.content-section {
  margin-bottom: 25px;
}

.content-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.content-text {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  white-space: pre-wrap;
}

.sample-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.sample-item h5 {
  margin: 0 0 8px 0;
  color: #606266;
}

.sample-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>