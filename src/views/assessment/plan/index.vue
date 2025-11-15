<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>提分计划管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleCreatePlan">创建计划</el-button>
            <el-button type="success" @click="handleBatchGenerate">批量生成</el-button>
            <el-button @click="handleExportPlans">导出计划</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="学生姓名" prop="studentName">
          <el-input
            v-model="queryParams.studentName"
            placeholder="请输入学生姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="计划状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="timeRange">
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

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="计划ID" align="center" prop="id" width="80" />
        <el-table-column label="学生信息" align="center" width="150">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :src="scope.row.studentAvatar" :size="32">{{ scope.row.studentName?.charAt(0) }}</el-avatar>
              <div class="student-details">
                <div class="student-name">{{ scope.row.studentName }}</div>
                <div class="student-class">{{ scope.row.className }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="计划名称" align="center" prop="planName" show-overflow-tooltip />
        <el-table-column label="目标分数" align="center" prop="targetScore" width="100">
          <template #default="scope">
            <span class="target-score">{{ scope.row.targetScore }}分</span>
          </template>
        </el-table-column>
        <el-table-column label="当前分数" align="center" prop="currentScore" width="100">
          <template #default="scope">
            <span class="current-score">{{ scope.row.currentScore }}分</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" align="center" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :color="getProgressColor(scope.row.progress)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="计划状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center" prop="startTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="primary" @click="handleTasks(scope.row)">任务</el-button>
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

    <!-- 创建/编辑计划对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentId">
              <el-select v-model="form.studentId" placeholder="请选择学生" filterable>
                <el-option
                  v-for="student in studentList"
                  :key="student.id"
                  :label="student.name"
                  :value="student.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划名称" prop="planName">
              <el-input v-model="form.planName" placeholder="请输入计划名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学科科目" prop="subject">
              <el-select v-model="form.subject" placeholder="请选择学科">
                <el-option label="数学" value="math" />
                <el-option label="语文" value="chinese" />
                <el-option label="英语" value="english" />
                <el-option label="物理" value="physics" />
                <el-option label="化学" value="chemistry" />
                <el-option label="编程" value="programming" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标分数" prop="targetScore">
              <el-input-number v-model="form.targetScore" :min="0" :max="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="date"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="date"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入计划描述"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="提升方向">
          <el-checkbox-group v-model="form.improvementAreas">
            <el-checkbox value="knowledge">知识点巩固</el-checkbox>
            <el-checkbox value="skill">技能训练</el-checkbox>
            <el-checkbox value="thinking">思维训练</el-checkbox>
            <el-checkbox value="practice">练习加强</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="计划频率">
          <el-radio-group v-model="form.frequency">
            <el-radio value="daily">每日</el-radio>
            <el-radio value="weekly">每周</el-radio>
            <el-radio value="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计划详情对话框 -->
    <el-dialog title="提分计划详情" v-model="detailOpen" width="90%" append-to-body>
      <div v-if="currentPlan" class="plan-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="计划名称">{{ currentPlan.planName }}</el-descriptions-item>
            <el-descriptions-item label="学生">{{ currentPlan.studentName }}</el-descriptions-item>
            <el-descriptions-item label="学科">{{ getSubjectLabel(currentPlan.subject) }}</el-descriptions-item>
            <el-descriptions-item label="目标分数">{{ currentPlan.targetScore }}分</el-descriptions-item>
            <el-descriptions-item label="当前分数">{{ currentPlan.currentScore }}分</el-descriptions-item>
            <el-descriptions-item label="提升幅度">{{ currentPlan.improvement }}分</el-descriptions-item>
            <el-descriptions-item label="计划进度">
              <el-progress :percentage="currentPlan.progress" :stroke-width="8" />
            </el-descriptions-item>
            <el-descriptions-item label="计划状态">
              <el-tag :type="getStatusTagType(currentPlan.status)">
                {{ getStatusLabel(currentPlan.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="完成度">
              <span>{{ currentPlan.completedTasks }}/{{ currentPlan.totalTasks }} 任务</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 计划日历 -->
        <div class="detail-section">
          <h3>计划日历</h3>
          <div class="plan-calendar">
            <el-calendar v-model="calendarDate">
              <template #date-cell="{ data }">
                <div class="calendar-cell">
                  <p :class="{ 'is-today': isToday(data.day) }">{{ data.day.split('-')[2] }}</p>
                  <div v-if="getTasksForDate(data.day).length > 0" class="task-indicators">
                    <div
                      v-for="task in getTasksForDate(data.day).slice(0, 3)"
                      :key="task.id"
                      class="task-dot"
                      :class="{ 'completed': task.completed }"
                      :title="task.title"
                    ></div>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="detail-section">
          <h3>任务列表</h3>
          <el-table :data="currentPlan.tasks" stripe>
            <el-table-column label="任务名称" prop="title" />
            <el-table-column label="任务类型" prop="type" width="120">
              <template #default="scope">
                <el-tag size="small">{{ getTaskTypeLabel(scope.row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="计划完成时间" prop="plannedDate" width="150">
              <template #default="scope">
                {{ parseTime(scope.row.plannedDate) }}
              </template>
            </el-table-column>
            <el-table-column label="实际完成时间" prop="completedDate" width="150">
              <template #default="scope">
                {{ scope.row.completedDate ? parseTime(scope.row.completedDate) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="status" width="100">
              <template #default="scope">
                <el-tag :type="getTaskStatusTagType(scope.row.status)" size="small">
                  {{ getTaskStatusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status !== 'completed'"
                  link
                  type="primary"
                  size="small"
                  @click="completeTask(scope.row)"
                >
                  完成
                </el-button>
                <el-button link type="primary" size="small" @click="viewTaskDetail(scope.row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 进度统计 -->
        <div class="detail-section">
          <h3>进度统计</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="progress-chart">
                <h4>任务完成情况</h4>
                <div class="chart-container">
                  <!-- 这里应该使用图表库显示饼图 -->
                  <div class="chart-placeholder">
                    <el-empty description="图表加载中..." />
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="progress-stats">
                <h4>统计数据</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ currentPlan.onTimeRate }}%</div>
                    <div class="stat-label">按时完成率</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ currentPlan.avgStudyTime }}h</div>
                    <div class="stat-label">平均学习时间</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ currentPlan.streakDays }}天</div>
                    <div class="stat-label">连续学习天数</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ currentPlan.totalStudyTime }}h</div>
                    <div class="stat-label">总学习时间</div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="AssessmentPlan">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { assessmentApi } from '@/api/assessment'
import { parseTime } from '@/utils'

const { proxy } = getCurrentInstance()

// 响应式数据
const planList = ref([])
const open = ref(false)
const detailOpen = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const currentPlan = ref(null)
const calendarDate = ref(new Date())

// 查询参数
const queryParams = ref({
  pageCurrent: 1,
  pageSize: 10,
  studentName: '',
  status: '',
  timeRange: []
})

// 学生列表
const studentList = ref([
  { id: 'stu001', name: '张三', className: '高三(1)班' },
  { id: 'stu002', name: '李四', className: '高三(2)班' },
  { id: 'stu003', name: '王五', className: '高三(1)班' }
])

// 表单数据
const form = ref({})

// 表单校验
const rules = ref({
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  planName: [
    { required: true, message: '计划名称不能为空', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'change' }
  ],
  targetScore: [
    { required: true, message: '目标分数不能为空', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
})

// 获取列表数据
const getList = () => {
  loading.value = true
  // 模拟数据
  setTimeout(() => {
    planList.value = [
      {
        id: 'plan001',
        studentId: 'stu001',
        studentName: '张三',
        studentAvatar: '',
        className: '高三(1)班',
        planName: '数学提分计划',
        subject: 'math',
        targetScore: 85,
        currentScore: 72,
        progress: 65,
        status: 'active',
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-03-01')
      },
      {
        id: 'plan002',
        studentId: 'stu002',
        studentName: '李四',
        studentAvatar: '',
        className: '高三(2)班',
        planName: '编程能力提升',
        subject: 'programming',
        targetScore: 90,
        currentScore: 78,
        progress: 45,
        status: 'active',
        startTime: new Date('2024-01-15'),
        endTime: new Date('2024-04-15')
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
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
    studentName: '',
    status: '',
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

// 新增按钮操作
const handleCreatePlan = () => {
  reset()
  open.value = true
  title.value = '创建提分计划'
}

// 修改按钮操作
const handleEdit = (row) => {
  reset()
  form.value = { ...row }
  open.value = true
  title.value = '修改提分计划'
}

// 查看详情
const handleView = (row) => {
  // 模拟详情数据
  currentPlan.value = {
    ...row,
    improvement: row.targetScore - row.currentScore,
    completedTasks: 8,
    totalTasks: 15,
    onTimeRate: 75,
    avgStudyTime: 2.5,
    streakDays: 12,
    totalStudyTime: 45,
    tasks: [
      {
        id: 'task001',
        title: '完成函数基础练习',
        type: 'practice',
        plannedDate: new Date('2024-01-20'),
        completedDate: new Date('2024-01-19'),
        status: 'completed'
      },
      {
        id: 'task002',
        title: '学习循环结构',
        type: 'study',
        plannedDate: new Date('2024-01-22'),
        completedDate: null,
        status: 'in_progress'
      }
    ]
  }
  detailOpen.value = true
}

// 任务管理
const handleTasks = (row) => {
  ElMessage.info('任务管理功能开发中...')
}

// 删除操作
const handleDelete = (row) => {
  const _ids = row.id || ids.value
  ElMessageBox.confirm('是否确认删除计划编号为"' + _ids + '"的数据项？').then(() => {
    ElMessage.success('删除成功')
    getList()
  }).catch(() => {})
}

// 批量生成
const handleBatchGenerate = () => {
  ElMessage.info('批量生成功能开发中...')
}

// 导出计划
const handleExportPlans = () => {
  ElMessage.info('导出功能开发中...')
}

// 完成任务
const completeTask = (task) => {
  ElMessageBox.confirm('确认完成这个任务吗？').then(() => {
    task.status = 'completed'
    task.completedDate = new Date()
    ElMessage.success('任务已完成')
  })
}

// 查看任务详情
const viewTaskDetail = (task) => {
  ElMessage.info('任务详情功能开发中...')
}

// 提交表单
const submitForm = () => {
  proxy.$refs.planRef.validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        ElMessage.success('修改成功')
        open.value = false
        getList()
      } else {
        ElMessage.success('新增成功')
        open.value = false
        getList()
      }
    }
  })
}

// 重置操作表单
const reset = () => {
  form.value = {
    id: null,
    studentId: null,
    planName: null,
    subject: null,
    targetScore: null,
    startTime: null,
    endTime: null,
    description: null,
    improvementAreas: [],
    frequency: 'weekly'
  }
  if (proxy.$refs.planRef) {
    proxy.$refs.planRef.resetFields()
  }
}

// 取消按钮
const cancel = () => {
  open.value = false
  reset()
}

// 工具方法
const getStatusTagType = (status) => {
  const typeMap = {
    active: 'success',
    completed: 'info',
    paused: 'warning',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

const getStatusLabel = (status) => {
  const typeMap = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
    cancelled: '已取消'
  }
  return typeMap[status] || status
}

const getSubjectLabel = (subject) => {
  const typeMap = {
    math: '数学',
    chinese: '语文',
    english: '英语',
    physics: '物理',
    chemistry: '化学',
    programming: '编程'
  }
  return typeMap[subject] || subject
}

const getTaskTypeLabel = (type) => {
  const typeMap = {
    study: '学习',
    practice: '练习',
    review: '复习',
    test: '测试'
  }
  return typeMap[type] || type
}

const getTaskStatusTagType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    overdue: 'danger'
  }
  return typeMap[status] || ''
}

const getTaskStatusLabel = (status) => {
  const typeMap = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return typeMap[status] || status
}

const getProgressColor = (percentage) => {
  if (percentage < 30) return 'var(--color-score-below-60)'
  if (percentage < 70) return 'var(--color-score-70-79)'
  return 'var(--color-score-90-plus)'
}

const isToday = (date) => {
  const today = new Date()
  const compareDate = new Date(date)
  return today.toDateString() === compareDate.toDateString()
}

const getTasksForDate = (date) => {
  if (!currentPlan.value?.tasks) return []
  return currentPlan.value.tasks.filter(task => {
    const taskDate = new Date(task.plannedDate).toDateString()
    const compareDate = new Date(date).toDateString()
    return taskDate === compareDate
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-details {
  flex: 1;
}

.student-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.student-class {
  font-size: 12px;
  color: #666;
}

.target-score {
  font-weight: 600;
  color: var(--color-score-90-plus);
}

.current-score {
  font-weight: 600;
  color: #409eff;
}

.plan-detail {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.plan-calendar {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-cell {
  height: 60px;
  padding: 2px;
  text-align: center;
}

.calendar-cell p {
  margin: 0;
  font-size: 14px;
}

.calendar-cell .is-today {
  color: #409eff;
  font-weight: bold;
}

.task-indicators {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-top: 2px;
}

.task-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e6a23c;
}

.task-dot.completed {
  background: var(--color-score-90-plus);
}

.progress-chart,
.progress-stats {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.progress-chart h4,
.progress-stats h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.chart-container,
.chart-placeholder {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100% - 40px);
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}
</style>