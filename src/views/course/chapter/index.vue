<template>
  <div class="app-container">
    <div class="container-header">
      <div class="header-info">
        <img :src="currentCourseInfo.basicInfo?.cover" :alt="currentCourseInfo.basicInfo?.title" style="height: 120px; width: auto; border-radius: 10px" />
        <div class="info">
          <div class="info-title">{{ currentCourseInfo.basicInfo?.title }}</div>
          <div class="info-name">讲师：{{ currentCourseInfo.basicInfo?.teacher?.name }}</div>
          <div class="info-name">难度：{{ getLevelText(currentCourseInfo.basicInfo?.level) }}</div>
          <div class="info-name">发布状态：{{ getStatusText(currentCourseInfo.schedule?.publishStatus) }}</div>
        </div>
      </div>
      <div class="header-button">
        <el-button v-permission="'course:edit'" link type="primary" @click="toCourseUpdate()">编辑</el-button>
      </div>
    </div>
    <div class="tips">章只有一个时，前台不显示章，只显示小节</div>
    <div class="container-main">
      <!-- 目录 -->
      <chapter v-if="currentChapterInfo.id" :tree-data="treeData" :chapter-id="currentChapterInfo.id" @node-click="handleChapterClick" @refresh="handleChapterList" />
      <div class="main-table">
        <el-table v-loading="loading" :data="sectionList">
          <el-table-column align="left" :min-width="300">
            <template #header>
              <div class="table-header">
                {{ currentChapterInfo.title }}
              </div>
            </template>
            <template #default="scope">
              <div class="table-default">
                <span>{{ scope.$index + 1 }}. </span>
                <span v-if="scope.row.contentType">
                  <el-tag class="table-default-tag" effect="plain">
                    {{ getContentTypeText(scope.row.contentType) }}
                  </el-tag>
                  <span>
                    <span>{{ scope.row.title }}</span>
                    <el-image
                      v-if="scope.row.contentType === 'image'"
                      :src="scope.row.contentUrl"
                      :preview-src-list="[scope.row.contentUrl]"
                      preview-teleported
                      style="height: 50px; width: auto; vertical-align: middle; margin-left: 10px"
                    />
                  </span>
                  <span v-if="scope.row.duration"> 【{{ formatTime(scope.row.duration) }}】</span>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="right">
            <template #default="scope">
              <el-button text type="primary" @click="openFormSectionModal(scope.row)">编辑</el-button>
              <el-divider direction="vertical" />
              <el-button text type="primary" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup>
  import { onMounted, ref } from 'vue'
  import { courseApi } from '@/api/course'
  import { useRoute } from 'vue-router/dist/vue-router'
  import Chapter from './Chapter.vue'
  import { useRouter } from 'vue-router'
  import { formatTime } from '@/utils/base.js'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import Sortable from 'sortablejs'

  const router = useRouter()
  const route = useRoute()
  const currentCourseInfo = ref({})
  const currentChapterInfo = ref({})

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/chapter/index.vue`);
    // 使用统一的模拟数据
    const courseId = route.query.courseId || 'course_001'
    import('@/utils/mockData').then(({ mockApi }) => {
      // 获取课程详情
      mockApi.getCourseDetail(courseId).then(course => {
        currentCourseInfo.value = course || {}
        
        // 设置章节数据
        treeData.value = course.chapters || []
        if (treeData.value && treeData.value.length > 0) {
          currentChapterInfo.value = treeData.value[0]
          handleSectionList(treeData.value[0].id)
        }
      })
    })
  })

  
  // 章点击回调
  const handleChapterClick = (item) => {
    currentChapterInfo.value = item
    handleSectionList(item.id)
  }

  // 课程信息
  const handleCourseInfo = async () => {
    // currentCourseInfo.value = await courseApi.courseView({ id: route.query.courseId })
  }

  // 章节列表
  const loading = ref(false)
  const treeData = ref()
  const handleChapterList = async () => {
    // const res = await courseApi.courseChapterList({ courseId: route.query.courseId })
    // treeData.value = res
    // if (res && res.length > 0) {
    //   currentChapterInfo.value = res[0]
    //   handleSectionList(res[0].id)
    // }
  }

  // 小节列表
  const sectionList = ref([])
  const handleSectionList = (chapterId) => {
    loading.value = true
    
    // 从当前课程数据中获取小节列表
    const chapter = treeData.value.find(ch => ch.id === chapterId)
    if (chapter && chapter.sections) {
      sectionList.value = chapter.sections
    } else {
      sectionList.value = []
    }
    
    loading.value = false
    handleSectionSort()
  }

  // 小节修改 - 跳转到现代化课程更新页面的章节内容页面
  const openFormSectionModal = (item) => {
    router.push({
      path: '/course/update/modern',
      query: {
        courseId: route.query.courseId,
        chapterId: item.chapterId || currentChapterInfo.value.id,
        sectionId: item.id,
        tab: 'chapters'  // 明确指定切换到章节内容页面
      }
    })
  }

  // 小节删除
  const handleDelete = (item) => {
    ElMessageBox.confirm('确定删除吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // courseApi.courseSectionDelete(item).then((res) => {
      //   ElMessage.success(res)
      //   sectionList.value = []
      //   handleSectionList(currentChapterInfo.value.id)
      // })
      ElMessage.success('删除成功')
      sectionList.value = sectionList.value.filter(s => s.id !== item.id)
    })
  }

  // 课程修改
  const toCourseUpdate = () => {
    router.push({ path: '/course/update/modern', query: { courseId: route.query.courseId } })
  }

  const handleSectionSort = () => {
    const tbody = document.querySelector('.el-table__body-wrapper tbody')
    Sortable.create(tbody, {
      onEnd: ({ newIndex, oldIndex }) => {
        const currRow = sectionList.value.splice(oldIndex, 1)[0]
        sectionList.value.splice(newIndex, 0, currRow)
        
        // 更新排序
        const sections = sectionList.value.map((el, i) => {
          return {
            id: el.id,
            order: i + 1
          }
        })
        
        // courseApi.courseSectionSort(sections).then(() => {
        //   ElMessage.success('排序完成')
        //   sectionList.value = []
        //   handleSectionList(currentChapterInfo.value.id)
        // })
        ElMessage.success('排序完成')
      }
    })
  }

  // 工具方法
  const getLevelText = (level) => {
    const levelMap = {
      'beginner': '初级',
      'intermediate': '中级',
      'advanced': '高级'
    }
    return levelMap[level] || '未知'
  }

  const getStatusText = (status) => {
    const statusMap = {
      'draft': '草稿',
      'published': '已发布',
      'unpublished': '未发布'
    }
    return statusMap[status] || '未知'
  }

  const getContentTypeText = (type) => {
    const typeMap = {
      'video': '视频',
      'audio': '音频',
      'document': '文档',
      'image': '图片'
    }
    return typeMap[type] || '未知'
  }

  </script>
<style lang="scss" scoped>
  .container-header {
    display: flex;
    justify-content: space-between;
    .header-info {
      display: flex;
      .info {
        margin-left: 20px;
        line-height: 30px;
        .info-name {
          color: #999;
        }
      }
    }

    .header-button {
      float: right;
    }
  }

  .container-main {
    display: flex;
    .main-table {
      width: calc(100% - 250px);
      min-height: 400px;
    }

    .table-default-tag {
      margin: 0 10px;
    }
  }

  .tips {
    padding: 10px 15px;
    background: rgba(61, 127, 255, 0.1);
    border: 1px solid rgba(61, 127, 255, 0.6);
    color: #666;
    border-radius: 4px;
    margin: 20px 0;
    font-size: 14px;
  }
</style>
