# 配置 API

微应用配置结构和相关方法。

## 配置结构

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
  },
  props?: object                 // 传递给子应用的额外属性
}
```

## 配置示例

```javascript
// config/microApps.js
export const microApps = [
  {
    id: 'vue3-sub-app',
    name: 'Vue3 子应用',
    entry: '//localhost:7080',
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
      multiTab: false
    },
    props: {
      routerBase: '/vue3'
    }
  }
]
```

## 辅助方法

### getMicroApp(appId)

获取微应用配置。

```javascript
import { getMicroApp } from '@/config/microApps'

const config = getMicroApp('vue3-sub-app')
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

### updateMicroAppConfig(appId, config)

更新微应用配置。

```javascript
import { updateMicroAppConfig } from '@/config/microApps'

updateMicroAppConfig('vue3-sub-app', {
  status: 'offline'
})
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 唯一标识，用于区分不同应用 |
| name | string | 是 | 显示名称 |
| entry | string | 是 | 入口地址，支持 HTML 入口或 JSON 配置 |
| activeRule | string | 是 | 路由激活规则 |
| container | string | 是 | 容器选择器 |
| status | string | 是 | 状态：online/offline |
| version | string | 否 | 版本号 |
| lastModified | number | 否 | 最后修改时间，用于热更新 |
| preload | boolean | 否 | 是否预加载，默认 false |
| type | string | 是 | 类型：vue3/vue2/iframe/link |
| layoutType | string | 否 | 布局类型，默认 default |
| layoutOptions | object | 否 | 布局选项 |
| props | object | 否 | 传递给子应用的属性 |
