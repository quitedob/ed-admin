import type { ValidationRule, ValidationResult } from '../types'

export class Validator {
  /**
   * 验证数据
   */
  static validate(data: any, rules: Record<string, ValidationRule>): ValidationResult {
    const errors: any[] = []

    for (const field in rules) {
      const rule = rules[field]
      const value = this.getNestedValue(data, field)
      const fieldErrors = this.validateField(field, value, rule)
      errors.push(...fieldErrors)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证单个字段
   */
  static validateField(field: string, value: any, rule: ValidationRule): any[] {
    const errors: any[] = []

    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field}是必需的`,
        value
      })
      return errors // 如果必填验证失败，跳过其他验证
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
      return errors
    }

    // 类型验证
    if (rule.type && !this.validateType(value, rule.type)) {
      errors.push({
        field,
        message: `${field}必须是${rule.type}类型`,
        value
      })
    }

    // 最小值验证
    if (rule.min !== undefined && this.getNumberValue(value) < rule.min) {
      errors.push({
        field,
        message: `${field}不能小于${rule.min}`,
        value
      })
    }

    // 最大值验证
    if (rule.max !== undefined && this.getNumberValue(value) > rule.max) {
      errors.push({
        field,
        message: `${field}不能大于${rule.max}`,
        value
      })
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push({
        field,
        message: `${field}格式不正确`,
        value
      })
    }

    // 自定义验证
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        errors.push({
          field,
          message: typeof result === 'string' ? result : `${field}验证失败`,
          value
        })
      }
    }

    return errors
  }

  /**
   * 验证试卷配置
   */
  static validatePaperConfig(config: any): ValidationResult {
    const rules = {
      title: {
        required: true,
        type: 'string',
        min: 1,
        max: 100
      },
      type: {
        required: true,
        type: 'string',
        validator: (value: string) => ['homework', 'exam', 'exercise', 'quiz'].includes(value) || '试卷类型必须是homework、exam、exercise或quiz'
      },
      difficulty: {
        required: true,
        type: 'string',
        validator: (value: string) => ['easy', 'medium', 'hard', 'mixed'].includes(value) || '难度必须是easy、medium、hard或mixed'
      },
      totalScore: {
        required: true,
        type: 'number',
        min: 1,
        max: 1000
      },
      'questions.singleChoice.count': {
        type: 'number',
        min: 0,
        max: 100
      },
      'questions.singleChoice.score': {
        type: 'number',
        min: 1,
        max: 100
      },
      'questions.multipleChoice.count': {
        type: 'number',
        min: 0,
        max: 100
      },
      'questions.multipleChoice.score': {
        type: 'number',
        min: 1,
        max: 100
      },
      'questions.fillBlank.count': {
        type: 'number',
        min: 0,
        max: 100
      },
      'questions.fillBlank.score': {
        type: 'number',
        min: 1,
        max: 100
      },
      'questions.essay.count': {
        type: 'number',
        min: 0,
        max: 50
      },
      'questions.essay.score': {
        type: 'number',
        min: 1,
        max: 200
      }
    }

    return this.validate(config, rules)
  }

  /**
   * 验证题目数据
   */
  static validateQuestion(question: any): ValidationResult {
    const rules = {
      type: {
        required: true,
        type: 'string',
        validator: (value: string) => ['single', 'multiple', 'fill', 'essay'].includes(value) || '题目类型必须是single、multiple、fill或essay'
      },
      questionText: {
        required: true,
        type: 'string',
        min: 1,
        max: 2000
      },
      score: {
        required: true,
        type: 'number',
        min: 1,
        max: 100
      },
      difficulty: {
        type: 'string',
        validator: (value: string) => ['easy', 'medium', 'hard'].includes(value) || '难度必须是easy、medium或hard'
      },
      knowledgePoints: {
        type: 'array'
      }
    }

    const result = this.validate(question, rules)

    // 根据题目类型进行特定验证
    if (question.type === 'single') {
      this.validateSingleChoice(question, result)
    } else if (question.type === 'multiple') {
      this.validateMultipleChoice(question, result)
    } else if (question.type === 'fill') {
      this.validateFillBlank(question, result)
    }

    return result
  }

  /**
   * 验证单选题
   */
  private static validateSingleChoice(question: any, result: ValidationResult): void {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      result.errors.push({
        field: 'options',
        message: '单选题至少需要2个选项',
        value: question.options
      })
    } else {
      question.options.forEach((option: any, index: number) => {
        if (!option.text || typeof option.text !== 'string') {
          result.errors.push({
            field: `options[${index}].text`,
            message: '选项内容是必需的',
            value: option.text
          })
        }
      })

      if (!question.correctAnswer) {
        result.errors.push({
          field: 'correctAnswer',
          message: '正确答案是必需的',
          value: question.correctAnswer
        })
      }
    }
  }

  /**
   * 验证多选题
   */
  private static validateMultipleChoice(question: any, result: ValidationResult): void {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      result.errors.push({
        field: 'options',
        message: '多选题至少需要2个选项',
        value: question.options
      })
    }

    if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
      result.errors.push({
        field: 'correctAnswers',
        message: '多选题必须至少有一个正确答案',
        value: question.correctAnswers
      })
    }
  }

  /**
   * 验证填空题
   */
  private static validateFillBlank(question: any, result: ValidationResult): void {
    if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length === 0) {
      result.errors.push({
        field: 'correctAnswers',
        message: '填空题必须有正确答案',
        value: question.correctAnswers
      })
    }
  }

  /**
   * 验证文件格式
   */
  static validateFile(file: File, allowedTypes: string[] = [], maxSize: number = 50 * 1024 * 1024): ValidationResult {
    const errors: any[] = []

    // 文件类型验证
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push({
        field: 'type',
        message: `文件类型必须是${allowedTypes.join('、')}中的一种`,
        value: file.type
      })
    }

    // 文件大小验证
    if (file.size > maxSize) {
      errors.push({
        field: 'size',
        message: `文件大小不能超过${this.formatFileSize(maxSize)}`,
        value: file.size
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

  /**
   * 验证手机号格式
   */
  static validatePhone(phone: string): boolean {
    const phonePattern = /^1[3-9]\d{9}$/
    return phonePattern.test(phone)
  }

  /**
   * 验证URL格式
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证日期格式
   */
  static validateDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * 验证时间范围
   */
  static validateDateRange(startDate: string, endDate: string): ValidationResult {
    const errors: any[] = []

    if (!this.validateDate(startDate)) {
      errors.push({
        field: 'startDate',
        message: '开始日期格式无效',
        value: startDate
      })
    }

    if (!this.validateDate(endDate)) {
      errors.push({
        field: 'endDate',
        message: '结束日期格式无效',
        value: endDate
      })
    }

    if (this.validateDate(startDate) && this.validateDate(endDate)) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        errors.push({
          field: 'dateRange',
          message: '开始日期必须早于结束日期',
          value: { startDate, endDate }
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 工具方法：获取嵌套属性值
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * 工具方法：验证类型
   */
  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      default:
        return true
    }
  }

  /**
   * 工具方法：获取数值
   */
  private static getNumberValue(value: any): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    if (Array.isArray(value)) return value.length
    if (typeof value === 'object') return Object.keys(value).length
    return 0
  }

  /**
   * 工具方法：格式化文件大小
   */
  private static formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  /**
   * 创建验证器工厂
   */
  static createValidator(rules: Record<string, ValidationRule>) {
    return (data: any) => this.validate(data, rules)
  }

  /**
   * 常用验证规则
   */
  static commonRules = {
    required: { required: true } as ValidationRule,
    email: {
      type: 'string' as const,
      validator: (value: string) => this.validateEmail(value) || '邮箱格式不正确'
    } as ValidationRule,
    phone: {
      type: 'string' as const,
      validator: (value: string) => this.validatePhone(value) || '手机号格式不正确'
    } as ValidationRule,
    url: {
      type: 'string' as const,
      validator: (value: string) => this.validateUrl(value) || 'URL格式不正确'
    } as ValidationRule,
    date: {
      type: 'string' as const,
      validator: (value: string) => this.validateDate(value) || '日期格式不正确'
    } as ValidationRule,
    positiveNumber: {
      type: 'number' as const,
      min: 1
    } as ValidationRule,
    nonNegativeNumber: {
      type: 'number' as const,
      min: 0
    } as ValidationRule,
    percentage: {
      type: 'number' as const,
      min: 0,
      max: 100
    } as ValidationRule
  }
}