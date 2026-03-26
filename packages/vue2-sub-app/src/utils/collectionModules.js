/**
 * 模块采集工具函数（Vue2 子应用 - JavaScript）
 * 
 * 用于自动导入指定目录下的模块文件，并按文件名组织导出
 */
export default function collectionModules(result = {}, context, options = {}) {
  const { expand = false } = options
  
  // 遍历上下文中的所有模块
  context.keys().forEach(key => {
    // 提取文件名（不含扩展名）
    const moduleName = key.replace(/^\.\/(.*)\.\w+$/, '$1')
    
    // 跳过 index 文件
    if (moduleName === 'index') return
    
    // 导入模块
    const module = context(key)
    
    if (expand) {
      // 展开模式：直接导出模块的所有内容
      Object.assign(result, module)
    } else {
      // 默认模式：按模块名组织
      result[moduleName] = module.default || module
    }
  })
  
  return result
}
