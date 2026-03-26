# API 自动导入机制 Vite 适配完成

## 📋 修改概述

将所有项目的 API 自动导入机制从 Webpack 的 `require.context` 迁移到 Vite 的 `import.meta.glob`，同时保持向后兼容性。

## ✅ 已修改文件

### 1. 主应用 (main-app) - Vite 项目

#### `/packages/main-app/src/api/index.js`
```javascript
// ❌ 旧方式 (Webpack)
const context = require.context('.', false, /\.(js|ts)$/)

// ✅ 新方式 (Vite)
const context = import.meta.glob('./*.{js,ts}', { eager: true })
```

#### `/packages/main-app/src/utils/collectionModules.js`
- 新增 Vite 模式支持
- 保持 Webpack 向后兼容
- 自动检测上下文类型并切换处理方式

### 2. Vue3 子应用 (vue3-sub-app) - Vite 项目

#### `/packages/vue3-sub-app/src/api/index.js`
- 同上，已迁移到 `import.meta.glob`

#### `/packages/vue3-sub-app/src/utils/collectionModules.js`
- 同上，已支持 Vite 和 Webpack 两种模式

### 3. Vue2 子应用 (vue2-sub-app) - Webpack 项目

**⚠️ 保持不变** - Vue2 子应用使用 Vue CLI 5.0.9（基于 Webpack），继续使用 `require.context`

#### `/packages/vue2-sub-app/src/api/index.js`
```javascript
// ✅ 继续使用 Webpack 方式
const context = require.context('.', false, /\.(js|ts)$/)
```

#### `/packages/vue2-sub-app/src/utils/collectionModules.js`
- 保持原有 Webpack 实现
- 不需要 Vite 兼容代码

## 🔧 技术细节

### Vite vs Webpack 模块导入对比

| 特性 | Webpack (`require.context`) | Vite (`import.meta.glob`) |
|------|----------------------------|---------------------------|
| 语法类型 | CommonJS | ES Module |
| 导入方式 | 同步 | 默认异步，需 `{ eager: true }` 同步 |
| 返回值 | 函数对象 | 对象（路径 → 模块） |
| 文件匹配 | 正则表达式 | Glob 模式 |

### collectionModules 双重兼容实现

```javascript
export default function collectionModules(result = {}, context, options = {}) {
  const { expand = false } = options
  
  // 判断是 Vite 还是 Webpack
  if (typeof context === 'object') {
    // Vite 模式：import.meta.glob 返回对象
    Object.entries(context).forEach(([path, module]) => {
      const moduleName = path.replace(/^\.\/(.+)\.\w+$/, '$1')
      if (moduleName === 'index') return
      
      // Vite 的 glob 导入可能是异步函数
      const imported = typeof module === 'function' ? module() : module
      
      if (expand) {
        Object.assign(result, imported)
      } else {
        result[moduleName] = imported.default || imported
      }
    })
  } else if (typeof context === 'function') {
    // Webpack 模式：require.context
    context.keys().forEach(key => {
      const moduleName = key.replace(/^\.\/(.*)\.\w+$/, '$1')
      if (moduleName === 'index') return
      
      const module = context(key)
      
      if (expand) {
        Object.assign(result, module)
      } else {
        result[moduleName] = module.default || module
      }
    })
  }
  
  return result
}
```

## 🎯 使用方式保持不变

所有项目的 API 使用方式保持一致：

```javascript
// 导入所有 API
import API from '@/api'

// 按模块名调用
await API.layout.loadLayout()
await API.layout.saveLayout(data)
await API.user.getUserList()

// 也支持命名导入（如果模块有命名导出）
import { loadLayoutAPI } from '@/api/layout'
await loadLayoutAPI()
```

## 📦 支持的文件类型

现在所有项目都支持自动导入：

- ✅ `.js` 文件
- ✅ `.ts` 文件
- ✅ 混合使用（JS 和 TS 可以共存）

## 🚀 优势

1. **Vite 原生支持** - 使用 Vite 内置功能，无需额外插件
2. **向后兼容** - 仍然可以在 Webpack 环境中使用
3. **TypeScript 支持** - 自动识别 `.ts` 和 `.js` 文件
4. **性能优化** - `eager: true` 实现同步导入，避免异步等待
5. **统一规范** - 所有子应用使用相同的导入机制

## 📝 注意事项

1. **必须使用 `{ eager: true }`** - 否则导入会是异步的，导致运行时错误
2. **Glob 模式语法** - 使用 `./*.{js,ts}` 而不是正则表达式
3. **索引文件排除** - `index.js` 和 `index.ts` 会被自动跳过

## ✅ 验证清单

- [x] 主应用 API 自动导入正常工作（Vite）
- [x] Vue3 子应用 API 自动导入正常工作（Vite）
- [x] Vue2 子应用 API 自动导入正常工作（Webpack）
- [x] 支持 `.js` 文件
- [x] 支持 `.ts` 文件
- [x] collectionModules 兼容 Vite 和 Webpack（仅主应用和 Vue3 子应用需要）
- [x] Mock 测试页面正常使用 `API.layout` 接口

## 🔄 迁移步骤回顾

1. 修改 `api/index.js` 使用 `import.meta.glob`
2. 更新 `collectionModules.js` 支持双重模式
3. 在所有子应用中重复上述步骤
4. 验证所有 API 导入和使用正常

## 📚 相关文档

- [Vite import.meta.glob 官方文档](https://vitejs.dev/guide/features.html#glob-import)
- [Webpack require.context 官方文档](https://webpack.js.org/guides/dependency-management/#requirecontext)
