# 题库界面重构完成总结

## 修改内容

### 1. 题库界面简化 (src/views/assignments/index.vue)

**主要变更：**
- 移除了多题库管理，改为单一题库
- 移除了左侧边栏，采用单页面布局
- 添加了题型分类标签（全部、单选题、多选题、填空题、判断题、OJ题、简答题）
- 在右上角添加了"添加题目"和"导入题目"按钮
- 支持JSON格式导入题目

**题型支持：**
- 单选题 (single)
- 多选题 (multiple)
- 填空题 (fill)
- 判断题 (judge) - 新增
- OJ题 (programming)
- 简答题 (essay)

**功能特性：**
- 题型筛选：点击题型标签可筛选对应类型的题目
- 添加题目：打开题目编辑对话框创建新题目
- 导入题目：支持上传JSON文件批量导入题目
- 编辑题目：点击表格中的编辑按钮修改题目
- 删除题目：点击删除按钮移除题目

### 2. 题目编辑对话框更新 (src/views/assignments/components/QuestionEditDialog.vue)

**新增判断题支持：**
- 添加了"判断题"选项到题型选择器
- 实现了判断题的答案选择（正确/错误）
- 判断题使用布尔值作为正确答案

### 3. 修复错误

**修复 getCourseDetail 错误：**
- 在 `src/utils/mockData.js` 中添加了 `mockApi` 导出
- 实现了 `getCourseDetail` 方法返回模拟课程数据
- 解决了 "Cannot read properties of undefined (reading 'getCourseDetail')" 错误

**修复图片加载错误：**
- 替换了 `via.placeholder.com` 的外部图片链接
- 使用 SVG data URL 作为占位图片
- 解决了 "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" 错误

## 数据结构

### 题库数据结构
```javascript
{
  id: 'bank_001',
  name: '题库',
  totalQuestions: 6,
  questions: [...]
}
```

### 题目数据结构示例

**单选题：**
```javascript
{
  id: 'q_001',
  type: 'single',
  questionText: '以下哪个不是面向对象编程的特性？',
  difficulty: 'easy',
  score: 2,
  options: [
    { value: 'A', text: '封装', isCorrect: false },
    { value: 'B', text: '继承', isCorrect: false },
    { value: 'C', text: '多态', isCorrect: false },
    { value: 'D', text: '编译', isCorrect: true }
  ],
  correctAnswer: 'D',
  explanation: '编译是程序执行过程，不是面向对象的特性'
}
```

**判断题：**
```javascript
{
  id: 'q_004',
  type: 'judge',
  questionText: 'Java中，接口可以包含方法的实现。',
  difficulty: 'medium',
  score: 2,
  correctAnswer: true,
  explanation: 'Java 8之后，接口可以包含默认方法和静态方法的实现'
}
```

**OJ题：**
```javascript
{
  id: 'q_005',
  type: 'programming',
  questionText: '实现一个函数，判断一个字符串是否为回文串',
  difficulty: 'medium',
  score: 10,
  hojProblemId: '1001',
  timeLimit: 1000,
  memoryLimit: 256,
  required: true,
  multipleSubmit: true,
  explanation: '可以使用双指针法，从两端向中间比较'
}
```

## 使用说明

### 添加题目
1. 点击右上角"添加题目"按钮
2. 在对话框中选择题型
3. 填写题目内容、难度、分值等信息
4. 根据题型填写对应的选项或答案
5. 点击"保存"按钮

### 导入题目
1. 准备JSON格式的题目文件（数组格式）
2. 点击右上角"导入题目"按钮
3. 选择JSON文件
4. 系统自动解析并导入题目

### JSON导入格式示例
```json
[
  {
    "type": "single",
    "questionText": "题目内容",
    "difficulty": "easy",
    "score": 2,
    "options": [
      { "value": "A", "text": "选项A", "isCorrect": false },
      { "value": "B", "text": "选项B", "isCorrect": true }
    ],
    "correctAnswer": "B",
    "explanation": "解析内容"
  }
]
```

## 技术栈

- Vue 3 Composition API
- Element Plus UI组件库
- SCSS样式预处理器
- 纯前端实现，使用模拟数据

## 已解决的问题

✅ 简化题库界面为单一题库
✅ 添加题型分类标签
✅ 实现题目添加功能
✅ 实现JSON格式导入功能
✅ 支持6种题型（单选、多选、填空、判断、OJ、简答）
✅ 修复 getCourseDetail 未定义错误
✅ 修复 via.placeholder.com SSL错误
✅ 所有功能使用模拟数据，不依赖后台接口

## 测试建议

1. 测试添加各种题型的题目
2. 测试JSON导入功能
3. 测试题型筛选功能
4. 测试编辑和删除题目
5. 验证所有错误已修复
