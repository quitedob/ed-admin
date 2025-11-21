<template>
  <div id="ai-assistant" class="ai-assistant">
    <div id="assistant-container" class="assistant-container">
      <!-- 左侧边栏 -->
      <div id="sidebar" class="sidebar">
        <div id="sidebar-header" class="sidebar-header">
          <h3>智能作业生成</h3>
          <el-button type="primary" size="small" @click="refreshHistory">
            <el-icon><Refresh /></el-icon>
            刷新历史
          </el-button>
        </div>

        <!-- 项目历史 -->
        <div id="history-list" class="history-list">
          <div
            v-for="project in projectHistory"
            :key="project.id"
            :id="`history-item-${project.id}`"
            class="history-item"
            :class="{ active: currentProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <div class="project-title">{{ project.title }}</div>
            <div class="project-meta">
              <el-tag :type="getTypeColor(project.type)" size="small">
                {{ getTypeLabel(project.type) }}
              </el-tag>
              <el-tag :type="getObjectTypeColor(project.objectType)" size="small">
                {{ getObjectTypeLabel(project.objectType) }}
              </el-tag>
              <span class="time">{{ formatTime(project.updatedAt) }}</span>
            </div>
            <div class="project-actions">
              <el-button type="text" size="small" @click.stop="jumpToDetail(project)">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <el-button type="text" size="small" @click.stop="deleteProject(project)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 使用帮助 -->
        <div id="help-panel" class="help-panel">
          <h4>使用帮助</h4>
          <div id="help-list" class="help-list">
            <div class="help-item" @click="showGuide('upload')">
              <el-icon><Upload /></el-icon>
              <span>上传文件指南</span>
            </div>
            <div class="help-item" @click="showGuide('error')">
              <el-icon><DataAnalysis /></el-icon>
              <span>错题分析指南</span>
            </div>
            <div class="help-item" @click="showGuide('custom')">
              <el-icon><Setting /></el-icon>
              <span>自定义设置指南</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div id="main-content" class="main-content">
        <div id="content-header" class="content-header">
          <h2>智能作业生成助手</h2>
          <p>选择您需要的功能，快速创建高质量的试卷和作业</p>
        </div>

        <!-- 功能卡片区域 -->
        <div id="function-cards" class="function-cards">
          <div id="upload-card" class="function-card upload-card" @click="navigateTo('upload-generate')">
            <div class="card-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="card-content">
              <h3>上传并生成</h3>
              <p>上传现有试卷或作业文件，AI将为您生成类似内容和格式的新试卷</p>
              <div class="card-features">
                <span>支持PDF/Word/JSON</span>
                <span>智能识别格式</span>
                <span>批量生成</span>
              </div>
            </div>
            <div class="card-action">
              <el-button type="primary">立即使用</el-button>
            </div>
          </div>

          <div id="error-card" class="function-card error-card" @click="navigateTo('error-based')">
            <div class="card-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="card-content">
              <h3>基于错题生成</h3>
              <p>分析学生的答题错误，针对性地生成练习题，帮助学生查漏补缺</p>
              <div class="card-features">
                <span>错题统计分析</span>
                <span>知识点推荐</span>
                <span>难度自适应</span>
              </div>
            </div>
            <div class="card-action">
              <el-button type="success">开始分析</el-button>
            </div>
          </div>

          <div id="custom-card" class="function-card custom-card" @click="navigateTo('custom-generate')">
            <div class="card-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="card-content">
              <h3>自定义生成</h3>
              <p>根据您的具体要求，自定义题目类型、数量、难度等参数生成试卷</p>
              <div class="card-features">
                <span>灵活配置</span>
                <span>模板管理</span>
                <span>实时预览</span>
              </div>
            </div>
            <div class="card-action">
              <el-button type="warning">创建试卷</el-button>
            </div>
          </div>
        </div>

        <!-- 快速统计 -->
        <div id="quick-stats" class="quick-stats">
          <div id="stat-generated" class="stat-item">
            <div class="stat-number">{{ stats.totalGenerated }}</div>
            <div class="stat-label">已生成试卷</div>
          </div>
          <div id="stat-questions" class="stat-item">
            <div class="stat-number">{{ stats.totalQuestions }}</div>
            <div class="stat-label">题目总数</div>
          </div>
          <div id="stat-success-rate" class="stat-item">
            <div class="stat-number">{{ stats.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
          <div id="stat-avg-time" class="stat-item">
            <div class="stat-number">{{ stats.avgTime }}s</div>
            <div class="stat-label">平均生成时间</div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div id="right-panel" class="right-panel">
        <!-- 最新动态 -->
        <div id="recent-activities" class="recent-activities">
          <h4>最新动态</h4>
          <div id="activity-list" class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" :id="`activity-item-${activity.id}`" class="activity-item">
              <div class="activity-icon">
                <el-icon :class="getActivityIcon(activity.type)">
                  <component :is="getActivityIcon(activity.type)" />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ formatTime(activity.time) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统信息 -->
        <div id="system-info" class="system-info">
          <h4>系统信息</h4>
          <div id="info-model-version" class="info-item">
            <span class="info-label">模型版本:</span>
            <span class="info-value">v2.1.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">系统状态:</span>
            <el-tag type="success" size="small">正常</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">更新时间:</span>
            <span class="info-value">{{ formatTime(systemInfo.updateTime) }}</span>
          </div>
        </div>

        <!-- 快速操作 -->
        <div id="quick-actions" class="quick-actions">
          <h4>快速操作</h4>
          <el-button type="primary" size="small" @click="exportAllProjects">
            <el-icon><Download /></el-icon>
            导出所有项目
          </el-button>
          <el-button type="success" size="small" @click="importTemplate">
            <el-icon><FolderOpened /></el-icon>
            导入模板
          </el-button>
          <el-button type="warning" size="small" @click="showSettings">
            <el-icon><Setting /></el-icon>
            系统设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog id="help-dialog" v-model="showHelpDialog" :title="helpTitle" width="600px">
      <div id="help-content" v-html="helpContent" class="help-content"></div>
      <template #footer>
        <el-button @click="showHelpDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Delete,
  Upload,
  DataAnalysis,
  Setting,
  Download,
  FolderOpened,
  Document,
  Check,
  InfoFilled,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const projectHistory = ref([])
const currentProject = ref(null)
const recentActivities = ref([])
const showHelpDialog = ref(false)
const helpTitle = ref('')
const helpContent = ref('')

// 统计数据
const stats = reactive({
  totalGenerated: 156,
  totalQuestions: 2840,
  successRate: 98,
  avgTime: 12
})

// 系统信息
const systemInfo = reactive({
  updateTime: new Date().toISOString()
})

// 获取项目历史
const getProjectHistory = () => {
  // 模拟数据
  projectHistory.value = [
    {
      id: 1,
      title: 'JavaScript基础测试卷',
      type: 'upload',
      objectType: 'exam',
      objectId: 'exam_001',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: '数据结构错题练习',
      type: 'error',
      objectType: 'homework',
      objectId: 'hw_001',
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      title: '算法期末考试卷',
      type: 'custom',
      objectType: 'exam',
      objectId: 'exam_002',
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// 获取最新动态
const getRecentActivities = () => {
  recentActivities.value = [
    {
      id: 1,
      type: 'upload',
      title: '上传了新的试卷模板',
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'generate',
      title: '生成了25道编程题',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'export',
      title: '导出了数据结构试卷',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// 刷新历史记录
const refreshHistory = () => {
  getProjectHistory()
  ElMessage.success('历史记录已刷新')
}

// 选择项目
const selectProject = (project) => {
  currentProject.value = project
}

// 删除项目
const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${project.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = projectHistory.value.findIndex(item => item.id === project.id)
    if (index > -1) {
      projectHistory.value.splice(index, 1)
    }

    if (currentProject.value?.id === project.id) {
      currentProject.value = null
    }

    ElMessage.success('项目删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 导航到指定页面
const navigateTo = (path) => {
  console.log('Navigating to:', `/ai/assistant/${path}`)
  try {
    router.push(`/ai/assistant/${path}`)
    ElMessage.success(`正在跳转到${path}页面`)
  } catch (error) {
    console.error('Navigation error:', error)
    ElMessage.error('跳转失败，请检查路由配置')
  }
}

// 显示帮助指南
const showGuide = (type) => {
  const guides = {
    upload: {
      title: '上传文件指南',
      content: `
        <h3>支持的文件格式</h3>
        <ul>
          <li>PDF文件：支持文字识别和格式解析</li>
          <li>Word文档：直接读取文本和样式</li>
          <li>JSON文件：按照标准格式导入</li>
        </ul>
        <h3>上传步骤</h3>
        <ol>
          <li>选择要上传的文件</li>
          <li>设置生成参数</li>
          <li>预览解析结果</li>
          <li>确认并生成新试卷</li>
        </ol>
      `
    },
    error: {
      title: '错题分析指南',
      content: `
        <h3>数据来源</h3>
        <ul>
          <li>在线考试系统答题记录</li>
          <li>作业提交记录</li>
          <li>课堂练习数据</li>
        </ul>
        <h3>分析流程</h3>
        <ol>
          <li>选择班级和学生范围</li>
          <li>选择考试或作业记录</li>
          <li>系统自动分析错题分布</li>
          <li>生成针对性练习题</li>
        </ol>
      `
    },
    custom: {
      title: '自定义设置指南',
      content: `
        <h3>基础设置</h3>
        <ul>
          <li>试卷标题和描述</li>
          <li>考试时间和限制</li>
          <li>难度等级设置</li>
        </ul>
        <h3>题目配置</h3>
        <ul>
          <li>各题型数量设置</li>
          <li>分值分配</li>
          <li>知识点覆盖</li>
        </ul>
        <h3>高级选项</h3>
        <ul>
          <li>题目随机排序</li>
          <li>答案显示设置</li>
          <li>评分规则配置</li>
        </ul>
      `
    }
  }

  const guide = guides[type]
  helpTitle.value = guide.title
  helpContent.value = guide.content
  showHelpDialog.value = true
}

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    upload: 'primary',
    error: 'success',
    custom: 'warning'
  }
  return colorMap[type] || 'info'
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labelMap = {
    upload: '上传生成',
    error: '错题生成',
    custom: '自定义'
  }
  return labelMap[type] || '未知'
}

// 获取对象类型颜色
const getObjectTypeColor = (objectType) => {
  const colorMap = {
    exam: 'danger',
    homework: 'success'
  }
  return colorMap[objectType] || 'info'
}

// 获取对象类型标签
const getObjectTypeLabel = (objectType) => {
  const labelMap = {
    exam: '考试',
    homework: '作业'
  }
  return labelMap[objectType] || '未知'
}

// 跳转到详情页
const jumpToDetail = (project) => {
  const path = project.objectType === 'exam' 
    ? `/exam/detail/${project.objectId}`
    : `/homework/detail/${project.objectId}`
  
  try {
    router.push(path)
    ElMessage.success('正在跳转到详情页...')
  } catch (error) {
    ElMessage.error('跳转失败')
  }
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    upload: Upload,
    generate: Document,
    export: Download
  }
  return iconMap[type] || InfoFilled
}

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }
}

// 导出所有项目
const exportAllProjects = () => {
  ElMessage.info('导出功能开发中...')
}

// 导入模板
const importTemplate = () => {
  ElMessage.info('模板导入功能开发中...')
}

// 显示设置
const showSettings = () => {
  ElMessage.info('系统设置功能开发中...')
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/index.vue`);
  getProjectHistory()
  getRecentActivities()
})
</script>

<style scoped>
.ai-assistant {
  height: 100vh;
  background-color: var(--color-bg-secondary);
}

.assistant-container {
  display: flex;
  height: 100%;
}

/* 左侧边栏 */
.sidebar {
  width: 300px;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-base);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  color: var(--color-text-primary);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.history-item:hover {
  background-color: var(--color-bg-secondary);
}

.history-item.active {
  background-color: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
}

.project-title {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.project-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.history-item:hover .project-actions {
  opacity: 1;
}

.help-panel {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border-base);
}

.help-panel h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.help-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-small);
  background-color: var(--color-bg-tertiary);
  cursor: pointer;
  transition: var(--transition);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.help-item:hover {
  background-color: var(--color-primary-50);
  color: var(--color-primary-500);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
  background-color: var(--color-bg-primary);
}

.content-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.content-header h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-size: 28px;
  font-weight: 600;
}

.content-header p {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.function-card {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-large);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-base);
}

.function-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-dark);
}

.card-icon {
  width: 60px;
  height: 60px;
  background-color: var(--color-primary-50);
  border-radius: var(--radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.card-icon .el-icon {
  font-size: 32px;
  color: var(--color-primary-500);
}

.error-card .card-icon {
  background-color: var(--color-success-light);
}

.error-card .card-icon .el-icon {
  color: var(--color-success);
}

.custom-card .card-icon {
  background-color: var(--color-warning-light);
}

.custom-card .card-icon .el-icon {
  color: var(--color-warning);
}

.card-content h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.card-content p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.card-features span {
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-small);
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.card-action {
  text-align: right;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-large);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-primary-500);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 右侧面板 */
.right-panel {
  width: 300px;
  background-color: var(--color-bg-primary);
  border-left: 1px solid var(--color-border-base);
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.recent-activities,
.system-info,
.quick-actions {
  margin-bottom: var(--spacing-xl);
}

.recent-activities h4,
.system-info h4,
.quick-actions h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.activity-icon {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary-50);
  border-radius: var(--radius-small);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon .el-icon {
  font-size: 16px;
  color: var(--color-primary-500);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.activity-time {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.info-label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.info-value {
  color: var(--color-text-primary);
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.quick-actions .el-button {
  justify-content: flex-start;
}

.help-content {
  line-height: 1.8;
  color: var(--color-text-primary);
}

.help-content h3 {
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
  color: var(--color-primary-500);
}

.help-content ul,
.help-content ol {
  margin: 0 0 var(--spacing-md) var(--spacing-lg);
}

.help-content li {
  margin-bottom: var(--spacing-sm);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .function-cards {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .assistant-container {
    flex-direction: column;
  }

  .sidebar,
  .right-panel {
    width: 100%;
  }

  .main-content {
    padding: 20px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>