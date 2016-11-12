module.exports = function (grunt) {
  grunt.registerTask('build', ['compileAssetsProd', 'linkAssetsBuildProd', 'clean:build', 'copy:build',])
}
