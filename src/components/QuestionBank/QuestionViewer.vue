<template>
  <el-drawer
    v-model="drawerVisible"
    :title="question?.title || '题目详情'"
    size="60%"
    direction="rtl"
    :destroy-on-close="true"
  >
    <div v-if="question" class="question-viewer">
      <!-- 题目头部信息 -->
      <div class="question-header">
        <div class="header-meta">
          <div class="meta-item">
            <span class="label">题型：</span>
            <el-tag :type="getTypeTagType(question.type)" size="small">
              {{ getTypeLabel(question.type) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">难度：</span>
            <el-tag :type="getDifficultyTagType(question.difficulty)" size="small">
              <el-icon><Star /></el-icon>
              {{ getDifficultyLabel(question.difficulty) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">学科：</span>
            <el-tag type="info" size="small">
              {{ getSubjectLabel(question.subject) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">分值：</span>
            <span class="score">{{ question.score || 5 }}分</span>
          </div>
        </div>

        <!-- 题目标签 -->
        <div class="question-tags" v-if="question.tags?.length">
          <span class="label">标签：</span>
          <el-tag
            v-for="tag in question.tags"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
            style="margin-right: 6px"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 选项卡内容 -->
      <el-tabs v-model="activeTab" class="question-tabs">
        <!-- 题目内容 -->
        <el-tab-pane label="题目内容" name="content">
          <div class="content-section">
            <div class="question-content">
              <div class="content-text" v-html="formatContent(question.content || question.questionText)"></div>
            </div>

            <!-- 选择题选项 -->
            <div v-if="['single', 'multiple'].includes(question.type)" class="options-section">
              <h4>选项：</h4>
              <div class="options-list">
                <div
                  v-for="(option, index) in question.options"
                  :key="option.value"
                  class="option-item"
                  :class="getOptionClass(option.value)"
                >
                  <span class="option-label">{{ option.value }}.</span>
                  <span class="option-text">{{ option.text }}</span>
                  <el-icon v-if="isCorrectOption(option.value)" class="correct-icon">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>

            <!-- 填空题答案 -->
            <div v-if="question.type === 'fill'" class="answer-section">
              <h4>参考答案：</h4>
              <div class="answer-content">
                {{ question.correctAnswer }}
              </div>
            </div>

            <!-- 判断题答案 -->
            <div v-if="question.type === 'judge'" class="answer-section">
              <h4>参考答案：</h4>
              <div class="answer-content">
                <el-tag :type="question.correctAnswer ? 'success' : 'danger'">
                  {{ question.correctAnswer ? '正确' : '错误' }}
                </el-tag>
              </div>
            </div>

            <!-- 编程题信息 -->
            <div v-if="question.type === 'programming'" class="programming-section">
              <div class="programming-info">
                <div class="info-item">
                  <span class="label">题目ID：</span>
                  <span class="value">{{ question.problemId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">时间限制：</span>
                  <span class="value">{{ question.timeLimit }}ms</span>
                </div>
                <div class="info-item">
                  <span class="label">内存限制：</span>
                  <span class="value">{{ question.memoryLimit }}MB</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 题目解析 -->
        <el-tab-pane label="题目解析" name="analysis">
          <div class="analysis-section">
            <div class="analysis-content" v-if="question.explanation">
              <div v-html="formatContent(question.explanation)"></div>
            </div>
            <div v-else class="no-content">
              <el-empty description="暂无解析内容" />
            </div>

            <!-- 解题提示 -->
            <div v-if="question.hint" class="hint-section">
              <h4>
                <el-icon><Lightbulb /></el-icon>
                解题提示
              </h4>
              <div class="hint-content" v-html="formatContent(question.hint)"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- AI解题 -->
        <el-tab-pane label="AI解题" name="ai-solution">
          <div class="ai-solution-section">
            <div class="ai-header">
              <el-button
                type="primary"
                :loading="aiLoading"
                @click="generateAISolution"
              >
                <el-icon><MagicStick /></el-icon>
                {{ aiLoading ? 'AI解题中...' : '生成AI解题' }}
              </el-button>
            </div>

            <div v-if="aiSolution" class="ai-content">
              <div class="ai-solution" v-html="formatContent(aiSolution)"></div>
            </div>

            <div v-else-if="!aiLoading" class="no-content">
              <el-empty description="点击上方按钮生成AI解题过程" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 视频讲解 -->
        <el-tab-pane label="视频讲解" name="video">
          <div class="video-section">
            <div class="video-header">
              <el-button
                type="primary"
                @click="showVideoManager = true"
              >
                <el-icon><VideoPlay /></el-icon>
                添加视频讲解
              </el-button>
            </div>

            <div v-if="question.videos?.length" class="video-list">
              <div
                v-for="(video, index) in question.videos"
                :key="index"
                class="video-item"
              >
                <div class="video-info">
                  <h5>{{ video.title }}</h5>
                  <p>{{ video.description }}</p>
                  <div class="video-meta">
                    <span>时长：{{ video.duration }}</span>
                    <span>上传时间：{{ formatDate(video.uploadTime) }}</span>
                  </div>
                </div>
                <div class="video-actions">
                  <el-button size="small" @click="playVideo(video)">
                    <el-icon><VideoPlay /></el-icon>
                    播放
                  </el-button>
                  <el-button size="small" type="danger" @click="removeVideo(index)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <div v-else class="no-content">
              <el-empty description="暂无视频讲解" />
            </div>
          </div>
        </el-tab-pane>

        <!-- 使用统计 -->
        <el-tab-pane label="使用统计" name="stats">
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><View /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ question.useCount || 0 }}</div>
                  <div class="stat-label">使用次数</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ question.studentCount || 0 }}</div>
                  <div class="stat-label">答题人数</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ question.correctRate || 0 }}%</div>
                  <div class="stat-label">正确率</div>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ question.avgTime || 0 }}s</div>
                  <div class="stat-label">平均用时</div>
                </div>
              </div>
            </div>

            <!-- 使用记录 -->
            <div class="usage-history">
              <h4>最近使用记录</h4>
              <el-table :data="usageHistory" size="small">
                <el-table-column prop="type" label="使用类型" />
                <el-table-column prop="title" label="作业/考试名称" />
                <el-table-column prop="className" label="班级" />
                <el-table-column prop="useTime" label="使用时间" />
                <el-table-column prop="result" label="结果" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部操作 -->
      <div class="drawer-footer">
        <el-button @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑题目
        </el-button>
        <el-button type="primary" @click="handleAddToAssignment">
          <el-icon><Document /></el-icon>
          添加到作业
        </el-button>
        <el-button type="success" @click="handleAddToExam">
          <el-icon><DocumentChecked /></el-icon>
          添加到考试
        </el-button>
      </div>
    </div>

    <!-- 视频管理器 -->
    <VideoManager
      v-model="showVideoManager"
      :question-id="question?.id"
      @video-added="handleVideoAdded"
    />
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Star, Check, Lightbulb, MagicStick, VideoPlay, Delete, View,
  User, TrendCharts, Clock, Edit, Document, DocumentChecked
} from '@element-plus/icons-vue'

import VideoManager from './VideoManager.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'edit', 'add-to-assignment', 'add-to-exam'])

// 响应式数据
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('content')
const aiLoading = ref(false)
const aiSolution = ref('')
const showVideoManager = ref(false)

// 模拟使用记录
const usageHistory = ref([
  {
    type: '作业',
    title: 'JavaScript 基础练习',
    className: '前端开发一班',
    useTime: '2024-01-20 14:30',
    result: '正确率 85%'
  },
  {
    type: '考试',
    title: '期中考试',
    className: '前端开发二班',
    useTime: '2024-01-15 09:00',
    result: '正确率 78%'
  }
])

// 方法
const generateAISolution = async () => {
  aiLoading.value = true
  try {
    // 模拟AI生成解题过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    aiSolution.value = `
      <h4>解题思路分析：</h4>
      <p>这道题目考察的是JavaScript中闭包的核心概念。让我们逐步分析：</p>

      <h5>1. 理解闭包的定义</h5>
      <p>闭包是指函数可以访问其作用域链上的变量，即使函数在其定义作用域之外执行。</p>

      <h5>2. 分析各个选项</h5>
      <ul>
        <li><strong>A. 闭包是指函数可以访问外部变量</strong> - ✓ 正确</li>
        <li><strong>B. 闭包会造成内存泄漏</strong> - ✗ 错误，使用不当才会</li>
        <li><strong>C. 闭包只能访问全局变量</strong> - ✗ 错误，可以访问任何作用域变量</li>
        <li><strong>D. 闭包是一种错误</strong> - ✗ 错误，是JavaScript的特性</li>
      </ul>

      <h5>3. 结论</h5>
      <p>选项A正确描述了闭包的核心特征。</p>

      <h5>4. 扩展知识</h5>
      <p>闭包在实际开发中的应用场景包括：</p>
      <ul>
        <li>数据私有化</li>
        <li>函数工厂</li>
        <li>事件处理器</li>
        <li>回调函数</li>
      </ul>
    `

    ElMessage.success('AI解题生成成功')
  } catch (error) {
    ElMessage.error('AI解题生成失败')
  } finally {
    aiLoading.value = false
  }
}

const formatContent = (content) => {
  if (!content) return ''

  // 简单的Markdown转HTML处理
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const isCorrectOption = (optionValue) => {
  if (props.question.type === 'single') {
    return props.question.correctAnswer === optionValue
  }
  if (props.question.type === 'multiple') {
    return props.question.correctAnswers?.includes(optionValue)
  }
  return false
}

const getOptionClass = (optionValue) => {
  return {
    'correct': isCorrectOption(optionValue),
    'option-normal': !isCorrectOption(optionValue)
  }
}

const handleEdit = () => {
  emit('edit', props.question)
}

const handleAddToAssignment = () => {
  emit('add-to-assignment', props.question)
}

const handleAddToExam = () => {
  emit('add-to-exam', props.question)
}

const playVideo = (video) => {
  ElMessage.info(`播放视频：${video.title}`)
}

const removeVideo = (index) => {
  if (props.question.videos) {
    props.question.videos.splice(index, 1)
    ElMessage.success('视频删除成功')
  }
}

const handleVideoAdded = (video) => {
  if (!props.question.videos) {
    props.question.videos = []
  }
  props.question.videos.push(video)
  ElMessage.success('视频添加成功')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// 辅助方法
const getTypeLabel = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    fill: '填空题',
    judge: '判断题',
    programming: '编程题',
    essay: '简答题'
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

const getSubjectLabel = (subject) => {
  const subjectMap = {
    cs: '计算机科学',
    math: '数学',
    physics: '物理',
    chemistry: '化学',
    english: '英语'
  }
  return subjectMap[subject] || subject
}
</script>

<style lang="scss" scoped>
.question-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;

  .question-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-lighter);

    .header-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;

        .label {
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .score {
          font-weight: 600;
          color: var(--color-primary);
        }
      }
    }

    .question-tags {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;

      .label {
        color: var(--color-text-secondary);
        font-size: 14px;
      }
    }
  }

  .question-tabs {
    flex: 1;
    overflow: hidden;

    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      overflow-y: auto;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .content-section {
    .question-content {
      margin-bottom: 24px;

      .content-text {
        line-height: 1.8;
        font-size: 15px;
        color: var(--color-text-primary);
      }
    }

    .options-section {
      h4 {
        margin: 0 0 16px 0;
        color: var(--color-text-primary);
      }

      .options-list {
        .option-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          border: 1px solid var(--color-border-lighter);

          &.correct {
            background-color: var(--color-success-light-9);
            border-color: var(--color-success);
          }

          .option-label {
            font-weight: 600;
            color: var(--color-text-primary);
            min-width: 24px;
          }

          .option-text {
            flex: 1;
            color: var(--color-text-primary);
          }

          .correct-icon {
            color: var(--color-success);
            font-size: 18px;
          }
        }
      }
    }

    .answer-section, .programming-section {
      margin-top: 24px;
      padding: 16px;
      background-color: var(--color-bg-secondary);
      border-radius: 8px;

      h4 {
        margin: 0 0 12px 0;
        color: var(--color-text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .answer-content {
        line-height: 1.6;
        color: var(--color-text-primary);
      }

      .programming-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .label {
            color: var(--color-text-secondary);
          }

          .value {
            font-weight: 600;
            color: var(--color-text-primary);
          }
        }
      }
    }
  }

  .analysis-section {
    .analysis-content {
      line-height: 1.8;
      color: var(--color-text-primary);
    }

    .hint-section {
      margin-top: 24px;
      padding: 16px;
      background-color: var(--color-warning-light-9);
      border-radius: 8px;
      border-left: 4px solid var(--color-warning);

      h4 {
        margin: 0 0 12px 0;
        color: var(--color-warning-dark-2);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hint-content {
        line-height: 1.6;
        color: var(--color-text-primary);
      }
    }
  }

  .ai-solution-section {
    .ai-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .ai-content {
      .ai-solution {
        line-height: 1.8;
        color: var(--color-text-primary);

        :deep(h4) {
          color: var(--color-primary);
          margin: 20px 0 12px 0;
        }

        :deep(h5) {
          color: var(--color-text-primary);
          margin: 16px 0 8px 0;
        }

        :deep(ul), :deep(ol) {
          margin: 12px 0;
          padding-left: 20px;
        }

        :deep(li) {
          margin: 6px 0;
        }
      }
    }
  }

  .video-section {
    .video-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .video-list {
      .video-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid var(--color-border-lighter);
        border-radius: 8px;

        .video-info {
          flex: 1;

          h5 {
            margin: 0 0 8px 0;
            color: var(--color-text-primary);
          }

          p {
            margin: 0 0 8px 0;
            color: var(--color-text-secondary);
            font-size: 14px;
          }

          .video-meta {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: var(--color-text-secondary);
          }
        }

        .video-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .stats-section {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: linear-gradient(135deg, var(--color-primary-light-9) 0%, var(--color-primary-light-7) 100%);
        border-radius: 8px;

        .stat-icon {
          width: 48px;
          height: 48px;
          background: var(--color-primary);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-content {
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: var(--color-primary-dark-2);
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: var(--color-text-secondary);
            margin-top: 4px;
          }
        }
      }
    }

    .usage-history {
      h4 {
        margin: 0 0 16px 0;
        color: var(--color-text-primary);
      }
    }
  }

  .no-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .drawer-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-lighter);
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
    }
  }
}
</style>