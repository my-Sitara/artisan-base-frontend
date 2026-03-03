<template>
  <el-config-provider :locale="zhCn">
    <component :is="currentLayout">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </component>
  </el-config-provider>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { useAppStore } from '@/stores/app'
import { useTabsStore } from '@/stores/tabs'
import { getMicroApp } from '@/config/microApps'
import { layoutManager } from '@/core/layoutManager'

import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import FullLayout from '@/components/layout/FullLayout.vue'

import EmbeddedLayout from '@/components/layout/EmbeddedLayout.vue'
import BlankLayout from '@/components/layout/BlankLayout.vue'

const route = useRoute()
const appStore = useAppStore()
const tabsStore = useTabsStore()

const layoutMap = {
  default: DefaultLayout,
  full: FullLayout,
  embedded: EmbeddedLayout,
  blank: BlankLayout
}

const currentLayout = computed(() => {
  try {
    // 优先使用路由 meta 中的布局配置
    let layoutType = route.meta?.layout
    
    // 如果路由是子应用路由，则使用微应用配置中的布局类型
    const appIdFromMeta = route.meta?.appId
    const appIdFromParams = route.params.appId
    
    // 优先使用 meta 中的 appId，如果没有则使用 params 中的 appId
    const appId = appIdFromMeta || appIdFromParams
    
    if (appId) {
      const appConfig = getMicroApp(appId)
      
      if (appConfig && appConfig.layoutType) {
        layoutType = appConfig.layoutType
            
        // 应用微应用的布局选项
        try {
          layoutManager.setLayoutFromMicroApp(appConfig)
        } catch (error) {
          console.error('[App.vue] Error setting layout from micro app config:', error)
        }
      } else {
        // 如果找不到微应用配置，回退到默认布局
        layoutType = layoutType || 'default'
      }
    }
    
    // 如果没有指定布局类型，则使用默认布局
    layoutType = layoutType || 'default'
    
    // 确保布局类型存在于映射中，否则使用默认布局
    const layoutComponent = layoutMap[layoutType]
    if (!layoutComponent) {
      console.warn(`[App.vue] Unknown layout type: ${layoutType}, fallback to default layout`)
      return DefaultLayout
    }
    
    return layoutComponent
  } catch (error) {
    console.error('[App.vue] Error computing layout:', error)
    // 发生错误时，返回默认布局
    return DefaultLayout
  }
})

const cachedViews = computed(() => tabsStore.cachedViews)

// Watch route changes
watch(
  () => route.path,
  (path) => {
    if (route.meta?.title) {
      document.title = `${route.meta.title} - Artisan 微前端平台`
    }
  },
  { immediate: true }
)

// Watch for layout changes when route changes
watch(
  () => [route.path, route.params.appId, route.meta?.appId],
  ([newPath, newAppId, newMetaAppId], [oldPath, oldAppId, oldMetaAppId] = []) => {
    try {
      // 检查是否从子应用切换到主应用页面
      const wasInSubApp = oldAppId || oldMetaAppId
      const isInSubApp = newAppId || newMetaAppId
      
      // 如果从子应用返回主应用页面，重置布局为默认配置
      if (wasInSubApp && !isInSubApp) {
        layoutManager.reset()
        return
      }
      
      // 当进入子应用时，应用微应用的布局配置
      const appId = newMetaAppId || newAppId
      if (appId) {
        const appConfig = getMicroApp(appId)
        if (appConfig && appConfig.layoutType) {
          layoutManager.setLayoutFromMicroApp(appConfig)
        }
      }
    } catch (error) {
      console.error('[App.vue] Error in layout change watcher:', error)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
