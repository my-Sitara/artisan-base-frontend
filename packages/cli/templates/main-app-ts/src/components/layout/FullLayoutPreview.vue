<template>
  <div class="layout-preview full-layout">
    <div class="preview-full-content">
      <div class="preview-content-block">全屏内容区域</div>
      <div class="preview-content-block">无头部侧边栏</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  layoutOptions: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style lang="scss" scoped>
.full-layout {
  height: 300px;
}

.preview-full-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
}
</style>
