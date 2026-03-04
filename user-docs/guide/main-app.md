# 主应用

主应用是微前端架构的核心，负责子应用的加载、管理和通信。

## 技术栈

- Vue 3.5.29
- Vite 7.3.1
- Vue Router 5.0.3
- Pinia 3.x + 持久化（pinia-plugin-persistedstate）
- qiankun（loadMicroApp 模式）
- Element Plus 2.13.2

## 启动流程

主应用在 `main.js` 中按如下顺序初始化：

1. 创建 Vue 应用，配置 Pinia（含持久化插件）
2. 调用 `appStore.initialize()` 加载微应用配置（在 router 安装前完成）
3. 安装 Vue Router、Element Plus
4. 调用 `setupBridge()` 建立跨应用通信监听
5. 挂载应用

```javascript
// main.js 核心流程
const appStore = useAppStore()
await appStore.initialize()  // 加载微应用配置

app.use(router)
setupBridge()
app.mount('#app')
```

## 核心模块

### microAppManager.js

微应用实例管理器，以 `appId` 为唯一标识，同一应用同时只允许存在一个实例。支持：

- 多类型应用加载（vue3/vue2/iframe/link）
- `lastModified` 热更新检测
- `preload` 预加载
- 心跳检测（每 30 秒）
- 动态上下线
- 样式清理（防止子应用样式污染）

```javascript
import { microAppManager } from '@/core/microAppManager'

// 加载子应用
const result = await microAppManager.load('vue3-sub-app', containerElement)

// 卸载子应用
await microAppManager.unload('vue3-sub-app')

// 刷新子应用
await microAppManager.reload('vue3-sub-app')

// 预加载
await microAppManager.preload(['vue3-sub-app'])
```

### bridge.js

跨应用通信桥，支持：

- postMessage 通信
- origin 校验（静态列表 + 正则动态匹配，支持云 IDE 环境）
- token 同步
- 消息类型定义
- 双向通信封装

```javascript
import { bridge } from '@/core/bridge'

// 发送消息到指定窗口
bridge.send(targetWindow, { type: 'MESSAGE', payload: {} })

// 广播给所有子应用
bridge.broadcast({ type: 'TOKEN_SYNC', payload: { token } })

// 跳转到子应用
bridge.navigateTo({ appId: 'vue3-sub-app', path: '/list' })

// 注册自定义消息处理器
bridge.on('MY_EVENT', (payload) => { /* ... */ })
```

### layoutManager.js

布局管理器，支持 4 种布局类型：

- `default` - 默认布局（含头部和侧边栏）
- `full` - 全屏布局（无导航元素）
- `embedded` - 嵌入式布局（轻量级，通常只显示头部）
- `blank` - 空白布局（仅内容区域）

```javascript
import { layoutManager } from '@/core/layoutManager'

// 设置布局
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false
})

// 更新布局选项
layoutManager.updateOptions({ showFooter: true })

// 重置为默认布局
layoutManager.reset()

// 监听布局变化
layoutManager.onChange(({ prevType, currentType, options }) => {
  console.log('Layout changed:', prevType, '->', currentType)
})
```

## 状态管理

### useAppStore

管理微应用列表、侧边栏状态等：

```javascript
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 初始化微应用配置（根据环境变量自动选择 mock 或 api）
await appStore.initialize()

// 读取应用列表
const apps = appStore.apps
const onlineApps = appStore.onlineApps

// 更新应用状态
appStore.setAppStatus('vue3-sub-app', 'offline')

// 添加/删除应用
appStore.addApp(newAppConfig)
appStore.removeApp('vue3-sub-app')
```

### useUserStore

管理用户信息和 token（含持久化）：

```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const token = userStore.token
```

## 页面说明

### 首页（Home.vue）

路由：`/`

平台概览仪表盘，展示在线/离线子应用状态及快速导航入口。

### 子应用页（SubAppPage.vue）

路由：`/app/:appId`、`/vue3/:pathMatch*`、`/vue2/:pathMatch*`、`/iframe/:pathMatch*`

根据应用类型分别渲染 `MicroAppContainer`、`IframeContainer` 或外部链接提示。

### 多应用同屏（MultiInstancePage.vue）

路由：`/multi-instance`

同时加载多个子应用实例，支持自由布局排列。

### 子应用加载管理（AppLoading.vue）

路由：`/app-management/loading`

微应用列表管理，支持配置编辑、布局预览、上下线切换。

### 错误日志（ErrorLogs.vue）

路由：`/app-management/error-logs`

查看并清理 MicroAppManager 记录的运行时错误日志。

## 微应用配置

微应用配置由 `config/microApps.js` 管理，通过环境变量 `VITE_USE_MICRO_APPS_API` 选择数据源：

- `false`（默认）：从 `mock/microApps.js` 加载本地数据
- `true`：从 `VITE_MICRO_APPS_API_URL` 指定的后端接口加载

详见 [配置 API](../api/config.md)。


### 多应用同屏展示页 (MultiInstancePage.vue)

- 同一页面加载多个不同子应用
- 支持多个应用实例管理
- 支持 grid/split布局

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

持久化的数据:
- `token` - 用户令牌
- `activeAppId` - 当前激活的应用
