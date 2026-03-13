/**
 * 微应用 Mock 数据
 * 
 * 此文件用于本地开发环境的 mock 数据
 * 当 VITE_USE_MICRO_APPS_API=false 时使用此数据
 */

export default {
  code: 200,
  message: 'success',
  data: {
    apps: [
      {
        id: 'vue3-sub-app',
        name: 'Vue3 子应用',
        entry: 'http://localhost:7080',
        activeRule: '/vue3',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: true,
        type: 'vue3',
        icon: 'Monitor',
        iconType: 'element-icon',
        layoutType: 'default',
        layoutOptions: {
          showHeader: true,
          showSidebar: true,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/vue3'
        }
      },
      {
        id: 'vue2-sub-app',
        name: 'Vue2 子应用',
        entry: 'http://localhost:3000',
        activeRule: '/vue2',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: true,
        type: 'vue2',
        icon: 'Platform',
        iconType: 'element-icon',
        layoutType: 'default',
        layoutOptions: {
          showHeader: true,
          showSidebar: true,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/vue2'
        }
      },
      {
        id: 'iframe-sub-app',
        name: 'iframe 子应用',
        entry: 'http://localhost:9080',
        activeRule: '/iframe',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: false,
        type: 'iframe',
        icon: 'Grid',
        iconType: 'element-icon',
        layoutType: 'embedded',
        layoutOptions: {
          showHeader: true,
          showSidebar: false,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/iframe'
        }
      },
      {
        id: 'link-example',
        name: '外链示例',
        entry: 'https://cn.vuejs.org',
        activeRule: '/link',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: false,
        type: 'link',
        icon: 'Link',
        iconType: 'element-icon',
        layoutType: 'blank',
        layoutOptions: {
          showHeader: false,
          showSidebar: false,
          keepAlive: false,
          showFooter: false
        },
        props: {}
      },
      {
        id: 'svg-demo-app',
        name: 'SVG 图标示例',
        entry: 'http://localhost:8080',
        activeRule: '/svg-demo',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: false,
        type: 'vue3',
        icon: 'vue-logo',
        iconType: 'svg',
        layoutType: 'default',
        layoutOptions: {
          showHeader: true,
          showSidebar: true,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/svg-demo'
        }
      },
      {
        id: 'image-demo-app',
        name: '图片图标示例',
        entry: 'http://localhost:9000',
        activeRule: '/image-demo',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: false,
        type: 'vue3',
        icon: 'https://picsum.photos/seed/icondemo/48/48',
        iconUrl: 'https://picsum.photos/seed/icondemo/48/48',
        imageFormat: 'JPEG',
        iconType: 'image',
        layoutType: 'default',
        layoutOptions: {
          showHeader: true,
          showSidebar: true,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/image-demo'
        }
      },
      {
        id: 'emoji-demo-app',
        name: 'Emoji 图标示例',
        entry: 'http://localhost:9001',
        activeRule: '/emoji-demo',
        container: '#micro-app-container',
        status: 'online',
        version: '1.0.0',
        lastModified: Date.now(),
        preload: false,
        type: 'vue3',
        icon: '🚀',
        iconType: 'emoji',
        layoutType: 'default',
        layoutOptions: {
          showHeader: true,
          showSidebar: true,
          keepAlive: false,
          showFooter: false
        },
        props: {
          routerBase: '/emoji-demo'
        }
      }
    ]
  }
}
