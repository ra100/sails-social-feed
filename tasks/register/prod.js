module.exports = function(grunt) {
  grunt.registerTask('prod', [
    'compileAssetsProd',
    'linkAssetsBuildProd'
    // 'clean:build',
    // 'copy:build',
  ])
}
