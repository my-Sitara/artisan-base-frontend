/**
 * Mock 白名单配置
 * 
 * 定义哪些接口支持 mock，以及全局 mock 行为控制
 * @module config/mockConfig
 */

import { USE_MOCK } from './app'

/**
 * Mock 白名单：定义哪些接口支持 mock
 * 
 * 格式：'METHOD /path' = true/false
 * 
 * 示例：
 * - 'GET /api/users': true  // GET /api/users 可以使用 mock
 * - 'POST /api/users': true // POST /api/users 可以使用 mock
 */
export const mockWhitelist = {
  // 微应用配置接口
  'GET /api/micro-apps': true,
  
  // 注意：Layout 布局接口（/multi-app-layout/*）由 composables/useLayout.js
  // 独立管理 mock 逻辑（通过 localStorage 实现），不通过 mockEngine 处理。
  // 因此不在此白名单中配置，避免产生 "Handler not found" 警告。
  
  // 测试接口
  'GET /api/test/list': true,
  'POST /api/test': true,
  'DELETE /api/test/:id': true,
  
  // 示例业务接口（后续可扩展）
  // 'GET /api/users': true,
  // 'POST /api/users': true,
}

/**
 * Mock 全局配置
 */
export const mockGlobalConfig = {
  enabled: USE_MOCK,                    // 由环境变量控制
  defaultMode: 'api',                   // 默认走真实 API
  persistence: true,                    // 支持运行时切换持久化
  storageKey: 'artisan-mock-config-v1'  // localStorage 键名
}
