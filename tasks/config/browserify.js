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
        basedir: pipeline.appRootDir,
        watch: true,
        external: [
          'react',
          'react-dom',
          'react-tap-event-plugin',
          'react-intl',
          'react-bootstrap',
          'react-bootstrap-multiselect',
          'react-router',
          'react-router-bootstrap',
          'react-notify-toast',
          'socket.io-client',
          'sails.io.js',
          'lodash',
          'history',
          'arrive',
          'jquery-browserify',
          'bootstrap_material_design',
          'ripples'
        ],
        plugin: [
          ['browserify-resolutions', [
            'react',
            'react-dom',
            'react-tap-event-plugin',
            'react-intl',
            'react-bootstrap',
            'react-bootstrap-multiselect',
            'react-router',
            'react-router-bootstrap',
            'react-notify-toast',
            'socket.io-client',
            'sails.io.js',
            'lodash',
            'history',
            'arrive',
            'jquery-browserify',
            'bootstrap_material_design',
            'ripples'
          ]],
          'dedupify'
        ],
        browserifyOptions: {
          fast: true,
          debug: true
        }
      }
    },
    vendorDev: {
      src: [],
      dest: '.tmp/public/browserify/vendor.js',
      options: {
        alias: [
          'react',
          'react-dom',
          'react-tap-event-plugin',
          'react-intl',
          'react-bootstrap',
          'react-bootstrap-multiselect',
          'react-router',
          'react-router-bootstrap',
          'react-notify-toast',
          'socket.io-client',
          'sails.io.js',
          'lodash',
          'history',
          'arrive',
          'jquery-browserify',
          'bootstrap_material_design',
          'ripples'
        ],
        browserifyOptions: {
          fast: true,
          debug: true,
          pack: false
        }
      }
    },
    prod: {
      options: {
        basedir: pipeline.appRootDir,
        external: [
          'react',
          'react-dom',
          'react-tap-event-plugin',
          'react-intl',
          'react-bootstrap',
          'react-bootstrap-multiselect',
          'react-router',
          'react-router-bootstrap',
          'react-notify-toast',
          'socket.io-client',
          'sails.io.js',
          'lodash',
          'history',
          'arrive',
          'jquery-browserify',
          'bootstrap_material_design',
          'ripples'
        ],
        plugin: [
          [
            'minifyify', {
              'map': null
            }
          ]
        ],
        browserifyOptions: {
          fast: false,
          debug: false
        }
      },
      src: pipeline.browserifyMainFile,
      dest: '.tmp/public/min/production.' + version + '.js'
    },
    vendorProd: {
      src: [],
      dest: '.tmp/public/browserify/vendor.js',
      options: {
        alias: [
          'react',
          'react-dom',
          'react-tap-event-plugin',
          'react-intl',
          'react-bootstrap',
          'react-bootstrap-multiselect',
          'react-router',
          'react-router-bootstrap',
          'react-notify-toast',
          'socket.io-client',
          'sails.io.js',
          'lodash',
          'history',
          'arrive',
          'jquery-browserify',
          'bootstrap_material_design',
          'ripples'
        ],
        plugin: [
          [
            'minifyify', {
              'map': null
            }
          ],
          ['browserify-resolutions', ['*']],
          'dedupify'
        ],
        browserifyOptions: {
          fast: false,
          debug: false,
          pack: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
};
