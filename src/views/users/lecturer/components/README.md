# 老师管理 - 资源授权功能

## 功能说明

### 双向授权系统

系统支持双向授权机制，可以从两个维度进行资源授权：

#### 1. 老师维度授权
**位置**: `/users/lecturer/list` - 老师列表页面

**操作**: 点击老师操作列的"授权资源"按钮

**功能**: 为指定老师授权课程、作业、考试资源

**使用场景**:
- 新老师入职，需要分配教学资源
- 老师调岗，需要调整授权资源
- 临时授权某个老师访问特定资源

#### 2. 班级维度授权
**位置**: `/class/management` - 班级管理页面

**操作**: 点击班级卡片的"授权资源"按钮

**功能**: 为指定班级授权课程、作业、考试资源

**使用场景**:
- 新学期开始，为班级分配课程
- 为班级布置作业和考试
- 调整班级的学习资源

## 资源授权抽屉

### 组件位置
`src/views/users/lecturer/components/ResourceAuthorizationDialog.vue`

### 显示方式
- **老师列表页面**: 使用抽屉式（Drawer）从右侧滑出
- **班级管理页面**: 使用抽屉式（Drawer）从右侧滑出

### 功能特性

1. **三个标签页**
   - 课程授权
   - 作业授权
   - 考试授权

2. **双列表设计**
   - 左侧：可选资源列表（支持搜索）
   - 右侧：已授权资源列表
   - 中间：添加/移除操作按钮

3. **批量操作**
   - 支持多选资源
   - 一键添加/移除

4. **搜索功能**
   - 按资源名称搜索
   - 按课程分类搜索

### 使用方式

```vue
<ResourceAuthorizationDialog
  v-model="dialogVisible"
  :target-id="targetId"
  target-type="teacher"  <!-- 或 "class" -->
  :authorized-resources="authorizedResources"
  @update:authorized-resources="handleUpdate"
/>
```

### Props

- `modelValue`: Boolean - 对话框显示状态
- `targetId`: String - 目标ID（老师ID或班级ID）
- `targetType`: String - 目标类型（'teacher' 或 'class'）
- `authorizedResources`: Object - 已授权的资源
  ```javascript
  {
    courses: [],      // 课程列表
    assignments: [],  // 作业列表
    exams: []        // 考试列表
  }
  ```

### Events

- `update:modelValue`: 对话框关闭事件
- `update:authorized-resources`: 授权资源更新事件

## 数据结构

### 老师数据结构
```javascript
{
  id: 'lecturer_001',
  name: '王老师',
  // ... 其他字段
  authorizedResources: {
    courses: [
      { id: 'course_001', name: 'Python编程基础', category: '编程语言' }
    ],
    assignments: [
      { id: 'hw_001', title: 'Python基础练习1', courseName: 'Python编程基础' }
    ],
    exams: [
      { id: 'exam_001', title: 'Python期中考试', courseName: 'Python编程基础' }
    ]
  }
}
```

### 班级数据结构
```javascript
{
  id: 'class_001',
  name: '一年级一班',
  code: 'CLS001',
  // ... 其他字段
  authorizedResources: {
    courses: [],
    assignments: [],
    exams: []
  }
}
```

## 操作流程

### 为老师授权资源

1. 进入老师列表页面 (`/users/lecturer/list`)
2. 找到目标老师，点击"授权资源"按钮
3. 右侧滑出授权抽屉：
   - 切换到对应的标签页（课程/作业/考试）
   - 在左侧列表中选择要授权的资源
   - 点击"添加 →"按钮
   - 重复以上步骤授权其他资源
4. 点击"保存全部"按钮完成授权

### 为班级授权资源

1. 进入班级管理页面 (`/class/management`)
2. 找到目标班级卡片，点击"授权资源"按钮
3. 操作流程同上

## 注意事项

1. **权限控制**: 确保当前用户有授权管理权限
2. **数据同步**: 授权后需要同步更新相关统计数据
3. **资源去重**: 同一资源不能重复授权
4. **批量操作**: 支持一次性授权多个资源
5. **搜索优化**: 资源较多时使用搜索功能快速定位
