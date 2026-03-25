/**
 * 子应用 Request 提供者
 * 
 * 核心职责：为子应用提供 request 能力，不主动创建实例，只提供工厂函数
 * 
 * 提供的能力：
 * - mainRequest: 主应用完整的 request 能力包（HTTP 方法 + 文件操作 + Token 管理）
 * - createCustomRequest: 工厂函数，子应用可自定义 baseURL 和拦截器创建 request
 * - createFileOperations: 工厂函数，为任意 request 创建文件操作能力
 * 
 * createCustomRequest 特性：
 * - 支持自定义 baseURL
 * - 支持自定义拦截器（完全覆盖或扩展默认拦截器）
 * - 支持关闭默认拦截器（useDefaultInterceptors: false）
 * 
 * 设计原则：
 * - 职责分离：只负责提供能力，不负责生命周期管理（由 microAppManager 负责）
 * - 按需使用：子应用根据需要自行创建 customRequest
 * - 灵活扩展：支持多实例、双 API、自创建能力、拦截器重写
 * 
 * @module core/subAppRequestProvider
 */

import { createCustomRequest } from '@/utils/request'
import { createFileOperations, downloadFile, downloadExcel, downloadPDF, uploadFile } from '@/utils/fileOperations'
import { TOKEN_KEY, USER_INFO_KEY, API_BASE_URL, APP_VERSION } from '@/config/app'

/**
 * 为 window 挂载 request 能力（供子应用直接访问）
 * 
 * 作用：
 * - window.$request: 主应用完整的 request 能力包
 * - window.createCustomRequest: 工厂函数，供子应用自己创建 customRequest
 * - window.createFileOperations: 工厂函数，供子应用创建文件操作能力
 * 
 * 使用场景：
 * - iframe 子应用通过 parent.window 访问
 * - 独立运行的页面可以直接使用
 */
export function provideRequestToSubApps() {
  if (!window.request) {
    // ✅ 提供主应用的完整 request 能力
    // 推荐使用 $request（更简洁），但 request 也可以用（向后兼容）
    window.$request = mainRequest
    
    // ✅ 提供工厂函数，让子应用可以自己创建
    window.createCustomRequest = createCustomRequest
    window.createFileOperations = createFileOperations
    
    console.log('[SubAppRequest] Provided via window object')
  }
}

// Token 管理
const auth = {
  setToken: token => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
}

/**
 * 创建子应用 props（提供基础能力和工厂函数）
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.baseURL - 子应用自定义 API 地址（可选，推荐在子应用中自行指定）
 * @returns {Object} 子应用 props 对象
 * 
 * 提供的能力：
 * - $request: 主应用完整的 request 能力包（推荐使用）
 * - auth: Token 管理工具集
 * - mainBaseURL: 主应用 API 地址
 * - currentUser: 当前用户信息
 * - mainAppVersion: 主应用版本
 * - createCustomRequest: 工厂函数，子应用自己创建 customRequest
 * - createFileOperations: 工厂函数，子应用自己创建文件操作
 * 
 * 设计原则：
 * - 不再从微应用配置中读取 baseURL
 * - 子应用应该在代码中明确指定自己的 API 地址
 * - 只通过 options.baseURL 参数传递（供特殊场景使用）
 */
export function createSubAppProps(options = {}) {
  const { baseURL } = options
  
  const props = {
    // ✅ 主应用 request 能力（推荐使用 $request）
    $request: mainRequest,
    
    // ✅ Token 管理
    auth,
    
    // ✅ 基础信息（从统一配置读取）
    mainBaseURL: API_BASE_URL,
    currentUser: JSON.parse(localStorage.getItem(USER_INFO_KEY) || '{}'),
    mainAppVersion: APP_VERSION,
    
    // ✅ 工厂函数：让子应用可以自己创建 customRequest 和 fileOps
    createCustomRequest,
    createFileOperations
  }
  
  // ⚠️ 不再主动创建 customRequest，只提供 baseURL 配置
  if (baseURL) {
    props.baseURL = baseURL
  }
  
  return props
}

/**
 * 初始化子应用 Request 提供者
 */
export function initSubAppRequest() {
  console.log('[SubAppRequest] Initializing...')
  provideRequestToSubApps()
  console.log('[SubAppRequest] Initialized')
}

/**
 * 清理资源（可选）
 */
export function dispose() {
  console.log('[SubAppRequest] Disposed')
}

export default {
  provideRequestToSubApps,
  createSubAppProps,
  initSubAppRequest,
  dispose
}
