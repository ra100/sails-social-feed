/**
 * Browserify files with React as an option.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [browserify](https://github.com/gruntjs/grunt-browserify)
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-browserify
 */
module.exports = function (grunt) {

  var version = grunt.file.readJSON('package.json').version;
  var pipeline = require('../pipeline');

  grunt.config.set('browserify', {
    dev: {
      src: pipeline.browserifyMainFile,
      dest: '.tmp/public/browserify/debug.' + version + '.js',
      options: {
        // transform: [require('grunt-react').browserify],
        basedir: pipeline.appRootDir,
        watch: true,
        external: ['react', 'react-intl', 'react-bootstrap', 'react-dom', 'socket.io-client', 'sails.io.js', 'lodash', 'react-tap-event-plugin', 'history', 'react-router', 'react-router-bootstrap', 'bootstrap', 'arrive', 'jquery-browserify', 'bootstrap_material_design', 'ripples', 'react-notify-toast', 'react-bootstrap-multiselect'],
        transform: ['reactify'],
        browserifyOptions: {
          fast: true,
          debug: true
        }
      }
    },
    vendor: {
      src: [],
      dest: '.tmp/public/browserify/vendor.js',
      options: {
        alias: ['react', 'react-intl', 'react-bootstrap', 'react-dom', 'socket.io-client', 'sails.io.js', 'lodash', 'react-tap-event-plugin', 'history', 'react-router', 'react-router-bootstrap', 'arrive', 'jquery-browserify', 'bootstrap_material_design', 'ripples', 'react-notify-toast', 'react-bootstrap-multiselect'],
        plugin: [
          'minifyify'
        ],
        browserifyOptions: {
          fast: false,
          debug: true,
          pack: true
        }
      }
    },
    prod: {
      options: {
        // transform: [require('grunt-react').browserify],
        basedir: pipeline.appRootDir,
        external: ['react', 'react-intl', 'react-bootstrap', 'react-dom', 'socket.io-client', 'sails.io.js', 'lodash', 'react-tap-event-plugin', 'history', 'react-router', 'react-router-bootstrap', 'bootstrap', 'arrive', 'jquery-browserify', 'bootstrap_material_design', 'ripples', 'react-notify-toast', 'react-bootstrap-multiselect'],
        browserifyOptions: {
          fast: false,
          debug: false
        }
      },
      src: pipeline.browserifyMainFile,
      dest: '.tmp/public/min/production.' + version + '.js'
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
