const fs = require('fs-extra')
const glob = require('glob')
const merge = require('lodash.mergewith')
const { parse: parseYaml } = require('yaml')
const path = require('path')

// ---------------------------------------------------------------------------------------------

/**
 * Promisifies glob().
 *
 * @param {string} pattern Glob pattern.
 *
 * @returns {Promise<string[]>}
 */
const globAsync = (pattern) => new Promise((resolve, reject) => {
  glob(pattern, (err, matched) => {
    if (err) {
      reject(err)
      return
    }
    resolve(matched)
  })
})

/**
 * Parse changelog source data.
 *
 * @async
 *
 * @param {string} sourcePath Path to source files.
 *
 * @returns {Promise<object>} Parsed changelog data.
 */
const parseSources = async (sourcePath) => {
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`source path doesn't exist`)
  }

  const mergeHandler = (dest, src) => {
    if (Array.isArray(dest)) {
      return dest.concat(src)
    }
  }

  const matched = await globAsync(`${sourcePath}/**/*.y?(a)ml`)
  const parsedFiles = await Promise.all(matched.map(async (matchedPath) => {
    return parseYaml(await fs.readFile(matchedPath, 'utf8'))
  }))

  return merge({
    new: [],
    updated: [],
    fixed: [],
  }, ...parsedFiles, mergeHandler)
}

/**
 * Generate a Markdown string from the provided changelog data.
 *
 * @param {object} changeData Changelog data.
 * @param {string} version    New version string.
 *
 * @returns {string} Generated content.
 */
const generateMarkdown = (changes, version) => {
  if (!changes.new.length && !changes.updated.length && !changes.fixed.length) {
    return ''
  }

  const generateList = (items) => (items.map((item) => `- ${item}`)).join('\n')

  let content = `### ${version}\n`
  if (changes.new.length) {
    content += `\n**New**\n${generateList(changes.new)}\n`
  }
  if (changes.updated.length) {
    content += `\n**Updated**\n${generateList(changes.updated)}\n`
  }
  if (changes.fixed.length) {
    content += `\n**Fixed**\n${generateList(changes.fixed)}\n`
  }

  return content
}

/**
 * Write new content to the configured CHANGELOG.md file.
 *
 * @async
 *
 * @param {string} newContent Generated changelog content.
 * @param {object} destPath   Path to destination file.
 *
 * @returns {Promise<number>} Number of bytes written to file.
 */
const updateChangelog = async (newContent, destPath) => {
  const defaultTitle= 'CHANGELOG'
  let fullContent = ''
  let originalContent = ''

  if (await fs.pathExists(destPath)) {
    originalContent = await fs.readfile(destPath, 'utf8')

    // Make sure the version doesn't already exist in the changelog
    const alreadyExists = new RegExp(`^### *${version.replace('.', '\\.')}`, 'm')
    if (alreadyExists.test(originalContent)) {
      throw new Error(`version ${version} already exists in changelog`)
    }

    // If the file already has a title, insert the content below it
    const title = originalContent.match(/^# *.+\n/)
    if (title) {
      const titleLength = title[0].length
      fullContent = `${originalContent.slice(0, titleLength)}\n${newContent}${originalContent.slice(titleLength)}`
    }
  }

  // Generate fullContent if it still hasn't been
  if (!fullContent.length) {
    fullContent = `# ${defaultTitle}\n\n${newContent}\n${originalContent}`
  }

  await fs.writeFile(destPath, fullContent, { flag: 'w' })

  return fullContent.length - originalContent.length
}

/**
 * Remove any existing changelog source files.
 *
 * @async
 *
 * @param {string} sourcePath Path to source files.
 *
 * @returns {Promise<string[]>} List of files removed.
 */
const clearSources = async (sourcePath) => {
  if (!await fs.pathExists(sourcePath)) {
    throw new Error(`source path doesn't exist`)
  }

  const matched = await globAsync(`${sourcePath}/**/*.y?(a)ml`)
  await Promise.all(matched.map(async (matchedPath) => {
    await fs.remove(matchedPath)
  }))

  return matched
}

/**
 * Get the current version string from the nearest package.json.
 *
 * @async
 *
 * @returns {Promise<string>} Current version string.
 */
const getCurrentVersion = async () => {}

/**
 * Bump the version in the nearest package.json.
 *
 * @async
 *
 * @param {string} version New version string.
 *
 * @returns {Promise<boolean>} True if updated.
 */
const bumpPackageJson = async (version) => {}

/**
 * Bump version strings in a given file.
 *
 * @async
 *
 * @param {string}   path          Path to file.
 * @param {string[]} replacements  List of replacement patterns.
 * @param {string}   oldVersion    Old version string.
 * @param {string}   newVersion    New version string.
 *
 * @returns {Promise<number>} Number of replacements made in the file.
 */
const bumpVersion = async (path, replacement, oldVersion, newVersion) => {}

module.exports = {
  parseSources,
  generateMarkdown,
  updateChangelog,
  clearSources,
  getCurrentVersion,
  bumpPackageJson,
  bumpVersion,
}
