import fs from 'fs-extra'
import chalk from 'chalk'

/**
 * 检查目录是否为空
 */
export async function isDirEmpty(dir) {
  const files = await fs.readdir(dir)
  return files.length === 0
}

/**
 * 格式化项目名称
 */
export function formatName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 验证项目名称
 */
export function validateName(name) {
  if (!name) {
    return '项目名称不能为空'
  }
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(name)) {
    return '项目名称必须以字母开头，只能包含字母、数字和连字符'
  }
  return true
}

/**
 * 打印成功信息
 */
export function printSuccess(message) {
  console.log(chalk.green('✔ ' + message))
}

/**
 * 打印错误信息
 */
export function printError(message) {
  console.log(chalk.red('✖ ' + message))
}

/**
 * 打印信息
 */
export function printInfo(message) {
  console.log(chalk.blue('ℹ ' + message))
}

