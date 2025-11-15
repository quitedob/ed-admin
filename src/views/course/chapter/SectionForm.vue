<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? '修改小节' : '添加小节'" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item class="form-group" label="小节标题" prop="title">
        <el-input v-model="formModel.title" maxlength="50" show-word-limit />
      </el-form-item>
      <el-form-item class="form-group" label="小节编号" prop="number">
        <el-input v-model="formModel.number" placeholder="例如：1.1" />
      </el-form-item>
      <el-form-item class="form-group" label="内容类型" prop="contentType">
        <el-select v-model="formModel.contentType" placeholder="请选择内容类型">
          <el-option label="视频" value="video"></el-option>
          <el-option label="音频" value="audio"></el-option>
          <el-option label="文档" value="document"></el-option>
          <el-option label="图片" value="image"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="form-group" label="内容URL" prop="contentUrl">
        <el-input v-model="formModel.contentUrl" placeholder="请输入内容URL" />
      </el-form-item>
      <el-form-item class="form-group" label="时长(秒)" prop="duration">
        <el-input-number v-model="formModel.duration" :min="0" />
      </el-form-item>
      <el-form-item class="form-group" label="描述" prop="description">
        <el-input v-model="formModel.description" type="textarea" :rows="3" placeholder="请输入小节描述" />
      </el-form-item>
      <el-form-item class="form-group" label="练习题数量" prop="practiceQuestions">
        <el-input-number v-model="formModel.practiceQuestions" :min="0" />
      </el-form-item>
      <el-form-item class="form-group" label="练习是否可选" prop="practiceOptional">
        <el-switch v-model="formModel.practiceOptional" />
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
    contentType: [{ required: true, message: '不能为空', trigger: 'change' }],
    contentUrl: [{ required: true, message: '不能为空', trigger: 'blur' }]
  }

  // 表单
  const loading = ref(false) // 加载进度状态
  const emit = defineEmits(['refresh'])
  const formDefault = {
    id: undefined,
    title: undefined,
    number: undefined,
    description: undefined,
    contentType: 'video',
    contentUrl: undefined,
    duration: 0,
    order: 1,
    resources: {
      materials: [],
      attachments: []
    },
    practice: {
      practiceId: undefined,
      questions: 0,
      optional: false
    }
  }
  const formModel = reactive({ ...formDefault })
  
  // 为了方便表单绑定，添加两个额外的属性
  formModel.practiceQuestions = 0
  formModel.practiceOptional = false
  
  const onSubmit = async () => {
    // 校验
    const valid = await formRef.value.validate()
    if (!valid) return

    if (loading.value === true) {
      ElMessage.warning('正在处理···')
      return
    }
    
    // 更新练习信息
    formModel.practice.questions = formModel.practiceQuestions
    formModel.practice.optional = formModel.practiceOptional
    
    loading.value = true
    try {
      if (formModel.id) {
        // await courseApi.courseSectionEdit(formModel)
        ElMessage.success('修改成功')
      } else {
        // await courseApi.courseSectionSave(formModel)
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
  const onOpen = (item) => {
    visible.value = true
    if (item) {
      // 编辑模式，填充表单数据
      Object.assign(formModel, item)
      
      // 设置练习相关字段
      if (item.practice) {
        formModel.practiceQuestions = item.practice.questions || 0
        formModel.practiceOptional = item.practice.optional || false
      }
    } else {
      // 新增模式，重置表单
      Object.assign(formModel, formDefault)
      formModel.practiceQuestions = 0
      formModel.practiceOptional = false
    }
  }
  
  const onClose = () => {
    visible.value = false
  }

  // 暴露方法给父组件
  defineExpose({
    onOpen
  })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/chapter/SectionForm.vue`);
  });

</script>

<style lang="scss" scoped>
  .form-group {
    margin-bottom: 20px;
  }
</style>
