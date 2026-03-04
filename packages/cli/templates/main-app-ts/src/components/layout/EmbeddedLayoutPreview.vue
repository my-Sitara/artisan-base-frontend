<template>
  <div class="layout-preview embedded-layout">
    <div class="preview-container">
      <!-- Sider 可选显示 -->
      <div class="preview-sidebar" v-if="layoutOptions.showSidebar">
        <div class="preview-menu-item active">应用管理</div>
        <div class="preview-menu-item">系统设置</div>
      </div>
      
      <!-- 主区域 -->
      <div class="preview-main">
        <!-- Header 可选显示 -->
        <div class="preview-header" v-if="layoutOptions.showHeader">
          <div class="preview-breadcrumb">首页 / 嵌入式布局</div>
        </div>
        
        <!-- 内容区域 -->
        <div class="preview-content">
          <div class="preview-content-area">
            <div class="preview-content-block">嵌入式内容区域</div>
            <div class="preview-content-block">至少显示头部或侧边栏之一</div>
          </div>
        </div>
        
        <!-- Footer 可选显示 -->
        <div class="preview-footer" v-if="layoutOptions.showFooter">
          <div class="preview-footer-content">© 2026 Artisan Base Frontend. All rights reserved.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  layoutOptions: {
    type: Object,
    required: true,
    default: () => ({
      showHeader: true,
      showSidebar: true,
      showFooter: false,
      keepAlive: false
    })
  }
})
</script>

<style lang="scss" scoped>
.embedded-layout {
  height: 400px;
}

.preview-container {
  display: flex;
  height: 100%;
}

.preview-sidebar {
  width: 200px;
  background: #304156;
  display: flex;
  flex-direction: column;
}

.preview-menu-item {
  color: #bfcbd9;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-menu-item:hover {
  background: #263445;
}

.preview-menu-item.active {
  color: #409eff;
  background: #263445;
}

.preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.preview-breadcrumb {
  color: #606266;
  font-size: 14px;
}

.preview-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
  overflow: auto;
}

.preview-content-area {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  min-height: 100%;
}

.preview-content-block {
  padding: 10px;
  margin-bottom: 10px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  text-align: center;
}

.preview-footer {
  height: 50px;
  background: #fff;
  border-top: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.preview-footer-content {
  color: #909399;
  font-size: 13px;
}
</style>
