import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import routes from './router'

Vue.use(VueRouter)
Vue.use(ElementUI)

Vue.config.productionTip = false

let instance = null
let router = null

/**
 * 渲染函数
 * @param {object} props - qiankun 传入的 props（独立运行时为空对象）
 * @param {boolean} isQiankunMount - 是否从 qiankun mount 生命周期调用
 */
function render(props = {}, isQiankunMount = false) {
  const { container } = props
  
  // 清除旧引用，不在此处调用 $destroy()
  // 因为这可能在 qiankun 的 mount 生命周期内执行
  if (instance) {
    console.warn('[Vue2 Sub App] Replacing existing instance')
    instance = null
    router = null
  }
  
  // qiankun 环境下使用 abstract 模式（类似 memory history），独立运行使用 history 模式
  router = new VueRouter({
    mode: isQiankunMount ? 'abstract' : 'history',
    base: '/',
    routes
  })
  
  // 挂载 - 优先在 container 内查找 #app，找不到则直接挂载到 container
  let mountEl
  if (container) {
    mountEl = container.querySelector('#app') || container
  } else {
    mountEl = '#app'
  }
  
  instance = new Vue({
    router,
    data() {
      return {
        mainProps: props,
        isQiankunMode: isQiankunMount
      }
    },
    render: h => h(App)
  }).$mount(mountEl)
  
  // 如果有传入 subPath，跳转到对应路由
  if (props.subPath) {
    router.push(props.subPath)
  } else {
    // abstract 模式需要手动 push 初始路由
    if (isQiankunMount) {
      router.push('/')
    }
  }
  
  console.log('[Vue2 Sub App] Mounted', { container: !!container, isQiankunMount })
}

/**
 * 独立运行
 */
if (!window.__POWERED_BY_QIANKUN__) {
  render({}, false)
}

/**
 * qiankun 生命周期 - bootstrap
 */
export async function bootstrap() {
  console.log('[Vue2 Sub App] Bootstrap')
}

/**
 * qiankun 生命周期 - mount
 */
export async function mount(props) {
  console.log('[Vue2 Sub App] Mount', props)
  render(props, true)
}

/**
 * qiankun 生命周期 - unmount
 */
export async function unmount() {
  console.log('[Vue2 Sub App] Unmount')
  const currentInstance = instance
  instance = null
  router = null
  
  if (currentInstance) {
    try {
      currentInstance.$destroy()
      if (currentInstance.$el) {
        currentInstance.$el.innerHTML = ''
      }
    } catch (e) {
      console.warn('[Vue2 Sub App] Unmount cleanup error (ignored):', e.message)
    }
  }
}

/**
 * qiankun 生命周期 - update
 */
export async function update(props) {
  console.log('[Vue2 Sub App] Update', props)
}
