/**
 * 微应用配置
 * 支持 vue3 / vue2 / iframe / link 类型
 */
export const microApps = [
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
      keepAlive: false,
      multiTab: false
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
      keepAlive: false,
      multiTab: false
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
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      keepAlive: false,
      multiTab: false
    }
  }
]

/**
 * 获取微应用配置
 * @param {string} appId - 应用ID
 * @returns {Object|undefined}
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
 * @param {string} appId - 应用ID
 * @param {Object} config - 配置对象
 */
export function updateMicroAppConfig(appId, config) {
  const index = microApps.findIndex(app => app.id === appId)
  if (index !== -1) {
    microApps[index] = { ...microApps[index], ...config }
  }
}

export default microApps
