<template>
  <el-dialog
    title="从题库导入"
    v-model="visible"
    width="800px"
    append-to-body
  >
    <div class="import-bank-content">
      <p>从题库导入功能 - 支持按类型、难度、分类等条件筛选题目并导入到作业中</p>
      <p>此功能将允许您：</p>
      <ul>
        <li>按题型筛选题目（单选题、多选题、填空题、应用题、OJ题）</li>
        <li>按难度筛选题目（简单、中等、困难）</li>
        <li>按分类和标签筛选题目</li>
        <li>预览题目内容</li>
        <li>批量选择并导入题目</li>
      </ul>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleImport">确定导入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'import'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  visible.value = false
}

const handleImport = () => {
  // 模拟导入数据
  const importData = [
    { id: 'q_demo_1', title: '示例题目1', type: 'single' },
    { id: 'q_demo_2', title: '示例题目2', type: 'multiple' }
  ]
  emit('import', importData)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/ImportFromBankDialog.vue`);
  });

</script>

<style scoped>
.import-bank-content {
  padding: 20px 0;
  line-height: 1.6;
}

.import-bank-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.import-bank-content li {
  margin: 5px 0;
}
</style>