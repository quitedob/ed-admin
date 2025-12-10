<template>
  <div class="app-container">
    <div class="page_head">
      <el-form :model="query" inline label-width="80px" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 12px;">
          <el-form-item>
            <el-input v-model="query.courseName" placeholder="课程名称" prefix-icon="Search" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()"> 查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </div>
        <div>
          <el-button v-permission="'course:save'" type="primary" @click="toCourseAdd()">添加课程</el-button>
        </div>
      </el-form>
    </div>
    <el-table v-loading="page.loading" :data="page.list" row-key="id" class="drag-table">
      <el-table-column :min-width="180" label="课程信息">
        <template #default="scope">
          <img :alt="scope.row.courseName" :src="scope.row.courseLogo" style="float: left; height: 50px; width: 90px; vertical-align: middle; border-radius: 5px" />
          <div style="float: left; margin-left: 10px; max-width: 70%">
            <el-link :href="'/course/detail?id=' + scope.row.id" target="_blank">{{ scope.row.courseName }}</el-link>
            <br />
            <span v-if="scope.row.isFree === 1">免费</span>
            <span v-if="scope.row.isFree === 0">
              ￥{{ scope.row.coursePrice }}<span style="text-decoration: line-through; margin-left: 10px">￥{{ scope.row.rulingPrice }}</span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :min-width="60" label="所属分类/讲师" prop="courseName">
        <template #default="scope">
          <span>
            {{ scope.row.categoryName }}
            <br />
            {{ scope.row.lecturerName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :min-width="50" label="学习人数" prop="countStudy">
        <template #default="scope">
          <span>{{ scope.row.countStudy }} 人学习</span>
        </template>
      </el-table-column>
      <el-table-column :min-width="30" label="负责人">
        <template #default="scope">
          <span>{{ scope.row.responsiblePerson || '未分配' }}</span>
        </template>
      </el-table-column>
      <el-table-column :min-width="30" label="状态">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column :width="200" fixed="right" label="操作" prop="address">
        <template #default="scope">
          <div class="table-actions">
            <el-button v-permission="'course:view'" text type="primary" @click="toCourseDetail(scope.row)">详情</el-button>
            <el-divider direction="vertical" />
            <el-button v-permission="'course:edit'" text type="primary" @click="toCourseUpdate(scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button v-permission="'course:delete'" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
  import { ElMessage } from 'element-plus'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import { courseApi } from '@/api/course'
  import { useRouter } from 'vue-router'
  import EnumView from '@/components/Enum/View/index.vue'

  const router = useRouter()

  // 课程详情
  const toCourseDetail = function (row) {
    console.log('=== 跳转到课程详情 ===')
    console.log('row 对象:', row)
    console.log('row.id:', row.id)
    console.log('row.id 类型:', typeof row.id)
    console.log('row.id 长度:', row.id?.length)
    console.log('row.id 是否为空:', !row.id || row.id === '')
    
    if (!row.id || row.id === '') {
      ElMessage.error('课程ID为空，无法查看详情')
      console.error('课程ID为空，row:', row)
      return
    }
    
    router.push({ path: '/course/detail', query: { courseId: row.id } })
  }

  
  // 添加
  const toCourseAdd = () => {
    router.push({ path: '/course/create' })
  }

  // 修改
  const toCourseUpdate = (item) => {
    console.log('跳转到课程编辑，item:', item)
    console.log('课程ID:', item.id, '类型:', typeof item.id)
    router.push({ path: '/course/update/modern', query: { courseId: item.id } })
  }

  
  // 自定义删除函数，支持删除临时课程
  const customDelete = async (data) => {
    // 检查是否是临时课程
    const tempCourses = JSON.parse(sessionStorage.getItem('temp_courses') || '[]')
    const tempIndex = tempCourses.findIndex(c => c.id === data.id)
    
    if (tempIndex > -1) {
      // 删除临时课程
      tempCourses.splice(tempIndex, 1)
      sessionStorage.setItem('temp_courses', JSON.stringify(tempCourses))
      loadCourseList()
      return Promise.resolve({ msg: '删除成功' })
    }
    
    // 否则调用API删除
    return courseApi.courseDelete(data)
  }

  // 基础功能（移除验证：使用模拟数据）
  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: courseApi.coursePage,
    delete: customDelete,
    status: courseApi.courseEdit,
    sort: courseApi.courseSort
  }, {}, { autoLoad: false })

  // 加载课程列表（包含临时课程）
  const loadCourseList = () => {
    // 加载临时存储的课程
    const tempCourses = JSON.parse(sessionStorage.getItem('temp_courses') || '[]')
    console.log('加载课程列表，临时课程数量:', tempCourses.length)
    
    // 检查每个临时课程的ID
    tempCourses.forEach((course, index) => {
      console.log(`临时课程 ${index + 1}:`, {
        id: course.id,
        courseName: course.courseName,
        idType: typeof course.id,
        idLength: course.id?.length
      })
    })
    
    // 移除验证：设置模拟数据
    page.list = [
      ...tempCourses,
      { id: 1, courseName: 'Vue.js入门教程', courseLogo: '/images/course-logo.jpg', courseOriginal: 199, courseDiscount: 99, countStudy: 1250, statusId: 1, responsiblePerson: '张老师' },
      { id: 2, courseName: 'React实战开发', courseLogo: '/images/course-logo.jpg', courseOriginal: 299, courseDiscount: 149, countStudy: 890, statusId: 1, responsiblePerson: '李老师' },
      { id: 3, courseName: 'Node.js后端开发', courseLogo: '/images/course-logo.jpg', courseOriginal: 399, courseDiscount: 199, countStudy: 567, statusId: 0, responsiblePerson: '王老师' }
    ]
    page.totalCount = page.list.length
    page.loading = false
    console.log('课程列表加载完成，总数:', page.list.length)
  }
  
  // 初始加载
  loadCourseList()

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/list/index.vue`);
    // 每次进入页面时重新加载，确保显示最新的临时课程数据
    loadCourseList()
  });

</script>
