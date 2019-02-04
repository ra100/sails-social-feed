/**
 * Clean files and folders.
 *
 * ---------------------------------------------------------------
 *
 * This grunt task is configured to clean out the contents in the .tmp/public of your
 * sails project.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = function(grunt) {
  var pipeline = require('../pipeline')

  grunt.config.set('clean', {
    options: { force: true },
    dev: ['./tmp/public/**'],
    es6Build: [pipeline.es6To5BuildPath + '/**/*.js'],
    build: ['www']
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
}
