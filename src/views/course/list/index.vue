<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.courseName" placeholder="课程名称" prefix-icon="Search" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()"> 查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'course:save'" type="primary" @click="toCourseAdd()">添加课程</el-button>
      </div>
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
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import { courseApi } from '@/api/course'
  import { useRouter } from 'vue-router'
  import EnumView from '@/components/Enum/View/index.vue'

  const router = useRouter()

  // 课程详情
  const toCourseDetail = function (row) {
    router.push({ path: '/course/detail', query: { courseId: row.id } })
  }

  
  // 添加
  const toCourseAdd = () => {
    router.push({ path: '/course/create' })
  }

  // 修改
  const toCourseUpdate = (item) => {
    router.push({ path: '/course/update/modern', query: { courseId: item.id } })
  }

  
  // 基础功能（移除验证：使用模拟数据）
  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: courseApi.coursePage,
    delete: courseApi.courseDelete,
    status: courseApi.courseEdit,
    sort: courseApi.courseSort
  }, {}, { autoLoad: false })

  // 移除验证：设置模拟数据
  page.list = [
    { id: 1, courseName: 'Vue.js入门教程', courseOriginal: 199, courseDiscount: 99, countStudy: 1250, statusId: 1, responsiblePerson: '张老师' },
    { id: 2, courseName: 'React实战开发', courseOriginal: 299, courseDiscount: 149, countStudy: 890, statusId: 1, responsiblePerson: '李老师' },
    { id: 3, courseName: 'Node.js后端开发', courseOriginal: 399, courseDiscount: 199, countStudy: 567, statusId: 0, responsiblePerson: '王老师' }
  ]
  page.totalCount = page.list.length
  page.loading = false

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/list/index.vue`);
  });

</script>
