# 作业详情页改造计划

**日期**：2025年11月15日  
**文件**：`src/views/homework/detail/index.vue`  
**状态**：规划中

---

## 改造需求

### 1. 参考 `homework/review/index.vue` 的双视图模式

- 复制 review/index.vue 的视图切换逻辑
- 保留 `el-radio-group` 切换按钮：按学生查看 / 按题目查看

### 2. 实现按学生查看视图

**左侧边栏**：学生列表
- 显示：学生姓名、完成度、提交时间
- 点击选中某个学生

**右侧主区域**：该学生的所有题目答题情况
- 题目列表（逐题显示）
- 每道题显示：题号、题型、得分情况、学生答案

### 3. 实现按题目查看视图

**左侧边栏**：题目列表
- 显示：题号、题型、答对率
- 点击选中某道题

**右侧主区域**：该题目的所有学生答题情况
- 学生列表（逐个显示）
- 每个学生显示：姓名、答案、是否正确

### 4. 删除分数统计，改为完成度统计

**顶部统计卡片显示**：
- 总题数
- 完成人数 / 总人数
- 平均完成度（百分比）

**删除**：平均分、最高分、最低分显示

---

## 改造步骤

### 步骤 1：改造顶部统计

**原统计**：
```vue
<el-col :span="6">
  <el-statistic title="总分值" :value="homeworkInfo.statistics?.totalScore || 0" />
</el-col>
```

**新统计**：
```vue
<el-col :span="6">
  <el-statistic title="完成人数" :value="`${completedCount}/${totalStudents}`" />
</el-col>
<el-col :span="6">
  <el-statistic title="平均完成度" :value="averageCompletionRate" suffix="%" />
</el-col>
```

### 步骤 2：改造标签页为双视图

**原结构**：
```vue
<el-tabs v-model="activeTab">
  <el-tab-pane label="题目内容" name="questions">...</el-tab-pane>
  <el-tab-pane label="提交情况" name="submissions">...</el-tab-pane>
</el-tabs>
```

**新结构**：
```vue
<div class="view-mode-selector">
  <el-radio-group v-model="viewMode">
    <el-radio-button label="student">按学生查看</el-radio-button>
    <el-radio-button label="question">按题目查看</el-radio-button>
  </el-radio-group>
</div>

<div class="main-content">
  <!-- 按学生视图 -->
  <template v-if="viewMode === 'student'">
    <!-- 左侧学生列表 -->
    <!-- 右侧学生答题详情 -->
  </template>

  <!-- 按题目视图 -->
  <template v-else>
    <!-- 左侧题目列表 -->
    <!-- 右侧题目答题情况 -->
  </template>
</div>
```

### 步骤 3：实现按学生查看视图

**左侧学生列表**：
- 显示学生姓名
- 显示完成度（已做题数/总题数）
- 显示提交时间
- 点击选中

**右侧学生答题详情**：
- 学生信息卡片（完成度、正确率、提交时间）
- 题目列表（逐题显示学生答案）

### 步骤 4：实现按题目查看视图

**左侧题目列表**：
- 显示题号
- 显示题型
- 显示答对率
- 点击选中

**右侧题目答题情况**：
- 题目信息卡片（题型、答对率、已答人数）
- 学生列表（逐个显示学生答案）

### 步骤 5：更新数据计算

**新增计算属性**：
```javascript
// 完成人数
const completedCount = computed(() => {
  return submissions.value.filter(s => s.status !== 'not_submitted').length
})

// 总学生数
const totalStudents = computed(() => {
  return submissions.value.length
})

// 平均完成度
const averageCompletionRate = computed(() => {
  if (submissions.value.length === 0) return 0
  const totalCompletion = submissions.value.reduce((sum, s) => {
    return sum + (s.answeredCount / s.totalQuestions * 100)
  }, 0)
  return Math.round(totalCompletion / submissions.value.length)
})
```

---

## 改造影响

### 删除的内容

- ❌ 标签页结构（改为双视图）
- ❌ 题目内容标签页（改为按学生/按题目视图）
- ❌ 提交情况标签页（改为按学生/按题目视图）
- ❌ 总分值统计
- ❌ 平均分、最高分、最低分

### 新增的内容

- ✅ 双视图切换（按学生/按题目）
- ✅ 左侧学生列表（按学生视图）
- ✅ 左侧题目列表（按题目视图）
- ✅ 完成度统计
- ✅ 平均完成度计算

### 保留的内容

- ✅ 返回按钮
- ✅ 作业基本信息
- ✅ 元数据信息
- ✅ 时间安排
- ✅ 作业设置
- ✅ 题目内容显示（在右侧）
- ✅ 学生答题情况显示（在右侧）

---

## 预期效果

### 按学生查看

```
┌─────────────────────────────────────────────────────┐
│ 返回 | 作业名称 | [按学生] [按题目]                  │
├──────────────────┬──────────────────────────────────┤
│ 学生列表         │ 学生答题详情                      │
│ ┌──────────────┐ │ ┌────────────────────────────┐   │
│ │ 张三         │ │ │ 张三的作业                 │   │
│ │ 完成度: 80%  │ │ │ 完成度: 4/5                │   │
│ │ 2024-09-05   │ │ │ 正确率: 80%                │   │
│ └──────────────┘ │ │ 提交时间: 2024-09-05       │   │
│ ┌──────────────┐ │ │                            │   │
│ │ 李四         │ │ │ 题目列表:                  │   │
│ │ 完成度: 100% │ │ │ 1. 单选题 - 正确           │   │
│ │ 2024-09-06   │ │ │ 2. 多选题 - 错误           │   │
│ └──────────────┘ │ │ 3. 填空题 - 正确           │   │
│                  │ │ 4. 问答题 - 待批改         │   │
│                  │ │ 5. 编程题 - 正确           │   │
│                  │ └────────────────────────────┘   │
└──────────────────┴──────────────────────────────────┘
```

### 按题目查看

```
┌─────────────────────────────────────────────────────┐
│ 返回 | 作业名称 | [按学生] [按题目]                  │
├──────────────────┬──────────────────────────────────┤
│ 题目列表         │ 题目答题情况                      │
│ ┌──────────────┐ │ ┌────────────────────────────┐   │
│ │ 1. 单选题    │ │ │ 第1题: 单选题              │   │
│ │ 答对率: 90%  │ │ │ 答对率: 90%                │   │
│ └──────────────┘ │ │ 已答: 9/10                 │   │
│ ┌──────────────┐ │ │                            │   │
│ │ 2. 多选题    │ │ │ 学生答题情况:              │   │
│ │ 答对率: 80%  │ │ │ 张三: 正确                 │   │
│ └──────────────┘ │ │ 李四: 正确                 │   │
│ ┌──────────────┐ │ │ 王五: 错误                 │   │
│ │ 3. 填空题    │ │ │ 赵六: 正确                 │   │
│ │ 答对率: 70%  │ │ │ 钱七: 正确                 │   │
│ └──────────────┘ │ │ ...                        │   │
│                  │ └────────────────────────────┘   │
└──────────────────┴──────────────────────────────────┘
```

---

## 技术实现

### 数据结构

**学生提交记录**：
```javascript
{
  id: 'sub_001',
  studentId: 'stu_001',
  studentName: '张三',
  homeworkId: 'hw_001',
  submitTime: '2024-09-05T10:30:00Z',
  status: 'graded',
  answeredCount: 4,        // 已做题数
  totalQuestions: 5,       // 总题数
  correctCount: 3,         // 答对题数
  answers: [
    { questionId: 'q_001', answer: 'A', isCorrect: true },
    { questionId: 'q_002', answer: 'BC', isCorrect: false },
    // ...
  ]
}
```

### 计算方法

**完成度**：
```javascript
completionPercentage = (answeredCount / totalQuestions) * 100
```

**正确率**：
```javascript
correctRate = (correctCount / answeredCount) * 100
```

**平均完成度**：
```javascript
averageCompletionRate = sum(completionPercentage) / studentCount
```

---

## 后续工作

1. ✅ 规划完成
2. ⏳ 实施改造
3. ⏳ 测试验证
4. ⏳ 上线发布

