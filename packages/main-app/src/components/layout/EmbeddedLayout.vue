<template>
  <div class="embedded-layout">
    <div class="embedded-container">
      <!-- Sider -->
      <Sider 
        v-if="layoutOptions.showSidebar"
        :collapsed="collapsed"
        :active-menu="activeMenu"
        @toggle-collapse="toggleSidebar"
      />
      
      <!-- 主区域 -->
      <div class="embedded-main">
        <!-- Header -->
        <Header 
          v-if="layoutOptions.showHeader"
          :collapsed="collapsed"
          :active-app="activeApp"
          :show-sidebar="layoutOptions.showSidebar"
          @toggle-sidebar="toggleSidebar"
        />
        
        <!-- Content -->
        <div class="embedded-content">
          <slot />
        </div>
        
        <!-- Footer -->
        <Footer 
          v-if="layoutOptions.showFooter"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { layoutManager } from '@/core/layoutManager'
import Sider from './Sider.vue'
import Header from './Header.vue'
import Footer from './Footer.vue'

const route = useRoute()
const appStore = useAppStore()

const { sidebarCollapsed: collapsed, activeApp } = storeToRefs(appStore)
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
.embedded-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.embedded-container {
  display: flex;
  height: 100%;
}

.embedded-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.embedded-content {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
}

.embedded-footer {
  margin-top: auto;
}
</style>
