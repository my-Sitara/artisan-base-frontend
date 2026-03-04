<template>
  <div class="multi-app-page">
    <div class="page-header">
      <h3>多应用同屏展示</h3>
      <div class="header-actions">
        <el-select v-model="layoutMode" style="width: 120px; margin-right: 10px;">
          <el-option label="网格布局" value="grid" />
          <el-option label="自由布局" value="free" />
          <el-option label="标签页" value="tabs" />
          <el-option label="左右分屏" value="split" />
        </el-select>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          添加应用
        </el-button>
      </div>
    </div>
    
    <!-- 网格布局 -->
    <div v-if="layoutMode === 'grid'" class="grid-layout">
      <el-row :gutter="15">
        <el-col 
          v-for="app in appPanels" 
          :key="app.id"
          :span="gridSpan"
        >
          <el-card class="app-card">
            <template #header>
              <div class="app-panel-header">
                <div class="app-panel-title">
                  <span>{{ app.name }}</span>
                  <el-tag size="small" type="info">{{ app.type }}</el-tag>
                </div>
                <div class="app-panel-actions">
                  <el-button 
                    type="primary" 
                    link 
                    size="small"
                    @click="refreshApp(app.id)"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                  <el-button 
                    type="danger" 
                    link 
                    size="small"
                    @click="removeApp(app.id)"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="app-container" :id="`app-container-${app.id}`">
              <!-- 子应用容器 -->
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 自由布局（可拖拽可调整大小） -->
    <div v-else-if="layoutMode === 'free'" class="free-layout" ref="freeLayoutRef">
      <div
        v-for="app in appPanels"
        :key="app.id"
        class="free-panel"
        :style="getPanelStyle(app)"
        @mousedown="startDrag($event, app)"
      >
        <div class="panel-header" @mousedown.stop="startDrag($event, app)">
          <div class="panel-title">
            <span>{{ app.name }}</span>
            <el-tag size="small" type="info">{{ app.type }}</el-tag>
          </div>
          <div class="panel-actions">
            <el-button type="primary" link size="small" @click.stop="refreshApp(app.id)">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button type="danger" link size="small" @click.stop="removeApp(app.id)">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="panel-content" :id="`app-container-${app.id}`">
          <!-- 子应用容器 -->
        </div>
        <div class="resize-handle" @mousedown.stop="startResize($event, app)"></div>
      </div>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 标签页布局 -->
    <div v-else-if="layoutMode === 'tabs'" class="tabs-layout">
      <el-tabs 
        v-model="activeTabId" 
        type="card" 
        closable 
        @tab-remove="removeApp"
      >
        <el-tab-pane
          v-for="app in appPanels"
          :key="app.id"
          :label="app.name"
          :name="app.id"
        >
          <div class="app-container" :id="`app-container-${app.id}`">
            <!-- 子应用容器 -->
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 分屏布局 -->
    <div v-else-if="layoutMode === 'split'" class="split-layout">
      <div 
        v-for="(app, index) in appPanels.slice(0, 2)" 
        :key="app.id"
        class="split-panel"
        :style="{ width: splitWidths[index] }"
      >
        <div class="panel-header">
          <div class="panel-title">
            <span>{{ app.name }}</span>
            <el-tag size="small" type="info">{{ app.type }}</el-tag>
          </div>
          <div class="panel-actions">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="refreshApp(app.id)"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small"
              @click="removeApp(app.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="panel-content" :id="`app-container-${app.id}`">
          <!-- 子应用容器 -->
        </div>
      </div>
      <div 
        v-if="appPanels.length === 2" 
        class="split-resizer"
        @mousedown="startSplitResize"
      ></div>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 添加应用对话框 -->
    <el-dialog v-model="showAddDialog" title="添加应用" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="选择应用">
          <el-select v-model="addForm.appId" placeholder="请选择应用" style="width: 100%;">
            <el-option
              v-for="app in availableApps"
              :key="app.id"
              :label="app.name"
              :value="app.id"
            >
              <span>{{ app.name }}</span>
              <el-tag size="small" style="margin-left: 10px;">{{ app.type }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input v-model="addForm.name" placeholder="自定义显示名称（可选）" />
        </el-form-item>
        <el-form-item label="子路径">
          <el-input v-model="addForm.subPath" placeholder="子应用内部路径（可选）" />
        </el-form-item>
        <el-form-item v-if="layoutMode === 'free'" label="宽度">
          <el-input-number v-model="addForm.width" :min="300" :max="1200" :step="50" />
        </el-form-item>
        <el-form-item v-if="layoutMode === 'free'" label="高度">
          <el-input-number v-model="addForm.height" :min="200" :max="800" :step="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddApp">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { microAppManager } from '@/core/microAppManager'
import { iframeLoader } from '@/core/iframeLoader'
import { getMicroApp } from '@/config/microApps'
import { Plus, Refresh, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'artisan-multi-apps'

const appStore = useAppStore()

// 布局模式
const layoutMode = ref('grid')

// 应用面板列表
const appPanels = ref([])

// 当前激活的标签
const activeTabId = ref('')

// 自由布局容器
const freeLayoutRef = ref(null)

// 分屏宽度
const splitWidths = ref(['50%', '50%'])

// 添加对话框
const showAddDialog = ref(false)
const addForm = reactive({
  appId: '',
  name: '',
  subPath: '',
  width: 500,
  height: 400
})

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  isResizing: false,
  target: null,
  startX: 0,
  startY: 0,
  startLeft: 0,
  startTop: 0,
  startWidth: 0,
  startHeight: 0
})

// 面板ID计数器
let panelCounter = 0

// 可用应用列表
const { onlineApps: availableApps } = storeToRefs(appStore)

// 网格列数
const gridSpan = computed(() => {
  const count = appPanels.value.length
  if (count === 1) return 24
  if (count === 2) return 12
  if (count <= 4) return 12
  return 8
})

// 获取面板样式（自由布局）
function getPanelStyle(app) {
  return {
    left: `${app.x || 20}px`,
    top: `${app.y || 20}px`,
    width: `${app.width || 500}px`,
    height: `${app.height || 400}px`
  }
}

// 开始拖拽
function startDrag(event, app) {
  if (layoutMode.value !== 'free') return
  
  dragState.isDragging = true
  dragState.target = app
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.startLeft = app.x || 20
  dragState.startTop = app.y || 20
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(event) {
  if (!dragState.isDragging || !dragState.target) return
  
  const dx = event.clientX - dragState.startX
  const dy = event.clientY - dragState.startY
  
  dragState.target.x = Math.max(0, dragState.startLeft + dx)
  dragState.target.y = Math.max(0, dragState.startTop + dy)
}

function stopDrag() {
  dragState.isDragging = false
  dragState.target = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  saveLayout()
}

// 开始调整大小
function startResize(event, app) {
  dragState.isResizing = true
  dragState.target = app
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.startWidth = app.width || 500
  dragState.startHeight = app.height || 400
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(event) {
  if (!dragState.isResizing || !dragState.target) return
  
  const dx = event.clientX - dragState.startX
  const dy = event.clientY - dragState.startY
  
  dragState.target.width = Math.max(300, dragState.startWidth + dx)
  dragState.target.height = Math.max(200, dragState.startHeight + dy)
}

function stopResize() {
  dragState.isResizing = false
  dragState.target = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  saveLayout()
}

// 分屏拖拽
function startSplitResize(event) {
  const startX = event.clientX
  const container = event.target.parentElement
  const containerWidth = container.offsetWidth
  
  function onMove(e) {
    const dx = e.clientX - startX
    const percent = ((containerWidth / 2 + dx) / containerWidth) * 100
    const clamped = Math.max(20, Math.min(80, percent))
    splitWidths.value = [`${clamped}%`, `${100 - clamped}%`]
  }
  
  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    saveLayout()
  }
  
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// 添加应用
async function handleAddApp() {
  if (!addForm.appId) return
  
  // 防止重复添加同一应用
  const alreadyAdded = appPanels.value.some(p => p.appId === addForm.appId)
  if (alreadyAdded) {
    ElMessage.warning('该应用已在同屏中，无法重复添加')
    return
  }
  
  const appConfig = getMicroApp(addForm.appId)
  if (!appConfig) return
  
  const panelId = `panel-${++panelCounter}-${Date.now()}`
  const panel = {
    id: panelId,
    appId: addForm.appId,
    name: addForm.name || appConfig.name,
    type: appConfig.type,
    subPath: addForm.subPath,
    loaded: false,
    x: 20 + (appPanels.value.length % 3) * 30,
    y: 20 + (appPanels.value.length % 3) * 30,
    width: addForm.width,
    height: addForm.height
  }
  
  appPanels.value.push(panel)
  showAddDialog.value = false
  
  // 重置表单
  addForm.appId = ''
  addForm.name = ''
  addForm.subPath = ''
  addForm.width = 500
  addForm.height = 400
  
  await nextTick()
  loadApp(panel)
  
  activeTabId.value = panelId
  saveLayout()
}

// 加载应用到面板
async function loadApp(panel) {
  const container = document.getElementById(`app-container-${panel.id}`)
  if (!container) return
  
  const appConfig = getMicroApp(panel.appId)
  if (!appConfig) return
  
  try {
    if (appConfig.type === 'iframe') {
      iframeLoader.load({
        id: panel.id,
        src: appConfig.entry + (panel.subPath ? `/#${panel.subPath}` : ''),
        container: container,
        autoHeight: false,
        style: { height: '100%' }
      })
    } else {
      // 如果应用已被其他页面加载，先卸载
      if (microAppManager.isAppLoaded(panel.appId)) {
        await microAppManager.unload(panel.appId)
      }
      await microAppManager.load(panel.appId, container, {
        props: { subPath: panel.subPath }
      })
    }
    panel.loaded = true
  } catch (error) {
    console.error(`[MultiApp] Failed to load ${panel.appId}:`, error)
  }
}

// 刷新应用
async function refreshApp(panelId) {
  const panel = appPanels.value.find(p => p.id === panelId)
  if (!panel) return
  
  const appConfig = getMicroApp(panel.appId)
  if (!appConfig) return
  
  if (appConfig.type === 'iframe') {
    iframeLoader.reload(panelId)
  } else {
    if (microAppManager.isAppLoaded(panel.appId)) {
      await microAppManager.unload(panel.appId)
    }
    panel.loaded = false
    await nextTick()
    await loadApp(panel)
  }
}

// 移除应用
async function removeApp(panelId) {
  const index = appPanels.value.findIndex(p => p.id === panelId)
  if (index === -1) return
  
  const panel = appPanels.value[index]
  const appConfig = getMicroApp(panel.appId)
  
  if (appConfig?.type === 'iframe') {
    iframeLoader.unload(panelId)
  } else if (microAppManager.isAppLoaded(panel.appId)) {
    await microAppManager.unload(panel.appId)
  }
  
  appPanels.value.splice(index, 1)
  
  if (activeTabId.value === panelId && appPanels.value.length > 0) {
    activeTabId.value = appPanels.value[0].id
  }
  
  saveLayout()
}

// 持久化：保存到 localStorage（跨刷新保持）
function saveLayout() {
  const data = {
    layoutMode: layoutMode.value,
    splitWidths: splitWidths.value,
    activeTabId: activeTabId.value,
    panels: appPanels.value.map(p => ({
      appId: p.appId,
      name: p.name,
      type: p.type,
      subPath: p.subPath,
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height
    }))
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
  }
}

// 持久化：从 localStorage 恢复并重新加载应用
async function restoreLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    
    const data = JSON.parse(raw)
    if (!data.panels || data.panels.length === 0) return
    
    layoutMode.value = data.layoutMode || 'grid'
    splitWidths.value = data.splitWidths || ['50%', '50%']
    activeTabId.value = data.activeTabId || ''
    
    for (const saved of data.panels) {
      const appConfig = getMicroApp(saved.appId)
      if (!appConfig || appConfig.status !== 'online') continue
      
      const panelId = `panel-${++panelCounter}-${Date.now()}`
      appPanels.value.push({
        id: panelId,
        appId: saved.appId,
        name: saved.name || appConfig.name,
        type: saved.type || appConfig.type,
        subPath: saved.subPath || '',
        loaded: false,
        x: saved.x || 20,
        y: saved.y || 20,
        width: saved.width || 500,
        height: saved.height || 400
      })
    }
    
    if (appPanels.value.length > 0 && !activeTabId.value) {
      activeTabId.value = appPanels.value[0].id
    }
    
    await nextTick()
    for (const panel of appPanels.value) {
      await loadApp(panel)
    }
  } catch (e) {
    console.warn('[MultiApp] Failed to restore layout:', e)
  }
}

// 监听布局模式变化
watch(layoutMode, () => {
  saveLayout()
})

onMounted(() => {
  restoreLayout()
})

// 页面卸载时仅清理 iframe 类型的应用
// qiankun 应用的卸载交给目标页面的 MicroAppContainer 处理，避免竞态条件
onBeforeUnmount(() => {
  appPanels.value.forEach(panel => {
    const appConfig = getMicroApp(panel.appId)
    if (appConfig?.type === 'iframe') {
      iframeLoader.unload(panel.id)
    }
    // qiankun 应用不在此处卸载，由导航目标页面处理
  })
})
</script>

<style lang="scss" scoped>
.multi-app-page {
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
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.app-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-panel-title,
.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
}

.grid-layout {
  flex: 1;
  padding: 15px;
  overflow: auto;
  
  .app-card {
    height: 400px;
    margin-bottom: 15px;
    
    :deep(.el-card__body) {
      height: calc(100% - 50px);
      padding: 0;
    }
  }
  
  .app-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}

.free-layout {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #f5f7fa;
  
  .free-panel {
    position: absolute;
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e6e6e6;
      cursor: move;
      user-select: none;
    }
    
    .panel-content {
      flex: 1;
      overflow: auto;
    }
    
    .resize-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 16px;
      height: 16px;
      cursor: se-resize;
      background: linear-gradient(135deg, transparent 50%, #ddd 50%);
      border-radius: 0 0 4px 0;
    }
  }
}

.tabs-layout {
  flex: 1;
  padding: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  :deep(.el-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .el-tabs__content {
      flex: 1;
      overflow: hidden;
      
      .el-tab-pane {
        height: 100%;
      }
    }
  }
  
  .app-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}

.split-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  
  .split-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e6e6e6;
    }
    
    .panel-content {
      flex: 1;
      overflow: auto;
    }
  }
  
  .split-resizer {
    width: 6px;
    background-color: #e6e6e6;
    cursor: col-resize;
    
    &:hover {
      background-color: #409EFF;
    }
  }
}
</style>
