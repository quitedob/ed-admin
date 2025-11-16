<!-- 文件路径: views/users/lecturer/index.vue -->
<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.lecturerName" placeholder="请输入讲师名称" prefix-icon="Search" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()"> 查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'lecturer:save'" type="primary" @click="openFormModal()">添加讲师</el-button>
      </div>
    </div>
    <el-table v-loading="page.loading" :data="page.list" row-key="id" class="drag-table">
      <el-table-column label="讲师信息">
        <template #default="scope">
          <img :alt="scope.row.lecturerName" :src="scope.row.lecturerHead" style="height: 40px; width: auto; border-radius: 50%; vertical-align: middle" />
          &nbsp;{{ scope.row.lecturerName }}
        </template>
      </el-table-column>
      <el-table-column label="职位" prop="lecturerPosition" />
      <el-table-column label="状态">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column :width="210" fixed="right" label="操作" prop="address">
        <template #default="scope">
          <div class="table-actions">
            <el-button v-permission="'lecturer:edit'" text type="primary" @click="openFormModal(scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-dropdown>
              <el-button text type="primary">
                更多操作
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleStatus(scope.row)">
                    <el-button v-if="scope.row.statusId === 0" v-permission="'lecturer:edit'" text type="primary">启用</el-button>
                    <el-button v-if="scope.row.statusId === 1" v-permission="'lecturer:edit'" text type="primary">禁用</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button v-permission="'lecturer:delete'" text type="primary" @click="handleDelete(scope.row)">删除</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <lecturer-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import useTable from '@/utils/table'
  import { ref, onMounted } from 'vue'
  import { usersApi } from '@/api/users'
  import LecturerForm from './LecturerForm.vue'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'
  import { ArrowDown } from '@element-plus/icons-vue'

  // 添加/修改表单
  const formRef = ref()
  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  // 基础功能：分页、查询、重置、删除、状态切换
  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: usersApi.lecturerPage,
    delete: usersApi.lecturerDelete,
    status: usersApi.lecturerEdit,
    sort: usersApi.lecturerSort
  })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/users/lecturer/index.vue`);
  });

</script>

<style lang="scss" scoped>
/* ==================== 容器样式 ==================== */
.app-container {
  /* 主容器背景渐变色 */
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
  padding: 20px;
  min-height: calc(100vh - 120px);
  border-radius: 8px;
}

/* ==================== 顶部区域样式 ==================== */
.page_head {
  /* 顶部区域背景白色卡片效果 */
  background: #ffffff;
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.page_head:hover {
  /* 悬停时增强阴影效果 */
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

/* ==================== 搜索栏样式 ==================== */
.search_bar {
  margin-bottom: 16px;
}

.search_bar :deep(.el-form-item) {
  /* 表单项间距优化 */
  margin-bottom: 0;
  margin-right: 16px;
}

.search_bar :deep(.el-input) {
  /* 输入框宽度优化 */
  width: 240px;
  transition: all 0.3s ease;
}

.search_bar :deep(.el-input:hover) {
  /* 输入框悬停效果 */
  transform: translateY(-1px);
}

.search_bar :deep(.el-input__wrapper) {
  /* 输入框圆角和阴影 */
  border-radius: 8px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.search_bar :deep(.el-input__wrapper:hover) {
  /* 输入框悬停时阴影增强 */
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

/* ==================== 按钮区域样式 ==================== */
.button_bar {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.button_bar :deep(.el-button) {
  /* 按钮圆角优化 */
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.button_bar :deep(.el-button--primary) {
  /* 主按钮渐变背景 */
  background: linear-gradient(135deg, #409eff 0%, #5ba4ff 100%);
  border: none;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.3);
}

.button_bar :deep(.el-button--primary:hover) {
  /* 主按钮悬停效果 */
  background: linear-gradient(135deg, #5ba4ff 0%, #409eff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(64, 158, 255, 0.4);
}

.search_bar :deep(.el-button) {
  /* 搜索栏按钮样式 */
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search_bar :deep(.el-button--primary) {
  /* 搜索按钮渐变背景 */
  background: linear-gradient(135deg, #409eff 0%, #5ba4ff 100%);
  border: none;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.3);
}

.search_bar :deep(.el-button--primary:hover) {
  /* 搜索按钮悬停效果 */
  background: linear-gradient(135deg, #5ba4ff 0%, #409eff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(64, 158, 255, 0.4);
}

.search_bar :deep(.el-button:not(.el-button--primary)) {
  /* 重置按钮边框和颜色 */
  border: 1px solid #dcdfe6;
  color: #606266;
  background: #ffffff;
}

.search_bar :deep(.el-button:not(.el-button--primary):hover) {
  /* 重置按钮悬停效果 */
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
  transform: translateY(-1px);
}

/* ==================== 表格样式 ==================== */
.drag-table {
  /* 表格背景白色卡片效果 */
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.drag-table:hover {
  /* 表格悬停时阴影增强 */
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

/* 表格头部样式 */
.drag-table :deep(.el-table__header-wrapper) {
  /* 表头背景渐变 */
  background: linear-gradient(135deg, #f8f9fc 0%, #f0f2f7 100%);
}

.drag-table :deep(.el-table__header th) {
  /* 表头单元格样式 */
  background: transparent;
  color: #303133;
  font-weight: 600;
  font-size: 14px;
  padding: 16px 0;
  border-bottom: 2px solid #e4e7ed;
}

/* 表格主体样式 */
.drag-table :deep(.el-table__body tr) {
  /* 表格行过渡效果 */
  transition: all 0.3s ease;
}

.drag-table :deep(.el-table__body tr:hover) {
  /* 表格行悬停效果 */
  background: #f5f7fa !important;
  transform: translateX(2px);
}

/* 斑马条纹效果 */
.drag-table :deep(.el-table__body tr:nth-child(even)) {
  /* 偶数行背景色 */
  background: #fafafa;
}

.drag-table :deep(.el-table__body tr:nth-child(odd)) {
  /* 奇数行背景色 */
  background: #ffffff;
}

.drag-table :deep(.el-table__body td) {
  /* 表格单元格样式 */
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #606266;
}

/* 讲师信息列样式 */
.drag-table :deep(.el-table__body td:first-child) {
  /* 第一列左内边距 */
  padding-left: 20px;
}

.drag-table :deep(.el-table__body img) {
  /* 讲师头像样式增强 */
  border: 2px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.drag-table :deep(.el-table__body img:hover) {
  /* 讲师头像悬停效果 */
  transform: scale(1.1);
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 操作列按钮样式 */
.drag-table :deep(.el-button--text) {
  /* 文本按钮样式 */
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.drag-table :deep(.el-button--text:hover) {
  /* 文本按钮悬停效果 */
  background: #ecf5ff;
  transform: scale(1.05);
}

.drag-table :deep(.el-divider--vertical) {
  /* 分隔线样式 */
  margin: 0 8px;
  background: #e4e7ed;
}

/* 下拉菜单样式 */
.drag-table :deep(.el-dropdown) {
  /* 下拉菜单容器 */
  cursor: pointer;
}

/* ==================== 分页器样式 ==================== */
:deep(.pagination-container) {
  /* 分页器容器样式 */
  background: #ffffff;
  padding: 20px 24px;
  margin-top: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

:deep(.pagination-container:hover) {
  /* 分页器悬停效果 */
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
}

:deep(.el-pagination) {
  /* 分页器按钮圆角优化 */
  justify-content: center;
}

:deep(.el-pagination .el-pager li) {
  /* 分页按钮样式 */
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.el-pagination .el-pager li:hover) {
  /* 分页按钮悬停效果 */
  background: #ecf5ff;
  color: #409eff;
  transform: translateY(-2px);
}

:deep(.el-pagination .el-pager li.is-active) {
  /* 当前页按钮样式 */
  background: linear-gradient(135deg, #409eff 0%, #5ba4ff 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px 0 rgba(64, 158, 255, 0.3);
}

:deep(.el-pagination button) {
  /* 分页器箭头按钮 */
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-pagination button:hover) {
  /* 分页器箭头按钮悬停 */
  background: #ecf5ff;
  color: #409eff;
}

/* ==================== 响应式设计 ==================== */
@media screen and (max-width: 768px) {
  .app-container {
    /* 移动端容器内边距减小 */
    padding: 12px;
  }

  .page_head {
    /* 移动端顶部区域内边距减小 */
    padding: 16px;
  }

  .search_bar :deep(.el-input) {
    /* 移动端输入框宽度自适应 */
    width: 100%;
    margin-bottom: 12px;
  }

  .search_bar :deep(.el-form-item) {
    /* 移动端表单项独占一行 */
    display: block;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .button_bar {
    /* 移动端按钮区域调整 */
    flex-direction: column;
  }

  .button_bar :deep(.el-button) {
    /* 移动端按钮宽度自适应 */
    width: 100%;
  }
}

/* ==================== 动画效果 ==================== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.app-container {
  /* 页面加载动画 */
  animation: fadeIn 0.5s ease-in-out;
}

/* ==================== 加载状态样式 ==================== */
:deep(.el-loading-mask) {
  /* 加载遮罩背景 */
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

:deep(.el-loading-spinner .path) {
  /* 加载动画颜色 */
  stroke: #409eff;
}

/* ==================== 下拉菜单全局样式 ==================== */
:deep(.el-dropdown-menu) {
  /* 下拉菜单圆角和阴影 */
  border-radius: 8px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
  border: none;
  padding: 8px 0;
}

:deep(.el-dropdown-menu__item) {
  /* 下拉菜单项样式 */
  padding: 8px 20px;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  /* 下拉菜单项悬停效果 */
  background: #ecf5ff;
  color: #409eff;
}
</style>
