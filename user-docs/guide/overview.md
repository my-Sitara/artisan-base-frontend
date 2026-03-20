# 项目概述

Artisan 是一个企业级微前端基础平台脚手架，采用 Monorepo 架构，基于 qiankun 的 loadMicroApp 模式实现主应用对多类型子应用的统一加载与管理。

## 🎯 核心特性

### 1. 微前端架构
- **qiankun 集成**: 基于 qiankun 2.10.16 的 loadMicroApp 模式，提供完整的微前端解决方案
- **多类型子应用**: 支持 Vue3、Vue2、iframe、link 四种应用类型
- **独立开发部署**: 各子应用可独立开发、独立部署、独立运行
- **统一加载管理**: 主应用统一管理所有子应用的加载、卸载、刷新等生命周期

### 2. 布局编排系统
- **4 种布局类型**: 
  - `default` - 默认布局（含头部和侧边栏）
  - `full` - 全屏布局（无导航元素）
  - `embedded` - 嵌入式布局（轻量级，通常只显示头部）
  - `blank` - 空白布局（仅内容区域）
- **标准化配置**: 统一的 `layoutType` + `layoutOptions` 配置模式
- **动态切换**: 运行时动态切换布局，支持布局选项自定义
- **约束规则**: 每种布局类型有推荐的配置约束和建议

### 3. 跨应用通信
- **Bridge 机制**: 基于 postMessage 实现跨应用通信
- **Origin 校验**: 静态白名单 + 动态正则匹配，支持云 IDE 环境
- **内置消息类型**: NAVIGATE_TO、TOKEN_SYNC、PING/PONG 等
- **双向通信**: 主应用 ↔ 子应用、子应用 ↔ 子应用

### 4. iframe 安全治理
- **Sandbox 限制**: 设置 sandbox 属性限制权限
- **Origin 校验**: 严格的消息来源验证
- **postMessage 通信**: 禁止直接访问 DOM，使用安全的通信协议
- **心跳检测**: 30 秒定时检测 iframe 健康状态
- **高度自适应**: 子应用自动上报内容高度

### 5. 多应用实例同屏
- **自由布局**: 支持同一页面加载多个不同子应用
- **独立管理**: 每个实例独立管理，互不干扰
- **Grid/Split 布局**: 提供多种预设布局方式

### 6. 高级功能
- **预加载系统**: 支持应用资源预加载，提升访问速度
- **热更新检测**: 基于 lastModified 的自动热更新
- **心跳检测**: 30 秒定时检测应用健康状态
- **错误日志**: 完整的错误收集与展示
- **样式隔离**: qiankun 实验性样式隔离，防止样式污染
- **动态上下线**: 支持应用动态启用/禁用

## 🏗️ 技术架构

### 技术栈
- **主应用**: Vue 3.5.29 + Vite 7.3.1 + Vue Router 5.0.3 + Pinia 3.x + Element Plus 2.13.2
- **Vue3 子应用**: Vue 3.5.29 + Vite 7.3.1 + vue-router 5.0.3 + vite-plugin-qiankun
- **Vue2 子应用**: Vue 2.x + Vue CLI + vue-router 3.x
- **iframe 子应用**: 任意技术栈，通过 postMessage 通信
- **Monorepo**: Lerna + npm workspace

### 端口配置
| 应用 | 端口 | 描述 |
|------|------|------|
| 主应用 | 8080 | Vue3 主应用 |
| Vue3 子应用 | 7080 | Vue3 Demo 子应用 |
| Vue2 子应用 | 3000 | Vue2 Demo 子应用 |
| iframe 子应用 | 9080 | iframe Demo 子应用 |

### 目录结构
```
artisan-base-frontend/
├── packages/
│   ├── main-app/          # Vue3 主应用
│   │   ├── src/
│   │   │   ├── core/      # 核心模块（Manager、Bridge、Layout）
│   │   │   ├── config/    # 配置管理（微应用、布局配置）
│   │   │   ├── stores/    # Pinia 状态管理
│   │   │   ├── router/    # 路由配置
│   │   │   ├── views/     # 页面组件
│   │   │   └── components/# 通用组件
│   │   └── mock/          # Mock 数据
│   ├── vue3-sub-app/      # Vue3 子应用示例
│   ├── vue2-sub-app/      # Vue2 子应用示例
│   ├── iframe-sub-app/    # iframe 子应用示例
│   └── cli/               # CLI 脚手架工具
├── user-docs/             # VitePress 文档
├── lerna.json
├── package.json
└── README.md
```

## 🔑 核心模块

### 1. MicroAppManager（微应用管理器）
负责子应用的加载、卸载、刷新等操作，以 `appId` 为唯一标识，同时只允许一个实例。

**主要功能**:
- 多类型应用加载（vue3/vue2/iframe/link）
- 操作状态管理（防止并发冲突）
- 心跳检测（30 秒间隔）
- 热更新检测（lastModified）
- 预加载系统
- 错误日志收集
- 样式清理（防止污染）

### 2. Bridge（跨应用通信桥）
基于 postMessage 实现主应用与子应用的通信。

**主要功能**:
- Origin 校验（静态列表 + 动态正则）
- 消息处理器注册
- Token 同步
- 跨应用跳转
- 广播消息
- Iframe 专用通信

### 3. LayoutManager（布局管理器）
负责动态布局切换和布局选项配置。

**主要功能**:
- 4 种布局类型切换
- 布局选项配置（showHeader、showSidebar、showFooter、keepAlive）
- 布局变化监听
- 根据微应用配置自动设置布局
- 重置为默认布局

### 4. 配置系统
微应用配置由 `config/microApps.js` 管理，支持两种数据源：
- **Mock 模式**: 从本地 `mock/microApps.js` 加载（默认）
- **API 模式**: 从后端 API 接口加载（通过环境变量控制）

**配置项**:
```javascript
{
  id: string,                    // 唯一标识
  name: string,                  // 应用名称
  entry: string,                 // 入口地址
  activeRule: string,            // 激活规则
  type: 'vue3' | 'vue2' | 'iframe' | 'link',
  layoutType: 'default' | 'full' | 'embedded' | 'blank',
  layoutOptions: {
    showHeader?: boolean,
    showSidebar?: boolean,
    showFooter?: boolean,
    keepAlive?: boolean
  },
  status: 'online' | 'offline',
  preload: boolean,
  props?: object
}
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.12.0
- npm >= 9.0.0

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
# 启动所有应用（API 模式）
npm run dev:all

# 启动所有应用（Mock 模式，推荐）
npm run dev:all:mock

# 单独启动
npm run dev:main    # 主应用 (8080)
npm run dev:vue3    # Vue3 子应用 (7080)
npm run dev:vue2    # Vue2 子应用 (3000)
npm run dev:iframe  # iframe 子应用 (9080)
```

### 构建生产版本
```bash
# 构建所有应用
npm run build:all

# 单独构建
npm run build:main
npm run build:vue3
npm run build:vue2
npm run build:iframe
```

## 🛠️ CLI 工具

### 安装
```bash
cd packages/cli
npm link
```

### 使用
```bash
# 创建主应用
artisan create main-app my-main

# 创建子应用
artisan create sub-app my-vue3-app --type vue3
artisan create sub-app my-vue2-app --type vue2
artisan create sub-app my-iframe-app --type iframe

# 查看模板
artisan list
```

## 📦 状态管理

### Pinia Stores
- **useAppStore**: 管理微应用列表、侧边栏状态
- **useUserStore**: 管理用户信息和 token（持久化）

### 持久化
使用 `pinia-plugin-persistedstate` 实现数据持久化：
- Token 持久化存储
- Active AppId 记录

## 🌐 跨应用跳转

### 在子应用中
```javascript
// 跳转到其他子应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
})

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home')

// 监听自定义消息
window.__ARTISAN_BRIDGE__.on('MY_EVENT', (payload) => {
  console.log('Received:', payload)
})
```

### 在主应用中
```javascript
import { bridge } from '@/core/bridge'

bridge.navigateTo({
  appId: 'vue3-sub-app',
  path: '/list',
  query: { id: 1 }
})
```

## 🔒 安全策略

### iframe 安全
- 禁止直接访问 `iframe.contentWindow.document`
- 必须使用 postMessage 通信
- 严格的 origin 校验
- Sandbox 权限限制
- 卸载时清理监听器

### CORS 配置
子应用需要配置 CORS 允许主应用访问：
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
```

## 📊 监控与调试

### 错误日志
- MicroAppManager 自动收集错误
- 最多保留最近 100 条记录
- 可通过 `/app-management/error-logs` 查看

### 全局调试对象
主应用暴露全局对象供调试使用：
```javascript
// 控制台访问
window.__ARTISAN_MICRO_APP_MANAGER__.loadedApps
window.__ARTISAN_MICRO_APP_MANAGER__.getErrorLogs()
window.__ARTISAN_BRIDGE__
```

### 健康检查
- 心跳检测：30 秒间隔
- 自动热更新检测
- 应用状态监控

## 📝 环境变量

主应用支持以下环境变量（在 `packages/main-app/.env.*` 中配置）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_USE_MICRO_APPS_API` | `false` | `true` 从后端 API 加载配置，`false` 使用本地 mock |
| `VITE_MICRO_APPS_API_URL` | `/api/micro-apps` | 后端 API 地址 |

## 📖 下一步

- [快速开始](./guide/getting-started.md) - 安装和启动指南
- [主应用开发](./guide/main-app.md) - 主应用核心模块详解
- [子应用开发](./guide/sub-apps.md) - 各种类型子应用开发指南
- [布局系统](./guide/layout-system.md) - 布局配置与管理
- [iframe 治理](./guide/iframe-governance.md) - iframe 安全策略详解
- [部署指南](./guide/deployment.md) - 构建和部署流程
- [API 参考](./api/micro-app-manager.md) - 完整 API 文档
