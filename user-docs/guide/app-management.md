# 应用管理功能文档

## 快速开始

应用管理功能用于管理微应用的加载、配置和错误日志，采用父子路由结构。

## 核心特性

✅ **父子路由架构** - 父路由仅用于分组和重定向，无需容器组件  
✅ **侧边栏导航** - 两个子功能直接在侧边栏显示  
✅ **自动重定向** - 访问父路由自动跳转到默认子页面  
✅ **功能独立** - 每个子功能都是独立的页面  

## 路由结构

```javascript
{
  path: '/app-management',
  redirect: '/app-management/loading',  // 自动重定向
  children: [
    {
      path: 'loading',
      component: () => import('@/views/AppLoading.vue')
    },
    {
      path: 'error-logs',
      component: () => import('@/views/ErrorLogs.vue')
    }
  ]
}
```

## 功能说明

### 1. 子应用加载管理 (`/app-management/loading`)

**主要功能**:
- 📋 微应用列表展示
- ⚙️ 应用配置编辑
- 🔄 预加载管理
- 🎨 布局配置与预览
- 📊 状态管理

**访问方式**:
- 点击侧边栏 "应用管理 > 子应用加载管理"
- 直接访问 `/app-management/loading`

### 2. 错误日志 (`/app-management/error-logs`)

**主要功能**:
- 📝 错误日志查看
- 🔍 错误搜索
- 🗑️ 错误日志删除
- 📈 错误统计

**访问方式**:
- 点击侧边栏 "应用管理 > 错误日志"
- 直接访问 `/app-management/error-logs`

## 使用指南

### 从侧边栏访问

```
1. 打开侧边栏
   ↓
2. 点击"应用管理"（展开子菜单）
   ↓
3. 选择:
   ├─ "子应用加载管理" → 进入应用列表页面
   └─ "错误日志" → 进入错误日志页面
```

### 路由行为

| 访问路径 | 行为 | 结果 |
|---------|------|------|
| `/app-management` | 自动重定向 | 跳转到 `/app-management/loading` |
| `/app-management/loading` | 直接访问 | 显示子应用加载管理 |
| `/app-management/error-logs` | 直接访问 | 显示错误日志 |

## 技术架构

### 文件结构

```
src/views/
├── AppLoading.vue      # 子应用加载管理
└── ErrorLogs.vue       # 错误日志

src/components/layout/
└── Sider.vue           # 侧边栏菜单配置

src/router/
└── index.js            # 路由配置
```

### 关键技术点

1. **路由重定向**: 使用 `redirect` 属性实现自动跳转
2. **嵌套路由**: 通过 `children` 配置定义父子关系
3. **菜单激活**: Element Plus 自动匹配路由高亮菜单项

## 最佳实践

### ✅ 推荐做法

- 直接使用路由重定向，不需要容器组件
- 在侧边栏清晰展示所有子功能
- 每个子功能保持独立和内聚

### ❌ 避免做法

- 创建不必要的容器组件
- 增加多余的组件层级
- 在父路由中处理业务逻辑

## 常见问题

### Q: 为什么访问 `/app-management` 会自动跳转？

A: 路由配置中设置了 `redirect: '/app-management/loading'`，Vue Router 会自动处理重定向。

### Q: 如何在两个子功能间切换？

A: 直接点击侧边栏的子菜单项即可，或者使用编程式导航：
```javascript
router.push('/app-management/loading')
router.push('/app-management/error-logs')
```

### Q: 可以添加更多子功能吗？

A: 可以！只需在路由配置的 `children` 数组中添加新的子路由配置。

## 相关文档

- [路由结构详细说明](./app-management-routes.md)
- [侧边栏菜单配置](./app-management-sidebar-menu.md)
- [移除容器页面说明](./app-management-removal.md)

## 更新历史

- **v2.0.4** - 移除 AppManagement.vue 容器页面，优化为纯路由重定向
- **v2.0.3** - 简化容器页面为 3 行代码
- **v2.0.2** - 添加侧边栏子菜单
- **v2.0.1** - 初始版本，采用父子路由结构
