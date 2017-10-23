module.exports = {
  // eslint-disable-next-line import/no-extraneous-dependencies
  presets: [[ require('@instructure/ui-presets/babel'), {
    themeable: true,
    coverage: Boolean(process.env.COVERAGE)
  }]]
}
