# 快速开始

本指南将帮助你快速搭建和启动 Artisan 微前端平台的开发环境。

## 📋 环境要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: >= 18.12.0（推荐使用 nvm 管理 Node 版本）
- **npm**: >= 9.0.0
- **Git**: 用于代码版本管理

**检查命令**：
```bash
node -v  # 应 >= v18.12.0
npm -v   # 应 >= v9.0.0
```

## 📥 安装依赖

### 1. 克隆项目

```bash
git clone https://github.com/your-org/artisan-base-frontend.git
cd artisan-base-frontend
```

### 2. 安装依赖

在项目根目录执行：

```bash
npm install
```

此命令会安装所有工作空间（主应用、子应用、CLI 工具等）的依赖。

## 🚀 启动开发环境

### 方式一：启动所有应用（推荐新手）

#### API 模式
需要后端服务支持，从后端 API 加载微应用配置：

```bash
npm run dev:all
```

#### Mock 模式（推荐）
使用本地 mock 数据，无需后端服务，开箱即用：

```bash
npm run dev:all:mock
```

**启动后可访问**：
- 主应用：http://localhost:8080
- Vue3 子应用：http://localhost:7080
- Vue2 子应用：http://localhost:3000
- iframe 子应用：http://localhost:9080

### 方式二：单独启动应用

适合只开发某个特定应用的场景。

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

## 🔧 端口配置

如果默认端口被占用，可以在各应用的配置文件中修改端口：

| 应用 | 配置文件 | 默认端口 |
|------|---------|---------|
| 主应用 | `packages/main-app/vite.config.js` | 8080 |
| Vue3 子应用 | `packages/vue3-sub-app/vite.config.js` | 7080 |
| Vue2 子应用 | `packages/vue2-sub-app/vue.config.js` | 3000 |
| iframe 子应用 | `packages/iframe-sub-app/vite.config.js` | 9080 |

## 🌍 环境变量配置

主应用支持通过环境变量控制微应用配置的数据源。

### 配置文件位置
- `.env.development` - 开发环境
- `.env.mock` - Mock 模式
- `.env.production` - 生产环境

### 可用变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_USE_MICRO_APPS_API` | `false` | `true`: 从后端 API 加载配置<br>`false`: 使用本地 mock 数据 |
| `VITE_MICRO_APPS_API_URL` | `/api/micro-apps` | 后端 API 地址（仅在 API 模式下生效） |

### 使用示例

**Mock 模式**（默认）：
```bash
# .env.mock
VITE_USE_MICRO_APPS_API=false
```

**API 模式**：
```bash
# .env.development
VITE_USE_MICRO_APPS_API=true
VITE_MICRO_APPS_API_URL=http://your-backend.com/api/micro-apps
```

## 🛠️ CLI 脚手架工具

Artisan 提供了 CLI 工具，方便快速创建子应用。

### 全局安装 CLI

```bash
cd packages/cli
npm link
```

安装完成后，可在任意目录使用 `artisan` 命令。

### 创建子应用

```bash
# 创建 Vue3 子应用
artisan create sub-app my-vue3-app --type vue3

# 创建 Vue2 子应用
artisan create sub-app my-vue2-app --type vue2

# 创建 iframe 子应用
artisan create sub-app my-iframe-app --type iframe

# 查看支持的模板
artisan list
```

**注意**: 创建后需要在主应用的微应用配置中添加新应用的配置信息。

## 📁 目录结构

```plaintext
artisan-base-frontend/
├── packages/                    # Monorepo 工作空间
│   ├── main-app/               # Vue3 主应用
│   │   ├── src/
│   │   │   ├── core/          # 核心模块（Manager、Bridge、Layout）
│   │   │   ├── config/        # 配置管理
│   │   │   ├── stores/        # Pinia 状态管理
│   │   │   ├── router/        # 路由配置
│   │   │   ├── views/         # 页面组件
│   │   │   └── components/    # 通用组件
│   │   └── mock/              # Mock 数据
│   ├── vue3-sub-app/          # Vue3 子应用示例
│   ├── vue2-sub-app/          # Vue2 子应用示例
│   ├── iframe-sub-app/        # iframe 子应用示例
│   └── cli/                   # CLI 脚手架工具
├── user-docs/                 # VitePress 文档站点
├── lerna.json                 # Lerna 配置
├── package.json               # 根 package.json
└── README.md                  # 项目说明
```

## 🎯 验证安装

启动成功后，访问主应用 http://localhost:8080，你应该能看到：

1. ✅ 首页仪表盘正常显示
2. ✅ 侧边栏显示所有在线的微应用
3. ✅ 可以点击进入各个子应用
4. ✅ 子应用能正常加载和交互

## 🐛 常见问题

### 端口被占用
**错误**: `Port 8080 is already in use`

**解决**: 
- 修改对应应用的配置文件中的端口号
- 或者关闭占用该端口的进程

### 依赖安装失败
**错误**: `npm ERR! code ENOENT`

**解决**:
```bash
# 清理缓存
npm cache clean --force

# 删除所有 node_modules
rm -rf node_modules packages/*/node_modules

# 重新安装
npm install
```

### CORS 跨域问题
**错误**: `Access-Control-Allow-Origin`

**解决**:
- 确保子应用配置了正确的 CORS 响应头
- 开发环境设置 `host: '0.0.0.0'` 和 `cors: true`

## 📖 下一步

完成快速开始后，你可以继续学习：

- [项目概述](./overview.md) - 了解平台的核心功能和架构
- [主应用开发](./main-app.md) - 深入学习主应用的核心模块
- [子应用开发](./sub-apps.md) - 各种类型子应用的开发指南
- [布局系统](./layout-system.md) - 学习如何配置和管理布局
- [部署指南](./deployment.md) - 构建和部署生产环境
