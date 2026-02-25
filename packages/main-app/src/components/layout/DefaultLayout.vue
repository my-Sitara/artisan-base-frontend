<template>
  <div class="default-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside 
        v-if="layoutOptions.showSidebar" 
        :width="sidebarWidth"
        class="layout-aside"
      >
        <div class="logo">
          <span v-if="!collapsed">Artisan 微前端</span>
          <span v-else>A</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :router="true"
          class="sidebar-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-sub-menu index="sub-apps">
            <template #title>
              <el-icon><Grid /></el-icon>
              <span>子应用</span>
            </template>
            <el-menu-item 
              v-for="app in onlineApps" 
              :key="app.id"
              :index="`/app/${app.id}`"
            >
              <el-icon>
                <component :is="getAppIcon(app.type)" />
              </el-icon>
              <template #title>{{ app.name }}</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/multi-instance">
            <el-icon><CopyDocument /></el-icon>
            <template #title>多应用同屏</template>
          </el-menu-item>
          
          <el-menu-item index="/app-management">
            <el-icon><Setting /></el-icon>
            <template #title>应用管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container class="main-container">
        <!-- 头部 -->
        <el-header v-if="layoutOptions.showHeader" class="layout-header">
          <div class="header-left">
            <el-icon 
              class="collapse-btn" 
              @click="toggleSidebar"
            >
              <Fold v-if="!collapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="activeApp">{{ activeApp.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <el-input
              v-model="token"
              placeholder="输入 Token"
              style="width: 200px; margin-right: 10px;"
              size="small"
              @change="handleTokenChange"
            />
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" icon="UserFilled" />
                <span class="username">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 主内容区 -->
        <el-main class="layout-main">
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { layoutManager } from '@/core/layoutManager'
import {
  HomeFilled,
  Grid,
  CopyDocument,
  Setting,
  Fold,
  Expand,
  Monitor,
  Document,
  Link
} from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const { sidebarCollapsed: collapsed, activeApp, onlineApps } = storeToRefs(appStore)
const layoutOptions = computed(() => layoutManager.layoutOptions.value)
const token = ref(userStore.token)

const sidebarWidth = computed(() => collapsed.value ? '64px' : '220px')

const activeMenu = computed(() => {
  if (route.params.appId) {
    return `/app/${route.params.appId}`
  }
  return route.path
})

function toggleSidebar() {
  appStore.toggleSidebar()
}

function getAppIcon(type) {
  const iconMap = {
    vue3: Monitor,
    vue2: Monitor,
    iframe: Document,
    link: Link
  }
  return iconMap[type] || Monitor
}

function handleTokenChange(value) {
  userStore.setToken(value)
}

function handleLogout() {
  userStore.logout()
}

watch(() => userStore.token, (newToken) => {
  token.value = newToken
})
</script>

<style lang="scss" scoped>
.default-layout {
  width: 100%;
  height: 100%;
}

.layout-container {
  height: 100%;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    background-color: #263445;
  }
  
  .sidebar-menu {
    border-right: none;
    height: calc(100% - 60px);
    overflow-y: auto;
    
    &:not(.el-menu--collapse) {
      width: 220px;
    }
  }
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      
      &:hover {
        color: #409EFF;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      
      .username {
        font-size: 14px;
      }
    }
  }
}

.layout-main {
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
}
</style>
