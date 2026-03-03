# 应用管理布局配置不生效问题修复

## 问题描述

在应用管理界面修改微应用的布局配置后，新的布局设置不能立即生效。

## 问题原因

### 1. 重复更新配置
`handleSaveEdit` 函数中调用了两次 `appStore.updateApp`:
```javascript
// 第一次更新 (完整配置)
appStore.updateApp(editForm.value.id, config)

// 第二次更新 (仅布局配置) - 冗余!
appStore.updateApp(editForm.value.id, {
  layoutType: editForm.value.layoutType,
  layoutOptions: { ...editForm.value.layoutOptions }
})
```

这导致:
- 配置被更新两次，性能浪费
- 第二次的部分更新可能覆盖第一次的完整配置

### 2. 缺少运行时布局切换
更新配置后，没有通知 `layoutManager` 立即应用新的布局设置，导致:
- 配置已保存到 store
- 但当前页面的布局没有实时切换
- 用户需要刷新或重新进入才能看到新布局

## 修复方案

### 修复要点

1. **删除重复的配置更新**
   - 只保留一次完整的 `appStore.updateApp` 调用
   - 确保所有配置项一次性更新完成

2. **添加运行时布局切换**
   - 检查当前路由是否正在查看该应用
   - 如果是，立即调用 `layoutManager.setLayoutFromMicroApp(config)`
   - 让新的布局配置立即生效

### 修复后的代码

```javascript
function handleSaveEdit() {
  if (!editForm.value) return
  
  const config = {
    name: editForm.value.name,
    type: editForm.value.type,
    entry: editForm.value.entry,
    version: editForm.value.version,
    activeRule: editForm.value.activeRule,
    preload: editForm.value.preload,
    layoutType: editForm.value.layoutType,
    layoutOptions: { ...editForm.value.layoutOptions },
    props: {
      routerBase: editForm.value.routerBase
    }
  }
  
  // 更新微应用配置
  appStore.updateApp(editForm.value.id, config)
  
  // 如果当前正在查看这个应用，立即应用新的布局配置
  const currentRouteAppId = route.params.appId || route.meta?.appId
  if (currentRouteAppId === editForm.value.id) {
    layoutManager.setLayoutFromMicroApp(config)
  }
  
  showEditDialog.value = false
  ElMessage.success('配置已保存')
}
```

## 技术细节

### 1. 配置完整性
`config` 对象包含所有必要的配置项:
- **基本信息**: name, type, entry, version
- **路由配置**: activeRule, props.routerBase
- **布局配置**: layoutType, layoutOptions
- **其他**: preload

### 2. 运行时检测
通过检查路由参数确定是否需要立即应用布局:
```javascript
const currentRouteAppId = route.params.appId || route.meta?.appId
if (currentRouteAppId === editForm.value.id) {
  // 当前正在查看这个应用，需要立即应用新布局
  layoutManager.setLayoutFromMicroApp(config)
}
```

### 3. LayoutManager 方法
使用 `setLayoutFromMicroApp` 方法:
```javascript
// layoutManager.js
setLayoutFromMicroApp(microAppConfig) {
  if (!microAppConfig) return
  const { layoutType, layoutOptions } = microAppConfig
  this.setLayout(layoutType || LayoutTypes.DEFAULT, layoutOptions || {})
}
```

这个方法会:
- 从配置中提取 `layoutType` 和 `layoutOptions`
- 调用 `setLayout` 进行布局切换
- 触发所有监听器回调
- 更新响应式状态

## 修复效果

### 修复前
1. 用户修改布局配置 → 点击保存
2. ✅ 配置保存到 store
3. ❌ 当前页面布局不变
4. ❌ 需要刷新或重新进入才能看到新布局

### 修复后
1. 用户修改布局配置 → 点击保存
2. ✅ 配置保存到 store
3. ✅ 如果正在查看该应用，立即应用新布局
4. ✅ 实时看到布局变化效果

## 测试场景

### 场景 1: 修改当前正在查看的应用
```
1. 访问 /app/vue3-sub-app
2. 打开配置对话框
3. 修改布局类型为 "embedded"
4. 点击保存
5. ✅ 配置保存成功，页面布局立即切换为嵌入式
```

### 场景 2: 修改其他应用 (非当前查看)
```
1. 访问 /app/vue3-sub-app
2. 打开配置对话框修改 vue2-sub-app
3. 点击保存
4. ✅ 配置保存成功
5. ℹ️ 不会立即应用布局 (因为不在查看 vue2-sub-app)
6. ✅ 下次访问 vue2-sub-app 时会应用新布局
```

## 相关文件

- `/packages/main-app/src/views/AppLoading.vue` - handleSaveEdit 函数
- `/packages/main-app/src/core/layoutManager.js` - setLayoutFromMicroApp 方法
- `/packages/main-app/src/stores/app.js` - updateApp 方法
- `/packages/main-app/src/config/microApps.js` - updateMicroAppConfig 函数

## 经验总结

### 教训
1. **避免重复调用**: 同一个操作不要多次调用更新函数
2. **考虑运行时状态**: 配置更新后要考虑是否需要立即应用到运行时
3. **条件判断很重要**: 通过检查当前路由状态，避免不必要的布局切换

### 最佳实践
1. **单一数据源**: 配置更新只调用一次 `updateApp`,保证数据一致性
2. **即时反馈**: 如果用户正在查看该资源，立即应用变更提供反馈
3. **条件优化**: 只在必要时才执行运行时切换，避免性能浪费

## 验证清单

- [x] 删除了重复的 `appStore.updateApp` 调用
- [x] 添加了运行时布局切换逻辑
- [x] 使用条件判断避免不必要的切换
- [x] 配置保存后立即生效
- [x] 不影响其他应用的配置更新
