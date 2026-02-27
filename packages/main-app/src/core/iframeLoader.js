import { bridge } from './bridge'
import { useUserStore } from '@/stores/user'
import { debounce } from 'lodash-es'

/**
 * iframe 加载器
 * 负责 iframe 类型子应用的加载、通信、高度自适应等
 */
class IframeLoader {
  constructor() {
    // iframe 实例缓存
    this.iframes = new Map()
    
    // 高度观察器
    this.resizeObservers = new Map()
    
    // 防抖的高度更新函数
    this.debouncedResize = debounce(this.handleResize.bind(this), 100)
  
  }

  /**
   * 加载 iframe
   * @param {Object} options - 加载选项
   * @param {string} options.id - 唯一标识
   * @param {string} options.src - iframe 地址
   * @param {HTMLElement} options.container - 容器元素
   * @param {Object} options.sandbox - sandbox 配置
   * @param {boolean} options.autoHeight - 是否自动调整高度
   * @returns {HTMLIFrameElement}
   */
  load(options) {
    const {
      id,
      src,
      container,
      sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups',
      autoHeight = true,
      style = {}
    } = options

    // 如果已存在，先销毁
    if (this.iframes.has(id)) {
      this.unload(id)
    }

    // 创建 iframe
    const iframe = document.createElement('iframe')
    iframe.id = `artisan-iframe-${id}`
    iframe.src = src
    iframe.sandbox = sandbox
    iframe.allow = 'clipboard-write'
    
    // 默认样式
    Object.assign(iframe.style, {
      width: '100%',
      height: autoHeight ? '400px' : '100%',
      border: 'none',
      display: 'block',
      ...style
    })

    // 加载事件
    iframe.onload = () => {
      this.onIframeLoad(id, iframe)
    }

    iframe.onerror = (error) => {
      this.onIframeError(id, error)
    }

    // 清空容器并添加 iframe
    container.innerHTML = ''
    container.appendChild(iframe)

    // 缓存实例
    this.iframes.set(id, {
      iframe,
      container,
      src,
      status: 'loading',
      autoHeight
    })

    console.log(`[IframeLoader] Loading: ${id}`)

    return iframe
  }

  /**
   * iframe 加载完成处理
   * @param {string} id - iframe ID
   * @param {HTMLIFrameElement} iframe - iframe 元素
   */
  onIframeLoad(id, iframe) {
    const instance = this.iframes.get(id)
    if (!instance) return

    instance.status = 'loaded'

    // 发送初始化消息
    const userStore = useUserStore()
    
    // 动态添加当前origin到allowedOrigins
    const currentAllowedOrigins = [...bridge.allowedOrigins, window.location.origin]
    
    bridge.sendToIframe(iframe, {
      type: 'INIT',
      payload: {
        token: userStore.token,
        iframeId: id,
        origin: window.location.origin,
        allowedOrigins: currentAllowedOrigins
      }
    })

    // 监听消息
    this.setupMessageListener(id, iframe)

    // 启动心跳
    this.startHeartbeat(id, iframe)

    console.log(`[IframeLoader] Loaded: ${id}`)
  }

  /**
   * iframe 加载错误处理
   * @param {string} id - iframe ID
   * @param {Error} error - 错误对象
   */
  onIframeError(id, error) {
    const instance = this.iframes.get(id)
    if (!instance) return

    instance.status = 'error'
    instance.error = error

    console.error(`[IframeLoader] Error loading: ${id}`, error)
  }

  /**
   * 设置消息监听
   * @param {string} id - iframe ID
   * @param {HTMLIFrameElement} iframe - iframe 元素
   */
  setupMessageListener(id, iframe) {
    const instance = this.iframes.get(id)
    if (!instance) return

    const handler = (event) => {
      // 验证来源
      if (event.source !== iframe.contentWindow) return

      const { type, payload } = event.data || {}

      switch (type) {
        case 'REPORT_HEIGHT':
          this.handleHeightReport(id, payload.height)
          break
        case 'PONG':
          instance.lastPong = Date.now()
          break
        case 'NAVIGATE_TO':
          bridge.navigateTo(payload)
          break
        case 'NAVIGATE_TO_MAIN':
          bridge.navigateToMain(payload.path, payload.query)
          break
        case 'REQUEST_TOKEN':
          const userStore = useUserStore()
          bridge.sendToIframe(iframe, {
            type: 'TOKEN_RESPONSE',
            payload: { token: userStore.token }
          })
          break
      }
    }

    window.addEventListener('message', handler)
    instance.messageHandler = handler
  }

  /**
   * 处理高度上报
   * @param {string} id - iframe ID
   * @param {number} height - 高度值
   */
  handleHeightReport(id, height) {
    const instance = this.iframes.get(id)
    if (!instance || !instance.autoHeight) return

    const minHeight = 200
    const maxHeight = window.innerHeight - 100
    const safeHeight = Math.min(Math.max(height, minHeight), maxHeight)

    instance.iframe.style.height = `${safeHeight}px`
  }

  /**
   * 处理窗口 resize
   * @param {string} id - iframe ID
   */
  handleResize(id) {
    const instance = this.iframes.get(id)
    if (!instance) return

    bridge.sendToIframe(instance.iframe, {
      type: 'RESIZE',
      payload: {
        width: instance.container.clientWidth,
        height: instance.container.clientHeight
      }
    })
  }

  /**
   * 启动心跳检测
   * @param {string} id - iframe ID
   * @param {HTMLIFrameElement} iframe - iframe 元素
   */
  startHeartbeat(id, iframe) {
    const instance = this.iframes.get(id)
    if (!instance) return

    instance.heartbeatTimer = setInterval(() => {
      bridge.sendToIframe(iframe, {
        type: 'PING',
        payload: { time: Date.now() }
      })

      // 检查是否超时 (60秒无响应)
      if (instance.lastPong && Date.now() - instance.lastPong > 60000) {
        console.warn(`[IframeLoader] Heartbeat timeout: ${id}`)
        instance.status = 'unhealthy'
      }
    }, 30000)
  }

  /**
   * 停止心跳检测
   * @param {string} id - iframe ID
   */
  stopHeartbeat(id) {
    const instance = this.iframes.get(id)
    if (!instance || !instance.heartbeatTimer) return

    clearInterval(instance.heartbeatTimer)
    delete instance.heartbeatTimer
  }

  /**
   * 刷新 iframe
   * @param {string} id - iframe ID
   */
  reload(id) {
    const instance = this.iframes.get(id)
    if (!instance) return

    instance.iframe.src = instance.src
    instance.status = 'loading'
  }

  /**
   * 卸载 iframe
   * @param {string} id - iframe ID
   */
  unload(id) {
    const instance = this.iframes.get(id)
    if (!instance) return

    // 停止心跳
    this.stopHeartbeat(id)

    // 移除消息监听
    if (instance.messageHandler) {
      window.removeEventListener('message', instance.messageHandler)
    }

    // 移除 ResizeObserver
    const observer = this.resizeObservers.get(id)
    if (observer) {
      observer.disconnect()
      this.resizeObservers.delete(id)
    }

    // 移除 iframe
    if (instance.iframe.parentNode) {
      instance.iframe.parentNode.removeChild(instance.iframe)
    }

    // 清除缓存
    this.iframes.delete(id)

    console.log(`[IframeLoader] Unloaded: ${id}`)
  }

  /**
   * 发送消息到 iframe
   * @param {string} id - iframe ID
   * @param {Object} message - 消息对象
   */
  send(id, message) {
    const instance = this.iframes.get(id)
    if (!instance) return

    bridge.sendToIframe(instance.iframe, message)
  }

  /**
   * 获取 iframe 实例
   * @param {string} id - iframe ID
   * @returns {Object|undefined}
   */
  get(id) {
    return this.iframes.get(id)
  }

  /**
   * 获取所有 iframe
   * @returns {Map}
   */
  getAll() {
    return this.iframes
  }

  /**
   * 销毁所有 iframe
   */
  destroy() {
    for (const id of this.iframes.keys()) {
      this.unload(id)
    }
  }
}

// 导出单例
export const iframeLoader = new IframeLoader()

export default iframeLoader
