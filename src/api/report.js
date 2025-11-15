import request from '@/utils/request'

// 模拟报告模板数据
const mockReportTemplates = [
  {
    id: 1,
    name: '学生学习报告',
    description: '个人学习情况综合报告，包含学习进度、成绩分析、行为统计等',
    type: 'student',
    category: 'learning',
    format: ['pdf', 'excel', 'word'],
    sections: [
      {
        id: 1,
        name: '基本信息',
        required: true,
        fields: ['姓名', '学号', '班级', '学习时长']
      },
      {
        id: 2,
        name: '学习成绩',
        required: true,
        fields: ['平均成绩', '成绩趋势', '排名情况']
      },
      {
        id: 3,
        name: '学习行为',
        required: false,
        fields: ['登录频率', '视频观看', '练习完成']
      },
      {
        id: 4,
        name: '能力评估',
        required: false,
        fields: ['知识点掌握', '技能水平', '薄弱环节']
      }
    ],
    thumbnail: 'https://via.placeholder.com/200x150/409EFF/ffffff?text=学习报告',
    createTime: '2024-01-15',
    updateTime: '2024-01-20',
    status: 1,
    usageCount: 156
  },
  {
    id: 2,
    name: '班级统计报告',
    description: '班级整体学习情况统计分析报告',
    type: 'class',
    category: 'statistics',
    format: ['pdf', 'excel'],
    sections: [
      {
        id: 1,
        name: '班级概况',
        required: true,
        fields: ['学生总数', '活跃度', '平均成绩']
      },
      {
        id: 2,
        name: '成绩分布',
        required: true,
        fields: ['成绩分布图', '及格率', '优秀率']
      },
      {
        id: 3,
        name: '学习进度',
        required: true,
        fields: ['总体进度', '完成情况', '差异分析']
      }
    ],
    thumbnail: 'https://via.placeholder.com/200x150/67C23A/ffffff?text=班级报告',
    createTime: '2024-01-10',
    updateTime: '2024-01-18',
    status: 1,
    usageCount: 89
  },
  {
    id: 3,
    name: '课程质量报告',
    description: '课程教学质量和效果评估报告',
    type: 'course',
    category: 'quality',
    format: ['pdf', 'word'],
    sections: [
      {
        id: 1,
        name: '课程概况',
        required: true,
        fields: ['课程信息', '参与人数', '完成率']
      },
      {
        id: 2,
        name: '教学质量',
        required: true,
        fields: ['满意度调查', '教学评价', '改进建议']
      },
      {
        id: 3,
        name: '学习效果',
        required: true,
        fields: ['知识掌握度', '技能提升', '学习成果']
      }
    ],
    thumbnail: 'https://via.placeholder.com/200x150/E6A23C/ffffff?text=质量报告',
    createTime: '2024-01-12',
    updateTime: '2024-01-22',
    status: 1,
    usageCount: 67
  },
  {
    id: 4,
    name: 'AI助教使用报告',
    description: 'AI助教功能使用情况和效果分析报告',
    type: 'system',
    category: 'ai',
    format: ['pdf', 'excel'],
    sections: [
      {
        id: 1,
        name: '使用统计',
        required: true,
        fields: ['使用次数', '用户覆盖', '活跃时段']
      },
      {
        id: 2,
        name: '问题分析',
        required: true,
        fields: ['问题类型', '解答质量', '用户反馈']
      },
      {
        id: 3,
        name: '效果评估',
        required: false,
        fields: ['学习帮助度', '问题解决率', '改进建议']
      }
    ],
    thumbnail: 'https://via.placeholder.com/200x150/909399/ffffff?text=AI报告',
    createTime: '2024-01-20',
    updateTime: '2024-01-25',
    status: 1,
    usageCount: 45
  }
]

// 模拟报告生成记录
const mockReportRecords = [
  {
    id: 1,
    templateId: 1,
    templateName: '学生学习报告',
    reportName: '张三-2024年1月学习报告',
    type: 'student',
    format: 'pdf',
    targetId: 1,
    targetName: '张三',
    status: 'completed',
    progress: 100,
    fileSize: '2.3MB',
    downloadUrl: 'https://example.com/reports/student_1.pdf',
    creator: '管理员',
    createTime: '2024-01-30 10:30:00',
    completeTime: '2024-01-30 10:32:15',
    downloadCount: 5,
    shareCount: 2
  },
  {
    id: 2,
    templateId: 2,
    templateName: '班级统计报告',
    reportName: '前端开发基础班-1月统计报告',
    type: 'class',
    format: 'excel',
    targetId: 1,
    targetName: '前端开发基础班',
    status: 'generating',
    progress: 65,
    fileSize: null,
    downloadUrl: null,
    creator: '管理员',
    createTime: '2024-01-30 11:15:00',
    completeTime: null,
    downloadCount: 0,
    shareCount: 0
  },
  {
    id: 3,
    templateId: 3,
    templateName: '课程质量报告',
    reportName: 'JavaScript基础编程-质量评估报告',
    type: 'course',
    format: 'pdf',
    targetId: 1,
    targetName: 'JavaScript基础编程',
    status: 'failed',
    progress: 0,
    fileSize: null,
    downloadUrl: null,
    creator: '管理员',
    createTime: '2024-01-29 16:45:00',
    completeTime: null,
    downloadCount: 0,
    shareCount: 0,
    errorMessage: '数据获取失败，请重试'
  }
]

// 模拟报告配置
const mockReportConfig = {
  watermark: {
    enabled: true,
    text: '内部资料',
    opacity: 0.1,
    position: 'center'
  },
  header: {
    enabled: true,
    title: '教育管理平台',
    logo: 'https://via.placeholder.com/120x40/409EFF/ffffff?text=LOGO',
    showDate: true
  },
  footer: {
    enabled: true,
    showPageNumber: true,
    showGenerator: true,
    customText: '机密文件'
  },
  security: {
    password: '',
    permissions: ['print', 'copy'],
    expireDays: 30
  },
  branding: {
    theme: 'default',
    primaryColor: '#409eff',
    fontFamily: 'Microsoft YaHei'
  }
}

// API接口定义
export default {
  // 获取报告模板列表
  getReportTemplates(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, type, category, keyword = '' } = params
        let filteredData = mockReportTemplates

        if (type) {
          filteredData = filteredData.filter(item => item.type === type)
        }

        if (category) {
          filteredData = filteredData.filter(item => item.category === category)
        }

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.name.includes(keyword) || item.description.includes(keyword)
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

  // 获取报告模板详情
  getReportTemplateDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const template = mockReportTemplates.find(item => item.id === id)
        if (template) {
          resolve({
            code: 200,
            data: template
          })
        } else {
          resolve({
            code: 404,
            message: '模板不存在'
          })
        }
      }, 200)
    })
  },

  // 创建报告
  createReport(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReport = {
          id: mockReportRecords.length + 1,
          templateId: data.templateId,
          templateName: data.templateName,
          reportName: data.reportName,
          type: data.type,
          format: data.format,
          targetId: data.targetId,
          targetName: data.targetName,
          status: 'generating',
          progress: 0,
          fileSize: null,
          downloadUrl: null,
          creator: '当前用户',
          createTime: new Date().toLocaleString(),
          completeTime: null,
          downloadCount: 0,
          shareCount: 0
        }

        mockReportRecords.unshift(newReport)

        // 模拟生成进度
        if (data.simulateProgress) {
          const interval = setInterval(() => {
            newReport.progress += Math.random() * 30
            if (newReport.progress >= 100) {
              newReport.progress = 100
              newReport.status = 'completed'
              newReport.completeTime = new Date().toLocaleString()
              newReport.fileSize = (Math.random() * 5 + 1).toFixed(1) + 'MB'
              newReport.downloadUrl = `https://example.com/reports/report_${newReport.id}.${data.format}`
              clearInterval(interval)
            }
          }, 2000)
        }

        resolve({
          code: 200,
          message: '报告创建成功，正在生成中...',
          data: newReport
        })
      }, 500)
    })
  },

  // 获取报告记录
  getReportRecords(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, status, type, keyword = '' } = params
        let filteredData = mockReportRecords

        if (status) {
          filteredData = filteredData.filter(item => item.status === status)
        }

        if (type) {
          filteredData = filteredData.filter(item => item.type === type)
        }

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.reportName.includes(keyword) || item.templateName.includes(keyword)
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

  // 删除报告记录
  deleteReportRecord(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockReportRecords.findIndex(item => item.id === id)
        if (index > -1) {
          mockReportRecords.splice(index, 1)
          resolve({
            code: 200,
            message: '报告删除成功'
          })
        } else {
          resolve({
            code: 404,
            message: '报告不存在'
          })
        }
      }, 300)
    })
  },

  // 重新生成报告
  regenerateReport(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const report = mockReportRecords.find(item => item.id === id)
        if (report) {
          report.status = 'generating'
          report.progress = 0
          report.errorMessage = null

          // 模拟重新生成
          const interval = setInterval(() => {
            report.progress += Math.random() * 25
            if (report.progress >= 100) {
              report.progress = 100
              report.status = 'completed'
              report.completeTime = new Date().toLocaleString()
              clearInterval(interval)
            }
          }, 1500)

          resolve({
            code: 200,
            message: '报告重新生成中...',
            data: report
          })
        } else {
          resolve({
            code: 404,
            message: '报告不存在'
          })
        }
      }, 400)
    })
  },

  // 下载报告
  downloadReport(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const report = mockReportRecords.find(item => item.id === id)
        if (report && report.downloadUrl) {
          report.downloadCount++
          resolve({
            code: 200,
            message: '下载开始',
            data: {
              downloadUrl: report.downloadUrl,
              filename: `${report.reportName}.${report.format}`,
              size: report.fileSize
            }
          })
        } else {
          resolve({
            code: 400,
            message: '报告不可下载'
          })
        }
      }, 200)
    })
  },

  // 分享报告
  shareReport(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { reportId, shareType, expireTime, permissions } = data
        const report = mockReportRecords.find(item => item.id === reportId)

        if (report) {
          report.shareCount++
          const shareUrl = `https://example.com/share/report_${reportId}_${Date.now()}`

          resolve({
            code: 200,
            message: '分享链接生成成功',
            data: {
              shareUrl,
              expireTime,
              permissions,
              password: shareType === 'private' ? 'ABC123' : null
            }
          })
        } else {
          resolve({
            code: 404,
            message: '报告不存在'
          })
        }
      }, 300)
    })
  },

  // 获取报告配置
  getReportConfig() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockReportConfig
        })
      }, 200)
    })
  },

  // 更新报告配置
  updateReportConfig(config) {
    return new Promise((resolve) => {
      setTimeout(() => {
        Object.assign(mockReportConfig, config)
        resolve({
          code: 200,
          message: '配置更新成功',
          data: mockReportConfig
        })
      }, 400)
    })
  },

  // 预览报告
  previewReport(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { templateId, targetId, format } = data
        const previewUrl = `https://example.com/preview/${templateId}_${targetId}.${format}`

        resolve({
          code: 200,
          message: '预览生成成功',
          data: {
            previewUrl,
            pages: Math.floor(Math.random() * 10) + 5,
            size: (Math.random() * 2 + 0.5).toFixed(1) + 'MB'
          }
        })
      }, 1000)
    })
  },

  // 批量生成报告
  batchGenerateReports(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { templateId, targetIds, format } = data
        const reports = targetIds.map((targetId, index) => ({
          id: mockReportRecords.length + index + 1,
          templateId,
          templateName: '批量报告',
          reportName: `批量报告_${index + 1}`,
          type: 'batch',
          format,
          targetId,
          targetName: `目标${index + 1}`,
          status: 'pending',
          progress: 0,
          fileSize: null,
          downloadUrl: null,
          creator: '当前用户',
          createTime: new Date().toLocaleString(),
          completeTime: null,
          downloadCount: 0,
          shareCount: 0
        }))

        mockReportRecords.unshift(...reports)

        resolve({
          code: 200,
          message: `成功创建 ${reports.length} 个报告生成任务`,
          data: {
            totalCount: reports.length,
            reportIds: reports.map(r => r.id)
          }
        })
      }, 800)
    })
  }
}