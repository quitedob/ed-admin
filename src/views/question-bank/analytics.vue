<template>
  <div class="question-bank-analytics">
    <!-- 顶部统计卡片 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ analytics.totalQuestions }}</div>
          <div class="stat-label">总题目数</div>
          <div class="stat-trend">
            <el-icon><TrendCharts /></el-icon>
            <span :class="analytics.questionsGrowth > 0 ? 'up' : 'down'">
              {{ Math.abs(analytics.questionsGrowth) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon usage">
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ analytics.totalUsage }}</div>
          <div class="stat-label">总使用次数</div>
          <div class="stat-trend">
            <el-icon><TrendCharts /></el-icon>
            <span :class="analytics.usageGrowth > 0 ? 'up' : 'down'">
              {{ Math.abs(analytics.usageGrowth) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon accuracy">
          <el-icon><Target /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ analytics.avgAccuracy }}%</div>
          <div class="stat-label">平均正确率</div>
          <div class="stat-trend">
            <el-icon><TrendCharts /></el-icon>
            <span :class="analytics.accuracyTrend > 0 ? 'up' : 'down'">
              {{ Math.abs(analytics.accuracyTrend) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon ai">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ analytics.aiGenerated }}</div>
          <div class="stat-label">AI生成题目</div>
          <div class="stat-trend">
            <el-icon><TrendCharts /></el-icon>
            <span class="up">{{ analytics.aiGrowth }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 题目类型分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>题目类型分布</h4>
          <el-select v-model="typeTimeRange" size="small" style="width: 120px">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="最近3个月" value="3m" />
          </el-select>
        </div>
        <div class="chart-content">
          <div ref="typeChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 难度分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>难度分布</h4>
          <el-select v-model="difficultyTimeRange" size="small" style="width: 120px">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="最近3个月" value="3m" />
          </el-select>
        </div>
        <div class="chart-content">
          <div ref="difficultyChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 使用趋势 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h4>题目使用趋势</h4>
          <div class="header-controls">
            <el-radio-group v-model="usagePeriod" size="small">
              <el-radio-button label="7d">7天</el-radio-button>
              <el-radio-button label="30d">30天</el-radio-button>
              <el-radio-button label="3m">3个月</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-content">
          <div ref="usageChartRef" class="chart large"></div>
        </div>
      </div>

      <!-- 学科分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>学科分布</h4>
          <el-select v-model="subjectTimeRange" size="small" style="width: 120px">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="最近3个月" value="3m" />
          </el-select>
        </div>
        <div class="chart-content">
          <div ref="subjectChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 标签热度排行 -->
      <div class="chart-card">
        <div class="chart-header">
          <h4>标签热度排行</h4>
          <el-select v-model="tagTimeRange" size="small" style="width: 120px">
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
            <el-option label="最近3个月" value="3m" />
          </el-select>
        </div>
        <div class="chart-content">
          <div ref="tagChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="data-section">
      <div class="section-header">
        <h4>题目使用详细数据</h4>
        <div class="header-actions">
          <el-button @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>

      <div class="data-filters">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px"
        />
        <el-select v-model="selectedType" placeholder="题目类型" clearable style="width: 150px">
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="填空题" value="fill" />
          <el-option label="判断题" value="judge" />
          <el-option label="编程题" value="programming" />
          <el-option label="简答题" value="essay" />
        </el-select>
        <el-select v-model="selectedDifficulty" placeholder="难度" clearable style="width: 120px">
          <el-option label="简单" value="easy" />
          <el-option label="中等" value="medium" />
          <el-option label="困难" value="hard" />
        </el-select>
        <el-select v-model="selectedSubject" placeholder="学科" clearable style="width: 150px">
          <el-option label="计算机科学" value="cs" />
          <el-option label="数学" value="math" />
          <el-option label="物理" value="physics" />
          <el-option label="化学" value="chemistry" />
        </el-select>
      </div>

      <div class="data-table">
        <el-table :data="paginatedData" stripe v-loading="loading">
          <el-table-column prop="title" label="题目标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="type" label="题型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="80">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="usageCount" label="使用次数" width="100" sortable />
          <el-table-column prop="correctRate" label="正确率" width="100" sortable>
            <template #default="{ row }">
              <span :class="getCorrectRateClass(row.correctRate)">
                {{ row.correctRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="avgTime" label="平均用时" width="100" sortable>
            <template #default="{ row }">
              {{ row.avgTime }}s
            </template>
          </el-table-column>
          <el-table-column prop="subject" label="学科" width="120" />
          <el-table-column prop="tags" label="标签" width="200">
            <template #default="{ row }">
              <el-tag
                v-for="tag in row.tags?.slice(0, 2)"
                :key="tag"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="row.tags?.length > 2" size="small" type="info">
                +{{ row.tags.length - 2 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastUsed" label="最后使用" width="120" />
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :total="filteredData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document, View, Target, MagicStick, TrendCharts, Download, Refresh
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const typeTimeRange = ref('30d')
const difficultyTimeRange = ref('30d')
const usagePeriod = ref('30d')
const subjectTimeRange = ref('30d')
const tagTimeRange = ref('30d')

const dateRange = ref([])
const selectedType = ref('')
const selectedDifficulty = ref('')
const selectedSubject = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 图表引用
const typeChartRef = ref(null)
const difficultyChartRef = ref(null)
const usageChartRef = ref(null)
const subjectChartRef = ref(null)
const tagChartRef = ref(null)

// 图表实例
let typeChart = null
let difficultyChart = null
let usageChart = null
let subjectChart = null
let tagChart = null

// 模拟分析数据
const analytics = ref({
  totalQuestions: 1250,
  questionsGrowth: 12.5,
  totalUsage: 15680,
  usageGrowth: 8.3,
  avgAccuracy: 78.5,
  accuracyTrend: 2.1,
  aiGenerated: 320,
  aiGrowth: 45.2
})

// 模拟详细数据
const detailData = ref([
  {
    id: 1,
    title: 'JavaScript闭包概念理解',
    type: 'single',
    difficulty: 'medium',
    usageCount: 156,
    correctRate: 82.5,
    avgTime: 45,
    subject: '计算机科学',
    tags: ['JavaScript', '闭包', '函数'],
    lastUsed: '2024-01-20'
  },
  {
    id: 2,
    title: '二叉树中序遍历算法',
    type: 'programming',
    difficulty: 'hard',
    usageCount: 89,
    correctRate: 65.2,
    avgTime: 180,
    subject: '计算机科学',
    tags: ['算法', '数据结构', '二叉树'],
    lastUsed: '2024-01-19'
  },
  {
    id: 3,
    title: '微积分基础概念',
    type: 'multiple',
    difficulty: 'easy',
    usageCount: 234,
    correctRate: 91.3,
    avgTime: 30,
    subject: '数学',
    tags: ['微积分', '导数', '积分'],
    lastUsed: '2024-01-18'
  }
])

// 计算属性
const filteredData = computed(() => {
  let result = detailData.value

  // 日期筛选
  if (dateRange.value?.length === 2) {
    const [start, end] = dateRange.value
    result = result.filter(item => {
      const lastUsed = new Date(item.lastUsed).toISOString().split('T')[0]
      return lastUsed >= start && lastUsed <= end
    })
  }

  // 类型筛选
  if (selectedType.value) {
    result = result.filter(item => item.type === selectedType.value)
  }

  // 难度筛选
  if (selectedDifficulty.value) {
    result = result.filter(item => item.difficulty === selectedDifficulty.value)
  }

  // 学科筛选
  if (selectedSubject.value) {
    result = result.filter(item => item.subject === selectedSubject.value)
  }

  return result
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 方法
const initCharts = () => {
  nextTick(() => {
    initTypeChart()
    initDifficultyChart()
    initUsageChart()
    initSubjectChart()
    initTagChart()
  })
}

const initTypeChart = () => {
  if (!typeChartRef.value) return

  typeChart = echarts.init(typeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '题目类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 450, name: '单选题' },
          { value: 280, name: '多选题' },
          { value: 220, name: '填空题' },
          { value: 150, name: '判断题' },
          { value: 80, name: '编程题' },
          { value: 70, name: '简答题' }
        ],
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
  typeChart.setOption(option)
}

const initDifficultyChart = () => {
  if (!difficultyChartRef.value) return

  difficultyChart = echarts.init(difficultyChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '难度分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 520, name: '简单', itemStyle: { color: '#67c23a' } },
          { value: 580, name: '中等', itemStyle: { color: '#e6a23c' } },
          { value: 150, name: '困难', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }
  difficultyChart.setOption(option)
}

const initUsageChart = () => {
  if (!usageChartRef.value) return

  usageChart = echarts.init(usageChartRef.value)
  const dates = []
  const usageData = []

  // 生成最近30天的日期
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toLocaleDateString())
    usageData.push(Math.floor(Math.random() * 100) + 50)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['使用次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '使用次数',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: usageData,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }
  usageChart.setOption(option)
}

const initSubjectChart = () => {
  if (!subjectChartRef.value) return

  subjectChart = echarts.init(subjectChartRef.value)
  const option = {
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
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['化学', '物理', '数学', '计算机科学']
    },
    series: [
      {
        name: '题目数量',
        type: 'bar',
        data: [120, 280, 450, 800],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  subjectChart.setOption(option)
}

const initTagChart = () => {
  if (!tagChartRef.value) return

  tagChart = echarts.init(tagChartRef.value)
  const option = {
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
      data: ['React', 'Vue', '算法', '数据结构', '数据库', '网络编程'],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        data: [156, 142, 128, 115, 98, 87],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fe9a8b' },
            { offset: 1, color: '#fd726d' }
          ])
        }
      }
    ]
  }
  tagChart.setOption(option)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟数据刷新
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 重新初始化图表
    initCharts()

    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 辅助方法
const getTypeLabel = (type) => {
  const typeMap = {
    single: '单选',
    multiple: '多选',
    fill: '填空',
    judge: '判断',
    programming: '编程',
    essay: '简答'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type) => {
  const typeMap = {
    single: 'primary',
    multiple: 'success',
    fill: 'warning',
    judge: 'info',
    programming: 'danger',
    essay: ''
  }
  return typeMap[type] || ''
}

const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return difficultyMap[difficulty] || ''
}

const getCorrectRateClass = (rate) => {
  if (rate >= 90) return 'high-accuracy'
  if (rate >= 70) return 'medium-accuracy'
  return 'low-accuracy'
}

onMounted(() => {
  initCharts()

  // 窗口大小改变时重新调整图表
  window.addEventListener('resize', () => {
    typeChart?.resize()
    difficultyChart?.resize()
    usageChart?.resize()
    subjectChart?.resize()
    tagChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.question-bank-analytics {
  padding: 24px;
  background-color: var(--color-bg-primary);
  min-height: calc(100vh - 60px);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: white;

      &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.usage { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.accuracy { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.ai { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    }

    .stat-content {
      flex: 1;

      .stat-number {
        font-size: 32px;
        font-weight: bold;
        color: var(--color-text-primary);
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 4px 0 8px 0;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        .up { color: var(--color-success); }
        .down { color: var(--color-danger); }
      }
    }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;

  .chart-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    &.full-width {
      grid-column: 1 / -1;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-lighter);

      h4 {
        margin: 0;
        color: var(--color-text-primary);
      }

      .header-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    }

    .chart-content {
      padding: 24px;

      .chart {
        height: 300px;
        width: 100%;

        &.large {
          height: 400px;
        }
      }
    }
  }
}

.data-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--color-border-lighter);

    h4 {
      margin: 0;
      color: var(--color-text-primary);
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .data-filters {
    display: flex;
    gap: 16px;
    padding: 16px 24px;
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-lighter);
  }

  .data-table {
    padding: 24px;

    .high-accuracy { color: var(--color-success); font-weight: 600; }
    .medium-accuracy { color: var(--color-warning); font-weight: 600; }
    .low-accuracy { color: var(--color-danger); font-weight: 600; }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-lighter);
    }
  }
}
</style>