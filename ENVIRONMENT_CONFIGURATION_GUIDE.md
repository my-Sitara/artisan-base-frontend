# Artisan Base Frontend 环境配置完整指南

> 📋 本文档详细说明 Artisan Base Frontend 项目的环境变量配置体系，包括主应用、所有子应用以及 CLI 模板的完整配置。

---

## 📖 目录

- [快速开始](#-快速开始)
- [配置文件位置](#-配置文件位置)
- [环境变量说明](#-环境变量说明)
- [不同环境配置示例](#-不同环境配置示例)
- [CLI 模板配置](#-cli-模板配置)
- [使用方式](#-使用方式)
- [TypeScript 支持](#-typescript-支持)
- [注意事项](#-注意事项)
- [常见问题](#-常见问题)

---

## 🚀 快速开始

### 启动开发环境

```bash
# 主应用（默认开发模式）
cd packages/main-app
npm run dev

# Mock 演示模式（无需后端）
npm run dev:mock

# 子应用
cd packages/vue3-sub-app
npm run dev
```

### 修改 API 地址

```bash
# 编辑 packages/main-app/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
```

**注意：** 修改后需要重启开发服务器

---

## 📁 配置文件位置

### 完整的项目结构

```
artisan-base-frontend/
├── packages/
│   ├── main-app/                    # 主应用
│   │   ├── .env.development        # ✅ 开发环境
│   │   ├── .env.mock               # ✅ Mock 环境
│   │   └── .env.production         # ✅ 生产环境
│   │
│   ├── vue3-sub-app/               # Vue3 子应用
│   │   ├── .env.development        # ✅ 开发环境
│   │   └── .env.production         # ✅ 生产环境
│   │
│   ├── vue2-sub-app/               # Vue2 子应用
│   │   ├── .env.development        # ✅ 开发环境
│   │   └── .env.production         # ✅ 生产环境
│   │
│   ├── iframe-sub-app/             # Iframe 子应用
│   │   ├── .env.development        # ✅ 开发环境
│   │   └── .env.production         # ✅ 生产环境
│   │
│   └── cli/templates/              # CLI 模板
│       ├── main-app-js/            # 主应用 JS 模板
│       ├── main-app-ts/            # 主应用 TS 模板
│       ├── vue3-sub-app-js/        # Vue3 子应用 JS 模板
│       ├── vue3-sub-app-ts/        # Vue3 子应用 TS 模板
│       ├── vue2-sub-app-js/        # Vue2 子应用 JS 模板
│       └── iframe-sub-app-js/      # Iframe 子应用 JS 模板
│
└── ENV_SETUP_GUIDE.md              # 快速参考指南
```

**统计：** 整个项目共有 **23 个** 环境配置文件（实际应用 9 个 + CLI 模板 14 个）

---

## 🔧 环境变量说明

### 主应用 (main-app) 环境变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | String | - | 环境标识（development/production/test） |
| `VITE_API_BASE_URL` | String | `/api` | API 基础地址 |
| `VITE_USE_MICRO_APPS_API` | Boolean | `false` | 是否启用微应用 API 模式<br>`false`: 使用本地 Mock 数据<br>`true`: 从后端 API 加载配置 |
| `VITE_MICRO_APPS_API_URL` | String | `/api/micro-apps` | 微应用配置 API 地址 |
| `VITE_USE_LAYOUT_API` | Boolean | `false` | 是否启用布局 API 模式<br>`false`: 使用 localStorage 保存布局<br>`true`: 调用后端 API 保存布局 |

### 子应用环境变量（Vue3/Iframe）

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | String | - | 环境标识 |
| `VITE_APP_TITLE` | String | - | 应用标题 |
| `VITE_API_BASE_URL` | String | `/api` | API 基础地址 |

### 子应用环境变量（Vue2）

**注意：** Vue2 使用 Vue CLI，环境变量前缀为 `VUE_APP_`

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | String | - | 环境标识 |
| `VUE_APP_TITLE` | String | - | 应用标题 |
| `VUE_APP_API_BASE_URL` | String | `/api` | API 基础地址 |

---

## 🌍 不同环境配置示例

### 1. 开发环境 (.env.development)

**主应用配置示例：**

```bash
# 开发环境配置
NODE_ENV=development

# API 基础地址（开发环境使用相对路径）
VITE_API_BASE_URL=/api

# 是否启用微应用 API 模式
# false = 允许使用 Mock（可通过 Mock 管理器切换）
# true = 强制使用真实 API（禁用所有 Mock）
VITE_USE_MICRO_APPS_API=false

# 微应用 API 地址
VITE_MICRO_APPS_API_URL=/api/micro-apps

# 是否启用布局 API 模式
# false = 使用 localStorage 保存布局数据
# true = 调用后端 API 保存布局数据
VITE_USE_LAYOUT_API=false
```

**特点：**
- ✅ 使用相对路径 `/api`，通过 Vite 开发服务器代理到后端
- ✅ 默认使用 Mock 数据，方便前端独立开发
- ✅ 布局数据保存在 localStorage

**Vue3 子应用配置示例：**

```bash
# Vue3 子应用开发环境配置
NODE_ENV=development

# 应用标题
VITE_APP_TITLE=Vue3 子应用

# API 基础地址（根据实际需求配置）
VITE_API_BASE_URL=/api
```

**Vue2 子应用配置示例：**

```bash
# Vue2 子应用开发环境配置
NODE_ENV=development

# 应用标题
VUE_APP_TITLE=Vue2 子应用

# API 基础地址（根据实际需求配置）
VUE_APP_API_BASE_URL=/api
```

### 2. Mock 演示环境 (.env.mock)

**仅主应用支持：**

```bash
# Mock 演示环境配置
NODE_ENV=development

# 强制使用 mock 数据（用于产品演示、离线开发）
VITE_USE_MICRO_APPS_API=false
VITE_MICRO_APPS_API_URL=/api/micro-apps

# 多应用布局配置（强制使用 localStorage）
VITE_USE_LAYOUT_API=false
```

**特点：**
- ✅ 完全使用本地 Mock 数据
- ✅ 不依赖任何后端服务
- ✅ 适合产品演示、离线开发

### 3. 生产环境 (.env.production)

**主应用配置示例：**

```bash
# 生产环境配置
NODE_ENV=production

# API 基础地址（生产环境替换为实际域名）
VITE_API_BASE_URL=https://api.your-domain.com

# 是否启用微应用 API 模式
# 生产环境强制使用真实 API，禁用 Mock
VITE_USE_MICRO_APPS_API=true

# 微应用 API 地址
VITE_MICRO_APPS_API_URL=https://api.your-domain.com/api/micro-apps

# 是否启用布局 API 模式
# 生产环境使用后端 API
VITE_USE_LAYOUT_API=true
```

**特点：**
- ✅ 使用真实的后端 API 地址
- ✅ 强制使用 API 模式，禁用 Mock
- ✅ 布局数据保存到后端

**子应用配置示例：**

```bash
# Vue3 子应用生产环境配置
NODE_ENV=production

# 应用标题
VITE_APP_TITLE=Vue3 子应用

# API 基础地址（生产环境替换为实际域名）
VITE_API_BASE_URL=https://api.your-domain.com
```

---

## 🛠️ CLI 模板配置

所有 CLI 模板都包含完整的环境配置文件，新建应用时会自动使用。

### CLI 模板清单

| 模板类型 | 模板目录 | 环境配置文件 |
|---------|---------|-------------|
| **主应用 JS** | `main-app-js/` | `.env.development`, `.env.mock`, `.env.production` |
| **主应用 TS** | `main-app-ts/` | `.env.development`, `.env.mock`, `.env.production` |
| **Vue3 子应用 JS** | `vue3-sub-app-js/` | `.env.development`, `.env.production` |
| **Vue3 子应用 TS** | `vue3-sub-app-ts/` | `.env.development`, `.env.production` |
| **Vue2 子应用 JS** | `vue2-sub-app-js/` | `.env.development`, `.env.production` |
| **Iframe 子应用 JS** | `iframe-sub-app-js/` | `.env.development`, `.env.production` |

**总计：** 14 个环境配置文件

### 使用 CLI 创建新应用

```bash
# 安装 CLI
cd packages/cli
npm link

# 创建主应用
artisan create main-app my-main

# 创建 Vue3 子应用
artisan create sub-app my-vue3-app --type vue3

# 创建 Vue2 子应用
artisan create sub-app my-vue2-app --type vue2

# 创建 Iframe 子应用
artisan create sub-app my-iframe-app --type iframe
```

创建的应用会自动包含环境配置文件。

---

## 🚀 使用方式

### 启动不同环境

```bash
# 主应用
cd packages/main-app

# 开发模式（默认使用 Mock）
npm run dev

# Mock 演示模式
npm run dev:mock

# 构建生产版本
npm run build
```

### 自定义环境变量

可以在对应环境的 `.env` 文件中添加自定义变量：

```bash
# .env.development.local（不会被 git 跟踪）
VITE_CUSTOM_API_TIMEOUT=60000
VITE_CUSTOM_FEATURE_FLAG=true
```

在代码中使用：

```javascript
// Vue3/Vite 项目
const timeout = import.meta.env.VITE_CUSTOM_API_TIMEOUT || 30000
const featureEnabled = import.meta.env.VITE_CUSTOM_FEATURE_FLAG === 'true'
```

```javascript
// Vue2 项目
const timeout = process.env.VUE_APP_CUSTOM_API_TIMEOUT || 30000
const featureEnabled = process.env.VUE_APP_CUSTOM_FEATURE_FLAG === 'true'
```

### 快速配置示例

**场景 1：连接本地后端服务**

```bash
# 编辑 packages/main-app/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MICRO_APPS_API=true
```

**场景 2：切换到测试环境**

```bash
# 编辑 packages/main-app/.env.development
VITE_API_BASE_URL=https://test-api.example.com
VITE_USE_MICRO_APPS_API=true
VITE_USE_LAYOUT_API=true
```

**场景 3：纯前端开发（Mock 模式）**

```bash
# 编辑 packages/main-app/.env.development
VITE_USE_MICRO_APPS_API=false
VITE_USE_LAYOUT_API=false
```

---

## 📝 TypeScript 支持

所有环境变量都已添加到 TypeScript 类型定义中，享受完整的类型提示。

### 主应用类型定义

```typescript
// packages/main-app/src/env.d.ts
interface ImportMetaEnv {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MICRO_APPS_API: string
  readonly VITE_MICRO_APPS_API_URL: string
  readonly VITE_USE_LAYOUT_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 子应用类型定义

```typescript
// packages/vue3-sub-app/src/env.d.ts
interface ImportMetaEnv {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 使用示例

```typescript
// 完整的类型提示和自动补全
const apiUrl = import.meta.env.VITE_API_BASE_URL
const useMicroAppsApi = import.meta.env.VITE_USE_MICRO_APPS_API === 'true'
const microAppsUrl = import.meta.env.VITE_MICRO_APPS_API_URL
```

---

## ⚠️ 注意事项

### 1. 敏感信息保护

```bash
# .gitignore 已包含以下规则
.env
.env.local
.env.*.local
```

**最佳实践：**
- ✅ 不要将包含敏感信息的 `.env.*.local` 文件提交到 git
- ✅ 生产环境的真实 API 地址应该通过 CI/CD 注入
- ✅ 使用占位符域名（如 `your-domain.com`）

### 2. 变量命名规范

**Vite 项目（Vue3/Iframe）：**
- ✅ 使用 `VITE_` 前缀
- ✅ 只有 `VITE_` 开头的变量才能在代码中使用

**Vue CLI 项目（Vue2）：**
- ✅ 使用 `VUE_APP_` 前缀
- ✅ 只有 `VUE_APP_` 开头的变量才能在代码中使用

### 3. 环境优先级

```
.env.{mode}.local > .env.{mode} > .env
```

例如：`.env.development.local` > `.env.development` > `.env`

### 4. 修改后重启

修改任何 `.env` 文件后都需要重启开发服务器才能生效。

### 5. 不同框架的环境变量访问

**Vue3 / Vite 项目：**
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

**Vue2 项目：**
```javascript
const apiUrl = process.env.VUE_APP_API_BASE_URL
```

---

## ❓ 常见问题

### Q1: 如何切换到 Mock 模式？

编辑 `packages/main-app/.env.development`：
```bash
VITE_USE_MICRO_APPS_API=false
```
然后重启开发服务器。

### Q2: 如何连接本地后端服务？

编辑 `packages/main-app/.env.development`：
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MICRO_APPS_API=true  # 如果需要从后端加载微应用配置
```

### Q3: 为什么我的环境变量不生效？

检查以下几点：
1. ✅ 变量名是否以 `VITE_` 或 `VUE_APP_` 开头
2. ✅ 是否重启了开发服务器
3. ✅ 是否修改了正确的 `.env` 文件
4. ✅ TypeScript 项目中是否在 `env.d.ts` 中添加了类型定义

### Q4: 如何在多个环境间切换？

使用不同的 `.env` 文件：
```bash
# 开发环境
npm run dev          # 使用 .env.development

# Mock 环境
npm run dev:mock     # 使用 .env.mock

# 生产构建
npm run build        # 使用 .env.production
```

### Q5: 如何添加自定义环境变量？

在对应的 `.env` 文件中添加：
```bash
# .env.development.local
VITE_CUSTOM_VARIABLE=value
```

在代码中使用：
```javascript
const value = import.meta.env.VITE_CUSTOM_VARIABLE
```

### Q6: Vue2 子应用为什么使用不同的前缀？

Vue2 子应用使用 Vue CLI 构建，Vue CLI 要求环境变量以 `VUE_APP_` 开头。这是 Vue CLI 的规范，与 Vite 的 `VITE_` 前缀不同。

---

## 📚 相关资源

### 内部文档
- [README.md](./README.md) - 项目主文档
- [BACKEND_INTEGRATION.md](./packages/main-app/BACKEND_INTEGRATION.md) - 后端集成指南
- [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - 快速参考指南

### 外部资源
- [Vite 环境变量文档](https://cn.vitejs.dev/guide/env-and-mode.html)
- [Vue CLI 环境变量文档](https://cli.vuejs.org/zh/guide/mode-and-env.html)
- [TypeScript 类型定义](./packages/main-app/src/env.d.ts)

---

## 📊 配置总结表

| 应用类型 | 环境文件数量 | 变量前缀 | 支持的环境 |
|---------|------------|---------|-----------|
| **主应用** | 3 | `VITE_` | development, mock, production |
| **Vue3 子应用** | 2 | `VITE_` | development, production |
| **Vue2 子应用** | 2 | `VUE_APP_` | development, production |
| **Iframe 子应用** | 2 | `VITE_` | development, production |
| **CLI 模板** | 14 | 混合 | 所有环境 |
| **总计** | **23** | - | - |

---

**最后更新：** 2025-03-25  
**文档版本：** 1.0.0  
**维护者：** Artisan Team
