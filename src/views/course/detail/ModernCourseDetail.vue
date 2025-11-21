<template>
  <div id="course-detail-container" class="course-detail-container">
    <!-- 左侧固定导航栏 -->
    <aside id="sidebar" class="sidebar">
      <div id="sidebar-header" class="sidebar-header">
        <img src="@/assets/images/logo.png" alt="Logo" class="sidebar-logo" />
      </div>

      <nav id="sidebar-nav" class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
        >
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 右侧主内容区 -->
    <main id="main-content" class="main-content">
      <!-- 面包屑导航 -->
      <nav id="breadcrumb" class="breadcrumb">
        <router-link to="/course" class="breadcrumb-link">系列课</router-link>
        <span class="breadcrumb-separator">></span>
        <router-link to="/course" class="breadcrumb-link">课程</router-link>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">详情</span>
      </nav>

      <!-- 课程信息头 -->
      <header id="course-header" class="course-header">
        <div id="course-info" class="course-info">
          <div id="course-thumbnail" class="course-thumbnail">
            <img :src="courseInfo.courseLogo" :alt="courseInfo.courseName" />
          </div>

          <div id="course-details" class="course-details">
            <h2 class="course-title">{{ courseInfo.courseName }}</h2>

            <div id="course-stats" class="course-stats">
              <span class="stat-item">小节数: {{ courseInfo.chapterCount || 0 }}</span>
              <span class="stat-item">累计带货数: {{ courseInfo.salesCount || 8 }}</span>
            </div>
          </div>
        </div>

        <div id="course-actions" class="course-actions">
          <div id="status-price" class="status-price">
            <span class="status-indicator" :class="getStatusClass(courseInfo.statusId)">
              ● {{ getStatusText(courseInfo.statusId) }}
            </span>
            <span class="price">
              {{ courseInfo.isFree === 1 ? '免费' : `¥ ${courseInfo.coursePrice}` }}
            </span>
          </div>

          <div id="action-buttons" class="action-buttons">
            <el-button type="primary" @click="showImportDialog">
              从已有课程导入
            </el-button>
            <el-button @click="handlePreview">
              预览
            </el-button>
          </div>
        </div>
      </header>

      <!-- 课程目录内容区 -->
      <section id="course-content" class="course-content">
        <div id="content-header" class="content-header">
          <h3 class="content-title">课程目录</h3>
          <div id="content-actions" class="content-actions">
            <el-dropdown @command="handleAddChapter" trigger="click">
              <el-button type="primary" class="split-button">
                <span>添加小节</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="video">视频小节</el-dropdown-item>
                  <el-dropdown-item command="quiz">测验小节</el-dropdown-item>
                  <el-dropdown-item command="assignment">作业小节</el-dropdown-item>
                  <el-dropdown-item command="document">文档小节</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button @click="handleImportFromLibrary">
              从资料库导入
            </el-button>

            <el-button @click="handleSort">
              排序
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!hasChapters" id="empty-state" class="empty-state">
          <div id="empty-illustration" class="empty-illustration">
            <el-icon size="120" color="#d0d0d0">
              <Document />
            </el-icon>
          </div>

          <p id="empty-text" class="empty-text">
            你还没有添加任何小节，<br />
            开始创建你的第一个小节吧
          </p>

          <div id="empty-actions" class="empty-actions">
            <el-dropdown @command="handleAddChapter" trigger="click">
              <el-button type="primary" size="large" class="split-button">
                <span>添加小节</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="video">视频小节</el-dropdown-item>
                  <el-dropdown-item command="quiz">测验小节</el-dropdown-item>
                  <el-dropdown-item command="assignment">作业小节</el-dropdown-item>
                  <el-dropdown-item command="document">文档小节</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button size="large" @click="handleImportFromLibrary">
              从资料库导入
            </el-button>

            <el-button size="large" @click="handleSort">
              排序
            </el-button>
          </div>
        </div>

        <!-- 章节列表 -->
        <div v-else id="chapter-list" class="chapter-list">
          <!-- 这里将来可以添加章节列表组件 -->
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
            <div class="chapter-header">
              <h4>{{ chapter.title }}</h4>
              <div class="chapter-actions">
                <el-button size="small" @click="editChapter(chapter)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteChapter(chapter)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowDown,
  Document,
  House,
  FolderOpened,
  VideoPlay,
  ChatLineRound,
  Setting,
  DataBoard
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 当前路由
const currentRoute = computed(() => route.path)

// 导航项
const navItems = [
  { id: 1, name: '首页', path: '/dashboard', icon: House },
  { id: 2, name: '课程管理', path: '/course', icon: FolderOpened },
  { id: 3, name: '用户管理', path: '/users', icon: ChatLineRound },
  { id: 4, name: '数据分析', path: '/analytics', icon: DataBoard },
  { id: 5, name: '系统设置', path: '/settings', icon: Setting }
]

// 课程信息
const courseInfo = ref({
  id: 1,
  courseName: '国庆 19.9 元 JavaScript 基础入门课程',
  courseLogo: 'https://via.placeholder.com/120x80',
  lecturerName: '张老师',
  categoryName: '编程基础',
  statusId: 1, // 1=已上架, 0=未上架
  isFree: 0,
  coursePrice: 19.9,
  rulingPrice: 99.9,
  chapterCount: 0,
  salesCount: 8
})

// 章节数据
const chapters = ref([])

// 是否有章节
const hasChapters = computed(() => chapters.value.length > 0)

// 获取状态类型
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  return status === 1 ? '已上架' : '未上架'
}

// 获取状态样式类
const getStatusClass = (status) => {
  return status === 1 ? 'status-published' : 'status-draft'
}

// 返回课程列表
const goBack = () => {
  router.push('/course')
}

// 显示导入对话框
const showImportDialog = () => {
  // 实现导入逻辑
  console.log('显示导入对话框')
}

// 预览课程
const handlePreview = () => {
  // 实现预览逻辑
  console.log('预览课程')
}

// 添加章节
const handleAddChapter = (type) => {
  console.log('添加章节类型:', type)
  // 实现添加章节逻辑
}

// 从资料库导入
const handleImportFromLibrary = () => {
  console.log('从资料库导入')
  // 实现从资料库导入逻辑
}

// 排序
const handleSort = () => {
  console.log('排序章节')
  // 实现排序逻辑
}

// 编辑章节
const editChapter = (chapter) => {
  console.log('编辑章节:', chapter)
  // 实现编辑逻辑
}

// 删除章节
const deleteChapter = (chapter) => {
  console.log('删除章节:', chapter)
  // 实现删除逻辑
}

// 初始化
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/detail/ModernCourseDetail.vue`);
  // 可以在这里加载课程数据
  console.log('加载课程详情:', route.params.id)
})
</script>

<style lang="scss" scoped>
.course-detail-container {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-primary);
}

// 左侧导航栏
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  z-index: 1000;

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border-light);

    .sidebar-logo {
      height: 40px;
      width: auto;
    }
  }

  .sidebar-nav {
    padding: 20px 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition);
      position: relative;

      &:hover {
        background-color: var(--color-bg-tertiary);
        color: var(--color-text-primary);
      }

      &.active {
        color: var(--color-primary-500);
        background-color: rgba(59, 130, 246, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--color-primary-500);
        }
      }

      .nav-icon {
        margin-right: 12px;
        font-size: 18px;
      }

      .nav-text {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

// 主内容区
.main-content {
  flex: 1;
  margin-left: 200px;
  padding: 24px;
  overflow-y: auto;
}

// 面包屑
.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;

  .breadcrumb-link {
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: var(--transition);

    &:hover {
      color: var(--color-primary-500);
    }
  }

  .breadcrumb-separator {
    margin: 0 8px;
    color: var(--color-text-tertiary);
  }

  .breadcrumb-current {
    color: var(--color-text-primary);
    font-weight: 500;
  }
}

// 课程信息头
.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);

  .course-info {
    display: flex;
    align-items: center;

    .course-thumbnail {
      width: 120px;
      height: 80px;
      border-radius: var(--radius-base);
      overflow: hidden;
      margin-right: 20px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .course-details {
      .course-title {
        margin: 0 0 12px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .course-stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: var(--color-text-tertiary);

        .stat-item {
          padding: 4px 0;
        }
      }
    }
  }

  .course-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;

    .status-price {
      display: flex;
      align-items: center;
      gap: 16px;

      .status-indicator {
        font-size: 14px;
        font-weight: 500;

        &.status-published {
          color: var(--color-success);
        }

        &.status-draft {
          color: var(--color-warning);
        }
      }

      .price {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-danger);
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
}

// 课程内容区
.course-content {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  overflow: hidden;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid var(--color-border-light);

    .content-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .content-actions {
      display: flex;
      gap: 12px;

      .split-button {
        display: flex;
        align-items: center;
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;

  .empty-illustration {
    margin-bottom: 24px;
  }

  .empty-text {
    margin: 0 0 32px 0;
    font-size: 16px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .empty-actions {
    display: flex;
    gap: 16px;
  }
}

// 章节列表
.chapter-list {
  padding: 24px;

  .chapter-item {
    padding: 16px;
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-base);
    margin-bottom: 12px;

    .chapter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-primary);
      }

      .chapter-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>