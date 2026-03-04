<template>
  <div class="about-page">
    <el-card>
      <div slot="header">
        <span>Vue2 子应用 - 关于</span>
      </div>
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用名称">Vue2 子应用</el-descriptions-item>
        <el-descriptions-item label="应用类型">vue2</el-descriptions-item>
        <el-descriptions-item label="技术栈">Vue 2 + Vue CLI + Element UI</el-descriptions-item>
        <el-descriptions-item label="运行端口">3000</el-descriptions-item>
        <el-descriptions-item label="qiankun 模式">loadMicroApp</el-descriptions-item>
        <el-descriptions-item label="说明">
          这是一个 Vue2 微前端子应用示例，支持独立运行和作为 qiankun 子应用加载。
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="features-section">
        <h4>功能特性</h4>
        <el-tag v-for="feature in features" :key="feature" style="margin: 5px;">
          {{ feature }}
        </el-tag>
      </div>
      
      <div class="nav-section">
        <h4>跨应用导航</h4>
        <el-button @click="goToVue3List">Vue3 列表页</el-button>
        <el-button @click="goToIframeList">iframe 列表页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'About',
  data() {
    return {
      features: [
        'qiankun 生命周期',
        '独立运行支持',
        'Token 同步',
        '跨应用跳转',
        'Element UI'
      ]
    }
  },
  methods: {
    goToVue3List() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.navigateTo({
          appId: 'vue3-sub-app',
          path: '/list'
        })
      }
    },
    goToIframeList() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.navigateTo({
          appId: 'iframe-sub-app',
          path: '/list'
        })
      }
    }
  }
}
</script>

<style scoped>
.about-page {
  max-width: 800px;
}

.features-section,
.nav-section {
  margin-top: 20px;
}

.features-section h4,
.nav-section h4 {
  margin-bottom: 10px;
  color: #303133;
}
</style>
