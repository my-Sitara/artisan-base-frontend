# API 参考总结

本文档提供 Artisan 微前端平台所有核心 API 的快速参考。

## 📚 目录

- [MicroAppManager](#microappmanager) - 微应用实例管理
- [Bridge](#bridge) - 跨应用通信
- [LayoutManager](#layoutmanager) - 布局管理
- [配置 API](#配置-api) - 微应用配置管理

---

## MicroAppManager

**导入**:
```javascript
import { microAppManager } from '@/core/microAppManager'
```

### 实例管理

#### load(appId, container, options)
加载微应用。

```javascript
const result = await microAppManager.load(
  'vue3-sub-app',
  document.getElementById('container'),
  { 
    props: { subPath: '/list' },
    mainRouter: router
  }
)
```

**参数**:
- `appId` (string): 应用 ID
- `container` (HTMLElement | string): 容器元素或选择器
- `options` (Object): 额外选项
  - `props`: 传递给子应用的 props
  - `mainRouter`: 主应用路由实例

**返回**: `Promise<{ appId, app, config } | null>`

#### unload(appId)
卸载微应用。

```javascript
await microAppManager.unload('vue3-sub-app')
```

#### reload(appId)
刷新微应用（先卸载再重新加载）。

```javascript
await microAppManager.reload('vue3-sub-app')
```

#### preload(appIds)
预加载微应用资源（不挂载）。

```javascript
// 预加载指定应用
await microAppManager.preload(['vue3-sub-app', 'vue2-sub-app'])

// 预加载所有配置了 preload 的应用
await microAppManager.preload()
```

### 状态管理

#### setAppStatus(appId, status)
设置应用上下线状态。

```javascript
microAppManager.setAppStatus('vue3-sub-app', 'offline')
```

**参数**:
- `appId` (string): 应用 ID
- `status` ('online' | 'offline'): 状态

#### isAppLoaded(appId)
判断应用是否已加载。

```javascript
const loaded = microAppManager.isAppLoaded('vue3-sub-app')
```

**返回**: `boolean`

#### getLoadedCount()
获取已加载应用数量。

```javascript
const count = microAppManager.getLoadedCount()
```

**返回**: `number`

### 错误管理

#### getErrorLogs(appId?)
获取错误日志（最多保留 100 条）。

```javascript
// 获取所有错误
const logs = microAppManager.getErrorLogs()

// 获取指定应用的错误
const appLogs = microAppManager.getErrorLogs('vue3-sub-app')
```

**返回**: `Array<{ appId, message, stack, time }>`

#### clearErrorLogs()
清空所有错误日志。

```javascript
microAppManager.clearErrorLogs()
```

### 属性

#### loadedApps
响应式对象，记录所有已加载的应用信息。

```javascript
// 结构：{ appId: { app, config, status, loadTime, errors, container } }
const apps = microAppManager.loadedApps
```

#### errorLogs
响应式数组，记录错误日志。

```javascript
const logs = microAppManager.errorLogs
```

#### preloadStatus
预加载状态映射。

```javascript
// 结构：{ appId: 'prefetched' }
const status = microAppManager.preloadStatus
```

### Iframe 特殊处理

#### startIframeHeartbeat(appId, iframe)
启动 iframe 心跳检测（内部使用）。

```javascript
startIframeHeartbeat(appId, iframe) {
  this.heartbeatTimers[appId] = setInterval(() => {
    bridge.sendToIframe(iframe, {
      type: 'PING',
      payload: { time: Date.now() }
    })
  }, 30000)
}
```

---

## Bridge

**导入**:
```javascript
import { bridge } from '@/core/bridge'
```

### 消息处理

#### on(type, handler)
注册消息处理器。

```javascript
bridge.on('CUSTOM_EVENT', (payload, source, origin) => {
  console.log('Received:', payload)
})
```

**参数**:
- `type` (string): 消息类型
- `handler` (Function): 处理函数 `(payload, source, origin) => void`

#### off(type)
移除消息处理器。

```javascript
bridge.off('CUSTOM_EVENT')
```

#### send(targetWindow, message, targetOrigin?)
发送消息到指定窗口。

```javascript
bridge.send(targetWindow, {
  type: 'MESSAGE',
  payload: { data: 'hello' }
}, '*')
```

**参数**:
- `targetWindow` (Window): 目标窗口
- `message` (Object): 消息对象 `{ type, payload }`
- `targetOrigin` (string): 目标 origin，默认 `'*'`

#### sendToIframe(iframe, message)
发送消息到 iframe。

```javascript
bridge.sendToIframe(iframe, {
  type: 'TOKEN_SYNC',
  payload: { token: 'xxx' }
})
```

#### broadcast(message)
广播消息给所有子应用。

```javascript
bridge.broadcast({
  type: 'TOKEN_SYNC',
  payload: { token }
})
```

### Token 管理

#### syncToken(token)
同步 token 到所有子应用。

```javascript
bridge.syncToken('new-token')
```

### 导航

#### navigateTo(options)
跳转到子应用。

```javascript
bridge.navigateTo({
  appId: 'vue3-sub-app',
  path: '/list',
  query: { id: 1 }
})
```

**参数**:
- `options` (Object):
  - `appId` (string): 目标应用 ID
  - `path` (string): 目标路径，默认 `'/'`
  - `query` (Object): 查询参数

#### navigateToMain(path, query?)
跳转到主应用。

```javascript
bridge.navigateToMain('/home', { tab: 'settings' })
```

**参数**:
- `path` (string): 目标路径
- `query` (Object): 查询参数

### 生命周期

#### destroy()
销毁 bridge，移除监听器。

```javascript
bridge.destroy()
```

### 全局暴露

Bridge 在初始化时暴露给子应用：

```javascript
window.__ARTISAN_BRIDGE__ = {
  navigateTo,
  navigateToMain,
  send,
  on,
  off
}
```

**在子应用中使用**:
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

### 内置消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| NAVIGATE_TO | 子→主 | 跳转到子应用 |
| NAVIGATE_TO_MAIN | 子→主 | 跳转到主应用 |
| REQUEST_TOKEN | 子→主 | 请求 token |
| TOKEN_RESPONSE | 主→子 | Token 响应 |
| TOKEN_SYNC | 主→子 | Token 同步广播 |
| PING | 主→子 | 心跳请求（iframe） |
| PONG | 子→主 | 心跳响应 |
| REPORT_HEIGHT | 子→主 | Iframe 高度上报 |
| MESSAGE | 双向 | 通用消息 |
| INIT | 主→子 | 初始化消息 |

---

## LayoutManager

**导入**:
```javascript
import { layoutManager } from '@/core/layoutManager'
```

### 布局类型

```javascript
export const LayoutTypes = {
  DEFAULT: 'default',      // 默认布局
  FULL: 'full',           // 全屏布局
  EMBEDDED: 'embedded',   // 嵌入式布局
  BLANK: 'blank'          // 空白布局
}
```

### 布局设置

#### setLayout(type, options?)
设置布局类型和选项。

```javascript
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false,
  showFooter: false
})
```

**参数**:
- `type` (string): 布局类型
- `options` (Object): 布局选项

#### updateOptions(options)
更新布局选项。

```javascript
layoutManager.updateOptions({
  showFooter: true
})
```

#### setLayoutFromMicroApp(microAppConfig)
根据微应用配置设置布局。

```javascript
layoutManager.setLayoutFromMicroApp({
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true
  }
})
```

#### reset()
重置为默认布局。

```javascript
layoutManager.reset()
```

### 获取布局信息

#### getLayoutType()
获取当前布局类型。

```javascript
const type = layoutManager.getLayoutType()
```

**返回**: `string`

#### getLayoutOptions()
获取当前布局选项。

```javascript
const options = layoutManager.getLayoutOptions()
```

**返回**: `Object`

### 监听变化

#### onChange(callback)
监听布局变化。

```javascript
layoutManager.onChange(({ prevType, currentType, options }) => {
  console.log('Layout changed:', prevType, '->', currentType)
})
```

#### offChange(callback)
移除监听器。

```javascript
layoutManager.offChange(callback)
```

### 布局选项

```javascript
layoutOptions: {
  showHeader: true,    // 显示头部
  showSidebar: true,   // 显示侧边栏
  showFooter: false,   // 显示底部
  keepAlive: false     // 页面缓存
}
```

### 布局约束

不同布局类型的约束条件：

| 布局类型 | 约束条件 |
|---------|---------|
| default | 无强制约束 |
| full | 强制隐藏 header、sidebar |
| embedded | 强制隐藏 sidebar |
| blank | 强制隐藏 header、sidebar |

---

## 配置 API

### 微应用配置结构

```javascript
{
  id: string,                    // 唯一标识（必须与 vite-plugin-qiankun 注册名一致）
  name: string,                  // 应用名称
  entry: string,                 // 入口地址（完整 URL）
  activeRule: string,            // 激活规则（路由前缀）
  type: 'vue3' | 'vue2' | 'iframe' | 'link',  // 应用类型
  layoutType: 'default' | 'full' | 'embedded' | 'blank',  // 布局类型
  layoutOptions: {
    showHeader?: boolean,        // 显示头部
    showSidebar?: boolean,       // 显示侧边栏
    showFooter?: boolean,        // 显示底部
    keepAlive?: boolean          // 页面缓存
  },
  status: 'online' | 'offline',  // 状态
  version: string,               // 版本号
  lastModified: number,          // 最后修改时间戳
  preload: boolean,              // 是否预加载
  props?: object                 // 传递给子应用的属性
}
```

### 配置示例

```javascript
// packages/main-app/src/mock/microApps.js
{
  id: 'vue3-sub-app',
  name: 'Vue3 子应用',
  entry: 'http://localhost:7080',
  activeRule: '/vue3',
  type: 'vue3',
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    keepAlive: false
  },
  status: 'online',
  version: '1.0.0',
  lastModified: Date.now(),
  preload: true,
  props: {
    routerBase: '/vue3'
  }
}
```

### 配置标准化

使用 `normalizeLayoutConfig()` 自动应用布局约束：

```javascript
import { normalizeLayoutConfig } from '@/config/layoutConfig'

const normalized = normalizeLayoutConfig('embedded', {
  showHeader: true,
  showSidebar: true  // 会被约束覆盖为 false
})

console.log(normalized.layoutOptions.showSidebar)  // false
```

### 环境变量

主应用支持以下环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_USE_MICRO_APPS_API` | `false` | `true`: 从 API 加载<br>`false`: 使用 mock |
| `VITE_MICRO_APPS_API_URL` | `/api/micro-apps` | 后端 API 地址 |

---

## 全局调试对象

主应用在控制台暴露全局对象：

```javascript
// 微应用管理器
window.__ARTISAN_MICRO_APP_MANAGER__

// 跨应用通信桥
window.__ARTISAN_BRIDGE__

// 布局管理器
window.__ARTISAN_LAYOUT_MANAGER__
```

**调试示例**:
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

---

## 相关文档

- [MicroAppManager API](./micro-app-manager.md) - 详细文档
- [Bridge API](./bridge.md) - 详细文档
- [配置 API](./config.md) - 详细文档
- [主应用开发](../guide/main-app.md) - 主模块使用详解
- [子应用开发](../guide/sub-apps.md) - 子应用集成指南
