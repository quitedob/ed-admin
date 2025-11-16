<template>
  <div class="homework-edit-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <div class="title-section">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="page-title">编辑作业</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <el-form ref="formRef" :model="homeworkForm" :rules="rules" label-width="120px">
        <el-card shadow="never" class="form-card">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>

          <el-form-item label="作业标题" prop="title">
            <el-input
              v-model="homeworkForm.title"
              placeholder="请输入作业标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="作业描述" prop="description">
            <el-input
              v-model="homeworkForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入作业描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="关联班级" prop="classId">
                <el-select v-model="homeworkForm.classId" placeholder="请选择班级">
                  <el-option label="前端开发一班" value="class_001" />
                  <el-option label="前端开发二班" value="class_002" />
                  <el-option label="数据科学班" value="class_003" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联课程" prop="courseId">
                <el-select v-model="homeworkForm.courseId" placeholder="请选择课程">
                  <el-option label="前端开发基础" value="course_001" />
                  <el-option label="Vue.js框架" value="course_002" />
                  <el-option label="React基础" value="course_003" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="releaseTime">
                <el-date-picker
                  v-model="homeworkForm.releaseTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="截止时间" prop="dueTime">
                <el-date-picker
                  v-model="homeworkForm.dueTime"
                  type="datetime"
                  placeholder="选择截止时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <el-card shadow="never" class="form-card">
          <template #header>
            <span class="card-title">题目设置</span>
          </template>

          <HomeworkQuestionBuilder
            v-model:questions="homeworkForm.questions"
          />
        </el-card>

        <el-card shadow="never" class="form-card">
          <template #header>
            <span class="card-title">批改设置</span>
          </template>

          <el-form-item label="自动评分">
            <el-switch v-model="homeworkForm.settings.autoGrade" />
            <div class="form-tip">选择题和填空题将自动评分</div>
          </el-form-item>

          <el-form-item label="AI批改">
            <el-switch v-model="homeworkForm.settings.aiGrade" />
            <div class="form-tip">启用AI辅助批改问答题</div>
          </el-form-item>

          <el-form-item label="人工复审">
            <el-switch v-model="homeworkForm.settings.manualReview" />
            <div class="form-tip">需要教师确认最终分数</div>
          </el-form-item>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import HomeworkQuestionBuilder from '../create/components/HomeworkQuestionBuilder.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 表单数据
const homeworkForm = ref({
  title: '',
  description: '',
  classId: '',
  courseId: '',
  releaseTime: null,
  dueTime: null,
  questions: [],
  settings: {
    autoGrade: true,
    aiGrade: true,
    manualReview: true
  }
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  releaseTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  dueTime: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

// 加载作业数据
const loadHomework = () => {
  const homeworkId = route.params.id
  if (!homeworkId) return

  // 模拟加载数据
  homeworkForm.value = {
    title: '第一章作业',
    description: '完成第一章基础知识的练习',
    classId: 'class_001',
    courseId: 'course_001',
    releaseTime: new Date('2024-12-15T10:00:00'),
    dueTime: new Date('2024-12-25T23:59:59'),
    questions: [
      {
        id: 'q_001',
        type: 'single',
        questionText: '以下哪个不是JavaScript的数据类型？',
        difficulty: 'easy'
      }
    ],
    settings: {
      autoGrade: true,
      aiGrade: true,
      manualReview: true
    }
  }
}

// 方法
const handleBack = () => {
  router.back()
}

const handleSaveDraft = () => {
  ElMessage.success('草稿保存成功')
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (homeworkForm.value.questions.length === 0) {
        ElMessage.warning('请至少添加一道题目')
        return
      }
      
      ElMessage.success('作业保存成功')
      router.push('/homework/list')
    }
  })
}

onMounted(() => {
  loadHomework()
})
</script>

<style lang="scss" scoped>
.homework-edit-container {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--color-border-light);

  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  .form-card {
    max-width: 900px;
    margin: 0 auto 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }

    .form-tip {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
    }
  }
}
</style>
