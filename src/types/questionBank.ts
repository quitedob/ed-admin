// 题库相关类型定义

export interface Question {
  id: string
  title: string
  content?: string
  questionText?: string
  type: QuestionType
  difficulty: Difficulty
  score: number
  subject: Subject
  tags: string[]
  options?: QuestionOption[]
  correctAnswer?: string | boolean | number
  correctAnswers?: string[]
  explanation?: string
  hint?: string
  problemId?: string
  timeLimit?: number
  memoryLimit?: number
  useCount: number
  studentCount?: number
  correctRate?: number
  avgTime?: number
  createTime: string
  updateTime: string
  lastUsed?: string
  source?: 'manual' | 'ai' | 'import'
  videos?: Video[]
  status?: 'active' | 'inactive' | 'draft'
}

export interface QuestionOption {
  value: string
  text: string
  isCorrect?: boolean
}

export type QuestionType = 'single' | 'multiple' | 'fill' | 'judge' | 'programming' | 'essay'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Subject = 'cs' | 'math' | 'physics' | 'chemistry' | 'english' | 'other'

export interface Video {
  id: string
  title: string
  url: string
  type: 'local' | 'external'
  platform?: string
  description?: string
  duration?: string
  size?: number
  uploadTime: string
  thumbnail?: string
}

export interface Tag {
  id: string
  name: string
  category: string
  color: string
  description?: string
  usageCount: number
  isSystem: boolean
  createTime: string
  updateTime: string
  parentId?: string
  children?: Tag[]
}

export interface TagCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  tagCount: number
  children?: TagCategory[]
}

export interface QuestionStats {
  totalQuestions: number
  questionsGrowth: number
  totalUsage: number
  usageGrowth: number
  avgAccuracy: number
  accuracyTrend: number
  aiGenerated: number
  aiGrowth: number
}

export interface AnalyticsData {
  typeDistribution: {
    name: string
    value: number
  }[]
  difficultyDistribution: {
    name: string
    value: number
  }[]
  usageTrends: {
    date: string
    count: number
  }[]
  subjectDistribution: {
    name: string
    value: number
  }[]
  tagHeatmap: {
    name: string
    count: number
  }[]
}

export interface QuestionUsage {
  id: string
  type: string
  title: string
  className: string
  useTime: string
  result?: string
  score?: number
  timeSpent?: number
}

export interface AIGeneratedQuestion {
  content: string
  type: QuestionType
  difficulty: Difficulty
  options?: QuestionOption[]
  correctAnswer?: string | boolean
  explanation: string
  tags: string[]
  subject?: Subject
}

export interface ImportResult {
  total: number
  success: number
  failed: number
  errors: {
    row: number
    error: string
  }[]
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'json'
  includeAnswers: boolean
  includeAnalytics: boolean
  dateRange?: {
    start: string
    end: string
  }
  filters?: {
    types?: QuestionType[]
    difficulties?: Difficulty[]
    subjects?: Subject[]
    tags?: string[]
  }
}

export interface SearchParams {
  keyword?: string
  type?: QuestionType
  difficulty?: Difficulty
  subject?: Subject
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'createTime' | 'updateTime' | 'useCount' | 'difficulty'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface QuestionFilter {
  type?: QuestionType
  difficulty?: Difficulty
  subject?: Subject
  tags?: string[]
  dateRange?: [string, string]
}

export interface BulkOperation {
  type: 'delete' | 'update' | 'export' | 'addTags' | 'removeTags'
  questionIds: string[]
  data?: any
}

export interface QuestionVersion {
  id: string
  version: string
  questionId: string
  changes: string
  createdAt: string
  createdBy: string
  isActive: boolean
}

export interface APIResponse<T = any> {
  code: number
  message?: string
  data: T
  total?: number
  page?: number
  limit?: number
}

export interface ErrorResponse {
  code: number
  message: string
  details?: any
  timestamp: string
  path: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validator?: (value: any) => boolean | string
}

export interface QuestionForm {
  title: string
  content: string
  type: QuestionType
  difficulty: Difficulty
  score: number
  subject: Subject
  tags: string[]
  options: QuestionOption[]
  correctAnswer?: string | boolean
  correctAnswers?: string[]
  explanation: string
  hint: string
  problemId?: string
  timeLimit?: number
  memoryLimit?: number
}

// 组件Props类型定义
export interface QuestionCardProps {
  question: Question
  showActions?: boolean
  compact?: boolean
  onClick?: (question: Question) => void
}

export interface QuestionViewerProps {
  modelValue: boolean
  question: Question | null
  showAiSolution?: boolean
  showVideos?: boolean
}

export interface TagManagerProps {
  modelValue: boolean
  selectedTags?: string[]
  maxSelection?: number
}

export interface VideoManagerProps {
  modelValue: boolean
  questionId?: string
  videos?: Video[]
  multiple?: boolean
}

export interface AIHelperProps {
  modelValue: boolean
  currentQuestion?: Question | null
  context?: 'create' | 'edit' | 'optimize'
}

// 事件类型定义
export interface QuestionEvents {
  'question-created': Question
  'question-updated': Question
  'question-deleted': string
  'questions-selected': Question[]
  'filter-changed': QuestionFilter
}

// 表单验证规则
export interface FormRules {
  title: ValidationRule
  content: ValidationRule
  type: ValidationRule
  difficulty: ValidationRule
  score: ValidationRule
  subject: ValidationRule
  tags: ValidationRule
}

// 键盘快捷键类型
export interface KeyboardShortcut {
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: () => void
  description: string
  global?: boolean
}

// 无障碍相关类型
export interface AriaAttributes {
  label?: string
  labelledby?: string
  describedby?: string
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  busy?: boolean
  live?: 'polite' | 'assertive' | 'off'
}

// 主题相关类型
export interface ThemeConfig {
  primaryColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  borderRadius: string
  fontSize: string
}

// 用户配置类型
export interface UserPreferences {
  defaultView: 'card' | 'table'
  itemsPerPage: number
  autoSave: boolean
  showHints: boolean
  compactMode: boolean
  keyboardNavigation: boolean
  theme: 'light' | 'dark' | 'auto'
}