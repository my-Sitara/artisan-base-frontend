# 默认布局预览动态配置功能说明

## 功能概述

默认布局（DefaultLayout）的预览现在支持根据 `layoutOptions` 配置动态显示/隐藏各个区域，包括：
- **Header（头部）**：通过 `showHeader` 控制
- **Sidebar（侧边栏）**：通过 `showSidebar` 控制
- **Footer（底部）**：通过 `showFooter` 控制

这使得预览能够实时反映用户的配置选择，提供更直观的视觉反馈。

## 实现方式

### 1. HTML 结构修改

**文件**: `/packages/main-app/src/views/AppManagement.vue`

#### 修改后的默认布局预览结构

```vue
<div v-if="previewLayoutType === 'default'" class="layout-preview default-layout">
  <div class="preview-container">
    <!-- Sider 可选显示 -->
    <div class="preview-sidebar" v-if="layoutOptions.showSidebar">
      <div class="preview-logo">Artisan 微前端</div>
      <div class="preview-menu-item active">应用管理</div>
      <div class="preview-menu-item">系统设置</div>
    </div>
    
    <!-- 主区域 -->
    <div class="preview-main">
      <!-- Header 可选显示 -->
      <div class="preview-header" v-if="layoutOptions.showHeader">
        <div class="preview-breadcrumb">首页 / 应用</div>
        <div class="preview-user">用户</div>
      </div>
      
      <!-- 内容区域 -->
      <div class="preview-content">
        <div class="preview-content-area">
          <div class="preview-content-block">内容区域</div>
          <div class="preview-content-block">主要内容</div>
        </div>
      </div>
      
      <!-- Footer 可选显示 -->
      <div class="preview-footer" v-if="layoutOptions.showFooter">
        <div class="preview-footer-content">© 2026 Artisan Base Frontend. All rights reserved.</div>
      </div>
    </div>
  </div>
</div>
```

### 2. 关键特性

#### a. 条件渲染指令
所有区域都使用 `v-if` 指令进行条件渲染：

```vue
<!-- Sidebar -->
<div class="preview-sidebar" v-if="layoutOptions.showSidebar">
  <!-- ... -->
</div>

<!-- Header -->
<div class="preview-header" v-if="layoutOptions.showHeader">
  <!-- ... -->
</div>

<!-- Footer -->
<div class="preview-footer" v-if="layoutOptions.showFooter">
  <!-- ... -->
</div>
```

#### b. 响应式绑定
`layoutOptions` 是响应式数据，当用户在应用编辑界面切换开关时，预览会自动更新：

```javascript
const layoutOptions = ref({
  showHeader: true,
  showSidebar: true,
  showFooter: false,
  keepAlive: false
})

// 监听变化并同步到表单
watch(layoutOptions, (newVal) => {
  if (editForm.value) {
    editForm.value.layoutOptions = {
      showHeader: newVal.showHeader,
      showSidebar: newVal.showSidebar,
      showFooter: newVal.showFooter,
      keepAlive: newVal.keepAlive,
    }
  }
}, { deep: true })
```

### 3. CSS 样式

```scss
.default-layout {
  height: 400px;
}

.default-layout .preview-sidebar {
  width: 200px;
  background: #304156;
  display: flex;
  flex-direction: column;
}

.default-layout .preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

## 预览效果展示

### 场景 1: 完整显示（默认配置）

```
┌─────────┬──────────────────────┐
│ Logo    │ 面包屑      用户信息  │
├─────────┼──────────────────────┤
│ 菜单项  │                      │
│ 菜单项  │    内容区域           │
│ 菜单项  │                      │
├─────────┴──────────────────────┤
│          Footer                │
└────────────────────────────────┘
```

**配置**:
- `showHeader: true` ✅
- `showSidebar: true` ✅
- `showFooter: true` ✅

### 场景 2: 隐藏 Sidebar

```
┌────────────────────────────────┐
│ 面包屑导航           用户信息   │
├────────────────────────────────┤
│                                │
│    内容区域                     │
│                                │
└────────────────────────────────┘
```

**配置**:
- `showHeader: true` ✅
- `showSidebar: false` ❌
- `showFooter: false` ❌

### 场景 3: 隐藏 Header

```
┌─────────┬──────────────────────┐
│ Logo    │                      │
├─────────┤    内容区域           │
│ 菜单项  │                      │
│ 菜单项  │                      │
└─────────┴──────────────────────┘
```

**配置**:
- `showHeader: false` ❌
- `showSidebar: true` ✅
- `showFooter: false` ❌

### 场景 4: 显示 Footer

```
┌─────────┬──────────────────────┐
│ Logo    │ 面包屑      用户信息  │
├─────────┼──────────────────────┤
│ 菜单项  │                      │
│ 菜单项  │    内容区域           │
│         ├──────────────────────┤
│         │      Footer          │
└─────────┴──────────────────────┘
```

**配置**:
- `showHeader: true` ✅
- `showSidebar: true` ✅
- `showFooter: true` ✅

### 场景 5: 只显示 Content

```
┌────────────────────────────────┐
│                                │
│    内容区域                     │
│                                │
└────────────────────────────────┘
```

**配置**:
- `showHeader: false` ❌
- `showSidebar: false` ❌
- `showFooter: false` ❌

## 与其他布局预览的对比

| 布局类型 | Sidebar | Header | Footer | 特点 |
|---------|---------|--------|--------|------|
| **DefaultLayout** | ✅ 条件显示 | ✅ 条件显示 | ✅ 条件显示 | 包含Logo，完整功能 |
| **EmbeddedLayout** | ✅ 条件显示 | ✅ 条件显示 | ✅ 条件显示 | 无 Logo，简洁导航 |
| **FullLayout** | ❌ 强制隐藏 | ❌ 强制隐藏 | ❌ 强制隐藏 | 全屏内容 |
| **BlankLayout** | ❌ 强制隐藏 | ❌ 强制隐藏 | ❌ 强制隐藏 | 空白页面 |

## 技术实现要点

### 1. Flexbox 双层布局

**外层（横向）**:
```scss
.preview-container {
  display: flex;
  height: 100%;
}
```
- Sidebar 和 Main 区域横向排列

**内层（纵向）**:
```scss
.preview-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```
- Header、Content、Footer 纵向排列

### 2. 高度分配

- **Container**: `height: 100%` (继承父容器，400px)
- **Sidebar**: 自动占满容器高度
- **Main**: `flex: 1` (占据剩余宽度)
- **Header**: `height: 60px` (固定)
- **Footer**: `height: 50px` (固定)
- **Content**: `flex: 1` (占据剩余高度)

### 3. 条件渲染 vs 显示控制

使用 `v-if` 而非 `v-show`:
- ✅ **优点**: 未选中的元素不会渲染到 DOM，减少不必要的节点
- ✅ **性能**: 初始加载更快，DOM 更简洁
- ✅ **准确性**: 真实反映实际布局结构

### 4. 响应式同步

```javascript
// 用户修改配置 → layoutOptions 变化 → 预览自动更新
watch(layoutOptions, (newVal) => {
  if (editForm.value) {
    editForm.value.layoutOptions = newVal
  }
}, { deep: true })
```

## 使用方法

### 步骤 1: 打开应用管理
进入应用管理界面

### 步骤 2: 编辑应用
点击任意应用的"编辑"按钮

### 步骤 3: 调整布局选项
在"布局配置"部分切换开关：
- ☑ 显示头部
- ☑ 显示侧边栏
- ☐ 显示底部

### 步骤 4: 查看实时预览
点击"预览"按钮，预览图会根据你的配置实时更新

## 相关文件

### 修改的文件
1. `/packages/main-app/src/views/AppManagement.vue`
   - 修改默认布局预览的 HTML 结构（第 299-330 行）
   - 添加 `v-if` 条件渲染指令
   - 添加注释说明各区域功能

### 参考的实际组件
- `/packages/main-app/src/components/layout/DefaultLayout.vue`
  - 实际的默认布局组件
  - 使用相同的条件渲染逻辑

## 测试场景

### 测试 1: 切换 Sidebar 显示
1. 打开应用编辑对话框
2. 关闭"显示侧边栏"开关
3. 点击"预览"
4. **预期**: Sidebar 不显示，Header 和 Content 占满整个宽度

### 测试 2: 切换 Header 显示
1. 打开应用编辑对话框
2. 关闭"显示头部"开关
3. 点击"预览"
4. **预期**: Header 不显示，Sidebar 和 Content 直接顶到上边界

### 测试 3: 开启 Footer
1. 打开应用编辑对话框
2. 开启"显示底部"开关
3. 点击"预览"
4. **预期**: Footer 显示在底部，Content 区域自动缩小

### 测试 4: 全部隐藏
1. 关闭所有显示开关
2. 点击"预览"
3. **预期**: 只显示 Content 区域

### 测试 5: 全部显示
1. 开启所有显示开关
2. 点击"预览"
3. **预期**: 完整显示 Sidebar、Header、Content、Footer

## 注意事项

1. **约束条件**: 
   - DefaultLayout 没有强制约束，所有选项都可自由选择
   - FullLayout 和 BlankLayout 强制禁用所有选项

2. **样式作用域**: 
   - 使用 `.default-layout .preview-sidebar` 而非单独的 `.preview-sidebar`
   - 避免影响其他布局类型的预览

3. **响应式更新**:
   - 预览会立即响应 `layoutOptions` 的变化
   - 无需刷新或重新打开预览对话框

4. **与 EmbeddedLayout 的一致性**:
   - 两种布局都使用相同的双层 Flexbox 结构
   - 都支持条件渲染
   - DefaultLayout 包含Logo，EmbeddedLayout 没有

## 更新日志

- **v1.0.5**: 默认布局预览动态配置
  - 为 DefaultLayout 预览添加 `v-if` 条件渲染
  - 支持根据 `layoutOptions` 动态显示/隐藏 Sidebar、Header、Footer
  - 优化预览结构与实际 DefaultLayout 组件保持一致
  - 提供实时的视觉反馈，帮助用户理解配置效果

## 总结

通过为默认布局预览添加条件渲染支持，实现了：

✅ **实时反馈**: 用户修改配置后立即看到效果  
✅ **一致性**: 预览结构与 DefaultLayout 实际组件完全一致  
✅ **灵活性**: 支持所有可能的配置组合  
✅ **直观性**: 帮助用户理解不同配置对布局的影响  

现在所有布局类型（Default、Embedded、Full、Blank）的预览都能够准确反映配置变更，为用户提供了一致的可视化配置体验！🎉
