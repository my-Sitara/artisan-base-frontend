import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  server: {
    port: 4000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
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
