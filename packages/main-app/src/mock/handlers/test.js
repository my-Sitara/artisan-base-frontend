/**
 * 测试 API Mock Handler
 * 
 * 提供测试接口的 Mock 数据生成和拦截
 */

import { mockEngine } from '@/utils/mockEngine'

/**
 * GET /api/test/list - 获取测试列表
 * 
 * @pattern GET /api/test/list
 * @queryParams 
 *   - page: number (页码，默认 1)
 *   - pageSize: number (每页条数，默认 10)
 *   - search: string (搜索关键词)
 * 
 * @response
 * {
 *   code: 200,
 *   message: 'success',
 *   data: {
 *     items: [...],
 *     total: number,
 *     page: number,
 *     pageSize: number
 *   }
 * }
 */
mockEngine.register('GET /api/test/list', (query) => {
  const { page = 1, pageSize = 10, search = '' } = query || {}
  
  console.log('[Mock] GET /api/test/list - 收到请求参数:', { page, pageSize, search })
  
  // 生成模拟数据
  const mockData = Array.from({ length: Number(pageSize) }, (_, index) => ({
    id: (Number(page) - 1) * Number(pageSize) + index + 1,
    name: `测试项 ${index + 1}`,
    description: `这是第 ${index + 1} 个测试数据`,
    status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'pending' : 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    tags: ['测试', '示例', 'Mock'].slice(0, Math.floor(Math.random() * 3) + 1)
  }))
  
  console.log('[Mock] 生成的原始数据条数:', mockData.length)
  
  // 如果有搜索关键词，过滤数据
  let filteredData = mockData
  if (search) {
    filteredData = mockData.filter(item => 
      item.name.includes(search) || item.description.includes(search)
    )
    console.log('[Mock] 过滤后的数据条数:', filteredData.length)
  }
  
  const response = {
    code: 200,
    message: 'success',
    data: {
      items: filteredData,
      total: filteredData.length,
      page: Number(page),
      pageSize: Number(pageSize)
    }
  }
  
  console.log('[Mock] 返回的完整数据:', JSON.stringify(response, null, 2))
  
  return response
})

/**
 * POST /api/test - 创建测试数据
 * 
 * @pattern POST /api/test
 * @body
 *   - name: string (required)
 *   - description: string
 * 
 * @response
 * {
 *   code: 200,
 *   message: '创建成功',
 *   data: {
 *     id: number,
 *     name: string,
 *     description: string,
 *     status: 'pending',
 *     createdAt: string,
 *     tags: ['新建']
 *   }
 * }
 */
mockEngine.register('POST /api/test', (data) => {
  console.log('[Mock] POST /api/test', data)
  
  const newItem = {
    id: Math.floor(Math.random() * 1000) + 1,
    name: data.name || '新测试项',
    description: data.description || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    tags: ['新建']
  }
  
  return {
    code: 200,
    message: '创建成功',
    data: newItem
  }
})

/**
 * DELETE /api/test/:id - 删除测试数据
 * 
 * @pattern DELETE /api/test/:id
 * @pathParams
 *   - id: number (数据 ID)
 * 
 * @response
 * {
 *   code: 200,
 *   message: '删除成功'
 * }
 */
mockEngine.register('DELETE /api/test/:id', (data, params) => {
  const id = params?.id
  console.log('[Mock] DELETE /api/test/:id', id)
  
  return {
    code: 200,
    message: '删除成功'
  }
})

console.log('[Mock] Test API handlers registered')
