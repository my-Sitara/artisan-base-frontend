/**
 * 多应用布局管理 API
 * 
 * 纯 API 调用模块，不包含业务逻辑
 * 业务逻辑（mock/API 切换、localStorage 降级）在 composables/useLayout.ts 中
 */

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 保存布局数据到后端
 * @param {Object} data - 布局数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveLayoutAPI(data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/multi-app-layout/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const result = await response.json()
  return result
}

/**
 * 从后端加载布局数据
 * @returns {Promise<Object|null>} 布局数据
 */
export async function loadLayoutAPI(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/multi-app-layout/load`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const result = await response.json()
  return result || {}
}

/**
 * 从后端清除布局数据
 * @returns {Promise<Object>} 清除结果
 */
export async function clearLayoutAPI(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/multi-app-layout/clear`, {
    method: 'DELETE'
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const result = await response.json()
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
