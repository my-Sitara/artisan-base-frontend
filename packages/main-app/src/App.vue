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

import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import FullLayout from '@/components/layout/FullLayout.vue'
import TabsLayout from '@/components/layout/TabsLayout.vue'
import EmbeddedLayout from '@/components/layout/EmbeddedLayout.vue'
import BlankLayout from '@/components/layout/BlankLayout.vue'

const route = useRoute()
const appStore = useAppStore()
const tabsStore = useTabsStore()

const layoutMap = {
  default: DefaultLayout,
  full: FullLayout,
  tabs: TabsLayout,
  embedded: EmbeddedLayout,
  blank: BlankLayout
}

const currentLayout = computed(() => {
  const layoutType = route.meta?.layout || 'default'
  return layoutMap[layoutType] || DefaultLayout
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
