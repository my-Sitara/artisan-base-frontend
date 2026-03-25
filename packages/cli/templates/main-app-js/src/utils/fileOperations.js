/**
 * 文件操作工具函数
 * 
 * 提供文件下载、上传等功能，支持任意 request 实例
 * 
 * 核心功能：
 * - createFileOperations: 工厂函数，为任意 request 实例创建文件操作能力
 * - downloadFile: 通用文件下载
 * - downloadExcel: Excel 文件下载
 * - downloadPDF: PDF 文件下载
 * - uploadFile: 文件上传
 * 
 * @module utils/fileOperations
 */

/**
 * 创建文件操作工具函数（支持多 request 实例）
 * 
 * @param {Object} requestInstance - axios 实例（可选，默认使用主应用 request）
 * @returns {Object} 文件操作方法集合
 * 
 * @example
 * // 使用主应用默认 request
 * const fileOps = createFileOperations()
 * 
 * @example
 * // 使用自定义 request
 * const customRequest = createCustomRequest('https://api.example.com')
 * const fileOps = createFileOperations(customRequest)
 */
export function createFileOperations(requestInstance) {
  // 不传则默认使用主应用的 request
  const req = requestInstance || window.request
  
  /**
   * 下载文件
   * 
   * @param {string} url - 下载 URL
   * @param {Object} config - 配置选项（如 params, headers, timeout 等）
   * @param {string} filename - 自定义文件名（可选，自动从响应头或 URL 提取）
   * 
   * @example
   * // 基础用法
   * await downloadFile('/api/export/users.xlsx')
   * 
   * @example
   * // 带参数和自定义文件名
   * await downloadFile('/api/export', { params: { id: 1 } }, '用户列表.xlsx')
   */
  async function downloadFile(url, config = {}, filename) {
    const response = await req({ 
      method: 'get', 
      url, 
      responseType: 'blob', 
      ...config 
    })
    
    let finalFilename = filename
    if (!finalFilename) {
      const disposition = response.headers['content-disposition']
      if (disposition?.includes('filename=')) {
        finalFilename = decodeURIComponent(disposition.match(/filename=(.+)/)[1])
      }
      if (!finalFilename) {
        finalFilename = url.substring(url.lastIndexOf('/') + 1).split('?')[0]
      }
    }
    
    const blob = new Blob([response.data], { type: response.data.type })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = finalFilename
    link.click()
    window.URL.revokeObjectURL(link.href)
  }
  
  /**
   * 下载 Excel 文件
   * @param {string} url - 下载 URL
   * @param {Object} config - 配置选项
   * @param {string} filename - 自定义文件名
   */
  async function downloadExcel(url, config = {}, filename = '导出数据.xlsx') {
    return downloadFile(url, config, filename)
  }
  
  /**
   * 下载 PDF 文件
   * @param {string} url - 下载 URL
   * @param {Object} config - 配置选项
   * @param {string} filename - 自定义文件名
   */
  async function downloadPDF(url, config = {}, filename = '文档.pdf') {
    return downloadFile(url, config, filename)
  }
  
  /**
   * 上传文件
   * @param {string} url - 上传 URL
   * @param {File|FormData} file - 文件或 FormData
   * @param {Object} additionalData - 额外数据
   * @param {Object} config - 配置选项
   */
  async function uploadFile(url, file, additionalData = {}, config = {}) {
    const formData = new FormData()
    
    if (file instanceof FormData) {
      file.forEach((value, key) => formData.append(key, value))
    } else {
      formData.append('file', file)
    }
    
    Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key]))
    
    return req({
      method: 'post',
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config
    })
  }
  
  return { 
    downloadFile, 
    downloadExcel, 
    downloadPDF, 
    uploadFile 
  }
}

/**
 * 快捷文件操作方法（使用主应用的 request）
 */
const fileOps = createFileOperations()

// 导出快捷方法（保持向后兼容）
export const downloadFile = (url, config, filename) => fileOps.downloadFile(url, config, filename)
export const downloadExcel = (url, config, filename) => fileOps.downloadExcel(url, config, filename)
export const downloadPDF = (url, config, filename) => fileOps.downloadPDF(url, config, filename)
export const uploadFile = (url, file, data, config) => fileOps.uploadFile(url, file, data, config)

export default {
  createFileOperations,
  downloadFile,
  downloadExcel,
  downloadPDF,
  uploadFile
}
