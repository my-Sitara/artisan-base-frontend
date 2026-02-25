<template>
  <div class="home-page">
    <el-card>
      <div slot="header">
        <span>Vue2 子应用 - 首页</span>
      </div>
      
      <div class="info-section">
        <h4>当前 Token</h4>
        <el-input 
          v-model="token" 
          placeholder="暂无 Token"
          readonly
        />
      </div>
      
      <div class="info-section">
        <h4>Props 信息</h4>
        <pre>{{ JSON.stringify(mainProps, null, 2) }}</pre>
      </div>
      
      <div class="actions-section">
        <h4>跨应用通信</h4>
        <el-button type="primary" @click="requestToken">
          请求 Token
        </el-button>
        <el-button type="success" @click="sendMessage">
          发送消息到主应用
        </el-button>
        <el-button type="warning" @click="navigateToVue3">
          跳转到 Vue3 子应用
        </el-button>
        <el-button type="info" @click="navigateToIframe">
          跳转到 iframe 子应用
        </el-button>
        <el-button @click="navigateToMain">
          跳转到主应用首页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      token: ''
    }
  },
  computed: {
    mainProps() {
      return this.$root.mainProps || {}
    }
  },
  mounted() {
    if (this.mainProps.token) {
      this.token = this.mainProps.token
    }
    
    window.addEventListener('artisan:broadcast', this.handleTokenSync)
  },
  beforeDestroy() {
    window.removeEventListener('artisan:broadcast', this.handleTokenSync)
  },
  methods: {
    handleTokenSync(event) {
      if (event.detail.type === 'TOKEN_SYNC') {
        this.token = event.detail.payload.token
      }
    },
    requestToken() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.send(window.parent, {
          type: 'REQUEST_TOKEN',
          payload: {}
        })
      }
    },
    sendMessage() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.send(window.parent, {
          type: 'MESSAGE',
          payload: {
            from: 'vue2-sub-app',
            message: 'Hello from Vue2 子应用!',
            time: Date.now()
          }
        })
      }
      this.$message.success('消息已发送')
    },
    navigateToVue3() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.navigateTo({
          appId: 'vue3-sub-app',
          path: '/'
        })
      }
    },
    navigateToIframe() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.navigateTo({
          appId: 'iframe-sub-app',
          path: '/'
        })
      }
    },
    navigateToMain() {
      if (window.__ARTISAN_BRIDGE__) {
        window.__ARTISAN_BRIDGE__.navigateToMain('/')
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  max-width: 800px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.info-section pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
}

.actions-section {
  margin-top: 20px;
}

.actions-section h4 {
  margin-bottom: 15px;
  color: #303133;
}

.actions-section .el-button {
  margin-bottom: 10px;
}
</style>
