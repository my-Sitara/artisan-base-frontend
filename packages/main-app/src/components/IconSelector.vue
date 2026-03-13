<template>
  <div class="icon-selector">
    <!-- 图标选择触发器 -->
    <div class="icon-trigger" @click="showDialog = true">
      <div v-if="modelValue" class="selected-icon">
        <!-- Element Plus Icon -->
        <el-icon v-if="isElementPlusIcon(modelValue)" :size="20">
          <component :is="modelValue" />
        </el-icon>
        <!-- SVG Icon -->
        <div v-else-if="hasSvgIcon(modelValue)" class="trigger-svg-icon" v-html="getSvgContent(modelValue)" />
        <!-- Emoji -->
        <span v-else-if="isEmoji(modelValue)" class="emoji-icon">{{ modelValue }}</span>
        <!-- URL 图片 -->
        <img v-else-if="isImageUrl(modelValue)" :src="modelValue" alt="icon" />
        <!-- 默认显示文本 -->
        <span v-else>{{ modelValue }}</span>
      </div>
      <div v-else class="icon-placeholder">
        <el-icon size="20"><Picture /></el-icon>
        <span>选择图标</span>
      </div>
    </div>

    <!-- 图标选择对话框 -->
    <el-dialog 
      v-model="showDialog" 
      title="选择图标" 
      width="700px"
      :close-on-click-modal="false"
    >
      <!-- 搜索框 -->
      <div class="icon-search-box">
        <el-input 
          v-model="searchText" 
          placeholder="搜索图标..." 
          :prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 分类标签页 -->
      <el-tabs v-model="activeCategory" type="card">
        <el-tab-pane 
          v-for="category in visibleCategories" 
          :key="category" 
          :label="getCategoryLabel(category)" 
          :name="category"
        >
          <div class="icon-grid">
            <!-- 图标列表 -->
            <div 
              v-for="icon in filteredIcons" 
              :key="icon.id"
              class="icon-item"
              :class="{ active: selectedIconId === icon.id }"
              @click="selectIcon(icon)"
            >
              <div class="icon-preview">
                <!-- Element Plus Icon -->
                <el-icon v-if="activeCategory === 'element-icons'" :size="32">
                  <component :is="icon.id" />
                </el-icon>
                <!-- SVG Icon - 真正渲染 SVG -->
                <div v-else-if="activeCategory === 'svg'" class="svg-icon-container" v-html="getSvgContent(icon.svgName)" />
                <!-- Emoji -->
                <span v-else-if="activeCategory === 'emoji'" class="emoji-icon">{{ icon.emoji }}</span>
                <!-- Image Icon -->
                <img 
                  v-else-if="activeCategory === 'image'" 
                  :src="icon.iconUrl" 
                  alt="icon" 
                  class="image-icon"
                  @error="handleImageError"
                />
              </div>
              <div class="icon-name">{{ icon.name }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 预览区域 -->
      <div class="icon-preview-section">
        <h4>已选择：</h4>
        <div class="preview-content">
          <div class="preview-icon">
            <!-- Element Plus Icon -->
            <el-icon v-if="selectedIcon && isElementPlusIcon(selectedIcon.id)" :size="48">
              <component :is="selectedIcon.id" />
            </el-icon>
            <!-- SVG Icon - 真正渲染 SVG -->
            <div v-else-if="selectedIcon?.svgName" class="svg-preview-large" v-html="getSvgContent(selectedIcon.svgName)" />
            <!-- Emoji -->
            <span v-else-if="selectedIcon?.emoji" class="emoji-icon">{{ selectedIcon.emoji }}</span>
            <!-- Image URL -->
            <img 
              v-else-if="selectedIcon?.iconUrl" 
              :src="selectedIcon.iconUrl" 
              alt="icon" 
              class="preview-image"
              @error="handleImageError"
            />
            <!-- Fallback -->
            <span v-else>{{ selectedIcon?.id }}</span>
          </div>
          <div class="preview-info">
            <p><strong>ID/名称:</strong> {{ selectedIcon?.id }}</p>
            <p><strong>名称:</strong> {{ selectedIcon?.name || '未知' }}</p>
            <p><strong>类型:</strong> {{ getIconTypeDisplay() }}</p>
            <!-- ✅ 如果是图片类型，显示图片格式和地址 -->
            <template v-if="selectedIcon?.iconUrl">
              <p><strong>图片格式:</strong> {{ selectedIcon.imageFormat || getImageFormat(selectedIcon.iconUrl) }}</p>
              <p class="image-url-text"><strong>图片地址:</strong> {{ selectedIcon.iconUrl }}</p>
            </template>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="!(selectedIcon || customInput)">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Picture, Edit, Search } from '@element-plus/icons-vue'
import { iconLibrary, getIconCategories, getIconsByCategory, isEmoji, isElementPlusIcon } from '@/config/iconLibrary'
import { getSvgContent, hasSvgIcon } from '@/config/svgIcons'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  iconType: {
    type: String,
    default: ''
  },
  imageFormat: {  // ✅ 新增 prop
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'update:iconType', 'update:imageFormat'])  // ✅ 新增 emit

const showDialog = ref(false)
const activeCategory = ref('element-icons')  // ✅ 默认显示 Element Plus Icons
const searchText = ref('')
const selectedIconId = ref('')
const selectedIcon = ref(null)

const categories = getIconCategories()

// ✅ 只显示有内容的分类
const visibleCategories = computed(() => {
  return categories.filter(cat => {
    // ✅ SVG 分类现在有资源了，可以显示
    if (cat === 'svg') return true
    return true
  })
})

// 获取当前分类的所有图标
const currentIcons = computed(() => {
  return getIconsByCategory(activeCategory.value)
})

// 过滤图标（根据搜索文本）
const filteredIcons = computed(() => {
  if (!searchText.value) return currentIcons.value
  const text = searchText.value.toLowerCase()
  return currentIcons.value.filter(icon => 
    icon.name.toLowerCase().includes(text) || 
    icon.id.toLowerCase().includes(text)
  )
})

// 判断是否为图片 URL
function isImageUrl(url) {
  return /^https?:\/\//.test(url) || /^data:image\//.test(url)
}

// 选择图标
function selectIcon(icon) {
  selectedIconId.value = icon.id
  selectedIcon.value = icon
  
  // ✅ 根据选择的图标类型自动更新 iconType
  updateIconTypeBySelection(icon)
}

// 根据选择更新图标类型
function updateIconTypeBySelection(icon) {
  if (!icon) return
  
  let iconValue = ''
  let iconTypeValue = ''
  let imageFormatValue = ''  // ✅ 新增
  
  if (icon.iconUrl) {
    // 图片 URL
    iconValue = icon.iconUrl
    iconTypeValue = 'image'
    imageFormatValue = icon.imageFormat || getImageFormat(icon.iconUrl)  // ✅ 获取图片格式
  } else if (icon.emoji) {
    // Emoji
    iconValue = icon.emoji
    iconTypeValue = 'emoji'
  } else if (icon.svgName) {
    // SVG
    iconValue = icon.id
    iconTypeValue = 'svg'
  } else if (icon.id) {
    // Element Plus Icon
    iconValue = icon.id
    iconTypeValue = 'element-icon'
  }
  
  // ✅ 实时更新父组件
  emit('update:modelValue', iconValue)
  emit('update:iconType', iconTypeValue)
  emit('update:imageFormat', imageFormatValue)  // ✅ 新增
}

// 处理图片加载失败
function handleImageError(e) {
  const target = e.target
  if (target) {
    // 显示默认占位图或提示
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent && !parent.querySelector('.image-error-placeholder')) {
      const placeholder = document.createElement('div')
      placeholder.className = 'image-error-placeholder'
      placeholder.innerHTML = '<el-icon><Picture /></el-icon><span>图片加载失败</span>'
      parent.appendChild(placeholder)
    }
  }
}

// 确认选择
function confirmSelection() {
  if (!selectedIcon.value) return
  
  let iconValue = ''
  let iconTypeValue = ''
  let imageFormatValue = ''  // ✅ 新增
  
  if (selectedIcon.value?.iconUrl) {
    // 图片 URL
    iconValue = selectedIcon.value.iconUrl
    iconTypeValue = 'image'
    imageFormatValue = selectedIcon.value.imageFormat || getImageFormat(selectedIcon.value.iconUrl)  // ✅ 获取格式
  } else if (selectedIcon.value?.emoji) {
    // Emoji
    iconValue = selectedIcon.value.emoji
    iconTypeValue = 'emoji'
  } else if (selectedIcon.value?.svgName) {
    // SVG
    iconValue = selectedIcon.value.id
    iconTypeValue = 'svg'
  } else if (selectedIcon.value?.id) {
    // Element Plus Icon
    iconValue = selectedIcon.value.id
    iconTypeValue = 'element-icon'
  }
  
  emit('update:modelValue', iconValue)
  emit('update:iconType', iconTypeValue)
  emit('update:imageFormat', imageFormatValue)  // ✅ 新增
  
  showDialog.value = false
  resetSelection()
}

// 重置选择状态
function resetSelection() {
  selectedIconId.value = ''
  selectedIcon.value = null
  searchText.value = ''
}

// 获取分类中文名称
function getCategoryLabel(category) {
  const labels = {
    'element-icons': 'Element Plus Icons',
    svg: 'SVG 图标',
    emoji: 'Emoji 表情',
    image: '远程图片'  // ✅ 更名
  }
  return labels[category] || category
}

// ✅ 获取图片格式（从 URL 提取文件扩展名）
function getImageFormat(url) {
  if (!url) return '未知'
  
  try {
    // 处理带查询参数的 URL
    const urlWithoutParams = url.split('?')[0]
    const ext = urlWithoutParams.split('.').pop()?.toLowerCase()
    
    // 映射常见扩展名到友好名称
    const formatMap = {
      'jpg': 'JPEG',
      'jpeg': 'JPEG',
      'png': 'PNG',
      'svg': 'SVG',
      'gif': 'GIF',
      'webp': 'WebP',
      'bmp': 'BMP',
      'ico': 'ICO'
    }
    
    return formatMap[ext] || ext?.toUpperCase() || '未知'
  } catch (e) {
    return '未知'
  }
}

// 获取图标类型显示文本
function getIconTypeDisplay() {
  if (selectedIcon?.value?.emoji) return 'Emoji'
  if (selectedIcon?.value?.iconUrl) return '图片 URL'  // ✅ 修改为 iconUrl
  if (selectedIcon?.value?.svgName) return 'SVG 图标'
  if (selectedIcon?.value?.id) return 'Element Plus Icon'
  return '未知'
}

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && !showDialog.value) {
    // 尝试从图标库中查找匹配的图标
    for (const [category, icons] of Object.entries(iconLibrary)) {
      const found = icons.find(icon => icon.id === newVal)
      if (found) {
        selectedIcon.value = found
        selectedIconId.value = found.id
        activeCategory.value = category
        
        // ✅ 根据找到的图标类型设置 iconType 和 imageFormat
        let typeValue = ''
        let formatValue = ''
        if (category === 'element-icons') {
          typeValue = 'element-icon'
        } else if (category === 'svg') {
          typeValue = 'svg'
        } else if (category === 'emoji') {
          typeValue = 'emoji'
        } else if (category === 'image') {
          typeValue = 'image'
          formatValue = found.imageFormat || getImageFormat(found.iconUrl)  // ✅ 获取图片格式
        }
        
        emit('update:iconType', typeValue)
        if (formatValue) {
          emit('update:imageFormat', formatValue)  // ✅ 新增
        }
        return
      }
    }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.icon-selector {
  width: 100%;
}

.icon-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-height: 32px;
  
  &:hover {
    border-color: #409EFF;
    background-color: #f5f7fa;
  }
}

.selected-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  
  img, svg {
    max-width: 32px;
    max-height: 32px;
  }
}

// 触发器中的 SVG 图标样式
.trigger-svg-icon {
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

.icon-placeholder {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
}

.icon-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.icon-search-box {
  margin-bottom: 15px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 2px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409EFF;
    background-color: #f5f7fa;
    transform: translateY(-2px);
  }
  
  &.active {
    border-color: #67C23A;
    background-color: #f0f9eb;
  }
}

.icon-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  
  .emoji-icon {
    font-size: 36px;
  }
  
  .svg-icon {
    width: 100%;
    height: 100%;
    
    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}

.icon-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.emoji-icon {
  font-size: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// SVG 图标容器
.svg-icon-container {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

// SVG 预览大尺寸
.svg-preview-large {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

// 图片图标样式
.image-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}

// 预览图片样式
.preview-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 4px;
}

// 图片加载失败占位符
.image-error-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #909399;
  gap: 4px;
  font-size: 10px;
}

// SVG 文本显示
.svg-icon {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

.icon-preview-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #606266;
  }
  
  .preview-content {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .preview-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      
      span {
        font-size: 48px;
        
        :deep(svg) {
          width: 100%;
          height: 100%;
        }
      }
    }
    
    .preview-info {
      flex: 1;
      
      p {
        margin: 5px 0;
        font-size: 13px;
        color: #606266;
        
        // ✅ 图片地址长文本换行显示
        &.image-url-text {
          word-break: break-all;
          white-space: normal;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
