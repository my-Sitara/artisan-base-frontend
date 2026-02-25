export default {
  title: 'Artisan 微前端平台',
  description: '企业级微前端基础平台脚手架文档',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/micro-app-manager' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '主应用', link: '/guide/main-app' },
            { text: '子应用', link: '/guide/sub-apps' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '布局系统', link: '/guide/layout-system' },
            { text: 'iframe 跨域治理', link: '/guide/iframe-governance' },
            { text: '部署指南', link: '/guide/deployment' },
            { text: 'TypeScript 迁移', link: '/guide/typescript-migration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'MicroAppManager', link: '/api/micro-app-manager' },
            { text: 'Bridge', link: '/api/bridge' },
            { text: '配置', link: '/api/config' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/artisan-base-frontend' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Artisan Team'
    }
  }
}
