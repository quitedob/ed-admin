// 模拟数据
const mockAnalysisResults = [
  {
    id: 1,
    studentId: 'stu001',
    studentName: '张三',
    examType: 'midterm',
    subject: 'programming',
    totalScore: 100,
    studentScore: 78,
    scoreRate: 78,
    classRank: 15,
    classTotal: 30,
    gradeRank: 125,
    gradeTotal: 200,
    classAverage: 75,
    gradeAverage: 72,
    analysisTime: new Date('2024-01-25'),
    mistakeCount: 5,
    mistakeRate: 25,
    seriousMistakes: 2,
    avoidableMistakes: 3,
    status: 'completed',
    knowledgeAnalysis: [
      {
        knowledgePoint: '变量与数据类型',
        questionCount: 3,
        accuracy: 100,
        masteryLevel: 'mastered',
        suggestion: '掌握良好，继续保持'
      },
      {
        knowledgePoint: '函数基础',
        questionCount: 4,
        accuracy: 50,
        masteryLevel: 'needs_improvement',
        suggestion: '需要重点复习函数定义和参数传递'
      },
      {
        knowledgePoint: '循环结构',
        questionCount: 3,
        accuracy: 67,
        masteryLevel: 'familiar',
        suggestion: '基本掌握，需要更多练习'
      },
      {
        knowledgePoint: '条件语句',
        questionCount: 2,
        accuracy: 100,
        masteryLevel: 'mastered',
        suggestion: '掌握良好'
      }
    ],
    capabilityDetails: [
      {
        name: '基础知识',
        score: 85,
        description: '基础概念掌握较好'
      },
      {
        name: '逻辑思维',
        score: 72,
        description: '逻辑推理能力有待提高'
      },
      {
        name: '代码实现',
        score: 68,
        description: '编程实践能力需要加强'
      },
      {
        name: '问题解决',
        score: 75,
        description: '问题分析能力中等'
      }
    ],
    mistakeDetails: [
      {
        questionNumber: 5,
        questionType: '选择题',
        knowledgePoint: '函数基础',
        score: 4,
        studentScore: 0,
        mistakeReason: 'concept_error',
        analysis: '对函数概念理解不清晰，混淆了参数传递机制'
      },
      {
        questionNumber: 8,
        questionType: '编程题',
        knowledgePoint: '循环结构',
        score: 10,
        studentScore: 6,
        mistakeReason: 'logic_error',
        analysis: '循环条件设置错误，导致循环次数不正确'
      },
      {
        questionNumber: 12,
        questionType: '填空题',
        knowledgePoint: '变量作用域',
        score: 2,
        studentScore: 1,
        mistakeReason: 'concept_error',
        analysis: '对全局变量和局部变量的作用域理解不清'
      }
    ]
  }
]

const mockImprovementPlans = [
  {
    id: 1,
    studentId: 'stu001',
    studentName: '张三',
    title: 'JavaScript基础提升计划',
    targetScore: 85,
    currentScore: 78,
    status: 'active',
    progress: 35,
    totalDays: 30,
    completedDays: 11,
    createTime: '2024-01-20',
    endTime: '2024-02-19',
    tasks: [
      {
        id: 1,
        title: '复习函数基础概念',
        description: '重新学习函数的定义、参数、返回值等基础概念',
        type: 'study',
        estimatedTime: 120,
        completed: true,
        completedTime: '2024-01-21'
      },
      {
        id: 2,
        title: '完成函数练习题10道',
        description: '针对函数基础进行专项练习，巩固知识点',
        type: 'practice',
        estimatedTime: 180,
        completed: true,
        completedTime: '2024-01-22'
      },
      {
        id: 3,
        title: '学习循环结构优化技巧',
        description: '学习如何优化循环，提高代码效率',
        type: 'study',
        estimatedTime: 90,
        completed: false
      }
    ]
  }
]

const mockStudents = [
  { id: 'stu001', name: '张三', classId: 'class001', className: '前端开发一班' },
  { id: 'stu002', name: '李四', classId: 'class001', className: '前端开发一班' },
  { id: 'stu003', name: '王五', classId: 'class002', className: '前端开发二班' },
  { id: 'stu004', name: '赵六', classId: 'class002', className: '前端开发二班' }
]

const mockLearningSuggestions = [
  {
    id: 1,
    studentId: 'stu001',
    type: 'knowledge',
    title: '函数基础强化建议',
    content: '建议重点复习JavaScript函数的定义方式、参数传递机制、作用域链等核心概念。推荐观看函数专题视频教程，并完成相关练习题。',
    priority: 'high',
    createTime: '2024-01-25'
  },
  {
    id: 2,
    studentId: 'stu001',
    type: 'practice',
    title: '循环结构练习推荐',
    content: '推荐完成循环结构专项练习，包括for循环、while循环、do-while循环的综合应用。建议从简单题目开始，逐步提升难度。',
    priority: 'medium',
    createTime: '2024-01-25'
  }
]

const mockRecommendedResources = [
  {
    id: 1,
    type: 'video',
    title: 'JavaScript函数详解',
    description: '深入讲解JavaScript函数的各种用法和技巧',
    duration: 45,
    difficulty: 'intermediate',
    tags: ['函数', '作用域', '闭包']
  },
  {
    id: 2,
    type: 'article',
    title: '循环优化最佳实践',
    description: '介绍JavaScript中循环结构的优化方法和技巧',
    readTime: 15,
    difficulty: 'beginner',
    tags: ['循环', '性能优化', '最佳实践']
  }
]

const mockRecommendedProblems = [
  {
    id: 1,
    title: '函数基础练习',
    difficulty: 'easy',
    tags: ['函数', '参数传递'],
    completedCount: 156,
    acRate: 0.85
  },
  {
    id: 2,
    title: '循环结构应用',
    difficulty: 'medium',
    tags: ['循环', '数组操作'],
    completedCount: 98,
    acRate: 0.72
  }
]

export const assessmentApi = {
  // 试卷分析相关API
  // 上传试卷图片
  uploadExamPaper: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            uploadId: 'upload_' + Date.now(),
            fileName: data.file?.name || 'exam_paper.jpg',
            fileSize: data.file?.size || 1024000,
            uploadTime: new Date().toISOString()
          },
          message: '试卷上传成功'
        })
      }, 800)
    })
  },

  // 分析试卷内容
  analyzeExamPaper: (uploadId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            analysisId: 'analysis_' + Date.now(),
            status: 'processing',
            estimatedTime: 30
          },
          message: '开始分析试卷内容'
        })
      }, 1000)
    })
  },

  // 获取分析结果
  getAnalysisResult: (analysisId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = mockAnalysisResults[0]
        resolve({
          code: 200,
          data: result,
          message: '分析结果获取成功'
        })
      }, 500)
    })
  },

  // 保存分析结果
  saveAnalysisResult: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newResult = {
          id: mockAnalysisResults.length + 1,
          ...data,
          analysisTime: new Date(),
          status: 'completed'
        }
        mockAnalysisResults.unshift(newResult)
        resolve({
          code: 200,
          data: newResult,
          message: '分析结果保存成功'
        })
      }, 300)
    })
  },

  // 获取学生分析历史
  getStudentAnalysisHistory: (studentId, params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10 } = params
        const studentResults = mockAnalysisResults.filter(r => r.studentId === studentId)
        const start = (page - 1) * limit
        const end = start + limit
        const items = studentResults.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: studentResults.length,
            items: items,
            page: page,
            limit: limit
          }
        })
      }, 400)
    })
  },

  // 能力评估相关API
  // 获取能力评估报告
  getCapabilityReport: (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = mockAnalysisResults.find(r => r.studentId === studentId)
        if (result) {
          resolve({
            code: 200,
            data: {
              ...result,
              radarData: [
                { subject: '基础知识', value: 85 },
                { subject: '逻辑思维', value: 72 },
                { subject: '代码实现', value: 68 },
                { subject: '问题解决', value: 75 },
                { subject: '学习能力', value: 80 }
              ]
            }
          })
        } else {
          resolve({
            code: 404,
            message: '未找到能力评估报告'
          })
        }
      }, 600)
    })
  },

  // 生成能力评估
  generateCapabilityAssessment: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            assessmentId: 'assess_' + Date.now(),
            status: 'generating',
            estimatedTime: 60
          },
          message: '能力评估生成中'
        })
      }, 800)
    })
  },

  // 获取能力雷达图数据
  getCapabilityRadarData: (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: [
            { subject: '基础知识', value: 85, max: 100 },
            { subject: '逻辑思维', value: 72, max: 100 },
            { subject: '代码实现', value: 68, max: 100 },
            { subject: '问题解决', value: 75, max: 100 },
            { subject: '学习能力', value: 80, max: 100 }
          ]
        })
      }, 300)
    })
  },

  // 获取知识点掌握情况
  getKnowledgeMastery: (studentId, courseId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = mockAnalysisResults.find(r => r.studentId === studentId)
        if (result && result.knowledgeAnalysis) {
          resolve({
            code: 200,
            data: result.knowledgeAnalysis
          })
        } else {
          resolve({
            code: 200,
            data: []
          })
        }
      }, 400)
    })
  },

  // 提分计划相关API
  // 创建提分计划
  createImprovementPlan: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlan = {
          id: mockImprovementPlans.length + 1,
          ...data,
          status: 'active',
          progress: 0,
          createTime: new Date().toISOString().split('T')[0],
          tasks: data.tasks || []
        }
        mockImprovementPlans.unshift(newPlan)
        resolve({
          code: 200,
          data: newPlan,
          message: '提分计划创建成功'
        })
      }, 500)
    })
  },

  // 获取提分计划列表
  getImprovementPlans: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, studentId, status } = params
        let filteredData = mockImprovementPlans

        if (studentId) {
          filteredData = filteredData.filter(item => item.studentId === studentId)
        }

        if (status) {
          filteredData = filteredData.filter(item => item.status === status)
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
      }, 400)
    })
  },

  // 获取提分计划详情
  getImprovementPlanDetail: (planId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = mockImprovementPlans.find(p => p.id === parseInt(planId))
        if (plan) {
          resolve({
            code: 200,
            data: plan
          })
        } else {
          resolve({
            code: 404,
            message: '提分计划不存在'
          })
        }
      }, 300)
    })
  },

  // 更新提分计划
  updateImprovementPlan: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockImprovementPlans.findIndex(p => p.id === data.id)
        if (index > -1) {
          Object.assign(mockImprovementPlans[index], data)
          resolve({
            code: 200,
            data: mockImprovementPlans[index],
            message: '提分计划更新成功'
          })
        } else {
          resolve({
            code: 404,
            message: '提分计划不存在'
          })
        }
      }, 400)
    })
  },

  // 删除提分计划
  deleteImprovementPlan: (planId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockImprovementPlans.findIndex(p => p.id === parseInt(planId))
        if (index > -1) {
          mockImprovementPlans.splice(index, 1)
          resolve({
            code: 200,
            message: '提分计划删除成功'
          })
        } else {
          resolve({
            code: 404,
            message: '提分计划不存在'
          })
        }
      }, 300)
    })
  },

  // 更新计划进度
  updatePlanProgress: (planId, progress) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = mockImprovementPlans.find(p => p.id === parseInt(planId))
        if (plan) {
          plan.progress = Math.min(100, Math.max(0, progress))
          if (plan.progress === 100) {
            plan.status = 'completed'
          }
          resolve({
            code: 200,
            data: plan,
            message: '计划进度更新成功'
          })
        } else {
          resolve({
            code: 404,
            message: '提分计划不存在'
          })
        }
      }, 200)
    })
  },

  // 获取计划任务列表
  getPlanTasks: (planId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = mockImprovementPlans.find(p => p.id === parseInt(planId))
        if (plan) {
          resolve({
            code: 200,
            data: plan.tasks || []
          })
        } else {
          resolve({
            code: 404,
            message: '提分计划不存在'
          })
        }
      }, 300)
    })
  },

  // 完成计划任务
  completePlanTask: (taskId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let found = false
        mockImprovementPlans.forEach(plan => {
          const task = plan.tasks.find(t => t.id === parseInt(taskId))
          if (task) {
            task.completed = true
            task.completedTime = new Date().toISOString()
            found = true
          }
        })

        if (found) {
          resolve({
            code: 200,
            message: '任务完成成功'
          })
        } else {
          resolve({
            code: 404,
            message: '任务不存在'
          })
        }
      }, 200)
    })
  },

  // 学习建议相关API
  // 获取个性化学习建议
  getPersonalizedSuggestions: (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions = mockLearningSuggestions.filter(s => s.studentId === studentId)
        resolve({
          code: 200,
          data: suggestions
        })
      }, 400)
    })
  },

  // 生成学习建议
  generateLearningSuggestion: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSuggestion = {
          id: mockLearningSuggestions.length + 1,
          ...data,
          createTime: new Date().toISOString().split('T')[0]
        }
        mockLearningSuggestions.unshift(newSuggestion)
        resolve({
          code: 200,
          data: newSuggestion,
          message: '学习建议生成成功'
        })
      }, 800)
    })
  },

  // 保存学习建议
  saveLearningSuggestion: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: data,
          message: '学习建议保存成功'
        })
      }, 300)
    })
  },

  // 获取推荐资源
  getRecommendedResources: (studentId, subject) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let resources = mockRecommendedResources
        if (subject) {
          resources = resources.filter(r => r.tags.includes(subject))
        }
        resolve({
          code: 200,
          data: resources
        })
      }, 500)
    })
  },

  // 获取推荐练习题
  getRecommendedProblems: (studentId, knowledgePoint) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let problems = mockRecommendedProblems
        if (knowledgePoint) {
          problems = problems.filter(p => p.tags.includes(knowledgePoint))
        }
        resolve({
          code: 200,
          data: problems
        })
      }, 400)
    })
  },

  // AI分析相关API
  // AI识别试卷内容
  aiRecognizeExamPaper: (imageUrl) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            recognitionId: 'rec_' + Date.now(),
            questions: [
              { number: 1, type: '选择题', score: 4 },
              { number: 2, type: '填空题', score: 2 },
              { number: 3, type: '编程题', score: 10 }
            ],
            totalScore: 100
          },
          message: '试卷识别完成'
        })
      }, 1500)
    })
  },

  // AI分析错题原因
  aiAnalyzeMistakes: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            analysis: [
              {
                questionNumber: 5,
                reason: 'concept_error',
                explanation: '对函数概念理解不清晰'
              }
            ]
          },
          message: '错题分析完成'
        })
      }, 1200)
    })
  },

  // AI生成改进建议
  aiGenerateImprovementAdvice: (studentId, analysisData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            advice: '建议重点复习函数基础知识，多做相关练习题来巩固理解',
            priorityTopics: ['函数基础', '参数传递', '作用域'],
            estimatedImprovementTime: 15
          },
          message: '改进建议生成成功'
        })
      }, 1000)
    })
  },

  // AI预测学习效果
  aiPredictLearningOutcome: (studentId, planData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            predictedScore: 85,
            confidence: 0.82,
            timeToAchieve: 30,
            keyFactors: ['练习频率', '学习时间', '基础知识掌握']
          },
          message: '学习效果预测完成'
        })
      }, 800)
    })
  },

  // 获取学生列表
  getStudentList: (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, keyword = '' } = params
        let filteredData = mockStudents

        if (keyword) {
          filteredData = filteredData.filter(student =>
            student.name.includes(keyword) || student.className.includes(keyword)
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

  // 批量分析
  batchAnalysis: (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { studentIds, analysisConfig } = data
        const results = studentIds.map((studentId, index) => ({
          id: `batch_${Date.now()}_${index}`,
          studentId,
          status: index === 0 ? 'completed' : 'processing',
          progress: index === 0 ? 100 : (index * 25),
          result: index === 0 ? mockAnalysisResults[0] : null
        }))

        resolve({
          code: 200,
          data: {
            batchId: `batch_${Date.now()}`,
            totalStudents: studentIds.length,
            completedCount: 1,
            results: results
          },
          message: '批量分析任务创建成功'
        })
      }, 1000)
    })
  },

  // 导出报告
  exportReport: (reportId, format) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: {
            downloadUrl: `/api/assessment/admin/report/download/${reportId}.${format}`,
            filename: `能力评估报告_${reportId}.${format}`,
            fileSize: '2.3MB'
          },
          message: '报告导出成功'
        })
      }, 2000)
    })
  }
}