# 配置 API

微应用配置的数据结构和相关管理方法。

## 配置结构

```javascript
{
  id: string,                    // 唯一标识，必须与 vite-plugin-qiankun 注册名一致
  name: string,                  // 应用名称
  entry: string,                 // 入口地址（完整 URL，如 http://localhost:7080）
  activeRule: string,            // 激活规则（路由前缀，如 /vue3）
  container: string,             // 容器选择器（仅在配置文件中使用，Manager 直接传 DOM 元素）
  status: 'online' | 'offline',  // 状态
  version: string,               // 版本号
  lastModified: number,          // 最后修改时间戳（用于热更新检测）
  preload: boolean,              // 是否预加载
  type: 'vue3' | 'vue2' | 'iframe' | 'link',  // 子应用类型
  layoutType: 'default' | 'full' | 'embedded' | 'blank',  // 布局类型
  layoutOptions: {
    showHeader?: boolean,        // 是否显示头部（受布局约束影响）
    showSidebar?: boolean,       // 是否显示侧边栏（受布局约束影响）
    showFooter?: boolean,        // 是否显示底部
    keepAlive?: boolean          // 是否缓存
  },
  props?: object                 // 传递给子应用的额外属性
}
```

## 配置示例

```javascript
// 本地开发 mock 数据（packages/main-app/src/mock/microApps.js）
{
  id: 'vue3-sub-app',
  name: 'Vue3 子应用',
  entry: 'http://localhost:7080',
  activeRule: '/vue3',
  container: '#micro-app-container',
  status: 'online',
  version: '1.0.0',
  lastModified: Date.now(),
  preload: true,
  type: 'vue3',
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    keepAlive: false,
    showFooter: false
  },
  props: {
    routerBase: '/vue3'
  }
}
```

## 初始化方法

### initMicroApps(customApiUrl?)

根据环境变量 `VITE_USE_MICRO_APPS_API` 自动选择数据源初始化：

- `VITE_USE_MICRO_APPS_API=false`（默认）：加载 `mock/microApps.js`
- `VITE_USE_MICRO_APPS_API=true`：请求 `VITE_MICRO_APPS_API_URL`（默认 `/api/micro-apps`）

```javascript
import { initMicroApps } from '@/config/microApps'

// 根据环境变量自动选择数据源
const apps = await initMicroApps()

// 指定自定义 API 地址
const apps = await initMicroApps('/api/v2/micro-apps')
```

### loadMicroApps(options)

显式指定数据源加载：

```javascript
import { loadMicroApps } from '@/config/microApps'

// 从 mock 加载
const apps = await loadMicroApps({ source: 'mock' })

// 从 API 加载
const apps = await loadMicroApps({ source: 'api', apiUrl: '/api/micro-apps' })
```

### processMicroAppsData(rawApps)

对原始应用数据进行布局配置标准化（应用约束和默认值）：

```javascript
import { processMicroAppsData } from '@/config/microApps'

const normalizedApps = processMicroAppsData(rawApps)
```

## 查询方法

### getMicroApp(appId)

获取微应用配置。

```javascript
import { getMicroApp } from '@/config/microApps'

const config = getMicroApp('vue3-sub-app')
```

### getCurrentMicroApps()

获取当前已加载的所有微应用配置列表。

```javascript
import { getCurrentMicroApps } from '@/config/microApps'

const apps = getCurrentMicroApps()
```

### getOnlineMicroApps()

获取所有在线微应用。

```javascript
import { getOnlineMicroApps } from '@/config/microApps'

const apps = getOnlineMicroApps()
```

### getMicroAppsByType(type)

获取指定类型的微应用。

```javascript
import { getMicroAppsByType } from '@/config/microApps'

const vue3Apps = getMicroAppsByType('vue3')
```

### isMicroAppsLoaded()

检查微应用配置是否已完成加载。

```javascript
import { isMicroAppsLoaded } from '@/config/microApps'

if (isMicroAppsLoaded()) {
  // 可以安全地访问应用配置
}
```

### getDataSource()

获取当前数据源类型。

```javascript
import { getDataSource } from '@/config/microApps'

const source = getDataSource() // 'mock' | 'api'
```

## 更新方法

### updateMicroAppConfig(appId, config)

更新微应用配置（内存中）。

```javascript
import { updateMicroAppConfig } from '@/config/microApps'

updateMicroAppConfig('vue3-sub-app', {
  status: 'offline'
})
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，必须与 `vite-plugin-qiankun` 注册名一致 |
| name | string | 是 | 显示名称 |
| entry | string | 是 | 入口地址，支持完整 URL 或 `//host:port` 格式 |
| activeRule | string | 是 | 路由激活规则（路径前缀） |
| container | string | 否 | 容器选择器（配置参考，Manager 直接传 DOM 元素） |
| status | string | 是 | 状态：`online` / `offline` |
| version | string | 否 | 版本号 |
| lastModified | number | 否 | 最后修改时间戳，用于热更新检测 |
| preload | boolean | 否 | 是否预加载，默认 `false` |
| type | string | 是 | 类型：`vue3` / `vue2` / `iframe` / `link` |
| layoutType | string | 否 | 布局类型，默认 `default` |
| layoutOptions | object | 否 | 布局选项（会根据 layoutType 应用约束和默认值） |
| props | object | 否 | 传递给子应用的额外属性 |
