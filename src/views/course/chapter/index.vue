<template>
  <div class="chapter-management-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      <el-breadcrumb-item>章节管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="main-content">
      <!-- 章节列表 -->
      <div class="chapter-list">
        <h3>课程章节管理</h3>
        <p>管理课程的所有章节内容</p>

        <!-- 模拟章节数据 -->
        <div class="chapter-items">
          <div class="chapter-item" v-for="(chapter, index) in chapters" :key="chapter.id">
            <div class="chapter-header">
              <h4>第{{ chapter.order }}章: {{ chapter.title }}</h4>
              <div class="chapter-actions">
                <el-button size="small" type="primary" @click="handleEditChapter(chapter)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteChapter(chapter)">
                  删除
                </el-button>
              </div>
            </div>
            <div class="chapter-content">
              <p>{{ chapter.description }}</p>
              <div class="periods">
                <div class="period" v-for="period in chapter.periods" :key="period.id">
                  <span class="period-title">{{ period.order }}. {{ period.title }}</span>
                  <span class="period-duration">{{ period.duration }}分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const chapters = ref([])

// 初始化模拟数据
const initMockData = () => {
  chapters.value = [
    {
      id: 'chapter_001',
      order: 1,
      title: '课程介绍与环境搭建',
      description: '本章节将介绍课程的整体结构，帮助学员了解学习目标和开发环境搭建。',
      periods: [
        { id: 'period_001', order: 1, title: '课程介绍', duration: 30 },
        { id: 'period_002', order: 2, title: '开发环境安装', duration: 45 },
        { id: 'period_003', order: 3, title: '环境配置测试', duration: 15 }
      ]
    },
    {
      id: 'chapter_002',
      order: 2,
      title: '基础语法与数据类型',
      description: '学习编程语言的基础语法、变量、数据类型和基本运算。',
      periods: [
        { id: 'period_004', order: 1, title: '变量与常量', duration: 40 },
        { id: 'period_005', order: 2, title: '数据类型', duration: 50 },
        { id: 'period_006', order: 3, title: '运算符', duration: 45 }
      ]
    },
    {
      id: 'chapter_003',
      order: 3,
      title: '控制流程与函数',
      description: '掌握条件判断、循环结构和函数定义。',
      periods: [
        { id: 'period_007', order: 1, title: '条件判断', duration: 40 },
        { id: 'period_008', order: 2, title: '循环结构', duration: 45 },
        { id: 'period_009', order: 3, title: '函数基础', duration: 50 }
      ]
    }
  ]
}

const handleEditChapter = (chapter) => {
  ElMessage.info(`编辑章节: ${chapter.title}`)
}

const handleDeleteChapter = (chapter) => {
  ElMessageBox.confirm(`确定要删除章节"${chapter.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = chapters.value.findIndex(c => c.id === chapter.id)
    if (index > -1) {
      chapters.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

onMounted(() => {
  console.log('打开文件: / -> views/course/chapter/index.vue')
  initMockData()
})
</script>

<style lang="scss" scoped>
.chapter-management-container {
  padding: 20px;
  background: var(--color-bg-primary);
  min-height: 100vh;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.main-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: var(--shadow-base);
}

.chapter-list {
  h3 {
    margin: 0 0 16px 0;
    color: var(--color-text-primary);
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }
}

.chapter-items {
  .chapter-item {
    border: 1px solid var(--color-border-lighter);
    border-radius: 8px;
    margin-bottom: 16px;
    overflow: hidden;

    &:hover {
      border-color: var(--color-primary);
    }
  }

  .chapter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-lighter);

    h4 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 16px;
      font-weight: 600;
    }

    .chapter-actions {
      display: flex;
      gap: 8px;
    }
  }

  .chapter-content {
    padding: 20px;

    p {
      margin: 0 0 16px 0;
      color: var(--color-text-regular);
      line-height: 1.6;
    }
  }

  .periods {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .period {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--color-bg-tertiary);
      border-radius: 4px;
      font-size: 14px;

      .period-title {
        color: var(--color-text-primary);
        font-weight: 500;
      }

      .period-duration {
        color: var(--color-text-secondary);
        font-size: 12px;
      }
    }
  }
}
</style>