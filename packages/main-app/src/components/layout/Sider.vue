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
          :key="app.id"
          :index="`/app/${app.id}`"
        >
          <!-- Element Plus Icon -->
          <el-icon v-if="app.iconType === 'element-icon'">
            <component :is="app.icon" />
          </el-icon>
          <!-- SVG Icon -->
          <div v-else-if="app.iconType === 'svg'" class="menu-svg-icon" v-html="getSvgContent(app.icon)" />
          <!-- Emoji -->
          <span v-else-if="app.iconType === 'emoji'" class="menu-emoji">{{ app.icon }}</span>
          <!-- 图片 URL -->
          <img v-else-if="app.iconType === 'image'" :src="app.iconUrl || app.icon" alt="icon" class="menu-icon-image" />
          <!-- 默认图标 -->
          <el-icon v-else><Monitor /></el-icon>
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
import { useRoute } from 'vue-router'
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
import { getSvgContent } from '@/config/svgIcons'

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

const { sidebarCollapsed, onlineApps } = storeToRefs(appStore)

const sidebarWidth = computed(() => props.collapsed ? '64px' : '220px')

function toggleCollapse() {
  emit('toggle-collapse')
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

// 菜单 Emoji 图标样式
.menu-emoji {
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// 菜单图片图标样式
.menu-icon-image {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

// 菜单 SVG 图标样式
.menu-svg-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>