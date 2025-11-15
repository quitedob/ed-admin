<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>学员授权管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleBatchAuth">批量授权</el-button>
            <el-button type="success" @click="handleBatchAuthByClass">按班级授权</el-button>
            <el-button @click="handleExport">导出数据</el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-statistic title="总授权数" :value="statsData.totalAuths" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="活跃授权" :value="statsData.activeAuths" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="已授权学生" :value="statsData.authorizedStudents" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="已授权课程" :value="statsData.authorizedCourses" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="学习完成率" :value="statsData.completionRate" suffix="%" />
          </el-col>
          <el-col :span="4">
            <el-statistic title="作业完成率" :value="statsData.homeworkRate" suffix="%" />
          </el-col>
        </el-row>
      </div>

      <!-- 搜索区域 -->
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px">
        <el-form-item label="学生姓名" prop="studentName">
          <el-input
            v-model="queryParams.studentName"
            placeholder="请输入学生姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="studentMobile">
          <el-input
            v-model="queryParams.studentMobile"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-select v-model="queryParams.courseId" placeholder="请选择课程" clearable>
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授权类型" prop="authType">
          <el-select v-model="queryParams.authType" placeholder="请选择授权类型" clearable>
            <el-option label="课程授权" value="course" />
            <el-option label="课次授权" value="lesson" />
            <el-option label="资源授权" value="resource" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择授权状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="暂停" value="paused" />
            <el-option label="过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            @click="handleBatchToggleStatus('active')"
            :disabled="multiple"
          >批量激活</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            @click="handleBatchToggleStatus('paused')"
            :disabled="multiple"
          >批量暂停</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            @click="handleBatchDelete"
            :disabled="multiple"
          >批量删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            @click="handleToggleAllAccess"
            v-if="queryParams.courseId"
          >一键全开放/关闭</el-button>
        </el-col>
      </el-row>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="authList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="学生信息" align="center" width="200">
          <template #default="scope">
            <div class="student-info">
              <el-avatar :src="scope.row.studentAvatar" :size="40">{{ scope.row.studentName?.charAt(0) }}</el-avatar>
              <div class="student-details">
                <div class="student-name">{{ scope.row.studentName }}</div>
                <div class="student-mobile">{{ scope.row.studentMobile }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="授权内容" align="center" prop="authContent">
          <template #default="scope">
            <div class="auth-content">
              <div class="course-name">{{ scope.row.courseName }}</div>
              <div class="lesson-info" v-if="scope.row.lessonName">
                课次：{{ scope.row.lessonName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="授权类型" align="center" prop="authType">
          <template #default="scope">
            <el-tag :type="getAuthTypeTagType(scope.row.authType)">
              {{ getAuthTypeLabel(scope.row.authType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="授权状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="学习进度" align="center" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.studyProgress || 0"
              :color="getProgressColor(scope.row.studyProgress)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="作业完成" align="center" width="120">
          <template #default="scope">
            <span>{{ scope.row.homeworkCompleted || 0 }}/{{ scope.row.homeworkTotal || 0 }}</span>
            <el-progress
              :percentage="scope.row.homeworkTotal ? (scope.row.homeworkCompleted / scope.row.homeworkTotal * 100) : 0"
              :stroke-width="4"
              :show-text="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="授权时间" align="center" prop="authTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.authTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期至" align="center" prop="expireTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expireTime) }}</span>
            <el-tag v-if="isExpired(scope.row.expireTime)" type="danger" size="small">已过期</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              link
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '暂停' : '激活' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageCurrent"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 批量授权对话框 -->
    <el-dialog title="批量授权" v-model="batchAuthOpen" width="800px" append-to-body>
      <el-form ref="batchAuthRef" :model="batchAuthForm" :rules="batchAuthRules" label-width="100px">
        <el-form-item label="授权方式" prop="authType">
          <el-radio-group v-model="batchAuthForm.authType">
            <el-radio value="course">按课程授权</el-radio>
            <el-radio value="lesson">按课次授权</el-radio>
            <el-radio value="student">按学生授权</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 按课程授权 -->
        <div v-if="batchAuthForm.authType === 'course'">
          <el-form-item label="选择课程" prop="courseIds">
            <el-select v-model="batchAuthForm.courseIds" multiple placeholder="请选择课程" style="width: 100%">
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择学生" prop="studentIds">
            <el-select v-model="batchAuthForm.studentIds" multiple placeholder="请选择学生" style="width: 100%">
              <el-option
                v-for="student in studentList"
                :key="student.id"
                :label="student.name"
                :value="student.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 按课次授权 -->
        <div v-if="batchAuthForm.authType === 'lesson'">
          <el-form-item label="选择课程" prop="courseId">
            <el-select v-model="batchAuthForm.courseId" placeholder="请选择课程" @change="handleCourseChange">
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择课次" prop="lessonIds">
            <el-select v-model="batchAuthForm.lessonIds" multiple placeholder="请选择课次" style="width: 100%">
              <el-option
                v-for="lesson in lessonList"
                :key="lesson.id"
                :label="lesson.name"
                :value="lesson.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择学生" prop="studentIds">
            <el-select v-model="batchAuthForm.studentIds" multiple placeholder="请选择学生" style="width: 100%">
              <el-option
                v-for="student in studentList"
                :key="student.id"
                :label="student.name"
                :value="student.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 按学生授权 -->
        <div v-if="batchAuthForm.authType === 'student'">
          <el-form-item label="选择学生" prop="studentIds">
            <el-select v-model="batchAuthForm.studentIds" multiple placeholder="请选择学生" style="width: 100%">
              <el-option
                v-for="student in studentList"
                :key="student.id"
                :label="student.name"
                :value="student.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="授权内容" prop="authContent">
            <el-checkbox-group v-model="batchAuthForm.authContent">
              <el-checkbox value="all">全部课程</el-checkbox>
              <el-checkbox value="selected">指定课程</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="选择课程" prop="courseIds" v-if="batchAuthForm.authContent.includes('selected')">
            <el-select v-model="batchAuthForm.courseIds" multiple placeholder="请选择课程" style="width: 100%">
              <el-option
                v-for="course in courseList"
                :key="course.id"
                :label="course.name"
                :value="course.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="有效期" prop="expireTime">
          <el-date-picker
            v-model="batchAuthForm.expireTime"
            type="datetime"
            placeholder="选择有效期截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="授权说明" prop="remark">
          <el-input
            v-model="batchAuthForm.remark"
            type="textarea"
            placeholder="请输入授权说明"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchAuthOpen = false">取 消</el-button>
          <el-button type="primary" @click="submitBatchAuth">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 授权详情对话框 -->
    <el-dialog title="授权详情" v-model="detailOpen" width="900px" append-to-body>
      <div v-if="currentAuth" class="auth-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentAuth.studentName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentAuth.studentMobile }}</el-descriptions-item>
          <el-descriptions-item label="授权课程">{{ currentAuth.courseName }}</el-descriptions-item>
          <el-descriptions-item label="授权类型">
            <el-tag :type="getAuthTypeTagType(currentAuth.authType)">
              {{ getAuthTypeLabel(currentAuth.authType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="授权状态">
            <el-tag :type="getStatusTagType(currentAuth.status)">
              {{ getStatusLabel(currentAuth.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="授权时间">{{ parseTime(currentAuth.authTime) }}</el-descriptions-item>
          <el-descriptions-item label="有效期至">{{ parseTime(currentAuth.expireTime) }}</el-descriptions-item>
          <el-descriptions-item label="授权说明">{{ currentAuth.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 学习进度 -->
        <div class="study-progress-section" v-if="currentAuth.studyProgress !== undefined">
          <h4>学习进度</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-statistic title="总体进度" :value="currentAuth.studyProgress" suffix="%" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="作业完成" :value="currentAuth.homeworkCompleted || 0" />
            </el-col>
          </el-row>
        </div>

        <!-- 学习历史 -->
        <div class="study-history-section">
          <h4>学习历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="history in currentAuth.history"
              :key="history.id"
              :timestamp="parseTime(history.createTime)"
            >
              {{ history.action }} - {{ history.description }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Authorization">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authorizationApi } from '@/api/authorization'
import { parseTime } from '@/utils'

const { proxy } = getCurrentInstance()

// 响应式数据
const authList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const batchAuthOpen = ref(false)
const detailOpen = ref(false)
const currentAuth = ref(null)

// 统计数据
const statsData = ref({
  totalAuths: 0,
  activeAuths: 0,
  authorizedStudents: 0,
  authorizedCourses: 0,
  completionRate: 0,
  homeworkRate: 0
})

// 查询参数
const queryParams = ref({
  pageCurrent: 1,
  pageSize: 10,
  studentName: '',
  studentMobile: '',
  courseId: '',
  authType: '',
  status: ''
})

// 课程列表
const courseList = ref([
  { id: 1, name: 'Python基础课程' },
  { id: 2, name: 'Web开发课程' },
  { id: 3, name: '数据结构课程' }
])

// 学生列表
const studentList = ref([
  { id: 1, name: '张三', mobile: '13800138001' },
  { id: 2, name: '李四', mobile: '13800138002' },
  { id: 3, name: '王五', mobile: '13800138003' }
])

// 课次列表
const lessonList = ref([])

// 批量授权表单
const batchAuthForm = ref({
  authType: 'course',
  courseIds: [],
  courseId: '',
  lessonIds: [],
  studentIds: [],
  authContent: ['all'],
  expireTime: null,
  remark: ''
})

// 表单校验
const batchAuthRules = ref({
  authType: [
    { required: true, message: '请选择授权方式', trigger: 'change' }
  ],
  studentIds: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  expireTime: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ]
})

// 获取列表数据
const getList = () => {
  loading.value = true

  // 模拟数据
  setTimeout(() => {
    const mockData = [
      {
        id: 1,
        studentName: '张小明',
        studentMobile: '13800138001',
        studentAvatar: '',
        courseName: 'Python基础课程',
        lessonName: '第一章：Python入门',
        authType: 'course',
        status: 'active',
        authTime: '2024-01-15 10:30:00',
        expireTime: '2024-03-15 10:30:00',
        studyProgress: 65,
        homeworkCompleted: 8,
        homeworkTotal: 12,
        remark: '正常授权'
      },
      {
        id: 2,
        studentName: '李小红',
        studentMobile: '13800138002',
        studentAvatar: '',
        courseName: 'Web开发课程',
        lessonName: '',
        authType: 'course',
        status: 'active',
        authTime: '2024-01-14 09:15:00',
        expireTime: '2024-04-14 09:15:00',
        studyProgress: 78,
        homeworkCompleted: 15,
        homeworkTotal: 18,
        remark: '优秀学员'
      },
      {
        id: 3,
        studentName: '王小刚',
        studentMobile: '13800138003',
        studentAvatar: '',
        courseName: '数据结构课程',
        lessonName: '第三章：树与图',
        authType: 'lesson',
        status: 'paused',
        authTime: '2024-01-13 11:20:00',
        expireTime: '2024-02-13 11:20:00',
        studyProgress: 45,
        homeworkCompleted: 5,
        homeworkTotal: 10,
        remark: '暂停授权'
      }
    ]

    // 根据查询参数过滤数据
    let filteredData = mockData

    if (queryParams.value.studentName) {
      filteredData = filteredData.filter(item =>
        item.studentName.includes(queryParams.value.studentName)
      )
    }

    if (queryParams.value.studentMobile) {
      filteredData = filteredData.filter(item =>
        item.studentMobile.includes(queryParams.value.studentMobile)
      )
    }

    if (queryParams.value.courseId) {
      filteredData = filteredData.filter(item =>
        item.courseId == queryParams.value.courseId
      )
    }

    if (queryParams.value.authType) {
      filteredData = filteredData.filter(item =>
        item.authType === queryParams.value.authType
      )
    }

    if (queryParams.value.status) {
      filteredData = filteredData.filter(item =>
        item.status === queryParams.value.status
      )
    }

    authList.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 500)
}

// 获取统计数据
const getStatsData = () => {
  // 模拟统计数据
  setTimeout(() => {
    statsData.value = {
      totalAuths: 3,
      activeAuths: 2,
      authorizedStudents: 3,
      authorizedCourses: 3,
      completionRate: 73,
      homeworkRate: 68
    }
  }, 300)
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.value.pageCurrent = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryParams.value = {
    pageCurrent: 1,
    pageSize: 10,
    studentName: '',
    studentMobile: '',
    courseId: '',
    authType: '',
    status: ''
  }
  handleQuery()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 批量授权
const handleBatchAuth = () => {
  resetBatchAuthForm()
  batchAuthOpen.value = true
}

// 按班级授权
const handleBatchAuthByClass = () => {
  ElMessage.info('按班级授权功能开发中...')
}

// 批量激活/暂停
const handleBatchToggleStatus = (status) => {
  const _ids = ids.value
  ElMessageBox.confirm(`是否确认批量${status === 'active' ? '激活' : '暂停'}选中的授权？`).then(() => {
    return Promise.all(_ids.map(id => authorizationApi.authToggleStatus(id, status)))
  }).then(() => {
    getList()
    ElMessage.success('批量操作成功')
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  const _ids = ids.value
  ElMessageBox.confirm('是否确认删除选中的授权记录？').then(() => {
    return authorizationApi.authBatchDelete(_ids)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 一键全开放/关闭
const handleToggleAllAccess = () => {
  ElMessageBox.confirm('是否确认一键开放/关闭该课程的所有授权？').then(() => {
    return authorizationApi.toggleAllAccess(queryParams.value.courseId, 'active')
  }).then(() => {
    getList()
    ElMessage.success('操作成功')
  }).catch(() => {})
}

// 查看详情
const handleViewDetail = (row) => {
  currentAuth.value = {
    ...row,
    history: [
      { id: 1, action: '授权创建', description: '系统自动创建授权', createTime: row.authTime },
      { id: 2, action: '学习开始', description: '学生开始学习第一章', createTime: row.authTime }
    ]
  }
  detailOpen.value = true
}

// 编辑授权
const handleEdit = (row) => {
  ElMessage.info('编辑功能开发中...')
}

// 切换状态
const handleToggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'paused' : 'active'
  const statusText = newStatus === 'active' ? '激活' : '暂停'

  ElMessageBox.confirm(`是否确认${statusText}该授权？`).then(() => {
    return authorizationApi.authToggleStatus(row.id, newStatus)
  }).then(() => {
    getList()
    ElMessage.success(`${statusText}成功`)
  }).catch(() => {})
}

// 删除授权
const handleDelete = (row) => {
  ElMessageBox.confirm('是否确认删除该授权记录？').then(() => {
    return authorizationApi.authDelete(row.id)
  }).then(() => {
    getList()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 课程变化时获取课次
const handleCourseChange = (courseId) => {
  // 模拟课次数据
  lessonList.value = [
    { id: 1, name: '第一章：Python基础' },
    { id: 2, name: '第二章：数据类型' },
    { id: 3, name: '第三章：控制流' }
  ]
}

// 提交批量授权
const submitBatchAuth = () => {
  proxy.$refs.batchAuthRef.validate(valid => {
    if (valid) {
      ElMessage.success('批量授权成功')
      batchAuthOpen.value = false
      getList()
      getStatsData()
    }
  })
}

// 重置批量授权表单
const resetBatchAuthForm = () => {
  batchAuthForm.value = {
    authType: 'course',
    courseIds: [],
    courseId: '',
    lessonIds: [],
    studentIds: [],
    authContent: ['all'],
    expireTime: null,
    remark: ''
  }
  if (proxy.$refs.batchAuthRef) {
    proxy.$refs.batchAuthRef.resetFields()
  }
}

// 获取授权类型标签颜色
const getAuthTypeTagType = (type) => {
  const typeMap = {
    course: '',
    lesson: 'success',
    resource: 'warning'
  }
  return typeMap[type] || ''
}

// 获取授权类型标签文本
const getAuthTypeLabel = (type) => {
  const typeMap = {
    course: '课程授权',
    lesson: '课次授权',
    resource: '资源授权'
  }
  return typeMap[type] || type
}

// 获取状态标签颜色
const getStatusTagType = (status) => {
  const statusMap = {
    active: 'success',
    paused: 'warning',
    expired: 'danger'
  }
  return statusMap[status] || ''
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statusMap = {
    active: '正常',
    paused: '暂停',
    expired: '过期'
  }
  return statusMap[status] || status
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}

// 判断是否过期
const isExpired = (expireTime) => {
  return new Date(expireTime) < new Date()
}

onMounted(() => {
  getList()
  getStatsData()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 10px;
}

.stats-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-details {
  flex: 1;
}

.student-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.student-mobile {
  font-size: 12px;
  color: #666;
}

.auth-content {
  text-align: left;
}

.course-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.lesson-info {
  font-size: 12px;
  color: #666;
}

.auth-detail {
  padding: 20px 0;
}

.study-progress-section,
.study-history-section {
  margin-top: 30px;
}

.study-progress-section h4,
.study-history-section h4 {
  margin-bottom: 15px;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}
</style>