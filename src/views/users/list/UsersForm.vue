<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? '修改' : '添加'" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item class="form-group" label="用户昵称" prop="nickname">
        <el-input v-model="formModel.nickname" maxlength="20" show-word-limit></el-input>
      </el-form-item>
      <el-form-item label="用户性别" prop="userSex">
        <enum-radio v-model="formModel.userSex" :enum-name="'UserSexEnum'"></enum-radio>
      </el-form-item>
      <el-form-item class="form-group" label="出生日期" prop="userAge">
        <el-date-picker v-model="formModel.userAge" value-format="YYYY-MM-DD" format="YYYY-MM-DD" type="date" placeholder="请选择出生日期" />
      </el-form-item>
      <el-form-item label="学生状态" prop="status">
        <el-select v-model="formModel.status" placeholder="请选择学生状态" style="width: 100%">
          <el-option label="新生" value="new">
            <span style="color: #606266">新生</span>
          </el-option>
          <el-option label="在读" value="studying">
            <span style="color: #67c23a; font-weight: 500">在读</span>
          </el-option>
          <el-option label="停课" value="suspended">
            <span style="color: #e6a23c; font-weight: 500">停课</span>
          </el-option>
          <el-option label="封存" value="archived">
            <span style="color: #909399">封存</span>
          </el-option>
          <el-option label="结课" value="finished">
            <span style="color: #e6a23c; font-weight: 500">结课</span>
          </el-option>
          <el-option label="退费" value="refunded">
            <span style="color: #f56c6c; font-weight: 500">退费</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账号状态" prop="isDisabled">
        <el-switch
          v-model="formModel.isDisabled"
          :active-value="false"
          :inactive-value="true"
          active-text="启用"
          inactive-text="禁用"
        />
        <span style="margin-left: 12px; font-size: 12px; color: #909399">
          禁用后学生将无法登录系统
        </span>
      </el-form-item>
      <el-form-item class="form-group" label="备注" prop="remark">
        <el-input v-model="formModel.remark" maxlength="255" type="textarea" show-word-limit></el-input>
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
  import { ref, onMounted } from 'vue'
  import { usersApi } from '@/api/users'
  import EnumRadio from '@/components/Enum/Radio/index.vue'

  // 打开和关闭
  const onOpen = (item) => {
    if (item) {
      Object.assign(formModel.value, item)
    }
    visible.value = true
  }
  defineExpose({ onOpen })
  const onClose = () => {
    visible.value = false
  }

  // 表单
  const formModel = ref({
    id: undefined,
    sort: 1,
    status: 'new',
    isDisabled: false
  })
  const onSubmit = async () => {
    // 校验
    const valid = await formRef.value.validate()
    if (!valid) return
    if (loading.value === true) {
      ElMessage.warning('正在处理...')
      return
    }

    loading.value = true
    try {
      if (formModel.value.id) {
        await usersApi.usersEdit(formModel.value)
        ElMessage.success('修改成功')
      } else {
        ElMessage.warning('不支持后台添加，请在门户注册')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  // 规则
  const formRef = ref()
  const rules = {
    nickname: [{ required: true, message: '不能为空', trigger: 'blur' }]
  }

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const loading = ref(false)

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/users/list/UsersForm.vue`);
  });

</script>
