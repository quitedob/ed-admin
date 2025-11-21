<template>
  <el-dialog id="preview-dialog" :append-to-body="true" :model-value="visible" :title="props.resourceName" width="600px" center align-center :destroy-on-close="true" @close="onClose">
    <div id="media-player" class="player"></div>
    <template #footer>
      <span id="preview-dialog-footer" class="dialog-footer">
        <el-button id="close-preview-btn" @click="onClose()">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { courseApi } from '@/api/course'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    resourceId: {
      type: String,
      default: ''
    },
    resourceName: {
      type: String,
      default: '预览'
    },
    visible: {
      type: Boolean,
      default: false
    }
  })
  const visible = ref(props.visible)

  onMounted(async () => {
    // 移除验证：使用模拟数据
    const mockRes = {
      vodPlatform: 1,
      vodPlayConfig: JSON.stringify({
        vid: 'mock-video-id',
        playerId: 'mock-player-id'
      })
    }
    const params = JSON.parse(mockRes.vodPlayConfig)
    if (mockRes.vodPlatform === 1) {
      console.log(params)
      // 领课云
      simplePlay(params)
    } else if (mockRes.vodPlatform === 2) {
      // 保利威
      polyvPlay(params)
    } else {
      // 其他
      ElMessage.warning('暂不支持该类型的播放')
    }

    // 原始逻辑（保留以备恢复）
    // const res = await courseApi.resourceLibraryPreview({ id: props.resourceId })
    // const params = JSON.parse(res.vodPlayConfig)
    // if (res.vodPlatform === 1) {
    //   console.log(params)
    //   // 领课云
    //   simplePlay(params)
    // } else if (res.vodPlatform === 2) {
    //   // 保利威
    //   polyvPlay(params)
    // } else {
    //   // 其他
    //   ElMessage.warning('暂不支持该类型的播放')
    // }
  })

  function simplePlay(params) {
    window.polyvPlayer({
      wrap: '#media-player',
      autoplay: true,
      hideSwitchPlayer: true,
      showLine: 'off',
      height: 350,
      url: params.hdUrl
    })
  }

  const polyvPlay = (params) => {
    window.polyvPlayer({
      wrap: '#media-player',
      autoplay: true,
      hideSwitchPlayer: true,
      showLine: 'off',
      history_video_duration: 1,
      height: 350,
      playsafe: params.token,
      ...params
    })
  }

  const emit = defineEmits(['close'])
  const onClose = () => {
    visible.value = false
    emit('close')
  }
</script>
<style lang="scss" scoped></style>
