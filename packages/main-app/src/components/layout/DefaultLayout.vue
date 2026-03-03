<template>
  <div class="default-layout">
    <el-container class="layout-container">
      <Sider 
        v-if="layoutOptions.showSidebar"
        :collapsed="collapsed"
        :active-menu="activeMenu"
        @toggle-collapse="toggleSidebar"
      />
      
      <el-container class="main-container">
        <Header 
          v-if="layoutOptions.showHeader"
          :collapsed="collapsed"
          :active-app="activeApp"
          :show-sidebar="layoutOptions.showSidebar"
          @toggle-sidebar="toggleSidebar"
        />
        
        <!-- 主内容区 -->
        <el-main class="layout-main">
          <slot />
        </el-main>
        
        <Footer 
          v-if="layoutOptions.showFooter"
        />
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { layoutManager } from '@/core/layoutManager'
import Header from './Header.vue'
import Sider from './Sider.vue'
import Footer from './Footer.vue'

const route = useRoute()
const appStore = useAppStore()

const { sidebarCollapsed: collapsed, activeApp, onlineApps } = storeToRefs(appStore)
const layoutOptions = computed(() => layoutManager.layoutOptions.value)

const activeMenu = computed(() => {
  if (route.params.appId) {
    return `/app/${route.params.appId}`
  }
  return route.path
})

function toggleSidebar() {
  appStore.toggleSidebar()
}
</script>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  height: 100%;
}

.layout-container {
  height: 100%;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-main {
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
  flex: 1;
}
</style>
