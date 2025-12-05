<template>
  <el-dialog
    v-model="visible"
    title="查看授权内容"
    width="700px"
    @close="handleClose"
  >
    <div v-if="employee" class="authorization-view">
      <p class="employee-info">员工：<strong>{{ employee.name }}</strong></p>

      <el-tabs>
        <el-tab-pane label="已授权课程">
          <el-table :data="authorizedCourses" stripe style="width: 100%">
            <el-table-column prop="title" label="课程名" />
            <el-table-column prop="students" label="学生数" width="100" align="center" />
            <el-table-column prop="authorizedAt" label="授权时间" width="150" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已授权作业">
          <el-table :data="authorizedHomeworks" stripe style="width: 100%">
            <el-table-column prop="title" label="作业名" />
            <el-table-column prop="class" label="班级" width="120" />
            <el-table-column prop="authorizedAt" label="授权时间" width="150" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已授权考试">
          <el-table :data="authorizedExams" stripe style="width: 100%">
            <el-table-column prop="title" label="考试名" />
            <el-table-column prop="class" label="班级" width="120" />
            <el-table-column prop="authorizedAt" label="授权时间" width="150" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  employee: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 模拟授权数据
const authorizedCourses = ref([
  { id: 1, title: 'Vue.js基础', students: 30, authorizedAt: '2024-01-15' },
  { id: 2, title: 'React进阶', students: 25, authorizedAt: '2024-01-20' }
])

const authorizedHomeworks = ref([
  { id: 1, title: '第一章练习', class: '一年级一班', authorizedAt: '2024-01-15' },
  { id: 2, title: '第二章练习', class: '一年级一班', authorizedAt: '2024-01-20' }
])

const authorizedExams = ref([
  { id: 1, title: '期中考试', class: '一年级一班', authorizedAt: '2024-01-15' },
  { id: 2, title: '期末考试', class: '一年级一班', authorizedAt: '2024-02-01' }
])

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.authorization-view {
  padding: 20px 0;
}

.employee-info {
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--color-text-regular);
}
</style>
