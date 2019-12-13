#!/usr/bin/env node
const chalk = require('chalk')

const { run, UsageError } = require('../lib/cli-helpers')

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
`

const main = async (argv) => {
  // Grab version
  const version = argv._[0] || false
  if (!version) {
    throw new UsageError('...y u no give version?')
  }

  return 0
}

run(main, helpText)
