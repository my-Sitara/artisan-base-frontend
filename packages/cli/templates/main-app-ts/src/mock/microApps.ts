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
        icon: '',
        iconType: 'image',
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
        icon: '',
        iconType: 'image',
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
        icon: '',
        iconType: 'image',
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
        icon: '',
        iconType: 'image',
        layoutType: 'blank',
        layoutOptions: {
          showHeader: false,
          showSidebar: false,
          keepAlive: false,
          showFooter: false
        },
        props: {}
      }
    ]
  }
}
