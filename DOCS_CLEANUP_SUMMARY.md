# 文档清理总结 - 移除 Tabs 布局相关内容

## 问题描述

在之前的重构中，我们已经移除了标签页布局 (Tabs Layout) 功能，但文档中仍有多处提到 "tabs" 布局，造成文档与实际功能不一致。

## 清理范围

### 1. README.md
**修改内容**:
- ✅ 布局类型数量：`5 种` → `4 种`
- ✅ 删除了 `tabs` 布局类型的说明
- ✅ 更新特性描述：`(default/full/embedded/blank/tabs)` → `(default/full/embedded/blank)`

### 2. user-docs/guide/layout-system-complete-guide.md
**修改内容**:
- ✅ 删除整个 "3. Tabs Layout (标签页布局)" 章节 (22 行)
- ✅ 重新编号后续章节：`4. Embedded` → `3. Embedded`, `5. Blank` → `4. Blank`
- ✅ 删除约束条件表格中的 tabs 相关说明

### 3. user-docs/guide/main-app.md
**修改内容**:
- ✅ 布局管理器描述：`支持 5 种布局类型` → `支持 4 种布局类型`
- ✅ 删除 `tabs` 布局类型列表项
- ✅ MultiInstancePage 描述：`支持 grid/tabs/split布局` → `支持 grid/split布局`
- ✅ 删除持久化数据说明中的 `tabs - 标签页列表`

### 4. packages/main-app/src/docs/layout-management-guide.md
**修改内容**:
- ✅ 配置说明：`layoutType: (default, tabs, full, embedded, blank)` → `(default, full, embedded, blank)`

## 统计数据

### 文件修改
- **修改文件数**: 4 个
- **删除行数**: ~30 行
- **新增行数**: ~8 行
- **净减少**: ~22 行

### 内容一致性检查
✅ 所有文档已统一为 **4 种布局类型**
- default (默认布局)
- full (全屏布局)
- embedded (嵌入式布局)
- blank (空白布局)

❌ **已移除**: tabs (多标签页布局)

## 影响范围

### 功能说明
- 主应用不再支持 tabs 布局类型
- MultiInstancePage 不再提供 tabs 布局模式
- 不再维护 tabs 相关的状态管理 (tabs store)

### 用户影响
- 文档与实际情况保持一致
- 避免用户尝试使用不存在的 tabs 布局
- 清晰了解当前支持的 4 种布局类型

## 验证清单

- [x] README.md - 布局类型描述已更新
- [x] layout-system-complete-guide.md - 完整指南已清理
- [x] main-app.md - 主应用文档已清理
- [x] layout-management-guide.md - 布局管理指南已清理
- [x] 所有文档中的布局类型数量一致 (4 种)
- [x] 没有文档再引用 tabs 布局

## 后续建议

1. **代码层面**: 考虑删除或标记 tabs 相关的废弃代码
   - stores/tabs.js
   - 组件中的 tabs 布局实现
   - 路由中的 tabs 相关配置

2. **迁移指南**: 如果之前有用户使用 tabs 布局，建议提供迁移方案
   - 推荐使用 default + multiTab 替代
   - 或使用 MultiInstancePage 的 grid/split布局

3. **版本说明**: 在 CHANGELOG.md 中标注此破坏性变更

4. **样式修复**: 确保布局预览组件的基础样式完整
   - ✅ 已添加 `.layout-preview` 通用样式到 AppLoading.vue
   - ✅ 预览组件使用 scoped styles 保持独立性
