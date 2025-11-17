/**
 * 数据导出工具类
 * 支持导出为 Excel、CSV、PDF 等格式
 */

// 导出为 CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 获取表头
  const headers = Object.keys(data[0])
  
  // 构建 CSV 内容
  let csvContent = headers.join(',') + '\n'
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // 处理包含逗号的值
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    })
    csvContent += values.join(',') + '\n'
  })

  // 创建 Blob 并下载
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

// 导出为 Excel (简单版本，使用 CSV 格式)
export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 获取表头
  const headers = Object.keys(data[0])
  
  // 构建 Excel 内容 (使用 HTML 表格格式)
  let htmlContent = '<table border="1">'
  
  // 添加表头
  htmlContent += '<tr>'
  headers.forEach(header => {
    htmlContent += `<th>${header}</th>`
  })
  htmlContent += '</tr>'
  
  // 添加数据行
  data.forEach(row => {
    htmlContent += '<tr>'
    headers.forEach(header => {
      htmlContent += `<td>${row[header]}</td>`
    })
    htmlContent += '</tr>'
  })
  
  htmlContent += '</table>'

  // 创建 Blob 并下载
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.xls`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 导出为 JSON
export function exportToJSON(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
}

// 导出为 PDF (需要额外库支持)
export function exportToPDF(data: any[], filename: string) {
  console.warn('PDF export requires additional library (jsPDF)')
  // 实现需要引入 jsPDF 库
  // import jsPDF from 'jspdf'
  // import autoTable from 'jspdf-autotable'
}

// 通用下载文件方法
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 导出表格数据
export function exportTableData(
  tableData: any[],
  columns: Array<{ prop: string; label: string }>,
  filename: string,
  format: 'csv' | 'excel' | 'json' = 'excel'
) {
  if (!tableData || tableData.length === 0) {
    console.warn('No data to export')
    return
  }

  // 转换数据格式
  const exportData = tableData.map(row => {
    const newRow: any = {}
    columns.forEach(col => {
      newRow[col.label] = row[col.prop]
    })
    return newRow
  })

  // 根据格式导出
  switch (format) {
    case 'csv':
      exportToCSV(exportData, `${filename}.csv`)
      break
    case 'excel':
      exportToExcel(exportData, filename)
      break
    case 'json':
      exportToJSON(exportData, `${filename}.json`)
      break
    default:
      exportToExcel(exportData, filename)
  }
}

// 导出学生成绩
export function exportStudentGrades(
  students: any[],
  filename: string = '学生成绩表'
) {
  const columns = [
    { prop: 'name', label: '姓名' },
    { prop: 'studentId', label: '学号' },
    { prop: 'score', label: '成绩' },
    { prop: 'completionRate', label: '完成度' },
    { prop: 'submitTime', label: '提交时间' }
  ]
  exportTableData(students, columns, filename, 'excel')
}

// 导出作业统计
export function exportHomeworkStatistics(
  homeworks: any[],
  filename: string = '作业统计表'
) {
  const columns = [
    { prop: 'title', label: '作业名称' },
    { prop: 'className', label: '班级' },
    { prop: 'questionCount', label: '题目数' },
    { prop: 'completionRate', label: '完成度' },
    { prop: 'dueDate', label: '截止时间' }
  ]
  exportTableData(homeworks, columns, filename, 'excel')
}

// 导出考试成绩
export function exportExamGrades(
  exams: any[],
  filename: string = '考试成绩表'
) {
  const columns = [
    { prop: 'title', label: '考试名称' },
    { prop: 'className', label: '班级' },
    { prop: 'totalScore', label: '总分' },
    { prop: 'avgScore', label: '平均分' },
    { prop: 'passingRate', label: '及格率' }
  ]
  exportTableData(exams, columns, filename, 'excel')
}
