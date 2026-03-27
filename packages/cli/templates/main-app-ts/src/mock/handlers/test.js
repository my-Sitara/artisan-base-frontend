/**
 * 测试 API Mock Handler
 */

import { mockEngine } from '@/utils/mockEngine'

mockEngine.register('GET /api/test/list', (query) => {
  const { page = 1, pageSize = 10, search = '' } = query || {}
  
  const mockData = Array.from({ length: Number(pageSize) }, (_, index) => ({
    id: (Number(page) - 1) * Number(pageSize) + index + 1,
    name: `测试项 ${index + 1}`,
    description: `这是第 ${index + 1} 个测试数据`,
    status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'pending' : 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    tags: ['测试', '示例', 'Mock'].slice(0, Math.floor(Math.random() * 3) + 1)
  }))
  
  let filteredData = mockData
  if (search) {
    filteredData = mockData.filter(item => 
      item.name.includes(search) || item.description.includes(search)
    )
  }
  
  return {
    code: 200,
    message: 'success',
    data: {
      items: filteredData,
      total: filteredData.length,
      page: Number(page),
      pageSize: Number(pageSize)
    }
  }
})

mockEngine.register('POST /api/test', (data) => {
  return {
    code: 200,
    message: '创建成功',
    data: {
      id: Math.floor(Math.random() * 1000) + 1,
      name: data.name || '新测试项',
      description: data.description || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      tags: ['新建']
    }
  }
})

mockEngine.register('DELETE /api/test/:id', (data, params) => {
  return {
    code: 200,
    message: '删除成功'
  }
})

console.log('[Mock] Test API handlers registered')
