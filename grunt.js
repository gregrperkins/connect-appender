module.exports = function(grunt) {
    grunt.initConfig({
        simplemocha: {
            all: {
                src: "test/*.js",
                options: {
                    // globals: ['should'],
                    reporter: 'dot',
                    timeout: '600'
                    // grep: '*_test.js'
                }
            }
        },

        watch: {
            files: ['lib/*', 'test/*'],
            tasks: 'test'
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.registerTask('test', 'simplemocha');
    grunt.registerTask('default', 'test');
};
