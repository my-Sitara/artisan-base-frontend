import { mockEngine } from '@/utils/mockEngine'

/**
 * 示例 Mock Handler：用户列表接口
 * 
 * @pattern GET /api/users
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
mockEngine.register('GET /api/users', (query) => ({
  code: 200,
  message: 'success',
  data: {
    items: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
      { id: 3, name: 'User 3', email: 'user3@example.com' }
    ],
    total: 3,
    page: query?.page || 1,
    pageSize: query?.pageSize || 10
  }
}))

/**
 * 示例 Mock Handler：创建用户
 * 
 * @pattern POST /api/users
 * @body
 *   - name: string (required)
 *   - email: string (required)
 * 
 * @response
 * {
 *   code: 200,
 *   message: 'success',
 *   data: {
 *     id: number,
 *     name: string,
 *     email: string,
 *     createdAt: string (ISO date)
 *   }
 * }
 */
mockEngine.register('POST /api/users', (data) => ({
  code: 200,
  message: 'success',
  data: {
    id: Math.floor(Math.random() * 1000) + 1,
    name: data.name,
    email: data.email,
    createdAt: new Date().toISOString()
  }
}))

console.log('[Mock] Example handlers registered')
