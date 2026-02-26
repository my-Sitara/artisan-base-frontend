/**
 * iframe 子应用通信桥
 * 基于 postMessage 实现与主应用的通信
 */
class IframeBridge {
  constructor() {
    this.allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:7080',
      'http://localhost:3000',
      'http://localhost:9080'
    ]
    
    this.token = ''
    this.instanceId = ''
    this.appId = ''
    this.parentOrigin = ''
    
    this.handlers = new Map()
    this.setupListener()
    this.registerDefaultHandlers()
  }
  
  /**
   * 设置消息监听
   */
  setupListener() {
    window.addEventListener('message', this.handleMessage.bind(this))
    console.log('[iframe Bridge] Message listener setup')
  }
  
  /**
   * 注册默认处理器
   */
  registerDefaultHandlers() {
    // 初始化
    this.on('INIT', (payload) => {
      this.token = payload.token || ''
      this.instanceId = payload.instanceId || ''
      this.appId = payload.appId || ''
      this.parentOrigin = payload.origin || ''
      
      console.log('[iframe Bridge] Initialized:', payload)
      
      // 更新页面显示
      const tokenInput = document.getElementById('tokenInput')
      if (tokenInput) {
        tokenInput.value = this.token
      }
      
      // 上报高度
      this.reportHeight()
    })
    
    // Token 同步
    this.on('TOKEN_SYNC', (payload) => {
      this.token = payload.token || ''
      
      const tokenInput = document.getElementById('tokenInput')
      if (tokenInput) {
        tokenInput.value = this.token
      }
      
      console.log('[iframe Bridge] Token synced:', this.token)
    })
    
    // Token 响应
    this.on('TOKEN_RESPONSE', (payload) => {
      this.token = payload.token || ''
      
      const tokenInput = document.getElementById('tokenInput')
      if (tokenInput) {
        tokenInput.value = this.token
      }
    })
    
    // 心跳
    this.on('PING', (payload) => {
      this.send({
        type: 'PONG',
        payload: { time: Date.now(), pingTime: payload.time }
      })
    })
    
    // Resize
    this.on('RESIZE', (payload) => {
      console.log('[iframe Bridge] Resize:', payload)
    })
  }
  
  /**
   * 处理接收到的消息
   */
  handleMessage(event) {
    // Origin 校验
    if (!this.allowedOrigins.includes(event.origin)) {
      console.warn('[iframe Bridge] Rejected message from:', event.origin)
      return
    }
    
    const { type, payload } = event.data || {}
    
    if (!type) return
    
    console.log('[iframe Bridge] Received:', type, payload)
    
    // 记录消息
    this.logMessage(type, payload)
    
    // 调用处理器
    const handler = this.handlers.get(type)
    if (handler) {
      handler(payload, event.source, event.origin)
    }
  }
  
  /**
   * 注册消息处理器
   */
  on(type, handler) {
    this.handlers.set(type, handler)
  }
  
  /**
   * 发送消息到主应用
   */
  send(message) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*')
    }
  }
  
  /**
   * 请求 Token
   */
  requestToken() {
    this.send({
      type: 'REQUEST_TOKEN',
      payload: { instanceId: this.instanceId }
    })
  }
  
  /**
   * 发送自定义消息
   */
  sendMessage(data) {
    this.send({
      type: 'MESSAGE',
      payload: {
        from: 'iframe-sub-app',
        instanceId: this.instanceId,
        ...data
      }
    })
  }
  
  /**
   * 跳转到其他子应用
   */
  navigateTo(appId, path = '/') {
    this.send({
      type: 'NAVIGATE_TO',
      payload: { appId, path }
    })
  }
  
  /**
   * 跳转到主应用
   */
  navigateToMain(path = '/') {
    this.send({
      type: 'NAVIGATE_TO_MAIN',
      payload: { path }
    })
  }
  
  /**
   * 上报高度
   */
  reportHeight() {
    const height = document.documentElement.scrollHeight || document.body.scrollHeight
    
    this.send({
      type: 'REPORT_HEIGHT',
      payload: {
        height,
        instanceId: this.instanceId
      }
    })
    
    // 更新页面显示
    const heightValue = document.getElementById('heightValue')
    if (heightValue) {
      heightValue.textContent = `${height}px`
    }
    
    return height
  }
  
  /**
   * 记录消息到页面
   */
  logMessage(type, payload) {
    const messagesLog = document.getElementById('messagesLog')
    if (messagesLog) {
      const log = `[${new Date().toLocaleTimeString()}] ${type}: ${JSON.stringify(payload)}\n`
      messagesLog.textContent = log + messagesLog.textContent
    }
  }
}

// 创建全局实例
window.iframeBridge = new IframeBridge()

export default window.iframeBridge
