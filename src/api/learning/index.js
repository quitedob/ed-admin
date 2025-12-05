import { deleteRequest, getRequest, postRequest, putRequest } from '@/utils/request'

export const learningApi = {
  // 学习记录相关API
  // 获取学习记录列表
  getLearningRecords: (params) => {
    return postRequest('/learning/admin/records/list', params)
  },

  // 获取学生学习详情
  getStudentLearningDetail: (studentId, params) => {
    return postRequest(`/learning/admin/records/student-detail?studentId=${studentId}`, params)
  },

  // 获取视频观看记录
  getVideoWatchRecords: (params) => {
    return postRequest('/learning/admin/records/video-watch', params)
  },

  // 获取练习完成记录
  getPracticeRecords: (params) => {
    return postRequest('/learning/admin/records/practice', params)
  },

  // 获取AI助教使用记录
  getAiUsageRecords: (params) => {
    return postRequest('/learning/admin/records/ai-usage', params)
  },

  // 获取作品提交记录
  getWorkSubmissionRecords: (params) => {
    return postRequest('/learning/admin/records/work-submission', params)
  },

  // 获取学习时长统计
  getStudyTimeStats: (studentId, period) => {
    return getRequest(`/learning/admin/records/study-time?studentId=${studentId}&period=${period}`)
  },

  // 获取学习进度
  getLearningProgress: (studentId, courseId) => {
    return getRequest(`/learning/admin/records/progress?studentId=${studentId}&courseId=${courseId}`)
  },

  // 个人报告相关API
  // 生成个人学习报告
  generatePersonalReport: (studentId, params) => {
    return postRequest(`/learning/admin/report/generate?studentId=${studentId}`, params)
  },

  // 获取个人报告数据
  getPersonalReportData: (studentId, reportType) => {
    return getRequest(`/learning/admin/report/data?studentId=${studentId}&reportType=${reportType}`)
  },

  // 获取成绩统计
  getGradeStatistics: (studentId, params) => {
    return postRequest(`/learning/admin/report/grade-stats?studentId=${studentId}`, params)
  },

  // 获取课程参与度
  getCourseParticipation: (studentId, courseId) => {
    return getRequest(`/learning/admin/report/participation?studentId=${studentId}&courseId=${courseId}`)
  },

  // 获取练习表现
  getPracticePerformance: (studentId, params) => {
    return postRequest(`/learning/admin/report/practice-performance?studentId=${studentId}`, params)
  },

  // 获取知识点掌握情况
  getKnowledgeMastery: (studentId, subject) => {
    return getRequest(`/learning/admin/report/knowledge-mastery?studentId=${studentId}&subject=${subject}`)
  },

  // 获取能力雷达图数据
  getCapabilityRadarData: (studentId) => {
    return getRequest(`/learning/admin/report/capability-radar?studentId=${studentId}`)
  },

  // 获取学习轨迹图表
  getLearningTrajectory: (studentId, period) => {
    return getRequest(`/learning/admin/report/learning-trajectory?studentId=${studentId}&period=${period}`)
  },

  // 获取AI使用分析
  getAiUsageAnalysis: (studentId, period) => {
    return getRequest(`/learning/admin/report/ai-usage?studentId=${studentId}&period=${period}`)
  },

  // 获取发展趋势
  getDevelopmentTrend: (studentId, metric) => {
    return getRequest(`/learning/admin/report/development-trend?studentId=${studentId}&metric=${metric}`)
  },

  // AI评语与建议
  // 生成AI评语
  generateAiCommentary: (studentId, reportData) => {
    return postRequest('/learning/admin/ai/generate-commentary', { studentId, reportData })
  },

  // 获取个性化学习建议
  getPersonalizedSuggestions: (studentId) => {
    return getRequest(`/learning/admin/ai/suggestions?studentId=${studentId}`)
  },

  // 保存AI评语
  saveAiCommentary: (data) => {
    return postRequest('/learning/admin/ai/save-commentary', data)
  },

  // 教师修改评语
  editCommentary: (data) => {
    return putRequest('/learning/admin/ai/edit-commentary', data)
  },

  // 获取评语历史
  getCommentaryHistory: (studentId) => {
    return getRequest(`/learning/admin/ai/commentary-history?studentId=${studentId}`)
  },

  // 报告管理
  // 保存报告模板
  saveReportTemplate: (data) => {
    return postRequest('/learning/admin/report/save-template', data)
  },

  // 获取报告模板列表
  getReportTemplates: () => {
    return getRequest('/learning/admin/report/templates')
  },

  // 应用报告模板
  applyReportTemplate: (templateId, studentId) => {
    return postRequest('/learning/admin/report/apply-template', { templateId, studentId })
  },

  // 导出报告
  exportReport: (reportId, format) => {
    return getRequest(`/learning/admin/report/export?reportId=${reportId}&format=${format}`)
  },

  // 分享报告
  shareReport: (reportId, shareOptions) => {
    return postRequest('/learning/admin/report/share', { reportId, shareOptions })
  },

  // 批量生成报告
  batchGenerateReports: (studentIds, reportType) => {
    return postRequest('/learning/admin/report/batch-generate', { studentIds, reportType })
  },

  // 数据统计API
  // 获取班级学习统计
  getClassLearningStats: (classId, period) => {
    return getRequest(`/learning/admin/stats/class-learning?classId=${classId}&period=${period}`)
  },

  // 获取课程统计
  getCourseStats: (courseId) => {
    return getRequest(`/learning/admin/stats/course?courseId=${courseId}`)
  },

  // 获取学习活跃度排行
  getActivityRanking: (classId, period) => {
    return getRequest(`/learning/admin/stats/activity-ranking?classId=${classId}&period=${period}`)
  },

  // 获取进步幅度排行
  getProgressRanking: (classId, period) => {
    return getRequest(`/learning/admin/stats/progress-ranking?classId=${classId}&period=${period}`)
  },

  // 获取学习效果分析
  getLearningEffectiveness: (params) => {
    return postRequest('/learning/admin/stats/effectiveness', params)
  },

  // 获取学习行为分析
  getLearningBehavior: (studentId, period) => {
    return getRequest(`/learning/admin/stats/learning-behavior?studentId=${studentId}&period=${period}`)
  },

  // 实时数据API
  // 获取实时在线学生
  getOnlineStudents: () => {
    return getRequest('/learning/admin/realtime/online-students')
  },

  // 获取当前学习活动
  getCurrentLearningActivities: (classId) => {
    return getRequest(`/learning/admin/realtime/activities?classId=${classId}`)
  },

  // 获取今日学习数据
  getTodayLearningData: (studentId) => {
    return getRequest(`/learning/admin/realtime/today-data?studentId=${studentId}`)
  },

  // 数据对比API
  // 获取同期对比数据
  getPeriodComparison: (studentId, currentPeriod, previousPeriod) => {
    return getRequest(`/learning/admin/analysis/period-comparison?studentId=${studentId}&current=${currentPeriod}&previous=${previousPeriod}`)
  },

  // 获取同学对比数据
  getPeerComparison: (studentId, classId) => {
    return getRequest(`/learning/admin/analysis/peer-comparison?studentId=${studentId}&classId=${classId}`)
  },

  // 获取目标达成情况
  getGoalAchievement: (studentId, goalType) => {
    return getRequest(`/learning/admin/analysis/goal-achievement?studentId=${studentId}&goalType=${goalType}`)
  }
}