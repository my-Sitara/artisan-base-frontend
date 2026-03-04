# 子应用加载管理新增删除功能

## 🎯 功能说明

在 **子应用加载管理页面**（AppLoading.vue）中新增了应用的**新增**和**删除**功能。

---

## 📁 修改的文件

### 1. `/packages/main-app/src/views/AppLoading.vue`

**新增的功能：**

#### （1）新增应用按钮
```vue
<div class="header-actions">
  <el-button type="primary" @click="showAddApp">
    <el-icon><Plus /></el-icon>
    新增应用
  </el-button>
  <el-button @click="handleRefreshAll">
    刷新列表
  </el-button>
</div>
```

#### （2）删除应用按钮（操作列）
```vue
<el-button 
  type="danger" 
  link 
  size="small"
  @click="handleDeleteApp(row)"
>
  删除
</el-button>
```

#### （3）核心逻辑

**新增应用流程：**
```javascript
function showAddApp() {
  isEditMode.value = false  // ← 标记为新增模式
  
  editForm.value = {
    id: '',
    name: '',
    type: 'vue3',
    entry: '',
    version: '1.0.0',
    activeRule: '',
    status: 'online',
    preload: false,
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      showFooter: false,
      keepAlive: false
    }
  }
  
  showEditDialog.value = true  // 复用配置对话框
}
```

**保存逻辑（支持新增和编辑）：**
```javascript
function handleSaveEdit() {
  if (!isEditMode.value) {
    // 新增模式
    const config = {
      ...editForm.value,
      container: '#micro-app-container',
      lastModified: Date.now()
    }
    appStore.addApp(config)
    ElMessage.success('应用已添加')
  } else {
    // 编辑模式
    appStore.updateApp(editForm.value.id, config)
    ElMessage.success('配置已保存')
  }
  
  showEditDialog.value = false
}
```

**删除应用流程：**
```javascript
function handleDeleteApp(app) {
  ElMessageBox.confirm(
    `确定要删除应用 ${app.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    appStore.deleteApp(app.id)
    ElMessage.success('应用已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
```

---

### 2. `/packages/main-app/src/stores/app.js`

**新增方法：**

```javascript
function deleteApp(appId) {
  return removeApp(appId)
}

// 导出到 return 中
return {
  // ...
  deleteApp,  // ← 新增导出
  // ...
}
```

---

## 🖼️ 页面效果

### 新增应用

1. 点击 **"新增应用"** 按钮
2. 弹出配置对话框（与编辑共用）
3. 填写应用信息：
   ```
   应用ID: my-sub-app
   应用名称：我的子应用
   类型：vue3
   入口地址：http://localhost:8081
   激活规则：/my-app
   状态：在线
   布局类型：default
   ```
4. 点击 **"保存"** 提交
5. 列表自动更新，显示新应用

---

### 删除应用

1. 在操作列找到要删除的应用
2. 点击 **"删除"** 按钮
3. 弹出确认对话框：
   ```
   确定要删除应用 "我的子应用" 吗？
   ```
4. 点击 **"确定"** 确认
5. 应用从列表中移除

---

## 💡 使用指南

### 访问路径

```
http://localhost:8080/app-management/loading
```

或从首页点击 **"应用管理"** → **"子应用加载管理"**

---

### 操作流程

#### 新增应用
```
进入子应用加载管理页 
  ↓
点击"新增应用"按钮
  ↓
填写应用配置表单
  ↓
点击"保存"
  ↓
✅ 应用添加到列表
```

#### 删除应用
```
进入子应用加载管理页
  ↓
找到要删除的应用
  ↓
点击"删除"按钮
  ↓
确认删除
  ↓
✅ 应用从列表移除
```

---

## 🔍 技术实现要点

### 1. 复用配置对话框

**设计思路：**
- 新增和编辑共用同一个对话框
- 使用 `isEditMode` 变量区分模式
- 简化代码结构，减少重复

```javascript
const isEditMode = ref(false)  // false=新增，true=编辑

function showAddApp() {
  isEditMode.value = false
  // ...
  showEditDialog.value = true
}

function showEditApp(app) {
  isEditMode.value = true
  // ...
  showEditDialog.value = true
}
```

---

### 2. Store 层封装

**app.js 提供统一接口：**

```javascript
// 新增
function addApp(appConfig) {
  apps.value.push(appConfig)
}

// 删除
function deleteApp(appId) {
  return removeApp(appId)
}

// 更新
function updateApp(appId, config) {
  const index = apps.value.findIndex(app => app.id === appId)
  if (index !== -1) {
    apps.value[index] = { ...apps.value[index], ...config }
  }
}
```

---

### 3. 响应式更新

**数据流：**
```
用户操作 
  ↓
调用 appStore 方法
  ↓
Pinia Store 响应式更新
  ↓
Vue 组件自动重新渲染
  ↓
表格列表实时更新
```

---

## ⚠️ 注意事项

### 1. 数据持久化

**当前实现：** 数据存储在 Pinia Store 的内存中

**限制：**
- ❌ 刷新页面后数据会丢失
- ❌ 新增的应用不会保存到后端

**TODO 扩展方案：**

#### 方案 A：LocalStorage 持久化
```javascript
// 在 addApp 和 deleteApp 中同步保存
function saveToLocalStorage() {
  localStorage.setItem('micro_apps', JSON.stringify(apps.value))
}
```

#### 方案 B：后端 API 持久化
```javascript
async function addApp(config) {
  await fetch('/api/micro-apps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
}
```

---

### 2. 应用ID 唯一性

**当前实现：** 没有检查 ID 是否重复

**建议增强：**
```javascript
// 在保存时验证
if (!isEditMode.value) {
  const exists = apps.value.some(app => app.id === editForm.value.id)
  if (exists) {
    ElMessage.error('应用ID 已存在')
    return
  }
}
```

---

### 3. 系统应用保护

**建议增强：** 禁止删除系统内置应用

```javascript
const systemApps = ['vue3-sub-app', 'vue2-sub-app', 'iframe-sub-app']

function handleDeleteApp(app) {
  if (systemApps.includes(app.id)) {
    ElMessage.warning('系统内置应用不能删除')
    return
  }
  // ... 正常删除逻辑
}
```

---

## 📊 功能对比

| 功能 | 操作位置 | 触发方式 | 确认机制 |
|------|---------|---------|---------|
| **新增应用** | 页面头部 | 点击"新增应用"按钮 | 表单验证 |
| **删除应用** | 操作列 | 点击"删除"按钮 | 二次确认弹窗 |
| **编辑应用** | 操作列 | 点击"配置"按钮 | 表单验证 |

---

## 🎯 完整功能清单

### ✅ 已实现

- [x] 应用列表展示
- [x] 新增应用（带表单）
- [x] 编辑应用配置
- [x] 删除应用（带确认）
- [x] 状态切换（在线/离线）
- [x] 预加载控制
- [x] 强制刷新
- [x] 应用详情查看
- [x] 布局配置预览

### 🔜 可扩展

- [ ] 数据持久化（LocalStorage/API）
- [ ] 应用ID 唯一性检查
- [ ] 系统应用保护
- [ ] 批量操作
- [ ] 导入/导出配置
- [ ] 应用搜索/筛选
- [ ] 操作日志记录
- [ ] 撤销删除功能

---

## 🔧 快速参考

### 访问地址

```
http://localhost:8080/app-management/loading
```

### 核心文件

```
/packages/main-app/src/views/AppLoading.vue  ← 主页面
/packages/main-app/src/stores/app.js         ← 数据存储
```

### 核心方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `appStore.addApp(config)` | 新增应用 | 应用配置对象 |
| `appStore.deleteApp(id)` | 删除应用 | 应用ID |
| `appStore.updateApp(id, config)` | 更新应用 | 应用ID + 配置对象 |
| `appStore.apps` | 获取应用列表 | - |

现在你可以在子应用加载管理页面进行应用的新增和删除操作了！🚀
