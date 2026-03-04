/**
 * 布局配置管理模块
 * 
 * 此模块定义了不同布局类型对应的默认选项和约束规则，
 * 提供布局配置的标准化、验证和建议功能。
 * 
 * 主要功能包括：
 * 1. 定义各种布局类型的默认选项
 * 2. 定义布局类型的约束规则
 * 3. 验证布局配置的有效性
 * 4. 标准化布局配置
 * 5. 提供布局配置建议
 * 
 * 使用方式：
 * - 在微应用配置中使用 normalizeLayoutConfig 进行配置标准化
 * - 使用 validateLayoutConfig 验证配置的有效性
 * - 使用 getLayoutSuggestions 获取配置建议
 */

import { LayoutTypes } from '@/core/layoutManager'

/**
 * 布局类型配置映射
 * 定义每种布局类型对应的默认选项和约束
 */
export const layoutTypeConfigs = {
  [LayoutTypes.DEFAULT]: {
    name: '默认布局',
    description: '包含头部和侧边栏的标准布局',
    defaultOptions: {
      showHeader: true,
      showSidebar: true,
      keepAlive: false
    },
    constraints: {
      // 在默认布局中，header和sidebar通常都显示
      showHeader: true,  // 推荐显示header
      showSidebar: true  // 推荐显示sidebar
    },
    compatibleOptions: ['keepAlive']
  },
  

  [LayoutTypes.FULL]: {
    name: '全屏布局',
    description: '无头部和侧边栏的全屏布局',
    defaultOptions: {
      showHeader: false,
      showSidebar: false,
      keepAlive: false
    },
    constraints: {
      showHeader: false,  // 全屏布局不显示header
      showSidebar: false  // 全屏布局不显示sidebar
    },
    compatibleOptions: []
  },
  
  [LayoutTypes.EMBEDDED]: {
    name: '嵌入式布局',
    description: '轻量级嵌入式布局',
    defaultOptions: {
      showHeader: true,
      showSidebar: false,
      keepAlive: false
    },
    constraints: {
      showSidebar: false  // 嵌入式布局通常不显示sidebar
    },
    compatibleOptions: ['keepAlive']
  },
  
  [LayoutTypes.BLANK]: {
    name: '空白布局',
    description: '最简布局，只包含内容区域',
    defaultOptions: {
      showHeader: false,
      showSidebar: false,
      keepAlive: false
    },
    constraints: {
      showHeader: false,  // 空白布局不显示header
      showSidebar: false  // 空白布局不显示sidebar
    },
    compatibleOptions: []
  }
}

/**
 * 获取指定布局类型的默认选项
 * @param {string} layoutType - 布局类型
 * @returns {Object} 默认选项
 */
export function getDefaultLayoutOptions(layoutType) {
  const config = layoutTypeConfigs[layoutType]
  return config ? { ...config.defaultOptions } : {}
}

/**
 * 获取指定布局类型的兼容选项
 * @param {string} layoutType - 布局类型
 * @returns {Array} 兼容的选项列表
 */
export function getCompatibleOptions(layoutType) {
  const config = layoutTypeConfigs[layoutType]
  return config ? [...config.compatibleOptions] : []
}

/**
 * 应用布局类型约束到选项
 * @param {string} layoutType - 布局类型
 * @param {Object} options - 布局选项
 * @returns {Object} 应用约束后的选项
 */
export function applyLayoutConstraints(layoutType, options = {}) {
  const config = layoutTypeConfigs[layoutType]
  if (!config || !config.constraints) {
    return { ...options }
  }

  const result = { ...options }
  
  // 应用约束
  Object.keys(config.constraints).forEach(key => {
    if (config.constraints[key] !== undefined) {
      result[key] = config.constraints[key]
    }
  })
  
  return result
}

/**
 * 验证布局配置是否有效
 * @param {string} layoutType - 布局类型
 * @param {Object} options - 布局选项
 * @returns {Object} 验证结果 { valid: boolean, warnings: Array, errors: Array }
 */
export function validateLayoutConfig(layoutType, options = {}) {
  const result = {
    valid: true,
    warnings: [],
    errors: []
  }
  
  const config = layoutTypeConfigs[layoutType]
  if (!config) {
    result.valid = false
    result.errors.push(`未知的布局类型: ${layoutType}`)
    return result
  }
  
  // 检查不兼容的选项
  Object.keys(options).forEach(optionKey => {
    if (!config.compatibleOptions.includes(optionKey) && 
        !config.constraints.hasOwnProperty(optionKey)) {
      result.warnings.push(
        `选项 "${optionKey}" 可能与 "${config.name}" 布局类型不兼容`
      )
    }
  })
  
  // 检查约束条件
  Object.keys(config.constraints).forEach(constraintKey => {
    const constraintValue = config.constraints[constraintKey]
    if (options.hasOwnProperty(constraintKey) && 
        options[constraintKey] !== constraintValue) {
      result.warnings.push(
        `选项 "${constraintKey}" 的值 (${options[constraintKey]}) 与 "${config.name}" 布局的推荐值 (${constraintValue}) 不同`
      )
    }
  })
  
  return result
}

/**
 * 标准化布局配置
 * 应用默认值、约束和验证
 * @param {string} layoutType - 布局类型
 * @param {Object} options - 布局选项
 * @returns {Object} 标准化后的配置
 */
export function normalizeLayoutConfig(layoutType, options = {}) {
  const defaultOptions = getDefaultLayoutOptions(layoutType)
  const mergedOptions = { ...defaultOptions, ...options }
  const constrainedOptions = applyLayoutConstraints(layoutType, mergedOptions)
  
  return {
    layoutType,
    layoutOptions: constrainedOptions
  }
}

/**
 * 获取所有布局类型的列表
 * @returns {Array} 布局类型信息数组
 */
export function getAllLayoutTypes() {
  return Object.entries(layoutTypeConfigs).map(([type, config]) => ({
    type,
    name: config.name,
    description: config.description
  }))
}