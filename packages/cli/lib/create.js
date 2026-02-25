const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')
const { generateProject } = require('./generator')

/**
 * 创建主应用
 */
async function createMainApp(name, options) {
  const targetDir = path.resolve(options.dir, name)
  
  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${name} 已存在，是否覆盖?`,
        default: false
      }
    ])
    
    if (!overwrite) {
      console.log(chalk.yellow('已取消'))
      return
    }
    
    await fs.remove(targetDir)
  }
  
  // 收集配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: '项目描述:',
      default: '微前端主应用'
    },
    {
      type: 'input',
      name: 'port',
      message: '开发服务器端口:',
      default: options.port || '8080'
    }
  ])
  
  const config = {
    name,
    description: answers.description,
    port: answers.port,
    type: 'main-app'
  }
  
  const spinner = ora('正在创建主应用...').start()
  
  try {
    await generateProject('main-app', targetDir, config)
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
async function createSubApp(name, options) {
  const targetDir = path.resolve(options.dir, name)
  
  // 检查目录是否存在
  if (await fs.pathExists(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${name} 已存在，是否覆盖?`,
        default: false
      }
    ])
    
    if (!overwrite) {
      console.log(chalk.yellow('已取消'))
      return
    }
    
    await fs.remove(targetDir)
  }
  
  // 选择子应用类型
  let subAppType = options.type
  
  if (!subAppType) {
    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择子应用类型:',
        choices: [
          { name: 'Vue3 子应用', value: 'vue3' },
          { name: 'Vue2 子应用', value: 'vue2' },
          { name: 'iframe 子应用', value: 'iframe' }
        ],
        default: 'vue3'
      }
    ])
    subAppType = type
  }
  
  // 默认端口
  const defaultPorts = {
    vue3: '7080',
    vue2: '3000',
    iframe: '4000'
  }
  
  // 收集配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: '项目描述:',
      default: `${subAppType} 子应用`
    },
    {
      type: 'input',
      name: 'port',
      message: '开发服务器端口:',
      default: options.port || defaultPorts[subAppType]
    }
  ])
  
  const config = {
    name,
    description: answers.description,
    port: answers.port,
    type: subAppType
  }
  
  const templateMap = {
    vue3: 'vue3-sub-app',
    vue2: 'vue2-sub-app',
    iframe: 'iframe-sub-app'
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

module.exports = {
  createMainApp,
  createSubApp
}
