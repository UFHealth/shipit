const chalk = require('chalk')
const minimist = require('minimist')
const path = require('path')

const resolveConfig = require('./config')

// ---------------------------------------------------------------------------------------------

const DEFAULT_HELP = `
  There is no hope for you here.
`

const MINIMIST_OPTIONS = {
  string: ['_']
}

/**
 * Parse command arguments and configuration, and execute the given `main` function.
 *
 * @async
 *
 * @param {mainCallback} main     The main execution body for the process. See `mainCallback()`
 *                                documentation below this function for details.
 * @param {string}       helpText Usage information to show when called with --help or when
 *                                specific errors occur.
 */
const run = async (main, helpText = '') => {
  if (!helpText.length) {
    helpText = DEFAULT_HELP
  }

  // Parse arguments
  const argv = minimist(process.argv.slice(2), MINIMIST_OPTIONS)

  // Short-circuit --help and --version calls
  if (argv.version) {
    const { version } = require(path.resolve(__dirname, '../package.json'))
    process.stderr.write(`${version}\n`)
    process.exit(0)
  }
  if (argv.help) {
    process.stderr.write(`${helpText}\n`)
    process.exit(0)
  }

  // Set debug flag
  const debug = argv.debug || false

  try {
    // Resolve configuration
    const config = await resolveConfig()

    // Run process
    const exitCode = await main(argv, config)
    process.exit(exitCode || 0)
  } catch (err) {
    // Handle errors
    printError(err, debug)
    if (err instanceof UsageError) {
      process.stderr.write(`\n${chalk.cyan('Usage:')}\n${helpText}\n`)
    }
    process.stderr.write('\n')
    process.exit(1)
  }
}
/**
 * Main execution body for processes invoked with `run()`.
 *
 * @callback mainCallback
 * @async
 *
 * @param {object} argv   Parsed command arguments.
 * @param {object} config Resolved runtime configuration.
 *
 * @returns {Promise<number|undefined>} Process exit code.
 */

/**
 * Simple error class that will trigger help text to be displayed when thrown.
 */
class UsageError extends Error {
  constructor (...params) {
    super(...params)
    this.name = 'UsageError'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UsageError)
    }
  }
}

/**
 * Print an error real nice.
 *
 * @param {Error}   err   The error to print.
 * @param {boolean} debug Whether to show stack trace.
 */
const printError = (err, debug = false) => {
  process.stderr.write(`\n ${chalk.red('✘')}  ${chalk.red.bold(err.name)}\n    ${err.message}\n`)
  if (debug) {
    process.stderr.write(`\n${chalk.dim(err.stack)}\n`)
  }
}

module.exports = { run, UsageError }
