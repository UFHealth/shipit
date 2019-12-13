#!/usr/bin/env node
const chalk = require('chalk')

const {
  Logger,
  run,
  UsageError,
} = require('../lib/cli-helpers')

const {
  bumpVersion,
  clearSources,
  generateMarkdown,
  getCurrentVersion,
  getLoggedChanges,
  updateChangelog,
} = require('../lib/api')

// ---------------------------------------------------------------------------------------------

const helpText = `
  Compile changelog entries, write them to CHANGELOG.md, and bump version strings.

  Usage:
    $ shipit <version> [options]

  Arguments:
    version  The next version of your package.

  Options:
    --help     Display this help message.
    --version  Print the current shipit version.
    --dry-run  See what would happen if you ran this command IRL.
`

const main = async (argv, config) => {
  // Grab version
  const version = argv._[0] || false
  if (!version) {
    throw new UsageError('...y u no give version?')
  }

  const logger = new Logger(argv)
  const debug = argv.debug || false
  const dryRun = argv['dry-run'] || false

  // Extract changelog data
  const loggedChanges = await getLoggedChanges(config)
  logger.debug(`Changes:\n\n`)
    .inspect(loggedChanges, true)

  // Convert to Markdown
  const changelogContent = await generateMarkdown(loggedChanges, version)
  logger.debug(`Generated Markdown:\n\n${changelogContent}`)

  // Write to CHANGELOG.md
  if (!dryRun) {
    const changelogUpdated = await updateChangelog(changelogContent, config)
  } else {
    const changelogUpdated = false
  }

  logger.success(`Updated ${chalk.magenta(config.destination)}`)

  // If successful, remove changelog source files
  if (changelogUpdated) {
    await clearSources(config)
  }

  // Find current package version
  const currentVersion = await getCurrentVersion()
  logger.debug(`Bumping version from ${currentVersion} -> ${version}...`)

  // Run version bump replacements
  await Promise.all(Object.keys(config.bump).map(async (path) => {
    const replacement = config.bump[path]
    if (!dryRun) {
      await bumpVersion(path, config.bump[path], currentVersion, version)
    }
    logger.success(`Bumped version in ${chalk.magenta(path)}`)
  }))

  return 0
}

run(main, helpText)
