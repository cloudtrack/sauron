var path = require('path')
var webpack = require('webpack')

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
        test: /\.scss$/, loader: 'style-loader!css-loader!sass?outputStyle=expanded&' +
          'includePaths[]=' +
            (path.resolve(__dirname, 'node_modules', 'foundation-sites', 'scss'))
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'public', 'build'),
    publicPath: '/build/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },
  resolve: {
    root: path.join(__dirname, 'app'),
    modulesDirectories: ['app', 'node_modules'],
    alias: {
      underscore: 'lodash'
    },
    extentions: ['', '.js', '.html', '.hbs', '.css', 'scss']
  }
}
