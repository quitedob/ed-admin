<template>
  <el-cascader :options="options" :props="props" style="width: 100%" @change="handleChange" />
</template>
<script setup>
  import { onMounted, ref } from 'vue'
  import { courseApi } from '@/api/course'

  const emit = defineEmits(['update:modelValue'])
  const handleChange = (item) => {
    // 获取最后一个分类ID
    emit('update:modelValue', item.pop())
  }

  const options = ref([])
  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Cascader/Course/index.vue`);
    // 移除验证：使用模拟数据
    options.value = [
      {
        id: 1,
        categoryName: '前端开发',
        childrenList: [
          { id: 11, categoryName: 'Vue.js', childrenList: [] },
          { id: 12, categoryName: 'React', childrenList: [] }
        ]
      },
      {
        id: 2,
        categoryName: '后端开发',
        childrenList: [
          { id: 21, categoryName: 'Node.js', childrenList: [] },
          { id: 22, categoryName: 'Java', childrenList: [] }
        ]
      }
    ]

    // 原始逻辑（保留以备恢复）
    // courseApi.categoryList({}).then((res) => {
    //   options.value = res
    // })
  })

  const props = {
    value: 'id',
    label: 'categoryName',
    children: 'childrenList',
    expandTrigger: 'hover'
  }
</script>
