import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/index.scss'
import App from '@/App.vue'
import router, { createNewRouter } from '@/router/index.js'
import store from '@/store/index.js'
// 移除不再需要的导入
import { useUserStore } from '@/store/modules/user.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'virtual:svg-icons-register'
import Icon from '@/components/Icon/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import { hasPermission } from '@/utils/permission.js'

// 初始化
setupInit()

async function setupInit() {
  // 先初始化app和store
  const app = createApp(App)
  app.use(router)
  app.use(store)
  app.use(ElementPlus)

  // 注册图标组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  // 注册图标组件
  app.component('Icon', Icon)
  // 注册分页组件
  app.component('Pagination', Pagination)

  // 注册自定义指令（权限使用）
  app.directive('permission', (el, binding) => {
    if (!hasPermission(binding.value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  })

  // 统一使用模拟数据，避免调用真实API导致500错误
  useUserStore().mockLogin()
  // 创建模拟路由
  createNewRouter(useUserStore().routerList)
  // 挂载应用
  mountApp(app)
}

function mountApp(app) {
  // 全局配置：Dialog遮罩层点击不关闭
  app._context.components.ElDialog.props.closeOnClickModal.default = false

  // 挂载
  app.mount('#app')
}

