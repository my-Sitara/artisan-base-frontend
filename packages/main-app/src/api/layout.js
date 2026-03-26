/**
 * 多应用布局管理 API
 * 
 * 支持两种模式：
 * - mock: 使用 localStorage（开发/演示）
 * - api: 使用后端 API（生产环境）
 * 
 * 通过环境变量 VITE_MOCK_MODE 控制
 */

import { mainRequest } from '@/utils/request'
import { USE_MOCK } from '@/config/app.js'

const STORAGE_KEY = 'artisan-multi-app-layout'

/**
 * 保存布局数据
 * @param {Object} data - 布局数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveLayoutAPI(data) {
  if (USE_MOCK) {
    // Mock 模式：保存到 localStorage
    console.log('[LayoutAPI] Saving to localStorage (mock mode)')
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      return { success: true, message: 'Saved to localStorage' }
    } catch (error) {
      console.error('[LayoutAPI] Failed to save to localStorage:', error)
      throw error
    }
  }
  
  // API 模式：发送到后端（使用封装的 request，自动注入 Token）
  console.log('[LayoutAPI] Saving to API')
  try {
    // ✅ 使用 mainRequest.post，自动包含 Token 和统一错误处理
    const result = await mainRequest.post('/multi-app-layout/save', data)
    console.log('[LayoutAPI] Saved successfully:', result)
    
    // 同时备份到 localStorage（防止数据丢失）
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    
    return result
  } catch (error) {
    console.error('[LayoutAPI] Failed to save to API:', error)
    
    // API 失败时降级到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.warn('[LayoutAPI] Saved to localStorage as fallback')
    } catch (localErr) {
      console.error('[LayoutAPI] Failed to save to localStorage:', localErr)
    }
    
    throw error
  }
}

/**
 * 加载布局数据
 * @returns {Promise<Object|null>} 布局数据
 */
export async function loadLayoutAPI() {
  if (USE_MOCK) {
    // Mock 模式：从 localStorage 加载
    console.log('[LayoutAPI] Loading from localStorage (mock mode)')
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch (error) {
      console.error('[LayoutAPI] Failed to load from localStorage:', error)
      return null
    }
  }
  
  // API 模式：从后端加载（使用封装的 request）
  console.log('[LayoutAPI] Loading from API')
  try {
    // ✅ 使用 mainRequest.get，自动包含 Token
    const result = await mainRequest.get('/multi-app-layout/load')
    const data = result || {}
    console.log('[LayoutAPI] Loaded successfully:', data)
    
    // 同时备份到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    
    return data
  } catch (error) {
    console.error('[LayoutAPI] Failed to load from API:', error)
    
    // 网络错误时从 localStorage 恢复
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        console.warn('[LayoutAPI] Restored from localStorage as fallback')
        return data
      }
    } catch (localErr) {
      console.error('[LayoutAPI] Failed to restore from localStorage:', localErr)
    }
    
    return null
  }
}

/**
 * 清除布局数据
 */
export function clearLayoutAPI() {
  if (!USE_MOCK) {
    console.log('[LayoutAPI] Clearing API data (not implemented)')
  }
  localStorage.removeItem(STORAGE_KEY)
  console.log('[LayoutAPI] Cleared localStorage')
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
