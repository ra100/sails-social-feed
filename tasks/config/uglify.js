/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function (grunt) {

  var version = grunt.file.readJSON('package.json').version
  var pipeline = require('../pipeline')

  grunt.config.set('uglify', {
    dist: {
      src: ['.tmp/public/min/production.' + version + '.js'],
      dest: '.tmp/public/min/production.' + version + '.min.js'
    },
    vendor: {
      src: ['.tmp/public/browserify/vendor.js'],
      dest: '.tmp/public/min/vendor.min.js',
      options: {
        // screwIE8: true,
        // compress: {
        //   sequences: true,
        //   drop_console: true,
        //   loops: true,
        //   unused: true,
        //   pure_getters: true,
        //   cascade: true,
        //   booleans: true,
        //   drop_debugger: true,
        //   dead_code: true,
        //   properties: true
        // }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-uglify')
}
