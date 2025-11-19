# 题库管理模块改造说明

## 改造概述

将题库管理中的"添加题目"功能改造为独立的抽屉组件（Drawer），在主页面中集成完整的标签管理系统，支持三层分类结构和标签筛选。

## 改造内容

### 1. 新增组件

#### 1.1 题目管理抽屉 (QuestionManagementDrawer.vue)

**文件**: `src/views/assignments/components/QuestionManagementDrawer.vue`

一个全屏抽屉组件，用于在题库中添加题目。

**主要特性：**

- **左侧工具栏**
  - 新建题目按钮
  - 导入题目按钮
  - 题型筛选（单选、多选、填空、判断、简答、OJ）
  - 难度筛选（简单、中等、困难）
  - 标签筛选
  - 搜索框

- **右侧内容区**
  - 题目表格展示
  - 支持多选题目
  - 每道题目显示：题目、题型、难度、分值、标签
  - 操作按钮：查看、编辑、删除
  - 分页功能

- **底部操作栏**
  - 显示已选择题目数量
  - 取消按钮
  - 确定添加按钮（选择题目后启用）

#### 1.2 标签管理抽屉 (TagManagerDrawer.vue)

**文件**: `src/views/assignments/components/TagManagerDrawer.vue`

一个完整的标签管理系统，支持三层分类结构。

**主要特性：**

- **左侧分类树**
  - 三层分类结构（学科 → 单元/专题 → 知识点）
  - 支持分类新增、编辑、删除
  - 点击分类快速切换

- **右侧内容区**
  - 工具栏：新建标签、搜索、排序
  - 统计信息：总标签数、已使用、未使用
  - 标签表格：显示标签名称、描述、分类、使用次数、是否系统标签
  - 操作按钮：编辑、删除（系统标签不可删除）
  - 分页功能

- **标签编辑对话框**
  - 标签名称
  - 所属分类（三层选择）
  - 描述
  - 颜色选择

- **分类编辑对话框**
  - 分类名称
  - 分类级别（一级、二级、三级）

### 2. 改造题库管理主页面

**文件**: `src/views/assignments/index.vue`

#### 新增功能：

1. **标签管理按钮**
   - 在头部添加"标签管理"按钮
   - 点击打开标签管理抽屉

2. **标签筛选功能**
   - 在题型筛选下方添加标签筛选区域
   - 支持多选标签
   - 实时过滤题目列表

3. **标签数据管理**
   - 维护全局标签列表
   - 支持标签的增删改查



## 数据模型

### 标签分类 (QuestionTagCategory)

```javascript
{
  id: 'cat_1',
  name: '学科',
  level: 1,              // 1/2/3 表示三层结构
  parentId: null,        // 父分类ID
  sort: 0,
  children: []           // 子分类
}
```

### 标签 (QuestionTag)

```javascript
{
  id: 'tag_1',
  name: '面向对象',
  categoryId: 'cat_2_1', // 对应三级分类中最小粒度
  color: '#409EFF',
  description: '面向对象编程相关',
  isSystem: true,        // 系统内置的不可删除
  usageCount: 15,        // 使用次数
  createdAt: '2024-01-01'
}
```

## 使用流程

### 添加题目到题库

1. 在题库主页点击"添加题目"按钮
2. 抽屉打开，显示题目库
3. 在左侧使用筛选条件（题型、难度）或搜索框查找题目
4. 在右侧表格中勾选要添加的题目
5. 点击底部"确定添加"按钮
6. 系统提示添加成功，显示添加的题目数量

### 使用标签筛选题目

1. 在题库主页的标签筛选区域选择一个或多个标签
2. 题目列表自动过滤，只显示包含选中标签的题目
3. 可以结合题型筛选进行多维度过滤

### 管理标签

1. 在题库主页点击"标签管理"按钮
2. 标签管理抽屉打开
3. 左侧分类树显示三层分类结构
4. 点击分类查看该分类下的标签
5. 支持以下操作：
   - **新建标签**：选择分类、输入标签名称、选择颜色
   - **编辑标签**：修改标签信息
   - **删除标签**：删除未使用的标签，或提示已使用的标签
   - **管理分类**：新增、编辑、删除分类

## 设计对比

### 旧方案
- 简单的对话框
- 功能有限
- 标签管理不完整
- 标签和题目管理混在一起

### 新方案
- 题目管理：全屏抽屉，提供更多操作空间
- 标签管理：独立的标签管理抽屉
- 标签筛选：在主页面集成标签筛选功能
- 完整的标签管理系统
- 支持三层分类结构
- 统计信息展示
- 系统标签保护
- 职责分离，逻辑清晰

## 优势

1. **完整性**：提供完整的标签管理功能
2. **规范性**：避免标签重复和不规范命名
3. **可用性**：全屏显示，提供更多操作空间
4. **可扩展性**：易于添加新功能（如标签合并、导出等）
5. **一致性**：与班级管理、作业管理的设计保持一致

## 后续扩展

### 可以添加的功能

1. **标签合并**
   - 合并重复的标签
   - 自动更新题目关联

2. **标签导出**
   - 导出标签列表为 Excel/CSV
   - 导出标签使用统计

3. **标签导入**
   - 从 Excel/CSV 导入标签
   - 批量创建标签

4. **标签规范化**
   - 检测相似标签
   - 建议合并

5. **题目标签选择器**
   - 在题目编辑时使用标签库
   - 支持系统标签和自定义标签分离

## 文件清单

### 新增文件
- `src/views/assignments/components/QuestionManagementDrawer.vue` - 题目管理抽屉
- `src/views/assignments/components/TagManagerDrawer.vue` - 标签管理抽屉

### 修改文件
- `src/views/assignments/index.vue` - 题库管理主页面

### 可保留文件
- `src/views/assignments/components/TagManageDialog.vue` - 旧的标签管理对话框（可选保留或删除）

## 测试清单

- [ ] 打开题库管理页面的"添加题目"按钮
- [ ] 抽屉正确打开和关闭
- [ ] 左侧筛选功能正常工作
- [ ] 搜索功能正常工作
- [ ] 表格多选功能正常工作
- [ ] 分页功能正常工作
- [ ] 点击"确定添加"后题目数量更新
- [ ] 显示正确的成功提示信息
- [ ] 标签管理抽屉打开正常
- [ ] 分类树显示正确
- [ ] 标签新增、编辑、删除功能正常
- [ ] 分类新增、编辑、删除功能正常
- [ ] 统计信息显示正确

## API 接口规划

### 标签相关接口

```javascript
// 获取标签分类树
GET /question/admin/tag/category/tree

// 分页获取标签
POST /question/admin/tag/page
// 参数: { categoryId, searchText, sortType, pageCurrent, pageSize }

// 保存标签
POST /question/admin/tag/save
// 参数: { name, categoryId, color, description, isSystem }

// 编辑标签
PUT /question/admin/tag/edit
// 参数: { id, name, categoryId, color, description }

// 删除标签
DELETE /question/admin/tag/delete?id=xx

// 合并标签（可选）
POST /question/admin/tag/merge
// 参数: { sourceTagId, targetTagId }

// 分类相关接口
POST /question/admin/tag/category/save
PUT /question/admin/tag/category/edit
DELETE /question/admin/tag/category/delete?id=xx
```

## 相关文档

- [班级管理模块](src/views/class/management/index.vue) - 参考实现
- [作业管理模块](src/views/homework/index.vue) - 参考实现
- [题库管理主页面](src/views/assignments/index.vue) - 主页面
