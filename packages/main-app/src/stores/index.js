import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

export { useAppStore } from './app'
export { useUserStore } from './user'
export { useTabsStore } from './tabs'
