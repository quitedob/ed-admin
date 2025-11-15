# 题库管理 & AI 助教配置改造计划

**日期**：2025年11月15日  
**状态**：规划中

---

## 改造需求概述

### 问题分析

#### 题库管理模块问题
1. 当前版本错误地分了"第几章"的概念
2. 需要恢复为单一题库池，不分章节
3. 缺少三级标签筛选功能
4. 缺少筛选结果统计

#### AI 助教配置问题
1. 把"homework"也当成了有"总分 / 及格线"的卷子
2. SettingsPanel 里 type 默认是 homework，但有 totalScore / passingScore 等字段
3. useTemplate() 中 demo 把 type 设为 'homework'，但却按试卷方式分配分数

#### 添加到作业对话框问题
1. 当前关心"每题多少分"的配置
2. 应该只关心题目数量，不关心分值

---

## 改造步骤

### 第一部分：题库管理模块重构

#### 文件：`src/components/QuestionBankManager.vue`

##### 步骤1：删除章节分组

**原结构**：
```javascript
{
  chapters: [
    {
      id: 'ch_001',
      name: '第一章',
      questions: [...]
    }
  ]
}
```

**新结构**：
```javascript
{
  questions: [...]  // 单一数组
}
```

**改动**：
- 删除 `chapters` 数据结构
- 删除"第X章"的UI组件
- 改为单一 `questions` 数组

##### 步骤2：实现三级标签筛选器

**HTML结构**：
```vue
<div class="filter-bar">
  <el-select 
    v-model="filter.level1" 
    placeholder="一级标签(课程/考点)"
    clearable
    @change="updateLevel2Options"
  >
    <el-option 
      v-for="tag in level1Tags" 
      :key="tag.id"
      :label="tag.name"
      :value="tag.id"
    />
  </el-select>

  <el-select 
    v-model="filter.level2" 
    placeholder="二级标签(题型)"
    clearable
    @change="updateLevel3Options"
  >
    <el-option 
      v-for="tag in level2Tags" 
      :key="tag.id"
      :label="tag.name"
      :value="tag.id"
      :disabled="selectedTags.includes(tag.id)"
    />
  </el-select>

  <el-select 
    v-model="filter.level3" 
    placeholder="三级标签(难度)"
    clearable
  >
    <el-option 
      v-for="tag in level3Tags" 
      :key="tag.id"
      :label="tag.name"
      :value="tag.id"
      :disabled="selectedTags.includes(tag.id)"
    />
  </el-select>

  <el-button type="primary" @click="applyFilter">筛选</el-button>
  <el-button @click="clearFilter">清空</el-button>
</div>
```

##### 步骤3：实现标签筛选逻辑

**计算属性**：
```javascript
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    let match = true
    if (filter.value.level1) {
      match &&= q.tags.includes(filter.value.level1)
    }
    if (filter.value.level2) {
      match &&= q.tags.includes(filter.value.level2)
    }
    if (filter.value.level3) {
      match &&= q.tags.includes(filter.value.level3)
    }
    return match
  })
})

// 已选标签列表（用于禁用重复选择）
const selectedTags = computed(() => {
  return [filter.value.level1, filter.value.level2, filter.value.level3].filter(Boolean)
})
```

##### 步骤4：显示筛选结果统计

**HTML**：
```vue
<div class="filter-stats">
  <span>共筛选出 {{ filteredQuestions.length }} 道题目</span>
</div>
```

##### 步骤5：题目列表展示

**HTML结构**：
```vue
<div class="question-list">
  <div 
    v-for="question in filteredQuestions" 
    :key="question.id"
    class="question-item"
  >
    <!-- 题目内容 -->
    <div class="question-content">
      <span class="question-text">{{ truncate(question.text, 100) }}</span>
    </div>

    <!-- 标签 -->
    <div class="question-tags">
      <el-tag type="primary" size="small">{{ getTypeLabel(question.type) }}</el-tag>
      <el-tag :type="getDifficultyType(question.difficulty)" size="small">
        {{ getDifficultyLabel(question.difficulty) }}
      </el-tag>
      <el-tag 
        v-for="(tag, index) in question.tags.slice(0, 3)" 
        :key="tag"
        size="small"
      >
        {{ tag }}
      </el-tag>
      <el-tag v-if="question.tags.length > 3" size="small">
        +{{ question.tags.length - 3 }}
      </el-tag>
    </div>

    <!-- 操作按钮 -->
    <div class="question-actions">
      <el-button link type="primary" size="small" @click="viewDetail(question)">
        查看详情
      </el-button>
      <el-button link type="success" size="small" @click="addToHomework(question)">
        添加到作业
      </el-button>
      <el-button link type="warning" size="small" @click="addToExam(question)">
        添加到考试
      </el-button>
    </div>
  </div>
</div>
```

---

### 第二部分：AI 助教配置改造

#### 文件：`src/views/ai_assistant/components/SettingsPanel.vue`

##### 改动：区分"作业"和"考试"

**逻辑**：
```javascript
// 当 type === 'homework'
if (settingsData.value.type === 'homework') {
  // 隐藏这些字段
  hideFields: ['totalScore', 'passingScore', 'enableTimeLimit', 'timeLimit']
  
  // 显示这些字段
  showFields: ['recommendedQuestionCount', 'recommendedDifficulty']
}

// 当 type === 'exam'
if (settingsData.value.type === 'exam') {
  // 显示所有字段
  showFields: ['totalScore', 'passingScore', 'enableTimeLimit', 'timeLimit', 'recommendedQuestionCount', 'recommendedDifficulty']
}
```

**HTML结构**：
```vue
<el-form :model="settingsData">
  <!-- 作业类型选择 -->
  <el-form-item label="类型">
    <el-radio-group v-model="settingsData.type">
      <el-radio label="homework">作业</el-radio>
      <el-radio label="exam">考试</el-radio>
    </el-radio-group>
  </el-form-item>

  <!-- 作业配置 -->
  <template v-if="settingsData.type === 'homework'">
    <el-form-item label="推荐题目数量">
      <el-input-number v-model="settingsData.recommendedQuestionCount" />
    </el-form-item>
    <el-form-item label="推荐难度">
      <el-select v-model="settingsData.recommendedDifficulty">
        <el-option label="简单" value="easy" />
        <el-option label="中等" value="medium" />
        <el-option label="困难" value="hard" />
      </el-select>
    </el-form-item>
  </template>

  <!-- 考试配置 -->
  <template v-if="settingsData.type === 'exam'">
    <el-form-item label="总分">
      <el-input-number v-model="settingsData.totalScore" />
    </el-form-item>
    <el-form-item label="及格线">
      <el-input-number v-model="settingsData.passingScore" />
    </el-form-item>
    <el-form-item label="启用时间限制">
      <el-switch v-model="settingsData.enableTimeLimit" />
    </el-form-item>
    <el-form-item v-if="settingsData.enableTimeLimit" label="时间限制(分钟)">
      <el-input-number v-model="settingsData.timeLimit" />
    </el-form-item>
    <el-form-item label="推荐题目数量">
      <el-input-number v-model="settingsData.recommendedQuestionCount" />
    </el-form-item>
    <el-form-item label="推荐难度">
      <el-select v-model="settingsData.recommendedDifficulty">
        <el-option label="简单" value="easy" />
        <el-option label="中等" value="medium" />
        <el-option label="困难" value="hard" />
      </el-select>
    </el-form-item>
  </template>
</el-form>
```

#### 文件：`src/views/ai_assistant/composables/useTemplate.js`

##### 改动：修复模板逻辑

**原代码问题**：
```javascript
// 错误：homework 类型却有 totalScore 分配
paperConfig.type = 'homework'
paperConfig.totalScore = 100
updateScores()  // 这个函数不应该在 homework 时调用
```

**修复后**：
```javascript
// 方案1：如果要演示作业模板
paperConfig.type = 'homework'
paperConfig.recommendedQuestionCount = 10
paperConfig.recommendedDifficulty = 'medium'
// 不调用 updateScores()

// 方案2：如果要演示考试模板
paperConfig.type = 'exam'
paperConfig.totalScore = 100
paperConfig.passingScore = 60
updateScores()  // 只在 type === 'exam' 时调用
```

**改动**：
```javascript
// updateScores / autoBalance 这些函数仅在 type === 'exam' 时生效
const updateScores = () => {
  if (paperConfig.type !== 'exam') return
  // 分数分配逻辑
}

const autoBalance = () => {
  if (paperConfig.type !== 'exam') return
  // 自动平衡逻辑
}
```

---

### 第三部分：添加到作业对话框改造

#### 文件：`src/views/assignments/components/AddToAssignmentDialog.vue`

##### 改动：只关心题目数量，不关心分值

**原逻辑**：
```vue
<!-- 错误：显示每题分值配置 -->
<el-form-item label="每题分值">
  <el-input-number v-model="form.scorePerQuestion" />
</el-form-item>
<el-form-item label="总分">
  <el-input-number v-model="form.totalScore" disabled />
</el-form-item>
```

**修复后**：
```vue
<!-- 正确：只显示题目数量 -->
<el-form-item label="题目数量">
  <el-input-number v-model="form.questionCount" disabled />
</el-form-item>

<!-- 移除所有分值相关配置 -->
```

**数据传递**：
```javascript
// 只传递题目 ID 列表和作业基本信息
const submitForm = () => {
  const payload = {
    assignmentId: form.value.assignmentId,
    assignmentTitle: form.value.assignmentTitle,
    questionIds: selectedQuestions.value.map(q => q.id)
    // 不传递任何分值信息
  }
  emit('submit', payload)
}
```

---

## 改造影响

### 保留的内容

- ✅ 题库的基本信息（题目内容、题型、难度）
- ✅ 标签系统（多级标签）
- ✅ 题目操作（查看、添加到作业/考试）
- ✅ AI 助教的基本功能

### 新增的内容

- ✅ 三级标签筛选器
- ✅ 筛选结果统计
- ✅ 作业/考试类型区分
- ✅ 作业简化配置

### 删除的内容

- ❌ 章节分组概念
- ❌ 作业中的分值配置
- ❌ 作业中的及格线配置
- ❌ 作业中的时间限制配置

---

## 预期效果

### 题库管理页面

```
┌─────────────────────────────────────────────────────┐
│ 一级标签(课程/考点) │ 二级标签(题型) │ 三级标签(难度) │
│ [选择课程]         │ [选择题型]     │ [选择难度]    │
│ [筛选] [清空]                                       │
│ 共筛选出 25 道题目                                  │
├─────────────────────────────────────────────────────┤
│ 题目1: 这是一道单选题...                            │
│ 标签: [单选] [简单] [第一章] [+2]                   │
│ [查看详情] [添加到作业] [添加到考试]                │
├─────────────────────────────────────────────────────┤
│ 题目2: 这是一道多选题...                            │
│ 标签: [多选] [中等] [第二章] [+1]                   │
│ [查看详情] [添加到作业] [添加到考试]                │
└─────────────────────────────────────────────────────┘
```

### AI 助教配置页面

**作业模式**：
```
类型: [作业] [考试]
推荐题目数量: [10]
推荐难度: [中等]
```

**考试模式**：
```
类型: [作业] [考试]
总分: [100]
及格线: [60]
启用时间限制: [开关]
时间限制(分钟): [120]
推荐题目数量: [10]
推荐难度: [中等]
```

### 添加到作业对话框

```
作业标题: [输入框]
题目数量: [10] (只读)
[取消] [确定]
```

---

## 后续工作

1. ✅ 规划完成
2. ⏳ 实施改造
3. ⏳ 测试验证
4. ⏳ 上线发布

