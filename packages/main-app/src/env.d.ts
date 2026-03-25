/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MICRO_APPS_API: string
  readonly VITE_MICRO_APPS_API_URL: string
  readonly VITE_USE_LAYOUT_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

interface Window {
  __ARTISAN_MICRO_APP_MANAGER__: any
  __ARTISAN_BRIDGE__: any
  __POWERED_BY_QIANKUN__?: boolean
}
