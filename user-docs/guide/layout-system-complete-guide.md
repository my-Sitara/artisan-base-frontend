# 布局系统完整指南

## 概述

Artisan Base Frontend 提供了一套完整的布局编排系统，支持 4 种不同的布局类型，可以满足各种场景的需求。

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
- `showSidebar` 由 `layoutConfig.js` 约束为 `false`，无法通过配置开启侧边栏
- 适合只需要顶部导航的轻量级场景

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
// packages/main-app/src/mock/microApps.js 或后端 API 返回数据
const apps = [
  {
    id: 'vue3-sub-app',
    name: 'Vue3 子应用',
    entry: 'http://localhost:7080',
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

约束规则定义在 `config/layoutConfig.js` 中，由 `normalizeLayoutConfig()` 自动应用：

| 布局类型 | 约束条件 |
|---------|---------|
| default | 无强制约束，所有选项都可自由选择 |
| full | 强制隐藏 header、sidebar |
| embedded | 强制隐藏 sidebar（`showSidebar` 始终为 `false`） |
| blank | 强制隐藏 header、sidebar |

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

1. **不要为 embedded 布局设置 showSidebar 为 true**（约束会强制覆盖为 false）
   ```javascript
   // ❌ 配置无效，showSidebar 会被约束覆盖为 false
   {
     layoutType: 'embedded',
     layoutOptions: {
       showHeader: true,
       showSidebar: true  // 不会生效
     }
   }
   
   // ✅ 正确：embedded 布局默认显示头部，不显示侧边栏
   {
     layoutType: 'embedded',
     layoutOptions: {
       showHeader: true
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

**可能原因**：
- 微应用配置中的 `layoutType` 值不在支持的 4 种类型中
- `layoutOptions` 配置被约束自动覆盖

**解决方案**：
```javascript
import { getMicroApp } from '@/config/microApps'
import { layoutManager } from '@/core/layoutManager'

// 检查微应用配置
const appConfig = getMicroApp(appId)
console.log('Layout config:', appConfig.layoutType, appConfig.layoutOptions)

// 手动设置布局
layoutManager.setLayout(appConfig.layoutType, appConfig.layoutOptions)
```

### 问题 2: Embedded 布局的 showSidebar 无法设为 true

**原因**：`config/layoutConfig.js` 中 embedded 布局的约束固定 `showSidebar: false`，`normalizeLayoutConfig()` 会自动覆盖配置中的值。

**解决方案**：如需侧边栏，请改用 `default` 布局类型。

### 问题 3: keepAlive 不生效

**可能原因**：
- 布局类型不兼容 keepAlive（full 和 blank 的 `compatibleOptions` 不含 keepAlive）
- 组件没有设置 `name` 选项

**解决方案**：
```javascript
// keepAlive 仅在 default 和 embedded 布局中兼容
layoutOptions: {
  keepAlive: true
}

// 组件中必须设置 name
export default {
  name: 'MyComponent'
}
```

## 相关文档

- [布局系统（快速参考）](./layout-system.md)
- [应用管理](./app-management.md)
