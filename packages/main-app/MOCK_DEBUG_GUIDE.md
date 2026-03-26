# Mock 测试接口调试指南

## 🔍 问题排查步骤

### 1. 确认使用正确的环境文件

**检查启动命令：**
```bash
# 应该使用这个命令加载 .env.mock
npm run dev:mock
```

如果直接运行 `npm run dev`，会加载 `.env.development` 而不是 `.env.mock`！

### 2. 检查环境变量是否生效

**打开浏览器控制台，输入：**
```javascript
import.meta.env.VITE_MOCK_MODE
// 应该返回 "true"
```

如果不为 `"true"`，说明环境变量没有正确加载。

### 3. 检查 Mock 初始化日志

**刷新页面后，控制台应该显示：**
```
[Mock] Test API handlers registered
[Mock] Initialization complete
```

如果没有看到这些日志，说明 handlers 没有被加载。

### 4. 检查 API 调用日志

**点击"刷新数据"按钮后，控制台应该显示：**
```
[Mock] GET /api/test/list {page: 1, pageSize: 10, search: ''}
```

如果看到的是网络请求错误（如 404），说明 Mock 拦截没有生效。

### 5. 检查 Mock白名单

**在控制台输入：**
```javascript
import { mockEngine } from '@/utils/mockEngine'
mockEngine.getAllInterfaces()
```

应该能看到：
```javascript
[
  {pattern: 'GET /api/test/list', enabled: true},
  {pattern: 'POST /api/test', enabled: true},
  {pattern: 'DELETE /api/test/:id', enabled: true}
]
```

## 🚀 正确的启动方式

### 方式一：使用 npm run dev:mock（推荐）

**根目录执行：**
```bash
cd /Users/wuyunzhu/Downloads/artisan-base-frontend
npm run dev:mock
```

这会同时启动：
- 主应用（Mock 模式）
- Vue3 子应用
- Vue2 子应用
- iframe 子应用

### 方式二：单独启动主应用（Mock 模式）

**主应用目录：**
```bash
cd packages/main-app
npm run dev:mock
```

访问：`http://localhost:8080/mock-test`

## ⚠️ 常见错误

### 错误 1：使用了错误的启动命令

❌ **错误：**
```bash
npm run dev  # 这会加载 .env.development（VITE_MOCK_MODE=false）
```

✅ **正确：**
```bash
npm run dev:mock  # 这会加载 .env.mock（VITE_MOCK_MODE=true）
```

### 错误 2：环境变量未生效

**症状：**
- 控制台输出 `[Mock] Skipped (not in mock mode)`
- 看不到 `[Mock] Test API handlers registered`

**解决方法：**
1. 停止当前服务（Ctrl+C）
2. 确认 `.env.mock` 中 `VITE_MOCK_MODE=true`
3. 重新运行 `npm run dev:mock`

### 错误 3：API 调用失败（404）

**症状：**
```
GET http://localhost:8080/api/test/list 404
```

**原因：** Mock 模式未启用，请求被发送到不存在的真实后端

**解决方法：**
1. 确认 `VITE_MOCK_MODE=true`
2. 重启开发服务器
3. 清除浏览器缓存

## 📊 完整调试流程

### 步骤 1：验证环境配置

```bash
# 检查 .env.mock 文件内容
cat packages/main-app/.env.mock

# 应该看到：
# VITE_MOCK_MODE=true
```

### 步骤 2：重启服务器

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
npm run dev:mock
```

### 步骤 3：打开测试页面

访问：`http://localhost:8080/mock-test`

### 步骤 4：打开浏览器控制台

按 F12 打开开发者工具，查看 Console 标签

### 步骤 5：检查初始化日志

应该看到：
```
[Mock] Initialization complete
[Mock] Test API handlers registered
```

### 步骤 6：点击"刷新数据"

点击测试卡片中的"刷新数据"按钮

### 步骤 7：检查调用日志

应该看到：
```
[Mock] GET /api/test/list {page: 1, pageSize: 10, search: ''}
成功加载 10 条数据
```

### 步骤 8：验证数据展示

表格中应该显示 10 条测试数据：
- ID、名称、描述
- 状态标签（活跃/待处理/未激活）
- 标签（测试/示例/Mock）
- 创建时间

## 🛠️ 手动测试代码

如果还是不行，可以在控制台手动测试：

### 测试 1：直接调用 API

```javascript
import API from '@/api'
const result = await API.test.getTestList({ page: 1, pageSize: 10 })
console.log(result)
```

### 测试 2：检查 Mock 引擎状态

```javascript
import { mockEngine } from '@/utils/mockEngine'
console.log('Mock 已注册接口:', mockEngine.getAllInterfaces())
```

### 测试 3：检查环境变量

```javascript
console.log('VITE_MOCK_MODE:', import.meta.env.VITE_MOCK_MODE)
console.log('USE_MOCK:', import('./config/app.js').then(m => m.USE_MOCK))
```

## 📝 预期结果

**成功的标志：**
- ✅ 控制台显示 `[Mock] GET /api/test/list`
- ✅ 表格显示 10 条测试数据
- ✅ 分页组件显示总数 10
- ✅ 搜索功能正常工作
- ✅ 切换页码正常加载

**失败的标志：**
- ❌ 控制台显示 404 错误
- ❌ 表格为空
- ❌ 显示 "加载测试列表失败"
- ❌ 看不到 Mock 相关日志

## 🔗 相关文件检查清单

- [ ] `.env.mock` - `VITE_MOCK_MODE=true`
- [ ] `src/config/mockConfig.js` - 包含 test 接口白名单
- [ ] `src/mock/handlers/test.js` - Mock handler 文件存在
- [ ] `src/api/test.js` - API 模块文件存在
- [ ] `src/views/MockTestPage.vue` - 测试页面正确使用 API
- [ ] `src/mock/init.js` - Mock 初始化逻辑正确

## 💡 快速修复命令

```bash
# 1. 进入主应用目录
cd packages/main-app

# 2. 确认 .env.mock 配置
echo "VITE_MOCK_MODE=$(grep VITE_MOCK_MODE .env.mock | cut -d'=' -f2)"

# 3. 如果是 false，修改为 true
# （通常不需要，因为 .env.mock 已经正确配置）

# 4. 重启服务
npm run dev:mock
```

## 🎯 下一步

如果以上步骤都完成了但还是没数据：

1. **截图控制台错误信息**
2. **检查 Network 标签是否有 404 请求**
3. **尝试清除缓存并强制刷新（Ctrl+Shift+R）**
4. **检查是否有其他 JavaScript 错误**
