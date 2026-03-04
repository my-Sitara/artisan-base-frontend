<template>
  <div class="layout-preview blank-layout">
    <div class="preview-blank-content">
      <div class="preview-content-block">空白内容区域</div>
      <div class="preview-content-block">无任何装饰</div>
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
.blank-layout {
  height: 200px;
}

.preview-blank-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
}
</style>
