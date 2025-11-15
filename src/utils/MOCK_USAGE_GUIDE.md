# 模拟数据系统使用指南

## 概述

本系统提供完整的模拟数据生成、存储和管理功能，用于前端开发和演示。

## 快速开始

### 1. 初始化模拟数据

在应用入口（如 `main.js` 或 `App.vue`）中初始化：

```javascript
import { useMockStore } from '@/stores/mockStore'

// 在应用启动时初始化
const mockStore = useMockStore()
mockStore.initialize()
```

### 2. 在组件中使用

```vue
<script setup>
import { computed } from 'vue'
import { useMockStore } from '@/stores/mockStore'

const mockStore = useMockStore()

// 获取所有班级
const classes = computed(() => mockStore.classes)

// 获取指定班级的学生
const students = computed(() => mockStore.getStudentsByClass('class_001'))

// 获取统计信息
const stats = computed(() => mockStore.statistics)
</script>
```

## 数据结构

### 题库 (QuestionBank)

```javascript
{
  id: 'bank_001',
  name: '第一章基础题库',
  description: '题库描述',
  courseId: 'course_001',
  totalQuestions: 50,
  statistics: {
    singleChoice: 20,
    multipleChoice: 15,
    fillBlank: 10,
    essay: 5,
    programming: 0
  },
  tags: ['基础', '第一章'],
  createdAt: '2024-12-01T10:00:00Z'
}
```

### 班级 (Class)

```javascript
{
  id: 'class_001',
  name: '前端开发一班',
  description: '班级描述',
  headTeacherId: 'teacher_001',
  headTeacherName: '王老师',
  studentCount: 30,
  courseCount: 3,
  status: 'active',
  createdAt: '2024-09-01T10:00:00Z'
}
```

### 学生 (Student)

```javascript
{
  id: 'stu_class_001_001',
  studentId: '2024001001',
  name: '张三',
  phone: '13800138000',
  email: 'student1@example.com',
  classes: [{ id: 'class_001', name: '前端开发一班' }],
  statistics: {
    totalHomeworks: 10,
    completedHomeworks: 8,
    averageScore: 85
  },
  status: 'active'
}
```

### 作业 (Homework)

```javascript
{
  id: 'hw_class_001_1',
  classId: 'class_001',
  title: '第一章作业',
  description: '作业描述',
  totalScore: 50,
  submitCount: 25,
  submitRate: 83.3,
  status: 'published',
  schedule: {
    releaseTime: '2024-12-01T10:00:00Z',
    dueTime: '2024-12-08T23:59:59Z'
  }
}
```

## API 使用

### 使用 Mock API

```javascript
import mockApi from '@/api/mock'

// 获取题库列表
const response = await mockApi.questionBankApi.getQuestionBanks()
console.log(response.data.records)

// 获取班级详情
const classDetail = await mockApi.classApi.getClassDetail('class_001')
console.log(classDetail.data)

// 创建新作业
const newHomework = await mockApi.homeworkApi.saveHomework({
  classId: 'class_001',
  title: '新作业',
  totalScore: 100
})
```

### 直接使用 Store

```javascript
import { useMockStore } from '@/stores/mockStore'

const mockStore = useMockStore()

// 添加班级
mockStore.addClass({
  name: '新班级',
  headTeacherName: '李老师',
  studentCount: 0
})

// 更新学生信息
mockStore.updateStudent('stu_001', {
  name: '新名字',
  phone: '13900139000'
})

// 删除作业
mockStore.deleteHomework('hw_001')
```

## 数据量规范

| 对象 | 数量 | 说明 |
|------|------|------|
| 题库 | 3-5个 | 每个课程多个不同类型的题库 |
| 题目/题库 | 50-100道 | 每个题库包含50-100道题 |
| 班级 | 2-3个 | 演示用途，3个班级足够 |
| 学生/班级 | 20-30人 | 展示分组效果 |
| 作业/班级 | 3-5个 | 每个班级3-5个作业 |
| 考试/班级 | 1-2个 | 每个班级1-2个考试 |

## 数据分布

### 题目类型分布
- 单选题: 40%
- 多选题: 30%
- 填空题: 15%
- 问答题: 10%
- 编程题: 5%

### 难度分布
- 简单: 30%
- 中等: 50%
- 困难: 20%

### 成绩分布（正态分布）
- 优秀(90-100): 15%
- 良好(80-89): 30%
- 中等(70-79): 35%
- 及格(60-69): 15%
- 不及格(<60): 5%

## 本地存储

### 存储管理

```javascript
import { 
  saveMockData, 
  loadMockData, 
  clearMockData,
  resetMockData,
  exportMockData,
  importMockData,
  getStorageInfo
} from '@/utils/mockStorage'

// 保存数据
saveMockData(data)

// 加载数据
const data = loadMockData()

// 清除数据
clearMockData()

// 重置数据（清除并重新生成）
const newData = resetMockData()

// 导出数据为JSON文件
exportMockData()

// 导入数据从文件
const file = event.target.files[0]
await importMockData(file)

// 获取存储信息
const info = getStorageInfo()
console.log(`存储大小: ${info.sizeKB} KB`)
```

### 存储键和版本

- 存储键: `edu_system_mock_data_v1`
- 版本: `1.0.0`
- 自动版本检查和数据迁移

## 高级用法

### 自定义数据生成

```javascript
import { generateQuestions, generateStudents } from '@/utils/mockData'

// 生成100道题目
const questions = generateQuestions(100)

// 为特定班级生成50个学生
const students = generateStudents('class_001', 50)
```

### 批量操作

```javascript
const mockStore = useMockStore()

// 批量添加学生
const newStudents = Array.from({ length: 10 }, (_, i) => ({
  name: `学生${i + 1}`,
  studentId: `2024000${i + 1}`,
  classId: 'class_001'
}))

newStudents.forEach(student => {
  mockStore.addStudent(student)
})
```

### 数据统计

```javascript
const mockStore = useMockStore()

// 获取班级统计
const classStats = mockStore.getClassStatistics('class_001')
console.log(`学生数: ${classStats.studentCount}`)
console.log(`作业数: ${classStats.homeworkCount}`)
console.log(`平均提交率: ${classStats.avgHomeworkSubmitRate}%`)

// 获取学生统计
const studentStats = mockStore.getStudentStatistics('stu_001')
console.log(`平均分: ${studentStats.averageScore}`)
console.log(`提交率: ${studentStats.submissionRate}%`)
```

## 注意事项

1. **数据持久化**: 数据自动保存到 localStorage，刷新页面不会丢失
2. **版本控制**: 版本不匹配时会自动重新生成数据
3. **存储限制**: localStorage 有大小限制（通常5-10MB），注意数据量
4. **性能优化**: 大量数据操作后记得调用 `save()` 方法持久化
5. **开发模式**: 仅用于开发和演示，生产环境应使用真实API

## 调试技巧

### 查看当前数据

```javascript
const mockStore = useMockStore()
console.log('题库:', mockStore.questionBanks)
console.log('班级:', mockStore.classes)
console.log('学生:', mockStore.students)
console.log('统计:', mockStore.statistics)
```

### 重置数据

```javascript
// 方法1: 通过 Store
const mockStore = useMockStore()
mockStore.reset()

// 方法2: 通过工具函数
import { resetMockData } from '@/utils/mockStorage'
resetMockData()
```

### 清除浏览器存储

```javascript
// 清除模拟数据
import { clearMockData } from '@/utils/mockStorage'
clearMockData()

// 或直接操作 localStorage
localStorage.removeItem('edu_system_mock_data_v1')
```

## 常见问题

### Q: 数据没有保存？
A: 确保调用了 `mockStore.save()` 或使用了 Store 的增删改方法（会自动保存）

### Q: 刷新后数据丢失？
A: 检查浏览器是否禁用了 localStorage，或存储空间是否已满

### Q: 如何恢复初始数据？
A: 调用 `mockStore.reset()` 或 `resetMockData()`

### Q: 如何备份数据？
A: 使用 `exportMockData()` 导出为 JSON 文件

### Q: 如何在多个环境间共享数据？
A: 导出数据文件，在其他环境使用 `importMockData()` 导入
