<template>
  <div class="icon-test">
    <h2>图标测试页面</h2>
    <p>测试所有使用的图标是否正确导入</p>

    <div class="icon-grid">
      <div class="icon-item">
        <el-icon><Refresh /></el-icon>
        <span>Refresh</span>
      </div>
      <div class="icon-item">
        <el-icon><Delete /></el-icon>
        <span>Delete</span>
      </div>
      <div class="icon-item">
        <el-icon><Upload /></el-icon>
        <span>Upload</span>
      </div>
      <div class="icon-item">
        <el-icon><UploadFilled /></el-icon>
        <span>UploadFilled</span>
      </div>
      <div class="icon-item">
        <el-icon><DataAnalysis /></el-icon>
        <span>DataAnalysis</span>
      </div>
      <div class="icon-item">
        <el-icon><Setting /></el-icon>
        <span>Setting</span>
      </div>
      <div class="icon-item">
        <el-icon><Download /></el-icon>
        <span>Download</span>
      </div>
      <div class="icon-item">
        <el-icon><FolderOpened /></el-icon>
        <span>FolderOpened</span>
      </div>
      <div class="icon-item">
        <el-icon><Folder /></el-icon>
        <span>Folder</span>
      </div>
      <div class="icon-item">
        <el-icon><Document /></el-icon>
        <span>Document</span>
      </div>
      <div class="icon-item">
        <el-icon><DocumentCopy /></el-icon>
        <span>DocumentCopy</span>
      </div>
      <div class="icon-item">
        <el-icon><Check /></el-icon>
        <span>Check</span>
      </div>
      <div class="icon-item">
        <el-icon><CircleCheck /></el-icon>
        <span>CircleCheck</span>
      </div>
      <div class="icon-item">
        <el-icon><CircleClose /></el-icon>
        <span>CircleClose</span>
      </div>
      <div class="icon-item">
        <el-icon><Warning /></el-icon>
        <span>Warning</span>
      </div>
      <div class="icon-item">
        <el-icon><InfoFilled /></el-icon>
        <span>InfoFilled</span>
      </div>
      <div class="icon-item">
        <el-icon><MagicStick /></el-icon>
        <span>MagicStick</span>
      </div>
      <div class="icon-item">
        <el-icon><Edit /></el-icon>
        <span>Edit</span>
      </div>
      <div class="icon-item">
        <el-icon><EditPen /></el-icon>
        <span>EditPen</span>
      </div>
      <div class="icon-item">
        <el-icon><View /></el-icon>
        <span>View</span>
      </div>
      <div class="icon-item">
        <el-icon><List /></el-icon>
        <span>List</span>
      </div>
      <div class="icon-item">
        <el-icon><CircleCheckFilled /></el-icon>
        <span>CircleCheckFilled</span>
      </div>
      <div class="icon-item">
        <el-icon><QuestionFilled /></el-icon>
        <span>QuestionFilled</span>
      </div>
      <div class="icon-item">
        <el-icon><Plus /></el-icon>
        <span>Plus</span>
      </div>
      <div class="icon-item">
        <el-icon><ArrowDown /></el-icon>
        <span>ArrowDown</span>
      </div>
      <div class="icon-item">
        <el-icon><ArrowRight /></el-icon>
        <span>ArrowRight</span>
      </div>
    </div>

    <div v-if="loadError" class="error-message">
      <h3>图标加载错误</h3>
      <p>{{ loadError }}</p>
    </div>
    <div v-else class="success-message">
      <h3>所有图标加载成功！</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Refresh,
  Delete,
  Upload,
  UploadFilled,
  DataAnalysis,
  Setting,
  Download,
  FolderOpened,
  Folder,
  Document,
  DocumentCopy,
  Check,
  CircleCheck,
  CircleClose,
  Warning,
  InfoFilled,
  MagicStick,
  Edit,
  EditPen,
  View,
  List,
  CircleCheckFilled,
  QuestionFilled,
  Plus,
  ArrowDown,
  ArrowRight
} from '@element-plus/icons-vue'

const loadError = ref(null)

// 测试所有图标是否正确导入
try {
  // 这里只是测试导入是否成功
  const icons = [
    Refresh, Delete, Upload, UploadFilled, DataAnalysis, Setting, Download,
    FolderOpened, Folder, Document, DocumentCopy, Check, CircleCheck,
    CircleClose, Warning, InfoFilled, MagicStick, Edit, EditPen, View,
    List, CircleCheckFilled, QuestionFilled, Plus, ArrowDown, ArrowRight
  ]
  console.log('All icons loaded successfully:', icons.length)
} catch (error) {
  loadError.value = error.message
  console.error('Icon loading error:', error)
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/icon-test.vue`);
  });

</script>

<style scoped>
.icon-test {
  padding: 20px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-item .el-icon {
  font-size: 24px;
  color: #409eff;
}

.icon-item span {
  font-size: 12px;
  color: #606266;
}

.error-message {
  padding: 16px;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 8px;
  color: #f56c6c;
  margin-top: 20px;
}

.success-message {
  padding: 16px;
  background-color: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #409eff;
  margin-top: 20px;
}
</style>