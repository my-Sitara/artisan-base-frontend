#!/usr/bin/env node

import { program } from 'commander'
import chalk from 'chalk'
import updateNotifier from 'update-notifier'
import { createRequire } from 'module'
import { createMainApp, createSubApp } from '../lib/create.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

// 异步检查版本更新（不阻塞主流程）
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 * 24 })
notifier.notify()

program
  .name('artisan')
  .description('Artisan 微前端脚手架 CLI 工具')
  .version(pkg.version)

program
  .command('create <type> <name>')
  .description('创建项目（type: main-app | sub-app）')
  .option('-t, --type <type>', '子应用类型 (vue3/vue2/iframe)', 'vue3')
  .option('-p, --port <port>', '开发服务器端口')
  .option('-d, --dir <dir>', '目标目录', '.')
  .option('--js', '使用 JavaScript 模板（含 TS 类型支持）')
  .option('--ts', '使用 TypeScript 模板（兼容 JS 写法）')
  .action(async (type, name, options) => {
    console.log(chalk.blue('🚀 Artisan 微前端脚手架'))
    console.log()

    // 解析 --js / --ts 为 language 字段
    if (options.js) options.language = 'js'
    if (options.ts) options.language = 'ts'

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
    console.log(chalk.green('  main-app') + chalk.gray('              - Vue3 微前端主应用（JS/TS）'))
    console.log(chalk.green('  sub-app --type vue3') + chalk.gray('   - Vue3 子应用（JS/TS）'))
    console.log(chalk.green('  sub-app --type vue2') + chalk.gray('   - Vue2 子应用（JS）'))
    console.log(chalk.green('  sub-app --type iframe') + chalk.gray(' - iframe 子应用（JS）'))
    console.log()
    console.log(chalk.gray('使用 --js 或 --ts 指定模板语言，不指定则交互询问'))
  })

program
  .command('info')
  .description('显示 CLI 版本与依赖信息')
  .action(() => {
    console.log(chalk.blue('ℹ  @artisan/cli 信息'))
    console.log()
    console.log(`  版本:      ${chalk.green(pkg.version)}`)
    console.log(`  Node.js:   ${chalk.green(process.version)}`)
    console.log(`  平台:      ${chalk.green(process.platform)}`)
    console.log()
    console.log(chalk.gray('  核心依赖:'))
    const deps = pkg.dependencies || {}
    for (const [name, ver] of Object.entries(deps)) {
      console.log(`    ${chalk.cyan(name.padEnd(22))} ${ver}`)
    }
  })

program.parse()

