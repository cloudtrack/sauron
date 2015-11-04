var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var PathRewriterPlugin = require('webpack-path-rewriter')

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'app', 'index.js')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars',
        query: {
          helperDirs: [path.resolve(__dirname, 'app', 'helpers')],
          inlineRequires: '\/images\/'
        }
      },
      {
        test: /\.(gif|png|jpg)$/, loader: 'file'
      },
      {
        test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css!sass?outputStyle=expanded&' +
          'includePaths[]=' +
            (path.resolve(__dirname, 'node_modules', 'foundation-sites', 'scss')))
      },
      {
        test: /\.jade$/,
        loader: PathRewriterPlugin.rewriteAndEmit({
          name: '[name].html',
          loader: 'jade-html?' + JSON.stringify({ pretty: true })
        })
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, '_dist'),
    publicPath: '/',
    filename: '[name]-[chunkhash].js'
  },
  plugins: [
    new ExtractTextPlugin('index-[contenthash].css', { allChunks: true }),
    new PathRewriterPlugin()
  ],
  resolve: {
    root: path.join(__dirname, 'app'),
    modulesDirectories: ['app', 'node_modules'],
    alias: {
      underscore: 'lodash'
    },
    extentions: ['', '.js', '.html', '.hbs', '.css', 'scss']
  }
}
