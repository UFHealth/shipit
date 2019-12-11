const { cosmiconfig } = require('cosmiconfig')
const merge = require('lodash.merge')
const path = require('path')
const validate = require('schema-utils')

const configSchema = require('./config.schema')

/**
 * Resolve configuration from files and command-line arguments.
 *
 * @async
 *
 * @param {object} argv Command arguments.
 *
 * @returns {object} Resolved configuration.
 */
const getConfig = async (argv) => {
  const explorer = cosmiconfig('shipit')
  let result = await explorer.search() || {}

  let config = merge({
    source: path.resolve(process.cwd(), 'resources/changelog'),
    destination: path.resolve(process.cwd(), 'CHANGELOG.md'),
    overwrite: false,
    bumpFiles: []
  }, result.config || {}, {
    source: argv.source,
    destination: argv.destination,
    overwrite: argv.overwrite,
    bumpFiles: argv.bumpFiles
  })

  config.source = path.resolve(config.source)
  config.destination = path.resolve(config.destination)

  validate(configSchema, config)

  return config
}

module.exports = getConfig
