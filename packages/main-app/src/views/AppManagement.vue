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
          <div style="display: flex; gap: 10px; align-items: center; width: 100%;">
            <el-select 
              v-model="editForm.layoutType" 
              style="flex: 1;" 
              @change="handleLayoutTypeChange"
              placeholder="请选择布局类型">
              <el-option label="默认布局" value="default" />
              <el-option label="全屏布局" value="full" />
              
              <el-option label="嵌入式布局" value="embedded" />
              <el-option label="空白布局" value="blank" />
            </el-select>
            <el-button type="info" @click="showLayoutPreview" size="default" :icon="View" style="height: 36px;">
              预览
            </el-button>
          </div>
          <div class="layout-description">
            <el-alert
              :title="getLayoutDescription(editForm.layoutType)"
              :type="getLayoutAlertType(editForm.layoutType)"
              show-icon
              :closable="false"
              style="margin-top: 10px;"
            />
          </div>
        </el-form-item>
        
        <!-- 布局选项分组 -->
        <el-form-item label="布局选项">
          <div class="layout-options-grid">
            <div class="layout-option-item">
              <el-switch
                v-model="layoutOptions.showHeader"
                :disabled="isOptionDisabled('showHeader')"
                :title="getOptionTitle('showHeader')"
              />
              <span :class="{'disabled-label': isOptionDisabled('showHeader')}">显示头部</span>
              <el-tag v-if="isOptionDisabled('showHeader')" size="small" type="info" effect="plain">固定</el-tag>
            </div>
            
            <div class="layout-option-item">
              <el-switch
                v-model="layoutOptions.showSidebar"
                :disabled="isOptionDisabled('showSidebar')"
                :title="getOptionTitle('showSidebar')"
              />
              <span :class="{'disabled-label': isOptionDisabled('showSidebar')}">显示侧边栏</span>
              <el-tag v-if="isOptionDisabled('showSidebar')" size="small" type="info" effect="plain">固定</el-tag>
            </div>
            
            <div class="layout-option-item">
              <el-switch
                v-model="layoutOptions.keepAlive"
                :disabled="isOptionDisabled('keepAlive')"
                :title="getOptionTitle('keepAlive')"
              />
              <span :class="{'disabled-label': isOptionDisabled('keepAlive')}">KeepAlive</span>
              <el-tag v-if="isOptionDisabled('keepAlive')" size="small" type="info" effect="plain">固定</el-tag>
            </div>
            

          </div>
          
          <!-- 布局配置提示信息 -->
          <div class="layout-hint-info" v-if="editForm.layoutType === 'embedded' && !layoutOptions.showHeader && !layoutOptions.showSidebar">
            <el-alert
              title="嵌入式布局必须至少显示头部或侧边栏之一，请选择至少一个选项。"
              type="error"
              show-icon
              :closable="false"
            />
          </div>
          

        </el-form-item>

        <el-divider content-position="left">Props 配置</el-divider>
        <el-form-item label="路由基础路径">
          <el-input v-model="editForm.routerBase" placeholder="/vue3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetLayoutOptions">恢复默认</el-button>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 布局预览对话框 -->
    <el-dialog v-model="showLayoutPreviewDialog" title="布局预览" width="80%" top="5vh">
      <div class="layout-preview-container">
        <div class="layout-preview-info">
          <el-alert
            :title="`当前预览: ${getLayoutDescription(previewLayoutType)}`"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 15px;"
          />
        </div>
        
        <div v-if="previewLayoutType === 'default'" class="layout-preview default-layout">
          <div class="preview-header">
            <div class="preview-logo">Artisan 微前端</div>
            <div class="preview-actions">
              <div class="preview-breadcrumb">首页 / 应用</div>
              <div class="preview-user">用户</div>
            </div>
          </div>
          <div class="preview-body">
            <div class="preview-sidebar">
              <div class="preview-menu-item">首页</div>
              <div class="preview-menu-item active">应用管理</div>
              <div class="preview-menu-item">系统设置</div>
            </div>
            <div class="preview-content">
              <div class="preview-content-area">
                <div class="preview-content-block">内容区域</div>
                <div class="preview-content-block">主要内容</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="previewLayoutType === 'full'" class="layout-preview full-layout">
          <div class="preview-full-content">
            <div class="preview-content-block">全屏内容区域</div>
            <div class="preview-content-block">无头部侧边栏</div>
          </div>
        </div>
        
        <div v-else-if="previewLayoutType === 'embedded'" class="layout-preview embedded-layout">
          <div class="preview-header">
            <div class="preview-breadcrumb">首页 / 应用</div>
            <div class="preview-user">用户</div>
          </div>
          <div class="preview-body">
            <div class="preview-sidebar">
              <div class="preview-menu-item">首页</div>
              <div class="preview-menu-item active">应用管理</div>
              <div class="preview-menu-item">系统设置</div>
            </div>
            <div class="preview-content">
              <div class="preview-content-area">
                <div class="preview-content-block">嵌入式内容区域</div>
                <div class="preview-content-block">至少显示头部或侧边栏之一</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="previewLayoutType === 'blank'" class="layout-preview blank-layout">
          <div class="preview-blank-content">
            <div class="preview-content-block">空白内容区域</div>
            <div class="preview-content-block">无任何装饰</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showLayoutPreviewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { microAppManager } from '@/core/microAppManager'
import { layoutManager } from '@/core/layoutManager'
import { Refresh, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const appStore = useAppStore()

const { apps } = storeToRefs(appStore)
const errorLogs = computed(() => microAppManager.errorLogs)
const preloadStatus = computed(() => microAppManager.preloadStatus)

const showDetailDialog = ref(false)
const currentApp = ref(null)
const showEditDialog = ref(false)
const editForm = ref(null)
const layoutOptions = ref({
  showHeader: true,
  showSidebar: true,
  keepAlive: false
})
const showLayoutPreviewDialog = ref(false)
const previewLayoutType = ref('default')





// 监听布局选项变化
watch(layoutOptions, (newVal) => {
  if (editForm.value) {
    // 更新布局选项
    editForm.value.layoutOptions = {
      showHeader: newVal.showHeader,
      showSidebar: newVal.showSidebar,
      keepAlive: newVal.keepAlive,
    }
  }
}, { deep: true })

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
      keepAlive: app.layoutOptions?.keepAlive ?? false
    },
    routerBase: app.props?.routerBase || ''
  }
  
  // 初始化布局选项
  layoutOptions.value = { ...editForm.value.layoutOptions }
  
  showEditDialog.value = true
}

// 当布局类型改变时，根据布局类型调整布局选项
function handleLayoutTypeChange() {
  // 根据布局类型自动设置默认选项
  switch (editForm.value.layoutType) {
    case 'default':
      // 默认布局：显示头部和侧边栏
      layoutOptions.value = {
        showHeader: true,
        showSidebar: true,
        keepAlive: false
      }
      break
    case 'full':
      // 全屏布局：不显示头部和侧边栏
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        keepAlive: false
      }
      break
    
    case 'embedded':
      // 嵌入式布局：默认显示头部和侧边栏（至少显示一个）
      layoutOptions.value = {
        showHeader: layoutOptions.value.showHeader ?? true,  // 保持现有选择，如果没有则默认为true
        showSidebar: layoutOptions.value.showSidebar ?? true,  // 保持现有选择，如果没有则默认为true
        keepAlive: false
      }
      break
    case 'blank':
      // 空白布局：不显示头部和侧边栏
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        keepAlive: false
      }
      break;
  }
  
  // 强制应用布局类型约束
  applyLayoutConstraints();
}

// 强制应用布局类型约束
function applyLayoutConstraints() {
  if (!editForm.value?.layoutType) return;
  
  // 根据布局配置定义应用约束
  const constraints = {
    'default': { showHeader: true, showSidebar: true },
    'full': { showHeader: false, showSidebar: false },
    'embedded': {},
    'blank': { showHeader: false, showSidebar: false }
  };
  
  const currentConstraints = constraints[editForm.value.layoutType];
  if (currentConstraints) {
    Object.entries(currentConstraints).forEach(([key, value]) => {
      layoutOptions.value[key] = value;
      // 同时更新表单中的值
      if (editForm.value.layoutOptions) {
        editForm.value.layoutOptions[key] = value;
      }
    });
  }
  
  // 特殊处理嵌入式布局：确保至少显示头部或侧边栏之一
  if (editForm.value.layoutType === 'embedded') {
    // 如果用户尝试同时隐藏头部和侧边栏，则保持至少一个可见
    if (!layoutOptions.value.showHeader && !layoutOptions.value.showSidebar) {
      // 检查是否用户刚刚修改了这两个值，如果是，优先保留之前的设置
      if (layoutOptions.value.showHeader === false && layoutOptions.value.showSidebar === false) {
        // 如果用户尝试同时取消头部和侧边栏，则恢复到至少显示一个的状态
        // 尝试恢复到之前的状态，如果无法确定则默认显示侧边栏
        if (editForm.value.layoutOptions && editForm.value.layoutOptions.showSidebar !== false) {
          layoutOptions.value.showSidebar = true;
          editForm.value.layoutOptions.showSidebar = true;
        } else {
          layoutOptions.value.showHeader = true;
          editForm.value.layoutOptions.showHeader = true;
        }
      }
    }
  }
}

// 判断布局选项是否应该被禁用
function isOptionDisabled(option) {
  if (!editForm.value?.layoutType) return false
  
  // 根据布局类型确定哪些选项应该被禁用
  const constrainedOptions = {
    'default': [],  // 默认布局无强制选项
    'full': ['showHeader', 'showSidebar'],   // 全屏布局强制不显示头部和侧边栏
    'embedded': [],               // 嵌入式布局无强制选项，但有逻辑约束
    'blank': ['showHeader', 'showSidebar']  // 空白布局强制不显示头部和侧边栏
  }
  
  return constrainedOptions[editForm.value.layoutType]?.includes(option) || false
}

// 获取布局选项的提示信息
function getOptionTitle(option) {
  if (!editForm.value?.layoutType) return ''
  
  const titles = {
    'showHeader': {
      'full': '全屏布局不支持显示头部',
      'blank': '空白布局不支持显示头部',
      'embedded': getEmbeddedLayoutWarning('showHeader'),
      'default': ''
    },
    'showSidebar': {
      'full': '全屏布局不支持显示侧边栏',
      'blank': '空白布局不支持显示侧边栏',
      'embedded': getEmbeddedLayoutWarning('showSidebar'),
      'default': ''
    },
    'keepAlive': {
      'full': '全屏布局不建议使用KeepAlive',
      'blank': '空白布局不建议使用KeepAlive',
      'embedded': '嵌入式布局不建议使用KeepAlive',
      'default': ''
    },

  }
  
  return titles[option]?.[editForm.value.layoutType] || ''
}

// 获取嵌入式布局警告信息
function getEmbeddedLayoutWarning(option) {
  if (editForm.value?.layoutType !== 'embedded') return ''
  
  // 如果是嵌入式布局，检查是否两个选项都被取消
  const headerChecked = layoutOptions.value.showHeader;
  const sidebarChecked = layoutOptions.value.showSidebar;
  
  if (option === 'showHeader' && !headerChecked && !sidebarChecked) {
    // 如果取消了头部，且侧边栏也没选中，这会导致两个都没有
    return '嵌入式布局至少需要显示头部或侧边栏之一';
  }
  
  if (option === 'showSidebar' && !sidebarChecked && !headerChecked) {
    // 如果取消了侧边栏，且头部也没选中，这会导致两个都没有
    return '嵌入式布局至少需要显示头部或侧边栏之一';
  }
  
  return '';
}

// 显示布局预览
function showLayoutPreview() {
  if (!editForm.value?.layoutType) return;
  previewLayoutType.value = editForm.value.layoutType;
  showLayoutPreviewDialog.value = true;
}

// 重置布局选项为当前布局类型的默认配置
function resetLayoutOptions() {
  if (!editForm.value?.layoutType) return;
  
  // 根据当前布局类型重置选项
  switch (editForm.value.layoutType) {
    case 'default':
      layoutOptions.value = {
        showHeader: true,
        showSidebar: true,
        keepAlive: false
      };
      break;
    case 'full':
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        keepAlive: false
      };
      break;

    case 'embedded':
      layoutOptions.value = {
        showHeader: true,  // 嵌入式布局默认显示头部
        showSidebar: true,  // 嵌入式布局默认显示侧边栏
        keepAlive: false
      };
      break;
    case 'blank':
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        keepAlive: false
      };
      break;
  }
  
  // 强制应用布局类型约束
  applyLayoutConstraints();
}



// 获取布局描述
function getLayoutDescription(layoutType) {
  const descriptions = {
    'default': '标准布局，包含头部导航栏和侧边栏，适用于大多数应用场景。',
    'full': '全屏布局，不显示头部和侧边栏，适用于大屏展示、数据看板等需要最大化内容区域的场景。',
    'embedded': '嵌入式布局，默认显示头部和侧边栏，至少显示头部或侧边栏之一，适用于嵌入第三方应用或轻量化展示。',
    'blank': '空白布局，不显示任何导航元素，适用于登录页、欢迎页等极简化场景。'
  };
  return descriptions[layoutType] || '请选择布局类型';
}

// 获取布局提醒类型
function getLayoutAlertType(layoutType) {
  const alertTypes = {
    'default': 'info',
    'full': 'warning',
    'embedded': 'info',
    'blank': 'info'
  };
  return alertTypes[layoutType] || 'info';
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
  
  // 更新微应用配置
  appStore.updateApp(editForm.value.id, config)
  
  // 更新微应用配置中的布局设置
  appStore.updateApp(editForm.value.id, {
    layoutType: editForm.value.layoutType,
    layoutOptions: { ...editForm.value.layoutOptions }
  })
  
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

.layout-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

.layout-option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.layout-option-item:hover {
  background-color: #f2f6fc;
  border-color: #dcdfe6;
}

.disabled-label {
  color: #bbb;
}

.layout-description {
  margin-top: 10px;
  width: 100%;
}

.layout-hint-info {
  margin-top: 10px;
}

.layout-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 10px 0;
}

.layout-option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.layout-option-item:hover {
  background-color: #f2f6fc;
  border-color: #dcdfe6;
}

.disabled-label {
  color: #bbb;
}

/* 布局预览样式 */
.layout-preview-container {
  padding: 20px;
  min-height: 400px;
}

.layout-preview {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

/* 默认布局预览 */
.default-layout {
  height: 400px;
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

.preview-logo {
  font-weight: bold;
  color: #409eff;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.preview-breadcrumb {
  color: #606266;
}

.preview-user {
  color: #606266;
}

.preview-body {
  display: flex;
  height: calc(100% - 60px);
}

.preview-sidebar {
  width: 200px;
  background: #304156;
  padding: 20px 0;
}

.preview-menu-item {
  color: #bfcbd9;
  padding: 10px 20px;
  cursor: pointer;
}

.preview-menu-item:hover {
  background: #263445;
}

.preview-menu-item.active {
  color: #409eff;
  background: #263445;
}

.preview-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
}

.preview-content-area {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  height: 100%;
}

.preview-content-block {
  padding: 10px;
  margin-bottom: 10px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  text-align: center;
}

/* 全屏布局预览 */
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

/* 标签页布局预览 */
.tabs-layout {
  height: 450px;
}

.preview-tabs {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 5px;
}

.preview-tab {
  padding: 5px 15px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #f5f7fa;
  cursor: pointer;
}

.preview-tab.active {
  background: #fff;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  color: #409eff;
}

/* 嵌入式布局预览 */
.embedded-layout {
  height: 300px;
}

/* 空白布局预览 */
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

/* 布局预览样式 */
.layout-preview-container {
  padding: 20px;
  min-height: 400px;
}

.layout-preview {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

/* 默认布局预览 */
.default-layout {
  height: 400px;
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

.preview-logo {
  font-weight: bold;
  color: #409eff;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.preview-breadcrumb {
  color: #606266;
}

.preview-user {
  color: #606266;
}

.preview-body {
  display: flex;
  height: calc(100% - 60px);
}

.preview-sidebar {
  width: 200px;
  background: #304156;
  padding: 20px 0;
}

.preview-menu-item {
  color: #bfcbd9;
  padding: 10px 20px;
  cursor: pointer;
}

.preview-menu-item:hover {
  background: #263445;
}

.preview-menu-item.active {
  color: #409eff;
  background: #263445;
}

.preview-content {
  flex: 1;
  padding: 20px;
  background: #f0f2f5;
}

.preview-content-area {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  height: 100%;
}

.preview-content-block {
  padding: 10px;
  margin-bottom: 10px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  text-align: center;
}

/* 全屏布局预览 */
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

/* 标签页布局预览 */
.tabs-layout {
  height: 450px;
}

.preview-tabs {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 5px;
}

.preview-tab {
  padding: 5px 15px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #f5f7fa;
  cursor: pointer;
}

.preview-tab.active {
  background: #fff;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  color: #409eff;
}

/* 嵌入式布局预览 */
.embedded-layout {
  height: 300px;
}

/* 空白布局预览 */
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
