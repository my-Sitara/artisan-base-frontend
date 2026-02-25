const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')

/**
 * 生成项目
 * @param {string} templateName - 模板名称
 * @param {string} targetDir - 目标目录
 * @param {Object} config - 配置
 */
async function generateProject(templateName, targetDir, config) {
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
 * 复制模板目录
 */
async function copyTemplate(src, dest, config) {
  const files = await fs.readdir(src)
  
  for (const file of files) {
    const srcPath = path.join(src, file)
    let destPath = path.join(dest, file)
    
    const stat = await fs.stat(srcPath)
    
    if (stat.isDirectory()) {
      await fs.ensureDir(destPath)
      await copyTemplate(srcPath, destPath, config)
    } else {
      // 处理 .ejs 文件
      if (file.endsWith('.ejs')) {
        destPath = destPath.replace('.ejs', '')
        const content = await fs.readFile(srcPath, 'utf-8')
        const rendered = ejs.render(content, config)
        await fs.writeFile(destPath, rendered)
      } else {
        await fs.copyFile(srcPath, destPath)
      }
    }
  }
}

module.exports = {
  generateProject,
  copyTemplate
}
