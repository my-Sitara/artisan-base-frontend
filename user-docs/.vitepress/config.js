export default {
  title: 'Artisan 微前端平台',
  description: '企业级微前端基础平台脚手架文档',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '文档索引', link: '/INDEX' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/README' }
    ],
    
    sidebar: {
      '/': [
        {
          text: '快速开始',
          items: [
            { text: '项目概述', link: '/guide/overview' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        }
      ],
      '/guide/': [
        {
          text: '入门指南',
          items: [
            { text: '项目概述', link: '/guide/overview' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        },
        {
          text: '核心开发',
          items: [
            { text: '主应用开发', link: '/guide/main-app' },
            { text: '子应用开发', link: '/guide/sub-apps' }
          ]
        },
        {
          text: '布局系统',
          items: [
            { text: '布局系统（快速参考）', link: '/guide/layout-system' },
            { text: '布局系统完整指南', link: '/guide/layout-system-complete-guide' }
          ]
        },
        {
          text: '进阶主题',
          items: [
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
            { text: 'API 总结', link: '/api/README' },
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
