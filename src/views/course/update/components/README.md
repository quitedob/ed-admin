# 课程班级授权与章节开放控制

## 功能概述

实现课程与班级的授权管理，以及按章节粒度的内容开放控制。

### 核心概念

- **授权（Authorization）**：班级与课程之间的绑定关系
- **开放（Open）**：具体章节内容的可见性控制

## 数据结构

### 1. class_course（班级课程关系表）

```sql
CREATE TABLE class_course (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id VARCHAR(50) NOT NULL COMMENT '班级ID',
  course_id VARCHAR(50) NOT NULL COMMENT '课程ID',
  status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active/paused/finished',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_class_course (class_id, course_id)
);
```

### 2. class_course_chapter_open（章节开放记录表）

```sql
CREATE TABLE class_course_chapter_open (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id VARCHAR(50) NOT NULL COMMENT '班级ID',
  course_id VARCHAR(50) NOT NULL COMMENT '课程ID',
  chapter_id VARCHAR(50) NOT NULL COMMENT '章节ID',
  is_open BOOLEAN DEFAULT FALSE COMMENT '是否开放',
  open_at TIMESTAMP NULL COMMENT '开放时间',
  close_at TIMESTAMP NULL COMMENT '关闭时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_class_course_chapter (class_id, course_id, chapter_id)
);
```

## API接口

### 1. 获取已授权班级列表

```
GET /class/admin/course/{courseId}/authorized-classes
```

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "classId": "class_001",
      "className": "2024春季班",
      "status": "active",
      "studentCount": 45,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### 2. 添加班级授权

```
POST /class/admin/course/authorization
```

**请求体：**
```json
{
  "courseId": "course_001",
  "classIds": ["class_001", "class_002"]
}
```

### 3. 移除班级授权

```
DELETE /class/admin/course/{courseId}/authorization/{classId}
```

### 4. 获取章节开放状态

```
GET /class/admin/course/chapter/open-status?classId={classId}&courseId={courseId}
```

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "chapter_001": {
      "isOpen": true,
      "openAt": "2024-01-15T00:00:00Z",
      "closeAt": null
    },
    "chapter_002": {
      "isOpen": false,
      "openAt": null,
      "closeAt": null
    }
  }
}
```

### 5. 更新章节开放状态

```
POST /class/admin/course/chapter/open
```

**请求体：**
```json
{
  "classId": "class_001",
  "courseId": "course_001",
  "chapterId": "chapter_001",
  "isOpen": true,
  "openAt": "2024-01-15T00:00:00Z",
  "closeAt": null
}
```

### 6. 批量更新章节开放状态

```
POST /class/admin/course/chapter/batch-open
```

**请求体：**
```json
{
  "classId": "class_001",
  "courseId": "course_001",
  "chapterIds": ["chapter_001", "chapter_002"],
  "isOpen": true
}
```

## 使用流程

### 课程端操作流程

1. **进入课程编辑页**
   - 访问 `/course/update?courseId=xxx`
   - 点击左侧导航"班级授权"

2. **添加授权班级**
   - 点击"添加班级"按钮
   - 选择要授权的班级
   - 确认添加

3. **控制章节开放**
   - 从左侧选择已授权的班级
   - 在右侧章节列表中开关对应章节
   - 支持批量开放/关闭

### 班级端操作流程

1. **进入班级管理页**
   - 访问班级详情页
   - 进入"课程授权"标签

2. **查看已授权课程**
   - 查看该班级已绑定的所有课程
   - 查看每门课程的章节开放情况

3. **控制章节开放**
   - 选择具体课程
   - 开关对应章节的可见性

## 权限控制

### 课程端权限
- 课程创建者/管理员可以：
  - 添加/移除班级授权
  - 控制所有已授权班级的章节开放

### 班级端权限
- 班级管理员可以：
  - 查看已授权的课程
  - 控制本班级的章节开放（如果有权限）

## 业务规则

1. **授权规则**
   - 一个班级可以授权多门课程
   - 一门课程可以授权给多个班级
   - 移除授权后，该班级学生无法访问课程

2. **开放规则**
   - 最小开放单位为"大章节"
   - 未开放的章节，学生无法查看
   - 可以设置开放时间和关闭时间
   - 支持批量操作

3. **状态管理**
   - `active`: 正常进行中
   - `paused`: 已暂停（学生无法访问）
   - `finished`: 已结束（只读模式）

## 扩展功能

### 未来可扩展的功能

1. **小节级别开放**
   - 当前是章节级别，可扩展到小节级别
   - 需要添加 `section_id` 字段

2. **定时开放**
   - 设置自动开放时间
   - 设置自动关闭时间

3. **条件开放**
   - 完成前置章节后自动开放
   - 达到学习进度后开放

4. **开放通知**
   - 章节开放时通知学生
   - 即将关闭时提醒

## 组件说明

### ClassAuthorizationPanel.vue

**Props:**
- `courseId`: 课程ID
- `chapters`: 章节列表

**功能:**
- 显示已授权班级列表
- 添加/移除班级授权
- 控制章节开放状态
- 批量操作

**使用示例:**
```vue
<ClassAuthorizationPanel
  :course-id="courseData.id"
  :chapters="courseData.chapters"
/>
```

## 注意事项

1. 移除班级授权前需要确认，避免误操作
2. 章节开放状态变更会立即生效
3. 批量操作需要二次确认
4. 建议按教学进度逐步开放章节
