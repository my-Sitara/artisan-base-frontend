import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  // 标签页列表
  const tabs = ref([
    {
      name: 'Home',
      path: '/',
      title: '首页',
      closable: false
    }
  ])
  
  // 当前激活的标签
  const activeTab = ref('/')
  
  // 缓存的视图列表
  const cachedViews = ref(['Home'])

  // Computed
  const tabCount = computed(() => tabs.value.length)

  // Actions
  function addTab(tab) {
    const exists = tabs.value.find(t => t.path === tab.path)
    if (!exists) {
      tabs.value.push({
        ...tab,
        closable: tab.closable !== false
      })
      
      // 如果需要缓存
      if (tab.keepAlive && tab.name) {
        addCachedView(tab.name)
      }
    }
    activeTab.value = tab.path
  }

  function removeTab(path) {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index === -1) return

    const tab = tabs.value[index]
    
    // 不能关闭固定标签
    if (!tab.closable) return

    tabs.value.splice(index, 1)
    
    // 移除缓存
    if (tab.name) {
      removeCachedView(tab.name)
    }

    // 如果关闭的是当前激活的标签，切换到前一个
    if (activeTab.value === path) {
      const newIndex = Math.min(index, tabs.value.length - 1)
      activeTab.value = tabs.value[newIndex]?.path || '/'
    }
  }

  function removeOtherTabs(path) {
    tabs.value = tabs.value.filter(t => !t.closable || t.path === path)
    cachedViews.value = cachedViews.value.filter(name => {
      const tab = tabs.value.find(t => t.name === name)
      return tab && !tab.closable
    })
    
    if (!tabs.value.find(t => t.path === activeTab.value)) {
      activeTab.value = path
    }
  }

  function removeAllTabs() {
    tabs.value = tabs.value.filter(t => !t.closable)
    cachedViews.value = []
    activeTab.value = tabs.value[0]?.path || '/'
  }

  function setActiveTab(path) {
    activeTab.value = path
  }

  function addCachedView(name) {
    if (!cachedViews.value.includes(name)) {
      cachedViews.value.push(name)
    }
  }

  function removeCachedView(name) {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  function refreshTab(path) {
    const tab = tabs.value.find(t => t.path === path)
    if (tab && tab.name) {
      // 临时移除缓存以触发刷新
      removeCachedView(tab.name)
      setTimeout(() => {
        addCachedView(tab.name)
      }, 100)
    }
  }

  function updateTabTitle(path, title) {
    const tab = tabs.value.find(t => t.path === path)
    if (tab) {
      tab.title = title
    }
  }

  return {
    // State
    tabs,
    activeTab,
    cachedViews,
    
    // Computed
    tabCount,
    
    // Actions
    addTab,
    removeTab,
    removeOtherTabs,
    removeAllTabs,
    setActiveTab,
    addCachedView,
    removeCachedView,
    refreshTab,
    updateTabTitle
  }
}, {
  persist: {
    key: 'artisan-tabs',
    storage: localStorage,
    paths: ['tabs', 'activeTab']
  }
})
