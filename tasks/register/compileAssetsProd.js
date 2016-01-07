module.exports = function (grunt) {
  grunt.registerTask('compileAssetsProd', [
    'clean:dev',
    //'jst:dev',-->This task is quitte flaky. Only works if I explicitely re-install grunt-contrib-jst
    'sass',
    'babelBuild',
    'browserify:vendor',
    'browserify:prod',
    'typescript',
    'coffee:dev',
    'concat',
    'uglify',
    'cssmin',
  ]);
};
