# 考试管理模块改造计划

**日期**：2025年11月15日  
**状态**：规划中

---

## 改造需求

### 1. 考试详情页改造 (`src/views/exam/detail/index.vue`)

#### 步骤1：保留现有统计数据
- 参考人数、提交数、平均分、最高分、最低分
- 保持不变

#### 步骤2：新增Tab切换视图
- 添加 `<el-tabs v-model="activeTab">`
  - Tab1: 学生视图
  - Tab2: 题目视图

- **学生视图**：
  - 左侧：学生列表
  - 右侧：选中学生的答题详情

- **题目视图**：
  - 左侧：题目列表
  - 右侧：选中题目的学生答题统计

#### 步骤3：新增完成度统计（题数维度）
- 统计卡片新增：
  - 题目完成度：answeredQuestions / totalQuestions
  - 完成题数分布图表（可选）

### 2. 成绩管理页改造 (`src/views/exam/grades/index.vue`)

#### 步骤：新增完成度列
- `el-table-column` 新增 `completionRate` 列
- 显示格式：`"X/Y题"` (例如: `8/10题`)

---

## 改造步骤

### 第一步：成绩管理页改造（简单）

**文件**：`src/views/exam/grades/index.vue`

**改动**：
```vue
<!-- 在"得分"列后添加"完成度"列 -->
<el-table-column label="完成度" align="center" width="100">
  <template #default="scope">
    <span>{{ scope.row.answeredQuestions }}/{{ scope.row.totalQuestions }}题</span>
  </template>
</el-table-column>
```

**Mock 数据**：
```javascript
{
  id: 1,
  studentName: '张三',
  studentId: '2021001',
  examTitle: 'Python期中考试',
  score: 92,
  totalScore: 100,
  answeredQuestions: 8,      // 新增
  totalQuestions: 10,        // 新增
  duration: 105,
  submitTime: '2024-01-25 10:45:00'
}
```

### 第二步：考试详情页改造（复杂）

**文件**：`src/views/exam/detail/index.vue`

**改动**：

1. **新增统计指标**：
```vue
<!-- 在现有统计卡片后添加 -->
<el-col :span="6">
  <el-statistic title="题目完成度" :value="`${answeredQuestions}/${totalQuestions}`" />
</el-col>
```

2. **新增Tab切换**：
```vue
<!-- 替换现有的标签页结构 -->
<el-tabs v-model="activeTab">
  <el-tab-pane label="学生视图" name="student">
    <!-- 左侧学生列表 + 右侧答题详情 -->
  </el-tab-pane>
  <el-tab-pane label="题目视图" name="question">
    <!-- 左侧题目列表 + 右侧答题统计 -->
  </el-tab-pane>
</el-tabs>
```

3. **学生视图结构**：
```
┌─────────────────────────────────────┐
│ 学生列表          │ 答题详情        │
│ ┌──────────────┐ │ ┌────────────┐ │
│ │ 张三         │ │ │ 张三的考试 │ │
│ │ 得分: 92分   │ │ │ 得分: 92分 │ │
│ │ 完成度: 8/10 │ │ │ 完成度: 8/10│ │
│ └──────────────┘ │ │ 题目列表:  │ │
│ ┌──────────────┐ │ │ 1. 单选题  │ │
│ │ 李四         │ │ │ 2. 多选题  │ │
│ │ 得分: 85分   │ │ │ ...        │ │
│ └──────────────┘ │ └────────────┘ │
└─────────────────────────────────────┘
```

4. **题目视图结构**：
```
┌─────────────────────────────────────┐
│ 题目列表          │ 答题统计        │
│ ┌──────────────┐ │ ┌────────────┐ │
│ │ 1. 单选题    │ │ │ 第1题      │ │
│ │ 答对率: 90%  │ │ │ 答对率: 90%│ │
│ └──────────────┘ │ │ 已答: 9/10 │ │
│ ┌──────────────┐ │ │ 学生答题:  │ │
│ │ 2. 多选题    │ │ │ 张三: 正确 │ │
│ │ 答对率: 80%  │ │ │ 李四: 正确 │ │
│ └──────────────┘ │ │ ...        │ │
│                  │ └────────────┘ │
└─────────────────────────────────────┘
```

---

## 考试批改复用作业批改页

### 改造思路

在路由和页面层做一个"通用批改壳"：
- 例如：`/grading?type=exam&id=xxx`
- 内部仍用 `HomeworkGradingPage` 这一套组件

### 改动内容

如果 `type=exam` 则：
- 在 `StudentGradingView` 右侧学生卡片里恢复"考试得分"主指标
- `QuestionGradingView` 中的"满分 / 正确率 / 得分分布"都保留

### 技术实现

在 `HomeworkGradingPage` 加一个 `gradingType` prop，从路由 query 里读：

```javascript
// HomeworkGradingPage.vue
const route = useRoute()
const gradingType = computed(() => route.query.type || 'homework')

// 在 StudentGradingView 中
<template v-if="gradingType === 'exam'">
  <!-- 显示考试得分 -->
  <div class="exam-score">
    <span class="label">考试得分</span>
    <span class="value">{{ selectedSubmission.score }}/{{ selectedSubmission.maxScore }}</span>
  </div>
</template>
<template v-else>
  <!-- 显示作业完成度 -->
  <div class="homework-completion">
    <span class="label">完成度</span>
    <span class="value">{{ selectedSubmission.answeredCount }}/{{ selectedSubmission.totalQuestions }}</span>
  </div>
</template>
```

---

## 改造影响

### 保留的内容

- ✅ 考试基本信息
- ✅ 元数据信息
- ✅ 时间安排
- ✅ 考试设置
- ✅ 评分设置
- ✅ 现有统计数据（参考人数、提交数、平均分、最高分、最低分）

### 新增的内容

- ✅ 题目完成度统计
- ✅ Tab切换视图（学生视图/题目视图）
- ✅ 学生列表和答题详情
- ✅ 题目列表和答题统计

### 删除的内容

- ❌ 原有的标签页结构（改为Tab切换）

---

## 预期效果

### 成绩管理页

```
┌─────────────────────────────────────────────────────────┐
│ 学生姓名 │ 学号 │ 考试标题 │ 得分 │ 完成度 │ 用时 │ 提交时间 │
├─────────────────────────────────────────────────────────┤
│ 张三    │ 2021001 │ Python期中 │ 92/100 │ 8/10题 │ 105分 │ 2024-01-25 │
│ 李四    │ 2021002 │ Python期中 │ 85/100 │ 9/10题 │ 110分 │ 2024-01-25 │
└─────────────────────────────────────────────────────────┘
```

### 考试详情页

```
┌─────────────────────────────────────────────────────────┐
│ 参考人数: 30 │ 提交数: 28 │ 平均分: 82.5 │ 题目完成度: 8/10 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [学生视图] [题目视图]                                    │
├─────────────────────────────────────────────────────────┤
│ 学生列表          │ 答题详情                            │
│ 张三 (92分)       │ 张三的考试                          │
│ 李四 (85分)       │ 得分: 92/100                        │
│ 王五 (78分)       │ 完成度: 8/10                        │
│                   │ 题目列表...                         │
└─────────────────────────────────────────────────────────┘
```

---

## 后续工作

1. ✅ 规划完成
2. ⏳ 实施改造
3. ⏳ 测试验证
4. ⏳ 上线发布

