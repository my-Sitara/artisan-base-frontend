# 测试 API 使用示例

## 📁 文件位置

- **API 模块**: `/packages/main-app/src/api/test.js` - 纯 API 接口定义
- **Mock Handler**: `/packages/main-app/src/mock/handlers/test.js` - Mock 数据拦截
- **测试页面**: `/packages/main-app/src/views/MockTestPage.vue`

## 🎯 架构设计

```
┌─────────────┐
│   前端调用   │
│ MockTestPage│
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│   API 模块 (test.js) │
│ mainRequest.get()   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────────────┐
│  mockEngine (自动拦截)      │
│ 如果 USE_MOCK=true          │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│ Mock Handler (handlers/test.js)│
│ 生成 Mock 数据                │
└─────────────────────────────┘
```

## 🔧 工作原理

### 1. API 模块 (`test.js`)

**职责：** 定义标准的 HTTP 请求接口，不包含任何 Mock 逻辑

```javascript
import { mainRequest } from '@/utils/request'

export async function getTestListAPI(params = {}) {
  const response = await mainRequest.get('/api/test/list', { params })
  return response
}
```

### 2. Mock Handler (`handlers/test.js`)

**职责：** 拦截 API 请求并返回 Mock 数据

```javascript
import { mockEngine } from '@/utils/mockEngine'

mockEngine.register('GET /api/test/list', (query) => {
  // 生成并返回 Mock 数据
  return {
    code: 200,
    message: 'success',
    data: { items: [...], total: 100 }
  }
})
```

### 3. 自动拦截机制

当 `USE_MOCK = true` 时：
1. `mainRequest.get('/api/test/list')` 发起请求
2. `mockEngine` 自动拦截匹配的请求路径
3. 调用对应的 handler 返回 Mock 数据
4. 不会发送到真实后端

当 `USE_MOCK = false` 时：
1. 请求直接发送到后端服务器
2. Mock handlers 不会被触发

### 2. 提供的接口

#### `GET /api/test/list` - 获取测试列表

**参数：**
- `page` (number): 页码，默认 1
- `pageSize` (number): 每页条数，默认 10
- `search` (string): 搜索关键词

**响应格式：**
```javascript
{
  code: 200,
  message: 'success',
  data: {
    items: [
      {
        id: 1,
        name: '测试项 1',
        description: '这是第 1 个测试数据',
        status: 'active', // active | pending | inactive
        createdAt: '2026-03-26T10:00:00.000Z',
        tags: ['测试', '示例']
      }
    ],
    total: 100,
    page: 1,
    pageSize: 10
  }
}
```

#### `POST /api/test` - 创建测试数据

**请求体：**
```javascript
{
  name: '测试名称',
  description: '测试描述'
}
```

#### `DELETE /api/test/:id` - 删除测试数据

**路径参数：**
- `id` (number): 要删除的数据 ID

## 💻 使用方式

### 方式一：命名导入（推荐单个函数使用）

```javascript
import { getTestListAPI, createTestItemAPI, deleteTestItemAPI } from '@/api/test'

// 获取列表
const result = await getTestListAPI({
  page: 1,
  pageSize: 10,
  search: '关键词'
})

// 创建数据
const newItem = await createTestItemAPI({
  name: '新测试项',
  description: '详细描述'
})

// 删除数据
await deleteTestItemAPI(1)
```

### 方式二：通过 @/api 统一导入（推荐多个模块使用）

```javascript
import API from '@/api'

// 获取列表
const result = await API.test.getTestList({
  page: 1,
  pageSize: 10
})

// 创建数据
await API.test.createTestItem({
  name: '新测试项',
  description: '详细描述'
})

// 删除数据
await API.test.deleteTestItem(1)
```

## 🎨 页面展示

访问 `http://localhost:8080/mock-test` 可以看到：

1. **查询表单**
   - 页码输入
   - 每页条数选择
   - 搜索关键词输入
   - 查询按钮

2. **数据表格**
   - ID、名称、描述
   - 状态标签（活跃/待处理/未激活）
   - 标签展示
   - 创建时间

3. **分页组件**
   - 总条数显示
   - 每页条数切换（5/10/20/50）
   - 页码跳转

## 🔧 Mock 数据生成逻辑

当 `USE_MOCK = true` 时，自动生成以下特征的模拟数据：

```javascript
{
  id: 自动递增,
  name: `测试项 ${index + 1}`,
  description: `这是第 ${index + 1} 个测试数据`,
  status: 随机分配 ('active' | 'pending' | 'inactive'),
  createdAt: 随机时间戳,
  tags: 从 ['测试', '示例', 'Mock'] 中随机选择 1-3 个
}
```

## 🚀 快速开始

1. **启动主应用（Mock 模式）**
   ```bash
   cd packages/main-app
   npm run dev
   ```
   
   确保环境变量 `.env.development` 中：
   ```env
   VITE_MOCK_MODE=true
   ```

2. **访问测试页面**
   - 直接访问：`http://localhost:8080/mock-test`
   - 或在首页点击"Mock 接口测试"快捷入口

3. **测试功能**
   - 调整页码和每页条数
   - 输入搜索关键词
   - 点击"查询"或"刷新数据"
   - 打开浏览器控制台查看 Mock 拦截日志

## 📝 扩展示例

### 添加新的测试接口

在 `test.js` 中添加：

```javascript
/**
 * 更新测试数据
 * @param {number} id - 数据 ID
 * @param {Object} data - 更新数据
 */
export async function updateTestItemAPI(id, data) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      code: 200,
      message: '更新成功',
      data: {
        id,
        ...data,
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  const response = await mainRequest.put(`/api/test/${id}`, data)
  return response
}

// 添加到默认导出
export default {
  getTestList: getTestListAPI,
  createTestItem: createTestItemAPI,
  deleteTestItem: deleteTestItemAPI,
  updateTestItem: updateTestItemAPI // 新增
}
```

然后在页面中使用：

```javascript
const handleUpdate = async (id, newData) => {
  try {
    await API.test.updateTestItem(id, newData)
    ElMessage.success('更新成功')
    loadTestList() // 重新加载列表
  } catch (error) {
    ElMessage.error('更新失败')
  }
}
```

## 🎯 最佳实践

1. **Mock 数据特征**
   - ✅ 模拟真实数据结构
   - ✅ 包含合理的延迟（300ms）
   - ✅ 支持分页和搜索
   - ✅ 生成有意义的测试数据

2. **错误处理**
   ```javascript
   try {
     const result = await API.test.getTestList(params)
     // 处理成功结果
   } catch (error) {
     console.error('API 调用失败:', error)
     ElMessage.error('操作失败：' + error.message)
   }
   ```

3. **Loading 状态管理**
   ```javascript
   const loadData = async () => {
     loading.value = true
     try {
       // API 调用
     } finally {
       loading.value = false
     }
   }
   ```

4. **参数验证**
   ```javascript
   const getTestListAPI = async (params = {}) => {
     const { page = 1, pageSize = 10, search = '' } = params
     // 可以在这里添加参数验证
   }
   ```

## 📊 代码结构

```
src/api/test.js
├── getTestListAPI(params)      # GET /api/test/list
├── createTestItemAPI(data)     # POST /api/test
├── deleteTestItemAPI(id)       # DELETE /api/test/:id
└── default export              # { getTestList, createTestItem, deleteTestItem }

src/mock/handlers/test.js
├── GET /api/test/list          # 拦截列表查询
├── POST /api/test              # 拦截创建操作
└── DELETE /api/test/:id        # 拦截删除操作

src/views/MockTestPage.vue
├── template                    # 测试 API 演示 UI
│   ├── 查询表单
│   ├── 数据表格
│   └── 分页组件
├── script setup
│   ├── testForm                # 表单状态
│   ├── testListData            # 列表数据
│   ├── testTotal               # 总条数
│   ├── loadTestList()          # 加载方法
│   └── handleTestSearch()      # 搜索方法
└── style                       # 样式
```

## 🔗 相关文件

- [`test.js`](../packages/main-app/src/api/test.js) - 纯 API 接口定义
- [`handlers/test.js`](../packages/main-app/src/mock/handlers/test.js) - Mock 数据拦截
- [`MockTestPage.vue`](../packages/main-app/src/views/MockTestPage.vue) - 测试页面
- [`request.js`](../packages/main-app/src/utils/request.js) - HTTP 请求工具
- [`mockEngine.js`](../packages/main-app/src/utils/mockEngine.js) - Mock 引擎
- [`mockConfig.js`](../packages/main-app/src/config/mockConfig.js) - Mock白名单配置
