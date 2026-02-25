<template>
  <div class="app-management-page">
    <div class="page-header">
      <h3>子应用加载管理</h3>
      <div class="header-actions">
        <el-button @click="handleRefreshAll">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
        <el-button type="danger" @click="handleClearErrors">
          清空错误日志
        </el-button>
      </div>
    </div>
    
    <!-- 应用列表 -->
    <el-card class="apps-table-card">
      <template #header>
        <span>微应用列表</span>
      </template>
      
      <el-table :data="apps" style="width: 100%;" row-key="id">
        <el-table-column prop="id" label="应用ID" width="150" />
        <el-table-column prop="name" label="应用名称" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entry" label="入口地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'online'"
              active-text="在线"
              inactive-text="离线"
              @change="(val) => handleStatusChange(row.id, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column label="lastModified" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastModified) }}
          </template>
        </el-table-column>
        <el-table-column prop="preload" label="预加载" width="100">
          <template #default="{ row }">
            <el-tag :type="row.preload ? 'success' : 'info'" size="small">
              {{ row.preload ? '是' : '否' }}
            </el-tag>
            <el-tag 
              v-if="preloadStatus[row.id]" 
              type="success" 
              size="small"
              style="margin-left: 5px;"
            >
              已预加载
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="handlePreload(row.id)"
              :disabled="row.type === 'iframe'"
            >
              预加载
            </el-button>
            <el-button 
              type="warning" 
              link 
              size="small"
              @click="handleForceRefresh(row.id)"
            >
              强制刷新
            </el-button>
            <el-button 
              type="info" 
              link 
              size="small"
              @click="showAppDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              type="success" 
              link 
              size="small"
              @click="showEditApp(row)"
            >
              配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 错误日志 -->
    <el-card class="error-logs-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>错误日志</span>
          <el-badge :value="errorLogs.length" type="danger" />
        </div>
      </template>
      
      <el-table :data="errorLogs" style="width: 100%;" max-height="300">
        <el-table-column prop="appId" label="应用ID" width="150" />
        <el-table-column prop="message" label="错误信息" min-width="300" show-overflow-tooltip />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.time) }}
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="errorLogs.length === 0" description="暂无错误日志" />
    </el-card>
    
    <!-- 应用详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="应用详情" width="600px">
      <el-descriptions v-if="currentApp" :column="2" border>
        <el-descriptions-item label="应用ID">{{ currentApp.id }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ currentApp.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentApp.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentApp.status === 'online' ? 'success' : 'danger'">
            {{ currentApp.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入口地址" :span="2">{{ currentApp.entry }}</el-descriptions-item>
        <el-descriptions-item label="激活规则">{{ currentApp.activeRule }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ currentApp.version }}</el-descriptions-item>
        <el-descriptions-item label="lastModified" :span="2">
          {{ formatTime(currentApp.lastModified) }}
        </el-descriptions-item>
        <el-descriptions-item label="预加载">{{ currentApp.preload ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="布局类型">{{ currentApp.layoutType }}</el-descriptions-item>
        <el-descriptions-item label="布局选项" :span="2">
          <pre>{{ JSON.stringify(currentApp.layoutOptions, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 应用配置对话框 -->
    <el-dialog v-model="showEditDialog" title="子应用配置" width="650px">
      <el-form 
        v-if="editForm" 
        :model="editForm" 
        label-width="100px"
        label-position="right"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="应用ID">
          <el-input :model-value="editForm.id" disabled />
        </el-form-item>
        <el-form-item label="应用名称">
          <el-input v-model="editForm.name" placeholder="输入应用名称" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type" style="width: 100%;">
            <el-option label="Vue3" value="vue3" />
            <el-option label="Vue2" value="vue2" />
            <el-option label="iframe" value="iframe" />
            <el-option label="外部链接" value="link" />
          </el-select>
        </el-form-item>
        <el-form-item label="入口地址">
          <el-input v-model="editForm.entry" placeholder="//localhost:7080" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="editForm.version" placeholder="1.0.0" />
        </el-form-item>
        <el-form-item label="激活规则">
          <el-input v-model="editForm.activeRule" placeholder="/vue3" />
        </el-form-item>
        <el-form-item label="预加载">
          <el-switch v-model="editForm.preload" />
        </el-form-item>

        <el-divider content-position="left">布局配置</el-divider>
        <el-form-item label="布局类型">
          <el-select v-model="editForm.layoutType" style="width: 100%;">
            <el-option label="默认布局" value="default" />
            <el-option label="全屏布局" value="full" />
            <el-option label="标签页布局" value="tabs" />
            <el-option label="嵌入式布局" value="embedded" />
            <el-option label="空白布局" value="blank" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示头部">
          <el-switch v-model="editForm.layoutOptions.showHeader" />
        </el-form-item>
        <el-form-item label="显示侧边栏">
          <el-switch v-model="editForm.layoutOptions.showSidebar" />
        </el-form-item>
        <el-form-item label="KeepAlive">
          <el-switch v-model="editForm.layoutOptions.keepAlive" />
        </el-form-item>
        <el-form-item label="多标签模式">
          <el-switch v-model="editForm.layoutOptions.multiTab" />
        </el-form-item>

        <el-divider content-position="left">Props 配置</el-divider>
        <el-form-item label="路由基础路径">
          <el-input v-model="editForm.routerBase" placeholder="/vue3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { microAppManager } from '@/core/microAppManager'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const appStore = useAppStore()

const { apps } = storeToRefs(appStore)
const errorLogs = computed(() => microAppManager.errorLogs)
const preloadStatus = computed(() => microAppManager.preloadStatus)

const showDetailDialog = ref(false)
const currentApp = ref(null)

const showEditDialog = ref(false)
const editForm = ref(null)

function getTypeTagType(type) {
  const typeMap = {
    vue3: 'success',
    vue2: 'warning',
    iframe: 'info',
    link: ''
  }
  return typeMap[type] || ''
}

function formatTime(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function handleStatusChange(appId, online) {
  const status = online ? 'online' : 'offline'
  appStore.setAppStatus(appId, status)
  microAppManager.setAppStatus(appId, status)
}

async function handlePreload(appId) {
  await microAppManager.preload([appId])
}

async function handleForceRefresh(appId) {
  if (microAppManager.isAppLoaded(appId)) {
    await microAppManager.reload(appId)
  }
}

function handleRefreshAll() {
  appStore.refreshApps()
}

function handleClearErrors() {
  microAppManager.clearErrorLogs()
}

function showAppDetail(app) {
  currentApp.value = app
  showDetailDialog.value = true
}

function showEditApp(app) {
  editForm.value = {
    id: app.id,
    name: app.name,
    type: app.type,
    entry: app.entry,
    version: app.version,
    activeRule: app.activeRule || '',
    preload: app.preload || false,
    layoutType: app.layoutType || 'default',
    layoutOptions: {
      showHeader: app.layoutOptions?.showHeader ?? true,
      showSidebar: app.layoutOptions?.showSidebar ?? true,
      keepAlive: app.layoutOptions?.keepAlive ?? false,
      multiTab: app.layoutOptions?.multiTab ?? false
    },
    routerBase: app.props?.routerBase || ''
  }
  showEditDialog.value = true
}

function handleSaveEdit() {
  if (!editForm.value) return
  
  const config = {
    name: editForm.value.name,
    type: editForm.value.type,
    entry: editForm.value.entry,
    version: editForm.value.version,
    activeRule: editForm.value.activeRule,
    preload: editForm.value.preload,
    layoutType: editForm.value.layoutType,
    layoutOptions: { ...editForm.value.layoutOptions },
    props: {
      routerBase: editForm.value.routerBase
    }
  }
  
  appStore.updateApp(editForm.value.id, config)
  showEditDialog.value = false
  ElMessage.success('配置已保存')
}

onMounted(() => {
  // 预加载配置了 preload 的应用
  microAppManager.preload()
})
</script>

<style lang="scss" scoped>
.app-management-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
}

.apps-table-card,
.error-logs-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

:deep(.el-descriptions) {
  pre {
    margin: 0;
    font-size: 12px;
    white-space: pre-wrap;
  }
}
</style>
