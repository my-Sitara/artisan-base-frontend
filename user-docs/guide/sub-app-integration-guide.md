# 子应用接入完整指南

本文档详细介绍了如何接入微前端平台的 4 种类型子应用，包括配置要点、注意事项和最佳实践。

---

## 📋 目录

- [支持的子应用类型](#支持的子应用类型)
- [Vue3 子应用接入](#vue3-子应用接入)
- [Vue2 子应用接入](#vue2-子应用接入)
- [iframe 子应用接入](#iframe-子应用接入)
- [link 类型应用](#link-类型应用)
- [跨应用通信](#跨应用通信)
- [核心注意事项](#核心注意事项)
- [调试与监控](#调试与监控)

---

## 支持的子应用类型

| 类型 | 技术栈 | 通信方式 | 适用场景 |
|------|--------|----------|----------|
| **vue3** | Vue3 + Vite + qiankun | props + bridge | 新项目、现代化技术栈 |
| **vue2** | Vue2 + Vue CLI + qiankun | props + bridge | 存量项目、Vue2 生态 |
| **iframe** | 任意技术栈 | postMessage | 第三方系统、隔离要求高 |
| **link** | 外部链接 | 无 | 文档、外部系统 |

---

## Vue3 子应用接入

### 1. 入口文件配置 (`src/main.js`)

```javascript
import { createApp } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import ElementPlus from 'element-plus'

import App from './App.vue'
import routes from './router'

// ⚠️ 重点：qiankun 模式下不加载 Element Plus CSS
// 原因：避免样式污染主应用，复用主应用的 Element Plus 样式
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  import('element-plus/dist/index.css')
}

let app = null
let router = null

/**
 * 渲染函数
 * @param {object} props - qiankun 传入的 props（独立运行时为空对象）
 * @param {boolean} isQiankunMount - 是否从 qiankun mount 生命周期调用
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props
  
  // 清除旧引用
  if (app) {
    console.warn('[Vue3 Sub App] Replacing existing app instance')
    app = null
    router = null
  }
  
  // ✅ 重点：路由模式选择
  // qiankun 环境：使用 Memory History（避免 URL 冲突）
  // 独立运行：使用 Web History（正常浏览器历史）
  const history = isQiankunMount
    ? createMemoryHistory()
    : createWebHistory('/')
  
  router = createRouter({
    history,
    routes
  })
  
  // 创建应用实例
  app = createApp(App)
  app.use(router)
  app.use(ElementPlus)
  
  // ✅ 通过 provide 传递运行模式，子组件可通过 inject 获取
  app.provide('__QIANKUN_MODE__', isQiankunMount)
  
  // ✅ 保存 props 到全局，所有组件都可以通过 $mainProps 访问
  app.config.globalProperties.$mainProps = props
  
  // ✅ 挂载点选择：优先 container 内的 #app，其次直接挂载到 container
  let mountEl
  if (container) {
    mountEl = container.querySelector('#app') || container
  } else {
    mountEl = document.getElementById('app')
  }
  app.mount(mountEl)
  
  // ✅ 重点：memory history 需要手动导航到初始路由
  if (isQiankunMount) {
    router.push(props.subPath || '/')
  }
  
  console.log('[Vue3 Sub App] Mounted', { container: !!container, isQiankunMount })
}

/**
 * ✅ 重点：先注册 qiankun 生命周期，再处理独立运行
 */
renderWithQiankun({
  bootstrap() {
    console.log('[Vue3 Sub App] Bootstrap')
  },
  mount(props) {
    console.log('[Vue3 Sub App] Mount', props)
    render(props, true)
  },
  unmount(props) {
    console.log('[Vue3 Sub App] Unmount')
    
    // ⚠️ 重点：不要调用 app.unmount()！
    // 原因：Vue3 的 unmount 会遍历 vnode 树，而 qiankun 环境下容器 DOM 可能已被清理，
    // 导致 vnode 为 null 而崩溃，single-spa 会将此错误包装后重新抛出
    // 正确做法：手动停止响应式系统，然后清除引用
    
    if (app) {
      // 停止 Vue3 响应式系统（watcher / computed / watch 等）
      if (app._instance && app._instance.scope) {
        app._instance.scope.stop()
      }
      app = null
    }
    router = null
    
    // 清理容器内容
    const { container } = props || {}
    if (container) {
      container.innerHTML = ''
    }
  },
  update(props) {
    console.log('[Vue3 Sub App] Update', props)
  }
})

/**
 * ✅ 重点：独立运行放在 renderWithQiankun 之后，确保 qiankun 生命周期已注册
 */
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

export { app, router }
```

### 2. Vite 配置 (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const useDevMode = process.env.QIANKUN !== 'true'

export default defineConfig({
  plugins: [
    vue(),
    // ✅ 重点：插件名称必须与主应用配置的 appId 一致
    qiankun('vue3-sub-app', { useDevMode })
  ],
  server: {
    port: 7080,
    cors: true,
    origin: 'http://localhost:7080',
    headers: {
      'Access-Control-Allow-Origin': '*'  // ✅ 允许跨域
    }
  },
  build: {
    sourcemap: true,  // 生产环境生成 source map
    outDir: 'dist'
  }
})
```

### 3. 在子组件中使用 Props

```vue
<template>
  <div>
    <h4>当前 Token: {{ token }}</h4>
    <h4>应用 ID: {{ appId }}</h4>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const mainProps = computed(() => instance?.proxy?.$mainProps || {})

const token = computed(() => mainProps.value.token)
const appId = computed(() => mainProps.value.appId)
</script>
```

---

## Vue2 子应用接入

### 1. 入口文件配置 (`src/main.js`)

```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'

let instance = null
let router = null

/**
 * 渲染函数
 * @param {object} props - qiankun 传入的 props
 * @param {boolean} isQiankunMount - 是否从 qiankun mount 调用
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props
  
  // ✅ 重点：路由模式选择
  // qiankun 环境：使用 abstract 模式（等同于 memory history）
  // 独立运行：使用 history 模式
  router = new VueRouter({
    mode: isQiankunMount ? 'abstract' : 'history',
    base: '/',
    routes
  })
  
  // ✅ 挂载点选择
  const mountEl = container
    ? (container.querySelector('#app') || container)
    : '#app'
  
  // ✅ 创建 Vue 实例，保存 props 到 data
  instance = new Vue({
    router,
    data() {
      return {
        mainProps: props,      // ✅ 保存到根实例，组件可通过 this.$root.mainProps 访问
        isQiankunMode: isQiankunMount
      }
    },
    render: h => h(App)
  }).$mount(mountEl)
  
  // ✅ 手动导航到初始路由
  if (props.subPath) {
    router.push(props.subPath)
  } else if (isQiankunMount) {
    router.push('/')
  }
}

// ✅ 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

/**
 * ✅ 重点：导出 qiankun 生命周期函数
 */
export async function bootstrap() {
  console.log('[Vue2 Sub App] Bootstrap')
}

export async function mount(props) {
  console.log('[Vue2 Sub App] Mount', props)
  render(props, true)
}

export async function unmount() {
  console.log('[Vue2 Sub App] Unmount')
  
  const currentInstance = instance
  instance = null
  router = null
  
  if (currentInstance) {
    try {
      currentInstance.$destroy()
      if (currentInstance.$el) {
        currentInstance.$el.innerHTML = ''
      }
    } catch (e) {
      // ✅ 忽略卸载错误
      console.warn('[Vue2 Sub App] Unmount cleanup error (ignored):', e.message)
    }
  }
}

export async function update(props) {
  console.log('[Vue2 Sub App] Update', props)
}
```

### 2. Vue CLI 配置 (`vue.config.js`)

```javascript
const { name } = require('./package.json')

module.exports = {
  // ✅ 重点：publicPath 必须设置为完整路径
  publicPath: '//localhost:3000/',
  
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',  // ✅ 允许所有主机访问
    headers: {
      'Access-Control-Allow-Origin': '*'  // ✅ 允许跨域
    }
  },
  
  configureWebpack: {
    output: {
      // ✅ 重点：library 名称格式必须为 `${name}-[name]`
      library: `${name}-[name]`,
      libraryTarget: 'umd',  // ✅ 输出为 UMD 格式
      chunkLoadingGlobal: `webpackJsonp_${name}`  // ✅ chunk 加载全局函数名
    }
  }
}
```

### 3. 在子组件中使用 Props

```vue
<template>
  <div>
    <h4>当前 Token: {{ token }}</h4>
    <h4>应用 ID: {{ appId }}</h4>
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
      return this.$root.mainProps || {}  // ✅ 从根实例获取 props
    },
    appId() {
      return this.mainProps.appId
    }
  },
  mounted() {
    if (this.mainProps.token) {
      this.token = this.mainProps.token
    }
  }
}
</script>
```

---

## iframe 子应用接入

### 1. HTML 结构 (`index.html`)

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iframe 子应用</title>
</head>
<body>
  <div class="iframe-app">
    <h2>iframe 子应用</h2>
    <div id="tokenDisplay">Token: -</div>
    <button onclick="requestToken()">请求 Token</button>
    <button onclick="sendMessage()">发送消息</button>
  </div>
  
  <!-- ✅ 引入 bridge 脚本 -->
  <script type="module" src="/src/bridge.js"></script>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

### 2. Bridge 实现 (`src/bridge.js`)

```javascript
/**
 * iframe 通信桥接器
 */
class IframeBridge {
  constructor() {
    // ✅ 重点：允许的 origin 列表（必须进行 origin 校验）
    this.allowedOrigins = [
      'http://localhost:8080',  // 主应用地址
      window.location.origin    // 兼容云 IDE 环境
    ]
    
    // 监听来自主应用的消息
    window.addEventListener('message', this.handleMessage.bind(this))
  }
  
  /**
   * ✅ 重点：处理接收到的消息，必须验证 origin
   */
  handleMessage(event) {
    // ⚠️ 重点：必须进行 origin 校验，防止 XSS 攻击
    if (!this.allowedOrigins.includes(event.origin)) {
      console.warn('[iframe Bridge] Invalid origin:', event.origin)
      return
    }
    
    const { type, payload } = event.data
    console.log('[iframe Bridge] Received:', type, payload)
    
    // 根据类型处理消息
    switch (type) {
      case 'TOKEN_SYNC':
        this.handleTokenSync(payload.token)
        break
      case 'NAVIGATE':
        this.handleNavigate(payload)
        break
      default:
        console.log('[iframe Bridge] Unknown message type:', type)
    }
  }
  
  /**
   * 发送消息到主应用
   */
  send(message) {
    window.parent.postMessage(message, '*')
  }
  
  /**
   * 上报高度给主应用
   */
  reportHeight() {
    const height = document.documentElement.scrollHeight
    this.send({ 
      type: 'REPORT_HEIGHT', 
      payload: { height } 
    })
  }
  
  handleTokenSync(token) {
    const el = document.getElementById('tokenDisplay')
    if (el) {
      el.textContent = `Token: ${token}`
    }
  }
  
  handleNavigate(payload) {
    // 处理导航逻辑
    console.log('[iframe] Navigate to:', payload)
  }
}

// ✅ 创建全局 bridge 实例
window.__IFRAME_BRIDGE__ = new IframeBridge()
```

### 3. 应用逻辑 (`src/app.js`)

```javascript
/**
 * 请求 Token
 */
function requestToken() {
  if (window.__IFRAME_BRIDGE__) {
    window.__IFRAME_BRIDGE__.send({
      type: 'REQUEST_TOKEN',
      payload: {}
    })
  }
}

/**
 * 发送消息到主应用
 */
function sendMessage() {
  if (window.__IFRAME_BRIDGE__) {
    window.__IFRAME_BRIDGE__.send({
      type: 'MESSAGE',
      payload: {
        from: 'iframe-sub-app',
        message: 'Hello from iframe!',
        time: Date.now()
      }
    })
  }
}

/**
 * 跳转到其他子应用
 */
function navigateToVue3() {
  if (window.__IFRAME_BRIDGE__) {
    window.__IFRAME_BRIDGE__.send({
      type: 'NAVIGATE_TO',
      payload: {
        appId: 'vue3-sub-app',
        path: '/'
      }
    })
  }
}

// ✅ 页面加载完成后上报高度
window.addEventListener('load', () => {
  setTimeout(() => {
    window.__IFRAME_BRIDGE__?.reportHeight()
  }, 100)
})

// ✅ 内容变化时重新上报高度
const observer = new MutationObserver(() => {
  window.__IFRAME_BRIDGE__?.reportHeight()
})
observer.observe(document.body, { 
  childList: true, 
  subtree: true 
})
```

### 4. ⚠️ iframe 子应用注意事项

- ❌ **禁止**直接访问 `iframe.contentWindow.document`（跨域限制）
- ✅ **必须**使用 postMessage 通信
- ✅ **必须**进行 origin 校验，防止 XSS 攻击
- ✅ 主应用在 `<iframe>` 上设置了 `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`
- ✅ 卸载时必须清理 message 监听器
- ✅ 建议实现高度自动上报机制

---

## link 类型应用

### 配置示例

```javascript
// 主应用配置文件
{
  id: 'external-docs',
  name: '外部文档',
  entry: 'https://example.com/docs',
  type: 'link',  // ✅ type 为 link
  icon: 'Document',
  status: 'online'
}
```

### 特点

- ✅ 在新标签页打开，不集成到微前端容器中
- ✅ 无需任何特殊配置
- ✅ 适用于外部系统、文档站点等

---

## 跨应用通信

### 方式 1: 使用全局 Bridge（推荐）

```javascript
// ✅ 在所有子应用中都可以使用

// 1. 跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list',
  query: { id: 123 }
})

// 2. 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')

// 3. 发送消息
window.__ARTISAN_BRIDGE__.send(window.parent, {
  type: 'CUSTOM_EVENT',
  payload: { data: 'custom data' }
})

// 4. 监听消息
window.__ARTISAN_BRIDGE__.on('MY_EVENT', (payload) => {
  console.log('Received:', payload)
})

// 5. 取消监听
window.__ARTISAN_BRIDGE__.off('MY_EVENT')
```

### 方式 2: 使用 props.bridge

```javascript
// ✅ 适用于 qiankun 子应用

function render(props = {}) {
  const { bridge } = props
  
  // 使用 bridge 跳转
  bridge?.navigateTo({ 
    appId: 'vue3-sub-app', 
    path: '/' 
  })
  
  // 使用 bridge 发送消息
  bridge?.broadcast({
    type: 'TOKEN_UPDATE',
    payload: { token: 'new-token' }
  })
}
```

### 方式 3: 监听广播事件

```javascript
// ✅ 适用于所有子应用

// 监听全局广播
window.addEventListener('artisan:broadcast', (event) => {
  const { type, payload } = event.detail
  
  if (type === 'TOKEN_SYNC') {
    console.log('Token synced:', payload.token)
  }
})

// 在 Vue 组件中
onMounted(() => {
  window.addEventListener('artisan:broadcast', handleBroadcast)
})

onUnmounted(() => {
  window.removeEventListener('artisan:broadcast', handleBroadcast)
})
```

---

## 核心注意事项

### 1. 生命周期管理 ⚠️

#### ✅ 正确做法

```javascript
// 主应用容器中卸载子应用
onBeforeUnmount(async () => {
  // ✅ 在 onBeforeUnmount 中卸载，而非 onUnmounted
  // 原因：onUnmounted 时 DOM 已从文档中移除，子应用 unmount 时找不到 vnode
  if (microAppManager.isAppLoaded(props.appId)) {
    await unloadApp()
  }
})
```

#### ❌ 错误做法

```javascript
// ❌ 不要在 onUnmounted 中卸载
onUnmounted(() => {
  unloadApp()  // 此时 DOM 已移除，会导致报错
})

// ❌ 不要在 unmount 中调用 app.unmount()
unmount(props) {
  app.unmount()  // 会导致 vnode 为 null 而崩溃
}
```

### 2. 样式隔离 ⚠️

#### ✅ 正确做法

```javascript
// Vue3 子应用
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  import('element-plus/dist/index.css')  // ✅ 仅独立运行时加载
}

// 主应用配置
loadMicroApp({
  name: appId,
  entry: config.entry,
  container: containerElement
}, {
  sandbox: {
    experimentalStyleIsolation: true  // ✅ 开启样式隔离
  }
})
```

#### ❌ 错误做法

```javascript
// ❌ qiankun 模式下也加载 Element Plus CSS
import 'element-plus/dist/index.css'  // 会污染主应用样式
```

### 3. 路由管理 ⚠️

#### ✅ 正确做法

```javascript
// Vue3
const history = isQiankunMount
  ? createMemoryHistory()  // ✅ qiankun 环境
  : createWebHistory('/')  // ✅ 独立运行

// Vue2
const router = new VueRouter({
  mode: isQiankunMount ? 'abstract' : 'history'  // ✅ 模式切换
})

// ✅ memory/abstract 模式需要手动 push 初始路由
if (isQiankunMount) {
  router.push(props.subPath || '/')
}
```

#### ❌ 错误做法

```javascript
// ❌ 统一使用一种 history 模式
const history = createWebHistory('/')  // qiankun 下会冲突

// ❌ memory 模式下不手动 push 路由
if (isQiankunMount) {
  // 缺少 router.push()  // 会导致路由不生效
}
```

### 4. Props 传递与使用 ⚠️

#### ✅ 正确做法

```javascript
// Vue3 - 保存到 globalProperties
app.config.globalProperties.$mainProps = props

// Vue2 - 保存到根实例 data
new Vue({
  data() {
    return {
      mainProps: props
    }
  }
})

// iframe - 通过 postMessage 接收
window.addEventListener('message', (event) => {
  const { type, payload } = event.data
})
```

#### 主应用传入的 Props

```javascript
{
  token: userStore.token,          // ✅ 用户 Token
  mainRouter: options.mainRouter,  // ✅ 主应用路由实例
  bridge: bridge,                  // ✅ 跨应用通信桥
  appId: appId,                    // ✅ 应用 ID
  subPath: path,                   // ✅ 子路径参数
  ...config.props                  // ✅ 自定义 props
}
```

### 5. 容器管理 ⚠️

#### ✅ 正确做法

```javascript
// ✅ 容器始终保持在 DOM 中且可见
<div v-show="!error" ref="containerRef" class="app-container" />

// ✅ 优先查找 #app，找不到则使用 container
const mountEl = container
  ? (container.querySelector('#app') || container)
  : document.getElementById('app')

// ✅ 卸载时清理容器
if (container) {
  container.innerHTML = ''
}
```

#### ❌ 错误做法

```javascript
// ❌ 容器被隐藏或移除
<div v-if="false" ref="containerRef" />  // qiankun 无法挂载

// ❌ 不清理容器内容
// 会导致内存泄漏和 DOM 污染
```

### 6. 错误处理 ⚠️

#### ✅ 正确做法

```javascript
// ✅ 检查是否已加载
if (this.isAppLoaded(appId)) {
  throw new Error(`Micro app already loaded: ${appId}`)
}

// ✅ 忽略卸载错误
await app.unmount().catch(() => {
  console.log('Unload error ignored')
})

// ✅ 记录错误日志
this.logError(appId, error)
```

### 7. 心跳检测 ⚠️

```javascript
// ✅ 主应用启动心跳检测
startHeartbeat(appId) {
  this.heartbeatTimers[appId] = setInterval(() => {
    const appInfo = this.loadedApps[appId]
    if (appInfo) {
      appInfo.lastAliveTime = Date.now()  // ✅ 更新存活时间
    }
  }, 5000)
}
```

---

## 调试与监控

### 1. 查看应用状态

```javascript
// ✅ 查看所有加载的应用
window.__MICRO_APP_MANAGER__.loadedApps

// ✅ 查看特定应用状态
window.__MICRO_APP_MANAGER__.loadedApps['vue3-sub-app']

// ✅ 查看应用是否已加载
window.__MICRO_APP_MANAGER__.isAppLoaded('vue3-sub-app')
```

### 2. 查看通信桥

```javascript
// ✅ 查看 bridge 实例
window.__ARTISAN_BRIDGE__

// ✅ 查看注册的处理器
window.__ARTISAN_BRIDGE__.handlers
```

### 3. 手动操作应用

```javascript
// ✅ 刷新应用
window.__MICRO_APP_MANAGER__.reload('vue3-sub-app')

// ✅ 卸载应用
window.__MICRO_APP_MANAGER__.unload('vue3-sub-app')

// ✅ 预加载应用
window.__MICRO_APP_MANAGER__.preload(['vue3-sub-app'])
```

### 4. 查看错误日志

```javascript
// ✅ 查看错误日志
window.__MICRO_APP_MANAGER__.errorLogs

// ✅ 查看特定应用的错误
window.__MICRO_APP_MANAGER__.loadedApps['vue3-sub-app'].errors
```

### 5. 性能监控

```javascript
// ✅ 查看加载时间
const appInfo = window.__MICRO_APP_MANAGER__.loadedApps['vue3-sub-app']
console.log('Load time:', new Date(appInfo.loadTime))
console.log('Duration:', Date.now() - appInfo.loadTime)
```

---

## 配置清单速查表

### Vue3 子应用配置清单

| 配置项 | 要求 | 检查 |
|--------|------|------|
| vite-plugin-qiankun 插件 | ✅ 必须安装并配置 | ☐ |
| 插件名称与 appId 一致 | ✅ 必须一致 | ☐ |
| qiankun 模式不加载 Element Plus CSS | ✅ 必须遵守 | ☐ |
| 路由模式切换 | ✅ Memory/Web History | ☐ |
| unmount 不调用 app.unmount() | ✅ 必须遵守 | ☐ |
| 保存 props 到 globalProperties | ✅ 必须保存 | ☐ |
| 跨域头配置 | ✅ Access-Control-Allow-Origin | ☐ |

### Vue2 子应用配置清单

| 配置项 | 要求 | 检查 |
|--------|------|------|
| UMD 输出配置 | ✅ library 格式正确 | ☐ |
| publicPath 完整路径 | ✅ 必须设置 | ☐ |
| 路由模式切换 | ✅ abstract/history | ☐ |
| 保存 props 到根实例 | ✅ 必须保存 | ☐ |
| unmount 调用 $destroy() | ✅ 必须调用 | ☐ |
| 跨域头配置 | ✅ Access-Control-Allow-Origin | ☐ |

### iframe 子应用配置清单

| 配置项 | 要求 | 检查 |
|--------|------|------|
| postMessage 通信 | ✅ 必须使用 | ☐ |
| origin 校验 | ✅ 必须校验 | ☐ |
| Bridge 实现 | ✅ 必须实现 | ☐ |
| 高度上报 | ✅ 建议实现 | ☐ |
| 清理监听器 | ✅ 必须清理 | ☐ |

---

## 常见问题 FAQ

### Q1: 子应用加载后白屏？

**A:** 检查以下几点：
1. 容器是否存在且可见
2. 路由是否正确 push
3. 控制台是否有报错
4. Network 中资源是否加载成功

### Q2: 样式污染主应用？

**A:** 检查：
1. qiankun 模式是否加载了 Element Plus CSS
2. `experimentalStyleIsolation` 是否开启
3. 是否有全局选择器（如 `*`, `html`, `body`）

### Q3: 子应用卸载时报错？

**A:** 检查：
1. 是否在 `onBeforeUnmount` 中卸载
2. Vue3 是否调用了 `app.unmount()`（应改为 `scope.stop()`）
3. 容器是否已被清理

### Q4: 跨应用跳转失败？

**A:** 检查：
1. bridge 是否正确注入
2. appId 是否与配置一致
3. 目标应用是否在线

### Q5: iframe 通信收不到消息？

**A:** 检查：
1. origin 校验是否通过
2. message 监听器是否注册
3. postMessage 的 targetOrigin 是否正确

---

## 总结

接入子应用的核心要点：

1. **生命周期规范** - 严格按照 qiankun 生命周期编写代码
2. **样式隔离** - qiankun 模式不加载公共 UI 库样式
3. **路由模式** - 根据环境选择合适的路由模式
4. **通信桥接** - 使用统一的 bridge 进行跨应用通信
5. **错误处理** - 忽略卸载错误，记录日志
6. **容器管理** - 在正确的时机卸载，清理容器

遵循以上规范，可以确保子应用稳定、高效地运行在微前端平台中。

---

**文档版本**: 1.0  
**最后更新**: 2026-03-12  
**维护者**: 项目团队
