const fs = require('fs-extra')
const glob = require('glob')
const isEmpty = require('lodash.isempty')
const merge = require('lodash.mergewith')
const path = require('path')
const { promisify } = require('util')
const { parse: parseYaml } = require('yaml')

const _globPromise = (pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, matched) => {
      if (err) {
        reject(err)
        return
      }
      resolve(matched)
    })
  })
}

/**
 * Handler for merging changelog data; concatenates arrays instead of overwriting their values.
 *
 * @private
 *
 * @param {*} dest Destination value.
 * @param {*} src  Source value.
 *
 * @returns {Array|undefined} If the destination element is an array, the concatenated array;
 *                            otherwise, undefined to defer to internal merge handler.
 */
const _doMerge = (dest, src) => {
  if (Array.isArray(dest)) {
    return dest.concat(src)
  }
}

/**
 * Load and merge changelog sources.
 *
 * @async
 *
 * @param {object} config Runtime config.
 *
 * @returns {object} Merged changelog data.
 */
const loadSources = async (config) => {
  if (!await fs.pathExists(config.source)) {
    throw new Error(`source path doesn't exist`)
  }

  const matchedFiles = await _globPromise(`${config.source}/**/*.y?(a)ml`)
  const parsedFiles = await Promise.all(matchedFiles.map(async (filePath) => {
    const content = await fs.readFile(filePath, 'utf8')
    return parseYaml(content)
  }))

  return merge({}, ...parsedFiles, _doMerge)
}

/**
 * Generate Markdown from the given version and changelog data.
 *
 * @param {string} version Version string.
 * @param {object} changes Changelog data.
 *
 * @returns {string} Markdown content.
 */
const generateMarkdown = (version, changes) => {
  changes = merge({ new: [], updated: [], fixed: [] }, changes)
  if (!changes.new.length && !changes.updated.length && !changes.fixed.length) {
    return ''
  }

  const generateList = (items) => {
    return items.map(item => `- ${item}`).join('\n')
  }

  let content = `### ${version}\n`
  if ((changes.new || []).length) {
    content += `\n**New**\n${generateList(changes.new)}\n`
  }
  if ((changes.updated || []).length) {
    content += `\n**Updated**\n${generateList(changes.updated)}\n`
  }
  if ((changes.fixed || []).length) {
    content += `\n**Fixed**\n${generateList(changes.fixed)}\n`
  }

  return content
}

const updateChangelog = async (version, content, config) => {
  const defaultTitle = '# CHANGELOG'
  let fullContent = ''

  if (await fs.pathExists(config.destination)) {
    fullContent = await fs.readFile(config.destination, 'utf8')
    if ((new RegExp(`^### *${version}$`, 'm')).test(fullContent)) {
      throw new Error(`version ${version} already exists in changelog`)
    }
    const title = fullContent.match(/^# *.+\n/)
    if (title) {
      const titleLength = title[0].length
      fullContent = fullContent.slice(0, titleLength) + `\n${content}` + fullContent.slice(titleLength)
    } else {
      fullContent = `${defaultTitle}\n\n${content}`
    }
  } else {
    fullContent = `${defaultTitle}\n\n${content}`
  }

  await fs.writeFile(config.destination, fullContent, { flag: 'w' })
}

const bumpVersion = (version, config) => {}

module.exports = { loadSources, generateMarkdown, updateChangelog, bumpVersion }
