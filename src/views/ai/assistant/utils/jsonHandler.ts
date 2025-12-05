import type {
  Homework,
  Exam,
  Question,
  GenerateConfig,
  UploadConfig,
  ValidationResult,
  ValidationError
} from '../types'

export class JsonHandler {
  /**
   * 验证作业格式
   */
  static validateHomework(data: any): ValidationResult {
    const errors: ValidationError[] = []

    // 基础字段验证
    if (!data.id || typeof data.id !== 'string') {
      errors.push({ field: 'id', message: 'ID是必需的且必须是字符串', value: data.id })
    }

    if (data.type !== 'homework') {
      errors.push({ field: 'type', message: '类型必须是homework', value: data.type })
    }

    // 元数据验证
    if (!data.metadata) {
      errors.push({ field: 'metadata', message: '元数据是必需的', value: data.metadata })
    } else {
      if (!data.metadata.version || typeof data.metadata.version !== 'string') {
        errors.push({ field: 'metadata.version', message: '版本号是必需的', value: data.metadata.version })
      }
      if (!data.metadata.createdAt || !this.isValidDateString(data.metadata.createdAt)) {
        errors.push({ field: 'metadata.createdAt', message: '创建时间格式无效', value: data.metadata.createdAt })
      }
    }

    // 基础信息验证
    if (!data.basicInfo || !data.basicInfo.title) {
      errors.push({ field: 'basicInfo.title', message: '标题是必需的', value: data.basicInfo?.title })
    }

    // 题目验证
    if (!Array.isArray(data.questions)) {
      errors.push({ field: 'questions', message: '题目必须是数组', value: data.questions })
    } else {
      data.questions.forEach((question: any, index: number) => {
        const questionErrors = this.validateQuestion(question)
        questionErrors.forEach(error => {
          errors.push({
            field: `questions[${index}].${error.field}`,
            message: error.message,
            value: error.value
          })
        })
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证考试格式
   */
  static validateExam(data: any): ValidationResult {
    const errors: ValidationError[] = []

    // 基础字段验证
    if (!data.id || typeof data.id !== 'string') {
      errors.push({ field: 'id', message: 'ID是必需的且必须是字符串', value: data.id })
    }

    if (data.type !== 'exam') {
      errors.push({ field: 'type', message: '类型必须是exam', value: data.type })
    }

    // 考试设置验证
    if (!data.settings) {
      errors.push({ field: 'settings', message: '考试设置是必需的', value: data.settings })
    } else {
      if (typeof data.settings.totalScore !== 'number' || data.settings.totalScore <= 0) {
        errors.push({ field: 'settings.totalScore', message: '总分必须是正数', value: data.settings.totalScore })
      }
      if (typeof data.settings.passingScore !== 'number' || data.settings.passingScore < 0) {
        errors.push({ field: 'settings.passingScore', message: '及格分数不能为负数', value: data.settings.passingScore })
      }
    }

    // 题库验证
    if (!Array.isArray(data.questionBanks)) {
      errors.push({ field: 'questionBanks', message: '题库必须是数组', value: data.questionBanks })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证题目格式
   */
  static validateQuestion(question: any): ValidationError[] {
    const errors: ValidationError[] = []

    // 基础字段验证
    if (!question.id || typeof question.id !== 'string') {
      errors.push({ field: 'id', message: '题目ID是必需的', value: question.id })
    }

    if (!['single', 'multiple', 'fill', 'essay'].includes(question.type)) {
      errors.push({ field: 'type', message: '题目类型无效', value: question.type })
    }

    if (!question.questionText || typeof question.questionText !== 'string') {
      errors.push({ field: 'questionText', message: '题目内容是必需的', value: question.questionText })
    }

    if (typeof question.score !== 'number' || question.score <= 0) {
      errors.push({ field: 'score', message: '分数必须是正数', value: question.score })
    }

    // 根据题目类型进行特定验证
    switch (question.type) {
      case 'single':
        this.validateSingleChoice(question, errors)
        break
      case 'multiple':
        this.validateMultipleChoice(question, errors)
        break
      case 'fill':
        this.validateFillBlank(question, errors)
        break
      case 'essay':
        this.validateEssay(question, errors)
        break
    }

    return errors
  }

  /**
   * 验证单选题
   */
  private static validateSingleChoice(question: any, errors: ValidationError[]): void {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push({ field: 'options', message: '单选题至少需要2个选项', value: question.options })
    } else {
      question.options.forEach((option: any, index: number) => {
        if (!option.text || typeof option.text !== 'string') {
          errors.push({
            field: `options[${index}].text`,
            message: '选项内容是必需的',
            value: option.text
          })
        }
      })

      if (!question.correctAnswer) {
        errors.push({ field: 'correctAnswer', message: '正确答案是必需的', value: question.correctAnswer })
      }
    }
  }

  /**
   * 验证多选题
   */
  private static validateMultipleChoice(question: any, errors: ValidationError[]): void {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push({ field: 'options', message: '多选题至少需要2个选项', value: question.options })
    }

    if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
      errors.push({ field: 'correctAnswers', message: '多选题必须至少有一个正确答案', value: question.correctAnswers })
    }
  }

  /**
   * 验证填空题
   */
  private static validateFillBlank(question: any, errors: ValidationError[]): void {
    if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
      errors.push({ field: 'correctAnswers', message: '填空题必须有正确答案', value: question.correctAnswers })
    }
  }

  /**
   * 验证问答题
   */
  private static validateEssay(question: any, errors: ValidationError[]): void {
    // 问答题的验证相对宽松，主要验证基础字段
  }

  /**
   * 生成作业JSON
   */
  static generateHomework(config: GenerateConfig): Homework {
    const questions = this.generateQuestions(config)

    return {
      id: this.generateId(),
      type: 'homework',
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        courseId: 'default'
      },
      basicInfo: {
        title: config.title,
        description: config.description || '',
        type: 'exercise',
        difficulty: config.difficulty
      },
      schedule: {
        releaseDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        remindDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      questions,
      settings: {
        allowLateSubmission: true,
        latePenalty: 5,
        randomOrder: config.advanced.randomOrder,
        immediateGrading: true,
        showCorrectAnswers: config.advanced.showAnswers,
        reviewAfterSubmit: true
      },
      statistics: {
        totalQuestions: questions.length,
        totalScore: config.totalScore,
        submissionCount: 0,
        averageScore: 0,
        completionRate: 0
      }
    }
  }

  /**
   * 生成考试JSON
   */
  static generateExam(config: GenerateConfig): Exam {
    const questions = this.generateQuestions(config)

    return {
      id: this.generateId(),
      type: 'exam',
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        courseId: 'default'
      },
      basicInfo: {
        title: config.title,
        description: config.description || '',
        type: 'midterm',
        difficulty: config.difficulty
      },
      schedule: {
        releaseDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        remindDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 60
      },
      settings: {
        totalScore: config.totalScore,
        passingScore: config.advanced.passingScore,
        showScoreAfterSubmit: true,
        randomOrder: config.advanced.randomOrder,
        randomQuestions: true,
        questionsPerBank: 50,
        allowReview: true,
        reviewDelay: 86400,
        proctorRequired: false,
        cameraRequired: false
      },
      questionBanks: this.createQuestionBanks(questions, config),
      grading: {
        autoGrade: true,
        manualReviewRequired: true,
        essayReviewers: ['system'],
        gradingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }

  /**
   * 生成题目数组
   */
  private static generateQuestions(config: GenerateConfig): Question[] {
    const questions: Question[] = []
    let order = 1

    // 生成单选题
    for (let i = 0; i < config.questions.singleChoice.count; i++) {
      questions.push(this.generateSingleChoiceQuestion(config, order++))
    }

    // 生成多选题
    for (let i = 0; i < config.questions.multipleChoice.count; i++) {
      questions.push(this.generateMultipleChoiceQuestion(config, order++))
    }

    // 生成填空题
    for (let i = 0; i < config.questions.fillBlank.count; i++) {
      questions.push(this.generateFillBlankQuestion(config, order++))
    }

    // 生成问答题
    for (let i = 0; i < config.questions.essay.count; i++) {
      questions.push(this.generateEssayQuestion(config, order++))
    }

    // 如果需要随机排序
    if (config.advanced.randomOrder) {
      return this.shuffleArray(questions)
    }

    return questions
  }

  /**
   * 生成单选题
   */
  private static generateSingleChoiceQuestion(config: GenerateConfig, order: number): Question {
    const options = ['A', 'B', 'C', 'D']
    const correctAnswer = options[Math.floor(Math.random() * options.length)]

    return {
      id: this.generateId(),
      type: 'single',
      questionText: `单选题 ${order}：这是一个示例单选题`,
      score: config.questions.singleChoice.score,
      difficulty: config.difficulty,
      order,
      knowledgePoints: config.knowledgePoints.main,
      options: options.map(value => ({
        id: `opt_${value.toLowerCase()}`,
        value,
        text: `选项${value}的内容`
      })),
      correctAnswer,
      explanation: '这是题目解析'
    }
  }

  /**
   * 生成多选题
   */
  private static generateMultipleChoiceQuestion(config: GenerateConfig, order: number): Question {
    const options = ['A', 'B', 'C', 'D']
    const correctCount = Math.floor(Math.random() * 2) + 2 // 2-3个正确答案
    const correctAnswers = this.shuffleArray([...options]).slice(0, correctCount)

    return {
      id: this.generateId(),
      type: 'multiple',
      questionText: `多选题 ${order}：这是一个示例多选题`,
      score: config.questions.multipleChoice.score,
      difficulty: config.difficulty,
      order,
      knowledgePoints: config.knowledgePoints.main,
      options: options.map(value => ({
        id: `opt_${value.toLowerCase()}`,
        value,
        text: `选项${value}的内容`
      })),
      correctAnswers,
      explanation: '这是题目解析'
    }
  }

  /**
   * 生成填空题
   */
  private static generateFillBlankQuestion(config: GenerateConfig, order: number): Question {
    return {
      id: this.generateId(),
      type: 'fill',
      questionText: `填空题 ${order}：请填写正确的答案___`,
      score: config.questions.fillBlank.score,
      difficulty: config.difficulty,
      order,
      knowledgePoints: config.knowledgePoints.main,
      correctAnswers: ['答案'],
      explanation: '这是题目解析'
    }
  }

  /**
   * 生成问答题
   */
  private static generateEssayQuestion(config: GenerateConfig, order: number): Question {
    return {
      id: this.generateId(),
      type: 'essay',
      questionText: `问答题 ${order}：请详细回答以下问题...`,
      score: config.questions.essay.score,
      difficulty: config.difficulty,
      order,
      knowledgePoints: config.knowledgePoints.main,
      referenceAnswer: '这是一个参考答案',
      explanation: '这是题目解析'
    }
  }

  /**
   * 创建题库
   */
  private static createQuestionBanks(questions: Question[], config: GenerateConfig) {
    const banks = []

    // 按题型分组
    const groupedQuestions = {
      single: questions.filter(q => q.type === 'single'),
      multiple: questions.filter(q => q.type === 'multiple'),
      fill: questions.filter(q => q.type === 'fill'),
      essay: questions.filter(q => q.type === 'essay')
    }

    const bankConfigs = [
      { type: 'single', name: '单选题库', scorePerQuestion: config.questions.singleChoice.score },
      { type: 'multiple', name: '多选题库', scorePerQuestion: config.questions.multipleChoice.score },
      { type: 'fill', name: '填空题库', scorePerQuestion: config.questions.fillBlank.score },
      { type: 'essay', name: '问答题库', scorePerQuestion: config.questions.essay.score }
    ]

    bankConfigs.forEach((bankConfig) => {
      const typeQuestions = groupedQuestions[bankConfig.type as keyof typeof groupedQuestions]
      if (typeQuestions.length > 0) {
        banks.push({
          id: this.generateId(),
          name: bankConfig.name,
          type: bankConfig.type as any,
          questionCount: typeQuestions.length,
          scorePerQuestion: bankConfig.scorePerQuestion,
          totalQuestionsNeeded: typeQuestions.length,
          questions: typeQuestions
        })
      }
    })

    return banks
  }

  /**
   * 格式化JSON
   */
  static formatJson(data: any): string {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      throw new Error('JSON格式化失败: ' + error.message)
    }
  }

  /**
   * 压缩JSON
   */
  static minifyJson(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (error) {
      throw new Error('JSON压缩失败: ' + error.message)
    }
  }

  /**
   * 解析JSON
   */
  static parseJson(jsonString: string): any {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('JSON解析失败: ' + error.message)
    }
  }

  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  /**
   * 合并对象
   */
  static mergeDeep<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target
    const source = sources.shift()

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          this.mergeDeep(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }

    return this.mergeDeep(target, ...sources)
  }

  /**
   * 工具方法：生成ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 工具方法：验证日期字符串
   */
  private static isValidDateString(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * 工具方法：打乱数组
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  /**
   * 工具方法：检查是否为对象
   */
  private static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item)
  }
}