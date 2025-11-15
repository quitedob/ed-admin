// 试卷/作业基础类型定义

export interface QuestionOption {
  id: string
  value: string
  text: string
}

export interface QuestionBase {
  id: string
  type: QuestionType
  questionText: string
  score: number
  difficulty: DifficultyLevel
  order: number
  knowledgePoints: string[]
  explanation?: string
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single'
  options: QuestionOption[]
  correctAnswer: string
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple'
  options: QuestionOption[]
  correctAnswers: string[]
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill'
  correctAnswers: string[]
}

export interface EssayQuestion extends QuestionBase {
  type: 'essay'
  referenceAnswer?: string
}

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | FillBlankQuestion | EssayQuestion
export type QuestionType = 'single' | 'multiple' | 'fill' | 'essay'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// 作业类型定义
export interface Homework {
  id: string
  type: 'homework'
  metadata: Metadata
  basicInfo: BasicInfo
  schedule: Schedule
  questions: Question[]
  settings: HomeworkSettings
  statistics?: Statistics
}

// 考试类型定义
export interface Exam {
  id: string
  type: 'exam'
  metadata: Metadata
  basicInfo: BasicInfo
  schedule: ExamSchedule
  settings: ExamSettings
  questionBanks: QuestionBank[]
  grading?: Grading
}

// 通用类型定义
export interface Metadata {
  version: string
  createdAt: string
  updatedAt: string
  createdBy: string
  courseId: string
}

export interface BasicInfo {
  title: string
  description: string
  type: string
  difficulty: DifficultyLevel
}

export interface Schedule {
  releaseDate: string
  dueDate: string
  remindDate?: string
}

export interface ExamSchedule extends Schedule {
  startTime: string
  endTime: string
  duration: number
  reviewStartTime?: string
}

export interface HomeworkSettings {
  allowLateSubmission: boolean
  latePenalty: number
  randomOrder: boolean
  immediateGrading: boolean
  showCorrectAnswers: boolean
  reviewAfterSubmit: boolean
}

export interface ExamSettings {
  totalScore: number
  passingScore: number
  showScoreAfterSubmit: boolean
  randomOrder: boolean
  randomQuestions: boolean
  questionsPerBank: number
  allowReview: boolean
  reviewDelay: number
  proctorRequired: boolean
  cameraRequired: boolean
}

export interface QuestionBank {
  id: string
  name: string
  type: QuestionType
  questionCount: number
  scorePerQuestion: number
  totalQuestionsNeeded: number
  questions: Question[]
}

export interface Grading {
  autoGrade: boolean
  manualReviewRequired: boolean
  essayReviewers: string[]
  gradingDeadline: string
}

export interface Statistics {
  totalQuestions: number
  totalScore: number
  submissionCount: number
  averageScore: number
  completionRate: number
}

// 生成配置类型
export interface GenerateConfig {
  title: string
  type: 'homework' | 'exam' | 'exercise' | 'quiz'
  difficulty: DifficultyLevel
  totalScore: number
  description?: string
  questions: {
    singleChoice: { count: number; score: number }
    multipleChoice: { count: number; score: number }
    fillBlank: { count: number; score: number }
    essay: { count: number; score: number }
  }
  knowledgePoints: {
    main: string[]
    secondary: string[]
  }
  knowledgeWeights: Record<string, number>
  advanced: {
    randomOrder: boolean
    showAnswers: boolean
    enableTimeLimit: boolean
    timeLimit: number
    passingScore: number
    gradingRule: 'standard' | 'partial' | 'strict'
    options: string[]
  }
}

// 分析结果类型
export interface ErrorAnalysisResult {
  totalErrors: number
  totalStudents: number
  knowledgePoints: KnowledgePointAnalysis[]
  errors: ErrorQuestion[]
}

export interface KnowledgePointAnalysis {
  name: string
  errorRate: number
  errorCount: number
  totalCount: number
}

export interface ErrorQuestion {
  type: QuestionType
  questionText: string
  errorRate: number
  difficulty: DifficultyLevel
  options?: QuestionOption[]
  correctAnswer?: string
  correctAnswers?: string[]
  analysis: string
}

// 上传配置类型
export interface UploadConfig {
  type: 'homework' | 'exam'
  difficulty: DifficultyLevel
  singleChoice: number
  multipleChoice: number
  fillBlank: number
  essay: number
  totalScore: number
  generateCount: number
  knowledgePoints: string[]
  advanced: string[]
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 文件类型定义
export interface UploadedFile {
  uid: string
  name: string
  size: number
  type: string
  lastModified: number
}

// 历史记录类型
export interface HistoryItem {
  id: string | number
  title: string
  type: string
  createdAt: string
  config?: any
}

// 模板类型
export interface Template {
  id: string
  name: string
  description: string
  config: GenerateConfig
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// 验证规则类型
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}

// 验证结果类型
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  value: any
}

// 导出配置类型
export interface ExportConfig {
  format: 'json' | 'pdf' | 'word'
  includeAnswers: boolean
  includeAnalysis: boolean
  template?: string
}

// 系统设置类型
export interface SystemSettings {
  defaultDifficulty: DifficultyLevel
  defaultTimeLimit: number
  autoSave: boolean
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  language: string
}

// 用户偏好类型
export interface UserPreferences {
  recentTemplates: string[]
  defaultKnowledgePoints: string[]
  favoriteQuestions: string[]
  customSettings: Record<string, any>
}