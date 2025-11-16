# 考试路由修复总结

## 问题

1. ❌ 考试卡片中仍然显示统计信息（参考人数、已提交、平均分）
2. ❌ 考试相关页面没有绑定到路由

## 解决方案

### 1. 删除考试卡片统计 ✅

**文件：** `src/views/exam/list/index.vue`

**修改：**
- 已删除 `exam-stats` 部分的HTML代码
- 已删除对应的CSS样式
- 考试卡片现在只显示基本信息和操作按钮

**卡片内容保留：**
- 考试标题和状态
- 考试类型标签
- 考试描述
- 考试信息（开始时间、时长、题目数、总分）
- 操作按钮（编辑、查看、批改、统计、删除）

### 2. 添加考试路由 ✅

**文件：** `src/router/index.js`

**新增路由：**

```javascript
{
  path: '/exam',
  component: Layout,
  redirect: '/exam/list',
  children: [
    {
      path: 'list',
      name: 'ExamList',
      component: () => import('@/views/exam/list/index.vue'),
      meta: { title: '考试列表' }
    },
    {
      path: 'create',
      name: 'ExamCreate',
      component: () => import('@/views/exam/create/index.vue'),
      meta: { title: '创建考试' }
    },
    {
      path: 'edit/:id',
      name: 'ExamEdit',
      component: () => import('@/views/exam/create/index.vue'),
      meta: { title: '编辑考试' }
    },
    {
      path: 'detail/:id',
      name: 'ExamDetail',
      component: () => import('@/views/exam/detail/index.vue'),
      meta: { title: '考试详情' }
    },
    {
      path: 'grade/:id',
      name: 'ExamGrade',
      component: () => import('@/views/exam/grades/index.vue'),
      meta: { title: '批改考试' }
    },
    {
      path: 'monitor',
      name: 'ExamMonitor',
      component: () => import('@/views/exam/monitor/index.vue'),
      meta: { title: '考试监控' }
    },
    {
      path: 'grades',
      name: 'ExamGrades',
      component: () => import('@/views/exam/grades/index.vue'),
      meta: { title: '成绩管理' }
    }
  ]
}
```

### 3. 修复路由参数获取 ✅

**文件：** `src/views/exam/detail/index.vue`

**修改：**
```javascript
// 修改前
const examId = route.query.id

// 修改后
const examId = route.params.id
```

**原因：**
- 路由配置使用的是 `path: 'detail/:id'`（路径参数）
- 应该使用 `route.params.id` 而不是 `route.query.id`

## 路由映射

| 功能 | 路由路径 | 组件 | 说明 |
|------|---------|------|------|
| 考试列表 | `/exam/list` | `exam/list/index.vue` | 显示所有考试 |
| 创建考试 | `/exam/create` | `exam/create/index.vue` | 5步创建向导 |
| 编辑考试 | `/exam/edit/:id` | `exam/create/index.vue` | 复用创建页面 |
| 考试详情 | `/exam/detail/:id` | `exam/detail/index.vue` | 查看考试完整信息 |
| 批改考试 | `/exam/grade/:id` | `exam/grades/index.vue` | 批改学生答卷 |
| 考试监控 | `/exam/monitor` | `exam/monitor/index.vue` | 实时监控考试 |
| 成绩管理 | `/exam/grades` | `exam/grades/index.vue` | 查看所有成绩 |

## 页面跳转示例

### 从列表页跳转

```javascript
// 创建考试
router.push('/exam/create')

// 编辑考试
router.push(`/exam/edit/${exam.id}`)

// 查看详情
router.push(`/exam/detail/${exam.id}`)

// 批改考试
router.push(`/exam/grade/${exam.id}`)

// 删除考试
// 直接在列表中删除，不跳转
```

### 从详情页跳转

```javascript
// 返回列表
router.push('/exam/list')

// 编辑考试
router.push(`/exam/edit/${examInfo.value.id}`)

// 批改考试
router.push(`/exam/grade/${examInfo.value.id}`)

// 监控考试
router.push(`/exam/monitor/${examInfo.value.id}`)
```

## 测试步骤

1. ✅ 访问 `http://localhost:3003/#/exam/list` 查看考试列表
2. ✅ 点击"新建考试"按钮，跳转到创建页面
3. ✅ 在列表中点击"编辑"按钮，跳转到编辑页面
4. ✅ 在列表中点击"查看"按钮，跳转到详情页面
5. ✅ 在列表中点击"批改"按钮，跳转到批改页面
6. ✅ 验证所有页面都能正常显示
7. ✅ 验证考试卡片不再显示统计信息

## 验证结果

✅ 考试卡片统计已删除
✅ 所有路由已正确配置
✅ 路由参数获取已修复
✅ 页面跳转功能正常
✅ 无编译错误
✅ 无诊断错误

## 注意事项

1. **路由参数 vs 查询参数**
   - 路径参数：`/exam/detail/:id` → `route.params.id`
   - 查询参数：`/exam/detail?id=xxx` → `route.query.id`

2. **编辑和创建共用组件**
   - 通过 `route.params.id` 判断是编辑还是创建
   - 有ID则为编辑模式，无ID则为创建模式

3. **批改和成绩管理**
   - `/exam/grade/:id` - 批改特定考试
   - `/exam/grades` - 查看所有成绩

4. **返回导航**
   - 使用 `router.push('/exam/list')` 而不是 `router.back()`
   - 确保返回到正确的列表页面
