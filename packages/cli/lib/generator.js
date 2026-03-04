import path from 'path'
import fs from 'fs-extra'
import ejs from 'ejs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 生成项目
 * @param {string} templateName - 模板名称，格式为 <type>-js 或 <type>-ts
 * @param {string} targetDir - 目标目录
 * @param {Object} config - 配置（name, description, port, appName, language 等）
 */
export async function generateProject(templateName, targetDir, config) {
  const templateDir = path.resolve(__dirname, '../templates', templateName)

  // 检查模板是否存在
  if (!await fs.pathExists(templateDir)) {
    throw new Error(`模板 ${templateName} 不存在`)
  }

  // 创建目标目录
  await fs.ensureDir(targetDir)

  // 复制并处理模板文件
  await copyTemplate(templateDir, targetDir, config)
}

/**
 * 递归复制模板目录
 * - 以 .ejs 结尾的文件：渲染 EJS 后写出（去掉 .ejs 后缀）
 * - 其他文件：直接复制
 */
export async function copyTemplate(src, dest, config) {
  const files = await fs.readdir(src)

  for (const file of files) {
    const srcPath = path.join(src, file)
    let destFile = file
    let destPath = path.join(dest, destFile)

    const stat = await fs.stat(srcPath)

    if (stat.isDirectory()) {
      await fs.ensureDir(destPath)
      await copyTemplate(srcPath, destPath, config)
    } else if (file.endsWith('.ejs')) {
      // 渲染 EJS 模板，去掉 .ejs 后缀
      destPath = path.join(dest, file.replace(/\.ejs$/, ''))
      const content = await fs.readFile(srcPath, 'utf-8')
      const rendered = ejs.render(content, config)
      await fs.writeFile(destPath, rendered, 'utf-8')
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

