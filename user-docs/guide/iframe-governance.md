# iframe 跨域治理

## 安全策略

### 禁止直接访问 DOM

```javascript
// 禁止直接访问（跨域限制）
iframe.contentWindow.document.body

// 正确：使用 postMessage
iframe.contentWindow.postMessage(message, targetOrigin)
```

### Origin 校验

主应用 bridge 支持静态列表 + 动态匹配两种方式校验 origin：

```javascript
// 主应用（bridge.js）
this.allowedOrigins = [
  'http://localhost:8080',
  window.location.origin  // 当前页面 origin 自动加入白名单
]

// 动态匹配规则（兼容云 IDE 等环境）
this.originPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,  // 匹配 localhost 任意端口
  /\.hon\.ide\.dev\.jh/              // 匹配云 IDE 域名
]

window.addEventListener('message', (event) => {
  const isAllowedOrigin = this.allowedOrigins.includes(event.origin) ||
    event.origin === window.location.origin ||
    this.originPatterns.some(pattern => pattern.test(event.origin))

  if (!isAllowedOrigin) {
    console.warn('[Bridge] Rejected message from:', event.origin)
    return
  }
  // 处理消息...
})
```

### Sandbox 限制

主应用为 iframe 设置了 sandbox 属性限制权限：

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
  type: string   // 消息类型
  payload: any   // 消息数据
}
```

### 内置消息类型

| 类型 | 方向 | 说明 |
|------|------|------|
| INIT | 主 → 子 | 初始化，传递 token 等信息 |
| TOKEN_SYNC | 主 → 子 | token 同步 |
| TOKEN_RESPONSE | 主 → 子 | token 请求的响应 |
| REQUEST_TOKEN | 子 → 主 | 请求 token |
| REPORT_HEIGHT | 子 → 主 | 上报内容高度 |
| NAVIGATE_TO | 子 → 主 | 跳转请求 |
| PING | 主 → 子 | 心跳请求（每 30 秒） |
| PONG | 子 → 主 | 心跳响应 |

## 高度自适应

### 子应用上报

```javascript
// iframe 子应用
function reportHeight() {
  const height = document.documentElement.scrollHeight
  window.parent.postMessage({
    type: 'REPORT_HEIGHT',
    payload: { height, appId: 'iframe-sub-app' }
  }, '*')
}

// 页面加载和 resize 时上报
window.addEventListener('load', reportHeight)
window.addEventListener('resize', debounce(reportHeight, 200))
```

### 主应用处理

```javascript
// 主应用（bridge.js 内置处理器）
bridge.on('REPORT_HEIGHT', (payload) => {
  const { height, appId } = payload
  const iframe = document.getElementById(`iframe-${appId}`)
  if (iframe) {
    iframe.style.height = `${height}px`
  }
})
```

## 心跳检测

```javascript
// 主应用定时发送 PING（microAppManager.js）
startIframeHeartbeat(appId, iframe) {
  this.heartbeatTimers[appId] = setInterval(() => {
    bridge.sendToIframe(iframe, {
      type: 'PING',
      payload: { time: Date.now() }
    })
  }, 30000)
}

// iframe 子应用响应 PONG
bridge.on('PING', (payload) => {
  bridge.send({
    type: 'PONG',
    payload: { time: Date.now(), pingTime: payload.time }
  })
})
```

## 初始化流程

iframe 加载完成后，主应用自动发送 INIT 消息传递 token：

```javascript
// microAppManager.js
iframe.onload = () => {
  bridge.sendToIframe(iframe, {
    type: 'INIT',
    payload: {
      token: userStore.token,
      appId: appId
    }
  })
  this.startIframeHeartbeat(appId, iframe)
}
```

## 卸载清理

主应用卸载 iframe 时会停止心跳并清理 DOM：

```javascript
// microAppManager.unload() 内部处理
async unload(appId) {
  // 停止心跳
  this.stopHeartbeat(appId)

  // 移除 iframe DOM
  if (appInfo.app && appInfo.app.parentNode) {
    appInfo.app.parentNode.removeChild(appInfo.app)
  }

  // 清空容器
  if (appInfo.container) {
    appInfo.container.innerHTML = ''
  }

  delete this.loadedApps[appId]
}
```

iframe 子应用应自行清理 message 监听器，防止内存泄漏：

```javascript
// iframe 子应用卸载时
window.removeEventListener('message', messageHandler)
```

