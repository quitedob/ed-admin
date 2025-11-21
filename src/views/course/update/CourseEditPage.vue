<template>
  <div class="course-edit-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ courseId ? '编辑课程' : '创建课程' }}</h1>
      <p class="page-subtitle">管理课程基本信息、章节结构和班级权限</p>
    </div>

    <!-- 标签页导航 -->
    <el-tabs v-model="activeTab" class="course-tabs">
      <!-- 基础信息标签 -->
      <el-tab-pane label="基础信息" name="basic">
        <div class="tab-content">
          <el-form
            ref="basicFormRef"
            :model="formData"
            :rules="basicRules"
            label-width="120px"
          >
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="formData.categoryId" placeholder="请选择分类">
                <el-option label="编程基础" value="1" />
                <el-option label="前端开发" value="2" />
                <el-option label="后端开发" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="课程名称" prop="courseName">
              <el-input
                v-model="formData.courseName"
                maxlength="125"
                show-word-limit
                placeholder="请输入课程名称"
              />
            </el-form-item>

            <el-form-item label="讲师" prop="lecturerId">
              <el-input
                v-model="formData.lecturerName"
                disabled
                style="width: 260px; margin-right: 20px"
              />
              <el-button type="primary" @click="selectLecturer">选择讲师</el-button>
            </el-form-item>

            <el-form-item label="课程封面" prop="courseLogo">
              <div class="cover-upload">
                <img
                  v-if="formData.courseLogo"
                  :src="formData.courseLogo"
                  alt="课程封面"
                  class="cover-preview"
                />
                <div v-else class="cover-placeholder">
                  <el-icon style="font-size: 48px; color: #d0d0d0;"><Plus /></el-icon>
                  <p>点击上传封面</p>
                  <p class="upload-tip">尺寸：900x500px，格式：JPG、PNG，大小：<2M</p>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="课程简介" prop="introduce">
              <el-input
                v-model="formData.introduce"
                type="textarea"
                :rows="4"
                placeholder="请输入课程简介"
              />
            </el-form-item>

            <el-form-item label="销售价" prop="coursePrice">
              <el-input-number
                v-model="formData.coursePrice"
                :min="0"
                :precision="2"
              />
            </el-form-item>

            <el-form-item label="划线价" prop="rulingPrice">
              <el-input-number
                v-model="formData.rulingPrice"
                :min="0"
                :precision="2"
              />
            </el-form-item>

            <el-form-item label="是否上架" prop="isPutaway">
              <el-switch v-model="formData.isPutaway" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 课程设置标签 -->
      <el-tab-pane label="课程设置" name="settings">
        <div class="tab-content">
          <el-form
            ref="settingsFormRef"
            :model="formData"
            label-width="120px"
          >
            <el-form-item label="倍速播放">
              <el-switch v-model="formData.speedDouble" />
              <span class="form-hint">开启后，用户可在播放页面选择播放速度</span>
            </el-form-item>

            <el-form-item label="拖拽播放">
              <el-switch v-model="formData.speedDrag" />
              <span class="form-hint">开启后，用户可在播放页面快速拖拽播放</span>
            </el-form-item>

            <el-form-item label="智能字幕">
              <el-switch v-model="formData.smartSubtitles" />
              <span class="form-hint">系统将自动为视频内容生成字幕</span>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 班级权限标签 -->
      <el-tab-pane label="班级权限" name="class-permission">
        <div class="tab-content">
          <ClassChapterPeriodControl
            v-if="courseId"
            :course-id="courseId"
            :chapters="chapters"
          />
          <el-empty
            v-else
            description="请先保存课程，然后配置班级权限"
            style="margin-top: 40px"
          />
        </div>
      </el-tab-pane>

      <!-- 章节管理标签 -->
      <el-tab-pane label="章节管理" name="chapters">
        <div class="tab-content">
          <div class="chapters-header">
            <el-button type="primary" @click="addChapter">
              <el-icon><Plus /></el-icon>
              添加章节
            </el-button>
          </div>

          <div class="chapters-list">
            <div
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              class="chapter-item"
            >
              <div class="chapter-header">
                <span class="chapter-number">第 {{ index + 1 }} 章</span>
                <span class="chapter-name">{{ chapter.chapterName }}</span>
                <div class="chapter-actions">
                  <el-button link type="primary" size="small" @click="editChapter(chapter)">
                    编辑
                  </el-button>
                  <el-button link type="danger" size="small" @click="deleteChapter(chapter)">
                    删除
                  </el-button>
                </div>
              </div>

              <div class="periods-list">
                <div
                  v-for="(period, pIndex) in chapter.periods"
                  :key="period.id"
                  class="period-item"
                >
                  <span class="period-number">{{ pIndex + 1 }}</span>
                  <span class="period-name">{{ period.periodName }}</span>
                  <div class="period-actions">
                    <el-button link type="primary" size="small" @click="editPeriod(period)">
                      编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="deletePeriod(period)">
                      删除
                    </el-button>
                  </div>
                </div>

                <div class="add-period">
                  <el-button link type="primary" @click="addPeriod(chapter)">
                    <el-icon><Plus /></el-icon>
                    添加课次
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 页面底部操作按钮 -->
    <div class="page-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup name="CourseEditPage">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'
import ClassChapterPeriodControl from './components/ClassChapterPeriodControl.vue'

const router = useRouter()
const route = useRoute()

const courseId = ref(route.query.courseId || '')
const activeTab = ref('basic')
const saving = ref(false)

const basicFormRef = ref()
const settingsFormRef = ref()

const formData = reactive({
  id: courseId.value,
  categoryId: '',
  courseName: '',
  lecturerName: '',
  lecturerId: '',
  courseLogo: '',
  introduce: '',
  coursePrice: 0,
  rulingPrice: 0,
  isPutaway: true,
  speedDouble: true,
  speedDrag: true,
  smartSubtitles: false
})

const chapters = ref([])

const basicRules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'blur' }],
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  lecturerId: [{ required: true, message: '请选择讲师', trigger: 'blur' }],
  courseLogo: [{ required: true, message: '请上传课程封面', trigger: 'blur' }]
}

// 初始化
const initCourse = async () => {
  if (!courseId.value) return

  try {
    const response = await courseApi.courseView({ id: courseId.value })
    const course = response.data

    Object.assign(formData, course)

    // 加载章节
    const chaptersResponse = await courseApi.courseChapterList({
      courseId: courseId.value
    })
    chapters.value = chaptersResponse.data || []
  } catch (error) {
    ElMessage.error('加载课程信息失败')
    console.error(error)
  }
}

// 选择讲师
const selectLecturer = () => {
  // TODO: 打开讲师选择对话框
  ElMessage.info('讲师选择功能待实现')
}

// 添加章节
const addChapter = () => {
  ElMessage.info('添加章节功能待实现')
}

// 编辑章节
const editChapter = (chapter) => {
  ElMessage.info('编辑章节功能待实现')
}

// 删除章节
const deleteChapter = (chapter) => {
  ElMessage.info('删除章节功能待实现')
}

// 添加课次
const addPeriod = (chapter) => {
  ElMessage.info('添加课次功能待实现')
}

// 编辑课次
const editPeriod = (period) => {
  ElMessage.info('编辑课次功能待实现')
}

// 删除课次
const deletePeriod = (period) => {
  ElMessage.info('删除课次功能待实现')
}

// 保存
const handleSave = async () => {
  const valid = await basicFormRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    if (courseId.value) {
      await courseApi.courseEdit(formData)
      ElMessage.success('课程更新成功')
    } else {
      const response = await courseApi.courseSave(formData)
      courseId.value = response.data.id
      ElMessage.success('课程创建成功')
    }
    handleCancel()
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  router.go(-1)
}

onMounted(() => {
  initCourse()
})
</script>

<style lang="scss" scoped>
.course-edit-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .course-tabs {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    .tab-content {
      padding: 20px 0;
    }
  }

  .cover-upload {
    width: 270px;
    height: 150px;
    border: 2px dashed #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
      background: #f0f9ff;
    }

    .cover-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;

      p {
        margin: 8px 0 4px 0;
        font-size: 14px;
        color: #909399;

        &.upload-tip {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }

  .form-hint {
    margin-left: 12px;
    font-size: 12px;
    color: #909399;
  }

  .chapters-header {
    margin-bottom: 20px;
  }

  .chapters-list {
    .chapter-item {
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;

      .chapter-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;

        .chapter-number {
          font-weight: 600;
          color: #303133;
          min-width: 60px;
        }

        .chapter-name {
          flex: 1;
          color: #606266;
        }

        .chapter-actions {
          display: flex;
          gap: 8px;
        }
      }

      .periods-list {
        padding: 12px 16px;

        .period-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          margin-bottom: 8px;

          .period-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: #e6f7ff;
            border-radius: 50%;
            font-size: 12px;
            color: #1890ff;
            font-weight: 600;
          }

          .period-name {
            flex: 1;
            color: #606266;
          }

          .period-actions {
            display: flex;
            gap: 8px;
          }
        }

        .add-period {
          padding: 8px 0;
        }
      }
    }
  }

  .page-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
