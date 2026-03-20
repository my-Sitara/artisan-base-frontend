/**
 * 多应用布局管理 API
 * 
 * 支持两种模式：
 * - mock: 使用 localStorage（开发/演示）
 * - api: 使用后端 API（生产环境）
 * 
 * 通过环境变量 VITE_USE_LAYOUT_API 控制
 */

const STORAGE_KEY = 'artisan-multi-app-layout'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const LAYOUT_SAVE_API = `${API_BASE_URL}/multi-app-layout/save`
const LAYOUT_LOAD_API = `${API_BASE_URL}/multi-app-layout/load`

// 是否使用 API 模式
const USE_API = import.meta.env.VITE_USE_LAYOUT_API === 'true'

/**
 * 保存布局数据
 * @param {Object} data - 布局数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveLayoutAPI(data) {
  if (!USE_API) {
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
  
  // API 模式：发送到后端
  console.log('[LayoutAPI] Saving to API:', LAYOUT_SAVE_API)
  try {
    const response = await fetch(LAYOUT_SAVE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[LayoutAPI] API response error:', response.status, errorText)
      
      // API 失败时降级到 localStorage
      console.warn('[LayoutAPI] Falling back to localStorage')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('[LayoutAPI] Saved successfully:', result)
    
    // 同时备份到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    
    return result
  } catch (error) {
    console.error('[LayoutAPI] Failed to save to API:', error)
    
    // 网络错误时降级到 localStorage
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
  if (!USE_API) {
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
  
  // API 模式：从后端加载
  console.log('[LayoutAPI] Loading from API:', LAYOUT_LOAD_API)
  try {
    const response = await fetch(LAYOUT_LOAD_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('[LayoutAPI] API load failed, trying localStorage')
      // API 失败时使用 localStorage 作为降级
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    }
    
    const result = await response.json()
    const data = result.data || result
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
  if (USE_API) {
    console.log('[LayoutAPI] Clearing API data (not implemented)')
  }
  localStorage.removeItem(STORAGE_KEY)
  console.log('[LayoutAPI] Cleared localStorage')
}
