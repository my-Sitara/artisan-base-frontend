# Mock 接口测试页面使用说明

## 📍 访问地址

启动主应用后，访问：`http://localhost:8080/mock-test`

## 🎯 功能特性

### 1. 微应用配置接口测试

**测试接口：** `GET /api/micro-apps`

- ✅ 展示所有微应用的配置信息
- ✅ 支持刷新重新加载
- ✅ 显示应用 ID、名称、类型、状态、入口地址等
- ✅ 支持点击"详情"查看完整配置
- ✅ 支持点击"访问"跳转到对应子应用

**Mock 数据源：** `packages/main-app/src/mock/microApps.js`

### 2. 布局管理接口测试

**测试接口：** 
- `POST /multi-app-layout/save` - 保存布局
- `GET /multi-app-layout/load` - 加载布局

**功能：**
- ✅ 保存示例布局数据到 localStorage
- ✅ 从 localStorage 加载布局数据
- ✅ 清空布局
- ✅ 展示当前布局配置的详细信息

**Mock 实现：** `packages/main-app/src/api/layout.js`

### 3. Mock 引擎状态监控

**功能：**
- ✅ 显示当前是 Mock 模式还是 API 模式
- ✅ 列出所有已注册的 Mock 接口
- ✅ 显示每个接口的启用状态
- ✅ 显示运行时覆盖状态

**Mock 引擎：** `packages/main-app/src/utils/mockEngine.js`

## 🔧 环境切换

### 使用 Mock 模式（默认）

```bash
# 开发环境自动使用 Mock
npm run dev
```

### 使用 API 模式

如果需要切换到真实 API，需要修改环境变量：

```bash
# packages/main-app/.env.development
VITE_MOCK_MODE=false
VITE_API_BASE_URL=http://your-api-server.com/api
```

## 📊 测试的接口列表

| 接口 | 方法 | Mock 文件 | 说明 |
|------|------|-----------|------|
| /api/micro-apps | GET | mock/microApps.js | 获取微应用配置 |
| /multi-app-layout/save | POST | api/layout.js | 保存布局 |
| /multi-app-layout/load | GET | api/layout.js | 加载布局 |

## 🚀 快速开始

1. **启动主应用**
   ```bash
   cd packages/main-app
   npm run dev
   ```

2. **访问测试页面**
   - 打开浏览器访问：`http://localhost:8080/mock-test`
   - 或者在首页添加一个快捷入口

3. **测试接口**
   - 查看微应用列表
   - 尝试保存/加载布局
   - 查看 Mock 引擎状态

## 💡 扩展示例

### 添加新的 Mock 接口测试

1. 在 `packages/main-app/src/mock/handlers/` 创建新的 handler 文件

```javascript
// handlers/user.js
import { mockEngine } from '@/utils/mockEngine'

mockEngine.register('GET /api/users', (query) => ({
  code: 200,
  message: 'success',
  data: {
    items: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' }
    ],
    total: 2
  }
}))
```

2. 在 `packages/main-app/src/config/mockConfig.js` 中添加白名单

```javascript
export const mockWhitelist = {
  'GET /api/micro-apps': true,
  'GET /multi-app-layout/load': true,
  'POST /multi-app-layout/save': true,
  'GET /api/users': true, // 新增
}
```

3. 在测试页面中添加对应的测试代码

## 📝 注意事项

- ✅ Mock 数据仅存储在浏览器本地，不会发送到服务器
- ✅ 刷新页面会重置到初始 Mock 数据（除非手动保存过布局）
- ✅ 可以在浏览器开发者工具的 Application > Local Storage 中查看存储的数据
- ✅ 生产环境部署时会自动禁用 Mock 模式

## 🐛 故障排查

**问题：Mock 数据不生效**
- 检查是否处于 Mock 模式：`console.log(import.meta.env.VITE_MOCK_MODE)`
- 清除浏览器缓存和 localStorage 后重试

**问题：接口调用失败**
- 打开浏览器控制台查看错误信息
- 确认 Mock 引擎已正确初始化
- 检查接口路径是否在白名单中
