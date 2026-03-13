<template>
  <el-aside 
    :width="sidebarWidth"
    class="layout-aside"
  >
    <div class="logo">
      <span v-if="!collapsed">Artisan 微前端</span>
      <span v-else>A</span>
      <el-icon 
        class="collapse-btn" 
        @click="toggleCollapse"
      >
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
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
          :key="`app-${app.id}`"
          :index="app.type === 'link' ? '' : `/app/${app.id}`"
          @click="handleAppClick(app)"
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
      
      <el-sub-menu index="app-management">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>应用管理</span>
        </template>
        <el-menu-item index="/app-management/loading">
          <el-icon><Monitor /></el-icon>
          <template #title>子应用加载管理</template>
        </el-menu-item>
        <el-menu-item index="/app-management/error-logs">
          <el-icon><Document /></el-icon>
          <template #title>错误日志</template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  HomeFilled,
  Grid,
  CopyDocument,
  Setting,
  Monitor,
  Document,
  Link,
  Fold,
  Expand
} from '@element-plus/icons-vue'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  activeMenu: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toggle-collapse'])

const route = useRoute()
const appStore = useAppStore()
const router = useRouter()

const { sidebarCollapsed, onlineApps } = storeToRefs(appStore)

const sidebarWidth = computed(() => props.collapsed ? '64px' : '220px')

function toggleCollapse() {
  emit('toggle-collapse')
}

function handleAppClick(app) {
  // link 类型：只打开新窗口，不路由跳转
  if (app.type === 'link') {
    window.open(app.entry, '_blank')
  } else {
    // 其他类型：正常路由跳转
    router.push(`/app/${app.id}`)
  }
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
</script>

<style lang="scss" scoped>
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
    position: relative;
    
    .collapse-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      cursor: pointer;
      color: #bfcbd9;
      
      &:hover {
        color: #fff;
      }
    }
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
</style>