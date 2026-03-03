# 布局预览组件样式修复总结

## 问题描述

嵌入式布局和默认布局的预览组件样式错位，导致预览显示异常。

## 问题原因

在将布局预览逻辑从 AppLoading.vue 提取到独立组件时，遗漏了必要的 CSS 样式定义:

1. **缺失的样式**: `.preview-container`, `.preview-sidebar`, `.preview-main` 等通用样式类
2. **原有实现**: 这些样式原本在 AppLoading.vue中定义了约 190 行
3. **组件化后**: 每个独立预览组件需要自己的 scoped styles

## 修复方案

### 1. DefaultLayoutPreview.vue 样式增强

**修改前**: 仅 3 个样式规则 (17 行)
```scss
.default-layout { height: 400px; }
.default-layout .preview-sidebar { ... }
.default-layout .preview-main { ... }
```

**修改后**: 完整的样式体系 (85 行)
- ✅ `.preview-container` - Flexbox 容器
- ✅ `.preview-sidebar` - 侧边栏样式
- ✅ `.preview-logo` - Logo 样式
- ✅ `.preview-menu-item` - 菜单项样式 (含 hover 和 active 状态)
- ✅ `.preview-header` - 头部导航样式
- ✅ `.preview-breadcrumb` - 面包屑样式
- ✅ `.preview-user` - 用户信息样式
- ✅ `.preview-content` - 内容区域样式
- ✅ `.preview-content-area` - 内容块容器
- ✅ `.preview-content-block` - 内容块
- ✅ `.preview-footer` - 底部样式
- ✅ `.preview-footer-content` - 底部内容

### 2. EmbeddedLayoutPreview.vue 样式增强

**修改前**: 仅 3 个样式规则 (17 行)

**修改后**: 完整的样式体系 (74 行)
- 与 DefaultLayoutPreview 相同的完整样式
- 区别：不需要 `.preview-logo` 和 `.preview-user` (嵌入式布局更简洁)

## 技术要点

### 1. Scoped Styles 使用
所有预览组件都使用 `scoped` 属性，确保样式只作用于当前组件:
```vue
<style lang="scss" scoped>
/* 样式只影响当前组件 */
</style>
```

### 2. Flexbox 双层布局结构

**外层容器 (横向)**:
```scss
.preview-container {
  display: flex;
  height: 100%;
}
```
- Sidebar 和 Main 区域横向排列

**内层容器 (纵向)**:
```scss
.preview-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```
- Header、Content、Footer 纵向排列

### 3. 高度分配
- **Container**: `height: 100%` (400px)
- **Sidebar**: 固定宽度 200px,自动高度
- **Main**: `flex: 1` (占据剩余宽度)
- **Header**: `height: 60px` (固定)
- **Footer**: `height: 50px` (固定)
- **Content**: `flex: 1` (占据剩余高度)

## 修复效果

### Default Layout 预览
```
┌─────────┬──────────────────────┐
│ Logo    │ 面包屑      用户信息  │ ← Header (60px)
├─────────┼──────────────────────┤
│ 菜单项  │                      │
│ 菜单项  │    内容区域           │ ← Content (flex: 1)
│ 菜单项  │                      │
├─────────┴──────────────────────┤
│          Footer                │ ← Footer (50px)
└────────────────────────────────┘
     ↑
Sidebar (200px)
```

### Embedded Layout 预览
```
┌─────────┬──────────────────────┐
│ 菜单项  │ 面包屑导航           │ ← Header (60px)
├─────────┼──────────────────────┤
│ 菜单项  │                      │
│         │    内容区域           │ ← Content (flex: 1)
│         │                      │
└─────────┴──────────────────────┘
     ↑
Sidebar (200px)
```

## 文件变更统计

| 文件 | 修改前 | 修改后 | 增加行数 |
|------|--------|--------|----------|
| DefaultLayoutPreview.vue | 17 行 | 85 行 | +68 行 |
| EmbeddedLayoutPreview.vue | 17 行 | 74 行 | +57 行 |
| **总计** | **34 行** | **159 行** | **+125 行** |

## 验证清单

- [x] DefaultLayoutPreview 样式完整
- [x] EmbeddedLayoutPreview 样式完整
- [x] FullLayoutPreview 样式正常
- [x] BlankLayoutPreview 样式正常
- [x] 所有预览组件都能正确显示
- [x] 条件渲染正常工作 (v-if="layoutOptions.showXxx")
- [x] 样式作用域隔离 (scoped)

## 经验总结

### 教训
1. **组件化时要彻底**: 提取组件不仅要提取模板和逻辑，还要提取完整的样式
2. **Scoped Styles 需要完整定义**: 使用 scoped 时不能依赖外部样式
3. **测试很重要**: 应该在修改后立即测试所有布局类型的预览效果

### 最佳实践
1. **样式完整性检查**: 组件化后检查是否所有使用的 class 都有定义
2. **视觉回归测试**: 对比组件化前后的视觉效果是否一致
3. **文档同步更新**: 记录样式修复过程和技术要点

## 相关文件

- `/packages/main-app/src/components/layout/DefaultLayoutPreview.vue`
- `/packages/main-app/src/components/layout/EmbeddedLayoutPreview.vue`
- `/packages/main-app/src/components/layout/FullLayoutPreview.vue`
- `/packages/main-app/src/components/layout/BlankLayoutPreview.vue`
- `/packages/main-app/src/components/layout/LayoutPreview.js`
