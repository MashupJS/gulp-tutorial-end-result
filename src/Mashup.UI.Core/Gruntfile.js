
module.exports = function (grunt) {

    grunt.initConfig({
        distFolder: 'dist',

        pkg: grunt.file.readJSON('package.json'),
        "merge-json": {

            menu: {
                src: ['src/apps/**/menu.json.txt'],
                dest: '<%= distFolder %>/menu.json.txt',
            },
        },
    });

    // Load modules, register tasks
    grunt.loadNpmTasks('grunt-merge-json');

};