<template>
  <div class="student-paper-container">
    <!-- 头部信息 -->
    <div class="paper-header">
      <el-card>
        <div class="header-content">
          <div class="header-left">
            <div class="student-info">
              <h2>{{ examInfo.title }}</h2>
              <div class="exam-details">
                <span>考试时长: {{ examInfo.duration }}分钟</span>
                <span>总分: {{ examInfo.totalScore }}分</span>
                <span>题目数量: {{ examInfo.totalQuestions }}题</span>
              </div>
            </div>
            <div class="student-details">
              <h3>学生答卷</h3>
              <div class="student-meta">
                <div class="meta-item">
                  <span class="label">姓名:</span>
                  <span class="value">{{ submission.studentName }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">学号:</span>
                  <span class="value">{{ submission.studentId }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">提交时间:</span>
                  <span class="value">{{ formatDateTime(submission.submitTime) }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">用时:</span>
                  <span class="value">{{ formatDuration(submission.duration) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="header-right">
            <div class="score-summary">
              <div class="total-score">
                <div class="score-label">当前得分</div>
                <div class="score-value" :style="{ color: getScoreColor(currentScore, totalScore) }">
                  {{ currentScore }} / {{ totalScore }}
                </div>
              </div>
              <div class="score-progress">
                <el-progress
                  :percentage="scorePercentage"
                  :color="getProgressColor(scorePercentage)"
                  :stroke-width="8"
                />
              </div>
            </div>

            <div class="header-actions">
              <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
              <el-button type="primary" @click="handleGradePaper" :icon="Edit">
                批改答卷
              </el-button>
              <el-button @click="handlePrintPaper" :icon="Printer">
                打印答卷
              </el-button>
              <el-button @click="handleExportPaper" :icon="Download">
                导出PDF
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 工具栏 -->
    <div class="paper-toolbar">
      <el-card>
        <div class="toolbar-content">
          <div class="toolbar-left">
            <div class="view-options">
              <span class="option-label">显示选项:</span>
              <el-checkbox v-model="showCorrectAnswers" @change="updatePaperView">
                显示正确答案
              </el-checkbox>
              <el-checkbox v-model="showScores" @change="updatePaperView">
                显示分数
              </el-checkbox>
              <el-checkbox v-model="showFeedback" @change="updatePaperView">
                显示批改意见
              </el-checkbox>
              <el-checkbox v-model="showComparison" @change="updatePaperView">
                答案对比
              </el-checkbox>
            </div>
          </div>

          <div class="toolbar-right">
            <div class="navigation-options">
              <span class="option-label">快速导航:</span>
              <el-select v-model="currentQuestionIndex" @change="scrollToQuestion" style="width: 150px">
                <el-option
                  v-for="(question, index) in paperData.questions"
                  :key="question.id"
                  :label="`第${index + 1}题`"
                  :value="index"
                />
              </el-select>
              <el-button-group>
                <el-button @click="prevQuestion" :disabled="currentQuestionIndex === 0">
                  上一题
                </el-button>
                <el-button @click="nextQuestion" :disabled="currentQuestionIndex === paperData.questions.length - 1">
                  下一题
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 答卷内容 -->
    <div class="paper-content" ref="paperContent">
      <div class="paper-inner">
        <!-- 考试标题 -->
        <div class="exam-title-section">
          <h1 class="exam-title">{{ examInfo.title }}</h1>
          <div class="exam-info">
            <span>考试时间: {{ examInfo.duration }}分钟</span>
            <span>总分: {{ examInfo.totalScore }}分</span>
            <span>共{{ paperData.questions.length }}题</span>
          </div>
        </div>

        <!-- 学生信息 -->
        <div class="student-section">
          <h3>学生信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ submission.studentName }}</el-descriptions-item>
            <el-descriptions-item label="学号">{{ submission.studentId }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatDateTime(submission.submitTime) }}</el-descriptions-item>
            <el-descriptions-item label="用时">{{ formatDuration(submission.duration) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 题目列表 -->
        <div
          v-for="(question, index) in paperData.questions"
          :key="question.id"
          class="question-section"
          :ref="`question-${index}`"
          :class="{ 'current-question': currentQuestionIndex === index }"
        >
          <div class="question-header">
            <h3 class="question-title">第{{ index + 1 }}题</h3>
            <div class="question-meta">
              <el-tag :type="getQuestionTypeTagType(question.type)" size="small">
                {{ getQuestionTypeText(question.type) }}
              </el-tag>
              <el-tag type="info" size="small">
                {{ question.score }}分
              </el-tag>
              <el-tag
                v-if="question.status === 'graded'"
                :type="getAnswerStatusTagType(question)"
                size="small"
              >
                {{ getAnswerStatusText(question) }}
              </el-tag>
            </div>
          </div>

          <div class="question-content">
            <div class="question-text">
              <div class="question-content-text">{{ question.questionText }}</div>

              <!-- 题目选项（单选题/多选题） -->
              <div
                v-if="question.type === 'single' || question.type === 'multiple'"
                class="question-options"
              >
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  class="option-item"
                  :class="{
                    'student-selected': isStudentOption(question, option),
                    'correct-answer': isCorrectOption(question, option),
                    'student-correct': isStudentOption(question, option) && isCorrectOption(question, option),
                    'student-wrong': isStudentOption(question, option) && !isCorrectOption(question, option)
                  }"
                >
                  <span class="option-label">{{ option.value }}.</span>
                  <span class="option-text">{{ option.text }}</span>

                  <!-- 显示选项状态 -->
                  <div class="option-status">
                    <el-icon
                      v-if="isStudentOption(question, option)"
                      :class="{
                        'correct-check': isCorrectOption(question, option),
                        'wrong-cross': !isCorrectOption(question, option)
                      }"
                    >
                      <Check v-if="isCorrectOption(question, option)" />
                      <Close v-else />
                    </el-icon>
                    <el-icon
                      v-else-if="showCorrectAnswers && isCorrectOption(question, option)"
                      class="correct-check"
                    >
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </div>

              <!-- 题目说明 -->
              <div v-if="question.explanation" class="question-explanation">
                <div class="explanation-title">题目说明:</div>
                <div class="explanation-content">{{ question.explanation }}</div>
              </div>
            </div>

            <!-- 学生答案区域 -->
            <div class="student-answer-section">
              <div class="answer-header">
                <h4>学生答案</h4>
                <div class="answer-status">
                  <el-tag
                    v-if="question.status === 'graded'"
                    :type="question.isCorrect ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ question.isCorrect ? '正确' : '错误' }}
                  </el-tag>
                </div>
              </div>

              <div class="student-answer-content">
                <!-- 填空题答案 -->
                <div v-if="question.type === 'fill'" class="fill-answer">
                  <div class="fill-content">
                    <div
                      v-for="(blank, blankIndex) in getFillBlanks(question)"
                      :key="blankIndex"
                      class="blank-item"
                      :class="{
                        'correct': isFillCorrect(question, blankIndex),
                        'wrong': !isFillCorrect(question, blankIndex) && question.status === 'graded'
                      }"
                    >
                      <span class="blank-index">{{ blankIndex + 1 }}.</span>
                      <span class="blank-text">{{ getStudentFillAnswer(question, blankIndex) }}</span>
                      <div v-if="showComparison && question.status === 'graded'" class="comparison">
                        <el-icon class="arrow">→</el-icon>
                        <span class="correct-text">{{ getCorrectFillAnswer(question, blankIndex) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 问答题答案 -->
                <div v-else-if="question.type === 'essay'" class="essay-answer">
                  <div class="essay-content">{{ getStudentEssayAnswer(question) }}</div>
                </div>

                <!-- 其他题型的答案显示 -->
                <div v-else class="other-answer">
                  <div class="answer-text">{{ getStudentOtherAnswer(question) }}</div>
                </div>
              </div>
            </div>

            <!-- 正确答案（仅在显示选项开启时显示） -->
            <div
              v-if="showCorrectAnswers && question.status === 'graded'"
              class="correct-answer-section"
            >
              <div class="answer-header">
                <h4>正确答案</h4>
              </div>

              <div class="correct-answer-content">
                <!-- 填空题正确答案 -->
                <div v-if="question.type === 'fill'" class="fill-correct">
                  <div class="fill-content">
                    <div
                      v-for="(blank, blankIndex) in getFillBlanks(question)"
                      :key="blankIndex"
                      class="blank-item correct"
                    >
                      <span class="blank-index">{{ blankIndex + 1 }}.</span>
                      <span class="blank-text">{{ getCorrectFillAnswer(question, blankIndex) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 问答题参考答案 -->
                <div v-else-if="question.type === 'essay'" class="essay-correct">
                  <div class="essay-content">{{ question.referenceAnswer }}</div>
                </div>

                <!-- 其他题型正确答案 -->
                <div v-else class="other-correct">
                  <div class="answer-text">{{ getCorrectOtherAnswer(question) }}</div>
                </div>
              </div>
            </div>

            <!-- 批改信息 -->
            <div v-if="showScores && question.status === 'graded'" class="grading-section">
              <div class="answer-header">
                <h4>批改信息</h4>
              </div>

              <div class="grading-content">
                <div class="score-row">
                  <span class="score-label">得分:</span>
                  <span class="score-value">{{ question.studentScore }} / {{ question.score }}分</span>
                  <div class="score-progress">
                    <el-progress
                      :percentage="(question.studentScore / question.score) * 100"
                      :color="getScoreColor(question.studentScore, question.score)"
                      :stroke-width="6"
                      :show-text="false"
                    />
                  </div>
                </div>

                <div v-if="showFeedback && question.feedback" class="feedback-row">
                  <span class="feedback-label">批改意见:</span>
                  <div class="feedback-content">{{ question.feedback }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 题目分割线 -->
          <div v-if="index < paperData.questions.length - 1" class="question-divider"></div>
        </div>
      </div>
    </div>

    <!-- 评分弹窗 -->
    <el-dialog
      v-model="gradeDialogVisible"
      title="批改题目"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="grade-dialog-content">
        <div class="grade-question-info">
          <h4>第{{ currentGradingIndex + 1 }}题 ({{ getQuestionTypeText(currentGradingQuestion?.type) }})</h4>
          <div class="question-summary">
            <span>分值: {{ currentGradingQuestion?.score }}分</span>
            <span>当前得分: {{ currentGradingQuestion?.studentScore || 0 }}分</span>
          </div>
        </div>

        <div class="grade-form">
          <el-form :model="gradeForm" label-width="100px">
            <el-form-item label="得分">
              <el-slider
                v-model="gradeForm.score"
                :min="0"
                :max="currentGradingQuestion?.score || 0"
                :step="1"
                show-input
                show-stops
              />
            </el-form-item>

            <el-form-item label="正确性">
              <el-radio-group v-model="gradeForm.isCorrect">
                <el-radio :label="true">正确</el-radio>
                <el-radio :label="false">错误</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="批改意见">
              <el-input
                v-model="gradeForm.feedback"
                type="textarea"
                :rows="4"
                placeholder="请输入批改意见..."
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button @click="prevQuestionInDialog" :disabled="currentGradingIndex === 0">
          上一题
        </el-button>
        <el-button
          @click="nextQuestionInDialog"
          :disabled="currentGradingIndex === paperData.questions.length - 1"
        >
          下一题
        </el-button>
        <el-button type="primary" @click="saveGradeResult">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Check,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const examId = computed(() => route.params.id)
const submissionId = computed(() => route.params.submissionId)

const examInfo = ref({})
const submission = ref({})
const paperData = ref({ questions: [] })
const currentQuestionIndex = ref(0)
const showCorrectAnswers = ref(false)
const showScores = ref(false)
const showFeedback = ref(false)
const showComparison = ref(false)

const gradeDialogVisible = ref(false)
const currentGradingIndex = ref(0)
const currentGradingQuestion = ref(null)

const gradeForm = ref({
  score: 0,
  isCorrect: false,
  feedback: ''
})

const paperContent = ref(null)

// 计算属性
const totalScore = computed(() => {
  return paperData.value.questions.reduce((sum, q) => sum + q.score, 0)
})

const currentScore = computed(() => {
  return paperData.value.questions.reduce((sum, q) => sum + (q.studentScore || 0), 0)
})

const scorePercentage = computed(() => {
  return totalScore.value > 0 ? (currentScore.value / totalScore.value) * 100 : 0
})

// 方法
const initPaperData = () => {
  // 模拟考试信息
  examInfo.value = {
    id: examId.value,
    title: 'Python程序设计期中考试',
    duration: 120,
    totalScore: 100,
    totalQuestions: 7
  }

  // 模拟提交信息 - 根据不同的submissionId显示不同的学生数据
  const studentData = {
    'sub_001': { name: '张三', id: '2021001', submitTime: '2024-01-15T10:30:00Z', duration: 85 },
    'sub_002': { name: '李四', id: '2021002', submitTime: '2024-01-15T11:15:00Z', duration: 92 },
    'sub_003': { name: '王五', id: '2021003', submitTime: '2024-01-15T10:45:00Z', duration: 78 }
  }

  const currentStudent = studentData[submissionId.value] || studentData['sub_001']

  submission.value = {
    id: submissionId.value || 'sub_001',
    studentName: currentStudent.name,
    studentId: currentStudent.id,
    submitTime: currentStudent.submitTime,
    duration: currentStudent.duration
  }

  // 根据不同的学生生成不同的答题数据
  const getStudentAnswers = (studentId) => {
    const answerSets = {
      'sub_001': {
        q1: 'B', q2: ['A', 'B', 'C'], q3: 'print', q4: true, q5: 'sorted()',
        q6: `# 计算阶乘\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n\nresult = factorial(5)\nprint(result)`,
        q7: '递归是一种编程技术，函数调用自身来解决问题。'
      },
      'sub_002': {
        q1: 'A', q2: ['A', 'B', 'C', 'D'], q3: 'console', q4: true, q5: 'sort()',
        q6: `# 阶乘计算\nfor i in range(1, 6):\n    print(i)`,
        q7: '递归就是函数自己调用自己。'
      },
      'sub_003': {
        q1: 'C', q2: ['A', 'B'], q3: 'printf', q4: false, q5: 'sort()',
        q6: `def factorial():\n    return 120`,
        q7: '递归是循环的一种方式。'
      }
    }
    return answerSets[studentId] || answerSets['sub_001']
  }

  const studentAnswers = getStudentAnswers(submissionId.value)

  // 模拟试卷数据
  paperData.value = {
    questions: [
      {
        id: 'q1',
        type: 'single',
        questionText: 'Python中，以下哪个关键字用于定义函数？',
        options: [
          { id: 'opt1', value: 'A', text: 'function' },
          { id: 'opt2', value: 'B', text: 'def' },
          { id: 'opt3', value: 'C', text: 'define' },
          { id: 'opt4', value: 'D', text: 'func' }
        ],
        score: 10,
        studentAnswer: studentAnswers.q1,
        correctAnswer: 'B',
        studentScore: 10,
        isCorrect: true,
        status: 'graded',
        feedback: '答案正确，掌握了Python函数定义的基本语法'
      },
      {
        id: 'q2',
        type: 'multiple',
        questionText: '以下哪些是Python的基本数据类型？（多选）',
        options: [
          { id: 'opt1', value: 'A', text: 'int' },
          { id: 'opt2', value: 'B', text: 'str' },
          { id: 'opt3', value: 'C', text: 'list' },
          { id: 'opt4', value: 'D', text: 'class' }
        ],
        score: 15,
        studentAnswer: studentAnswers.q2,
        correctAnswer: ['A', 'B', 'C', 'D'],
        studentScore: 12,
        isCorrect: false,
        status: 'graded',
        feedback: '漏选了class数据类型，需要记住所有基本数据类型'
      },
      {
        id: 'q3',
        type: 'fill',
        questionText: 'Python中用于输出内容到控制台的函数是______。',
        score: 10,
        studentAnswer: studentAnswers.q3,
        correctAnswer: 'print',
        studentScore: 10,
        isCorrect: true,
        status: 'graded',
        feedback: '正确理解了print函数的用途'
      },
      {
        id: 'q4',
        type: 'judge',
        questionText: 'Python中的列表是可变的数据类型。',
        score: 10,
        studentAnswer: studentAnswers.q4,
        correctAnswer: true,
        studentScore: studentAnswers.q4 === true ? 10 : 0,
        isCorrect: studentAnswers.q4 === true,
        status: 'graded',
        feedback: studentAnswers.q4 === true ? '正确，理解了列表的可变性' : '错误，列表是可变的数据类型'
      },
      {
        id: 'q5',
        type: 'fill',
        questionText: 'Python中对列表进行排序并返回新列表的函数是______。',
        score: 10,
        studentAnswer: studentAnswers.q5,
        correctAnswer: 'sorted()',
        studentScore: studentAnswers.q5 === 'sorted()' ? 10 : 0,
        isCorrect: studentAnswers.q5 === 'sorted()',
        status: 'graded',
        feedback: studentAnswers.q5 === 'sorted()' ? '正确掌握了sorted()函数' : '错误，sorted()函数返回排序后的新列表'
      },
      {
        id: 'q6',
        type: 'code',
        questionText: '请编写一个Python函数，计算给定数字的阶乘。',
        score: 20,
        studentAnswer: studentAnswers.q6,
        referenceAnswer: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)

# 测试
print(factorial(5))  # 输出: 120`,
        studentScore: submissionId.value === 'sub_001' ? 20 : submissionId.value === 'sub_002' ? 10 : 5,
        isCorrect: submissionId.value === 'sub_001',
        status: 'graded',
        feedback: submissionId.value === 'sub_001' ? '完美的递归实现，代码结构清晰' : submissionId.value === 'sub_002' ? '使用了循环而非递归，需要重新审题' : '函数实现不完整，缺少参数和递归逻辑'
      },
      {
        id: 'q7',
        type: 'essay',
        questionText: '请解释什么是递归，并举例说明递归的应用场景。',
        score: 15,
        studentAnswer: studentAnswers.q7,
        referenceAnswer: '递归是一种编程技术，函数直接或间接地调用自身。递归必须包含基本情况（base case）和递归情况（recursive case）。常见应用场景：树的遍历、阶乘计算、斐波那契数列、快速排序等。',
        studentScore: submissionId.value === 'sub_001' ? 15 : submissionId.value === 'sub_002' ? 8 : 4,
        isCorrect: false,
        status: 'graded',
        feedback: submissionId.value === 'sub_001' ? '回答准确完整，理解了递归的核心概念' : submissionId.value === 'sub_002' ? '基本理解了递归概念，但缺少应用场景举例' : '回答过于简单，需要更详细的解释和例子'
      }
    ]
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins}分钟`
  }
  return `${hours}小时${mins}分钟`
}

const getScoreColor = (score, totalScore) => {
  const percentage = (score / totalScore) * 100
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  if (percentage >= 60) return '#f56c6c'
  return '#909399'
}

const getQuestionTypeText = (type) => {
  const map = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    essay: '问答题'
  }
  return map[type] || type
}

const getQuestionTypeTagType = (type) => {
  const map = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    essay: 'danger'
  }
  return map[type] || 'info'
}

const getAnswerStatusText = (question) => {
  if (question.status !== 'graded') return '未批改'
  return question.isCorrect ? '正确' : '错误'
}

const getAnswerStatusTagType = (question) => {
  if (question.status !== 'graded') return 'info'
  return question.isCorrect ? 'success' : 'danger'
}

const isStudentOption = (question, option) => {
  if (question.type === 'single') {
    return question.studentAnswer === option.value
  } else if (question.type === 'multiple') {
    return question.studentAnswer && question.studentAnswer.includes(option.value)
  }
  return false
}

const isCorrectOption = (question, option) => {
  if (question.type === 'single') {
    return question.correctAnswer === option.value
  } else if (question.type === 'multiple') {
    return question.correctAnswer && question.correctAnswer.includes(option.value)
  }
  return false
}

const getFillBlanks = (question) => {
  // 简化处理，假设只有一个填空
  return [{ index: 0, text: question.questionText }]
}

const getStudentFillAnswer = (question, blankIndex) => {
  return question.studentAnswer || '未作答'
}

const getCorrectFillAnswer = (question, blankIndex) => {
  return question.correctAnswer || ''
}

const isFillCorrect = (question, blankIndex) => {
  return getStudentFillAnswer(question, blankIndex).toLowerCase() === getCorrectFillAnswer(question, blankIndex).toLowerCase()
}

const getStudentEssayAnswer = (question) => {
  return question.studentAnswer || '未作答'
}

const getStudentOtherAnswer = (question) => {
  return question.studentAnswer || '未作答'
}

const getCorrectOtherAnswer = (question) => {
  return question.correctAnswer || ''
}

const updatePaperView = () => {
  // 更新试卷视图的显示选项
  nextTick(() => {
    // 可以在这里添加视图更新逻辑
  })
}

const scrollToQuestion = () => {
  const questionRef = paperContent.value?.querySelector(`[ref="question-${currentQuestionIndex.value}"]`)
  if (questionRef) {
    questionRef.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    scrollToQuestion()
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < paperData.value.questions.length - 1) {
    currentQuestionIndex.value++
    scrollToQuestion()
  }
}

const prevQuestionInDialog = () => {
  saveCurrentGrade()
  if (currentGradingIndex.value > 0) {
    currentGradingIndex.value--
    initGradingForm()
  }
}

const nextQuestionInDialog = () => {
  saveCurrentGrade()
  if (currentGradingIndex.value < paperData.value.questions.length - 1) {
    currentGradingIndex.value++
    initGradingForm()
  }
}

const initGradingForm = () => {
  currentGradingQuestion.value = paperData.value.questions[currentGradingIndex.value]
  gradeForm.value = {
    score: currentGradingQuestion.value?.studentScore || 0,
    isCorrect: currentGradingQuestion.value?.isCorrect || false,
    feedback: currentGradingQuestion.value?.feedback || ''
  }
}

const saveCurrentGrade = () => {
  if (currentGradingQuestion.value) {
    currentGradingQuestion.value.studentScore = gradeForm.value.score
    currentGradingQuestion.value.isCorrect = gradeForm.value.isCorrect
    currentGradingQuestion.value.feedback = gradeForm.value.feedback
    currentGradingQuestion.value.status = 'graded'
  }
}

const saveGradeResult = () => {
  saveCurrentGrade()
  gradeDialogVisible.value = false
  ElMessage.success('批改结果已保存')
}

const handleGradePaper = () => {
  currentGradingIndex.value = 0
  initGradingForm()
  gradeDialogVisible.value = true
}

const handlePrintPaper = () => {
  window.print()
  ElMessage.info('打印功能已启动')
}

const handleExportPaper = () => {
  ElMessage.info('PDF导出功能开发中...')
}

const goBack = () => {
  router.go(-1)
}

// 监听路由参数变化
watch(
  () => route.params,
  () => {
    initPaperData()
  },
  { immediate: true }
)

onMounted(() => {
  console.log(`打开文件: ${location.pathname} -> views/exam/grade/StudentPaper.vue`)
  initPaperData()
})
</script>

<style lang="scss" scoped>
.student-paper-container {
  padding: 20px;
  background: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.paper-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .header-left {
      flex: 1;

      .student-info {
        margin-bottom: 20px;

        h2 {
          margin: 0 0 10px 0;
          color: #303133;
        }

        .exam-details {
          display: flex;
          gap: 20px;
          color: #606266;
          font-size: 14px;
        }
      }

      .student-details {
        h3 {
          margin: 0 0 10px 0;
          color: #303133;
        }

        .student-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;

          .meta-item {
            .label {
              color: #909399;
              margin-right: 8px;
            }

            .value {
              color: #303133;
            }
          }
        }
      }
    }

    .header-right {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .score-summary {
        text-align: center;

        .total-score {
          margin-bottom: 10px;

          .score-label {
            font-size: 14px;
            color: #909399;
          }

          .score-value {
            font-size: 24px;
            font-weight: bold;
          }
        }

        .score-progress {
          width: 200px;
        }
      }

      .header-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }
}

.paper-toolbar {
  margin-bottom: 20px;

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .view-options,
    .navigation-options {
      display: flex;
      align-items: center;
      gap: 16px;

      .option-label {
        font-size: 14px;
        color: #606266;
        margin-right: 8px;
      }
    }
  }
}

.paper-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 40px;
  min-height: 600px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;

  .paper-inner {
    max-width: 800px;
    margin: 0 auto;
  }

  .exam-title-section {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e4e7ed;

    .exam-title {
      margin: 0 0 10px 0;
      font-size: 24px;
      font-weight: bold;
      color: #303133;
    }

    .exam-info {
      display: flex;
      justify-content: center;
      gap: 30px;
      color: #606266;
      font-size: 14px;
    }
  }

  .student-section {
    margin-bottom: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 6px;

    h3 {
      margin: 0 0 16px 0;
      color: #303133;
    }
  }

  .question-section {
    margin-bottom: 40px;
    padding: 20px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition: all 0.3s;

    &.current-question {
      border-color: #409eff;
      box-shadow: 0 0 10px rgba(64, 158, 255, 0.2);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .question-title {
        margin: 0;
        color: #303133;
        font-size: 18px;
        font-weight: bold;
      }

      .question-meta {
        display: flex;
        gap: 8px;
      }
    }

    .question-content {
      .question-content-text {
        font-size: 16px;
        line-height: 1.6;
        color: #303133;
        margin-bottom: 16px;
      }

      .question-options {
        margin-bottom: 16px;

        .option-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          background: #fff;

          &.student-selected {
            border-color: #409eff;
            background-color: #f0f9ff;
          }

          &.correct-answer {
            border-color: #67c23a;
            background-color: #f0f9ff;
          }

          &.student-correct {
            border-color: #67c23a;
            background-color: #f0f9ff;
          }

          &.student-wrong {
            border-color: #f56c6c;
            background-color: #fef0f0;
          }

          .option-label {
            font-weight: bold;
            margin-right: 12px;
            color: #606266;
          }

          .option-text {
            flex: 1;
            color: #303133;
          }

          .option-status {
            display: flex;
            align-items: center;
            margin-left: 8px;

            .correct-check {
              color: #67c23a;
            }

            .wrong-cross {
              color: #f56c6c;
            }
          }
        }
      }

      .question-explanation {
        margin-bottom: 16px;
        padding: 12px;
        background: #f0f9ff;
        border-radius: 4px;
        border-left: 4px solid #409eff;

        .explanation-title {
          font-weight: bold;
          color: #409eff;
          margin-bottom: 8px;
        }

        .explanation-content {
          color: #606266;
          line-height: 1.5;
        }
      }
    }

    .student-answer-section {
      margin-bottom: 16px;
      padding: 16px;
      background: #fafbfc;
      border-radius: 6px;

      .answer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h4 {
          margin: 0;
          color: #303133;
        }
      }

      .student-answer-content {
        .fill-answer {
          .fill-content {
            .blank-item {
              display: inline-flex;
              align-items: center;
              margin-right: 16px;
              margin-bottom: 8px;
              padding: 8px 12px;
              border-radius: 4px;

              &.correct {
                background-color: #f0f9ff;
                border: 1px solid #67c23a;
              }

              &.wrong {
                background-color: #fef0f0;
                border: 1px solid #f56c6c;
              }

              .blank-index {
                font-weight: bold;
                color: #606266;
                margin-right: 8px;
              }

              .blank-text {
                color: #303133;
              }

              .comparison {
                margin-left: 8px;
                color: #909399;

                .arrow {
                  margin: 0 4px;
                }

                .correct-text {
                  color: #67c23a;
                }
              }
            }
          }

          .essay-answer,
          .other-answer {
            .essay-content,
            .answer-text {
              color: #303133;
              line-height: 1.6;
              white-space: pre-wrap;
            }
          }
        }
      }
    }

    .correct-answer-section {
      margin-bottom: 16px;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 6px;

      .answer-header {
        margin-bottom: 12px;

        h4 {
          margin: 0;
          color: #409eff;
        }
      }

      .correct-answer-content {
        .fill-correct,
        .essay-correct,
        .other-correct {
          .fill-content,
          .essay-content,
          .answer-text {
            color: #409eff;
            line-height: 1.6;
          }

          .fill-content {
            .blank-item {
              display: inline-flex;
              align-items: center;
              margin-right: 16px;
              margin-bottom: 8px;

              .blank-index {
                font-weight: bold;
                color: #409eff;
                margin-right: 8px;
              }

              .blank-text {
                color: #409eff;
              }
            }
          }
        }
      }
    }

    .grading-section {
      border-top: 1px solid #e4e7ed;
      padding-top: 16px;

      .answer-header {
        margin-bottom: 12px;

        h4 {
          margin: 0;
          color: #303133;
        }
      }

      .grading-content {
        .score-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .score-label {
            min-width: 80px;
            font-weight: 500;
            color: #606266;
          }

          .score-value {
            font-weight: bold;
            color: #303133;
            margin-right: 12px;
          }

          .score-progress {
            flex: 1;
            max-width: 200px;
          }
        }

        .feedback-row {
          display: flex;
          align-items: flex-start;

          .feedback-label {
            min-width: 80px;
            font-weight: 500;
            color: #606266;
            margin-top: 4px;
          }

          .feedback-content {
            flex: 1;
            color: #606266;
            line-height: 1.5;
          }
        }
      }
    }

    .question-divider {
      height: 1px;
      background: #e4e7ed;
      margin: 30px 0;
    }
  }
}

.grade-dialog-content {
  .grade-question-info {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;

    h4 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    .question-summary {
      display: flex;
      gap: 20px;
      color: #606266;
      font-size: 14px;
    }
  }

  .grade-form {
    .el-slider {
      margin-bottom: 16px;
    }
  }
}

@media print {
  .paper-toolbar,
  .header-actions {
    display: none !important;
  }

  .paper-content {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>