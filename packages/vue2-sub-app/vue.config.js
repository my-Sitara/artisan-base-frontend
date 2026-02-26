const { defineConfig } = require('@vue/cli-service')
const { name } = require('./package.json')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '//localhost:3000/',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all', // 兼容云IDE环境
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`
    }
  }
})
