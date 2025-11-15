<template>
  <div class="assignment-list">
    <el-table
      v-loading="loading"
      :data="assignments"
      @selection-change="handleSelectionChange"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="题目ID" align="center" prop="id" width="100">
        <template #default="scope">
          <span class="assignment-id">{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题目标题" align="left" prop="title" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <div class="assignment-title">
            <el-link type="primary" @click="$emit('view', scope.row)">
              {{ scope.row.basicInfo?.title || scope.row.title }}
            </el-link>
            <div class="assignment-meta">
              <el-tag size="small" :type="getTypeTagType(scope.row.basicInfo?.type)">
                {{ getTypeLabel(scope.row.basicInfo?.type) }}
              </el-tag>
              <el-tag size="small" :type="getDifficultyTagType(scope.row.basicInfo?.difficulty)">
                {{ getDifficultyLabel(scope.row.basicInfo?.difficulty) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属课程" align="center" prop="courseName" width="140" show-overflow-tooltip />
      <el-table-column label="所属班级" align="center" prop="className" width="140" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="$emit('edit', scope.row)">
            编辑
          </el-button>
          <el-button link type="primary" size="small" @click="$emit('view-answers', scope.row)">
            答题情况
          </el-button>
          <el-button link type="danger" size="small" @click="$emit('delete', scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  assignments: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'copy', 'view-stats', 'view-answers', 'selection-change'])


// 获取类型标签颜色
const getTypeTagType = (type) => {
  const typeMap = {
    'exercise': 'primary',
    'exam': 'danger',
    'project': 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    'exercise': '练习',
    'exam': '考试',
    'project': '项目'
  }
  return typeMap[type] || type
}

// 获取难度标签颜色
const getDifficultyTagType = (difficulty) => {
  const difficultyMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return difficultyMap[difficulty] || 'info'
}

// 获取难度标签文本
const getDifficultyLabel = (difficulty) => {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || difficulty
}


// 处理选择变化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/AssignmentList.vue`);
  });

</script>

<style lang="scss" scoped>
.assignment-list {
  .assignment-id {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #606266;
  }

  .assignment-title {
    .assignment-meta {
      margin-top: 4px;
      display: flex;
      gap: 6px;
    }
  }

  

}
</style>