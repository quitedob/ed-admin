# 角色管理系统 (Role Management System)

## 概述

这是一个完整的角色权限管理系统，为教育管理后台提供了基于角色的访问控制（RBAC）功能。系统支持细粒度的权限管理，覆盖了所有业务模块。

## 功能特性

### 1. 角色管理
- ✅ 角色列表展示与分页
- ✅ 角色搜索（按角色名称、标识、描述）
- ✅ 角色新增/编辑/删除
- ✅ 角色状态启用/禁用
- ✅ 角色排序
- ✅ 权限数量统计

### 2. 权限管理
- ✅ 16个功能模块，200+权限项
- ✅ 权限分类展示（仪表盘、班级、课程、教师、学生、作业、考试等）
- ✅ 权限搜索与筛选
- ✅ 批量权限选择（全选/清空）
- ✅ 分组权限管理（模块级全选/部分选择）
- ✅ 权限代码标准化

### 3. 系统集成
- ✅ 路由系统集成
- ✅ 菜单系统集成
- ✅ API接口集成
- ✅ 权限指令支持
- ✅ 用户状态管理

## 文件结构

```
src/views/system/role/
├── index.vue                 # 角色管理主页面
├── components/
│   └── RoleDrawer.vue       # 角色编辑抽屉组件
├── README.md                # 说明文档
└── ...

src/utils/
└── permissionList.js        # 权限定义与工具函数

src/api/system.js            # 系统API（包含角色管理接口）
```

## 权限模块

系统包含以下16个权限模块：

### 1. 仪表盘 (Dashboard)
- `dashboard:view` - 访问仪表盘
- `stat:data` - 数据统计
- `stat:login` - 登录统计
- `stat:vod` - 视频统计

### 2. 班级管理 (Class)
- `class:view` - 查看班级
- `class:create` - 创建班级
- `class:import` - 批量导入
- `class:edit` - 编辑班级
- `class:delete` - 删除班级
- `class:manage-*` - 班级资源管理

### 3. 课程管理 (Course)
- `course:view` - 查看课程
- `course:create` - 创建课程
- `course:edit` - 编辑课程
- `course:delete` - 删除课程
- `course-chapter:*` - 章节管理
- `course-section:*` - 小节管理

### 4. 教师管理 (Teacher/Lecturer)
- `lecturer:view` - 查看教师
- `lecturer:create` - 创建教师
- `lecturer:edit` - 编辑教师
- `lecturer:delete` - 删除教师
- `lecturer:authorize-*` - 授权管理

### 5. 学生管理 (Student)
- `student:view` - 查看学生
- `student:view-detail` - 查看学生详情
- `student:manage-*` - 学生管理
- `student:personal-access` - 个人端访问

### 6. 作业管理 (Homework)
- `homework:view` - 查看作业
- `homework:create` - 创建作业
- `homework:edit` - 编辑作业
- `homework:delete` - 删除作业
- `homework:grade` - 批改作业
- `homework:manage-*` - 作业管理

### 7. 考试管理 (Exam)
- `exam:view` - 查看考试
- `exam:create` - 创建考试
- `exam:edit` - 编辑考试
- `exam:delete` - 删除考试
- `exam:monitor` - 考试监控
- `exam:grade` - 批改试卷

### 8. 题库管理 (Question)
- `question:view` - 查看题库
- `question:create` - 添加题目
- `question:edit` - 编辑题目
- `question:delete` - 删除题目
- `question:import/export` - 导入导出
- `question:manage-*` - 题目管理

### 9. 素材管理 (Material)
- `material:view` - 查看素材
- `material:upload` - 上传素材
- `material:edit` - 编辑素材
- `material:delete` - 删除素材
- `material:batch-*` - 批量操作

### 10. AIGC作品管理 (AIGC)
- `aigc:view` - 查看作品墙
- `aigc:filter-*` - 筛选功能
- `aigc:preview` - 预览作品
- `aigc:edit` - 编辑作品
- `aigc:delete` - 删除作品

### 11. AI助手 (AI Assistant)
- `ai:view` - 访问AI助手
- `ai:upload-generate` - 上传并生成
- `ai:error-based` - 基于错题生成
- `ai:custom-generate` - 自定义生成

### 12. 在线判题系统 (OJ)
- `oj:view` - 访问OJ系统
- `oj:submit` - 提交代码
- `oj:view-submission` - 查看提交记录
- `oj:manage-problem` - 管理题目

### 13-16. 其他系统模块
- **系统管理 (System)**: 系统配置、用户管理、角色管理等
- **用户认证 (Auth)**: 登录、登出、个人资料等

## 使用说明

### 1. 访问角色管理
- 菜单路径：系统管理 → 角色管理
- 路由：`/system/role`

### 2. 角色操作流程

#### 新增角色
1. 点击"新增角色"按钮
2. 填写角色基本信息（名称、标识、描述、排序）
3. 在权限配置区域选择所需权限
4. 支持按模块筛选、搜索权限
5. 支持批量全选/清空操作
6. 点击"保存"完成创建

#### 编辑角色
1. 点击表格中的"编辑"按钮
2. 修改角色信息
3. 调整权限配置
4. 点击"保存"完成更新

#### 权限配置
- **分组选择**: 按功能模块分组展示权限
- **搜索功能**: 支持按权限名称或代码搜索
- **筛选功能**: 按模块分类筛选
- **批量操作**: 全选/清空所有权限
- **智能状态**: 自动计算选中状态（全选/部分选/未选）

### 3. 角色状态管理
- **启用**: 角色处于正常使用状态
- **禁用**: 角色被禁用，无法使用
- **保护**: 超级管理员角色不允许删除或禁用

## 技术实现

### 1. 前端技术栈
- **Vue 3**: Composition API
- **Element Plus**: UI组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理

### 2. 核心组件

#### RoleDrawer.vue
角色编辑抽屉组件，包含：
- 基本信息表单
- 权限选择器
- 搜索筛选功能
- 批量操作功能

#### permissionList.js
权限定义文件，包含：
- 完整权限模块定义
- 权限工具函数
- 权限查询功能

### 3. 状态管理
```javascript
// 用户store集成
const userStore = useUserStore()
userStore.mockLogin() // 加载模拟数据，包含角色管理菜单
```

### 4. API集成
```javascript
// 系统API已包含角色管理接口
systemApi.sysRolePage()     // 角色分页查询
systemApi.sysRoleSave()     // 保存角色
systemApi.sysRoleEdit()     // 编辑角色
systemApi.sysRoleDelete()   // 删除角色
```

## 权限指令使用

在组件中使用权限指令：
```vue
<el-button v-permission="'system:role:add'">新增角色</el-button>
<el-button v-permission="'system:role:edit'">编辑角色</el-button>
<el-button v-permission="'system:role:delete'">删除角色</el-button>
```

## 数据结构

### 角色对象
```javascript
{
  id: 1,                          // 角色ID
  roleName: '超级管理员',           // 角色名称
  roleCode: 'admin',              // 角色标识
  description: '拥有所有权限',      // 角色描述
  sort: 1,                        // 排序号
  status: 1,                      // 状态(1:启用 0:禁用)
  permissions: [                  // 权限列表
    'dashboard:view',
    'system:manage-roles',
    // ...更多权限
  ],
  createTime: '2024-01-01 10:00:00' // 创建时间
}
```

### 权限模块
```javascript
{
  label: '仪表盘 (Dashboard)',     // 模块名称
  code: 'dashboard',              // 模块代码
  permissions: [                  // 权限列表
    {
      label: '访问仪表盘',        // 权限名称
      value: 'dashboard:view'     // 权限代码
    }
    // ...更多权限
  ]
}
```

## 扩展指南

### 1. 添加新权限模块
在 `permissionList.js` 中添加新的模块定义：
```javascript
{
  label: '新模块 (New Module)',
  code: 'new-module',
  permissions: [
    { label: '查看权限', value: 'new-module:view' },
    { label: '编辑权限', value: 'new-module:edit' },
    // ...更多权限
  ]
}
```

### 2. 自定义权限验证
```javascript
// 权限检查函数
import { useUserStore } from '@/store/modules/user'

const hasPermission = (permission) => {
  const userStore = useUserStore()
  return userStore.getPermissionList.includes(permission)
}
```

### 3. 扩展角色功能
- 支持角色继承
- 支持权限时效性
- 支持权限审批流程
- 支持权限操作日志

## 注意事项

1. **数据安全**: 确保权限配置的准确性和安全性
2. **性能优化**: 大量权限选择时注意虚拟滚动
3. **用户体验**: 提供清晰的权限说明和操作指引
4. **兼容性**: 确保与现有系统的兼容性
5. **扩展性**: 预留扩展接口，支持未来功能增强

## 更新日志

### v1.0.0 (2024-01-XX)
- ✅ 完成角色管理系统基础功能
- ✅ 集成16个权限模块
- ✅ 实现权限选择器组件
- ✅ 完成菜单和路由集成
- ✅ 添加API接口支持

---

*此文档最后更新时间：2024-01-XX*