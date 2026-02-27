# 更新日志

## [2.0.0] - 2024-02-26

###⚠破性变更

- **Node.js版本要求**：从 `>= 18.0.0`升到 `>= 18.12.0`

###🚀 新功能

- **现代化技术栈升级**：
  - Vue 3.5.29 (从 3.x)
  - Vue Router 5.0.3 (从 4.x)
  - Vite 7.3.1 (从 5.x)
  - Element Plus 2.13.2 (从 2.6.1)
  - Pinia 3.x (从 2.x)
  - Axios 1.13.5 (从 1.6.7)
  - TypeScript 5.9.3 (从 5.4.2)

###🛠 修复

- **webpack-dev-server配置**：修复 `disableHostCheck` 选项在新版本中被移除的问题，替换为 `allowedHosts: 'all'`
- **CORS跨配置**：为所有应用添加完整的 CORS头配置
- **云环境适配**：添加 `host: '0.0.0.0'`配置以支持云IDE环境
- **iframe跨安全**：增强 origin校，支持动态添加云环境 origin
- **iframe卸流程**：添加卸载前通知机制

### 📝 文档更新

- 更新环境要求：Node.js >= 18.12.0
- 更新技术栈版本信息
- 更新配置示例中的 host 和 CORS配置
- 添加 iframe卸载通知机制说明
- 更新 API 文档中的消息类型

###🔧配置变更

#### 主应用 (main-app)
- `package.json`：升级所有核心依赖版本
- `vite.config.js`：添加 `host: '0.0.0.0'`配置

#### Vue3子应用 (vue3-sub-app)
- `package.json`：升级 Vue 和 Vue Router版本
- `vite.config.js`：添加 `host: '0.0.0.0'`配置

#### Vue2子应用 (vue2-sub-app)
- `vue.config.js`：添加 `host: '0.0.0.0'` 和 `allowedHosts: 'all'` 配置

#### iframe子应用 (iframe-sub-app)
- `vite.config.js`：添加 `host: '0.0.0.0'`配置
- `src/bridge.js`：增强 origin校逻辑

###🎯性能优化

- 使用最新版本的构建工具获得更好的性能
- 优化依赖树结构
-改类型检查和编译速度

###安全增强

- 更新依赖包修复已知安全漏洞
- iframe跨域安全策略
-改 origin校机制机制

###📊试 测试结果

所有应用正常启动：
- ✅ 主应用：http://localhost:8082/
- ✅ Vue3子应用：http://localhost:7082/
- ✅ Vue2子应用：http://localhost:3002/
-✅ iframe子应用：http://localhost:9082/

类型检查通过，无编译错误。

## [1.0.0] -初始版本

###🎉初始功能

-基 qiankun 2.10.16 的微前端架构
-支持 Vue3/Vue2/iframe/link四应用类型
-完整的跨应用通信机制
-编排系统
- CLI脚架工具
-多应用实例支持
- iframe安全治理