<template>
  <div class="app-loading-page">
    <div class="page-header">
      <h3>子应用加载管理</h3>
      <div class="header-actions">
        <el-button type="primary" @click="showAddApp">
          <el-icon><Plus /></el-icon>
          新增应用
        </el-button>
        <el-button @click="handleRefreshAll">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
      </div>
    </div>
    
    <!-- 应用列表 -->
    <el-card class="apps-table-card">
      <template #header>
        <span>微应用列表</span>
      </template>
      
      <el-table :data="apps" style="width: 100%;" row-key="id">
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <div class="app-icon-display">
              <!-- Element Plus Icon -->
              <el-icon v-if="row.iconType === 'element-icon'" :size="20">
                <component :is="row.icon" />
              </el-icon>
              <!-- SVG Icon -->
              <div v-else-if="row.iconType === 'svg'" class="table-svg-icon" v-html="getSvgContent(row.icon)" />
              <!-- Emoji -->
              <span v-else-if="row.iconType === 'emoji'" class="table-emoji">{{ row.icon }}</span>
              <!-- 图片 URL -->
              <img v-else-if="row.iconType === 'image'" :src="row.iconUrl || row.icon" alt="icon" class="table-icon-image" />
              <!-- 默认图标 -->
              <el-icon v-else size="20"><Monitor /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="应用 ID" width="150" />
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
            <el-button 
              type="danger" 
              link 
              size="small"
              @click="handleDeleteApp(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 应用详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="应用详情" width="600px">
      <el-descriptions v-if="currentApp" :column="2" border>
        <el-descriptions-item label="应用 ID">{{ currentApp.id }}</el-descriptions-item>
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
        ref="editFormRef"
        :rules="formRules"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="应用ID">
          <el-input v-model="editForm.id" :disabled="isEditMode" placeholder="例如：my-sub-app" />
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
        <el-form-item label="应用图标" prop="icon">
          <IconSelector 
            v-model="editForm.icon" 
            :icon-type="editForm.iconType"
            @update:icon-type="editForm.iconType = $event"
            @update:image-format="editForm.imageFormat = $event"
          />
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            从图标库选择或自定义输入 URL、Base64、SVG、Emoji（必填）
          </div>
        </el-form-item>
        <el-form-item label="图标类型" prop="iconType">
          <el-input v-model="editForm.iconType" disabled style="width: 100%;" />
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            图标类型由选择的图标自动确定（必填）
          </div>
        </el-form-item>
        <!-- ✅ 图片地址字段（仅远程图片类型显示） -->
        <el-form-item v-if="editForm.iconType === 'image'" label="图片地址" prop="iconUrl">
          <el-input v-model="editForm.icon" disabled style="width: 100%;" placeholder="图片 URL 地址" />
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            选择的图片完整地址
          </div>
        </el-form-item>
        <!-- ✅ 图片类型字段（仅远程图片类型显示） -->
        <el-form-item v-if="editForm.iconType === 'image'" label="图片格式" prop="imageFormat">
          <el-input v-model="editForm.imageFormat" disabled style="width: 100%;" />
          <div style="margin-top: 8px; font-size: 12px; color: #999;">
            图片格式由选择的图片自动确定（如：JPEG, PNG, SVG 等）
          </div>
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
                v-model="layoutOptions.showFooter"
                :disabled="isOptionDisabled('showFooter')"
                :title="getOptionTitle('showFooter')"
              />
              <span :class="{'disabled-label': isOptionDisabled('showFooter')}">显示底部</span>
              <el-tag v-if="isOptionDisabled('showFooter')" size="small" type="info" effect="plain">固定</el-tag>
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
        <el-button @click="handleCancelEdit">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 布局预览对话框 -->
    <el-dialog v-model="showLayoutPreviewDialog" title="布局预览" width="80%" top="5vh">
      <div class="layout-preview-container">
        <div class="layout-preview-info">
          <el-alert
            :title="`当前预览：${getLayoutDescription(previewLayoutType)}`"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 15px;"
          />
        </div>
        
        <!-- 使用独立的布局预览组件 -->
        <component 
          :is="currentPreviewComponent" 
          :layout-options="layoutOptions"
        />
      </div>
      <template #footer>
        <el-button @click="showLayoutPreviewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import { microAppManager } from '@/core/microAppManager'
import { layoutManager } from '@/core/layoutManager'
import { Refresh, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  LayoutPreviewComponents,
  getLayoutDescription,
  getLayoutAlertType
} from '@/components/layout/LayoutPreview.js'
import IconSelector from '@/components/IconSelector.vue'
import { getSvgContent } from '@/config/svgIcons'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const { apps } = storeToRefs(appStore)
const errorLogs = computed(() => microAppManager.errorLogs)
const preloadStatus = computed(() => microAppManager.preloadStatus)

const showDetailDialog = ref(false)
const currentApp = ref(null)
const showEditDialog = ref(false)
const isEditMode = ref(false)  // 标记是否为编辑模式
const editFormRef = ref(null)  // 表单引用
const editForm = ref(null)
const layoutOptions = ref({
  showHeader: true,
  showSidebar: true,
  showFooter: false,
  keepAlive: false
})
const showLayoutPreviewDialog = ref(false)
const previewLayoutType = ref('default')

// 当前使用的预览组件
const currentPreviewComponent = computed(() => {
  return LayoutPreviewComponents[previewLayoutType.value] || LayoutPreviewComponents.default
})

// 表单验证规则
const formRules = {
  icon: [
    { required: true, message: '请选择或输入应用图标', trigger: 'change' }
  ],
  iconType: [
    { required: true, message: '图标类型不能为空', trigger: 'change' }
  ]
}

// 监听布局选项变化
watch(layoutOptions, (newVal) => {
  if (editForm.value) {
    // 更新布局选项
    editForm.value.layoutOptions = {
      showHeader: newVal.showHeader,
      showSidebar: newVal.showSidebar,
      showFooter: newVal.showFooter,
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

function showAppDetail(app) {
  currentApp.value = app
  showDetailDialog.value = true
}

function showEditApp(app) {
  isEditMode.value = true
  editForm.value = { ...app }
  layoutOptions.value = {
    showHeader: app.layoutOptions?.showHeader ?? true,
    showSidebar: app.layoutOptions?.showSidebar ?? false,
    showFooter: app.layoutOptions?.showFooter ?? false,
    keepAlive: app.layoutOptions?.keepAlive ?? false
  }
  
  // 确保 icon、iconType 和 imageFormat 有值（兼容旧数据）
  if (!editForm.value.icon) {
    // 根据应用类型设置默认图标
    const defaultIcons = {
      vue3: 'Monitor',
      vue2: 'Platform',
      iframe: 'Grid',
      link: 'Link'
    }
    editForm.value.icon = defaultIcons[app.type] || 'Monitor'
    editForm.value.iconType = 'element-icon'
    editForm.value.imageFormat = ''  // ✅ 非图片类型为空
  }
  
  // ✅ 如果是图片类型，确保 imageFormat 有值
  if (editForm.value.iconType === 'image' && !editForm.value.imageFormat) {
    editForm.value.imageFormat = app.imageFormat || 'JPEG'  // 默认 JPEG
  }
  
  // 重置表单验证状态
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
  
  showEditDialog.value = true
}

// 判断是否为图片 URL 或 Base64
function isImageIcon(icon) {
  if (!icon) return false
  // 检查是否为 http/https 开头的 URL 或 data:image 开头的 Base64
  return /^https?:\/\//.test(icon) || /^data:image\//.test(icon) || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(icon)
}

// 判断是否为 SVG 字符串
function isSvgString(icon) {
  if (!icon) return false
  return icon.trim().startsWith('<svg')
}

async function handleSaveEdit() {
  if (!editForm.value) return
  
  // 表单验证
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
  } catch (error) {
    ElMessage.error('请填写必填项')
    return
  }
  
  const config = {
    name: editForm.value.name,
    type: editForm.value.type,
    entry: editForm.value.entry,
    version: editForm.value.version,
    activeRule: editForm.value.activeRule,
    preload: editForm.value.preload,
    layoutType: editForm.value.layoutType,
    layoutOptions: { ...layoutOptions.value },
    props: {
      routerBase: editForm.value.routerBase
    },
    icon: editForm.value.icon,
    iconUrl: editForm.value.icon,
    imageFormat: editForm.value.imageFormat,  // ✅ 新增
    iconType: editForm.value.iconType
  }
  
  if (!isEditMode.value) {
    // 新增模式
    config.id = editForm.value.id
    config.status = editForm.value.status || 'online'
    config.container = '#micro-app-container'
    config.lastModified = Date.now()
    appStore.addApp(config)
    ElMessage.success('应用已添加')
  } else {
    // 编辑模式
    config.lastModified = Date.now()
    appStore.updateApp(editForm.value.id, config)
    
    // 如果当前正在查看这个应用，立即应用新的布局配置
    const currentRouteAppId = route.params.appId || route.meta?.appId
    if (currentRouteAppId === editForm.value.id) {
      layoutManager.setLayoutFromMicroApp(config)
    }
    ElMessage.success('配置已保存')
  }
  
  showEditDialog.value = false
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
        showFooter: false,
        keepAlive: false
      }
      break
    case 'full':
      // 全屏布局：不显示头部、侧边栏和底部
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        showFooter: false,
        keepAlive: false
      }
      break
    
    case 'embedded':
      // 嵌入式布局：默认显示头部和侧边栏（至少显示一个）
      layoutOptions.value = {
        showHeader: layoutOptions.value.showHeader ?? true,
        showSidebar: layoutOptions.value.showSidebar ?? true,
        showFooter: false,
        keepAlive: false
      }
      break
    case 'blank':
      // 空白布局：不显示头部、侧边栏和底部
      layoutOptions.value = {
        showHeader: false,
        showSidebar: false,
        showFooter: false,
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
  
  const constraints = {
    'full': {
      showHeader: false,
      showSidebar: false,
      showFooter: false
    },
    'blank': {
      showHeader: false,
      showSidebar: false,
      showFooter: false
    }
  };
  
  const constraint = constraints[editForm.value.layoutType];
  if (constraint) {
    layoutOptions.value = {
      ...layoutOptions.value,
      ...constraint
    };
  }
}

// 判断某个选项是否应该被禁用
function isOptionDisabled(option) {
  if (!editForm.value?.layoutType) return false
  
  // 根据布局类型确定哪些选项应该被禁用
  const constrainedOptions = {
    'default': [],  // 默认布局无强制选项
    'full': ['showHeader', 'showSidebar', 'showFooter'],   // 全屏布局强制不显示头部、侧边栏和底部
    'embedded': [],               // 嵌入式布局无强制选项，但有逻辑约束
    'blank': ['showHeader', 'showSidebar', 'showFooter']  // 空白布局强制不显示头部、侧边栏和底部
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
    'showFooter': {
      'full': '全屏布局不支持显示底部',
      'blank': '空白布局不支持显示底部',
      'embedded': '',
      'default': ''
    },
    'keepAlive': {
      'full': '全屏布局不建议使用 KeepAlive',
      'blank': '空白布局不建议使用 KeepAlive',
      'embedded': '嵌入式布局不建议使用 KeepAlive',
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

function handleDeleteApp(app) {
  ElMessageBox.confirm(
    `确定要删除应用 ${app.name} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    appStore.deleteApp(app.id)
    ElMessage.success('应用已删除')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 取消编辑并重置表单
function handleCancelEdit() {
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  showEditDialog.value = false
}

function showAddApp() {
  editForm.value = {
    id: '',
    name: '',
    type: 'vue3',
    entry: '',
    version: '',
    activeRule: '',
    preload: false,
    layoutType: 'default',
    layoutOptions: {
      showHeader: true,
      showSidebar: true,
      showFooter: false,
      keepAlive: false
    },
    routerBase: '',
    // 默认图标配置
    icon: 'Monitor',
    iconType: 'element-icon'
  }
  
  // 初始化布局选项
  layoutOptions.value = { ...editForm.value.layoutOptions }
  
  // 重置表单验证状态
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
  
  showEditDialog.value = true
}

onMounted(() => {
  // 预加载配置了 preload 的应用
  microAppManager.preload()
})
</script>

<style lang="scss" scoped>
.app-loading-page {
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

.apps-table-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
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

/* 布局预览样式 */
.layout-preview-container {
  padding: 20px;
  min-height: 400px;
}

.layout-preview-info {
  margin-bottom: 15px;
}

/* 布局预览通用样式 */
.layout-preview {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}

/* 应用图标显示样式 */
.app-icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

/* 表格 Emoji 图标样式 */
.table-emoji {
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 表格图片图标样式 */
.table-icon-image {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 表格 SVG 图标样式 */
.table-svg-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

/* 图标预览样式 */
.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.icon-preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #999;
}
</style>
