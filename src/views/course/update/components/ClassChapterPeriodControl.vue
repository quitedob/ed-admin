<template>
  <div class="class-chapter-period-control">
    <div class="control-header">
      <h3>按班级控制大纲开放</h3>
      <p class="subtitle">为不同班级设置课程章节/课次的开放权限</p>
    </div>

    <!-- 班级选择 -->
    <div class="class-selection">
      <el-select
        v-model="selectedClassId"
        placeholder="选择班级"
        clearable
        @change="handleClassChange"
        style="width: 300px"
      >
        <el-option
          v-for="cls in authorizedClasses"
          :key="cls.id"
          :label="cls.name"
          :value="cls.id"
        />
      </el-select>
      <span v-if="selectedClassId" class="class-info">
        已选择：{{ selectedClassName }}
      </span>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selectedClassId" class="action-buttons">
      <el-button type="primary" @click="handleOpenAll">
        <el-icon><Check /></el-icon>
        一键全开
      </el-button>
      <el-button @click="handleCloseAll">
        <el-icon><Close /></el-icon>
        一键全关
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
    </div>

    <!-- 章节课次树形结构 -->
    <div v-if="selectedClassId" class="chapter-period-tree">
      <el-tree
        ref="treeRef"
        :data="chapterPeriodTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedKeys"
        @check="handleTreeCheck"
        :default-expand-all="true"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-label">{{ data.label }}</span>
            <span v-if="data.type === 'period'" class="node-type">课次</span>
            <span v-else-if="data.type === 'chapter'" class="node-type chapter">章节</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 保存按钮 -->
    <div v-if="selectedClassId" class="save-section">
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存配置
      </el-button>
      <span v-if="lastSaveTime" class="save-time">
        最后保存时间：{{ lastSaveTime }}
      </span>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!selectedClassId"
      description="请先选择班级"
      style="margin-top: 40px"
    />
  </div>
</template>

<script setup name="ClassChapterPeriodControl">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Close, Refresh } from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'

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

const selectedClassId = ref('')
const authorizedClasses = ref([])
const chapterPeriodTree = ref([])
const treeRef = ref()
const checkedKeys = ref([])
const saving = ref(false)
const lastSaveTime = ref('')

const treeProps = {
  children: 'children',
  label: 'label'
}

const selectedClassName = computed(() => {
  const cls = authorizedClasses.value.find(c => c.id === selectedClassId.value)
  return cls ? cls.name : ''
})

// 初始化：获取授权班级列表
const initAuthorizedClasses = async () => {
  try {
    // 使用模拟数据（后端API未实现时）
    const mockClasses = [
      { id: '1', name: '2024级计算机班级1', code: 'CS2024-01', studentCount: 30 },
      { id: '2', name: '2024级计算机班级2', code: 'CS2024-02', studentCount: 28 },
      { id: '3', name: '2024级计算机班级3', code: 'CS2024-03', studentCount: 32 }
    ]
    authorizedClasses.value = mockClasses
    
    // 如果后端API已实现，使用以下代码：
    // const response = await courseApi.getAuthorizedClasses(props.courseId)
    // authorizedClasses.value = response.data || []
  } catch (error) {
    ElMessage.error('获取班级列表失败')
    console.error(error)
  }
}

// 构建树形结构
const buildChapterPeriodTree = (chapters) => {
  return chapters.map(chapter => ({
    id: `chapter_${chapter.id}`,
    label: chapter.chapterName,
    type: 'chapter',
    children: (chapter.periods || []).map(period => ({
      id: `period_${period.id}`,
      label: period.periodName,
      type: 'period',
      periodId: period.id
    }))
  }))
}

// 班级变更时加载配置
const handleClassChange = async () => {
  if (!selectedClassId.value) {
    chapterPeriodTree.value = []
    checkedKeys.value = []
    return
  }

  try {
    // 构建树形结构
    chapterPeriodTree.value = buildChapterPeriodTree(props.chapters)

    // 使用模拟数据（后端API未实现时）
    const mockOpenedPeriodIds = ['1', '2', '3']
    checkedKeys.value = mockOpenedPeriodIds.map(id => `period_${id}`)

    // 如果后端API已实现，使用以下代码：
    // const response = await courseApi.getClassChapterPeriodConfig({
    //   courseId: props.courseId,
    //   classId: selectedClassId.value
    // })
    // const openedPeriodIds = response.data?.openedPeriodIds || []
    // checkedKeys.value = openedPeriodIds.map(id => `period_${id}`)

    // 更新树的选中状态
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(checkedKeys.value)
    }
  } catch (error) {
    ElMessage.error('获取班级配置失败')
    console.error(error)
  }
}

// 树节点勾选变化
const handleTreeCheck = () => {
  if (treeRef.value) {
    checkedKeys.value = treeRef.value.getCheckedKeys()
  }
}

// 一键全开
const handleOpenAll = () => {
  if (treeRef.value) {
    const allKeys = getAllPeriodKeys()
    treeRef.value.setCheckedKeys(allKeys)
    checkedKeys.value = allKeys
  }
}

// 一键全关
const handleCloseAll = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
    checkedKeys.value = []
  }
}

// 重置为上次保存的状态
const handleReset = async () => {
  await handleClassChange()
  ElMessage.success('已重置为上次保存的配置')
}

// 获取所有课次的ID
const getAllPeriodKeys = () => {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.type === 'period') {
        keys.push(node.id)
      }
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(chapterPeriodTree.value)
  return keys
}

// 保存配置
const handleSave = async () => {
  if (!selectedClassId.value) {
    ElMessage.warning('请先选择班级')
    return
  }

  saving.value = true
  try {
    // 提取课次ID（去掉前缀）
    const openedPeriodIds = checkedKeys.value
      .filter(key => key.startsWith('period_'))
      .map(key => key.replace('period_', ''))

    // 使用模拟数据（后端API未实现时）
    console.log('保存班级权限配置:', {
      courseId: props.courseId,
      classId: selectedClassId.value,
      openedPeriodIds
    })

    // 如果后端API已实现，使用以下代码：
    // await courseApi.saveClassChapterPeriodConfig({
    //   courseId: props.courseId,
    //   classId: selectedClassId.value,
    //   openedPeriodIds
    // })

    ElMessage.success('配置保存成功')
    lastSaveTime.value = new Date().toLocaleString('zh-CN')
  } catch (error) {
    ElMessage.error('保存配置失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  initAuthorizedClasses()
})
</script>

<style lang="scss" scoped>
.class-chapter-period-control {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-top: 20px;

  .control-header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .subtitle {
      margin: 0;
      font-size: 12px;
      color: #909399;
    }
  }

  .class-selection {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .class-info {
      font-size: 14px;
      color: #606266;
      padding: 0 12px;
      background: white;
      border-radius: 4px;
      height: 32px;
      line-height: 32px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .chapter-period-tree {
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 20px;
    max-height: 500px;
    overflow-y: auto;

    :deep(.el-tree-node) {
      padding: 4px 0;
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;

      .node-label {
        flex: 1;
        font-size: 14px;
      }

      .node-type {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 2px;
        background: #e6f7ff;
        color: #1890ff;

        &.chapter {
          background: #f6f8fb;
          color: #606266;
        }
      }
    }
  }

  .save-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .save-time {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
