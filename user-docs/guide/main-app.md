# 主应用

主应用是微前端架构的核心枢纽，负责子应用的加载、管理、调度和跨应用通信。

## 📦 技术栈

主应用采用现代化的技术栈构建：

- **Vue**: 3.5.29 - 响应式框架
- **Vite**: 7.3.1 - 下一代构建工具
- **Vue Router**: 5.0.3 - 官方路由
- **Pinia**: 3.x - Vue 3 状态管理库
- **Pinia Plugin Persistedstate**: 4.2.3 - Pinia 持久化插件
- **qiankun**: 2.10.16 - 微前端框架（loadMicroApp 模式）
- **Element Plus**: 2.13.2 - UI 组件库
- **Axios**: 1.13.5 - HTTP 客户端
- **Grid Layout Plus**: 1.1.1 - 网格布局组件

## 🚀 启动流程

主应用在 `main.js` 中按严格的顺序初始化：

```javascript
// packages/main-app/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { setupBridge } from './core/bridge'
import App from './App.vue'

const app = createApp(App)

// 1. 创建 Pinia 实例并配置持久化
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 2. 获取 AppStore 并初始化微应用配置
const appStore = useAppStore()
await appStore.initialize()  // 在路由安装前完成

// 3. 安装路由和 UI 库
app.use(router)
app.use(ElementPlus)

// 4. 设置跨应用通信桥
setupBridge()

// 5. 挂载应用
app.mount('#app')
```

**关键点**：
- ✅ 微应用配置必须在路由安装前加载完成
- ✅ Bridge 监听器在挂载前设置
- ✅ Pinia 持久化自动启用

## 🏛️ 核心模块

### 1. MicroAppManager（微应用管理器）

**位置**: `packages/main-app/src/core/microAppManager.js`

微应用实例管理器，以 `appId` 为唯一标识，同一应用同时只允许存在一个实例。

#### 主要功能

- **多类型支持**: vue3/vue2/iframe/link 四种类型
- **实例管理**: 防止重复加载，操作状态控制
- **热更新检测**: 基于 lastModified 自动检测更新
- **预加载系统**: 使用 qiankun 的 prefetchApps API
- **心跳检测**: 30 秒定时检测应用健康状态
- **错误收集**: 自动记录运行时错误（最多 100 条）
- **样式清理**: 卸载时清理子应用注入的样式，防止污染

#### 核心方法

```javascript
import { microAppManager } from '@/core/microAppManager'

// 加载子应用
const result = await microAppManager.load(
  'vue3-sub-app',
  document.getElementById('container'),
  { 
    props: { subPath: '/list' },
    mainRouter: router
  }
)

// 卸载子应用
await microAppManager.unload('vue3-sub-app')

// 刷新子应用（先卸载再加载）
await microAppManager.reload('vue3-sub-app')

// 预加载资源（不挂载）
await microAppManager.preload(['vue3-sub-app', 'vue2-sub-app'])

// 设置应用状态
microAppManager.setAppStatus('vue3-sub-app', 'offline')

// 检查是否已加载
const loaded = microAppManager.isAppLoaded('vue3-sub-app')

// 获取已加载数量
const count = microAppManager.getLoadedCount()

// 获取错误日志
const logs = microAppManager.getErrorLogs('vue3-sub-app')

// 清空错误日志
microAppManager.clearErrorLogs()
```

#### 重要属性

```javascript
// 已加载的应用信息（响应式）
microAppManager.loadedApps
// 结构：{ appId: { app, config, status, loadTime, errors, container } }

// 错误日志（响应式）
microAppManager.errorLogs

// 预加载状态
microAppManager.preloadStatus
```

#### Iframe 特殊处理

Iframe 类型应用使用独立的加载器：
- 创建 `<iframe>` 元素而非使用 qiankun
- 通过 postMessage 发送 INIT 消息传递 token
- 独立的 iframe 心跳检测机制
- 卸载时直接移除 DOM 节点

### 2. Bridge（跨应用通信桥）

**位置**: `packages/main-app/src/core/bridge.js`

基于 postMessage 实现主应用与子应用的通信。

#### Origin 校验机制

支持静态白名单 + 动态正则匹配：

```javascript
this.allowedOrigins = [
  'http://localhost:8080',
  window.location.origin  // 自动添加当前 origin
]

this.originPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,  // localhost 任意端口
  /\.hon\.ide\.dev\.jh/              // 云 IDE 域名
]
```

#### 内置消息处理器

Bridge 注册了以下默认处理器：

| 消息类型 | 方向 | 说明 |
|---------|------|------|
| NAVIGATE_TO | 子→主 | 跳转到指定子应用 |
| NAVIGATE_TO_MAIN | 子→主 | 跳转到主应用路由 |
| REQUEST_TOKEN | 子→主 | 请求 token，回复 TOKEN_RESPONSE |
| TOKEN_RESPONSE | 主→子 | Token 响应 |
| TOKEN_SYNC | 主→子 | Token 同步广播 |
| PING | 主→子 | 心跳请求（发送给 iframe） |
| PONG | 子→主 | 心跳响应 |
| REPORT_HEIGHT | 子→主 | Iframe 高度上报 |
| MESSAGE | 双向 | 通用消息（仅日志） |

#### 核心方法

```javascript
import { bridge } from '@/core/bridge'

// 发送消息到指定窗口
bridge.send(targetWindow, {
  type: 'MESSAGE',
  payload: { data: 'hello' }
})

// 发送消息到 iframe（自动提取 origin）
bridge.sendToIframe(iframe, {
  type: 'TOKEN_SYNC',
  payload: { token: 'xxx' }
})

// 广播给所有子应用
bridge.broadcast({
  type: 'TOKEN_SYNC',
  payload: { token }
})

// 跳转到子应用
bridge.navigateTo({
  appId: 'vue3-sub-app',
  path: '/list',
  query: { id: 1 }
})

// 跳转到主应用
bridge.navigateToMain('/home')

// 注册消息处理器
bridge.on('CUSTOM_EVENT', (payload, source, origin) => {
  console.log('Received:', payload)
})

// 移除处理器
bridge.off('CUSTOM_EVENT')

// 销毁 bridge
bridge.destroy()
```

#### 全局暴露

Bridge 在初始化时暴露给子应用：

```javascript
window.__ARTISAN_BRIDGE__ = {
  navigateTo: bridge.navigateTo.bind(bridge),
  navigateToMain: bridge.navigateToMain.bind(bridge),
  send: bridge.send.bind(bridge),
  on: bridge.on.bind(bridge),
  off: bridge.off.bind(bridge)
}
```

### 3. LayoutManager（布局管理器）

**位置**: `packages/main-app/src/core/layoutManager.js`

负责动态布局切换和布局选项配置。

#### 4 种布局类型

```javascript
export const LayoutTypes = {
  DEFAULT: 'default',      // 默认布局（头部 + 侧边栏）
  FULL: 'full',           // 全屏布局（无导航）
  EMBEDDED: 'embedded',   // 嵌入式布局（轻量级）
  BLANK: 'blank'          // 空白布局（仅内容）
}
```

#### 布局选项

```javascript
layoutOptions: {
  showHeader: true,    // 显示头部
  showSidebar: true,   // 显示侧边栏
  showFooter: false,   // 显示底部
  keepAlive: false     // 页面缓存
}
```

#### 核心方法

```javascript
import { layoutManager } from '@/core/layoutManager'

// 设置布局类型
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false
})

// 更新布局选项
layoutManager.updateOptions({ showFooter: true })

// 根据微应用配置设置布局
layoutManager.setLayoutFromMicroApp(microAppConfig)

// 重置为默认布局
layoutManager.reset()

// 获取当前布局类型
const type = layoutManager.getLayoutType()

// 获取布局选项
const options = layoutManager.getLayoutOptions()

// 监听布局变化
layoutManager.onChange(({ prevType, currentType, options }) => {
  console.log('Layout changed:', prevType, '->', currentType)
})

// 移除监听
layoutManager.offChange(callback)
```

#### 自动布局切换

在 `App.vue` 的路由守卫中实现自动布局切换：

```javascript
// 从子应用返回主应用页面时，重置为默认布局
if (wasInSubApp && !isInSubApp) {
  layoutManager.reset()
}

// 进入子应用时，应用微应用的布局配置
if (microAppConfig) {
  layoutManager.setLayoutFromMicroApp(microAppConfig)
}
```

## 🗄️ 状态管理

### useAppStore

**位置**: `packages/main-app/src/stores/app.js`

管理微应用列表和侧边栏状态。

```javascript
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 初始化微应用配置（自动选择 mock 或 api）
await appStore.initialize()

// 读取应用列表
const apps = appStore.apps
const onlineApps = appStore.onlineApps

// 更新应用状态
appStore.setAppStatus('vue3-sub-app', 'offline')

// 添加/删除应用
appStore.addApp(newAppConfig)
appStore.removeApp('vue3-sub-app')

// 侧边栏状态
appStore.sidebarCollapsed = true
```

### useUserStore

**位置**: `packages/main-app/src/stores/user.js`

管理用户信息和 token（带持久化）。

```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 读取 token
const token = userStore.token

// 设置 token（自动同步到所有子应用）
userStore.setToken('new-token')
```

**持久化配置**：
```javascript
persist: {
  key: 'artisan-user',
  paths: ['token']
}
```

## 📄 页面说明

### 首页（Home.vue）

**路由**: `/`

平台概览仪表盘，展示：
- 在线/离线子应用状态
- 快速导航入口
- 平台特性介绍

### 子应用页面（SubAppPage.vue）

**路由**: `/app/:appId`、`/vue3/:pathMatch*`、`/vue2/:pathMatch*`、`/iframe/:pathMatch*`

根据应用类型渲染不同的容器：
- **MicroAppContainer**: qiankun 子应用（vue3/vue2）
- **IframeContainer**: iframe 子应用
- **ExternalLink**: link 类型提示

### 多应用同屏（MultiInstancePage.vue）

**路由**: `/multi-instance`

同时加载多个不同子应用实例：
- 支持 Grid/Split 布局
- 独立管理每个实例
- 互不干扰

### 应用加载管理（AppLoading.vue）

**路由**: `/app-management/loading`

微应用列表管理页面：
- 表格展示所有应用
- 编辑应用配置
- 布局预览
- 上下线切换
- 强制刷新

### 错误日志（ErrorLogs.vue）

**路由**: `/app-management/error-logs`

查看和管理运行时错误：
- 按应用筛选错误
- 查看错误详情
- 清空错误日志
- 实时错误统计

## ⚙️ 微应用配置

微应用配置由 `config/microApps.js` 统一管理。

### 数据源模式

通过环境变量 `VITE_USE_MICRO_APPS_API` 控制：

**Mock 模式**（默认）：
```javascript
// .env.mock
VITE_USE_MICRO_APPS_API=false
```
从 `mock/microApps.js` 加载本地配置。

**API 模式**：
```javascript
// .env.development
VITE_USE_MICRO_APPS_API=true
VITE_MICRO_APPS_API_URL=http://your-backend.com/api/micro-apps
```
从后端接口动态加载配置。

### 配置结构

```javascript
{
  id: 'vue3-sub-app',           // 唯一标识（必须与 vite-plugin-qiankun 注册名一致）
  name: 'Vue3 子应用',           // 应用名称
  entry: '//localhost:7080',    // 入口地址（完整 URL）
  activeRule: '/vue3',          // 激活规则（路由前缀）
  type: 'vue3',                 // 应用类型
  layoutType: 'default',        // 布局类型
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    keepAlive: false
  },
  status: 'online',             // online | offline
  version: '1.0.0',             // 版本号
  lastModified: Date.now(),     // 最后修改时间（热更新检测）
  preload: true,                // 是否预加载
  props: {}                     // 传递给子应用的额外属性
}
```

### 布局配置标准化

使用 `normalizeLayoutConfig()` 函数自动标准化配置：

```javascript
import { normalizeLayoutConfig } from '@/config/layoutConfig'

const normalized = normalizeLayoutConfig('default', {
  showHeader: true
})

// 自动应用该布局类型的默认值和约束
```

## 🔍 调试技巧

### 全局调试对象

主应用在控制台暴露全局对象：

```javascript
// 微应用管理器
window.__ARTISAN_MICRO_APP_MANAGER__

// 跨应用通信桥
window.__ARTISAN_BRIDGE__

// 布局管理器
window.__ARTISAN_LAYOUT_MANAGER__
```

### 控制台调试

```javascript
// 查看已加载的应用
console.log(window.__ARTISAN_MICRO_APP_MANAGER__.loadedApps)

// 查看错误日志
console.log(window.__ARTISAN_MICRO_APP_MANAGER__.getErrorLogs())

// 测试跨应用跳转
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue3-sub-app',
  path: '/'
})

// 测试布局切换
window.__ARTISAN_LAYOUT_MANAGER__.setLayout('full')
```

### 网络面板

在浏览器开发者工具中：
- 查看子应用资源加载情况
- 监控 postMessage 消息
- 检查 CORS 请求头

## 🎯 最佳实践

### 1. 样式隔离

使用 qiankun 的实验性样式隔离：

```javascript
loadMicroApp({ ... }, {
  sandbox: {
    experimentalStyleIsolation: true
  }
})
```

### 2. 避免内存泄漏

- Iframe 子应用卸载时移除 message 监听器
- qiankun 子应用 unmount 时清理定时器
- 及时注销 Bridge 处理器

### 3. 错误处理

- 捕获并记录所有加载错误
- 提供友好的错误提示
- 定期清理错误日志

### 4. 性能优化

- 对常用应用启用预加载
- 使用 keepAlive 缓存频繁切换的应用
- 避免频繁加载/卸载同一应用

## 📖 相关文档

- [配置 API](../api/config.md) - 详细的配置项说明
- [MicroAppManager API](../api/micro-app-manager.md) - 管理器完整 API
- [Bridge API](../api/bridge.md) - 跨应用通信详解
- [布局系统](./layout-system.md) - 布局配置指南
