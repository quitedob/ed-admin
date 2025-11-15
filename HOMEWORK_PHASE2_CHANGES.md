# 作业管理模块改造 - 第二阶段改动

**日期**：2025年11月15日  
**阶段**：第二阶段 - 作业管理模块改造  
**状态**：进行中

---

## 📋 改动概述

第二阶段改造涉及作业管理模块的三个主要页面：
1. **作业列表页** (`src/views/homework/list/index.vue`) - ✅ 已完成
2. **作业详情页** (`src/views/homework/detail/index.vue`) - 待改造
3. **作业编辑页** (`src/views/homework/edit/index.vue`) - 待改造

---

## ✅ 第一步：作业列表页改造（已完成）

### 改动内容

#### 1. 删除分数相关字段
- ✅ 删除 `totalScore`、`averageScore` 等分数字段
- ✅ 改为显示 `completionRate`（完成度百分比）
- ✅ 改为显示 `submittedCount / totalCount`（提交人数/总人数）

#### 2. 新增字段
- ✅ `courseName` - 所属课程
- ✅ `className` - 所属班级
- ✅ `completionRate` - 完成度百分比
- ✅ `submittedCount` - 提交人数

#### 3. 新增筛选功能
- ✅ 班级筛选：`filterClass`
- ✅ 课程筛选：`filterCourse`（新增）
- ✅ 状态筛选：`filterStatus`

#### 4. 改造界面风格
- ✅ 从左右分栏改为卡片式布局
- ✅ 参考 `exam/list/index.vue` 的设计
- ✅ 每个作业一个 `el-card` 组件
- ✅ 卡片头部显示：作业名称、班级标签、课程标签
- ✅ 卡片主体显示：作业描述、统计信息（完成度、提交人数）
- ✅ 卡片底部显示：操作按钮（编辑、答题情况、分析、复制、删除）

### 代码改动

**文件**：`src/views/homework/list/index.vue`

**关键改动**：
```vue
<!-- 新的卡片式布局 -->
<el-card class="homework-card" shadow="hover">
  <div class="homework-header">
    <h3 class="homework-title">{{ homework.title }}</h3>
    <el-tag :type="getStatusTagType(homework.status)">{{ getStatusLabel(homework.status) }}</el-tag>
    <div class="homework-tags">
      <el-tag type="info">{{ homework.className }}</el-tag>
      <el-tag type="warning">{{ homework.courseName }}</el-tag>
    </div>
  </div>
  
  <div class="homework-stats">
    <div class="stat-item">
      <span class="stat-label">完成度</span>
      <span class="stat-value">{{ homework.completionRate }}%</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">提交人数</span>
      <span class="stat-value">{{ homework.submittedCount }}/{{ homework.totalStudents }}</span>
    </div>
  </div>
</el-card>
```

**Mock 数据更新**：
```javascript
{
  id: 'hw_001',
  className: '前端开发一班',
  courseName: '前端开发基础',
  completionRate: 50,
  submittedCount: 15,
  totalStudents: 30,
  // 删除：totalScore, averageScore, submitRate, gradedCount 等
}
```

---

## 🔄 第二步：作业详情页改造（待改造）

### 改动需求

#### 1. 参考 `homework/review/index.vue` 的双视图模式
- 复制 review/index.vue 的视图切换逻辑
- 保留 `el-radio-group` 切换按钮：按学生查看 / 按题目查看

#### 2. 实现按学生查看视图
- 左侧边栏：学生列表
  - 显示：学生姓名、完成度、提交时间
  - 点击选中某个学生
- 右侧主区域：该学生的所有题目答题情况
  - 题目列表（逐题显示）
  - 每道题显示：题号、题型、得分情况、学生答案

#### 3. 实现按题目查看视图
- 左侧边栏：题目列表
  - 显示：题号、题型、答对率
  - 点击选中某道题
- 右侧主区域：该题目的所有学生答题情况
  - 学生列表（逐个显示）
  - 每个学生显示：姓名、答案、是否正确

#### 4. 删除分数统计，改为完成度统计
- 顶部统计卡片显示：
  - 总题数
  - 完成人数 / 总人数
  - 平均完成度（百分比）
- 删除：平均分、最高分、最低分显示

### 改动步骤

1. 复制 `homework/review/index.vue` 的结构
2. 修改统计指标为完成度相关
3. 调整学生列表显示为完成度而非分数
4. 调整题目列表显示为答对率而非平均分

---

## 🔧 第三步：作业编辑页改造（待改造）

### 改动需求

#### 1. 删除总分设置
- 移除 `<el-form-item label="总分">` 部分
- 删除 `form.totalScore` 数据字段

#### 2. 新增关联选择
- 添加班级选择器
- 添加课程选择器

#### 3. 保留题目管理功能
- 题目列表、添加题目、删除题目功能不变
- 题型、难度设置不变

### 改动步骤

1. 在基本信息部分添加班级和课程选择器
2. 删除总分输入框
3. 更新表单验证规则

---

## 📊 改动统计

| 页面 | 改动类型 | 状态 | 说明 |
|------|---------|------|------|
| 作业列表 | UI 改造 | ✅ 完成 | 卡片式布局、新增筛选、删除分数 |
| 作业详情 | 功能改造 | ⏳ 待改造 | 双视图、完成度统计 |
| 作业编辑 | 表单改造 | ⏳ 待改造 | 删除总分、新增班级课程选择 |

---

## 🎯 改造目标

- ✅ 作业列表页：卡片式布局，显示完成度而非分数
- ⏳ 作业详情页：双视图模式，完成度统计
- ⏳ 作业编辑页：删除总分，新增班级课程选择

---

## 📝 后续工作

1. 改造作业详情页
2. 改造作业编辑页
3. 更新 Mock 数据
4. 完整测试验证

