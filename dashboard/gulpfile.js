var gulp = require('gulp')
var gutil = require('gulp-util')
var webpack = require('webpack')
var path = require('path')
var recursiveReaddir = require('recursive-readdir')
var browserSync = require('browser-sync').create()

var BROWSER_SYNC_RELOAD_DELAY = 500

var webpackDevServerPort = (process.env.WEBPACK_DEV_SERVER_PORT || 8888)

gulp.task('default', function() {
})

gulp.task('webpack-dev-server', function() {
  var WebpackDevServer = require('webpack-dev-server')
  var compiler = webpack(require('./webpack.config'))

  compiler.plugin('done', function() {
    setTimeout(function reload() {
      browserSync.reload({
        stream: false
      })
    }, BROWSER_SYNC_RELOAD_DELAY)
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

gulp.task('browser-sync', function () {
  browserSync.init({
    files: [],
    proxy: 'http://localhost:' + webpackDevServerPort,
    port: 4000,
  })
})

gulp.task('serve', ['webpack-dev-server', 'browser-sync'], function() {
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
