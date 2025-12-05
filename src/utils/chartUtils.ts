/**
 * 图表工具类
 * 提供常用的图表配置和数据处理方法
 */

// ECharts 配置类型
export interface ChartOption {
  title?: any
  tooltip?: any
  legend?: any
  grid?: any
  xAxis?: any
  yAxis?: any
  series?: any
  color?: string[]
  [key: string]: any
}

// 默认颜色方案
export const DEFAULT_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#00A870',
  '#73D13D',
  '#FFC53D',
  '#FF7A45',
  '#FF85C0'
]

// 生成柱状图配置
export function generateBarChart(
  title: string,
  categories: string[],
  data: number[],
  seriesName: string = '数据'
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data,
        type: 'bar',
        name: seriesName,
        itemStyle: {
          color: DEFAULT_COLORS[0]
        }
      }
    ]
  }
}

// 生成折线图配置
export function generateLineChart(
  title: string,
  categories: string[],
  datasets: Array<{ name: string; data: number[] }>,
  smooth: boolean = true
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: datasets.map(d => d.name),
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories
    },
    yAxis: {
      type: 'value'
    },
    series: datasets.map((dataset, index) => ({
      name: dataset.name,
      data: dataset.data,
      type: 'line',
      smooth: smooth,
      itemStyle: {
        color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      }
    }))
  }
}

// 生成饼图配置
export function generatePieChart(
  title: string,
  data: Array<{ name: string; value: number }>
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

// 生成雷达图配置
export function generateRadarChart(
  title: string,
  indicators: Array<{ name: string; max: number }>,
  data: Array<{ name: string; value: number[] }>
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: data.map(d => d.name),
      bottom: 10
    },
    radar: {
      indicator: indicators,
      shape: 'polygon'
    },
    series: [
      {
        name: title,
        type: 'radar',
        data: data,
        itemStyle: {
          color: DEFAULT_COLORS[0]
        }
      }
    ]
  }
}

// 生成热力图配置
export function generateHeatmapChart(
  title: string,
  xAxis: string[],
  yAxis: string[],
  data: Array<[number, number, number]>
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `${params.value[0]}, ${params.value[1]}: ${params.value[2]}`
      }
    },
    grid: {
      height: '50%'
    },
    xAxis: {
      type: 'category',
      data: xAxis
    },
    yAxis: {
      type: 'category',
      data: yAxis
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: '10',
      bottom: '20%'
    },
    series: [
      {
        name: title,
        type: 'heatmap',
        data: data,
        emphasis: {
          itemStyle: {
            borderColor: '#333',
            borderWidth: 1
          }
        }
      }
    ]
  }
}

// 生成散点图配置
export function generateScatterChart(
  title: string,
  data: Array<{ name: string; value: [number, number][] }>
): ChartOption {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ({c[0]}, {c[1]})'
    },
    legend: {
      data: data.map(d => d.name),
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'value'
    },
    series: data.map((dataset, index) => ({
      name: dataset.name,
      data: dataset.value,
      type: 'scatter',
      symbolSize: 8,
      itemStyle: {
        color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
      }
    }))
  }
}

// 学生成绩分布图
export function generateGradeDistributionChart(grades: number[]): ChartOption {
  const ranges = [
    { name: '90-100', min: 90, max: 100 },
    { name: '80-89', min: 80, max: 89 },
    { name: '70-79', min: 70, max: 79 },
    { name: '60-69', min: 60, max: 69 },
    { name: '0-59', min: 0, max: 59 }
  ]

  const distribution = ranges.map(range => {
    const count = grades.filter(g => g >= range.min && g <= range.max).length
    return {
      name: range.name,
      value: count
    }
  })

  return generatePieChart('学生成绩分布', distribution)
}

// 知识点掌握情况图
export function generateKnowledgePointChart(
  knowledgePoints: Array<{ name: string; mastery: number }>
): ChartOption {
  const names = knowledgePoints.map(kp => kp.name)
  const values = knowledgePoints.map(kp => kp.mastery)

  return generateBarChart('知识点掌握情况', names, values, '掌握度(%)')
}

// 学习进度趋势图
export function generateLearningProgressChart(
  dates: string[],
  progressData: Array<{ name: string; data: number[] }>
): ChartOption {
  return generateLineChart('学习进度趋势', dates, progressData)
}

// 作业完成情况统计
export function generateHomeworkCompletionChart(
  homeworks: Array<{ name: string; completionRate: number }>
): ChartOption {
  const names = homeworks.map(h => h.name)
  const rates = homeworks.map(h => h.completionRate)

  return generateBarChart('作业完成情况', names, rates, '完成度(%)')
}

// 考试成绩对比图
export function generateExamComparisonChart(
  exams: Array<{ name: string; avgScore: number; passingRate: number }>
): ChartOption {
  return generateLineChart('考试成绩对比', exams.map(e => e.name), [
    {
      name: '平均分',
      data: exams.map(e => e.avgScore)
    },
    {
      name: '及格率(%)',
      data: exams.map(e => e.passingRate)
    }
  ])
}

// 班级学生分布图
export function generateClassDistributionChart(
  classes: Array<{ name: string; studentCount: number }>
): ChartOption {
  const data = classes.map(c => ({
    name: c.name,
    value: c.studentCount
  }))

  return generatePieChart('班级学生分布', data)
}

// 时间段学习热力图
export function generateStudyHeatmapChart(
  weekDays: string[],
  hours: string[],
  data: Array<[number, number, number]>
): ChartOption {
  return generateHeatmapChart('学习热力图', hours, weekDays, data)
}

// 数据统计辅助函数
export function calculateStatistics(data: number[]) {
  if (data.length === 0) return null

  const sorted = [...data].sort((a, b) => a - b)
  const sum = data.reduce((a, b) => a + b, 0)
  const avg = sum / data.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]

  return {
    sum,
    avg: Math.round(avg * 100) / 100,
    min,
    max,
    median,
    count: data.length
  }
}

// 生成随机颜色
export function generateRandomColor(): string {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]
}

// 颜色渐变
export function generateGradientColor(startColor: string, endColor: string, steps: number): string[] {
  const colors: string[] = []
  // 简单的颜色渐变实现
  for (let i = 0; i < steps; i++) {
    colors.push(DEFAULT_COLORS[i % DEFAULT_COLORS.length])
  }
  return colors
}
