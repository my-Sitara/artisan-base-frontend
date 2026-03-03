# EmbeddedLayout Footer 配置说明

## 更新概述

EmbeddedLayout 中的 Footer 现在支持通过 `layoutOptions.showFooter` 配置项来控制显示或隐藏。

## 实现方式

### 1. 组件修改

**文件**: `/packages/main-app/src/components/layout/EmbeddedLayout.vue`

```vue
<template>
  <div class="embedded-layout">
    <div class="embedded-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>嵌入式布局</el-breadcrumb-item>
      </el-breadcrumb>
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

### 2. 工作原理

1. **引入 layoutManager**: 从 `@/core/layoutManager` 导入 layoutManager 实例
2. **计算属性**: 使用 `computed` 创建响应式的 `layoutOptions` 计算属性
3. **条件渲染**: 使用 `v-if="layoutOptions.showFooter"` 控制 Footer 的显示隐藏
4. **响应式更新**: 当 `layoutOptions.showFooter` 变化时，Footer 会自动显示或隐藏

## 使用方法

### 方法 1: 通过代码控制

```javascript
import { layoutManager } from '@/core/layoutManager'

// 显示 Footer
layoutManager.setFooterVisible(true)

// 隐藏 Footer
layoutManager.setFooterVisible(false)

// 或者批量更新
layoutManager.updateOptions({
  showHeader: true,
  showSidebar: false,
  showFooter: true,
  keepAlive: false
})
```

### 方法 2: 在子应用配置中设置

```javascript
{
  name: 'embedded-app',
  entry: '//localhost:7101',
  layoutType: 'embedded',
  layoutOptions: {
    showHeader: true,
    showSidebar: false,
    showFooter: true,  // 启用 Footer
    keepAlive: false
  }
}
```

### 方法 3: 在应用管理界面配置

1. 打开应用管理页面
2. 编辑目标应用
3. 展开"布局配置"部分
4. 切换"显示底部"开关（控制 `showFooter`）
5. 保存配置

## 效果对比

### 显示 Footer 时
```
┌─────────────────────┐
│  Embedded Header    │
├─────────────────────┤
│                     │
│                     │
│   Content Area      │
│                     │
│                     │
├─────────────────────┤
│      Footer         │  ← 显示
└─────────────────────┘
```

### 隐藏 Footer 时
```
┌─────────────────────┐
│  Embedded Header    │
├─────────────────────┤
│                     │
│                     │
│   Content Area      │
│                     │
│                     │
│                     │
│                     │  ← Footer 不显示
└─────────────────────┘
```

## 响应式行为

- 当 `showFooter` 从 `false` 变为 `true` 时，Footer 会立即显示
- 当 `showFooter` 从 `true` 变为 `false` 时，Footer 会立即隐藏
- 内容区域会自动调整高度以适应 Footer 的显示/隐藏状态

## 与其他布局的一致性

现在所有布局都支持 Footer 配置：

| 布局类型 | Footer 支持 | 控制方式 |
|---------|-----------|---------|
| DefaultLayout | ✅ | `v-if="layoutOptions.showFooter"` |
| EmbeddedLayout | ✅ | `v-if="layoutOptions.showFooter"` |
| FullLayout | ❌ | 不支持（全屏布局） |
| BlankLayout | ❌ | 不支持（空白布局） |

## 注意事项

1. **默认值**: `showFooter` 的默认值为 `false`，即默认不显示 Footer
2. **性能**: 使用 `v-if` 而非 `v-show`，隐藏的 Footer 不会被渲染到 DOM 中
3. **样式**: Footer 容器使用 `margin-top: auto` 确保始终吸附在底部
4. **响应式**: 修改 `showFooter` 后，布局会自动重新计算高度

## 示例场景

### 场景 1: 登录页面（不需要 Footer）

```javascript
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: false,
  showFooter: false,  // 不显示 Footer
  keepAlive: false
})
```

### 场景 2: 帮助文档页面（需要 Footer）

```javascript
layoutManager.setLayout('embedded', {
  showHeader: true,
  showSidebar: true,
  showFooter: true,  // 显示 Footer
  keepAlive: true
})
```

### 场景 3: 动态切换

```vue
<template>
  <div>
    <button @click="toggleFooter">切换 Footer 显示</button>
    <EmbeddedLayout>
      <router-view />
    </EmbeddedLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { layoutManager } from '@/core/layoutManager'

const showFooter = ref(false)

function toggleFooter() {
  showFooter.value = !showFooter.value
  layoutManager.setFooterVisible(showFooter.value)
}
</script>
```

## 相关文件

- 组件实现：`/packages/main-app/src/components/layout/EmbeddedLayout.vue`
- 布局管理器：`/packages/main-app/src/core/layoutManager.js`
- Footer 组件：`/packages/main-app/src/components/layout/Footer.vue`
- 使用文档：`/user-docs/guide/footer-component.md`

## 更新日志

- **v1.0.1**: EmbeddedLayout 支持 Footer 配置显示/隐藏
  - 添加 `layoutOptions.showFooter` 响应式支持
  - 使用 `v-if` 条件渲染
  - 与 DefaultLayout 保持一致的配置方式
