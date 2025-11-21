<template>
  <el-dialog
    v-model="dialogVisible"
    title="设置课次开放进度"
    width="700px"
    @close="handleClose"
  >
    <div v-if="accessData" class="course-access-content">
      <!-- 课程信息 -->
      <div class="course-info">
        <h3>{{ accessData.courseTitle }}</h3>
        <div class="stats">
          <span>共 {{ totalLessons }} 课</span>
          <span>已开放 {{ openedLessons }} 课</span>
          <span>开放进度: {{ openProgress }}%</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="handleToggleAll(true)">
          <el-icon><Check /></el-icon>
          全部开放
        </el-button>
        <el-button size="small" @click="handleToggleAll(false)">
          <el-icon><Close /></el-icon>
          全部关闭
        </el-button>
        <el-button size="small" @click="handleOpenToIndex">
          <el-icon><Position /></el-icon>
          开放到第N课
        </el-button>
      </div>

      <!-- 课次列表 -->
      <div class="lessons-list">
        <el-scrollbar max-height="400px">
          <div
            v-for="(lesson, index) in accessData.lessons"
            :key="lesson.lessonId"
            class="lesson-item"
            :class="{ 'is-open': lesson.isOpen }"
          >
            <el-checkbox
              v-model="lesson.isOpen"
              @change="handleLessonToggle(lesson)"
            >
              <div class="lesson-info">
                <span class="lesson-index">第{{ lesson.index }}课</span>
                <span class="lesson-title">{{ lesson.title }}</span>
                <el-tag v-if="lesson.chapterTitle" size="small" type="info">
                  {{ lesson.chapterTitle }}
                </el-tag>
              </div>
            </el-checkbox>
            <el-tag v-if="lesson.isOpen" type="success" size="small">
              已开放
            </el-tag>
            <el-tag v-else type="info" size="small">
              未开放
            </el-tag>
          </div>
        </el-scrollbar>
      </div>

      <!-- 提示信息 -->
      <el-alert
        type="info"
        :closable="false"
        style="margin-top: 16px"
      >
        <template #title>
          <div style="font-size: 13px">
            <p style="margin: 0 0 8px 0">
              <strong>说明：</strong>
            </p>
            <ul style="margin: 0; padding-left: 20px">
              <li>勾选的课次将对该班级学生开放</li>
              <li>未勾选的课次学生将无法查看和学习</li>
              <li>可以根据教学进度逐步开放课次</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </div>

    <div v-else v-loading="loading" style="min-height: 200px"></div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存设置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Position } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  classId: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const loading = ref(false)
const saving = ref(false)
const accessData = ref(null)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const totalLessons = computed(() => {
  return accessData.value?.lessons.length || 0
})

const openedLessons = computed(() => {
  return accessData.value?.lessons.filter(l => l.isOpen).length || 0
})

const openProgress = computed(() => {
  if (totalLessons.value === 0) return 0
  return Math.round((openedLessons.value / totalLessons.value) * 100)
})

// 方法
const fetchClassCourseAccess = async () => {
  loading.value = true
  try {
    // TODO: 调用实际API
    // const response = await api.getClassCourseAccess(props.classId, props.courseId)
    // accessData.value = response.data
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500))
    accessData.value = {
      classId: props.classId,
      courseId: props.courseId,
      courseTitle: 'JavaScript基础课程',
      lessons: [
        {
          lessonId: 'lesson_001',
          title: 'JavaScript简介与环境搭建',
          chapterTitle: '第一章：入门基础',
          index: 1,
          isOpen: true
        },
        {
          lessonId: 'lesson_002',
          title: '变量与数据类型',
          chapterTitle: '第一章：入门基础',
          index: 2,
          isOpen: true
        },
        {
          lessonId: 'lesson_003',
          title: '运算符与表达式',
          chapterTitle: '第一章：入门基础',
          index: 3,
          isOpen: true
        },
        {
          lessonId: 'lesson_004',
          title: '条件语句',
          chapterTitle: '第二章：流程控制',
          index: 4,
          isOpen: false
        },
        {
          lessonId: 'lesson_005',
          title: '循环语句',
          chapterTitle: '第二章：流程控制',
          index: 5,
          isOpen: false
        },
        {
          lessonId: 'lesson_006',
          title: '函数基础',
          chapterTitle: '第三章：函数',
          index: 6,
          isOpen: false
        },
        {
          lessonId: 'lesson_007',
          title: '函数进阶',
          chapterTitle: '第三章：函数',
          index: 7,
          isOpen: false
        },
        {
          lessonId: 'lesson_008',
          title: '闭包与作用域',
          chapterTitle: '第三章：函数',
          index: 8,
          isOpen: false
        }
      ]
    }
  } catch (error) {
    ElMessage.error('加载课次信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleToggleAll = (isOpen) => {
  if (!accessData.value) return
  
  const action = isOpen ? '开放' : '关闭'
  ElMessageBox.confirm(
    `确定要${action}所有课次吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    accessData.value.lessons.forEach(lesson => {
      lesson.isOpen = isOpen
    })
    ElMessage.success(`已${action}所有课次`)
  }).catch(() => {
    // 取消操作
  })
}

const handleOpenToIndex = () => {
  ElMessageBox.prompt('请输入要开放到第几课', '开放到指定课次', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d+$/,
    inputErrorMessage: '请输入有效的课次序号',
    inputPlaceholder: `1-${totalLessons.value}`
  }).then(({ value }) => {
    const targetIndex = parseInt(value)
    if (targetIndex < 1 || targetIndex > totalLessons.value) {
      ElMessage.error(`课次序号必须在 1-${totalLessons.value} 之间`)
      return
    }
    
    // 开放到指定课次（包含该课次）
    accessData.value.lessons.forEach(lesson => {
      lesson.isOpen = lesson.index <= targetIndex
    })
    
    ElMessage.success(`已开放到第${targetIndex}课`)
  }).catch(() => {
    // 取消操作
  })
}

const handleLessonToggle = (lesson) => {
  console.log(`课次 ${lesson.index} 状态变更为: ${lesson.isOpen ? '开放' : '关闭'}`)
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSave = async () => {
  if (!accessData.value) return
  
  saving.value = true
  try {
    // TODO: 调用实际API
    // await api.saveClassCourseAccess(props.classId, props.courseId, accessData.value)
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('课次开放设置已保存')
    emit('save', accessData.value)
    handleClose()
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

// 监听对话框打开
watch(() => props.modelValue, (visible) => {
  if (visible) {
    fetchClassCourseAccess()
  } else {
    accessData.value = null
  }
})
</script>

<style lang="scss" scoped>
.course-access-content {
  .course-info {
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #303133;
    }

    .stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #606266;

      span {
        &:not(:last-child)::after {
          content: '|';
          margin-left: 20px;
          color: #dcdfe6;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .lessons-list {
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    overflow: hidden;

    .lesson-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #f5f7fa;
      }

      &.is-open {
        background: #f0f9ff;
      }

      .el-checkbox {
        flex: 1;

        :deep(.el-checkbox__label) {
          width: 100%;
        }
      }

      .lesson-info {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;

        .lesson-index {
          font-weight: 600;
          color: #409eff;
          min-width: 60px;
        }

        .lesson-title {
          flex: 1;
          color: #303133;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
