<template>
  <div class="iframe-container">
    <div v-if="loading" class="loading-wrapper">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="error-wrapper">
      <el-result
        icon="error"
        title="加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="handleRetry">重试</el-button>
        </template>
      </el-result>
    </div>
    <div 
      v-show="!loading && !error"
      ref="containerRef"
      class="iframe-wrapper"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { iframeLoader } from '@/core/iframeLoader'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  src: {
    type: String,
    required: true
  },
  autoHeight: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['loaded', 'error'])

const containerRef = ref(null)
const loading = ref(true)
const error = ref(null)

function loadIframe() {
  if (!containerRef.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const iframe = iframeLoader.load({
      id: props.id,
      src: props.src,
      container: containerRef.value,
      autoHeight: props.autoHeight
    })
    
    iframe.onload = () => {
      loading.value = false
      emit('loaded', iframe)
    }
    
    iframe.onerror = (err) => {
      loading.value = false
      error.value = 'iframe 加载失败'
      emit('error', err)
    }
  } catch (err) {
    loading.value = false
    error.value = err.message
    emit('error', err)
  }
}

function handleRetry() {
  iframeLoader.reload(props.id)
  loadIframe()
}

watch(() => props.src, () => {
  iframeLoader.unload(props.id)
  loadIframe()
})

onMounted(() => {
  loadIframe()
})

onUnmounted(() => {
  iframeLoader.unload(props.id)
})

defineExpose({
  reload: () => {
    iframeLoader.reload(props.id)
  },
  send: (message) => {
    iframeLoader.send(props.id, message)
  }
})
</script>

<style lang="scss" scoped>
.iframe-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.loading-wrapper,
.error-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.iframe-wrapper {
  width: 100%;
  height: 100%;
}
</style>
