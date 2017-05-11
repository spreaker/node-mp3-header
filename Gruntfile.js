var pkg = require("./package.json");

module.exports = function(grunt) {

    var config = {

        watch: {
            run_tests: {
                files: ["src/**/*.js"],
                tasks: ["shell:run_tests"],
                options: {
                    spawn: false,
                    debounceDelay: 100,
                    atBegin: true
                }
            }
        },

        shell: {
            run_tests: {
                command: "JASMINE_CONFIG_PATH=./jasmine.json NODE_ENV=test ./node_modules/.bin/jasmine"
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask(
        "test",
        "Run tests watching for changed files.",
        ["watch:run_tests"]
    );
};
