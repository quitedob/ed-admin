<template>
  <div class="class-authorization">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>班级授权管理</span>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建授权
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="班级">
            <el-select v-model="searchForm.classId" placeholder="选择班级" clearable style="width: 200px">
              <el-option
                v-for="item in classOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程">
            <el-select v-model="searchForm.courseId" placeholder="选择课程" clearable style="width: 200px">
              <el-option
                v-for="item in courseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 授权列表 -->
      <el-table v-loading="loading" :data="authorizationList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="className" label="班级名称" min-width="150" />
        <el-table-column prop="courseName" label="课程名称" min-width="200" />
        <el-table-column prop="chapterCount" label="授权章节数" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.chapterIds?.length || 0 }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="班级人数" width="100" />
        <el-table-column prop="authorizedCount" label="已授权人数" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round((row.authorizedCount / row.studentCount) * 100)"
              :color="getProgressColor(row.authorizedCount, row.studentCount)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authorizeTime" label="授权时间" width="120" />
        <el-table-column prop="expireTime" label="到期时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              查看
            </el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteAuthorization(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <Pagination
          v-show="total > 0"
          :total="total"
          v-model:page="searchForm.page"
          v-model:limit="searchForm.limit"
          @pagination="getAuthorizationList"
        />
      </div>
    </el-card>

    <!-- 创建授权对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建班级授权" width="800px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="选择班级" prop="classId">
          <el-select v-model="createForm.classId" placeholder="请选择班级" style="width: 100%">
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="`${item.name} (${item.studentCount}人)`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择课程" prop="courseId">
          <el-select v-model="createForm.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option
              v-for="item in courseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择章节" prop="chapterIds">
          <el-checkbox-group v-model="createForm.chapterIds">
            <div v-for="course in courseOptions" :key="course.id" v-show="createForm.courseId === course.id">
              <el-checkbox
                v-for="chapter in course.chapters"
                :key="chapter.id"
                :label="chapter.id"
                style="display: block; margin: 8px 0;"
              >
                {{ chapter.name }} ({{ chapter.duration }}分钟)
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker
            v-model="createForm.expireTime"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="授权说明">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入授权说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateAuthorization" :loading="creating">
          创建授权
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="授权详情" width="900px">
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="班级名称">{{ currentDetail.className }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ currentDetail.courseName }}</el-descriptions-item>
          <el-descriptions-item label="班级人数">{{ currentDetail.studentCount }}人</el-descriptions-item>
          <el-descriptions-item label="已授权人数">{{ currentDetail.authorizedCount }}人</el-descriptions-item>
          <el-descriptions-item label="授权状态">
            <el-tag :type="currentDetail.status === 1 ? 'success' : 'danger'">
              {{ currentDetail.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="授权时间">{{ currentDetail.authorizeTime }}</el-descriptions-item>
          <el-descriptions-item label="到期时间">{{ currentDetail.expireTime }}</el-descriptions-item>
          <el-descriptions-item label="授权章节" :span="2">
            <el-tag v-for="chapterId in currentDetail.chapterIds" :key="chapterId" style="margin: 2px;">
              {{ getChapterName(chapterId) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="student-list" style="margin-top: 20px;">
          <h4>授权学生列表</h4>
          <el-table :data="currentDetail.students" stripe max-height="300">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="studentId" label="学号" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="joinTime" label="加入时间" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import classApi from '@/api/class'

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const total = ref(0)
const authorizationList = ref([])
const classOptions = ref([])
const courseOptions = ref([])
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const currentDetail = ref(null)

// 搜索表单
const searchForm = reactive({
  page: 1,
  limit: 10,
  classId: null,
  courseId: null
})

// 创建表单
const createForm = reactive({
  classId: null,
  courseId: null,
  chapterIds: [],
  expireTime: null,
  description: ''
})

// 表单验证规则
const createRules = {
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  chapterIds: [{ required: true, message: '请选择至少一个章节', trigger: 'change' }],
  expireTime: [{ required: true, message: '请选择到期时间', trigger: 'change' }]
}

const createFormRef = ref()

// 获取授权列表
const getAuthorizationList = async () => {
  loading.value = true
  try {
    const response = await classApi.getAuthorizationList(searchForm)
    if (response.code === 200) {
      authorizationList.value = response.data.items
      total.value = response.data.total
    }
  } catch (error) {
    ElMessage.error('获取授权列表失败')
  } finally {
    loading.value = false
  }
}

// 获取班级选项
const getClassOptions = async () => {
  try {
    const response = await classApi.getClassList({ limit: 100 })
    if (response.code === 200) {
      classOptions.value = response.data.items
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

// 获取课程选项
const getCourseOptions = async () => {
  try {
    const response = await classApi.getCourseList()
    if (response.code === 200) {
      courseOptions.value = response.data
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  searchForm.page = 1
  getAuthorizationList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.classId = null
  searchForm.courseId = null
  searchForm.page = 1
  getAuthorizationList()
}

// 创建授权
const handleCreateAuthorization = async () => {
  try {
    await createFormRef.value.validate()
    creating.value = true

    const response = await classApi.createAuthorization({
      ...createForm,
      expireTime: createForm.expireTime.toISOString().split('T')[0],
      className: classOptions.value.find(c => c.id === createForm.classId)?.name,
      courseName: courseOptions.value.find(c => c.id === createForm.courseId)?.name,
      studentCount: classOptions.value.find(c => c.id === createForm.classId)?.studentCount || 0,
      authorizedCount: classOptions.value.find(c => c.id === createForm.classId)?.studentCount || 0
    })

    if (response.code === 200) {
      ElMessage.success('授权创建成功')
      showCreateDialog.value = false
      resetCreateForm()
      getAuthorizationList()
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('创建授权失败:', error)
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.classId = null
  createForm.courseId = null
  createForm.chapterIds = []
  createForm.expireTime = null
  createForm.description = ''
  createFormRef.value?.resetFields()
}

// 查看详情
const viewDetail = async (row) => {
  try {
    // 获取班级详情（包含学生列表）
    const classResponse = await classApi.getClassDetail(row.classId)
    if (classResponse.code === 200) {
      currentDetail.value = {
        ...row,
        students: classResponse.data.students
      }
      showDetailDialog.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 切换状态
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确定要${action}这个授权吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await classApi.updateAuthorization(row.id, newStatus)
    if (response.code === 200) {
      ElMessage.success(response.message)
      getAuthorizationList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 删除授权
const deleteAuthorization = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个授权吗？删除后学生将无法访问相关课程内容。', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await classApi.deleteAuthorization(row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      getAuthorizationList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 获取进度条颜色
const getProgressColor = (authorized, total) => {
  const percentage = (authorized / total) * 100
  if (percentage === 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取章节名称
const getChapterName = (chapterId) => {
  for (const course of courseOptions.value) {
    const chapter = course.chapters.find(c => c.id === chapterId)
    if (chapter) return chapter.name
  }
  return `章节${chapterId}`
}

// 监听课程变化，清空章节选择
const handleCourseChange = () => {
  createForm.chapterIds = []
}

// 组件挂载
onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/class/authorization/index.vue`);
  getAuthorizationList()
  getClassOptions()
  getCourseOptions()
})
</script>

<style scoped>
.class-authorization {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.student-list h4 {
  margin-bottom: 10px;
  color: #303133;
}

:deep(.el-checkbox-group) {
  width: 100%;
}
</style>