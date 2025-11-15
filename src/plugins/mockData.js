/**
 * 模拟数据插件
 * 在应用启动时自动初始化模拟数据
 */

import { useMockStore } from '@/stores/mockStore'

export default {
  install(app, options = {}) {
    const {
      autoInit = true,  // 是否自动初始化
      debug = false     // 是否开启调试模式
    } = options

    if (debug) {
      console.log('🔧 模拟数据插件已安装')
    }

    // 自动初始化
    if (autoInit) {
      const mockStore = useMockStore()
      
      // 延迟初始化，确保 Pinia 已完全加载
      setTimeout(() => {
        try {
          mockStore.initialize()
          
          if (debug) {
            console.log('📊 模拟数据统计:', mockStore.statistics)
          }
        } catch (error) {
          console.error('❌ 模拟数据初始化失败:', error)
        }
      }, 0)
    }

    // 添加全局属性（可选）
    app.config.globalProperties.$mockStore = useMockStore()
  }
}
