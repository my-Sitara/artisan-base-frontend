import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrentMicroApps, getMicroApp, updateMicroAppConfig, loadMicroApps, initMicroApps } from '@/config/microApps'

export const useAppStore = defineStore('app', () => {
  // 当前激活的应用 ID
  const activeAppId = ref(null)
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)
  
  // 全局 loading 状态
  const loading = ref(false)
  
  // 微应用列表（响应式）- 初始使用空数组
  const apps = ref([])

  // 加载微应用配置（支持 mock 和 api 两种模式）
  async function loadMicroAppConfigs(options = {}) {
    loading.value = true
    try {
      const loadedApps = await loadMicroApps(options)
      apps.value = [...loadedApps]
      console.log('[AppStore] Micro apps loaded:', loadedApps.length, 'apps from', options.source || 'mock')
    } catch (error) {
      console.error('[AppStore] Failed to load micro apps:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 初始化微应用配置（根据环境变量自动选择数据源）
  async function initialize(apiUrl) {
    loading.value = true
    try {
      const loadedApps = await initMicroApps(apiUrl)
      apps.value = [...loadedApps]
      console.log('[AppStore] Micro apps initialized:', loadedApps.length, 'apps')
    } catch (error) {
      console.error('[AppStore] Failed to initialize micro apps:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const activeApp = computed(() => {
    return activeAppId.value ? getMicroApp(activeAppId.value) : null
  })

  const onlineApps = computed(() => {
    return apps.value.filter(app => app.status === 'online')
  })

  const offlineApps = computed(() => {
    return apps.value.filter(app => app.status === 'offline')
  })

  // Actions
  function setActiveApp(appId) {
    activeAppId.value = appId
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
  }

  function setLoading(status) {
    loading.value = status
  }

  function updateApp(appId, config) {
    const index = apps.value.findIndex(app => app.id === appId)
    if (index !== -1) {
      apps.value[index] = { ...apps.value[index], ...config }
      updateMicroAppConfig(appId, config)
    }
  }

  function setAppStatus(appId, status) {
    updateApp(appId, { status })
  }

  function addApp(appConfig) {
    apps.value.push(appConfig)
  }

  function removeApp(appId) {
    const index = apps.value.findIndex(app => app.id === appId)
    if (index !== -1) {
      apps.value.splice(index, 1)
    }
  }

  function deleteApp(appId) {
    return removeApp(appId)
  }

  function refreshApps() {
    // 重新从配置模块获取最新的应用列表
    apps.value = [...getCurrentMicroApps()]
  }

  return {
    // State
    activeAppId,
    sidebarCollapsed,
    loading,
    apps,
    
    // Computed
    activeApp,
    onlineApps,
    offlineApps,
    
    // Actions
    setActiveApp,
    toggleSidebar,
    setSidebarCollapsed,
    setLoading,
    updateApp,
    setAppStatus,
    addApp,
    removeApp,
    deleteApp,
    refreshApps,
    loadMicroAppConfigs,
    initialize
  }
}, {
  persist: {
    key: 'artisan-app',
    storage: localStorage,
    paths: ['activeAppId', 'sidebarCollapsed']
  }
})
