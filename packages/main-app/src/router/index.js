import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useTabsStore } from '@/stores/tabs'

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
    component: () => import('@/views/AppManagement.vue'),
    meta: {
      title: '应用管理',
      layout: 'default'
    }
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
    appStore.setActiveApp(to.meta.appId)
  } else if (to.params.appId) {
    appStore.setActiveApp(to.params.appId)
  } else {
    appStore.setActiveApp(null)
  }
  
  next()
})

router.afterEach((to, from) => {
  const appStore = useAppStore()
  const tabsStore = useTabsStore()
  
  // 关闭 loading
  appStore.setLoading(false)
  
  // 添加标签页
  if (to.meta.title) {
    tabsStore.addTab({
      name: to.name,
      path: to.fullPath,
      title: to.meta.title,
      keepAlive: to.meta.keepAlive
    })
  }
})

export default router
