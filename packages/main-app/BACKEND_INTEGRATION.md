# 多应用布局后端集成指南

## 快速开始

### 当前状态

✅ **已完成：**
- 前端 API 封装层 (`src/api/layout.js`)
- 环境变量配置 (`.env.*`)
- 降级策略（API 失败自动使用 localStorage）
- 数据格式定义

⚠️ **待完成：**
- 后端 API 接口实现
- 用户认证集成
- 数据库持久化

### 临时解决方案（开发环境）

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

## 后端 API 实现

### 方案一：Node.js + Express（快速原型）

**安装依赖：**
```bash
npm install express cors body-parser
```

**创建服务器 (`server.js`)：**
```javascript
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json())

// 内存存储（重启后数据会丢失）
let layouts = new Map()

// 保存布局
app.post('/api/multi-app-layout/save', (req, res) => {
  const layoutData = req.body
  const userId = 'demo-user' // TODO: 从 session/token 获取
  
  const saved = {
    ...layoutData,
    id: `layout-${Date.now()}`,
    userId,
    savedAt: new Date().toISOString()
  }
  
  layouts.set(userId, saved)
  
  console.log('[API] Layout saved:', saved)
  res.json({ success: true, data: saved })
})

// 加载布局
app.get('/api/multi-app-layout/load', (req, res) => {
  const userId = 'demo-user' // TODO: 从 session/token 获取
  const layout = layouts.get(userId)
  
  console.log('[API] Layout loaded:', layout)
  res.json({ success: true, data: layout || null })
})

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`)
})
```

**运行服务器：**
```bash
node server.js
```

**配置前端代理（可选）：**
修改 `packages/main-app/vite.config.js`：
```javascript
export default defineConfig({
  // ... 其他配置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**切换到 API 模式：**
修改 `.env.development`：
```bash
VITE_USE_LAYOUT_API=true
```

### 方案二：Java + Spring Boot（企业级）

**Controller 示例：**
```java
@RestController
@RequestMapping("/api/multi-app-layout")
@CrossOrigin(origins = "*")
public class LayoutController {
    
    @Autowired
    private LayoutService layoutService;
    
    @PostMapping("/save")
    public ResponseEntity<?> saveLayout(@RequestBody LayoutDTO dto) {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Layout saved = layoutService.save(dto, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "id", saved.getId(),
                    "layoutMode", saved.getLayoutMode(),
                    "panels", saved.getPanels(),
                    "savedAt", saved.getSavedAt()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/load")
    public ResponseEntity<?> loadLayout() {
        try {
            String userId = SecurityUtils.getCurrentUserId();
            Optional<Layout> optional = layoutService.findByUserId(userId);
            
            if (optional.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", null
                ));
            }
            
            Layout layout = optional.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                    "id", layout.getId(),
                    "layoutMode", layout.getLayoutMode(),
                    "splitWidths", layout.getSplitWidths(),
                    "activeTabId", layout.getActiveTabId(),
                    "panels", layout.getPanels(),
                    "savedAt", layout.getSavedAt()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
```

**Entity 示例：**
```java
@Entity
@Table(name = "user_layout")
public class Layout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String layoutMode; // grid-free, tabs, split
    
    @Column(columnDefinition = "json")
    private List<Map<String, Object>> panels;
    
    @Column(columnDefinition = "json")
    private List<String> splitWidths;
    
    private String activeTabId;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}
```

### 方案三：Python + FastAPI（现代化）

**创建 API (`main.py`)：**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

app = FastAPI()

# 内存存储
layouts = {}

class LayoutData(BaseModel):
    layoutMode: str
    splitWidths: List[str]
    activeTabId: str
    panels: List[Dict[str, Any]]

@app.post("/api/multi-app-layout/save")
async def save_layout(data: LayoutData):
    user_id = "demo-user"  # TODO: 从认证获取
    
    saved_data = {
        **data.dict(),
        "id": f"layout-{int(time.time())}",
        "userId": user_id,
        "savedAt": datetime.now().isoformat()
    }
    
    layouts[user_id] = saved_data
    return {"success": True, "data": saved_data}

@app.get("/api/multi-app-layout/load")
async def load_layout():
    user_id = "demo-user"  # TODO: 从认证获取
    layout = layouts.get(user_id)
    return {"success": True, "data": layout}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

## 测试验证

### 使用 Postman/cURL 测试

**测试保存接口：**
```bash
curl -X POST http://localhost:3000/api/multi-app-layout/save \
  -H "Content-Type: application/json" \
  -d '{
    "layoutMode": "grid-free",
    "splitWidths": ["50%", "50%"],
    "activeTabId": "panel-1",
    "panels": [
      {
        "appId": "vue3-sub-app",
        "name": "Vue3 子应用",
        "type": "vue3",
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 8,
        "order": 1
      }
    ]
  }'
```

**测试加载接口：**
```bash
curl http://localhost:3000/api/multi-app-layout/load
```

### 浏览器测试

1. **打开开发者工具** → Network 标签
2. **保存布局**：查看是否有 POST 请求到 `/api/multi-app-layout/save`
3. **刷新页面**：查看是否有 GET 请求到 `/api/multi-app-layout/load`
4. **检查响应**：确保返回正确的 JSON 格式

**预期日志：**
```
[LayoutAPI] Saving to API: /api/multi-app-layout/save
[LayoutAPI] Saved successfully: {success: true, data: {...}}

或

[LayoutAPI] Loading from localStorage (mock mode)
```

## 故障排查

### 问题：404 错误

**原因：** 后端 API 未实现或路径错误

**解决方案：**
1. 确认后端服务已启动
2. 检查 API 路径是否正确
3. 查看浏览器控制台的网络请求详情

### 问题：CORS 错误

**原因：** 跨域配置缺失

**解决方案：**
```javascript
// Express
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}))

// Spring Boot
@CrossOrigin(origins = "http://localhost:8080")

// FastAPI
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 问题：数据格式不匹配

**原因：** 前后端字段名不一致

**解决方案：**
- 参考本文档的"数据字段说明"部分
- 使用 TypeScript 类型定义或 Java DTO 确保一致性

## 生产部署

### 环境变量配置

**开发环境：**
```bash
VITE_USE_LAYOUT_API=false  # 使用 localStorage
```

**测试环境：**
```bash
VITE_USE_LAYOUT_API=true   # 使用后端 API
VITE_API_BASE_URL=http://test-api.example.com
```

**生产环境：**
```bash
VITE_USE_LAYOUT_API=true
VITE_API_BASE_URL=/api     # 使用 Nginx 反向代理
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 前端静态文件
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 下一步

1. ✅ 本地开发（使用 localStorage）
2. 🔄 实现后端 API（选择上述任一方案）
3. 🔄 集成用户认证
4. 🔄 数据库持久化
5. 🔄 添加版本控制
6. 🔄 实现布局历史

## 联系支持

如有问题，请查阅：
- [API 文档](./README.md)
- [源码](./layout.js)
- [环境变量配置](../../../.env.*)
