/**
 * 微应用配置管理模块
 * 
 * 此模块负责加载和管理所有微应用的配置信息。
 * 支持两种数据源模式：
 * - mock: 从本地 mock 文件加载数据
 * - api: 从后端 API 接口加载数据
 * 
 * 通过环境变量 VITE_MOCK_MODE 控制使用哪种模式
 * 
 * 配置项说明：
 * - id: 应用唯一标识
 * - name: 应用名称
 * - entry: 应用入口地址
 * - activeRule: 激活规则
 * - type: 应用类型 (vue3/vue2/iframe/link)
 * - layoutType: 布局类型 (default/full/embedded/blank)
 * - layoutOptions: 布局选项，会根据 layoutType 自动标准化
 * 
 * 注意事项：
 * - layoutOptions 会根据 layoutType 自动应用默认值和约束
 * - 不同的 layoutType 对应不同的推荐 layoutOptions
 * - 使用 getValidatedMicroApp 可获取经过验证的配置
 */
import { normalizeLayoutConfig, getDefaultLayoutOptions } from './layoutConfig'
import { mainRequest } from '@/utils/request'
import { USE_MOCK } from './app.js'

// 通用的布局选项工厂函数（在数据加载后调用）
const createLayoutOptions = (type, overrides = {}) => {
  const defaults = getDefaultLayoutOptions(type)
  return { ...defaults, ...overrides }
}

// 内部存储
let microApps = []
let isLoaded = false
let dataSource = 'mock' // 'mock' or 'api'

/**
 * 处理微应用原始数据，应用布局配置标准化
 * @param {Array} rawApps - 原始应用数据
 * @returns {Array} 标准化后的应用配置
 */
export function processMicroAppsData(rawApps) {
  return rawApps.map(app => {
    const normalized = normalizeLayoutConfig(app.layoutType, app.layoutOptions || {})
    return {
      ...app,
      layoutType: normalized.layoutType,
      layoutOptions: normalized.layoutOptions
    }
  })
}

/**
 * 加载微应用配置，支持 mock 和 api 两种模式
 * @param {Object} options - 加载选项
 * @param {'mock'|'api'} options.source - 数据源类型
 * @param {string} options.apiUrl - API 地址
 * @returns {Promise<Array>} 微应用配置数组
 */
export async function loadMicroApps(options = {}) {
  const { source = 'mock', apiUrl = '/api/micro-apps' } = options
  
  try {
    let rawData
    
    if (source === 'mock') {
      console.log('[microApps] Loading from mock data')
      // 动态导入 mock 数据
      const mockData = await import('@/mock/microApps.js')
      rawData = mockData.default.data.apps || mockData.default.apps || []
    } else if (source === 'api') {
      console.log('[microApps] Loading from API:', apiUrl)
      // ✅ 直接使用封装好的 request（主应用自己使用，不需要动态导入）
      const response = await mainRequest.get(apiUrl)
      // 兼容不同的响应格式
      rawData = response?.apps || response?.data?.apps || []
    }
    
    // 处理并标准化数据
    microApps = processMicroAppsData(rawData)
    isLoaded = true
    dataSource = source
    
    console.log(`[microApps] Successfully loaded ${microApps.length} apps from ${source}`)
    return microApps
  } catch (error) {
    console.error('[microApps] Failed to load micro apps:', error)
    // 失败时使用默认配置作为降级方案
    throw error
  }
}

/**
 * 初始化微应用配置（根据环境变量自动选择数据源）
 * @param {string} customApiUrl - 自定义 API 地址（可选）
 * @returns {Promise<Array>} 微应用配置数组
 */
export async function initMicroApps(customApiUrl) {
  // 局部定义默认 API URL（遵循"在哪里使用，就在哪里定义"原则）
  const DEFAULT_MICRO_APPS_API_URL = '/api/micro-apps'
  
  const source = USE_MOCK ? 'mock' : 'api'
  const apiUrl = customApiUrl || DEFAULT_MICRO_APPS_API_URL
  
  return loadMicroApps({ source, apiUrl })
}

/**
 * 获取当前已加载的微应用列表
 * @returns {Array} 微应用配置数组
 */
export function getCurrentMicroApps() {
  return [...microApps]
}

/**
 * 获取指定微应用配置
 * @param {string} appId - 应用 ID
 * @returns {Object|undefined} 应用配置
 */
export function getMicroApp(appId) {
  return microApps.find(app => app.id === appId)
}

/**
 * 获取所有在线微应用
 * @returns {Array}
 */
export function getOnlineMicroApps() {
  return microApps.filter(app => app.status === 'online')
}

/**
 * 获取指定类型的微应用
 * @param {string} type - 应用类型
 * @returns {Array}
 */
export function getMicroAppsByType(type) {
  return microApps.filter(app => app.type === type)
}

/**
 * 更新微应用配置
 * @param {string} appId - 应用 ID
 * @param {Object} config - 配置对象
 */
export function updateMicroAppConfig(appId, config) {
  const index = microApps.findIndex(app => app.id === appId)
  if (index !== -1) {
    microApps[index] = { ...microApps[index], ...config }
  }
}

/**
 * 检查数据是否已加载
 * @returns {boolean}
 */
export function isMicroAppsLoaded() {
  return isLoaded
}

/**
 * 获取当前数据源类型
 * @returns {'mock'|'api'}
 */
export function getDataSource() {
  return dataSource
}

// 初始化时先使用空数组
microApps = []
isLoaded = false

export default {
  loadMicroApps,
  initMicroApps,
  getCurrentMicroApps,
  getMicroApp,
  getOnlineMicroApps,
  getMicroAppsByType,
  updateMicroAppConfig,
  isMicroAppsLoaded,
  getDataSource
}
