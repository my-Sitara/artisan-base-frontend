# Composables 目录

此目录用于存放 Vue 3 组合式函数（Composables）。

## 用途

可复用的逻辑模块，通过 Vue 3 Composition API 提供响应式功能。

## 示例

```javascript
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  return {
    count,
    increment,
    decrement
  }
}
```
