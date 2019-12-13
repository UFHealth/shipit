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
  parseSources,
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
  const loggedChanges = await parseSources(config.source)
  logger.debug(`Changes:`)
    .inspect(loggedChanges, true)

  // Convert to Markdown
  const changelogContent = await generateMarkdown(loggedChanges, version)
  logger.debug(`Generated Markdown:\n\n${changelogContent}`)

  // Write to CHANGELOG.md
  if (!dryRun) {
    const changelogUpdated = await updateChangelog(changelogContent, config.destination)
  } else {
    const changelogUpdated = false
  }

  logger.success(`Updated ${chalk.magenta(config.destination)}`)

  // If successful, remove changelog source files
  if (changelogUpdated) {
    await clearSources(config.source)
  }

  logger.message(`Version bumping coming soon...`)

  return 0
  // ---

  // Find current package version
  const currentVersion = await getCurrentVersion()
  logger.debug(`Bumping version from ${currentVersion} -> ${version}...`)

  // Run version bump replacements
  await Promise.all(Object.keys(config.bump).map(async (bumpPath) => {
    const replacement = config.bump[bumpPath]
    if (!dryRun) {
      await bumpVersion(bumpPath, config.bump[bumpPath], currentVersion, version)
    }
    logger.success(`Bumped version in ${chalk.magenta(bumpPath)}`)
  }))

  return 0
}

run(main, helpText)
