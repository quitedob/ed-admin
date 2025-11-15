/**
 * Mock API 拦截器
 * 模拟后端API响应
 */

import { useMockStore } from '@/stores/mockStore'

// 模拟网络延迟
function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 统一响应格式
function successResponse(data) {
  return {
    code: 200,
    message: 'success',
    data
  }
}

function errorResponse(message) {
  return {
    code: 500,
    message,
    data: null
  }
}

// ========== 题库 API ==========

export const mockQuestionBankApi = {
  async getQuestionBanks(params = {}) {
    await sleep(500)
    const mockStore = useMockStore()
    
    let result = mockStore.questionBanks
    
    // 搜索过滤
    if (params.keyword) {
      result = result.filter(qb => 
        qb.name.includes(params.keyword) ||
        qb.description?.includes(params.keyword)
      )
    }
    
    return successResponse({
      records: result,
      total: result.length
    })
  },

  async getQuestionBankDetail(id) {
    await sleep(300)
    const mockStore = useMockStore()
    const bank = mockStore.questionBanks.find(qb => qb.id === id)
    
    if (!bank) {
      return errorResponse('题库不存在')
    }
    
    return successResponse(bank)
  },

  async saveQuestionBank(data) {
    await sleep(800)
    const mockStore = useMockStore()
    
    const newBank = {
      id: `bank_${Date.now()}`,
      ...data,
      totalQuestions: 0,
      statistics: {
        singleChoice: 0,
        multipleChoice: 0,
        fillBlank: 0,
        essay: 0,
        programming: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockStore.addQuestionBank(newBank)
    return successResponse(newBank)
  },

  async updateQuestionBank(id, data) {
    await sleep(800)
    const mockStore = useMockStore()
    mockStore.updateQuestionBank(id, {
      ...data,
      updatedAt: new Date().toISOString()
    })
    return successResponse({ id, ...data })
  },

  async deleteQuestionBank(id) {
    await sleep(600)
    const mockStore = useMockStore()
    mockStore.deleteQuestionBank(id)
    return successResponse(null)
  }
}

// ========== 班级 API ==========

export const mockClassApi = {
  async getClasses(params = {}) {
    await sleep(500)
    const mockStore = useMockStore()
    
    let result = mockStore.classes
    
    // 筛选
    if (params.grade) {
      result = result.filter(c => c.grade === params.grade)
    }
    if (params.major) {
      result = result.filter(c => c.major === params.major)
    }
    
    return successResponse({
      records: result,
      total: result.length
    })
  },

  async getClassDetail(id) {
    await sleep(300)
    const mockStore = useMockStore()
    const classData = mockStore.classes.find(c => c.id === id)
    
    if (!classData) {
      return errorResponse('班级不存在')
    }
    
    // 获取班级学生
    const students = mockStore.getStudentsByClass(id)
    
    return successResponse({
      ...classData,
      students
    })
  },

  async saveClass(data) {
    await sleep(800)
    const mockStore = useMockStore()
    
    const newClass = {
      id: `class_${Date.now()}`,
      ...data,
      studentCount: 0,
      courseCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    
    mockStore.addClass(newClass)
    return successResponse(newClass)
  },

  async updateClass(id, data) {
    await sleep(800)
    const mockStore = useMockStore()
    mockStore.updateClass(id, data)
    return successResponse({ id, ...data })
  },

  async deleteClass(id) {
    await sleep(600)
    const mockStore = useMockStore()
    mockStore.deleteClass(id)
    return successResponse(null)
  }
}

// ========== 学生 API ==========

export const mockStudentApi = {
  async getStudents(params = {}) {
    await sleep(500)
    const mockStore = useMockStore()
    
    let result = mockStore.students
    
    // 搜索
    if (params.keyword) {
      result = result.filter(s =>
        s.name.includes(params.keyword) ||
        s.studentId.includes(params.keyword) ||
        s.phone.includes(params.keyword)
      )
    }
    
    // 班级筛选
    if (params.classId) {
      result = result.filter(s =>
        s.classes.some(c => c.id === params.classId)
      )
    }
    
    return successResponse({
      records: result,
      total: result.length
    })
  },

  async getStudentDetail(id) {
    await sleep(300)
    const mockStore = useMockStore()
    const student = mockStore.students.find(s => s.id === id)
    
    if (!student) {
      return errorResponse('学生不存在')
    }
    
    return successResponse(student)
  },

  async saveStudent(data) {
    await sleep(800)
    const mockStore = useMockStore()
    
    const newStudent = {
      id: `stu_${Date.now()}`,
      ...data,
      statistics: {
        totalHomeworks: 0,
        completedHomeworks: 0,
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        learningTime: 0
      },
      status: 'active',
      createdAt: new Date().toISOString()
    }
    
    mockStore.addStudent(newStudent)
    return successResponse(newStudent)
  },

  async updateStudent(id, data) {
    await sleep(800)
    const mockStore = useMockStore()
    mockStore.updateStudent(id, data)
    return successResponse({ id, ...data })
  },

  async deleteStudent(id) {
    await sleep(600)
    const mockStore = useMockStore()
    mockStore.deleteStudent(id)
    return successResponse(null)
  }
}

// ========== 作业 API ==========

export const mockHomeworkApi = {
  async getHomeworks(params = {}) {
    await sleep(500)
    const mockStore = useMockStore()
    
    let result = mockStore.homeworks
    
    if (params.classId) {
      result = result.filter(hw => hw.classId === params.classId)
    }
    
    return successResponse({
      records: result,
      total: result.length
    })
  },

  async getHomeworkDetail(id) {
    await sleep(300)
    const mockStore = useMockStore()
    const homework = mockStore.homeworks.find(hw => hw.id === id)
    
    if (!homework) {
      return errorResponse('作业不存在')
    }
    
    const submissions = mockStore.getSubmissionsByHomework(id)
    
    return successResponse({
      ...homework,
      submissions
    })
  },

  async saveHomework(data) {
    await sleep(1000)
    const mockStore = useMockStore()
    
    const newHomework = {
      id: `hw_${Date.now()}`,
      ...data,
      submitCount: 0,
      submitRate: 0,
      gradedCount: 0,
      pendingCount: 0,
      notSubmitCount: data.totalStudents || 0,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
    
    mockStore.addHomework(newHomework)
    return successResponse(newHomework)
  },

  async updateHomework(id, data) {
    await sleep(800)
    const mockStore = useMockStore()
    mockStore.updateHomework(id, data)
    return successResponse({ id, ...data })
  },

  async deleteHomework(id) {
    await sleep(600)
    const mockStore = useMockStore()
    mockStore.deleteHomework(id)
    return successResponse(null)
  }
}

// ========== 考试 API ==========

export const mockExamApi = {
  async getExams(params = {}) {
    await sleep(500)
    const mockStore = useMockStore()
    
    let result = mockStore.exams
    
    if (params.classId) {
      result = result.filter(exam => exam.classId === params.classId)
    }
    
    return successResponse({
      records: result,
      total: result.length
    })
  },

  async getExamDetail(id) {
    await sleep(300)
    const mockStore = useMockStore()
    const exam = mockStore.exams.find(e => e.id === id)
    
    if (!exam) {
      return errorResponse('考试不存在')
    }
    
    return successResponse(exam)
  },

  async saveExam(data) {
    await sleep(1000)
    const mockStore = useMockStore()
    
    const newExam = {
      id: `exam_${Date.now()}`,
      ...data,
      participantCount: 0,
      submittedCount: 0,
      averageScore: 0,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
    
    mockStore.addExam(newExam)
    return successResponse(newExam)
  },

  async updateExam(id, data) {
    await sleep(800)
    const mockStore = useMockStore()
    mockStore.updateExam(id, data)
    return successResponse({ id, ...data })
  },

  async deleteExam(id) {
    await sleep(600)
    const mockStore = useMockStore()
    mockStore.deleteExam(id)
    return successResponse(null)
  }
}

// 导出所有 Mock API
export default {
  questionBankApi: mockQuestionBankApi,
  classApi: mockClassApi,
  studentApi: mockStudentApi,
  homeworkApi: mockHomeworkApi,
  examApi: mockExamApi
}
