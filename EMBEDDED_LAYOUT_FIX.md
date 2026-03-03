# 嵌入式布局切换不生效问题修复

## 问题描述

嵌入式布局 (EmbeddedLayout) 在切换时不能正确响应 `layoutOptions` 的配置，导致无法动态控制 Header、Sidebar 和 Footer 的显示。

## 问题原因

### 1. **模板结构不完整**
EmbeddedLayout.vue 组件的模板结构过于简单，缺少必要的条件渲染逻辑:

```vue
<!-- 修复前 -->
<div class="embedded-layout">
  <div class="embedded-header">
    <!-- 固定显示 header -->
  </div>
  <div class="embedded-content">
    <slot />
  </div>
  <div v-if="layoutOptions.showFooter" class="embedded-footer">
    <Footer />
  </div>
</div>
```

**问题**:
- ❌ Header 固定显示，没有条件渲染
- ❌ 缺少 Sidebar 支持
- ❌ 没有使用 Flexbox 双层布局结构

### 2. **样式结构不支持动态布局**
修复前的样式是简单的纵向排列:
```scss
.embedded-layout {
  display: flex;
  flex-direction: column; // 只能纵向排列
}
```

这种结构无法支持 Sidebar + Main 的横向布局。

## 修复方案

### 1. 重构模板结构

采用与预览组件一致的 **Flexbox 双层布局** 结构:

```vue
<template>
  <div class="embedded-layout">
    <div class="embedded-container">
      <!-- Sider 可选显示 -->
      <div v-if="layoutOptions.showSidebar" class="embedded-sidebar">
        <div class="embedded-menu-item active">应用管理</div>
        <div class="embedded-menu-item">系统设置</div>
      </div>
      
      <!-- 主区域 -->
      <div class="embedded-main">
        <!-- Header 可选显示 -->
        <div v-if="layoutOptions.showHeader" class="embedded-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>嵌入式布局</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <!-- Content -->
        <div class="embedded-content">
          <slot />
        </div>
        
        <!-- Footer 可选显示 -->
        <div v-if="layoutOptions.showFooter" class="embedded-footer">
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. 完善样式系统

#### 外层容器 (横向 Flexbox)
```scss
.embedded-container {
  display: flex;
  height: 100%;
}
```

#### Sidebar
```scss
.embedded-sidebar {
  width: 200px;
  background: #304156;
  display: flex;
  flex-direction: column;
}
```

#### Main 区域 (纵向 Flexbox)
```scss
.embedded-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

#### Header
```scss
.embedded-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
```

### 3. 菜单项样式

```scss
.embedded-menu-item {
  color: #bfcbd9;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.embedded-menu-item:hover {
  background: #263445;
}

.embedded-menu-item.active {
  color: #409eff;
  background: #263445;
}
```

## 技术架构

### Flexbox 双层布局

**第一层：横向布局**
```
┌─────────────┬──────────────────┐
│   Sidebar   │                  │
│   (200px)   │     Main         │
│             │    (flex: 1)     │
└─────────────┴──────────────────┘
```

**第二层：纵向布局 (Main 内部)**
```
┌──────────────────────────────┐
│           Header             │ ← 60px
├──────────────────────────────┤
│                              │
│          Content             │ ← flex: 1
│                              │
├──────────────────────────────┤
│          Footer              │ ← auto
└──────────────────────────────┘
```

### 条件渲染逻辑

所有区域都通过 `v-if` 指令根据 `layoutOptions` 控制显示:

```javascript
// layoutManager.js
layoutOptions.value = {
  showHeader: true,    // 控制 header 显示
  showSidebar: true,   // 控制 sidebar 显示
  showFooter: false,   // 控制 footer 显示
  keepAlive: false     // 控制组件缓存
}
```

## 修复效果对比

### 修复前

```
┌──────────────────────────────┐
│  Header (固定显示)            │
├──────────────────────────────┤
│                              │
│  Content                     │
│                              │
├──────────────────────────────┤
│  Footer (条件显示)            │
└──────────────────────────────┘
```

**问题**:
- ❌ 不支持 Sidebar
- ❌ Header 无法隐藏

### 修复后

```
┌─────┬────────────────────────┐
│Side │  Header (条件显示)      │
│ bar ├────────────────────────┤
│     │                        │
│     │  Content               │
│     │                        │
│     ├────────────────────────┤
│     │  Footer (条件显示)      │
└─────┴────────────────────────┘
```

**优势**:
- ✅ 支持 Sidebar 可配置显示
- ✅ Header 可配置显示
- ✅ Footer 可配置显示
- ✅ 完整的 Flexbox 布局支持

## 文件变更统计

| 修改项 | 修改前 | 修改后 | 增加行数 |
|--------|--------|--------|----------|
| 模板代码 | 17 行 | 38 行 | +21 行 |
| 样式代码 | 34 行 | 72 行 | +38 行 |
| **总计** | **51 行** | **110 行** | **+59 行** |

## 测试场景

### 场景 1: 默认配置 (showHeader=true, showSidebar=true)
```
1. 访问配置了 embedded布局的应用
2. ✅ 显示 Sidebar (左侧菜单)
3. ✅ 显示 Header (顶部面包屑)
4. ✅ 显示 Content (内容区域)
5. ❌ 不显示 Footer (默认关闭)
```

### 场景 2: 隐藏 Header (showHeader=false)
```
1. 修改配置 showHeader=false
2. ✅ Header 被隐藏
3. ✅ Sidebar 正常显示
4. ✅ Content 自动扩展占满空间
```

### 场景 3: 隐藏 Sidebar (showSidebar=false)
```
1. 修改配置 showSidebar=false
2. ✅ Sidebar 被隐藏
3. ✅ Main 区域占满整个宽度
4. ✅ Header 正常显示
```

### 场景 4: 只显示一个 (showHeader=true, showSidebar=false)
```
1. 修改配置 showHeader=true, showSidebar=false
2. ✅ Header 显示
3. ✅ Sidebar 隐藏
4. ✅ 符合嵌入式布局要求 (至少显示一个)
```

## 验证清单

- [x] 模板结构完整，支持 Header/Sidebar/Footer 条件渲染
- [x] 样式系统完善，使用 Flexbox 双层布局
- [x] Sidebar 样式美观 (深色背景、hover 效果、active 状态)
- [x] Header 高度固定 60px，对齐方式正确
- [x] Content 区域 flex: 1，自动填充剩余空间
- [x] Footer 条件渲染，margin-top: auto 确保底部对齐
- [x] 响应 layoutManager.layoutOptions 变化
- [x] 与 DefaultLayout 保持一致的布局结构

## 相关文件

- `/packages/main-app/src/components/layout/EmbeddedLayout.vue` - 嵌入式布局组件
- `/packages/main-app/src/core/layoutManager.js` - 布局管理器
- `/packages/main-app/src/App.vue` - 根布局选择器
- `/packages/main-app/src/components/layout/DefaultLayout.vue` - 默认布局参考

## 经验总结

### 教训
1. **组件化要遵循统一规范**: 所有布局组件都应该使用相同的 Flexbox 双层结构
2. **条件渲染要完整**: 所有可配置的区域都应该添加 `v-if` 指令
3. **样式要独立**: 每个布局组件都应该有自己完整的 scoped styles

### 最佳实践
1. **布局结构一致性**: 所有布局组件都采用 `.container > .sidebar + .main` 结构
2. **条件反射式开发**: 看到 layoutOptions 就要想到需要添加对应的 v-if
3. **视觉对齐**: Header 高度、Sidebar 宽度等尺寸要与 DefaultLayout 保持一致

## 后续优化建议

1. **考虑路由集成**: Sidebar 菜单项可以绑定真实的路由链接
2. **支持自定义菜单**: 可以通过 props 传入菜单配置
3. **响应式支持**: 在小屏幕上可以考虑自动隐藏 Sidebar
