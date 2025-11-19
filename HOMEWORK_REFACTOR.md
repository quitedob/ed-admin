# 作业管理模块改造说明

## 改造概述

将作业管理中的"添加题目"功能从弹窗对话框改造为独立的抽屉组件（Drawer），参考班级管理中"管理学生"的实现方式。

## 改造内容

### 1. 新增组件

**文件**: `src/views/homework/components/QuestionManagementDrawer.vue`

一个全屏抽屉组件，用于管理作业中的题目。

#### 主要特性：

- **左侧工具栏**
  - 新建题目按钮
  - 导入题目按钮
  - 题型筛选（单选、多选、填空、判断、简答）
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

### 2. 改造作业管理页面

**文件**: `src/views/homework/index.vue`

#### 变更内容：

1. **导入新组件**
   ```javascript
   import QuestionManagementDrawer from './components/QuestionManagementDrawer.vue'
   ```

2. **添加状态变量**
   ```javascript
   const questionDrawerVisible = ref(false)
   ```

3. **添加操作按钮**
   - 在作业卡片的操作按钮中添加"添加题目"按钮
   - 位置：在"答题情况"按钮之前

4. **添加事件处理方法**
   ```javascript
   // 打开题目管理抽屉
   const handleAddQuestions = (homework) => {
     currentHomework.value = homework
     questionDrawerVisible.value = true
   }

   // 处理题目添加
   const handleAddQuestionsToHomework = (questions) => {
     if (currentHomework.value) {
       const totalScore = questions.reduce((sum, q) => sum + q.score, 0)
       currentHomework.value.questionCount = (currentHomework.value.questionCount || 0) + questions.length
       ElMessage.success(`已添加 ${questions.length} 道题目，总分值 ${totalScore} 分`)
     }
     questionDrawerVisible.value = false
   }
   ```

5. **添加抽屉组件**
   ```vue
   <QuestionManagementDrawer
     v-model="questionDrawerVisible"
     :homework-id="currentHomework?.id"
     @save="handleAddQuestionsToHomework"
   />
   ```

## 使用流程

### 添加题目到作业

1. 在作业卡片上点击"添加题目"按钮
2. 抽屉打开，显示题目库
3. 在左侧使用筛选条件（题型、难度、标签）或搜索框查找题目
4. 在右侧表格中勾选要添加的题目
5. 点击底部"确定添加"按钮
6. 系统提示添加成功，显示添加的题目数量和总分值

## 设计对比

### 旧方案（对话框）
- 使用 `el-dialog` 组件
- 宽度固定为 90%
- 不支持左侧工具栏
- 功能相对简单

### 新方案（抽屉）
- 使用 `el-drawer` 组件
- 全屏显示（size="90%"）
- 左侧工具栏 + 右侧内容区布局
- 功能更完整，用户体验更好
- 与班级管理的"管理学生"保持一致

## 优势

1. **一致性**：与班级管理模块的设计保持一致
2. **可用性**：全屏显示，提供更多操作空间
3. **功能性**：支持更多筛选和搜索选项
4. **可扩展性**：易于添加新功能（如新建题目、导入题目等）

## 后续扩展

### 可以添加的功能

1. **新建题目**
   - 在抽屉中直接创建新题目
   - 支持多种题型

2. **导入题目**
   - 从 Excel/CSV 导入题目
   - 批量操作

3. **题目预览**
   - 点击"查看"按钮预览题目详情
   - 支持富文本内容

4. **题目编辑**
   - 在抽屉中编辑题目
   - 修改题目内容、分值等

5. **批量操作**
   - 批量删除题目
   - 批量修改难度、标签等

## 文件清单

### 新增文件
- `src/views/homework/components/QuestionManagementDrawer.vue` - 题目管理抽屉组件

### 修改文件
- `src/views/homework/index.vue` - 作业管理主页面

### 可删除文件（可选）
- `src/views/homework/components/QuestionSelectorDialog.vue` - 旧的题目选择对话框（如果不再使用）

## 测试清单

- [ ] 打开作业卡片的"添加题目"按钮
- [ ] 抽屉正确打开和关闭
- [ ] 左侧筛选功能正常工作
- [ ] 搜索功能正常工作
- [ ] 表格多选功能正常工作
- [ ] 分页功能正常工作
- [ ] 点击"确定添加"后题目数量更新
- [ ] 显示正确的成功提示信息
- [ ] 取消按钮正确关闭抽屉

## 相关文档

- [班级管理模块](src/views/class/management/index.vue) - 参考实现
- [学生管理抽屉](src/views/class/management/components/StudentManagementDrawer.vue) - 参考组件
