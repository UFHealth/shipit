const chalk = require('chalk')
const path = require('path')

const error = (err) => {
  console.error(err)
}

const usage = () => {
  return `(usage)\n`
}

const version = () => {
  const pkg = require(path.resolve(__dirname, '../package.json'))
  return pkg.version + '\n'
}

module.exports = { error, usage, version }
