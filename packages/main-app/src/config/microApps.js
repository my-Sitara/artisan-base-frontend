/**
 * 微应用配置管理模块
 * 
 * 此模块定义了所有微应用的配置信息，包括基本属性、布局配置等。
 * 布局配置通过 layoutConfig 模块进行标准化和验证，确保布局配置的合理性。
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
import { normalizeLayoutConfig, validateLayoutConfig, getDefaultLayoutOptions } from './layoutConfig'

// 定义基础微应用配置（不含标准化的布局选项）
const baseMicroApps = [
  {
    id: 'vue3-sub-app',
    name: 'Vue3 子应用',
    entry: '//localhost:7080',
    activeRule: '/vue3',
    container: '#micro-app-container',
    status: 'online',
    version: '1.0.0',
    lastModified: Date.now(),
    preload: true,
    type: 'vue3',
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      keepAlive: false
    },
    props: {
      routerBase: '/vue3'
    }
  },
  {
    id: 'vue2-sub-app',
    name: 'Vue2 子应用',
    entry: '//localhost:3000',
    activeRule: '/vue2',
    container: '#micro-app-container',
    status: 'online',
    version: '1.0.0',
    lastModified: Date.now(),
    preload: true,
    type: 'vue2',
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      keepAlive: false
    },
    props: {
      routerBase: '/vue2'
    }
  },
  {
    id: 'iframe-sub-app',
    name: 'iframe 子应用',
    entry: '//localhost:9080',
    activeRule: '/iframe',
    container: '#micro-app-container',
    status: 'online',
    version: '1.0.0',
    lastModified: Date.now(),
    preload: false,
    type: 'iframe',
    layoutType: 'embedded',
    layoutOptions: {
      showSidebar: false,
      keepAlive: false
    }
  }
]

// 标准化所有微应用的布局配置
export const microApps = baseMicroApps.map(app => {
  const normalized = normalizeLayoutConfig(app.layoutType, app.layoutOptions)
  return {
    ...app,
    layoutType: normalized.layoutType,
    layoutOptions: normalized.layoutOptions
  }
})

/**
 * 获取微应用配置
 * @param {string} appId - 应用ID
 * @returns {Object|undefined}
 */
export function getMicroApp(appId) {
  return microApps.find(app => app.id === appId)
}

/**
 * 获取微应用配置并验证布局
 * @param {string} appId - 应用ID
 * @returns {Object|undefined}
 */
export function getValidatedMicroApp(appId) {
  const app = microApps.find(app => app.id === appId)
  if (!app) return undefined
  
  // 验证布局配置
  const validation = validateLayoutConfig(app.layoutType, app.layoutOptions)
  if (validation.warnings.length > 0) {
    console.warn(`[MicroApp Config] App ${appId} layout warnings:`, validation.warnings)
  }
  
  return app
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
 * @param {string} appId - 应用ID
 * @param {Object} config - 配置对象
 */
export function updateMicroAppConfig(appId, config) {
  const index = microApps.findIndex(app => app.id === appId)
  if (index !== -1) {
    microApps[index] = { ...microApps[index], ...config }
  }
}

/**
 * 验证所有微应用的布局配置
 * @returns {Array} 验证结果数组
 */
export function validateAllMicroAppLayouts() {
  const results = []
  
  microApps.forEach(app => {
    const validation = validateLayoutConfig(app.layoutType, app.layoutOptions)
    results.push({
      appId: app.id,
      appName: app.name,
      layoutType: app.layoutType,
      validation
    })
  })
  
  return results
}

/**
 * 获取布局配置建议
 * @param {string} appId - 应用ID
 * @returns {Object|null} 建议的配置
 */
export function getLayoutSuggestions(appId) {
  const app = microApps.find(app => app.id === appId)
  if (!app) return null
  
  const defaultOptions = getDefaultLayoutOptions(app.layoutType)
  const suggestions = []
  
  Object.keys(defaultOptions).forEach(key => {
    if (app.layoutOptions[key] !== defaultOptions[key]) {
      suggestions.push({
        option: key,
        currentValue: app.layoutOptions[key],
        defaultValue: defaultOptions[key],
        suggestion: `建议值: ${defaultOptions[key]}`
      })
    }
  })
  
  return {
    appId,
    layoutType: app.layoutType,
    suggestions
  }
}

export default microApps
