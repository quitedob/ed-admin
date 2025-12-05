<template>
  <el-dialog
    title="导入作业模板"
    v-model="visible"
    width="600px"
    append-to-body
    id="import-assignment-dialog"
  >
    <div class="import-assignment-content" id="import-content">
      <p>导入作业模板功能 - 支持导入完整的作业模板，包含所有题目和设置</p>
      <p>支持格式：</p>
      <ul id="supported-formats">
        <li>JSON格式作业模板</li>
        <li>Excel格式题目批量导入</li>
        <li>从其他课程复制作业</li>
      </ul>
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        id="file-upload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text" id="upload-text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip" id="upload-tip">
            支持 .json/.xlsx/.xls 格式文件
          </div>
        </template>
      </el-upload>
    </div>

    <template #footer>
      <div class="dialog-footer" id="dialog-footer">
        <el-button @click="handleClose" id="cancel-button">取消</el-button>
        <el-button type="primary" @click="handleImport" id="import-button">导入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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

const uploadedFile = ref(null)

const handleFileChange = (file) => {
  uploadedFile.value = file
}

const handleClose = () => {
  visible.value = false
  uploadedFile.value = null
}

const handleImport = () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  // 模拟导入数据
  const assignmentData = {
    title: '导入的作业模板',
    description: '从文件导入的作业',
    type: 'exercise',
    difficulty: 'medium',
    questions: [
      { id: 'imported_1', title: '导入的题目1', type: 'single' },
      { id: 'imported_2', title: '导入的题目2', type: 'multiple' }
    ]
  }

  emit('import', assignmentData)
  handleClose()
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/assignments/components/ImportAssignmentDialog.vue`);
  });

</script>

<style scoped>
.import-assignment-content {
  padding: 20px 0;
  line-height: 1.6;
}

.import-assignment-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.import-assignment-content li {
  margin: 5px 0;
}

.upload-demo {
  margin-top: 20px;
}
</style>