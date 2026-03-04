# Artisan CLI 模板与包变动说明

## 📦 目录结构

```
packages/cli/
├── bin/
│   └── artisan.js              # CLI 入口文件
├── lib/
│   ├── create.js               # 项目创建逻辑
│   ├── generator.js            # 模板生成引擎
│   ├── index.js                # 导出接口
│   └── utils.js                # 工具函数
├── templates/                  # 模板目录
│   ├── iframe-sub-app-js/      # iframe 子应用模板（JS）
│   ├── main-app-js/            # 主应用模板（JS）
│   ├── main-app-ts/            # 主应用模板（TS）
│   ├── vue2-sub-app-js/        # Vue2 子应用模板（JS）
│   ├── vue3-sub-app-js/        # Vue3 子应用模板（JS）
│   └── vue3-sub-app-ts/        # Vue3 子应用模板（TS）
└── package.json                # CLI 依赖配置
```

---

## 🔧 Templates 模板目录变动

### 1. EJS 模板文件规范

所有需要动态替换变量的文件必须使用 `.ejs` 扩展名。生成器会自动渲染 EJS 模板并去掉 `.ejs` 后缀。

#### ✅ 已修复的模板文件列表（共 17 个）

**iframe-sub-app-js (3 个)**
- `package.json.ejs` - 项目配置
- `src/bridge.js.ejs` - 通信桥接器
- `vite.config.js.ejs` - Vite 构建配置

**main-app-js (3 个)**
- `package.json.ejs` - 项目配置
- `src/core/bridge.js.ejs` - 通信桥接器
- `vite.config.js.ejs` - Vite 构建配置

**main-app-ts (3 个)**
- `package.json.ejs` - 项目配置
- `src/core/bridge.ts.ejs` - 通信桥接器（TypeScript）
- `vite.config.js.ejs` - Vite 构建配置

**vue2-sub-app-js (2 个)**
- `package.json.ejs` - 项目配置
- `vue.config.js.ejs` - Vue CLI 构建配置

**vue3-sub-app-js (3 个)**
- `package.json.ejs` - 项目配置
- `src/main.js.ejs` - 应用入口
- `vite.config.js.ejs` - Vite 构建配置

**vue3-sub-app-ts (3 个)**
- `package.json.ejs` - 项目配置
- `src/main.ts.ejs` - 应用入口（TypeScript）
- `vite.config.js.ejs` - Vite 构建配置

---

### 2. 模板变量说明

所有 `.ejs` 文件中可使用以下变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `<%= name %>` | 项目名称 | my-app |
| `<%= description %>` | 项目描述 | 微前端主应用 |
| `<%= port %>` | 开发服务器端口 | 8080 |
| `<%= appName %>` | 应用名称（子应用专用） | my-vue3-app |
| `<%= language %>` | 模板语言 | js / ts |

---

### 3. 依赖版本更新（2026-03-04）

#### 核心依赖版本修复

**问题：** `@vitejs/plugin-vue@5.2.1` 不支持 `vite@7.3.1`

**解决方案：** 升级到 `@vitejs/plugin-vue@6.0.4`，支持 Vite 5.x/6.x/7.x/8.x

#### 所有模板的依赖版本统一为：

```json
{
  "dependencies": {
    "@element-plus/icons-vue": "^2.3.2",
    "axios": "^1.13.5",
    "element-plus": "^2.13.2",
    "lodash-es": "^4.17.21",
    "pinia": "^3.0.4",
    "pinia-plugin-persistedstate": "^4.2.3",
    "qiankun": "^2.10.16",
    "vue": "^3.5.29",
    "vue-router": "^5.0.3"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.4",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.22.0",
    "sass": "^1.71.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vue-tsc": "^2.2.0"
  }
}
```

#### 版本兼容性说明

- **@vitejs/plugin-vue@6.0.4**: 支持 Vite `^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0`
- **@element-plus/icons-vue@2.3.2**: 修正版本号（原 `^2.6.1` 不存在）
- **Vite@7.3.1**: 保持最新版本

---

## 📦 Package 变动

### 1. CLI 核心代码变动

#### `lib/generator.js`

**功能：** 模板生成引擎

**关键逻辑：**
```javascript
// 递归复制模板目录
export async function copyTemplate(src, dest, config) {
  const files = await fs.readdir(src)
  
  for (const file of files) {
    const srcPath = path.join(src, file)
    let destFile = file
    let destPath = path.join(dest, destFile)
    
    const stat = await fs.stat(srcPath)
    
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath)
      await copyTemplate(srcPath, destPath, config)
    } else if (file.endsWith('.ejs')) {
      // 渲染 EJS 模板，去掉 .ejs 后缀
      destPath = path.join(dest, file.replace(/\.ejs$/, ''))
      const content = await fs.readFile(srcPath, 'utf-8')
      const rendered = ejs.render(content, config)
      await fs.writeFile(destPath, rendered, 'utf-8')
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}
```

**处理规则：**
- `.ejs` 结尾的文件：渲染 EJS 后写出（去掉 `.ejs` 后缀）
- 其他文件：直接复制

---

#### `bin/artisan.js`

**功能：** CLI 命令入口

**支持的命令：**

1. **create** - 创建项目
```bash
artisan create <type> <name> [options]
```

**参数：**
- `type`: 项目类型 (`main-app` | `sub-app`)
- `name`: 项目名称

**选项：**
- `-t, --type <type>`: 子应用类型 (vue3/vue2/iframe)，默认：vue3
- `-p, --port <port>`: 开发服务器端口
- `-d, --dir <dir>`: 目标目录，默认：`.`
- `--js`: 使用 JavaScript 模板
- `--ts`: 使用 TypeScript 模板

2. **list** - 列出支持的模板

3. **info** - 显示 CLI 版本与依赖信息

---

#### `lib/create.js`

**功能：** 项目创建逻辑

**主应用创建流程：**
1. 检查目标目录是否存在
2. 收集用户配置（描述、端口、语言）
3. 选择模板（`main-app-js` 或 `main-app-ts`）
4. 调用 `generateProject()` 生成项目

**子应用创建流程：**
1. 检查目标目录是否存在
2. 选择子应用类型（vue3/vue2/iframe）
3. 收集用户配置（描述、端口、语言）
4. 根据类型选择模板：
   - Vue3: `vue3-sub-app-js` 或 `vue3-sub-app-ts`
   - Vue2: `vue2-sub-app-js`
   - iframe: `iframe-sub-app-js`
5. 调用 `generateProject()` 生成项目

---

### 2. 默认端口配置

| 应用类型 | 默认端口 |
|----------|----------|
| 主应用 (main-app) | 8080 |
| Vue3 子应用 | 7080 |
| Vue2 子应用 | 3000 |
| iframe 子应用 | 9080 |

---

## 🛠️ 使用示例

### 创建主应用

```bash
# 创建 JavaScript 版主应用
npx @artisan/cli create main-app my-main-app --js --port 8080

# 创建 TypeScript 版主应用
npx @artisan/cli create main-app my-main-app --ts --port 8080
```

### 创建子应用

```bash
# 创建 Vue3 子应用（JavaScript）
npx @artisan/cli create sub-app my-vue3-app --type vue3 --js --port 7080

# 创建 Vue3 子应用（TypeScript）
npx @artisan/cli create sub-app my-vue3-app --type vue3 --ts --port 7080

# 创建 Vue2 子应用
npx @artisan/cli create sub-app my-vue2-app --type vue2 --port 3000

# 创建 Iframe 子应用
npx @artisan/cli create sub-app my-iframe-app --type iframe --port 9080
```

### 查看帮助

```bash
# 列出所有支持的模板
npx @artisan/cli list

# 查看 CLI 信息
npx @artisan/cli info
```

---

## 📝 重要注意事项

### 1. 模板文件命名规范

- ✅ **正确**: `vite.config.js.ejs`, `package.json.ejs`, `main.js.ejs`
- ❌ **错误**: `vite.config.js`, `package.json`（包含模板变量时）

**规则：** 任何包含 `<%= %>` 模板变量的文件都必须使用 `.ejs` 扩展名。

### 2. 依赖版本兼容性

- `@vitejs/plugin-vue@6.x` 支持 Vite 5.x/6.x/7.x/8.x
- `@vitejs/plugin-vue@5.x` 仅支持 Vite 4.x/5.x/6.x
- 使用 Vite 7.x 时必须搭配 `@vitejs/plugin-vue@6.x`

### 3. Node.js 版本要求

CLI 需要 Node.js >= 20.0.0

### 4. EJS 渲染时机

模板在以下时机被渲染：
1. 用户运行 `artisan create` 命令
2. 生成器读取 `.ejs` 文件
3. 使用 `ejs.render()` 替换变量
4. 写出不带 `.ejs` 后缀的目标文件

---

## 🔄 变更记录

### 2026-03-04

**修复内容：**

1. **EJS 模板文件规范化**
   - 将所有包含模板变量的 `.js`/`.ts` 文件重命名为 `.ejs`
   - 涉及文件：`vite.config.js`, `vue.config.js`, `bridge.js`, `bridge.ts`, `main.js`, `main.ts`
   - 总计：17 个 `.ejs` 文件

2. **依赖版本升级**
   - `@vitejs/plugin-vue`: `^5.2.1` → `^6.0.4`
   - `@element-plus/icons-vue`: `^2.6.1` → `^2.3.2`（修正版本号）
   - `vite`: 保持 `^7.3.1`

3. **影响范围**
   - 所有主应用和子应用模板
   - 已创建的项目需手动更新 `package.json`

---

## 📚 相关文档

- [快速开始](../../user-docs/guide/getting-started.md)
- [主应用开发](../../user-docs/guide/main-app.md)
- [子应用开发](../../user-docs/guide/sub-apps.md)
- [CLI 工具链](../../user-docs/cli/)
