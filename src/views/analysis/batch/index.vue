<template>
  <div class="batch-analysis">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>批量数据分析</span>
          <div class="header-actions">
            <el-button type="primary" @click="showBatchOperationDialog = true">
              <el-icon><Operation /></el-icon>
              批量操作
            </el-button>
            <el-button type="success" @click="exportData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="学生总数" :value="overviewData.totalStudents">
              <template #suffix>人</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="活跃学生" :value="overviewData.activeStudents">
              <template #suffix>人</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="平均成绩" :value="overviewData.averageScore">
              <template #suffix">分</template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="平均学习时长" :value="overviewData.averageStudyTime">
              <template #suffix">分钟</template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <!-- 分析标签页 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 学生分析 -->
        <el-tab-pane label="学生分析" name="students">
          <div class="tab-content">
            <!-- 筛选条件 -->
            <el-form :inline="true" :model="studentFilters" class="filter-form">
              <el-form-item label="班级">
                <el-select v-model="studentFilters.classId" placeholder="选择班级" clearable style="width: 150px">
                  <el-option label="前端开发基础班" :value="1" />
                  <el-option label="Vue.js进阶班" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="studentFilters.status" placeholder="选择状态" clearable style="width: 120px">
                  <el-option label="活跃" :value="1" />
                  <el-option label="不活跃" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item label="搜索">
                <el-input
                  v-model="studentFilters.keyword"
                  placeholder="姓名或学号"
                  clearable
                  style="width: 150px"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleStudentSearch">搜索</el-button>
                <el-button @click="resetStudentFilters">重置</el-button>
              </el-form-item>
            </el-form>

            <!-- 学生表格 -->
            <el-table
              v-loading="studentsLoading"
              :data="studentList"
              stripe
              @selection-change="handleStudentSelection"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="className" label="班级" width="150" />
              <el-table-column prop="averageScore" label="平均成绩" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.averageScore)">
                    {{ row.averageScore }}分
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="videoWatchProgress" label="视频进度" width="120">
                <template #default="{ row }">
                  <el-progress
                    :percentage="row.videoWatchProgress"
                    :color="getProgressColor(row.videoWatchProgress)"
                    :stroke-width="6"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="exerciseCompletion" label="练习完成" width="120">
                <template #default="{ row }">
                  <el-progress
                    :percentage="row.exerciseCompletion"
                    :color="getProgressColor(row.exerciseCompletion)"
                    :stroke-width="6"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="totalStudyTime" label="学习时长" width="100">
                <template #default="{ row }">
                  {{ formatStudyTime(row.totalStudyTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="lastActiveTime" label="最后活跃" width="160">
                <template #default="{ row }">
                  {{ formatDateTime(row.lastActiveTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                    {{ row.status === 1 ? '活跃' : '不活跃' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="viewStudentDetail(row)">
                    详情
                  </el-button>
                  <el-button type="warning" size="small" @click="viewStudentTrend(row)">
                    趋势
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <Pagination
                v-show="studentTotal > 0"
                :total="studentTotal"
                v-model:page="studentFilters.page"
                v-model:limit="studentFilters.limit"
                @pagination="getStudentAnalysis"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 风险预警 -->
        <el-tab-pane label="风险预警" name="risk">
          <div class="tab-content">
            <el-alert
              title="风险预警说明"
              type="warning"
              description="系统会自动识别可能存在学习困难的学生，包括成绩偏低、学习时长不足、练习完成率低等情况。"
              :closable="false"
              style="margin-bottom: 20px;"
            />

            <!-- 风险筛选 -->
            <el-form :inline="true" :model="riskFilters" class="filter-form">
              <el-form-item label="风险等级">
                <el-select v-model="riskFilters.riskLevel" placeholder="选择风险等级" clearable style="width: 120px">
                  <el-option label="高风险" value="high" />
                  <el-option label="中风险" value="medium" />
                  <el-option label="低风险" value="low" />
                </el-select>
              </el-form-item>
              <el-form-item label="班级">
                <el-select v-model="riskFilters.classId" placeholder="选择班级" clearable style="width: 150px">
                  <el-option label="前端开发基础班" :value="1" />
                  <el-option label="Vue.js进阶班" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="getRiskStudents">刷新</el-button>
              </el-form-item>
            </el-form>

            <!-- 风险统计 -->
            <div class="risk-stats" v-if="riskStatistics">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-statistic title="高风险学生" :value="riskStatistics.highRisk" value-style="color: #f56c6c" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="中风险学生" :value="riskStatistics.mediumRisk" value-style="color: #e6a23c" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="低风险学生" :value="riskStatistics.lowRisk" value-style="color: #409eff" />
                </el-col>
              </el-row>
            </div>

            <!-- 风险学生列表 -->
            <el-table v-loading="riskLoading" :data="riskStudents" stripe style="margin-top: 20px;">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="studentId" label="学号" width="120" />
              <el-table-column prop="className" label="班级" width="150" />
              <el-table-column prop="averageScore" label="成绩" width="80">
                <template #default="{ row }">
                  <span :style="{ color: row.averageScore < 60 ? '#f56c6c' : '#67c23a' }">
                    {{ row.averageScore }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="riskLevel" label="风险等级" width="100">
                <template #default="{ row }">
                  <el-tag :type="getRiskTagType(row.riskLevel)" size="small">
                    {{ getRiskLabel(row.riskLevel) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="riskFactors" label="风险因素" min-width="200">
                <template #default="{ row }">
                  <el-tag
                    v-for="factor in row.riskFactors"
                    :key="factor"
                    size="small"
                    style="margin-right: 4px; margin-bottom: 4px;"
                    type="warning"
                  >
                    {{ factor }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="interveneStudent(row)">
                    干预
                  </el-button>
                  <el-button type="info" size="small" @click="contactStudent(row)">
                    联系
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 课程统计 -->
        <el-tab-pane label="课程统计" name="courses">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="12" v-for="course in courseStats" :key="course.courseId">
                <el-card class="course-stat-card">
                  <template #header>
                    <div class="course-header">
                      <span>{{ course.courseName }}</span>
                      <el-tag type="info">{{ course.totalStudents }}人</el-tag>
                    </div>
                  </template>

                  <div class="course-metrics">
                    <div class="metric-item">
                      <span class="metric-label">活跃学生</span>
                      <span class="metric-value">{{ course.activeStudents }}人</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">平均进度</span>
                      <el-progress
                        :percentage="course.averageProgress"
                        :color="getProgressColor(course.averageProgress)"
                        :stroke-width="8"
                      />
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">平均成绩</span>
                      <span class="metric-value">{{ course.averageScore }}分</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">完成率</span>
                      <span class="metric-value">{{ course.completionRate }}%</span>
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">满意度</span>
                      <el-rate
                        v-model="course.satisfactionRate"
                        disabled
                        show-score
                        text-color="#ff9900"
                        score-template="{value}"
                      />
                    </div>
                    <div class="metric-item">
                      <span class="metric-label">退课率</span>
                      <span class="metric-value" style="color: #f56c6c;">{{ course.dropRate }}%</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 作业分析 -->
        <el-tab-pane label="作业分析" name="assignments">
          <div class="tab-content">
            <el-table v-loading="assignmentsLoading" :data="assignmentData" stripe>
              <el-table-column prop="assignmentName" label="作业名称" min-width="200" />
              <el-table-column prop="courseName" label="所属课程" width="150" />
              <el-table-column prop="totalAssigned" label="布置人数" width="100" />
              <el-table-column prop="submitted" label="提交人数" width="100">
                <template #default="{ row }">
                  <el-progress
                    type="circle"
                    :percentage="Math.round((row.submitted / row.totalAssigned) * 100)"
                    :width="50"
                    :color="getProgressColor((row.submitted / row.totalAssigned) * 100)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="onTimeSubmitted" label="按时提交" width="100">
                <template #default="{ row }">
                  {{ row.onTimeSubmitted }}人
                </template>
              </el-table-column>
              <el-table-column prop="lateSubmitted" label="迟交" width="80">
                <template #default="{ row }">
                  <el-tag type="warning" size="small">{{ row.lateSubmitted }}人</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="notSubmitted" label="未提交" width="100">
                <template #default="{ row }">
                  <el-tag type="danger" size="small">{{ row.notSubmitted }}人</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="averageScore" label="平均分" width="100">
                <template #default="{ row }">
                  <el-tag :type="getScoreTagType(row.averageScore)">
                    {{ row.averageScore }}分
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="averageTimeSpent" label="平均用时" width="100">
                <template #default="{ row }">
                  {{ formatStudyTime(row.averageTimeSpent) }}
                </template>
              </el-table-column>
              <el-table-column prop="dueDate" label="截止时间" width="160">
                <template #default="{ row }">
                  {{ formatDateTime(row.dueDate) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchOperationDialog" title="批量操作" width="600px">
      <el-form :model="batchOperationForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="batchOperationForm.type">
            <el-radio label="status">更新状态</el-radio>
            <el-radio label="notification">发送通知</el-radio>
            <el-radio label="export">导出数据</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 状态更新 -->
        <el-form-item v-if="batchOperationForm.type === 'status'" label="新状态">
          <el-radio-group v-model="batchOperationForm.status">
            <el-radio :label="1">活跃</el-radio>
            <el-radio :label="0">不活跃</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 发送通知 -->
        <el-form-item v-if="batchOperationForm.type === 'notification'" label="通知标题">
          <el-input v-model="batchOperationForm.title" placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item v-if="batchOperationForm.type === 'notification'" label="通知内容">
          <el-input
            v-model="batchOperationForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          />
        </el-form-item>
        <el-form-item v-if="batchOperationForm.type === 'notification'" label="通知类型">
          <el-select v-model="batchOperationForm.notificationType" placeholder="选择通知类型">
            <el-option label="学习提醒" value="study_reminder" />
            <el-option label="作业通知" value="assignment" />
            <el-option label="成绩通知" value="grade" />
            <el-option label="系统通知" value="system" />
          </el-select>
        </el-form-item>

        <!-- 导出数据 -->
        <el-form-item v-if="batchOperationForm.type === 'export'" label="导出格式">
          <el-checkbox-group v-model="batchOperationForm.formats">
            <el-checkbox label="excel">Excel</el-checkbox>
            <el-checkbox label="pdf">PDF</el-checkbox>
            <el-checkbox label="csv">CSV</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="batchOperationForm.type === 'export'" label="导出内容">
          <el-checkbox-group v-model="batchOperationForm.content">
            <el-checkbox label="basic">基本信息</el-checkbox>
            <el-checkbox label="scores">成绩数据</el-checkbox>
            <el-checkbox label="behavior">学习行为</el-checkbox>
            <el-checkbox label="trends">趋势分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="影响范围">
          <el-radio-group v-model="batchOperationForm.scope">
            <el-radio label="selected">选中学生 ({{ selectedStudents.length }}人)</el-radio>
            <el-radio label="filtered">筛选结果 ({{ studentTotal }}人)</el-radio>
            <el-radio label="all">全部学生</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showBatchOperationDialog = false">取消</el-button>
        <el-button type="primary" @click="executeBatchOperation" :loading="batchOperating">
          执行操作
        </el-button>
      </template>
    </el-dialog>

    <!-- 学生详情对话框 -->
    <el-dialog v-model="showStudentDetailDialog" :title="`${currentStudent?.name} - 详细信息`" width="900px">
      <div v-if="currentStudent" class="student-detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentStudent.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentStudent.phone }}</el-descriptions-item>
          <el-descriptions-item label="加入时间">{{ currentStudent.joinTime }}</el-descriptions-item>
          <el-descriptions-item label="总学习时长">{{ formatStudyTime(currentStudent.totalStudyTime) }}</el-descriptions-item>
          <el-descriptions-item label="视频进度">{{ currentStudent.videoWatchProgress }}%</el-descriptions-item>
          <el-descriptions-item label="练习完成">{{ currentStudent.exerciseCompletion }}%</el-descriptions-item>
          <el-descriptions-item label="登录次数">{{ currentStudent.loginCount }}次</el-descriptions-item>
          <el-descriptions-item label="最后活跃">{{ formatDateTime(currentStudent.lastActiveTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentStudent.status === 1 ? 'success' : 'danger'">
              {{ currentStudent.status === 1 ? '活跃' : '不活跃' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 成绩分布 -->
        <div class="score-distribution" style="margin-top: 20px;">
          <h4>成绩分布</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="score-item">
                <div class="score-label">作业成绩</div>
                <div class="score-value">{{ currentStudent.assignmentScore }}分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-label">测验成绩</div>
                <div class="score-value">{{ currentStudent.quizScore }}分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-label">项目成绩</div>
                <div class="score-value">{{ currentStudent.projectScore }}分</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-label">参与度</div>
                <div class="score-value">{{ currentStudent.participationScore }}分</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>

    <!-- 学生趋势对话框 -->
    <el-dialog v-model="showStudentTrendDialog" :title="`${currentStudent?.name} - 学习趋势`" width="800px">
      <div v-if="trendData.length > 0" class="trend-chart">
        <div id="trendChart" style="width: 100%; height: 400px;"></div>
      </div>
      <div v-else class="no-data">
        <el-empty description="暂无趋势数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Operation, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import analysisApi from '@/api/analysis'

// 响应式数据
const activeTab = ref('students')
const studentsLoading = ref(false)
const riskLoading = ref(false)
const assignmentsLoading = ref(false)
const batchOperating = ref(false)
const showBatchOperationDialog = ref(false)
const showStudentDetailDialog = ref(false)
const showStudentTrendDialog = ref(false)

// 数据
const overviewData = ref({})
const studentList = ref([])
const selectedStudents = ref([])
const studentTotal = ref(0)
const riskStudents = ref([])
const riskStatistics = ref(null)
const courseStats = ref([])
const assignmentData = ref([])
const currentStudent = ref(null)
const trendData = ref([])

// 筛选表单
const studentFilters = reactive({
  page: 1,
  limit: 10,
  classId: null,
  status: null,
  keyword: ''
})

const riskFilters = reactive({
  riskLevel: null,
  classId: null
})

// 批量操作表单
const batchOperationForm = reactive({
  type: 'status',
  status: 1,
  title: '',
  content: '',
  notificationType: 'study_reminder',
  formats: ['excel'],
  content: ['basic'],
  scope: 'selected'
})

// 获取学生分析数据
const getStudentAnalysis = async () => {
  studentsLoading.value = true
  try {
    const response = await analysisApi.getStudentAnalysis(studentFilters)
    if (response.code === 200) {
      studentList.value = response.data.items
      studentTotal.value = response.data.total
      overviewData.value = response.data.statistics
    }
  } catch (error) {
    ElMessage.error('获取学生数据失败')
  } finally {
    studentsLoading.value = false
  }
}

// 获取风险学生
const getRiskStudents = async () => {
  riskLoading.value = true
  try {
    const response = await analysisApi.getRiskStudents(riskFilters)
    if (response.code === 200) {
      riskStudents.value = response.data.items
      riskStatistics.value = response.data.statistics
    }
  } catch (error) {
    ElMessage.error('获取风险学生数据失败')
  } finally {
    riskLoading.value = false
  }
}

// 获取课程统计
const getCourseStatistics = async () => {
  try {
    const response = await analysisApi.getCourseStatistics()
    if (response.code === 200) {
      courseStats.value = response.data
    }
  } catch (error) {
    ElMessage.error('获取课程统计数据失败')
  }
}

// 获取作业分析
const getAssignmentAnalysis = async () => {
  assignmentsLoading.value = true
  try {
    const response = await analysisApi.getAssignmentAnalysis({})
    if (response.code === 200) {
      assignmentData.value = response.data.items
    }
  } catch (error) {
    ElMessage.error('获取作业数据失败')
  } finally {
    assignmentsLoading.value = false
  }
}

// 标签页切换
const handleTabChange = (tab) => {
  if (tab === 'risk') {
    getRiskStudents()
  } else if (tab === 'courses') {
    getCourseStatistics()
  } else if (tab === 'assignments') {
    getAssignmentAnalysis()
  }
}

// 学生搜索
const handleStudentSearch = () => {
  studentFilters.page = 1
  getStudentAnalysis()
}

// 重置学生筛选
const resetStudentFilters = () => {
  studentFilters.classId = null
  studentFilters.status = null
  studentFilters.keyword = ''
  studentFilters.page = 1
  getStudentAnalysis()
}

// 学生选择变化
const handleStudentSelection = (selection) => {
  selectedStudents.value = selection
}

// 查看学生详情
const viewStudentDetail = (student) => {
  currentStudent.value = student
  showStudentDetailDialog.value = true
}

// 查看学生趋势
const viewStudentTrend = async (student) => {
  currentStudent.value = student
  showStudentTrendDialog.value = true

  try {
    const response = await analysisApi.getLearningTrends({
      studentId: student.id,
      period: '7d'
    })
    if (response.code === 200) {
      trendData.value = response.data
      await nextTick()
      renderTrendChart()
    }
  } catch (error) {
    ElMessage.error('获取趋势数据失败')
  }
}

// 渲染趋势图表
const renderTrendChart = () => {
  const chartDom = document.getElementById('trendChart')
  if (!chartDom) return

  const chart = echarts.init(chartDom)
  const dates = trendData.value.map(item => item.date)
  const studyTimes = trendData.value.map(item => item.studyTime)
  const exercises = trendData.value.map(item => item.exercisesCompleted)

  const option = {
    title: {
      text: '学习趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['学习时长(分钟)', '练习完成数'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '学习时长(分钟)',
        position: 'left'
      },
      {
        type: 'value',
        name: '练习完成数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '学习时长(分钟)',
        type: 'line',
        data: studyTimes,
        smooth: true
      },
      {
        name: '练习完成数',
        type: 'bar',
        yAxisIndex: 1,
        data: exercises
      }
    ]
  }

  chart.setOption(option)
}

// 干预学生
const interveneStudent = (student) => {
  ElMessageBox.prompt('请输入干预措施', '学生干预', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    ElMessage.success('干预措施已记录')
  })
}

// 联系学生
const contactStudent = (student) => {
  ElMessage.info(`正在联系 ${student.name}...`)
}

// 执行批量操作
const executeBatchOperation = async () => {
  let targetStudents = []

  if (batchOperationForm.scope === 'selected') {
    targetStudents = selectedStudents.value
  } else if (batchOperationForm.scope === 'filtered') {
    targetStudents = studentList.value
  } else {
    // all students - 需要重新获取所有学生数据
    targetStudents = studentList.value
  }

  if (targetStudents.length === 0) {
    ElMessage.warning('请选择操作目标')
    return
  }

  batchOperating.value = true

  try {
    if (batchOperationForm.type === 'status') {
      const studentIds = targetStudents.map(s => s.id)
      const response = await analysisApi.batchUpdateStudentStatus({
        studentIds,
        status: batchOperationForm.status
      })
      if (response.code === 200) {
        ElMessage.success(response.message)
        getStudentAnalysis()
      }
    } else if (batchOperationForm.type === 'notification') {
      const studentIds = targetStudents.map(s => s.id)
      const response = await analysisApi.batchSendNotification({
        studentIds,
        title: batchOperationForm.title,
        content: batchOperationForm.content,
        type: batchOperationForm.notificationType
      })
      if (response.code === 200) {
        ElMessage.success(response.message)
      }
    } else if (batchOperationForm.type === 'export') {
      const response = await analysisApi.exportAnalysisData({
        type: 'students',
        format: batchOperationForm.formats[0],
        filters: studentFilters
      })
      if (response.code === 200) {
        ElMessage.success('数据导出成功')
        // 模拟下载
        window.open(response.data.downloadUrl)
      }
    }

    showBatchOperationDialog.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    batchOperating.value = false
  }
}

// 导出数据
const exportData = () => {
  batchOperationForm.type = 'export'
  showBatchOperationDialog.value = true
}

// 工具方法
const getScoreTagType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'danger'
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#409eff'
  if (percentage >= 40) return '#e6a23c'
  return '#f56c6c'
}

const getRiskTagType = (level) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[level] || 'info'
}

const getRiskLabel = (level) => {
  const labelMap = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labelMap[level] || level
}

const formatStudyTime = (minutes) => {
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分钟`
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/analysis/batch/index.vue`);
  getStudentAnalysis()
})
</script>

<style scoped>
.batch-analysis {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-overview {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.tab-content {
  padding: 20px 0;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.risk-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: #fef0f0;
  border-radius: 8px;
  border: 1px solid #fbc4c4;
}

.course-stat-card {
  margin-bottom: 20px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: #606266;
  font-size: 14px;
}

.metric-value {
  font-weight: 600;
  color: #303133;
}

.student-detail {
  max-height: 600px;
  overflow-y: auto;
}

.score-distribution h4 {
  margin: 20px 0 15px 0;
  color: #303133;
}

.score-item {
  text-align: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.score-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.score-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.trend-chart {
  padding: 20px 0;
}

.no-data {
  text-align: center;
  padding: 40px 0;
}

:deep(.el-progress-bar__outer) {
  border-radius: 3px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 3px;
}
</style>