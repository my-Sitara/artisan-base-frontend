import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bridge } from '@/core/bridge'

export const useUserStore = defineStore('user', () => {
  // 用户 token
  const token = ref('')
  
  // 用户信息
  const userInfo = ref(null)
  
  // 是否已登录
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  function setToken(newToken) {
    token.value = newToken
    
    // 同步 token 到所有子应用
    if (newToken) {
      bridge.syncToken(newToken)
    }
  }

  function setUserInfo(info) {
    userInfo.value = info
  }

  function login(loginToken, info = null) {
    setToken(loginToken)
    if (info) {
      setUserInfo(info)
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    
    // 通知子应用清除 token
    bridge.broadcast({
      type: 'LOGOUT',
      payload: {}
    })
  }

  function refreshToken(newToken) {
    setToken(newToken)
  }

  return {
    // State
    token,
    userInfo,
    
    // Computed
    isLoggedIn,
    
    // Actions
    setToken,
    setUserInfo,
    login,
    logout,
    refreshToken
  }
}, {
  persist: {
    key: 'artisan-user',
    storage: localStorage,
    paths: ['token']
  }
})
