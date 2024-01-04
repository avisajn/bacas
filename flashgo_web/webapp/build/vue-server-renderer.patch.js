const { resolve } = require('path')
const fs = require('fs')
const SSRJSPath = resolve(__dirname, '../node_modules/vue-server-renderer/server-plugin.js')
const consola = require('consola')
const logProvider = consola.withScope('vue:patch')

module.exports = VueSSRPatch()

/**
 * 对 `vue-server-renderer/server-plugin.js` 源码内容进行替换
 * asset.name.match(/\.js$/)
 * =>
 * isJS(asset.name)
 */
function VueSSRPatch() {
  if (fs.existsSync(SSRJSPath)) {
    let regexp = /asset\.name\.match\(\/\\\.js\$\/\)/
    let SSRJSContent = fs.readFileSync(SSRJSPath, 'utf8')

    if (regexp.test(SSRJSContent)) {
      logProvider.start(`发现vue-server-renderer模块，开始执行修补操作！`)

      SSRJSContent = SSRJSContent.replace(regexp, 'isJS(asset.name)')
      fs.writeFileSync(SSRJSPath, SSRJSContent, 'utf8')

      logProvider.ready(`over`)
      return true
    }

    logProvider.warn(`can run \`npm run dev\` 或 \`npm run gen\``)
    return false
  }

  logProvider.warn(`break`)
  return false
}