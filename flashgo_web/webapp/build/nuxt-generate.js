const shell = require('shelljs')
const { resolve } = require('path')
const nuxt = resolve(__dirname, '../node_modules/.bin/nuxt')
const logProvider = require('consola').withScope('nuxt:generate')

shell.exec(`npm run patch`, (code, stdout, stderr) => {
  if (code !== 0) {
    logProvider.error(stderr)
  }

  shell.exec(`${nuxt} generate`)
})