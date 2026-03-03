# Footer 组件使用指南

## 概述

Footer 组件是一个可复用的底部布局组件，提供了统一的页面底部展示区域，包含版权信息和快捷链接。

## 功能特性

- ✅ 统一的版权信息展示
- ✅ 可配置的快捷链接列表
- ✅ 响应式布局支持
- ✅ 与布局系统无缝集成
- ✅ 支持显示/隐藏控制

## 快速开始

### 1. 在布局中使用 Footer 组件

Footer 组件已经集成到以下布局中：

#### DefaultLayout (默认布局)

```vue
<template>
  <div class="default-layout">
    <el-container class="layout-container">
      <Sider v-if="layoutOptions.showSidebar" />
      
      <el-container class="main-container">
        <Header v-if="layoutOptions.showHeader" />
        
        <el-main class="layout-main">
          <slot />
        </el-main>
        
        <Footer v-if="layoutOptions.showFooter" />
      </el-container>
    </el-container>
  </div>
</template>
```

#### EmbeddedLayout (嵌入式布局)

```vue
<template>
  <div class="embedded-layout">
    <div class="embedded-header">
      <!-- 头部内容 -->
    </div>
    <div class="embedded-content">
      <slot />
    </div>
    <!-- 根据配置显示/隐藏 Footer -->
    <div v-if="layoutOptions.showFooter" class="embedded-footer">
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { layoutManager } from '@/core/layoutManager'
import Footer from './Footer.vue'

// 从 layoutManager 获取布局选项
const layoutOptions = computed(() => layoutManager.layoutOptions.value)
</script>
```

### 2. 配置 Footer 显示

#### 通过 layoutManager 控制

```javascript
import { layoutManager } from '@/core/layoutManager'

// 显示底部
layoutManager.setFooterVisible(true)

// 隐藏底部
layoutManager.setFooterVisible(false)

// 更新布局选项
layoutManager.updateOptions({
  showFooter: true
})
```

#### 在子应用配置中使用

```javascript
{
  name: 'vue3-app',
  entry: '//localhost:7101',
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    showFooter: true,  // 启用底部
    keepAlive: false
  }
}
```

### 3. 在应用管理界面配置

在应用管理界面编辑子应用时，可以在"布局配置"部分找到"显示底部"选项：

1. 点击"编辑"按钮打开应用编辑对话框
2. 展开"布局配置"部分
3. 切换"显示底部"开关
4. 保存配置

## 自定义 Footer 内容

### 修改版权信息

编辑 `/packages/main-app/src/components/layout/Footer.vue`：

```vue
<template>
  <el-footer class="layout-footer">
    <div class="footer-content">
      <div class="footer-left">
        <span class="copyright">
          © {{ new Date().getFullYear() }} Your Company. All rights reserved.
        </span>
      </div>
      
      <div class="footer-right">
        <!-- 链接内容 -->
      </div>
    </div>
  </el-footer>
</template>
```

### 自定义链接列表

修改 `footerLinks` 配置：

```javascript
const footerLinks = ref([
  { text: '使用文档', href: '/user-docs/' },
  { text: 'API 参考', href: '/user-docs/api/' },
  { text: 'GitHub', href: 'https://github.com/your-repo' },
  { text: '关于我们', href: '/about' },
  { text: '联系方式', href: '/contact' }
])
```

### 调整样式

修改 SCSS 变量：

```scss
// packages/main-app/src/assets/styles/variables.scss
$footer-height: 50px; // Footer 高度
```

## 布局选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showFooter | Boolean | false | 是否显示底部 Footer 组件 |

## 与其他布局组件的配合

Footer 组件可以与其他布局组件配合使用：

- ✅ **Header**: 顶部导航栏
- ✅ **Sider**: 侧边栏菜单
- ✅ **DefaultLayout**: 默认布局（包含 Header、Sider、Footer）
- ✅ **EmbeddedLayout**: 嵌入式布局（可选 Footer）

## 注意事项

1. **性能考虑**: Footer 组件默认不显示，按需开启
2. **响应式设计**: Footer 会自动适应容器宽度
3. **内容高度**: 当启用 Footer 时，确保主内容区有足够空间
4. **样式冲突**: 自定义样式时注意避免与 Element Plus 冲突

## 示例代码

### 完整示例 - 默认布局

```vue
<template>
  <DefaultLayout>
    <div class="page-content">
      <h1>页面标题</h1>
      <p>页面内容...</p>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { layoutManager } from '@/core/layoutManager'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'

onMounted(() => {
  // 设置布局类型为默认布局并显示 Footer
  layoutManager.setLayout('default', {
    showHeader: true,
    showSidebar: true,
    showFooter: true,
    keepAlive: false
  })
})
</script>
```

### 完整示例 - 嵌入式布局

```vue
<template>
  <EmbeddedLayout>
    <div class="embedded-content">
      <h1>嵌入式页面</h1>
      <p>内容区域...</p>
    </div>
  </EmbeddedLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { layoutManager } from '@/core/layoutManager'
import EmbeddedLayout from '@/components/layout/EmbeddedLayout.vue'

onMounted(() => {
  layoutManager.setLayout('embedded', {
    showHeader: true,
    showSidebar: false,
    showFooter: true,
    keepAlive: false
  })
})
</script>
```

## 相关文件

- Footer 组件：`/packages/main-app/src/components/layout/Footer.vue`
- 布局管理器：`/packages/main-app/src/core/layoutManager.js`
- 默认布局：`/packages/main-app/src/components/layout/DefaultLayout.vue`
- 嵌入式布局：`/packages/main-app/src/components/layout/EmbeddedLayout.vue`

## 更新日志

- **v1.0.0**: 初始版本，支持基本的 Footer 功能
  - 版权信息显示
  - 快捷链接配置
  - 布局集成支持
