const path = require('path')

const ROOT_PATH = process.cwd()
const BUILD_PATH = path.join(ROOT_PATH, '__build__')
const SRC_PATH = path.join(ROOT_PATH, 'src')

// eslint-disable-next-line immutable/no-mutation
module.exports = {

  generateScopedName: function ({ env }) { // for css modules class names
    return (env === 'production') ? '[hash:base64]' : '[folder]__[name]__[local]'
  },

  generateComponentName: function (filepath) { // for component names in build output and docs
    const parts = path.dirname(filepath).split(path.sep)
    return parts[parts.length - 1]
  },

  generateThemeName: function (filepath) {
    const parts = path.dirname(filepath).split(path.sep)
    return parts[parts.length - 1]
  },

  paths: {
    root: ROOT_PATH,
    src: {
      root: SRC_PATH,
      docs: path.join(ROOT_PATH, 'docs/app')
    },
    build: {
      root: BUILD_PATH,
      docs: path.join(BUILD_PATH, '/docs')
    }
  }
}
