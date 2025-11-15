# 题目编辑页面

## 📝 功能概述

完整的题目编辑系统，支持5种题型的创建和编辑，提供最大化布局和丰富的编辑功能。

## 🎯 支持的题型

### 1. 单选题 (Single Choice)
- ✅ 动态添加/删除选项
- ✅ 单选正确答案
- ✅ 题目解析
- ✅ 可视化正确答案标识

### 2. 多选题 (Multiple Choice)
- ✅ 动态添加/删除选项
- ✅ 多选正确答案
- ✅ 题目解析
- ✅ 可视化正确答案标识

### 3. 填空题 (Fill in the Blank)
- ✅ 多个填空支持
- ✅ 每个空支持多个可接受答案
- ✅ 评分方式选择（全对得分/部分得分）
- ✅ 题目解析

### 4. 问答题 (Essay)
- ✅ 参考答案
- ✅ 评分标准
- ✅ AI辅助评分配置
- ✅ 分数范围设置
- ✅ AI评分权重设置
- ✅ 题目解析

### 5. 编程题 (Programming/HOJ)
- ✅ HOJ题目绑定
- ✅ 自动获取题目信息
- ✅ 时间/内存限制
- ✅ 必做设置
- ✅ 多次提交设置
- ✅ 测试用例显示控制
- ✅ 提交次数限制
- ✅ 语言限制
- ✅ 题目解析

## 📁 文件结构

```
src/views/assignments/edit-question/
├── index.vue                              # 主页面
├── components/
│   ├── SingleChoiceEditor.vue            # 单选题编辑器
│   ├── MultipleChoiceEditor.vue          # 多选题编辑器
│   ├── FillBlankEditor.vue               # 填空题编辑器
│   ├── EssayEditor.vue                   # 问答题编辑器
│   ├── ProgrammingEditor.vue             # 编程题编辑器
│   └── QuestionPreviewDialog.vue         # 题目预览对话框
└── README.md                              # 本文档
```

## 🚀 使用方法

### 路由配置

```javascript
// router/index.js
{
  path: '/assignments/edit-question',
  name: 'EditQuestion',
  component: () => import('@/views/assignments/edit-question/index.vue'),
  meta: { title: '编辑题目' }
}
```

### 页面跳转

```javascript
// 新建题目
router.push({
  path: '/assignments/edit-question',
  query: {
    bankId: 'bank_001'
  }
})

// 编辑题目
router.push({
  path: '/assignments/edit-question',
  query: {
    bankId: 'bank_001',
    questionId: 'q_001'
  }
})
```

### 在题库列表中使用

```vue
<template>
  <el-button @click="handleEditQuestion(question)">
    编辑题目
  </el-button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleEditQuestion = (question) => {
  router.push({
    path: '/assignments/edit-question',
    query: {
      bankId: question.bankId,
      questionId: question.id
    }
  })
}
</script>
```

## 🎨 页面布局

### 顶部操作栏
- 面包屑导航
- 预览按钮
- 保存按钮
- 取消按钮

### 基本信息区
- 题号（自动生成）
- 题型选择
- 难度选择
- 分值设置
- 标签管理
- 题目描述（支持富文本）

### 题型编辑区
根据选择的题型动态显示对应的编辑器

### 底部操作区
- 预览题目
- 保存草稿
- 发布到题库
- 取消编辑

## 💡 核心功能

### 1. 题型切换
选择不同题型时，自动切换到对应的编辑器，保留基本信息。

### 2. 标签管理
- 选择已有标签
- 创建新标签
- 标签管理对话框

### 3. 富文本编辑
- 插入图片
- 插入表格
- 插入代码块

### 4. 题目预览
实时预览题目效果，包括：
- 题目信息展示
- 选项/答案展示
- 正确答案标识
- 题目解析

### 5. 数据验证
- 必填项验证
- 格式验证
- 逻辑验证

## 📊 数据结构

### 表单数据结构

```javascript
{
  questionNumber: 'Q1234567890',
  type: 'single',  // single, multiple, fill, essay, programming
  difficulty: 'easy',  // easy, medium, hard
  score: 10,
  tags: ['基础', '第一章'],
  questionText: '题目内容...',
  
  // 单选题
  singleChoice: {
    options: [
      { value: 'A', text: '选项A', isCorrect: false },
      { value: 'B', text: '选项B', isCorrect: false }
    ],
    correctAnswer: 'A',
    explanation: '解析内容'
  },
  
  // 多选题
  multipleChoice: {
    options: [
      { value: 'A', text: '选项A', isCorrect: true },
      { value: 'B', text: '选项B', isCorrect: false }
    ],
    correctAnswers: ['A', 'C'],
    explanation: '解析内容'
  },
  
  // 填空题
  fillBlanks: {
    blanks: [
      { id: 1, answers: ['答案1', '答案2'] }
    ],
    scoringMethod: 'all',  // all: 全对得分, partial: 部分得分
    explanation: '解析内容'
  },
  
  // 问答题
  essay: {
    referenceAnswer: '参考答案',
    gradingCriteria: '评分标准',
    aiGrading: true,
    aiGradingCriteria: 'AI评分标准',
    scoreRange: { min: 0, max: 10 },
    aiWeight: 50,
    explanation: '解析内容'
  },
  
  // 编程题
  programming: {
    hojProblemId: 'CF-1001',
    problemName: 'Array Sum',
    timeLimit: 1000,
    memoryLimit: 256,
    difficulty: 3,
    required: true,
    multipleSubmit: true,
    showTestCases: false,
    submitLimit: 0,
    allowedLanguages: ['C++', 'Java', 'Python'],
    explanation: '解析内容'
  }
}
```

## 🔧 自定义配置

### 修改可用标签

在 `index.vue` 中修改 `availableTags`：

```javascript
const availableTags = ref([
  { id: 'tag_001', name: '基础', color: '#409EFF', usage: 45 },
  { id: 'tag_002', name: '第一章', color: '#67C23A', usage: 50 }
])
```

### 修改难度选项

在 `index.vue` 的表单中修改：

```vue
<el-select v-model="form.difficulty">
  <el-option label="简单" value="easy" />
  <el-option label="中等" value="medium" />
  <el-option label="困难" value="hard" />
  <el-option label="极难" value="expert" />  <!-- 新增 -->
</el-select>
```

### 修改分值范围

在 `index.vue` 中修改：

```vue
<el-input-number 
  v-model="form.score" 
  :min="1" 
  :max="200"  <!-- 修改最大值 -->
/>
```

## 🎯 最佳实践

### 1. 题目编号规则
建议使用统一的题号格式：`Q + 时间戳` 或 `题库ID + 序号`

### 2. 标签使用
- 使用层级标签：章节 > 知识点 > 难度
- 标签数量控制在3-5个
- 统一标签命名规范

### 3. 题目描述
- 清晰简洁
- 使用富文本增强可读性
- 必要时添加图片或代码示例

### 4. 选项设置
- 单选题至少2个选项
- 多选题至少2个正确答案
- 选项内容避免歧义

### 5. 填空题
- 每个空提供多个可接受答案
- 考虑大小写、空格等情况
- 明确评分方式

### 6. 问答题
- 提供详细的参考答案
- 设置清晰的评分标准
- 合理使用AI辅助评分

### 7. 编程题
- 确保HOJ题目ID正确
- 设置合理的时间和内存限制
- 明确语言限制

## 🐛 常见问题

### Q: 如何批量导入题目？
A: 可以在题库列表页面使用批量导入功能，支持Excel和JSON格式。

### Q: 题目保存后如何修改？
A: 在题库列表中点击"编辑"按钮，会跳转到编辑页面。

### Q: 如何复制题目？
A: 在题库列表中选择题目，点击"复制"按钮，会创建一个新题目。

### Q: 题目预览和实际显示有差异？
A: 预览功能仅供参考，实际显示效果以学生端为准。

### Q: 如何设置题目的显示顺序？
A: 在题库列表中可以拖拽排序，或设置题号来控制顺序。

## 🔄 更新日志

### v1.0.0 (2024-12-20)
- ✅ 完成5种题型的编辑器
- ✅ 实现题目预览功能
- ✅ 集成标签管理
- ✅ 添加数据验证
- ✅ 优化用户体验

## 📞 技术支持

如有问题或建议，请联系开发团队。
