# 子应用接入与改造指南

> 📦 完整实战教程：从零接入到生产级微应用

## 📖 目录

1. [接入前必读](#-接入前必读)
2. [Vue 3 子应用接入](#-vue-3-子应用接入)
3. [Vue 2 子应用接入](#-vue-2-子应用接入)
4. [iframe 子应用接入](#-iframe-子应用接入)
5. [老项目改造实战](#-老项目改造实战)
6. [常见问题与解决方案](#-常见问题与解决方案)
7. [检查清单](#-检查清单)

---

## 🎯 接入前必读

### 核心概念

**微前端生命周期：**
```
bootstrap() → mount() → update() → unmount()
初始化      挂载     更新     卸载
```

**关键要点：**
- ✅ **容器挂载**：子应用必须挂载到主应用提供的容器中
- ✅ **路由隔离**：qiankun 环境下使用 Memory/Abstract 路由模式
- ✅ **样式隔离**：避免全局样式污染主应用
- ✅ **实例清理**：卸载时彻底清理，防止内存泄漏

### 技术选型建议

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 新项目 | Vue 3 + Vite | 性能好、开发体验佳、官方支持 |
| 现有 Vue 2 项目 | Vue 2 + Vue CLI | 低成本迁移，无需重写 |
| 独立系统 | iframe | 零侵入，完全隔离 |
| 外部链接 | link | 最简单，新窗口打开 |

---

## 🟦 Vue 3 子应用接入

### 步骤 1：安装依赖

```bash
cd your-vue3-app

# 安装 qiankun 插件
npm install vite-plugin-qiankun --save-dev
```

### 步骤 2：配置 Vite

创建或修改 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'path'

const useDevMode = process.env.QIANKUN !== 'true'
const isQiankunBuild = process.env.QIANKUN === 'true'

export default defineConfig({
  plugins: [
    vue(),
    // ⚠️ 名称必须与主应用配置的 appId 一致
    qiankun('your-app-id', {
      useDevMode  // 开发模式允许非 qiankun 运行
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    // ✅ 云 IDE 环境需要设置为 0.0.0.0
    host: '0.0.0.0',
    port: 7080,  // 根据你的端口规划调整
    cors: true,
    origin: 'http://localhost:7080',
    strictPort: false,
    open: false,
    // ✅ 必须设置 CORS 头
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
})
```

### 步骤 3：改造入口文件 (main.js)

这是**最核心**的部分，请仔细对照：

```javascript
// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import ElementPlus from 'element-plus'

import App from './App.vue'
import routes from './router'

// ⚠️ 重点：qiankun 模式下不加载 Element Plus CSS
// 原因：Vite dev 模式通过 JS/HMR 注入 CSS，会污染主应用样式
// qiankun 模式下复用主应用的 Element Plus CSS（class name 一致）
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
  
  // 清除旧引用（不要调用 unmount，会干扰 qiankun 内部状态）
  if (app) {
    console.warn('[Your App] Replacing existing app instance')
    app = null
    router = null
  }
  
  // ✅ 核心：路由模式选择
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
  
  console.log('[Your App] Mounted', { container: !!container, isQiankunMount })
}

/**
 * ✅ 核心：先注册 qiankun 生命周期，再处理独立运行
 */
renderWithQiankun({
  bootstrap() {
    console.log('[Your App] Bootstrap')
  },
  mount(props) {
    console.log('[Your App] Mount', props)
    render(props, true)
  },
  unmount(props) {
    console.log('[Your App] Unmount')
    
    // ⚠️ 重点：不要调用 app.unmount()！
    // 原因：Vue3 的 unmount 会遍历 vnode 树，而 qiankun 环境下
    // 容器 DOM 可能已被清理，导致 vnode 为 null 而崩溃
    // single-spa 会将此错误包装后重新抛出，try-catch 无法拦截
    
    // ✅ 正确做法：手动停止响应式系统，然后清除引用
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
    console.log('[Your App] Update', props)
  }
})

/**
 * ✅ 独立运行（放在 renderWithQiankun 之后）
 */
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

export { app, router }
```

### 步骤 4：在组件中获取主应用信息

```vue
<!-- 在任意组件中使用 -->
<script setup>
import { inject } from 'vue'

// 获取运行模式
const isQiankunMode = inject('__QIANKUN_MODE__')

// 获取主应用传入的 props
const mainProps = inject('$mainProps')

// 或者通过全局属性访问
const props = getCurrentInstance()?.appContext.config.globalProperties.$mainProps
</script>
```

### 步骤 5：跨应用通信

```javascript
// 跳转到其他应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'other-app',
  path: '/detail/123'
})

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')

// 发送消息
window.__ARTISAN_BRIDGE__.emit('custom-event', { data: 'value' })

// 监听消息
window.__ARTISAN_BRIDGE__.on('custom-event', (payload) => {
  console.log('收到消息:', payload)
})
```

---

## 🟨 Vue 2 子应用接入

### 步骤 1：安装依赖

```bash
cd your-vue2-app

# 确保已安装 vue-router
npm install vue-router@3 --save
```

### 步骤 2：配置 Vue CLI

创建或修改 `vue.config.js`：

```javascript
const { name } = require('./package.json')

module.exports = {
  // ✅ 公共资源路径，使用绝对地址
  publicPath: '//localhost:3000/',
  
  devServer: {
    // ✅ 云 IDE 环境需要设置为 0.0.0.0
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    // ✅ 必须设置 CORS 头
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  
  // ✅ 配置 UMD 输出，供 qiankun 加载
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`
    }
  }
}
```

### 步骤 3：改造入口文件 (main.js)

```javascript
// src/main.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import routes from './router'

Vue.use(VueRouter)

let instance = null
let router = null

/**
 * 渲染函数
 * @param {object} props - qiankun 传入的 props
 * @param {boolean} isQiankunMount - 是否从 qiankun mount 调用
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props
  
  // 清除旧引用
  if (instance) {
    console.warn('[Your App] Replacing existing instance')
    instance = null
    router = null
  }
  
  // ✅ 核心：路由模式选择
  // qiankun 环境：使用 abstract 模式（类似 memory history）
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
  
  console.log('[Your App] Mounted', { container: !!container, isQiankunMount })
}

// ✅ 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

/**
 * ✅ 导出 qiankun 生命周期函数
 */
export async function bootstrap() {
  console.log('[Your App] Bootstrap')
}

export async function mount(props) {
  console.log('[Your App] Mount', props)
  render(props, true)
}

export async function unmount() {
  console.log('[Your App] Unmount')
  
  const currentInstance = instance
  instance = null
  router = null
  
  if (currentInstance) {
    try {
      // ✅ 销毁实例
      currentInstance.$destroy()
      if (currentInstance.$el) {
        currentInstance.$el.innerHTML = ''
      }
    } catch (e) {
      // ✅ 忽略卸载错误
      console.warn('[Your App] Unmount cleanup error (ignored):', e.message)
    }
  }
}

export async function update(props) {
  console.log('[Your App] Update', props)
}
```

### 步骤 4：在组件中访问主应用信息

```vue
<script>
export default {
  mounted() {
    // 通过根实例访问 props
    const props = this.$root.mainProps
    const isQiankun = this.$root.isQiankunMode
    
    console.log('主应用传入的 props:', props)
  }
}
</script>
```

---

## 🟪 iframe 子应用接入

### 特点

- ✅ **零侵入**：无需修改现有代码
- ✅ **完全隔离**：不会与主应用产生命名空间冲突
- ⚠️ **限制**：只能通过 postMessage 通信

### 步骤 1：配置 CORS

在你的 iframe 应用中设置 CORS 头：

**Vite 项目 (vite.config.js)：**
```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 9080,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
```

**Vue CLI 项目 (vue.config.js)：**
```javascript
module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 9080,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

### 步骤 2：添加通信桥（可选但推荐）

在 iframe 应用中加入简单的通信桥：

```javascript
// src/utils/iframeBridge.js
class IframeBridge {
  constructor() {
    this.allowedOrigins = [
      'http://localhost:8080',  // 主应用地址
      window.location.origin    // 兼容云 IDE 环境
    ]
    
    window.addEventListener('message', this.handleMessage.bind(this))
  }
  
  handleMessage(event) {
    // ✅ 必须进行 origin 校验
    if (!this.allowedOrigins.includes(event.origin)) {
      console.warn('[Iframe Bridge] Invalid origin:', event.origin)
      return
    }
    
    const { type, payload } = event.data
    
    switch (type) {
      case 'NAVIGATE_TO':
        // 处理跳转
        this.navigateTo(payload.appId, payload.path)
        break
        
      case 'CUSTOM_EVENT':
        // 处理自定义事件
        this.$emit(payload.event, payload.data)
        break
    }
  }
  
  send(message) {
    window.parent.postMessage(message, '*')
  }
  
  navigateTo(appId, path) {
    this.send({
      type: 'NAVIGATE_TO',
      payload: { appId, path }
    })
  }
  
  reportHeight() {
    const height = document.documentElement.scrollHeight
    this.send({
      type: 'REPORT_HEIGHT',
      payload: { height }
    })
  }
  
  $emit(event, data) {
    this.send({
      type: 'CUSTOM_EVENT',
      payload: { event, data }
    })
  }
}

export const bridge = new IframeBridge()
```

在 main.js 中引入：

```javascript
import { bridge } from '@/utils/iframeBridge'

// 页面加载完成后报告高度
window.addEventListener('load', () => {
  bridge.reportHeight()
})
```

---

## 🔄 老项目改造实战

### 场景 1：独立 Vue 3 项目改造成子应用

**改造步骤：**

1. **安装 qiankun 插件**
   ```bash
   npm install vite-plugin-qiankun --save-dev
   ```

2. **按上述 Vue 3 步骤配置 vite.config.js 和 main.js**

3. **在主应用中注册**
   
   编辑 `packages/main-app/src/config/microApps.js`：
   ```javascript
   {
     id: 'your-app',
     name: '你的应用名称',
     entry: 'http://localhost:7080',  // 你的应用地址
     activeRule: '/your-app',         // 访问路径前缀
     container: '#micro-app-container',
     status: 'online',
     version: '1.0.0',
     preload: false,
     type: 'vue3',
     layoutType: 'default',
     layoutOptions: {
       showHeader: true,
       showSidebar: true,
       keepAlive: false
     },
     props: {
       routerBase: '/your-app'
     }
   }
   ```

4. **测试验证**
   ```bash
   # 启动你的子应用
   npm run dev
   
   # 启动主应用（在另一个终端）
   cd ../artisan-base-frontend
   npm run dev:main
   ```

5. **访问** `http://localhost:8080/your-app`

### 场景 2：Vue 2 老项目改造

**特别注意：**

- ⚠️ **路由模式**：必须使用 `abstract` 模式（qiankun 环境）
- ⚠️ **样式隔离**：避免使用全局样式重置（如 `* { margin: 0 }`）
- ⚠️ **资源路径**：使用绝对路径或 CDN 地址

**渐进式改造策略：**

1. **第一阶段**：保持现有功能不变，只接入 qiankun
2. **第二阶段**：逐步替换全局样式为 scoped
3. **第三阶段**：优化构建产物大小

### 场景 3：纯静态项目改造成 iframe 子应用

**最简单的方式：**

1. 确保项目可以独立运行
2. 配置 CORS 头
3. 在主应用中注册为 iframe 类型：

```javascript
{
  id: 'static-app',
  name: '静态应用',
  entry: 'http://localhost:9080',
  activeRule: '/static',
  type: 'iframe',
  layoutType: 'full'
}
```

---

## 🐛 常见问题与解决方案

### 问题 1：样式污染主应用

**症状：**
- 主应用的样式被子应用覆盖
- Element Plus 组件显示异常

**解决方案：**

```css
/* ❌ 错误示范：全局样式 */
* {
  margin: 0;
  padding: 0;
}

body {
  font-size: 14px;
}

/* ✅ 正确做法：scoped 样式 */
<style scoped>
.my-component {
  /* 样式只在当前组件生效 */
}
</style>

/* ✅ 或使用 CSS Modules */
<style module>
.container {
  /* 类名会被哈希化 */
}
</style>

/* ✅ 或使用命名空间 */
.your-app-prefix * {
  margin: 0;
}
</style>
```

### 问题 2：路由跳转失败

**症状：**
- 点击链接后 URL 变化但页面不刷新
- 出现 "No route matched" 错误

**解决方案：**

```javascript
// ✅ Vue 3：确保使用正确的路由模式
const router = createRouter({
  history: isQiankunMount 
    ? createMemoryHistory()  // qiankun 环境
    : createWebHistory('/')  // 独立运行
})

// ✅ Vue 2：确保使用正确的路由模式
const router = new VueRouter({
  mode: isQiankunMount ? 'abstract' : 'history',
  base: '/'
})

// ✅ 手动导航到初始路由（qiankun 环境）
if (isQiankunMount) {
  router.push(props.subPath || '/')
}
```

### 问题 3：跨域请求失败

**症状：**
- 开发环境报 CORS 错误
- 生产环境正常

**解决方案：**

```javascript
// vite.config.js
export default defineConfig({
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    }
  }
})
```

### 问题 4：卸载时报错

**症状：**
- 切换页面时控制台报错
- "Cannot read property 'vnode' of null"

**解决方案：**

```javascript
// ✅ Vue 3：不要调用 app.unmount()
unmount(props) {
  if (app && app._instance && app._instance.scope) {
    app._instance.scope.stop()  // 停止响应式系统
  }
  app = null
  router = null
  if (props.container) {
    props.container.innerHTML = ''
  }
}

// ✅ Vue 2：捕获异常
unmount() {
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
      console.warn('Unmount cleanup error (ignored):', e.message)
    }
  }
}
```

### 问题 5：Element Plus 样式重复加载

**解决方案：**

```javascript
// ✅ 只在独立运行时加载 Element Plus CSS
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  import('element-plus/dist/index.css')
}

// 在 main.js 中仍然可以使用 Element Plus
app.use(ElementPlus)
```

---

## ✅ 检查清单

### 接入前准备

- [ ] 确定子应用类型（Vue 3 / Vue 2 / iframe）
- [ ] 规划好应用 ID 和路由前缀
- [ ] 分配好端口号（避免冲突）
- [ ] 准备好 CORS 配置

### Vue 3 接入检查

- [ ] 安装 `vite-plugin-qiankun`
- [ ] 配置 `vite.config.js`（CORS、端口、插件名称）
- [ ] 改造 `main.js`（生命周期、路由模式、挂载逻辑）
- [ ] 正确处理 Element Plus CSS 加载
- [ ] 实现跨应用通信（Bridge API）
- [ ] 测试独立运行和 qiankun 模式

### Vue 2 接入检查

- [ ] 配置 `vue.config.js`（UMD 输出、CORS、端口）
- [ ] 改造 `main.js`（生命周期、路由模式、挂载逻辑）
- [ ] 确保使用正确的路由模式（abstract/history）
- [ ] 实现跨应用通信
- [ ] 测试独立运行和 qiankun 模式

### iframe 接入检查

- [ ] 配置 CORS 头
- [ ] 添加通信桥（可选）
- [ ] 测试主应用能否正常加载 iframe
- [ ] 测试 postMessage 通信

### 性能优化检查

- [ ] 启用预加载（preload: true）
- [ ] 配置 KeepAlive（适合不常变化的应用）
- [ ] 优化构建产物大小（Tree Shaking、Code Splitting）
- [ ] 使用 scoped 样式避免污染

### 安全检查

- [ ] CORS 配置合理（生产环境设置白名单）
- [ ] iframe 应用设置 sandbox 属性
- [ ] 敏感操作需要权限验证
- [ ] postMessage 通信进行 origin 校验

---

## 🎓 下一步

完成接入后，你可以继续学习：

- **[布局系统](./layout-system.md)** - 灵活控制子应用布局
- **[跨应用通信](./bridge.md)** - 深入理解通信机制
- **[性能优化](./performance.md)** - 提升加载速度
- **[部署指南](./deployment.md)** - 部署到生产环境

---

## 🆘 获取帮助

- 📖 查看示例代码：`packages/vue3-sub-app`、`packages/vue2-sub-app`
- 🐛 报告问题：GitHub Issues
- 💬 社区讨论：GitHub Discussions

---

**🎉 恭喜你完成子应用接入！现在就开始构建你的微前端应用吧！**
