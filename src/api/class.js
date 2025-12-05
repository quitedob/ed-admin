import request from '@/utils/request'

// 模拟数据
const mockClasses = [
  {
    id: 1,
    name: '前端开发基础班',
    code: 'FE2024001',
    description: '学习HTML、CSS、JavaScript基础知识',
    studentCount: 45,
    teacherName: '张老师',
    createTime: '2024-01-15',
    status: 1
  },
  {
    id: 2,
    name: 'Vue.js进阶班',
    code: 'VUE2024001',
    description: '深入学习Vue.js框架及生态',
    studentCount: 38,
    teacherName: '李老师',
    createTime: '2024-02-01',
    status: 1
  },
  {
    id: 3,
    name: 'React实战班',
    code: 'REA2024001',
    description: 'React框架实战项目开发',
    studentCount: 42,
    teacherName: '王老师',
    createTime: '2024-02-15',
    status: 1
  }
]

const mockStudents = [
  {
    id: 1,
    name: '张三',
    studentId: 'STU2024001',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    classId: 1,
    className: '前端开发基础班',
    joinTime: '2024-01-16',
    status: 1
  },
  {
    id: 2,
    name: '李四',
    studentId: 'STU2024002',
    email: 'lisi@example.com',
    phone: '13800138002',
    classId: 1,
    className: '前端开发基础班',
    joinTime: '2024-01-16',
    status: 1
  },
  {
    id: 3,
    name: '王五',
    studentId: 'STU2024003',
    email: 'wangwu@example.com',
    phone: '13800138003',
    classId: 2,
    className: 'Vue.js进阶班',
    joinTime: '2024-02-02',
    status: 1
  }
]

const mockCourses = [
  {
    id: 1,
    name: 'JavaScript基础编程',
    description: 'JavaScript语言基础知识学习',
    chapters: [
      { id: 1, name: '第1章：变量与数据类型', duration: 45 },
      { id: 2, name: '第2章：函数与作用域', duration: 60 },
      { id: 3, name: '第3章：对象与数组', duration: 50 }
    ]
  },
  {
    id: 2,
    name: 'Vue.js组件开发',
    description: 'Vue组件化开发实战',
    chapters: [
      { id: 4, name: '第1章：组件基础', duration: 55 },
      { id: 5, name: '第2章：组件通信', duration: 65 },
      { id: 6, name: '第3章：插槽与动态组件', duration: 45 }
    ]
  }
]

const mockAuthorizations = [
  {
    id: 1,
    classId: 1,
    className: '前端开发基础班',
    courseId: 1,
    courseName: 'JavaScript基础编程',
    chapterIds: [1, 2, 3],
    studentCount: 45,
    authorizedCount: 45,
    status: 1,
    authorizeTime: '2024-01-20',
    expireTime: '2024-12-31'
  },
  {
    id: 2,
    classId: 2,
    className: 'Vue.js进阶班',
    courseId: 2,
    courseName: 'Vue.js组件开发',
    chapterIds: [4, 5],
    studentCount: 38,
    authorizedCount: 38,
    status: 1,
    authorizeTime: '2024-02-05',
    expireTime: '2024-12-31'
  }
]

// API接口定义
export default {
  // 获取班级列表
  getClassList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, keyword = '' } = params
        let filteredData = mockClasses

        if (keyword) {
          filteredData = mockClasses.filter(item =>
            item.name.includes(keyword) || item.code.includes(keyword)
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

  // 获取班级详情
  getClassDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const classInfo = mockClasses.find(item => item.id === id)
        const students = mockStudents.filter(item => item.classId === id)

        resolve({
          code: 200,
          data: {
            classInfo,
            students,
            total: students.length
          }
        })
      }, 200)
    })
  },

  // 获取学生列表
  getStudentList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, classId, keyword = '' } = params
        let filteredData = mockStudents

        if (classId) {
          filteredData = filteredData.filter(item => item.classId === classId)
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
            limit: limit
          }
        })
      }, 300)
    })
  },

  // 获取课程列表
  getCourseList() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockCourses
        })
      }, 200)
    })
  },

  // 获取授权记录
  getAuthorizationList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, classId, courseId } = params
        let filteredData = mockAuthorizations

        if (classId) {
          filteredData = filteredData.filter(item => item.classId === classId)
        }

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

  // 创建班级授权
  createAuthorization(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAuth = {
          id: mockAuthorizations.length + 1,
          ...data,
          status: 1,
          authorizeTime: new Date().toISOString().split('T')[0],
          expireTime: '2024-12-31'
        }
        mockAuthorizations.push(newAuth)

        resolve({
          code: 200,
          message: '授权创建成功',
          data: newAuth
        })
      }, 400)
    })
  },

  // 更新授权状态
  updateAuthorization(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const auth = mockAuthorizations.find(item => item.id === id)
        if (auth) {
          auth.status = status
          resolve({
            code: 200,
            message: status === 1 ? '授权已启用' : '授权已禁用',
            data: auth
          })
        } else {
          resolve({
            code: 404,
            message: '授权记录不存在'
          })
        }
      }, 300)
    })
  },

  // 删除授权
  deleteAuthorization(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockAuthorizations.findIndex(item => item.id === id)
        if (index > -1) {
          mockAuthorizations.splice(index, 1)
          resolve({
            code: 200,
            message: '授权删除成功'
          })
        } else {
          resolve({
            code: 404,
            message: '授权记录不存在'
          })
        }
      }, 300)
    })
  },

  // 批量添加学生到班级
  batchAddStudents(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { classId, students } = data
        let addedCount = 0

        students.forEach(student => {
          const newStudent = {
            id: mockStudents.length + addedCount + 1,
            ...student,
            classId,
            joinTime: new Date().toISOString().split('T')[0],
            status: 1
          }
          mockStudents.push(newStudent)
          addedCount++
        })

        resolve({
          code: 200,
          message: `成功添加 ${addedCount} 名学生`,
          data: { addedCount }
        })
      }, 500)
    })
  }
}