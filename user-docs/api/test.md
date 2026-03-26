# 测试 API

测试 API 用于演示和验证 Mock 系统的完整工作流程，包含完整的 Mock 数据生成和接口拦截能力。

## 📋 接口列表

### GET /api/test/list

获取测试列表数据（支持分页和搜索）。

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页条数（最大 100） |
| search | string | 否 | - | 搜索关键词（支持名称和描述） |

**响应格式：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "测试项 1",
        "description": "这是第 1 个测试数据",
        "status": "active",
        "createdAt": "2026-03-26T10:00:00.000Z",
        "tags": ["测试", "示例"]
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| items | Array | 数据列表 |
| total | number | 总条数 |
| page | number | 当前页码 |
| pageSize | number | 每页条数 |

**数据项结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 数据 ID |
| name | string | 名称 |
| description | string | 描述 |
| status | string | 状态（`active` \| `pending` \| `inactive`） |
| createdAt | string | 创建时间（ISO 8601 格式） |
| tags | Array | 标签数组 |

---

### POST /api/test

创建单个测试数据项。

**请求体：**

```json
{
  "name": "新测试项",
  "description": "详细描述"
}
```

**响应格式：**

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 123,
    "name": "新测试项",
    "description": "详细描述",
    "status": "pending",
    "createdAt": "2026-03-26T10:00:00.000Z",
    "tags": ["新建"]
  }
}
```

---

### DELETE /api/test/:id

删除指定测试数据项。

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 要删除的数据 ID |

**响应格式：**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 💻 使用示例

### 方式一：命名导入（推荐单个函数使用）

```javascript
import { getTestListAPI, createTestItemAPI, deleteTestItemAPI } from '@/api/test'

// 获取列表
const result = await getTestListAPI({
  page: 1,
  pageSize: 10,
  search: '关键词'
})
console.log('列表数据:', result.items)
console.log('总数:', result.total)

// 创建数据
const newItem = await createTestItemAPI({
  name: '新测试项',
  description: '详细描述'
})
console.log('创建成功:', newItem)

// 删除数据
await deleteTestItemAPI(123)
```

### 方式二：通过 @/api 统一导入（推荐多个模块使用）

```javascript
import API from '@/api'

// 获取列表
const result = await API.test.getTestList({
  page: 1,
  pageSize: 10
})
console.log('列表数据:', result.items)

// 创建数据
await API.test.createTestItem({
  name: '新测试项'
})

// 删除数据
await API.test.deleteTestItem(123)
```

---

## 🎯 Mock 数据特征

当启用 Mock 模式时（`VITE_MOCK_MODE=true`），系统会自动生成符合以下特征的模拟数据：

### 数据生成规则

```javascript
{
  id: 自动递增,
  name: `测试项 ${index + 1}`,
  description: `这是第 ${index + 1} 个测试数据`,
  status: 随机分配 ('active' | 'pending' | 'inactive'),
  createdAt: 随机时间戳（最近 90 天内）,
  tags: 从 ['测试', '示例', 'Mock'] 中随机选择 1-3 个
}
```

### 搜索过滤

当提供 `search` 参数时，会过滤 `name` 或 `description` 包含关键词的数据。

### 分页逻辑

- 每页数据独立生成，不跨页重复
- 总条数等于当前页实际返回的条数

---

## 🔧 工作原理

### API 与 Mock 分离架构

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

### 文件职责

| 文件 | 职责 |
|------|------|
| [`src/api/test.js`](#相关文件) | 纯 API 接口定义，只负责 HTTP 调用 |
| [`src/mock/handlers/test.js`](#相关文件) | Mock 数据生成和拦截 |
| [`src/config/mockConfig.js`](#相关文件) | Mock白名单配置 |

---

## 🚀 快速开始

### 1. 启用 Mock 模式

确保 `.env.mock` 或 `.env.development` 中：

```env
VITE_MOCK_MODE=true
```

### 2. 启动开发服务器

```bash
# 使用 Mock 环境
npm run dev:mock

# 或使用开发环境
cd packages/main-app
npm run dev
```

### 3. 访问测试页面

访问 `http://localhost:8080/mock-test` 查看测试 API 的实际效果。

---

## 📊 测试页面功能

测试页面提供了完整的 UI 界面来验证测试 API：

- ✅ **查询表单**：页码、每页条数、搜索关键词
- ✅ **数据表格**：展示所有字段（ID、名称、描述、状态、标签、创建时间）
- ✅ **分页组件**：支持切换页码和每页条数
- ✅ **实时搜索**：输入关键词即时过滤数据

---

## ⚠️ 注意事项

### 1. 响应数据结构

由于 `request` 拦截器已经自动解包了 `res.data`，所以：

```javascript
// ❌ 错误写法
const result = await API.test.getTestList()
testListData.value = result.data?.items

// ✅ 正确写法
const result = await API.test.getTestList()
testListData.value = result.items  // 直接访问 items
```

### 2. Mock 模式开关

- **开发环境**：可以通过 `VITE_MOCK_MODE` 控制
- **生产环境**：必须设置为 `false`，否则会抛出错误

### 3. 数据重置

Mock 数据是临时生成的，刷新页面后会重新生成，不会持久化保存。

---

## 🔗 相关文件

- [`src/api/test.js`](https://github.com/your-org/artisan-base-frontend/blob/main/packages/main-app/src/api/test.js) - 纯 API 接口定义
- [`src/mock/handlers/test.js`](https://github.com/your-org/artisan-base-frontend/blob/main/packages/main-app/src/mock/handlers/test.js) - Mock 数据生成和拦截
- [`src/config/mockConfig.js`](https://github.com/your-org/artisan-base-frontend/blob/main/packages/main-app/src/config/mockConfig.js) - Mock白名单配置
- [`src/utils/request.js`](https://github.com/your-org/artisan-base-frontend/blob/main/packages/main-app/src/utils/request.js) - HTTP 请求工具
- [`src/utils/mockEngine.js`](https://github.com/your-org/artisan-base-frontend/blob/main/packages/main-app/src/utils/mockEngine.js) - Mock 引擎

---

## 📖 相关文档

- [Mock 接口测试页面](/guide/mock-test-page) - 测试页面使用指南
- [Mock 系统架构](/api/README#mock-系统) - Mock 系统整体设计
- [HTTP 请求工具](/api/README#request) - request 使用说明
