module.exports = function(grunt) {
  var pipeline = require('../pipeline')

  grunt.config.set('shell', {
    es6To5: {
      options: {
        stdout: true,
        stderr: true
      },

      command: [
        'babel ' +
          pipeline.es6To5SrcJSDir +
          ' --out-dir ' +
          pipeline.es6To5BuildPath,
        'babel assets/app/app.jsx --out-file assets/app/app.js'
      ].join('&&')
    }
  })

  grunt.loadNpmTasks('grunt-shell')
}
