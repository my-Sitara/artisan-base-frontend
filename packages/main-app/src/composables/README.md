# Composables 目录

此目录用于存放 Vue 3 组合式函数（Composables），即可复用的逻辑模块。

## 使用方式

```javascript
// 在组件中使用
import { useSomething } from '@/composables/useSomething'

export default {
  setup() {
    const { state, actions } = useSomething()
    return { state, actions }
  }
}
```

## 命名规范

- 文件名应以 `use` 开头，如 `useUser.js`、`useLayout.js`
- 导出一个默认函数，返回响应式状态和方法
