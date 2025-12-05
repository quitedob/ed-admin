<template>
  <div class="class-authorization-panel">
    <el-alert
      title="授权说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p style="margin: 0; line-height: 1.6;">
        <strong>授权</strong>：班级与课程的绑定关系<br>
        <strong>开放</strong>：具体章节内容的可见性控制（按大章节粒度）
      </p>
    </el-alert>

    <div class="panel-layout">
      <!-- 左侧：已授权班级列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>已授权班级</h3>
          <el-button type="primary" size="small" @click="showAddClassDialog = true">
            <el-icon><Plus /></el-icon>
            添加班级
          </el-button>
        </div>

        <div class="class-list">
          <div
            v-for="classItem in authorizedClasses"
            :key="classItem.classId"
            :class="['class-item', { active: selectedClass?.classId === classItem.classId }]"
            @click="handleSelectClass(classItem)"
          >
            <div class="class-info">
              <h4>{{ classItem.className }}</h4>
              <div class="class-meta">
                <el-tag :type="getStatusType(classItem.status)" size="small">
                  {{ getStatusLabel(classItem.status) }}
                </el-tag>
                <span class="student-count">{{ classItem.studentCount }}人</span>
              </div>
            </div>
            <div class="class-actions">
              <el-button
                link
                type="danger"
                size="small"
                @click.stop="handleRemoveClass(classItem)"
              >
                移除
              </el-button>
            </div>
          </div>

          <el-empty v-if="authorizedClasses.length === 0" description="暂无授权班级" />
        </div>
      </div>

      <!-- 右侧：章节开放控制 -->
      <div class="right-panel">
        <div v-if="selectedClass" class="chapter-control">
          <div class="panel-header">
            <h3>章节开放控制 - {{ selectedClass.className }}</h3>
            <div class="header-actions">
              <el-button size="small" @click="handleBatchOpen(true)">
                全部开放
              </el-button>
              <el-button size="small" @click="handleBatchOpen(false)">
                全部关闭
              </el-button>
            </div>
          </div>

          <div class="chapter-tree">
            <div
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              class="chapter-node"
            >
              <div class="chapter-header">
                <div class="chapter-title">
                  <el-icon><FolderOpened /></el-icon>
                  <span>{{ chapter.number }}. {{ chapter.title }}</span>
                  <el-tag v-if="chapter.sections?.length" type="info" size="small">
                    {{ chapter.sections.length }}小节
                  </el-tag>
                </div>
                <div class="chapter-control-actions">
                  <el-switch
                    v-model="chapterOpenStatus[chapter.id]"
                    @change="handleChapterOpenChange(chapter.id, $event)"
                  />
                  <span class="open-time" v-if="chapterOpenStatus[chapter.id]">
                    {{ getOpenTimeText(chapter.id) }}
                  </span>
                </div>
              </div>

              <!-- 小节列表（可选显示） -->
              <div v-if="chapterOpenStatus[chapter.id]" class="section-list">
                <div
                  v-for="section in chapter.sections"
                  :key="section.id"
                  class="section-item"
                >
                  <el-icon><Document /></el-icon>
                  <span>{{ section.number }}. {{ section.title }}</span>
                  <el-tag size="small" type="success">已开放</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty
          v-else
          description="请从左侧选择班级"
          :image-size="120"
        />
      </div>
    </div>

    <!-- 添加班级对话框 -->
    <el-dialog
      v-model="showAddClassDialog"
      title="添加授权班级"
      width="600px"
    >
      <el-form label-width="80px">
        <el-form-item label="选择班级">
          <el-select
            v-model="selectedClassIds"
            multiple
            filterable
            placeholder="请选择要授权的班级"
            style="width: 100%"
          >
            <el-option
              v-for="cls in availableClasses"
              :key="cls.id"
              :label="`${cls.name} (${cls.studentCount}人)`"
              :value="cls.id"
              :disabled="isClassAuthorized(cls.id)"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddClassDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddClasses">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderOpened, Document } from '@element-plus/icons-vue'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  chapters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// 状态
const selectedClass = ref(null)
const showAddClassDialog = ref(false)
const selectedClassIds = ref([])

// 已授权班级列表
const authorizedClasses = ref([
  {
    classId: 'class_001',
    className: '2024春季班',
    status: 'active',
    studentCount: 45,
    createdAt: '2024-01-15'
  },
  {
    classId: 'class_002',
    className: '2024秋季班',
    status: 'active',
    studentCount: 38,
    createdAt: '2024-09-01'
  }
])

// 可用班级列表（未授权的）
const availableClasses = ref([
  { id: 'class_003', name: '2025春季班', studentCount: 50 },
  { id: 'class_004', name: '2025秋季班', studentCount: 42 }
])

// 章节开放状态 { chapterId: boolean }
const chapterOpenStatus = reactive({})

// 章节开放时间记录 { chapterId: { openAt, closeAt } }
const chapterOpenTime = reactive({})

// 初始化章节开放状态
const initChapterStatus = () => {
  if (!selectedClass.value) return

  props.chapters.forEach(chapter => {
    // 模拟从后端获取的开放状态
    chapterOpenStatus[chapter.id] = false
    chapterOpenTime[chapter.id] = {
      openAt: null,
      closeAt: null
    }
  })

  // 模拟已开放的章节
  if (props.chapters.length > 0) {
    chapterOpenStatus[props.chapters[0].id] = true
    chapterOpenTime[props.chapters[0].id] = {
      openAt: new Date().toISOString(),
      closeAt: null
    }
  }
}

// 选择班级
const handleSelectClass = (classItem) => {
  selectedClass.value = classItem
  initChapterStatus()
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    active: 'success',
    paused: 'warning',
    finished: 'info'
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = {
    active: '进行中',
    paused: '已暂停',
    finished: '已结束'
  }
  return map[status] || status
}

// 检查班级是否已授权
const isClassAuthorized = (classId) => {
  return authorizedClasses.value.some(c => c.classId === classId)
}

// 添加班级授权
const handleAddClasses = async () => {
  if (selectedClassIds.value.length === 0) {
    ElMessage.warning('请选择要授权的班级')
    return
  }

  try {
    // TODO: 调用API添加授权
    // await addClassAuthorization(props.courseId, selectedClassIds.value)

    selectedClassIds.value.forEach(classId => {
      const cls = availableClasses.value.find(c => c.id === classId)
      if (cls) {
        authorizedClasses.value.push({
          classId: cls.id,
          className: cls.name,
          status: 'active',
          studentCount: cls.studentCount,
          createdAt: new Date().toISOString()
        })
      }
    })

    ElMessage.success(`成功授权 ${selectedClassIds.value.length} 个班级`)
    showAddClassDialog.value = false
    selectedClassIds.value = []
  } catch (error) {
    ElMessage.error('授权失败：' + error.message)
  }
}

// 移除班级授权
const handleRemoveClass = (classItem) => {
  ElMessageBox.confirm(
    `确定要移除班级"${classItem.className}"的授权吗？移除后该班级学生将无法访问此课程。`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: 调用API移除授权
      // await removeClassAuthorization(props.courseId, classItem.classId)

      const index = authorizedClasses.value.findIndex(c => c.classId === classItem.classId)
      if (index > -1) {
        authorizedClasses.value.splice(index, 1)
      }

      if (selectedClass.value?.classId === classItem.classId) {
        selectedClass.value = null
      }

      ElMessage.success('移除成功')
    } catch (error) {
      ElMessage.error('移除失败：' + error.message)
    }
  }).catch(() => {})
}

// 章节开放状态变更
const handleChapterOpenChange = async (chapterId, isOpen) => {
  if (!selectedClass.value) return

  try {
    // TODO: 调用API更新章节开放状态
    // await updateChapterOpenStatus({
    //   classId: selectedClass.value.classId,
    //   courseId: props.courseId,
    //   chapterId,
    //   isOpen
    // })

    if (isOpen) {
      chapterOpenTime[chapterId] = {
        openAt: new Date().toISOString(),
        closeAt: null
      }
      ElMessage.success('章节已开放')
    } else {
      chapterOpenTime[chapterId] = {
        ...chapterOpenTime[chapterId],
        closeAt: new Date().toISOString()
      }
      ElMessage.success('章节已关闭')
    }
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
    // 回滚状态
    chapterOpenStatus[chapterId] = !isOpen
  }
}

// 批量开放/关闭
const handleBatchOpen = async (isOpen) => {
  if (!selectedClass.value) return

  const action = isOpen ? '开放' : '关闭'
  ElMessageBox.confirm(
    `确定要${action}所有章节吗？`,
    `批量${action}`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: 调用API批量更新
      props.chapters.forEach(chapter => {
        chapterOpenStatus[chapter.id] = isOpen
        if (isOpen) {
          chapterOpenTime[chapter.id] = {
            openAt: new Date().toISOString(),
            closeAt: null
          }
        } else {
          chapterOpenTime[chapter.id] = {
            ...chapterOpenTime[chapter.id],
            closeAt: new Date().toISOString()
          }
        }
      })

      ElMessage.success(`已${action}所有章节`)
    } catch (error) {
      ElMessage.error(`批量${action}失败：` + error.message)
    }
  }).catch(() => {})
}

// 获取开放时间文本
const getOpenTimeText = (chapterId) => {
  const time = chapterOpenTime[chapterId]
  if (!time || !time.openAt) return ''

  const openDate = new Date(time.openAt)
  return `开放于 ${openDate.toLocaleDateString()}`
}

onMounted(() => {
  // 初始化数据
  if (authorizedClasses.value.length > 0) {
    handleSelectClass(authorizedClasses.value[0])
  }
})
</script>

<style lang="scss" scoped>
.class-authorization-panel {
  padding: 20px;
}

.panel-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 300px);
}

.left-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .class-list {
    flex: 1;
    overflow-y: auto;

    .class-item {
      padding: 16px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
      }

      &.active {
        border-color: #409eff;
        background: #ecf5ff;
      }

      .class-info {
        h4 {
          margin: 0 0 8px 0;
          font-size: 15px;
          font-weight: 600;
        }

        .class-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #909399;

          .student-count {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .class-actions {
        margin-top: 8px;
        text-align: right;
      }
    }
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;

  .chapter-control {
    height: 100%;
    display: flex;
    flex-direction: column;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .chapter-tree {
      flex: 1;
      overflow-y: auto;

      .chapter-node {
        margin-bottom: 16px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        overflow: hidden;

        .chapter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f5f7fa;

          .chapter-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;

            .el-icon {
              color: #409eff;
            }
          }

          .chapter-control-actions {
            display: flex;
            align-items: center;
            gap: 12px;

            .open-time {
              font-size: 12px;
              color: #67c23a;
            }
          }
        }

        .section-list {
          padding: 12px 16px;
          background: white;

          .section-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            font-size: 14px;
            color: #606266;

            .el-icon {
              color: #909399;
            }

            .el-tag {
              margin-left: auto;
            }
          }
        }
      }
    }
  }
}
</style>
