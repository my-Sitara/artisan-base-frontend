import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getMicroApp } from '@/config/microApps'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      layout: 'default'
    }
  },
  {
    path: '/app/:appId',
    name: 'SubApp',
    component: () => import('@/views/SubAppPage.vue'),
    meta: {
      title: '子应用',
      layout: 'default'
    }
  },
  {
    path: '/multi-instance',
    name: 'MultiApp',
    component: () => import('@/views/MultiInstancePage.vue'),
    meta: {
      title: '多应用同屏',
      layout: 'default'
    }
  },
  {
    path: '/app-management',
    name: 'AppManagement',
    redirect: '/app-management/loading',
    meta: {
      title: '应用管理',
      layout: 'default'
    },
    children: [
      {
        path: 'loading',
        name: 'AppLoading',
        component: () => import('@/views/AppLoading.vue'),
        meta: {
          title: '子应用加载管理',
          layout: 'default'
        }
      },
      {
        path: 'error-logs',
        name: 'ErrorLogs',
        component: () => import('@/views/ErrorLogs.vue'),
        meta: {
          title: '错误日志',
          layout: 'default'
        }
      }
    ]
  },
  // Vue3 子应用路由
  {
    path: '/vue3/:pathMatch(.*)*',
    name: 'Vue3SubApp',
    component: () => import('@/views/SubAppPage.vue'),
    meta: {
      title: 'Vue3 子应用',
      layout: 'default',
      appId: 'vue3-sub-app'
    }
  },
  // Vue2 子应用路由
  {
    path: '/vue2/:pathMatch(.*)*',
    name: 'Vue2SubApp',
    component: () => import('@/views/SubAppPage.vue'),
    meta: {
      title: 'Vue2 子应用',
      layout: 'default',
      appId: 'vue2-sub-app'
    }
  },
  // iframe 子应用路由
  {
    path: '/iframe/:pathMatch(.*)*',
    name: 'IframeSubApp',
    component: () => import('@/views/SubAppPage.vue'),
    meta: {
      title: 'iframe 子应用',
      layout: 'default',
      appId: 'iframe-sub-app'
    }
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      layout: 'blank'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const appStore = useAppStore()
  
  // 设置 loading
  appStore.setLoading(true)
  
  // 设置当前激活的应用
  if (to.meta.appId) {
    appStore.setActiveApp(to.meta.appId as string)
  } else if (to.params.appId) {
    appStore.setActiveApp(to.params.appId as string)
  } else {
    appStore.setActiveApp(null)
  }
  
  // 从微应用配置同步 keepAlive 到路由 meta
  const appId = to.meta.appId || to.params.appId
  if (appId) {
    const appConfig = getMicroApp(appId as string)
    if (appConfig?.layoutOptions?.keepAlive !== undefined) {
      to.meta.keepAlive = appConfig.layoutOptions.keepAlive
    }
  }
  
  // 使用 nextTick 确保状态更新完成后再继续导航
  // 避免快速连续导航时的冲突
  next()
})

router.afterEach((to, from, failure) => {
  const appStore = useAppStore()
  
  // 关闭 loading
  appStore.setLoading(false)
  
  // 处理导航失败的情况
  if (failure) {
    console.warn('[Router] Navigation failed:', failure)
  }
})

export default router
