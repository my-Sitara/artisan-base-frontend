import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { microApps, getMicroApp, updateMicroAppConfig } from '@/config/microApps'

export const useAppStore = defineStore('app', () => {
  // 当前激活的应用ID
  const activeAppId = ref(null)
  
  // 侧边栏折叠状态
  const sidebarCollapsed = ref(false)
  
  // 全局 loading 状态
  const loading = ref(false)
  
  // 微应用列表（响应式）
  const apps = ref([...microApps])

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
    microApps.push(appConfig)
  }

  function removeApp(appId) {
    const index = apps.value.findIndex(app => app.id === appId)
    if (index !== -1) {
      apps.value.splice(index, 1)
    }
    const configIndex = microApps.findIndex(app => app.id === appId)
    if (configIndex !== -1) {
      microApps.splice(configIndex, 1)
    }
  }

  function refreshApps() {
    apps.value = [...microApps]
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
    refreshApps
  }
}, {
  persist: {
    key: 'artisan-app',
    storage: localStorage,
    paths: ['activeAppId', 'sidebarCollapsed']
  }
})
