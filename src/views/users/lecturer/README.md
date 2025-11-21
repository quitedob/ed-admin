# 老师管理模块 - 重构说明

## 已完成的修改

### 1. ✅ 字段调整

#### 移除的字段
- ❌ **学历** (`education`) - 不再作为必填字段
- ❌ **职称** (`title`) - 不再作为必填字段
- ❌ **部门** (`department`) - 改为角色系统

#### 新增/修改的字段
- ✅ **角色** (`roleIds: string[]`) - 替代原来的"部门"概念
  - 支持多角色分配
  - 角色决定系统权限
  - 可在"角色管理"模块中配置

- ✅ **授课科目** (`subjects: string[]`) - 替代原来的"专业领域"
  - 支持多科目选择
  - 支持自定义科目名称
  - 更贴近实际教学场景

- ✅ **个人简介** (`profileHtml: string`) - 富文本字段
  - 合并了原来的"个人简介"、"教学经验"、"获得荣誉"
  - 支持富文本编辑（加粗、列表、链接等）
  - 更灵活的内容展示

- ✅ **教学年限** (`teachingYears: number`) - 移到个人信息部分
  - 不再放在统计信息中
  - 作为老师的基本属性

- ✅ **系统统计信息** (`stats: TeacherStats`)
  ```typescript
  {
    classCount: number         // 负责班级数
    studentCount: number       // 学生总数
    courseCount: number        // 授权课程数
    assignmentCount: number    // 授权作业数
    examCount: number          // 授权考试数
  }
  ```

---

### 2. ✅ 编辑页面优化

**文件**: `src/views/users/lecturer/components/TeacherForm.vue`

#### 表单结构
```
基本信息
├── 工号（不可编辑）
├── 姓名
├── 手机号
├── 邮箱
├── 性别
├── 出生日期
├── 入职日期
├── 教学年限
└── 地址

角色与权限
└── 角色（多选）

教学信息
├── 授课科目（多选，可自定义）
└── 个人简介（富文本编辑器）

账号状态
└── 活跃/停用

授权信息（只读）
├── 负责班级
└── 授权资源（课程/作业/考试）
```

#### 关键改进
1. **移除"负责班级"编辑功能**
   - 班级授权在专门的"授权管理"或"班级管理"中处理
   - 编辑页面只显示当前授权信息（只读）

2. **富文本编辑器**
   - 使用 `@vueup/vue-quill` 组件
   - 支持常用格式化功能
   - 更好的内容展示效果

3. **角色选择**
   - 支持多角色分配
   - 显示角色描述
   - 提示角色管理入口

4. **科目选择**
   - 预设常用科目
   - 支持输入自定义科目
   - 可多选

---

### 3. ✅ 列表页面优化

**文件**: `src/views/users/lecturer/list/index.vue`

#### 表格列调整
| 原字段 | 新字段 | 说明 |
|--------|--------|------|
| 学历 | ❌ 移除 | 不再显示 |
| 职称 | ❌ 移除 | 不再显示 |
| 部门 | 授课科目 | 显示前2个科目+数量 |
| - | 教学年限 | 新增显示 |

#### 筛选条件调整
| 原筛选 | 新筛选 | 说明 |
|--------|--------|------|
| 学历 | ❌ 移除 | - |
| 部门 | 角色 | 按角色筛选 |
| - | 授课科目 | 按科目筛选 |

---

### 4. ✅ 授权管理逻辑

#### 班级授权
- **方式1**: 在"授权管理"模块中统一配置
- **方式2**: 在"班级管理"页面中管理老师
- **原则**: 不在老师编辑页面直接操作班级关系

#### 资源授权
- 课程授权
- 作业授权
- 考试授权
- 通过专门的"授权资源"对话框管理

---

## 数据结构

### Teacher 类型定义

```typescript
// 文件: src/types/teacher.ts

export interface Teacher {
  id: string
  teacherId: string          // 工号
  name: string
  mobile?: string            // 手机号
  email?: string
  gender?: 'male' | 'female'
  birthDate?: string
  joinDate?: string          // 入职日期
  status: 'active' | 'inactive'
  
  // 角色/权限（替代原来的部门）
  roleIds: string[]
  
  // 授课科目（替代原来的"专业领域"）
  subjects: string[]         // eg. ['数学', '前端', '算法']
  
  // 个人简介（富文本，合并原来的简介/教学经验/荣誉）
  profileHtml?: string
  
  // 教学年限 → 个人信息部分
  teachingYears?: number
  
  // 系统统计信息
  stats: TeacherStats
  
  // 其他基本信息
  address?: string
  avatar?: string
  
  // 时间戳
  createdAt?: string
  updatedAt?: string
}

export interface TeacherStats {
  classCount: number         // 负责班级数
  studentCount: number       // 学生总数
  courseCount: number        // 授权课程数
  assignmentCount: number    // 授权作业数
  examCount: number          // 授权考试数
}
```

---

## 角色系统

### 预设角色

| 角色ID | 角色名称 | 描述 | 权限范围 |
|--------|----------|------|----------|
| role_001 | 管理员 | 系统管理员，拥有所有权限 | 全部 |
| role_002 | 教研组长 | 教研组管理权限 | 教研组相关 |
| role_003 | 班主任 | 班级管理权限 | 班级相关 |
| role_004 | 任课教师 | 基础教学权限 | 教学相关 |
| role_005 | 助教 | 辅助教学权限 | 辅助功能 |

### 角色管理
- 建议创建独立的"角色管理"模块
- 支持自定义角色和权限配置
- 类似标签管理的界面

---

## 科目系统

### 预设科目

**理科类**
- 数学
- 物理
- 化学
- 生物

**文科类**
- 语文
- 历史
- 地理
- 政治

**语言类**
- 英语

**技术类**
- 编程
- 前端开发
- 算法

**艺术类**
- 音乐
- 美术

**其他**
- 体育

### 科目特性
- 支持自定义科目
- 可分类管理
- 可配置图标和颜色

---

## 后端接口建议

### 老师管理接口

```typescript
// 获取老师列表
GET /admin/teachers
Query: {
  page: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive'
  roleIds?: string[]
  subjects?: string[]
}
Response: {
  list: Teacher[]
  total: number
}

// 获取老师详情
GET /admin/teachers/:id
Response: Teacher

// 创建老师
POST /admin/teachers
Body: TeacherFormData
Response: Teacher

// 更新老师
PUT /admin/teachers/:id
Body: TeacherFormData
Response: Teacher

// 删除老师
DELETE /admin/teachers/:id
Response: { success: boolean }
```

### 授权管理接口

```typescript
// 获取老师授权信息
GET /admin/teachers/:id/authorizations
Response: TeacherAuthorization

// 更新班级授权
PUT /admin/teachers/:id/authorizations/classes
Body: { classIds: string[] }
Response: { success: boolean }

// 更新资源授权
PUT /admin/teachers/:id/authorizations/resources
Body: {
  courses?: string[]
  assignments?: string[]
  exams?: string[]
}
Response: { success: boolean }
```

---

## 依赖安装

### 富文本编辑器

```bash
npm install @vueup/vue-quill
```

或

```bash
yarn add @vueup/vue-quill
```

---

## 后续建议

1. **角色管理模块**
   - 创建独立的角色管理页面
   - 支持权限配置
   - 支持角色分组

2. **科目管理模块**
   - 创建科目管理页面
   - 支持科目分类
   - 支持图标和颜色配置

3. **统计信息优化**
   - 在老师详情页展示更详细的统计数据
   - 添加图表展示
   - 支持时间范围筛选

4. **授权管理优化**
   - 统一授权管理入口
   - 支持批量授权
   - 授权历史记录

5. **权限控制**
   - 根据角色控制功能访问
   - 数据权限隔离
   - 操作日志记录
