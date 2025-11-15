<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>提交记录管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleRejudgeAll">批量重测</el-button>
            <el-button @click="handleExport">导出记录</el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="总提交数" :value="statsData.totalSubmissions" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="通过提交" :value="statsData.acceptedSubmissions" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="今日提交" :value="statsData.todaySubmissions" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="通过率" :value="statsData.acceptanceRate" suffix="%" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="平均用时" :value="statsData.avgTime" suffix="ms" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="平均内存" :value="statsData.avgMemory" suffix="KB" />
          </el-col>
        </el-row>
      </div>

      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="提交ID" prop="id">
          <el-input
            v-model="queryParams.id"
            placeholder="请输入提交ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="题目ID" prop="problemId">
          <el-input
            v-model="queryParams.problemId"
            placeholder="请输入题目ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="评测状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择评测状态" clearable>
            <el-option
              v-for="dict in statusList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="语言" prop="language">
          <el-select v-model="queryParams.language" placeholder="请选择编程语言" clearable>
            <el-option label="Python" value="python" />
            <el-option label="Java" value="java" />
            <el-option label="C++" value="cpp" />
            <el-option label="JavaScript" value="javascript" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间" prop="timeRange">
          <el-date-picker
            v-model="queryParams.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            @click="handleBatchRejudge"
            :disabled="multiple"
          >批量重测</el-button>
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
      <el-table v-loading="loading" :data="submissionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="提交ID" align="center" prop="id" width="80" />
        <el-table-column label="题目" align="center" width="120">
          <template #default="scope">
            <el-link type="primary" @click="handleViewProblem(scope.row)">
              {{ scope.row.problemId }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="用户" align="center" prop="username" width="120">
          <template #default="scope">
            <el-avatar :src="scope.row.userAvatar" :size="30">{{ scope.row.username?.charAt(0) }}</el-avatar>
            <span style="margin-left: 8px;">{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评测状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分数" align="center" prop="score" width="80">
          <template #default="scope">
            <span :style="{ color: getScoreColor(scope.row.score) }">{{ scope.row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" align="center" prop="timeUsed" width="80">
          <template #default="scope">
            <span v-if="scope.row.timeUsed">{{ scope.row.timeUsed }}ms</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="内存" align="center" prop="memoryUsed" width="80">
          <template #default="scope">
            <span v-if="scope.row.memoryUsed">{{ scope.row.memoryUsed }}KB</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="语言" align="center" prop="language" width="80">
          <template #default="scope">
            <el-tag size="small">{{ getLanguageLabel(scope.row.language) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="代码长度" align="center" prop="codeLength" width="100">
          <template #default="scope">
            {{ scope.row.codeLength }} B
          </template>
        </el-table-column>
        <el-table-column label="提交时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" @click="handleRejudge(scope.row)">重测</el-button>
            <el-button link type="primary" @click="handleCompare(scope.row)">对比</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 提交详情对话框 -->
    <el-dialog title="提交详情" v-model="detailOpen" width="90%" append-to-body>
      <div v-if="currentSubmission" class="submission-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="提交ID">{{ currentSubmission.id }}</el-descriptions-item>
            <el-descriptions-item label="题目ID">
              <el-link type="primary" @click="handleViewProblem(currentSubmission)">
                {{ currentSubmission.problemId }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item label="用户">{{ currentSubmission.username }}</el-descriptions-item>
            <el-descriptions-item label="评测状态">
              <el-tag :type="getStatusTagType(currentSubmission.status)">
                {{ getStatusLabel(currentSubmission.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="分数">
              <span :style="{ color: getScoreColor(currentSubmission.score) }">{{ currentSubmission.score }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="语言">{{ getLanguageLabel(currentSubmission.language) }}</el-descriptions-item>
            <el-descriptions-item label="用时">{{ currentSubmission.timeUsed }}ms</el-descriptions-item>
            <el-descriptions-item label="内存">{{ currentSubmission.memoryUsed }}KB</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ parseTime(currentSubmission.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 代码显示 -->
        <div class="detail-section">
          <h3>提交代码</h3>
          <div class="code-section">
            <div class="code-header">
              <span>{{ getLanguageLabel(currentSubmission.language) }}</span>
              <el-button size="small" @click="handleCopyCode">复制代码</el-button>
            </div>
            <pre class="code-content"><code>{{ currentSubmission.code }}</code></pre>
          </div>
        </div>

        <!-- 测试用例结果 -->
        <div class="detail-section">
          <h3>测试用例结果</h3>
          <el-table :data="currentSubmission.testResults" stripe>
            <el-table-column label="测试点" prop="testCaseId" width="80" />
            <el-table-column label="状态" prop="status" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="用时" prop="timeUsed" width="80">
              <template #default="scope">
                {{ scope.row.timeUsed }}ms
              </template>
            </el-table-column>
            <el-table-column label="内存" prop="memoryUsed" width="80">
              <template #default="scope">
                {{ scope.row.memoryUsed }}KB
              </template>
            </el-table-column>
            <el-table-column label="分数" prop="score" width="60" />
            <el-table-column label="输入" prop="input" show-overflow-tooltip />
            <el-table-column label="期望输出" prop="expectedOutput" show-overflow-tooltip />
            <el-table-column label="实际输出" prop="actualOutput" show-overflow-tooltip />
            <el-table-column label="错误信息" prop="errorMessage" show-overflow-tooltip />
          </el-table>
        </div>

        <!-- 编译信息 -->
        <div class="detail-section" v-if="currentSubmission.compileInfo">
          <h3>编译信息</h3>
          <pre class="compile-info">{{ currentSubmission.compileInfo }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="OJSubmission">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ojApi } from '@/api/oj'
import { parseTime } from '@/utils'

const { proxy } = getCurrentInstance()

// 响应式数据
const submissionList = ref([])
const detailOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const currentSubmission = ref(null)

// 统计数据
const statsData = ref({
  totalSubmissions: 0,
  acceptedSubmissions: 0,
  todaySubmissions: 0,
  acceptanceRate: 0,
  avgTime: 0,
  avgMemory: 0
})

// 查询参数
const queryParams = ref({
  pageCurrent: 1,
  pageSize: 10,
  id: '',
  username: '',
  problemId: '',
  status: '',
  language: '',
  timeRange: []
})

// 评测状态列表
const statusList = ref([
  { label: '等待评测', value: 'pending' },
  { label: '评测中', value: 'judging' },
  { label: '通过', value: 'accepted' },
  { label: '答案错误', value: 'wrong_answer' },
  { label: '编译错误', value: 'compile_error' },
  { label: '运行时错误', value: 'runtime_error' },
  { label: '时间超限', value: 'time_limit_exceeded' },
  { label: '内存超限', value: 'memory_limit_exceeded' },
  { label: '输出超限', value: 'output_limit_exceeded' },
  { label: '系统错误', value: 'system_error' }
])

// 获取列表数据
const getList = () => {
  loading.value = true
  const params = { ...queryParams.value }
  if (params.timeRange && params.timeRange.length === 2) {
    params.startTime = params.timeRange[0]
    params.endTime = params.timeRange[1]
  }
  delete params.timeRange

  // 模拟数据
  setTimeout(() => {
    const mockData = [
      {
        id: 1,
        problemId: 1001,
        problemTitle: '两数之和',
        username: 'zhangxiaoming',
        studentName: '张小明',
        language: 'python',
        status: 'accepted',
        statusName: '通过',
        runtime: 45,
        memory: 15.2,
        submitTime: '2024-01-15 14:30:00',
        judgetime: '2024-01-15 14:30:05'
      },
      {
        id: 2,
        problemId: 1001,
        problemTitle: '两数之和',
        username: 'lixiaohong',
        studentName: '李小红',
        language: 'javascript',
        status: 'wrong_answer',
        statusName: '答案错误',
        runtime: 0,
        memory: 0,
        submitTime: '2024-01-15 13:45:00',
        judgetime: '2024-01-15 13:45:02'
      },
      {
        id: 3,
        problemId: 1002,
        problemTitle: '二叉树的最大深度',
        username: 'wangxiaogang',
        studentName: '王小刚',
        language: 'java',
        status: 'accepted',
        statusName: '通过',
        runtime: 78,
        memory: 25.6,
        submitTime: '2024-01-15 12:20:00',
        judgetime: '2024-01-15 12:20:03'
      },
      {
        id: 4,
        problemId: 1003,
        problemTitle: '最长递增子序列',
        username: 'zhaoxiaomei',
        studentName: '赵小美',
        language: 'cpp',
        status: 'time_limit_exceeded',
        statusName: '超时',
        runtime: 2000,
        memory: 45.8,
        submitTime: '2024-01-15 11:15:00',
        judgetime: '2024-01-15 11:15:02'
      },
      {
        id: 5,
        problemId: 1004,
        problemTitle: '合并K个升序链表',
        username: 'liuxiaoqiang',
        studentName: '刘小强',
        language: 'python',
        status: 'accepted',
        statusName: '通过',
        runtime: 156,
        memory: 32.4,
        submitTime: '2024-01-15 10:30:00',
        judgetime: '2024-01-15 10:30:08'
      }
    ]

    // 根据查询参数过滤数据
    let filteredData = mockData

    if (params.problemId) {
      filteredData = filteredData.filter(item =>
        item.problemId == params.problemId
      )
    }

    if (params.username) {
      filteredData = filteredData.filter(item =>
        item.username.includes(params.username)
      )
    }

    if (params.status) {
      filteredData = filteredData.filter(item =>
        item.status === params.status
      )
    }

    if (params.language) {
      filteredData = filteredData.filter(item =>
        item.language === params.language
      )
    }

    submissionList.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 500)
}

// 获取统计数据
const getStatsData = () => {
  // 模拟统计数据
  setTimeout(() => {
    statsData.value = {
      totalSubmissions: 5,
      acceptedSubmissions: 3,
      acceptanceRate: 60,
      avgTime: 94.8,
      avgMemory: 23.4
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
    id: '',
    username: '',
    problemId: '',
    status: '',
    language: '',
    timeRange: []
  }
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 查看提交详情
const handleView = (row) => {
  // 模拟详情数据
  currentSubmission.value = {
    ...row,
    code: `def solution():\n    # 代码内容\n    pass`,
    testResults: [
      {
        testCaseId: 1,
        status: 'accepted',
        timeUsed: 15,
        memoryUsed: 1024,
        score: 20,
        input: '1 2\n',
        expectedOutput: '3\n',
        actualOutput: '3\n',
        errorMessage: ''
      },
      {
        testCaseId: 2,
        status: 'wrong_answer',
        timeUsed: 16,
        memoryUsed: 1024,
        score: 0,
        input: '3 4\n',
        expectedOutput: '7\n',
        actualOutput: '6\n',
        errorMessage: ''
      }
    ],
    compileInfo: '编译成功'
  }
  detailOpen.value = true
}

// 查看题目
const handleViewProblem = (row) => {
  ElMessage.info('跳转到题目详情页')
}

// 重新评测
const handleRejudge = (row) => {
  ElMessageBox.confirm('是否确认重新评测该提交？').then(() => {
    return ojApi.rejudgeSubmission(row.id)
  }).then(() => {
    getList()
    ElMessage.success('重新评测成功')
  }).catch(() => {})
}

// 批量重新评测
const handleBatchRejudge = () => {
  const _ids = ids.value
  ElMessageBox.confirm('是否确认批量重新评测选中的提交？').then(() => {
    return ojApi.batchRejudge(_ids)
  }).then(() => {
    getList()
    ElMessage.success('批量重新评测成功')
  }).catch(() => {})
}

// 全部重新评测
const handleRejudgeAll = () => {
  ElMessageBox.confirm('是否确认重新评测所有提交？此操作可能需要较长时间。').then(() => {
    ElMessage.success('全部重新评测已开始，请稍后查看结果')
  }).catch(() => {})
}

// 对比代码
const handleCompare = (row) => {
  ElMessage.info('代码对比功能开发中...')
}

// 删除提交记录
const handleDelete = (row) => {
  const _ids = row.id || ids.value
  ElMessageBox.confirm('是否确认删除提交记录？').then(() => {
    return ojApi.submissionDelete(_ids)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  const _ids = ids.value
  ElMessageBox.confirm('是否确认删除选中的提交记录？').then(() => {
    return Promise.all(_ids.map(id => ojApi.submissionDelete(id)))
  }).then(() => {
    getList()
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 导出记录
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 复制代码
const handleCopyCode = () => {
  if (currentSubmission.value?.code) {
    navigator.clipboard.writeText(currentSubmission.value.code).then(() => {
      ElMessage.success('代码已复制到剪贴板')
    })
  }
}

// 获取状态标签颜色
const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'info',
    judging: 'warning',
    accepted: 'success',
    wrong_answer: 'danger',
    compile_error: 'danger',
    runtime_error: 'danger',
    time_limit_exceeded: 'warning',
    memory_limit_exceeded: 'warning',
    output_limit_exceeded: 'warning',
    system_error: 'danger'
  }
  return typeMap[status] || ''
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const item = statusList.value.find(item => item.value === status)
  return item ? item.label : status
}

// 获取语言标签
const getLanguageLabel = (language) => {
  const langMap = {
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    javascript: 'JavaScript'
  }
  return langMap[language] || language
}

// 获取分数颜色
const getScoreColor = (score) => {
  if (score >= 90) return 'var(--color-score-90-plus)'
  if (score >= 60) return 'var(--color-score-70-79)'
  return 'var(--color-score-below-60)'
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

.submission-detail {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.code-section {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #dcdfe6;
}

.code-content {
  margin: 0;
  padding: 15px;
  background: #fafafa;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.compile-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  border-left: 4px solid #e6a23c;
}
</style>