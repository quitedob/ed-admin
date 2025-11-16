<template>
  <div class="settings-panel">
    <el-card>
      <template #header>
        <div class="panel-header">
          <span>{{ title }}</span>
          <el-button type="text" @click="resetSettings">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </template>

      <div class="settings-content">
        <slot>
          <!-- 默认设置项 -->
          <el-form :model="settingsData" label-width="120px">
            <!-- 基础设置 -->
            <div v-if="showBasic" class="settings-section">
              <h4>基础设置</h4>
              <el-form-item label="标题">
                <el-input v-model="settingsData.title" placeholder="请输入标题" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input
                  v-model="settingsData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入描述"
                />
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="settingsData.type" placeholder="请选择类型">
                  <el-option
                    v-for="option in typeOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="难度">
                <el-select v-model="settingsData.difficulty" placeholder="请选择难度">
                  <el-option
                    v-for="option in difficultyOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <!-- 高级设置 -->
            <div v-if="showAdvanced" class="settings-section">
              <h4>高级设置</h4>
              <el-form-item label="时间限制">
                <el-input-number
                  v-model="settingsData.timeLimit"
                  :min="0"
                  placeholder="分钟"
                  :disabled="!settingsData.enableTimeLimit"
                />
                <el-switch
                  v-model="settingsData.enableTimeLimit"
                  style="margin-left: 12px"
                />
              </el-form-item>
              <!-- 考试类才有及格分数设置 -->
              <el-form-item v-if="['exam', 'quiz'].includes(settingsData.type)" label="及格分数">
                <el-input-number
                  v-model="settingsData.passingScore"
                  :min="0"
                  :max="settingsData.totalScore || 100"
                  placeholder="60"
                />
              </el-form-item>

              <!-- 作业类显示完成度要求 -->
              <el-form-item v-else label="完成度要求">
                <el-input-number
                  v-model="settingsData.completionRequirement"
                  :min="0"
                  :max="100"
                  placeholder="100"
                />
                <span style="margin-left: 8px; color: #909399;">%</span>
              </el-form-item>
              <el-form-item label="选项">
                <el-checkbox-group v-model="settingsData.options">
                  <el-checkbox
                    v-for="option in getFilteredOptions()"
                    :key="option.value"
                    :label="option.value"
                  >
                    {{ option.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>

            <!-- 样式设置 -->
            <div v-if="showStyle" class="settings-section">
              <h4>样式设置</h4>
              <el-form-item label="主题">
                <el-radio-group v-model="settingsData.theme">
                  <el-radio label="light">浅色</el-radio>
                  <el-radio label="dark">深色</el-radio>
                  <el-radio label="auto">自动</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="字体大小">
                <el-slider
                  v-model="settingsData.fontSize"
                  :min="12"
                  :max="20"
                  :step="1"
                  show-input
                  :show-input-controls="false"
                  input-size="small"
                />
              </el-form-item>
              <el-form-item label="页面布局">
                <el-radio-group v-model="settingsData.layout">
                  <el-radio label="single">单列</el-radio>
                  <el-radio label="double">双列</el-radio>
                  <el-radio label="responsive">响应式</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-form>
        </slot>
      </div>

      <!-- 操作按钮 -->
      <div class="panel-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '设置面板'
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  showBasic: {
    type: Boolean,
    default: true
  },
  showAdvanced: {
    type: Boolean,
    default: true
  },
  showStyle: {
    type: Boolean,
    default: false
  },
  typeOptions: {
    type: Array,
    default: () => [
      { label: '作业', value: 'homework' },
      { label: '考试', value: 'exam' },
      { label: '练习', value: 'exercise' },
      { label: '测验', value: 'quiz' }
    ]
  },
  difficultyOptions: {
    type: Array,
    default: () => [
      { label: '简单', value: 'easy' },
      { label: '中等', value: 'medium' },
      { label: '困难', value: 'hard' },
      { label: '混合', value: 'mixed' }
    ]
  },
  advancedOptions: {
    type: Array,
    default: () => [
      { label: '随机排序', value: 'randomOrder' },
      { label: '显示答案', value: 'showAnswers' },
      { label: '自动评分', value: 'autoGrading' },
      { label: '允许查看答案', value: 'allowReview' },
      { label: '显示解题提示', value: 'showHints' },
      { label: '自动提交', value: 'autoSubmit' },
      { label: '防复制', value: 'preventCopy' }
    ]
  }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel', 'reset'])

// 设置数据
const settingsData = reactive({
  title: '',
  description: '',
  type: 'homework',
  difficulty: 'medium',
  totalScore: 100,
  enableTimeLimit: false,
  timeLimit: 60,
  passingScore: 60,
  completionRequirement: 100,
  options: [],
  theme: 'light',
  fontSize: 14,
  layout: 'responsive'
})

// 默认设置
const defaultSettings = {
  title: '',
  description: '',
  type: 'homework',
  difficulty: 'medium',
  totalScore: 100,
  enableTimeLimit: false,
  timeLimit: 60,
  passingScore: 60,
  completionRequirement: 100,
  options: [],
  theme: 'light',
  fontSize: 14,
  layout: 'responsive'
}

// 监听数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(settingsData, newVal)
  }
}, { immediate: true, deep: true })

watch(settingsData, () => {
  emit('update:modelValue', { ...settingsData })
}, { deep: true })

// 方法
const getFilteredOptions = () => {
  if (['exam', 'quiz'].includes(settingsData.type)) {
    // 考试类显示所有选项
    return props.advancedOptions
  } else {
    // 作业类移除评分相关选项
    return props.advancedOptions.filter(option =>
      !['autoGrading', 'showAnswers'].includes(option.value)
    )
  }
}

const resetSettings = () => {
  Object.assign(settingsData, defaultSettings)
  emit('reset')
}

const handleSave = () => {
  emit('save', { ...settingsData })
}

const handleCancel = () => {
  emit('cancel')
}

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/components/SettingsPanel.vue`);
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    Object.assign(settingsData, props.modelValue)
  }
})
</script>

<style scoped>
.settings-panel {
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-content {
  max-height: 60vh;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 表单项样式调整 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
}

:deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

/* 滑块样式 */
:deep(.el-slider) {
  margin: 0 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-section h4 {
    font-size: 14px;
  }

  :deep(.el-checkbox-group) {
    grid-template-columns: 1fr;
  }

  :deep(.el-radio-group) {
    flex-direction: column;
    gap: 8px;
  }

  .panel-actions {
    justify-content: center;
  }
}
</style>