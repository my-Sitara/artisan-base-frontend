import { createApp } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import routes from './router'

let app = null
let router = null

/**
 * 渲染函数
 * @param {object} props - qiankun 传入的 props（独立运行时为空对象）
 * @param {boolean} isQiankunMount - 是否从 qiankun mount 生命周期调用
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props
  
  // 清除旧引用，不在此处调用 unmount()
  // 因为这可能在 qiankun 的 mount 生命周期内执行，
  // 调用 unmount 会干扰 qiankun 的内部状态，导致后续卸载失败
  if (app) {
    console.warn('[Vue3 Sub App] Replacing existing app instance')
    app = null
    router = null
  }
  
  // qiankun 环境下使用 memory history，独立运行使用 web history
  const history = isQiankunMount
    ? createMemoryHistory()
    : createWebHistory('/')
  
  router = createRouter({
    history,
    routes
  })
  
  // 创建应用
  app = createApp(App)
  app.use(router)
  app.use(ElementPlus)
  
  // 通过 provide 传递运行模式，App.vue 用 inject 获取
  app.provide('__QIANKUN_MODE__', isQiankunMount)
  
  // 保存 props 到全局
  app.config.globalProperties.$mainProps = props
  
  // 挂载 - 优先在 container 内查找 #app，找不到则直接挂载到 container
  let mountEl
  if (container) {
    mountEl = container.querySelector('#app') || container
  } else {
    mountEl = document.getElementById('app')
  }
  app.mount(mountEl)
  
  // memory history 需要手动导航到初始路由
  if (isQiankunMount) {
    router.push(props.subPath || '/')
  }
  
  console.log('[Vue3 Sub App] Mounted', { container: !!container, isQiankunMount })
}

/**
 * qiankun 生命周期 - 先注册，确保 qiankun 能正确识别
 */
renderWithQiankun({
  bootstrap() {
    console.log('[Vue3 Sub App] Bootstrap')
  },
  mount(props) {
    console.log('[Vue3 Sub App] Mount', props)
    render(props, true)
  },
  unmount(props) {
    console.log('[Vue3 Sub App] Unmount')
    
    // 不调用 app.unmount()。
    // Vue3 的 unmount 内部会遍历 vnode 树，在 qiankun 环境下
    // 容器 DOM 可能已被主应用操作，导致 vnode 为 null 而崩溃。
    // single-spa 会将此错误包装后重新抛出，try-catch 无法完全拦截。
    // 改为：手动停止响应式 effect，然后清除引用，由 qiankun + 主应用清理 DOM。
    if (app) {
      // 停止 Vue3 响应式系统（watcher / computed / watch 等）
      if (app._instance && app._instance.scope) {
        app._instance.scope.stop()
      }
      app = null
    }
    router = null
    
    // 清理容器内容
    const { container } = props || {}
    if (container) {
      container.innerHTML = ''
    }
  },
  update(props) {
    console.log('[Vue3 Sub App] Update', props)
  }
})

/**
 * 独立运行 - 放在 renderWithQiankun 之后，确保 qiankun 生命周期已注册
 */
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

export { app, router }
