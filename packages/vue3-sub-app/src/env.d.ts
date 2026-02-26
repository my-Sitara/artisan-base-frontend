/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __POWERED_BY_QIANKUN__?: boolean
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string
  __ARTISAN_BRIDGE__: any
}

declare module 'vite-plugin-qiankun/dist/helper' {
  export interface QiankunWindow extends Window {
    __POWERED_BY_QIANKUN__?: boolean
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string
  }

  export const qiankunWindow: QiankunWindow

  export function renderWithQiankun(lifeCycles: {
    bootstrap: () => void | Promise<void>
    mount: (props: any) => void | Promise<void>
    unmount: (props: any) => void | Promise<void>
    update?: (props: any) => void | Promise<void>
  }): void
}

declare module 'vite-plugin-qiankun' {
  import type { Plugin } from 'vite'

  export default function qiankun(
    appName: string,
    options?: {
      useDevMode?: boolean
    }
  ): Plugin
}
