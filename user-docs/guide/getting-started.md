# 快速开始

## 环境要求

- Node.js >= 18.12.0
- npm >= 9.0.0

## 安装依赖

```bash
git clone https://github.com/your-org/artisan-base-frontend.git
cd artisan-base-frontend
npm install
```

## 启动开发环境

### 启动所有应用

```bash
npm run dev:all
```

### 单独启动

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

## 端口配置

| 应用 | 端口 | 描述 |
|------|------|------|
| 主应用 | 8080 | Vue3 主应用 |
| Vue3 子应用 | 7080 | Vue3 Demo 子应用 |
| Vue2 子应用 | 3000 | Vue2 Demo 子应用 |
| iframe 子应用 | 9080 | iframe Demo 子应用 |

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

## 使用 CLI 创建子应用

```bash
# 全局安装 CLI
cd packages/cli
npm link

# 创建 Vue3 子应用
artisan create sub-app my-app --type vue3

# 创建 Vue2 子应用
artisan create sub-app my-app --type vue2

# 创建 iframe 子应用
artisan create sub-app my-app --type iframe
```

## 下一步

- [了解主应用](./main-app.md)
- [了解子应用](./sub-apps.md)
- [布局系统](./layout-system.md)
