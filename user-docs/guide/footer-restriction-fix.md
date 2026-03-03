# Footer 显示限制修复说明

## 问题描述

在全屏布局（FullLayout）和空白布局（BlankLayout）中，Footer 选项不应该被用户选择，因为这两种布局类型设计为简洁布局，不支持显示 Footer。

## 解决方案

### 1. 禁用 Footer 选项

**文件**: `/packages/main-app/src/views/AppManagement.vue`

#### 修改 `isOptionDisabled` 函数

```javascript
function isOptionDisabled(option) {
  if (!editForm.value?.layoutType) return false
  
  // 根据布局类型确定哪些选项应该被禁用
  const constrainedOptions = {
    'default': [],  // 默认布局无强制选项
    'full': ['showHeader', 'showSidebar', 'showFooter'],   // 全屏布局强制不显示头部、侧边栏和底部
    'embedded': [],               // 嵌入式布局无强制选项，但有逻辑约束
    'blank': ['showHeader', 'showSidebar', 'showFooter']  // 空白布局强制不显示头部、侧边栏和底部
  }
  
  return constrainedOptions[editForm.value.layoutType]?.includes(option) || false
}
```

**变更说明**:
- `full` 布局：添加 `'showFooter'` 到禁用列表
- `blank` 布局：添加 `'showFooter'` 到禁用列表

#### 修改 `getOptionTitle` 函数

```javascript
function getOptionTitle(option) {
  if (!editForm.value?.layoutType) return ''
  
  const titles = {
    'showHeader': {
      'full': '全屏布局不支持显示头部',
      'blank': '空白布局不支持显示头部',
      'embedded': getEmbeddedLayoutWarning('showHeader'),
      'default': ''
    },
    'showSidebar': {
      'full': '全屏布局不支持显示侧边栏',
      'blank': '空白布局不支持显示侧边栏',
      'embedded': getEmbeddedLayoutWarning('showSidebar'),
      'default': ''
    },
    'showFooter': {
      'full': '全屏布局不支持显示底部',
      'blank': '空白布局不支持显示底部',
      'embedded': '',
      'default': ''
    },
    'keepAlive': {
      'full': '全屏布局不建议使用 KeepAlive',
      'blank': '空白布局不建议使用 KeepAlive',
      'embedded': '嵌入式布局不建议使用 KeepAlive',
      'default': ''
    },
  }
  
  return titles[option]?.[editForm.value.layoutType] || ''
}
```

**变更说明**:
- 新增 `showFooter` 的提示信息配置
- 为 `full` 和 `blank` 布局提供明确的禁用提示

### 2. 更新布局切换时的默认值

**文件**: `/packages/main-app/src/views/AppManagement.vue`

#### 修改 `handleLayoutTypeChange` 函数

```javascript
function handleLayoutTypeChange() {
  switch (editForm.value.layoutType) {
    case 'default':
      // 默认布局：显示头部和侧边栏
      layoutOptions.value = {
        showHeader: true,
        showSidebar: true,
        showFooter: false,  // 新增
        keepAlive: false
      }
      break
    case 'full':
      // 全屏布局：不显示头部、侧边栏和底部
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        showFooter: false,  // 新增
        keepAlive: false
      }
      break
    case 'embedded':
      // 嵌入式布局：默认显示头部和侧边栏（至少显示一个）
      layoutOptions.value = {
        showHeader: layoutOptions.value.showHeader ?? true,
        showSidebar: layoutOptions.value.showSidebar ?? true,
        showFooter: false,  // 新增
        keepAlive: false
      }
      break
    case 'blank':
      // 空白布局：不显示头部、侧边栏和底部
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        showFooter: false,  // 新增
        keepAlive: false
      }
      break;
  }
}
```

**变更说明**:
- 所有布局类型切换时都明确设置 `showFooter` 的值
- `full` 和 `blank` 布局强制设置为 `false`

### 3. 更新应用编辑初始化

**文件**: `/packages/main-app/src/views/AppManagement.vue`

#### 修改 `showEditApp` 函数

```javascript
function showEditApp(app) {
  editForm.value = {
    id: app.id,
    name: app.name,
    type: app.type,
    entry: app.entry,
    version: app.version,
    activeRule: app.activeRule || '',
    preload: app.preload || false,
    layoutType: app.layoutType || 'default',
    layoutOptions: {
      showHeader: app.layoutOptions?.showHeader ?? true,
      showSidebar: app.layoutOptions?.showSidebar ?? true,
      showFooter: app.layoutOptions?.showFooter ?? false,  // 新增
      keepAlive: app.layoutOptions?.keepAlive ?? false
    },
    routerBase: app.props?.routerBase || ''
  }
  
  layoutOptions.value = { ...editForm.value.layoutOptions }
  showEditDialog.value = true
}
```

**变更说明**:
- 初始化时包含 `showFooter` 选项
- 默认值为 `false`

## 布局行为对比

| 布局类型 | Header | Sidebar | Footer | KeepAlive | 说明 |
|---------|--------|---------|--------|-----------|------|
| **DefaultLayout** | ✅ 可选 | ✅ 可选 | ✅ 可选 | ✅ 可选 | 标准布局，所有选项可用 |
| **FullLayout** | ❌ 禁用 | ❌ 禁用 | ❌ 禁用 | ⚠️ 不推荐 | 简洁全屏布局，无任何装饰 |
| **EmbeddedLayout** | ✅ 可选* | ✅ 可选* | ✅ 可选 | ⚠️ 不推荐 | *至少显示 Header 或 Sidebar 之一 |
| **BlankLayout** | ❌ 禁用 | ❌ 禁用 | ❌ 禁用 | ⚠️ 不推荐 | 极简空白布局，用于登录页等 |

## UI 效果

### 应用管理界面 - 默认布局
```
┌─────────────────────────────────┐
│ 布局选项                        │
├─────────────────────────────────┤
│ ☑ 显示头部                      │
│ ☑ 显示侧边栏                    │
│ ☐ 显示底部                      │  ← 可选
│ ☐ KeepAlive                     │
└─────────────────────────────────┘
```

### 应用管理界面 - 全屏布局
```
┌─────────────────────────────────┐
│ 布局选项                        │
├─────────────────────────────────┤
│ ☒ 显示头部    [固定]            │  ← 禁用
│ ☒ 显示侧边栏  [固定]            │  ← 禁用
│ ☒ 显示底部    [固定]            │  ← 禁用
│ ☐ KeepAlive   [固定]            │  ← 禁用
└─────────────────────────────────┘
```

### 应用管理界面 - 空白布局
```
┌─────────────────────────────────┐
│ 布局选项                        │
├─────────────────────────────────┤
│ ☒ 显示头部    [固定]            │  ← 禁用
│ ☒ 显示侧边栏  [固定]            │  ← 禁用
│ ☒ 显示底部    [固定]            │  ← 禁用
│ ☐ KeepAlive   [固定]            │  ← 禁用
└─────────────────────────────────┘
```

## 技术实现要点

### 1. 响应式控制
- 使用 `v-if` 条件渲染 Footer 组件
- 通过 `layoutManager.layoutOptions.value.showFooter` 控制显示状态

### 2. 禁用逻辑
- 在 `isOptionDisabled` 函数中定义布局约束规则
- 使用配置对象方式，易于维护和扩展

### 3. 用户体验
- 禁用选项显示灰色标签"固定"
- 鼠标悬停显示禁用原因提示
- 切换布局类型时自动应用默认配置

## 相关文件

### 已修改文件
1. `/packages/main-app/src/views/AppManagement.vue`
   - 修改 `isOptionDisabled` 函数
   - 修改 `getOptionTitle` 函数
   - 修改 `handleLayoutTypeChange` 函数
   - 修改 `showEditApp` 函数

### 相关组件
1. `/packages/main-app/src/components/layout/FullLayout.vue` - 无需修改（本身不支持 Footer）
2. `/packages/main-app/src/components/layout/BlankLayout.vue` - 无需修改（本身不支持 Footer）
3. `/packages/main-app/src/components/layout/DefaultLayout.vue` - 已支持配置
4. `/packages/main-app/src/components/layout/EmbeddedLayout.vue` - 已支持配置

## 测试场景

### 场景 1: 切换到全屏布局
1. 打开应用管理界面
2. 编辑任意应用
3. 将布局类型切换为"全屏布局"
4. **预期结果**: 
   - "显示底部"选项被禁用
   - 显示灰色"固定"标签
   - 鼠标悬停提示"全屏布局不支持显示底部"

### 场景 2: 切换到空白布局
1. 打开应用管理界面
2. 编辑任意应用
3. 将布局类型切换为"空白布局"
4. **预期结果**: 
   - "显示底部"选项被禁用
   - 显示灰色"固定"标签
   - 鼠标悬停提示"空白布局不支持显示底部"

### 场景 3: 切换到默认布局
1. 打开应用管理界面
2. 编辑任意应用
3. 将布局类型切换为"默认布局"
4. **预期结果**: 
   - "显示底部"选项可自由选择
   - 无禁用提示

### 场景 4: 切换到嵌入式布局
1. 打开应用管理界面
2. 编辑任意应用
3. 将布局类型切换为"嵌入式布局"
4. **预期结果**: 
   - "显示底部"选项可自由选择
   - 无禁用提示

## 注意事项

1. **向后兼容**: 已有的应用配置不会受影响，只是在新配置时受到约束
2. **代码一致性**: 与 Header 和 Sidebar 的禁用逻辑保持一致
3. **可维护性**: 使用配置对象方式，便于后续调整

## 更新日志

- **v1.0.2**: Footer 显示限制修复
  - 全屏布局和空白布局禁用 Footer 选项
  - 添加明确的禁用提示信息
  - 更新布局切换时的默认值处理
  - 确保所有布局类型的行为一致性

## 总结

通过在 `isOptionDisabled` 函数中添加对 `showFooter` 的禁用检查，以及更新相关的配置处理逻辑，成功实现了：

✅ **全屏布局**和**空白布局**无法选择显示 Footer  
✅ 提供清晰的禁用提示信息  
✅ 保持与其他布局选项（Header、Sidebar）的一致性  
✅ 不影响默认布局和嵌入式布局的 Footer 功能  

这样既保证了布局设计的合理性，又提供了良好的用户体验。
