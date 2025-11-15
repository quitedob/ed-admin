# 作业管理系统改造总结

## 核心改动方向
将作业管理系统从"分数导向"改为"完成度导向"，区分"编辑作业"和"查看答题情况"的操作语义。

---

## 第一阶段：Mock 数据结构补齐

### 文件：`src/utils/mockData.js`

#### 1. 作业数据补齐课程和班级信息
- **新增字段**：`courseName`（课程名称）、`className`（班级名称）
- **变更**：`generateHomeworks()` 函数现在根据 `classId` 自动映射课程名和班级名
- **映射关系**：
  - `class_001` → 前端开发一班 / 前端开发基础
  - `class_002` → 前端开发二班 / 前端开发进阶
  - `class_003` → 数据科学班 / 数据科学基础

#### 2. 提交记录补齐完成度字段
- **新增字段**：`answeredCount`（已做题数）、`totalQuestions`（总题数）
- **变更**：`generateHomeworkSubmissions()` 函数新增参数 `totalQuestions`，默认值为 5
- **用途**：用于计算完成度百分比（`answeredCount / totalQuestions * 100`）

---

## 第二阶段：作业列表页面改造

### 文件：`src/views/assignments/components/AssignmentList.vue`

#### 1. 补齐表格列
- **新增列**：
  - "所属课程"（`courseName`）- 宽度 140px
  - "所属班级"（`className`）- 宽度 140px

#### 2. 改造操作按钮
- **原有按钮**：编辑、删除
- **新增按钮**："答题情况"（替代原来的"批改"概念）
- **按钮语义**：
  - "编辑" → 修改作业本身（标题、描述、题目列表等）
  - "答题情况" → 查看学生答题情况和必要时的微调
  - "删除" → 删除作业

#### 3. 事件更新
- **新增事件**：`view-answers` - 点击"答题情况"按钮时触发
- **事件列表**：`['view', 'edit', 'delete', 'copy', 'view-stats', 'view-answers', 'selection-change']`

---

## 第三阶段：作业统计弹窗改造

### 文件：`src/views/assignments/components/AssignmentStatsDialog.vue`

#### 1. 弹窗标题改为"完成度统计"
- 原标题："作业统计"
- 新标题："完成度统计"

#### 2. 统计指标改造
| 原指标 | 新指标 | 说明 |
|------|------|------|
| 平均分 | 平均完成度 | 显示为百分比，表示平均完成题数/总题数 |
| 分数分布 | 完成度分布 | 按完成度区间分布：90-100%、60-89%、30-59%、0-29% |
| 平均得分 | 作答人数 | 题目统计中移除"平均得分"，保留"作答人数" |

#### 3. 数据结构更新
```javascript
// 原结构
scoreDistribution: {
  excellent: 20,  // 90-100分
  good: 35,       // 80-89分
  average: 25,    // 70-79分
  pass: 15,       // 60-69分
  fail: 5         // 60分以下
}

// 新结构
completionDistribution: {
  excellent: 20,  // 90-100%
  good: 35,       // 60-89%
  average: 25,    // 30-59%
  poor: 20        // 0-29%
}
```

#### 4. 题目统计表格改造
- **移除列**：`averageScore`（平均分）
- **新增列**：`answeredCount`（作答人数）
- **保留列**：`correctRate`（正确率）

---

## 第四阶段：作业批改页面改造

### 文件：`src/views/homework/grading/components/StudentGradingView.vue`

#### 1. 学生列表显示改为"完成度"
- **原显示**：`score / maxScore` + 分数进度条
- **新显示**：`answeredCount / totalQuestions` + 完成度进度条
- **CSS 类名**：`.student-score` → `.student-completion`

#### 2. 学生信息卡片改造
- **原指标**：
  - 总分：`score / maxScore`
  - 完成度：分数百分比进度条
  
- **新指标**：
  - 完成度：`answeredCount / totalQuestions`
  - 完成进度：完成度百分比进度条
  - 提交时间：保持不变

#### 3. 方法更新
- **移除**：`getScorePercentage(submission)` 方法
- **新增**：`getCompletionPercentage(submission)` 方法
  ```javascript
  const getCompletionPercentage = (submission) => {
    if (!submission.totalQuestions) return 0
    return Math.round(((submission.answeredCount || 0) / submission.totalQuestions) * 100)
  }
  ```

---

## 第五阶段：按题目视图和单题批改对话框改造

### 文件：`src/views/homework/grading/components/QuestionGradingView.vue`

#### 1. 题目信息卡片改造
- **调整顺序**：将"满分"字段移到最后，作为次要信息
- **新增 CSS 类**：`meta-secondary` 用于弱化分值展示
- **主要指标**：答对率、已答人数
- **次要指标**：满分（用小字显示）

### 文件：`src/views/homework/grading/components/SingleQuestionGrading.vue`

#### 1. 添加提示信息
- **新增 Alert 组件**：在对话框顶部添加提示
- **提示文案**："此分数仅用于完成度和教学分析，不计入正式考试成绩"
- **样式**：info 类型，不可关闭，margin-bottom 16px

---

## 第六阶段：作业列表主页面改造

### 文件：`src/views/homework/list/index.vue`

#### 1. 按钮文案改造
- **原文案**："批改"
- **新文案**："答题情况"
- **目的**：改变老师的心理预期，从"评分"改为"查看"

#### 2. 路由改造
- **原路由**：`/homework/review?id=xxx`
- **新路由**：`/homework/grading?id=xxx`
- **方法**：`handleGrade()` 中的 router.push 目标改为 `/homework/grading`

#### 3. 作业信息补齐
- **新增字段**：课程（`courseName`）
- **移除字段**：总分（不再作为主要展示）
- **字段顺序**：班级 → 课程 → 截止时间 → 题目数量

---

## 数据流向示例

### 作业列表页面
```
Mock Store (homeworks)
  ↓
AssignmentList.vue (显示课程名、班级名)
  ↓
点击"答题情况" → 跳转到 /homework/grading?id=xxx
```

### 批改页面
```
Mock Store (submissions)
  ↓
StudentGradingView.vue (显示完成度)
  ↓
点击题目 → SingleQuestionGrading 对话框
```

---

## 关键概念转变

| 维度 | 原概念 | 新概念 |
|------|------|------|
| 核心指标 | 分数（0-100分） | 完成度（0-100%）+ 正确率 |
| 学生列表 | 分数进度条 | 完成度进度条 |
| 统计弹窗 | 分数分布、平均分 | 完成度分布、平均完成度 |
| 操作按钮 | "批改" | "答题情况" |
| 心理预期 | 考试评分 | 作业完成情况查看 |

---

## 后续建议

1. **页面标题**：保持"批改"文案在面包屑中，但在 AssignmentList 进入时用"答题情况"按钮，让老师心理上认为这是"查看"而非"评分"

2. **分数保留**：虽然弱化了分数展示，但系统内部仍保留分数用于 AI 评分和难度分析

3. **统一入口**：所有"查看作业详情 + 学生列表"的入口都统一跳到 `/homework/grading`

4. **废弃页面**：可以考虑废弃单独的"作业统计独立路由页面"，统一使用 AssignmentStatsDialog 弹窗

---

## 文件清单

### 已修改文件
- ✅ `src/utils/mockData.js` - Mock 数据补齐
- ✅ `src/views/assignments/components/AssignmentList.vue` - 列表改造
- ✅ `src/views/assignments/components/AssignmentStatsDialog.vue` - 统计弹窗改造
- ✅ `src/views/homework/grading/components/StudentGradingView.vue` - 批改页面改造
- ✅ `src/views/homework/grading/components/QuestionGradingView.vue` - 按题目视图改造
- ✅ `src/views/homework/grading/components/SingleQuestionGrading.vue` - 单题批改对话框改造
- ✅ `src/views/homework/list/index.vue` - 作业列表主页面改造

### 已完成的可选改造
- ✅ `src/views/homework/grading/components/QuestionGradingView.vue` - 按题目视图（弱化分值展示）
- ✅ `src/views/homework/grading/components/SingleQuestionGrading.vue` - 单题批改对话框（添加说明文案）
- ✅ `src/views/homework/list/index.vue` - 作业列表主页面（改按钮文案、补齐课程字段）

---

## 测试建议

1. **Mock 数据验证**：检查作业列表是否正确显示课程名和班级名
2. **完成度计算**：验证 `answeredCount / totalQuestions` 的百分比计算
3. **按钮事件**：确保"答题情况"按钮能正确触发 `view-answers` 事件
4. **统计数据**：检查完成度分布是否正确显示
5. **进度条颜色**：验证完成度进度条的颜色梯度是否合理

