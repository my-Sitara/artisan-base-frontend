# 布局系统完整指南

## 概述

Artisan Base Frontend 提供了一套完整的布局编排系统，支持 5 种不同的布局类型，可以满足各种场景的需求。

## 布局类型

### 1. Default Layout (默认布局)

**特点**:
- 包含完整的头部导航栏和侧边栏
- 适用于大多数应用场景
- 支持动态显示/隐藏各个区域

**配置示例**:
```javascript
{
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    showFooter: false,
    keepAlive: false
  }
}
```

**使用场景**: 后台管理系统、企业应用等需要完整导航的场景

### 2. Full Layout (全屏布局)

**特点**:
- 无头部和侧边栏
- 最大化内容展示区域
- 强制隐藏所有导航元素

**配置示例**:
```javascript
{
  layoutType: 'full',
  layoutOptions: {
    showHeader: false,
    showSidebar: false,
    showFooter: false,
    keepAlive: false
  }
}
```

**使用场景**: 数据大屏、全屏展示、沉浸式体验等场景

### 3. Embedded Layout (嵌入式布局)

**特点**:
- 轻量级布局
- 至少显示头部或侧边栏之一
- 支持动态配置各个区域

**配置示例**:
```javascript
{
  layoutType: 'embedded',
  layoutOptions: {
    showHeader: true,
    showSidebar: false,
    showFooter: false,
    keepAlive: false
  }
}
```

**约束条件**:
- 必须至少显示 `showHeader` 或 `showSidebar` 之一
- 不能同时隐藏头部和侧边栏

**使用场景**: 嵌入第三方应用、轻量化展示等场景

### 4. Blank Layout (空白布局)

**特点**:
- 最简化布局
- 无任何导航装饰
- 只显示内容区域

**配置示例**:
```javascript
{
  layoutType: 'blank',
  layoutOptions: {
    showHeader: false,
    showSidebar: false,
    showFooter: false,
    keepAlive: false
  }
}
```

**使用场景**: 登录页、欢迎页、极简页面等场景

## 布局选项说明

### showHeader

控制是否显示头部导航栏

- **类型**: Boolean
- **默认值**: true
- **可选值**: true | false

### showSidebar

控制是否显示侧边栏菜单

- **类型**: Boolean
- **默认值**: true
- **可选值**: true | false

### showFooter

控制是否显示底部信息栏

- **类型**: Boolean
- **默认值**: false
- **可选值**: true | false

### keepAlive

控制是否启用组件缓存

- **类型**: Boolean
- **默认值**: false
- **可选值**: true | false
- **注意**: 某些布局类型（如 full、blank）不建议使用 KeepAlive

## 使用方法

### 在微应用配置中设置

```javascript
// packages/main-app/src/config/microApps.js
export const microApps = [
  {
    id: 'vue3-sub-app',
    name: 'Vue3 子应用',
    entry: '//localhost:7080',
    activeRule: '/vue3',
    type: 'vue3',
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      keepAlive: false
    }
  }
]
```

### 通过 LayoutManager 动态切换

```javascript
import { layoutManager } from '@/core/layoutManager'

// 切换布局类型
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false,
  showFooter: false
})

// 单独修改某个选项
layoutManager.updateOptions({
  showFooter: true
})

// 重置为默认布局
layoutManager.reset()
```

### 在路由中使用

```javascript
// packages/main-app/src/router/index.js
export const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      layout: 'default',
      title: '仪表盘'
    }
  },
  {
    path: '/fullscreen',
    component: () => import('@/views/FullScreen.vue'),
    meta: {
      layout: 'full',
      title: '全屏展示'
    }
  }
]
```

## 布局预览功能

在应用管理界面 (`/app-management/loading`) 中，可以实时预览不同布局类型的效果：

1. 进入应用管理 > 子应用加载管理
2. 点击任意应用的"配置"按钮
3. 在"布局类型"下拉框旁边点击"预览"按钮
4. 查看当前布局类型的可视化效果

预览支持动态配置，修改布局选项后会立即反映在预览中。

## 布局约束和最佳实践

### 约束条件

| 布局类型 | 约束条件 |
|---------|---------|
| default | 无强制约束，所有选项都可自由选择 |
| full | 强制隐藏 header、sidebar、footer |
| embedded | 必须至少显示 header 或 sidebar 之一 |
| blank | 强制隐藏 header、sidebar、footer |

### 最佳实践

#### ✅ 推荐做法

1. **根据场景选择合适的布局类型**
   - 后台管理 → default
   - 数据大屏 → full
   - 嵌入应用 → embedded
   - 登录注册 → blank

2. **合理使用 KeepAlive**
   - 需要频繁切换的应用启用 keepAlive
   - 全屏展示类应用不启用 keepAlive

3. **保持布局一致性**
   - 同一应用内尽量使用相同的布局类型
   - 避免频繁切换布局类型造成用户体验割裂

#### ❌ 避免做法

1. **不要在 embedded 布局中同时隐藏 header 和 sidebar**
   ```javascript
   // ❌ 错误
   {
     layoutType: 'embedded',
     layoutOptions: {
       showHeader: false,
       showSidebar: false  // 这会导致没有导航
     }
   }
   
   // ✅ 正确
   {
     layoutType: 'embedded',
     layoutOptions: {
       showHeader: true,
       showSidebar: false  // 至少显示一个
     }
   }
   ```

2. **不要在 full/blank 布局中启用 KeepAlive**
   ```javascript
   // ❌ 不推荐
   {
     layoutType: 'full',
     layoutOptions: {
       keepAlive: true  // 全屏布局不建议缓存
     }
   }
   ```

3. **避免在不需要的情况下使用复杂的布局配置**
   - 简单的展示页面使用 blank 布局即可
   - 不需要为了"统一"而给所有应用都加上 header 和 sidebar

## 故障排除

### 问题 1: 布局切换后没有生效

**可能原因**:
- 微应用配置中的 `layoutType` 与实际使用的布局组件不匹配
- `layoutOptions` 配置被覆盖

**解决方案**:
```javascript
// 检查微应用配置
const appConfig = getMicroApp(appId)
console.log('Layout config:', appConfig.layoutType, appConfig.layoutOptions)

// 手动设置布局
layoutManager.setLayout(appConfig.layoutType, appConfig.layoutOptions)
```

### 问题 2: Embedded 布局预览显示异常

**可能原因**:
- 同时隐藏了 header 和 sidebar

**解决方案**:
确保至少显示其中一个:
```javascript
layoutOptions: {
  showHeader: true,  // 或者
  showSidebar: true  // 至少一个为 true
}
```

### 问题 3: KeepAlive 不生效

**可能原因**:
- 布局类型不支持 KeepAlive
- 组件没有设置 name 选项

**解决方案**:
```javascript
// 确保启用 KeepAlive
layoutOptions: {
  keepAlive: true
}

// 组件中设置 name
export default {
  name: 'MyComponent',
  // ...
}
```

## 相关文档

- [应用管理](./app-management.md) - 应用配置管理
- [默认布局预览动态配置](./default-layout-preview-dynamic.md) - 预览功能详解
- [嵌入式布局 Footer 组件](./embedded-layout-footer.md) - Footer 使用指南
- [布局系统架构](./layout-system.md) - 技术实现细节

## 更新历史

- **v2.0.0** - 布局系统重构
  - 删除冗余代码，优化布局管理器
  - 提取布局预览为独立组件
  - 简化微应用配置
  - 整合布局相关文档
