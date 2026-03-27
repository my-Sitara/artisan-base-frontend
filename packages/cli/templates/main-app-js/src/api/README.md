# 多应用布局管理 API

## 概述

此模块提供多应用同屏页布局数据的持久化功能，采用**分层架构设计**：

- **`@/api/layout`** - 纯 API 调用模块（仅 HTTP 请求，无业务逻辑）
- **`@/composables/useLayout`** - 业务逻辑层（mock/API 模式切换、localStorage 降级、容错策略）

### 架构优势

- ✅ **职责分离**：API 层只负责 HTTP 调用，业务层处理 mock 和降级逻辑
- ✅ **灵活切换**：通过 `USE_MOCK` 环境变量控制模式
- ✅ **数据可靠**：API 失败自动降级到 localStorage
- ✅ **易于测试**：开发时使用 mock，生产使用真实 API

## 文件结构

```
packages/main-app/src/
├── api/
│   └── layout.js          # 布局管理 API（纯 HTTP 调用）
├── composables/
│   └── useLayout.js       # 布局业务逻辑（mock/API 切换、降级策略）
├── views/
│   └── MultiInstancePage.vue  # 多应用同屏页（使用 composable）
└── ..env.*                # 环境配置文件
```

## 环境变量配置

### 开发环境 (`.env.development`)

```bash
# 默认使用 localStorage（mock 模式）
VITE_USE_MOCK=true
```

### Mock 环境 (`.env.mock`)

```bash
# 强制使用 localStorage（用于产品演示、离线开发）
VITE_USE_MOCK=true
```

### 生产环境 (`.env.production`)

```bash
# 强制使用后端 API
VITE_USE_MOCK=false
```

## API 接口规范

### POST /api/multi-app-layout/save

保存布局数据到后端。

**请求体：**
```json
{
  "layoutMode": "grid-free",
  "splitWidths": ["50%", "50%"],
  "activeTabId": "panel-1-xxx",
  "panels": [
    {
      "appId": "vue3-sub-app",
      "name": "Vue3 子应用",
      "type": "vue3",
      "subPath": "/dashboard",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 8,
      "order": 1
    }
  ]
}
```

**成功响应：**
```json
{
  "success": true,
  "data": {
    "id": "layout-123",
    "userId": "user-456",
    "savedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/multi-app-layout/load

从后端加载布局数据。

**成功响应：**
```json
{
  "success": true,
  "data": {
    "layoutMode": "grid-free",
    "splitWidths": ["50%", "50%"],
    "activeTabId": "panel-1-xxx",
    "panels": [...]
  }
}
```

## 降级策略

系统采用多层降级策略确保数据可靠性：

```
API 模式：
1. 优先调用后端 API
2. API 失败 → 保存到 localStorage
3. 网络错误 → 自动降级到 localStorage

加载流程：
1. 优先从后端 API 加载
2. API 失败 → 从 localStorage 恢复
3. 都没有 → 返回空数据
```

## 使用示例

### 推荐使用方式（Composable）

```javascript
// 使用 Composable（推荐 - 包含 mock/API 模式切换、localStorage 降级策略）
import { saveLayout, loadLayout } from '@/composables/useLayout'

// 保存布局
async function saveLayoutData() {
  const data = {
    layoutMode: 'grid-free',
    panels: [...]
  }
  
  try {
    const result = await saveLayout(data)
    console.log('保存成功:', result)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 加载布局
async function loadLayoutData() {
  const data = await loadLayout()
  if (data) {
    // 恢复布局
    console.log('加载的布局:', data)
  }
}
```

### 直接使用 API（不推荐）

如果只需要纯 HTTP 调用（不包含 mock 切换和降级逻辑），可以直接使用 API：

```javascript
// 直接使用 API（仅纯 HTTP 调用，无业务逻辑）
import { saveLayoutAPI, loadLayoutAPI } from '@/api/layout'

// 保存布局
async function saveDirect() {
  const data = { layoutMode: 'grid-free', panels: [...] }
  const result = await saveLayoutAPI(data)
  return result
}

// 加载布局
async function loadDirect() {
  const data = await loadLayoutAPI()
  return data
}
```

## 后端实现要求

### Node.js + Express 示例

```javascript
const express = require('express')
const router = express.Router()

// 内存存储（实际项目应使用数据库）
let layouts = new Map()

// 保存布局
router.post('/multi-app-layout/save', async (req, res) => {
  try {
    const layoutData = req.body
    
    // TODO: 验证用户身份
    const userId = 'current-user-id'
    
    // 保存到数据库
    const saved = {
      ...layoutData,
      id: `layout-${Date.now()}`,
      userId,
      savedAt: new Date().toISOString()
    }
    
    layouts.set(userId, saved)
    
    res.json({
      success: true,
      data: saved
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// 加载布局
router.get('/multi-app-layout/load', async (req, res) => {
  try {
    // TODO: 验证用户身份
    const userId = 'current-user-id'
    
    const layout = layouts.get(userId)
    
    if (!layout) {
      return res.json({
        success: true,
        data: null
      })
    }
    
    res.json({
      success: true,
      data: layout
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

module.exports = router
```

### Java + Spring Boot 示例

```java
@RestController
@RequestMapping("/api/multi-app-layout")
public class LayoutController {
    
    @PostMapping("/save")
    public ResponseEntity<?> saveLayout(@RequestBody LayoutDTO layoutDTO) {
        try {
            // TODO: 获取当前用户 ID
            String userId = getCurrentUserId();
            
            // 保存到数据库
            Layout saved = layoutService.save(layoutDTO, userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/load")
    public ResponseEntity<?> loadLayout() {
        try {
            // TODO: 获取当前用户 ID
            String userId = getCurrentUserId();
            
            // 从数据库加载
            Layout layout = layoutService.findByUserId(userId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", layout != null ? layout : null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
```

## 数据字段说明

### 布局数据对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| layoutMode | string | 是 | 布局模式：`grid-free` / `tabs` / `split` |
| splitWidths | array | 是 | 分屏布局的宽度：`["50%", "50%"]` |
| activeTabId | string | 是 | 标签页布局中激活的标签 ID |
| panels | array | 是 | 应用面板列表 |

### 面板对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appId | string | 是 | 微应用 ID |
| name | string | 是 | 显示名称 |
| type | string | 是 | 应用类型：`vue3` / `vue2` / `iframe` |
| subPath | string | 否 | 子应用内部路径 |
| x | number | 是 | 网格 X 坐标（网格自由布局） |
| y | number | 是 | 网格 Y 坐标（网格自由布局） |
| w | number | 是 | 宽度（占几列） |
| h | number | 是 | 高度（占几行） |
| order | number | 是 | 顺序号（用于排序） |

## 注意事项

1. **数据安全**：生产环境应添加用户认证和权限验证
2. **数据验证**：后端应验证所有输入数据的完整性
3. **并发处理**：考虑多设备同时保存的冲突处理
4. **历史版本**：可考虑保存历史版本供用户回滚
5. **性能优化**：大数据量时可考虑增量更新

## 故障排查

### 问题：保存时总是报错

**检查步骤：**
1. 查看浏览器控制台的网络请求
2. 确认后端 API 是否已实现并运行
3. 检查环境变量配置是否正确
4. 确认 CORS 配置允许跨域

### 问题：加载的数据为空

**可能原因：**
1. 后端没有该用户的布局数据（正常，首次使用）
2. API 地址配置错误
3. 网络请求失败

**解决方案：**
- 检查 Network 面板的 API 响应
- 确认后端返回格式正确
- 使用 localStorage 作为临时方案

## 扩展功能建议

1. **布局模板**：支持保存多个布局模板供用户切换
2. **分享功能**：支持将布局分享给其他用户
3. **导入导出**：支持 JSON 格式的布局导入导出
4. **自动保存**：布局变化时自动保存到后端
5. **撤销重做**：支持布局操作的撤销和重做
