<template>
  <div class="resource-group-tree">
    <div class="tree-header">
      <h3>素材分组</h3>
      <el-button link type="primary" size="small" @click="handleAddGroup">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <el-tree
      ref="treeRef"
      :data="groupTree"
      :props="treeProps"
      node-key="id"
      :default-expanded-keys="defaultExpandedKeys"
      :highlight-current="true"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="tree-node-content">
          <span class="node-label">
            <el-icon v-if="data.children?.length" class="folder-icon"><Folder /></el-icon>
            <el-icon v-else class="file-icon"><Document /></el-icon>
            {{ node.label }}
          </span>
          <div class="node-actions" v-if="!data.isRoot">
            <el-button link type="primary" size="small" @click.stop="handleEditGroup(data)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click.stop="handleDeleteGroup(data)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </el-tree>

    <!-- 分组编辑对话框 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="editingGroup ? '编辑分组' : '新增分组'"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupFormRef"
        label-width="80px"
      >
        <el-form-item label="分组名称" prop="name">
          <el-input
            v-model="groupForm.name"
            placeholder="请输入分组名称"
          />
        </el-form-item>

        <el-form-item label="分组场景" prop="scene">
          <el-select
            v-model="groupForm.scene"
            placeholder="请选择分组场景"
          >
            <el-option label="课程素材" value="course" />
            <el-option label="题库素材" value="question" />
            <el-option label="公共素材" value="misc" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="groupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveGroup">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, Document, Edit, Delete } from '@element-plus/icons-vue'
import { courseApi } from '@/api/course'

const emit = defineEmits(['group-select', 'group-change'])

const treeRef = ref(null)
const groupFormRef = ref(null)
const groupDialogVisible = ref(false)
const editingGroup = ref(null)

const groups = ref([])
const defaultExpandedKeys = ref([])

const groupForm = ref({
  name: '',
  scene: 'course'
})

const groupRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' }
  ],
  scene: [
    { required: true, message: '请选择分组场景', trigger: 'change' }
  ]
}

const treeProps = {
  children: 'children',
  label: 'name'
}

// 构建树形结构
const groupTree = computed(() => {
  const sceneMap = {
    course: '课程素材',
    question: '题库素材',
    misc: '公共素材'
  }

  const tree = []
  const sceneGroups = {}

  // 按场景分组
  groups.value.forEach(group => {
    const scene = group.scene || 'misc'
    if (!sceneGroups[scene]) {
      sceneGroups[scene] = {
        id: `scene_${scene}`,
        name: sceneMap[scene],
        isRoot: true,
        children: []
      }
    }
    sceneGroups[scene].children.push(group)
  })

  // 转换为树形结构
  Object.values(sceneGroups).forEach(sceneGroup => {
    tree.push(sceneGroup)
    if (sceneGroup.id === 'scene_course') {
      defaultExpandedKeys.value.push(sceneGroup.id)
    }
  })

  return tree
})

// 加载分组列表
const loadGroups = async () => {
  try {
    const response = await courseApi.resourceGroupList()
    groups.value = response.data || []
  } catch (error) {
    console.error('加载分组失败:', error)
    // 使用模拟数据
    groups.value = [
      { id: 'group_1', name: '课程A素材', scene: 'course', createdAt: new Date() },
      { id: 'group_2', name: '课程B素材', scene: 'course', createdAt: new Date() },
      { id: 'group_3', name: '题库公共素材', scene: 'question', createdAt: new Date() },
      { id: 'group_4', name: '其他素材', scene: 'misc', createdAt: new Date() }
    ]
  }
}

const handleNodeClick = (data) => {
  if (!data.isRoot) {
    emit('group-select', data)
  }
}

const handleAddGroup = () => {
  editingGroup.value = null
  groupForm.value = { name: '', scene: 'course' }
  groupDialogVisible.value = true
}

const handleEditGroup = (group) => {
  editingGroup.value = group
  groupForm.value = { ...group }
  groupDialogVisible.value = true
}

const handleDeleteGroup = (group) => {
  ElMessageBox.confirm(
    `确定删除分组 "${group.name}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await courseApi.resourceGroupDelete({ id: group.id })
      ElMessage.success('分组已删除')
      await loadGroups()
      emit('group-change')
    } catch (error) {
      ElMessage.error('删除分组失败')
    }
  }).catch(() => {})
}

const handleSaveGroup = async () => {
  try {
    await groupFormRef.value.validate()

    if (editingGroup.value) {
      await courseApi.resourceGroupEdit({
        id: editingGroup.value.id,
        ...groupForm.value
      })
      ElMessage.success('分组已更新')
    } else {
      await courseApi.resourceGroupSave(groupForm.value)
      ElMessage.success('分组已创建')
    }

    groupDialogVisible.value = false
    await loadGroups()
    emit('group-change')
  } catch (error) {
    console.error('保存分组失败:', error)
  }
}

onMounted(() => {
  loadGroups()
})

defineExpose({
  loadGroups
})
</script>

<style scoped>
.resource-group-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }
}

:deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
  background: #fff;

  .el-tree-node__content {
    height: 32px;
    padding: 0 8px;

    &:hover {
      background: #f5f7fa;
    }
  }

  .el-tree-node.is-current > .el-tree-node__content {
    background: #e6f7ff;
  }
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4px;

  .node-label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    font-size: 13px;

    .folder-icon,
    .file-icon {
      font-size: 14px;
      color: #909399;
    }
  }

  .node-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s;

    .el-button {
      padding: 0;
      font-size: 12px;
    }
  }

  &:hover .node-actions {
    opacity: 1;
  }
}
</style>
