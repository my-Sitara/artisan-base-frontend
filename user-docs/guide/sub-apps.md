# 子应用

本平台支持 4 种类型的子应用：

- **vue3** - Vue3 子应用，使用 qiankun
- **vue2** - Vue2 子应用，使用 qiankun
- **iframe** - iframe 子应用，使用 postMessage
- **link** - 外部链接，新窗口打开

## Vue3 子应用

### 入口配置

```javascript
// main.js
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

let app = null

function render(props = {}) {
  const { container, routerBase = '/vue3' } = props
  
  // 创建应用和路由
  app = createApp(App)
  // ...
  
  const mountEl = container 
    ? container.querySelector('#app') 
    : document.getElementById('app')
  app.mount(mountEl)
}

// 独立运行
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 生命周期
renderWithQiankun({
  bootstrap() {},
  mount(props) { render(props) },
  unmount() { app?.unmount() },
  update(props) {}
})
```

### Vite 配置

```javascript
// vite.config.js
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue3-sub-app', { useDevMode: true })
  ],
  server: {
    port: 7080,
    cors: true
  }
})
```

## Vue2 子应用

### 入口配置

```javascript
// main.js
let instance = null

function render(props = {}) {
  const { container, routerBase = '/vue2' } = props
  
  const router = new VueRouter({
    mode: 'history',
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : '/',
    routes
  })
  
  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 生命周期
export async function bootstrap() {}
export async function mount(props) { render(props) }
export async function unmount() { instance?.$destroy() }
```

### Vue CLI 配置

```javascript
// vue.config.js
module.exports = {
  devServer: {
    port: 3000,
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  configureWebpack: {
    output: {
      library: `vue2-sub-app-[name]`,
      libraryTarget: 'umd'
    }
  }
}
```

## iframe 子应用

### 通信桥

```javascript
// bridge.js
class IframeBridge {
  constructor() {
    this.allowedOrigins = ['http://localhost:8080']
    window.addEventListener('message', this.handleMessage.bind(this))
  }
  
  handleMessage(event) {
    // origin 校验
    if (!this.allowedOrigins.includes(event.origin)) return
    
    const { type, payload } = event.data
    // 处理消息...
  }
  
  send(message) {
    window.parent.postMessage(message, '*')
  }
  
  reportHeight() {
    const height = document.documentElement.scrollHeight
    this.send({ type: 'REPORT_HEIGHT', payload: { height } })
  }
}
```

### 注意事项

- **禁止** 直接访问 `iframe.contentWindow` DOM
- **必须** 使用 postMessage 通信
- **必须** 进行 origin 校验
- **必须** 使用 sandbox 属性限制
- 卸载时清理 message 监听器

## 跨应用跳转

所有子应用都可以通过 bridge 跳转：

```javascript
// 跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
})

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')
```
