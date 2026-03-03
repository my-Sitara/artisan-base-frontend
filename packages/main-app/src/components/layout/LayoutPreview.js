/**
 * 布局预览组件
 * 用于在配置界面预览不同布局类型的效果
 */
import DefaultLayoutPreview from './DefaultLayoutPreview.vue'
import EmbeddedLayoutPreview from './EmbeddedLayoutPreview.vue'
import FullLayoutPreview from './FullLayoutPreview.vue'
import BlankLayoutPreview from './BlankLayoutPreview.vue'

export const LayoutPreviewComponents = {
  default: DefaultLayoutPreview,
  embedded: EmbeddedLayoutPreview,
  full: FullLayoutPreview,
  blank: BlankLayoutPreview
}

/**
 * 获取布局描述
 * @param {string} layoutType - 布局类型
 * @returns {string} 布局描述
 */
export function getLayoutDescription(layoutType) {
  const descriptions = {
    default: '标准布局，包含头部导航栏和侧边栏，适用于大多数应用场景。',
    full: '全屏布局，不显示头部和侧边栏，适用于大屏展示、数据看板等需要最大化内容区域的场景。',
    embedded: '嵌入式布局，默认显示头部和侧边栏，至少显示头部或侧边栏之一，适用于嵌入第三方应用或轻量化展示。',
    blank: '空白布局，不显示任何导航元素，适用于登录页、欢迎页等极简化场景。'
  }
  return descriptions[layoutType] || '请选择布局类型'
}

/**
 * 获取布局提醒类型
 * @param {string} layoutType - 布局类型
 * @returns {string} Element Plus Alert 类型
 */
export function getLayoutAlertType(layoutType) {
  const alertTypes = {
    default: 'info',
    full: 'warning',
    embedded: 'info',
    blank: 'info'
  }
  return alertTypes[layoutType] || 'info'
}

/**
 * 获取布局类型标签
 * @param {string} layoutType - 布局类型
 * @returns {string} Element Plus Tag 类型
 */
export function getLayoutTagType(layoutType) {
  const tagTypes = {
    default: '',
    full: 'warning',
    embedded: 'success',
    blank: 'info'
  }
  return tagTypes[layoutType] || ''
}
