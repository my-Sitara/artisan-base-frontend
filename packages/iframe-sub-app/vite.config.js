import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  server: {
    host: '0.0.0.0',
    port: 9080,
    cors: true,
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        list: resolve(__dirname, 'list.html')
      }
    }
  }
})
