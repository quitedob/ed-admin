<template>
  <div class="test-container">
    <h1>课程管理页面测试</h1>

    <el-card class="test-card">
      <h2>页面跳转测试</h2>
      <p>点击下方按钮测试各个页面是否能正确跳转：</p>

      <el-space wrap>
        <el-button type="primary" @click="goToCourseList">课程列表</el-button>
        <el-button @click="goToCourseDetail">课程详情</el-button>
        <el-button type="success" @click="goToCourseCreate">创建课程</el-button>
        <el-button @click="goToCourseUpdate">编辑课程</el-button>
        <el-button @click="goToCourseAnalytics">课程分析</el-button>
        <el-button @click="goToCourseChapter">章节管理</el-button>
        <el-button @click="goToCourseRecord">课程数据</el-button>
      </el-space>
    </el-card>

    <el-card class="test-card">
      <h2>路由信息</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前路径">
          {{ currentPath }}
        </el-descriptions-item>
        <el-descriptions-item label="当前页面">
          {{ currentTitle }}
        </el-descriptions-item>
        <el-descriptions-item label="路由名称">
          {{ route.name }}
        </el-descriptions-item>
        <el-descriptions-item label="菜单项">
          {{ menuName }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="test-card">
      <h2>模拟数据</h2>
      <p>课程列表模拟数据：</p>
      <pre>{{ JSON.stringify(mockCourses, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user.js'

const route = useRoute()
const router = useRouter()

// 当前路径和页面信息
const currentPath = computed(() => route.path)
const currentTitle = ref('测试页面')
const menuName = ref('')

// 模拟课程数据
const mockCourses = [
  {
    id: 1,
    courseName: 'Vue.js入门教程',
    coursePrice: 99,
    rulingPrice: 199,
    isPutaway: 1,
    statusId: 1,
    lecturerName: '张老师',
    categoryName: '前端开发'
  },
  {
    id: 2,
    courseName: 'React实战开发',
    coursePrice: 199,
    rulingPrice: 299,
    isPutaway: 1,
    statusId: 1,
    lecturerName: '李老师',
    categoryName: '前端开发'
  }
]

// 页面跳转函数
const goToCourseList = () => {
  router.push('/course')
}

const goToCourseDetail = () => {
  router.push({ path: '/course/detail', query: { courseId: 1 } })
}

const goToCourseCreate = () => {
  router.push('/course/create')
}

const goToCourseUpdate = () => {
  router.push({ path: '/course/update', query: { courseId: 1 } })
}

const goToCourseAnalytics = () => {
  router.push({ path: '/course/analytics', query: { courseId: 1 } })
}

const goToCourseChapter = () => {
  router.push({ path: '/course/chapter', query: { courseId: 1 } })
}

const goToCourseRecord = () => {
  router.push({ path: '/course/record', query: { courseId: 1 } })
}

// 更新页面信息
const updatePageInfo = () => {
  const userStore = useUserStore()
  const currentRoute = router.currentRoute.value

  // 从菜单中查找当前页面信息
  const findMenuItem = (menus, currentPath) => {
    for (const menu of menus) {
      if (menu.path === currentPath) {
        return menu.menuName
      }
      if (menu.children && menu.children.length > 0) {
        const childName = findMenuItem(menu.children, currentPath)
        if (childName) {
          return childName
        }
      }
    }
    return null
  }

  menuName.value = findMenuItem(userStore.getMenuList, currentRoute.path) || '未知页面'

  // 根据路径设置页面标题
  const pathMap = {
    '/course': '课程列表',
    '/course/detail': '课程详情',
    '/course/create': '创建课程',
    '/course/update': '编辑课程',
    '/course/analytics': '课程分析',
    '/course/chapter': '章节管理',
    '/course/record': '课程数据'
  }

  currentTitle.value = pathMap[currentRoute.path] || '测试页面'
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/test/course-test.vue`);
  updatePageInfo()
})

// 监听路由变化
router.afterEach(() => {
  updatePageInfo()
})
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}

.test-card h2 {
  margin-bottom: 15px;
  color: #303133;
}

.test-card p {
  margin-bottom: 15px;
  color: #606266;
}

.test-card pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  color: #303133;
  overflow-x: auto;
}
</style>