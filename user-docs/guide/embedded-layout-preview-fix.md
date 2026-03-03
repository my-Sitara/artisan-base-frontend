# 嵌入式布局预览修复说明

## 问题描述

嵌入式布局（EmbeddedLayout）的预览结构与默认布局存在同样的问题：Header 错误地占满整个宽度，而实际上应该是 Sider 在左侧占满整个高度。

## 解决方案

### 1. 修改 HTML 结构

**文件**: `/packages/main-app/src/views/AppManagement.vue`

#### 嵌入式布局预览结构

**修改前**:
```vue
<div class="embedded-layout">
  <div class="preview-header">
    <div class="preview-breadcrumb">首页 / 应用</div>
    <div class="preview-user">用户</div>
  </div>
  <div class="preview-body">
    <div class="preview-sidebar">
      <div class="preview-menu-item">首页</div>
      <div class="preview-menu-item active">应用管理</div>
    </div>
    <div class="preview-content">
      <!-- 内容区域 -->
    </div>
  </div>
  <div class="preview-footer">
    <!-- Footer -->
  </div>
</div>
```

**修改后**:
```vue
<div class="embedded-layout">
  <div class="preview-container">
    <!-- Sider 可选显示 -->
    <div class="preview-sidebar" v-if="layoutOptions.showSidebar">
      <div class="preview-menu-item active">应用管理</div>
      <div class="preview-menu-item">系统设置</div>
    </div>
    
    <!-- 主区域 -->
    <div class="preview-main">
      <!-- Header 可选显示 -->
      <div class="preview-header" v-if="layoutOptions.showHeader">
        <div class="preview-breadcrumb">首页 / 嵌入式布局</div>
      </div>
      
      <!-- 内容区域 -->
      <div class="preview-content">
        <div class="preview-content-area">
          <div class="preview-content-block">嵌入式内容区域</div>
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

### 2. 关键改进点

#### a. 使用 Flexbox 容器
```vue
<div class="preview-container">
  <!-- Sider 和 Main 横向排列 -->
</div>
```

#### b. Sider 条件渲染
```vue
<div class="preview-sidebar" v-if="layoutOptions.showSidebar">
  <!-- 菜单项 -->
</div>
```

#### c. Header 条件渲染
```vue
<div class="preview-header" v-if="layoutOptions.showHeader">
  <!-- 面包屑 -->
</div>
```

#### d. Footer 条件渲染
```vue
<div class="preview-footer" v-if="layoutOptions.showFooter">
  <!-- Footer 内容 -->
</div>
```

### 3. CSS 样式

```scss
.embedded-layout {
  height: 400px;  // 从 300px 增加到 400px，更好的视觉效果
}

.embedded-layout .preview-sidebar {
  width: 200px;
  background: #304156;
  display: flex;
  flex-direction: column;  // 菜单项垂直排列
}

.embedded-layout .preview-main {
  flex: 1;  // 占据剩余空间
  display: flex;
  flex-direction: column;  // Header、Content、Footer 垂直排列
  overflow: hidden;
}
```

## 布局结构对比

### 修改前（错误）

```
.embedded-layout
├── .preview-header (占满顶部) ❌
└── .preview-body
    ├── .preview-sidebar
    └── .preview-content
```

### 修改后（正确）

```
.embedded-layout
└── .preview-container (flex 横向布局)
    ├── .preview-sidebar (左侧，占满高度) ✅
    │   └── 菜单项
    └── .preview-main (右侧主区域)
        ├── .preview-header (顶部，条件显示) ✅
        ├── .preview-content (中间)
        └── .preview-footer (底部，条件显示) ✅
```

## 与 DefaultLayout 预览的对比

### 相似之处
- 都使用 `.preview-container` 作为外层 Flexbox 容器
- Sider 都在左侧占满整个高度
- Main 区域都使用纵向 Flexbox 布局
- Header 都在右侧顶部

### 不同之处
| 特性 | DefaultLayout | EmbeddedLayout |
|------|---------------|----------------|
| **Sider 显示** | 固定显示 | ✅ 条件显示 (`v-if="layoutOptions.showSidebar"`) |
| **Header 显示** | 固定显示 | ✅ 条件显示 (`v-if="layoutOptions.showHeader"`) |
| **Footer 显示** | 固定显示 | ✅ 条件显示 (`v-if="layoutOptions.showFooter"`) |
| **Logo** | 包含Logo | ❌ 无 Logo，只有菜单项 |
| **用户信息** | 包含用户下拉菜单 | ❌ 只有面包屑导航 |
| **高度** | 400px | 400px |

## UI 效果

### 完整显示的嵌入式布局
```
┌─────────┬──────────────────────┐
│ 菜单    │ 面包屑导航           │ ← Header
├─────────┼──────────────────────┤
│ 菜单    │                      │
│ 菜单    │    内容区域           │ ← Content
│         │                      │
│         ├──────────────────────┤
│         │      Footer          │ ← Footer (条件显示)
└─────────┴──────────────────────┘
     ↑
Sider 占满整个左侧高度
```

### 隐藏 Sidebar 的嵌入式布局
```
┌────────────────────────────────┐
│ 面包屑导航                     │ ← Header
├────────────────────────────────┤
│                                │
│    内容区域                     │ ← Content
│                                │
└────────────────────────────────┘
```

### 隐藏 Header 的嵌入式布局
```
┌─────────┬──────────────────────┐
│ 菜单    │                      │
│ 菜单    │    内容区域           │ ← Content
│ 菜单    │                      │
└─────────┴──────────────────────┘
```

## 技术实现要点

### 1. 响应式配置支持
所有区域都支持根据 `layoutOptions` 动态显示/隐藏：
- `showHeader`: 控制 Header 显示
- `showSidebar`: 控制 Sider 显示
- `showFooter`: 控制 Footer 显示

### 2. Flexbox 双层布局
**外层（横向）**:
```scss
.preview-container {
  display: flex;
  height: 100%;
}
```

**内层（纵向）**:
```scss
.preview-main {
  display: flex;
  flex-direction: column;
  flex: 1;
}
```

### 3. 高度分配
- Header: `height: 60px` (固定)
- Footer: `height: 50px` (固定)
- Content: `flex: 1` (占据剩余空间)
- Sider: 自动占满容器高度

## 相关文件

### 修改的文件
1. `/packages/main-app/src/views/AppManagement.vue`
   - 修改嵌入式布局预览的 HTML 结构（第 332-352 行）
   - 添加条件渲染指令 `v-if`
   - 新增嵌入式布局专用样式

### 参考的实际组件
- `/packages/main-app/src/components/layout/EmbeddedLayout.vue`
  - 实际的嵌入式布局组件结构
  - 支持通过 `layoutOptions.showFooter` 控制 Footer 显示

## 测试场景

### 场景 1: 查看完整的嵌入式布局预览
1. 打开应用管理界面
2. 编辑一个使用嵌入式布局的应用
3. 确保所有布局选项都开启
4. 点击"预览"按钮
5. **预期结果**: 
   - Sider 在左侧占满高度
   - Header 在右侧顶部
   - Content 在中间
   - Footer 在底部

### 场景 2: 测试 Sidebar 隐藏
1. 在应用编辑界面关闭"显示侧边栏"
2. 查看预览
3. **预期结果**: 
   - Sider 不显示
   - Header 和 Content 占满整个宽度

### 场景 3: 测试 Header 隐藏
1. 在应用编辑界面关闭"显示头部"
2. 查看预览
3. **预期结果**: 
   - Header 不显示
   - Content 紧贴上边界

### 场景 4: 测试 Footer 显示
1. 在应用编辑界面开启"显示底部"
2. 查看预览
3. **预期结果**: 
   - Footer 显示在底部
   - Content 区域自动缩小以适应 Footer 高度

## 注意事项

1. **条件渲染**: 使用 `v-if` 而非 `v-show`，未选中的元素不会渲染到 DOM
2. **至少显示一个**: 嵌入式布局要求 Header 或 Sidebar 至少显示一个
3. **样式作用域**: 使用 `.embedded-layout .preview-sidebar` 而非单独的 `.preview-sidebar`，避免影响其他布局预览
4. **高度一致性**: 与 DefaultLayout 预览保持相同的总高度（400px）

## 更新日志

- **v1.0.4**: 嵌入式布局预览修复
  - 修正 Sider 和 Header 的位置关系
  - Sider 改为垂直方向占满整个高度
  - Header 移到右侧顶部区域
  - 添加条件渲染支持（Header、Sidebar、Footer）
  - 优化 Flexbox 布局结构
  - 增加预览高度至 400px

## 总结

通过重构 HTML 结构和 CSS 样式，成功修复了嵌入式布局预览的结构问题：

✅ **Sider** 正确地从顶部延伸到底部（如果显示）  
✅ **Header** 正确地只显示在右侧顶部区域（如果显示）  
✅ **Footer** 正确地显示在底部（如果开启）  
✅ **条件渲染** 支持根据布局配置动态显示/隐藏各区域  
✅ **布局结构** 与实际 EmbeddedLayout 组件保持一致  

现在嵌入式布局的预览已经能够准确反映实际的布局效果，帮助用户更好地理解配置变更带来的视觉变化！
