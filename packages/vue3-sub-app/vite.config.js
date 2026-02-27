import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { resolve } from 'path'

const useDevMode = process.env.QIANKUN !== 'true'
const isQiankunBuild = process.env.QIANKUN === 'true'

export default defineConfig({
  plugins: [
    vue(),
    qiankun('vue3-sub-app', {
      useDevMode
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    // 构建时常量，用于条件导入
    __QIANKUN_BUILD__: JSON.stringify(isQiankunBuild)
  },
  server: {
    host: '0.0.0.0',
    port: 7080,
    cors: true,
    origin: 'http://localhost:7080',
    strictPort: false,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
})
