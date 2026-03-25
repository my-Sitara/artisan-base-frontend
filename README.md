# Artisan Base Frontend

<div align="center">

**企业级微前端基础平台脚手架**

基于 qiankun + Vue 3.5.29 + Monorepo 的现代化微前端解决方案

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.12.0-brightgreen.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/vue-3.5.29-green.svg)](https://vuejs.org/)
[![qiankun](https://img.shields.io/badge/qiankun-2.10.16-orange.svg)](https://qiankun.umijs.org/)

[特性](#-核心特性) • [快速开始](#-快速开始) • [文档](#-文档) • [示例](#-示例应用)

</div>

---

## 📖 简介

Artisan 是一个企业级微前端基础平台脚手架，采用 Monorepo 架构，基于 qiankun 的 loadMicroApp 模式实现主应用对多类型子应用的统一加载与管理。

### 为什么选择 Artisan？

✅ **开箱即用** - 提供完整的微前端解决方案，无需从零搭建  
✅ **多种子应用支持** - Vue3/Vue2/iframe/link 四种应用类型全覆盖  
✅ **布局编排系统** - 4 种布局类型，灵活配置，满足各种业务场景  
✅ **跨应用通信** - 完整的 Bridge 机制，支持主应用与子应用双向通信  
✅ **iframe 安全治理** - 完善的安全策略，postMessage 通信与 origin 校验  
✅ **多实例同屏** - 支持同一页面加载多个不同子应用实例  
✅ **CLI 工具** - 命令行快速创建子应用，提升开发效率  
✅ **现代化技术栈** - Vue 3.5.29 + Vite 7.3.1 + Element Plus 2.13.2  

---

## ✨ 核心特性

### 🚀 qiankun 微前端集成
- 基于 qiankun 2.10.16 的 loadMicroApp 模式
- 支持 Vue3、Vue2、iframe、link 四种应用类型
- 统一的加载、卸载、刷新管理
- 样式隔离与防止污染机制

### 📦 Monorepo 架构
- Lerna + npm workspace 管理依赖
- 统一版本控制，独立开发部署
- 高效协作，代码复用

### 🎨 布局编排系统
- **4 种布局类型**: default（默认）、full（全屏）、embedded（嵌入式）、blank（空白）
- **标准化配置**: layoutType + layoutOptions 配置模式
- **动态切换**: 运行时根据应用需求自动切换布局
- **约束规则**: 智能的布局选项约束与建议

### 🔗 跨应用通信
- 基于 postMessage 的 Bridge 机制
- Origin 校验（静态白名单 + 动态正则匹配）
- 内置消息类型：NAVIGATE_TO、TOKEN_SYNC、PING/PONG 等
- 支持主应用 ↔ 子应用、子应用 ↔ 子应用通信

### 🔒 iframe 安全治理
- Sandbox 权限限制
- 严格的 Origin 校验
- postMessage 安全通信协议
- 心跳检测与健康监控
- 高度自适应与自动上报

### 🔄 多应用实例同屏
- 支持 Grid/Split 布局
- 同时加载多个不同子应用
- 独立管理，互不干扰

### 🛠️ CLI 脚手架
- 快速创建子应用（vue3/vue2/iframe）
- 预设模板，开箱即用
- 提升开发效率

### ⚡ 高级功能
- **预加载系统**: 使用 qiankun prefetch API 提升访问速度
- **热更新检测**: 基于 lastModified 的自动热更新
- **心跳检测**: 30 秒定时检测应用健康状态
- **错误日志**: 完整的错误收集、展示与管理
- **样式清理**: 卸载时自动清理子应用注入的样式

---

## 📦 端口配置

| 应用 | 端口 | 描述 |
|------|------|------|
| 主应用 | 8080 | Vue3 主应用 |
| Vue3 子应用 | 7080 | Vue3 Demo 子应用 |
| Vue2 子应用 | 3000 | Vue2 Demo 子应用 |
| iframe 子应用 | 9080 | iframe Demo 子应用 |

---

## 🌍 环境配置

### 环境变量说明

项目使用环境变量来管理不同环境的配置，支持以下三种环境：

| 环境 | 配置文件 | 用途 |
|------|---------|------|
| 开发环境 | `.env.development` | 日常开发使用，默认 Mock 数据 |
| Mock 环境 | `.env.mock` | 产品演示、离线开发 |
| 生产环境 | `.env.production` | 生产部署使用 |

### 主要环境变量

#### 主应用环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `/api` | API 基础地址 |
| `VITE_USE_MICRO_APPS_API` | `false` | 是否从后端加载微应用配置 |
| `VITE_MICRO_APPS_API_URL` | `/api/micro-apps` | 微应用配置 API 地址 |
| `VITE_USE_LAYOUT_API` | `false` | 是否使用后端 API 保存布局 |

#### 子应用环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_APP_TITLE` | - | 应用标题 |
| `VITE_API_BASE_URL` | `/api` | API 基础地址 |

### 快速配置

**修改主应用 API 地址：**
```bash
# 编辑 packages/main-app/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
```

**切换到 API 模式（需要后端支持）：**
```bash
# 编辑 packages/main-app/.env.development
VITE_USE_MICRO_APPS_API=true
```

### 📖 详细文档

查看 [环境配置完整指南](./ENVIRONMENT_CONFIGURATION_GUIDE.md) 了解更多详细信息。

### ⚠️ 注意事项

1. **不要提交敏感信息**
   - `.env.*.local` 文件已被 .gitignore 忽略
   - 生产环境配置应通过 CI/CD 注入

2. **变量命名规则**
   - Vite 项目（Vue3/Iframe）：使用 `VITE_` 前缀
   - Vue CLI 项目（Vue2）：使用 `VUE_APP_` 前缀
   - 只有对应前缀的变量才能在代码中使用

3. **修改后重启**
   - 修改任何 `.env` 文件后都需要重启开发服务器

4. **不同框架的访问方式**
   - Vue3/Vite: `import.meta.env.VITE_xxx`
   - Vue2: `process.env.VUE_APP_xxx`

### ❓ 常见问题

**Q: 如何切换到 Mock 模式？**
```bash
# 编辑 packages/main-app/.env.development
VITE_USE_MICRO_APPS_API=false
```

**Q: 如何连接本地后端？**
```bash
# 编辑 packages/main-app/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MICRO_APPS_API=true
```

**Q: 为什么环境变量不生效？**
- 检查变量名是否以 `VITE_` 或 `VUE_APP_` 开头
- 确认已重启开发服务器
- TypeScript 项目需在 `env.d.ts` 中添加类型定义

### 🔗 相关资源

- [环境配置完整指南](./ENVIRONMENT_CONFIGURATION_GUIDE.md) - 详细说明、示例和 FAQ
- [Vite 环境变量文档](https://cn.vitejs.dev/guide/env-and-mode.html)
- [后端集成指南](./packages/main-app/BACKEND_INTEGRATION.md)

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.12.0
- **npm**: >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发环境

#### 方式一：启动所有应用（推荐新手）

**Mock 模式**（无需后端服务）：
```bash
npm run dev:all:mock
```

**API 模式**（需要后端支持）：
```bash
npm run dev:all
```

启动成功后访问：http://localhost:8080

#### 方式二：单独启动应用

```bash
# 主应用 (8080)
npm run dev:main

# Vue3 子应用 (7080)
npm run dev:vue3

# Vue2 子应用 (3000)
npm run dev:vue2

# iframe 子应用 (9080)
npm run dev:iframe
```

### 构建生产版本

```bash
# 构建所有应用
npm run build:all

# 单独构建
npm run build:main    # 主应用
npm run build:vue3    # Vue3 子应用
npm run build:vue2    # Vue2 子应用
npm run build:iframe  # iframe 子应用
```

---

## 📁 目录结构

```
artisan-base-frontend/
├── packages/                      # Monorepo 工作空间
│   ├── main-app/                 # Vue3 主应用
│   │   ├── src/
│   │   │   ├── core/            # 核心模块（Manager、Bridge、Layout）
│   │   │   ├── config/          # 配置管理
│   │   │   ├── stores/          # Pinia 状态管理
│   │   │   ├── router/          # 路由配置
│   │   │   ├── views/           # 页面组件
│   │   │   └── components/      # 通用组件
│   │   └── mock/                # Mock 数据
│   ├── vue3-sub-app/            # Vue3 子应用示例
│   ├── vue2-sub-app/            # Vue2 子应用示例
│   ├── iframe-sub-app/          # iframe 子应用示例
│   └── cli/                     # CLI 脚手架工具
├── user-docs/                   # VitePress 文档站点
├── lerna.json                   # Lerna 配置
├── package.json                 # 根 package.json
└── README.md                    # 项目说明
```

---

## 🛠️ CLI 工具使用

### 全局安装 CLI

```bash
cd packages/cli
npm link
```

### 创建子应用

```bash
# 创建主应用
artisan create main-app my-main

# 创建 Vue3 子应用
artisan create sub-app my-vue3-app --type vue3

# 创建 Vue2 子应用
artisan create sub-app my-vue2-app --type vue2

# 创建 iframe 子应用
artisan create sub-app my-iframe-app --type iframe

# 查看支持的模板
artisan list
```

---

## 🌐 微应用配置

### 配置示例

```javascript
// packages/main-app/src/mock/microApps.js
{
  id: 'vue3-sub-app',           // 唯一标识（必须与 vite-plugin-qiankun 注册名一致）
  name: 'Vue3 子应用',           // 应用名称
  entry: '//localhost:7080',    // 入口地址
  activeRule: '/vue3',          // 激活规则（路由前缀）
  type: 'vue3',                 // 应用类型：vue3 | vue2 | iframe | link
  layoutType: 'default',        // 布局类型：default | full | embedded | blank
  layoutOptions: {
    showHeader: true,           // 显示头部
    showSidebar: true,          // 显示侧边栏
    keepAlive: false            // 启用缓存
  },
  status: 'online',             // online | offline
  preload: true,                // 是否预加载
  props: {}                     // 传递给子应用的属性
}
```

### 环境变量

主应用支持通过环境变量控制数据源：

```bash
# .env.mock
VITE_USE_MICRO_APPS_API=false          # false: mock 模式，true: API 模式
VITE_MICRO_APPS_API_URL=/api/micro-apps  # 后端 API 地址
```

---

## 🎨 布局类型

| 布局类型 | 描述 | 使用场景 |
|---------|------|---------|
| **default** | 默认布局（含头部和侧边栏） | 后台管理系统、企业应用 |
| **full** | 全屏布局（无导航元素） | 数据大屏、沉浸式展示 |
| **embedded** | 嵌入式布局（轻量级） | 嵌入第三方应用、轻量化展示 |
| **blank** | 空白布局（仅内容） | 登录页、欢迎页、极简页面 |

---

## 🔗 跨应用跳转

### 在子应用中跳转到其他应用

```javascript
// 跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list',
  query: { id: 1 }
});

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home');

// 监听自定义消息
window.__ARTISAN_BRIDGE__.on('MY_EVENT', (payload) => {
  console.log('Received:', payload)
});
```

---

## 📚 文档

### 在线文档

启动本地文档服务：

```bash
npm run docs:dev
```

访问：http://localhost:3001（或对应端口）

### 文档目录

**指南**:
- [项目概述](./user-docs/guide/overview.md) - 了解平台的核心功能和架构
- [快速开始](./user-docs/guide/getting-started.md) - 安装和启动指南
- [主应用开发](./user-docs/guide/main-app.md) - 主应用核心模块详解
- [子应用开发](./user-docs/guide/sub-apps.md) - 各种类型子应用开发指南
- [布局系统](./user-docs/guide/layout-system.md) - 布局配置与管理
- [iframe 治理](./user-docs/guide/iframe-governance.md) - iframe 安全策略详解
- [部署指南](./user-docs/guide/deployment.md) - 构建和部署流程

**API 参考**:
- [API 总结](./user-docs/api/README.md) - 所有 API 的快速参考
- [MicroAppManager](./user-docs/api/micro-app-manager.md) - 微应用管理 API
- [Bridge](./user-docs/api/bridge.md) - 跨应用通信 API
- [配置 API](./user-docs/api/config.md) - 微应用配置 API

---

## 🎯 示例应用

项目包含以下示例应用：

### 主应用（Vue3）
- 完整的布局系统
- 微应用管理器
- 跨应用通信桥
- 应用管理界面
- 错误日志查看器

### Vue3 子应用
- vite-plugin-qiankun 集成
- 独立运行与 qiankun 模式切换
- 路由配置示例
- Element Plus 使用

### Vue2 子应用
- Vue CLI + webpack 配置
- qiankun 生命周期集成
- 路由 abstract 模式

### Iframe 子应用
- postMessage 通信桥
- 高度自适应
- 心跳检测

---

## 🐛 常见问题

### 端口被占用

**解决**: 修改对应应用的配置文件中的端口号，或关闭占用进程。

### CORS 跨域问题

**解决**: 确保子应用配置了正确的 CORS 响应头：
```javascript
headers: {
  'Access-Control-Allow-Origin': '*'
}
```

### 依赖安装失败

**解决**: 
```bash
npm cache clean --force
rm -rf node_modules packages/*/node_modules
npm install
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

## 👥 团队

Artisan Team

---

## 📞 联系方式

如有问题，请通过以下方式联系：

- GitHub Issues
- 项目讨论区

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给一个 Star！**

</div>
