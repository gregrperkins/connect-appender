module.exports = function(grunt) {
  grunt.initConfig({
    "mocha-hack": {
      all: {
        src: "test/*.js",
        options: {
          useColors: true,
          reporter: 'spec'
        }
      }
    },

    watch: {
      allTests: {
        files: ['lib/*', 'test/*'],
        tasks: ['test']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-hack');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', 'mocha-hack');
  grunt.registerTask('default', 'test');
};
