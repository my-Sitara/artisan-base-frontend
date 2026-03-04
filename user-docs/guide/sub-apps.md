# 子应用

本平台支持 4 种类型的子应用：

- **vue3** - Vue3 子应用，基于 qiankun + vite-plugin-qiankun
- **vue2** - Vue2 子应用，基于 qiankun + @vue/cli
- **iframe** - iframe 子应用，使用 postMessage 通信
- **link** - 外部链接，在新窗口打开

## Vue3 子应用

### 入口配置

Vue3 子应用通过 `vite-plugin-qiankun` 注册生命周期。关键实现要点：

- qiankun 环境下使用 `createMemoryHistory`，独立运行使用 `createWebHistory`
- qiankun 环境下不加载 Element Plus CSS，复用主应用样式（避免样式污染）
- `unmount` 生命周期中停止响应式 effect 而非直接调用 `app.unmount()`（防止 DOM 已被清理时报错）

```javascript
// main.js
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

// qiankun 环境下不加载 Element Plus CSS
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  import('element-plus/dist/index.css')
}

let app = null
let router = null

function render(props = {}, isQiankunMount = false) {
  const { container } = props

  router = createRouter({
    history: isQiankunMount ? createMemoryHistory() : createWebHistory('/'),
    routes
  })

  app = createApp(App)
  app.use(router)
  app.use(ElementPlus)

  const mountEl = container
    ? (container.querySelector('#app') || container)
    : document.getElementById('app')
  app.mount(mountEl)

  if (isQiankunMount) {
    router.push(props.subPath || '/')
  }
}

// 先注册生命周期，再处理独立运行
renderWithQiankun({
  bootstrap() {},
  mount(props) { render(props, true) },
  unmount(props) {
    // 停止响应式系统，不直接调用 app.unmount()
    if (app?._instance?.scope) {
      app._instance.scope.stop()
    }
    app = null
    router = null
    if (props?.container) {
      props.container.innerHTML = ''
    }
  },
  update(props) {}
})

// 独立运行（放在 renderWithQiankun 之后）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({}, false)
}
```

### Vite 配置

```javascript
// vite.config.js
import qiankun from 'vite-plugin-qiankun'

// useDevMode: 开发时允许非 qiankun 运行
const useDevMode = process.env.QIANKUN !== 'true'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue3-sub-app', { useDevMode })  // 名称必须与 appId 一致
  ],
  server: {
    port: 7080,
    cors: true,
    origin: 'http://localhost:7080',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

## Vue2 子应用

### 入口配置

Vue2 子应用直接导出 qiankun 生命周期函数：

- qiankun 环境下路由使用 `abstract` 模式（等同于 memory history）
- `unmount` 时先保存实例引用，再调用 `$destroy()`

```javascript
// main.js
let instance = null
let router = null

function render(props = {}, isQiankunMount = false) {
  const { container } = props

  router = new VueRouter({
    mode: isQiankunMount ? 'abstract' : 'history',
    base: '/',
    routes
  })

  const mountEl = container
    ? (container.querySelector('#app') || container)
    : '#app'

  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(mountEl)

  if (props.subPath) {
    router.push(props.subPath)
  } else if (isQiankunMount) {
    router.push('/')
  }
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

// qiankun 生命周期
export async function bootstrap() {}
export async function mount(props) { render(props, true) }
export async function unmount() {
  const currentInstance = instance
  instance = null
  router = null
  if (currentInstance) {
    currentInstance.$destroy()
    if (currentInstance.$el) {
      currentInstance.$el.innerHTML = ''
    }
  }
}
export async function update(props) {}
```

### Vue CLI 配置

```javascript
// vue.config.js
const { name } = require('./package.json')

module.exports = {
  publicPath: '//localhost:3000/',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`
    }
  }
}
```

## iframe 子应用

iframe 子应用通过 postMessage 与主应用通信，无需集成 qiankun。

### 通信桥

```javascript
// iframe 子应用中的 bridge（以 iframe-sub-app 为参考）
class IframeBridge {
  constructor() {
    this.allowedOrigins = [
      'http://localhost:8080',
      window.location.origin  // 兼容云 IDE 环境
    ].filter(Boolean)
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  handleMessage(event) {
    // 必须进行 origin 校验
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

- 禁止直接访问 `iframe.contentWindow.document`（跨域限制）
- 必须使用 postMessage 通信
- 必须进行 origin 校验，防止 XSS
- 主应用在 `<iframe>` 上设置了 `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`
- 卸载时清理 message 监听器

## link 类型应用

`link` 类型应用在 MicroAppManager.load() 调用时直接通过 `window.open` 在新标签打开，不加载微应用容器：

```javascript
// 配置示例
{
  id: 'external-docs',
  name: '外部文档',
  entry: 'https://example.com/docs',
  type: 'link'
}
```

## 跨应用跳转

所有子应用都可以通过全局 bridge 跳转：

```javascript
// 跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
})

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')

// 监听自定义消息
window.__ARTISAN_BRIDGE__.on('MY_EVENT', (payload) => {
  console.log('Received:', payload)
})
```

qiankun 子应用也可以通过 `props` 获取传入的 bridge：

```javascript
// 在 mount 生命周期中
function render(props = {}) {
  const { bridge } = props
  bridge?.navigateTo({ appId: 'vue3-sub-app', path: '/' })
}
```

