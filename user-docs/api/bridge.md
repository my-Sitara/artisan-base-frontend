# Bridge API

跨应用通信桥，基于 postMessage 实现主应用与子应用的通信。

## 导入

```javascript
import { bridge } from '@/core/bridge'
```

## 方法

### on(type, handler)

注册消息处理器。

**参数：**
- `type` (string) - 消息类型
- `handler` (Function) - 处理函数 `(payload, source, origin) => void`

```javascript
bridge.on('CUSTOM_MESSAGE', (payload, source, origin) => {
  console.log('Received:', payload)
})
```

### off(type)

移除消息处理器。

**参数：**
- `type` (string) - 消息类型

```javascript
bridge.off('CUSTOM_MESSAGE')
```

### send(targetWindow, message, targetOrigin)

发送消息到指定窗口。

**参数：**
- `targetWindow` (Window) - 目标窗口
- `message` (Object) - 消息对象 `{ type, payload }`
- `targetOrigin` (string) - 目标 origin，默认 '*'

```javascript
bridge.send(targetWindow, {
  type: 'MESSAGE',
  payload: { data: 'hello' }
})
```

### sendToIframe(iframe, message)

发送消息到 iframe。

**参数：**
- `iframe` (HTMLIFrameElement) - iframe 元素
- `message` (Object) - 消息对象

```javascript
bridge.sendToIframe(iframe, {
  type: 'TOKEN_SYNC',
  payload: { token: 'xxx' }
})
```

### broadcast(message)

广播消息给所有子应用。

**参数：**
- `message` (Object) - 消息对象

```javascript
bridge.broadcast({
  type: 'TOKEN_SYNC',
  payload: { token: 'xxx' }
})
```

### syncToken(token)

同步 token 到所有子应用。

**参数：**
- `token` (string) - Token 值

```javascript
bridge.syncToken('new-token')
```

### navigateTo(options)

跳转到子应用。

**参数：**
- `options` (Object)
  - `appId` (string) - 目标应用ID
  - `path` (string) - 目标路径，默认 '/'
  - `query` (Object) - 查询参数

```javascript
bridge.navigateTo({
  appId: 'vue3-sub-app',
  path: '/list',
  query: { id: 1 }
})
```

### navigateToMain(path, query)

跳转到主应用。

**参数：**
- `path` (string) - 目标路径
- `query` (Object) - 查询参数

```javascript
bridge.navigateToMain('/home')
```

## 全局暴露

Bridge 在主应用初始化时暴露到 `window.__ARTISAN_BRIDGE__`：

```javascript
// 在子应用中使用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
})
```

## 内置消息类型

| 类型 | 说明 |
|------|------|
| NAVIGATE_TO | 跳转到子应用 |
| NAVIGATE_TO_MAIN | 跳转到主应用 |
| REQUEST_TOKEN | 请求 Token |
| TOKEN_RESPONSE | Token 响应 |
| TOKEN_SYNC | Token 同步 |
| LOGOUT | 登出通知 |
| REPORT_HEIGHT | 高度上报 (iframe) |
| PING | 心跳请求 |
| PONG | 心跳响应 |
| MESSAGE | 通用消息 |
