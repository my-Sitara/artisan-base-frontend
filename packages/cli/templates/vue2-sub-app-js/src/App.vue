<template>
  <div class="vue2-sub-app">
    <div class="app-header">
      <div class="header-left">
        <h2>Vue2 子应用</h2>
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

<script>
export default {
  name: 'App',
  computed: {
    isQiankun() {
      // 从根实例 data 中获取，由 main.js render() 传入，比 window 标志更可靠
      return !!this.$root.isQiankunMode
    },
    isIframe() {
      return !this.isQiankun && window !== window.top
    },
    modeLabel() {
      if (this.isQiankun) return 'qiankun 接入'
      if (this.isIframe) return 'iframe 接入'
      return '独立运行'
    },
    modeBadgeClass() {
      if (this.isQiankun) return 'mode-qiankun'
      if (this.isIframe) return 'mode-iframe'
      return 'mode-standalone'
    }
  },
  mounted() {
    console.log('[Vue2 Sub App] App mounted, mode:', this.modeLabel)
    
    // 监听主应用广播
    window.addEventListener('artisan:broadcast', this.handleBroadcast)
  },
  beforeDestroy() {
    window.removeEventListener('artisan:broadcast', this.handleBroadcast)
  },
  methods: {
    handleBroadcast(event) {
      console.log('[Vue2 Sub App] Received broadcast:', event.detail)
      
      const { type, payload } = event.detail
      if (type === 'TOKEN_SYNC') {
        console.log('[Vue2 Sub App] Token synced:', payload.token)
        this.$root.mainProps.token = payload.token
      }
    }
  }
}
</script>

<style scoped>
.vue2-sub-app {
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
  color: #E6A23C;
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
  color: #E6A23C;
  background-color: #fdf6ec;
}

.app-content {
  min-height: 300px;
}
</style>
