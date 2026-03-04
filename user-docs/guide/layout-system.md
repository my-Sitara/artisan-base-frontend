# 布局系统

## 快速开始

本页面提供布局系统的快速参考，完整的布局系统指南请参阅 [布局系统完整指南](./layout-system-complete-guide.md)。

## 布局类型速览

| 布局类型 | 描述 | 使用场景 |
|---------|------|---------|
| **default** | 默认布局（含头部和侧边栏） | 后台管理、企业应用 |
| **full** | 全屏布局（无头部侧边栏） | 数据大屏、全屏展示 |
| **embedded** | 嵌入式布局（通常只显示头部） | 嵌入第三方应用 |
| **blank** | 空白布局（无任何导航） | 登录页、欢迎页 |

## 快速配置

### 微应用配置方式

```javascript
// packages/main-app/src/mock/microApps.js 或后端 API 返回数据
{
  id: 'vue3-sub-app',
  layoutType: 'default',  // 布局类型
  layoutOptions: {
    showHeader: true,     // 显示头部
    showSidebar: true,    // 显示侧边栏
    keepAlive: false      // 不启用缓存
  }
}
```

### 动态切换布局

```javascript
import { layoutManager } from '@/core/layoutManager'

// 切换布局类型
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false
})

// 更新选项
layoutManager.updateOptions({
  showFooter: true
})

// 重置为默认
layoutManager.reset()
```

## 布局选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showHeader | boolean | true | 是否显示头部 |
| showSidebar | boolean | true | 是否显示侧边栏 |
| showFooter | boolean | false | 是否显示底部 |
| keepAlive | boolean | false | 是否缓存页面 |

## 布局约束

不同布局类型有不同的强制约束（由 `config/layoutConfig.js` 定义）：

| 布局类型 | 约束说明 |
|---------|---------|
| **default** | 无强制约束，推荐显示头部和侧边栏 |
| **full** | 强制隐藏头部和侧边栏 |
| **embedded** | 强制隐藏侧边栏（`showSidebar` 始终为 `false`） |
| **blank** | 强制隐藏头部和侧边栏 |

> 约束由 `normalizeLayoutConfig()` 自动应用，配置中与约束冲突的选项会被覆盖。

## 预览功能

在应用管理界面（`/app-management/loading`）中可以实时预览布局效果：

1. 进入应用管理 > 子应用加载管理
2. 点击应用的"配置"按钮
3. 点击"预览"按钮查看效果
4. 修改配置后预览会实时更新

## 常见问题

### Q: 如何选择合适的布局类型？

根据使用场景选择：
- 需要完整导航 → `default`
- 全屏展示 → `full`
- 嵌入应用 → `embedded`
- 简单页面 → `blank`

### Q: keepAlive 如何使用？

在 `layoutOptions` 中设置 `keepAlive: true`，适用于需要频繁切换的应用，可保留组件状态。

### Q: 布局切换不生效怎么办？

检查以下几点：
1. 确认 `microApps` 配置中的 `layoutType` 正确（只能是 `default`/`full`/`embedded`/`blank` 之一）
2. 确认 `layoutOptions` 符合布局类型的约束规则
3. 必要时手动调用 `layoutManager.setLayout()`

## 深入学习

详细的使用指南、最佳实践和故障排除请查看：

📖 **[布局系统完整指南](./layout-system-complete-guide.md)**

包含：
- 每种布局类型的详细介绍
- 完整的配置示例
- 布局约束和最佳实践
- 故障排除指南
- 可视化预览说明

