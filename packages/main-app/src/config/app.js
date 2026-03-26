/**
 * 应用统一配置
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
 * 是否启用 Mock 模式
 */
export const USE_MOCK = import.meta.env.VITE_MOCK_MODE === 'true'

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
  USE_MOCK,
  DEFAULT_HEADERS
}
