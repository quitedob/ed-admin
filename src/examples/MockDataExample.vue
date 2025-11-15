<template>
  <div class="mock-data-example">
    <el-page-header @back="goBack" content="模拟数据使用示例" />

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 方式1: 直接使用 Store -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>方式1: 直接使用 Store</span>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="题库总数">
              {{ mockStore.questionBanks.length }}
            </el-descriptions-item>
            <el-descriptions-item label="班级总数">
              {{ mockStore.classes.length }}
            </el-descriptions-item>
            <el-descriptions-item label="学生总数">
              {{ mockStore.students.length }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <el-select 
            v-model="selectedClassId" 
            placeholder="选择班级"
            style="width: 100%"
          >
            <el-option
              v-for="cls in mockStore.classes"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>

          <div v-if="selectedClassId" style="margin-top: 16px;">
            <el-tag>
              该班级学生数: {{ classStudents.length }}
            </el-tag>
          </div>
        </el-card>
      </el-col>

      <!-- 方式2: 使用 Mock API -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>方式2: 使用 Mock API</span>
          </template>
          
          <el-space direction="vertical" style="width: 100%">
            <el-button 
              type="primary" 
              @click="fetchQuestionBanks"
              :loading="loading"
            >
              获取题库列表
            </el-button>

            <el-button 
              type="success" 
              @click="fetchClasses"
              :loading="loading"
            >
              获取班级列表
            </el-button>

            <el-button 
              type="info" 
              @click="fetchStudents"
              :loading="loading"
            >
              获取学生列表
            </el-button>
          </el-space>

          <el-divider />

          <div v-if="apiResponse">
            <el-alert
              title="API 响应"
              type="success"
              :closable="false"
            >
              <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
            </el-alert>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据操作示例 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>数据操作示例</span>
          </template>

          <el-tabs v-model="activeTab">
            <!-- 添加班级 -->
            <el-tab-pane label="添加班级" name="addClass">
              <el-form :model="newClass" label-width="100px">
                <el-form-item label="班级名称">
                  <el-input v-model="newClass.name" />
                </el-form-item>
                <el-form-item label="班主任">
                  <el-input v-model="newClass.headTeacherName" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="newClass.description" type="textarea" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleAddClass">
                    添加班级
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 添加学生 -->
            <el-tab-pane label="添加学生" name="addStudent">
              <el-form :model="newStudent" label-width="100px">
                <el-form-item label="学号">
                  <el-input v-model="newStudent.studentId" />
                </el-form-item>
                <el-form-item label="姓名">
                  <el-input v-model="newStudent.name" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="newStudent.phone" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="newStudent.email" />
                </el-form-item>
                <el-form-item label="所属班级">
                  <el-select v-model="newStudent.classId" style="width: 100%">
                    <el-option
                      v-for="cls in mockStore.classes"
                      :key="cls.id"
                      :label="cls.name"
                      :value="cls.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleAddStudent">
                    添加学生
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 统计信息 -->
            <el-tab-pane label="统计信息" name="statistics">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="题库总数">
                  {{ mockStore.statistics.totalQuestionBanks }}
                </el-descriptions-item>
                <el-descriptions-item label="题目总数">
                  {{ mockStore.statistics.totalQuestions }}
                </el-descriptions-item>
                <el-descriptions-item label="班级总数">
                  {{ mockStore.statistics.totalClasses }}
                </el-descriptions-item>
                <el-descriptions-item label="学生总数">
                  {{ mockStore.statistics.totalStudents }}
                </el-descriptions-item>
                <el-descriptions-item label="作业总数">
                  {{ mockStore.statistics.totalHomeworks }}
                </el-descriptions-item>
                <el-descriptions-item label="考试总数">
                  {{ mockStore.statistics.totalExams }}
                </el-descriptions-item>
              </el-descriptions>

              <el-divider />

              <div v-if="selectedClassId">
                <h4>班级统计 ({{ selectedClassName }})</h4>
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="学生数">
                    {{ classStats.studentCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="作业数">
                    {{ classStats.homeworkCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="考试数">
                    {{ classStats.examCount }}
                  </el-descriptions-item>
                  <el-descriptions-item label="平均提交率">
                    {{ classStats.avgHomeworkSubmitRate.toFixed(2) }}%
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMockStore } from '@/stores/mockStore'
import mockApi from '@/api/mock'
import { ElMessage } from 'element-plus'

const mockStore = useMockStore()
const activeTab = ref('addClass')
const selectedClassId = ref('')
const loading = ref(false)
const apiResponse = ref(null)

// 新班级表单
const newClass = ref({
  name: '',
  headTeacherName: '',
  description: '',
  year: 2024,
  semester: 'fall',
  major: 'frontend',
  grade: 'junior'
})

// 新学生表单
const newStudent = ref({
  studentId: '',
  name: '',
  phone: '',
  email: '',
  classId: ''
})

// 计算属性
const classStudents = computed(() => {
  if (!selectedClassId.value) return []
  return mockStore.getStudentsByClass(selectedClassId.value)
})

const selectedClassName = computed(() => {
  const cls = mockStore.classes.find(c => c.id === selectedClassId.value)
  return cls?.name || ''
})

const classStats = computed(() => {
  if (!selectedClassId.value) return {}
  return mockStore.getClassStatistics(selectedClassId.value)
})

// API 调用示例
const fetchQuestionBanks = async () => {
  loading.value = true
  try {
    const response = await mockApi.questionBankApi.getQuestionBanks()
    apiResponse.value = {
      api: 'getQuestionBanks',
      code: response.code,
      total: response.data.total,
      records: response.data.records.slice(0, 2) // 只显示前2条
    }
    ElMessage.success('获取题库列表成功')
  } catch (error) {
    ElMessage.error('获取失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const fetchClasses = async () => {
  loading.value = true
  try {
    const response = await mockApi.classApi.getClasses()
    apiResponse.value = {
      api: 'getClasses',
      code: response.code,
      total: response.data.total,
      records: response.data.records
    }
    ElMessage.success('获取班级列表成功')
  } catch (error) {
    ElMessage.error('获取失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await mockApi.studentApi.getStudents()
    apiResponse.value = {
      api: 'getStudents',
      code: response.code,
      total: response.data.total,
      records: response.data.records.slice(0, 5) // 只显示前5条
    }
    ElMessage.success('获取学生列表成功')
  } catch (error) {
    ElMessage.error('获取失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 添加班级
const handleAddClass = () => {
  if (!newClass.value.name || !newClass.value.headTeacherName) {
    ElMessage.warning('请填写必填项')
    return
  }

  const classData = {
    ...newClass.value,
    id: `class_${Date.now()}`,
    studentCount: 0,
    courseCount: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  }

  mockStore.addClass(classData)
  ElMessage.success('班级添加成功')
  
  // 重置表单
  newClass.value = {
    name: '',
    headTeacherName: '',
    description: '',
    year: 2024,
    semester: 'fall',
    major: 'frontend',
    grade: 'junior'
  }
}

// 添加学生
const handleAddStudent = () => {
  if (!newStudent.value.studentId || !newStudent.value.name || !newStudent.value.classId) {
    ElMessage.warning('请填写必填项')
    return
  }

  const cls = mockStore.classes.find(c => c.id === newStudent.value.classId)
  
  const studentData = {
    ...newStudent.value,
    id: `stu_${Date.now()}`,
    classes: [{
      id: newStudent.value.classId,
      name: cls?.name || '',
      joinTime: new Date().toISOString()
    }],
    statistics: {
      totalHomeworks: 0,
      completedHomeworks: 0,
      totalExams: 0,
      completedExams: 0,
      averageScore: 0,
      learningTime: 0
    },
    status: 'active',
    createdAt: new Date().toISOString()
  }

  mockStore.addStudent(studentData)
  
  // 更新班级学生数
  if (cls) {
    mockStore.updateClass(cls.id, {
      studentCount: cls.studentCount + 1
    })
  }
  
  ElMessage.success('学生添加成功')
  
  // 重置表单
  newStudent.value = {
    studentId: '',
    name: '',
    phone: '',
    email: '',
    classId: ''
  }
}

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.mock-data-example {
  padding: 20px;
}

pre {
  max-height: 300px;
  overflow: auto;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
