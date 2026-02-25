import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { setupBridge } from './core/bridge'
import { microAppManager } from './core/microAppManager'

import './assets/styles/main.scss'

const app = createApp(App)

// Pinia with persistence
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Setup bridge for cross-app communication
setupBridge()

// Mount app
app.mount('#app')

// Expose microAppManager globally for debugging
window.__ARTISAN_MICRO_APP_MANAGER__ = microAppManager

console.log('[Main App] Application started')
