<template>
  <div class="sub-app-page">
    <div class="page-header">
      <div class="header-left">
        <h3>{{ appConfig?.name || '子应用' }}</h3>
        <el-tag v-if="appConfig" :type="getStatusType(appConfig.status)" size="small">
          {{ appConfig.status === 'online' ? '在线' : '离线' }}
        </el-tag>
        <el-tag v-if="appConfig" size="small">{{ appConfig.type }}</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="handleReload" :loading="reloading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button 
          v-if="appConfig?.status === 'online'"
          type="danger"
          @click="handleOffline"
        >
          下线
        </el-button>
        <el-button 
          v-else
          type="success"
          @click="handleOnline"
        >
          上线
        </el-button>
      </div>
    </div>
    
    <div v-if="appConfig?.status === 'offline'" class="offline-notice">
      <el-result
        icon="warning"
        title="应用已下线"
        sub-title="该子应用当前处于离线状态，无法加载"
      >
        <template #extra>
          <el-button type="primary" @click="handleOnline">立即上线</el-button>
          <el-button @click="goBack">返回首页</el-button>
        </template>
      </el-result>
    </div>
    
    <div v-else class="app-content">
      <!-- qiankun 子应用 -->
      <MicroAppContainer
        v-if="appConfig && (appConfig.type === 'vue3' || appConfig.type === 'vue2')"
        ref="microAppRef"
        :key="currentAppId"
        :app-id="currentAppId"
        :sub-path="subPath"
        @mounted="handleMounted"
        @unmounted="handleUnmounted"
        @error="handleError"
      />
      
      <!-- iframe 子应用 -->
      <IframeContainer
        v-else-if="appConfig && appConfig.type === 'iframe'"
        ref="iframeRef"
        :key="currentAppId"
        :id="currentAppId"
        :src="appConfig.entry + (subPath ? `/#${subPath}` : '')"
        @loaded="handleIframeLoaded"
        @error="handleError"
      />
      
      <!-- link 类型 -->
      <div v-else-if="appConfig && appConfig.type === 'link'" class="link-notice">
        <el-result
          icon="info"
          title="外部链接"
          :sub-title="`该应用将在新窗口打开：${appConfig.entry}`"
        >
          <template #extra>
            <el-button type="primary" @click="openLink">打开链接</el-button>
          </template>
        </el-result>
      </div>
      
      <!-- 未知应用 -->
      <div v-else class="not-found">
        <el-result
          icon="error"
          title="应用不存在"
          sub-title="未找到指定的子应用配置"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回首页</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getMicroApp } from '@/config/microApps'
import { microAppManager } from '@/core/microAppManager'
import MicroAppContainer from '@/components/MicroAppContainer.vue'
import IframeContainer from '@/components/IframeContainer.vue'
import { Refresh } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const microAppRef = ref(null)
const iframeRef = ref(null)
const reloading = ref(false)

// 获取当前应用ID
const currentAppId = computed(() => {
  // 优先从 meta 获取
  if (route.meta.appId) {
    return route.meta.appId
  }
  // 从路由参数获取
  return route.params.appId
})

// 获取子路径
const subPath = computed(() => {
  return route.query.subPath || ''
})

// 获取应用配置
const appConfig = computed(() => {
  return getMicroApp(currentAppId.value)
})

function getStatusType(status) {
  return status === 'online' ? 'success' : 'danger'
}

async function handleReload() {
  reloading.value = true
  try {
    if (microAppRef.value) {
      await microAppRef.value.reload()
    }
    if (iframeRef.value) {
      iframeRef.value.reload()
    }
  } finally {
    reloading.value = false
  }
}

function handleOffline() {
  appStore.setAppStatus(currentAppId.value, 'offline')
  microAppManager.setAppStatus(currentAppId.value, 'offline')
}

function handleOnline() {
  appStore.setAppStatus(currentAppId.value, 'online')
  microAppManager.setAppStatus(currentAppId.value, 'online')
}

function handleMounted(result) {
  console.log('[SubAppPage] App mounted:', result)
}

function handleUnmounted(instanceId) {
  console.log('[SubAppPage] App unmounted:', instanceId)
}

function handleIframeLoaded(iframe) {
  console.log('[SubAppPage] iframe loaded:', iframe)
}

function handleError(error) {
  console.error('[SubAppPage] Error:', error)
}

function openLink() {
  if (appConfig.value) {
    window.open(appConfig.value.entry, '_blank')
  }
}

function goBack() {
  router.push('/')
}

// 监听应用ID变化
watch(currentAppId, (newId) => {
  if (newId) {
    appStore.setActiveApp(newId)
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.sub-app-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    
    h3 {
      margin: 0;
      font-size: 16px;
    }
  }
  
  .header-right {
    display: flex;
    gap: 10px;
  }
}

.offline-notice,
.link-notice,
.not-found {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
</style>
