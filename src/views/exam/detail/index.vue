<template>
  <div class="app-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button @click="goBack" :icon="ArrowLeft">返回考试列表</el-button>
    </div>

    <!-- 考试基本信息 -->
    <div class="exam-header">
      <div class="exam-info">
        <div class="exam-title">
          <h1>{{ examInfo.basicInfo?.title }}</h1>
          <div class="exam-meta">
            <el-tag :type="getTypeTagType(examInfo.basicInfo?.type)">
              {{ getTypeText(examInfo.basicInfo?.type) }}
            </el-tag>
            <el-tag :type="getDifficultyTagType(examInfo.basicInfo?.difficulty)">
              {{ getDifficultyText(examInfo.basicInfo?.difficulty) }}
            </el-tag>
          </div>
        </div>
        <div class="exam-desc">{{ examInfo.basicInfo?.description }}</div>
      </div>
      <div class="exam-actions toolbar-actions">
        <el-button type="primary" @click="toExamEdit">编辑考试</el-button>
        <el-button type="success" @click="toExamGrade">批改考试</el-button>
        <el-button type="warning" @click="toExamMonitor">监控考试</el-button>
      </div>
    </div>

    <!-- 元数据信息 -->
    <div class="metadata-section">
      <h3>元数据信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="考试ID">{{ examInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ examInfo.metadata?.version }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(examInfo.metadata?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(examInfo.metadata?.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ examInfo.metadata?.createdBy }}</el-descriptions-item>
        <el-descriptions-item label="所属课程">{{ getCourseName(examInfo.metadata?.courseId) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 时间安排 -->
    <div class="schedule-section">
      <h3>时间安排</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="开始时间">{{ formatDate(examInfo.schedule?.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDate(examInfo.schedule?.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="考试时长">{{ examInfo.schedule?.duration }}分钟</el-descriptions-item>
        <el-descriptions-item label="查看开始时间">{{ formatDate(examInfo.schedule?.reviewStartTime) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 考试设置 -->
    <div class="settings-section">
      <h3>考试设置</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="总分值">{{ examInfo.settings?.totalScore }}</el-descriptions-item>
        <el-descriptions-item label="及格分数">{{ examInfo.settings?.passingScore }}</el-descriptions-item>
        <el-descriptions-item label="提交后显示分数">
          <el-tag :type="examInfo.settings?.showScoreAfterSubmit ? 'success' : 'info'">
            {{ examInfo.settings?.showScoreAfterSubmit ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="随机题目顺序">
          <el-tag :type="examInfo.settings?.randomOrder ? 'success' : 'info'">
            {{ examInfo.settings?.randomOrder ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="随机题目">
          <el-tag :type="examInfo.settings?.randomQuestions ? 'success' : 'info'">
            {{ examInfo.settings?.randomQuestions ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="每题库题目数">{{ examInfo.settings?.questionsPerBank }}</el-descriptions-item>
        <el-descriptions-item label="允许查看">
          <el-tag :type="examInfo.settings?.allowReview ? 'success' : 'info'">
            {{ examInfo.settings?.allowReview ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="查看延迟(秒)">{{ examInfo.settings?.reviewDelay }}</el-descriptions-item>
        <el-descriptions-item label="需要监考">
          <el-tag :type="examInfo.settings?.proctorRequired ? 'warning' : 'success'">
            {{ examInfo.settings?.proctorRequired ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="需要摄像头">
          <el-tag :type="examInfo.settings?.cameraRequired ? 'warning' : 'success'">
            {{ examInfo.settings?.cameraRequired ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 评分设置 -->
    <div class="grading-section">
      <h3>评分设置</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="自动批改">
          <el-tag :type="examInfo.grading?.autoGrade ? 'success' : 'info'">
            {{ examInfo.grading?.autoGrade ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="需要人工批改">
          <el-tag :type="examInfo.grading?.manualReviewRequired ? 'warning' : 'success'">
            {{ examInfo.grading?.manualReviewRequired ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="问答题批改老师">
          <el-tag v-if="examInfo.grading?.essayReviewers" v-for="teacher in examInfo.grading.essayReviewers" :key="teacher" size="small" type="info">
            {{ teacher }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="批改截止时间">{{ formatDate(examInfo.grading?.gradingDeadline) }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 统计数据 -->
    <div class="stats-section">
      <h3>统计数据</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="参加人数" :value="examStats.actualParticipants || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="提交人数" :value="examStats.completionCount || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均分数" :value="examStats.averageScore || 0" :precision="2" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="最高分" :value="examStats.maxScore || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="最低分" :value="examStats.minScore || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="题目完成度" :value="examStats.completionRate || 0" suffix="%" />
        </el-col>
      </el-row>
    </div>

    <!-- 标签页内容 -->
    <el-tabs v-model="activeTab" class="exam-tabs">
      <!-- 学生视图 -->
      <el-tab-pane label="学生视图" name="studentView">
        <div class="student-view-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="student-list-panel">
                <h4>学生列表</h4>
                <el-input
                  v-model="studentSearchKeyword"
                  placeholder="搜索学生..."
                  clearable
                  class="student-search"
                />
                <div class="student-list">
                  <div
                    v-for="student in filteredStudents"
                    :key="student.id"
                    :class="['student-item', { active: selectedStudent?.id === student.id }]"
                    @click="selectedStudent = student"
                  >
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-score">{{ student.score }}/{{ examInfo.settings?.totalScore }}</div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="16">
              <div class="student-detail-panel" v-if="selectedStudent">
                <h4>{{ selectedStudent.name }} 的答题详情</h4>
                <el-descriptions :column="2" border size="small" class="student-info">
                  <el-descriptions-item label="学号">{{ selectedStudent.studentId }}</el-descriptions-item>
                  <el-descriptions-item label="得分">{{ selectedStudent.score }}/{{ examInfo.settings?.totalScore }}</el-descriptions-item>
                  <el-descriptions-item label="提交时间">{{ formatDate(selectedStudent.submitTime) }}</el-descriptions-item>
                  <el-descriptions-item label="用时">{{ selectedStudent.duration }}分钟</el-descriptions-item>
                </el-descriptions>
                <div class="answer-details">
                  <div v-for="(answer, index) in selectedStudent.answers" :key="index" class="answer-item">
                    <div class="answer-header">
                      <span class="question-num">第{{ index + 1 }}题</span>
                      <el-tag :type="answer.isCorrect ? 'success' : 'danger'">
                        {{ answer.isCorrect ? '正确' : '错误' }}
                      </el-tag>
                      <span class="answer-score">{{ answer.score }}/{{ answer.totalScore }}分</span>
                    </div>
                    <div class="answer-content">
                      <div class="student-answer">学生答案: {{ answer.studentAnswer }}</div>
                      <div v-if="!answer.isCorrect" class="correct-answer">正确答案: {{ answer.correctAnswer }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="请选择学生查看答题详情" />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 题目视图 -->
      <el-tab-pane label="题目视图" name="questionView">
        <div class="question-view-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="question-list-panel">
                <h4>题目列表</h4>
                <div class="question-list">
                  <div
                    v-for="(question, index) in examQuestions"
                    :key="question.id"
                    :class="['question-item-card', { active: selectedQuestion?.id === question.id }]"
                    @click="selectedQuestion = question"
                  >
                    <div class="question-num">第{{ index + 1 }}题</div>
                    <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
                    <div class="question-score">{{ question.score }}分</div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="16">
              <div class="question-stats-panel" v-if="selectedQuestion">
                <h4>{{ selectedQuestion.questionText }}</h4>
                <el-descriptions :column="2" border size="small" class="question-info">
                  <el-descriptions-item label="题型">{{ getQuestionTypeText(selectedQuestion.type) }}</el-descriptions-item>
                  <el-descriptions-item label="分值">{{ selectedQuestion.score }}分</el-descriptions-item>
                  <el-descriptions-item label="难度">{{ getDifficultyText(selectedQuestion.difficulty) }}</el-descriptions-item>
                  <el-descriptions-item label="平均得分">{{ getQuestionAverageScore(selectedQuestion.id) }}分</el-descriptions-item>
                </el-descriptions>
                <div class="answer-statistics">
                  <h5>学生答题统计</h5>
                  <el-table :data="getQuestionAnswerStats(selectedQuestion.id)" size="small" stripe>
                    <el-table-column label="学生姓名" prop="studentName" />
                    <el-table-column label="学生答案" prop="answer" />
                    <el-table-column label="得分" prop="score" width="80" />
                    <el-table-column label="是否正确" width="100">
                      <template #default="scope">
                        <el-tag :type="scope.row.isCorrect ? 'success' : 'danger'">
                          {{ scope.row.isCorrect ? '正确' : '错误' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
              <el-empty v-else description="请选择题目查看答题统计" />
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 题目库 -->
      <el-tab-pane label="题目库" name="questionBanks">
        <div class="banks-content">
          <div class="bank-actions">
            <el-button type="primary" @click="toQuestionBankManage()">管理题目库</el-button>
          </div>
          
          <div v-if="questionBanks.length > 0" class="bank-list">
            <div
              v-for="(bank, index) in questionBanks"
              :key="bank.id"
              class="bank-item"
            >
              <div class="bank-header">
                <span class="bank-name">{{ bank.name }}</span>
                <span class="bank-type">{{ getBankTypeText(bank.type) }}</span>
                <span class="bank-count">{{ bank.questionCount }}题</span>
                <div class="bank-actions">
                  <el-button size="small" @click="editQuestionBank(bank)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteQuestionBank(index)">删除</el-button>
                </div>
              </div>
              <div class="bank-content">
                <div class="bank-questions">
                  <div
                        v-for="(question, qIndex) in bank.questions"
                        :key="question.id"
                        class="question-item"
                      >
                        <span class="question-index">{{ qIndex + 1 }}.</span>
                        <span class="question-type">{{ getQuestionTypeText(question.type) }}</span>
                        <span class="question-score">{{ question.score }}分</span>
                        <span class="question-difficulty">{{ getDifficultyText(question.difficulty) }}</span>
                      </div>
                      
                      <!-- 题目内容 -->
                      <div class="question-content">
                        <div class="question-text">{{ question.questionText }}</div>
                        
                        <!-- 单选题和多选题选项 -->
                        <div v-if="question.type === 'single' || question.type === 'multiple'" class="question-options">
                          <div
                                v-for="option in question.options"
                                :key="option.id"
                                class="option-item"
                              >
                            <span class="option-value">{{ option.value }}.</span>
                            <span class="option-text">{{ option.text }}</span>
                            <span v-if="isCorrectOption(question, option)" class="correct-mark">✓</span>
                          </div>
                        </div>
                        
                        <!-- 填空题 -->
                        <div v-else-if="question.type === 'fill'" class="question-fill">
                          <div class="fill-hint">填空题，请直接在答题区域填写答案</div>
                          <div class="fill-answers">
                            <div
                                  v-for="(answer, ansIndex) in question.correctAnswers"
                                  :key="ansIndex"
                                  class="fill-answer"
                                >
                              <span class="fill-index">答案{{ ansIndex + 1 }}:</span>
                              <span class="fill-value">{{ answer }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 问答题 -->
                        <div v-else-if="question.type === 'essay'" class="question-essay">
                          <div class="essay-hint">问答题，请详细回答以下问题</div>
                          <div class="essay-answer">
                            <span class="answer-label">参考答案:</span>
                            <div class="answer-content">{{ question.referenceAnswer }}</div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 题目解析 -->
                      <div v-if="question.explanation" class="question-explanation">
                        <span class="explanation-label">题目解析:</span>
                        <div class="explanation-content">{{ question.explanation }}</div>
                      </div>
                      
                      <!-- 知识点 -->
                      <div v-if="question.knowledgePoints && question.knowledgePoints.length > 0" class="question-knowledge">
                        <span class="knowledge-label">知识点:</span>
                        <el-tag
                          v-for="point in question.knowledgePoints"
                          :key="point"
                          size="small"
                          class="knowledge-tag"
                        >
                          {{ point }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <el-empty v-else description="暂无题目库，请添加题目库" />
        </div>
      </el-tab-pane>

      <!-- 提交情况 -->
      <el-tab-pane label="提交情况" name="submissions">
        <div class="submissions-content">
          <div class="submission-actions">
            <el-button type="primary" @click="toExamGrade()">批改考试</el-button>
            <el-button @click="exportSubmissions()">导出提交</el-button>
          </div>
          
          <el-table :data="submissions" stripe>
            <el-table-column label="学生姓名" prop="studentName" />
            <el-table-column label="提交时间" prop="submitTime">
              <template #default="scope">
                {{ formatDate(scope.row.submitTime) }}
              </template>
            </el-table-column>
            <el-table-column label="得分" prop="score" />
            <el-table-column label="状态" prop="status">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="用时" prop="duration" />
            <el-table-column label="IP地址" prop="ipAddress" />
            <el-table-column label="设备信息" prop="deviceInfo" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <div class="table-actions">
                  <el-button text type="primary" @click="viewSubmission(scope.row)">查看</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <pagination
            v-show="submissionTotal > 0"
            :total="submissionTotal"
            :page.sync="submissionPage"
            :limit.sync="submissionPageSize"
            @pagination="getSubmissions"
          />
        </div>
      </el-tab-pane>

      <!-- 考试监控 -->
      <el-tab-pane label="考试监控" name="monitor">
        <div class="monitor-content">
          <div class="monitor-actions">
            <el-button type="warning" @click="endExam()">结束考试</el-button>
            <el-button type="info" @click="pauseExam()">暂停考试</el-button>
            <el-button type="success" @click="resumeExam()">恢复考试</el-button>
          </div>
          
          <div class="monitor-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-statistic title="当前在线人数" :value="monitorStats.onlineCount || 0" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="已提交人数" :value="monitorStats.submittedCount || 0" />
              </el-col>
              <el-col :span="8">
                <el-statistic title="平均用时" :value="monitorStats.averageDuration || 0" suffix="分钟" />
              </el-col>
            </el-row>
            
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="12">
                <div class="chart-card">
                  <h4>提交进度时间线</h4>
                  <div class="chart-placeholder">
                    <el-empty description="提交进度时间线图表" />
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <h4>异常行为统计</h4>
                  <div class="chart-placeholder">
                    <el-empty description="异常行为统计图表" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const activeTab = ref('studentView')
const examInfo = ref({})
const questionBanks = ref([])
const submissions = ref([])
const courseOptions = ref([])
const submissionTotal = ref(0)
const submissionPage = ref(1)
const submissionPageSize = ref(20)
const examStats = ref({})
const monitorStats = ref({})
const selectedStudent = ref(null)
const selectedQuestion = ref(null)
const studentSearchKeyword = ref('')
const examQuestions = ref([])
const studentAnswers = ref([])

// 获取考试详情
const getExamDetail = () => {
  const examId = route.params.id
  if (!examId) {
    return
  }

  // 使用模拟数据
  import('@/utils/mockData').then(({ mockApi }) => {
    // 获取考试详情
    mockApi.getExamDetail(examId).then(exam => {
      examInfo.value = exam || {}
      questionBanks.value = exam.questionBanks || []
      
      // 模拟统计数据
      examStats.value = {
        actualParticipants: 120,
        completionCount: 95,
        averageScore: 82.5,
        maxScore: 98,
        minScore: 45,
        completionRate: 78.5
      }
      
      monitorStats.value = {
        onlineCount: 85,
        submittedCount: 95,
        averageDuration: 75
      }
      
      // 模拟提交数据
      submissions.value = [
        {
          id: 'sub_001',
          studentName: '张三',
          submitTime: new Date('2024-11-15T10:30:00Z'),
          score: 85,
          status: 'graded',
          duration: 68,
          ipAddress: '192.168.1.100',
          deviceInfo: 'Chrome 118.0.0.0'
        },
        {
          id: 'sub_002',
          studentName: '李四',
          submitTime: new Date('2024-11-15T14:20:00Z'),
          score: 92,
          status: 'graded',
          duration: 72,
          ipAddress: '192.168.1.101',
          deviceInfo: 'Firefox 119.0.0.0'
        },
        {
          id: 'sub_003',
          studentName: '王五',
          submitTime: new Date('2024-11-15T16:45:00Z'),
          score: 78,
          status: 'graded',
          duration: 65,
          ipAddress: '192.168.1.102',
          deviceInfo: 'Safari 17.0.0.0'
        }
      ]
      submissionTotal.value = submissions.value.length
      
      // 初始化学生和题目数据
      initializeStudentAndQuestionData()
    })
    
    // 获取课程列表
    mockApi.getCourses().then(res => {
      courseOptions.value = res.records
    })
  })
}

// 初始化学生和题目数据
const initializeStudentAndQuestionData = () => {
  // 模拟学生数据
  studentAnswers.value = [
    {
      id: 'stu_001',
      name: '张三',
      studentId: '2021001',
      score: 85,
      submitTime: new Date('2024-11-15T10:30:00Z'),
      duration: 68,
      answers: [
        { questionId: 'q1', isCorrect: true, score: 10, totalScore: 10, studentAnswer: 'A', correctAnswer: 'A' },
        { questionId: 'q2', isCorrect: false, score: 5, totalScore: 10, studentAnswer: 'B', correctAnswer: 'C' },
        { questionId: 'q3', isCorrect: true, score: 10, totalScore: 10, studentAnswer: '北京', correctAnswer: '北京' }
      ]
    },
    {
      id: 'stu_002',
      name: '李四',
      studentId: '2021002',
      score: 92,
      submitTime: new Date('2024-11-15T14:20:00Z'),
      duration: 72,
      answers: [
        { questionId: 'q1', isCorrect: true, score: 10, totalScore: 10, studentAnswer: 'A', correctAnswer: 'A' },
        { questionId: 'q2', isCorrect: true, score: 10, totalScore: 10, studentAnswer: 'C', correctAnswer: 'C' },
        { questionId: 'q3', isCorrect: true, score: 10, totalScore: 10, studentAnswer: '北京', correctAnswer: '北京' }
      ]
    },
    {
      id: 'stu_003',
      name: '王五',
      studentId: '2021003',
      score: 78,
      submitTime: new Date('2024-11-15T16:45:00Z'),
      duration: 65,
      answers: [
        { questionId: 'q1', isCorrect: true, score: 10, totalScore: 10, studentAnswer: 'A', correctAnswer: 'A' },
        { questionId: 'q2', isCorrect: false, score: 0, totalScore: 10, studentAnswer: 'A', correctAnswer: 'C' },
        { questionId: 'q3', isCorrect: true, score: 10, totalScore: 10, studentAnswer: '北京', correctAnswer: '北京' }
      ]
    }
  ]
  
  // 模拟题目数据
  examQuestions.value = [
    { id: 'q1', type: 'single', questionText: '中国的首都是哪里？', score: 10, difficulty: 'easy' },
    { id: 'q2', type: 'multiple', questionText: '以下哪些是编程语言？', score: 10, difficulty: 'medium' },
    { id: 'q3', type: 'fill', questionText: '中国的首都是_____', score: 10, difficulty: 'easy' }
  ]
  
  if (studentAnswers.value.length > 0) {
    selectedStudent.value = studentAnswers.value[0]
  }
  if (examQuestions.value.length > 0) {
    selectedQuestion.value = examQuestions.value[0]
  }
}

// 返回列表
const goBack = () => {
  router.push('/exam')
}

// 编辑考试
const toExamEdit = () => {
  if (!examInfo.value.id) {
    return
  }
  router.push({ path: '/exam/edit', query: { id: examInfo.value.id } })
}

// 批改考试
const toExamGrade = () => {
  if (!examInfo.value.id) {
    return
  }
  router.push({ path: '/exam/grade', query: { id: examInfo.value.id } })
}

// 监控考试
const toExamMonitor = () => {
  if (!examInfo.value.id) {
    return
  }
  router.push({ path: '/exam/monitor', query: { id: examInfo.value.id } })
}

// 结束考试
const endExam = () => {
  ElMessageBox.confirm('确定要结束该考试吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('考试已结束')
  })
}

// 暂停考试
const pauseExam = () => {
  ElMessage.info('考试已暂停')
}

// 恢复考试
const resumeExam = () => {
  ElMessage.success('考试已恢复')
}

// 管理题目库
const toQuestionBankManage = () => {
  router.push({ path: '/exam/questionbank', query: { examId: examInfo.value.id } })
}

// 编辑题目库
const editQuestionBank = (bank) => {
  router.push({ path: '/exam/questionbank/edit', query: { examId: examInfo.value.id, bankId: bank.id } })
}

// 删除题目库
const deleteQuestionBank = (index) => {
  ElMessageBox.confirm('确定要删除该题目库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    questionBanks.value.splice(index, 1)
    ElMessage.success('题目库删除成功')
  })
}

// 导出提交
const exportSubmissions = () => {
  // 导出逻辑
  console.log('导出提交')
}

// 查看提交详情
const viewSubmission = (submission) => {
  router.push({ path: '/exam/submission', query: { id: submission.id } })
}

// 工具方法
const getCourseName = (courseId) => {
  const course = courseOptions.value.find(c => c.id === courseId)
  return course ? course.basicInfo?.title : ''
}

const getTypeText = (type) => {
  const typeMap = {
    'midterm': '期中考试',
    'final': '期末考试',
    'quiz': '随堂测验'
  }
  return typeMap[type] || '未知'
}

const getTypeTagType = (type) => {
  const typeMap = {
    'midterm': 'warning',
    'final': 'danger',
    'quiz': ''
  }
  return typeMap[type] || ''
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || '未知'
}

const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return difficultyMap[difficulty] || ''
}

const getQuestionTypeText = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '问答题'
  }
  return typeMap[type] || '未知'
}

const isCorrectOption = (question, option) => {
  if (question.type === 'single') {
    return question.correctAnswer === option.value
  } else if (question.type === 'multiple') {
    return question.correctAnswers && question.correctAnswers.includes(option.value)
  }
  return false
}

const getStatusText = (status) => {
  const statusMap = {
    'submitted': '已提交',
    'graded': '已批改',
    'late': '迟交',
    'cheating': '作弊',
    'abnormal': '异常'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const statusMap = {
    'submitted': 'warning',
    'graded': 'success',
    'late': 'danger',
    'cheating': 'danger',
    'abnormal': 'warning'
  }
  return statusMap[status] || ''
}

const getBankTypeText = (type) => {
  const typeMap = {
    'single': '单选题库',
    'multiple': '多选题库',
    'fill': '填空题库',
    'essay': '问答题库'
  }
  return typeMap[type] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 计算过滤后的学生列表
const filteredStudents = computed(() => {
  if (!studentSearchKeyword.value) {
    return studentAnswers.value
  }
  return studentAnswers.value.filter(s => 
    s.name.includes(studentSearchKeyword.value) || 
    s.studentId.includes(studentSearchKeyword.value)
  )
})

// 获取题目的平均分
const getQuestionAverageScore = (questionId) => {
  const scores = studentAnswers.value
    .flatMap(s => s.answers)
    .filter(a => a.questionId === questionId)
    .map(a => a.score)
  
  if (scores.length === 0) return 0
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
}

// 获取题目的答题统计
const getQuestionAnswerStats = (questionId) => {
  return studentAnswers.value
    .flatMap(s => s.answers.map(a => ({
      ...a,
      studentName: s.name,
      answer: a.studentAnswer
    })))
    .filter(a => a.questionId === questionId)
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/exam/detail/index.vue`);
  getExamDetail()
})
</script>

<style lang="scss" scoped>
.back-button {
  margin-bottom: 20px;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.exam-info {
  flex: 1;
}

.exam-title h1 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 24px;
}

.exam-meta {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.exam-desc {
  color: #606266;
  line-height: 1.6;
}

.exam-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metadata-section,
.schedule-section,
.settings-section,
.grading-section,
.stats-section {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.metadata-section h3,
.schedule-section h3,
.settings-section h3,
.grading-section h3,
.stats-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.exam-tabs {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.banks-content,
.submissions-content,
.monitor-content {
  padding: 20px;
}

.bank-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.bank-list {
  margin-top: 20px;
}

.bank-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bank-name {
  font-weight: bold;
  color: #303133;
}

.bank-type {
  background: #409eff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.bank-count {
  color: #666;
  font-size: 14px;
}

.bank-actions {
  display: flex;
  gap: 10px;
}

.bank-content {
  margin-top: 10px;
}

.bank-questions {
  margin-top: 10px;
}

.question-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.question-index {
  font-weight: bold;
  color: #409eff;
}

.question-type {
  background: #409eff;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 10px;
}

.question-score {
  font-weight: bold;
  color: #f56c6c;
}

.question-difficulty {
  font-size: 14px;
}

.question-content {
  margin-bottom: 15px;
}

.question-text {
  font-weight: 500;
  margin-bottom: 15px;
  line-height: 1.6;
}

.question-options {
  margin-left: 20px;
}

.option-item {
  margin-bottom: 5px;
}

.option-value {
  font-weight: bold;
  margin-right: 10px;
}

.correct-mark {
  margin-left: 10px;
  color: #67c23a;
  font-weight: bold;
}

.question-fill {
  margin-left: 20px;
}

.fill-hint {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.fill-answers {
  margin-top: 10px;
}

.fill-answer {
  margin-bottom: 5px;
}

.fill-index {
  font-weight: bold;
  margin-right: 10px;
}

.question-essay {
  margin-left: 20px;
}

.essay-hint {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.essay-answer {
  margin-top: 10px;
}

.answer-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 10px;
}

.answer-content {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
}

.question-explanation {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #e4e7ed;
}

.explanation-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 10px;
}

.explanation-content {
  background: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 5px;
}

.question-knowledge {
  margin-top: 15px;
}

.knowledge-label {
  font-weight: bold;
  color: #409eff;
  margin-right: 10px;
}

.knowledge-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}

.submission-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.monitor-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.monitor-stats {
  margin-top: 20px;
}

.chart-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  height: 200px;
}

.chart-placeholder {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
}

/* 学生视图样式 */
.student-view-content {
  padding: 20px;
}

.student-list-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.student-list-panel h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.student-search {
  margin-bottom: 15px;
}

.student-list {
  flex: 1;
  overflow-y: auto;
}

.student-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.student-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.student-item.active {
  background: #e6f7ff;
  border-color: #409eff;
}

.student-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.student-score {
  font-size: 12px;
  color: #909399;
}

.student-detail-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
}

.student-detail-panel h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.student-info {
  margin-bottom: 20px;
}

.answer-details {
  margin-top: 20px;
}

.answer-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.question-num {
  font-weight: 500;
  color: #303133;
}

.answer-score {
  color: #909399;
  font-size: 12px;
}

.answer-content {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.student-answer {
  margin-bottom: 5px;
  color: #606266;
}

.correct-answer {
  color: #67c23a;
  font-weight: 500;
}

/* 题目视图样式 */
.question-view-content {
  padding: 20px;
}

.question-list-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.question-list-panel h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.question-list {
  flex: 1;
  overflow-y: auto;
}

.question-item-card {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.question-item-card:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.question-item-card.active {
  background: #e6f7ff;
  border-color: #409eff;
}

.question-num {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.question-type {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.question-score {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
}

.question-stats-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
}

.question-stats-panel h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.question-info {
  margin-bottom: 20px;
}

.answer-statistics {
  margin-top: 20px;
}

.answer-statistics h5 {
  margin: 0 0 15px 0;
  color: #303133;
}
</style>
