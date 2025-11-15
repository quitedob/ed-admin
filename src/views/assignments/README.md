# 题库管理系统

## 功能概述

完整的题库管理系统，支持题库的创建、编辑、删除，以及题目的全生命周期管理。

## 页面结构

### 1. 题库首页 (index.vue)
**布局：左右双面板**

#### 左侧栏 (240px固定宽)
- 操作按钮区
  - 新建题库（主按钮）
  - 导入/导出（次要按钮）
- 题库列表
  - 显示题库名称
  - 显示题目数量
  - 显示最后编辑时间
  - 支持选中高亮
- 搜索和筛选
  - 搜索框
  - 筛选下拉框（按题量、时间等）

#### 右侧内容区 (自适应)
- 题库详情卡片
  - 题库基本信息（名称、总题数、最后修改时间）
  - 题型分布统计（单选、多选、填空、问答、编程题）
  - 快速操作按钮（编辑、查看全部、删除）

### 2. 题目列表视图 (QuestionListView.vue)
- 工具栏
  - 新建题目按钮
  - 批量导入按钮
  - 标签管理按钮
  - 搜索框
- 题目表格
  - 题号、题型、题目内容、难度、分值、标签
  - 操作列（编辑、删除）
- 分页组件

### 3. 题目编辑对话框 (QuestionEditDialog.vue)
**支持5种题型的完整编辑**

#### 基本信息区
- 题号（自动生成）
- 题型选择（单选、多选、填空、问答、编程）
- 难度选择（简单、中等、困难）
- 分值设置
- 标签选择（支持多选和新建）
- 题目描述（富文本）

#### 题型特定编辑区

**单选题**
- ABCDE选项编辑
- 单选正确答案
- 支持添加/删除选项

**多选题**
- ABCDE选项编辑
- 多选正确答案（复选框）
- 支持添加/删除选项

**填空题**
- 支持多个填空
- 每个填空支持多个可接受答案
- 动态添加/删除填空和答案

**问答题**
- 参考答案输入
- 评分标准输入
- AI辅助评分开关

**编程题(HOJ)**
- 题目ID绑定
- 时间限制设置
- 内存限制设置
- 必做开关
- 允许多次提交开关

#### 底部操作区
- 取消按钮
- 预览按钮
- 保存按钮

### 4. 标签管理对话框 (TagManageDialog.vue)
- 工具栏
  - 新建标签按钮
  - 搜索框
  - 排序选择（按名称、使用频率、创建时间）
- 标签列表表格
  - 标签名称（带颜色显示）
  - 描述
  - 使用次数
  - 操作（编辑、删除）
- 分页组件

#### 标签编辑表单
- 标签名称
- 描述
- 颜色选择器
- 标签类型（知识点、难度、题型、章节、其他）

## 数据结构

### 题库 (QuestionBank)
```javascript
{
  id: 'bank_001',
  name: '第一章基础题库',
  description: '第一章的基础知识题目集合',
  courseId: 'course_001',
  totalQuestions: 50,
  createdAt: '2024-12-01T10:00:00Z',
  updatedAt: '2024-12-20T15:30:00Z',
  createdBy: 'teacher_001',
  tags: ['基础', '第一章'],
  statistics: {
    singleChoice: 20,
    multipleChoice: 15,
    fillBlank: 10,
    essay: 5,
    programming: 0
  },
  availableTags: [
    { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 }
  ],
  questions: []
}
```

### 题目 (Question)
```javascript
{
  id: 'q_001',
  type: 'single', // single, multiple, fill, essay, programming
  questionText: '软件工程的核心目标是什么?',
  difficulty: 'easy', // easy, medium, hard
  score: 2,
  tags: ['基础', '第一章'],
  // 单选/多选
  options: [
    { value: 'A', text: '提高开发速度', isCorrect: false }
  ],
  correctAnswer: 'C',
  // 填空题
  fillBlanks: [
    { answers: ['北京', '北京市'] }
  ],
  // 问答题
  referenceAnswer: '...',
  gradingCriteria: '...',
  aiGrading: false,
  // 编程题
  hojProblemId: 'CF-1001',
  timeLimit: 1000,
  memoryLimit: 256,
  required: true,
  multipleSubmit: true,
  // 解析
  explanation: '...',
  createdAt: '2024-12-01T10:00:00Z'
}
```

### 标签 (Tag)
```javascript
{
  id: 'tag_001',
  name: '基础知识',
  description: '基础知识相关题目',
  color: '#409EFF',
  type: 'knowledge_point', // knowledge_point, difficulty, question_type, chapter, other
  usage: 45,
  createdAt: '2024-12-01T10:00:00Z',
  updatedAt: '2024-12-20T15:30:00Z',
  createdBy: 'teacher_001'
}
```

## 设计规范

### 左侧栏
- 宽度：固定240px
- 背景色：`var(--color-bg-secondary)`
- 行高：48px
- 选中状态：`bg: var(--color-primary-light-9)`, `border-left: 3px solid var(--color-primary)`

### 右侧内容区
- 背景色：`var(--color-bg-primary)`
- 边框：`1px solid var(--color-border-light)`
- 圆角：`12px`
- 阴影：`var(--shadow-base)`

### 统计卡片
- 渐变背景：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 文字颜色：白色
- 圆角：8px

## 功能特性

✅ 题库列表展示和选择
✅ 题库创建、编辑、删除
✅ 题库详情预览
✅ 题型分布统计
✅ 题目列表查看
✅ 5种题型完整编辑支持
✅ 标签管理系统
✅ 搜索和筛选功能
✅ 响应式布局

## 待开发功能

🔲 题目导入/导出
🔲 题目预览功能
🔲 富文本编辑器集成
🔲 图片上传功能
🔲 HOJ系统集成
🔲 AI辅助评分
🔲 批量操作
🔲 题目复制功能
🔲 题库统计图表
🔲 权限控制

## 使用说明

1. 进入题库管理页面，左侧显示所有题库列表
2. 点击题库可在右侧查看详情和统计信息
3. 点击"新建题库"创建新的题库
4. 点击"查看全部题目"进入题目列表
5. 在题目列表中可以新建、编辑、删除题目
6. 点击"标签管理"可以管理所有标签

## 技术栈

- Vue 3 Composition API
- Element Plus UI组件库
- SCSS样式预处理器
