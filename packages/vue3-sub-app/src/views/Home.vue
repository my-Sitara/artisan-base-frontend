<template>
  <div class="home-page">
    <el-card>
      <template #header>
        <span>Vue3 子应用 - 首页</span>
      </template>
      
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
        <pre>{{ JSON.stringify(displayProps, null, 2) }}</pre>
      </div>
      
      <div class="actions-section">
        <h4>跨应用通信</h4>
        <el-space wrap>
          <el-button type="primary" @click="requestToken">
            请求 Token
          </el-button>
          <el-button type="success" @click="sendMessage">
            发送消息到主应用
          </el-button>
          <el-button type="warning" @click="navigateToVue2">
            跳转到 Vue2 子应用
          </el-button>
          <el-button type="info" @click="navigateToIframe">
            跳转到 iframe 子应用
          </el-button>
          <el-button @click="navigateToMain">
            跳转到主应用首页
          </el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const instance = getCurrentInstance()
const mainProps = computed(() => instance?.proxy?.$mainProps || {})

// 过滤掉不可序列化的对象（如 bridge、mainRouter）用于显示
const displayProps = computed(() => {
  const props = mainProps.value
  const result = {}
  for (const key of Object.keys(props)) {
    const val = props[key]
    // 跳过函数和复杂对象
    if (typeof val !== 'function' && typeof val !== 'object') {
      result[key] = val
    } else if (val === null) {
      result[key] = null
    } else if (key === 'appId' || key === 'token' || key === 'subPath' || key === 'routerBase') {
      result[key] = val
    }
  }
  return result
})

const token = ref('')

onMounted(() => {
  // 从 props 获取 token
  if (mainProps.value.token) {
    token.value = mainProps.value.token
  }
  
  // 监听 token 同步
  window.addEventListener('artisan:broadcast', (event) => {
    if (event.detail.type === 'TOKEN_SYNC') {
      token.value = event.detail.payload.token
    }
  })
})

function requestToken() {
  // 通过 bridge 请求 token
  if (window.__ARTISAN_BRIDGE__) {
    window.__ARTISAN_BRIDGE__.send(window.parent, {
      type: 'REQUEST_TOKEN',
      payload: {}
    })
  }
}

function sendMessage() {
  if (window.__ARTISAN_BRIDGE__) {
    window.__ARTISAN_BRIDGE__.send(window.parent, {
      type: 'MESSAGE',
      payload: {
        from: 'vue3-sub-app',
        message: 'Hello from Vue3 子应用!',
        time: Date.now()
      }
    })
  }
  ElMessage.success('消息已发送')
}

function navigateToVue2() {
  if (window.__ARTISAN_BRIDGE__) {
    window.__ARTISAN_BRIDGE__.navigateTo({
      appId: 'vue2-sub-app',
      path: '/'
    })
  }
}

function navigateToIframe() {
  if (window.__ARTISAN_BRIDGE__) {
    window.__ARTISAN_BRIDGE__.navigateTo({
      appId: 'iframe-sub-app',
      path: '/'
    })
  }
}

function navigateToMain() {
  if (window.__ARTISAN_BRIDGE__) {
    window.__ARTISAN_BRIDGE__.navigateToMain('/')
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
</style>
