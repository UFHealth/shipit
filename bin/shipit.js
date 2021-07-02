#!/usr/bin/env node
const chalk = require('chalk')

const {
  Logger,
  run,
  UsageError,
} = require('../lib/cli-helpers')

const {
  bumpPackageFiles,
  bumpVersion,
  clearSources,
  generateMarkdown,
  getCurrentVersion,
  parseSources,
  updateChangelog,
  generateLogYml
} = require('../lib/api')

// ---------------------------------------------------------------------------------------------

const helpText = `
  Compile changelog entries, write them to CHANGELOG.md, and bump version strings.

  Usage:
    $ shipit <version> [options]

  Arguments:
    version  The next version of your package.

  Options:
    --dry-run          See what would happen if you ran this command IRL.
    --generate=<name>  Generate a YAML file for logging your changes.
    --help             Display this help message.
    --version          Print the current shipit version.
`

const main = async (argv, config) => {
  const generate = argv.generate || false

  if (generate) {
    await generateLogYml(generate, config)
    return
  }

  // Grab version
  const version = argv._[0] || false
  if (!version) {
    throw new UsageError('...y u no give version?')
  }

  const logger = new Logger(argv)
  const debug = argv.debug || false
  const dryRun = argv['dry-run'] || false

  // Find current package version
  const currentVersion = await getCurrentVersion()
  if (currentVersion === version) {
    throw new Error(`${version} is the current version tho`)
  }

  logger.info(`${dryRun ? 'Pretending to bump' : 'Bumping'} package from ${chalk.blue(currentVersion)} → ${chalk.green.bold(version)}...\n`)

  // Extract changelog data
  const loggedChanges = await parseSources(config.source)
  logger.debug(`Changes:`)
    .inspect(loggedChanges, true)

  // Convert to Markdown
  const changelogContent = await generateMarkdown(loggedChanges, version)
  logger.debug(`Generated Markdown:\n\n${changelogContent}`)

  // Write to CHANGELOG.md
  if (!dryRun) {
    const bytesWritten = await updateChangelog(changelogContent, version, config.destination)
    logger.debug(`Wrote ${bytesWritten} bytes to ${config.destination}`)
    const cleared = await clearSources(config.source)
    logger.debug(`Cleared ${cleared.length} source files:`)
      .inspect(cleared, true)
  }
  logger.success(`Updated ${chalk.cyan(config.destination)}`)

  if (!dryRun) {
    await bumpPackageFiles(version)
  }
  logger.success(`Bumped package.json (and package-lock.json if it exists)`)

  // Run version bump replacements
  await Promise.all(Object.keys(config.bump).map(async (bumpPath) => {
    const replacement = config.bump[bumpPath]
    const bumpCount = await bumpVersion(bumpPath, config.bump[bumpPath], currentVersion, version, dryRun)
    logger.success(`Bumped ${bumpCount} version string${bumpCount === 1 ? '' : 's'} in ${chalk.cyan(bumpPath)}`)
  }))

  return 0
}

run(main, helpText)
