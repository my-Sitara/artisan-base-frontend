/**
 * 布局数据管理 Composable (TypeScript)
 * 
 * 职责：
 * - Mock/API 模式切换
 * - localStorage 读写（mock 模式和降级备份）
 * - API 调用的降级容错策略
 * 
 * 设计原则：
 * - API 调用通过 api/layout.ts（纯 HTTP 调用）
 * - 业务逻辑（模式判断、降级、缓存）在此处理
 */

import { USE_MOCK } from '@/config/app'
import { saveLayoutAPI, loadLayoutAPI, clearLayoutAPI } from '@/api/layout'

const STORAGE_KEY = 'artisan-multi-app-layout'

// ============ localStorage 工具函数 ============

/**
 * 保存布局到 localStorage
 */
function saveToLocal(data: any): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('[Layout] Failed to save to localStorage:', error)
    return false
  }
}

/**
 * 从 localStorage 加载布局
 */
function loadFromLocal(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('[Layout] Failed to load from localStorage:', error)
    return null
  }
}

/**
 * 清除 localStorage 中的布局数据
 */
function clearLocal(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ============ 核心业务逻辑 ============

/**
 * 保存布局数据（自动选择 mock/API 模式）
 * 
 * Mock 模式：直接保存到 localStorage
 * API 模式：发送到后端 + localStorage 备份，失败时降级到 localStorage
 * 
 * @param {Object} data - 布局数据
 * @returns {Promise<Object>} 保存结果
 */
export async function saveLayout(data: any): Promise<any> {
  if (USE_MOCK) {
    console.log('[Layout] Saving to localStorage (mock mode)')
    saveToLocal(data)
    return { success: true, message: 'Saved to localStorage' }
  }

  console.log('[Layout] Saving to API')
  try {
    const result = await saveLayoutAPI(data)
    console.log('[Layout] Saved successfully:', result)
    
    // 同时备份到 localStorage（防止数据丢失）
    saveToLocal(data)
    
    return result
  } catch (error) {
    console.error('[Layout] Failed to save to API:', error)
    
    // API 失败时降级到 localStorage
    saveToLocal(data)
    console.warn('[Layout] Saved to localStorage as fallback')
    
    throw error
  }
}

/**
 * 加载布局数据（自动选择 mock/API 模式）
 * 
 * Mock 模式：从 localStorage 加载
 * API 模式：从后端加载 + localStorage 备份，失败时从 localStorage 恢复
 * 
 * @returns {Promise<Object|null>} 布局数据
 */
export async function loadLayout(): Promise<any> {
  if (USE_MOCK) {
    console.log('[Layout] Loading from localStorage (mock mode)')
    return loadFromLocal()
  }

  console.log('[Layout] Loading from API')
  try {
    const data = await loadLayoutAPI()
    console.log('[Layout] Loaded successfully:', data)
    
    // 同时备份到 localStorage
    if (data) {
      saveToLocal(data)
    }
    
    return data
  } catch (error) {
    console.error('[Layout] Failed to load from API:', error)
    
    // 网络错误时从 localStorage 恢复
    const data = loadFromLocal()
    if (data) {
      console.warn('[Layout] Restored from localStorage as fallback')
      return data
    }
    
    return null
  }
}

/**
 * 清除布局数据
 */
export function clearLayout(): void {
  if (!USE_MOCK) {
    console.log('[Layout] Clearing API data (not implemented)')
  }
  clearLocal()
  console.log('[Layout] Cleared localStorage')
}

export default {
  saveLayout,
  loadLayout,
  clearLayout
}
