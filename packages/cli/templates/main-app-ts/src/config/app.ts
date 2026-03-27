/**
 * 应用统一配置（TypeScript）
 * 
 * 集中管理所有环境变量和常量配置，避免重复定义
 * @module config/app
 */

/**
 * API 基础地址
 * 优先级：环境变量 > 默认值
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 30000

/**
 * Token 存储键名
 */
export const TOKEN_KEY = 'user-token'

/**
 * 用户信息存储键名
 */
export const USER_INFO_KEY = 'user-info'

/**
 * 应用版本
 */
export const APP_VERSION = import.meta.env.PACKAGE_VERSION || '1.0.0'

/**
 * 微应用 API 地址（可选）
 */
export const MICRO_APPS_API_URL = import.meta.env.VITE_MICRO_APPS_API_URL || '/api/micro-apps'

/**
 * 是否启用微应用 API 模式
 */
export const USE_MICRO_APPS_API = import.meta.env.VITE_USE_MICRO_APPS_API === 'true'

/**
 * 是否启用布局 API 模式
 */
export const USE_LAYOUT_API = import.meta.env.VITE_USE_LAYOUT_API === 'true'

/**
 * 是否使用 Mock 模式
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * 默认请求头配置
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

/**
 * 导出统一的配置对象
 */
export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  TOKEN_KEY,
  USER_INFO_KEY,
  APP_VERSION,
  MICRO_APPS_API_URL,
  USE_MICRO_APPS_API,
  USE_LAYOUT_API,
  USE_MOCK,
  DEFAULT_HEADERS
}
