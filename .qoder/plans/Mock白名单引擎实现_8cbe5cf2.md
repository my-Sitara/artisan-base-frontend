# Mock 白名单引擎实现方案

## 核心设计原则

- **默认 API 模式**：所有请求默认走真实后端 API
- **白名单 Mock**：仅在 `mockConfig.js` 中显式声明的接口走 mock
- **Dev 模式驱动**：mock 开关由 `import.meta.env.DEV`（Vite 内置）决定，无需额外环境变量
- **生产安全**：生产构建自动禁用 mock，mock 代码通过动态 import 实现 tree-shaking

## 现有文件关系

```
config/app.js (读取环境变量)
    ↓
config/microApps.js (USE_MICRO_APPS_API → mock/api 选择)
api/layout.js (USE_LAYOUT_API → localStorage/API 选择)
    ↓
utils/request.js (axios 封装，无 mock 感知)
```

## 改造后架构

```
config/mockConfig.js (白名单配置 + 全局开关)
    ↓
utils/mockEngine.js (引擎：匹配白名单、路由决策、持久化)
    ↓
utils/request.js (请求拦截器集成 mock 引擎)
    ↓
mock/handlers/*.js (按模块组织的 mock 处理器)
```

---

## Task 1：创建 Mock 配置文件

**文件**：`packages/main-app/src/config/mockConfig.js`（新建）

设计要点：
- `enabled`：由 `import.meta.env.DEV` 控制，dev 模式自动开启
- `defaultMode`：设为 `'api'`（默认走真实 API）
- `whitelist`：白名单对象，key 为 `METHOD /path` 格式，value 为 `true`
- 支持通配符匹配（如 `GET /api/users/*`）
- 支持 localStorage 持久化运行时覆盖

```javascript
// 示例结构
export const mockWhitelist = {
  'GET /api/users': true,
  'GET /api/users/:id': true,
  'POST /api/users': true,
}

export const mockGlobalConfig = {
  enabled: import.meta.env.DEV,    // dev 模式自动启用
  defaultMode: 'api',              // 默认走 API
  persistence: true,
  storageKey: 'artisan-mock-config',
}
```

---

## Task 2：创建 Mock 引擎

**文件**：`packages/main-app/src/utils/mockEngine.js`（新建）

核心职责：
1. **`shouldUseMock(method, url)`**：判断请求是否命中白名单
   - 非 dev 模式 → 返回 false
   - 未在白名单中 → 返回 false（默认走 API）
   - 在白名单中且未被运行时禁用 → 返回 true
2. **`handle(method, url, data)`**：执行对应的 mock handler 并返回模拟数据
3. **`register(pattern, handler)`**：注册 mock 处理器
4. **`toggleInterface(pattern, useMock)`**：运行时切换单个接口，持久化到 localStorage
5. **`getAllInterfaces()`**：返回所有已注册接口及其当前 mock/api 状态
6. **路径匹配**：支持精确匹配、`:param` 参数匹配、`*` 通配符

关键逻辑（shouldUseMock）：
```javascript
shouldUseMock(method, url) {
  if (!this.config.enabled) return false          // 非 dev 直接跳过
  const pattern = `${method.toUpperCase()} ${url.split('?')[0]}`
  const matched = this.matchPattern(pattern)
  if (!matched) return false                       // 不在白名单 → 走 API
  const runtimeOverride = this.runtime[matched]
  if (runtimeOverride !== undefined) return runtimeOverride
  return this.whitelist[matched] === true          // 白名单中 → 走 mock
}
```

---

## Task 3：改造 request.js 集成 mock 引擎

**文件**：`packages/main-app/src/utils/request.js`（修改）

改造方式：在请求拦截器中判断是否走 mock，如果命中白名单则**拦截请求并直接返回 mock 数据**，不发出真实 HTTP 请求。

实现策略 — 使用 axios 的 `adapter` 机制：

```javascript
// 请求拦截器中
import { mockEngine } from './mockEngine'

request.interceptors.request.use(async config => {
  // ... 现有 Token 注入和防缓存逻辑不变 ...

  // Mock 路由判断
  if (mockEngine.shouldUseMock(config.method, config.url)) {
    // 使用自定义 adapter 拦截，不发出真实请求
    config.adapter = async () => {
      const mockData = await mockEngine.handle(config.method, config.url, config.data)
      return { data: mockData, status: 200, config }
    }
  }

  return config
})
```

这样做的好处：
- 不改变现有响应拦截器逻辑
- mock 响应走正常的 axios 流程，格式一致
- 无 mock handler 时自动降级到真实 API（mockEngine.handle 抛错 → adapter 不生效）

---

## Task 4：创建示例 Mock Handler

**目录**：`packages/main-app/src/mock/handlers/`

创建一个示例 handler 文件作为模板，展示如何编写 mock 处理器：

**文件**：`packages/main-app/src/mock/handlers/example.js`（新建）

```javascript
import { mockEngine } from '@/utils/mockEngine'

mockEngine.register('GET /api/users', () => ({
  code: 200,
  message: 'success',
  data: { items: [...], total: 20 }
}))
```

---

## Task 5：Mock 初始化入口

**文件**：`packages/main-app/src/mock/init.js`（新建）

职责：dev 模式下动态 import 所有 handler 并完成注册。

```javascript
export async function initMock() {
  if (!import.meta.env.DEV) return   // 生产模式跳过，确保 tree-shaking
  
  // 动态导入所有 handler
  const handlers = import.meta.glob('./handlers/*.js')
  for (const path in handlers) {
    await handlers[path]()
  }
}
```

**文件**：`packages/main-app/src/main.js`（修改）

在应用初始化前调用 `initMock()`：
```javascript
import { initMock } from '@/mock/init'
await initMock()  // 放在 appStore.initialize() 之前
```

---

## Task 6：修复 layout.js 已知 bug

**文件**：`packages/main-app/src/api/layout.js`（修改）

修复第 113 行 `if (USE_API)` → `if (USE_LAYOUT_API)`

---

## 文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 新建 | `src/config/mockConfig.js` | 白名单配置 |
| 新建 | `src/utils/mockEngine.js` | Mock 引擎核心 |
| 新建 | `src/mock/init.js` | Mock 初始化入口 |
| 新建 | `src/mock/handlers/example.js` | 示例 handler |
| 修改 | `src/utils/request.js` | 集成 mock adapter |
| 修改 | `src/main.js` | 添加 initMock() 调用 |
| 修改 | `src/api/layout.js` | bug 修复 |

## 不涉及的变更

- 不修改 `.env.*` 文件（mock 开关由 DEV 模式自动决定）
- 不修改 `config/app.js`（无需新增环境变量）
- 不修改 `config/microApps.js`（现有 mock/api 切换逻辑保留不变）
- 不涉及 CLI 模板
- 开发者工具面板（MockDevTool.vue）留到第二阶段