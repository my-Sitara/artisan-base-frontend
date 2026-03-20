# 文档索引

欢迎来到 Artisan 微前端平台文档中心！本索引将帮助你快速找到所需的文档。

## 📚 文档分类

### 🎯 新手入门

如果你是第一次接触 Artisan 或微前端架构，建议按以下顺序阅读：

1. **[项目概述](./guide/overview.md)** ⭐⭐⭐⭐⭐
   - 了解平台的核心功能和特性
   - 技术架构和目录结构
   - 快速概览

2. **[快速开始](./guide/getting-started.md)** ⭐⭐⭐⭐⭐
   - 环境要求和安装步骤
   - 启动开发环境
   - CLI 工具使用
   - 常见问题解决

3. **[主应用开发](./guide/main-app.md)** ⭐⭐⭐⭐
   - 核心模块详解（Manager、Bridge、Layout）
   - 状态管理
   - 页面说明
   - 调试技巧

4. **[子应用开发](./guide/sub-apps.md)** ⭐⭐⭐⭐
   - Vue3/Vue2/iframe/link 四种类型详解
   - 入口配置和构建配置
   - 跨应用跳转
   - 最佳实践

---

### 📖 进阶指南

已经熟悉基础用法？深入学习这些主题：

#### 布局系统

- **[布局系统（快速参考）](./guide/layout-system.md)** ⭐⭐⭐
  - 布局类型速览
  - 快速配置示例
  - 布局选项说明

- **[布局系统完整指南](./guide/layout-system-complete-guide.md)** ⭐⭐⭐⭐⭐
  - 4 种布局类型详解
  - 布局约束和最佳实践
  - 故障排除
  - 可视化预览

#### iframe 治理

- **[iframe 跨域治理](./guide/iframe-governance.md)** ⭐⭐⭐⭐
  - 安全策略
  - 通信协议
  - 高度自适应
  - 心跳检测
  - 初始化流程

#### 其他主题

- **[部署指南](./guide/deployment.md)** ⭐⭐⭐⭐
  - 构建流程
  - Nginx 配置
  - CORS 配置
  - Docker 部署

- **[TypeScript 迁移](./guide/typescript-migration.md)** ⭐⭐⭐
  - TypeScript 支持
  - 迁移步骤
  - 类型定义

---

### 🔧 API 参考

需要查询具体 API 用法？查看这些文档：

#### 快速参考

- **[API 总结](./api/README.md)** ⭐⭐⭐⭐⭐
  - 所有核心 API 的快速参考
  - 使用示例
  - 参数说明
  - 返回值类型

#### 详细文档

- **[MicroAppManager API](./api/micro-app-manager.md)** ⭐⭐⭐⭐
  - 微应用实例管理
  - 加载、卸载、刷新
  - 错误管理
  - 属性说明

- **[Bridge API](./api/bridge.md)** ⭐⭐⭐⭐
  - 跨应用通信
  - 消息处理
  - Token 管理
  - 导航方法

- **[配置 API](./api/config.md)** ⭐⭐⭐
  - 微应用配置结构
  - 配置项说明
  - 环境变量
  - 标准化函数

---

### 🎨 专题文档

针对特定场景的深入讲解：

- **[多应用实例同屏](./guide/multi-instance.md)** （待完善）
  - Grid/Split 布局
  - 实例管理
  - 性能优化

- **[应用管理界面](./guide/app-management.md)** （待完善）
  - 应用列表管理
  - 配置编辑
  - 布局预览
  - 上下线切换

---

## 🔍 按角色查找文档

### 👶 初学者

**推荐学习路径**：

1. [快速开始](./guide/getting-started.md) - 安装和启动
2. [项目概述](./guide/overview.md) - 了解平台
3. [主应用开发](./guide/main-app.md) - 核心模块
4. [子应用开发](./guide/sub-apps.md) - 开发子应用
5. [布局系统](./guide/layout-system.md) - 布局配置

### 👨‍💻 前端开发者

**日常开发常用**：

- [子应用开发](./guide/sub-apps.md) - 各种类型子应用集成
- [Bridge API](./api/bridge.md) - 跨应用通信
- [布局系统完整指南](./guide/layout-system-complete-guide.md) - 布局配置
- [MicroAppManager API](./api/micro-app-manager.md) - 应用管理

### 🏗️ 架构师

**架构设计参考**：

- [项目概述](./guide/overview.md) - 整体架构
- [主应用开发](./guide/main-app.md) - 核心模块设计
- [iframe 治理](./guide/iframe-governance.md) - 安全策略
- [部署指南](./guide/deployment.md) - 生产环境

### 🚀 运维工程师

**部署运维必备**：

- [部署指南](./guide/deployment.md) - 构建和部署
- [环境变量配置](./guide/getting-started.md#环境变量) - 配置说明
- [端口配置](./guide/getting-started.md#端口配置) - 端口说明
- [常见问题](./README.md#常见问题) - 故障排查

---

## 📋 按功能查找文档

### 微应用管理

- [MicroAppManager API](./api/micro-app-manager.md) - 完整 API
- [主应用 - MicroAppManager](./guide/main-app.md#1-microappmanager 微应用管理器) - 详解
- [配置 API](./api/config.md) - 配置结构

### 跨应用通信

- [Bridge API](./api/bridge.md) - 完整 API
- [主应用 - Bridge](./guide/main-app.md#2-bridge 跨应用通信桥) - 详解
- [子应用 - 跨应用跳转](./guide/sub-apps.md#跨应用跳转) - 使用示例

### 布局系统

- [布局系统完整指南](./guide/layout-system-complete-guide.md) - 完整文档
- [布局系统（快速参考）](./guide/layout-system.md) - 快速参考
- [主应用 - LayoutManager](./guide/main-app.md#3-layoutmanager 布局管理器) - 详解

### Iframe 集成

- [iframe 跨域治理](./guide/iframe-governance.md) - 安全策略
- [子应用 - Iframe](./guide/sub-apps.md#iframe-子应用) - 开发指南
- [Bridge API](./api/bridge.md) - 通信协议

### 部署上线

- [部署指南](./guide/deployment.md) - 完整流程
- [Nginx 配置](./guide/deployment.md#nginx-配置) - 配置示例
- [CORS 配置](./guide/deployment.md#cors-配置) - 跨域设置

---

## 🎓 学习路线

### Level 1: 入门 (1-2 天)

✅ 阅读 [快速开始](./guide/getting-started.md)  
✅ 运行示例项目  
✅ 了解基本概念和术语  

### Level 2: 基础 (3-5 天)

✅ 阅读 [主应用开发](./guide/main-app.md)  
✅ 阅读 [子应用开发](./guide/sub-apps.md)  
✅ 尝试创建自己的子应用  
✅ 理解布局系统  

### Level 3: 进阶 (1-2 周)

✅ 阅读 [布局系统完整指南](./guide/layout-system-complete-guide.md)  
✅ 阅读 [iframe 治理](./guide/iframe-governance.md)  
✅ 实现跨应用通信  
✅ 学习最佳实践  

### Level 4: 精通 (2-4 周)

✅ 深入研究 [API 参考](./api/README.md)  
✅ 阅读源码  
✅ 实现自定义功能  
✅ 贡献代码  

---

## 🔥 热门文档

以下是被访问最多的文档：

1. [快速开始](./guide/getting-started.md) - 新手必读
2. [项目概述](./guide/overview.md) - 了解平台
3. [子应用开发](./guide/sub-apps.md) - 开发指南
4. [布局系统完整指南](./guide/layout-system-complete-guide.md) - 布局详解
5. [API 总结](./api/README.md) - 快速参考
6. [主应用开发](./guide/main-app.md) - 核心模块
7. [iframe 治理](./guide/iframe-governance.md) - 安全策略
8. [部署指南](./guide/deployment.md) - 部署流程

---

## ❓ 常见问题

### Q: 我应该从哪个文档开始？

**A**: 如果你是新手，请从 [快速开始](./guide/getting-started.md) 开始。如果已有微前端经验，可以直接阅读 [项目概述](./guide/overview.md)。

### Q: 如何快速查找某个 API 的用法？

**A**: 使用 [API 总结](./api/README.md)，这是所有 API 的快速参考手册。

### Q: 想了解某种子应用类型如何开发？

**A**: 查看 [子应用开发](./guide/sub-apps.md) 中对应的章节（Vue3/Vue2/iframe/link）。

### Q: 布局配置不生效怎么办？

**A**: 阅读 [布局系统完整指南](./guide/layout-system-complete-guide.md) 中的"故障排除"部分。

### Q: Iframe 通信失败？

**A**: 查看 [iframe 跨域治理](./guide/iframe-governance.md) 了解安全策略和通信协议。

---

## 📝 文档更新记录

- **2024-02-26**: 重写项目概述、快速开始、主应用、子应用文档
- **2024-02-25**: 创建 API 总结文档
- **2024-02-24**: 更新布局系统文档
- **2024-02-23**: 完善 iframe 治理文档

---

## 🤝 贡献文档

发现文档有误或缺失？欢迎提交 PR 帮助我们改进文档！

- 指出文档中的错误
- 补充缺失的内容
- 提供示例代码
- 改善文档结构

---

<div align="center">

**📖 愉快阅读！如有问题，随时在 GitHub Issues 中提出。**

</div>
