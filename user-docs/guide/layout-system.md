# 布局系统

## 布局类型

### default - 默认布局

包含完整的头部和侧边栏，适用于大多数场景。

```javascript
{
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true
  }
}
```

### full - 全屏布局

无头部和侧边栏，子应用占满整个页面。

```javascript
{
  layoutType: 'full',
  layoutOptions: {}
}
```

### tabs - 多标签页布局

支持多标签页管理，适用于需要多任务切换的场景。

```javascript
{
  layoutType: 'tabs',
  layoutOptions: {
    multiTab: true,
    keepAlive: true
  }
}
```

### embedded - 嵌入式布局

子应用嵌入页面，不替换主路由。

```javascript
{
  layoutType: 'embedded',
  layoutOptions: {
    showHeader: true
  }
}
```

### blank - 空白布局

完全空白，适用于登录页等独立页面。

```javascript
{
  layoutType: 'blank',
  layoutOptions: {}
}
```

## 使用方式

### 路由级别配置

```javascript
// router/index.js
const routes = [
  {
    path: '/app/:appId',
    component: SubAppPage,
    meta: {
      layout: 'default'
    }
  }
]
```

### 微应用配置

```javascript
// config/microApps.js
{
  id: 'vue3-sub-app',
  layoutType: 'default',
  layoutOptions: {
    showHeader: true,
    showSidebar: true,
    keepAlive: false,
    multiTab: false
  }
}
```

### 动态切换

```javascript
import { layoutManager } from '@/core/layoutManager'

// 切换布局
layoutManager.setLayout('tabs', {
  multiTab: true
})

// 更新选项
layoutManager.updateOptions({
  showSidebar: false
})
```

## 布局选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showHeader | boolean | true | 是否显示头部 |
| showSidebar | boolean | true | 是否显示侧边栏 |
| keepAlive | boolean | false | 是否缓存页面 |
| multiTab | boolean | false | 是否支持多标签 |
