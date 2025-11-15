<template>
  <div class="table-catalog">
    <div class="table-catalog-title">
      <span style="cursor: pointer">章节目录</span>
      <el-button text link style="margin-left: 120px" @click="openFormChapter(null, courseId)">
        <el-icon>
          <CirclePlus />
        </el-icon>
      </el-button>
    </div>
    <el-tree
      ref="treeRef"
      :data="props.treeData"
      :props="{ value: 'id', label: 'title', children: 'sections' }"
      :expand-on-click-node="false"
      node-key="id"
      draggable
      highlight-current
      @node-drop="handleDrop"
      @node-click="handleClick"
    >
      <template #default="{ data }">
        <span class="table-catalog-item">
          <span class="table-catalog-name">{{ data.title }}</span>
          <span class="table-catalog-dropdown">
            <el-dropdown style="margin-top: 3px">
              <el-icon><More /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <span>
                    <el-dropdown-item @click="openFormChapter(data, null)">重命名</el-dropdown-item>
                  </span>
                  <span>
                    <el-dropdown-item @click="deleteChapter(data)">删除</el-dropdown-item>
                  </span>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
  <chapter-form ref="chapterRef" @refresh="handleList" />
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { courseApi } from '@/api/course'
  import ChapterForm from './ChapterForm.vue'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    treeData: {
      type: Array,
      default: () => []
    },
    chapterId: {
      type: String,
      default: ''
    },
    courseId: {
      type: String,
      default: ''
    }
  })

  const chapterId = computed(() => {
    return props.chapterId
  })

  const treeRef = ref()
  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/chapter/Chapter.vue`);
    treeRef['value'].setCurrentKey(chapterId.value)
  })

  const emit = defineEmits(['node-click', 'refresh'])
  
  // 选择章节
  const handleClick = (item) => {
    emit('node-click', item)
  }

  const handleDrop = () => {
    const sortList = getTreeSort(props.treeData, 1)
    // courseApi.courseChapterSort(sortList).then((res) => {
    //   ElMessage.success(res)
    // })
    ElMessage.success('排序成功')
  }

  const getTreeSort = (list, sort) => {
    return list.map((el, index) => {
      if (el['sections'] && el['sections'].length > 0) {
        el.sections = getTreeSort(el['sections'], sort)
      }
      el.order = sort + index
      return {
        id: el.id,
        order: el.order,
        sections: el.sections
      }
    })
  }

  // 删除章节
  const deleteChapter = (item) => {
    // courseApi.courseChapterDelete(item).then((res) => {
    //   ElMessage.success(res)
    //   emit('refresh')
    // })
    ElMessage.success('删除成功')
    emit('refresh')
  }

  // 添加/修改章节
  const chapterRef = ref()
  const openFormChapter = (item, courseId) => {
    chapterRef.value.onOpen(item, courseId)
  }

  const handleList = () => {
    emit('refresh')
  }
</script>
<style lang="scss" scoped>
  .table-catalog {
    display: block;
    min-height: calc(100vh - 220px);
    width: 250px;
    margin-bottom: 52px;
    overflow: auto;
    border: 1px solid var(--color-border-base);

    .table-catalog-title {
      cursor: default;
      padding: 10px 20px;
    }

    .table-catalog-item {
      display: flex;
      align-items: center;
    }

    .table-catalog-name {
      position: relative;
      overflow: hidden;
    }

    .table-catalog-dropdown {
      display: none;
      right: 0;
      position: absolute;
      background-color: #fff;
      margin: 0 auto;
      padding: 0 10px;
    }
  }

  .active {
    background-color: var(--el-tree-node-hover-bg-color);
  }

  .el-tree-node__content:hover {
    .table-catalog-dropdown {
      display: block;
    }
  }

  .el-tree-node__content {
    height: 45px;
  }
</style>
