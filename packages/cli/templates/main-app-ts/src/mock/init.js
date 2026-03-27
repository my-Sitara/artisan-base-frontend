import { USE_MOCK } from '@/config/app.js'
import { mockEngine } from '@/utils/mockEngine'

/**
 * 初始化 Mock 系统
 * 仅在 mock 模式下执行，动态导入所有 handlers 并完成注册
 */
export async function initMock() {
  if (!USE_MOCK) {
    console.log('[Mock] Skipped (not in mock mode)')
    return
  }
  
  try {
    // 动态导入所有 handler 文件
    const handlers = import.meta.glob('./handlers/*.js')
    
    for (const path in handlers) {
      try {
        await handlers[path]()
        // handlers 会自动调用 mockEngine.register()
      } catch (error) {
        console.error(`[Mock] Failed to load handler from ${path}:`, error)
      }
    }
    
    // 标记为已初始化（必须在所有 handler 加载完成后）
    mockEngine.initialize()
    
    console.log('[Mock] Initialization complete')
  } catch (error) {
    console.error('[Mock] Initialization failed:', error)
    throw error
  }
}

// 也导出 mockEngine 供子应用直接 import
export { mockEngine }
