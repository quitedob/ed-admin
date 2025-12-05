/**
 * 模拟数据 Pinia Store
 * 集中管理所有模拟数据
 */

import { defineStore } from 'pinia'
import { initializeMockData, saveMockData, resetMockData } from '@/utils/mockStorage'

export const useMockStore = defineStore('mock', {
  state: () => ({
    // 是否已初始化
    initialized: false,
    
    // 题库相关
    questionBanks: [],
    questions: [],
    
    // 班级和学生
    classes: [],
    students: [],
    
    // 作业和考试
    homeworks: [],
    exams: [],
    submissions: [],
    
    // 元数据
    version: '1.0.0',
// 班级课程进度配置    classCourseConfigs: [],    // 课程数据    courses: [],
    generatedAt: null
  }),

  getters: {
    // 获取指定班级的学生
    getStudentsByClass: (state) => (classId) => {
      return state.students.filter(s => 
        s.classes && s.classes.some(c => c.id === classId)
      )
    },

    // 根据学生ID获取班级列表（单向引用）
    getClassesByStudentId: (state) => (studentId) => {
      const student = state.students.find(s => s.id === studentId)
      return student && student.classes ? student.classes : []
    },

    // 获取指定班级的作业
    getHomeworksByClass: (state) => (classId) => {
      return state.homeworks.filter(hw => hw.classId === classId)
    },

    // 获取指定班级的考试
    getExamsByClass: (state) => (classId) => {
      return state.exams.filter(exam => exam.classId === classId)
    },

    // 获取指定作业的提交记录
    getSubmissionsByHomework: (state) => (homeworkId) => {
      return state.submissions.filter(sub => sub.homeworkId === homeworkId)
    },

    // 获取指定学生的提交记录
    getSubmissionsByStudent: (state) => (studentId) => {
      return state.submissions.filter(sub => sub.studentId === studentId)
    },

    // 统计数据
    statistics: (state) => ({
      totalQuestionBanks: state.questionBanks.length,
      totalQuestions: state.questions.length,
      totalClasses: state.classes.length,
      totalStudents: state.students.length,
      totalHomeworks: state.homeworks.length,
      totalExams: state.exams.length,
      totalSubmissions: state.submissions.length
    }),

    // 获取班级统计信息
    getClassStatistics: (state) => (classId) => {
      const students = state.students.filter(s => 
        s.classes.some(c => c.id === classId)
      )
      const homeworks = state.homeworks.filter(hw => hw.classId === classId)
      const exams = state.exams.filter(exam => exam.classId === classId)
      
      return {
        studentCount: students.length,
        homeworkCount: homeworks.length,
        examCount: exams.length,
        avgHomeworkSubmitRate: homeworks.length > 0
          ? homeworks.reduce((sum, hw) => sum + (hw.submitRate || 0), 0) / homeworks.length
          : 0
      }
    },

    // 获取学生详细统计
    getStudentStatistics: (state) => (studentId) => {
      const submissions = state.submissions.filter(sub => sub.studentId === studentId)
      const gradedSubmissions = submissions.filter(sub => sub.status === 'graded')
      
      return {
        totalSubmissions: submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        averageScore: gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, sub) => sum + (sub.score / sub.maxScore * 100), 0) / gradedSubmissions.length
          : 0,
        submissionRate: submissions.length > 0
          ? (gradedSubmissions.length / submissions.length * 100)
          : 0
      }
    },

    // 获取课程信息
    getCourseById: (state) => (courseId) => {
      return state.courses.find(c => c.id === courseId)
    },

    // 获取班级课程配置
    getClassCourseConfig: (state) => (classId, courseId) => {
      return state.classCourseConfigs.find(
        config => config.classId === classId && config.courseId === courseId
      )
    },

    // 获取班级在某个课程中已解锁的节点ID列表
    getUnlockedNodeIds: (state) => (classId, courseId) => {
      const config = state.classCourseConfigs.find(
        config => config.classId === classId && config.courseId === courseId
      )
      return config ? config.unlockedIds : []
    },

    // 检查特定节点是否对班级开放
    isNodeUnlocked: (state) => (classId, courseId, nodeId) => {
      const unlockedIds = state.classCourseConfigs
        .find(config => config.classId === classId && config.courseId === courseId)?.unlockedIds || []
      return unlockedIds.includes(nodeId)
    }
  },

  actions: {
    /**
     * 初始化所有模拟数据
     */
    initialize() {
      if (this.initialized) {
        console.log('⚠️ 模拟数据已初始化，跳过')
        return
      }

      console.log('🚀 初始化模拟数据 Store...')
      const data = initializeMockData()
      this.loadData(data)
      this.initialized = true
      console.log('✅ 模拟数据 Store 初始化完成')
    },

    /**
     * 加载数据到 Store
     */
    loadData(data) {
      this.questionBanks = data.questionBanks || []
      this.questions = data.questions || []
      this.classes = data.classes || []
      this.students = data.students || []
      this.homeworks = data.homeworks || []
      this.exams = data.exams || []
      this.submissions = data.submissions || []
      this.version = data.version || '1.0.0'
      this.generatedAt = data.generatedAt || new Date().toISOString()
    },

    /**
     * 保存当前数据到本地存储
     */
    save() {
      const data = {
        questionBanks: this.questionBanks,
        questions: this.questions,
        classes: this.classes,
        students: this.students,
        homeworks: this.homeworks,
        exams: this.exams,
        submissions: this.submissions,
        version: this.version,
        generatedAt: this.generatedAt
      }
      return saveMockData(data)
    },

    /**
     * 重置所有数据
     */
    reset() {
      const data = resetMockData()
      this.loadData(data)
      console.log('✅ Store 数据已重置')
    },

    // ========== 题库操作 ==========
    
    addQuestionBank(questionBank) {
      this.questionBanks.push(questionBank)
      this.save()
    },

    updateQuestionBank(id, updates) {
      const index = this.questionBanks.findIndex(qb => qb.id === id)
      if (index > -1) {
        this.questionBanks[index] = { ...this.questionBanks[index], ...updates }
        this.save()
      }
    },

    deleteQuestionBank(id) {
      const index = this.questionBanks.findIndex(qb => qb.id === id)
      if (index > -1) {
        this.questionBanks.splice(index, 1)
        this.save()
      }
    },

    // ========== 班级操作 ==========
    
    addClass(classData) {
      this.classes.push(classData)
      this.save()
    },

    updateClass(id, updates) {
      const index = this.classes.findIndex(c => c.id === id)
      if (index > -1) {
        this.classes[index] = { ...this.classes[index], ...updates }
        this.save()
      }
    },

    deleteClass(id) {
      const index = this.classes.findIndex(c => c.id === id)
      if (index > -1) {
        this.classes.splice(index, 1)
        // 同时删除该班级的学生
        this.students = this.students.filter(s => 
          !s.classes.some(c => c.id === id)
        )
        this.save()
      }
    },

    // ========== 学生操作 ==========
    
    addStudent(student) {
      this.students.push(student)
      this.save()
    },

    updateStudent(id, updates) {
      const index = this.students.findIndex(s => s.id === id)
      if (index > -1) {
        this.students[index] = { ...this.students[index], ...updates }
        this.save()
      }
    },

    deleteStudent(id) {
      const index = this.students.findIndex(s => s.id === id)
      if (index > -1) {
        this.students.splice(index, 1)
        this.save()
      }
    },

    // ========== 作业操作 ==========
    
    addHomework(homework) {
      this.homeworks.push(homework)
      this.save()
    },

    updateHomework(id, updates) {
      const index = this.homeworks.findIndex(hw => hw.id === id)
      if (index > -1) {
        this.homeworks[index] = { ...this.homeworks[index], ...updates }
        this.save()
      }
    },

    deleteHomework(id) {
      const index = this.homeworks.findIndex(hw => hw.id === id)
      if (index > -1) {
        this.homeworks.splice(index, 1)
        // 同时删除相关提交记录
        this.submissions = this.submissions.filter(sub => sub.homeworkId !== id)
        this.save()
      }
    },

    // ========== 考试操作 ==========
    
    addExam(exam) {
      this.exams.push(exam)
      this.save()
    },

    updateExam(id, updates) {
      const index = this.exams.findIndex(e => e.id === id)
      if (index > -1) {
        this.exams[index] = { ...this.exams[index], ...updates }
        this.save()
      }
    },

    deleteExam(id) {
      const index = this.exams.findIndex(e => e.id === id)
      if (index > -1) {
        this.exams.splice(index, 1)
        this.save()
      }
    },

    // ========== 提交记录操作 ==========
    
    addSubmission(submission) {
      this.submissions.push(submission)
      this.save()
    },

    updateSubmission(id, updates) {
      const index = this.submissions.findIndex(sub => sub.id === id)
      if (index > -1) {
        this.submissions[index] = { ...this.submissions[index], ...updates }
        this.save()
      }
    },

    deleteSubmission(id) {
      const index = this.submissions.findIndex(sub => sub.id === id)
      if (index > -1) {
        this.submissions.splice(index, 1)
        this.save()
      }
    },

    // ========== 课程操作 ==========
    
    addCourse(course) {
      this.courses.push(course)
      this.save()
    },

    updateCourse(id, updates) {
      const index = this.courses.findIndex(c => c.id === id)
      if (index > -1) {
        this.courses[index] = { ...this.courses[index], ...updates }
        this.save()
      }
    },

    deleteCourse(id) {
      const index = this.courses.findIndex(c => c.id === id)
      if (index > -1) {
        this.courses.splice(index, 1)
        // 同时删除相关配置
        this.classCourseConfigs = this.classCourseConfigs.filter(config => config.courseId !== id)
        this.save()
      }
    },

    // ========== 班级课程配置操作 ==========
    
    updateClassCourseConfig(config) {
      const index = this.classCourseConfigs.findIndex(
        c => c.classId === config.classId && c.courseId === config.courseId
      )
      if (index > -1) {
        this.classCourseConfigs[index] = config
      } else {
        this.classCourseConfigs.push(config)
      }
      this.save()
    },

    removeClassCourseConfig(classId, courseId) {
      const index = this.classCourseConfigs.findIndex(
        c => c.classId === classId && c.courseId === courseId
      )
      if (index > -1) {
        this.classCourseConfigs.splice(index, 1)
        this.save()
      }
    }
  }
})
