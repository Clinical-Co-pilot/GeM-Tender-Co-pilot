const path = require('path')
const { createRequire } = require('module')

const depsDir = process.env.GYM_TENDER_BACKEND_DEPS_DIR ||
  path.join(__dirname, '..')

const requireFromDeps = createRequire(path.join(depsDir, 'package.json'))

module.exports = {
  depsDir,
  requireFromDeps
}
