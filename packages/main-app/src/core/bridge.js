import { useUserStore } from '@/stores/user'
import router from '@/router'

/**
 * 跨应用通信桥
 * 支持主应用 <-> 子应用双向通信
 * 支持子应用 <-> 子应用跨应用跳转
 */
class Bridge {
  constructor() {
    // 允许的 origin 列表
    this.allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:7080',
      'http://localhost:3000',
      'http://localhost:4000'
    ]
    
    // 消息处理器
    this.handlers = new Map()
    
    // 消息监听器是否已设置
    this.isListening = false
    
    // 注册默认处理器
    this.registerDefaultHandlers()
  }

  /**
   * 注册默认消息处理器
   */
  registerDefaultHandlers() {
    // 跳转处理
    this.on('NAVIGATE_TO', (payload) => {
      const { appId, path, query } = payload
      if (appId) {
        // 跳转到子应用
        router.push({
          path: `/app/${appId}`,
          query: { subPath: path, ...query }
        })
      }
    })

    // 跳转到主应用
    this.on('NAVIGATE_TO_MAIN', (payload) => {
      const { path, query } = payload
      router.push({ path, query })
    })

    // Token 请求
    this.on('REQUEST_TOKEN', (payload, source) => {
      const userStore = useUserStore()
      this.send(source, {
        type: 'TOKEN_RESPONSE',
        payload: { token: userStore.token }
      })
    })

    // 心跳响应
    this.on('PONG', (payload) => {
      console.log('[Bridge] Received PONG:', payload)
    })

    // 高度上报 (iframe)
    this.on('REPORT_HEIGHT', (payload, source) => {
      const { height, appId } = payload
      const iframe = document.getElementById(`iframe-${appId}`)
      if (iframe) {
        iframe.style.height = `${height}px`
      }
    })

    // 通用消息处理
    this.on('MESSAGE', (payload) => {
      console.log('[Bridge] Received message:', payload)
    })
  }

  /**
   * 设置消息监听
   */
  setupListener() {
    if (this.isListening) return
    
    window.addEventListener('message', this.handleMessage.bind(this))
    this.isListening = true
    
    console.log('[Bridge] Message listener setup')
  }

  /**
   * 处理接收到的消息
   * @param {MessageEvent} event 
   */
  handleMessage(event) {
    // Origin 校验
    if (!this.allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
      console.warn('[Bridge] Rejected message from:', event.origin)
      return
    }

    const { type, payload } = event.data || {}
    
    if (!type) return

    console.log('[Bridge] Received:', type, payload)

    // 调用对应处理器
    const handler = this.handlers.get(type)
    if (handler) {
      handler(payload, event.source, event.origin)
    }
  }

  /**
   * 注册消息处理器
   * @param {string} type - 消息类型
   * @param {Function} handler - 处理函数
   */
  on(type, handler) {
    this.handlers.set(type, handler)
  }

  /**
   * 移除消息处理器
   * @param {string} type - 消息类型
   */
  off(type) {
    this.handlers.delete(type)
  }

  /**
   * 发送消息到指定窗口
   * @param {Window} targetWindow - 目标窗口
   * @param {Object} message - 消息对象
   * @param {string} targetOrigin - 目标 origin
   */
  send(targetWindow, message, targetOrigin = '*') {
    if (targetWindow && targetWindow.postMessage) {
      targetWindow.postMessage(message, targetOrigin)
    }
  }

  /**
   * 发送消息到 iframe
   * @param {HTMLIFrameElement} iframe - iframe 元素
   * @param {Object} message - 消息对象
   */
  sendToIframe(iframe, message) {
    if (iframe && iframe.contentWindow) {
      const targetOrigin = new URL(iframe.src).origin
      iframe.contentWindow.postMessage(message, targetOrigin)
    }
  }

  /**
   * 广播消息给所有子应用
   * @param {Object} message - 消息对象
   */
  broadcast(message) {
    // 广播给所有 iframe
    const iframes = document.querySelectorAll('iframe[id^="iframe-"]')
    iframes.forEach(iframe => {
      this.sendToIframe(iframe, message)
    })

    // 对于 qiankun 子应用，通过 props 传递的 bridge 对象通信
    // 子应用可以监听全局事件
    window.dispatchEvent(new CustomEvent('artisan:broadcast', { detail: message }))
  }

  /**
   * 同步 token 到所有子应用
   * @param {string} token - Token 值
   */
  syncToken(token) {
    this.broadcast({
      type: 'TOKEN_SYNC',
      payload: { token }
    })
  }

  /**
   * 跳转到子应用
   * @param {Object} options - 跳转选项
   * @param {string} options.appId - 目标应用ID
   * @param {string} options.path - 目标路径
   * @param {Object} options.query - 查询参数
   */
  navigateTo({ appId, path = '/', query = {} }) {
    router.push({
      path: `/app/${appId}`,
      query: { subPath: path, ...query }
    })
  }

  /**
   * 跳转到主应用
   * @param {string} path - 目标路径
   * @param {Object} query - 查询参数
   */
  navigateToMain(path, query = {}) {
    router.push({ path, query })
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.isListening) {
      window.removeEventListener('message', this.handleMessage)
      this.isListening = false
    }
    this.handlers.clear()
  }
}

// 导出单例
export const bridge = new Bridge()

/**
 * 设置 bridge
 */
export function setupBridge() {
  bridge.setupListener()
  
  // 暴露到全局供子应用使用
  window.__ARTISAN_BRIDGE__ = {
    navigateTo: bridge.navigateTo.bind(bridge),
    navigateToMain: bridge.navigateToMain.bind(bridge),
    send: bridge.send.bind(bridge),
    on: bridge.on.bind(bridge),
    off: bridge.off.bind(bridge)
  }
  
  console.log('[Bridge] Setup complete, exposed as window.__ARTISAN_BRIDGE__')
}

export default bridge
