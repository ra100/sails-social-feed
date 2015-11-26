module.exports = function (grunt) {
	grunt.registerTask('default', ['test', 'compileAssets', 'linkAssets',  'watch']);
};
