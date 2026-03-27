/**
 * Mock 引擎核心实现
 * 
 * 提供 mock 路由、处理器注册、运行时切换等功能
 * @module utils/mockEngine
 */

import { mockWhitelist, mockGlobalConfig } from '@/config/mockConfig'

/**
 * Mock 引擎类
 */
class MockEngine {
  constructor() {
    this.config = { ...mockGlobalConfig }
    this.handlers = new Map()
    this.runtime = this.loadRuntimeConfig()
    this.isInitialized = false
  }

  /**
   * 初始化引擎
   */
  initialize() {
    this.isInitialized = true
    console.log('[MockEngine] Initialized with config:', this.config)
  }

  /**
   * 判断是否使用 mock
   * @param {string} method - HTTP 方法
   * @param {string} url - 请求 URL
   * @returns {boolean} - 是否使用 mock
   */
  shouldUseMock(method, url) {
    // 检查是否已初始化
    if (!this.isInitialized) {
      console.warn('[MockEngine] Not initialized, mock disabled')
      return false
    }

    // 检查全局开关
    if (!this.config.enabled) {
      return false
    }

    // 构建匹配模式：METHOD /path
    const pattern = `${method.toUpperCase()} ${url.split('?')[0]}`
    
    // 查找匹配的接口
    const matched = this.matchPattern(pattern)
    if (!matched) {
      return false
    }

    // 检查运行时配置（优先级最高）
    const runtimeOverride = this.runtime[matched]
    if (runtimeOverride !== undefined) {
      return runtimeOverride
    }

    // 默认模式：api = 不用 mock, mock = 用 mock
    if (this.config.defaultMode === 'mock') {
      return this.mockWhitelist[matched] === true
    }

    // defaultMode === 'api' 时，只有白名单明确允许的才用 mock
    return this.mockWhitelist[matched] === true
  }

  /**
   * 注册 mock 处理器
   * @param {string} pattern - 匹配模式，如 'GET /api/users'
   * @param {Function} handler - 处理函数，接收 data 参数，返回 mock 数据
   */
  register(pattern, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function')
    }
    this.handlers.set(pattern, handler)
    console.log(`[MockEngine] Registered handler for: ${pattern}`)
  }

  /**
   * 执行 mock 处理器
   * @param {string} method - HTTP 方法
   * @param {string} url - 请求 URL
   * @param {any} data - 请求数据
   * @returns {Promise<any>} - Mock 数据
   */
  async handle(method, url, data) {
    const pattern = `${method.toUpperCase()} ${url.split('?')[0]}`
    const handler = this.handlers.get(pattern)
    
    if (!handler) {
      throw new Error(`No mock handler for ${pattern}`)
    }

    try {
      const result = await handler(data)
      console.log(`[MockEngine] Handled: ${pattern}`, result)
      return result
    } catch (error) {
      console.error(`[MockEngine] Handler error for ${pattern}:`, error)
      throw error
    }
  }

  /**
   * 路径匹配工具
   * @param {string} pattern - 要匹配的模式
   * @returns {string|null} - 匹配到的白名单键名，未匹配返回 null
   */
  matchPattern(pattern) {
    // 1. 精确匹配
    if (this.mockWhitelist[pattern] !== undefined) {
      return pattern
    }

    // 2. :param 参数匹配（如 /api/users/:id）
    for (const whitelistPattern of Object.keys(this.mockWhitelist)) {
      if (whitelistPattern.includes(':')) {
        const regex = this.patternToRegex(whitelistPattern)
        if (regex.test(pattern)) {
          return whitelistPattern
        }
      }
    }

    // 3. * 通配符匹配（如 /api/users/*）
    for (const whitelistPattern of Object.keys(this.mockWhitelist)) {
      if (whitelistPattern.includes('*')) {
        const regex = this.patternToRegex(whitelistPattern)
        if (regex.test(pattern)) {
          return whitelistPattern
        }
      }
    }

    return null
  }

  /**
   * 将模式字符串转换为正则表达式
   * @param {string} pattern - 模式字符串，如 'GET /api/users/:id'
   * @returns {RegExp} - 正则表达式
   */
  patternToRegex(pattern) {
    // 转义特殊字符，但保留 :param 和 *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    
    // 将 :param 替换为 [^/]+（匹配非斜杠字符）
    const withParams = escaped.replace(/:[a-zA-Z_]\w*/g, '[^/]+')
    
    // 将 * 替换为 .*（匹配任意字符）
    const withWildcard = withParams.replace(/\*/g, '.*')
    
    return new RegExp(`^${withWildcard}$`)
  }

  /**
   * 运行时切换接口 mock 状态
   * @param {string} pattern - 接口模式，如 'GET /api/users'
   * @param {boolean} useMock - 是否使用 mock
   */
  toggleInterface(pattern, useMock) {
    this.runtime[pattern] = useMock
    this.saveRuntimeConfig()
    console.log(`[MockEngine] Toggled ${pattern} to ${useMock ? 'mock' : 'api'}`)
  }

  /**
   * 获取所有接口状态
   * @returns {Array<{pattern: string, enabled: boolean, runtimeOverride?: boolean}>}
   */
  getAllInterfaces() {
    return Object.keys(this.mockWhitelist).map(pattern => ({
      pattern,
      enabled: this.mockWhitelist[pattern],
      runtimeOverride: this.runtime[pattern]
    }))
  }

  /**
   * 加载运行时配置
   * @returns {Object} - 运行时配置对象
   */
  loadRuntimeConfig() {
    if (!this.config.persistence) {
      return {}
    }
    
    try {
      const saved = localStorage.getItem(this.config.storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.warn('[MockEngine] Failed to load runtime config:', error)
      return {}
    }
  }

  /**
   * 保存运行时配置
   */
  saveRuntimeConfig() {
    if (!this.config.persistence) {
      return
    }
    
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.runtime))
    } catch (error) {
      console.warn('[MockEngine] Failed to save runtime config:', error)
    }
  }

  /**
   * 获取 mock 白名单
   * @returns {Object} - 白名单对象
   */
  get mockWhitelist() {
    return mockWhitelist
  }
}

// 导出单例
export const mockEngine = new MockEngine()
