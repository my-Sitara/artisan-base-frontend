# API 自动导入

## 🚀 核心功能

项目已实现 API 模块的自动导入机制，所有应用（主应用、Vue3 子应用、Vue2 子应用）都支持此功能。

**核心特性：**
- ✅ **自动扫描** - 只需将 API 文件放在 `src/api` 目录下
- ✅ **按文件名组织** - `user.js` 会自动变成 `api.user`
- ✅ **零配置** - 不需要手动在 index.js 中导入
- ✅ **支持混用** - 可以同时使用 `.js` 和 `.ts` 文件

---

## 📁 目录结构

### 主应用和 Vue3 子应用（支持 JS + TS）

```
src/
├── api/
│   ├── index.js              # API 统一入口（自动采集）
│   ├── user.js               # 用户 API → api.user
│   ├── order.ts              # 订单 API → api.order（可选）
│   └── product.js            # 商品 API → api.product
└── utils/
    └── collectionModules.js   # 模块采集工具函数
```

### Vue2 子应用（仅支持 JS）

```
src/
├── api/
│   ├── index.js              # API 统一入口（自动采集）
│   └── user.js               # 用户 API → api.user
└── utils/
    └── collectionModules.js   # 模块采集工具函数
```

---

## 💡 使用方式

### 导入所有 API（推荐）⭐

```javascript
// ✅ 一行代码导入所有 API
import api from '@/api'

// 使用对应的模块
await api.user.getUserInfo()
await api.order.createOrder(data)
await api.product.getList()
```

**优点：**
- ✅ 代码简洁，只需一次导入
- ✅ IDE 自动补全友好
- ✅ 模块边界清晰

---

## 🔧 添加新 API 模块

### 零配置流程

**步骤 1：创建 API 文件**

```javascript
// src/api/user.js
import axios from 'axios'

export async function getUserInfo() {
  const response = await axios.get('/api/user/info')
  return response.data
}

export async function updateUserInfo(data) {
  const response = await axios.post('/api/user/update', data)
  return response.data
}
```

**步骤 2：直接使用（无需修改 index.js！）**

```javascript
import api from '@/api'

await api.user.getUserInfo()
await api.user.updateUserInfo({ name: 'New Name' })

// ✨ 就是这么简单！
```

---

## ⚙️ 工作原理

### 自动映射规则

| 文件名 | 导出对象 | 使用方式 |
|--------|---------|---------|
| `user.js` | `api.user` | `api.user.getUserInfo()` |
| `order.ts` | `api.order` | `api.order.createOrder()` |
| `product.js` | `api.product` | `api.product.getList()` |

### 技术实现

```javascript
// api/index.js
import collectionModules from '@/utils/collectionModules'

// 自动导入当前目录下所有 .js 和 .ts 文件
const context = require.context('.', false, /\.(js|ts)$/)
const apis = collectionModules({}, context, {
  expand: false  // false: 按模块名组织
})

export default apis
```

---

## ⚠️ 注意事项

### 1. 文件命名规范

```javascript
// ✅ 好：小写，简洁
user.js      → api.user
order.ts     → api.order

// ❌ 不好：包含特殊字符
user-info.js → api['user-info']（不能用点号访问）
```

### 2. 自动跳过的文件

```javascript
// ✅ 会被自动跳过
index.js
index.ts

// ✅ 会被采集
user.js
user.ts
order.js
```

### 3. TypeScript 类型提示

如果使用 TypeScript，可能会看到类型错误：

```typescript
// ⚠️ 类型"Require"上不存在属性"context"
const context = require.context('.', false, /\.(js|ts)$/)
```

**这是正常的！** 运行时不会有问题。

如需消除类型错误，可以在 `env.d.ts` 中添加声明：

```typescript
declare module 'webpack' {
  interface RequireContext {
    (key: string): any
    keys(): string[]
  }
  
  interface Require {
    context(directory: string, useSubfolders: boolean, regExp: RegExp): RequireContext
  }
}
```

---

## 📊 各应用支持情况

| 应用 | 入口文件 | 支持格式 | 说明 |
|------|---------|---------|------|
| **主应用** | `index.js` | `.js` + `.ts` | 基础版本 |
| **Vue3 子应用** | `index.js` | `.js` + `.ts` | 与主应用一致 |
| **Vue2 子应用** | `index.js` | `.js` | 简化版本 |

---

## 🎯 最佳实践

### 1. 模块化设计

按业务模块划分 API 文件：

```
src/api/
├── user.js       # 用户相关
├── order.js      # 订单相关
├── product.js    # 商品相关
└── auth.js       # 认证相关
```

### 2. 统一导出格式

每个 API 文件都使用相同的导出格式：

```javascript
// src/api/user.js
import axios from 'axios'

export async function getUserInfo() { ... }
export async function updateUserInfo(data) { ... }
```

### 3. 使用模块名访问

```javascript
// ✅ 推荐：使用模块名
import api from '@/api'
api.user.getInfo()

// ⚠️ 不推荐：混用不同方式
import api from '@/api'
import { getUserInfo } from '@/api'
```

---

## 📚 相关文档

- [Request 系统使用指南](./sub-app-request-guide.md) - Request 系统详细说明
- [主应用 API 文档](../api/README.md) - API 详细说明

---

**最后更新：** 2025-03-25  
**维护者：** Artisan Team
