/**
 * 模拟数据生成工具
 * 用于生成系统所需的各类模拟数据
 */

// 生成题库
export function generateQuestionBanks() {
  return [
    {
      id: 'bank_001',
      name: '第一章基础题库',
      description: '第一章的基础知识题目集合',
      courseId: 'course_001',
      totalQuestions: 50,
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['基础', '第一章'],
      statistics: {
        singleChoice: 20,
        multipleChoice: 15,
        fillBlank: 10,
        essay: 5,
        programming: 0
      },
      availableTags: [
        { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 },
        { id: 'tag_002', name: '第一章', color: '#67C23A', usage: 50 }
      ],
      questions: []
    },
    {
      id: 'bank_002',
      name: '第二章进阶题库',
      description: '第二章进阶知识题目',
      courseId: 'course_001',
      totalQuestions: 35,
      createdAt: '2024-12-05T10:00:00Z',
      updatedAt: '2024-12-18T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['进阶', '第二章'],
      statistics: {
        singleChoice: 15,
        multipleChoice: 10,
        fillBlank: 5,
        essay: 3,
        programming: 2
      },
      availableTags: [],
      questions: []
    },
    {
      id: 'bank_003',
      name: '编程题库',
      description: 'HOJ编程题目集合',
      courseId: 'course_002',
      totalQuestions: 25,
      createdAt: '2024-12-10T10:00:00Z',
      updatedAt: '2024-12-15T15:30:00Z',
      createdBy: 'teacher_001',
      tags: ['编程', 'HOJ'],
      statistics: {
        singleChoice: 0,
        multipleChoice: 0,
        fillBlank: 0,
        essay: 0,
        programming: 25
      },
      availableTags: [],
      questions: []
    }
  ]
}

// 生成题目
export function generateQuestions(count = 50) {
  const types = ['single', 'multiple', 'fill', 'essay', 'programming']
  const difficulties = ['easy', 'medium', 'hard']
  const tags = ['基础', '第一章', '进阶', '算法', '数据结构']

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    return {
      id: `q_${String(i + 1).padStart(3, '0')}`,
      type,
      questionText: `示例题目${i + 1}：这是一道${getTypeLabel(type)}题...`,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      score: Math.floor(Math.random() * 5) + 1,
      tags: [tags[Math.floor(Math.random() * tags.length)]],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })
}

// 生成班级
export function generateClasses() {
  return [
    {
      id: 'class_001',
      name: '前端开发一班',
      description: '2024年秋季前端开发基础班',
      headTeacherId: 'teacher_001',
      headTeacherName: '王老师',
      year: 2024,
      semester: 'fall',
      major: 'frontend',
      grade: 'junior',
      studentCount: 30,
      courseCount: 3,
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'class_002',
      name: '前端开发二班',
      description: '2024年秋季前端开发进阶班',
      headTeacherId: 'teacher_002',
      headTeacherName: '李老师',
      year: 2024,
      semester: 'fall',
      major: 'frontend',
      grade: 'junior',
      studentCount: 28,
      courseCount: 2,
      status: 'active',
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'class_003',
      name: '数据科学班',
      description: '2024年春季数据科学基础班',
      headTeacherId: 'teacher_003',
      headTeacherName: '张老师',
      year: 2024,
      semester: 'spring',
      major: 'data-science',
      grade: 'sophomore',
      studentCount: 25,
      courseCount: 4,
      status: 'active',
      createdAt: '2024-03-01T10:00:00Z'
    }
  ]
}

// 生成学生
export function generateStudents(classId, count = 30) {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `stu_${classId}_${String(i + 1).padStart(3, '0')}`,
    studentId: `2024${classId.slice(-3)}${String(i + 1).padStart(2, '0')}`,
    name: names[i % names.length] + (i > 7 ? i : ''),
    phone: `138001380${String(i).padStart(2, '0')}`,
    email: `student${i + 1}@example.com`,
    classes: [{ id: classId, name: '班级名称', joinTime: '2024-09-01T10:00:00Z' }],
    courses: [],
    statistics: {
      totalHomeworks: 10,
      completedHomeworks: Math.floor(Math.random() * 10),
      totalExams: 2,
      completedExams: Math.floor(Math.random() * 2),
      averageScore: Math.floor(Math.random() * 40) + 60,
      learningTime: Math.floor(Math.random() * 5000) + 1000
    },
    status: 'active',
    createdAt: '2024-09-01T10:00:00Z'
  }))
}

// 生成作业
export function generateHomeworks(classId, count = 4) {
  const courseMap = {
    'class_001': { courseId: 'course_001', courseName: '前端开发基础' },
    'class_002': { courseId: 'course_001', courseName: '前端开发进阶' },
    'class_003': { courseId: 'course_002', courseName: '数据科学基础' }
  }
  
  const classNameMap = {
    'class_001': '前端开发一班',
    'class_002': '前端开发二班',
    'class_003': '数据科学班'
  }
  
  const courseInfo = courseMap[classId] || { courseId: 'course_001', courseName: '默认课程' }
  const className = classNameMap[classId] || '默认班级'
  
  return Array.from({ length: count }, (_, i) => ({
    id: `hw_${classId}_${i + 1}`,
    classId,
    className,
    courseId: courseInfo.courseId,
    courseName: courseInfo.courseName,
    title: `第${i + 1}章作业`,
    description: `完成第${i + 1}章基础知识的练习`,
    type: 'exercise',
    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
    schedule: {
      releaseTime: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString(),
      dueTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      remindTime: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString()
    },
    questions: [],
    totalScore: 50,
    totalStudents: 30,
    submitCount: Math.floor(Math.random() * 15) + 10,
    submitRate: 0,
    gradedCount: Math.floor(Math.random() * 10) + 5,
    pendingCount: 0,
    notSubmitCount: 0,
    settings: {
      autoGrade: true,
      aiGrade: true,
      manualReview: true
    },
    status: 'published',
    createdAt: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000).toISOString()
  }))
}

// 生成考试
export function generateExams(classId, count = 2) {
  const types = ['quiz', 'midterm', 'final']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `exam_${classId}_${i + 1}`,
    classId,
    title: i === 0 ? '期中考试' : '期末考试',
    description: `${i === 0 ? '期中' : '期末'}综合测试`,
    type: types[i + 1],
    difficulty: 'medium',
    schedule: {
      startTime: new Date(Date.now() - (5 - i * 2) * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - (5 - i * 2) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      duration: 120
    },
    questionBanks: [
      { type: 'single', selectedCount: 20 },
      { type: 'multiple', selectedCount: 10 },
      { type: 'essay', selectedCount: 2 }
    ],
    totalScore: 100,
    passingScore: 60,
    participantCount: 30,
    submittedCount: Math.floor(Math.random() * 10) + 20,
    averageScore: Math.floor(Math.random() * 20) + 70,
    status: i === 0 ? 'ended' : 'ongoing'
  }))
}

// 生成作业提交记录（使用正态分布生成成绩）
export function generateHomeworkSubmissions(homeworkId, studentIds, totalQuestions = 5) {
  return studentIds.map((studentId, index) => {
    const score = generateNormalDistributionScore(50)
    const answeredCount = Math.floor(Math.random() * totalQuestions) + 1
    return {
      id: `sub_${homeworkId}_${studentId}`,
      studentId,
      studentName: `学生${index + 1}`,
      homeworkId,
      submitTime: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      score,
      maxScore: 50,
      answeredCount,
      totalQuestions,
      status: Math.random() > 0.3 ? 'graded' : 'pending',
      answers: []
    }
  })
}

// 生成正态分布的成绩（均值75%，标准差15%）
function generateNormalDistributionScore(maxScore) {
  // Box-Muller 变换生成正态分布
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  
  // 均值75%，标准差15%
  const mean = 0.75
  const stdDev = 0.15
  const percentage = mean + z * stdDev
  
  // 限制在0-1之间
  const clampedPercentage = Math.max(0, Math.min(1, percentage))
  
  // 转换为实际分数并四舍五入
  return Math.round(clampedPercentage * maxScore)
}

// 生成学习记录
export function generateLearningRecords(studentId, count = 10) {
  const types = ['homework_submitted', 'exam_submitted']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `rec_${studentId}_${i + 1}`,
    studentId,
    type: types[Math.floor(Math.random() * types.length)],
    name: `${types[0] === 'homework_submitted' ? '作业' : '考试'}${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    score: Math.floor(Math.random() * 40) + 10,
    maxScore: 50
  }))
}

// 辅助函数
function getTypeLabel(type) {
  const map = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    essay: '问答',
    programming: '编程'
  }
  return map[type] || type
}

// 生成所有模拟数据
export function generateAllMockData() {
  const classes = generateClasses()
  const students = []
  const homeworks = []
  const exams = []
  const submissions = []

  // 为每个班级生成学生、作业、考试
  classes.forEach(cls => {
    const classStudents = generateStudents(cls.id, cls.studentCount)
    students.push(...classStudents)

    const classHomeworks = generateHomeworks(cls.id, 4)
    homeworks.push(...classHomeworks)

    const classExams = generateExams(cls.id, 2)
    exams.push(...classExams)

    // 为每个作业生成提交记录
    classHomeworks.forEach(hw => {
      const hwSubmissions = generateHomeworkSubmissions(
        hw.id,
        classStudents.slice(0, hw.submitCount).map(s => s.id)
      )
      submissions.push(...hwSubmissions)
    })
  })

  return {
    questionBanks: generateQuestionBanks(),
    questions: generateQuestions(100),
    classes,
    students,
    homeworks,
    exams,
    submissions,
    version: '1.0.0',
    generatedAt: new Date().toISOString()
  }
}

// Mock API
export const mockApi = {
  getCourseDetail(courseId) {
    return Promise.resolve({
      id: courseId,
      name: '示例课程',
      description: '这是一个示例课程',
      chapters: [
        {
          id: 'chapter_001',
          name: '第一章',
          description: '第一章内容',
          order: 1
        },
        {
          id: 'chapter_002',
          name: '第二章',
          description: '第二章内容',
          order: 2
        }
      ],
      createdAt: new Date().toISOString()
    })
  },
  
  getCourses() {
    return Promise.resolve({
      records: [
        { id: 'course_001', basicInfo: { title: 'JavaScript基础' } },
        { id: 'course_002', basicInfo: { title: 'Vue.js框架' } },
        { id: 'course_003', basicInfo: { title: 'React基础' } }
      ]
    })
  },
  
  getExamDetail(examId) {
    return Promise.resolve({
      id: examId,
      basicInfo: {
        title: 'JavaScript期中考试',
        description: 'JavaScript基础知识期中测试',
        type: 'midterm',
        difficulty: 'medium'
      },
      metadata: {
        version: '1.0',
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-15T15:30:00Z',
        createdBy: '张老师',
        courseId: 'course_001'
      },
      schedule: {
        startTime: '2024-12-15T10:00:00Z',
        endTime: '2024-12-15T11:30:00Z',
        duration: 90,
        reviewStartTime: '2024-12-15T12:00:00Z'
      },
      settings: {
        totalScore: 100,
        passingScore: 60,
        showScoreAfterSubmit: true,
        randomOrder: false,
        randomQuestions: false,
        questionsPerBank: 10,
        allowReview: true,
        reviewDelay: 0,
        proctorRequired: false,
        cameraRequired: false
      },
      grading: {
        autoGrade: true,
        manualReviewRequired: false,
        essayReviewers: ['张老师', '李老师'],
        gradingDeadline: '2024-12-20T23:59:59Z'
      },
      questionBanks: [
        {
          id: 'bank_001',
          name: '单选题库',
          type: 'single',
          questionCount: 10,
          questions: [
            {
              id: 'q1',
              type: 'single',
              questionText: '以下哪个不是JavaScript的数据类型？',
              score: 10,
              difficulty: 'easy',
              options: [
                { id: 'opt1', value: 'A', text: 'String', isCorrect: false },
                { id: 'opt2', value: 'B', text: 'Number', isCorrect: false },
                { id: 'opt3', value: 'C', text: 'Character', isCorrect: true },
                { id: 'opt4', value: 'D', text: 'Boolean', isCorrect: false }
              ],
              correctAnswer: 'C',
              explanation: 'JavaScript没有Character类型',
              knowledgePoints: ['数据类型', '基础语法']
            }
          ]
        },
        {
          id: 'bank_002',
          name: '多选题库',
          type: 'multiple',
          questionCount: 5,
          questions: []
        }
      ]
    })
  },

  // 获取OJ问题列表
  getOJProblems(params) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        records: generateMockOJProblems(),
        total: 5,
        size: parseInt(params.pageSize) || 10,
        current: parseInt(params.page) || 1,
        pages: 1
      }
    })
  }
}

// 导出ojProblems数据供页面使用
export const ojProblems = generateMockOJProblems()

// 生成模拟OJ问题数据
function generateMockOJProblems() {
  return [
    {
      id: 1,
      title: "两数之和",
      questionType: "oj",
      difficulty: "easy",
      category: "array",
      tags: ["数组", "哈希表", "LeetCode", "简单"],
      courseId: 2,
      questionText: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。",
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "第一行包含整数n和target，表示数组长度和目标值。\n第二行包含n个整数，表示数组元素。",
      outputFormat: "输出两个整数，表示满足条件的数组下标。",
      sampleInput: "4 9\n2 7 11 15",
      sampleOutput: "0 1",
      hint: "可以使用哈希表来优化时间复杂度。",
      acceptedCount: 1250,
      submissionCount: 2340,
      acceptanceRate: 53.4,
      createTime: "2024-12-01T10:00:00Z",
      courseName: "算法与数据结构"
    },
    {
      id: 2,
      title: "反转链表",
      questionType: "oj",
      difficulty: "medium",
      category: "linked-list",
      tags: ["链表", "递归", "LeetCode", "中等"],
      courseId: 2,
      questionText: "给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。",
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "第一行包含整数n，表示链表长度。\n第二行包含n个整数，表示链表节点的值。",
      outputFormat: "输出一行，包含n个整数，表示反转后的链表。",
      sampleInput: "5\n1 2 3 4 5",
      sampleOutput: "5 4 3 2 1",
      hint: "可以使用迭代或递归的方式解决。",
      acceptedCount: 890,
      submissionCount: 1560,
      acceptanceRate: 57.1,
      createTime: "2024-12-02T14:30:00Z",
      courseName: "算法与数据结构"
    },
    {
      id: 3,
      title: "二叉树的最大深度",
      questionType: "oj",
      difficulty: "easy",
      category: "tree",
      tags: ["树", "二叉树", "递归", "LeetCode", "简单"],
      courseId: 2,
      questionText: "给定一个二叉树，找出其最大深度。",
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "第一行包含整数n，表示节点个数。\n接下来n行，每行包含两个整数，表示节点的左右子节点。",
      outputFormat: "输出一个整数，表示二叉树的最大深度。",
      sampleInput: "7\n1 2 3\n2 4 5\n3 6 7\n4 0 0\n5 0 0\n6 0 0\n7 0 0",
      sampleOutput: "3",
      hint: "可以使用深度优先搜索(DFS)或广度优先搜索(BFS)。",
      acceptedCount: 780,
      submissionCount: 1250,
      acceptanceRate: 62.4,
      createTime: "2024-12-03T09:15:00Z",
      courseName: "算法与数据结构"
    },
    {
      id: 4,
      title: "最长递增子序列",
      questionType: "oj",
      difficulty: "hard",
      category: "dp",
      tags: ["动态规划", "数组", "LeetCode", "困难"],
      courseId: 2,
      questionText: "给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。",
      timeLimit: 2000,
      memoryLimit: 512,
      inputFormat: "第一行包含整数n，表示数组长度。\n第二行包含n个整数，表示数组元素。",
      outputFormat: "输出一个整数，表示最长严格递增子序列的长度。",
      sampleInput: "8\n10 9 2 5 3 7 101 18",
      sampleOutput: "4",
      hint: "可以使用动态规划或二分查找优化。",
      acceptedCount: 320,
      submissionCount: 890,
      acceptanceRate: 36.0,
      createTime: "2024-12-04T16:45:00Z",
      courseName: "算法与数据结构"
    },
    {
      id: 5,
      title: "实现最小栈",
      questionType: "oj",
      difficulty: "medium",
      category: "stack",
      tags: ["栈", "设计", "LeetCode", "中等"],
      courseId: 2,
      questionText: "设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。",
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: "第一行包含整数q，表示操作次数。\n接下来q行，每行表示一个操作。",
      outputFormat: "对于每个top和getMin操作，输出相应的结果。",
      sampleInput: "6\npush 1\npush 2\ngetMin\ntop\npop\ngetMin",
      sampleOutput: "1\n2\n1",
      hint: "可以使用辅助栈来记录最小值。",
      acceptedCount: 560,
      submissionCount: 980,
      acceptanceRate: 57.1,
      createTime: "2024-12-05T11:20:00Z",
      courseName: "算法与数据结构"
    }
  ]
}
