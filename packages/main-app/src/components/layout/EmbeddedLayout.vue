<template>
  <div class="embedded-layout">
    <div class="embedded-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>嵌入式布局</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="embedded-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.embedded-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.embedded-header {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.embedded-content {
  flex: 1;
  padding: 15px;
  overflow: auto;
}
</style>
