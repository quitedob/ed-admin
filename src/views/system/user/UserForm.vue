<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? '修改' : '添加'" width="600px" center align-center :destroy-on-close="true" @close="onClose" id="user-form-dialog">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px" id="user-form">
      <el-form-item v-if="!formModel.id" label="登录账号" prop="mobile" id="mobile-form-item">
        <el-input v-model="formModel.mobile" class="form-group" id="mobile-input" />
      </el-form-item>
      <el-form-item v-if="!formModel.id" label="登录密码" prop="mobilePwd" id="password-form-item">
        <el-input v-model="formModel.mobilePwd" class="form-group" show-password id="password-input" />
      </el-form-item>
      <el-form-item label="用户昵称" prop="realName" id="nickname-form-item">
        <el-input v-model="formModel.realName" class="form-group" maxlength="50" show-word-limit id="nickname-input" />
      </el-form-item>
      <el-form-item label="备注" prop="remark" id="remark-form-item">
        <el-input v-model="formModel.remark" class="form-group" maxlength="500" show-word-limit type="textarea" id="remark-input" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer" id="user-form-footer">
        <el-button @click="onClose()" id="user-form-cancel-btn">取 消</el-button>
        <el-button type="primary" @click="onSubmit()" id="user-form-submit-btn">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
  import { systemApi } from '@/api/system'
  import { reactive, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { encrypt } from '@/utils/base.js'

  // 校验规则
  const formRef = ref()
  const rules = {
    mobile: [{ required: true, message: '不能为空', trigger: 'blur' }],
    mobilePwd: [{ required: true, message: '不能为空', trigger: 'blur' }],
    realName: [{ required: true, message: '不能为空', trigger: 'blur' }]
  }

  // 表单
  const loading = ref(false) // 加载进度状态
  const emit = defineEmits(['refresh'])
  const formDefault = {
    id: undefined,
    realName: undefined,
    remark: undefined,
    sort: 1
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
        await systemApi.sysUserEdit(formModel)
        ElMessage.success('修改成功')
      } else {
        formModel.mobilePwdEncrypt = encrypt(formModel.mobilePwd)
        delete formModel.mobilePwd
        await systemApi.sysUserSave(formModel)
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
    if (item) {
      Object.assign(formModel, item)
    }
    visible.value = true
  }
  defineExpose({ onOpen })
  const onClose = () => {
    visible.value = false
    Object.assign(formModel, formDefault)
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/system/user/UserForm.vue`);
  });

</script>
