# 测试 API 文档更新总结

## 📋 更新内容

已根据当前代码完成了测试 API 的 user-docs 文档整理工作。

## ✅ 已创建/更新的文件

### 1. **新增文件**

#### `/user-docs/api/test.md` (315 行)
完整的测试 API 详细文档，包含：

- 📖 接口列表（GET/POST/DELETE）
- 💻 使用示例（命名导入和统一导入）
- 🎯 Mock 数据特征说明
- 🔧 工作原理（API/Mock分离架构）
- 🚀 快速开始指南
- 📊 测试页面功能介绍
- ⚠️ 注意事项（响应数据结构、Mock 模式开关等）
- 🔗 相关文件链接

### 2. **更新文件**

#### `/user-docs/api/README.md`
在 API 总结中添加了测试 API 章节：

- ✅ 添加测试 API 到目录索引
- ✅ 快速参考：导入方式、接口列表、参数说明
- ✅ 响应结构示例
- ✅ Mock 数据特征
- ✅ 使用场景说明
- ✅ 注意事项（重点：数据解包问题）
- ✅ 相关文档链接

#### `/user-docs/.vitepress/config.js`
更新导航配置：

- ✅ 在 API 侧边栏添加"测试 API"链接

## 📚 文档结构

### API 总结中的位置

```
API 参考总结
├── MicroAppManager
├── Bridge
├── LayoutManager
├── 配置 API
└── 测试 API ⭐ (新增)
    ├── GET /api/test/list
    ├── POST /api/test
    ├── DELETE /api/test/:id
    ├── Mock 数据特征
    └── 注意事项
```

### 详细文档目录

```
/user-docs/api/test.md
├── 接口列表
│   ├── GET /api/test/list
│   ├── POST /api/test
│   └── DELETE /api/test/:id
├── 使用示例
│   ├── 方式一：命名导入
│   └── 方式二：统一导入
├── Mock 数据特征
│   ├── 数据生成规则
│   ├── 搜索过滤
│   └── 分页逻辑
├── 工作原理
│   └── API 与 Mock 分离架构图
├── 快速开始
│   ├── 启用 Mock 模式
│   ├── 启动开发服务器
│   └── 访问测试页面
├── 测试页面功能
├── 注意事项
│   ├── 响应数据结构
│   ├── Mock 模式开关
│   └── 数据重置
└── 相关文件
```

## 🎯 核心特性记录

### 1. API/Mock 分离架构

文档清晰说明了架构设计：

```
前端调用 → API 模块 (test.js) → mockEngine → Mock Handler (handlers/test.js)
```

**职责分离：**
- `src/api/test.js` - 纯 API 接口定义
- `src/mock/handlers/test.js` - Mock 数据生成和拦截
- `src/config/mockConfig.js` - Mock白名单配置

### 2. 响应数据结构

重点记录了 request 拦截器的解包行为：

```javascript
// ❌ 错误写法
const result = await API.test.getTestList()
testListData.value = result.data?.items

// ✅ 正确写法
const result = await API.test.getTestList()
testListData.value = result.items  // 直接访问
```

### 3. Mock 数据特征

详细描述了 Mock 数据的生成规则：

- **状态随机分配**: `active` | `pending` | `inactive`
- **标签组合**: 从 `['测试', '示例', 'Mock']` 中随机选择 1-3 个
- **时间戳**: 最近 90 天内的随机时间
- **不持久化**: 每次请求动态生成

## 📖 使用指南

### 快速参考

开发者可以在 [`/api/README`](./api/README.md) 中找到快速参考。

### 详细文档

完整的使用说明在 [`/api/test.md`](./api/test.md)。

### 测试页面

实际效果演示在 `http://localhost:8080/mock-test`。

## 🔗 相关链接

- [测试 API 详细文档](./api/test.md)
- [API 总结](./api/README.md)
- [Mock 系统架构](./api/README#mock-系统)
- [HTTP 请求工具](./api/README#request)

## 📝 文档规范

本次文档遵循以下规范：

1. **术语准确**：使用"多应用实例"而非"多实例"
2. **示例完整**：提供导入、调用、响应的完整代码
3. **结构清晰**：使用表格、代码块、列表等多种格式
4. **注意事项突出**：使用 ⚠️ 标记重要提示
5. **链接完整**：提供所有相关文件的 GitHub 链接

## ✨ 文档亮点

1. **架构图示**：使用 ASCII 图清晰展示 API/Mock分离架构
2. **对比示例**：错误 vs 正确写法的直观对比
3. **场景说明**：明确列出适用场景
4. **调试指南**：提供控制台测试方法
5. **环境配置**：详细说明 Mock 模式启用方式

## 🎓 学习路径

建议的学习顺序：

1. **快速开始** → 阅读 [API 总结](./api/README.md#测试-api)
2. **深入理解** → 查看 [详细文档](./api/test.md)
3. **实践操作** → 访问 [测试页面](http://localhost:8080/mock-test)
4. **原理探究** → 研究 [源代码](../packages/main-app/src/api/test.js)

---

**最后更新**: 2026-03-26  
**维护者**: Artisan Team
