import request from '@/utils/request'

// 模拟学生数据
const mockStudents = [
  {
    id: 1,
    name: '张三',
    studentId: 'STU2024001',
    classId: 1,
    className: '前端开发基础班',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    joinTime: '2024-01-16',
    status: 1,
    totalStudyTime: 1250, // 分钟
    videoWatchProgress: 85, // 百分比
    exerciseCompletion: 72, // 百分比
    averageScore: 88,
    lastActiveTime: '2024-01-30 14:30:00',
    loginCount: 45,
    assignmentScore: 92,
    quizScore: 85,
    projectScore: 87,
    participationScore: 90
  },
  {
    id: 2,
    name: '李四',
    studentId: 'STU2024002',
    classId: 1,
    className: '前端开发基础班',
    email: 'lisi@example.com',
    phone: '13800138002',
    joinTime: '2024-01-16',
    status: 1,
    totalStudyTime: 980,
    videoWatchProgress: 72,
    exerciseCompletion: 68,
    averageScore: 76,
    lastActiveTime: '2024-01-29 16:45:00',
    loginCount: 32,
    assignmentScore: 78,
    quizScore: 74,
    projectScore: 80,
    participationScore: 72
  },
  {
    id: 3,
    name: '王五',
    studentId: 'STU2024003',
    classId: 2,
    className: 'Vue.js进阶班',
    email: 'wangwu@example.com',
    phone: '13800138003',
    joinTime: '2024-02-02',
    status: 1,
    totalStudyTime: 1560,
    videoWatchProgress: 92,
    exerciseCompletion: 88,
    averageScore: 94,
    lastActiveTime: '2024-01-30 18:20:00',
    loginCount: 58,
    assignmentScore: 96,
    quizScore: 92,
    projectScore: 95,
    participationScore: 93
  },
  {
    id: 4,
    name: '赵六',
    studentId: 'STU2024004',
    classId: 2,
    className: 'Vue.js进阶班',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    joinTime: '2024-02-02',
    status: 0, // 不活跃
    totalStudyTime: 320,
    videoWatchProgress: 25,
    exerciseCompletion: 15,
    averageScore: 45,
    lastActiveTime: '2024-01-15 09:10:00',
    loginCount: 8,
    assignmentScore: 52,
    quizScore: 38,
    projectScore: 0,
    participationScore: 50
  }
]

// 模拟学习行为数据
const mockLearningBehavior = [
  {
    studentId: 1,
    studentName: '张三',
    date: '2024-01-30',
    loginTime: '09:15:00',
    logoutTime: '11:30:00',
    studyDuration: 135, // 分钟
    videoWatched: 45, // 分钟
    exercisesCompleted: 8,
    questionsAsked: 3,
    forumPosts: 2,
    materialsDownloaded: 5
  },
  {
    studentId: 1,
    studentName: '张三',
    date: '2024-01-29',
    loginTime: '14:20:00',
    logoutTime: '16:45:00',
    studyDuration: 145,
    videoWatched: 60,
    exercisesCompleted: 12,
    questionsAsked: 5,
    forumPosts: 1,
    materialsDownloaded: 3
  },
  {
    studentId: 2,
    studentName: '李四',
    date: '2024-01-29',
    loginTime: '10:00:00',
    logoutTime: '11:30:00',
    studyDuration: 90,
    videoWatched: 30,
    exercisesCompleted: 5,
    questionsAsked: 1,
    forumPosts: 0,
    materialsDownloaded: 2
  }
]

// 模拟课程统计数据
const mockCourseStats = [
  {
    courseId: 1,
    courseName: 'JavaScript基础编程',
    totalStudents: 45,
    activeStudents: 42,
    averageProgress: 78,
    averageScore: 82,
    completionRate: 73,
    totalStudyTime: 45600, // 总学习时长（分钟）
    dropRate: 6.7, // 退课率
    satisfactionRate: 4.2, // 满意度（5分制）
    difficultyRating: 3.8 // 难度评分（5分制）
  },
  {
    courseId: 2,
    courseName: 'Vue.js组件开发',
    totalStudents: 38,
    activeStudents: 35,
    averageProgress: 65,
    averageScore: 79,
    completionRate: 68,
    totalStudyTime: 32400,
    dropRate: 7.9,
    satisfactionRate: 4.5,
    difficultyRating: 4.1
  }
]

// 模拟作业完成数据
const mockAssignmentData = [
  {
    assignmentId: 1,
    assignmentName: 'JavaScript基础作业1',
    courseId: 1,
    courseName: 'JavaScript基础编程',
    totalAssigned: 45,
    submitted: 42,
    onTimeSubmitted: 38,
    lateSubmitted: 4,
    notSubmitted: 3,
    averageScore: 85,
    averageTimeSpent: 120, // 分钟
    dueDate: '2024-01-25 23:59:59'
  },
  {
    assignmentId: 2,
    assignmentName: 'Vue组件设计作业',
    courseId: 2,
    courseName: 'Vue.js组件开发',
    totalAssigned: 38,
    submitted: 35,
    onTimeSubmitted: 32,
    lateSubmitted: 3,
    notSubmitted: 3,
    averageScore: 88,
    averageTimeSpent: 180,
    dueDate: '2024-01-28 23:59:59'
  }
]

// API接口定义
export default {
  // 获取学生分析数据
  getStudentAnalysis(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, classId, status, keyword = '' } = params
        let filteredData = mockStudents

        if (classId) {
          filteredData = filteredData.filter(item => item.classId === classId)
        }

        if (status !== undefined) {
          filteredData = filteredData.filter(item => item.status === status)
        }

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.name.includes(keyword) || item.studentId.includes(keyword)
          )
        }

        const start = (page - 1) * limit
        const end = start + limit
        const items = filteredData.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: items,
            page: page,
            limit: limit,
            statistics: {
              totalStudents: filteredData.length,
              activeStudents: filteredData.filter(s => s.status === 1).length,
              averageScore: Math.round(filteredData.reduce((sum, s) => sum + s.averageScore, 0) / filteredData.length),
              averageStudyTime: Math.round(filteredData.reduce((sum, s) => sum + s.totalStudyTime, 0) / filteredData.length)
            }
          }
        })
      }, 300)
    })
  },

  // 获取学习行为数据
  getLearningBehavior(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { studentId, startDate, endDate, page = 1, limit = 20 } = params
        let filteredData = mockLearningBehavior

        if (studentId) {
          filteredData = filteredData.filter(item => item.studentId === studentId)
        }

        if (startDate && endDate) {
          filteredData = filteredData.filter(item =>
            item.date >= startDate && item.date <= endDate
          )
        }

        const start = (page - 1) * limit
        const end = start + limit
        const items = filteredData.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: items,
            page: page,
            limit: limit
          }
        })
      }, 300)
    })
  },

  // 获取课程统计数据
  getCourseStatistics() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockCourseStats
        })
      }, 200)
    })
  },

  // 获取作业完成数据
  getAssignmentAnalysis(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { courseId, status, page = 1, limit = 10 } = params
        let filteredData = mockAssignmentData

        if (courseId) {
          filteredData = filteredData.filter(item => item.courseId === courseId)
        }

        const start = (page - 1) * limit
        const end = start + limit
        const items = filteredData.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: items,
            page: page,
            limit: limit
          }
        })
      }, 300)
    })
  },

  // 批量操作学生状态
  batchUpdateStudentStatus(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { studentIds, status } = data
        let updatedCount = 0

        studentIds.forEach(id => {
          const student = mockStudents.find(s => s.id === id)
          if (student) {
            student.status = status
            updatedCount++
          }
        })

        resolve({
          code: 200,
          message: `成功更新 ${updatedCount} 名学生的状态`,
          data: { updatedCount }
        })
      }, 500)
    })
  },

  // 批量发送通知
  batchSendNotification(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { studentIds, title, content, type } = data
        resolve({
          code: 200,
          message: `成功向 ${studentIds.length} 名学生发送通知`,
          data: { sentCount: studentIds.length }
        })
      }, 800)
    })
  },

  // 导出分析数据
  exportAnalysisData(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { type, format, filters } = params
        resolve({
          code: 200,
          message: '数据导出成功',
          data: {
            downloadUrl: `https://example.com/export/${type}_${Date.now()}.${format}`,
            filename: `${type}_analysis_${Date.now()}.${format}`,
            size: '2.5MB'
          }
        })
      }, 1000)
    })
  },

  // 获取风险学生预警
  getRiskStudents(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { riskLevel, classId } = params
        const riskStudents = mockStudents
          .filter(student => {
            let isRisk = false
            if (student.averageScore < 60) isRisk = true
            if (student.videoWatchProgress < 30) isRisk = true
            if (student.exerciseCompletion < 20) isRisk = true
            if (student.totalStudyTime < 300) isRisk = true
            if (student.status === 0) isRisk = true

            return isRisk
          })
          .map(student => ({
            ...student,
            riskFactors: [],
            riskLevel: student.averageScore < 40 ? 'high' : student.averageScore < 60 ? 'medium' : 'low'
          }))

        // 添加风险因素
        riskStudents.forEach(student => {
          if (student.averageScore < 60) student.riskFactors.push('成绩偏低')
          if (student.videoWatchProgress < 30) student.riskFactors.push('视频观看率低')
          if (student.exerciseCompletion < 20) student.riskFactors.push('练习完成率低')
          if (student.totalStudyTime < 300) student.riskFactors.push('学习时长不足')
          if (student.status === 0) student.riskFactors.push('长期未活跃')
        })

        let filteredData = riskStudents
        if (riskLevel) {
          filteredData = filteredData.filter(s => s.riskLevel === riskLevel)
        }
        if (classId) {
          filteredData = filteredData.filter(s => s.classId === classId)
        }

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: filteredData,
            statistics: {
              highRisk: filteredData.filter(s => s.riskLevel === 'high').length,
              mediumRisk: filteredData.filter(s => s.riskLevel === 'medium').length,
              lowRisk: filteredData.filter(s => s.riskLevel === 'low').length
            }
          }
        })
      }, 400)
    })
  },

  // 获取学习趋势数据
  getLearningTrends(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { studentId, courseId, period = '7d' } = params
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90

        const trendData = Array.from({ length: days }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (days - i - 1))

          return {
            date: date.toISOString().split('T')[0],
            studyTime: Math.floor(Math.random() * 120) + 30,
            videoWatched: Math.floor(Math.random() * 60) + 10,
            exercisesCompleted: Math.floor(Math.random() * 15) + 2,
            loginCount: Math.floor(Math.random() * 3) + 1
          }
        })

        resolve({
          code: 200,
          data: trendData
        })
      }, 300)
    })
  }
}