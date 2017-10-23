// eslint-disable-next-line import/no-extraneous-dependencies
module.exports = require('@instructure/ui-presets/postcss')({
  before: {
    plugin: 'postcss-nested',
    insert: [
      [require.resolve('postcss-input-range')]
    ]
  }
})
