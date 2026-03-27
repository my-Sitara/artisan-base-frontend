<template>
  <div class="multi-app-page">
    <div class="page-header">
      <div class="header-title">
        <h3>多应用同屏展示</h3>
        <el-tooltip 
          v-if="layoutMode === 'grid-free' && appPanels.length > 0 && !isLayoutEditMode"
          content='当前为预览模式，点击"编辑布局"可调整布局'
          placement="right"
        >
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="header-actions">
        <template v-if="isLayoutEditMode">
          <!-- 编辑态：显示布局选择、添加应用、保存、取消 -->
          <el-select 
            v-model="layoutMode" 
            style="width: 150px; margin-right: 10px;"
            @change="handleLayoutModeChange"
          >
            <el-option label="网格自由布局" value="grid-free" />
            <el-option label="标签页" value="tabs" />
            <el-option label="左右分屏" value="split" />
          </el-select>
          <el-button 
            type="primary" 
            @click="handleAddApp"
            :disabled="appPanels.length >= MAX_APPS"
          >
            <el-icon><Plus /></el-icon>
            添加应用
          </el-button>
          <span class="app-count-info">
            已添加 {{ appPanels.length }} / {{ MAX_APPS }} 个应用
          </span>
          <el-button type="success" @click="saveLayoutChanges">
            <el-icon><Check /></el-icon>
            保存
          </el-button>
          <el-button @click="cancelLayoutChanges">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </template>
        <template v-else>
          <!-- 预览态：只显示编辑布局按钮 -->
          <el-button type="warning" @click="toggleLayoutEditMode">
            <el-icon><Edit /></el-icon>
            编辑布局
          </el-button>
        </template>
      </div>
    </div>
    
    <!-- 网格自由布局（使用 vue-grid-layout） -->
    <div v-if="layoutMode === 'grid-free'" class="grid-free-layout-container">
      <!-- 
        grid-layout-plus 组件配置说明：
        - col-num: 12 列网格系统（响应式会根据屏幕宽度调整）
        - row-height: 每行高度 50px
        - is-draggable: 允许拖拽移动
        - is-resizable: 允许调整大小
        - vertical-compact: true 垂直方向自动紧凑（调整大小时其他面板会移动）
        - use-css-transforms: 使用 CSS transform 优化性能
        - margin: 面板间距 [水平，垂直]
        - responsive: 启用响应式布局
      -->
      <grid-layout
        v-model:layout="responsiveLayout"
        :col-num="12"
        :row-height="50"
        :is-draggable="isLayoutEditMode"
        :is-resizable="isLayoutEditMode"
        :vertical-compact="true"
        :use-css-transforms="true"
        :margin="[10, 10]"
        :responsive="true"
        class="grid-free-layout"
        v-if="appPanels.length > 0"
      >
        <grid-item
          v-for="item in responsiveLayout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :min-w="4"
          :min-h="4"
          :static="!isLayoutEditMode"
          class="grid-item"
        >
          <el-card class="app-card">
            <template #header>
              <div class="app-panel-header">
                <div class="app-panel-title">
                  <span>{{ getPanelName(item.i) }}</span>
                  <el-tag size="small" type="info">{{ getPanelType(item.i) }}</el-tag>
                </div>
                <div class="app-panel-actions" v-if="isLayoutEditMode">
                  <el-button 
                    type="primary" 
                    link 
                    size="small"
                    @click="refreshApp(item.i)"
                    title="刷新"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                  <el-button 
                    type="success" 
                    link 
                    size="small"
                    @click="handleEditApp(item.i)"
                    title="编辑"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button 
                    type="danger" 
                    link 
                    size="small"
                    @click="removeApp(item.i)"
                    title="删除"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="app-container" :id="`app-container-${item.i}`">
              <!-- 子应用容器 -->
            </div>
          </el-card>
        </grid-item>
      </grid-layout>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用">
        <template v-if="isLayoutEditMode">
          <el-button type="primary" @click="handleAddApp">添加应用</el-button>
        </template>
        <template v-else>
          <el-button type="warning" @click="toggleLayoutEditMode">编辑布局</el-button>
        </template>
      </el-empty>
    </div>
    
    <!-- 标签页布局 -->
    <div v-else-if="layoutMode === 'tabs'" class="tabs-layout">
      <el-tabs 
        v-model="activeTabId" 
        type="card" 
        :closable="isLayoutEditMode"
        @tab-remove="removeApp"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="app in appPanels"
          :key="app.panelId"
          :label="app.name"
          :name="app.panelId"
        >
          <div class="app-container" :id="`app-container-${app.panelId}`">
            <!-- 子应用容器 -->
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 分屏布局 -->
    <div v-else-if="layoutMode === 'split'" class="split-layout">
      <!-- 分页导航按钮（左侧） -->
      <el-button 
        v-if="splitCurrentPage > 0"
        class="split-nav-prev"
        type="info"
        circle
        @click="goToSplitPrev"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      
      <!-- 当前页的应用面板 -->
      <div 
        v-for="(app, index) in splitCurrentApps" 
        :key="app.panelId"
        class="split-panel"
        :style="{ width: splitWidths[index] }"
      >
        <div class="panel-header">
          <div class="panel-title">
            <span>{{ app.name }}</span>
            <el-tag size="small" type="info">{{ app.type }}</el-tag>
          </div>
          <div class="panel-actions" v-if="isLayoutEditMode">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="refreshApp(app.panelId)"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small"
              @click="removeApp(app.panelId)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="panel-content" :id="`app-container-${app.panelId}`">
          <!-- 子应用容器 -->
        </div>
      </div>
      
      <!-- 分页导航按钮（右侧） -->
      <el-button 
        v-if="splitCurrentPage < splitTotalPages - 1"
        class="split-nav-next"
        type="info"
        circle
        @click="goToSplitNext"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
      
      <!-- 分页指示器 -->
      <div class="split-pagination" v-if="splitTotalPages > 1">
        <span>{{ splitCurrentPage + 1 }} / {{ splitTotalPages }}</span>
      </div>
      
      <div 
        v-if="appPanels.length === 0" 
        class="split-resizer"
        @mousedown="startSplitResize"
      ></div>
      
      <el-empty v-if="appPanels.length === 0" description="暂无应用，点击添加应用开始" />
    </div>
    
    <!-- 添加/编辑应用对话框 -->
    <el-dialog 
      v-model="showAppDialog" 
      :title="isEditMode ? '编辑应用' : '添加应用'" 
      width="600px"
    >
      <el-form :model="appForm" label-width="120px">
        <el-form-item label="选择应用" v-if="!isEditMode">
          <el-select v-model="appForm.appId" placeholder="请选择应用" style="width: 100%;">
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
          <el-input v-model="appForm.name" placeholder="自定义显示名称（可选）" />
        </el-form-item>
        <el-form-item label="子路径">
          <el-input v-model="appForm.subPath" placeholder="子应用内部路径（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAppDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAppDialog">
          {{ isEditMode ? '保存' : '确定' }}
        </el-button>
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
import { Plus, Refresh, Close, Edit, InfoFilled, Check, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 导入 grid-layout-plus 组件（支持 Vue 3）
import { GridLayout, GridItem } from 'grid-layout-plus'
import { saveLayout as saveLayoutToAPI, loadLayout } from '@/composables/useLayout'

console.log('[MultiInstancePage] GridLayout:', GridLayout)
console.log('[MultiInstancePage] GridItem:', GridItem)

const STORAGE_KEY = 'artisan-multi-apps'

// 使用统一的 API 层
const appStore = useAppStore()

// ============================================================================
// 状态定义
// ============================================================================

// 布局模式
const layoutMode = ref('grid-free')

// 布局编辑模式
const isLayoutEditMode = ref(false)

// 备份布局数据（用于取消时恢复）
let layoutBackup = null

// 应用面板列表（预览态和编辑态共用，编辑时修改的是副本）
const appPanels = ref([])

// 当前激活的标签
const activeTabId = ref('')

// 分屏宽度
const splitWidths = ref(['50%', '50%'])

// 分屏当前页码（每页显示 2 个应用）
const splitCurrentPage = ref(0)
const SPLIT_PAGE_SIZE = 2 // 每页显示的应用数量

// 添加/编辑对话框
const showAppDialog = ref(false)
const isEditMode = ref(false)
const editingPanelId = ref('')
const appForm = reactive({
  appId: '',
  name: '',
  subPath: ''
})

// 响应式布局（使用 ref 保持拖拽后的位置）
const responsiveLayout = ref([])
let isInitialized = false
let shouldSyncToResponsiveLayout = true // 控制是否允许同步到 responsiveLayout
let isRestoring = false // 标记是否正在恢复布局

// 面板 ID 计数器
let panelCounter = 0

// 最大应用数量限制
const MAX_APPS = 6

// ============================================================================
// 辅助函数
// ============================================================================

// 深拷贝辅助函数（避免 JSON.stringify 丢失 undefined/function 等问题）
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  
  // 处理 Date
  if (obj instanceof Date) return new Date(obj.getTime())
  
  // 处理 Array - 关键：使用解构创建新数组，切断响应式引用
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item))
  }
  
  // 处理 Object - 使用 Object.assign 创建新对象，切断响应式引用
  const cloned = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // 跳过 Vue 的响应式属性
      if (key === '__v_isRef' || key === '__v_raw' || key === '_rawValue' || key === '_shallow') {
        continue
      }
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

// 获取面板名称
function getPanelName(panelId) {
  const panel = appPanels.value.find(p => p.panelId === panelId)
  return panel ? panel.name : ''
}

// 获取面板类型
function getPanelType(panelId) {
  const panel = appPanels.value.find(p => p.panelId === panelId)
  return panel ? panel.type : ''
}

// 可用应用列表（排除 link 类型，因为 link 类型无法嵌入容器）
const availableApps = computed(() => {
  const { onlineApps } = storeToRefs(appStore)
  return onlineApps.value.filter(app => app.type !== 'link')
})

// ============================================================================
// 响应式监听器
// ============================================================================
watch(responsiveLayout, (newLayout) => {
  if (!isInitialized) return
  
  // 如果正在恢复布局，不要同步（防止初始化时的更新被保存）
  if (isRestoring) {
    return
  }
  
  // 根据新的布局顺序更新 appPanels 的 order 字段，并重新排序数组
  const newOrderMap = new Map()
  newLayout.forEach((item, index) => {
    newOrderMap.set(item.i, index + 1) // 记录每个 panel 的新顺序
    const panel = appPanels.value.find(p => p.panelId === item.i)
    if (panel) {
      panel.x = item.x
      panel.y = item.y
      panel.w = item.w
      panel.h = item.h
      panel.order = index + 1 // 根据布局中的顺序更新 order
    }
  })
  
  // 按照新的 order 重新排序 appPanels 数组，确保数组顺序与视觉顺序一致
  appPanels.value.sort((a, b) => (a.order || 0) - (b.order || 0))
}, { deep: true })

// 监听 appPanels 变化，同步到 responsiveLayout（新增/删除/初始化时）
watch(appPanels, (newPanels, oldPanels) => {
  if (!shouldSyncToResponsiveLayout) return
  
  // 按 order 字段排序
  const sortedPanels = [...newPanels].sort((a, b) => (a.order || 0) - (b.order || 0))
  
  responsiveLayout.value = sortedPanels.map(panel => ({
    i: panel.panelId,
    x: panel.x || 0,
    y: panel.y || 0,
    w: panel.w || 6,
    h: panel.h || 8
  }))
  isInitialized = true
}, { deep: true })

// ============================================================================
// 窗口响应式处理
// ============================================================================

// 监听窗口大小变化，调整布局
let resizeTimeout = null
function handleResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const screenWidth = window.innerWidth
    let effectiveColNum = 12
    
    if (screenWidth < 768) {
      effectiveColNum = 6
    } else if (screenWidth < 1024) {
      effectiveColNum = 9
    }
    
    // 只调整宽度，保持用户拖拽的位置
    // 注意：只在已初始化后才调整（避免恢复过程中被干扰）
    if (isInitialized) {
      responsiveLayout.value = responsiveLayout.value.map(item => {
        const newW = Math.min(item.w, effectiveColNum)
        const newX = Math.min(item.x, effectiveColNum - newW)
        
        return {
          ...item,
          x: Math.max(0, newX),
          w: newW
        }
      })
    }
  }, 200)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimeout)
})

// ============================================================================
// 分屏布局交互
// ============================================================================
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

// ============================================================================
// 分屏布局分页导航
// ============================================================================

// 获取分屏布局当前页的应用
const splitCurrentApps = computed(() => {
  const start = splitCurrentPage.value * SPLIT_PAGE_SIZE
  const end = start + SPLIT_PAGE_SIZE
  return appPanels.value.slice(start, end)
})

// 总页数
const splitTotalPages = computed(() => {
  return Math.ceil(appPanels.value.length / SPLIT_PAGE_SIZE)
})

// 切换到上一页
function goToSplitPrev() {
  if (splitCurrentPage.value > 0) {
    splitCurrentPage.value--
  }
}

// 切换到下一页
function goToSplitNext() {
  if (splitCurrentPage.value < splitTotalPages.value - 1) {
    splitCurrentPage.value++
  }
}

// 跳转到指定页
function goToSplitPage(page) {
  splitCurrentPage.value = Math.max(0, Math.min(page, splitTotalPages.value - 1))
}

// 监听分屏页码变化，切换时重新加载应用
watch(splitCurrentPage, async (newPage, oldPage) => {
  if (layoutMode.value !== 'split') return
  
  // 等待 DOM 更新
  await nextTick()
  
  // 如果新旧页码相同（比如删除后自动调整），也需要重新加载
  // 先卸载旧页面的所有应用
  const oldApps = appPanels.value.slice(
    oldPage * SPLIT_PAGE_SIZE,
    oldPage * SPLIT_PAGE_SIZE + SPLIT_PAGE_SIZE
  )
  
  for (const app of oldApps) {
    const appConfig = getMicroApp(app.appId)
    if (appConfig?.type === 'iframe') {
      iframeLoader.unload(app.panelId)
    } else if (microAppManager.isAppLoaded(app.appId)) {
      // qiankun 应用不卸载，由目标页面处理
    }
  }
  
  // 加载新页面的所有应用
  const newApps = appPanels.value.slice(
    newPage * SPLIT_PAGE_SIZE,
    newPage * SPLIT_PAGE_SIZE + SPLIT_PAGE_SIZE
  )
  
  for (const app of newApps) {
    const container = document.getElementById(`app-container-${app.panelId}`)
    if (container) {
      // 重置 loaded 状态，确保会重新加载
      app.loaded = false
      await nextTick()
      await loadApp(app)
    }
  }
})

// 切换布局编辑模式
function toggleLayoutEditMode() {
  if (!isLayoutEditMode.value) {
    // 进入编辑模式时备份当前数据（使用深拷贝创建副本）
    // 关键：先提取纯数据，再深拷贝，避免 Vue 响应式污染
    const purePanels = appPanels.value.map(p => ({
      panelId: p.panelId,
      appId: p.appId,
      name: p.name,
      type: p.type,
      subPath: p.subPath,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      order: p.order
    }))
    
    layoutBackup = deepClone({
      panels: purePanels,
      layoutMode: layoutMode.value,
      activeTabId: activeTabId.value,
      splitWidths: splitWidths.value
    })
    
    isLayoutEditMode.value = true
    ElMessage.info('进入编辑模式，您可以拖拽调整面板位置和大小')
  } else {
    // 如果再次点击"编辑布局"按钮（已经在编辑模式），提示用户先保存或取消
    ElMessage.warning('请先点击"保存"或"取消"按钮结束当前编辑')
  }
}

// 保存布局修改
async function saveLayoutChanges() {
  // 编辑模式下，appPanels 已经是最新的状态（包含所有新增、删除、拖拽后的结果）
  // 直接保存到后端即可
  await saveLayout()
  isLayoutEditMode.value = false
  layoutBackup = null
  ElMessage.success('布局已保存')
}

// 取消布局修改
function cancelLayoutChanges() {
  if (layoutBackup) {
    try {
      // 直接从备份恢复（深拷贝的数据）
      appPanels.value = layoutBackup.panels.map(saved => ({
        panelId: saved.panelId,
        appId: saved.appId,
        name: saved.name,
        type: saved.type,
        subPath: saved.subPath,
        loaded: false,
        x: saved.x,
        y: saved.y,
        w: saved.w,
        h: saved.h,
        order: saved.order
      }))
      
      // 恢复其他状态
      layoutMode.value = layoutBackup.layoutMode
      activeTabId.value = layoutBackup.activeTabId
      splitWidths.value = layoutBackup.splitWidths
      
      ElMessage.info('已取消修改')
      
      // 手动同步到 responsiveLayout，确保 UI 立即更新
      const sortedPanels = [...appPanels.value].sort((a, b) => (a.order || 0) - (b.order || 0))
      responsiveLayout.value = sortedPanels.map(panel => ({
        i: panel.panelId,
        x: panel.x || 0,
        y: panel.y || 0,
        w: panel.w || 6,
        h: panel.h || 8
      }))
      
      // 等待 DOM 更新后重新加载所有应用
      nextTick(() => {
        appPanels.value.forEach(panel => {
          const container = document.getElementById(`app-container-${panel.panelId}`)
          if (container) {
            loadApp(panel)
          }
        })
      })
    } catch (e) {
      ElMessage.error('恢复失败')
      console.error('恢复布局失败:', e)
    }
  }
  
  isLayoutEditMode.value = false
  layoutBackup = null
}

// 处理布局模式变化
function handleLayoutModeChange() {
  // 只有在编辑模式下才允许切换布局
  if (!isLayoutEditMode.value) {
    ElMessage.warning('请在编辑模式下切换布局')
    return
  }
  
  // 如果正在编辑，保留编辑状态和备份，不退出编辑模式
  // 用户可以在新布局模式下继续编辑，最后统一保存
  ElMessage.info('布局模式已切换，您可以继续编辑')
  // 保持 isLayoutEditMode.value = true
  // 保持 layoutBackup 不变
}

// ============================================================================
// 面板 CRUD 操作
// ============================================================================

// 添加应用
async function handleAppDialog() {
  if (!appForm.appId) return
  
  const panelId = isEditMode.value ? editingPanelId.value : `panel-${++panelCounter}-${Date.now()}`
  
  // 编辑模式：更新现有面板
  if (isEditMode.value) {
    const panel = appPanels.value.find(p => p.panelId === panelId)
    if (panel) {
      panel.name = appForm.name || panel.name
      panel.subPath = appForm.subPath || ''
    }
    showAppDialog.value = false
    isEditMode.value = false
    editingPanelId.value = ''
    ElMessage.success('保存成功')
    // 在编辑模式下，不立即保存，等用户点击"保存"按钮
    return
  }
  
  // 新增应用：获取最大的 order 值并 +1
  const maxOrder = appPanels.value.reduce((max, p) => Math.max(max, p.order || 0), 0)
  
  // 新增模式：防止重复添加同一应用
  const existingPanel = appPanels.value.find(p => p.appId === appForm.appId)
  if (existingPanel) {
    // 如果已存在，激活该面板并刷新
    if (layoutMode.value === 'tabs') {
      activeTabId.value = existingPanel.panelId
    }
    await refreshApp(existingPanel.panelId)
    ElMessage.info('该应用已在同屏中，已为您激活并刷新')
    showAppDialog.value = false
    return
  }
  
  // 检查是否超过最大应用数量限制
  if (appPanels.value.length >= MAX_APPS) {
    ElMessage.warning(`最多只能添加 ${MAX_APPS} 个应用，当前已达到上限`)
    showAppDialog.value = false
    return
  }
  
  const appConfig = getMicroApp(appForm.appId)
  if (!appConfig) return
  
  // 计算不重叠的新位置
  const newX = (panelCounter % 3) * 4
  const newY = Math.floor(panelCounter / 3) * 4
  
  const panel = {
    panelId: panelId,
    appId: appForm.appId,
    name: appForm.name || appConfig.name,
    type: appConfig.type,
    subPath: appForm.subPath,
    loaded: false,
    x: newX,
    y: newY,
    w: 6,
    h: 8,
    order: maxOrder + 1 // 新增应用时设置顺序
  }
  
  appPanels.value.push(panel)
  showAppDialog.value = false
  
  // 重置表单
  appForm.appId = ''
  appForm.name = ''
  appForm.subPath = ''
  
  await nextTick()
  
  // 在编辑模式下，需要手动同步到 responsiveLayout
  if (isLayoutEditMode.value) {
    // 手动更新 responsiveLayout，确保新面板显示
    const sortedPanels = [...appPanels.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    responsiveLayout.value = sortedPanels.map(p => ({
      i: p.panelId,
      x: p.x || 0,
      y: p.y || 0,
      w: p.w || 6,
      h: p.h || 8
    }))
  }
  
  loadApp(panel)
  
  activeTabId.value = panelId
  // 非编辑模式下立即保存
  if (!isLayoutEditMode.value) {
    saveLayout()
  }
}

// 处理添加应用（打开对话框）
function handleAddApp() {
  isEditMode.value = false
  appForm.appId = ''
  appForm.name = ''
  appForm.subPath = ''
  showAppDialog.value = true
}

// 处理编辑应用
function handleEditApp(panelId) {
  const panel = appPanels.value.find(p => p.panelId === panelId)
  if (!panel) return
  
  isEditMode.value = true
  editingPanelId.value = panelId
  appForm.appId = panel.appId
  appForm.name = panel.name
  appForm.subPath = panel.subPath || ''
  showAppDialog.value = true
}

// 加载应用到面板
async function loadApp(panel) {
  const container = document.getElementById(`app-container-${panel.panelId}`)
  if (!container) return
  
  const appConfig = getMicroApp(panel.appId)
  if (!appConfig) return
  
  try {
    if (appConfig.type === 'iframe') {
      // 先检查是否已加载
      const existingIframe = iframeLoader.get(panel.panelId)
      if (existingIframe) {
        // 如果已加载，只更新大小和容器
        const iframe = container.querySelector('iframe')
        if (iframe) {
          iframe.style.width = '100%'
          iframe.style.height = '100%'
        } else {
          // 如果容器中没有 iframe，重新加载
          iframeLoader.load({
            id: panel.panelId,
            src: appConfig.entry + (panel.subPath ? `/#${panel.subPath}` : ''),
            container: container,
            autoHeight: false,
            style: { height: '100%' }
          })
        }
      } else {
        // 否则重新加载
        iframeLoader.load({
          id: panel.panelId,
          src: appConfig.entry + (panel.subPath ? `/#${panel.subPath}` : ''),
          container: container,
          autoHeight: false,
          style: { height: '100%' }
        })
      }
    } else {
      // 处理与单独页面的冲突：先卸载已加载的实例
      // 注意：只在确实需要时才卸载，避免频繁的导航取消
      if (microAppManager.isAppLoaded(panel.appId)) {
        console.log(`[MultiApp] App ${panel.appId} already loaded, unloading first`)
        // 使用 Promise.race 防止卸载过程卡住
        await Promise.race([
          microAppManager.unload(panel.appId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Unload timeout')), 3000)
          )
        ])
      }
      // 加载应用到当前面板
      await microAppManager.load(panel.appId, container, {
        props: { subPath: panel.subPath }
      })
    }
    panel.loaded = true
  } catch (error) {
    console.error(`[MultiApp] Failed to load ${panel.appId}:`, error)
    ElMessage.error(`加载应用失败：${error.message}`)
  }
}

// ============================================================================
// 应用加载与管理
// ============================================================================

// 刷新应用
async function refreshApp(panelId) {
  const panel = appPanels.value.find(p => p.panelId === panelId)
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

// 标签点击事件处理
async function handleTabClick(tab) {
  const panelId = tab.props.name
  const panel = appPanels.value.find(p => p.panelId === panelId)
  if (panel) {
    const container = document.getElementById(`app-container-${panel.panelId}`)
    if (container) {
      await loadApp(panel)
    }
  }
}

// 移除应用
async function removeApp(panelId) {
  const index = appPanels.value.findIndex(p => p.panelId === panelId)
  if (index === -1) return
  
  const panel = appPanels.value[index]
  const appConfig = getMicroApp(panel.appId)
  
  // 在编辑模式下，直接从副本中移除
  if (isLayoutEditMode.value) {
    // 从数组中真正移除这个面板
    appPanels.value.splice(index, 1)
    
    // 如果在分屏布局且删除的是当前页的应用，检查是否需要调整页码
    if (layoutMode.value === 'split') {
      const currentPageAppsCount = splitCurrentApps.value.length
      
      // 如果当前页已经没有应用了，且不是第一页，返回上一页
      if (currentPageAppsCount === 0 && splitCurrentPage.value > 0) {
        splitCurrentPage.value--
      } else {
        // 如果还在当前页，强制重新加载当前页的所有应用
        // 因为数组顺序变化后，应用的位置可能改变了
        // 使用 nextTick 确保 Vue 响应式更新完成后再操作 DOM
        nextTick(async () => {
          await nextTick()
          setTimeout(async () => {
            const appsToReload = splitCurrentApps.value
            for (const app of appsToReload) {
              // 重置 loaded 状态和容器内容
              app.loaded = false
              const container = document.getElementById(`app-container-${app.panelId}`)
              if (container) {
                // 清空容器内容，防止残留
                container.innerHTML = ''
                await loadApp(app)
              }
            }
          }, 50)
        })
      }
    }
    
    // 如果删除的是当前激活的标签，切换到第一个或上一个标签
    if (layoutMode.value === 'tabs' && activeTabId.value === panelId) {
      if (appPanels.value.length > 0) {
        // 优先切换到前一个，如果是最后一个则切换到新的最后一个
        const newIndex = Math.min(index, appPanels.value.length - 1)
        activeTabId.value = appPanels.value[newIndex].panelId
      } else {
        activeTabId.value = ''
      }
    }
    
    // 同步到 responsiveLayout（重新计算）
    const sortedPanels = [...appPanels.value].sort((a, b) => (a.order || 0) - (b.order || 0))
    responsiveLayout.value = sortedPanels.map(p => ({
      i: p.panelId,
      x: p.x || 0,
      y: p.y || 0,
      w: p.w || 6,
      h: p.h || 8
    }))
    
    ElMessage.info('已删除，点击"保存"后生效')
    return
  }
  
  // 非编辑模式：立即卸载并保存
  if (appConfig?.type === 'iframe') {
    iframeLoader.unload(panelId)
  } else if (microAppManager.isAppLoaded(panel.appId)) {
    await microAppManager.unload(panel.appId)
  }
  
  appPanels.value.splice(index, 1)
  
  if (activeTabId.value === panelId && appPanels.value.length > 0) {
    activeTabId.value = appPanels.value[0].panelId
  }
  
  saveLayout()
}

// ============================================================================
// 数据持久化
// ============================================================================

// 持久化：保存到后端 API（通过 api/layout.js）
async function saveLayout() {
  // 按 order 字段排序后再保存，确保数据顺序正确
  const sortedPanels = [...appPanels.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  
  const data = {
    layoutMode: layoutMode.value,
    splitWidths: splitWidths.value,
    activeTabId: activeTabId.value,
    panels: sortedPanels.map(p => ({
      panelId: p.panelId,
      appId: p.appId,
      name: p.name,
      type: p.type,
      subPath: p.subPath,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      order: p.order
    }))
  }
  
  try {
    const result = await saveLayoutToAPI(data)
    return result
  } catch (error) {
    console.error('[MultiApp] Failed to save layout:', error)
    throw error
  }
}

// ============================================================================
// 布局恢复与初始化
// ============================================================================

// 持久化：从后端 API 恢复并重新加载应用（通过 composables/useLayout.ts）
async function restoreLayout() {
  try {
    const data = await loadLayout()
    if (!data || !data.panels || data.panels.length === 0) return
    
    // 设置恢复标记，防止初始化时的更新被保存
    isRestoring = true
    
    layoutMode.value = data.layoutMode || 'grid-free'
    splitWidths.value = data.splitWidths || ['50%', '50%']
    activeTabId.value = data.activeTabId || ''
    
    // 恢复布局时禁止同步到 responsiveLayout，防止位置被重置
    shouldSyncToResponsiveLayout = false
    
    // 先收集所有需要加载的应用
    const panelsToLoad = []
    const newPanels = []
    
    // 按 order 字段排序保存的数据（使用深拷贝，避免响应式污染）
    const sortedSavedPanels = [...data.panels].sort((a, b) => (a.order || 0) - (b.order || 0)).map(p => ({
      panelId: p.panelId,
      appId: p.appId,
      name: p.name,
      type: p.type,
      subPath: p.subPath,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      order: p.order
    }))
    
    for (let index = 0; index < sortedSavedPanels.length; index++) {
      const saved = sortedSavedPanels[index]
      const appConfig = getMicroApp(saved.appId)
      if (!appConfig || appConfig.status !== 'online') continue
      
      // 使用保存的 panelId，确保一致性
      const panelId = saved.panelId || `panel-${++panelCounter}-${Date.now()}`
      const panel = {
        panelId: panelId,
        appId: saved.appId,
        name: saved.name || appConfig.name,
        type: saved.type || appConfig.type,
        subPath: saved.subPath || '',
        loaded: false,
        x: saved.x || 20,
        y: saved.y || 20,
        w: saved.w || 6,
        h: saved.h || 8,
        order: saved.order || (index + 1) // 使用保存的顺序或索引 +1
      }
      newPanels.push(panel)
      panelsToLoad.push(panel)
    }
    
    // 清空并重新设置 appPanels，确保顺序正确
    appPanels.value = newPanels
    
    // 等待 DOM 渲染完成
    await nextTick()
    
    // 直接根据恢复的数据初始化 responsiveLayout（严格按照保存的 x, y, w, h）
    // 注意：必须按 sortedSavedPanels 的顺序，确保与保存时一致
    responsiveLayout.value = sortedSavedPanels.map(saved => ({
      i: saved.panelId,
      x: saved.x || 0,
      y: saved.y || 0,
      w: saved.w || 6,
      h: saved.h || 8
    }))
    isInitialized = true
    
    // 延迟加载应用，等待路由稳定
    // 这样可以避免与路由守卫的 setLoading 冲突
    setTimeout(async () => {
      try {
        // 串行加载应用，避免并发导航冲突
        for (const panel of panelsToLoad) {
          try {
            await loadApp(panel)
            // 每个应用之间间隔一小段时间，避免导航冲突
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (err) {
            console.warn(`[MultiApp] Failed to load panel ${panel.panelId}:`, err)
          }
        }
        
        // 所有应用加载完成后，才允许同步（防止初始化时的更新被保存）
        isRestoring = false
        shouldSyncToResponsiveLayout = true
      } catch (err) {
        console.error('[MultiApp] Error during app loading:', err)
        isRestoring = false
        shouldSyncToResponsiveLayout = true
      }
    }, 300)
  } catch (e) {
    console.warn('[MultiApp] Failed to restore layout:', e)
  }
}

// 监听布局模式变化
watch(layoutMode, (newMode, oldMode) => {
  saveLayout()
  
  // 布局切换时，DOM 结构会重新创建，需要重新加载应用
  nextTick(async () => {
    // 切换到标签页布局时，确保有激活的标签
    if (newMode === 'tabs' && appPanels.value.length > 0) {
      if (!activeTabId.value || !appPanels.value.some(p => p.panelId === activeTabId.value)) {
        activeTabId.value = appPanels.value[0].panelId
      }
    }
    
    // 重新加载所有应用到新的容器中
    for (const panel of appPanels.value) {
      // 对于标签页布局，只加载当前激活标签的应用
      if (newMode === 'tabs' && panel.panelId !== activeTabId.value) {
        continue
      }
      
      const container = document.getElementById(`app-container-${panel.panelId}`)
      if (container) {
        await loadApp(panel)
      }
    }
  })
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .app-count-info {
    font-size: 14px;
    color: #606266;
    margin-left: 8px;
    padding: 0 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
  
  .header-title {
    display: flex;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      line-height: 1;
    }
    
    .info-icon {
      color: #909399;
      cursor: help;
      font-size: 16px;
      margin-left: 8px;
      
      &:hover {
        color: #409EFF;
      }
    }
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

.grid-free-layout-container {
  flex: 1;
  padding: 15px;
  background-color: #f5f7fa;
  overflow: auto;
  position: relative;
}

.grid-free-layout {
  width: 100%;
  min-height: 600px;
  background-color: transparent;
}

.grid-item {
  .app-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    :deep(.el-card__header) {
      cursor: move;
      user-select: none;
      flex-shrink: 0; // 防止头部被压缩
    }
    
    :deep(.el-card__body) {
      // flex: 1;
      // overflow: auto; // 允许内容滚动
      // padding: 0;
      
      // 优化滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      }
      
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }
  }
  
  // 确保应用容器占满整个卡片内容区域
  .app-container {
    width: 100%;
    height: 100%;
    min-height: 200px; // 最小高度保证
  }
}

// vue-grid-layout 核心样式（必须！）
:deep(.vue-grid-layout) {
  position: relative;
  transition: height 200ms ease;
}

:deep(.vue-grid-item) {
  touch-action: none;
  transition: all 200ms ease;
  transition-property: left, top, right;
  
  &.no-touch {
    -ms-touch-action: none;
    touch-action: none;
  }
  
  &.cssTransforms {
    transition-property: transform;
    left: 0;
    right: auto;
  }
  
  &.resizing {
    opacity: 0.6;
    z-index: 3;
  }
  
  &.vue-draggable-dragging {
    transition: none;
    z-index: 4;
    
    &.resizing {
      opacity: 0.8;
      z-index: 5;
    }
  }
  
  &.static {
    position: relative;
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    margin-right: auto;
    margin-left: auto;
  }
  
  .vue-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEgMWwxOCAxOCIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuNSkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==') no-repeat;
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-size: contain;
    z-index: 10;
    
    &:hover {
      background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEgMWwxOCAxOCIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuOCkiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==') no-repeat;
      background-position: bottom right;
      background-size: contain;
    }
  }
}

:deep(.vue-grid-placeholder) {
  background: #999;
  opacity: 0.2;
  transition: opacity 200ms;
  border-radius: 4px;
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
        display: flex;
        flex-direction: column;
      }
    }
  }
  
  .app-container {
    flex: 1;
    width: 100%;
    overflow: auto;
    
    // 优化滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
    
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
}

.split-layout {
  flex: 1;
  display: flex;
  align-items: stretch; // 确保面板占满高度
  overflow: hidden;
  position: relative;
  
  // 分页导航按钮（左侧）
  .split-nav-prev {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
  
  // 分页导航按钮（右侧）
  .split-nav-next {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
  
  // 分页指示器
  .split-pagination {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 10;
  }
  
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
      flex-shrink: 0; // 防止头部被压缩
    }
    
    .panel-content {
      flex: 1;
      overflow: auto;
      
      // 优化滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
      }
      
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
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