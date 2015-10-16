var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'app', 'index.js')
  },
  output: {
    path: path.resolve(__dirname, 'public', 'build'),
    publicPath: '/build/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  }
}
