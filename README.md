# Artisan Base Frontend

企业级微前端基础平台脚手架，基于 Monorepo 架构，支持 Vue3 主应用和多种类型子应用。

## 特性

- **Monorepo 架构**: 使用 Lerna + npm workspace 管理
- **微前端支持**: 基于 qiankun (loadMicroApp 模式)
- **多类型子应用**: 支持 vue3 / vue2 / iframe / link
- **布局编排系统**: 支持 5 种布局类型
- **跨应用通信**: 完整的 bridge 通信机制
- **状态管理**: Pinia + 持久化
- **iframe 跨域治理**: 完整的安全策略
- **多实例支持**: 同屏加载多个子应用实例
- **CLI 工具**: 快速创建子应用

## 端口配置

| 应用 | 端口 | 描述 |
|------|------|------|
| 主应用 | 8080 | Vue3 主应用 |
| Vue3 子应用 | 7080 | Vue3 Demo 子应用 |
| Vue2 子应用 | 3000 | Vue2 Demo 子应用 |
| iframe 子应用 | 4000 | iframe Demo 子应用 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动所有应用

```bash
npm run dev:all
```

### 单独启动应用

```bash
# 主应用
npm run dev:main

# Vue3 子应用
npm run dev:vue3

# Vue2 子应用
npm run dev:vue2

# iframe 子应用
npm run dev:iframe
```

### 构建所有应用

```bash
npm run build:all
```

## 目录结构

```
artisan-base-frontend/
├── packages/
│   ├── main-app/          # Vue3 主应用
│   ├── vue3-sub-app/      # Vue3 子应用示例
│   ├── vue2-sub-app/      # Vue2 子应用示例
│   ├── iframe-sub-app/    # iframe 子应用示例
│   └── cli/               # CLI 脚手架工具
├── user-docs/             # VitePress 文档
├── lerna.json
├── package.json
└── README.md
```

## CLI 使用

```bash
# 全局安装 CLI
cd packages/cli
npm link

# 创建主应用
artisan create main-app my-main

# 创建 Vue3 子应用
artisan create sub-app my-vue3-app --type vue3

# 创建 Vue2 子应用
artisan create sub-app my-vue2-app --type vue2

# 创建 iframe 子应用
artisan create sub-app my-iframe-app --type iframe
```

## 微应用配置

```javascript
{
  id: 'vue3-sub-app',           // 唯一标识
  name: 'Vue3 子应用',           // 应用名称
  entry: '//localhost:7080',    // 入口地址
  activeRule: '/vue3',          // 激活规则
  container: '#micro-app',      // 容器选择器
  status: 'online',             // 状态: online | offline
  version: '1.0.0',             // 版本号
  lastModified: Date.now(),     // 最后修改时间
  preload: true,                // 是否预加载
  type: 'vue3',                 // 类型: vue3 | vue2 | iframe | link
  layoutType: 'default',        // 布局类型
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    keepAlive: false,
    multiTab: false
  }
}
```

## 布局类型

- **default**: 默认布局（含头部和侧边栏）
- **full**: 全屏布局
- **tabs**: 多标签页布局
- **embedded**: 嵌入式布局
- **blank**: 空白布局

## 跨应用跳转

```javascript
// 在子应用中跳转到其他应用
window.__ARTISAN_BRIDGE__.navigateTo({
  appId: 'vue2-sub-app',
  path: '/list'
});

// 跳转到主应用
window.__ARTISAN_BRIDGE__.navigateToMain('/home');
```

## 文档

启动文档服务：

```bash
npm run docs:dev
```

## TypeScript 支持

本项目默认使用 JavaScript，如需使用 TypeScript，请参考 `user-docs/guide/typescript-migration.md`。

## License

MIT
