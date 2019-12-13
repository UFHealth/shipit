const chalk = require('chalk')
const { inspect } = require('util')
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

  const logger = new Logger(argv)

  try {
    // Resolve configuration
    const config = await resolveConfig()

    // Run process
    const exitCode = await main(argv, config)
    process.exit(exitCode || 0)
  } catch (err) {
    logger.error(err)
    if (err instanceof UsageError) {
      logger.message(`\n${chalk.cyan('Usage:')}\n${helpText}\n`)
    }
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
 * Tiny logging helper.
 */
class Logger {
  /**
   * @param {object} argv Command arguments.
   */
  constructor (argv) {
    this.debug = argv.debug || false
  }

  /**
   * Logs a success message.
   *
   * Example:
   *
   *   ✔︎  Did a thing
   *
   * @param {string} message
   *
   * @returns {this}
   */
  success (message) {
    process.stdout.write(` ${chalk.green('✔︎')}  ${message}\n`)
    return this
  }

  /**
   * Prints an error. Automatically prints stack trace too, in debug mode.
   *
   * Example:
   *
   *   ✘  TypeError
   *      someUndefinedFunction is not a function
   *
   * @param {Error} err Error to print.
   *
   * @returns {this}
   */
  error (err) {
    process.stderr.write(`\n ${chalk.red('✘')}  ${chalk.red.bold(err.name)}\n    ${err.message}\n`)
    if (this.debug) {
      process.stderr.write(`\n${chalk.dim(err.stack)}\n`)
    }
    return this
  }

  message (message) {
    process.stdout.write(`${message}\n`)
    return this
  }

  /**
   * Prints a debug message, but only in debug mode.
   *
   * @param {string} message
   *
   * @returns {this}
   */
  debug (message) {
    if (this.debug) {
      process.stdout.write(`${chalk.dim(message)}\n`)
    }
    return this
  }

  /**
   * Prints the visible representation of any piece of data.
   *
   * @param {*}       anything Something to inspect.
   * @param {boolean} debug    If true, only print in debug mode.
   *
   * @returns {this}
   */
  inspect (anything, debug = false) {
    if (!debug || this.debug) {
      const stringified = inspect(anything, { colors: true })
      process.stdout.write(`\n${stringified}\n\n`)
    }
    return this
  }
}

module.exports = { run, UsageError, Logger }
