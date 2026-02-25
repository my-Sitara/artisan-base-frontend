# Artisan Base Frontend - 企业级微前端脚手架项目计划

## 项目概述

创建一个基于 Monorepo 的企业级微前端平台脚手架，支持 Vue3 主应用和多种类型子应用（vue3/vue2/iframe/link）。

## 目录结构

```
artisan-base-frontend/
├── packages/
│   ├── main-app/                    # Vue3 主应用
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── DefaultLayout.vue
│   │   │   │   │   ├── FullLayout.vue
│   │   │   │   │   ├── TabsLayout.vue
│   │   │   │   │   ├── EmbeddedLayout.vue
│   │   │   │   │   └── BlankLayout.vue
│   │   │   │   ├── MicroAppContainer.vue
│   │   │   │   ├── IframeContainer.vue
│   │   │   │   └── AppManager.vue
│   │   │   ├── core/
│   │   │   │   ├── microAppManager.js
│   │   │   │   ├── iframeLoader.js
│   │   │   │   ├── bridge.js
│   │   │   │   └── layoutManager.js
│   │   │   ├── router/
│   │   │   ├── stores/
│   │   │   │   ├── index.js
│   │   │   │   ├── app.js
│   │   │   │   ├── user.js
│   │   │   │   └── tabs.js
│   │   │   ├── views/
│   │   │   │   ├── Home.vue
│   │   │   │   ├── SubAppPage.vue
│   │   │   │   ├── MultiInstancePage.vue
│   │   │   │   └── AppManagement.vue
│   │   │   ├── config/
│   │   │   │   └── microApps.js
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   ├── vue3-sub-app/                # Vue3 子应用
│   │   ├── src/
│   │   │   ├── router/
│   │   │   ├── views/
│   │   │   │   ├── Home.vue
│   │   │   │   ├── List.vue         # 列表页面
│   │   │   │   └── About.vue
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── public/
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   ├── vue2-sub-app/                # Vue2 子应用
│   │   ├── src/
│   │   │   ├── router/
│   │   │   ├── views/
│   │   │   │   ├── Home.vue
│   │   │   │   ├── List.vue         # 列表页面
│   │   │   │   └── About.vue
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── public/
│   │   ├── vue.config.js
│   │   └── package.json
│   │
│   ├── iframe-sub-app/              # iframe 子应用
│   │   ├── src/
│   │   │   ├── bridge.js
│   │   │   ├── app.js
│   │   │   └── style.css
│   │   ├── index.html
│   │   ├── list.html                # 列表页面
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── cli/                         # CLI 脚手架
│       ├── bin/
│       │   └── artisan.js
│       ├── lib/
│       │   ├── create.js
│       │   ├── generator.js
│       │   └── utils.js
│       ├── templates/
│       │   ├── main-app/
│       │   ├── vue3-sub-app/
│       │   ├── vue2-sub-app/
│       │   └── iframe-sub-app/
│       └── package.json
│
├── user-docs/                       # VitePress 文档
│   ├── .vitepress/
│   │   └── config.js
│   ├── guide/
│   │   ├── getting-started.md
│   │   ├── main-app.md
│   │   ├── sub-apps.md
│   │   ├── layout-system.md
│   │   ├── iframe-governance.md
│   │   ├── deployment.md
│   │   └── typescript-migration.md
│   ├── api/
│   │   ├── micro-app-manager.md
│   │   ├── bridge.md
│   │   └── config.md
│   ├── index.md
│   └── package.json
│
├── lerna.json
├── package.json
└── README.md
```

## 实施任务清单

### 阶段 1: 项目根配置 (4 个文件)
1. `/package.json` - 根包配置（workspace 配置）
2. `/lerna.json` - Lerna 配置
3. `/README.md` - 项目说明文档
4. `/.gitignore` - Git 忽略配置

### 阶段 2: 主应用核心 (25+ 个文件)
1. `packages/main-app/package.json`
2. `packages/main-app/vite.config.js`
3. `packages/main-app/index.html`
4. `packages/main-app/src/main.js`
5. `packages/main-app/src/App.vue`
6. `packages/main-app/src/config/microApps.js` - 微应用配置
7. `packages/main-app/src/core/microAppManager.js` - 实例管理器
8. `packages/main-app/src/core/iframeLoader.js` - iframe 加载器
9. `packages/main-app/src/core/bridge.js` - 跨域通信桥
10. `packages/main-app/src/core/layoutManager.js` - 布局管理器
11. `packages/main-app/src/stores/index.js` - Pinia 配置
12. `packages/main-app/src/stores/app.js` - 应用状态
13. `packages/main-app/src/stores/user.js` - 用户状态
14. `packages/main-app/src/stores/tabs.js` - 标签页状态
15. `packages/main-app/src/router/index.js` - 路由配置
16. `packages/main-app/src/components/layout/DefaultLayout.vue`
17. `packages/main-app/src/components/layout/FullLayout.vue`
18. `packages/main-app/src/components/layout/TabsLayout.vue`
19. `packages/main-app/src/components/layout/EmbeddedLayout.vue`
20. `packages/main-app/src/components/layout/BlankLayout.vue`
21. `packages/main-app/src/components/MicroAppContainer.vue`
22. `packages/main-app/src/components/IframeContainer.vue`
23. `packages/main-app/src/views/Home.vue`
24. `packages/main-app/src/views/SubAppPage.vue` - 子应用单独接入页面
25. `packages/main-app/src/views/MultiInstancePage.vue` - 多实例同屏页面
26. `packages/main-app/src/views/AppManagement.vue` - 子应用管理页面

### 阶段 3: Vue3 子应用 (8 个文件)
1. `packages/vue3-sub-app/package.json`
2. `packages/vue3-sub-app/vite.config.js`
3. `packages/vue3-sub-app/index.html`
4. `packages/vue3-sub-app/src/main.js` - qiankun 生命周期
5. `packages/vue3-sub-app/src/App.vue`
6. `packages/vue3-sub-app/src/router/index.js`
7. `packages/vue3-sub-app/src/views/Home.vue`
8. `packages/vue3-sub-app/src/views/About.vue`

### 阶段 4: Vue2 子应用 (8 个文件)
1. `packages/vue2-sub-app/package.json`
2. `packages/vue2-sub-app/vue.config.js`
3. `packages/vue2-sub-app/public/index.html`
4. `packages/vue2-sub-app/src/main.js` - qiankun 生命周期
5. `packages/vue2-sub-app/src/App.vue`
6. `packages/vue2-sub-app/src/router/index.js`
7. `packages/vue2-sub-app/src/views/Home.vue`
8. `packages/vue2-sub-app/src/views/About.vue`

### 阶段 5: iframe 子应用 (5 个文件)
1. `packages/iframe-sub-app/package.json`
2. `packages/iframe-sub-app/vite.config.js`
3. `packages/iframe-sub-app/index.html`
4. `packages/iframe-sub-app/src/bridge.js`
5. `packages/iframe-sub-app/src/app.js`
6. `packages/iframe-sub-app/src/style.css`

### 阶段 6: CLI 脚手架 (10+ 个文件)
1. `packages/cli/package.json`
2. `packages/cli/bin/artisan.js`
3. `packages/cli/lib/create.js`
4. `packages/cli/lib/generator.js`
5. `packages/cli/lib/utils.js`
6. `packages/cli/templates/` - 各类型模板文件

### 阶段 7: 用户文档 (10+ 个文件)
1. `user-docs/package.json`
2. `user-docs/.vitepress/config.js`
3. `user-docs/index.md`
4. `user-docs/guide/*.md` - 各指南文档
5. `user-docs/api/*.md` - API 文档

## 微应用配置字段结构

```javascript
{
  id: string,                    // 唯一标识
  name: string,                  // 应用名称
  entry: string,                 // 入口地址
  activeRule: string,            // 激活规则
  container: string,             // 容器选择器
  status: 'online' | 'offline',  // 状态
  version: string,               // 版本号
  lastModified: number,          // 最后修改时间戳
  preload: boolean,              // 是否预加载
  type: 'vue3' | 'vue2' | 'iframe' | 'link',  // 类型
  layoutType: 'default' | 'full' | 'tabs' | 'embedded' | 'blank',
  layoutOptions: {
    showHeader?: boolean,        // 是否显示头部
    showSidebar?: boolean,       // 是否显示侧边栏
    keepAlive?: boolean,         // 是否缓存
    multiTab?: boolean           // 是否支持多标签
  }
}
```

## 核心功能实现要点

### 1. microAppManager.js 实例管理器
- 使用 qiankun loadMicroApp API
- 支持多实例同时加载
- 支持 lastModified 热更新检测
- 支持 preload 预加载
- 支持心跳检测
- 支持动态上下线

### 2. bridge.js 跨域通信
- 基于 postMessage 实现
- origin 校验
- token 同步
- 消息类型定义
- 双向通信封装
- **支持主应用↔子应用双向跳转**
- **支持子应用↔子应用跨应用跳转**

### 3. iframeLoader.js
- 动态创建 iframe
- 高度自适应（resize 防抖）
- sandbox 安全限制
- 卸载清理

### 4. layoutManager.js
- 支持 5 种布局类型
- 动态布局切换
- 布局选项配置

### 5. Pinia 持久化
- 使用 pinia-plugin-persistedstate
- token/activeAppId/tabs 持久化
- localStorage 存储
- key 前缀支持

### 6. 跨应用跳转系统
- 主应用 → 子应用跳转
- 子应用 → 主应用跳转
- 子应用 → 子应用跳转（通过主应用中转）
- 统一跳转 API 封装

## 主应用核心页面设计

### 1. 首页 (Home.vue)
- 平台概览仪表盘
- 各子应用状态展示
- 快速导航入口

### 2. 子应用单独加载页面 (SubAppPage.vue)
- 每个子应用单独路由加载
- 支持 reload 刷新
- 支持 offline 状态禁止加载
- 动态路由 `/app/:appId`

### 3. 多实例同屏展示页面 (MultiInstancePage.vue)
- 同一页面同时加载多个子应用
- 支持多实例管理
- 支持关闭单个实例
- 支持刷新单个实例
- 支持 layoutType 控制布局（grid/tabs/split）
- 支持 embedded 模式嵌入
- Element Plus 布局组件

### 4. 子应用加载管理页面 (AppManagement.vue)
- 表格展示所有微应用
- 上线 / 下线切换
- 强制刷新
- 查看版本
- 查看 lastModified
- 查看加载状态
- 查看实例数量
- 错误记录展示
- preload 状态展示

## 子应用页面设计

### Vue3 子应用 (vue3-sub-app)
- Home.vue - 首页，显示 token 和通信按钮
- List.vue - **列表页面**（数据展示）
- About.vue - 关于页面
- 支持跳转到其他子应用/主应用的按钮

### Vue2 子应用 (vue2-sub-app)
- Home.vue - 首页，显示 token 和通信按钮
- List.vue - **列表页面**（数据展示）
- About.vue - 关于页面
- 支持跳转到其他子应用/主应用的按钮

### iframe 子应用 (iframe-sub-app)
- index.html - 主页面
- list.html - **列表页面**
- postMessage 通信
- 高度上报
- ping/pong 心跳
- 支持跳转消息发送

## 端口配置

| 应用 | 端口 |
|------|------|
| 主应用 | 8080 |
| Vue3 子应用 | 7080 |
| Vue2 子应用 | 3000 |
| iframe 子应用 | 4000 |

## 验证方案

1. **启动测试**
   ```bash
   npm install
   npm run dev:all
   ```
   - 主应用: http://localhost:8080
   - Vue3 子应用: http://localhost:7080
   - Vue2 子应用: http://localhost:3000
   - iframe 子应用: http://localhost:4000

2. **功能测试**
   - 动态上下线切换
   - token 同步验证
   - 布局切换
   - iframe 通信
   - 多实例加载
   - 心跳检测

3. **CLI 测试**
   ```bash
   cd packages/cli
   npm link
   artisan create sub-app test-app --type vue3
   ```
