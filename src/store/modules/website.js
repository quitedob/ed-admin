import { defineStore } from 'pinia'
import { loginApi } from '@/api/login.js'

export const useWebsiteStore = defineStore({
  id: 'website',
  state: () => ({
    info: {}
  }),
  getters: {
    getInfo(state) {
      return state.info
    }
  },
  actions: {
    // 初始化（移除验证：使用模拟数据）
    init() {
      // 移除验证：设置模拟网站信息
      this.info = {
        websiteTitle: '领课教育系统',
        websiteCopyright: '© 2025 领课教育系统',
        websiteIcp: '粤ICP备12345678号',
        websitePrn: '粤公网安备 440000000000号',
        websitePrnNo: '440000000000'
      }

      // 原始逻辑（保留以备恢复）
      // loginApi.getWebsite().then((res) => {
      //   this.info = res
      // })
    }
  }
})
