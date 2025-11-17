<template>
  <div class="system-settings">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基础设置 -->
        <el-tab-pane label="基础设置" name="basic">
          <el-form :model="settings.basic" label-width="150px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.basic.systemName" />
            </el-form-item>

            <el-form-item label="系统描述">
              <el-input
                v-model="settings.basic.systemDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <el-form-item label="系统Logo">
              <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleLogoUpload"
              >
                <template #trigger>
                  <el-button type="primary">上传Logo</el-button>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item label="主题色">
              <el-color-picker v-model="settings.basic.themeColor" show-alpha />
            </el-form-item>

            <el-form-item label="语言">
              <el-select v-model="settings.basic.language">
                <el-option label="中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>

            <el-form-item label="时区">
              <el-select v-model="settings.basic.timezone">
                <el-option label="UTC+8 (北京时间)" value="Asia/Shanghai" />
                <el-option label="UTC+0 (伦敦时间)" value="Europe/London" />
                <el-option label="UTC-5 (纽约时间)" value="America/New_York" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="settings.notification" label-width="150px">
            <el-form-item label="启用系统通知">
              <el-switch v-model="settings.notification.enabled" />
            </el-form-item>

            <el-form-item label="作业通知">
              <el-checkbox-group v-model="settings.notification.homework">
                <el-checkbox label="created">作业创建</el-checkbox>
                <el-checkbox label="published">作业发布</el-checkbox>
                <el-checkbox label="submitted">作业提交</el-checkbox>
                <el-checkbox label="deadline">截止提醒</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="考试通知">
              <el-checkbox-group v-model="settings.notification.exam">
                <el-checkbox label="created">考试创建</el-checkbox>
                <el-checkbox label="starting">考试开始</el-checkbox>
                <el-checkbox label="ended">考试结束</el-checkbox>
                <el-checkbox label="graded">批改完成</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="学生通知">
              <el-checkbox-group v-model="settings.notification.student">
                <el-checkbox label="joined">加入班级</el-checkbox>
                <el-checkbox label="left">离开班级</el-checkbox>
                <el-checkbox label="score">成绩发布</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="通知方式">
              <el-checkbox-group v-model="settings.notification.methods">
                <el-checkbox label="system">系统通知</el-checkbox>
                <el-checkbox label="email">邮件通知</el-checkbox>
                <el-checkbox label="sms">短信通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="通知声音">
              <el-switch v-model="settings.notification.sound" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 数据设置 -->
        <el-tab-pane label="数据设置" name="data">
          <el-form :model="settings.data" label-width="150px">
            <el-form-item label="自动备份">
              <el-switch v-model="settings.data.autoBackup" />
            </el-form-item>

            <el-form-item label="备份频率" v-if="settings.data.autoBackup">
              <el-select v-model="settings.data.backupFrequency">
                <el-option label="每天" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
              </el-select>
            </el-form-item>

            <el-form-item label="数据保留期限">
              <el-input-number v-model="settings.data.retentionDays" :min="1" /> 天
            </el-form-item>

            <el-form-item label="导出格式">
              <el-checkbox-group v-model="settings.data.exportFormats">
                <el-checkbox label="excel">Excel</el-checkbox>
                <el-checkbox label="csv">CSV</el-checkbox>
                <el-checkbox label="json">JSON</el-checkbox>
                <el-checkbox label="pdf">PDF</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="启用数据加密">
              <el-switch v-model="settings.data.encryption" />
            </el-form-item>

            <el-form-item>
              <el-button @click="handleBackupNow">立即备份</el-button>
              <el-button @click="handleExportData">导出数据</el-button>
              <el-button @click="handleClearCache">清空缓存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="settings.security" label-width="150px">
            <el-form-item label="启用两步验证">
              <el-switch v-model="settings.security.twoFactorAuth" />
            </el-form-item>

            <el-form-item label="会话超时时间">
              <el-input-number v-model="settings.security.sessionTimeout" :min="5" /> 分钟
            </el-form-item>

            <el-form-item label="密码过期天数">
              <el-input-number v-model="settings.security.passwordExpireDays" :min="0" /> 天
            </el-form-item>

            <el-form-item label="启用IP白名单">
              <el-switch v-model="settings.security.ipWhitelist" />
            </el-form-item>

            <el-form-item label="启用操作日志">
              <el-switch v-model="settings.security.operationLog" />
            </el-form-item>

            <el-form-item label="启用登录日志">
              <el-switch v-model="settings.security.loginLog" />
            </el-form-item>

            <el-form-item>
              <el-button @click="handleChangePassword">修改密码</el-button>
              <el-button @click="handleViewLogs">查看日志</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 高级设置 -->
        <el-tab-pane label="高级设置" name="advanced">
          <el-form :model="settings.advanced" label-width="150px">
            <el-form-item label="启用API">
              <el-switch v-model="settings.advanced.apiEnabled" />
            </el-form-item>

            <el-form-item label="API速率限制">
              <el-input-number v-model="settings.advanced.apiRateLimit" :min="1" /> 请求/分钟
            </el-form-item>

            <el-form-item label="启用WebSocket">
              <el-switch v-model="settings.advanced.websocketEnabled" />
            </el-form-item>

            <el-form-item label="启用缓存">
              <el-switch v-model="settings.advanced.cacheEnabled" />
            </el-form-item>

            <el-form-item label="缓存过期时间">
              <el-input-number v-model="settings.advanced.cacheTTL" :min="1" /> 分钟
            </el-form-item>

            <el-form-item label="启用CDN">
              <el-switch v-model="settings.advanced.cdnEnabled" />
            </el-form-item>

            <el-form-item label="CDN地址">
              <el-input v-model="settings.advanced.cdnUrl" :disabled="!settings.advanced.cdnEnabled" />
            </el-form-item>

            <el-form-item>
              <el-button @click="handleTestConnection">测试连接</el-button>
              <el-button @click="handleResetSettings">重置为默认设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="form-actions" style="margin-top: 20px">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('basic')

const settings = reactive({
  basic: {
    systemName: '教育管理系统',
    systemDescription: '一个完整的教育管理系统',
    themeColor: '#409EFF',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai'
  },
  notification: {
    enabled: true,
    homework: ['created', 'published', 'submitted', 'deadline'],
    exam: ['created', 'starting', 'ended', 'graded'],
    student: ['joined', 'left', 'score'],
    methods: ['system', 'email'],
    sound: true
  },
  data: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 90,
    exportFormats: ['excel', 'csv', 'json'],
    encryption: true
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpireDays: 90,
    ipWhitelist: false,
    operationLog: true,
    loginLog: true
  },
  advanced: {
    apiEnabled: true,
    apiRateLimit: 1000,
    websocketEnabled: true,
    cacheEnabled: true,
    cacheTTL: 60,
    cdnEnabled: false,
    cdnUrl: ''
  }
})

const handleLogoUpload = (file) => {
  ElMessage.success('Logo已上传')
}

const handleBackupNow = () => {
  ElMessage.success('备份已启动，请稍候...')
}

const handleExportData = () => {
  ElMessage.success('数据导出已启动')
}

const handleClearCache = () => {
  ElMessageBox.confirm('确定要清空缓存吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('缓存已清空')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}

const handleChangePassword = () => {
  ElMessage.info('修改密码功能开发中...')
}

const handleViewLogs = () => {
  ElMessage.info('查看日志功能开发中...')
}

const handleTestConnection = () => {
  ElMessage.success('连接测试成功')
}

const handleResetSettings = () => {
  ElMessageBox.confirm('确定要重置为默认设置吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已重置为默认设置')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}

const handleSave = () => {
  ElMessage.success('设置已保存')
}

const handleCancel = () => {
  ElMessage.info('已取消')
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
