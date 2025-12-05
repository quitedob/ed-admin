# 作业编辑页面

## 📝 功能概述

完整的作业编辑系统，支持从题库选择题目、配置作业设置、阅卷设置等功能。

## ✨ 核心功能

### 1. 基本信息
- ✅ 作业标题（50字限制）
- ✅ 关联班级选择
- ✅ 作业描述（500字限制）
- ✅ 作业类型（练习/考查/综合）
- ✅ 难度等级（简单/中等/困难）
- ✅ 总分自动计算

### 2. 时间安排
- ✅ 发布时间设置
- ✅ 截止时间设置
- ✅ 提醒时间设置
- ✅ 允许晚交开关
- ✅ 晚交扣分配置

### 3. 题目管理
- ✅ 从题库选择题目
- ✅ 题目列表展示
- ✅ 拖拽排序
- ✅ 上移/下移
- ✅ 删除题目
- ✅ 题目详情查看
- ✅ 分值调整
- ✅ 必做设置
- ✅ 补充解析

### 4. 阅卷设置
- ✅ 自动评分（选择题/填空题）
- ✅ AI辅助批改（问答题）
- ✅ AI模型选择
- ✅ 评分标准自定义
- ✅ 人工复审
- ✅ 允许晚交
- ✅ 分组做题
- ✅ 显示正确答案
- ✅ 禁用复制粘贴
- ✅ 学生互评
- ✅ 对等评分

### 5. 晚交扣分
- ✅ 按百分比扣分
- ✅ 固定扣分
- ✅ 分段扣分
- ✅ 宽限期设置
- ✅ 最晚提交时间

## 📁 文件结构

```
src/views/homework/edit/
├── index.vue                              # 主页面
├── components/
│   ├── QuestionBankSelector.vue          # 题库选择器
│   ├── QuestionDetailEditor.vue          # 题目详情编辑器
│   └── LateFeeDialog.vue                 # 晚交扣分对话框
└── README.md                              # 本文档
```

## 🚀 使用方法

### 路由配置

```javascript
{
  path: '/homework/edit',
  name: 'HomeworkEdit',
  component: () => import('@/views/homework/edit/index.vue')
}
```

### 页面跳转

```javascript
// 新建作业
router.push({
  path: '/homework/edit'
})

// 编辑作业
router.push({
  path: '/homework/edit',
  query: { id: 'hw_001' }
})
```

## 📊 数据结构

```javascript
{
  title: '第一章作业',
  classId: 'class_001',
  description: '请完成以下题目',
  type: 'exercise',
  difficulty: 'easy',
  releaseTime: '2024-12-20 10:00',
  dueTime: '2024-12-25 23:59',
  remindTime: '2024-12-24 12:00',
  questions: [
    {
      id: 'hwq_xxx',
      questionId: 'q_001',
      type: 'single',
      questionText: '题目内容',
      score: 10,
      required: true,
      homeworkExplanation: '补充解析'
    }
  ],
  settings: {
    autoGrade: true,
    aiGrade: true,
    aiModel: 'gpt-4',
    aiScoringRule: '',
    manualReview: true,
    allowLateSubmission: true,
    groupWork: false,
    showCorrectAnswers: true,
    disableCopyPaste: false,
    peerReview: false,
    peerGrading: false,
    lateFeeConfig: {
      enabled: true,
      deductionType: 'percentage',
      deductionRate: 10,
      maxDeduction: 50
    }
  }
}
```

## 🎯 核心特性

### 1. 题库集成
- 从题库选择题目
- 支持筛选（题库、题型、标签）
- 支持搜索
- 批量选择
- 实时统计

### 2. 题目管理
- 拖拽排序
- 快速上移下移
- 题目详情展示
- 分值调整
- 必做设置

### 3. 晚交扣分
- 三种扣分方式
- 宽限期设置
- 最晚提交时间
- 扣分示例计算

### 4. AI批改
- 多模型支持
- 自定义评分标准
- 人工复审机制

## 💡 最佳实践

### 1. 作业标题
- 简洁明了
- 包含章节信息
- 避免特殊字符

### 2. 时间设置
- 发布时间 < 截止时间
- 提醒时间在截止前1-2天
- 合理设置晚交期限

### 3. 题目选择
- 难度搭配合理
- 题型多样化
- 总分控制在50-100分

### 4. 阅卷设置
- 选择题建议自动评分
- 问答题可启用AI辅助
- 重要作业建议人工复审

## 🔧 自定义配置

### 修改班级列表

```javascript
const classList = computed(() => mockStore.classes)
```

### 修改AI模型选项

```vue
<el-select v-model="form.settings.aiModel">
  <el-option label="GPT-4" value="gpt-4" />
  <el-option label="Claude 3" value="claude-3" />
  <!-- 添加更多模型 -->
</el-select>
```

## 🐛 常见问题

**Q: 如何批量添加题目？**  
A: 点击"从题库选择"，使用多选功能批量选择题目

**Q: 如何调整题目顺序？**  
A: 可以拖拽题目，或使用上移/下移按钮

**Q: 晚交扣分如何计算？**  
A: 根据选择的扣分方式，系统会自动计算扣分

**Q: AI批改准确吗？**  
A: AI批改仅作为辅助，建议开启人工复审

**Q: 如何设置分组作业？**  
A: 在阅卷设置中勾选"分组做题"

## 📝 更新日志

### v1.0.0 (2024-12-20)
- ✅ 完成基本信息编辑
- ✅ 完成时间安排设置
- ✅ 完成题目管理功能
- ✅ 完成阅卷设置
- ✅ 完成晚交扣分配置
- ✅ 集成题库选择器
- ✅ 优化用户体验
