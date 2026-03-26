/**
 * HTTP 请求客户端封装
 * 
 * 核心功能：
 * - 创建统一的 axios 实例
 * - 请求拦截器（Token 注入、防缓存）
 * - 响应拦截器（统一错误处理、Token 过期自动跳转）
 * - 导出常用 HTTP 方法
 * - Token 管理工具
 * 
 * @module utils/request
 */

import axios from 'axios'
import { createFileOperations } from './fileOperations'
import { mockEngine } from './mockEngine'
import { API_BASE_URL, REQUEST_TIMEOUT, TOKEN_KEY, DEFAULT_HEADERS } from '@/config/app'

// 创建 axios 实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: DEFAULT_HEADERS
})

// 请求拦截器（注入 Token、防缓存）
request.interceptors.request.use(config => {
  // 注入 Token
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  // GET 请求添加时间戳防止缓存
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() }
  }

  // Mock 路由判断
  if (mockEngine.shouldUseMock(config.method, config.url)) {
    config.adapter = async () => {
      try {
        const mockData = await mockEngine.handle(
          config.method.toUpperCase(),
          config.url,
          config.data
        )
        return {
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config
        }
      } catch (error) {
        console.warn(`[Mock] Handler not found for ${config.method} ${config.url}, falling back to API`)
        delete config.adapter
        return request(config)
      }
    }
  }

  return config
}, error => Promise.reject(error))

// 响应拦截器（错误处理、Token 过期）
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 检查业务错误码
    if ('code' in res && res.code !== 200 && res.code !== 0) {
      // Token 过期处理：清除 Token 并跳转登录页
      if (res.code === 401) {
        localStorage.removeItem('user-token')
        window.location.href = '/login'
      }
      
      // 抛出错误
      const error = new Error(res.message || 'Request failed')
      error.code = res.code
      throw error
    }
    
    // 返回数据（优先返回 data 字段）
    return res.data !== undefined ? res.data : res
  },
  error => {
    // HTTP 错误处理
    if (error.response) {
      console.error(`[Request] HTTP ${error.response.status}`)
    } else if (error.request) {
      // 网络错误
      console.error('[Request] Network error')
    }
    return Promise.reject(error)
  }
)

// ============ 默认导出 ============
export default request

// ============ HTTP 方法导出 ============
export const { get, post, put, delete: del, patch } = request

// ============ Token 管理工具 ============
export const setToken = token => localStorage.setItem(TOKEN_KEY, token)
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// ============ 主应用完整 request 能力包 ============
/**
 * mainRequest - 主应用完整的 request 能力包
 * 
 * 包含：
 * - HTTP 方法（get, post, put, delete, patch）
 * - 文件操作（downloadFile, downloadExcel, downloadPDF, uploadFile）
 * - Token 管理（setToken, getToken, clearToken）
 */
const mainRequest = {
  // HTTP 方法（从 axios 实例解构）
  get, post, put, delete: del, patch,
  // 文件操作方法（使用默认 request 实例）
  ...createFileOperations(),
  // Token 管理
  setToken,
  getToken,
  clearToken
}

export { mainRequest }

// ============ 工厂函数 ============
/**
 * createCustomRequest - 创建自定义 baseURL 的 request 实例
 * 
 * @param {string} baseURL - API 基础地址
 * @param {Object} options - 配置选项
 * @param {Object} options.interceptors - 自定义拦截器（可选）
 * @param {Function} options.interceptors.request - 请求拦截器
 * @param {Function} options.interceptors.response - 响应拦截器
 * @param {boolean} options.useDefaultInterceptors - 是否使用默认拦截器（默认 true）
 * @returns {Object} axios 实例
 * 
 * @example
 * // 基础用法（使用默认拦截器）
 * const api = createCustomRequest('https://api.example.com')
 * 
 * @example
 * // 自定义拦截器（完全覆盖）
 * const customApi = createCustomRequest('https://api.example.com', {
 *   useDefaultInterceptors: false,
 *   interceptors: {
 *     request: (config) => {
 *       // 自定义请求逻辑
 *       config.headers['X-Custom-Header'] = 'value'
 *       return config
 *     },
 *     response: (response) => {
 *       // 自定义响应逻辑
 *       return response.data
 *     }
 *   }
 * })
 * 
 * @example
 * // 扩展默认拦截器（在默认基础上添加逻辑）
 * const extendedApi = createCustomRequest('https://api.example.com', {
 *   interceptors: {
 *     request: (config) => {
 *       // 在默认拦截器之后执行
 *       console.log('Custom logic:', config.url)
 *       return config
 *     }
 *   }
 * })
 */
export function createCustomRequest(baseURL, options = {}) {
  const customRequest = axios.create({
    baseURL: baseURL || API_BASE_URL,
    timeout: options.timeout || REQUEST_TIMEOUT,
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    ...options
  })
  
  // 判断是否使用默认拦截器
  const useDefault = options.useDefaultInterceptors !== false
  
  if (useDefault) {
    // 添加默认拦截器（Token 注入、错误处理）
    customRequest.interceptors.request.use(config => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) config.headers['Authorization'] = `Bearer ${token}`
      return config
    }, error => Promise.reject(error))
    
    customRequest.interceptors.response.use(
      response => {
        const res = response.data
        if ('code' in res && res.code !== 200 && res.code !== 0) {
          if (res.code === 401) {
            localStorage.removeItem(TOKEN_KEY)
            window.location.href = '/login'
          }
          const error = new Error(res.message || 'Request failed')
          error.code = res.code
          throw error
        }
        return res.data !== undefined ? res.data : res
      },
      error => Promise.reject(error)
    )
    
    // 如果提供了自定义拦截器，在默认拦截器之后添加
    if (options.interceptors?.request) {
      customRequest.interceptors.request.use(options.interceptors.request)
    }
    if (options.interceptors?.response) {
      customRequest.interceptors.response.use(options.interceptors.response)
    }
  } else {
    // 不使用默认拦截器，完全使用自定义的
    if (options.interceptors?.request) {
      customRequest.interceptors.request.use(options.interceptors.request)
    }
    if (options.interceptors?.response) {
      customRequest.interceptors.response.use(options.interceptors.response)
    }
  }
  
  return customRequest
}