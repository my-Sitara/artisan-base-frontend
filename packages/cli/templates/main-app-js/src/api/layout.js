/**
 * 多应用布局管理 API
 * 
 * 纯 API 调用模块，不包含业务逻辑
 * 业务逻辑（mock/API 切换、localStorage 降级）在 composables/useLayout.js 中
 */

import { mainRequest } from '@/utils/request'

/**
 * 保存布局数据到后端
 * @param {Object} data - 布局数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveLayoutAPI(data) {
  const result = await mainRequest.post('/multi-app-layout/save', data)
  return result
}

/**
 * 从后端加载布局数据
 * @returns {Promise<Object|null>} 布局数据
 */
export async function loadLayoutAPI() {
  const result = await mainRequest.get('/multi-app-layout/load')
  return result || {}
}

/**
 * 从后端清除布局数据
 * @returns {Promise<Object>} 清除结果
 */
export async function clearLayoutAPI() {
  const result = await mainRequest.delete('/multi-app-layout/clear')
  return result
}

/**
 * 默认导出：将 API 函数挂载到 layout 对象上
 * 支持两种调用方式：
 * 1. import { loadLayoutAPI } from '@/api/layout' - 命名导入
 * 2. import API from '@/api' -> API.layout.loadLayoutAPI() - 自动导入
 */
export default {
  saveLayout: saveLayoutAPI,
  loadLayout: loadLayoutAPI,
  clearLayout: clearLayoutAPI
}
