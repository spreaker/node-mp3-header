var pkg = require("./package.json");

module.exports = function(grunt) {

    var config = {
        shell: {
            run_tests: {
                command: "JASMINE_CONFIG_PATH=./jasmine.json NODE_ENV=test ./node_modules/.bin/jasmine"
            }
        }
    };

    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask(
        "test",
        "Run tests watching for changed files.",
        ["shell:run_tests"]
    );
};
