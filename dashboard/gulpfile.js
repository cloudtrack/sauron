var gulp = require('gulp')
var gutil = require('gulp-util')
var webpack = require('webpack')
var path = require('path')
var recursiveReaddir = require('recursive-readdir')
var webpackDevServerPort = (process.env.WEBPACK_DEV_SERVER_PORT || 8888)

gulp.task('default', function() {
})

gulp.task('webpack-dev-server', function() {
  var WebpackDevServer = require('webpack-dev-server')
  var compiler = webpack(require('./webpack.config'))

  compiler.plugin('done', function(stat) {
    var duration = stat.endTime - stat.startTime
    gutil.log('Finished \'' + gutil.colors.cyan('webpack') + '\' after ' + gutil.colors.magenta(duration + ' ms'))
  })

  new WebpackDevServer(compiler, {
    publicPath: '/build/',
    hot: true,
    quiet: false,
    noInfo: true,
    stats: {
      colors: true
    }
  }).listen(webpackDevServerPort, "localhost", function(err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err)
  })
})

gulp.task('serve', ['webpack-dev-server'], function() {
})

gulp.task('webpack', function(done) {
  webpack(require('./webpack.config'), function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString())
    done()
  })
})

gulp.task('build', ['webpack'], function() {
})
