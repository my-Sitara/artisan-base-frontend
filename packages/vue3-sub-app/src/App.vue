<template>
  <div class="vue3-sub-app">
    <div class="app-header">
      <div class="header-left">
        <h2>Vue3 子应用</h2>
        <span class="mode-badge" :class="modeBadgeClass">{{ modeLabel }}</span>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/list">列表</router-link>
        <router-link to="/about">关于</router-link>
      </div>
    </div>
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'

// 通过 inject 获取由 main.js 中 app.provide 传入的运行模式
// 这比直接读取 qiankunWindow.__POWERED_BY_QIANKUN__ 更可靠，
// 因为 provide 的值在 mount 生命周期中已确定
const isQiankun = inject('__QIANKUN_MODE__', false)
const isIframe = !isQiankun && window !== window.top

const modeLabel = computed(() => {
  if (isQiankun) return 'qiankun 接入'
  if (isIframe) return 'iframe 接入'
  return '独立运行'
})

const modeBadgeClass = computed(() => {
  if (isQiankun) return 'mode-qiankun'
  if (isIframe) return 'mode-iframe'
  return 'mode-standalone'
})

onMounted(() => {
  console.log('[Vue3 Sub App] App mounted, mode:', modeLabel.value)
  
  // 监听主应用广播
  window.addEventListener('artisan:broadcast', (event) => {
    console.log('[Vue3 Sub App] Received broadcast:', event.detail)
    
    const { type, payload } = event.detail
    if (type === 'TOKEN_SYNC') {
      console.log('[Vue3 Sub App] Token synced:', payload.token)
    }
  })
})
</script>

<style scoped>
.vue3-sub-app {
  min-height: 100%;
  padding: 20px;
  background-color: #fff;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header h2 {
  margin: 0;
  color: #67C23A;
}

.mode-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
}

.mode-qiankun {
  background-color: #409EFF;
}

.mode-iframe {
  background-color: #E6A23C;
}

.mode-standalone {
  background-color: #67C23A;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-links a {
  color: #606266;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
}

.nav-links a:hover {
  background-color: #f0f0f0;
}

.nav-links a.router-link-active {
  color: #67C23A;
  background-color: #f0f9eb;
}

.app-content {
  min-height: 300px;
}
</style>
