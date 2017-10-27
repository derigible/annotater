const webpack = require('webpack')
const { resolve } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'
const doMinify = isProduction && process.env.JS_BUILD_MINIFY !== '0'

const src = resolve(__dirname, 'src')
const build = resolve(__dirname, '__build__')

const webpackDevServerUrl = 'http://localhost:8080/'

const ENV = isProduction
  ? {
    NODE_ENV: JSON.stringify('production')
  }
  : [
    'NODE_ENV'
  ].reduce((env, name) => {
  // eslint-disable-next-line no-param-reassign, immutable/no-mutation
    env[name] = JSON.stringify(process.env[name])
    return env
  }, {})

Object.assign(exports, {
  context: src,
  entry: {
    bundle: './index.js'
  },
  output: {
    chunkFilename: '[name].[chunkhash].js',
    filename: '[name].[chunkhash].js',
    path: build
  },
  resolve: {
    alias: {
      'instructure-icons$': 'invalid',
      '@instructure/ui-core$': 'invalid',
      lodash$: 'invalid'
    }
  },
  module: {
    noParse: [
      /jquery\/dist\/jquery/,
      /lodash\/lodash/,
      /tinymce-light-skin\/lib\/skin/,
      /tinymce\/tinymce/
    ],
    // eslint-disable-next-line global-require
    rules: [
      {
        test: /\.js$/,
        include: src,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              cacheDirectory: !isProduction
            }
          }
        ]
      },
      ...require('@instructure/ui-presets/webpack/module/rules'),
      {
        test: /\.png$/,
        use: [{
          loader: 'url-loader',
          query: {
            mimetype: 'image/png'
          }
        }]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{
          loader: 'url-loader',
          query: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }]
      },
      {
        test: /\.(gif|jpe?g)$/,
        use: 'url-loader'
      },
      {
        test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    // eslint-disable-next-line global-require
    ...require('@instructure/ui-presets/webpack/plugins'),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': ENV
    }),
    new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      filename: 'index.html',
      inject: true,
      template: 'index.html',
      minify: doMinify ? {
        collapseWhitespace: true,
        minifyCSS: true,
        removeAttributeQuotes: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true
      } : {}
    })
  ],
  // eslint-disable-next-line global-require
  resolveLoader: require('@instructure/ui-presets/webpack/resolveLoader')
})

if (isProduction) {
  Object.assign(exports, {
    bail: true,
    devtool: false, // webpack build uses too much memory with source maps
    entry: Object.assign(exports.entry, {
      vendor: 'babel-polyfill react react-redux redux'.split(' ')
    }),
    plugins: [
      ...exports.plugins,
      new webpack.optimize.UglifyJsPlugin({
        comments: /sourceMappingUrl/,
        compress: {
          screw_ie8: true,
          unsafe: true,
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        sourceMap: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        async: 'bundle-async',
        children: true,
        name: 'bundle'
      }),
      new webpack.optimize.CommonsChunkPlugin({
        minChunks: Infinity,
        name: ['vendor', 'manifest']
      }),
      new HtmlWebpackPlugin({
        chunks: ['bundle', 'vendor', 'manifest'],
        chunksSortMode: 'dependency',
        filename: 'index.html',
        inject: true,
        template: 'index.html',
        minify: doMinify ? {
          collapseWhitespace: true,
          minifyCSS: true,
          removeAttributeQuotes: true,
          removeOptionalTags: true,
          removeScriptTypeAttributes: true
        } : {}
      }),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'defer',
        inline: 'manifest'
      })
    ].filter((p) => p)
  })
} else {
  // development, test, etc
  Object.assign(exports, {
    cache: true,
    devtool: isTest ? false : 'cheap-eval-source-map', // report issues with OOM w/ cheap-source-map
    devServer: {
      clientLogLevel: 'warning',
      compress: true,
      contentBase: './src/',
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      inline: true,
      noInfo: false,
      publicPath: webpackDevServerUrl,
      stats: {
        assets: true,
        cached: true,
        cachedAssets: false,
        children: false,
        chunkModules: false,
        chunkOrigins: false,
        chunks: false,
        colors: true,
        errorDetails: true,
        errors: true,
        hash: true,
        modules: false,
        publicPath: true,
        reasons: false,
        source: false,
        timings: true,
        version: false,
        warnings: false
      }
    },
    output: Object.assign(exports.output, {
      chunkFilename: '[name].js',
      filename: '[name].js',
      pathinfo: true,
      publicPath: webpackDevServerUrl
    }),
    plugins: [
      ...exports.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        chunks: ['bundle'],
        filename: 'index.html',
        inject: true,
        template: 'index.html'
      })
    ]
  })
}
