const os = require('os')
const path = require('path')
const { createRequire } = require('module')

const depsDir = process.env.GYM_TENDER_BACKEND_DEPS_DIR ||
  path.join(os.homedir(), '.local', 'share', 'gym-tender-copilot-backend-deps')

const requireFromDeps = createRequire(path.join(depsDir, 'package.json'))

module.exports = {
  depsDir,
  requireFromDeps
}
