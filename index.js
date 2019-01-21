const homedir = require('os').homedir()
const path = require('path')
const fs = require('fs')
const pick = require('lodash.pick')
const promptly = require('promptly')

const log = require('./log')
const constants = require('./constants')

// Uses pkginfo to fetch the calling module's name from its package.json
require('pkginfo')(module.parent, 'name')
const calleeName = module.parent.exports.name
const defaultDotfile = `.${calleeName}rc.json`

/**
 * Fetches keys from a dotfile
 * @async
 * @param {String[]} keys     - the keys to pick from the dotfile (array of lodash.pickable paths)
 * @param {String}   filename - the filename of the dotfile
 * @param {String}   folder   - the folder containing the dotfile
 * @returns {Object}
 */
async function dootfile(keys = [], filename = defaultDotfile, folder = homedir) {
  const configFile = path.join(folder, filename)

  try {
    const dotfile = fs.readFileSync(configFile, { encoding: 'utf8' })
    const config = JSON.parse(dotfile)
    return keys.length > 0
      ? pick(config, keys)
      : config
  } catch (e) {
    // Exit on unknown error
    if (e.code !== 'ENOENT' && !(e instanceof SyntaxError)) {
      log.info(`There was an error reading the dotfile : ${e}`)
      process.exit(1)
    }
    // Print message if file does not exist
    if (e.code === 'ENOENT') {
      log.info(constants.NO_DOTFILE)
    }
    // Print message if file contains invalid JSON
    if (e instanceof SyntaxError) {
      log.info(constants.INVALID_JSON)
    }
    // If keys were specified, prompt the user to input the values
    if (keys.length > 0) {
      const inputConfig = await keys.reduce((chain, key) => {
        return chain.then(acc => promptly.prompt(`${key} : `).then(input => ({ ...acc, [key]: input })))
      }, Promise.resolve({}))
      fs.writeFileSync(configFile, JSON.stringify(inputConfig, null, 2))
      return inputConfig
    }
    // If no keys were specified, print a warning, create an empty file and exit process
    log.info(constants.EDIT_BY_HAND)
    fs.closeSync(fs.openSync(configFile, 'w'))
    process.exit(1)
  }
}

module.exports = dootfile
