# MicroAppManager API

微应用实例管理器，负责子应用的加载、卸载、刷新等操作。每个 `appId` 同时只允许加载一个实例。

## 导入

```javascript
import { microAppManager } from '@/core/microAppManager'
```

## 方法

### load(appId, container, options)

加载微应用。

**参数：**
- `appId` (string) - 应用 ID
- `container` (HTMLElement | string) - 容器元素或 CSS 选择器字符串
- `options` (Object) - 额外选项
  - `props` (Object) - 额外传递给子应用的 props
  - `mainRouter` (Router) - 主应用路由实例

**返回：** `Promise<{ appId, app, config } | null>`（link 类型返回 null）

```javascript
const result = await microAppManager.load(
  'vue3-sub-app',
  document.getElementById('container'),
  { props: { subPath: '/list' } }
)
```

### unload(appId)

卸载微应用。

**参数：**
- `appId` (string) - 应用 ID

```javascript
await microAppManager.unload('vue3-sub-app')
```

### reload(appId)

刷新微应用（先卸载再重新加载）。

**参数：**
- `appId` (string) - 应用 ID

```javascript
await microAppManager.reload('vue3-sub-app')
```

### preload(appIds)

预加载微应用资源（不挂载）。

**参数：**
- `appIds` (string[]) - 应用 ID 列表，为空则预加载所有配置了 `preload: true` 的在线应用

```javascript
// 预加载指定应用
await microAppManager.preload(['vue3-sub-app', 'vue2-sub-app'])

// 预加载所有配置了 preload 的应用
await microAppManager.preload()
```

### setAppStatus(appId, status)

设置应用上下线状态。下线时会自动卸载已加载的实例。

**参数：**
- `appId` (string) - 应用 ID
- `status` ('online' | 'offline') - 状态

```javascript
microAppManager.setAppStatus('vue3-sub-app', 'offline')
```

### isAppLoaded(appId)

判断应用是否已加载。

**参数：**
- `appId` (string) - 应用 ID

**返回：** `boolean`

```javascript
const loaded = microAppManager.isAppLoaded('vue3-sub-app')
```

### getLoadedCount()

获取已加载应用数量。

**返回：** `number`

```javascript
const count = microAppManager.getLoadedCount()
```

### getErrorLogs(appId)

获取错误日志。最多保留最近 100 条记录。

**参数：**
- `appId` (string) - 应用 ID，可选；不传则返回所有错误日志

**返回：** `Array<{ appId, message, stack, time }>`

```javascript
// 获取所有错误日志
const logs = microAppManager.getErrorLogs()

// 获取指定应用的错误日志
const appLogs = microAppManager.getErrorLogs('vue3-sub-app')
```

### clearErrorLogs()

清空所有错误日志。

```javascript
microAppManager.clearErrorLogs()
```

## 属性

### loadedApps

响应式对象，记录所有已加载的应用信息，以 `appId` 为键。

```javascript
// 结构：{ appId: { app, config, status, loadTime, errors, container } }
const apps = microAppManager.loadedApps
```

### errorLogs

响应式数组，记录错误日志。

```javascript
const logs = microAppManager.errorLogs
```

### preloadStatus

预加载状态映射，以 `appId` 为键。

```javascript
// 结构：{ appId: 'prefetched' }
const status = microAppManager.preloadStatus
```

## 全局调试

主应用启动时，管理器实例被挂载到 `window.__ARTISAN_MICRO_APP_MANAGER__`，可在浏览器控制台直接访问：

```javascript
// 在控制台中调试
window.__ARTISAN_MICRO_APP_MANAGER__.loadedApps
window.__ARTISAN_MICRO_APP_MANAGER__.getErrorLogs()
```
