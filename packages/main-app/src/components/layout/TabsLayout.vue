<template>
  <div class="tabs-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="layout-aside">
        <div class="logo">
          <span>Artisan 微前端</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
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
              {{ app.name }}
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <el-container class="main-container">
        <!-- 头部 -->
        <el-header class="layout-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </el-header>
        
        <!-- 标签栏 -->
        <div class="tabs-bar">
          <el-tabs 
            v-model="activeTab"
            type="card"
            closable
            @tab-click="handleTabClick"
            @tab-remove="handleTabRemove"
          >
            <el-tab-pane
              v-for="tab in tabs"
              :key="tab.path"
              :label="tab.title"
              :name="tab.path"
              :closable="tab.closable"
            />
          </el-tabs>
          
          <el-dropdown class="tabs-actions">
            <el-button size="small">
              操作 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="refreshCurrentTab">刷新当前</el-dropdown-item>
                <el-dropdown-item @click="closeOtherTabs">关闭其他</el-dropdown-item>
                <el-dropdown-item @click="closeAllTabs">关闭所有</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 主内容区 -->
        <el-main class="layout-main">
          <slot />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useTabsStore } from '@/stores/tabs'
import {
  HomeFilled,
  Grid,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const tabsStore = useTabsStore()

const { onlineApps } = storeToRefs(appStore)
const { tabs } = storeToRefs(tabsStore)
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (val) => tabsStore.setActiveTab(val)
})

const activeMenu = computed(() => route.path)

function handleTabClick(tab) {
  router.push(tab.props.name)
}

function handleTabRemove(path) {
  tabsStore.removeTab(path)
  if (path === route.fullPath) {
    router.push(tabsStore.activeTab)
  }
}

function refreshCurrentTab() {
  tabsStore.refreshTab(route.fullPath)
}

function closeOtherTabs() {
  tabsStore.removeOtherTabs(route.fullPath)
}

function closeAllTabs() {
  tabsStore.removeAllTabs()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.tabs-layout {
  width: 100%;
  height: 100%;
}

.layout-container {
  height: 100%;
}

.layout-aside {
  background-color: #304156;
  
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
  }
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-header {
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
}

.tabs-bar {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  
  :deep(.el-tabs) {
    flex: 1;
    
    .el-tabs__header {
      margin: 0;
      border: none;
    }
    
    .el-tabs__nav {
      border: none;
    }
    
    .el-tabs__item {
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      margin-right: 5px;
      
      &.is-active {
        border-color: #409EFF;
      }
    }
  }
  
  .tabs-actions {
    margin-left: 10px;
  }
}

.layout-main {
  padding: 15px;
  background-color: #f0f2f5;
  overflow: auto;
}
</style>
