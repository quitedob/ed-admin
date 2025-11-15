<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>个人学习报告</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleGenerateReport">生成报告</el-button>
            <el-button type="success" @click="handleBatchGenerate">批量生成</el-button>
            <el-button @click="handleExportReport">导出报告</el-button>
          </div>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="学生姓名" prop="studentName">
          <el-select v-model="queryParams.studentId" placeholder="请选择学生" filterable clearable>
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报告类型" prop="reportType">
          <el-select v-model="queryParams.reportType" placeholder="请选择报告类型">
            <el-option label="周报告" value="weekly" />
            <el-option label="月报告" value="monthly" />
            <el-option label="学期报告" value="semester" />
            <el-option label="年度报告" value="yearly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="timeRange">
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
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 报告内容 -->
      <div v-if="reportData" class="report-content">
        <!-- 报告头部 -->
        <div class="report-header">
          <div class="student-info">
            <el-avatar :src="reportData.student.avatar" :size="64">
              {{ reportData.student.name?.charAt(0) }}
            </el-avatar>
            <div class="info-details">
              <h2>{{ reportData.student.name }}的学习报告</h2>
              <p class="report-meta">
                <span>{{ reportData.student.className }}</span>
                <span>学号：{{ reportData.student.studentId }}</span>
                <span>报告期间：{{ formatDateRange(queryParams.timeRange) }}</span>
              </p>
            </div>
          </div>
          <div class="report-summary">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic title="总体评分" :value="reportData.overallScore" suffix="分" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="学习时长" :value="reportData.totalStudyTime" suffix="小时" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="完成率" :value="reportData.completionRate" suffix="%" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="进步幅度" :value="reportData.improvement" suffix="分" />
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 报告标签页 -->
        <el-tabs v-model="activeReportTab" class="report-tabs">
          <!-- 学业成绩 -->
          <el-tab-pane label="学业成绩" name="grades">
            <div class="report-section">
              <h3>成绩概览</h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="grade-chart">
                    <h4>成绩趋势</h4>
                    <div class="chart-container">
                      <!-- 这里应该使用 ECharts 显示折线图 -->
                      <div class="chart-placeholder">
                        <el-empty description="成绩趋势图表" />
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="grade-distribution">
                    <h4>成绩分布</h4>
                    <div class="grade-stats">
                      <div class="grade-item">
                        <span class="subject">数学</span>
                        <span class="score">{{ reportData.grades.math }}分</span>
                        <el-progress
                          :percentage="reportData.grades.math"
                          :stroke-width="8"
                          :show-text="false"
                        />
                      </div>
                      <div class="grade-item">
                        <span class="subject">语文</span>
                        <span class="score">{{ reportData.grades.chinese }}分</span>
                        <el-progress
                          :percentage="reportData.grades.chinese"
                          :stroke-width="8"
                          :show-text="false"
                          color="#67c23a"
                        />
                      </div>
                      <div class="grade-item">
                        <span class="subject">英语</span>
                        <span class="score">{{ reportData.grades.english }}分</span>
                        <el-progress
                          :percentage="reportData.grades.english"
                          :stroke-width="8"
                          :show-text="false"
                          color="#e6a23c"
                        />
                      </div>
                      <div class="grade-item">
                        <span class="subject">编程</span>
                        <span class="score">{{ reportData.grades.programming }}分</span>
                        <el-progress
                          :percentage="reportData.grades.programming"
                          :stroke-width="8"
                          :show-text="false"
                          color="#f56c6c"
                        />
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="grade-details">
                <h4>详细成绩</h4>
                <el-table :data="reportData.gradeDetails" stripe>
                  <el-table-column label="科目" prop="subject" />
                  <el-table-column label="平时成绩" prop="usualScore" width="100" />
                  <el-table-column label="期中成绩" prop="midtermScore" width="100" />
                  <el-table-column label="期末成绩" prop="finalScore" width="100" />
                  <el-table-column label="总评成绩" prop="totalScore" width="100">
                    <template #default="scope">
                      <span :style="{ color: getGradeColor(scope.row.totalScore) }">
                        {{ scope.row.totalScore }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="班级排名" prop="classRank" width="100" />
                  <el-table-column label="年级排名" prop="gradeRank" width="100" />
                  <el-table-column label="进步情况" prop="improvement" width="100">
                    <template #default="scope">
                      <span :style="{ color: scope.row.improvement > 0 ? '#67c23a' : '#f56c6c' }">
                        {{ scope.row.improvement > 0 ? '+' : '' }}{{ scope.row.improvement }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 课程参与度 -->
          <el-tab-pane label="课程参与度" name="participation">
            <div class="report-section">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="participation-card">
                    <h4>视频观看</h4>
                    <div class="participation-stats">
                      <el-statistic title="总观看时长" :value="reportData.participation.videoWatchTime" suffix="分钟" />
                      <el-statistic title="完成率" :value="reportData.participation.videoCompletionRate" suffix="%" />
                      <el-statistic title="平均进度" :value="reportData.participation.avgVideoProgress" suffix="%" />
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="participation-card">
                    <h4>练习完成</h4>
                    <div class="participation-stats">
                      <el-statistic title="总练习数" :value="reportData.participation.totalExercises" />
                      <el-statistic title="完成率" :value="reportData.participation.exerciseCompletionRate" suffix="%" />
                      <el-statistic title="正确率" :value="reportData.participation.exerciseAccuracy" suffix="%" />
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="participation-card">
                    <h4>互动参与</h4>
                    <div class="participation-stats">
                      <el-statistic title="提问次数" :value="reportData.participation.questionCount" />
                      <el-statistic title="回答次数" :value="reportData.participation.answerCount" />
                      <el-statistic title="讨论参与" :value="reportData.participation.discussionCount" />
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="participation-chart">
                <h4>学习活跃度趋势</h4>
                <div class="chart-container">
                  <!-- 这里应该显示活跃度图表 -->
                  <div class="chart-placeholder">
                    <el-empty description="学习活跃度图表" />
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 练习表现 -->
          <el-tab-pane label="练习表现" name="practice">
            <div class="report-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="practice-overview">
                    <h4>练习统计</h4>
                    <div class="practice-stats">
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.practice.totalSubmissions }}</div>
                        <div class="stat-label">总提交次数</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.practice.acceptedSubmissions }}</div>
                        <div class="stat-label">通过次数</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.practice.acceptanceRate }}%</div>
                        <div class="stat-label">通过率</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.practice.avgAttempts }}</div>
                        <div class="stat-label">平均尝试次数</div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="difficulty-distribution">
                    <h4>难度分布</h4>
                    <div class="difficulty-stats">
                      <div class="difficulty-item">
                        <span class="difficulty-label">简单</span>
                        <el-progress
                          :percentage="reportData.practice.difficulty.easy.rate"
                          :stroke-width="8"
                          color="#67c23a"
                        />
                        <span class="difficulty-count">{{ reportData.practice.difficulty.easy.count }}题</span>
                      </div>
                      <div class="difficulty-item">
                        <span class="difficulty-label">中等</span>
                        <el-progress
                          :percentage="reportData.practice.difficulty.medium.rate"
                          :stroke-width="8"
                          color="#e6a23c"
                        />
                        <span class="difficulty-count">{{ reportData.practice.difficulty.medium.count }}题</span>
                      </div>
                      <div class="difficulty-item">
                        <span class="difficulty-label">困难</span>
                        <el-progress
                          :percentage="reportData.practice.difficulty.hard.rate"
                          :stroke-width="8"
                          color="#f56c6c"
                        />
                        <span class="difficulty-count">{{ reportData.practice.difficulty.hard.count }}题</span>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="knowledge-points">
                <h4>知识点掌握情况</h4>
                <el-table :data="reportData.practice.knowledgePoints" stripe>
                  <el-table-column label="知识点" prop="name" />
                  <el-table-column label="题目数量" prop="problemCount" width="100" />
                  <el-table-column label="通过率" prop="acceptanceRate" width="120">
                    <template #default="scope">
                      <el-progress
                        :percentage="scope.row.acceptanceRate"
                        :stroke-width="6"
                        :color="getAcceptanceColor(scope.row.acceptanceRate)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="掌握程度" prop="masteryLevel" width="120">
                    <template #default="scope">
                      <el-tag :type="getMasteryTagType(scope.row.masteryLevel)">
                        {{ getMasteryLabel(scope.row.masteryLevel) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- AI使用情况 -->
          <el-tab-pane label="AI使用情况" name="ai-usage">
            <div class="report-section">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="ai-overview">
                    <h4>AI助教使用统计</h4>
                    <div class="ai-stats">
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.aiUsage.totalConversations }}</div>
                        <div class="stat-label">对话次数</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.aiUsage.totalQuestions }}</div>
                        <div class="stat-label">提问总数</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.aiUsage.avgResponseTime }}s</div>
                        <div class="stat-label">平均响应时间</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ reportData.aiUsage.satisfactionRate }}%</div>
                        <div class="stat-label">满意度</div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="question-types">
                    <h4>问题类型分布</h4>
                    <div class="question-chart">
                      <!-- 这里应该显示问题类型饼图 -->
                      <div class="chart-placeholder">
                        <el-empty description="问题类型分布图" />
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div class="ai-feedback">
                <h4>AI使用反馈</h4>
                <el-timeline>
                  <el-timeline-item
                    v-for="feedback in reportData.aiUsage.feedback"
                    :key="feedback.id"
                    :timestamp="formatDate(feedback.timestamp)"
                  >
                    <div class="feedback-content">
                      <div class="feedback-question">{{ feedback.question }}</div>
                      <div class="feedback-answer">{{ feedback.answer }}</div>
                      <div class="feedback-rating">
                        <el-rate
                          v-model="feedback.rating"
                          disabled
                          show-score
                          text-color="#ff9900"
                        />
                      </div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </el-tab-pane>

          <!-- 能力雷达图 -->
          <el-tab-pane label="能力分析" name="capability">
            <div class="report-section">
              <div class="capability-radar">
                <h4>能力雷达图</h4>
                <div class="radar-container">
                  <!-- 这里应该使用 ECharts 显示雷达图 -->
                  <div class="chart-placeholder">
                    <el-empty description="能力雷达图" />
                  </div>
                </div>
              </div>

              <div class="capability-details">
                <h4>能力详情</h4>
                <el-row :gutter="20">
                  <el-col
                    v-for="capability in reportData.capabilities"
                    :key="capability.name"
                    :span="6"
                  >
                    <div class="capability-item">
                      <div class="capability-name">{{ capability.name }}</div>
                      <div class="capability-score">
                        <el-progress
                          type="circle"
                          :percentage="capability.score"
                          :width="80"
                          :color="getCapabilityColor(capability.score)"
                        />
                      </div>
                      <div class="capability-level">{{ capability.level }}</div>
                      <div class="capability-desc">{{ capability.description }}</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>

          <!-- AI评语与建议 -->
          <el-tab-pane label="AI评语与建议" name="ai-commentary">
            <div class="report-section">
              <div class="ai-commentary">
                <div class="commentary-header">
                  <h4>AI综合评语</h4>
                  <el-button size="small" @click="regenerateCommentary">
                    <el-icon><Refresh /></el-icon>
                    重新生成
                  </el-button>
                </div>
                <div class="commentary-content">
                  <div class="commentary-item">
                    <h5>学习表现</h5>
                    <p>{{ reportData.aiCommentary.performance }}</p>
                  </div>
                  <div class="commentary-item">
                    <h5>优势特点</h5>
                    <p>{{ reportData.aiCommentary.strengths }}</p>
                  </div>
                  <div class="commentary-item">
                    <h5>改进建议</h5>
                    <p>{{ reportData.aiCommentary.suggestions }}</p>
                  </div>
                  <div class="commentary-item">
                    <h5>学习计划</h5>
                    <p>{{ reportData.aiCommentary.studyPlan }}</p>
                  </div>
                </div>

                <div class="teacher-modification">
                  <h4>教师修改</h4>
                  <el-input
                    v-model="teacherCommentary"
                    type="textarea"
                    :rows="4"
                    placeholder="教师可以在此修改或补充评语..."
                  />
                  <div class="modification-actions">
                    <el-button type="primary" @click="saveCommentary">保存修改</el-button>
                    <el-button @click="resetCommentary">重置</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 报告操作 -->
        <div class="report-actions">
          <el-button type="primary" @click="handleShareReport">分享报告</el-button>
          <el-button type="success" @click="handlePrintReport">打印报告</el-button>
          <el-button @click="handleSaveTemplate">保存为模板</el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="请选择学生并生成报告" />
    </el-card>
  </div>
</template>

<script setup name="LearningReport">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { learningApi } from '@/api/learning'
import { parseTime } from '@/utils'

// 响应式数据
const activeReportTab = ref('grades')
const reportData = ref(null)
const teacherCommentary = ref('')

// 查询参数
const queryParams = reactive({
  studentId: '',
  reportType: 'monthly',
  timeRange: []
})

// 学生列表
const studentList = ref([
  { id: 'stu001', name: '张三', className: '高三(1)班' },
  { id: 'stu002', name: '李四', className: '高三(2)班' },
  { id: 'stu003', name: '王五', className: '高三(1)班' }
])

// 查询按钮操作
const handleQuery = () => {
  if (!queryParams.studentId) {
    ElMessage.error('请选择学生')
    return
  }
  generateReport()
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryParams, {
    studentId: '',
    reportType: 'monthly',
    timeRange: []
  })
  reportData.value = null
}

// 生成报告
const generateReport = async () => {
  try {
    // 模拟报告数据
    reportData.value = {
      student: {
        name: '张三',
        className: '高三(1)班',
        studentId: '2021001',
        avatar: ''
      },
      overallScore: 85,
      totalStudyTime: 126,
      completionRate: 78,
      improvement: 12,
      grades: {
        math: 82,
        chinese: 88,
        english: 76,
        programming: 90
      },
      gradeDetails: [
        {
          subject: '数学',
          usualScore: 85,
          midtermScore: 80,
          finalScore: 82,
          totalScore: 82,
          classRank: 8,
          gradeRank: 45,
          improvement: 5
        }
      ],
      participation: {
        videoWatchTime: 2450,
        videoCompletionRate: 85,
        avgVideoProgress: 78,
        totalExercises: 156,
        exerciseCompletionRate: 92,
        exerciseAccuracy: 78,
        questionCount: 23,
        answerCount: 15,
        discussionCount: 8
      },
      practice: {
        totalSubmissions: 245,
        acceptedSubmissions: 189,
        acceptanceRate: 77,
        avgAttempts: 2.3,
        difficulty: {
          easy: { count: 120, rate: 49 },
          medium: { count: 85, rate: 35 },
          hard: { count: 40, rate: 16 }
        },
        knowledgePoints: [
          {
            name: '函数基础',
            problemCount: 25,
            acceptanceRate: 82,
            masteryLevel: 'mastered'
          }
        ]
      },
      aiUsage: {
        totalConversations: 45,
        totalQuestions: 128,
        avgResponseTime: 2.5,
        satisfactionRate: 88,
        feedback: [
          {
            id: 1,
            question: '这道数学题的解题思路是什么？',
            answer: '首先理解题意，然后分析已知条件...',
            rating: 4.5,
            timestamp: new Date('2024-01-15 14:30:00')
          }
        ]
      },
      capabilities: [
        {
          name: '逻辑思维',
          score: 85,
          level: '良好',
          description: '逻辑推理能力较强，能快速分析问题'
        },
        {
          name: '基础知识',
          score: 90,
          level: '优秀',
          description: '基础概念掌握扎实，理解深入'
        },
        {
          name: '代码实现',
          score: 78,
          level: '良好',
          description: '编程能力良好，需要多练习复杂算法'
        },
        {
          name: '问题解决',
          score: 82,
          level: '良好',
          description: '问题分析能力较好，解题思路清晰'
        }
      ],
      aiCommentary: {
        performance: '该生在本学习阶段表现良好，学习态度端正，能够按时完成学习任务...',
        strengths: '逻辑思维能力强，基础知识扎实，具有良好的学习习惯...',
        suggestions: '建议加强编程实践，多参与代码编写，提高算法设计能力...',
        studyPlan: '下一步重点提升代码实现能力，建议每天坚持编程练习1小时...'
      }
    }

    ElMessage.success('报告生成成功')
  } catch (error) {
    ElMessage.error('报告生成失败')
  }
}

// 生成报告按钮
const handleGenerateReport = () => {
  generateReport()
}

// 批量生成
const handleBatchGenerate = () => {
  ElMessage.info('批量生成功能开发中...')
}

// 导出报告
const handleExportReport = () => {
  ElMessage.info('导出功能开发中...')
}

// 分享报告
const handleShareReport = () => {
  ElMessage.info('分享功能开发中...')
}

// 打印报告
const handlePrintReport = () => {
  window.print()
}

// 保存模板
const handleSaveTemplate = () => {
  ElMessage.info('保存模板功能开发中...')
}

// 重新生成评语
const regenerateCommentary = () => {
  ElMessage.info('正在重新生成AI评语...')
}

// 保存评语修改
const saveCommentary = () => {
  ElMessage.success('评语修改已保存')
}

// 重置评语
const resetCommentary = () => {
  teacherCommentary.value = ''
}

// 工具方法
const formatDateRange = (timeRange) => {
  if (!timeRange || timeRange.length !== 2) return ''
  const start = new Date(timeRange[0]).toLocaleDateString()
  const end = new Date(timeRange[1]).toLocaleDateString()
  return `${start} 至 ${end}`
}

const formatDate = (date) => {
  return parseTime(date)
}

const getGradeColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getAcceptanceColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getMasteryTagType = (level) => {
  const types = {
    mastered: 'success',
    familiar: 'primary',
    learning: 'warning',
    weak: 'danger'
  }
  return types[level] || ''
}

const getMasteryLabel = (level) => {
  const labels = {
    mastered: '已掌握',
    familiar: '熟悉',
    learning: '学习中',
    weak: '薄弱'
  }
  return labels[level] || level
}

const getCapabilityColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  // 设置默认时间范围为最近一个月
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 1)
  queryParams.timeRange = [
    start.toISOString().slice(0, 19).replace('T', ' '),
    end.toISOString().slice(0, 19).replace('T', ' ')
  ]
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.report-content {
  margin-top: 20px;
}

.report-header {
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.info-details h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.report-meta {
  margin: 0;
  opacity: 0.9;
}

.report-meta span {
  margin-right: 20px;
}

.report-summary {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.report-tabs {
  margin-top: 30px;
}

.report-section {
  padding: 20px 0;
}

.report-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 10px;
}

.report-section h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
}

.chart-container,
.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.grade-chart,
.grade-distribution {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 350px;
}

.grade-stats {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.grade-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.subject {
  width: 60px;
  font-size: 14px;
  color: #606266;
}

.score {
  width: 50px;
  font-weight: 500;
  color: #303133;
}

.grade-item .el-progress {
  flex: 1;
}

.grade-details {
  margin-top: 30px;
}

.participation-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 200px;
}

.participation-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  height: calc(100% - 40px);
}

.participation-chart {
  margin-top: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.practice-overview,
.difficulty-distribution {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.practice-stats {
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
  font-size: 28px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.difficulty-stats {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.difficulty-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.difficulty-label {
  width: 50px;
  font-size: 14px;
  color: #606266;
}

.difficulty-item .el-progress {
  flex: 1;
}

.difficulty-count {
  width: 50px;
  text-align: right;
  font-size: 14px;
  color: #303133;
}

.knowledge-points {
  margin-top: 20px;
}

.ai-overview,
.question-types {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
}

.ai-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100% - 40px);
}

.question-chart {
  height: calc(100% - 40px);
}

.ai-feedback {
  margin-top: 20px;
}

.feedback-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.feedback-question {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.feedback-answer {
  color: #606266;
  margin-bottom: 10px;
}

.feedback-rating {
  text-align: right;
}

.capability-radar {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
}

.radar-container {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capability-details {
  margin-top: 30px;
}

.capability-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s;
}

.capability-item:hover {
  transform: translateY(-2px);
}

.capability-name {
  font-weight: 500;
  margin-bottom: 10px;
  color: #303133;
}

.capability-score {
  margin-bottom: 10px;
}

.capability-level {
  font-size: 14px;
  color: #409eff;
  margin-bottom: 5px;
}

.capability-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.ai-commentary {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.commentary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.commentary-item {
  margin-bottom: 20px;
}

.commentary-item h5 {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 16px;
}

.commentary-item p {
  margin: 0;
  line-height: 1.6;
  color: #303133;
}

.teacher-modification {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.modification-actions {
  margin-top: 15px;
  text-align: right;
}

.report-actions {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.report-actions .el-button {
  margin: 0 10px;
}

@media print {
  .header-actions,
  .report-actions,
  .el-tabs__header,
  .commentary-header,
  .modification-actions {
    display: none;
  }

  .report-tabs {
    border: none;
  }

  .el-tab-pane {
    display: block !important;
  }
}
</style>