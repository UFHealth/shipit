#!/usr/bin/env node
const chalk = require('chalk')
const minimist = require('minimist')

const getConfig = require('../src/config')
const { loadSources, generateMarkdown, updateChangelog } = require('../src/ship')
const { error, usage, version } = require('../src/cli')

const argv = minimist(process.argv.slice(2), {
  alias: {
    'bump-files': ['b', 'bumpFiles']
  }
})

if (argv.help) {
  process.stderr.write(usage())
  process.exit(0)
} else if (argv.version) {
  process.stdout.write(version())
  process.exit(0)
}

const main = async (argv) => {
  try {
    if (!argv._.length) {
      process.stderr.write(usage())
      process.exit(1)
    }

    const version = argv._[0]

    // Resolve config
    const config = await getConfig(argv)

    // Get changelog source data
    const data = await loadSources(config)
    const markdown = generateMarkdown(version, data)
    await updateChangelog(version, markdown, config)
    console.log(`wrote ${chalk.green(markdown.split('\n').length)} lines to ${chalk.cyan(config.destination)}`)
  } catch (err) {
    error(err)
  }
}

main(argv)
