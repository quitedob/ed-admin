# 班级管理模块 - 功能说明

## 已完成的修改

### 1. ✅ 班级码系统生成，不可修改

**实现方式**:
- 班级码字段设置为 `readonly` 和 `disabled`
- 移除了"编辑"按钮
- 添加提示图标说明"班级码由系统自动生成，不可修改"

**后端要求**:
```sql
-- 数据库字段添加唯一索引
ALTER TABLE classes ADD UNIQUE INDEX idx_class_code (class_code);
```

**后端逻辑**:
```javascript
// 生成班级码函数
function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除易混淆字符
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 创建班级时生成唯一班级码
async function createClass(classData) {
  let classCode = generateClassCode()
  
  // 检查是否重复，重复则重新生成
  while (await isClassCodeExists(classCode)) {
    classCode = generateClassCode()
  }
  
  classData.code = classCode
  return await saveClass(classData)
}
```

---

### 2. ✅ 通用实体选择器组件

**文件**: `src/components/EntitySelector/EntitySelectorDialog.vue`

**功能特性**:
- 支持多种实体类型：学生、老师、课程、作业、考试
- 内置搜索功能
- 支持单选/多选模式
- 支持分页
- 可自定义列配置
- 显示已选择数量

**使用示例**:
```vue
<template>
  <EntitySelectorDialog
    v-model="selectorVisible"
    entity-type="student"
    :multiple="true"
    :selected-ids="selectedStudentIds"
    :data-source="students"
    @confirm="handleStudentsSelected"
  />
</template>

<script setup>
import EntitySelectorDialog from '@/components/EntitySelector/EntitySelectorDialog.vue'

const selectorVisible = ref(false)
const selectedStudentIds = ref([])
const students = ref([...]) // 学生数据源

const handleStudentsSelected = ({ ids, items }) => {
  console.log('选中的ID:', ids)
  console.log('选中的完整数据:', items)
}
</script>
```

**支持的实体类型**:

| 实体类型 | entityType | 默认列 |
|---------|-----------|--------|
| 学生 | student | 学号、姓名、手机号、邮箱 |
| 老师 | teacher | 工号、姓名、手机号、授课科目 |
| 课程 | course | 课程名称、分类、课次数 |
| 作业 | assignment | 作业名称、所属课程、截止时间 |
| 考试 | exam | 考试名称、类型、考试时间 |

---

### 3. ✅ 班级-课程-课次开放功能

**文件**: `src/views/class/management/components/CourseAccessDialog.vue`

**功能说明**:
- 班主任可以控制每个班级中每门课程的课次开放状态
- 同一课程授权到不同班级，每个班级的开放进度可以不同
- 支持一键全开/全关
- 支持开放到指定课次
- 显示开放进度统计

**数据结构**:
```typescript
// src/types/class.ts

export interface ClassCourseAccess {
  classId: string
  courseId: string
  courseTitle: string
  lessons: ClassCourseLessonAccess[]
}

export interface ClassCourseLessonAccess {
  lessonId: string
  title: string
  chapterTitle?: string      // 所属章节
  index: number              // 第几课
  isOpen: boolean            // 是否开放
}
```

**使用流程**:
1. 进入"班级管理"页面
2. 点击某个班级的"管理课程"按钮
3. 在课程列表中点击"设置开放进度"
4. 勾选要开放的课次
5. 保存设置

**学生端效果**:
- 学生只能看到 `isOpen === true` 的课次
- 未开放的课次在课程大纲中不显示或显示为"未开放"状态

---

### 4. ✅ 课程管理对话框

**文件**: `src/views/class/management/components/CourseManagementDialog.vue`

**功能特性**:
- 添加课程（使用实体选择器）
- 批量移除课程
- 查看每门课程的开放进度
- 快速进入课次开放设置

**表格列**:
- 课程名称
- 分类
- 课次数
- 开放进度（进度条 + 数字）
- 授权时间
- 操作（设置开放进度、移除）

---

### 5. ✅ 老师管理优化

**班级中的老师角色**:
- **班主任** (`head_teacher`): 负责班级管理
- **任课老师** (`subject_teacher`): 负责具体科目教学

**管理方式**:
- 在"班级管理 → 管理老师"中添加/移除老师
- 指定老师的角色（班主任/任课老师）
- 指定任课老师的授课科目

**与老师授权的关系**:
- 班级授权：决定"这个班有哪些老师"
- 资源授权：决定"老师可以访问哪些课程/作业/考试"
- 两者独立管理，互不冲突

---

## 后端接口建议

### 班级码相关

```typescript
// 创建班级（自动生成班级码）
POST /admin/classes
Body: {
  name: string
  description?: string
  grade: string
}
Response: {
  id: string
  code: string  // 系统生成的班级码
  ...
}
```

### 课程管理相关

```typescript
// 获取班级课程列表
GET /admin/classes/:classId/courses
Response: {
  courses: [
    {
      id: string
      name: string
      category: string
      lessonCount: number
      openedLessons: number
      authorizedAt: string
    }
  ]
}

// 添加课程到班级
POST /admin/classes/:classId/courses
Body: {
  courseIds: string[]
}
Response: { success: boolean }

// 移除班级课程
DELETE /admin/classes/:classId/courses/:courseId
Response: { success: boolean }
```

### 课次开放相关

```typescript
// 获取班级-课程的课次开放状态
GET /admin/classes/:classId/courses/:courseId/access
Response: {
  classId: string
  courseId: string
  courseTitle: string
  lessons: [
    {
      lessonId: string
      title: string
      chapterTitle: string
      index: number
      isOpen: boolean
    }
  ]
}

// 更新课次开放状态
PUT /admin/classes/:classId/courses/:courseId/access
Body: {
  lessons: [
    {
      lessonId: string
      isOpen: boolean
    }
  ]
}
Response: { success: boolean }
```

### 老师管理相关

```typescript
// 获取班级老师列表
GET /admin/classes/:classId/teachers
Response: {
  headTeachers: Teacher[]
  teachers: Teacher[]
}

// 添加老师到班级
POST /admin/classes/:classId/teachers
Body: {
  teacherId: string
  role: 'head_teacher' | 'subject_teacher'
  subjects?: string[]  // 任课老师的授课科目
}
Response: { success: boolean }

// 移除班级老师
DELETE /admin/classes/:classId/teachers/:teacherId
Response: { success: boolean }
```

---

## 数据库设计建议

### 班级表 (classes)

```sql
CREATE TABLE classes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,  -- 班级码，唯一索引
  description TEXT,
  grade VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_grade (grade),
  INDEX idx_status (status)
);
```

### 班级-课程关联表 (class_courses)

```sql
CREATE TABLE class_courses (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  authorized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_class_course (class_id, course_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### 班级-课程-课次开放表 (class_course_lesson_access)

```sql
CREATE TABLE class_course_lesson_access (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  is_open BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_class_course_lesson (class_id, course_id, lesson_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  INDEX idx_class_course (class_id, course_id)
);
```

### 班级-老师关联表 (class_teachers)

```sql
CREATE TABLE class_teachers (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50) NOT NULL,
  teacher_id VARCHAR(50) NOT NULL,
  role ENUM('head_teacher', 'subject_teacher') NOT NULL,
  subjects JSON,  -- 任课老师的授课科目
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_class_teacher (class_id, teacher_id),
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_role (role)
);
```

---

## 使用场景示例

### 场景1：创建新班级并授权课程

1. 管理员创建班级"高一三班"
2. 系统自动生成班级码 "H3K7M2"
3. 添加班主任"王老师"
4. 添加任课老师"李老师"（数学）、"张老师"（英语）
5. 授权课程"高中数学"、"高中英语"
6. 设置"高中数学"开放到第5课
7. 设置"高中英语"开放到第3课

### 场景2：学生加入班级

1. 学生使用班级码"H3K7M2"加入班级
2. 学生可以看到"高中数学"的前5课
3. 学生可以看到"高中英语"的前3课
4. 其他课次显示为"未开放"

### 场景3：班主任调整教学进度

1. 班主任进入"班级管理"
2. 点击"管理课程"
3. 选择"高中数学"，点击"设置开放进度"
4. 勾选第6课、第7课
5. 保存后，学生立即可以看到新开放的课次

---

## 注意事项

1. **班级码唯一性**
   - 必须在数据库层面保证唯一性
   - 生成时需要检查重复
   - 建议使用6-8位字母数字组合

2. **课次开放状态**
   - 默认所有课次都是关闭的
   - 需要班主任手动开放
   - 开放状态实时生效

3. **权限控制**
   - 只有班主任和管理员可以设置课次开放
   - 任课老师只能查看，不能修改
   - 学生只能看到开放的课次

4. **性能优化**
   - 课次开放状态建议缓存
   - 学生端查询时使用索引
   - 批量操作时使用事务

5. **数据一致性**
   - 删除课程时同步删除课次开放记录
   - 删除班级时同步删除所有关联数据
   - 使用外键约束保证数据完整性
