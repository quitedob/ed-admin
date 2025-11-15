<template>
  <div class="form-container">
    <div class="form-header">
      <h2>{{ isCopyMode ? '复制课程' : '创建课程' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="120px" style="max-width: 980px" @submit.prevent>
      <!-- 元数据信息 -->
      <div class="form-main">
        <div class="form-main-title">元数据信息</div>
        <div class="form-main-content">
          <el-form-item label="课程ID" prop="id">
            <el-input v-model="formModel.id" placeholder="系统自动生成" disabled></el-input>
          </el-form-item>
          <el-form-item label="版本号" prop="version">
            <el-input v-model="formModel.metadata.version" placeholder="1.0"></el-input>
          </el-form-item>
          <el-form-item label="创建者" prop="createdBy">
            <el-input v-model="formModel.metadata.createdBy" placeholder="当前登录用户"></el-input>
          </el-form-item>
        </div>
      </div>

      <!-- 基础信息 -->
      <div class="form-main">
        <div class="form-main-title">基础信息</div>
        <div class="form-main-content">
          <el-form-item label="课程标题" prop="title">
            <el-input
              v-model="formModel.basicInfo.title"
              maxlength="125"
              show-word-limit
              :placeholder="isCopyMode ? '课程名称将自动添加副本标识' : '请输入课程标题'"
            />
          </el-form-item>
          <el-form-item label="课程描述" prop="description">
            <el-input
              v-model="formModel.basicInfo.description"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请输入课程描述"
            />
          </el-form-item>
          <el-form-item label="课程封面" prop="cover">
            <selector-image
              v-model="formModel.basicInfo.cover"
              :width="'270px'"
              :height="'150px'"
              :sug-img="'尺寸：900x500px，格式：JPG、PNG，大小：<2M'"
            />
          </el-form-item>
          <el-form-item label="课程时长(小时)" prop="duration">
            <el-input-number v-model="formModel.basicInfo.duration" :min="1" :max="200" />
          </el-form-item>
          <el-form-item label="课程难度" prop="level">
            <el-select v-model="formModel.basicInfo.level" placeholder="请选择课程难度">
              <el-option label="初级" value="beginner"></el-option>
              <el-option label="中级" value="intermediate"></el-option>
              <el-option label="高级" value="advanced"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="讲师信息" prop="teacher">
            <div class="teacher-info">
              <el-input v-model="formModel.basicInfo.teacher.name" disabled style="width: 260px; margin-right: 20px"></el-input>
              <el-button type="primary" @click="lecturerSelect">选择讲师</el-button>
            </div>
          </el-form-item>
          <el-form-item label="课程标签" prop="tags">
            <el-select
              v-model="formModel.basicInfo.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入课程标签"
            >
              <el-option
                v-for="item in tagOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- 课程安排 -->
      <div class="form-main">
        <div class="form-main-title">课程安排</div>
        <div class="form-main-content">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formModel.schedule.startDate"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formModel.schedule.endDate"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="发布状态" prop="publishStatus">
            <el-radio-group v-model="formModel.schedule.publishStatus">
              <el-radio label="draft">草稿</el-radio>
              <el-radio label="published">已发布</el-radio>
              <el-radio label="unpublished">未发布</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </div>

      <!-- 复制选项 -->
      <div v-if="isCopyMode" class="form-main">
        <div class="form-main-title">复制选项</div>
        <div class="form-main-content">
          <el-form-item label="复制内容">
            <el-checkbox-group v-model="copyOptions">
              <el-checkbox value="basic">基础信息</el-checkbox>
              <el-checkbox value="chapters">章节内容</el-checkbox>
              <el-checkbox value="resources">教学资源</el-checkbox>
              <el-checkbox value="problems">编程题目</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="新课程名称">
            <el-input v-model="newCourseName" placeholder="请输入新课程名称" />
          </el-form-item>
          <el-alert
            title="复制说明"
            type="info"
            description="复制课程将创建一个包含所选内容的新课程，原课程保持不变。"
            :closable="false"
          />
        </div>
      </div>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="onSubmit()" :loading="loading">
        {{ isCopyMode ? '创建副本' : '创建课程' }}
      </el-button>
    </div>
  </div>

  <select-lecturer v-if="lecturer.visible" @close="handleLecturer" />
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref, computed } from 'vue'
import { courseApi } from '@/api/course'
import Editor from '@/components/Editor/index.vue'
import SelectLecturer from '@/components/Selector/Lecturer/index.vue'
import CascaderCourse from '@/components/Cascader/Course/index.vue'
import EnumRadio from '@/components/Enum/Radio/index.vue'
import { useRouter, useRoute } from 'vue-router'
import SelectorImage from '@/components/Selector/Image/index.vue'

const router = useRouter()
const route = useRoute()

// 判断是否为复制模式
const isCopyMode = computed(() => !!route.query.copyFromId)

// 讲师选择功能
const lecturer = reactive({
  visible: false
})

const lecturerSelect = () => {
  lecturer.visible = true
}

const handleLecturer = (item) => {
  lecturer.visible = false
  if (item) {
    formModel.basicInfo.teacher.name = item.lecturerName
    formModel.basicInfo.teacher.id = item.lecturerId
    formModel.basicInfo.teacher.avatar = item.avatar || ''
  }
}

// 标签选项
const tagOptions = [
  { value: '前端开发', label: '前端开发' },
  { value: '后端开发', label: '后端开发' },
  { value: '数据分析', label: '数据分析' },
  { value: '人工智能', label: '人工智能' },
  { value: 'Java', label: 'Java' },
  { value: 'Python', label: 'Python' },
  { value: 'Vue.js', label: 'Vue.js' },
  { value: 'Spring Boot', label: 'Spring Boot' },
  { value: '全栈开发', label: '全栈开发' },
  { value: 'pandas', label: 'pandas' }
]

// 校验规则
const formRef = ref()
const rules = {
  'basicInfo.title': [{ required: true, message: '不能为空', trigger: 'blur' }],
  'basicInfo.description': [{ required: true, message: '不能为空', trigger: 'blur' }],
  'basicInfo.cover': [{ required: true, message: '不能为空', trigger: 'blur' }],
  'basicInfo.duration': [{ required: true, message: '不能为空', trigger: 'blur' }],
  'basicInfo.level': [{ required: true, message: '不能为空', trigger: 'change' }],
  'basicInfo.teacher.name': [{ required: true, message: '不能为空', trigger: 'blur' }],
  'schedule.startDate': [{ required: true, message: '不能为空', trigger: 'change' }],
  'schedule.endDate': [{ required: true, message: '不能为空', trigger: 'change' }],
  'schedule.publishStatus': [{ required: true, message: '不能为空', trigger: 'change' }]
}

// 表单
const loading = ref(false)
const formDefault = {
  id: '',
  type: 'course',
  metadata: {
    version: '1.0',
    createdAt: '',
    updatedAt: '',
    createdBy: ''
  },
  basicInfo: {
    title: '',
    description: '',
    cover: '',
    duration: 10,
    level: 'beginner',
    teacher: {
      id: '',
      name: '',
      avatar: ''
    },
    tags: []
  },
  schedule: {
    startDate: '',
    endDate: '',
    publishStatus: 'draft'
  },
  chapters: []
}

const formModel = reactive({ ...formDefault })

// 复制相关
const copyOptions = ref(['basic', 'chapters'])
const newCourseName = ref('')

// 提交表单
const onSubmit = async () => {
  // 校验
  const valid = await formRef.value.validate()
  if (!valid) return

  if (loading.value === true) {
    ElMessage.warning('正在处理···')
    return
  }

  // 设置时间戳
  const now = new Date().toISOString()
  formModel.metadata.createdAt = now
  formModel.metadata.updatedAt = now

  loading.value = true
  try {
    if (isCopyMode.value) {
      // 复制课程逻辑
      const copyData = {
        copyFromId: route.query.copyFromId,
        copyOptions: copyOptions.value,
        newCourseName: newCourseName.value || `${formModel.basicInfo.title} 副本`,
        ...formModel
      }

      await courseApi.courseCopy(copyData)
      ElMessage.success('课程复制成功')
    } else {
      // 创建新课程
      await courseApi.courseSave(formModel)
      ElMessage.success('课程创建成功')
    }

    handleClose()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

// 初始化
const initForm = async () => {
  if (isCopyMode.value) {
    // 加载要复制的课程数据
    try {
      const courseId = route.query.copyFromId
      // const res = await courseApi.courseView({ id: courseId })

      // 模拟数据
      const mockData = {
        id: courseId,
        type: 'course',
        metadata: {
          version: '1.0',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          createdBy: 'teacher_001'
        },
        basicInfo: {
          title: 'Vue.js入门教程',
          description: 'Vue.js入门教程，适合初学者学习',
          cover: '/images/course-logo.jpg',
          duration: 48,
          level: 'intermediate',
          teacher: {
            id: 'teacher001',
            name: '张老师',
            avatar: ''
          },
          tags: ['前端开发', 'Vue.js']
        },
        schedule: {
          startDate: '2024-08-31',
          endDate: '2025-06-30',
          publishStatus: 'published'
        }
      }

      Object.assign(formModel, mockData)

      // 自动生成副本名称
      newCourseName.value = `${formModel.basicInfo.title} 副本`
    } catch (error) {
      ElMessage.error('加载原课程数据失败')
    }
  } else {
    Object.assign(formModel, formDefault)
    // 设置默认创建者
    formModel.metadata.createdBy = '当前用户'
  }
}

// 返回列表
const handleClose = () => {
  router.push('/course')
}

const goBack = () => {
  handleClose()
}

onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/create/index.vue`);
  initForm()
})
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 84px);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.form-header h2 {
  margin: 0;
  color: #303133;
}

.form-main-title {
  width: 120px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-main-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
  margin-right: 8px;
}

.form-main-content {
  margin-left: 20px;
  padding-bottom: 40px;
}

.form-footer {
  text-align: center;
  width: calc(100% - 260px);
  position: fixed;
  height: 60px;
  display: flex;
  bottom: 0px;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  border-bottom: 10px solid #f2f3f5;
  margin-left: -20px;
  z-index: 9;
}

.teacher-info {
  display: flex;
  align-items: center;
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.el-alert {
  margin-top: 15px;
}
</style>