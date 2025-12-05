<template>
  <el-dialog
    v-model="visible"
    :title="`课程进度管理 - ${currentCourseName}`"
    width="600px"
    @close="handleClose"
  >
    <div class="pacing-container">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="checkAll">全部开放</el-button>
        <el-button type="warning" size="small" @click="uncheckAll">全部关闭</el-button>
      </div>

      <el-tree
        ref="courseTreeRef"
        :data="courseChapters"
        show-checkbox
        node-key="id"
        :default-expanded-keys="expandedKeys"
        :props="{ label: 'title', children: 'children' }"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <el-tag v-if="data.type === 'video'" size="small" type="info">视频</el-tag>
            <el-tag v-else-if="data.type === 'exam'" size="small" type="warning">测验</el-tag>
          </span>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="savePacing">保存进度设置</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  classId: String,
  courseId: String,
  courseName: String
})

const emit = defineEmits(['update:modelValue', 'saved'])

const visible = ref(false)
const courseChapters = ref([])
const courseTreeRef = ref(null)
const expandedKeys = ref([])
const currentCourseName = ref('')

// 模拟课程章节结构数据
const getMockCourseData = (courseId) => {
  const courses = {
    'course_001': {
      id: 'course_001',
      title: 'Java基础编程',
      chapters: [
        {
          id: 'chapter_1',
          title: '第一章：Java环境搭建',
          type: 'chapter',
          children: [
            { id: 'node_1_1', title: '1.1 Java开发环境安装', type: 'video' },
            { id: 'node_1_2', title: '1.2 第一个Java程序', type: 'video' },
            { id: 'node_1_3', title: '第一章测验', type: 'exam' }
          ]
        },
        {
          id: 'chapter_2',
          title: '第二章：基础语法',
          type: 'chapter',
          children: [
            { id: 'node_2_1', title: '2.1 变量与数据类型', type: 'video' },
            { id: 'node_2_2', title: '2.2 运算符', type: 'video' },
            { id: 'node_2_3', title: '2.3 控制流程', type: 'video' },
            { id: 'node_2_4', title: '第二章测验', type: 'exam' }
          ]
        },
        {
          id: 'chapter_3',
          title: '第三章：面向对象',
          type: 'chapter',
          children: [
            { id: 'node_3_1', title: '3.1 类与对象', type: 'video' },
            { id: 'node_3_2', title: '3.2 继承与多态', type: 'video' },
            { id: 'node_3_3', title: '3.3 封装', type: 'video' },
            { id: 'node_3_4', title: '第三章测验', type: 'exam' }
          ]
        }
      ]
    },
    'course_002': {
      id: 'course_002',
      title: '数据结构与算法',
      chapters: [
        {
          id: 'chapter_a',
          title: '第一章：线性结构',
          type: 'chapter',
          children: [
            { id: 'node_a1', title: '1.1 数组', type: 'video' },
            { id: 'node_a2', title: '1.2 链表', type: 'video' },
            { id: 'node_a3', title: '1.3 栈和队列', type: 'video' },
            { id: 'node_a4', title: '第一章测验', type: 'exam' }
          ]
        }
      ]
    }
  }
  return courses[courseId] || { chapters: [] }
}

// 模拟班级课程配置数据
const classCourseConfigs = ref([
  { classId: 'class_001', courseId: 'course_001', unlockedIds: ['node_1_1', 'node_1_2', 'node_1_3'] },
  { classId: 'class_002', courseId: 'course_001', unlockedIds: ['node_1_1'] }
])

// 监听弹窗打开
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadData()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载课程结构和当前班级的配置
const loadData = () => {
  currentCourseName.value = props.courseName

  // 1. 获取完整的课程目录结构
  const course = getMockCourseData(props.courseId)
  if (course && course.chapters) {
    courseChapters.value = course.chapters
    // 默认展开第一层
    expandedKeys.value = course.chapters.map(c => c.id)
  }

  // 2. 获取该班级针对该课程的已解锁章节ID列表
  const config = classCourseConfigs.value.find(
    cfg => cfg.classId === props.classId && cfg.courseId === props.courseId
  )

  // 等待DOM渲染树后设置选中状态
  setTimeout(() => {
    if (courseTreeRef.value) {
      if (config && config.unlockedIds) {
        courseTreeRef.value.setCheckedKeys(config.unlockedIds)
      } else {
        courseTreeRef.value.setCheckedKeys([])
      }
    }
  }, 100)
}

const checkAll = () => {
  if (courseTreeRef.value) {
    // 递归获取所有节点ID
    const getAllNodeIds = (nodes) => {
      let ids = []
      nodes.forEach(node => {
        ids.push(node.id)
        if (node.children) {
          ids = ids.concat(getAllNodeIds(node.children))
        }
      })
      return ids
    }
    courseTreeRef.value.setCheckedKeys(getAllNodeIds(courseChapters.value))
  }
}

const uncheckAll = () => {
  if (courseTreeRef.value) {
    courseTreeRef.value.setCheckedKeys([])
  }
}

const savePacing = () => {
  const checkedKeys = courseTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = courseTreeRef.value.getHalfCheckedKeys()

  const finalIds = [...checkedKeys, ...halfCheckedKeys]

  // 保存配置
  const existingIndex = classCourseConfigs.value.findIndex(
    cfg => cfg.classId === props.classId && cfg.courseId === props.courseId
  )

  const config = {
    classId: props.classId,
    courseId: props.courseId,
    unlockedIds: finalIds
  }

  if (existingIndex > -1) {
    classCourseConfigs.value[existingIndex] = config
  } else {
    classCourseConfigs.value.push(config)
  }

  ElMessage.success('课程进度权限已更新')
  visible.value = false
  emit('saved', config)
}

const handleClose = () => {
  visible.value = false
}

// 暴露方法供父组件调用
defineExpose({
  loadData
})
</script>

<style scoped>
.pacing-container {
  max-height: 400px;
  overflow-y: auto;
}

.toolbar {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>