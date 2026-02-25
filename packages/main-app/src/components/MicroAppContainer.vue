<template>
  <div class="micro-app-container">
    <!-- 加载遮罩层：覆盖在容器上方，不影响容器DOM -->
    <div v-if="loading" class="loading-overlay">
      <el-skeleton :rows="5" animated />
    </div>
    <!-- 错误提示：替换容器显示 -->
    <div v-if="error" class="error-wrapper">
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
    <!-- 容器始终保持在DOM中且可见，确保 qiankun 能正确挂载 -->
    <div 
      v-show="!error"
      ref="containerRef"
      class="app-container"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { microAppManager } from '@/core/microAppManager'
import { useRouter } from 'vue-router'

const props = defineProps({
  appId: {
    type: String,
    required: true
  },
  subPath: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['mounted', 'unmounted', 'error'])

const router = useRouter()
const containerRef = ref(null)
const loading = ref(true)
const error = ref(null)

async function loadApp() {
  if (!containerRef.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // 如果应用已被其他页面加载（如 MultiInstancePage），先卸载
    // 这处理了页面切换时的清理时序问题
    if (microAppManager.isAppLoaded(props.appId)) {
      console.log(`[MicroAppContainer] App ${props.appId} already loaded, unloading first`)
      await microAppManager.unload(props.appId)
    }
    
    const result = await microAppManager.load(
      props.appId,
      containerRef.value,
      {
        props: {
          subPath: props.subPath
        },
        mainRouter: router
      }
    )
    
    emit('mounted', result)
  } catch (err) {
    error.value = err.message
    emit('error', err)
  } finally {
    loading.value = false
  }
}

async function unloadApp() {
  if (microAppManager.isAppLoaded(props.appId)) {
    await microAppManager.unload(props.appId)
    emit('unmounted', props.appId)
  }
}

function handleRetry() {
  loadApp()
}

watch(() => props.appId, async (newId, oldId) => {
  if (newId !== oldId) {
    await unloadApp()
    await loadApp()
  }
})

onMounted(() => {
  loadApp()
})

// 必须在 onBeforeUnmount 中卸载，而非 onUnmounted
// onUnmounted 时组件 DOM 已从文档中移除，qiankun 子应用的 Vue 实例
// 在 unmount 时找不到有效的 vnode（已为 null），导致报错
onBeforeUnmount(async () => {
  // 只卸载状态为 mounted 的应用，避免干扰正在进行的加载操作
  const appInfo = microAppManager.loadedApps[props.appId]
  if (appInfo && appInfo.status === 'mounted') {
    await unloadApp()
  }
})

defineExpose({
  reload: async () => {
    await unloadApp()
    await loadApp()
  }
})
</script>

<style lang="scss" scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.error-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.app-container {
  width: 100%;
  height: 100%;
}
</style>
