# TypeScript 迁移

本项目默认使用 JavaScript，以下是迁移到 TypeScript 的指南。

## 主应用迁移

### 1. 安装依赖

```bash
cd packages/main-app
npm install -D typescript @types/node vue-tsc
```

### 2. 创建 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. 更新 vite.config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 4. 文件重命名

- `main.js` → `main.ts`
- `*.js` → `*.ts`

### 5. 类型定义

```typescript
// types/micro-app.d.ts
export interface MicroAppConfig {
  id: string
  name: string
  entry: string
  activeRule: string
  container: string
  status: 'online' | 'offline'
  version: string
  lastModified: number
  preload: boolean
  type: 'vue3' | 'vue2' | 'iframe' | 'link'
  layoutType: 'default' | 'full' | 'tabs' | 'embedded' | 'blank'
  layoutOptions: {
    showHeader?: boolean
    showSidebar?: boolean
    keepAlive?: boolean
    multiTab?: boolean
  }
}
```

### 6. Store 类型

```typescript
// stores/app.ts
import { defineStore } from 'pinia'
import type { MicroAppConfig } from '@/types/micro-app'

export const useAppStore = defineStore('app', () => {
  const apps = ref<MicroAppConfig[]>([])
  const activeAppId = ref<string | null>(null)
  
  // ...
})
```

### 7. Bridge 类型

```typescript
// types/bridge.d.ts
export interface BridgeMessage {
  type: string
  payload: Record<string, unknown>
}

export interface Bridge {
  send(target: Window, message: BridgeMessage): void
  navigateTo(options: { appId: string; path?: string }): void
  navigateToMain(path: string): void
}

declare global {
  interface Window {
    __ARTISAN_BRIDGE__?: Bridge
    __POWERED_BY_QIANKUN__?: boolean
  }
}
```

## Vue3 子应用迁移

类似主应用，添加 tsconfig.json 和类型定义。

## Vue2 子应用迁移

```bash
npm install -D typescript @vue/cli-plugin-typescript
```

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## CLI 迁移

```bash
cd packages/cli
npm install -D typescript @types/node @types/inquirer
```

将 `lib/*.js` 重命名为 `lib/*.ts`，添加类型注解。

## Lerna + TypeScript 注意事项

1. 每个包独立配置 tsconfig.json
2. 使用 `references` 配置包之间的依赖
3. 考虑使用 `composite: true` 启用增量编译
