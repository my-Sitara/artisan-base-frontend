<template>
  <el-header class="layout-header">
    <div class="header-left">
      <el-icon 
        v-if="showSidebar"
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import {
  Fold,
  Expand
} from '@element-plus/icons-vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  activeApp: {
    type: Object,
    default: null
  },
  showSidebar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const { sidebarCollapsed, onlineApps } = storeToRefs(appStore)
const token = ref(userStore.token)

function toggleSidebar() {
  emit('toggle-sidebar')
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
</style>