import { loadMicroApp, prefetchApps } from 'qiankun'
import { reactive, markRaw } from 'vue'
import { microApps, getMicroApp, updateMicroAppConfig } from '@/config/microApps'
import { useUserStore } from '@/stores/user'
import { bridge } from './bridge'

/**
 * 微应用管理器
 * 每个 appId 同时只允许加载一个实例，使用 appId 作为唯一标识
 */
class MicroAppManager {
  constructor() {
    // 存储所有运行中的应用 { appId: { app, config, status, loadTime, errors } }
    this.loadedApps = reactive({})
    
    // 心跳检测定时器
    this.heartbeatTimers = {}
    
    // lastModified 缓存
    this.lastModifiedCache = {}
    
    // 错误记录
    this.errorLogs = reactive([])
    
    // 预加载状态
    this.preloadStatus = reactive({})

    // 样式快照：记录加载子应用前 head 中已有的 style/link 元素
    // { appId: Set<Element> }
    this._styleSnapshots = {}
  }

  /**
   * 判断应用是否已加载
   * @param {string} appId - 应用ID
   * @returns {boolean}
   */
  isAppLoaded(appId) {
    return !!this.loadedApps[appId]
  }

  /**
   * 加载微应用
   * @param {string} appId - 应用ID
   * @param {HTMLElement|string} container - 容器
   * @param {Object} options - 额外选项
   * @returns {Promise<Object>} 应用信息
   */
  async load(appId, container, options = {}) {
    const config = getMicroApp(appId)
    
    if (!config) {
      const error = new Error(`Micro app not found: ${appId}`)
      this.logError(appId, error)
      throw error
    }

    if (config.status === 'offline') {
      const error = new Error(`Micro app is offline: ${appId}`)
      this.logError(appId, error)
      throw error
    }

    // 防止重复加载同一应用
    if (this.isAppLoaded(appId)) {
      const error = new Error(`Micro app already loaded: ${appId}`)
      this.logError(appId, error)
      throw error
    }

    // iframe 类型走单独的加载器
    if (config.type === 'iframe') {
      return this.loadIframe(appId, container, options)
    }

    // link 类型直接跳转
    if (config.type === 'link') {
      window.open(config.entry, '_blank')
      return null
    }

    const userStore = useUserStore()

    try {
      const containerElement = typeof container === 'string' 
        ? document.querySelector(container) 
        : container

      if (!containerElement) {
        throw new Error(`Container not found: ${container}`)
      }

      // name 必须与 vite-plugin-qiankun 注册的名字一致（即 appId），
      // 否则 qiankun 无法在 global[name] 上找到生命周期钩子。
      // 直接传 DOM 元素而非选择器字符串，避免修改容器 ID 导致刷新后找不到容器。
      const app = loadMicroApp({
        name: appId,
        entry: config.entry,
        container: containerElement,
        props: {
          ...config.props,
          ...options.props,
          token: userStore.token,
          mainRouter: options.mainRouter,
          bridge: bridge,
          appId: appId
        }
      }, {
        sandbox: {
          experimentalStyleIsolation: true
        },
        singular: false,
        // 排除子应用的 Element Plus/UI 全局 CSS，避免与主应用样式冲突
        // 子应用在 qiankun 模式下复用主应用的 UI 框架样式
        excludeAssetFilter: (url) => {
          // 精确匹配 Element Plus 和 Element UI 的全局样式文件
          return /element-plus\/dist\/index\.css/.test(url) || 
                 /element-ui\/lib\/theme-chalk\/index\.css/.test(url)
        }
      })

      // 记录应用
      this.loadedApps[appId] = {
        app: markRaw(app),
        config: { ...config },
        status: 'loading',
        loadTime: Date.now(),
        errors: [],
        container: containerElement
      }

      // 等待挂载完成
      await app.mountPromise
      
      // 防御性检查：在 await 期间应用可能被其他页面的 onBeforeUnmount 卸载
      if (!this.loadedApps[appId]) {
        // 应用在挂载期间被卸载了，清理并抛出错误
        await app.unmount().catch(() => {})
        throw new Error(`App ${appId} was unloaded during mount`)
      }
      
      this.loadedApps[appId].status = 'mounted'
      
      // 启动心跳检测
      this.startHeartbeat(appId)
      
      // 检查热更新
      this.checkLastModified(appId)

      console.log(`[MicroAppManager] Loaded: ${appId}`)
      
      return {
        appId,
        app,
        config
      }
    } catch (error) {
      this.logError(appId, error)
      if (this.loadedApps[appId]) {
        this.loadedApps[appId].status = 'error'
        this.loadedApps[appId].errors.push(error.message)
      }
      throw error
    }
  }

  /**
   * 加载 iframe 类型应用
   * @param {string} appId - 应用ID
   * @param {HTMLElement|string} container - 容器
   * @param {Object} options - 额外选项
   */
  async loadIframe(appId, container, options = {}) {
    const config = getMicroApp(appId)
    const userStore = useUserStore()

    const containerElement = typeof container === 'string' 
      ? document.querySelector(container) 
      : container

    if (!containerElement) {
      throw new Error(`Container not found: ${container}`)
    }

    const iframe = document.createElement('iframe')
    iframe.id = `iframe-${appId}`
    iframe.src = config.entry + (options.path || '')
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;'
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups'
    
    containerElement.innerHTML = ''
    containerElement.appendChild(iframe)

    // 记录应用
    this.loadedApps[appId] = {
      app: markRaw(iframe),
      config: { ...config },
      status: 'loading',
      loadTime: Date.now(),
      errors: [],
      container: containerElement,
      isIframe: true
    }

    // iframe 加载完成后发送 token
    iframe.onload = () => {
      this.loadedApps[appId].status = 'mounted'
      
      // 发送初始化消息
      bridge.sendToIframe(iframe, {
        type: 'INIT',
        payload: {
          token: userStore.token,
          appId: appId
        }
      })
      
      // 启动心跳
      this.startIframeHeartbeat(appId, iframe)
    }

    iframe.onerror = (error) => {
      this.loadedApps[appId].status = 'error'
      this.logError(appId, new Error('iframe load failed'))
    }

    return {
      appId,
      iframe,
      config
    }
  }

  /**
   * 卸载微应用
   * @param {string} appId - 应用ID
   */
  async unload(appId) {
    const appInfo = this.loadedApps[appId]
    
    if (!appInfo) {
      console.warn(`[MicroAppManager] App not found: ${appId}`)
      return
    }

    // 停止心跳
    this.stopHeartbeat(appId)

    try {
      if (appInfo.isIframe) {
        // 清理 iframe
        if (appInfo.app && appInfo.app.parentNode) {
          appInfo.app.parentNode.removeChild(appInfo.app)
        }
      } else if (appInfo.app) {
        // 卸载 qiankun 应用
        // qiankun/single-spa 的 parcel.unmount() 返回 Promise
        // 即使子应用 unmount 生命周期内部处理了错误，
        // single-spa 仍可能将错误包装后 reject。
        // 这里等待 unmount 完成，忽略所有错误。
        await appInfo.app.unmount().catch(() => {})
      }
      
      // 清理容器
      if (appInfo.container) {
        appInfo.container.innerHTML = ''
      }

      // 清理该应用注入的 qiankun 样式标签，防止样式污染
      this._cleanupStyles(appId)
      
      delete this.loadedApps[appId]
      
      console.log(`[MicroAppManager] Unloaded: ${appId}`)
    } catch (error) {
      console.error(`[MicroAppManager] Unload error: ${appId}`, error)
      // 强制清理
      if (appInfo.container) {
        appInfo.container.innerHTML = ''
      }
      this._cleanupStyles(appId)
      delete this.loadedApps[appId]
    }
  }

  /**
   * 清理子应用注入的样式标签
   * 只清理 qiankun 注入的带 data-qiankun 属性的样式，以及来自子应用 entry 的资源
   * 不再使用快照对比，避免误删主应用样式
   * @param {string} appId - 应用ID
   */
  _cleanupStyles(appId) {
    // 清理快照引用（如果有）
    delete this._styleSnapshots[appId]

    // 移除带 data-qiankun 属性的样式标签（qiankun experimentalStyleIsolation 模式注入）
    const qiankunStyles = document.querySelectorAll('style[data-qiankun]')
    qiankunStyles.forEach(style => {
      const attr = style.getAttribute('data-qiankun')
      if (attr && attr.includes(appId)) {
        style.parentNode?.removeChild(style)
      }
    })

    // 移除来自子应用 entry 的 link/style 标签
    const config = getMicroApp(appId)
    if (config?.entry) {
      const origin = config.entry.replace(/^\/\//, `${location.protocol}//`)
      document.querySelectorAll(`link[href*="${origin}"], style[data-src*="${origin}"]`).forEach(el => {
        el.parentNode?.removeChild(el)
      })
    }
  }

  /**
   * 刷新微应用
   * @param {string} appId - 应用ID
   */
  async reload(appId) {
    const appInfo = this.loadedApps[appId]
    
    if (!appInfo) {
      console.warn(`[MicroAppManager] App not found: ${appId}`)
      return
    }

    const { container } = appInfo
    
    // 先卸载
    await this.unload(appId)
    
    // 重新加载
    return this.load(appId, container)
  }

  /**
   * 启动心跳检测
   * @param {string} appId - 应用ID
   */
  startHeartbeat(appId) {
    this.heartbeatTimers[appId] = setInterval(() => {
      const appInfo = this.loadedApps[appId]
      if (!appInfo) {
        this.stopHeartbeat(appId)
        return
      }

      // 检查应用状态
      if (appInfo.app && appInfo.app.getStatus) {
        const status = appInfo.app.getStatus()
        if (status === 'NOT_MOUNTED' || status === 'UNMOUNTING') {
          console.warn(`[MicroAppManager] Heartbeat: App ${appId} is not healthy`)
          appInfo.status = 'unhealthy'
        }
      }
    }, 30000) // 30秒检测一次
  }

  /**
   * 启动 iframe 心跳检测
   * @param {string} appId - 应用ID
   * @param {HTMLIFrameElement} iframe - iframe 元素
   */
  startIframeHeartbeat(appId, iframe) {
    this.heartbeatTimers[appId] = setInterval(() => {
      const appInfo = this.loadedApps[appId]
      if (!appInfo) {
        this.stopHeartbeat(appId)
        return
      }

      // 发送 ping
      bridge.sendToIframe(iframe, { type: 'PING', payload: { time: Date.now() } })
    }, 30000)
  }

  /**
   * 停止心跳检测
   * @param {string} appId - 应用ID
   */
  stopHeartbeat(appId) {
    if (this.heartbeatTimers[appId]) {
      clearInterval(this.heartbeatTimers[appId])
      delete this.heartbeatTimers[appId]
    }
  }

  /**
   * 检查 lastModified 热更新
   * @param {string} appId - 应用ID
   */
  async checkLastModified(appId) {
    const config = getMicroApp(appId)
    if (!config || config.type === 'iframe') return

    try {
      const response = await fetch(config.entry, { method: 'HEAD' })
      const lastModified = response.headers.get('last-modified')
      
      if (lastModified) {
        const newTime = new Date(lastModified).getTime()
        const cachedTime = this.lastModifiedCache[appId]
        
        if (cachedTime && newTime > cachedTime) {
          console.log(`[MicroAppManager] Hot update detected: ${appId}`)
          // 刷新该应用
          this.reload(appId)
        }
        
        this.lastModifiedCache[appId] = newTime
      }
    } catch (error) {
      console.warn(`[MicroAppManager] Failed to check lastModified: ${appId}`, error)
    }
  }

  /**
   * 预加载微应用
   * @param {Array} appIds - 应用ID列表
   */
  async preload(appIds = []) {
    const apps = appIds.length > 0 
      ? appIds.map(id => getMicroApp(id)).filter(Boolean)
      : microApps.filter(app => app.preload && app.type !== 'iframe' && app.status === 'online')

    const prefetchList = apps.map(app => ({
      name: app.id,
      entry: app.entry
    }))

    if (prefetchList.length > 0) {
      prefetchApps(prefetchList)
      
      prefetchList.forEach(app => {
        this.preloadStatus[app.name] = 'prefetched'
      })
      
      console.log(`[MicroAppManager] Prefetched: ${prefetchList.map(a => a.name).join(', ')}`)
    }
  }

  /**
   * 设置应用上下线状态
   * @param {string} appId - 应用ID
   * @param {string} status - 状态 'online' | 'offline'
   */
  setAppStatus(appId, status) {
    updateMicroAppConfig(appId, { status })
    
    if (status === 'offline') {
      // 卸载该应用
      if (this.isAppLoaded(appId)) {
        this.unload(appId)
      }
    }
    
    console.log(`[MicroAppManager] App ${appId} status changed to: ${status}`)
  }

  /**
   * 获取已加载应用数量
   * @returns {number}
   */
  getLoadedCount() {
    return Object.keys(this.loadedApps).length
  }

  /**
   * 记录错误
   * @param {string} appId - 应用ID
   * @param {Error} error - 错误对象
   */
  logError(appId, error) {
    const errorLog = {
      appId,
      message: error.message,
      stack: error.stack,
      time: Date.now()
    }
    
    this.errorLogs.unshift(errorLog)
    
    // 保留最近100条错误
    if (this.errorLogs.length > 100) {
      this.errorLogs.pop()
    }
    
    console.error(`[MicroAppManager] Error:`, errorLog)
  }

  /**
   * 获取错误日志
   * @param {string} appId - 应用ID (可选)
   * @returns {Array}
   */
  getErrorLogs(appId) {
    if (appId) {
      return this.errorLogs.filter(log => log.appId === appId)
    }
    return this.errorLogs
  }

  /**
   * 清空错误日志
   */
  clearErrorLogs() {
    this.errorLogs.length = 0
  }
}

// 导出单例
export const microAppManager = new MicroAppManager()

export default microAppManager
