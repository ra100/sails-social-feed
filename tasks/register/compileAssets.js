module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    //'jst:dev',-->This task is quitte flaky. Only works if I explicitely re-install grunt-contrib-jst
    'sass:dev',
    'copy:dev',
    'babelBuild',
    'browserify:vendorDev',
    'browserify:dev',
    'coffee:dev',
  ])
}
