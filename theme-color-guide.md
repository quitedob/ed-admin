# 教育平台主题色彩系统设计方案

## 一、核心问题分析

### 1.1 当前平台存在的问题
- **课程内容渲染问题**：只支持单向流程，无法动态渲染视频、PDF、图片等多种资源
- **作业和试卷问题**：无法支持JSON格式的动态渲染
- **UI颜色不统一**：缺乏系统的色彩规范，影响用户体验

### 1.2 需求分析
根据您提供的JSON格式，系统需要支持：
- 课程基础信息（元数据、章节、小节、资源）
- 作业系统（单选、多选、填空、问答题）
- 考试系统（题库、组卷、评分）
- 多媒体资源（视频、PDF、图片）

---

## 二、主题色彩系统设计

### 2.1 白天模式（Light Theme）

#### 主色调设计
```css
/* 主色 - 专业蓝色渐变系统 */
--color-primary-50: #eff6ff;    /* 极浅蓝 - 背景提示 */
--color-primary-100: #dbeafe;   /* 浅蓝 - 悬停背景 */
--color-primary-200: #bfdbfe;   /* 亮蓝 - 边框 */
--color-primary-300: #93c5fd;   /* 中浅蓝 - 次要元素 */
--color-primary-400: #60a5fa;   /* 中蓝 - 图标 */
--color-primary-500: #3b82f6;   /* 标准蓝 - 主按钮 */
--color-primary-600: #2563eb;   /* 深蓝 - 按钮悬停 */
--color-primary-700: #1d4ed8;   /* 更深蓝 - 强调 */
--color-primary-800: #1e40af;   /* 暗蓝 - 标题 */
--color-primary-900: #1e3a8a;   /* 最深蓝 - 深色文本 */

/* 主渐变 */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
--gradient-primary-hover: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
```

#### 语义色系统
```css
/* 成功色 - 青绿色（适合教育场景） */
--color-success: #4ecdc4;
--color-success-light: #e6f7f6;
--color-success-hover: #44a08d;
--gradient-success: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);

/* 警告色 - 粉紫色（柔和醒目） */
--color-warning: #ff9ff3;
--color-warning-light: #ffe6fb;
--color-warning-hover: #f368e0;
--gradient-warning: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%);

/* 危险色 - 珊瑚红（友好的错误提示） */
--color-danger: #ff6b6b;
--color-danger-light: #ffe6e6;
--color-danger-hover: #ee5a52;
--gradient-danger: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);

/* 信息色 - 中性灰 */
--color-info: #909399;
--color-info-light: #f4f4f5;
--color-info-hover: #73767a;
--gradient-info: linear-gradient(135deg, #909399 0%, #73767a 100%);
```

#### 背景色系统
```css
/* 背景层次 */
--color-bg-primary: #ffffff;      /* 主背景 - 卡片、对话框 */
--color-bg-secondary: #f8f9fa;    /* 次背景 - 侧边栏、表头 */
--color-bg-tertiary: #f9f9f9;     /* 第三层 - 悬停状态 */
--color-bg-overlay: rgba(255, 255, 255, 0.8);  /* 遮罩 */
--color-bg-mask: rgba(0, 0, 0, 0.5);           /* 暗色遮罩 */
```

#### 文本色系统
```css
/* 文本层次 */
--color-text-primary: #303133;     /* 主文本 - 标题、正文 */
--color-text-secondary: #606266;   /* 次文本 - 描述、辅助 */
--color-text-tertiary: #909399;    /* 第三层 - 占位符、禁用 */
--color-text-placeholder: #c0c4cc; /* 占位符 */
--color-text-inverse: #ffffff;     /* 反色文本 - 用于深色背景 */
```

#### 边框与阴影
```css
/* 边框 */
--color-border-light: #f0f0f0;     /* 轻边框 - 分隔线 */
--color-border-base: #dcdfe6;      /* 基础边框 - 输入框 */
--color-border-dark: #e4e7ed;      /* 深边框 - 强调 */

/* 阴影 */
--color-shadow-light: rgba(0, 0, 0, 0.04);    /* 轻阴影 - 悬停 */
--color-shadow-base: rgba(0, 0, 0, 0.08);     /* 基础阴影 - 卡片 */
--color-shadow-medium: rgba(0, 0, 0, 0.12);   /* 中阴影 - 弹窗 */
--color-shadow-dark: rgba(0, 0, 0, 0.15);     /* 深阴影 - 强调 */
--color-shadow-primary: rgba(59, 130, 246, 0.3);      /* 主色阴影 */
--color-shadow-primary-hover: rgba(59, 130, 246, 0.4); /* 主色悬停阴影 */
```

#### 教育场景专用色
```css
/* 分数等级色 */
--color-score-excellent: #67c23a;  /* 优秀(90+) - 亮绿 */
--color-score-good: #4ecdc4;       /* 良好(80-89) - 青绿 */
--color-score-average: #e6a23c;    /* 中等(70-79) - 橙色 */
--color-score-poor: #f56c6c;       /* 及格(60-69) - 橙红 */
--color-score-fail: #d54a4a;       /* 不及格(<60) - 深红 */

/* 图表色板（适合数据可视化） */
--color-chart-1: #3b82f6;  /* 蓝色 */
--color-chart-2: #2563eb;  /* 深蓝 */
--color-chart-3: #4ecdc4;  /* 青绿 */
--color-chart-4: #ff9ff3;  /* 粉紫 */
--color-chart-5: #ff6b6b;  /* 珊瑚红 */
--color-chart-6: #feca57;  /* 金黄 */
```

---

### 2.2 黑夜模式（Dark Theme）

#### 主色调设计
```css
/* 深色背景层次 */
--color-bg-primary: #1a1a1a;       /* 主背景 - 最深 */
--color-bg-secondary: #2a2a2a;     /* 次背景 - 卡片 */
--color-bg-tertiary: #333333;      /* 第三层 - 悬停 */
--color-bg-overlay: rgba(26, 26, 26, 0.8);  /* 遮罩 */
--color-bg-mask: rgba(0, 0, 0, 0.7);        /* 暗色遮罩 */
```

#### 文本色系统
```css
/* 深色模式文本 */
--color-text-primary: #e0e0e0;     /* 主文本 - 高对比度 */
--color-text-secondary: #b0b0b0;   /* 次文本 */
--color-text-tertiary: #808080;    /* 第三层 */
--color-text-placeholder: #606060; /* 占位符 */
```

#### 边框与阴影
```css
/* 深色边框 */
--color-border-light: #333333;
--color-border-base: #404040;
--color-border-dark: #4a4a4a;

/* 深色阴影（更深） */
--color-shadow-light: rgba(0, 0, 0, 0.2);
--color-shadow-base: rgba(0, 0, 0, 0.3);
--color-shadow-medium: rgba(0, 0, 0, 0.4);
--color-shadow-dark: rgba(0, 0, 0, 0.5);
```

#### 调整后的主色
```css
/* 深色模式下的主色需要略微调整以保持可读性 */
--gradient-primary: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
--gradient-success: linear-gradient(135deg, #44a08d 0%, #3d8b7c 100%);
--gradient-warning: linear-gradient(135deg, #f368e0 0%, #e056d1 100%);
--gradient-danger: linear-gradient(135deg, #ee5a52 0%, #d64541 100%);
```

#### 特殊效果（深色模式专属）
```css
/* 发光效果 - 用于强调重要元素 */
.glow-primary {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}

.glow-success {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.4);
}

.glow-warning {
  box-shadow: 0 0 20px rgba(255, 159, 243, 0.4);
}

.glow-danger {
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.4);
}
```

---

## 三、主题切换实现方案

### 3.1 CSS变量配置文件

创建 `src/assets/styles/themes.scss`：

```scss
// 主题变量混入
@mixin theme-variables($theme: 'light') {
  @if $theme == 'dark' {
    // Dark theme variables
    --color-bg-primary: #1a1a1a;
    --color-bg-secondary: #2a2a2a;
    --color-bg-tertiary: #333333;
    --color-text-primary: #e0e0e0;
    --color-text-secondary: #b0b0b0;
    // ... 所有深色变量
  }
}

// 自动切换（根据系统设置）
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    @include theme-variables('dark');
  }
}

// 手动切换
[data-theme="dark"] {
  @include theme-variables('dark');
}

[data-theme="light"] {
  // Light theme已在:root中定义
}
```

### 3.2 Vue组件中的主题切换

创建主题切换按钮组件 `ThemeToggle.vue`：

```vue
<template>
  <button class="theme-toggle" @click="toggleTheme">
    <el-icon v-if="currentTheme === 'light'"><Sunny /></el-icon>
    <el-icon v-else><Moon /></el-icon>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const currentTheme = ref('light')

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
  currentTheme.value = newTheme
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  // 读取用户偏好
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  currentTheme.value = savedTheme
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-round);
  background: var(--gradient-primary);
  border: none;
  cursor: pointer;
  transition: var(--transition);
  color: var(--color-text-inverse);
}

.theme-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px var(--color-shadow-primary-hover);
}

.theme-toggle:active {
  transform: scale(0.95);
}
</style>
```

---

## 四、JSON动态渲染组件设计

### 4.1 课程内容渲染组件

创建 `CourseContentRenderer.vue`：

```vue
<template>
  <div class="course-content-renderer">
    <!-- 课程基础信息 -->
    <el-card class="course-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>{{ courseData.basicInfo?.title }}</h2>
          <el-tag :type="getStatusType(courseData.schedule?.publishStatus)">
            {{ getStatusText(courseData.schedule?.publishStatus) }}
          </el-tag>
        </div>
      </template>
      
      <div class="course-meta">
        <div class="meta-item">
          <span class="label">教师：</span>
          <span>{{ courseData.basicInfo?.teacher?.name }}</span>
        </div>
        <div class="meta-item">
          <span class="label">课时：</span>
          <span>{{ courseData.basicInfo?.duration }} 学时</span>
        </div>
        <div class="meta-item">
          <span class="label">难度：</span>
          <el-tag size="small">{{ getLevelText(courseData.basicInfo?.level) }}</el-tag>
        </div>
      </div>
      
      <div class="course-description">
        {{ courseData.basicInfo?.description }}
      </div>
    </el-card>

    <!-- 章节列表 -->
    <div class="chapters-section">
      <h3>课程大纲</h3>
      <el-collapse v-model="activeChapters" accordion>
        <el-collapse-item 
          v-for="chapter in courseData.chapters" 
          :key="chapter.id"
          :name="chapter.id"
        >
          <template #title>
            <div class="chapter-title">
              <span class="chapter-number">第{{ chapter.number }}章</span>
              <span class="chapter-name">{{ chapter.title }}</span>
            </div>
          </template>
          
          <!-- 小节列表 -->
          <div class="sections-list">
            <div 
              v-for="section in chapter.sections" 
              :key="section.id"
              class="section-item"
              @click="handleSectionClick(section)"
            >
              <div class="section-header">
                <el-icon class="section-icon">
                  <VideoPlay v-if="section.contentType === 'video'" />
                  <Document v-else-if="section.contentType === 'document'" />
                  <Picture v-else-if="section.contentType === 'image'" />
                </el-icon>
                <span class="section-number">{{ section.number }}</span>
                <span class="section-title">{{ section.title }}</span>
              </div>
              
              <div class="section-meta">
                <span v-if="section.duration" class="duration">
                  {{ formatDuration(section.duration) }}
                </span>
                <el-tag 
                  v-if="section.practice?.questions" 
                  size="small" 
                  type="warning"
                >
                  {{ section.practice.questions }} 道练习题
                </el-tag>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 资源渲染区域 -->
    <div v-if="currentSection" class="resource-viewer">
      <div class="viewer-header">
        <h3>{{ currentSection.title }}</h3>
        <el-button @click="currentSection = null">关闭</el-button>
      </div>
      
      <!-- 视频播放器 -->
      <div v-if="currentSection.contentType === 'video'" class="video-player">
        <video 
          :src="currentSection.contentUrl" 
          controls 
          controlsList="nodownload"
          style="width: 100%; max-height: 500px;"
        ></video>
      </div>
      
      <!-- PDF查看器 -->
      <div v-else-if="currentSection.contentType === 'document'" class="pdf-viewer">
        <iframe 
          :src="`${currentSection.contentUrl}#view=FitH`" 
          style="width: 100%; height: 600px; border: none;"
        ></iframe>
      </div>
      
      <!-- 图片展示 -->
      <div v-else-if="currentSection.contentType === 'image'" class="image-viewer">
        <div v-if="currentSection.resources?.materials" class="image-gallery">
          <el-image 
            v-for="material in currentSection.resources.materials.filter(m => m.type === 'image')"
            :key="material.id"
            :src="material.url"
            :preview-src-list="getImageList(currentSection.resources.materials)"
            fit="contain"
            class="gallery-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      
      <!-- 资源下载列表 -->
      <div v-if="currentSection.resources?.materials?.length" class="materials-list">
        <h4>课程资料</h4>
        <div 
          v-for="material in currentSection.resources.materials" 
          :key="material.id"
          class="material-item"
        >
          <el-icon><Document /></el-icon>
          <span>{{ material.title }}</span>
          <el-button 
            type="primary" 
            size="small" 
            @click="downloadResource(material.url)"
          >
            下载
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { VideoPlay, Document, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  courseData: {
    type: Object,
    required: true
  }
})

const activeChapters = ref([])
const currentSection = ref(null)

const handleSectionClick = (section) => {
  currentSection.value = section
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes} 分钟`
}

const getImageList = (materials) => {
  return materials
    .filter(m => m.type === 'image')
    .flatMap(m => m.images?.map(img => img.url) || [])
}

const downloadResource = (url) => {
  window.open(url, '_blank')
}

const getStatusType = (status) => {
  const typeMap = {
    'published': 'success',
    'draft': 'info',
    'unpublished': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'published': '已发布',
    'draft': '草稿',
    'unpublished': '已下架'
  }
  return textMap[status] || status
}

const getLevelText = (level) => {
  const textMap = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return textMap[level] || level
}
</script>

<style scoped>
.course-content-renderer {
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
}

.course-info-card {
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
}

.course-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.course-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.chapters-section {
  background: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
}

.chapters-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 600;
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chapter-number {
  color: var(--color-primary-500);
  font-weight: 600;
}

.sections-list {
  padding: var(--spacing-sm) 0;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition);
}

.section-item:hover {
  background: var(--color-primary-50);
  transform: translateX(4px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-icon {
  color: var(--color-primary-500);
  font-size: 20px;
}

.section-number {
  color: var(--color-text-tertiary);
  min-width: 40px;
}

.section-title {
  color: var(--color-text-primary);
  font-weight: 500;
}

.section-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.duration {
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.resource-viewer {
  margin-top: var(--spacing-lg);
  background: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.viewer-header h3 {
  margin: 0;
  color: var(--color-text-primary);
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
}

.gallery-image {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-base);
  overflow: hidden;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);
}

.materials-list {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.materials-list h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
}

.material-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-sm);
}

.material-item span {
  flex: 1;
  color: var(--color-text-primary);
}
</style>
```

### 4.2 作业渲染组件

创建 `HomeworkRenderer.vue`：

```vue
<template>
  <div class="homework-renderer">
    <el-card class="homework-header-card" shadow="hover">
      <template #header>
        <div class="header-content">
          <h2>{{ homeworkData.basicInfo?.title }}</h2>
          <el-tag :type="getDifficultyType(homeworkData.basicInfo?.difficulty)">
            {{ getDifficultyText(homeworkData.basicInfo?.difficulty) }}
          </el-tag>
        </div>
      </template>
      
      <div class="homework-meta">
        <div class="meta-item">
          <span class="label">截止时间：</span>
          <span>{{ formatDate(homeworkData.schedule?.dueDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="label">题目数量：</span>
          <span>{{ homeworkData.questions?.length || 0 }} 题</span>
        </div>
        <div class="meta-item">
          <span class="label">总分：</span>
          <span class="score">{{ calculateTotalScore() }} 分</span>
        </div>
      </div>
      
      <div class="homework-description">
        {{ homeworkData.basicInfo?.description }}
      </div>
    </el-card>

    <div class="questions-section">
      <div 
        v-for="(question, index) in homeworkData.questions" 
        :key="question.id"
        class="question-card"
      >
        <div class="question-header">
          <span class="question-number">{{ index + 1 }}.</span>
          <el-tag 
            :type="getQuestionTypeColor(question.type)" 
            size="small"
          >
            {{ getQuestionTypeLabel(question.type) }}
          </el-tag>
          <span class="question-score">({{ question.score }} 分)</span>
          <el-tag 
            v-if="question.difficulty" 
            :type="getDifficultyType(question.difficulty)"
            size="small"
          >
            {{ getDifficultyText(question.difficulty) }}
          </el-tag>
        </div>
        
        <div class="question-content">
          <div class="question-text" v-html="question.questionText"></div>
          
          <!-- 单选题 -->
          <el-radio-group 
            v-if="question.type === 'single'" 
            v-model="answers[question.id]"
            class="options-group"
          >
            <el-radio 
              v-for="option in question.options" 
              :key="option.id"
              :label="option.value"
              class="option-item"
            >
              {{ option.value }}. {{ option.text }}
            </el-radio>
          </el-radio-group>
          
          <!-- 多选题 -->
          <el-checkbox-group 
            v-else-if="question.type === 'multiple'" 
            v-model="answers[question.id]"
            class="options-group"
          >
            <el-checkbox 
              v-for="option in question.options" 
              :key="option.id"
              :label="option.value"
              class="option-item"
            >
              {{ option.value }}. {{ option.text }}
            </el-checkbox>
          </el-checkbox-group>
          
          <!-- 填空题 -->
          <div v-else-if="question.type === 'fill'" class="fill-input">
            <el-input
              v-for="(blank, idx) in question.correctAnswers?.length || 1"
              :key="idx"
              v-model="answers[question.id][idx]"
              placeholder="请输入答案"
              class="fill-blank"
            />
          </div>
          
          <!-- 问答题 -->
          <el-input
            v-else-if="question.type === 'essay'"
            v-model="answers[question.id]"
            type="textarea"
            :rows="6"
            placeholder="请输入你的答案..."
            class="essay-input"
          />
        </div>
        
        <!-- 显示答案和解析（仅在设置允许时） -->
        <div 
          v-if="showAnswers && (question.correctAnswer || question.correctAnswers)" 
          class="question-answer"
        >
          <div class="answer-section">
            <span class="answer-label">正确答案：</span>
            <span class="answer-content">
              {{ formatCorrectAnswer(question) }}
            </span>
          </div>
          <div v-if="question.explanation" class="explanation-section">
            <span class="explanation-label">解析：</span>
            <span class="explanation-content">{{ question.explanation }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="submit-section">
      <el-button 
        type="primary" 
        size="large" 
        @click="handleSubmit"
        :loading="submitting"
      >
        提交作业
      </el-button>
      <el-button 
        size="large" 
        @click="handleSaveDraft"
      >
        保存草稿
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  homeworkData: {
    type: Object,
    required: true
  },
  showAnswers: {
    type: Boolean,
    default: false
  }
})

const answers = reactive({})
const submitting = ref(false)

// 初始化答案对象
const initAnswers = () => {
  props.homeworkData.questions?.forEach(question => {
    if (question.type === 'fill') {
      answers[question.id] = new Array(question.correctAnswers?.length || 1).fill('')
    } else if (question.type === 'multiple') {
      answers[question.id] = []
    } else {
      answers[question.id] = ''
    }
  })
}

initAnswers()

const calculateTotalScore = () => {
  return props.homeworkData.questions?.reduce((sum, q) => sum + (q.score || 0), 0) || 0
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getQuestionTypeColor = (type) => {
  const colorMap = {
    'single': 'primary',
    'multiple': 'success',
    'fill': 'warning',
    'essay': 'danger'
  }
  return colorMap[type] || 'info'
}

const getQuestionTypeLabel = (type) => {
  const labelMap = {
    'single': '单选题',
    'multiple': '多选题',
    'fill': '填空题',
    'essay': '问答题'
  }
  return labelMap[type] || type
}

const getDifficultyType = (difficulty) => {
  const typeMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyText = (difficulty) => {
  const textMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return textMap[difficulty] || difficulty
}

const formatCorrectAnswer = (question) => {
  if (question.type === 'single') {
    return question.correctAnswer
  } else if (question.type === 'multiple') {
    return question.correctAnswers?.join(', ') || ''
  } else if (question.type === 'fill') {
    return question.correctAnswers?.join('、') || ''
  } else if (question.type === 'essay') {
    return question.referenceAnswer || '参考答案见解析'
  }
  return ''
}

const handleSubmit = async () => {
  // 检查是否所有题目都已作答
  const unanswered = props.homeworkData.questions?.filter(q => {
    const answer = answers[q.id]
    if (Array.isArray(answer)) {
      return answer.length === 0 || answer.every(a => !a)
    }
    return !answer
  })

  if (unanswered && unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 道题未作答`)
    return
  }

  submitting.value = true
  
  try {
    // 这里调用提交API
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟API调用
    ElMessage.success('作业提交成功！')
    // 可以触发事件通知父组件
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleSaveDraft = () => {
  // 保存草稿逻辑
  ElMessage.success('草稿保存成功')
}
</script>

<style scoped>
.homework-renderer {
  padding: var(--spacing-lg);
  background: var(--color-bg-secondary);
}

.homework-header-card {
  margin-bottom: var(--spacing-lg);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
}

.homework-meta {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-item .label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-item .score {
  color: var(--color-primary-500);
  font-weight: 600;
  font-size: 18px;
}

.homework-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.questions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.question-card {
  background: var(--color-bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  transition: var(--transition);
}

.question-card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.question-number {
  color: var(--color-primary-500);
  font-weight: 600;
  font-size: 18px;
}

.question-score {
  color: var(--color-success);
  font-weight: 500;
  margin-left: auto;
}

.question-content {
  margin-bottom: var(--spacing-md);
}

.question-text {
  color: var(--color-text-primary);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  border: 1px solid var(--color-border-light);
  transition: var(--transition);
}

.option-item:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-300);
}

.fill-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.fill-blank {
  max-width: 400px;
}

.essay-input {
  width: 100%;
}

.question-answer {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-base);
  border-left: 4px solid var(--color-primary-500);
}

.answer-section,
.explanation-section {
  margin-bottom: var(--spacing-sm);
}

.answer-label,
.explanation-label {
  color: var(--color-primary-500);
  font-weight: 600;
  margin-right: var(--spacing-xs);
}

.answer-content {
  color: var(--color-success);
  font-weight: 500;
}

.explanation-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
}
</style>
```

### 4.3 考试渲染组件

考试组件类似作业，但需要额外支持：
- 计时器功能
- 题目随机顺序
- 分题库抽题
- 禁止复制粘贴（如果需要）

---

## 五、全局样式规范实施

### 5.1 修改主入口文件

在 `src/assets/styles/index.scss` 中：

```scss
// 1. 导入设计系统
@import './variables.scss';  // CSS变量定义
@import './themes.scss';      // 主题系统

// 2. 全局基础样式
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
               'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, 
               Arial, sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  transition: var(--transition);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// 3. Element Plus组件覆盖（确保主题一致性）
.el-button {
  border-radius: var(--radius-base);
  font-weight: 500;
  transition: var(--transition);
  
  &.el-button--primary {
    background: var(--gradient-primary);
    border: none;
    box-shadow: 0 4px 12px var(--color-shadow-primary);
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--color-shadow-primary-hover);
      background: var(--gradient-primary-hover);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &.el-button--success {
    background: var(--gradient-success);
    border: none;
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(78, 205, 196, 0.4);
    }
  }
  
  &.el-button--warning {
    background: var(--gradient-warning);
    border: none;
    box-shadow: 0 4px 12px rgba(255, 159, 243, 0.3);
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 159, 243, 0.4);
    }
  }
  
  &.el-button--danger {
    background: var(--gradient-danger);
    border: none;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
    }
  }
}

.el-card {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  border: 1px solid var(--color-border-light);
  background-color: var(--color-bg-primary);
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }
  
  .el-card__header {
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-light);
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .el-card__body {
    padding: var(--spacing-lg);
  }
}

.el-input {
  .el-input__wrapper {
    border-radius: var(--radius);
    box-shadow: 0 2px 8px var(--color-shadow-light);
    background-color: var(--color-bg-primary);
    transition: var(--transition);
    
    &:hover {
      box-shadow: 0 4px 12px var(--color-shadow-medium);
    }
    
    &.is-focus {
      box-shadow: 0 0 0 2px var(--color-shadow-primary);
      border-color: var(--color-primary-500);
    }
  }
}

.el-table {
  border-radius: var(--radius);
  overflow: hidden;
  background-color: var(--color-bg-primary);
  
  .el-table__header th {
    background: var(--color-bg-secondary);
    font-weight: 600;
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-primary-500);
  }
  
  .el-table__row {
    background-color: var(--color-bg-primary);
    transition: var(--transition);
    
    &:hover {
      background: rgba(102, 126, 234, 0.04);
    }
    
    td {
      border-color: var(--color-border-light);
      color: var(--color-text-primary);
    }
  }
}

.el-tag {
  border-radius: var(--radius-md);
  font-weight: 500;
  
  &.el-tag--success {
    background: var(--gradient-success);
    border: none;
    color: var(--color-text-inverse);
  }
  
  &.el-tag--warning {
    background: var(--gradient-warning);
    border: none;
    color: var(--color-text-inverse);
  }
  
  &.el-tag--danger {
    background: var(--gradient-danger);
    border: none;
    color: var(--color-text-inverse);
  }
  
  &.el-tag--info {
    background: var(--gradient-info);
    border: none;
    color: var(--color-text-inverse);
  }
}

// 4. 滚动条美化
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-base);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-dark);
  border-radius: var(--radius-base);
  transition: var(--transition);
  
  &:hover {
    background: var(--color-primary-500);
  }
}

// 5. 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

.slide-in {
  animation: slideIn 0.3s ease;
}
```

---

## 六、实施步骤和规范

### 6.1 所有页面遵守规范的步骤

#### 步骤1：导入主题系统
在每个Vue组件的 `<style>` 标签中使用 `scoped`，并引用CSS变量：

```vue
<style scoped>
.my-component {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  transition: var(--transition);
}

.my-component:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}
</style>
```

#### 步骤2：禁止硬编码颜色
**错误示例**：
```css
/* ❌ 不要这样写 */
.button {
  background: #3b82f6;
  color: #ffffff;
  border: 1px solid #ddd;
}
```

**正确示例**：
```css
/* ✅ 应该这样写 */
.button {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-border-base);
}
```

#### 步骤3：使用语义化类名
```vue
<template>
  <div class="course-card">
    <div class="card-header">
      <h3 class="title">{{ course.title }}</h3>
      <el-tag type="success">已完成</el-tag>
    </div>
    <div class="card-body">
      <p class="description">{{ course.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  transition: var(--transition);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.card-body {
  padding: var(--spacing-lg);
}

.description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
```

#### 步骤4：统一组件库使用方式

**Element Plus组件使用规范**：
```vue
<template>
  <!-- 使用type属性而非自定义颜色 -->
  <el-button type="primary">主要按钮</el-button>
  <el-button type="success">成功按钮</el-button>
  <el-button type="warning">警告按钮</el-button>
  <el-button type="danger">危险按钮</el-button>
  
  <!-- 标签颜色 -->
  <el-tag type="success">优秀</el-tag>
  <el-tag type="warning">良好</el-tag>
  <el-tag type="danger">不及格</el-tag>
  
  <!-- 自定义分数标签（使用CSS变量） -->
  <el-tag 
    :color="getScoreColor(score)"
    effect="dark"
  >
    {{ score }} 分
  </el-tag>
</template>

<script setup>
const getScoreColor = (score) => {
  if (score >= 90) return 'var(--color-score-excellent)'
  if (score >= 80) return 'var(--color-score-good)'
  if (score >= 70) return 'var(--color-score-average)'
  if (score >= 60) return 'var(--color-score-poor)'
  return 'var(--color-score-fail)'
}
</script>
```

### 6.2 颜色使用决策树

```
需要使用颜色时
├─ 是按钮、标签等组件？
│  ├─ 是 → 使用Element Plus的type属性
│  └─ 否 → 继续
├─ 是背景色？
│  ├─ 主背景 → var(--color-bg-primary)
│  ├─ 次背景 → var(--color-bg-secondary)
│  └─ 第三层 → var(--color-bg-tertiary)
├─ 是文本颜色？
│  ├─ 主文本 → var(--color-text-primary)
│  ├─ 次文本 → var(--color-text-secondary)
│  └─ 第三层 → var(--color-text-tertiary)
├─ 是边框颜色？
│  ├─ 轻边框 → var(--color-border-light)
│  ├─ 基础边框 → var(--color-border-base)
│  └─ 深边框 → var(--color-border-dark)
├─ 是状态颜色？
│  ├─ 成功 → var(--color-success)
│  ├─ 警告 → var(--color-warning)
│  ├─ 错误 → var(--color-danger)
│  └─ 信息 → var(--color-info)
├─ 是分数颜色？
│  ├─ 优秀 → var(--color-score-excellent)
│  ├─ 良好 → var(--color-score-good)
│  ├─ 中等 → var(--color-score-average)
│  ├─ 及格 → var(--color-score-poor)
│  └─ 不及格 → var(--color-score-fail)
└─ 是图表颜色？
   └─ 使用 var(--color-chart-1) 到 var(--color-chart-6)
```

### 6.3 组件开发检查清单

在开发每个组件时，请确保：

- [ ] 使用CSS变量而非硬编码颜色
- [ ] 使用统一的间距变量 (`var(--spacing-*)`)
- [ ] 使用统一的圆角变量 (`var(--radius-*)`)
- [ ] 使用统一的阴影变量 (`var(--shadow-*)`)
- [ ] 添加 `transition: var(--transition)` 实现平滑过渡
- [ ] 悬停效果使用 `:hover` 伪类
- [ ] 响应式设计使用媒体查询
- [ ] 支持暗色模式（自动适配CSS变量）

### 6.4 代码审查要点

在代码审查时，检查：

1. **硬编码颜色检查**：搜索代码中的 `#` 或 `rgb(`
2. **间距一致性**：所有 padding/margin 是否使用变量
3. **字体大小**：是否有统一的字体层次
4. **阴影效果**：是否使用统一的阴影变量
5. **动画效果**：是否使用统一的过渡时间

---
