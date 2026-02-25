# MicroAppManager API

微应用实例管理器，负责子应用的加载、卸载、刷新等操作。

## 导入

```javascript
import { microAppManager } from '@/core/microAppManager'
```

## 方法

### load(appId, container, options)

加载微应用。

**参数：**
- `appId` (string) - 应用ID
- `container` (HTMLElement | string) - 容器元素或选择器
- `options` (Object) - 额外选项
  - `props` (Object) - 传递给子应用的 props

**返回：** `Promise<{ instanceId, app, config }>`

```javascript
const result = await microAppManager.load(
  'vue3-sub-app',
  '#container',
  { props: { subPath: '/list' } }
)
```

### unload(instanceId)

卸载微应用实例。

**参数：**
- `instanceId` (string) - 实例ID

```javascript
await microAppManager.unload('vue3-sub-app_1_1234567890')
```

### reload(instanceId)

刷新微应用实例。

**参数：**
- `instanceId` (string) - 实例ID

```javascript
await microAppManager.reload(instanceId)
```

### preload(appIds)

预加载微应用。

**参数：**
- `appIds` (string[]) - 应用ID列表，为空则预加载所有配置了 preload 的应用

```javascript
await microAppManager.preload(['vue3-sub-app', 'vue2-sub-app'])
```

### setAppStatus(appId, status)

设置应用上下线状态。

**参数：**
- `appId` (string) - 应用ID
- `status` ('online' | 'offline') - 状态

```javascript
microAppManager.setAppStatus('vue3-sub-app', 'offline')
```

### getInstanceCount(appId)

获取实例数量。

**参数：**
- `appId` (string) - 应用ID，可选

```javascript
const count = microAppManager.getInstanceCount('vue3-sub-app')
```

### getAllInstances()

获取所有实例。

**返回：** `Object` - 实例映射

```javascript
const instances = microAppManager.getAllInstances()
```

### getErrorLogs(appId)

获取错误日志。

**参数：**
- `appId` (string) - 应用ID，可选

```javascript
const logs = microAppManager.getErrorLogs()
```

### clearErrorLogs()

清空错误日志。

```javascript
microAppManager.clearErrorLogs()
```

## 属性

### instances

响应式的实例映射。

```javascript
const instances = microAppManager.instances
```

### errorLogs

响应式的错误日志数组。

```javascript
const logs = microAppManager.errorLogs
```

### preloadStatus

预加载状态映射。

```javascript
const status = microAppManager.preloadStatus
```
