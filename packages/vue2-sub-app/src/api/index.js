/**
 * API 模块统一导出（Vue2 子应用 - JavaScript）
 * 
 * 采用自动导入机制，当前目录下的所有 .js 文件会自动被采集并导出
 * 使用文件主名作为 key，如：users.js 会变成 { users: {...} }
 * 
 * @example
 * // 导入所有 API（按模块名）
 * import api from '@/api'
 * api.users.getUserList()
 * api.user.getInfo()
 */

import collectionModules from '@/utils/collectionModules'

// 自动导入当前目录下所有 .js 文件（排除 index.js）
const context = require.context('.', false, /\.js$/)
const apis = collectionModules({}, context, {
  expand: false  // false: 按模块名组织 { layout: {...}, user: {...} }
                 // true: 直接展开所有函数
})

export default apis
