# 后端集成指南

## 📖 概述

本文档介绍如何将前端布局管理系统与后端进行集成，实现数据的持久化存储和跨设备同步。

**当前状态：**
- ✅ 前端 API 封装已完成
- ✅ 环境变量配置已就绪
- ✅ 降级策略已实现（API 失败自动使用 localStorage）
- ⚠️ 后端接口需要自行实现

---

## 🎯 快速开始

### 开发环境（Mock 模式）

在开发环境中，系统默认使用 **localStorage 模式**，无需后端即可正常工作。

**验证方式：**

```bash
# 1. 检查环境变量
cat packages/main-app/.env.development | grep VITE_USE_LAYOUT_API

# 应该看到：VITE_USE_LAYOUT_API=false

# 2. 启动开发服务器
cd packages/main-app
npm run dev

# 3. 访问 http://localhost:8080
# - 进入"多应用同屏展示"页面
# - 添加应用并调整布局
# - 刷新页面，布局应该保持
```

---

## 🔧 后端 API 实现方案

### 核心接口说明

多应用同屏页只需要以下三个简单的后端接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/multi-app-layout/save` | POST | 保存布局数据 |
| `/api/multi-app-layout/load` | GET | 加载布局数据 |
| `/api/multi-app-layout/delete` | DELETE | 删除布局数据（可选） |

所有接口都需要 JWT Token 认证。

**注意：** 如果你已经有后端服务，只需要实现这三个接口即可。如果是纯前端项目，可以直接使用 **Mock 模式**（开发环境默认就是）。

---

### 快速实现方案（推荐）⭐

适合前端开发者快速搭建一个简单的后端服务。

**步骤 1：安装依赖**

```bash
mkdir layout-server
cd layout-server
npm init -y
npm install express cors body-parser jsonwebtoken
```

**步骤 2：创建服务器**

创建 `server.js`：

```javascript
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3000

// 中间件
app.use(cors())
app.use(bodyParser.json())

// 内存存储（重启后数据会丢失，仅用于测试）
let layouts = new Map()

// JWT 密钥（生产环境应从环境变量读取）
const JWT_SECRET = 'your-secret-key-change-in-production'

// 验证 Token 中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' })
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// 保存布局
app.post('/api/multi-app-layout/save', authenticateToken, (req, res) => {
  const layoutData = req.body
  const userId = req.user.id
  
  const saved = {
    ...layoutData,
    userId,
    savedAt: new Date().toISOString()
  }
  
  layouts.set(userId, saved)
  console.log('[API] Layout saved for user:', userId)
  res.json({ success: true, data: saved })
})

// 加载布局
app.get('/api/multi-app-layout/load', authenticateToken, (req, res) => {
  const userId = req.user.id
  const layout = layouts.get(userId)
  console.log('[API] Layout loaded for user:', userId)
  res.json({ success: true, data: layout || null })
})

// 删除布局（可选）
app.delete('/api/multi-app-layout/delete', authenticateToken, (req, res) => {
  const userId = req.user.id
  layouts.delete(userId)
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`)
})
```

**步骤 3：运行服务器**

```bash
node server.js
```

**关键点：**
- ✅ JWT Token 认证
- ✅ 按 userId 存储布局数据
- ✅ 支持 save/load/delete 三个接口
- ✅ 包含 CORS 跨域支持

**提示：**
- 💡 这个简单的 Node.js 后端仅用于演示，生产环境应该使用数据库持久化
- 💡 如果你已经有后端服务，只需要按照上面的接口定义实现即可
- 💡 **纯前端项目可以直接使用 Mock 模式**（开发环境默认）

---

## 🔐 认证集成

### JWT Token 认证

**前端配置：**

```javascript
// packages/main-app/src/utils/request.js
const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器：注入 Token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('user-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

export default request
```

**后端验证：** 所有后端方案都已包含 JWT 验证示例。

---

## 📊 数据格式定义

### 请求格式

#### 保存布局

```http
POST /api/multi-app-layout/save
Content-Type: application/json
Authorization: Bearer {token}

{
  "layoutMode": "grid-free",
  "splitWidths": ["50%", "50%"],
  "activeTabId": "panel-1",
  "panels": [
    {
      "panelId": "panel-1",
      "appId": "app-vue3-demo",
      "name": "Vue3 Demo",
      "type": "vue3",
      "subPath": "",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 8,
      "order": 1
    }
  ]
}
```

**字段说明：**
- `layoutMode`: 布局模式（grid-free / tabs / split）
- `splitWidths`: 分屏布局的宽度配置
- `activeTabId`: 标签页布局中激活的标签 ID
- `panels`: 应用面板列表
  - `panelId`: 面板唯一标识
  - `appId`: 应用 ID
  - `name`: 应用名称
  - `type`: 应用类型
  - `subPath`: 子路径参数
  - `x, y, w, h`: 网格布局中的位置和大小
  - `order`: 排序权重

#### 加载布局

```http
GET /api/multi-app-layout/load
Authorization: Bearer {token}

// 响应示例：
{
  "success": true,
  "data": {
    "layoutMode": "grid-free",
    "splitWidths": ["50%", "50%"],
    "activeTabId": "panel-1",
    "panels": [...]
  }
}
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    "layoutMode": "grid-free",
    "splitWidths": ["50%", "50%"],
    "activeTabId": "panel-1",
    "panels": [...],
    "savedAt": "2025-03-25T10:00:00.000Z"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 🌐 生产环境部署

### 环境变量配置

```bash
# .env.production
VITE_USE_LAYOUT_API=true
VITE_LAYOUT_API_URL=https://api.yourdomain.com/api
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Authorization $http_authorization;
    }

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚠️ 注意事项

### 1. CORS 配置

确保后端允许跨域请求：

```javascript
// Node.js 示例
app.use(cors({
  origin: ['http://localhost:8080', 'https://yourdomain.com'],
  credentials: true
}))
```

### 2. Token 安全

- ✅ 使用 HTTPS 传输
- ✅ Token 设置合理的过期时间
- ✅ 定期更新 JWT_SECRET
- ✅ 不在日志中打印敏感信息

### 3. 数据持久化

生产环境建议使用数据库存储：

```sql
-- MySQL 示例
CREATE TABLE user_layouts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  layout_data JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
```

---

## 🔗 相关资源

- [布局管理指南](./layout-management.md) - 前端使用说明
- [Request 系统使用指南](./sub-app-request-guide.md) - Request 系统详细说明

---

**最后更新：** 2025-03-25  
**维护者：** Artisan Team
