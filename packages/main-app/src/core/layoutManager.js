import { ref } from 'vue'

/**
 * 布局类型枚举
 */
export const LayoutTypes = {
  DEFAULT: 'default',
  FULL: 'full',
  TABS: 'tabs',
  EMBEDDED: 'embedded',
  BLANK: 'blank'
}

/**
 * 布局管理器
 * 负责动态布局切换和布局选项配置
 */
class LayoutManager {
  constructor() {
    // 当前布局类型
    this.currentLayoutType = ref(LayoutTypes.DEFAULT)
    
    // 布局选项
    this.layoutOptions = ref({
      showHeader: true,
      showSidebar: true,
      keepAlive: false,
      multiTab: false
    })
    
    // 布局切换回调
    this.onChangeCallbacks = []
  }

  /**
   * 设置布局类型
   * @param {string} type - 布局类型
   * @param {Object} options - 布局选项
   */
  setLayout(type, options = {}) {
    const prevType = this.currentLayoutType.value
    
    const validTypes = Object.values(LayoutTypes)
    if (!validTypes.includes(type)) {
      console.warn(`[LayoutManager] Unknown layout type: ${type}`)
      type = LayoutTypes.DEFAULT
    }

    this.currentLayoutType.value = type
    
    // 合并选项
    this.layoutOptions.value = {
      ...this.layoutOptions.value,
      ...options
    }

    // 触发回调
    this.onChangeCallbacks.forEach(cb => {
      cb({
        prevType,
        currentType: type,
        options: this.layoutOptions.value
      })
    })

    console.log(`[LayoutManager] Layout changed: ${prevType} -> ${type}`)
  }

  /**
   * 获取当前布局类型
   * @returns {string}
   */
  getLayoutType() {
    return this.currentLayoutType.value
  }

  /**
   * 获取布局选项
   * @returns {Object}
   */
  getLayoutOptions() {
    return this.layoutOptions.value
  }

  /**
   * 更新布局选项
   * @param {Object} options - 布局选项
   */
  updateOptions(options) {
    this.layoutOptions.value = {
      ...this.layoutOptions.value,
      ...options
    }
  }

  /**
   * 显示/隐藏头部
   * @param {boolean} show 
   */
  setHeaderVisible(show) {
    this.layoutOptions.value.showHeader = show
  }

  /**
   * 显示/隐藏侧边栏
   * @param {boolean} show 
   */
  setSidebarVisible(show) {
    this.layoutOptions.value.showSidebar = show
  }

  /**
   * 设置 KeepAlive
   * @param {boolean} enabled 
   */
  setKeepAlive(enabled) {
    this.layoutOptions.value.keepAlive = enabled
  }

  /**
   * 设置多标签模式
   * @param {boolean} enabled 
   */
  setMultiTab(enabled) {
    this.layoutOptions.value.multiTab = enabled
  }

  /**
   * 监听布局变化
   * @param {Function} callback 
   */
  onChange(callback) {
    this.onChangeCallbacks.push(callback)
  }

  /**
   * 移除监听
   * @param {Function} callback 
   */
  offChange(callback) {
    const index = this.onChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.onChangeCallbacks.splice(index, 1)
    }
  }

  /**
   * 根据微应用配置设置布局
   * @param {Object} microAppConfig - 微应用配置
   */
  setLayoutFromMicroApp(microAppConfig) {
    if (!microAppConfig) return

    const { layoutType, layoutOptions } = microAppConfig
    this.setLayout(layoutType || LayoutTypes.DEFAULT, layoutOptions || {})
  }

  /**
   * 重置为默认布局
   */
  reset() {
    this.setLayout(LayoutTypes.DEFAULT, {
      showHeader: true,
      showSidebar: true,
      keepAlive: false,
      multiTab: false
    })
  }
}

// 导出单例
export const layoutManager = new LayoutManager()

export default layoutManager
