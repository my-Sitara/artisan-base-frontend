# Bridge API

跨应用通信桥，基于 postMessage 实现主应用与子应用的通信。

## 导入

```javascript
import { bridge } from '@/core/bridge'
```

## 初始化

主应用通过 `setupBridge()` 完成初始化，建立 message 监听并暴露全局对象：

```javascript
import { setupBridge } from '@/core/bridge'

setupBridge()
// 初始化后 window.__ARTISAN_BRIDGE__ 可供子应用使用
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
- `targetOrigin` (string) - 目标 origin，默认 `'*'`

```javascript
bridge.send(targetWindow, {
  type: 'MESSAGE',
  payload: { data: 'hello' }
})
```

### sendToIframe(iframe, message)

发送消息到 iframe，目标 origin 自动从 `iframe.src` 提取。

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

广播消息给所有子应用（iframe + qiankun 子应用）。

qiankun 子应用通过监听 `window` 上的 `artisan:broadcast` 自定义事件接收广播。

**参数：**
- `message` (Object) - 消息对象

```javascript
bridge.broadcast({
  type: 'TOKEN_SYNC',
  payload: { token: 'xxx' }
})
```

### syncToken(token)

同步 token 到所有子应用（对 `broadcast` 的封装）。

**参数：**
- `token` (string) - Token 值

```javascript
bridge.syncToken('new-token')
```

### navigateTo(options)

跳转到子应用。

**参数：**
- `options` (Object)
  - `appId` (string) - 目标应用 ID
  - `path` (string) - 目标路径，默认 `'/'`
  - `query` (Object) - 查询参数

```javascript
bridge.navigateTo({
  appId: 'vue3-sub-app',
  path: '/list',
  query: { id: 1 }
})
```

### navigateToMain(path, query)

跳转到主应用路由。

**参数：**
- `path` (string) - 目标路径
- `query` (Object) - 查询参数

```javascript
bridge.navigateToMain('/home')
```

### destroy()

销毁 bridge，移除 message 监听器并清空所有处理器。

```javascript
bridge.destroy()
```

## 全局暴露

Bridge 在主应用初始化时通过 `window.__ARTISAN_BRIDGE__` 暴露给子应用（包含 `navigateTo`、`navigateToMain`、`send`、`on`、`off`）：

```javascript
// 在子应用中使用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
})

window.__ARTISAN_BRIDGE__.navigateToMain('/home')
```

## Origin 校验

Bridge 对接收到的消息执行来源校验，满足以下任一条件则放行：

1. origin 在 `allowedOrigins` 静态列表中
2. origin 与当前页面 `window.location.origin` 相同
3. origin 匹配 `originPatterns` 动态规则：
   - `/^https?:\/\/localhost(:\d+)?$/`（localhost 任意端口）
   - `/\.hon\.ide\.dev\.jh/`（云 IDE 环境域名）

## 内置消息类型

以下消息类型已在 Bridge 中注册默认处理器：

| 类型 | 说明 | 处理方向 |
|------|------|---------|
| NAVIGATE_TO | 跳转到子应用 | 子 → 主 |
| NAVIGATE_TO_MAIN | 跳转到主应用 | 子 → 主 |
| REQUEST_TOKEN | 请求 Token，主应用回复 TOKEN_RESPONSE | 子 → 主 |
| TOKEN_RESPONSE | Token 响应 | 主 → 子 |
| TOKEN_SYNC | Token 同步（通过 broadcast） | 主 → 子 |
| PONG | 心跳响应 | 子 → 主 |
| REPORT_HEIGHT | 高度上报（iframe） | 子 → 主 |
| MESSAGE | 通用消息（仅打印日志） | 双向 |
| PING | 心跳请求（主应用定时发送给 iframe） | 主 → 子 |
| INIT | 初始化（iframe 加载完成后发送 token） | 主 → 子 |
