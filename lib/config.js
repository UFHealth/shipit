const { cosmiconfig } = require('cosmiconfig')
const merge = require('lodash.mergewith')
const path = require('path')
const validate = require('schema-utils')

const schema = require('./config.schema')

// ---------------------------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  source: 'resources/changelog',
  destination: 'CHANGELOG.md',
  bump: {}
}

/**
 * Resolve runtime configuration.
 *
 * @returns {Promise<object>} The resolved configuration object.
 */
const resolveConfig = async () => {
  // Find configuration
  const explorer = cosmiconfig('shipit')
  const result = await explorer.search() || {}

  // Merge with default
  const resolvedConfig = merge({}, DEFAULT_CONFIG, result.config || {})

  // Convert source/destination to absolute paths
  resolvedConfig.source = path.resolve(resolvedConfig.source)
  resolvedConfig.destination = path.resolve(resolvedConfig.destination)

  validate(schema, resolvedConfig, { name: 'shipit' })

  return resolvedConfig
}

module.exports = resolveConfig
