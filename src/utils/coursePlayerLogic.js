/**
 * 学生端课程播放逻辑示例
 * 处理章节练习和作业的统一逻辑
 */

// 模拟题库数据
const mockQuestionBank = {
  'q_1001': {
    id: 'q_1001',
    title: 'JavaScript数据类型问题',
    type: 'single',
    difficulty: 'easy',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A'
  },
  'q_1002': {
    id: 'q_1002',
    title: 'Python基础语法',
    type: 'fill',
    difficulty: 'medium',
    answer: 'def'
  },
  'p_2001': {
    id: 'p_2001',
    title: '二分查找算法',
    type: 'programming',
    difficulty: 'hard',
    language: 'python'
  }
}

/**
 * 处理学生点击课程章节/小节
 * @param {Object} lesson - 课程小节数据
 * @returns {Object} 练习数据
 */
export const handleLessonClick = (lesson) => {
  const practiceData = {
    title: '',
    questions: [],
    type: 'unknown',
    source: ''
  }

  // 逻辑判断
  if (lesson.questionIds && lesson.questionIds.trim()) {
    // 情况 A: 章节作业 (直接绑定ID) - 新逻辑
    const ids = parseQuestionIds(lesson.questionIds)
    practiceData.questions = getQuestionsByIds(ids)
    practiceData.title = lesson.title + ' - 课后练习'
    practiceData.type = 'chapter_drill'
    practiceData.source = 'lesson_question_ids'

  } else if (lesson.homeworkId) {
    // 情况 B: 绑定了 Assignment 对象 - 兼容旧逻辑
    practiceData.questions = getQuestionsByHomeworkId(lesson.homeworkId)
    practiceData.title = lesson.homeworkTitle || '章节作业'
    practiceData.type = 'homework_assignment'
    practiceData.source = 'homework_assignment'

  } else if (lesson.assignmentId) {
    // 情况 C: 独立作业
    practiceData.questions = getQuestionsByAssignmentId(lesson.assignmentId)
    practiceData.title = '独立作业'
    practiceData.type = 'independent_assignment'
    practiceData.source = 'assignment_management'

  } else {
    // 情况 D: 无练习内容
    practiceData.questions = []
    practiceData.title = lesson.title
    practiceData.type = 'no_practice'
    practiceData.source = ''
  }

  return practiceData
}

/**
 * 解析题目ID字符串
 * @param {string} questionIds - 题目ID字符串，如 "q_1001,q_1002,p_2001"
 * @returns {Array} 题目ID数组
 */
export const parseQuestionIds = (questionIds) => {
  if (!questionIds || typeof questionIds !== 'string') {
    return []
  }

  return questionIds
    .split(/[,，]/) // 支持中英文逗号
    .map(id => id.trim())
    .filter(id => id) // 过滤空字符串
}

/**
 * 根据题目ID数组获取题目数据
 * @param {Array} questionIds - 题目ID数组
 * @returns {Array} 题目数据数组
 */
export const getQuestionsByIds = (questionIds) => {
  return questionIds.map(id => {
    const question = mockQuestionBank[id]
    if (!question) {
      console.warn(`题目ID ${id} 不存在`)
      return null
    }
    return question
  }).filter(Boolean) // 过滤掉不存在的题目
}

/**
 * 根据作业ID获取题目（兼容旧逻辑）
 * @param {string} homeworkId - 作业ID
 * @returns {Array} 题目数据数组
 */
export const getQuestionsByHomeworkId = (homeworkId) => {
  // 这里应该调用API获取作业数据
  // 模拟数据
  const mockHomeworks = {
    'homework_001': ['q_1001', 'q_1002'],
    'homework_002': ['p_2001']
  }

  const questionIds = mockHomeworks[homeworkId] || []
  return getQuestionsByIds(questionIds)
}

/**
 * 根据独立作业ID获取题目
 * @param {string} assignmentId - 独立作业ID
 * @returns {Array} 题目数据数组
 */
export const getQuestionsByAssignmentId = (assignmentId) => {
  // 这里应该调用作业管理API
  // 模拟数据
  const mockAssignments = {
    'assignment_001': ['q_1001', 'p_2001'],
    'assignment_002': ['q_1002']
  }

  const questionIds = mockAssignments[assignmentId] || []
  return getQuestionsByIds(questionIds)
}

/**
 * 验证题目ID是否有效
 * @param {string} questionIds - 题目ID字符串
 * @returns {Object} 验证结果
 */
export const validateQuestionIds = (questionIds) => {
  const ids = parseQuestionIds(questionIds)
  const validIds = []
  const invalidIds = []

  ids.forEach(id => {
    if (mockQuestionBank[id]) {
      validIds.push(id)
    } else {
      invalidIds.push(id)
    }
  })

  return {
    total: ids.length,
    valid: validIds.length,
    invalid: invalidIds.length,
    validIds,
    invalidIds,
    isValid: invalidIds.length === 0
  }
}

/**
 * 学生提交练习答案
 * @param {string} lessonId - 小节ID
 * @param {Array} answers - 答案数组
 * @returns {Object} 提交结果
 */
export const submitPracticeAnswers = (lessonId, answers) => {
  // 这里应该调用API提交答案
  // 模拟提交逻辑
  const correctCount = answers.filter(answer => answer.isCorrect).length
  const totalCount = answers.length

  return {
    success: true,
    score: Math.round((correctCount / totalCount) * 100),
    correctCount,
    totalCount,
    submittedAt: new Date().toISOString()
  }
}