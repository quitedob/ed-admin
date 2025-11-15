<template>
  <div class="report-export">
    <el-card class="export-card">
      <template #header>
        <div class="card-header">
          <span>报告导出</span>
          <div class="header-actions">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Document /></el-icon>
              新建报告
            </el-button>
            <el-button type="success" @click="showBatchDialog = true">
              <el-icon><Operation /></el-icon>
              批量生成
            </el-button>
            <el-button type="info" @click="showConfigDialog = true">
              <el-icon><Setting /></el-icon>
              报告配置
            </el-button>
          </div>
        </div>
      </template>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <el-row :gutter="20">
          <el-col :span="6" v-for="action in quickActions" :key="action.type">
            <div class="action-card" @click="quickCreate(action.type)">
              <el-icon class="action-icon" :size="32">
                <component :is="action.icon" />
              </el-icon>
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.description }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 筛选条件 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item label="报告类型">
            <el-select v-model="filters.type" placeholder="选择类型" clearable style="width: 120px">
              <el-option label="学生报告" value="student" />
              <el-option label="班级报告" value="class" />
              <el-option label="课程报告" value="course" />
              <el-option label="系统报告" value="system" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="生成中" value="generating" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="filters.format" placeholder="选择格式" clearable style="width: 100px">
              <el-option label="PDF" value="pdf" />
              <el-option label="Excel" value="excel" />
              <el-option label="Word" value="word" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input
              v-model="filters.keyword"
              placeholder="报告名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 报告列表 -->
      <el-table v-loading="loading" :data="reportList" stripe>
        <el-table-column prop="reportName" label="报告名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="templateName" label="模板类型" width="120" />
        <el-table-column prop="targetName" label="目标对象" width="120" />
        <el-table-column prop="format" label="格式" width="80">
          <template #default="{ row }">
            <el-tag :type="getFormatTagType(row.format)" size="small">
              {{ row.format.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <div v-if="row.status === 'generating'">
              <el-progress :percentage="row.progress" :stroke-width="6" />
            </div>
            <span v-else-if="row.status === 'completed'">完成</span>
            <span v-else-if="row.status === 'failed'">失败</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" width="100">
          <template #default="{ row }">
            <span v-if="row.fileSize">{{ row.fileSize }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建者" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed'"
              type="primary"
              size="small"
              @click="downloadReport(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              type="success"
              size="small"
              @click="shareReport(row)"
            >
              分享
            </el-button>
            <el-button
              v-if="row.status === 'failed'"
              type="warning"
              size="small"
              @click="regenerateReport(row)"
            >
              重试
            </el-button>
            <el-button type="info" size="small" @click="viewReportDetail(row)">
              详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteReport(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination
          v-show="total > 0"
          :total="total"
          v-model:page="filters.page"
          v-model:limit="filters.limit"
          @pagination="getReportRecords"
        />
      </div>
    </el-card>

    <!-- 创建报告对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建报告" width="800px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="选择模板" prop="templateId">
          <el-select v-model="createForm.templateId" placeholder="请选择报告模板" style="width: 100%">
            <el-option
              v-for="template in templateOptions"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ template.name }}</span>
                <el-tag size="small">{{ template.type }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="报告名称" prop="reportName">
          <el-input v-model="createForm.reportName" placeholder="请输入报告名称" />
        </el-form-item>

        <el-form-item label="目标对象" prop="targetId" v-if="currentTemplate">
          <el-select v-model="createForm.targetId" placeholder="请选择目标对象" style="width: 100%">
            <el-option
              v-for="target in targetOptions"
              :key="target.id"
              :label="target.name"
              :value="target.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="输出格式" prop="format">
          <el-radio-group v-model="createForm.format">
            <el-radio
              v-for="format in availableFormats"
              :key="format"
              :label="format"
            >
              {{ format.toUpperCase() }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="包含章节" v-if="currentTemplate">
          <el-checkbox-group v-model="createForm.sections">
            <el-checkbox
              v-for="section in currentTemplate.sections"
              :key="section.id"
              :label="section.id"
              :disabled="section.required"
            >
              {{ section.name }} {{ section.required ? '(必选)' : '' }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="生成选项">
          <el-checkbox v-model="createForm.useCurrentData">使用最新数据</el-checkbox>
          <el-checkbox v-model="createForm.includeCharts">包含图表</el-checkbox>
          <el-checkbox v-model="createForm.addWatermark">添加水印</el-checkbox>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="info" @click="previewReport">预览</el-button>
        <el-button type="primary" @click="createReport" :loading="creating">
          创建报告
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量生成对话框 -->
    <el-dialog v-model="showBatchDialog" title="批量生成报告" width="700px">
      <el-form :model="batchForm" :rules="batchRules" ref="batchFormRef" label-width="100px">
        <el-form-item label="选择模板" prop="templateId">
          <el-select v-model="batchForm.templateId" placeholder="请选择报告模板" style="width: 100%">
            <el-option
              v-for="template in templateOptions"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标对象" prop="targetIds">
          <el-select
            v-model="batchForm.targetIds"
            placeholder="请选择目标对象"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="target in targetOptions"
              :key="target.id"
              :label="target.name"
              :value="target.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="输出格式" prop="format">
          <el-radio-group v-model="batchForm.format">
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="word">Word</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="命名规则">
          <el-input v-model="batchForm.namingRule" placeholder="例：{target}_学习报告_{date}" />
          <div class="naming-tips">
            可用变量：{target} - 目标名称, {date} - 日期, {template} - 模板名称
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showBatchDialog = false">取消</el-button>
        <el-button type="primary" @click="batchGenerateReports" :loading="batchGenerating">
          开始生成
        </el-button>
      </template>
    </el-dialog>

    <!-- 报告配置对话框 -->
    <el-dialog v-model="showConfigDialog" title="报告配置" width="700px">
      <el-form :model="reportConfig" label-width="100px">
        <el-tabs v-model="configTab">
          <!-- 水印设置 -->
          <el-tab-pane label="水印设置" name="watermark">
            <el-form-item label="启用水印">
              <el-switch v-model="reportConfig.watermark.enabled" />
            </el-form-item>
            <el-form-item label="水印文字" v-if="reportConfig.watermark.enabled">
              <el-input v-model="reportConfig.watermark.text" />
            </el-form-item>
            <el-form-item label="透明度" v-if="reportConfig.watermark.enabled">
              <el-slider
                v-model="reportConfig.watermark.opacity"
                :min="0"
                :max="1"
                :step="0.1"
                show-input
              />
            </el-form-item>
            <el-form-item label="位置" v-if="reportConfig.watermark.enabled">
              <el-select v-model="reportConfig.watermark.position">
                <el-option label="居中" value="center" />
                <el-option label="左上角" value="top-left" />
                <el-option label="右下角" value="bottom-right" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <!-- 页眉页脚 -->
          <el-tab-pane label="页眉页脚" name="header">
            <el-form-item label="启用页眉">
              <el-switch v-model="reportConfig.header.enabled" />
            </el-form-item>
            <el-form-item label="标题" v-if="reportConfig.header.enabled">
              <el-input v-model="reportConfig.header.title" />
            </el-form-item>
            <el-form-item label="显示日期" v-if="reportConfig.header.enabled">
              <el-switch v-model="reportConfig.header.showDate" />
            </el-form-item>

            <el-form-item label="启用页脚">
              <el-switch v-model="reportConfig.footer.enabled" />
            </el-form-item>
            <el-form-item label="页码" v-if="reportConfig.footer.enabled">
              <el-switch v-model="reportConfig.footer.showPageNumber" />
            </el-form-item>
            <el-form-item label="生成者" v-if="reportConfig.footer.enabled">
              <el-switch v-model="reportConfig.footer.showGenerator" />
            </el-form-item>
          </el-tab-pane>

          <!-- 安全设置 -->
          <el-tab-pane label="安全设置" name="security">
            <el-form-item label="密码保护">
              <el-input
                v-model="reportConfig.security.password"
                type="password"
                placeholder="留空则不设置密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="权限设置">
              <el-checkbox-group v-model="reportConfig.security.permissions">
                <el-checkbox label="print">允许打印</el-checkbox>
                <el-checkbox label="copy">允许复制</el-checkbox>
                <el-checkbox label="edit">允许编辑</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="有效期">
              <el-input-number
                v-model="reportConfig.security.expireDays"
                :min="1"
                :max="365"
                placeholder="天数"
              />
              <span style="margin-left: 10px;">天后过期</span>
            </el-form-item>
          </el-tab-pane>

          <!-- 主题设置 -->
          <el-tab-pane label="主题设置" name="branding">
            <el-form-item label="主题">
              <el-select v-model="reportConfig.branding.theme">
                <el-option label="默认" value="default" />
                <el-option label="商务" value="business" />
                <el-option label="教育" value="education" />
                <el-option label="简洁" value="minimal" />
              </el-select>
            </el-form-item>
            <el-form-item label="主色调">
              <el-color-picker v-model="reportConfig.branding.primaryColor" />
            </el-form-item>
            <el-form-item label="字体">
              <el-select v-model="reportConfig.branding.fontFamily">
                <el-option label="微软雅黑" value="Microsoft YaHei" />
                <el-option label="宋体" value="SimSun" />
                <el-option label="黑体" value="SimHei" />
                <el-option label="Arial" value="Arial" />
              </el-select>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveReportConfig">保存配置</el-button>
      </template>
    </el-dialog>

    <!-- 报告详情对话框 -->
    <el-dialog v-model="showDetailDialog" :title="currentReport?.reportName" width="600px">
      <div v-if="currentReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报告名称">{{ currentReport.reportName }}</el-descriptions-item>
          <el-descriptions-item label="模板类型">{{ currentReport.templateName }}</el-descriptions-item>
          <el-descriptions-item label="目标对象">{{ currentReport.targetName }}</el-descriptions-item>
          <el-descriptions-item label="文件格式">{{ currentReport.format.toUpperCase() }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ currentReport.fileSize || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{ currentReport.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentReport.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ currentReport.completeTime ? formatDateTime(currentReport.completeTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="下载次数">{{ currentReport.downloadCount }}</el-descriptions-item>
          <el-descriptions-item label="分享次数">{{ currentReport.shareCount }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentReport.errorMessage" class="error-message">
          <el-alert
            title="生成失败"
            type="error"
            :description="currentReport.errorMessage"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 分享对话框 -->
    <el-dialog v-model="showShareDialog" title="分享报告" width="500px">
      <div v-if="shareData" class="share-content">
        <el-form label-width="80px">
          <el-form-item label="分享链接">
            <el-input v-model="shareData.shareUrl" readonly>
              <template #append>
                <el-button @click="copyShareLink">复制</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="访问密码" v-if="shareData.password">
            <el-input v-model="shareData.password" readonly>
              <template #append>
                <el-button @click="copyPassword">复制</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="有效期">
            <el-tag type="info">{{ shareData.expireTime }}</el-tag>
          </el-form-item>

          <el-form-item label="权限设置">
            <el-tag v-for="permission in shareData.permissions" :key="permission" style="margin-right: 4px;">
              {{ permission }}
            </el-tag>
          </el-form-item>
        </el-form>

        <el-alert
          title="分享提示"
          type="info"
          description="分享链接具有时效性，请妥善保管。建议仅分享给授权用户。"
          show-icon
          :closable="false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Operation,
  Setting,
  Search,
  User,
  DataBoard,
  TrendCharts,
  Monitor
} from '@element-plus/icons-vue'
import reportApi from '@/api/report'

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const batchGenerating = ref(false)
const total = ref(0)
const reportList = ref([])
const templateOptions = ref([])
const targetOptions = ref([])
const currentTemplate = ref(null)
const currentReport = ref(null)
const shareData = ref(null)

// 对话框控制
const showCreateDialog = ref(false)
const showBatchDialog = ref(false)
const showConfigDialog = ref(false)
const showDetailDialog = ref(false)
const showShareDialog = ref(false)

// 表单数据
const filters = reactive({
  page: 1,
  limit: 10,
  type: '',
  status: '',
  format: '',
  keyword: ''
})

const createForm = reactive({
  templateId: null,
  reportName: '',
  targetId: null,
  format: 'pdf',
  sections: [],
  useCurrentData: true,
  includeCharts: true,
  addWatermark: true
})

const batchForm = reactive({
  templateId: null,
  targetIds: [],
  format: 'pdf',
  namingRule: '{target}_学习报告_{date}'
})

const reportConfig = ref({})

const configTab = ref('watermark')

// 表单验证规则
const createRules = {
  templateId: [{ required: true, message: '请选择报告模板', trigger: 'change' }],
  reportName: [{ required: true, message: '请输入报告名称', trigger: 'blur' }],
  targetId: [{ required: true, message: '请选择目标对象', trigger: 'change' }],
  format: [{ required: true, message: '请选择输出格式', trigger: 'change' }]
}

const batchRules = {
  templateId: [{ required: true, message: '请选择报告模板', trigger: 'change' }],
  targetIds: [{ required: true, message: '请选择目标对象', trigger: 'change' }],
  format: [{ required: true, message: '请选择输出格式', trigger: 'change' }]
}

const createFormRef = ref()
const batchFormRef = ref()

// 快速操作
const quickActions = ref([
  {
    type: 'student',
    title: '学生报告',
    description: '生成个人学习报告',
    icon: 'User'
  },
  {
    type: 'class',
    title: '班级报告',
    description: '生成班级统计报告',
    icon: 'DataBoard'
  },
  {
    type: 'course',
    title: '课程报告',
    description: '生成课程质量报告',
    icon: 'TrendCharts'
  },
  {
    type: 'system',
    title: '系统报告',
    description: '生成系统运行报告',
    icon: 'Monitor'
  }
])

// 计算属性
const availableFormats = computed(() => {
  return currentTemplate.value?.format || ['pdf']
})

// 获取报告记录
const getReportRecords = async () => {
  loading.value = true
  try {
    const response = await reportApi.getReportRecords(filters)
    if (response.code === 200) {
      reportList.value = response.data.items
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取报告列表失败')
  } finally {
    loading.value = false
  }
}

// 获取模板选项
const getTemplateOptions = async () => {
  try {
    const response = await reportApi.getReportTemplates({ limit: 100 })
    if (response.code === 200) {
      templateOptions.value = response.data.items
    }
  } catch (error) {
    console.error('获取模板列表失败:', error)
  }
}

// 获取目标选项
const getTargetOptions = async (type) => {
  // 模拟目标数据
  const targets = {
    student: [
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ],
    class: [
      { id: 1, name: '前端开发基础班' },
      { id: 2, name: 'Vue.js进阶班' }
    ],
    course: [
      { id: 1, name: 'JavaScript基础编程' },
      { id: 2, name: 'Vue.js组件开发' }
    ],
    system: [
      { id: 1, name: '全系统' }
    ]
  }

  targetOptions.value = targets[type] || []
}

// 筛选
const handleFilter = () => {
  filters.page = 1
  getReportRecords()
}

// 重置筛选
const resetFilter = () => {
  filters.type = ''
  filters.status = ''
  filters.format = ''
  filters.keyword = ''
  filters.page = 1
  getReportRecords()
}

// 快速创建
const quickCreate = (type) => {
  createForm.templateId = null
  createForm.reportName = ''
  createForm.targetId = null
  createForm.format = 'pdf'
  createForm.sections = []

  // 预选对应类型的模板
  const template = templateOptions.value.find(t => t.type === type)
  if (template) {
    createForm.templateId = template.id
    handleTemplateChange()
    createForm.reportName = `${template.name}_${new Date().toLocaleDateString()}`
  }

  showCreateDialog.value = true
}

// 处理模板变化
const handleTemplateChange = async () => {
  if (!createForm.templateId) return

  try {
    const response = await reportApi.getReportTemplateDetail(createForm.templateId)
    if (response.code === 200) {
      currentTemplate.value = response.data
      getTargetOptions(response.data.type)

      // 默认选中必选章节
      createForm.sections = response.data.sections
        .filter(section => section.required)
        .map(section => section.id)
    }
  } catch (error) {
    console.error('获取模板详情失败:', error)
  }
}

// 创建报告
const createReport = async () => {
  try {
    await createFormRef.value.validate()
    creating.value = true

    const response = await reportApi.createReport({
      ...createForm,
      simulateProgress: true
    })

    if (response.code === 200) {
      ElMessage.success(response.message)
      showCreateDialog.value = false
      resetCreateForm()
      getReportRecords()
    }
  } catch (error) {
    ElMessage.error('创建报告失败')
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.templateId = null
  createForm.reportName = ''
  createForm.targetId = null
  createForm.format = 'pdf'
  createForm.sections = []
  createForm.useCurrentData = true
  createForm.includeCharts = true
  createForm.addWatermark = true
  currentTemplate.value = null
  createFormRef.value?.resetFields()
}

// 批量生成报告
const batchGenerateReports = async () => {
  try {
    await batchFormRef.value.validate()
    batchGenerating.value = true

    const response = await reportApi.batchGenerateReports(batchForm)
    if (response.code === 200) {
      ElMessage.success(response.message)
      showBatchDialog.value = false
      resetBatchForm()
      getReportRecords()
    }
  } catch (error) {
    ElMessage.error('批量生成失败')
  } finally {
    batchGenerating.value = false
  }
}

// 重置批量表单
const resetBatchForm = () => {
  batchForm.templateId = null
  batchForm.targetIds = []
  batchForm.format = 'pdf'
  batchForm.namingRule = '{target}_学习报告_{date}'
  batchFormRef.value?.resetFields()
}

// 下载报告
const downloadReport = async (report) => {
  try {
    const response = await reportApi.downloadReport(report.id)
    if (response.code === 200) {
      // 模拟下载
      window.open(response.data.downloadUrl)
      ElMessage.success('下载开始')
      getReportRecords()
    }
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 分享报告
const shareReport = async (report) => {
  try {
    const response = await reportApi.shareReport({
      reportId: report.id,
      shareType: 'public',
      expireTime: '7天后',
      permissions: ['view', 'download']
    })

    if (response.code === 200) {
      shareData.value = response.data
      showShareDialog.value = true
    }
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

// 复制分享链接
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareData.value.shareUrl)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制密码
const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(shareData.value.password)
    ElMessage.success('密码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 重新生成报告
const regenerateReport = async (report) => {
  try {
    await ElMessageBox.confirm('确定要重新生成这个报告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await reportApi.regenerateReport(report.id)
    if (response.code === 200) {
      ElMessage.success(response.message)
      getReportRecords()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重新生成失败')
    }
  }
}

// 查看报告详情
const viewReportDetail = (report) => {
  currentReport.value = report
  showDetailDialog.value = true
}

// 删除报告
const deleteReport = async (report) => {
  try {
    await ElMessageBox.confirm('确定要删除这个报告吗？删除后无法恢复。', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await reportApi.deleteReportRecord(report.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      getReportRecords()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 预览报告
const previewReport = async () => {
  if (!createForm.templateId || !createForm.targetId) {
    ElMessage.warning('请先选择模板和目标对象')
    return
  }

  try {
    const response = await reportApi.previewReport({
      templateId: createForm.templateId,
      targetId: createForm.targetId,
      format: createForm.format
    })

    if (response.code === 200) {
      // 在新窗口打开预览
      window.open(response.data.previewUrl, '_blank')
    }
  } catch (error) {
    ElMessage.error('预览生成失败')
  }
}

// 获取报告配置
const getReportConfig = async () => {
  try {
    const response = await reportApi.getReportConfig()
    if (response.code === 200) {
      reportConfig.value = response.data
    }
  } catch (error) {
    console.error('获取配置失败:', error)
  }
}

// 保存报告配置
const saveReportConfig = async () => {
  try {
    const response = await reportApi.updateReportConfig(reportConfig.value)
    if (response.code === 200) {
      ElMessage.success('配置保存成功')
      showConfigDialog.value = false
    }
  } catch (error) {
    ElMessage.error('配置保存失败')
  }
}

// 工具方法
const getFormatTagType = (format) => {
  const typeMap = {
    pdf: 'danger',
    excel: 'success',
    word: 'primary'
  }
  return typeMap[format] || 'info'
}

const getStatusTagType = (status) => {
  const typeMap = {
    generating: 'warning',
    completed: 'success',
    failed: 'danger',
    pending: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status) => {
  const labelMap = {
    generating: '生成中',
    completed: '已完成',
    failed: '失败',
    pending: '等待中'
  }
  return labelMap[status] || status
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/report/export/index.vue`);
  getReportRecords()
  getTemplateOptions()
  getReportConfig()
})
</script>

<style scoped>
.report-export {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.quick-actions {
  margin-bottom: 20px;
}

.action-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.action-card:hover {
  background: #ecf5ff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.action-icon {
  color: #409eff;
  margin-bottom: 10px;
}

.action-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.action-desc {
  font-size: 12px;
  color: #909399;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.naming-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.report-detail {
  max-height: 500px;
  overflow-y: auto;
}

.error-message {
  margin-top: 15px;
}

.share-content {
  padding: 10px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>