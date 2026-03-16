/**
 * SVG 图标资源库
 * 
 * 存储实际的 SVG 字符串内容，供图标选择器使用
 */

export const svgIcons: Record<string, string> = {
  // Vue Logo
  'vue-logo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <path fill="#41B883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"/>
    <path fill="#35495E" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"/>
  </svg>`,

  // React Logo
  'react-logo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <circle cx="64" cy="64" r="16" fill="#61DAFB"/>
    <g stroke="#61DAFB" stroke-width="4" fill="none">
      <ellipse rx="50" ry="18" transform="rotate(0 64 64)"/>
      <ellipse rx="50" ry="18" transform="rotate(60 64 64)"/>
      <ellipse rx="50" ry="18" transform="rotate(120 64 64)"/>
    </g>
  </svg>`,

  // Angular Logo
  'angular-logo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <path fill="#DD0031" d="M64,10L10,35v58l54,25l54-25V35L64,10z"/>
    <path fill="#FFFFFF" d="M64,25l35,16l-5,48l-30,14l-30-14l-5-48L64,25z"/>
    <path fill="#DD0031" d="M64,40l15,7l-2,23l-13,6l-13-6l-2-23L64,40z"/>
  </svg>`,

  // Star Icon
  'star-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <path fill="#FFD700" d="M64,10l15,35l38,5l-28,27l7,38l-32-17l-32,17l7-38L11,50l38-5L64,10z"/>
  </svg>`,

  // Heart Icon
  'heart-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <path fill="#FF6B6B" d="M64,110L20,65c-15-15-15-40,0-55s40-15,55,0l-11,11c-9-9-25-9-34,0s-9,25,0,34L64,89l34-34 c9-9,9-25,0-34s-25-9-34,0L53,10C68-5,93-5,108,10s15,40,0,55L64,110z"/>
  </svg>`,

  // Home Icon
  'home-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <path fill="#4A90E2" d="M64,10L10,50v68h35V80h38v38h35V50L64,10z M64,28l35,26v56H80V80c0-11-9-20-20-20s-20,9-20,20 v30H30V54L64,28z"/>
  </svg>`,

  // User Icon
  'user-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <circle cx="64" cy="40" r="25" fill="#9B59B6"/>
    <path fill="#9B59B6" d="M64,70c-35,0-55,25-55,48h110C119,95,99,70,64,70z"/>
  </svg>`,

  // Setting Icon
  'setting-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="48" height="48">
    <g fill="#95A5A6">
      <circle cx="64" cy="64" r="15"/>
      <path d="M64,20c-5,0-10,1-14,3l-6-10l-15,9l3,12c-4,2-7,5-10,8l-12-3l-9,15l10,6c-2,5-3,10-3,14s1,10,3,14l-10,6l9,15 l12-3c3,3,6,6,10,8l-3,12l15,9l6-10c5,2,10,3,14,3s10-1,14-3l6,10l15-9l-3-12c4-2,7-5,10-8l12,3l9-15l-10-6c2-5,3-10,3-14 s-1-10-3-14l10-6l-9-15l-12,3c-3-3-6-6-10-8l3-12l-15-9l-6,10C74,21,69,20,64,20z M64,90c-14,0-26-12-26-26s12-26,26-26 s26,12,26,26S78,90,64,90z"/>
    </g>
  </svg>`
}

/**
 * 获取 SVG 图标内容
 * @param {string} svgName - SVG 图标名称
 * @returns {string} SVG 字符串
 */
export function getSvgContent(svgName: string): string {
  return svgIcons[svgName] || ''
}

/**
 * 检查 SVG 图标是否存在
 * @param {string} svgName - SVG 图标名称
 * @returns {boolean}
 */
export function hasSvgIcon(svgName: string): boolean {
  return !!svgIcons[svgName]
}

/**
 * 获取所有可用的 SVG 图标列表
 * @returns {Array} SVG 图标名称数组
 */
export function getAvailableSvgIcons(): string[] {
  return Object.keys(svgIcons)
}

