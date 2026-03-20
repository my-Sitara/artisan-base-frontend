# 子应用

本平台支持 **4 种类型**的子应用，每种类型都有其特定的技术栈和集成方式。

## 子应用类型概览

| 类型 | 技术栈 | 构建工具 | 适用场景 |
|------|--------|---------|---------|
| **vue3** | Vue 3.x + vue-router 5.x | Vite + vite-plugin-qiankun | 新项目、现代化应用 |
| **vue2** | Vue 2.x + vue-router 3.x | Vue CLI | 遗留项目、Vue2 生态 |
| **iframe** | 任意技术栈 | 任意 | 第三方系统、独立应用 |
| **link** | - | - | 外部链接、快速跳转 |

---

## Vue3 子应用

### 技术特点

- 基于 **Vite 7.3.1** 构建，开发体验极佳
- 使用 **vite-plugin-qiankun** 集成微前端能力
- 支持 **热模块替换 (HMR)**，开发效率高
- 复用主应用的 Element Plus 样式，避免重复加载

### 入口配置（main.js）

Vue3 子应用通过 `vite-plugin-qiankun` 注册生命周期函数：

```javascript
// packages/vue3-sub-app/src/main.js
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { createApp } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import routes from './router/routes'

let app = null
let router = null

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的 props
 * @param {boolean} isQiankunMount - 是否在 qiankun 模式下挂载
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props

  // 创建路由实例
  router = createRouter({
    // qiankun 环境下使用 memory history，独立运行使用 web history
    history: isQiankunMount ? createMemoryHistory() : createWebHistory(),
    routes
  })

  // 创建 Vue 应用实例
  app = createApp(App)
  app.use(router)
  app.use(ElementPlus)

  // 确定挂载点
  const mountEl = container
    ? (container.querySelector('#app') || container)
    : document.getElementById('app')
  
  app.mount(mountEl)

  // qiankun 模式下根据 subPath 导航
  if (isQiankunMount) {
    router.push(props.subPath || '/')
  }
}

// 注册 qiankun 生命周期（必须先于独立运行代码）
renderWithQiankun({
  /**
   * Bootstrap - 应用首次加载时调用
   */
  bootstrap() {
    console.log('[vue3-sub-app] bootstraped')
  },
  
  /**
   * Mount - 应用挂载时调用
   */
  mount(props) {
    console.log('[vue3-sub-app] mount', props)
    render(props, true)  // qiankun 模式
  },
  
  /**
   * Unmount - 应用卸载时调用
   * 注意：停止响应式系统而非直接调用 app.unmount()
   */
  unmount(props) {
    console.log('[vue3-sub-app] unmount', props)
    
    // 停止响应式系统，防止内存泄漏
    if (app?._instance?.scope) {
      app._instance.scope.stop()
    }
    
    app = null
    router = null
    
    // 清理容器 DOM
    if (props?.container) {
      props.container.innerHTML = ''
    }
  },
  
  /**
   * Update - 应用更新时调用（可选）
   */
  update(props) {
    console.log('[vue3-sub-app] update', props)
  }
})

// 独立运行检查（放在 renderWithQiankun 之后）
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[vue3-sub-app] running independently')
  render({}, false)  // 独立运行模式
}
```

**关键点说明**：

1. **路由模式选择**：
   - qiankun 环境：`createMemoryHistory()` - 使用内存历史
   - 独立运行：`createWebHistory()` - 使用 HTML5 History

2. **样式复用**：
   - qiankun 环境下不加载 Element Plus CSS，复用主应用样式
   - 独立运行时正常加载自己的样式

3. **Unmount 处理**：
   - 停止响应式系统（`scope.stop()`）而非直接 `app.unmount()`
   - 防止 DOM 已被清理时报错

4. **执行顺序**：
   - 先调用 `renderWithQiankun()` 注册生命周期
   - 再判断是否独立运行

### Vite 配置（vite.config.js）

```javascript
// packages/vue3-sub-app/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'

const useDevMode = process.env.QIANKUN !== 'true'

export default defineConfig({
  plugins: [
    vue(),
    // 使用 appId 作为插件名称，必须与主应用配置一致
    qiankun('vue3-sub-app', { 
      useDevMode  // 开发时允许非 qiankun 运行
    })
  ],
  server: {
    port: 7080,
    cors: true,
    origin: 'http://localhost:7080',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    // 生产环境配置
    target: 'es2015',
    sourcemap: true
  }
})
```

**重要配置项**：

- `useDevMode`: 开发环境下允许非 qiankun 模式运行
- `cors`: 启用 CORS，允许主应用跨域访问
- `origin`: 设置正确的源地址
- `headers`: 配置跨域响应头

### package.json 配置

```json
{
  "name": "@artisan/vue3-sub-app",
  "scripts": {
    "dev": "vite --port 7080",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.29",
    "vue-router": "^5.0.3",
    "element-plus": "^2.13.2"
  },
  "devDependencies": {
    "vite": "^7.3.1",
    "vite-plugin-qiankun": "^1.0.15",
    "typescript": "^5.9.3"
  }
}
```

---

## Vue2 子应用

### 技术特点

- 基于 **Vue CLI** 构建，成熟的 Vue2 生态
- 使用 **webpack** 打包，配置灵活
- 路由使用 **abstract** 模式（等同于 memory history）

### 入口配置（main.js）

Vue2 子应用直接导出 qiankun 生命周期函数：

```javascript
// packages/vue2-sub-app/src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'

let instance = null
let routerInstance = null

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的 props
 * @param {boolean} isQiankunMount - 是否在 qiankun 模式下挂载
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props

  // 创建路由实例
  routerInstance = new VueRouter({
    // qiankun 环境下使用 abstract 模式
    mode: isQiankunMount ? 'abstract' : 'history',
    base: '/',
    routes
  })

  // 确定挂载点
  const mountEl = container
    ? (container.querySelector('#app') || container)
    : '#app'

  // 创建 Vue 实例
  instance = new Vue({
    router: routerInstance,
    render: h => h(App)
  }).$mount(mountEl)

  // 路由导航
  if (props.subPath) {
    routerInstance.push(props.subPath)
  } else if (isQiankunMount) {
    routerInstance.push('/')
  }
}

// 独立运行检查
if (!window.__POWERED_BY_QIANKUN__) {
  console.log('[vue2-sub-app] running independently')
  render({}, false)
}

/**
 * qiankun 生命周期函数
 */

// Bootstrap - 应用首次加载
export async function bootstrap() {
  console.log('[vue2-sub-app] bootstraped')
}

// Mount - 应用挂载
export async function mount(props) {
  console.log('[vue2-sub-app] mount', props)
  render(props, true)
}

// Unmount - 应用卸载
export async function unmount() {
  console.log('[vue2-sub-app] unmount')
  
  // 保存当前实例引用
  const currentInstance = instance
  
  instance = null
  routerInstance = null
  
  // 销毁实例
  if (currentInstance) {
    currentInstance.$destroy()
    if (currentInstance.$el) {
      currentInstance.$el.innerHTML = ''
    }
  }
}

// Update - 应用更新（可选）
export async function update(props) {
  console.log('[vue2-sub-app] update', props)
}
```

**关键点说明**：

1. **路由模式**：
   - qiankun 环境：`mode: 'abstract'` - 抽象模式，不依赖浏览器历史
   - 独立运行：`mode: 'history'` - HTML5 History 模式

2. **Unmount 处理**：
   - 先保存实例引用
   - 调用 `$destroy()` 销毁实例
   - 清理 DOM 内容

3. **导出方式**：
   - 直接导出生命周期函数（named exports）
   - 无需使用 helper 函数

### Vue CLI 配置（vue.config.js）

```javascript
// packages/vue2-sub-app/vue.config.js
const { name } = require('./package.json')

module.exports = {
  // 公共路径（开发时为相对路径，生产环境为 CDN 地址）
  publicPath: '//localhost:3000/',
  
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  
  // Webpack 输出配置（必须）
  configureWebpack: {
    output: {
      // 库名称必须唯一，通常包含 appId
      library: `${name}-[name]`,
      libraryTarget: 'umd',  // UMD 格式，兼容多种模块系统
      chunkLoadingGlobal: `webpackJsonp_${name}`  // chunk 加载全局变量名
    }
  }
}
```

**重要配置项**：

- `publicPath`: 设置资源加载的基础路径
- `library`: 库名称，必须唯一（通常包含 appId）
- `libraryTarget`: `'umd'` - 通用模块定义格式
- `chunkLoadingGlobal`: webpack chunk 加载的全局函数名

### package.json 配置

```json
{
  "name": "@artisan/vue2-sub-app",
  "scripts": {
    "dev": "vue-cli-service serve --port 3000",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "vue": "^2.7.16",
    "vue-router": "^3.6.5"
  },
  "devDependencies": {
    "@vue/cli-service": "^5.0.8",
    "vue-template-compiler": "^2.7.16"
  }
}
```

---

## Iframe 子应用

### 技术特点

- **技术栈无关**: 可使用任意前端框架或纯 HTML
- **postMessage 通信**: 与主应用通过 postMessage 进行安全通信
- **独立部署**: 完全独立，可单独部署和访问
- **沙箱隔离**: 运行在 iframe 沙箱中，安全性高

### 通信桥实现

Iframe 子应用需要实现一个简单的通信桥：

```javascript
// packages/iframe-sub-app/src/bridge.js
class IframeBridge {
  constructor() {
    // 允许的 origin 列表
    this.allowedOrigins = [
      'http://localhost:8080',
      window.location.origin  // 兼容云 IDE 环境
    ].filter(Boolean)
    
    // 消息处理器
    this.handlers = new Map()
    
    // 设置消息监听
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(event) {
    // Origin 校验（必须！）
    if (!this.allowedOrigins.includes(event.origin)) {
      console.warn('[IframeBridge] Rejected message from:', event.origin)
      return
    }

    const { type, payload } = event.data
    console.log('[IframeBridge] Received:', type, payload)

    // 调用对应处理器
    const handler = this.handlers.get(type)
    if (handler) {
      handler(payload, event.source)
    }

    // 特殊消息处理
    switch (type) {
      case 'PING':
        // 心跳响应
        this.send({
          type: 'PONG',
          payload: { time: Date.now(), pingTime: payload.time }
        })
        break
        
      case 'INIT':
        // 初始化完成
        console.log('[IframeBridge] Initialized with:', payload)
        // 上报初始高度
        this.reportHeight()
        break
    }
  }

  /**
   * 发送消息到父窗口
   */
  send(message) {
    window.parent.postMessage(message, '*')
  }

  /**
   * 注册消息处理器
   */
  on(type, handler) {
    this.handlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   */
  off(type) {
    this.handlers.delete(type)
  }

  /**
   * 上报页面高度
   */
  reportHeight() {
    const height = document.documentElement.scrollHeight
    this.send({
      type: 'REPORT_HEIGHT',
      payload: { 
        height,
        appId: 'iframe-sub-app'  // 替换为实际 appId
      }
    })
  }

  /**
   * 请求 token
   */
  requestToken() {
    this.send({
      type: 'REQUEST_TOKEN',
      payload: {}
    })
  }

  /**
   * 跳转到其他应用
   */
  navigateTo(appId, path, query = {}) {
    this.send({
      type: 'NAVIGATE_TO',
      payload: { appId, path, query }
    })
  }

  /**
   * 跳转到主应用
   */
  navigateToMain(path, query = {}) {
    this.send({
      type: 'NAVIGATE_TO_MAIN',
      payload: { path, query }
    })
  }

  /**
   * 销毁 bridge
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage)
    this.handlers.clear()
  }
}

// 导出单例
export const bridge = new IframeBridge()
export default bridge
```

### 在主应用中使用

```javascript
// 在 iframe 子应用的 main.js 或其他入口文件中
import { bridge } from './bridge'

// 监听来自主应用的消息
bridge.on('TOKEN_SYNC', (payload) => {
  console.log('Token updated:', payload.token)
})

// 监听自定义消息
bridge.on('MY_EVENT', (payload) => {
  console.log('Received custom event:', payload)
})

// 页面加载完成后上报高度
window.addEventListener('load', () => {
  bridge.reportHeight()
})

// 窗口大小变化时重新上报（防抖）
const debounce = (fn, delay) => {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

window.addEventListener('resize', debounce(() => {
  bridge.reportHeight()
}, 200))
```

### 注意事项

⚠️ **重要提醒**：

1. **禁止直接访问 DOM**：
   ```javascript
   // ❌ 错误：跨域限制，会抛出异常
   iframe.contentWindow.document.body
   
   // ✅ 正确：使用 postMessage
   iframe.contentWindow.postMessage(message, targetOrigin)
   ```

2. **必须进行 Origin 校验**：
   ```javascript
   // 在 handleMessage 中必须校验
   if (!allowedOrigins.includes(event.origin)) {
     return  // 拒绝非法消息
   }
   ```

3. **Sandbox 权限限制**：
   主应用设置的 sandbox 属性：
   ```html
   <iframe 
     src="..."
     sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
   ></iframe>
   ```

4. **卸载时清理监听器**：
   ```javascript
   // Iframe 卸载时必须移除 message 监听器
   window.removeEventListener('message', messageHandler)
   ```

5. **高度自适应**：
   - 页面加载时上报高度
   - 窗口 resize 时重新上报（建议防抖）
   - 内容动态变化时主动上报

---

## Link 类型应用

### 技术特点

- **非微应用**: 不是真正的微应用，只是外部链接的包装
- **新窗口打开**: 调用 `window.open()` 在新标签页打开
- **无需集成**: 不需要任何微前端集成代码

### 配置示例

```javascript
// config/microApps.js
{
  id: 'external-docs',
  name: '外部文档',
  entry: 'https://example.com/docs',
  type: 'link',
  layoutType: 'blank'
}
```

### 加载行为

当调用 `MicroAppManager.load()` 时：

```javascript
// microAppManager.js 内部处理
if (config.type === 'link') {
  window.open(config.entry, '_blank')
  return null  // 不加载容器
}
```

---

## 跨应用跳转

所有类型的子应用都可以通过全局 Bridge 进行跨应用跳转。

### 方式一：使用全局对象（推荐）

```javascript
// 在子应用中跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list',
  query: { id: 1 }
})

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')

// 监听自定义消息
window.__ARTISAN_BRIDGE__.on('MY_EVENT', (payload) => {
  console.log('Received:', payload)
})
```

### 方式二：通过 Props 获取 Bridge（仅限 qiankun 子应用）

```javascript
// 在 Vue3 子应用的 render 函数中
function render(props = {}) {
  const { bridge } = props
  
  // 使用 bridge 跳转
  bridge?.navigateTo({ 
    appId: 'vue3-sub-app', 
    path: '/' 
  })
  
  // 监听消息
  bridge?.on('CUSTOM_EVENT', (payload) => {
    console.log('Received:', payload)
  })
}
```

### 方式三：Iframe 使用 Bridge

```javascript
// Iframe 子应用中
import { bridge } from './bridge'

// 跳转到其他应用
bridge.navigateTo('vue3-sub-app', '/list', { id: 1 })

// 跳转到主应用
bridge.navigateToMain('/home')

// 发送自定义消息
bridge.send({
  type: 'MY_CUSTOM_EVENT',
  payload: { data: 'hello' }
})
```

---

## 开发调试技巧

### 独立运行调试

所有子应用都支持独立运行，方便开发调试：

```bash
# Vue3 子应用
cd packages/vue3-sub-app
npm run dev

# Vue2 子应用
cd packages/vue2-sub-app
npm run dev

# Iframe 子应用
cd packages/iframe-sub-app
npm run dev
```

访问对应的 localhost 地址即可独立查看效果。

### 联调测试

启动所有应用进行联调：

```bash
# 根目录
npm run dev:all:mock
```

然后在主应用中测试各个子应用的加载和交互。

### 常见问题

#### 1. CORS 跨域问题

**错误**: `Access-Control-Allow-Origin`

**解决**: 
- 开发环境设置 `host: '0.0.0.0'` 和 `cors: true`
- 配置正确的 `Access-Control-Allow-Origin` 响应头

#### 2. 样式冲突

**解决**:
- qiankun 子应用在 qiankun 环境下不加载 Element Plus CSS
- 使用 CSS Modules 或 Scoped CSS
- 添加样式前缀避免命名冲突

#### 3. 路由冲突

**解决**:
- qiankun 环境下使用 Memory/Abstract 模式
- 独立运行使用 History 模式
- 设置正确的 base 路径

#### 4. 通信失败

**解决**:
- 检查 origin 校验是否正确
- 确保消息格式正确 `{ type, payload }`
- 检查消息处理器是否已注册

---

## 最佳实践

### 1. 错误处理

在所有子应用中添加全局错误处理：

```javascript
// Vue3
app.config.errorHandler = (err, vm, info) => {
  console.error('[Global Error]', err, info)
  // 上报错误到监控系统
}

// Iframe
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[Global Error]', { message, source, lineno })
}
```

### 2. 性能优化

- 按需加载组件和路由
- 使用懒加载减少首屏体积
- 合理设置 keepAlive 缓存
- 避免频繁的跨应用通信

### 3. 安全考虑

- 不信任任何来自外部的消息数据
- 严格校验 origin
- 敏感操作需要二次确认
- Iframe 设置合适的 sandbox 权限

### 4. 代码组织

- 将 Bridge 通信逻辑封装成独立模块
- 统一消息类型定义
- 使用 TypeScript 提高类型安全
- 编写完善的注释和文档

---

## 相关文档

- [主应用开发](./main-app.md) - 主应用核心模块详解
- [布局系统](./layout-system.md) - 布局配置与管理
- [Bridge API](../api/bridge.md) - 跨应用通信完整 API
- [iframe 治理](./iframe-governance.md) - iframe 安全策略详解

