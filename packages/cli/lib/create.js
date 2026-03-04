import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { input, confirm, select } from '@inquirer/prompts'
import ora from 'ora'
import { generateProject } from './generator.js'

/**
 * 创建主应用
 */
export async function createMainApp(name, options) {
  const targetDir = path.resolve(options.dir, name)

  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const overwrite = await confirm({
      message: `目录 ${name} 已存在，是否覆盖?`,
      default: false
    })

    if (!overwrite) {
      console.log(chalk.yellow('已取消'))
      return
    }

    await fs.remove(targetDir)
  }

  // 收集配置
  const description = await input({
    message: '项目描述:',
    default: '微前端主应用'
  })

  const port = await input({
    message: '开发服务器端口:',
    default: options.port || '8080'
  })

  const language = options.language || await select({
    message: '选择模板语言:',
    choices: [
      { name: 'JavaScript（含 TS 类型支持）', value: 'js' },
      { name: 'TypeScript（兼容 JS 写法）', value: 'ts' }
    ],
    default: 'js'
  })

  const config = {
    name,
    description,
    port,
    language,
    type: 'main-app'
  }

  const spinner = ora('正在创建主应用...').start()

  try {
    const templateName = `main-app-${language}`
    await generateProject(templateName, targetDir, config)
    spinner.succeed(chalk.green('主应用创建成功!'))

    console.log()
    console.log(chalk.cyan('  cd ' + name))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev'))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('创建失败'))
    throw error
  }
}

/**
 * 创建子应用
 */
export async function createSubApp(name, options) {
  const targetDir = path.resolve(options.dir, name)

  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const overwrite = await confirm({
      message: `目录 ${name} 已存在，是否覆盖?`,
      default: false
    })

    if (!overwrite) {
      console.log(chalk.yellow('已取消'))
      return
    }

    await fs.remove(targetDir)
  }

  // 选择子应用类型
  const subAppType = options.type || await select({
    message: '选择子应用类型:',
    choices: [
      { name: 'Vue3 子应用', value: 'vue3' },
      { name: 'Vue2 子应用', value: 'vue2' },
      { name: 'iframe 子应用', value: 'iframe' }
    ],
    default: 'vue3'
  })

  // 默认端口
  const defaultPorts = {
    vue3: '7080',
    vue2: '3000',
    iframe: '9080'
  }

  // 收集配置
  const description = await input({
    message: '项目描述:',
    default: `${subAppType} 子应用`
  })

  const port = await input({
    message: '开发服务器端口:',
    default: options.port || defaultPorts[subAppType]
  })

  // Vue2 和 iframe 不提供 TS 模式
  let language = 'js'
  if (subAppType === 'vue3') {
    language = options.language || await select({
      message: '选择模板语言:',
      choices: [
        { name: 'JavaScript（含 TS 类型支持）', value: 'js' },
        { name: 'TypeScript（兼容 JS 写法）', value: 'ts' }
      ],
      default: 'js'
    })
  }

  const config = {
    name,
    description,
    port,
    language,
    appName: name,
    type: subAppType
  }

  // Vue2 和 iframe 只有 js 版本
  const templateMap = {
    vue3: `vue3-sub-app-${language}`,
    vue2: 'vue2-sub-app-js',
    iframe: 'iframe-sub-app-js'
  }

  const spinner = ora(`正在创建 ${subAppType} 子应用...`).start()

  try {
    await generateProject(templateMap[subAppType], targetDir, config)
    spinner.succeed(chalk.green(`${subAppType} 子应用创建成功!`))

    console.log()
    console.log(chalk.cyan('  cd ' + name))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev'))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('创建失败'))
    throw error
  }
}

