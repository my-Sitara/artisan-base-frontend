/**
 * 模块采集工具函数（Vue3 子应用 - JavaScript）
 * 
 * 用于自动导入指定目录下的模块文件，并按文件名组织导出
 * 支持 Webpack (require.context) 和 Vite (import.meta.glob)
 */
export default function collectionModules(result = {}, context, options = {}) {
  const { expand = false } = options
  
  // 判断是 Vite 的 import.meta.glob 还是 Webpack 的 require.context
  if (typeof context === 'object') {
    // Vite 模式：import.meta.glob 返回的是一个对象
    Object.entries(context).forEach(([path, module]) => {
      // 提取文件名（不含扩展名）
      const moduleName = path.replace(/^\.\/(.+)\.\w+$/, '$1')
      
      // 跳过 index 文件
      if (moduleName === 'index') return
      
      // Vite 的 glob 导入是异步的，需要调用导入函数
      const imported = typeof module === 'function' ? module() : module
      
      if (expand) {
        // 展开模式：直接导出模块的所有内容
        Object.assign(result, imported)
      } else {
        // 默认模式：按模块名组织
        result[moduleName] = imported.default || imported
      }
    })
  } else if (typeof context === 'function') {
    // Webpack 模式：require.context
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
  }
  
  return result
}
