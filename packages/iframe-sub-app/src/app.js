/**
 * iframe 子应用主逻辑
 */

// 请求 Token
window.requestToken = function() {
  if (window.iframeBridge) {
    window.iframeBridge.requestToken()
  }
}

// 发送消息
window.sendMessage = function() {
  if (window.iframeBridge) {
    window.iframeBridge.sendMessage({
      message: 'Hello from iframe 子应用!',
      time: Date.now()
    })
    alert('消息已发送')
  }
}

// 跳转到 Vue3
window.navigateToVue3 = function() {
  if (window.iframeBridge) {
    window.iframeBridge.navigateTo('vue3-sub-app', '/')
  }
}

// 跳转到 Vue2
window.navigateToVue2 = function() {
  if (window.iframeBridge) {
    window.iframeBridge.navigateTo('vue2-sub-app', '/')
  }
}

// 跳转到主应用
window.navigateToMain = function() {
  if (window.iframeBridge) {
    window.iframeBridge.navigateToMain('/')
  }
}

// 上报高度
window.reportHeight = function() {
  if (window.iframeBridge) {
    const height = window.iframeBridge.reportHeight()
    alert(`已上报高度: ${height}px`)
  }
}

// 页面加载完成后自动上报高度
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.iframeBridge) {
      window.iframeBridge.reportHeight()
    }
  }, 100)
})

// 监听窗口大小变化
let resizeTimer = null
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (window.iframeBridge) {
      window.iframeBridge.reportHeight()
    }
  }, 200)
})

console.log('[iframe App] Loaded')
