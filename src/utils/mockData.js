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
