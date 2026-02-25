#!/usr/bin/env node

const { program } = require('commander')
const chalk = require('chalk')
const pkg = require('../package.json')

const { createMainApp, createSubApp } = require('../lib/create')

program
  .name('artisan')
  .description('Artisan 微前端脚手架 CLI 工具')
  .version(pkg.version)

program
  .command('create <type> <name>')
  .description('创建项目')
  .option('-t, --type <type>', '子应用类型 (vue3/vue2/iframe)', 'vue3')
  .option('-p, --port <port>', '开发服务器端口')
  .option('-d, --dir <dir>', '目标目录', '.')
  .action(async (type, name, options) => {
    console.log(chalk.blue('🚀 Artisan 微前端脚手架'))
    console.log()
    
    try {
      if (type === 'main-app') {
        await createMainApp(name, options)
      } else if (type === 'sub-app') {
        await createSubApp(name, options)
      } else {
        console.log(chalk.red(`❌ 未知的项目类型: ${type}`))
        console.log(chalk.gray('支持的类型: main-app, sub-app'))
        process.exit(1)
      }
    } catch (error) {
      console.error(chalk.red('❌ 创建失败:'), error.message)
      process.exit(1)
    }
  })

program
  .command('list')
  .description('列出支持的模板')
  .action(() => {
    console.log(chalk.blue('📦 支持的模板:'))
    console.log()
    console.log(chalk.green('  main-app') + chalk.gray(' - Vue3 微前端主应用'))
    console.log(chalk.green('  sub-app --type vue3') + chalk.gray(' - Vue3 子应用'))
    console.log(chalk.green('  sub-app --type vue2') + chalk.gray(' - Vue2 子应用'))
    console.log(chalk.green('  sub-app --type iframe') + chalk.gray(' - iframe 子应用'))
  })

program.parse()
