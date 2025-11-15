<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? '修改章节' : '添加章节'" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item class="form-group" label="章节标题" prop="title">
        <el-input v-model="formModel.title" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item class="form-group" label="章节编号" prop="number">
        <el-input-number v-model="formModel.number" :min="1" />
      </el-form-item>
      <el-form-item class="form-group" label="章节描述" prop="description">
        <el-input v-model="formModel.description" type="textarea" :rows="3" placeholder="请输入章节描述" />
      </el-form-item>
      <el-form-item class="form-group" label="排序" prop="order">
        <el-input-number v-model="formModel.order" :min="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">取消</el-button>
        <el-button type="primary" @click="onSubmit()">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ElMessage } from 'element-plus'
  import { reactive, ref, onMounted } from 'vue'
  import { courseApi } from '@/api/course'

  // 校验规则
  const formRef = ref()
  const rules = {
    title: [{ required: true, message: '不能为空', trigger: 'blur' }],
    number: [{ required: true, message: '不能为空', trigger: 'blur' }],
    order: [{ required: true, message: '不能为空', trigger: 'blur' }]
  }

  // 表单
  const loading = ref(false) // 加载进度状态
  const emit = defineEmits(['refresh'])
  const formDefault = {
    id: undefined,
    title: undefined,
    number: 1,
    description: undefined,
    order: 1,
    sections: []
  }
  const formModel = reactive({ ...formDefault })
  
  const onSubmit = async () => {
    // 校验
    const valid = await formRef.value.validate()
    if (!valid) return

    if (loading.value === true) {
      ElMessage.warning('正在处理···')
      return
    }
    loading.value = true
    try {
      if (formModel.id) {
        // await courseApi.courseChapterEdit(formModel)
        ElMessage.success('修改成功')
      } else {
        // await courseApi.courseChapterSave(formModel)
        ElMessage.success('添加成功')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  // 打开和关闭
  const visible = ref(false) // 弹窗显示状态
  const onOpen = (item, courseId) => {
    if (item) {
      // 编辑模式，填充表单数据
      Object.assign(formModel, item)
    } else {
      // 新增模式，重置表单
      Object.assign(formModel, formDefault)
    }
    
    if (courseId) {
      formModel.courseId = courseId
    }
    
    visible.value = true
  }
  
  defineExpose({ onOpen })
  
  const onClose = () => {
    visible.value = false
    Object.assign(formModel, formDefault)
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/chapter/ChapterForm.vue`);
  });

</script>

<style lang="scss" scoped>
  .form-group {
    margin-bottom: 20px;
  }
</style>
