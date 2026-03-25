# 子应用 Request 使用指南

## 概述

主应用已将统一的 HTTP 请求客户端提供给所有子应用。子应用可以直接使用这些能力，无需重复封装。

**重要说明**：
- ✅ 主应用挂载了 `window.$request`
- 💡 直接使用 `window.$request` 即可

### 主应用提供的核心能力

1. **统一的请求客户端** (挂载到 window)
   - `window.$request` - ✅ 已挂载（推荐使用）

2. **Token 管理工具** (通过 props 传递)
   - `props.auth` - Token 管理对象
   - 包含：`setToken()`, `getToken()`, `clearToken()`
   
   Token 管理工具是通过 **`props.auth`** 传递给子应用的：
   
   ```javascript
   // 在子应用的 main.js 中挂载到全局属性
   export async function mount(props) {
     if (props.auth) {
       app.config.globalProperties.$auth = props.auth
     }
   }
   
   // 然后在组件中使用
   this.$auth.setToken(token)
   ```

3. **文件操作能力** (包含在 $request 中)
   - `window.$request.downloadFile()` - 通用文件下载
   - `window.$request.downloadExcel()` - Excel 下载
   - `window.$request.downloadPDF()` - PDF 下载
   - `window.$request.uploadFile()` - 文件上传

4. **工厂函数** (挂载到 window)
   - `window.createCustomRequest()` - 创建自定义 request 实例
   - `window.createFileOperations()` - 创建文件操作能力包

### 设计架构

```
主应用 (main-app)
├── utils/request.js
│   ├── mainRequest (核心请求实例)
│   └── createCustomRequest() (工厂函数)
├── utils/fileOperations.js
│   └── createFileOperations()
└── core/subAppRequestProvider.js
    ├── provideRequestToSubApps() → window.$request
    └── createSubAppProps() → props.$request, props.auth
```

**关键点**：
- ✅ 主应用仅提供工厂函数，不主动创建实例
- ✅ 子应用可以使用主应用的 `window.$request`，也可以自己创建 customRequest
- ✅ 所有配置常量统一管理（`config/app.js`）

## 主应用已提供的能力

### 配置常量（统一管理）

所有配置常量都在 `config/app.js` 中统一定义：

```javascript
// packages/main-app/src/config/app.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const REQUEST_TIMEOUT = 30000  // 默认 30 秒
export const TOKEN_KEY = 'user-token'
export const USER_INFO_KEY = 'user-info'
export const APP_VERSION = '2.0.0'
```

**环境变量**（通过 `.env` 文件配置）：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MICRO_APPS_API=false

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MICRO_APPS_API=true
```

**子应用接入时**：
- ✅ 推荐使用主应用的 `window.$request`（已配置好 baseURL 和拦截器）
- ✅ 也可以使用 `createCustomRequest()` 创建自己的实例
- 💡 常量应从 `config/app.js` 读取，不要硬编码

---

### 1. window.$request - 完整的 axios 实例

```javascript
// GET 请求
const users = await window.$request.get('/users', { params: { id: 1 } })

// POST 请求
const user = await window.$request.post('/users', { name: 'John' })

// PUT 请求
await window.$request.put('/users/1', { name: 'Jane' })

// DELETE 请求
await window.$request.delete('/users/1')

// 自定义配置
await window.$request({
  method: 'post',
  url: '/users',
  data: { name: 'John' }
})
```

**设计说明**：
- ✅ `window.$request` 指向 `mainRequest` 对象
- ✅ 包含所有 HTTP 方法、文件操作和 Token 管理

```javascript
// GET 请求
const users = await window.$request.get('/users', { params: { id: 1 } })

// POST 请求
const user = await window.$request.post('/users', { name: 'John' })

// PUT 请求
await window.$request.put('/users/1', { name: 'Jane' })

// DELETE 请求
await window.$request.delete('/users/1')

// 自定义配置
await window.$request({
  method: 'post',
  url: '/users',
  data: { name: 'John' }
})
```

**设计说明**：
- ✅ `window.$request` 指向 `mainRequest` 对象
- ✅ 包含所有 HTTP 方法、文件操作和 Token 管理

### 2. Token 管理（通过 props.auth）

```javascript
// 设置 Token（登录成功后）
window.$auth.setToken('your-token-here')

// 获取 Token
const token = window.$auth.getToken()

// 清除 Token（退出登录）
window.$auth.clearToken()
```

### 3. 文件下载

**注意**：文件操作方法在 `window.$request` 对象上，不在 window 直接挂载。

```javascript
// ✅ 正确：从 $request 对象访问
const { downloadFile, downloadExcel, downloadPDF } = window.$request

// ❌ 错误：不要这样写（window 上没有这些方法）
// import { downloadFile } from '@/utils/request'  // 这是子应用自己的导入

// 下载 Excel（默认 blob 类型）
await window.$request.downloadExcel('/api/export/users', null, '用户列表.xlsx')

// 下载 PDF
await window.$request.downloadPDF('/api/report.pdf')

// 通用下载
await window.$request.downloadFile('/api/files/doc.pdf', null, '文档.pdf')

// 自定义 responseType
await window.$request.downloadFile('/api/files/binary', {
  responseType: 'arraybuffer'
}, '文件.bin')

// 自定义超时时间
await window.$request.downloadFile('/api/large-file.zip', {
  timeout: 300000 // 5 分钟
}, '大文件.zip')
```

**或者使用工厂函数创建自己的 fileOps**：

```javascript
import { createFileOperations } from '@/utils/request'

// 使用默认的 request 实例
const fileOps = createFileOperations()
await fileOps.downloadExcel('/api/export/users')

// 或使用自定义 request 实例
const customRequest = createCustomRequest('https://other-api.com')
const customFileOps = createFileOperations(customRequest)
await customFileOps.downloadExcel('/api/export/users')
```

### 4. 文件上传

**注意**：`uploadFile` 方法在 `window.$request` 对象上。

```javascript
// ✅ 正确：从 $request 对象访问
const { uploadFile } = window.$request

// 上传文件
const file = event.target.files[0]
const result = await window.$request.uploadFile('/api/upload', file)

// 上传并携带额外数据
await window.$request.uploadFile('/api/upload', file, {
  userId: 1,
  description: '文件描述'
})

// 自定义配置（如超时时间、headers 等）
await window.$request.uploadFile('/api/upload', file, {}, {
  timeout: 60000, // 60 秒超时
  headers: {
    'X-Custom-Header': 'custom-value'
  }
})
```

**或者使用工厂函数**：

```javascript
import { createFileOperations } from '@/utils/request'

const fileOps = createFileOperations()
await fileOps.uploadFile('/api/upload', file)
```

---

## 在子应用中使用

### 接入方式总览

子应用有两种方式使用 request 能力：

**方式 1：直接使用主应用的 `window.$request`**（推荐）
- ✅ 最简单，开箱即用
- ✅ 自动使用主应用的配置和拦截器
- ✅ Token 自动注入

**方式 2：使用 `createCustomRequest()` 创建自己的实例**
- ✅ 可以自定义 baseURL
- ✅ 可以自定义拦截器
- ✅ 适合需要多 API 地址的场景

---

### 子应用 request 实例化举例

#### 场景 1：Vue3 子应用 - 标准接入

```javascript
// packages/vue3-sub-app/src/main.js
import { createApp } from 'vue'
import App from './App.vue'

let instance = null

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的 props（独立运行时为空对象）
 */
function render(props = {}) {
  instance = createApp(App)
  
  // === 关键：接入主应用的 request 能力 ===
  if (props.$request) {
    // 挂载到全局属性
    instance.config.globalProperties.$request = props.$request
    // provide/inject 方式访问
    instance.provide('$request', props.$request)
  }
  
  // 挂载 auth 工具（Token 管理）
  if (props.auth) {
    instance.config.globalProperties.$auth = props.auth
  }
  
  instance.mount('#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 环境下
export async function mount(props) {
  console.log('[vue3-sub-app] Mount props received:', props)
  render(props)
}

export async function unmount() {
  instance.unmount()
  instance._container.innerHTML = ''
  instance = null
}
```

#### 场景 2：Vue2 子应用 - 标准接入

```javascript
// packages/vue2-sub-app/src/main.js
import Vue from 'vue'
import App from './App.vue'

let instance = null

/**
 * 渲染函数
 */
function render(props = {}) {
  // 将主应用的 $request 挂载到 Vue 原型
  if (props.$request) {
    Vue.prototype.$request = props.$request
  }
  
  // 挂载 auth 工具
  if (props.auth) {
    Vue.prototype.$auth = props.auth
  }
  
  instance = new Vue({
    render: h => h(App)
  }).$mount('#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 环境下
export async function mount(props) {
  console.log('[vue2-sub-app] Mount props received:', props)
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
```

#### 场景 3：iframe 子应用 - 通过 postMessage 获取

```html
<!-- iframe 子应用不需要特殊配置 -->
<!-- 主应用会自动注入 window.$request -->
<script>
  // iframe 中可以直接使用 window.$request
  async function loadData() {
    const response = await window.$request.get('/api/data')
    console.log(response.data)
  }
  
  // 或者监听主应用的消息
  window.addEventListener('message', (event) => {
    if (event.data.type === 'REQUEST_INIT') {
      // 接收主应用传递的 request 能力
      window.$request = event.data.request
    }
  })
</script>
```

---

#### 场景 4：使用 createCustomRequest 创建多实例

```javascript
// packages/vue3-sub-app/src/utils/request.js
import { createCustomRequest } from '@/utils/request'

// 创建默认 API 实例（使用主应用配置）
export const defaultRequest = window.$request

// 创建自定义 API 实例（例如：第三方服务）
export const thirdPartyApi = createCustomRequest('https://third-party-api.com', {
  timeout: 60000,
  headers: {
    'X-API-Key': 'your-api-key'
  }
})

// 在组件中使用
export default {
  async mounted() {
    // 使用主应用的 request
    const users = await this.$request.get('/users')
    
    // 使用自定义的 request
    const externalData = await thirdPartyApi.get('/data')
  }
}
```

---

### Vue3 子应用示例

#### 方式 1：直接在组件中使用

```vue
<template>
  <div class="user-list">
    <h2>用户列表</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
    <button @click="loadUsers">刷新</button>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      loading: false
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        // 使用主应用提供的 $request
        const response = await window.$request.get('/users')
        this.users = response.data || response
      } catch (error) {
        console.error('Failed to load users:', error)
        this.$message.error('加载失败')
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.loadUsers()
  }
}
</script>
```

#### 方式 2：挂载到全局属性（推荐）

在子应用的 `main.js` 中配置：

```javascript
// packages/vue3-sub-app/src/main.js
import { createApp } from 'vue'
import App from './App.vue'

let instance = null

/**
 * 渲染函数
 * @param {Object} props - qiankun 传入的 props（独立运行时为空对象）
 */
function render(props = {}) {
  instance = createApp(App)
  
  // === 关键：接入主应用的 request 能力 ===
  
  // 1. 挂载 $request（主应用只提供了这一个）
  if (props.$request) {
    // 全局属性方式访问
    instance.config.globalProperties.$request = props.$request
    
    // provide/inject 方式访问
    instance.provide('$request', props.$request)
  }
  
  // 2. 挂载 auth 工具（Token 管理）
  if (props.auth) {
    instance.config.globalProperties.$auth = props.auth
  }
  
  // 3. 挂载工厂函数（可选，用于创建自定义 request）
  if (props.createCustomRequest) {
    instance.config.globalProperties.$createCustomRequest = props.createCustomRequest
  }
  
  instance.mount('#app')
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// qiankun 环境下
export async function mount(props) {
  console.log('[vue3-sub-app] Mount props received:', props)
  // props 包含：$request, auth, createCustomRequest, createFileOperations 等
  render(props)
}

export async function unmount() {
  instance.unmount()
  instance._container.innerHTML = ''
  instance = null
}
```

**然后在组件中使用**：

```vue
<script setup>
import { inject, onMounted, ref } from 'vue'

// === 使用方式 1：全局属性（最简单） ===
const $request = window.$request

// === 使用方式 2：provide/inject（推荐用于组件库开发） ===
const request = inject('$request', window.$request)

// === 使用方式 3：从 props 访问（适合在 setup 中） ===
// const request = getCurrentInstance()?.appContext.config.globalProperties.$request

const users = ref([])

const loadUsers = async () => {
  try {
    const response = await request.get('/users')
    users.value = response.data || response
  } catch (error) {
    console.error('Load failed:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

**关键点说明**：
- ✅ 主应用只提供了 `props.$request`
- ✅ 指向 `mainRequest` 对象
- ✅ Token 会自动注入（通过拦截器）

#### 方式 3：封装为 API 模块

```javascript
// packages/vue3-sub-app/src/api/user.js
// 使用主应用的 $request（唯一的全局 request）
const request = window.$request

// === 基础用法：直接使用全局的 $request ===
export function getUsers(params) {
  return request.get('/users', { params })
}

export function getUserDetail(id) {
  return request.get(`/users/${id}`)
}

export function createUser(data) {
  return request.post('/users', data)
}

export function updateUser(id, data) {
  return request.put(`/users/${id}`, data)
}

export function deleteUser(id) {
  return request.delete(`/users/${id}`)
}

// === 进阶用法：使用 createCustomRequest 创建自定义实例 ===
// 适用场景：子应用需要访问多个不同的 API 地址
import { createCustomRequest } from '@/utils/request'

// 创建自定义 API 实例
const customApi = createCustomRequest('https://other-api.example.com', {
  timeout: 60000,  // 自定义超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

export function getOtherApiData() {
  return customApi.get('/data')
}
```

在组件中使用：

```vue
<script setup>
import { onMounted, ref } from 'vue'
import { getUsers } from '@/api/user'

const users = ref([])

onMounted(async () => {
  const response = await getUsers()
  users.value = response.data || response
})
</script>
```

---

### Vue2 子应用示例

#### main.js 配置

```javascript
// packages/vue2-sub-app/src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'

let instance = null
let routerInstance = null

function render(props = {}, isQiankunMount = false) {
  routerInstance = new VueRouter({
    mode: isQiankunMount ? 'abstract' : 'history',
    base: '/',
    routes
  })

  instance = new Vue({
    router: routerInstance,
    render: h => h(App)
  }).$mount('#app')
  
  // 挂载主应用的 $request 到 Vue 原型
  // 注意：props.$request 和 props.request 是同一个对象
  if (props.$request) {
    Vue.prototype.$request = props.$request
    // 为了向后兼容，也可以挂载 request
    Vue.prototype.request = props.request
  }
  
  if (props.auth) {
    Vue.prototype.$auth = props.auth
  }
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

export async function mount(props) {
  render(props, true)
}

export async function unmount() {
  if (instance) {
    instance.$destroy()
    instance.$el.innerHTML = ''
  }
  instance = null
  routerInstance = null
}
```

#### 组件中使用

```vue
<template>
  <div>
    <h2>用户列表</h2>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      users: []
    }
  },
  async mounted() {
    // 使用 this.$request（已在 main.js 中挂载）
    // 或者使用 this.request 也可以（两者等价）
    const response = await this.$request.get('/users')
    this.users = response.data || response
  }
}
</script>
```

---

### iframe 子应用示例

iframe 子应用可以直接使用 `window.parent` 访问主应用的能力：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Iframe Sub App</title>
</head>
<body>
  <h1>iframe 子应用</h1>
  <div id="user-list"></div>

  <script>
    // 方式 1：直接使用主应用的 $request（通过 parent 访问）
    async function loadUsers() {
      try {
        // 通过 parent 访问主应用的 window.$request
        const $request = window.parent.window.$request
        // 或者使用 window.request 也可以（两者等价）
        // const request = window.parent.window.request
        
        const response = await $request.get('/users')
        
        const users = response.data || response
        document.getElementById('user-list').innerHTML = users
          .map(u => `<div>${u.name}</div>`)
          .join('')
      } catch (error) {
        console.error('Failed:', error)
      }
    }
    
    loadUsers()
  </script>
</body>
</html>
```

---

---

## 完整示例：用户管理系统

### 1. API 封装

```javascript
// api/user.js
// 使用主应用的 $request（推荐）
const request = window.$request

// 或者使用 request 也可以（两者等价）
// const request = window.request

export const userApi = {
  // 获取用户列表
  getUsers(params) {
    return request.get('/users', { params })
  },
  
  // 获取用户详情
  getUserDetail(id) {
    return request.get(`/users/${id}`)
  },
  
  // 创建用户
  createUser(data) {
    return request.post('/users', data)
  },
  
  // 更新用户
  updateUser(id, data) {
    return request.put(`/users/${id}`, data)
  },
  
  // 删除用户
  deleteUser(id) {
    return request.delete(`/users/${id}`)
  },
  
  // 登录
  login(username, password) {
    return request.post('/auth/login', { username, password })
  },
  
  // 登出
  logout() {
    return request.post('/auth/logout')
  },
  
  // 获取当前用户信息
  getCurrentUser() {
    return request.get('/user/current')
  }
}
```

### 2. 登录页面

```vue
<template>
  <div class="login-page">
    <el-form :model="form" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" :loading="loading">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { userApi } from '@/api/user'

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await userApi.login(form.username, form.password)
    
    // 保存 Token（使用主应用提供的 $auth）
    if (response.token) {
      window.$auth.setToken(response.token)
      localStorage.setItem('user-info', JSON.stringify(response.user))
    }
    
    // 跳转到首页
    window.location.href = '/home'
  } catch (error) {
    console.error('Login failed:', error)
    alert(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>
```

### 3. 用户列表页面

```vue
<template>
  <div class="user-list-page">
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { userApi } from '@/api/user'

const users = ref([])
const loading = ref(true)

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userApi.getUsers()
    users.value = response.data || response
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const handleDelete = async (user) => {
  if (!confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    return
  }
  
  try {
    await userApi.deleteUser(user.id)
    await loadUsers()
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

onMounted(() => {
  loadUsers()
})
</script>
```

---

## 注意事项

### 1. Token 管理

- ✅ 登录成功后调用 `window.$auth.setToken(token)`
- ✅ 退出登录时调用 `window.$auth.clearToken()`
- ✅ Token 会自动在每个请求中注入（通过请求拦截器）
- 💡 `$request` 和 `request` 都可以使用，两者等价

### 2. 错误处理

```javascript
try {
  await window.$request.get('/users')
  // 或者使用 window.request，两者等价
} catch (error) {
  if (error.code === 401) {
    // Token 过期，已自动跳转登录页
  } else {
    // 其他错误
    console.error(error.message)
  }
}
```

### 3. CORS 配置

确保子应用的开发服务器允许跨域：

```javascript
// Vite 配置
export default {
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

### 4. 文件下载注意事项

```javascript
// ✅ 正确：使用封装好的方法
await downloadFile('/api/file.pdf')

// ❌ 错误：直接使用 request.get（不会触发下载）
const response = await request.get('/api/file.pdf') // 返回的是 blob 对象，不会自动下载
```

### 5. 文件上传注意事项

```javascript
// ✅ 正确：使用 uploadFile 方法
await uploadFile('/api/upload', file)

// 需要自定义 Content-Type 时
const formData = new FormData()
formData.append('file', file)
formData.append('userId', 1)

await request.post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### 6. 独立运行时的降级

```javascript
// 如果不在微前端环境下，可以使用自己的 request 封装
// 注意：在微前端环境下，window.$request 和 window.request 是等价的
const request = window.__POWERED_BY_QIANKUN__ 
  ? window.$request  // 或者 window.request，两者等价
  : createMyOwnRequest()
```

---

## 故障排查

### 问题 1：window.$request 或 window.request 为 undefined

**解决方案：**
1. 确认主应用已启动并调用了 `initSubAppRequest()`
2. 检查子应用是否正确加载
3. 查看控制台是否有 `[SubAppRequest]` 开头的日志
4. 注意：`window.$request` 和 `window.request` 指向同一个对象，如果其中一个未定义，说明主应用未正确初始化

### 问题 2：请求地址不对

**解决方案：**
1. 检查环境变量 `VITE_API_BASE_URL` 配置
2. 确认请求 URL 是相对路径（如 `/users`）而非绝对路径
3. 查看 Network 面板的实际请求地址

### 问题 3：Mock 不生效

**解决方案：**
1. 确认已调用 `initMock()` 或处于 mock 模式
2. 检查 Mock 注册的 URL 是否与请求匹配
3. 查看控制台 `[Mock]` 开头的日志

---

## 相关文档

- **[主应用开发指南](./main-app.md)** - 了解主应用核心模块
- **[API 总结](../api/README.md)** - 所有 API 的快速参考
- **[MicroAppManager API](../api/micro-app-manager.md)** - 微应用管理 API
- **[子应用集成指南](./sub-app-integration-guide.md)** - 子应用接入完整流程
- **[配置 API](../api/config.md)** - 微应用配置管理

---

## 常见问题 FAQ

### Q1: 如何使用 request？

**A**: 直接使用 `window.$request` 即可。

```javascript
// 简单示例
const response = await window.$request.get('/api/users')
```

### Q2: 我应该使用哪种方式接入 request？

**A**: 根据场景选择：
- **简单场景** → 直接使用 `window.$request`
- **组件库开发** → 使用 `provide/inject`
- **多 API 地址** → 使用 `createCustomRequest()` 创建自定义实例

### Q3: 如何自定义 baseURL？

**A**: 使用工厂函数：
```javascript
import { createCustomRequest } from '@/utils/request'

const myApi = createCustomRequest('https://my-api.com', {
  timeout: 60000
})

// 使用
await myApi.get('/users')
```

### Q4: Token 如何管理？

**A**: Token 管理通过 `props.auth` 传递，或者在子应用中自行挂载：

**方式 1：在子应用 main.js 中挂载到全局**
```javascript
export async function mount(props) {
  if (props.auth) {
    app.config.globalProperties.$auth = props.auth
  }
}

// 然后在组件中使用
this.$auth.setToken(token)
```

**方式 2：直接使用 localStorage**
```javascript
const TOKEN_KEY = 'user-token'

// 设置 Token
localStorage.setItem(TOKEN_KEY, token)

// 获取 Token
const token = localStorage.getItem(TOKEN_KEY)

// 清除 Token
localStorage.removeItem(TOKEN_KEY)
```

**方式 3：在 setup 中使用**
```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const auth = instance.appContext.config.globalProperties.$auth

auth.setToken(token)
</script>
```

### Q5: 独立运行时如何使用？

**A**: 在非 qiankun 环境下，可以使用以下方式降级：
```javascript
const request = window.__POWERED_BY_QIANKUN__ 
  ? window.$request  // 微前端环境
  : createMyOwnRequest()  // 独立运行，自己创建
```

---
