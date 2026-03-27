/**
 * 测试 API 模块
 * 
 * 用于演示和测试 Mock 接口功能
 * 所有接口都支持 Mock 模式（通过 mockEngine 拦截）
 */

import { mainRequest } from '@/utils/request'

/**
 * 获取测试列表数据
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认 1）
 * @param {number} params.pageSize - 每页条数（默认 10）
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<Object>} 测试结果
 */
export async function getTestListAPI(params = {}) {
  const response = await mainRequest.get('/api/test/list', { params })
  return response
}

/**
 * 创建测试数据
 * @param {Object} data - 测试数据
 * @param {string} data.name - 名称
 * @param {string} data.description - 描述
 * @returns {Promise<Object>} 创建结果
 */
export async function createTestItemAPI(data) {
  const response = await mainRequest.post('/api/test', data)
  return response
}

/**
 * 删除测试数据
 * @param {number} id - 数据 ID
 * @returns {Promise<Object>} 删除结果
 */
export async function deleteTestItemAPI(id) {
  const response = await mainRequest.delete(`/api/test/${id}`)
  return response
}

/**
 * 默认导出：将 API 函数挂载到 test 对象上
 * 支持两种调用方式：
 * 1. import { getTestListAPI } from '@/api/test' - 命名导入
 * 2. import API from '@/api' -> API.test.getTestList() - 自动导入
 */
export default {
  getTestList: getTestListAPI,
  createTestItem: createTestItemAPI,
  deleteTestItem: deleteTestItemAPI
}
