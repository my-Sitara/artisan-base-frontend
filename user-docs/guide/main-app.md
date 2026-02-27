# 主应用

主应用是微前端架构的核心，负责子应用的加载、管理和通信。

##技术栈

- Vue 3.5.29
- Vite 7.3.1
- Vue Router 5.0.3
- Pinia 3.x +持化
- qiankun (loadMicroApp模式)
- Element Plus 2.13.2

## 核心模块

### microAppManager.js

微应用实例管理器，支持：

- 多个应用实例同时加载
- lastModified 热更新检测
- preload 预加载
- 心跳检测
- 动态上下线

```javascript
import { microAppManager } from '@/core/microAppManager'

// 加载子应用
const result = await microAppManager.load('vue3-sub-app', container)

// 卸载子应用
await microAppManager.unload(instanceId)

// 刷新子应用
await microAppManager.reload(instanceId)
```

### bridge.js

跨应用通信桥，支持：

- postMessage 通信
- origin 校验
- token 同步
- 消息类型定义
- 双向通信封装

```javascript
import { bridge } from '@/core/bridge'

// 发送消息
bridge.send(targetWindow, { type: 'MESSAGE', payload: {} })

// 广播给所有子应用
bridge.broadcast({ type: 'TOKEN_SYNC', payload: { token } })

// 跳转到子应用
bridge.navigateTo({ appId: 'vue3-sub-app', path: '/list' })
```

### layoutManager.js

布局管理器，支持 5 种布局类型：

- `default` - 默认布局（含头部和侧边栏）
- `full` - 全屏布局
- `tabs` - 多标签页布局
- `embedded` - 嵌入式布局
- `blank` - 空白布局

```javascript
import { layoutManager } from '@/core/layoutManager'

// 设置布局
layoutManager.setLayout('tabs', {
  showHeader: true,
  multiTab: true
})
```

## 页面说明

### 首页 (Home.vue)

- 平台概览仪表盘
- 子应用状态展示
- 快速导航入口
- Token 管理

### 子应用加载页 (SubAppPage.vue)

- 单独加载子应用
- 支持 reload 刷新
- 支持上下线切换

### 多应用同屏展示页 (MultiInstancePage.vue)

-同一页面加载多个不同子应用
-支持多个应用实例管理
- 支持 grid/tabs/split布局

### 应用管理页 (AppManagement.vue)

- 表格展示所有微应用
- 上线/下线切换
- 强制刷新
- 查看版本和状态
- 错误日志展示

## Pinia 状态管理

使用 pinia-plugin-persistedstate 实现持久化：

```javascript
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  
  function setToken(newToken) {
    token.value = newToken
    bridge.syncToken(newToken)  // 同步到所有子应用
  }
  
  return { token, setToken }
}, {
  persist: {
    key: 'artisan-user',
    paths: ['token']
  }
})
```

持久化的数据：
- `token` - 用户令牌
- `activeAppId` - 当前激活的应用
- `tabs` - 标签页列表
