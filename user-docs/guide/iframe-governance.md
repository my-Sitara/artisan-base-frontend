# iframe 跨域治理

## 安全策略

### 禁止直接访问 DOM

```javascript
// ❌ 错误 - 禁止直接访问
iframe.contentWindow.document.body

// ✅ 正确 - 使用 postMessage
iframe.contentWindow.postMessage(message, targetOrigin)
```

### Origin 校验

```javascript
// 主应用
const allowedOrigins = [
  'http://localhost:9080'
  'https://your-domain.com'
]

window.addEventListener('message', (event) => {
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('Rejected message from:', event.origin)
    return
  }
  // 处理消息
})
```

### Sandbox 限制

```html
<iframe
  src="..."
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
></iframe>
```

## 通信协议

### 消息格式

```typescript
interface Message {
  type: string       // 消息类型
  payload: any       // 消息数据
}
```

### 内置消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| INIT | 主→子 | 初始化，传递 token 等 |
| TOKEN_SYNC | 主→子 | token 同步 |
| TOKEN_RESPONSE | 主→子 | token 响应 |
| REQUEST_TOKEN | 子→主 | 请求 token |
| REPORT_HEIGHT | 子→主 | 上报高度 |
| NAVIGATE_TO | 子→主 | 跳转请求 |
| PING/PONG | 双向 | 心跳检测 |

## 高度自适应

### 子应用上报

```javascript
// iframe 子应用
function reportHeight() {
  const height = document.documentElement.scrollHeight
  window.parent.postMessage({
    type: 'REPORT_HEIGHT',
    payload: { height, instanceId }
  }, '*')
}

// 页面加载和 resize 时上报
window.addEventListener('load', reportHeight)
window.addEventListener('resize', debounce(reportHeight, 200))
```

### 主应用处理

```javascript
// 主应用
bridge.on('REPORT_HEIGHT', (payload) => {
  const { height, instanceId } = payload
  const iframe = document.getElementById(`iframe-${instanceId}`)
  if (iframe) {
    iframe.style.height = `${height}px`
  }
})
```

## 心跳检测

```javascript
// 主应用发送 PING
setInterval(() => {
  bridge.sendToIframe(iframe, {
    type: 'PING',
    payload: { time: Date.now() }
  })
}, 30000)

// 子应用响应 PONG
bridge.on('PING', (payload) => {
  bridge.send({
    type: 'PONG',
    payload: { time: Date.now(), pingTime: payload.time }
  })
})
```

## 卸载清理

```javascript
// 卸载 iframe 时清理监听器
function unloadIframe(id) {
  const instance = iframes.get(id)
  
  // 移除消息监听
  if (instance.messageHandler) {
    window.removeEventListener('message', instance.messageHandler)
  }
  
  // 停止心跳
  clearInterval(instance.heartbeatTimer)
  
  // 移除 DOM
  instance.iframe.remove()
  
  iframes.delete(id)
}
```
