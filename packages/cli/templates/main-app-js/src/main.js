import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
// 导入 grid-layout-plus 组件（支持 Vue 3）
import { GridLayout, GridItem } from 'grid-layout-plus'

import App from './App.vue'
import router from './router'
import { useAppStore } from '@/stores/app'
import { setupBridge } from './core/bridge'
import { microAppManager } from './core/microAppManager'
import { initSubAppRequest } from './core/subAppRequestProvider'
import { mockEngine } from '@/utils/mockEngine'
import { initMock, mockEngine as mockEngineInstance } from '@/mock/init'

import './assets/styles/main.scss'

const app = createApp(App)

// Pinia with persistence
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

// 初始化微应用配置（在路由之前）
async function bootstrap() {
  // 生产环境安全检查
  if (import.meta.env.PROD && import.meta.env.VITE_MOCK_MODE === 'true') {
    throw new Error('[Mock] FATAL: Mock mode is enabled in production!')
  }
  
  // 初始化 Mock（必须在 appStore.initialize() 之前）
  await initMock()
  
  // 初始化 App Store（会加载 microApps）
  const appStore = useAppStore()
  await appStore.initialize()
  
  app.use(router)
app.use(ElementPlus)

// 全局注册 grid-layout-plus 组件
app.component('grid-layout', GridLayout)
app.component('grid-item', GridItem)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Setup bridge for cross-app communication
setupBridge()

// 初始化子应用 Request 提供者（在微应用加载之前）
initSubAppRequest()

// Mount app
app.mount('#app')

// Expose microAppManager globally for debugging
window.__ARTISAN_MICRO_APP_MANAGER__ = microAppManager
}

bootstrap()
